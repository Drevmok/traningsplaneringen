// Slice 31 — Builder self-smoke: shared bank (read-only), 390×844.
// Needs: preview of the plain build on :4173 (no bank vars), preview of a build with
//   VITE_SUPABASE_URL=https://bank-mock.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_smoke_local_only
// on :4174, and a local PostgREST (:54332) over a throwaway Postgres (:54331) loaded with
// slice-31/content/schema-31.sql + tools/bank/out/bank-seed.sql. Requests to
// https://bank-mock.supabase.co/rest/v1/* are routed to that PostgREST (anon role, real RLS).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const OFF = 'http://127.0.0.1:4173/traningsplaneringen/'
const ON = 'http://127.0.0.1:4174/traningsplaneringen/'
const BANK_HOST = 'https://bank-mock.supabase.co'
const PGRST = 'http://127.0.0.1:54332'
const ROOT = '/workspace/gymnastics-planner'
const CACHE_KEY = 'gymnastics-planner-bank-cache-v1'
const STALE = 'Visar sparade övningar. Du kan planera som vanligt.'
const seedJson = JSON.parse(readFileSync(`${ROOT}/tools/bank/out/bank-seed.json`, 'utf8'))
const BUNDLED_TITLES = seedJson.exercises.map((e) => e.title)

const results = []
const notes = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`)
}
const note = (s) => {
  notes.push(s)
  console.log('  · ' + s)
}
async function attempt(id, name, fn) {
  try {
    await fn()
  } catch (e) {
    check(id, name, false, 'error: ' + String(e.message).split('\n').slice(0, 3).join(' ⏎ '))
  }
}
const sql = (q) =>
  execFileSync('psql', ['-h', '/tmp', '-p', '54331', '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8' }).trim()

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const pageErrors = []
const bankLog = [] // every request the browser sent to the bank host (all contexts)

async function newCtx(init) {
  const ctx = await browser.newContext(phone)
  if (init) await ctx.addInitScript(init)
  return ctx
}
/** mode: { proxy:true, delayMs? } | { abort:true } | { status } */
async function routeBank(ctx, getMode) {
  await ctx.route(`${BANK_HOST}/**`, async (route) => {
    const req = route.request()
    const mode = getMode()
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'apikey, accept, content-type',
      'access-control-allow-methods': 'GET, OPTIONS',
    }
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (mode.abort) return route.abort('internetdisconnected')
    if (mode.status) return route.fulfill({ status: mode.status, headers: cors, contentType: 'application/json', body: '{"message":"boom"}' })
    if (mode.delayMs) await new Promise((r) => setTimeout(r, mode.delayMs))
    const u = new URL(req.url())
    const resp = await route.fetch({ url: PGRST + u.pathname.replace('/rest/v1', '') + u.search, headers: { accept: 'application/json' } })
    return route.fulfill({ status: resp.status(), headers: { ...cors, 'content-type': 'application/json' }, body: await resp.body() })
  })
}
async function newPage(ctx, url) {
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('request', (r) => {
    if (r.url().includes('supabase.co') || r.url().includes('/rest/v1/'))
      bankLog.push({ page: url, method: r.method(), url: r.url(), headers: r.headers(), body: r.postData() })
  })
  await page.goto(url)
  return page
}
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/slice31_${n}.png` })
const store = (page, k) => page.evaluate((key) => localStorage.getItem(key), k)

async function builderAction(page, name) {
  const direct = page.locator('.builder-actions > button, .builder-extra > button').filter({ hasText: name })
  for (const b of await direct.all()) if (await b.isVisible()) return b.click()
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name }).click()
}
async function runPassText(page, wanted) {
  // Kör passet shows one step at a time; walk forward until the wanted titles were seen.
  const seen = []
  for (let i = 0; i < 8; i++) {
    seen.push(await page.locator('.run-pass').innerText())
    if (wanted.every((w) => seen.some((t) => t.includes(w)))) break
    const next = page.getByRole('button', { name: 'Nästa övning' })
    if (!(await next.count())) break
    await next.first().click()
  }
  // Kör passet may resume mid-pass; walk back too.
  for (let i = 0; i < 8 && !wanted.every((w) => seen.some((t) => t.includes(w))); i++) {
    const prev = page.getByRole('button', { name: 'Föregående' })
    if (!(await prev.count()) || !(await prev.first().isEnabled())) break
    await prev.first().click()
    seen.push(await page.locator('.run-pass').innerText())
  }
  return seen.join('\n')
}
async function startBlank(page) {
  await page.getByRole('button', { name: 'Tomt pass' }).click()
}
async function continuePass(page) {
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
}
async function openLibrary(page) {
  if (await page.locator('.side-panel-slot.is-open').count()) {
    await page.getByRole('tab', { name: 'Bibliotek' }).click()
    return
  }
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await page.locator('.side-panel-slot.is-open').waitFor()
}
async function closeLibrary(page) {
  const btn = page.locator('.sheet-close')
  if (await btn.isVisible()) await btn.click()
}
const titleTexts = (page) => page.locator('.library-entry .activity-title').evaluateAll((els) =>
  els.map((el) => Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()))
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
async function libraryTitles(page) {
  await page.locator('.filter-row select').selectOption('all')
  await page.locator('.search-input').fill('')
  return titleTexts(page)
}
const card = (page, t) => page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: new RegExp(`^${esc(t)}(Erfaren ledare)?$`) }) })
async function addToTeknik(page, title) {
  await openLibrary(page)
  await page.locator('.filter-row select').selectOption('techniques')
  await card(page, title).first().locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  const text = await d.innerText()
  await d.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await closeLibrary(page)
  return text
}
// Visible stale lines only (Biblioteket stays mounted, closed, behind other views).
const staleCount = (page) => page.getByText(STALE, { exact: true }).evaluateAll((els) => els.filter((e) => e.checkVisibility()).length)
const staleInDom = (page) => page.getByText(STALE, { exact: true }).evaluateAll((els) => els.map((e) => !!e.closest('.side-body')))
const bankGets = (since) => bankLog.slice(since).filter((r) => r.method === 'GET')

// ───────────────────────── A. Bank off (plain build) ─────────────────────────
await attempt('A', 'Bank off', async () => {
  // A stale-looking cache from some earlier build must be ignored when the bank is off.
  const fakeCache = JSON.stringify({ v: 1, fetchedAt: 'x', exercises: [{ ...seedJson.exercises[0], title: 'SKA INTE SYNAS' }], hiddenIds: [], redskapLabels: {} })
  const ctx = await newCtx(`localStorage.setItem('${CACHE_KEY}', ${JSON.stringify(fakeCache)})`)
  const before = bankLog.length
  const page = await newPage(ctx, OFF)
  await page.waitForTimeout(1200)
  check('A2', 'Home: no stale line', (await staleCount(page)) === 0)
  await shot(page, 'off_home')
  await startBlank(page)
  const footer = (await page.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('A1', 'Footer reads Träningsplaneraren · Slice 31 (AC 22)', footer.includes('Träningsplaneraren · Slice 31'), footer)
  await shot(page, 'off_builder_footer')
  await openLibrary(page)
  const titles = await libraryTitles(page)
  check('A3', 'Biblioteket: bundled 51 in bundled order (AC 12)', titles.length === 51 && JSON.stringify(titles) === JSON.stringify(BUNDLED_TITLES), `${titles.length} titles`)
  check('A4', 'Old cache ignored when bank is off', !titles.includes('SKA INTE SYNAS'))
  check('A5', 'No stale line in Biblioteket (AC 12)', (await staleCount(page)) === 0)
  await page.waitForTimeout(500)
  check('A6', 'No request to Supabase / rest/v1 (AC 12)', bankLog.length === before, `${bankLog.length - before} requests`)
  await shot(page, 'off_library')
  await ctx.close()
})

await attempt('R', 'Regression on the plain build', async () => {
  const ctx = await newCtx()
  const page = await newPage(ctx, OFF)
  await page.getByRole('button', { name: 'Planera pass' }).click()
  const w = page.locator('[aria-labelledby="home-wizard-title"]')
  await w.getByRole('option', { name: /7–9/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /^Trampett/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /Standard trupp/ }).first().click()
  await w.getByRole('button', { name: 'Skapa pass' }).click()
  const draft = JSON.parse(await store(page, 'gymnastics-planner-draft-v1'))
  const filled = draft.blocks.filter((b) => b.items.length > 0).length
  const zones = (draft.hallPlacements ?? []).map((p) => p.zoneId)
  check('R1', 'Planera pass wizard → five blocks, Teknik pre-placed (AC 21)', filled === 5 && zones.includes('trampett'), `filled=${filled} zones=${zones}`)
  await shot(page, 'regress_wizard')
  await page.goto(OFF)
  await page.getByRole('button', { name: 'Från mall' }).click()
  await page.getByRole('button', { name: /Nybörjare/ }).first().click()
  const d2 = JSON.parse(await store(page, 'gymnastics-planner-draft-v1'))
  const n = d2.blocks.reduce((s, b) => s + b.items.length, 0)
  check('R2', 'Från mall → Nybörjare fills the pass (AC 21)', n >= 5, `items=${n}`)
  await shot(page, 'regress_mall')
  await ctx.close()
})

// ───────────────────── B. Bank on, fetch fails (fresh profile) ─────────────────────
await attempt('B', 'Bank on, failed fetch, first visit', async () => {
  const ctx = await newCtx()
  await routeBank(ctx, () => ({ abort: true }))
  const page = await newPage(ctx, ON)
  await page.waitForTimeout(800)
  check('B1', 'Home: no stale line (AC 9/10)', (await staleCount(page)) === 0)
  await startBlank(page)
  await openLibrary(page)
  const titles = await libraryTitles(page)
  check('B2', 'Bundled 51 shown at once, same order (AC 10)', titles.length === 51 && JSON.stringify(titles) === JSON.stringify(BUNDLED_TITLES))
  const line = page.locator('.side-body .bank-stale')
  check('B3', 'Stale line in Biblioteket with the exact text, plain text (no role/aria-live)',
    (await line.count()) === 1 && (await line.textContent()) === STALE && (await line.getAttribute('role')) === null && (await line.getAttribute('aria-live')) === null)
  check('B4', 'No error dialog', (await page.locator('[role=alertdialog]').count()) === 0)
  check('B5', 'Nothing cached after a failed fetch', (await store(page, CACHE_KEY)) === null)
  await shot(page, 'stale_bundled_library')
  await ctx.close()
})

await attempt('B6', 'Bank on, HTTP 500', async () => {
  const ctx = await newCtx()
  await routeBank(ctx, () => ({ status: 500 }))
  const page = await newPage(ctx, ON)
  await startBlank(page)
  await openLibrary(page)
  await page.waitForTimeout(500)
  check('B6', 'HTTP 500 → bundled 51 + stale line (AC 11)', (await libraryTitles(page)).length === 51 && (await staleCount(page)) === 1)
  await ctx.close()
})

// ───────────────────── C. Happy path against PostgREST ─────────────────────
const ctxC = await newCtx()
let modeC = { proxy: true }
await routeBank(ctxC, () => modeC)
let pageC
await attempt('C1', 'Fresh profile, bank reachable', async () => {
  const before = bankLog.length
  pageC = await newPage(ctxC, ON)
  await pageC.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  const gets = bankGets(before)
  const paths = gets.map((g) => new URL(g.url).pathname).sort()
  check('C1a', 'Startup: exactly one GET exercises + one GET redskap (AC 6)',
    gets.length === 2 && paths.join(',') === '/rest/v1/exercises,/rest/v1/redskap', paths.join(','))
  check('C1b', 'Header apikey = publishable key, no Authorization (AC 6)',
    gets.every((g) => g.headers.apikey === 'sb_publishable_smoke_local_only' && !('authorization' in g.headers)))
  check('C1c', 'Query asks for published+hidden in sort order', gets.some((g) => g.url.includes('status=in.(published,hidden)&order=sort_order.asc')))
  const cache = JSON.parse(await store(pageC, CACHE_KEY))
  check('C1d', 'Cache written (v 1, 51 exercises, 15 redskap labels)', cache.v === 1 && cache.exercises.length === 51 && Object.keys(cache.redskapLabels).length === 15)
  await startBlank(pageC)
  await openLibrary(pageC)
  const titles = await libraryTitles(pageC)
  check('C1e', 'Biblioteket: 51 from the bank, same order and wording as before (AC 6/7)', JSON.stringify(titles) === JSON.stringify(BUNDLED_TITLES), `${titles.length}`)
  check('C1f', 'No stale line after a fresh fetch', (await staleCount(pageC)) === 0)
  await shot(pageC, 'fresh_library')
  await closeLibrary(pageC)
  await addToTeknik(pageC, 'Kullerbytta framåt')
  await addToTeknik(pageC, 'Hjul')
  const r1 = (await pageC.locator('.session-item').allInnerTexts()).join(' | ')
  check('C1g', 'Two Teknik drills in the pass', r1.includes('Kullerbytta framåt') && /Hjul(?! \()/.test(r1), r1.replace(/\s+/g, ' ').slice(0, 160))
  await builderAction(pageC, 'Spara utkast')
  await pageC.waitForTimeout(300)
})

await attempt('C2', 'Edit, hide and insert in the DB → reload', async () => {
  sql(`update public.exercises set title = 'Kullerbytta TEST' where id = 'tech-kullerbytta';`)
  sql(`update public.exercises set status = 'hidden', title = 'Hjul (dold)' where id = 'tech-hjul';`)
  sql(`insert into public.exercises (id, block_type, title, duration_minutes_default, summary, how_to, watch_for, safety_line, visual_key, tags, default_station_equipment, new_coach_ok, status, sort_order, updated_by)
       values ('tech-banktest-trampett', 'techniques', 'Banktest trampett', 6, 'Testövning som bara finns i banken.', E'1. Studsa mitt i trampetten.\\n2. Landa på mattan.', 'Landningen.', 'Matta bakom trampetten. En i taget.', 'tech-ljushopp-trampett',
       array['teknik','trampett','new-coach-ok'], '[{"pieceId":"eq-trampett","count":1},{"pieceId":"eq-landningsmatta","count":1}]'::jsonb, true, 'published', 135, 'smoke');`)
  note(`DB: published=${sql(`select count(*) from public.exercises where status='published'`)} hidden=${sql(`select count(*) from public.exercises where status='hidden'`)}`)
  const before = bankLog.length
  await pageC.reload()
  await pageC.waitForTimeout(1500)
  check('C2a', 'Reload makes one new pair of GETs', bankGets(before).length === 2)
  await continuePass(pageC)
  const rows = (await pageC.locator('.session-item').allInnerTexts()).join(' | ')
  check('C2b', 'Pass row shows the edited title Kullerbytta TEST (AC 8)', rows.includes('Kullerbytta TEST'), rows.replace(/\s+/g, ' ').slice(0, 160))
  check('C2c', 'Hidden drill still renders in the old pass, with bank text (AC 13)', rows.includes('Hjul (dold)'))
  await openLibrary(pageC)
  const titles = await libraryTitles(pageC)
  check('C2d', 'Biblioteket: edited title, new row, hidden gone (51 = 50 + 1 new) (AC 8/13/15)',
    titles.includes('Kullerbytta TEST') && titles.includes('Banktest trampett') && !titles.includes('Hjul (dold)') && !titles.includes('Hjul') && titles.length === 51, `${titles.length}`)
  await pageC.locator('.search-input').fill('hjul')
  const found = await titleTexts(pageC)
  check('C2e', 'Search "hjul" → only Minihjul (hidden not searchable) (AC 13)', JSON.stringify(found) === JSON.stringify(['Minihjul (krabbhjul)']), found.join(','))
  await pageC.locator('.search-input').fill('')
  await pageC.locator('.filter-row select').selectOption('techniques')
  const tek = await titleTexts(pageC)
  check('C2f', 'Teknik filter: no hidden drill (AC 13)', !tek.includes('Hjul (dold)') && !tek.includes('Hjul'))
  await shot(pageC, 'fresh_edited_library')
  // the row info panel
  await closeLibrary(pageC)
  const krow = pageC.locator('.session-item').filter({ hasText: 'Kullerbytta TEST' })
  await krow.getByRole('button', { name: 'Se beskrivning' }).click()
  check('C2g', 'Info panel of the edited drill opens (title row)', (await krow.locator('.activity-tip-panel').count()) === 1)
  await shot(pageC, 'pass_rows_hidden_edited')
})

await attempt('C3', 'New bank row: add, zone, Förrådslista, safety', async () => {
  const detail = await addToTeknik(pageC, 'Banktest trampett')
  check('C3a', 'New bank row is addable; detail shows its Säkerhet line (AC 15)', detail.includes('Matta bakom trampetten. En i taget.'))
  await builderAction(pageC, 'Spara utkast')
  await pageC.waitForTimeout(300)
  await builderAction(pageC, 'Hallöversikt')
  await pageC.getByText('Schematisk hall — inte exakt mått').first().waitFor()
  const draft = JSON.parse(await store(pageC, 'gymnastics-planner-draft-v1'))
  const items = draft.blocks.flatMap((b) => b.items)
  const it = items.find((i) => i.activityId === 'tech-banktest-trampett')
  const zone = draft.hallPlacements?.find((p) => p.sessionItemId === it?.id)?.zoneId
  check('C3b', 'New row auto-zones to Trampett (AC 15)', zone === 'trampett', `zone=${zone}`)
  const chips = (await pageC.locator('.hall-chip-anchor [aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))).join(' | ')
  check('C3c', 'Hall chips show bank titles incl. the hidden drill (AC 8/13)', chips.includes('Kullerbytta TEST') && chips.includes('Hjul (dold)') && chips.includes('Banktest trampett'), chips.replace(/\s+/g, ' '))
  await shot(pageC, 'hall_bank_titles')
  await pageC.locator('button.hall-tap-target').filter({ hasText: /^Använd alla förslag$/ }).first().click()
  await pageC.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click()
  await pageC.getByText('Vad finns i hallen ikväll?').first().waitFor()
  const rows = await pageC.locator('.forradslista-row').allTextContents()
  check('C3d', 'Förrådslista counts the new row\'s redskap (AC 15)', rows.includes('Trampett') && rows.some((r) => /Landningsmatta/.test(r)), rows.join(' · '))
  await shot(pageC, 'forradslista_bank')
  await pageC.keyboard.press('Escape')
})

await attempt('C4', 'Golvklart, stationskort, Kör passet with bank text', async () => {
  await pageC.goto(ON)
  await continuePass(pageC)
  await builderAction(pageC, 'Hallöversikt')
  await pageC.getByRole('button', { name: /^(Golvklart|Visa för golvet)$/ }).first().click()
  await pageC.getByRole('button', { name: 'Avsluta golvklart' }).first().waitFor()
  const floor = await pageC.locator('body').innerText()
  check('C4a', 'Golvklart shows Kullerbytta TEST + Hjul (dold) (AC 8/13)', floor.includes('Kullerbytta TEST') && floor.includes('Hjul (dold)'))
  await shot(pageC, 'golvklart_bank')
  await pageC.goto(ON)
  await continuePass(pageC)
  await builderAction(pageC, 'Exportera / dela')
  await pageC.locator('.export-sheet').waitFor()
  await pageC.getByRole('button', { name: 'Helskär' }).click()
  await pageC.waitForTimeout(400)
  const deck = await pageC.locator('body').innerText()
  check('C4b', 'Stationskort show the bank titles (AC 8/13)', deck.includes('Kullerbytta TEST') && deck.includes('Hjul (dold)'))
  await shot(pageC, 'stationskort_bank')
  await pageC.goto(ON)
  await continuePass(pageC)
  await pageC.getByRole('button', { name: 'Kör passet, en övning i taget' }).click()
  const run = await runPassText(pageC, ['Kullerbytta TEST', 'Hjul (dold)'])
  check('C4c', 'Kör passet steps use the bank titles, incl. the hidden drill (AC 8/13)', run.includes('Kullerbytta TEST') && run.includes('Hjul (dold)'))
  await shot(pageC, 'korpasset_bank')
})

await attempt('C5', 'Block the bank → cached copy + stale line only in Biblioteket', async () => {
  modeC = { abort: true }
  await pageC.goto(ON)
  await pageC.waitForTimeout(800)
  check('C5a', 'Home: no stale line (AC 9)', (await staleCount(pageC)) === 0)
  await continuePass(pageC)
  await openLibrary(pageC)
  const titles = await libraryTitles(pageC)
  check('C5b', 'Cached bank shown (edited title, new row, hidden still hidden) (AC 9)',
    titles.includes('Kullerbytta TEST') && titles.includes('Banktest trampett') && !titles.includes('Hjul (dold)'))
  check('C5c', 'Stale line in Biblioteket (AC 9)', (await staleCount(pageC)) === 1)
  await shot(pageC, 'stale_cached_library')
  await closeLibrary(pageC)
  await builderAction(pageC, 'Hallöversikt')
  await pageC.getByRole('button', { name: /^(Golvklart|Visa för golvet)$/ }).first().click()
  await pageC.getByRole('button', { name: 'Avsluta golvklart' }).first().waitFor()
  check('C5d', 'Golvklart: no stale line (AC 9)', (await staleCount(pageC)) === 0)
  await pageC.goto(ON)
  await continuePass(pageC)
  await pageC.getByRole('button', { name: 'Kör passet, en övning i taget' }).click()
  const stale0 = await staleCount(pageC)
  note(`Kör passet: stale line nodes in DOM (inside Biblioteket side-body?) = ${JSON.stringify(await staleInDom(pageC))}`)
  const run = await runPassText(pageC, ['Kullerbytta TEST'])
  check('C5e', 'Kör passet: no stale line, cached title (AC 9)', stale0 === 0 && (await staleCount(pageC)) === 0 && run.includes('Kullerbytta TEST'), `stale=${stale0} run=${run.includes('Kullerbytta TEST')}`)
})

await attempt('C6', 'Fresh data arriving later updates in place', async () => {
  const waitTitle = (t) => pageC.waitForFunction(
    ([k, title]) => (JSON.parse(localStorage.getItem(k) ?? '{}').exercises ?? []).some((e) => e.title === title),
    [CACHE_KEY, t],
    { timeout: 9000 },
  )
  // Part 1: scrolled list, slow answer.
  modeC = { proxy: true, delayMs: 3500 }
  sql(`update public.exercises set title = 'Kullerbytta LIVE' where id = 'tech-kullerbytta';`)
  await pageC.goto(ON)
  await continuePass(pageC)
  await openLibrary(pageC)
  await pageC.locator('.filter-row select').selectOption('all')
  check('C6a', 'Before the answer: cached title', (await card(pageC, 'Kullerbytta TEST').count()) === 1)
  const body = pageC.locator('.side-body')
  await body.evaluate((el) => (el.scrollTop = 600))
  const scrollBefore = await body.evaluate((el) => el.scrollTop)
  await waitTitle('Kullerbytta LIVE')
  await pageC.waitForTimeout(300)
  const list = await titleTexts(pageC)
  check('C6c', 'List updated in place to Kullerbytta LIVE (AC 16)', list.includes('Kullerbytta LIVE') && !list.includes('Kullerbytta TEST'))
  const scrollAfter = await body.evaluate((el) => el.scrollTop)
  check('C6d', 'Library scroll position kept across the update (AC 16)', scrollBefore > 0 && Math.abs(scrollAfter - scrollBefore) < 2, `${scrollBefore} → ${scrollAfter}`)
  await shot(pageC, 'inplace_scroll_kept')
  // Part 2: open Ny egen övning form, slow answer.
  sql(`update public.exercises set title = 'Kullerbytta LIVE 2' where id = 'tech-kullerbytta';`)
  await pageC.goto(ON)
  await continuePass(pageC)
  await openLibrary(pageC)
  await pageC.getByRole('button', { name: 'Ny egen övning' }).click()
  const nameInput = pageC.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input')
  await nameInput.fill('Min halvfärdiga övning')
  await waitTitle('Kullerbytta LIVE 2')
  await pageC.waitForTimeout(300)
  check('C6b', 'Open Ny egen övning form keeps its input across the update (AC 16)', (await nameInput.inputValue()) === 'Min halvfärdiga övning' && (await nameInput.isVisible()))
  await shot(pageC, 'inplace_form_kept')
})
await ctxC.close()

await attempt('D', 'Corrupt cache', async () => {
  const ctx = await newCtx(`if (!sessionStorage.getItem('seeded')) { localStorage.setItem('${CACHE_KEY}', '{'); sessionStorage.setItem('seeded', '1') }`)
  await routeBank(ctx, () => ({ proxy: true }))
  const page = await newPage(ctx, ON)
  await page.waitForFunction((k) => (localStorage.getItem(k) ?? '{').startsWith('{"v":1'), CACHE_KEY, { timeout: 9000 })
  const cache = JSON.parse(await store(page, CACHE_KEY))
  check('D1', 'Corrupt cache ignored, then refreshed and rewritten (AC 17)', cache.v === 1 && cache.exercises.length === 52 && cache.hiddenIds.includes('tech-hjul'), `${cache.exercises?.length} exercises (51 published + 1 hidden)`)
  await ctx.close()
})

// ───────────────────── Network hygiene (AC 18) ─────────────────────
check('N1', 'Every bank request was a GET without a body (AC 18)', bankLog.every((r) => r.method === 'GET' && !r.body), `${bankLog.length} requests`)
check('N2', 'Bank requests carry only select/status/order params (nothing from coach storage)',
  bankLog.every((r) => [...new URL(r.url).searchParams.keys()].every((k) => ['select', 'status', 'order'].includes(k))))
check('E', 'No page errors', pageErrors.length === 0, pageErrors.join(' | '))

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-31-smoke-results.json`, JSON.stringify({ results, notes, bankRequests: bankLog.length }, null, 2))
await browser.close()

// Slice 36 — Builder self-smoke: «Föreningens mallar», 390×844.
// Local stand-in only (never the real project):
//   bash verifier/slice-36-local/up.sh   (/tmp/s36, gateway :54740, 36-01/02/03 applied to the LOCAL PG)
//   bank build (VITE_SUPABASE_URL=https://bank-mock.supabase.co, VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32)
//   preview on :4200; plain build preview on :4201.
// Browser requests to https://bank-mock.supabase.co/** go unchanged to the local gateway (real PostgREST + RLS,
// real GoTrue e-mail code). Login codes are read from the mail sink and never printed or screenshotted.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { openMallList, startFragor } from './tools/smoke-start.mjs' // Slice 54 A1
import { codeLogin, sliceNumber } from './tools/smoke-login.mjs' // Slice 54 B1 + D1
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const ON = process.env.S36_ON_URL ?? 'http://127.0.0.1:4200/traningsplaneringen/'
const OFF = process.env.S36_OFF_URL ?? 'http://127.0.0.1:4201/traningsplaneringen/'
const BANK_HOST = 'https://bank-mock.supabase.co'
const ROOT = process.env.SMOKE_ROOT ?? '/workspace/gymnastics-planner' // Slice 54: run-smokes sets SMOKE_ROOT
const SLICE = sliceNumber(ROOT) // Slice 54 B1
const S32 = process.env.S32_DIR ?? '/tmp/s36'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const CLUB_KEY = 'gymnastics-planner-club-templates-v1'
const DRAFT_KEY = 'gymnastics-planner-draft-v1'

const MD = readFileSync(`${ROOT}/slice-36/content/microcopy.sv.md`, 'utf8')
const md = (key) => {
  const m = MD.match(new RegExp('^\\| `' + key + '`(?: \\*\\*[\\wäå]+\\*\\*)? \\| ([^|]+?) \\|', 'm'))
  if (!m) throw new Error('no microcopy key ' + key)
  return m[1].trim()
}
const KEYS = ['clubTemplatesTitle', 'clubTemplatesHint', 'clubTemplateBadge', 'clubTemplateCardAria', 'clubTemplatesEmpty', 'clubTemplatesStale', 'clubTemplatePlacementsNote', 'clubTemplateApplied', 'clubPublish', 'clubPublishTitle', 'clubPublishNameLabel', 'clubPublishBody', 'clubPublishConfirm', 'clubOverwriteTitle', 'clubOverwriteBody', 'clubOverwriteConfirm', 'clubPublished', 'clubOverwritten', 'clubHideAria', 'clubHideConfirm', 'clubHiddenTitle', 'clubUnhideAria', 'clubOffline', 'clubWriteFailed', 'footerSliceLabel']
const S = Object.fromEntries(KEYS.map((k) => [k, md(k)]))
S.footerSliceLabel = `Träningsplaneraren · Slice ${SLICE}` // Slice 54 B1: footer follows SLICE_NUMBER
const SAVED_HINT = 'Egna mallar stannar i den här webbläsaren. Delningskoden tar med en kopia till telefonen.'
const R = { hide: 'Dölj för alla', hideYes: 'Dölj', hidden: 'Dold för alla.', unhide: 'Visa igen', unhidden: 'Syns igen för alla.', hiddenBadge: 'Dold', cancel: 'Avbryt', tConfirm: 'Använd mall', tTitle: 'Ersätta det här passet?' }

const results = []
const notes = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 400) })
  console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`)
}
const note = (s) => {
  notes.push(s)
  console.log('  · ' + s)
}
async function attempt(id, fn) {
  try {
    await fn()
  } catch (e) {
    check(id, 'phase crashed', false, 'error: ' + String(e.message).split('\n').slice(0, 3).join(' ⏎ '))
  }
}
const sql = (q) =>
  execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], {
    encoding: 'utf8',
    env: { ...process.env, PGOPTIONS: '-cclient_min_messages=warning' },
  }).trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const pageErrors = []
const bankLog = []
const assetLog = []

async function newCtx(label) {
  const ctx = await browser.newContext({ ...phone })
  ctx.label = label
  await ctx.route(`${BANK_HOST}/**`, async (route) => {
    const req = route.request()
    const u = new URL(req.url())
    if (ctx.clubDown && u.pathname.endsWith('/club_templates')) return route.abort('internetdisconnected')
    if (ctx.clubSlowMs && u.pathname.endsWith('/club_templates')) await sleep(ctx.clubSlowMs)
    const headers = { ...req.headers() }
    delete headers.host
    try {
      const resp = await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined, maxRedirects: 0 })
      return await route.fulfill({ response: resp })
    } catch {
      return route.abort('failed').catch(() => {})
    }
  })
  ctx.on('request', (r) => {
    const url = r.url()
    if (url.startsWith(BANK_HOST)) bankLog.push({ ctx: label, method: r.method(), url, headers: r.headers() })
    if (/\/assets\/[^/]+\.js$/.test(url)) assetLog.push({ ctx: label, url })
  })
  return ctx
}
async function newPage(ctx, url) {
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => pageErrors.push(`${ctx.label}: ${e.message}`))
  if (url) await page.goto(url)
  return page
}
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/slice36_${n}.png` })
const store = (page, k) => page.evaluate((key) => localStorage.getItem(key), k)
const draft = async (page) => JSON.parse((await store(page, DRAFT_KEY)) ?? 'null')
const ADMIN_CHUNK = /^(dist|session|adminBank|bankWrite|AdminLoginSheet|AdminDetailPanel|AdminBankForm|ClubAdminSection|ClubPublishDialog|clubWrite)-/
const chunksOf = (label) => assetLog.filter((a) => a.ctx === label).map((a) => a.url.split('/').pop())
const clubGets = (label) => bankLog.filter((r) => r.ctx === label && r.url.includes('/rest/v1/club_templates'))
const writes = (label) => bankLog.filter((r) => r.ctx === label && r.method !== 'GET' && r.method !== 'OPTIONS' && r.url.includes('/rest/v1/'))
const scrollW = (page) => page.evaluate(() => document.documentElement.scrollWidth)
const toast = (page) => page.locator('.toast[role=status]')
async function toastText(page) {
  await toast(page).waitFor()
  return (await toast(page).innerText()).trim()
}
async function waitToastGone(page) {
  await toast(page).waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
}
const rows = () => JSON.parse(sql(`select coalesce(json_agg(t order by title), '[]') from (select id, title, hidden, updated_at, updated_by, payload, total_minutes from public.club_templates) t`))

// Slice 54 D1: the shared code login (smoke-login.mjs reads the code from subject or body).
async function login(page, email) {
  await codeLogin(page, email, S32)
  await page.locator('footer').getByText('Logga ut').waitFor()
}
async function wizardPass(page) {
  // Slice 54 A1: one tap per answer (Slice 46); «Standard trupp» left the hall list in Slice 45 → default hall.
  await startFragor(page, { age: /7–9/, focus: /^Trampett/ })
}
async function menuButtons(page) {
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  const names = await page.locator('.more-menu-panel button').allInnerTexts()
  await page.keyboard.press('Escape')
  await page.locator('.more-backdrop').click().catch(() => {})
  return names.map((s) => s.trim())
}
async function menuAction(page, name) {
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click()
}
const publishDlg = (page) => page.locator('.modal-backdrop[role=dialog]').filter({ has: page.locator('form') })
// Slice 54 (widen): «Använd mall» opens its own sheet since Slice 47 (MallSheet), not the side panel.
async function openMallar(page) {
  await menuAction(page, 'Använd mall')
  await page.locator('.mall-sheet').waitFor()
}
// Slice 54 (widen): the club admin tools (Senast ändrad, Dölj, Visa igen) live in the Admin view since Slice 47.
async function openAdminView(page) {
  await page.locator('footer .footer-admin-open').first().click()
  await page.locator('.admin-area').waitFor()
}
async function closeAdminView(page) {
  await page.locator('.admin-area-top .back').click()
  await page.locator('.admin-area').waitFor({ state: 'detached' }).catch(() => {})
}
// Slice 37 replaced the placements note (Teknik is auto-placed); Slice 41 shortened the toast (Ångra).
const APPLIED_NOW = 'Mallen är i Passbyggaren.'
// Slice 54 (widen): jsonb reorders object keys ({count, pieceId}); compare station redskap key-order-free.
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x))
const slim = (blocks) =>
  blocks
    .filter((b) => b.items.length)
    .map((b) => ({ t: b.type, items: [...b.items].sort((x, y) => x.order - y.order).map((i) => [i.activityId, i.durationMinutes, canon(i.stationEquipment ?? null)]) }))

// ─────────── reset the local table (owner, local stand-in only) ───────────
sql(`delete from public.club_templates;`)
const ROWCOUNTS = []
const rowCount = () => Number(sql('select count(*) from public.club_templates'))

let TITLE = ''
const LONG = 'Lång föreningsmall med många ord för att testa radbrytning i kortet på en smal telefon ok'.slice(0, 80)

// ═══════════ Phase A — admin: publish, overwrite, hide, unhide, offline ═══════════
await attempt('A', async () => {
  const ctx = await newCtx('admin')
  const p = await newPage(ctx, ON)
  await login(p, 'admin@test.local')
  await wizardPass(p)
  const d0 = await draft(p)
  TITLE = d0.title
  note(`admin pass «${TITLE}», ${d0.blocks.flatMap((b) => b.items).length} items, ${d0.hallPlacements?.length ?? 0} hall placements before publish`)
  check('AC1a', 'Admin: «Publicera som föreningsmall» in the pass menu next to «Spara som egen mall»', (await menuButtons(p)).join('|').includes('Spara som egen mall|Publicera som föreningsmall'), (await menuButtons(p)).join(' | '))

  await menuAction(p, S.clubPublish)
  const dlg = publishDlg(p)
  await dlg.waitFor()
  const input = dlg.getByLabel(S.clubPublishNameLabel)
  check('AC2a', 'Publish dialog: heading, «Namn på mallen» prefilled with the pass title, body verbatim, Avbryt + Publicera', (await dlg.locator('h2').innerText()) === S.clubPublishTitle && (await input.inputValue()) === TITLE && (await dlg.innerText()).includes(S.clubPublishBody) && (await dlg.getByRole('button', { name: R.cancel }).count()) === 1 && (await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).count()) === 1)
  await shot(p, '01_publish_dialog')
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  check('AC2b', 'Publicera → toast verbatim', (await toastText(p)) === S.clubPublished, await toast(p).innerText())
  await shot(p, '02_published_toast')
  let r = rows()
  const row = r.find((x) => x.title === TITLE)
  check('AC2c', 'Row exists with updated_by = admin e-mail', row && row.updated_by === 'admin@test.local' && r.length === 1, JSON.stringify(r.map((x) => [x.title, x.updated_by])))
  const dNow = await draft(p)
  check('AC3', 'Payload SharePass v1 (v, blocks), NO hallPlacements key; blocks/minutes/notes/station redskap = the pass', row && row.payload.v === 1 && Array.isArray(row.payload.blocks) && !('hallPlacements' in row.payload) && JSON.stringify(slim(row.payload.blocks)) === JSON.stringify(slim(dNow.blocks)) && row.payload.notes === (dNow.notes ?? '') && row.total_minutes === dNow.totalMinutes, JSON.stringify({ placements: dNow.hallPlacements?.length ?? 0, v: row?.payload.v, hp: row ? 'hallPlacements' in row.payload : null, blocks: row ? JSON.stringify(slim(row.payload.blocks)) === JSON.stringify(slim(dNow.blocks)) : null, notes: [row?.payload.notes, dNow.notes], min: [row?.total_minutes, dNow.totalMinutes] }))
  await waitToastGone(p)

  // AC4 — same name, other case/spaces → overwrite confirm; Avbryt; then Ersätt mallen.
  const before = rows()[0]
  await menuAction(p, S.clubPublish)
  await dlg.waitFor()
  await dlg.getByLabel(S.clubPublishNameLabel).fill(`   ${TITLE.toUpperCase()}  `)
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  const owTitle = S.clubOverwriteTitle.replace('{title}', TITLE)
  await dlg.locator('h2', { hasText: owTitle }).waitFor()
  check('AC4a', 'Same name (other case + spaces) → «Det finns redan en mall som heter ”…”» + body + «Ersätt mallen»', (await dlg.innerText()).includes(S.clubOverwriteBody) && (await dlg.getByRole('button', { name: S.clubOverwriteConfirm }).count()) === 1)
  await shot(p, '03_overwrite_confirm')
  await dlg.getByRole('button', { name: R.cancel }).click()
  await sleep(300)
  const afterCancel = rows()
  check('AC4b', '«Avbryt» changes nothing', afterCancel.length === 1 && afterCancel[0].updated_at === before.updated_at)
  await menuAction(p, S.clubPublish)
  await dlg.waitFor()
  await dlg.getByLabel(S.clubPublishNameLabel).fill(TITLE.toLowerCase())
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  await dlg.getByRole('button', { name: S.clubOverwriteConfirm }).click()
  check('AC4c', '«Ersätt mallen» → toast verbatim', (await toastText(p)) === S.clubOverwritten)
  r = rows()
  check('AC4d', 'Same row (same id, new updated_at), no second row', r.length === 1 && r[0].id === before.id && r[0].updated_at !== before.updated_at, `title now «${r[0].title}»`)
  note('overwrite stores the typed name (F1: title is part of the update), so the row is now «' + r[0].title + '»')
  TITLE = r[0].title
  await waitToastGone(p)

  // A second mall with an 80-char name (AC22 wrap).
  await menuAction(p, S.clubPublish)
  await dlg.waitFor()
  await dlg.getByLabel(S.clubPublishNameLabel).fill(LONG)
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  check('AC2d', 'Second mall (80-char name) published', (await toastText(p)) === S.clubPublished && rows().length === 2)
  await waitToastGone(p)
  ROWCOUNTS.push(rowCount())

  // AC7 / AC5 / AC6 in the Mallar tab.
  await openAdminView(p)
  const sec = p.locator('.admin-area section.club-templates')
  await sec.waitFor()
  const last = await sec.locator('.admin-last-changed').allInnerTexts()
  check('AC7a', 'Admin cards show «Senast ändrad {datum} av admin@test.local»', last.length === 2 && last.every((t) => /^Senast ändrad \d{1,2} [a-zé]{3} av admin@test\.local$/.test(t)), last.join(' | '))
  await shot(p, '04_admin_mallar')
  await sec.getByRole('button', { name: S.clubHideAria.replace('{title}', LONG) }).click()
  const conf = p.locator('.admin-hide-confirm')
  check('AC5a', 'Hide confirm verbatim + Avbryt/Dölj', (await conf.locator('p').first().innerText()) === S.clubHideConfirm.replace('{title}', LONG) && (await conf.getByRole('button', { name: R.hideYes, exact: true }).count()) === 1)
  await shot(p, '05_hide_confirm')
  await conf.getByRole('button', { name: R.hideYes, exact: true }).click()
  check('AC5b', 'Dölj → toast «Dold för alla.»', (await toastText(p)) === R.hidden)
  const group = sec.locator('details.club-hidden')
  await group.waitFor()
  check('AC5c', 'Collapsed group «Dolda föreningsmallar (1)»; row hidden = true', (await group.locator('summary').innerText()).trim() === S.clubHiddenTitle.replace('{n}', '1') && !(await group.evaluate((d) => d.open)) && rows().find((x) => x.title === LONG).hidden === true)
  await group.locator('summary').click()
  check('AC5d', 'Hidden card has tag «Dold»', (await group.locator('.admin-badge-hidden').innerText()).trim() === R.hiddenBadge)
  await shot(p, '06_hidden_group')
  await waitToastGone(p)
  await group.getByRole('button', { name: S.clubUnhideAria.replace('{title}', LONG) }).click()
  check('AC6a', 'Visa igen → toast «Syns igen för alla.», hidden = false, card back', (await toastText(p)) === R.unhidden && rows().find((x) => x.title === LONG).hidden === false && (await sec.locator('details.club-hidden').count()) === 0)
  ROWCOUNTS.push(rowCount())
  await waitToastGone(p)

  // AC8 — offline: publish / Dölj / Visa igen change nothing.
  const snap = JSON.stringify(rows())
  await ctx.setOffline(true)
  await sec.getByRole('button', { name: S.clubHideAria.replace('{title}', LONG) }).click()
  await p.locator('.admin-hide-confirm').getByRole('button', { name: R.hideYes, exact: true }).click()
  const offHide = await toastText(p)
  await closeAdminView(p)
  await menuAction(p, S.clubPublish)
  await dlg.waitFor()
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  await dlg.locator('.admin-error').waitFor()
  const offPub = (await dlg.locator('.admin-error').innerText()).trim()
  await shot(p, '07_offline_publish')
  await dlg.getByRole('button', { name: R.cancel }).click()
  await ctx.setOffline(false)
  check('AC8', 'Offline: Dölj and Publicera show «Du behöver nät …»; DB unchanged', offHide === S.clubOffline && offPub === S.clubOffline && JSON.stringify(rows()) === snap, `${offHide} / ${offPub}`)

  // §8.4 — hidden + same name → overwrite shows it again.
  sql(`update public.club_templates set hidden = true where title = '${TITLE.replace(/'/g, "''")}'`)
  await menuAction(p, S.clubPublish)
  await dlg.waitFor()
  await dlg.getByLabel(S.clubPublishNameLabel).fill(TITLE)
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  await dlg.getByRole('button', { name: S.clubOverwriteConfirm }).click()
  await toastText(p)
  check('§8.4', 'Publishing the name of a hidden mall → overwrite confirm → row shown again (hidden = false)', rows().find((x) => x.title === TITLE).hidden === false && rowCount() === 2)
  ROWCOUNTS.push(rowCount())
  check('AC6b', 'Nothing is ever deleted (row count never drops)', ROWCOUNTS.every((n, i) => i === 0 || n >= ROWCOUNTS[i - 1]), ROWCOUNTS.join('→'))
  const adminWrites = writes('admin').map((w) => `${w.method} ${new URL(w.url).pathname}`)
  check('AC21b', 'Admin writes are POST/PATCH to club_templates only, never DELETE', adminWrites.length > 0 && adminWrites.every((w) => /^(POST|PATCH) \/rest\/v1\/club_templates$/.test(w)), [...new Set(adminWrites)].join(', '))
  await ctx.close()
})

// ═══════════ Phase B — coach (logged out, fresh browser) ═══════════
await attempt('B', async () => {
  const ctx = await newCtx('coach')
  const p = await newPage(ctx, ON)
  await p.waitForTimeout(800)
  const gets = clubGets('coach')
  check('AC10', 'One GET to club_templates after render: apikey, no Authorization, hidden=is.false', gets.length === 1 && gets[0].method === 'GET' && gets[0].headers.apikey === 'sb_publishable_local_s32' && !('authorization' in gets[0].headers) && gets[0].url.includes('hidden=is.false'), gets.map((g) => g.url.split('?')[1]).join(' ; '))
  const panel = await openMallList(p) // Slice 54 A1: the mall list is in the guide (Slice 46)
  const sec = panel.locator('section.club-templates')
  await sec.waitFor()
  const order = await panel.evaluate((el) => [...el.querySelectorAll('h3.template-group, .template-saved-hint, .template-list > li > .template-card strong')].map((n) => n.textContent))
  const cards = sec.locator('.template-club .template-card')
  const arias = await cards.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
  const r = rows()
  const want = r.filter((x) => !x.hidden).map((x) => S.clubTemplateCardAria.replace('{title}', x.title).replace('{n}', String(x.total_minutes)))
  // Slice 54 (widen): in the guide the savedTemplatesHint is not shown (MallList shows it only with tools, Slice 47); built-in mallar come last.
  check('AC9a', 'Starta från mall (guide): «Föreningens mallar» heading + hint first, club cards, then built-in mallar; no savedTemplatesHint', order[0] === S.clubTemplatesTitle && (await sec.locator('p.muted').first().innerText()) === S.clubTemplatesHint && !order.includes(SAVED_HINT) && order.at(-1) !== S.clubTemplatesTitle && (await panel.locator('.template-list').last().locator('.template-card').count()) > 0, order.slice(0, 5).join(' | '))
  check('AC9b', 'Each club card: title, minutes, tag «Föreningens», aria «Föreningens mall {title}, {n} min»', JSON.stringify([...arias].sort()) === JSON.stringify([...want].sort()) && (await sec.locator('.club-badge').allInnerTexts()).every((t) => t === S.clubTemplateBadge), arias.join(' | '))
  const secText = await sec.innerText()
  check('AC9c', 'No Ta bort / Kopiera delningskod / admin words on club cards for coaches', (await sec.locator('button').count()) === (await cards.count()) && !/Ta bort|Kopiera|Publicera|Dold|Senast ändrad|Dölj/.test(secText))
  check('AC21a', 'Coach visit downloads no admin chunk and no supabase-js', !chunksOf('coach').some((c) => ADMIN_CHUNK.test(c)), chunksOf('coach').join(', '))
  check('AC22a', '390 wide: no horizontal scroll; 80-char title wraps inside the card; cards ≥ 44 px', (await scrollW(p)) <= 390 && (await cards.evaluateAll((els) => els.every((e) => e.getBoundingClientRect().height >= 44 && e.getBoundingClientRect().right <= 390))))
  await shot(p, '08_coach_starta_fran_mall')
  // Keyboard focus reaches a club card with a visible ring.
  await cards.first().focus()
  await p.keyboard.press('Shift+Tab')
  await p.keyboard.press('Tab')
  const ring = await p.evaluate(() => {
    const el = document.activeElement
    const s = getComputedStyle(el)
    return { cls: el.className, aria: el.getAttribute('aria-label'), ring: s.outlineStyle !== 'none' || s.boxShadow !== 'none' }
  })
  check('AC22b', 'Keyboard reaches a club card with a visible focus style', ring.cls.includes('template-card') && ring.ring, JSON.stringify(ring))

  // AC16 — apply from Starta från mall (Home path).
  const pickRow = r.find((x) => x.title === TITLE)
  await sec.getByRole('button', { name: S.clubTemplateCardAria.replace('{title}', pickRow.title).replace('{n}', String(pickRow.total_minutes)) }).click()
  // Slice 54 (widen): with no pass yet the guide applies at once (Slice 46); the placements note left in Slice 37 (auto-place).
  const conf = p.locator('.modal-backdrop[role=dialog]').filter({ hasText: R.tTitle })
  await p.waitForTimeout(500)
  const asked = await conf.count()
  const confText = asked ? await conf.innerText() : ''
  check('AC16a', 'Home guide, no pass yet: no Ersätta-confirm; no «Stationerna placerar du själv…» note anywhere', asked === 0 && !confText.includes(S.clubTemplatePlacementsNote) && !(await p.locator('body').innerText()).includes(S.clubTemplatePlacementsNote), `confirm=${asked}`)
  await shot(p, '09_apply_confirm')
  if (asked) await conf.getByRole('button', { name: R.tConfirm, exact: true }).click()
  const applied = await toastText(p)
  const d = await draft(p)
  check('AC16b', 'Applied: toast verbatim, pass in Passbyggaren with the mall blocks/timings, sheet closed', applied.split('\n')[0] === APPLIED_NOW && JSON.stringify(slim(d.blocks)) === JSON.stringify(slim(pickRow.payload.blocks)) && (await p.locator('.home-wizard-sheet').count()) === 0 && d.title === pickRow.title, applied)
  const itemIds = new Set(d.blocks.flatMap((b) => b.items).map((i) => i.id))
  check('AC17a', 'After apply: placements only for items in this pass (Slice 37 auto-place); fresh item ids (≠ payload ids); body not scroll-locked', (d.hallPlacements ?? []).every((h) => itemIds.has(h.sessionItemId)) && !d.blocks.flatMap((b) => b.items).some((i) => pickRow.payload.blocks.flatMap((b) => b.items).some((j) => j.id === i.id)) && (await p.evaluate(() => document.body.style.overflow)) !== 'hidden')
  await shot(p, '10_applied_builder')
  await waitToastGone(p)
  await p.locator('.builder').getByRole('button', { name: 'Hallöversikt' }).first().click() // Slice 54 (widen): header button since Slice 46
  await p.waitForTimeout(600)
  const hallText = await p.locator('body').innerText()
  check('AC17b', 'Hallöversikt opens with the stations unplaced (tray / unplaced banner), hall chip unchanged', /inte placerade|Placera|ej placerad|kvar att placera/i.test(hallText), hallText.match(/[^\n]*(placera|Placera)[^\n]*/)?.[0] ?? '')
  await shot(p, '11_hall_after_apply')
  await p.goBack().catch(() => {})
  await p.goto(ON)
  await p.waitForTimeout(500)
  // AC20 — coach edits stay local; Spara som egen mall works on it.
  const fresh = await draft(p)
  note(`coach draft after reload: «${fresh?.title}»`)
  const dbBefore = JSON.stringify(rows())
  const cont = p.getByRole('button', { name: /Fortsätt/ }).first()
  if (await cont.count()) await cont.click()
  await p.locator('.builder').waitFor()
  await p.getByLabel('Passets titel').fill('Mitt eget från föreningen')
  await menuAction(p, 'Spara som egen mall')
  const sdlg = p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Spara som egen mall' })
  await sdlg.locator('button[type=submit]').click()
  const ownSaved = await toastText(p)
  check('AC20', 'Coach edit + Spara som egen mall: saved locally, DB row unchanged, no POST/PATCH/DELETE from the coach', ownSaved === 'Sparad som egen mall.' && JSON.stringify(rows()) === dbBefore && writes('coach').length === 0, ownSaved)
  await waitToastGone(p)
  await openMallar(p)
  const order2 = await p.locator('.mall-sheet').evaluate((el) => [...el.querySelectorAll('h3.template-group, .template-saved-hint')].map((n) => n.textContent))
  check('AC9d', 'Tab order: Föreningens mallar → Mina mallar → savedTemplatesHint → built-in', order2[0] === S.clubTemplatesTitle && order2[1] === 'Mina mallar' && order2[2] === SAVED_HINT, order2.join(' | '))
  await shot(p, '12_mallar_tab_order')
  // AC27 — built-in mall still applies.
  await p.locator('.mall-sheet .template-list').last().locator('.template-card').first().click()
  await p.waitForTimeout(400) // Slice 54 (widen): since Slice 41 a mall replaces the pass at once (toast with Ångra); confirm only if asked
  const c27 = p.locator('.modal-backdrop[role=dialog]').filter({ hasText: R.tTitle }).getByRole('button', { name: R.tConfirm, exact: true })
  if (await c27.count()) await c27.click()
  await p.waitForTimeout(400)
  check('AC27a', 'Built-in mall still applies (no club note on its confirm)', (await p.locator('.mall-sheet').count()) === 0)

  // AC13 (local stand-in only) — the refresh fails: cards from the cache + grey line; applying works.
  ctx.clubDown = true
  await p.goto(ON)
  const sec2 = (await openMallList(p)).locator('section.club-templates') // Slice 54 A1
  await sec2.locator('.bank-stale').waitFor()
  check('AC13-local', 'Refresh fails → cards still listed from the device copy + «Visar sparade mallar. …»', (await sec2.locator('.bank-stale').innerText()) === S.clubTemplatesStale && (await sec2.locator('.template-club').count()) === 2)
  await shot(p, '13_stale_from_cache')
  await sec2.locator('.template-club .template-card').first().click()
  await p.waitForTimeout(400) // Slice 54 (widen): confirm only if asked (Slice 41 Ångra); toast text from Slice 41
  const c13 = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: R.tConfirm, exact: true })
  if (await c13.count()) await c13.click()
  check('AC13-apply', 'Applying from the cached list works without nät to the list', (await toastText(p)).split('\n')[0] === APPLIED_NOW)
  ctx.clubDown = false

  // AC11 — admin hides one → coach reload no longer lists it.
  sql(`update public.club_templates set hidden = true where title = '${LONG.replace(/'/g, "''")}'`)
  await p.goto(ON)
  await p.waitForTimeout(600)
  const sec3 = (await openMallList(p)).locator('section.club-templates') // Slice 54 A1
  await sec3.waitFor()
  const titles3 = await sec3.locator('.template-club strong').allInnerTexts()
  check('AC11', 'Hidden by admin → gone after reload (cache too)', titles3.length === 1 && titles3[0] === TITLE && !JSON.stringify(JSON.parse(await store(p, CLUB_KEY)).items).includes(LONG), titles3.join(' | '))
  // AC12 — all hidden → empty text, cache cleared.
  sql(`update public.club_templates set hidden = true`)
  await p.goto(ON)
  await p.waitForTimeout(600)
  const list4 = await openMallList(p) // Slice 54 A1
  await p.waitForTimeout(500)
  // Slice 54 (widen): since Slice 49 E1 the section is shown only with ≥1 mall, so «all hidden» = no section at all.
  check('AC12', 'All hidden → no «Föreningens mallar» section (Slice 49 E1), no empty text for the coach; cache key removed', (await list4.locator('section.club-templates').count()) === 0 && !(await list4.innerText()).includes(S.clubTemplatesEmpty) && (await store(p, CLUB_KEY)) === null)
  await shot(p, '14_empty')
  sql(`update public.club_templates set hidden = false`)
  // AC24 — footer + Tyck till version line.
  await p.goto(ON)
  await p.waitForTimeout(500)
  if (!(await p.locator('.builder').count())) {
    const cont2 = p.getByRole('button', { name: /Fortsätt/ }).first()
    if (await cont2.count()) await cont2.click()
    else await wizardPass(p)
    await p.locator('.builder').waitFor()
  }
  const foot = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  const href = await p.locator('footer a.footer-feedback').getAttribute('href')
  check('AC24', 'Footer «Träningsplaneraren · Slice N»; «Tyck till» mail ends «Version: Slice N» (N = SLICE_NUMBER)', foot.includes(S.footerSliceLabel) && decodeURIComponent(href.split('body=')[1] ?? '').trimEnd().endsWith(`Version: Slice ${SLICE}`), foot.slice(0, 80))
  check('AC21c', 'Whole coach session: still no admin chunk, no Authorization header to the bank', !chunksOf('coach').some((c) => ADMIN_CHUNK.test(c)) && bankLog.filter((b) => b.ctx === 'coach').every((b) => !('authorization' in b.headers)))
  await ctx.close()
})

// ═══════════ Phase C — first load without the list; slow DB; bank off ═══════════
await attempt('C', async () => {
  const ctx = await newCtx('first-offline')
  ctx.clubDown = true
  const p = await newPage(ctx, ON)
  await p.waitForTimeout(800)
  const list1 = await openMallList(p) // Slice 54 A1
  check('AC14a', 'First ever load, list unreachable, no cache: no club section, no empty text, no error; built-in mallar listed', (await p.locator('section.club-templates').count()) === 0 && !(await list1.innerText()).includes(S.clubTemplatesEmpty) && (await list1.locator('.template-card').count()) > 0)
  await shot(p, '15_first_load_no_list')
  await ctx.close()

  const ctx2 = await newCtx('slow')
  const p2 = await newPage(ctx2, ON)
  await p2.waitForTimeout(800)
  ctx2.clubSlowMs = 9500
  await p2.reload()
  await openMallList(p2) // Slice 54 A1
  const t0 = Date.now()
  await p2.locator('section.club-templates .bank-stale').waitFor({ timeout: 15000 })
  const waited = Date.now() - t0
  check('AC14b', 'DB slower than 8 s → stale line after the timeout, list kept', (await p2.locator('section.club-templates .template-club').count()) === 2, `stale after ~${Math.round(waited / 100) / 10} s from opening the sheet`)
  await ctx2.close()

  const ctx3 = await newCtx('bank-off')
  const p3 = await newPage(ctx3, OFF)
  await p3.waitForTimeout(800)
  await openMallList(p3) // Slice 54 A1
  check('AC15', 'Plain build (no VITE_SUPABASE_*): no request, no club section, no stale line', bankLog.filter((b) => b.ctx === 'bank-off').length === 0 && (await p3.locator('section.club-templates, .bank-stale').count()) === 0)
  await ctx3.close()
})

// ═══════════ Static checks ═══════════
const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
const LATER = { clubTemplatePlacementsNote: 'removed in Slice 37', clubTemplateApplied: 'shortened in Slice 41' } // Slice 54 (widen)
const verbatim = KEYS.filter((k) => k !== 'footerSliceLabel' && !LATER[k]).every((k) => meta.includes(`${k}: '${S[k]}'`))
check('AC23', 'All Slice 36 strings verbatim in blockMeta.ts, no «!», SLICE_NUMBER set, footer = template', verbatim && !KEYS.some((k) => S[k].includes('!')) && meta.includes("export const SLICE_NUMBER = '") && meta.includes('`Träningsplaneraren · Slice ${SLICE_NUMBER}`') && !meta.includes('clubTemplatePlacementsNote') && meta.includes(`clubTemplateApplied: '${APPLIED_NOW}'`)) // Slice 54 B1
const delHits = execFileSync('bash', ['-c', `rg -n "\\.delete\\(" ${ROOT}/app/src --glob '!*.test.ts' || true`], { encoding: 'utf8' }).trim()
check('AC21d', 'rg "\\.delete\\(" app/src (non-test) finds nothing', delHits === '', delHits)
check('errors', 'No page errors', pageErrors.length === 0, pageErrors.join(' | '))

await browser.close()
const pass = results.filter((r) => r.ok).length
writeFileSync(`${ROOT}/verifier/slice-36-builder-smoke-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes }, null, 2))
console.log(`\n${pass}/${results.length} pass`)
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

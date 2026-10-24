// Slice 37 — Builder self-smoke: Teknik auto-placed on mall apply (built-in, Föreningsmall, Egen mall), 390×844.
// Local only: bank build preview :4200 → https://bank-mock.supabase.co routed to verifier/slice-36-local (/tmp/s36).
// One club mall row is inserted by the DB owner on the LOCAL stand-in (never the real project).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { openMallList, startFragor, startTomt } from './tools/smoke-start.mjs'
import { sliceNumber } from './tools/smoke-login.mjs'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const ON = process.env.S37_URL ?? 'http://127.0.0.1:4200/traningsplaneringen/'
const ROOT = process.env.SMOKE_ROOT ?? '/workspace/gymnastics-planner'
const SLICE = sliceNumber(ROOT) // Slice 51: footer follows SLICE_NUMBER, not the slice that wrote the check
const S32 = process.env.S32_DIR ?? '/tmp/s36'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const DRAFT = 'gymnastics-planner-draft-v1'
const SAVED = 'gymnastics-planner-templates-v1'
const TOAST = 'Mallen är i Passbyggaren.'
const OLD_NOTE = 'Stationerna placerar du själv i Hallöversikt.'

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`)
}
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8' }).trim()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
await ctx.route('https://bank-mock.supabase.co/**', async (route) => {
  const req = route.request()
  const u = new URL(req.url())
  const headers = { ...req.headers() }
  delete headers.host
  try {
    const resp = await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined })
    return await route.fulfill({ response: resp })
  } catch {
    return route.abort('failed').catch(() => {})
  }
})
const errors = []
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', (e) => errors.push(e.message))
const shot = (n) => p.screenshot({ path: `/workspace/screenshots/slice37_${n}.png` })
const draft = async () => JSON.parse((await p.evaluate((k) => localStorage.getItem(k), DRAFT)) ?? 'null')
const teknik = (d) => d.blocks.filter((b) => b.type === 'techniques').flatMap((b) => b.items.map((i) => i.id)).sort()
const placedIds = (d) => (d.hallPlacements ?? []).map((x) => x.sessionItemId).sort()
const nonTeknikPlaced = (d) => d.blocks.filter((b) => b.type !== 'techniques').flatMap((b) => b.items).filter((i) => placedIds(d).includes(i.id)).length
const noStack = (d) => new Set((d.hallPlacements ?? []).map((x) => `${x.x.toFixed(3)},${x.y.toFixed(3)}`)).size === (d.hallPlacements ?? []).length
const toast = p.locator('.toast[role=status]')
const confirmDlg = () => p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Ersätta det här passet?' })
// Slice 51: since Slice 47 the mall applies straight away when there is no coach work to replace (no confirm).
async function useMall() {
  const btn = confirmDlg().getByRole('button', { name: 'Använd mall', exact: true })
  await Promise.race([btn.waitFor({ timeout: 2500 }), p.locator('.builder').waitFor({ timeout: 2500 })]).catch(() => {})
  if (await btn.count()) await btn.click()
}
async function menu(name) {
  // Slice 51: Hallöversikt (and others) may sit directly in the builder header since Slice 46.
  for (const b of await p.locator('.builder-actions > button, .builder-extra > button').filter({ hasText: name }).all()) {
    if (await b.isVisible()) return b.click()
  }
  await p.getByRole('button', { name: 'Fler saker med passet' }).click()
  await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click()
}
async function home() {
  await p.goto(ON)
  await p.waitForTimeout(700)
  if (await p.locator('.builder').count()) {
    await p.getByRole('button', { name: /Tillbaka|Hem/ }).first().click()
  }
}
// Slice 51 (A1): Startsidan → «Planera pass» → «Starta från mall» → Hall (smoke-start.mjs); the mall list is in the guide.
async function openFromHome() {
  await home()
  return openMallList(p)
}
async function hallCanvasCount() {
  await menu('Hallöversikt')
  await p.locator('.hall-chip').first().waitFor()
  await p.waitForTimeout(400)
  const n = await p.locator('.hall-chip--canvas').count()
  return n
}
async function backToBuilder() {
  const done = p.getByRole('button', { name: /^← Tillbaka till Passbyggaren$/ }).first()
  if (await done.count()) await done.click()
  else await p.goBack()
  await p.locator('.builder').waitFor()
}

sql('delete from public.club_templates')
await p.goto(ON)
await p.waitForTimeout(600)

// ── AC1/AC4/AC5/AC8 — built-in mall from Home «Starta från mall».
const homeList = await openFromHome()
const builtTitle = (await homeList.locator('.template-list').last().locator('.template-card strong').first().innerText()).trim()
await homeList.locator('.template-list').last().locator('.template-card').first().click()
await useMall()
await p.locator('.builder').waitFor()
await p.waitForTimeout(400)
// Slice 39: the built-in mall is saved the moment it is applied (no Spara utkast); wait for «Sparat».
const toastAfterApply = await toast.count()
const toastTextAfterApply = toastAfterApply ? (await toast.innerText().catch(() => '')).trim() : ''
await p.locator('.builder-actions .save-status', { hasText: 'Sparat' }).waitFor({ timeout: 5000 })
let d = await draft()
check('note', 'Built-in apply is saved at once (Slice 39 C1): draft present right after apply', !!d)
check('AC1a', `Built-in «${builtTitle}»: draft has one marker per Teknik item right after apply (hall not opened)`, JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && teknik(d).length >= 1, `${placedIds(d).length}/${teknik(d).length}`)
check('AC4a', 'Built-in: no non-Teknik markers; hall template = the guide hall (forening-bla since Slice 45)', nonTeknikPlaced(d) === 0 && d.hallTemplateId === 'forening-bla', d.hallTemplateId)
check('AC5', 'Använd alla förslag not triggered: no station redskap saved on Teknik items', d.blocks.flatMap((b) => b.items).every((i) => !i.stationEquipment))
// Slice 51: since Slice 46 (Starta-flödet) a built-in mall also gets «Mallen är i Passbyggaren. · Ångra».
// Slice 52: C1 — the Slice 46 undo toast is required (it always shows), not optional.
check('AC9a', 'Built-in apply shows the Slice 46 undo toast «Mallen är i Passbyggaren.»', toastAfterApply > 0 && toastTextAfterApply.startsWith(TOAST), toastTextAfterApply || 'no toast')
check('AC6a', 'Markers do not stack (distinct spots)', noStack(d))
await shot('01_builtin_applied')
const before = JSON.stringify(d.hallPlacements)
await p.reload()
await p.waitForTimeout(600)
check('AC8a', 'Reload: built-in placements still in the draft', JSON.stringify((await draft()).hallPlacements) === before)
if (!(await p.locator('.builder').count())) await p.getByRole('button', { name: /Fortsätt/ }).first().click()
const canvasN = await hallCanvasCount()
d = await draft()
check('AC1b', 'Open Hallöversikt: same markers, no extra or duplicate', canvasN === teknik(d).length && JSON.stringify(d.hallPlacements) === before, `canvas chips ${canvasN}`)
await shot('02_builtin_hall')
await backToBuilder()

// ── AC2/AC9 — Föreningsmall (club). Payload = this pass without placements (owner insert, local only).
const { hallPlacements: _h, ...payload } = { v: 1, title: 'Klubbens trampett', notes: '', blocks: d.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) })), hallTemplateId: d.hallTemplateId }
void _h
sql(`insert into public.club_templates (title, total_minutes, payload) values ('Klubbens trampett', ${Math.max(1, d.totalMinutes)}, '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb)`)
await p.goto(ON)
await p.waitForTimeout(900)
await openFromHome()
await p.locator('section.club-templates .template-club .template-card').first().click()
// Slice 51: since Slice 46 the Starta flow applies a club mall with «Ångra» instead of a confirm; when no confirm
// shows, the old line cannot show either.
const cdlg = confirmDlg()
await Promise.race([cdlg.waitFor({ timeout: 2500 }), toast.waitFor({ timeout: 2500 })]).catch(() => {})
const hasDlg = (await cdlg.count()) > 0
// Slice 52: C1 — without a confirm the undo toast must be there; with a confirm it must not carry OLD_NOTE.
const clubToast = hasDlg ? '' : (await toast.innerText().catch(() => '')).trim()
check('AC9b', 'Club apply: toast «Mallen är i Passbyggaren.» (Slice 46), and a confirm (if any) has no «Stationerna placerar du själv i Hallöversikt.» line', hasDlg ? !(await cdlg.innerText()).includes(OLD_NOTE) : clubToast.startsWith(TOAST), hasDlg ? 'confirm' : `no confirm (Slice 46), toast «${clubToast}»`)
await shot('03_club_confirm')
if (hasDlg) await cdlg.getByRole('button', { name: 'Använd mall', exact: true }).click()
await toast.waitFor()
// Slice 51: the toast carries «Ångra» since Slice 41/46 (undo toast).
check('AC9c', 'Club toast reads «Mallen är i Passbyggaren.» (+ Ångra)', (await toast.innerText()).trim().startsWith(TOAST))
d = await draft()
check('AC2', 'Club mall (≥ 2 Teknik): all Teknik placed on apply, in the pass hall template; only Teknik', teknik(d).length >= 2 && JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && nonTeknikPlaced(d) === 0 && d.hallTemplateId === payload.hallTemplateId && noStack(d), `${placedIds(d).length}/${teknik(d).length}`)
check('AC11', 'Club row in the DB still has no hallPlacements', sql(`select bool_and(not (payload ? 'hallPlacements')) from public.club_templates`) === 't')
await shot('04_club_applied_toast')
const t0 = Date.now()
await toast.waitFor({ state: 'detached', timeout: 7000 })
check('AC9d', 'Toast disappears after the undo window (~5 s, Slice 41)', Date.now() - t0 < 6000, `${Date.now() - t0} ms after seen`)
const clubPl = JSON.stringify(d.hallPlacements)
await p.reload()
await p.waitForTimeout(600)
check('AC8b', 'Reload: club placements still in the draft', JSON.stringify((await draft()).hallPlacements) === clubPl)

// ── AC3 — Egen mall with / without placements (saved through the real button, then the stored placements edited).
if (!(await p.locator('.builder').count())) await p.getByRole('button', { name: /Fortsätt/ }).first().click()
await menu('Spara som egen mall')
await p.locator('.modal-backdrop[role=dialog] button[type=submit]').click()
await toast.waitFor()
await p.waitForTimeout(2600)
const keep = await p.evaluate((k) => {
  const list = JSON.parse(localStorage.getItem(k))
  const t = list[0]
  const pl = t.pass.hallPlacements
  pl[0] = { ...pl[0], x: 0.123, y: 0.456 }
  const dropped = pl.pop().sessionItemId // this Teknik item is unplaced in the mall
  const bare = JSON.parse(JSON.stringify(t))
  bare.id = t.id + '-bare'
  bare.title = 'Egen utan placering'
  bare.pass.hallPlacements = []
  list.push(bare)
  localStorage.setItem(k, JSON.stringify(list))
  return { first: pl[0].sessionItemId, dropped, title: t.title, n: pl.length + 1 }
}, SAVED)
await p.reload()
await p.waitForTimeout(600)
if (!(await p.locator('.builder').count())) await p.getByRole('button', { name: /Fortsätt/ }).first().click()
await menu('Använd mall')
await p.locator('.mall-sheet').waitFor() // Slice 51: Använd mall opens MallSheet (Slice 46), not the side panel
await p.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: keep.title }).first().click()
await useMall()
await p.waitForTimeout(500)
// Slice 51: Använd mall in the builder arms «Ångra» since Slice 41 A1 (undo toast); no other toast.
// Slice 52: C1 — the undo toast is required.
check('AC9e', 'Egen mall apply shows the undo toast', (await toast.count()) > 0 && (await toast.innerText()).trim().startsWith(TOAST))
d = await draft()
// Item ids are kept from the mall for Egen mall (Slice 20 behaviour), so the first saved spot can be matched by order.
const firstTek = d.blocks.find((b) => b.type === 'techniques').items.slice().sort((a, b) => a.order - b.order)
const kept = (d.hallPlacements ?? []).filter((x) => Math.abs(x.x - 0.123) < 1e-9 && Math.abs(x.y - 0.456) < 1e-9)
check('AC3a', 'Egen mall with placements: the saved marker keeps its exact spot; the unplaced Teknik item gets one; all Teknik placed once', kept.length === 1 && JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && teknik(d).length === keep.n && nonTeknikPlaced(d) === 0, `kept ${kept.length}, placed ${placedIds(d).length}/${teknik(d).length}, first teknik ${firstTek[0]?.id}`)
await shot('05_egen_with_placements')
const egenPl = JSON.stringify(d.hallPlacements)
await p.reload()
await p.waitForTimeout(600)
check('AC8c', 'Reload: Egen mall placements still in the draft', JSON.stringify((await draft()).hallPlacements) === egenPl)
if (!(await p.locator('.builder').count())) await p.getByRole('button', { name: /Fortsätt/ }).first().click()
await menu('Använd mall')
await p.locator('.mall-sheet').waitFor() // Slice 51: Använd mall opens MallSheet (Slice 46), not the side panel
await p.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: 'Egen utan placering' }).first().click()
await useMall()
await p.waitForTimeout(500)
d = await draft()
check('AC3b', 'Egen mall saved without placements: all Teknik placed, nothing else', JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && nonTeknikPlaced(d) === 0 && noStack(d))

// ── AC7 — remove one marker in Hallöversikt; it does not come back on reopen.
const n0 = await hallCanvasCount()
await shot('06_hall_before_remove')
const removeBtn = p.locator('.hall-chip--canvas').first().getByRole('button', { name: /Ta bort från hall/ })
let removed = false
if (await removeBtn.count()) {
  await removeBtn.click()
  await p.waitForTimeout(300)
  removed = (await p.locator('.hall-chip--canvas').count()) === n0 - 1
}
await backToBuilder()
const n1 = await hallCanvasCount()
check('AC7', 'Remove one marker → reopen Hallöversikt: it stays removed (no re-placement)', removed && n1 === n0 - 1, `before ${n0}, after reopen ${n1}`)
await shot('07_hall_after_remove')
await backToBuilder()

// ── AC12 — footer + Tyck till.
const foot = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
const href = await p.locator('footer a.footer-feedback').getAttribute('href')
check('AC12', `Footer «Träningsplaneraren · Slice ${SLICE}»; mail ends «Version: Slice ${SLICE}»`, foot.includes(`Träningsplaneraren · Slice ${SLICE}`) && decodeURIComponent(href.split('body=')[1]).trimEnd().endsWith(`Version: Slice ${SLICE}`))

// ── AC14 — Planera pass still places; Tomt pass has an empty hall.
await p.evaluate(() => localStorage.removeItem('gymnastics-planner-draft-v1'))
await home()
await startFragor(p, { age: /7–9/, focus: /^Trampett/ }) // Slice 51: question path (Standard trupp left the hall list in Slice 45)
d = await draft()
check('AC14a', 'Planera pass still places all Teknik', JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && teknik(d).length > 0)
await p.evaluate(() => localStorage.removeItem('gymnastics-planner-draft-v1'))
await home()
await startTomt(p)
// Slice 39 E1: a Tomt pass is not written until a station is added, so it cannot carry placements.
await p.waitForTimeout(1200)
d = await draft()
check('AC14b', 'Tomt pass: nothing stored yet (Slice 39 E1), so no hall placements; «Sparat» hidden', d === null && (await p.locator('.save-status').count()) === 0, d ? `stored, placements ${(d.hallPlacements ?? []).length}` : 'no draft')
check('AC22', '390 wide: no horizontal scroll', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390)
check('errors', 'No page errors', errors.length === 0, errors.join(' | '))
await browser.close()
const pass = results.filter((r) => r.ok).length
writeFileSync(`${ROOT}/verifier/slice-37-builder-smoke-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results }, null, 2))
console.log(`\n${pass}/${results.length} pass`)
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

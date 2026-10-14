// Slice 37 — Verifier: Teknik auto-placed on mall apply (built-in, Egen mall, Föreningsmall), 390×844, headless.
// Local only. Bank build preview (S37V_ON) → https://bank-mock.supabase.co routed to MY stand-in (verifier/slice-36-local,
// S32_DIR=/tmp/s37v/sb, ports 5685x). Club rows inserted by the local DB owner only. Main build (S37V_MAIN) for AC5 "as before".
// Never the real project. Writes drafts to /tmp/s37v/drafts for verifier/slice-37-checks/helper-parity.ts.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const ON = process.env.S37V_ON ?? 'http://127.0.0.1:56861/traningsplaneringen/'
const MAIN = process.env.S37V_MAIN ?? 'http://127.0.0.1:56863/traningsplaneringen/'
const PLAIN = process.env.S37V_PLAIN ?? 'http://127.0.0.1:56862/traningsplaneringen/'
const S32 = process.env.S32_DIR ?? '/tmp/s37v/sb'
const OUT = process.env.S37V_OUT ?? '/tmp/s37v'
const SS = '/workspace/screenshots/s37v_'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const DRAFT = 'gymnastics-planner-draft-v1'
const SAVED = 'gymnastics-planner-templates-v1'
mkdirSync(`${OUT}/drafts`, { recursive: true })

const results = []
const notes = {}
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 400) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 260) : ''}`)
}
async function attempt(id, name, fn) {
  try { await fn() } catch (e) { check(id + '-E', name + ' threw', false, e.message.split('\n')[0]) }
}
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8' }).trim()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })

// Watches every DOM text change for the Använd alla förslag result toast («Sparade redskap på …»).
const WATCH = () => {
  window.__s37 = { applyAllToast: 0, texts: [] }
  new MutationObserver(() => {
    const t = document.body?.innerText ?? ''
    if (/Sparade redskap på/.test(t)) window.__s37.applyAllToast++
  }).observe(document, { subtree: true, childList: true, characterData: true })
}
async function newPage(url) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route('https://bank-mock.supabase.co/**', async (route) => {
    const req = route.request(); const u = new URL(req.url()); const headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) }
    catch { return route.abort('failed').catch(() => {}) }
  })
  await ctx.addInitScript(WATCH)
  const p = await ctx.newPage(); p.setDefaultTimeout(10000)
  p.errors = []; p.on('pageerror', (e) => p.errors.push(e.message))
  p.base = url
  return p
}
const draft = async (p) => JSON.parse((await p.evaluate((k) => localStorage.getItem(k), DRAFT)) ?? 'null')
const items = (d) => d.blocks.flatMap((b) => b.items.map((i) => ({ ...i, type: b.type })))
const teknik = (d) => items(d).filter((i) => i.type === 'techniques').map((i) => i.id).sort()
const placedIds = (d) => (d.hallPlacements ?? []).map((x) => x.sessionItemId).sort()
const nonTeknikPlaced = (d) => items(d).filter((i) => i.type !== 'techniques' && placedIds(d).includes(i.id)).length
const noStack = (d) => new Set((d.hallPlacements ?? []).map((x) => `${x.x.toFixed(3)},${x.y.toFixed(3)}`)).size === (d.hallPlacements ?? []).length
const inBounds = (d) => (d.hallPlacements ?? []).every((x) => x.x >= 0 && x.x <= 1 && x.y >= 0 && x.y <= 1)
const noRedskapSaved = (d) => items(d).every((i) => !i.stationEquipment || i.stationEquipment.length === 0)
const types = (d) => [...new Set(items(d).map((i) => i.type))].join(',')
const dump = (name, d) => writeFileSync(`${OUT}/drafts/${name}.json`, JSON.stringify(d, null, 1))
// Slice 39: «Spara utkast» is gone on branches ≥ 39 (autosave ~800 ms). Click it where it exists (main ≤ 38), else wait for autosave.
async function saveUi(p) {
  const b = p.getByRole('button', { name: 'Spara utkast' })
  if (await b.count()) { await b.click(); await p.waitForTimeout(300) } else await p.waitForTimeout(1100)
}
const confirmDlg = (p) => p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Ersätta det här passet?' })
const toast = (p) => p.locator('.toast[role=status]')
async function menu(p, name) {
  await p.getByRole('button', { name: 'Fler saker med passet' }).click()
  await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click()
}
async function home(p) {
  await p.goto(p.base); await p.waitForTimeout(700)
  if (await p.locator('.builder').count()) await p.getByRole('button', { name: /Tillbaka|Hem/ }).first().click()
}
async function toBuilder(p) { if (!(await p.locator('.builder').count())) await p.getByRole('button', { name: /Fortsätt/ }).first().click(); await p.locator('.builder').waitFor() }
async function openFromHome(p) {
  await home(p)
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).first().click()
  await p.locator('.side-panel-slot.is-open').waitFor()
}
async function openHall(p) {
  await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').waitFor(); await p.waitForTimeout(500)
}
async function backToBuilder(p) {
  const done = p.getByRole('button', { name: /^← Tillbaka till Passbyggaren$/ }).first()
  if (await done.count()) await done.click(); else await p.goBack()
  await p.locator('.builder').waitFor()
}
const canvasChips = (p) => p.locator('.hall-canvas .hall-chip--canvas')
const chipTexts = async (p) => (await canvasChips(p).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim())
const trayCount = async (p) => {
  const exp = p.getByRole('button', { name: 'Visa brickan med ej placerade stationer' })
  if (await exp.count()) { await exp.first().click(); await p.waitForTimeout(200) }
  return p.locator('.hall-tray-list .hall-chip').count()
}
async function applyBuiltIn(p, idx = 0) {
  await openFromHome(p)
  const card = p.locator('.side-panel-slot.is-open .template-list').last().locator('.template-card').nth(idx)
  const title = (await card.locator('strong').first().innerText()).trim()
  await card.click()
  await confirmDlg(p).getByRole('button', { name: 'Använd mall', exact: true }).click()
  await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  return title
}
// Golvklart + Förrådslista from inside Hallöversikt.
async function golvklartAndForrad(p, tag) {
  const r = {}
  r.saknar = (await p.locator('.hall-saknar-banner, [class*=saknar-banner]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ')
  r.applyAllBtn = (await p.locator('button.hall-tap-target').filter({ hasText: /^Använd alla förslag$/ }).count())
  await p.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click()
  await p.waitForTimeout(500)
  const sheet = p.locator('[role=dialog]').filter({ hasText: 'Förrådslista' }).last()
  r.forradText = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 600)
  r.forradRows = await p.locator('.forradslista-row').allTextContents()
  await p.screenshot({ path: `${SS}${tag}_forradslista.png` })
  await p.getByRole('button', { name: 'Stäng förrådslista' }).first().click().catch(() => p.keyboard.press('Escape'))
  await p.waitForTimeout(300)
  await p.getByRole('button', { name: /^Golvklart$/ }).first().click()
  await p.waitForTimeout(600)
  r.floorChips = await canvasChips(p).count()
  r.floorTexts = await chipTexts(p)
  r.floorRemoveBtns = await p.locator('.hall-canvas').getByRole('button', { name: /Ta bort från hall/ }).count()
  r.caption = await p.getByText('Schematisk hall — inte exakt mått').count()
  await p.screenshot({ path: `${SS}${tag}_golvklart.png` })
  await p.getByRole('button', { name: /Avsluta golvklart/ }).first().click()
  await p.waitForTimeout(300)
  return r
}

sql('delete from public.club_templates')

// ═══ A. Built-in mall (Home «Starta från mall») ═══
const pA = await newPage(ON)
let builtD, builtTitle
await attempt('A', 'built-in', async () => {
  await pA.goto(ON); await pA.waitForTimeout(600)
  builtTitle = await applyBuiltIn(pA, 0)
  const memDraft = await draft(pA)
  notes.builtInAutoSaved = !!memDraft
  // Reload WITHOUT saving: is the pass kept? (pre-existing behaviour, compared on main below)
  await pA.reload(); await pA.waitForTimeout(600)
  notes.builtInReloadNoSave = (await draft(pA)) ? 'draft present' : 'no draft (pass lost on reload unless saved)'
  builtTitle = await applyBuiltIn(pA, 0)
  check('A0', `Built-in «${builtTitle}» apply: no toast`, (await toast(pA).count()) === 0)
  await saveUi(pA)
  builtD = await draft(pA); dump('builtin', builtD)
  check('A1', 'Built-in: one marker per Teknik item before Hallöversikt is opened', teknik(builtD).length >= 1 && JSON.stringify(placedIds(builtD)) === JSON.stringify(teknik(builtD)), `${placedIds(builtD).length}/${teknik(builtD).length}; blocks ${types(builtD)}`)
  check('A4', 'Built-in: no Samling/Uppvärmning/Styrka/Lek marker; hall = standard-trupp', nonTeknikPlaced(builtD) === 0 && builtD.hallTemplateId === 'standard-trupp', builtD.hallTemplateId)
  check('A5', 'Built-in: no station redskap saved (Använd alla förslag not run); no «Sparade redskap» toast seen', noRedskapSaved(builtD) && (await pA.evaluate(() => window.__s37.applyAllToast)) === 0)
  check('A6', 'Built-in: no stacked chips; all inside hall', noStack(builtD) && inBounds(builtD))
  await pA.screenshot({ path: `${SS}01_builtin_applied_builder.png` })
  const before = JSON.stringify(builtD.hallPlacements)
  await pA.reload(); await pA.waitForTimeout(600)
  check('A8', 'Built-in: placements survive reload (after «Spara utkast»)', JSON.stringify((await draft(pA)).hallPlacements) === before)
  await toBuilder(pA)
  await openHall(pA)
  const n = await canvasChips(pA).count()
  const texts = await chipTexts(pA)
  const titles = items(builtD).filter((i) => i.type !== 'techniques').map((i) => i.activityId)
  check('A1b', 'Hallöversikt: canvas chips = Teknik count, tray empty, draft unchanged by opening', n === teknik(builtD).length && (await trayCount(pA)) === 0 && JSON.stringify((await draft(pA)).hallPlacements) === before, `canvas ${n}, tray ${await trayCount(pA)}; ${texts.join(' / ')}`)
  notes.builtInNonTeknik = titles
  await pA.screenshot({ path: `${SS}02_builtin_hall.png` })
  // AC5 + 7: Golvklart / Förrådslista on the branch
  notes.branchBuiltIn = await golvklartAndForrad(pA, '03_builtin')
  const g = notes.branchBuiltIn
  check('G1', 'Golvklart after auto-placed built-in: one chip per Teknik, no remove buttons, caption kept', g.floorChips === teknik(builtD).length && g.floorRemoveBtns === 0 && g.caption > 0, JSON.stringify({ chips: g.floorChips, rm: g.floorRemoveBtns, cap: g.caption }))
  check('G2', 'Förrådslista after apply: redskap still unsaved → «osparade förslag» point, Använd alla förslag still offered', /osparade förslag/.test(g.forradText) && g.applyAllBtn >= 1, g.forradText.slice(0, 200))
  check('A5b', 'Still no redskap saved after opening Hallöversikt/Golvklart/Förrådslista', noRedskapSaved(await draft(pA)) && (await pA.evaluate(() => window.__s37.applyAllToast)) === 0)
  // Now the coach presses Använd alla förslag by hand → Förrådslista totals = sum of saved redskap; Golvklart unchanged
  await pA.locator('button.hall-tap-target').filter({ hasText: /^Använd alla förslag$/ }).first().click()
  await pA.waitForTimeout(500)
  const dd = await draft(pA)
  const sum = {}
  for (const it of items(dd)) for (const s of it.stationEquipment ?? []) sum[s.pieceId] = (sum[s.pieceId] ?? 0) + s.count
  notes.branchAfterApplyAll = await golvklartAndForrad(pA, '04_builtin_after_applyall')
  const rows = notes.branchAfterApplyAll.forradRows
  const rowCount = rows.reduce((n, r) => n + (Number((r.match(/^(\d+)×/) ?? [0, 1])[1])), 0)
  const sumCount = Object.values(sum).reduce((a, b) => a + b, 0)
  check('G3', 'Manual Använd alla förslag → Förrådslista rows = sum of saved station redskap; Golvklart chips unchanged', rows.length === Object.keys(sum).length && rowCount === sumCount && notes.branchAfterApplyAll.floorChips === teknik(builtD).length && JSON.stringify(dd.hallPlacements) === before, `rows ${rows.join(' · ')} | pieces ${JSON.stringify(sum)}`)
  await backToBuilder(pA)
})

// ═══ A-main: same built-in mall on main (c6a11d5) — AC5 "as before", AC6 wizard-equal zones ═══
const pM = await newPage(MAIN)
await attempt('M', 'main built-in compare', async () => {
  await pM.goto(MAIN); await pM.waitForTimeout(600)
  const t = await applyBuiltIn(pM, 0)
  notes.mainBuiltInAutoSaved = !!(await draft(pM))
  await saveUi(pM)
  const d0 = await draft(pM)
  check('M0', `Main «${t}»: no placements on apply (the gap this slice closes)`, t === builtTitle && (d0.hallPlacements ?? []).length === 0)
  await openHall(pM)
  const dm = await draft(pM); dump('main_builtin_after_hall', dm)
  const g = await golvklartAndForrad(pM, '05_main_builtin')
  notes.mainBuiltIn = g
  const b = notes.branchBuiltIn
  const zones = (d) => { const m = {}; for (const it of items(d)) { const pl = (d.hallPlacements ?? []).find((x) => x.sessionItemId === it.id); if (pl) m[it.activityId + '#' + it.order] = `${pl.zoneId}@${pl.x.toFixed(4)},${pl.y.toFixed(4)}` } return m }
  check('M6', 'AC6: branch apply-time spots = main\'s Hallöversikt-fallback spots (same helper) for the same mall', JSON.stringify(zones(dm)) === JSON.stringify(zones(builtD)), JSON.stringify(zones(builtD)))
  check('M5', 'AC5: saknar-banner and Förrådslista text identical to main', b && g.saknar === b.saknar && g.forradText === b.forradText && JSON.stringify(g.forradRows) === JSON.stringify(b.forradRows), `main «${g.saknar}» / branch «${b?.saknar}»`)
  check('M7', 'Golvklart identical to main (chip texts)', b && JSON.stringify(g.floorTexts) === JSON.stringify(b.floorTexts), g.floorTexts.join(' / '))
})
// Main: does a built-in apply survive reload without «Spara utkast»? (to classify AC8 for built-in)
await attempt('M8', 'main reload', async () => {
  await pM.evaluate((k) => localStorage.removeItem(k), DRAFT)
  await applyBuiltIn(pM, 0)
  await pM.reload(); await pM.waitForTimeout(600)
  notes.mainBuiltInReloadNoSave = (await draft(pM)) ? 'draft present' : 'no draft (pass lost on reload unless saved)'
  check('A8b', 'Built-in reload-without-save behaviour same on main and branch (pre-existing)', notes.mainBuiltInReloadNoSave === notes.builtInReloadNoSave, `main: ${notes.mainBuiltInReloadNoSave} / branch: ${notes.builtInReloadNoSave}`)
})

// ═══ C. Föreningsmall: club mall with ≥ 2 Teknik incl. «Hjul» (no redskap at all, AC10), hall forening-bla ═══
let clubD
const pC = await newPage(ON)
await attempt('C', 'club', async () => {
  const src = builtD
  const tekBlock = src.blocks.find((b) => b.type === 'techniques')
  const blocks = src.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) }))
  const tb = blocks.find((b) => b.type === 'techniques')
  tb.items.push({ id: 'club-hjul', activityId: 'tech-hjul', durationMinutes: 5, note: '', order: tekBlock.items.length })
  const payload = { v: 1, title: 'V37 klubbmall', notes: '', blocks, hallTemplateId: 'forening-bla' }
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V37 klubbmall', ${Math.max(1, src.totalMinutes)}, '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb)`)
  await pC.goto(ON); await pC.waitForTimeout(900)
  await openFromHome(pC)
  await pC.locator('section.club-templates .template-card').filter({ hasText: 'V37 klubbmall' }).first().click()
  const dlg = confirmDlg(pC); await dlg.waitFor()
  check('C9a', 'Club confirm: no «Stationerna placerar du själv i Hallöversikt.»', !(await dlg.innerText()).includes('Stationerna placerar du själv'))
  await pC.screenshot({ path: `${SS}06_club_confirm.png` })
  await dlg.getByRole('button', { name: 'Använd mall', exact: true }).click()
  await toast(pC).waitFor()
  const tt = (await toast(pC).innerText()).trim()
  check('C9b', 'Club toast exactly «Mallen är i Passbyggaren.»', tt === 'Mallen är i Passbyggaren.', tt)
  await pC.screenshot({ path: `${SS}07_club_applied_toast.png` })
  const t0 = Date.now(); await toast(pC).waitFor({ state: 'detached', timeout: 6000 })
  notes.clubToastMs = Date.now() - t0
  clubD = await draft(pC); dump('club', clubD)
  const hj = items(clubD).find((i) => i.activityId === 'tech-hjul')
  check('C2', 'Club: all Teknik (≥ 2) placed on apply, hall = forening-bla (the mall\'s), only Teknik', teknik(clubD).length >= 2 && JSON.stringify(placedIds(clubD)) === JSON.stringify(teknik(clubD)) && nonTeknikPlaced(clubD) === 0 && clubD.hallTemplateId === 'forening-bla', `${placedIds(clubD).length}/${teknik(clubD).length} ${clubD.hallTemplateId}; blocks ${types(clubD)}`)
  check('C5', 'Club: no redskap saved; no «Sparade redskap» toast', noRedskapSaved(clubD) && (await pC.evaluate(() => window.__s37.applyAllToast)) === 0)
  check('C6', 'Club (Blå hall, only an «open» zone): no stacking, in bounds [known: helper stacks when the preset lacks the zone; main identical, see helper-parity.ts]', noStack(clubD) && inBounds(clubD), JSON.stringify(clubD.hallPlacements.map((x) => [x.zoneId, +x.x.toFixed(4), +x.y.toFixed(4)])))
  const hjPl = (clubD.hallPlacements ?? []).find((x) => x.sessionItemId === hj?.id)
  check('C10', 'AC10: «Hjul» (no redskap, no förslag) placed like the helper does (tag floor → open), no error', !!hjPl && hjPl.zoneId === 'open' && pC.errors.length === 0, JSON.stringify(hjPl))
  check('C11', 'Club row in local DB still has no hallPlacements', sql(`select bool_and(not (payload ? 'hallPlacements')) from public.club_templates`) === 't')
  const pl = JSON.stringify(clubD.hallPlacements)
  await pC.reload(); await pC.waitForTimeout(600)
  check('C8', 'Club: placements survive reload', JSON.stringify((await draft(pC)).hallPlacements) === pl)
  await toBuilder(pC)
  await openHall(pC)
  const alerts = await pC.locator('[role=alert]').allInnerTexts()
  check('C10b', 'AC10: Hallöversikt shows all chips incl. Hjul, no alert/message', (await canvasChips(pC).count()) === teknik(clubD).length && alerts.join('').trim() === '' && (await trayCount(pC)) === 0, `chips ${await canvasChips(pC).count()}, alerts ${JSON.stringify(alerts)}`)
  await pC.screenshot({ path: `${SS}08_club_hall_forening_bla.png` })
  notes.clubGF = await golvklartAndForrad(pC, '09_club')
  const g = notes.clubGF
  check('C10c', 'AC10: Golvklart shows Hjul station; Förrådslista opens without error', g.floorChips === teknik(clubD).length && g.floorTexts.some((t) => /Hjul/.test(t)) && pC.errors.length === 0, g.forradText.slice(0, 160))
  // AC7 on the club pass: drag a marker, remove one, Placera här, reopen
  const before = await draft(pC)
  const chip = canvasChips(pC).last()
  const canvas = pC.locator('.hall-canvas')
  const box = await canvas.boundingBox()
  // Headless Chrome does not run native HTML5 drag from mouse/touch input; the chip's real dragstart → canvas dragover/drop
  // handlers are driven with one DataTransfer (Playwright dispatchEvent). Real finger drag = PENDING-real.
  const dt = await pC.evaluateHandle(() => new DataTransfer())
  const X = box.x + box.width * 0.15, Y = box.y + box.height * 0.85
  await chip.dispatchEvent('dragstart', { dataTransfer: dt })
  await canvas.dispatchEvent('dragover', { dataTransfer: dt, clientX: X, clientY: Y })
  await canvas.dispatchEvent('drop', { dataTransfer: dt, clientX: X, clientY: Y })
  await chip.dispatchEvent('dragend', { dataTransfer: dt })
  await pC.waitForTimeout(400)
  const afterDrag = await draft(pC)
  const moved = afterDrag.hallPlacements.filter((x) => { const b = before.hallPlacements.find((y) => y.sessionItemId === x.sessionItemId); return b && (b.x !== x.x || b.y !== x.y) })
  check('C7a', 'Drag an auto-placed marker → it moves (1 placement changed), others untouched', moved.length === 1, JSON.stringify(moved))
  await pC.screenshot({ path: `${SS}10_club_after_drag.png` })
  const n0 = await canvasChips(pC).count()
  await canvasChips(pC).last().getByRole('button', { name: /Ta bort från hall/ }).click()
  await pC.waitForTimeout(300)
  const afterRm = await draft(pC)
  check('C7b', 'Remove one marker → back in tray, draft has one placement fewer', (await canvasChips(pC).count()) === n0 - 1 && (await trayCount(pC)) === 1 && afterRm.hallPlacements.length === n0 - 1)
  await pC.screenshot({ path: `${SS}11_club_removed_in_tray.png` })
  await backToBuilder(pC); await openHall(pC)
  check('C7c', 'Reopen Hallöversikt: the removed marker does not come back', (await canvasChips(pC).count()) === n0 - 1 && (await trayCount(pC)) === 1)
  await pC.reload(); await pC.waitForTimeout(600); await toBuilder(pC); await openHall(pC)
  check('C7d', 'Reload + reopen: still removed', (await canvasChips(pC).count()) === n0 - 1)
  // Placera här (narrow): tap tray chip, tap canvas
  await trayCount(pC)
  await pC.locator('.hall-tray-list .hall-chip').first().click()
  await pC.waitForTimeout(200)
  const hint = await pC.locator('.hall-place-mode-hint').count()
  // R2 (Slice 40 re-verify): tap a free spot of the hall, never a marker (the Slice 40 grid fills the top row).
  await canvas.evaluate((e) => e.scrollIntoView({ block: 'center' })); await pC.waitForTimeout(150)
  const cb = await canvas.boundingBox()
  const free = await canvas.evaluate((cv) => {
    const r = cv.getBoundingClientRect()
    for (const fy of [0.3, 0.5, 0.7, 0.85, 0.15]) for (const fx of [0.5, 0.3, 0.7, 0.85, 0.15]) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy
      const hit = [-30, 0, 30].every((dx) => [-30, 0, 30].every((dy) => { const el = document.elementFromPoint(x + dx, y + dy); return el && cv.contains(el) && !el.closest('.hall-chip, button') }))
      if (hit) return { x: r.width * fx, y: r.height * fy }
    }
    return { x: r.width * 0.5, y: r.height * 0.85 }
  })
  await canvas.click({ position: free })
  await pC.waitForTimeout(400)
  check('C7e', '«Placera här»: tap tray chip → hint shown → tap hall → placed again ("undo" path; the app has no Ångra control)', hint === 1 && (await canvasChips(pC).count()) === n0 && (await draft(pC)).hallPlacements.length === n0)
  const hallBtns = (await pC.locator('button:visible').allInnerTexts()).map((t) => t.trim()).filter(Boolean)
  notes.hallButtonsBranch = hallBtns
  await pC.screenshot({ path: `${SS}12_club_placera_har.png` })
})

// ═══ E. Egen mall: with placements (one moved to an exact spot, one removed) + non-default hall; and without placements ═══
const pE = await newPage(ON)
await attempt('E', 'egen', async () => {
  await pE.goto(ON); await pE.waitForTimeout(600)
  await applyBuiltIn(pE, 0)
  await saveUi(pE)
  await menu(pE, 'Spara som egen mall')
  await pE.locator('.modal-backdrop[role=dialog] input').first().fill('V37 egen')
  await pE.locator('.modal-backdrop[role=dialog] button[type=submit]').click()
  await pE.waitForTimeout(2600)
  const info = await pE.evaluate((k) => {
    const list = JSON.parse(localStorage.getItem(k)); const t = list.find((x) => x.title === 'V37 egen') ?? list[0]
    const pl = t.pass.hallPlacements
    pl[0] = { ...pl[0], x: 0.123, y: 0.456 }        // the coach's own spot (preassigned Teknik)
    const dropped = pl.pop().sessionItemId          // unplaced in the mall
    t.pass.hallTemplateId = 'forening-vit'           // the mall carries a different hall
    // add «Hjul» (no redskap) unplaced, AC10 on the Egen path
    const tb = t.pass.blocks.find((b) => b.type === 'techniques')
    tb.items.push({ id: 'egen-hjul', activityId: 'tech-hjul', durationMinutes: 5, note: '', order: tb.items.length })
    const bare = JSON.parse(JSON.stringify(t)); bare.id = t.id + '-bare'; bare.title = 'V37 egen utan placering'; bare.pass.hallPlacements = []; bare.pass.hallTemplateId = 'standard-trupp'
    list.push(bare); localStorage.setItem(k, JSON.stringify(list))
    return { keepId: pl[0].sessionItemId, dropped, saved: JSON.stringify(pl) }
  }, SAVED)
  await pE.reload(); await pE.waitForTimeout(600); await toBuilder(pE)
  await menu(pE, 'Använd mall'); await pE.locator('.side-panel-slot.is-open').waitFor()
  await pE.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: /^V37 egen(?! utan)/ }).first().click()
    .catch(async () => pE.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: 'V37 egen' }).first().click())
  await confirmDlg(pE).getByRole('button', { name: 'Använd mall', exact: true }).click()
  await pE.waitForTimeout(500)
  check('E9', 'Egen mall apply: no toast', (await toast(pE).count()) === 0)
  const d = await draft(pE); dump('egen_with', d)
  const savedPl = JSON.parse(info.saved)
  const keptAll = savedPl.every((s) => d.hallPlacements.some((x) => x.sessionItemId === s.sessionItemId && x.x === s.x && x.y === s.y && x.zoneId === s.zoneId))
  const exact = d.hallPlacements.find((x) => x.sessionItemId === info.keepId)
  check('E3a', 'Egen with placements: every saved marker keeps its exact spot (incl. 0.123/0.456); only the unplaced Teknik (incl. Hjul) got new ones', keptAll && exact?.x === 0.123 && exact?.y === 0.456 && JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && d.hallPlacements.length === savedPl.length + 2 && nonTeknikPlaced(d) === 0, `saved ${savedPl.length}, now ${d.hallPlacements.length}/${teknik(d).length}`)
  check('E4', 'Egen: hall template kept from the mall (forening-vit)', d.hallTemplateId === 'forening-vit', d.hallTemplateId)
  check('E5', 'Egen: no redskap saved; no «Sparade redskap» toast; no stacking', noRedskapSaved(d) && (await pE.evaluate(() => window.__s37.applyAllToast)) === 0 && noStack(d) && inBounds(d))
  const hj = items(d).find((i) => i.activityId === 'tech-hjul')
  check('E10', 'AC10 Egen: Hjul placed (open), no error', d.hallPlacements.some((x) => x.sessionItemId === hj.id && x.zoneId === 'open') && pE.errors.length === 0)
  const pl = JSON.stringify(d.hallPlacements)
  await pE.reload(); await pE.waitForTimeout(600)
  check('E8', 'Egen: placements survive reload', JSON.stringify((await draft(pE)).hallPlacements) === pl)
  await toBuilder(pE); await openHall(pE)
  await pE.screenshot({ path: `${SS}13_egen_hall_forening_vit.png` })
  notes.egenGF = await golvklartAndForrad(pE, '14_egen')
  check('E-G', 'Egen: Golvklart chips = Teknik count', notes.egenGF.floorChips === teknik(d).length)
  await backToBuilder(pE)
  await menu(pE, 'Använd mall'); await pE.locator('.side-panel-slot.is-open').waitFor()
  await pE.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: 'V37 egen utan placering' }).first().click()
  await confirmDlg(pE).getByRole('button', { name: 'Använd mall', exact: true }).click()
  await pE.waitForTimeout(500)
  const d2 = await draft(pE); dump('egen_without', d2)
  check('E3b', 'Egen without placements: all Teknik placed, nothing else, standard-trupp kept', JSON.stringify(placedIds(d2)) === JSON.stringify(teknik(d2)) && nonTeknikPlaced(d2) === 0 && noStack(d2) && d2.hallTemplateId === 'standard-trupp')
})

// ═══ F. Footer / Tyck till, Planera pass, Tomt pass, plain build ═══
await attempt('F', 'footer + earlier flows', async () => {
  const foot = (await pE.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  const href = await pE.locator('footer a.footer-feedback').getAttribute('href')
  check('F12', 'Footer «Träningsplaneraren · Slice 37»; mail ends «Version: Slice 37»', foot.includes('Träningsplaneraren · Slice 37') && decodeURIComponent(href.split('body=')[1]).trimEnd().endsWith('Version: Slice 37'), foot)
  await pE.evaluate((k) => localStorage.removeItem(k), DRAFT)
  await home(pE)
  await pE.getByRole('button', { name: 'Planera pass' }).click()
  const wz = pE.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await pE.locator('.builder').waitFor()
  const w = await draft(pE); dump('wizard', w)
  check('F14a', 'Planera pass still places all Teknik', teknik(w).length > 0 && JSON.stringify(placedIds(w)) === JSON.stringify(teknik(w)))
  await pE.evaluate((k) => localStorage.removeItem(k), DRAFT)
  await home(pE); await pE.getByRole('button', { name: 'Tomt pass' }).click(); await pE.locator('.builder').waitFor()
  await saveUi(pE)
  check('F14b', 'Tomt pass: empty hall (Slice 39 E1: an untouched Tomt pass is not written, so no draft = empty)', ((await draft(pE))?.hallPlacements ?? []).length === 0)
  check('F22', '390 wide: no horizontal scroll', (await pE.evaluate(() => document.documentElement.scrollWidth)) <= 390)
})
const pP = await newPage(PLAIN)
await attempt('P', 'plain build', async () => {
  await pP.goto(PLAIN); await pP.waitForTimeout(600)
  const t = await applyBuiltIn(pP, 0)
  await saveUi(pP)
  const d = await draft(pP)
  check('P1', `Plain build (no bank): built-in «${t}» also auto-places Teknik only`, JSON.stringify(placedIds(d)) === JSON.stringify(teknik(d)) && nonTeknikPlaced(d) === 0)
})
const allErr = [...pA.errors, ...pM.errors, ...pC.errors, ...pE.errors, ...pP.errors]
check('errors', 'No page errors (all pages)', allErr.length === 0, allErr.join(' | '))
await browser.close()
const pass = results.filter((r) => r.ok).length
writeFileSync(`${OUT}/slice-37-verify-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes }, null, 2))
console.log(`\n${pass}/${results.length} pass`)
console.log(JSON.stringify(notes, null, 1).slice(0, 4000))

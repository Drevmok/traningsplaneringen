// Slice 45 — Builder self-smoke «Hallar och städning» (A1 B1 C1 D1 E1 F1 F3). 390×844, DPR 2, touch.
// Branch preview on :4545, main 4fe44c0 on :4510 (old #dela= link + baseline sizes).
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { openMallList, openWizard, startMall, startTomt } from './tools/smoke-start.mjs'
import { sliceNumber } from './tools/smoke-login.mjs'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = process.env.S45_BR ?? 'http://127.0.0.1:4545/traningsplaneringen/'
const MAIN = process.env.S45_MAIN ?? 'http://127.0.0.1:4510/traningsplaneringen/'
const ROOT = process.env.S45_ROOT ?? '/workspace/gp-s45'
const SLICE = sliceNumber(ROOT) // Slice 51: footer follows SLICE_NUMBER
const SHOTS = `${ROOT}/verifier/slice-45-screenshots`
const DRAFT = 'gymnastics-planner-draft-v1'
const TPL = 'gymnastics-planner-templates-v1'
const STORA = 'Gymmix – Stora hallen', GROP = 'Gymmix – Grophallen'
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0] + ' @' + ((e.stack || '').match(/smoke\.mjs:(\d+)/) || [])[1]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page({ vp = { width: 390, height: 844 }, print = 'webkit', clipboard = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, permissions: clipboard ? ['clipboard-read', 'clipboard-write'] : [] })
  await ctx.addInitScript(([m, clip]) => {
    window.__prints = 0
    window.print = () => { window.__prints++; if (m === 'dead') return; window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) }
    if (!clip) document.execCommand = () => false
    if (!clip) Object.defineProperty(navigator, 'clipboard', { configurable: true, get: () => ({ writeText: () => Promise.reject(new Error('blocked')), readText: () => Promise.reject(new Error('blocked')) }) })
  }, [print, clipboard])
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const shot = (p, n, full = false) => p.screenshot({ path: `${SHOTS}/slice45_${n}.png`, fullPage: full })
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left) } }, sel)
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
async function home(p, base = BR) { await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function mall(p, base = BR) {
  await home(p, base)
  await startMall(p, /Nybörjare/) // Slice 51 (A1): «Planera pass» → «Starta från mall» → Hall → Nybörjare (smoke-start.mjs)
  await p.waitForTimeout(600)
}
// the mall «Ångra» toast (Slice 41) can sit over the lower menu rows for ~5 s; dispatch the tap on the row itself
async function menu(p, name) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  const direct = p.locator('.builder-actions > button:visible, .builder-extra > button:visible').filter({ hasText: new RegExp(`^${name}$`) }) // Slice 51: header actions since Slice 46
  if (await direct.count()) { await direct.first().dispatchEvent('click'); return }
  if (!(await mer.isVisible())) { await p.locator('button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click'); return } // ≥ 769 px: actions inline
  await mer.click(); await p.locator('.more-menu-panel button').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click') }
async function hall(p) { await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
const teknikIds = (d) => d.blocks.find((b) => b.type === 'techniques').items.slice().sort((a, b) => a.order - b.order).map((i) => i.id)
const sheet = (p) => p.locator('.export-sheet')
const footerOk = async (p) => (await p.locator('body').innerText()).includes(`Träningsplaneraren · Slice ${SLICE}`)

let gridRef = null // placements of a fresh Nybörjare pass on Stora hallen (Slice 40 grid, pass order)

await attempt('wizard', async () => {
  const p = await page(); await home(p)
  await openWizard(p) // Slice 51: question path, one tap per answer (Ålder → Fokus → Hall → Passlängd)
  await p.getByRole('option').first().click(); await p.waitForTimeout(200)
  const t2 = await p.locator('.home-wizard-sheet').innerText()
  await shot(p, '01_wizard_q2')
  await p.getByRole('option', { name: 'Trampett' }).click(); await p.waitForTimeout(200)
  const title = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  const opts = (await p.getByRole('option').allInnerTexts()).map((s) => s.trim())
  const t3 = await p.locator('.home-wizard-sheet').innerText()
  const wiz = await rect(p, '.home-wizard-sheet')
  await shot(p, '02_wizard_q3_hall')
  check('AC1', 'Q3 titled «Hall» with exactly the two Gymmix chips (en dash)', title === 'Hall' && JSON.stringify(opts) === JSON.stringify([STORA, GROP]), `${title} | ${opts.join(' | ')}`)
  const bad = (t) => /Stationerna är förslag|Välj den layout/.test(t)
  check('AC2-texts', 'Q2 and Q3 show no «Stationerna är förslag…» / «Välj den layout…» line', !bad(t2) && !bad(t3))
  await p.getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(150)
  const backTitle = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  await p.getByRole('option', { name: 'Trampett' }).click(); await p.waitForTimeout(150)
  await p.getByRole('option', { name: GROP }).click(); await p.waitForTimeout(150)
  await p.getByRole('option', { name: '60 min', exact: true }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(600)
  const d = await draft(p)
  check('AC18-footer', `footer «Träningsplaneraren · Slice ${SLICE}» (Passbyggaren)`, await footerOk(p))
  check('AC2-nav', 'Tillbaka → Fokus, Trampett → Hall, Grophallen → Passlängd → Passbyggaren on Grophallen', backTitle === 'Fokus' && d.hallTemplateId === 'forening-vit', `${backTitle} ${d.hallTemplateId}`)
  await hall(p)
  const meta = await p.locator('.hall-session-meta').innerText()
  const vb = await p.locator('.hall-canvas svg').first().getAttribute('viewBox').catch(() => null)
  const gTop = await rect(p, '.hall-canvas'); const gBanner = await p.locator('.hall-saknar-banner').count()
  check('AC5-wizardpass', 'Grophallen pass: hall canvas top ≤ 310 when no saknar-redskap banner', gBanner > 0 || gTop.top <= 310, `top=${gTop.top} banner=${gBanner}`)
  await shot(p, '03_hall_grophallen')
  await p.getByRole('button', { name: 'Golvklart' }).first().click(); await p.waitForTimeout(500)
  const gmeta = await p.locator('.hall-session-meta').innerText()
  await shot(p, '04_golvklart_grophallen')
  check('AC3', 'Grophallen pass: Hallöversikt and Golvklart meta show «Gymmix – Grophallen»', meta.includes(GROP) && gmeta.includes(GROP), `${meta.replace(/\n/g, ' ')} || ${gmeta.replace(/\n/g, ' ')} vb=${vb}`)
  check('AC14-wizard', 'wizard sheet keeps its own style (no compact class)', wiz && (await p.locator('.home-wizard-sheet.modal--compact').count()) === 0, JSON.stringify(wiz))
})

await attempt('tomt+mall', async () => {
  const p = await page(); await home(p)
  await startTomt(p); await p.waitForTimeout(150) // Slice 51 (A1)
  const dt = await draft(p)
  await mall(p)
  await hall(p)
  const d = await draft(p)
  const meta = await p.locator('.hall-session-meta').innerText()
  const ids = teknikIds(d)
  const pl = d.hallPlacements
  gridRef = pl
  check('AC4', 'Tomt pass and Från mall → Nybörjare on Stora hallen; every Teknik marker on the grid in pass order', (dt?.hallTemplateId ?? 'forening-bla') === 'forening-bla' && d.hallTemplateId === 'forening-bla' && meta.includes(STORA) && pl.length === ids.length && pl.every((x) => x.zoneId === 'open') && JSON.stringify(pl.map((x) => x.sessionItemId)) === JSON.stringify(ids), `tomt=${dt?.hallTemplateId} mall=${d.hallTemplateId} n=${pl.length}/${ids.length}`)
  const zoom = await p.evaluate(() => [...document.querySelectorAll('.hall-zoom-bar button')].map((b) => { const r = b.getBoundingClientRect(); return [b.getAttribute('aria-label') || b.textContent, Math.round(r.width), Math.round(r.height)] }))
  const canvas = await rect(p, '.hall-canvas')
  const mp = await page(); await mall(mp, MAIN); await hall(mp); const mainCanvas = await rect(mp, '.hall-canvas'); await mp.context().close()
  const txt = await p.locator('.hall-board, body').first().innerText()
  check('AC5', 'no «Hallayout» label / select; zoom − / + ≥ 44×44; canvas top ≤ 310', (await p.locator('select, #hall-layout-select').count()) === 0 && !/Hallayout/.test(txt) && zoom.length === 2 && zoom.every((z) => z[1] >= 44 && z[2] >= 44) && canvas.top <= mainCanvas.top && (canvas.top <= 310 || (await p.locator('.hall-saknar-banner').count()) > 0), `zoom=${JSON.stringify(zoom)} canvasTop=${canvas.top} main=${mainCanvas.top} (saknar banner above the hall on both: ${await p.locator('.hall-saknar-banner').count()})`)
  const below = (await p.locator('.hall-below').innerText().catch(() => '')).trim()
  const note = await p.locator('.hall-schematic-note').innerText()
  const bannedHall = /Tips om placering|Placerade övningar flyttas|Blå hall och Vit hall|Stationsordning följer passet|Stationerna visas som markörer|Endast Teknik/
  check('AC6', 'under the hall only the caption + flow tip about the numbers', note === 'Schematisk hall — inte exakt mått' && below.startsWith('Siffrorna följer Teknik-stationernas ordning') && !bannedHall.test(await p.locator('body').innerText()), below.slice(0, 120))
  await shot(p, '05_hall_stora_hallen', true)
  // dismiss the flow tip
  const x = p.locator('.hall-below .coach-tip-strip button').first()
  if (await x.count()) { await x.click(); await p.waitForTimeout(200) }
  check('AC6-dismiss', 'flow tip dismissable → nothing left under the hall but the caption', (await p.locator('.hall-below').innerText().catch(() => '')).trim() === '')
  // tray: remove a marker, expand, place again
  const rm = p.locator('.hall-canvas .hall-chip-remove').first()
  let removed = false
  if (await rm.count()) { await rm.click({ force: true }); removed = true }
  await p.waitForTimeout(300)
  const exp = p.getByRole('button', { name: /Visa (stationsbricka|brickan)/ }).first(); if (await exp.count()) await exp.click()
  await p.waitForTimeout(300)
  const trayText = await p.locator('.hall-tray').innerText()
  await shot(p, '06_tray_expanded')
  const nAfterRemove = (await draft(p)).hallPlacements.length
  const bannedTray = /Förslagen ligger redan|Släpp på en zon|Stationerna föreslås i zonen/
  await p.locator('.hall-tray .hall-chip, .hall-tray [data-item-id], .hall-tray li button').first().click().catch(() => {})
  await p.waitForTimeout(200)
  const box = await rect(p, '.hall-canvas')
  await p.mouse.click(box.left + box.w * 0.3, box.top + box.h * 0.5); await p.waitForTimeout(300)
  const ph = p.getByRole('button', { name: 'Placera här' }); if (await ph.count()) { await ph.first().click().catch(() => {}); await p.waitForTimeout(300) }
  const nAfterPlace = (await draft(p)).hallPlacements.length
  check('AC7', 'expanded tray has no drag/snap hint or «Stationerna föreslås i zonen…»; remove + Placera här still work', !bannedTray.test(trayText) && removed && nAfterRemove === pl.length - 1 && nAfterPlace === pl.length, `removed=${removed} ${pl.length}→${nAfterRemove}→${nAfterPlace} tray="${trayText.replace(/\n/g, ' ').slice(0, 120)}"`)
  await shot(p, '07_after_place')
})

const legacyDraft = async (p, id, extra = {}) => {
  await mall(p)
  const d = await draft(p)
  const ids = teknikIds(d)
  const legacy = { ...d, ...extra, hallPlacements: ids.map((sid, i) => ({ sessionItemId: sid, x: 0.02 + 0.01 * i, y: 0.03, zoneId: 'trampett' })) }
  if (id === undefined) delete legacy.hallTemplateId; else legacy.hallTemplateId = id
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [DRAFT, legacy])
  await p.goto(BR); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Fortsätt passet' }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await hall(p)
  return { ids, after: await draft(p), meta: await p.locator('.hall-session-meta').innerText() }
}
for (const [ac, id] of [['AC8', 'standard-trupp'], ['AC9-tavling', 'tavling-linjer'], ['AC9-liten', 'liten-hall'], ['AC9-generic', 'generic-trupp'], ['AC9-none', undefined]]) {
  await attempt(ac, async () => {
    const p = await page()
    const { ids, after, meta } = await legacyDraft(p, id)
    const pl = after.hallPlacements
    // same cells, same order as a fresh Nybörjare pass on Stora hallen (item ids differ per clone), and in pass order
    const sameGrid = gridRef && JSON.stringify(pl.map((x) => [x.x, x.y])) === JSON.stringify(gridRef.map((x) => [x.x, x.y])) && JSON.stringify(pl.map((x) => x.sessionItemId)) === JSON.stringify(ids)
    if (ac === 'AC8') await shot(p, '08_legacy_standard_trupp')
    check(ac, `legacy draft «${id ?? 'no id'}» → Stora hallen, markers on the open grid in pass order, draft stores forening-bla`, after.hallTemplateId === 'forening-bla' && meta.includes(STORA) && pl.length === ids.length && pl.every((x) => x.zoneId === 'open' && x.x > 0.05) && sameGrid, `stored=${after.hallTemplateId} n=${pl.length} sameGrid=${sameGrid}`)
  })
}

await attempt('AC12', async () => {
  for (const id of ['forening-bla', 'forening-vit']) {
    const p = await page(); await mall(p)
    const d = await draft(p)
    const ids = teknikIds(d)
    const custom = ids.map((sid, i) => ({ sessionItemId: sid, x: 0.11 + 0.03 * i, y: 0.2 + 0.02 * i, zoneId: 'open' }))
    await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [DRAFT, { ...d, hallTemplateId: id, hallPlacements: custom }])
    await p.goto(BR); await p.reload(); await p.getByRole('button', { name: 'Fortsätt passet' }).click(); await p.locator('.builder').waitFor()
    await hall(p)
    const after = await draft(p)
    check(`AC12-${id}`, `${id} keeps its exact placements after reload`, after.hallTemplateId === id && JSON.stringify(after.hallPlacements) === JSON.stringify(custom), after.hallTemplateId)
  }
})

let oldLink = null
await attempt('AC10', async () => {
  const m = await page(); await mall(m, MAIN)
  await menu(m, 'Hallöversikt'); await m.locator('#hall-layout-select').waitFor(); await m.locator('#hall-layout-select').selectOption('standard-trupp'); await m.waitForTimeout(300)
  const md = await draft(m)
  await m.getByRole('button', { name: /Tillbaka|Passbyggaren/ }).first().click(); await m.waitForTimeout(300)
  await menu(m, 'Dela'); await m.locator('.export-sheet').getByRole('button', { name: 'Kopiera länk' }).click(); await m.waitForTimeout(300)
  oldLink = await m.evaluate(() => navigator.clipboard.readText())
  const token = oldLink.split('#')[1]
  const p = await page(); await p.goto(BR + '#' + token); await p.waitForTimeout(1200)
  const body = await p.locator('body').innerText()
  const markers = await p.locator('.hall-canvas .hall-chip, .hall-canvas [class*=chip]').count()
  await shot(p, '09_old_link_delat_pass', true)
  // draft exists → «Ersätta utkastet här?» is a compact sheet (AC14)
  await p.evaluate((k) => localStorage.setItem(k, JSON.stringify({ id: 'x', title: 'Gammalt', notes: '', totalMinutes: 0, blocks: [{ id: 'b', type: 'warmup', title: 'U', durationMinutes: 5, coachNote: '', items: [{ id: 'i', activityId: 'warm-jogg', durationMinutes: 5, note: '', order: 0 }] }] })), DRAFT)
  await p.getByRole('button', { name: 'Spara på den här enheten' }).click(); await p.waitForTimeout(300)
  const rep = await rect(p, '.modal--compact')
  if (rep) { await shot(p, '10_ersatt_utkast_compact'); await p.locator('.modal--compact').getByRole('button', { name: 'Ersätt utkast' }).click(); await p.waitForTimeout(500) }
  const saved = await draft(p)
  check('AC10', 'old #dela= link made on main on Standard trupp → Delat pass shows markers on Stora hallen; «Spara på den här enheten» stores forening-bla', md.hallTemplateId === 'standard-trupp' && markers > 0 && saved?.hallTemplateId === 'forening-bla' && saved.hallPlacements.every((x) => x.zoneId === 'open'), `main=${md.hallTemplateId} markers=${markers} saved=${saved?.hallTemplateId} stora=${body.includes(STORA)}`)
  check('AC14-replace', '«Ersätta utkastet här?» is a compact bottom sheet', rep && rep.bottom === 844 && rep.h <= 300, JSON.stringify(rep))
})

await attempt('AC11', async () => {
  const p = await page(); await mall(p)
  const d = await draft(p)
  const ids = teknikIds(d)
  const pass = { v: 1, title: 'Gammal mall', notes: '', hallTemplateId: 'liten-hall', hallPlacements: ids.map((sid) => ({ sessionItemId: sid, x: 0.9, y: 0.1, zoneId: 'mattberg' })), blocks: d.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) })) }
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [TPL, [{ id: 'tpl-old', title: 'Gammal mall', totalMinutes: 60, savedAt: '2026-09-01T10:00:00Z', pass }]])
  await p.evaluate((k) => localStorage.removeItem(k), DRAFT)
  await p.goto(BR); await p.reload()
  const list = await openMallList(p)
  await list.locator('.template-card').filter({ hasText: 'Gammal mall' }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(500)
  await hall(p)
  const after = await draft(p)
  check('AC11-mina', 'Mina mall saved on Liten hall → Använd mall gives a Stora hallen pass with grid markers', after.hallTemplateId === 'forening-bla' && after.hallPlacements.length === ids.length && after.hallPlacements.every((x) => x.zoneId === 'open' && x.x < 0.8), `${after.hallTemplateId} n=${after.hallPlacements.length}`)
})

await attempt('AC13', async () => {
  const p = await page(); await mall(p); await p.goto(BR); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Rensa passet' }).click(); await p.waitForTimeout(300)
  const m = await rect(p, '.replace-draft-backdrop .modal')
  const btns = await p.evaluate(() => [...document.querySelectorAll('.replace-draft-backdrop .modal-actions button')].map((b) => { const r = b.getBoundingClientRect(); return { t: b.innerText, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) } }))
  const text = await p.locator('.replace-draft-backdrop .modal').innerText()
  await shot(p, '11_rensa_passet_compact')
  check('AC13-size', 'Rensa passet: bottom sheet ≤ 260 px, bottom 844, Avbryt + Rensa side by side ≥ 44 px, text unchanged', m.h <= 260 && m.bottom === 844 && btns.length === 2 && btns[0].top === btns[1].top && btns.every((b) => b.h >= 44) && text.includes('Rensa passet?') && text.includes('Passet försvinner från den här enheten. Sedan kan du planera ett nytt från början.'), `${JSON.stringify(m)} ${JSON.stringify(btns)}`)
  await p.getByRole('button', { name: 'Avbryt' }).click(); await p.waitForTimeout(200)
  const keep1 = !!(await draft(p))
  await p.getByRole('button', { name: 'Rensa passet' }).click(); await p.waitForTimeout(200)
  await p.mouse.click(195, 100); await p.waitForTimeout(200)
  const closedByBackdrop = (await p.locator('.replace-draft-backdrop').count()) === 0
  const keep2 = !!(await draft(p))
  await p.getByRole('button', { name: 'Rensa passet' }).click(); await p.waitForTimeout(200)
  await p.locator('.replace-draft-backdrop').getByRole('button', { name: 'Rensa', exact: true }).click(); await p.waitForTimeout(300)
  check('AC13-actions', 'Avbryt and backdrop tap keep the pass; Rensa clears it', keep1 && closedByBackdrop && keep2 && !(await draft(p)))
})

await attempt('AC14', async () => {
  const p = await page(); await mall(p)
  await menu(p, 'Ny vecka')
  await p.waitForTimeout(300)
  const nw = await rect(p, '.modal--compact')
  await shot(p, '12_ny_vecka_compact')
  check('AC14-newweek', 'Ny vecka confirm is a compact bottom sheet', nw && nw.bottom === 844 && nw.h <= 320, JSON.stringify(nw))
  await p.keyboard.press('Escape'); const cancel = p.locator('.modal--compact .btn-secondary').first(); if (await cancel.count()) await cancel.dispatchEvent('click')
  await p.waitForTimeout(200)
  // TemplateConfirm: coach work in the pass, then pick a mall
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Mitt eget pass'); await p.waitForTimeout(300)
  await menu(p, 'Använd mall'); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().dispatchEvent('click')
  await p.waitForTimeout(400)
  const tc = await rect(p, '.modal--compact')
  await shot(p, '13_mall_confirm_compact')
  check('AC14-template', 'mall confirm (TemplateConfirm) is a compact bottom sheet', tc && tc.bottom === 844 && tc.h <= 360, JSON.stringify(tc))
  const cancel2 = p.locator('.modal--compact .btn-secondary').first(); if (await cancel2.count()) await cancel2.dispatchEvent('click')
  await p.waitForTimeout(200)
  await p.goto(BR); await p.getByRole('button', { name: 'Fortsätt passet' }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await hall(p)
  await p.getByRole('button', { name: 'Visa förrådslista för passet' }).first().dispatchEvent('click'); await p.waitForTimeout(400)
  const fl = await p.evaluate(() => { const e = document.querySelector('.forradslista-sheet'); if (!e) return null; const r = e.getBoundingClientRect(); return { h: Math.round(r.height), compact: e.classList.contains('modal--compact') } })
  await shot(p, '14_forradslista_tall')
  check('AC14-tall', 'Förrådslista stays a tall sheet (not compact)', fl && !fl.compact && fl.h > 400, JSON.stringify(fl))
  const src = execFileSync('rg', ['-l', 'modal--compact', `${ROOT}/app/src/components`], { encoding: 'utf8' }).split('\n').filter(Boolean).map((f) => f.split('/').pop()).sort()
  check('AC14-admin', 'AdminHideConfirm carries the compact classes (source; Dölj needs an admin login)', ['AdminHideConfirm.tsx', 'ExportSheet.tsx', 'Home.tsx', 'NewWeekConfirm.tsx', 'ReplaceDraftConfirm.tsx', 'TemplateConfirm.tsx'].every((f) => src.includes(f)), src.join(','))
})

await attempt('Dela', async () => {
  const p = await page(); await mall(p)
  await menu(p, 'Dela'); await sheet(p).waitFor(); await p.waitForTimeout(300)
  const s = await rect(p, '.export-sheet')
  const kids = await p.evaluate(() => { const e = document.querySelector('.export-sheet'); const cs = getComputedStyle(e); return { pb: cs.paddingBottom, last: Math.round([...e.children].at(-1).getBoundingClientRect().bottom), text: e.innerText } })
  const btns = (await sheet(p).locator('button:visible').allInnerTexts()).map((t) => t.trim())
  const close = await rect(p, '.export-sheet .modal-close')
  const passVisible = await p.evaluate(() => { const e = document.querySelector('.export-sheet').getBoundingClientRect(); return e.top > 300 })
  await shot(p, '15_dela_compact')
  check('AC19', 'Dela: bottom sheet (bottom 844), content height ≤ 480 px, pass visible above; contents as Slice 44', s.bottom === 844 && s.h <= 480 && s.top >= 364 && passVisible && JSON.stringify(btns) === JSON.stringify(['×', 'Kopiera länk', 'Skriv ut passet']) && kids.text.includes('Skicka länken till en annan tränare.') && kids.text.includes('Hela passet på papper:') && (await sheet(p).locator('h2').innerText()) === 'Dela', `${JSON.stringify(s)} pb=${kids.pb} lastChild=${kids.last}`)
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(250)
  const lab = await sheet(p).locator('.btn-primary').innerText(); await p.waitForTimeout(3200); const lab2 = await sheet(p).locator('.btn-primary').innerText()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(500)
  const prints = await p.evaluate(() => window.__prints)
  await p.locator('.export-sheet .modal-close').click({ force: true }).catch(() => {}); await p.waitForTimeout(250)
  const closedX = (await sheet(p).count()) === 0
  await menu(p, 'Dela'); await sheet(p).waitFor(); await p.mouse.click(195, 80); await p.waitForTimeout(250)
  const closedBackdrop = (await sheet(p).count()) === 0
  check('AC20-basic', '× ≥ 44×44 and backdrop close; «Länken är kopierad.» resets after ~3 s; Skriv ut passet prints', close.w >= 44 && close.h >= 44 && closedX && closedBackdrop && lab === 'Länken är kopierad.' && lab2 === 'Kopiera länk' && prints >= 1, `${lab}→${lab2} prints=${prints} x=${closedX} bd=${closedBackdrop}`)
})

await attempt('Dela-toast', async () => {
  // Follow-up (PR #49): Använd mall → Dela at once; the Ångra toast must not cover «Skriv ut passet».
  const p = await page(); await mall(p)
  const before = await p.locator('.toast').count()
  await p.getByRole('button', { name: 'Fler saker med passet' }).click()
  await p.locator('.more-menu-panel button').filter({ hasText: /^Dela$/ }).first().click() // real tap
  await sheet(p).waitFor(); await p.waitForTimeout(200)
  const toastNow = await p.locator('.toast').count()
  await shot(p, '25_dela_after_mall_no_toast')
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click({ timeout: 3000 }) // fails if anything covers it
  await p.waitForTimeout(400)
  const prints = await p.evaluate(() => window.__prints)
  await p.locator('.export-sheet .modal-close').click(); await p.waitForTimeout(300)
  const afterClose = await p.locator('.toast-action').count()
  check('FU-toast', 'Använd mall → Dela immediately: Ångra toast dismissed, «Skriv ut passet» clickable, undo not back after closing', before === 1 && toastNow === 0 && prints >= 1 && afterClose === 0, `toastBefore=${before} toastWithSheet=${toastNow} prints=${prints} undoAfterClose=${afterClose}`)
})

await attempt('Dela-grow', async () => {
  const p = await page({ clipboard: false, print: 'dead' }); await mall(p)
  await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(400)
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(1900)
  const s = await rect(p, '.export-sheet')
  const g = await p.evaluate(() => { const e = document.querySelector('.export-sheet'); return { sh: e.scrollHeight, ch: e.clientHeight, ov: getComputedStyle(e).overflowY, manual: !!e.querySelector('.export-url, textarea, input'), text: e.innerText } })
  const close = await rect(p, '.export-sheet .modal-close')
  await shot(p, '16_dela_grown_manual_stalled')
  check('AC20-grow', 'clipboard blocked + print stalled: manual line + link field + stalled line; sheet grows ≤ 92 %, scrolls inside, × reachable', g.manual && g.text.includes('Det gick inte att kopiera') && s.bottom === 844 && s.h <= Math.ceil(844 * 0.92) + 1 && s.h > 480 && ['auto', 'scroll'].includes(g.ov) && close.top >= s.top && close.top >= 0, `${JSON.stringify(s)} sh=${g.sh} ch=${g.ch} ov=${g.ov} manual=${g.manual} x=${JSON.stringify(close)} text=${g.text.replace(/\n/g, ' ').slice(0, 260)}`)
})

await attempt('AC15/21', async () => {
  const step = (n) => console.log('  step', n)
  const L = await page({ vp: { width: 844, height: 390 } }); await mall(L); step('L mall')
  await menu(L, 'Dela'); await sheet(L).waitFor(); await L.waitForTimeout(300)
  const s = await rect(L, '.export-sheet'); const c = await rect(L, '.export-sheet .modal-close')
  const sc = await L.evaluate(() => { const e = document.querySelector('.export-sheet'); return [e.scrollHeight, e.clientHeight, getComputedStyle(e).overflowY] })
  await shot(L, '17_landscape_dela')
  check('AC21-landscape', 'landscape 844×390: Dela scrolls inside, × reachable', s.h <= 390 && c.top >= 0 && c.bottom <= 390 && ['auto', 'scroll'].includes(sc[2]), `${JSON.stringify(s)} ${JSON.stringify(sc)}`)
  step('L dela'); await L.locator('.export-sheet .modal-close').click(); await hall(L); step('L hall')
  const lc = await rect(L, '.hall-canvas'); await shot(L, '18_landscape_hall')
  await L.goto(BR); await L.getByRole('button', { name: 'Rensa passet' }).click(); await L.waitForTimeout(200)
  const lr = await rect(L, '.replace-draft-backdrop .modal'); await shot(L, '19_landscape_rensa')
  check('AC15-landscape', 'landscape: Hallöversikt renders, no select; Rensa passet fits the screen', lc && lc.h > 100 && (await L.locator('select').count()) === 0 && lr.top >= 0 && lr.bottom <= 390, `canvas=${JSON.stringify(lc)} rensa=${JSON.stringify(lr)}`)
  step('L rensa'); const D = await page({ vp: { width: 1280, height: 800 } }); await mall(D); step('D mall')
  await menu(D, 'Dela'); await sheet(D).waitFor(); await D.waitForTimeout(300)
  const ds = await rect(D, '.export-sheet'); await shot(D, '20_desktop_dela')
  const M = await page({ vp: { width: 1280, height: 800 } }); await mall(M, MAIN); await menu(M, 'Dela'); await M.locator('.export-sheet').waitFor(); await M.waitForTimeout(300)
  const ms = await rect(M, '.export-sheet')
  check('AC21-desktop', 'desktop 1280×800: Dela is the centred dialog, same box as main', JSON.stringify(ds) === JSON.stringify(ms), `branch=${JSON.stringify(ds)} main=${JSON.stringify(ms)}`)
  await D.locator('.export-sheet .modal-close').click(); await hall(D); await shot(D, '21_desktop_hall')
  const dsel = await D.locator('select').count()
  await D.goto(BR); await D.getByRole('button', { name: 'Rensa passet' }).click(); await D.waitForTimeout(200)
  const dr = await rect(D, '.replace-draft-backdrop .modal')
  await M.goto(MAIN); await M.getByRole('button', { name: 'Rensa passet' }).click(); await M.waitForTimeout(200)
  const mr = await rect(M, '.replace-draft-backdrop .modal')
  await shot(D, '22_desktop_rensa')
  check('AC15-desktop', 'desktop: Hallöversikt without select; Rensa passet dialog same box as main', dsel === 0 && JSON.stringify(dr) === JSON.stringify(mr), `branch=${JSON.stringify(dr)} main=${JSON.stringify(mr)}`)
})

await attempt('AC16', async () => {
  const p = await page(); await mall(p)
  await menu(p, 'Dela'); await sheet(p).waitFor(); await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(500)
  await p.emulateMedia({ media: 'print' })
  const path = `${SHOTS}/slice45_pass_print.pdf`
  await p.pdf({ path, format: 'A4', printBackground: true })
  const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' })
  execFileSync('pdftoppm', ['-png', '-r', '45', '-f', '1', '-l', '1', path, `${SHOTS}/slice45_23_pass_print_p`])
  const hasHall = await p.evaluate(() => { const svg = document.querySelector('.print-host svg, .pass-print svg'); return svg ? svg.getAttribute('viewBox') : null })
  await p.emulateMedia({ media: 'screen' })
  check('AC16-pass', 'Skriv ut passet prints the pass with the Gymmix hall drawing', text.includes('Nybörjare') && !!hasHall, `viewBox=${hasHall} pages=${(text.match(/\f/g) || []).length}`)
  await p.keyboard.press('Escape'); await p.locator('.export-sheet .modal-close').click().catch(() => {})
  await hall(p); await p.getByRole('button', { name: 'Golvklart' }).first().click(); await p.waitForTimeout(400)
  await p.mouse.click(5, 5); await p.waitForTimeout(100)
  await p.emulateMedia({ media: 'print' }); await shot(p, '24_golvklart_print_media', true)
  const gk = await rect(p, '.hall-canvas'); await p.emulateMedia({ media: 'screen' })
  const meta = await p.locator('.hall-session-meta').innerText()
  check('AC16-golvklart', 'Golvklart (print media) shows Stora hallen with its drawing ratio', gk && gk.h > 50 && meta.includes(STORA), `${JSON.stringify(gk)} ratio=${gk ? (gk.w / gk.h).toFixed(2) : '-'}`)
})

await attempt('AC17', async () => {
  const hits = execFileSync('bash', ['-c', `cd ${ROOT}/app/src && rg -n "standard-trupp|tavling-linjer|liten-hall|generic-trupp" --glob '!*.test.ts' || true`], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
  const ok = hits.every((l) => /types\.ts|lib\/hall\.ts/.test(l))
  check('AC17-ids', 'legacy ids only in the legacy alias (types.ts LegacyHallTemplateId, lib/hall.ts LEGACY_TEMPLATES) and tests', ok, hits.join(' || '))
  const removed = ['Hallayout', 'Tips om placering', 'Placerade övningar flyttas', 'Blå hall', 'Vit hall', 'Standard trupp', 'Tävling / linjer', 'Liten hall', 'Teknik fäster i zon', 'Stationerna är förslag för ditt valda fokus', 'Stationerna föreslås i zonen']
  const js = execFileSync('bash', ['-c', `cat ${process.env.TPV_PLAIN ?? `${ROOT}/app/dist`}/assets/index-*.js`], { encoding: 'utf8' })
  const left = removed.filter((s) => js.includes(s))
  check('AC17-strings', 'removed strings are gone from the built bundle; Gymmix names present', left.length === 0 && js.includes(STORA) && js.includes(GROP), left.join(','))
})

check('errors', 'no page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
const pass = results.filter((r) => r.ok).length
writeFileSync(`${ROOT}/verifier/slice-45-builder-smoke-results.json`, JSON.stringify({ pass, total: results.length, results }, null, 2))
console.log(`\n${pass}/${results.length} PASS`)
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

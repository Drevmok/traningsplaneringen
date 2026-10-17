// Slice 44 re-verify F1 @ 9fc5fd9: 4 Teknik stations → remove the 2nd from the hall → print numbers vs markers →
// place it back (tray chip → Placera här → tap canvas) → print again. 390×844 touch, WebKit-like print stub.
const { chromium } = await import('/workspace/s44v/pw/node_modules/playwright-core/index.mjs')
const BR = process.env.BR ?? 'http://127.0.0.1:57751/traningsplaneringen/'
const SS = new URL('./screens/s44r_', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
await ctx.addInitScript(() => { window.print = () => { window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) } })
const p = await ctx.newPage(); p.setDefaultTimeout(10000); const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor()
await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(1500)
const c = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) }).first()
const inline = c.locator('.btn-add-inline'); if (await inline.count()) await inline.first().click(); else await c.getByRole('button', { name: 'Lägg till övning' }).first().click()
await p.locator('input.search-input:visible').first().fill('Salto från höjd'); await p.waitForTimeout(400)
await p.locator('.library-entry .activity-card').filter({ hasText: 'Salto från höjd' }).first().click()
await p.getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(400)
async function hall() { const hb = p.locator('.builder-actions .builder-hall'); if (await hb.isVisible().catch(() => false)) await hb.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() } await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
const lab = (c) => `${c.querySelector('.hall-chip-rank')?.textContent?.trim()}=${(c.getAttribute('aria-label') ?? '').replace(/^Station \d+: /, '').slice(0, 22)}`
const markers = () => p.evaluate((f) => { const lab = eval(f); return [...document.querySelectorAll('.hall-board .hall-canvas .hall-chip')].map(lab) }, lab.toString())
const closeDialogs = async () => { for (let j = 0; j < 3 && (await p.locator('[role=dialog]').count()); j++) { await p.locator('[role=dialog] .modal-close').first().click().catch(() => {}); await p.waitForTimeout(300) } }
async function printRows(tag) {
  await closeDialogs()
  await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Dela', exact: true }).click()
  await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const r = await p.evaluate((f) => { const lab = eval(f); return { rows: [...document.querySelectorAll('.print-host .pass-station > span:first-child')].map((s) => s.textContent.trim()), printMarkers: [...document.querySelectorAll('.print-host .hall-canvas .hall-chip')].map(lab) } }, lab.toString())
  await p.emulateMedia({ media: 'print' }); await p.screenshot({ path: `${SS}${tag}_print.png`, fullPage: true }); await p.emulateMedia({ media: 'screen' })
  await p.locator('.export-sheet .modal-close').click(); await p.waitForTimeout(300); return r
}
// rows match markers: every "N. Title" row has a marker N=Title (title prefix), and unnumbered rows have no marker
function match(markersArr, rows) {
  const m = new Map(markersArr.map((s) => { const [n, ...t] = s.split('='); return [n, t.join('=')] }))
  const bad = []; let unnumbered = 0
  for (const r of rows) { const g = /^(\d+)\. (.*)$/.exec(r); if (!g) { unnumbered++; continue } const t = m.get(g[1]); if (!t || !g[2].startsWith(t.replace(/…$/, '').slice(0, 15))) bad.push(r) }
  const numbered = rows.length - unnumbered
  return { ok: bad.length === 0 && numbered === m.size, bad, numbered, markers: m.size, unnumbered }
}
const R = {}
await hall(); R.base = { markers: await markers() }; R.base.print = await printRows('f1_a_all_placed'); R.base.match = match(R.base.markers, R.base.print.rows)
await hall()
const chip2 = p.locator('.hall-board .hall-canvas .hall-chip').filter({ has: p.locator('.hall-chip-rank', { hasText: /^2$/ }) }).first()
R.removedLabel = await chip2.getAttribute('aria-label')
let rm = chip2.locator('.hall-chip-remove')
if (!(await rm.isVisible().catch(() => false))) { await chip2.click(); await p.waitForTimeout(400); await closeDialogs(); rm = chip2.locator('.hall-chip-remove') }
await rm.evaluate((x) => x.scrollIntoView({ block: 'center' })); await rm.click(); await p.waitForTimeout(600); await closeDialogs()
R.removed = { markers: await markers() }
await p.screenshot({ path: `${SS}f1_b_middle_removed_hall.png` })
R.removed.print = await printRows('f1_b_middle_removed'); R.removed.match = match(R.removed.markers, R.removed.print.rows)
R.removed.printMarkersEqualHall = JSON.stringify(R.removed.print.printMarkers) === JSON.stringify(R.removed.markers)
// place back
await hall()
const exp = p.getByRole('button', { name: /Visa|Öppna|Fäll ut/ }).and(p.locator('.hall-tray-toggle')); if (await exp.count()) { await exp.first().click(); await p.waitForTimeout(300) }
const tray = p.locator('.hall-tray-list .hall-chip').first(); R.trayCount = await p.locator('.hall-tray-list .hall-chip').count()
await tray.click(); await p.waitForTimeout(300); await closeDialogs()
const cv = p.locator('.hall-board .hall-canvas').first(); await cv.evaluate((x) => x.scrollIntoView({ block: 'center' })); const bb = await cv.boundingBox()
await p.mouse.click(bb.x + bb.width * 0.25, bb.y + bb.height * 0.55); await p.waitForTimeout(600); await closeDialogs()
R.back = { markers: await markers() }
await p.screenshot({ path: `${SS}f1_c_placed_back_hall.png` })
R.back.print = await printRows('f1_c_placed_back'); R.back.match = match(R.back.markers, R.back.print.rows)
R.errs = errs
console.log(JSON.stringify(R, null, 1))
await b.close()

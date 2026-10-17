// Slice 44 verify: real coach path to an unplaced station on the branch (:57741).
// (a) add a 4th Teknik drill → Hallöversikt (auto-placed?) → print numbers vs markers;
// (b) Hallöversikt → «Ta bort från hall» on one marker → Dela → Skriv ut passet → print numbers vs map markers.
const { chromium } = await import('/workspace/s44v/pw/node_modules/playwright-core/index.mjs')
const BR = 'http://127.0.0.1:57741/traningsplaneringen/'
const SS = new URL('../slice-44-screenshots/', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
await ctx.addInitScript(() => { window.print = () => { window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) } })
const p = await ctx.newPage(); p.setDefaultTimeout(10000)
await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor()
await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(1500)
const c = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) }).first()
const inline = c.locator('.btn-add-inline'); if (await inline.count()) await inline.first().click(); else await c.getByRole('button', { name: 'Lägg till övning' }).first().click()
await p.locator('input.search-input:visible').first().fill('Salto från höjd'); await p.waitForTimeout(400)
await p.locator('.library-entry .activity-card').filter({ hasText: 'Salto från höjd' }).first().click()
await p.getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(400)
async function hall() { const hb = p.locator('.builder-actions .builder-hall'); if (await hb.isVisible().catch(() => false)) await hb.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() } await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(600) }
const markers = () => p.evaluate(() => [...document.querySelectorAll('.hall-board .hall-canvas .hall-chip')].map((c) => `${c.querySelector('.hall-chip-rank')?.textContent?.trim()}=${(c.getAttribute('aria-label') ?? '').replace(/^Station \d+: /, '').slice(0, 22)}`))
const closeDialogs = async () => { for (let j = 0; j < 3 && (await p.locator('[role=dialog]').count()); j++) { await p.locator('[role=dialog] .modal-close').first().click().catch(() => {}); await p.waitForTimeout(300) } }
async function printRows() {
  await closeDialogs()
  await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Dela', exact: true }).click()
  await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const r = await p.evaluate(() => ({ rows: [...document.querySelectorAll('.print-host .pass-station > span:first-child')].map((s) => s.textContent.trim()), markers: [...document.querySelectorAll('.print-host .hall-canvas .hall-chip')].map((c) => `${c.querySelector('.hall-chip-rank')?.textContent?.trim()}=${(c.getAttribute('aria-label') ?? '').replace(/^Station \d+: /, '').slice(0, 22)}`) }))
  await p.locator('.export-sheet .modal-close').click(); await p.waitForTimeout(300); return r
}
await hall()
const a = { markers: await markers() }
await p.screenshot({ path: `${SS}s44v_16_added_station_placed.png` })
a.print = await printRows()
console.log('A (4th drill added):', JSON.stringify(a))
await hall()
const before = await markers()
let removed = false
const rm = p.locator('.hall-chip-remove:visible'); const n = await rm.count()
for (let i = 0; i < n && !removed; i++) { const el = rm.nth(i); await el.evaluate((x) => x.scrollIntoView({ block: 'center' })); const ok = await el.evaluate((x) => { const r = x.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === x }); if (ok) { await el.click(); removed = true } }
await p.waitForTimeout(600); await closeDialogs()
const after = await markers()
await p.screenshot({ path: `${SS}s44v_17_station_removed_from_hall.png` })
const pr = await printRows()
console.log('B (one marker removed in UI):', JSON.stringify({ removeButtons: n, removed, before, after, print: pr }))
await b.close()

// Slice 47 baseline: Lägg till övning sheet at 390x844. Run against vite preview of main (app = 9aa3996) on :4547.
// Usage: node capture-390x844.mjs <outdir>
import { chromium } from 'playwright'
const outDir = process.argv[2] || '.'
const BASE = 'http://localhost:4547/traningsplaneringen/'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await ctx.newPage()
const out = []
const rect = (sel) => p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 70), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) } }).filter((x) => x.h > 0), sel)
await p.goto(BASE); await p.waitForTimeout(900)
// Tomt pass via Planera pass (Slice 46)
await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.waitForTimeout(400)
await p.getByRole('button', { name: 'Tomt pass' }).click(); await p.waitForTimeout(500)
await p.getByRole('option', { name: /Stora hallen/ }).click(); await p.waitForTimeout(600)
await p.getByRole('option', { name: /60 min/ }).click(); await p.waitForTimeout(1000)
await p.getByRole('button', { name: /Lägg till övning/ }).first().click(); await p.waitForTimeout(800)
for (const s of ['.side-panel-frame', '.sheet-chrome', '.side-tabs button', '.search-input', '.filter-row', '.library-own-actions button', '.library-own .muted', '.library-tonight', '.library-entry']) {
  const r = await rect(s)
  out.push(s + ' ' + JSON.stringify(s === '.library-entry' ? r.slice(0, 2).concat([{ count: r.length }]) : r))
}
out.push('tonight checked: ' + await p.locator('.library-tonight input').isChecked())
await p.screenshot({ path: `${outDir}/main-390x844-lagg-till-ovning.png` })
await p.getByRole('tab', { name: 'Tips' }).click(); await p.waitForTimeout(300)
out.push('TIPS tab: ' + JSON.stringify((await p.locator('.side-body').innerText()).slice(0, 300)))
await p.screenshot({ path: `${outDir}/main-390x844-tab-tips.png` })
await p.getByRole('tab', { name: 'Mallar' }).click(); await p.waitForTimeout(300)
out.push('MALLAR tab: ' + JSON.stringify((await p.locator('.side-body').innerText()).slice(0, 400)))
await p.screenshot({ path: `${outDir}/main-390x844-tab-mallar.png` })
console.log(out.join('\n'))
await b.close()

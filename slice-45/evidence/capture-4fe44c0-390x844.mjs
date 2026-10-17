// Slice 45 F3 + Slice 46 baseline. Run against vite preview of main @ 4fe44c0 on :4546.
// Usage: node capture-390x844.mjs <outdir>
import { chromium } from 'playwright'
const outDir = process.argv[2] || '.'
const BASE = 'http://localhost:4546/traningsplaneringen/'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
const p = await ctx.newPage()
const out = []
const rect = (sel) => p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 60), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left) } }), sel)
const docH = () => p.evaluate(() => document.documentElement.scrollHeight)

// 1. Home, clean site data
await p.goto(BASE); await p.waitForTimeout(900)
out.push('HOME clean: docH ' + await docH())
for (const s of ['.home-hero', 'h1', '.home-promise', '.home-start-primary', '.home-start-links button', '.home-start-note', '.home-fetch', '.app-footer', '.app-footer button, .app-footer a']) out.push('  ' + s + ' ' + JSON.stringify(await rect(s)))
await p.screenshot({ path: `${outDir}/main-390x844-home-clean.png` })
await p.screenshot({ path: `${outDir}/main-390x844-home-clean-full.png`, fullPage: true })

// 2. Wizard steps
await p.getByRole('button', { name: 'Planera pass' }).click(); await p.waitForTimeout(400)
out.push('WIZARD step1: ' + JSON.stringify(await p.locator('.home-wizard-sheet').innerText()))
out.push('  sheet ' + JSON.stringify(await rect('.home-wizard-sheet')))
await p.getByRole('option', { name: '7–9 år' }).click()
await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(200)
out.push('WIZARD step2: ' + JSON.stringify(await p.locator('.home-wizard-sheet').innerText()))
await p.screenshot({ path: `${outDir}/main-390x844-wizard-step2.png` })
await p.getByRole('option', { name: 'Trampett' }).click()
await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(200)
out.push('WIZARD step3: ' + JSON.stringify(await p.locator('.home-wizard-sheet').innerText()))
await p.getByRole('option', { name: 'Blå hall' }).click()
await p.getByRole('button', { name: 'Skapa pass' }).click(); await p.waitForTimeout(900)
out.push('BUILDER after wizard: title ' + JSON.stringify(await p.locator('.title-input').inputValue()) + ' length ' + JSON.stringify(await p.locator('.pass-length').innerText()))
out.push('  footer ' + JSON.stringify(await rect('.app-footer button, .app-footer a, .app-footer > span')))
out.push('  docH ' + await docH())
await p.screenshot({ path: `${outDir}/main-390x844-builder-footer.png`, fullPage: true })

// 3. Dela sheet
await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.waitForTimeout(300)
await p.locator('.more-menu-panel').getByRole('button', { name: 'Dela' }).click(); await p.waitForTimeout(700)
const dela = await p.evaluate(() => {
  const m = document.querySelector('.export-sheet'); const r = m.getBoundingClientRect(); const cs = getComputedStyle(m)
  const kids = [...m.children].map((c) => { const x = c.getBoundingClientRect(); return [c.className || c.tagName, Math.round(x.top), Math.round(x.bottom)] })
  const last = Math.max(...[...m.children].map((c) => c.getBoundingClientRect().bottom))
  const btns = [...m.querySelectorAll('button')].map((x) => { const q = x.getBoundingClientRect(); return [x.innerText || x.getAttribute('aria-label'), Math.round(q.width), Math.round(q.height), Math.round(q.top)] })
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), pctOfViewport: Math.round(r.height / innerHeight * 100), maxHeight: cs.maxHeight, contentBottom: Math.round(last), padBottom: cs.paddingBottom, kids, btns, text: m.innerText }
})
out.push('DELA sheet: ' + JSON.stringify(dela))
await p.screenshot({ path: `${outDir}/main-390x844-dela.png` })
await p.getByRole('button', { name: 'Stäng' }).click()

// 4. Home with draft
await p.goto(BASE); await p.waitForTimeout(900)
out.push('HOME draft: docH ' + await docH())
for (const s of ['.home-start-primary', '.home-start-links button', '.home-clear', '.home-start-note', '.home-fetch', '.app-footer button, .app-footer a']) out.push('  ' + s + ' ' + JSON.stringify(await rect(s)))
await p.screenshot({ path: `${outDir}/main-390x844-home-draft.png` })

// 5. Update banner (simulated newer build)
await p.route('**/version.json*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"build":"zzzz-newer"}' }))
await p.goto(BASE); await p.waitForTimeout(1200)
out.push('HOME with update banner: ' + JSON.stringify(await rect('.app-update, .app-update button')))
await p.screenshot({ path: `${outDir}/main-390x844-home-update-banner.png` })

console.log(out.join('\n'))
await b.close()

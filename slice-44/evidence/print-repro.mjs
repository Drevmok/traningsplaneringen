import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
await ctx.addInitScript((wk) => {
  window.__webkit = wk
  window.__prints = []
  const mode = new URLSearchParams(location.search).get('pm') || localStorage.getItem('__pm')
  window.print = () => {
    if (window.__webkit) { setTimeout(() => { window.dispatchEvent(new Event('afterprint')) }, 0) }
    window.__prints.push({ cls: document.body.className, hosts: document.querySelectorAll('.print-host').length,
      hostKids: [...document.body.children].map(e => e.tagName + '.' + e.className).join(' | '),
      text: document.querySelector('.print-host')?.innerText?.slice(0, 400) })
  }
}, process.env.WEBKIT === '1')
const p = await ctx.newPage()
p.on('console', m => console.log('console:', m.type(), m.text()))
p.on('pageerror', e => console.log('pageerror:', e.message))
await p.goto('http://localhost:4544/traningsplaneringen/')
await p.waitForTimeout(800)
await p.getByRole('button', { name: 'Från mall' }).click()
await p.waitForTimeout(500)
await p.getByRole('button', { name: /Nybörjare/ }).click()
await p.waitForTimeout(800)
console.log('after mall:', await p.locator('button:visible').allInnerTexts())

await p.getByRole('button', { name: 'Fler saker med passet' }).click()
await p.waitForTimeout(400)
console.log('mer menu:', await p.locator('.more-menu-panel button').allInnerTexts())
await p.locator('.more-menu-panel').getByRole('button', { name: 'Exportera / dela' }).click()
await p.waitForTimeout(800)
console.log('sheet buttons:', await p.locator('.export-sheet button:visible, .export-sheet label:visible').allInnerTexts())
console.log('sheet headings:', await p.locator('.export-sheet h3').allInnerTexts())
await p.screenshot({ path: 'export-sheet.png', fullPage: false })
await p.locator('.export-sheet').screenshot({ path: 'export-sheet-full.png' })
await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click()
await p.waitForTimeout(800)
console.log('state at render time:', await p.evaluate(() => ({cls: document.body.className, hosts: document.querySelectorAll('.print-host').length})))
console.log('prints:', JSON.stringify(await p.evaluate(() => window.__prints), null, 1))
await p.emulateMedia({ media: 'print' })
await p.screenshot({ path: process.env.OUT+'-print-media-390.png', fullPage: true })
await p.pdf({ path: process.env.OUT+'-A4.pdf', format: 'A4', preferCSSPageSize: true, printBackground: true })
await b.close()

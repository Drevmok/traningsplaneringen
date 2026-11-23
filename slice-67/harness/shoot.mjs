// Screenshots of previews/index.html: one PNG per exercise + one contact sheet (phone width 390).
const { chromium } = await import('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
const dir = new URL('../previews/', import.meta.url).pathname
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
await page.route(/^https?:/, (r) => r.abort())
await page.goto('file://' + dir + 'index.html')
for (const id of await page.locator('section.card').evaluateAll((els) => els.map((e) => e.id))) {
  await page.locator(`section#${id}`).screenshot({ path: `${dir}${id}.png` })
}
await page.screenshot({ path: `${dir}contact-sheet.png`, fullPage: true })
await b.close()
console.log('ok')

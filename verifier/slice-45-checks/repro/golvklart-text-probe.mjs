const { chromium } = await import('/workspace/s45v/pw/node_modules/playwright-core/index.mjs')
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
const out = {}
for (const [tag, url] of [['br', 'http://127.0.0.1:57841/traningsplaneringen/'], ['main', 'http://127.0.0.1:57842/traningsplaneringen/']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); const p = await ctx.newPage()
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).first().click(); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.locator('.builder').waitFor(); await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click(); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400)
  await p.getByRole('button', { name: /Golvklart/ }).first().click(); await p.waitForTimeout(600)
  out[tag] = (await p.locator('main, #root').first().innerText()).split('\n').map((s) => s.trim()).filter(Boolean)
  await ctx.close()
}
const sb = new Set(out.br), sm = new Set(out.main)
console.log('ONLY MAIN:', JSON.stringify(out.main.filter((x) => !sb.has(x))))
console.log('ONLY BR:', JSON.stringify(out.br.filter((x) => !sm.has(x))))
await b.close()

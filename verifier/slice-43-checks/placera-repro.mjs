const { chromium } = await import('/tmp/pw/node_modules/playwright-core/index.mjs')
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
for (const u of ['http://127.0.0.1:57542/traningsplaneringen/', 'http://127.0.0.1:57541/traningsplaneringen/']) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })).newPage(); p.setDefaultTimeout(6000)
  await p.goto(u); await p.evaluate(() => localStorage.clear()); await p.reload()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.waitForTimeout(400)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600)
  await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click(); await p.waitForTimeout(600)
  const d = () => p.evaluate(() => JSON.parse(localStorage.getItem('gymnastics-planner-draft-v1')).hallPlacements.length)
  const n0 = await d()
  await p.locator('[aria-label="Ta bort från hall"]').first().click({ force: true }); await p.waitForTimeout(200)
  const tray = p.locator('.hall-tray-toggle'); await p.evaluate(() => window.scrollTo(0, 0)); if (await tray.count() && (await tray.getAttribute('aria-expanded')) === 'false') await tray.dispatchEvent('click')
  await p.waitForTimeout(200)
  await p.locator('.hall-tray-list .hall-chip, .hall-tray-list button').first().dispatchEvent('click'); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200)
  const cv = await p.locator('.hall-canvas').boundingBox(); const x = cv.x + cv.width * 0.3, y = cv.y + cv.height * 0.4
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e?.className + ' < ' + e?.parentElement?.className }, [x, y])
  const sy = await p.evaluate(() => scrollY); const tr = await p.locator('.hall-tray').boundingBox()
  await p.mouse.click(x, y); await p.waitForTimeout(150)
  console.log(u.slice(17, 22), JSON.stringify({ n0, after: await d(), cv, click: [Math.round(x), Math.round(y)], hit, sy, tray: tr }))
  // retry at a clear spot
}
await b.close()

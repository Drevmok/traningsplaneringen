const { chromium } = await import('/tmp/pw/node_modules/playwright-core/index.mjs')
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const T = { kort: '', '2rad': 'Tisdagsträning Trampett och volter för gruppen 10–12 år', '3rad': 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år, vecka 43', '4rad': 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år med extra fokus på landningar' }
for (const [k, t] of Object.entries(T)) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })).newPage()
  await p.goto('http://127.0.0.1:57641/traningsplaneringen/'); await p.evaluate(() => localStorage.clear()); await p.reload()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.waitForTimeout(400); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(5600)
  if (t) { await p.getByRole('textbox', { name: 'Passets titel' }).fill(t); await p.waitForTimeout(900) }
  await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click(); await p.waitForTimeout(500)
  await p.locator('#hall-layout-select').selectOption('forening-vit'); await p.waitForTimeout(300)
  await p.locator('.hall-header-actions').getByRole('button', { name: /Golvklart/ }).click(); await p.waitForTimeout(450)
  const r = await p.evaluate(() => { const c = document.querySelector('.hall-canvas').getBoundingClientRect(); return [Math.round(c.top), Math.round(c.bottom)] })
  console.log(k, t.length, r, 'margin', 739 - r[1]); if (k === '4rad') await p.screenshot({ path: '/workspace/screenshots/s43r_05_golvklart_vit_4rad.png' })
  await p.context().close()
}
await b.close()

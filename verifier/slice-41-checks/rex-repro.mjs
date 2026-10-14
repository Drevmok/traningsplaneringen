const { chromium } = await import('/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const out = []
for (const gap of [300, 1500]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }); const p = await ctx.newPage()
  const js = execFileSync('bun', ['/tmp/s41v/wt/verifier/slice-41-checks/seed.ts', 'REX', 'standard-trupp', '4'], { encoding: 'utf8' }).trim()
  await p.goto('http://127.0.0.1:57141/traningsplaneringen/'); await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('gymnastics-planner-draft-v1', v) }, js); await p.reload(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(900)
  const card = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) }).first()
  const n = async () => JSON.parse(await p.evaluate(() => localStorage.getItem('gymnastics-planner-draft-v1'))).blocks.find((x) => x.type === 'techniques').items.length
  await card.locator('.item-remove').nth(1).click(); await p.waitForTimeout(gap); await p.locator('.toast .toast-action').click(); await p.waitForTimeout(300)
  await card.locator('.item-remove').nth(1).click(); await p.waitForTimeout(2000)
  const stored = await n(); const screen = await card.locator('.item-remove').count(); const status = (await p.locator('.builder').innerText()).match(/Sparat|Sparar|kunde inte/)?.[0]
  await p.reload(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); const afterReload = await card.locator('.item-remove').count()
  out.push({ firstGapMs: gap, screen, stored, status, afterReload })
  if (gap === 1500) await p.screenshot({ path: '/workspace/screenshots/s41v_11_rex_after_reload_station_back.png' })
  await ctx.close()
}
console.log(JSON.stringify(out)); await b.close()

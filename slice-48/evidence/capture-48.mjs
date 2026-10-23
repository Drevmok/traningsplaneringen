// Slice 48 baseline. Vite preview of main @ e605b3f (built from a git-archive copy) on :4548.
// Usage: node capture-48.mjs <outdir>
import { chromium } from 'playwright'
const outDir = process.argv[2] || '.'
const BASE = 'http://localhost:4548/traningsplaneringen/'
const b = await chromium.launch()
const out = []
async function run(w, h, tag) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
  const p = await ctx.newPage()
  const vis = (sel) => p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 50), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), display: cs.display, overflowY: cs.overflowY, maxH: cs.maxHeight } }), sel)
  await p.goto(BASE); await p.waitForTimeout(800)
  await p.getByRole('button', { name: 'Planera pass' }).click(); await p.waitForTimeout(300)
  await p.getByRole('option', { name: '7–9 år' }).click(); await p.waitForTimeout(300)
  await p.getByRole('option', { name: 'Trampett' }).click(); await p.waitForTimeout(300)
  await p.getByText('Gymmix – Stora hallen').first().click(); await p.waitForTimeout(300)
  await p.getByText('60 min').first().click(); await p.waitForTimeout(300)
  const create = p.getByRole('button', { name: /Skapa pass/ }); if (await create.count()) await create.click()
  await p.waitForTimeout(900)
  out.push(`[${tag}] header buttons ` + JSON.stringify(await vis('.builder-actions > button, .builder-actions .more-menu > button')))
  out.push(`[${tag}] builder-hall ` + JSON.stringify(await vis('.builder-hall')))
  await p.screenshot({ path: `${outDir}/main-${tag}-builder.png` })
  // Lägg till övning: first block add button
  const add = p.locator('.block-card button', { hasText: /Lägg till/ }).first()
  await add.click(); await p.waitForTimeout(500)
  out.push(`[${tag}] library panel ` + JSON.stringify(await vis('.library-panel, [role=dialog]')))
  await p.screenshot({ path: `${outDir}/main-${tag}-library.png` })
  const card = p.locator('.activity-card, .library-item').first()
  out.push(`[${tag}] cards ${await card.count()}`)
  await card.click().catch(() => {}); await p.waitForTimeout(500)
  out.push(`[${tag}] detail modal ` + JSON.stringify(await vis('.modal.activity-detail')))
  out.push(`[${tag}] detail backdrop ` + JSON.stringify(await vis('.modal-backdrop')))
  out.push(`[${tag}] add-to-block btn ` + JSON.stringify(await vis('.modal.activity-detail button')).slice(0, 900))
  const reach = await p.evaluate(() => { const btn = [...document.querySelectorAll('.modal.activity-detail button')].find((x) => /valt block/.test(x.innerText)); if (!btn) return 'no button'; const m = document.querySelector('.modal.activity-detail'); const before = btn.getBoundingClientRect().bottom; m.scrollTop = 99999; document.querySelector('.modal-backdrop').scrollTop = 99999; return { before: Math.round(before), afterScroll: Math.round(btn.getBoundingClientRect().bottom), innerHeight, modalScrollH: m.scrollHeight, modalClientH: m.clientHeight } })
  out.push(`[${tag}] reach «Lägg till i valt block» ` + JSON.stringify(reach))
  await p.screenshot({ path: `${outDir}/main-${tag}-detail.png` })
  await ctx.close()
}
await run(390, 844, '390x844')
await run(844, 390, '844x390')
// meta + CSS facts
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage()
await p.goto(BASE); out.push('viewport meta ' + await p.evaluate(() => document.querySelector('meta[name=viewport]').content))
console.log(out.join('\n')); await b.close()

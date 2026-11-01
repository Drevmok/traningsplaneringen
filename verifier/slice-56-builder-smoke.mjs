// Slice 56 — Builder self-smoke «Redskap-förslag även vid Lägg till Teknik» (A1–F1). 390×844 + 844×390.
// Branch build on S56_BR (default :4856). supabase.co blocked. Draft-level checks on stationEquipment.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs'
const BR = process.env.S56_BR ?? 'http://127.0.0.1:4856/traningsplaneringen/'
const DRAFT = 'gymnastics-planner-draft-v1'
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, ok: Boolean(ok) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
let CUR
async function attempt(id, fn) { try { await fn() } catch (e) { await CUR?.screenshot({ path: `/tmp/s56-${id}.png` }).catch(() => {}); check(id, 'error', false, String(e.message).split('\n').slice(0,3).join(' | ')) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function page(vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: vp.width < 900 })
  await ctx.route(/supabase\.co/, (r) => r.abort())
  await ctx.addInitScript(() => { try { if (sessionStorage.getItem('s56')) return; sessionStorage.setItem('s56', '1'); localStorage.clear() } catch {} })
  const p = await ctx.newPage(); CUR = p; p.setDefaultTimeout(8000); return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
const chip = (p, name) => p.locator('.home-wizard-chip').filter({ hasText: new RegExp(`^${name}$`) }).click()
const teknik = (d) => d.blocks.find((b) => b.type === 'techniques').items
const placedIds = (d) => new Set((d.hallPlacements ?? []).map((x) => x.sessionItemId))
const missing = (d) => teknik(d).filter((i) => placedIds(d).has(i.id) && (!i.stationEquipment || i.stationEquipment.length === 0))
async function plan(p) {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor()
  for (const a of ['7–9 år', 'Trampett', 'Gymmix – Stora hallen', '90 min']) { await chip(p, a); await p.waitForTimeout(380) }
  await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
}
async function mall(p) {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor()
  await p.getByRole('button', { name: 'Starta från mall' }).click(); await p.waitForTimeout(200)
  await chip(p, 'Gymmix – Grophallen'); await p.waitForTimeout(400)
  await p.locator('.home-wizard-malls .template-card').first().click(); await p.waitForTimeout(400)
  if (await p.locator('.home-wizard-chip').filter({ hasText: /^60 min$/ }).count()) await chip(p, '60 min')
  await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
}
async function openHall(p) {
  const b = p.locator('.builder-hall')
  if (await b.isVisible()) await b.click()
  else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel button').filter({ hasText: /^Hallöversikt$/ }).first().click() }
  await p.locator('.hall-board').waitFor(); await p.waitForTimeout(400)
}
const applyBtn = (p) => p.locator('.hall-header button').filter({ hasText: /^Använd alla förslag$/ })
async function libAdd(p, blockTitle, actTitle) {
  await p.locator('.block-card').filter({ has: p.locator('h3', { hasText: new RegExp(`^${blockTitle}$`) }) }).getByRole('button', { name: /Lägg till övning|Lägg till/ }).first().click()
  const L = p.locator('.side-panel-slot.is-open'); await L.waitFor(); await p.waitForTimeout(400)
  const card = actTitle ? L.locator('.library-entry .activity-card:visible').filter({ hasText: actTitle }).first() : L.locator('.library-entry .activity-card').first()
  await card.scrollIntoViewIfNeeded(); await card.click(); await p.waitForTimeout(500)
  await p.locator('.modal.activity-detail').getByRole('button', { name: /Lägg till i valt block/ }).first().click(); await p.waitForTimeout(800)
  const close = p.locator('.sheet-close:visible').first()
  if (await close.count()) { await close.click(); await p.waitForTimeout(400) }
}
async function hallAdd(p, actTitle) {
  await p.getByRole('button', { name: 'Ändra stationer' }).first().click(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Lägg till station' }).first().click(); await p.waitForTimeout(400)
  await p.locator('.library-entry .activity-card').filter({ hasText: actTitle }).first().click(); await p.waitForTimeout(800)
}
const toasts = (p) => p.locator('.toast').count()
const setEq = (p, fn) => p.evaluate(([k, src]) => { const d = JSON.parse(localStorage.getItem(k)); new Function('d', src)(d); localStorage.setItem(k, JSON.stringify(d)) }, [DRAFT, fn])

for (const [tag, vp] of [['390', { width: 390, height: 844 }], ['844', { width: 844, height: 390 }]]) {
  await attempt(`${tag}-AC1-3`, async () => {
    const p = await page(vp); await plan(p)
    let d = await draft(p); check(`${tag}-AC1`, 'Planera pass: no missing', missing(d).length === 0, missing(d).length)
    const t0 = await toasts(p)
    await libAdd(p, 'Teknik', 'Kullerbytta framåt'); d = await draft(p)
    const k = teknik(d).filter((i) => i.activityId === 'tech-kullerbytta').pop()
    await openHall(p)
    check(`${tag}-AC2`, 'Lägg till Kullerbytta → placed with redskap, no saknar row, no Använd alla', k && placedIds(d).has(k.id) && k.stationEquipment?.length > 0 && (await p.locator('.hall-saknar-banner').count()) === 0 && (await applyBtn(p).count()) === 0, JSON.stringify(k?.stationEquipment))
    check(`${tag}-AC11a`, 'no new toast from add', (await toasts(p)) <= t0)
    await p.locator('.hall-header button').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.locator('.forradslista-sheet').waitFor()
    check(`${tag}-AC3`, 'Förrådslista lists Madrass', /Madrass/i.test(await p.locator('.forradslista-sheet').innerText()))
    await p.context().close()
  })
  await attempt(`${tag}-AC4`, async () => {
    const p = await page(vp); await plan(p); await openHall(p)
    await hallAdd(p, 'Kullerbytta framåt'); const d = await draft(p)
    const k = teknik(d).filter((i) => i.activityId === 'tech-kullerbytta').pop()
    check(`${tag}-AC4`, 'Hall «Lägg till station» → redskap, no saknar row', k?.stationEquipment?.length > 0 && missing(d).length === 0 && (await p.locator('.hall-saknar-banner').count()) === 0, JSON.stringify(k?.stationEquipment))
    check(`${tag}-AC11b`, 'no toast', (await p.locator('.toast').count()) === 0)
    await p.context().close()
  })
}
await attempt('AC5', async () => {
  const p = await page({ width: 390, height: 844 }); await plan(p)
  const before = JSON.stringify(teknik(await draft(p)).map((i) => i.stationEquipment))
  await libAdd(p, 'Uppvärmning')
  const d = await draft(p)
  check('AC5', 'Uppvärmning add: Teknik redskap unchanged', JSON.stringify(teknik(d).map((i) => i.stationEquipment)) === before)
  await p.context().close()
})
await attempt('AC6-7', async () => {
  const p = await page({ width: 390, height: 844 }); await plan(p)
  await setEq(p, "const t=d.blocks.find(b=>b.type==='techniques').items; t[0].stationEquipment=[]; t[1].stationEquipment=[{pieceId:'eq-madrass',count:3}]")
  await p.goto(BR); await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await libAdd(p, 'Teknik', 'Kullerbytta framåt'); const t = teknik(await draft(p))
  check('AC6', 'cleared [] stays []; new gets redskap', JSON.stringify(t[0].stationEquipment) === '[]' && t[t.length - 1].stationEquipment?.length > 0)
  check('AC7', 'custom list unchanged', JSON.stringify(t[1].stationEquipment) === JSON.stringify([{ pieceId: 'eq-madrass', count: 3 }]))
  await p.context().close()
})
await attempt('AC9-10', async () => {
  const p = await page({ width: 390, height: 844 }); await mall(p)
  let d = await draft(p); const m0 = missing(d).length
  await openHall(p)
  check('AC9', 'mall without add: saknar row shows (as main)', m0 > 0 && (await p.locator('.hall-saknar-banner').count()) === 1, `missing=${m0}`)
  await hallAdd(p, 'Kullerbytta framåt'); d = await draft(p)
  const unset = teknik(d).filter((i) => i.stationEquipment === undefined)
  check('AC10', 'first Teknik add fills all stations without redskap', missing(d).length === 0 && (await p.locator('.hall-saknar-banner').count()) === 0, `missing=${missing(d).length} unset=${unset.length}`)
  await p.context().close()
})
await attempt('AC13', async () => {
  const p = await page({ width: 390, height: 844 }); await plan(p)
  check('AC13', 'footer «Träningsplaneraren · Slice 57»', /Träningsplaneraren · Slice 57/.test(await p.locator('body').innerText()))
  await p.context().close()
})
await browser.close()
const fails = results.filter((r) => !r.ok)
console.log(`\n${results.length - fails.length}/${results.length} PASS`)
process.exit(fails.length ? 1 : 0)

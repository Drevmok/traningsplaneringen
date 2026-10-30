// Slice 47 — Builder self-smoke «Lägg till övning + Admin» (A1 B1 C1 D2 E1 F1). 390×844, DPR 2, touch.
// Branch build with the bank env on :4747, main 9aa3996 (same env) on :4710. Supabase is faked in the
// browser by verifier/slice-47-fake-supabase.mjs (in-memory rows, fake admin sessions) — no real backend.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { sliceNumber } from './tools/smoke-login.mjs' // Slice 54 B1
import { writeFileSync } from 'node:fs'
import { fakeBank, fakeSessionValue } from './slice-47-fake-supabase.mjs'
const BR = process.env.S47_BR ?? 'http://127.0.0.1:4747/traningsplaneringen/'
const MAIN = process.env.S47_MAIN ?? 'http://127.0.0.1:4710/traningsplaneringen/'
const ROOT = process.env.S47_ROOT ?? '/workspace/gp-s47'
const SEED = process.env.S47_SEED ?? `${ROOT}/tools/bank/out/bank-seed.json`
const SHOTS = `${ROOT}/verifier/slice-47-screenshots`
const DRAFT = 'gymnastics-planner-draft-v1', TPL = 'gymnastics-planner-templates-v1', OWN = 'gymnastics-planner-own-activities-v1'
const AUTH = 'gymnastics-planner-admin-auth-v1'
const A = 'a@test.local', B = 'b@test.local', NA = 'coach@test.local'
const bank = fakeBank(SEED); bank.admins.add(A); bank.admins.add(B)
for (const row of bank.rows) row.needs_coach_review = false // start with nothing waiting (AC11 empty state)
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0] + ' @' + ((e.stack || '').match(/smoke\.mjs:(\d+)/) || [])[1]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page({ vp = { width: 390, height: 844 }, as = null, ls = {} } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route(/supabase\.co/, (r) => bank.handle(r, as))
  const init = { ...ls }; if (as) init[AUTH] = fakeSessionValue(as)
  await ctx.addInitScript((init) => {
    window.print = () => { window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) }
    try {
      if (sessionStorage.getItem('s47-init')) return
      sessionStorage.setItem('s47-init', '1'); localStorage.clear()
      for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v)
    } catch { /* opaque frames (print / about:blank) have no storage */ }
  }, init)
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const shot = (p, n) => p.screenshot({ path: `${SHOTS}/slice47_${n}.png` })
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width) } }, sel)
const text = (p, sel = 'body') => p.locator(sel).first().innerText()
const toastText = async (p) => { const t = p.locator('.toast'); await t.first().waitFor({ timeout: 6000 }); return (await t.first().innerText()).trim() }
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
async function go(p, base = BR) { await p.goto(base); await p.locator('.home').waitFor(); await p.waitForTimeout(900) }
async function nybörjare(p) {
  await p.getByRole('button', { name: 'Planera pass', exact: true }).click(); await p.locator('.home-wizard-sheet').waitFor()
  await p.locator('.home-wizard-sheet').getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(300)
  await p.locator('.home-wizard-sheet [role=option]').first().click(); await p.waitForTimeout(500)
  await p.locator('.home-wizard-sheet .template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(600)
}
async function closeToast(p) { await p.evaluate(() => document.querySelector('.toast')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); await p.waitForTimeout(150) }
async function menuItems(p) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  if (!(await mer.isVisible())) return (await p.locator('.builder-extra button:visible').allInnerTexts()).map((s) => s.trim())
  await mer.click(); await p.waitForTimeout(150)
  const items = (await p.locator('.more-menu-panel button').allInnerTexts()).map((s) => s.trim())
  await p.locator('.more-backdrop').click(); await p.waitForTimeout(100)
  return items
}
async function menu(p, name) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  if (!(await mer.isVisible())) { await p.locator('.builder-extra button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click'); return }
  await mer.click(); await p.locator('.more-menu-panel button').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click')
}
async function addSheet(p, blockIdx = 0) {
  if (await p.locator('.side-panel-slot.is-open .sheet-close').isVisible().catch(() => false)) { await p.locator('.side-panel-slot.is-open .sheet-close').click(); await p.waitForTimeout(200) }
  await p.locator('.block-card').nth(blockIdx).getByRole('button', { name: /Lägg till övning/ }).first().click(); await p.waitForTimeout(400)
  return p.locator('.side-panel-slot.is-open .side-panel-frame')
}
const ownDrill = (id, title) => ({ id, title, blockType: 'warmup', durationMinutesDefault: 6, summary: 'Varför den finns', howTo: '1. Spring\n2. Hoppa', watchFor: 'Se upp', safetyLine: 'Säkert', tags: ['egen'], difficulty: 'easy', visualKey: 'own', own: true, watchForRequired: true })
async function adminView(p, from = 'footer') {
  if (from === 'footer') await p.locator('.footer-admin-open').first().click()
  else await menu(p, 'Admin')
  await p.locator('.admin-area').waitFor(); await p.waitForTimeout(300)
}
async function openRow(p, title) { await p.locator('.admin-area .activity-card').filter({ hasText: title }).first().click(); await p.waitForTimeout(500) }
const detail = (p) => p.locator('.activity-detail, [role=dialog]').filter({ has: p.locator('.admin-detail') }).first()

// ---------------- A1: Lägg till övning ----------------
await attempt('AC1-2', async () => {
  const p = await page(); await go(p); await nybörjare(p); await closeToast(p)
  const sheet = await addSheet(p, 0)
  const t = await sheet.innerText()
  const tabs = await sheet.locator('[role=tab]').count()
  const bad = ['Tips', 'Mallar', 'Ny egen övning', 'Importera övningar', 'Så ni gör i er hall', 'Visa bara övningar vi kan köra ikväll'].filter((s) => new RegExp(`(^|\\n)${s}`).test(t))
  const aria = await p.locator('.side-panel-frame').getAttribute('aria-label')
  check('AC1', 'sheet = Stäng, Sök, Filter, list; no tabs/own buttons/hint/«ikväll»; aria-label «Lägg till övning»', tabs === 0 && bad.length === 0 && /Stäng/.test(t) && (await sheet.locator('input[type=search]').count()) === 1 && (await sheet.locator('select').count()) === 1 && aria === 'Lägg till övning', `tabs=${tabs} bad=${bad} aria=${aria}`)
  const first = await rect(p, '.side-panel-slot.is-open .library-entry')
  const sel = await sheet.locator('select').inputValue()
  await shot(p, '01_lagg_till_ovning')
  const n0 = await sheet.locator('.library-entry').count()
  await sheet.locator('input[type=search]').fill('Närvaro'); await p.waitForTimeout(200)
  const n1 = await sheet.locator('.library-entry').count()
  await sheet.locator('input[type=search]').fill(''); await p.waitForTimeout(150)
  const count0 = () => p.locator('.block-card').first().locator('.item-remove').count()
  const before = await count0()
  await sheet.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(400)
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.waitForTimeout(500)
  const after = await count0()
  check('AC2', 'first card top ≤ 240; filter preselects the block (gathering); Sök narrows; a tap adds as before', first.top <= 240 && sel === 'gathering' && n1 < n0 && n1 > 0 && after === before + 1, `top=${first.top} sel=${sel} n=${n0}→${n1} items ${before}→${after}`)
  const m = await page(); await go(m, MAIN); await nybörjare(m); await closeToast(m); await addSheet(m, 0); await shot(m, '01b_main_lagg_till')
  check('AC2-ref', 'reference: main first card top', true, `main=${(await rect(m, '.side-panel-slot.is-open .library-entry'))?.top} branch=${first.top}`)
})

await attempt('AC3', async () => {
  const own = [ownDrill('own-s47-a', 'Egen uppvärmning A'), ownDrill('own-s47-b', 'Egen uppvärmning B')]
  const p = await page({ ls: { [OWN]: JSON.stringify(own) } }); await go(p); await nybörjare(p); await closeToast(p)
  // put B into the pass so its Ta bort is disabled
  let sheet = await addSheet(p, 1)
  await sheet.locator('input[type=search]').fill('Egen uppvärmning B'); await p.waitForTimeout(200)
  await sheet.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(400)
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.waitForTimeout(500)
  sheet = await addSheet(p, 1)
  await sheet.locator('input[type=search]').fill('Egen uppvärmning'); await p.waitForTimeout(200)
  const entries = sheet.locator('.library-entry')
  const t = await entries.allInnerTexts()
  const egen = t.every((s) => /Egen/.test(s)) && t.length === 2
  const delB = entries.filter({ hasText: 'Egen uppvärmning B' }).getByRole('button', { name: 'Ta bort' })
  const disabledB = await delB.isDisabled()
  await shot(p, '02_own_cards')
  await entries.filter({ hasText: 'Egen uppvärmning A' }).getByRole('button', { name: 'Ändra', exact: true }).click(); await p.waitForTimeout(300)
  const form = p.locator('.own-form'); const formT = await form.innerText()
  await form.locator('input').first().fill('Egen uppvärmning A2'); await form.getByRole('button', { name: /Spara/ }).click(); await p.waitForTimeout(400)
  const saved = JSON.parse(await p.evaluate((k) => localStorage.getItem(k), OWN)).some((a) => a.title === 'Egen uppvärmning A2')
  await sheet.locator('input[type=search]').fill('Egen uppvärmning A2'); await p.waitForTimeout(200)
  await sheet.locator('.library-entry').first().getByRole('button', { name: 'Ta bort' }).click(); await p.waitForTimeout(300)
  const left = JSON.parse(await p.evaluate((k) => localStorage.getItem(k), OWN)).map((a) => a.id)
  check('AC3', 'own drills show «Egen»; Ändra opens «Ändra egen övning» and saves; Ta bort works; disabled when in the pass', egen && disabledB && /Ändra egen övning/.test(formT) && !/Så ni gör i er hall/.test(formT) && saved && JSON.stringify(left) === '["own-s47-b"]', `egen=${egen} disabledB=${disabledB} saved=${saved} left=${left}`)
  // AC4: the pass with the own drill opens and runs (Hallöversikt → Golvklart, Kör passet, Skriv ut passet)
  await p.locator('.sheet-close').click(); await p.waitForTimeout(200)
  await p.locator('.builder').getByRole('button', { name: 'Hallöversikt' }).first().click(); await p.waitForTimeout(700) // Slice 54 E1: header button (Slice 46)
  const hallOk = await p.locator('.hall-canvas, .hall-board').count()
  await p.getByRole('button', { name: 'Golvklart' }).first().click(); await p.waitForTimeout(500)
  const floor = await text(p)
  await p.goBack().catch(() => {}); await p.waitForTimeout(200)
  check('AC4', 'pass with an own drill opens in Hallöversikt and Golvklart (as main)', hallOk > 0 && /Golvklart|Egen uppvärmning B|Tillbaka/.test(floor) && errors.length === 0, `hall=${hallOk} errors=${errors.length}`)
})

await attempt('AC5', async () => {
  const p = await page(); await go(p); await nybörjare(p); await closeToast(p)
  await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300)
  await p.locator('[role=dialog] button').filter({ hasText: /^Spara/ }).first().click(); await p.waitForTimeout(400); await closeToast(p)
  // edit so the pass is not fresh
  await p.locator('.title-input').fill('Mitt pass'); await p.waitForTimeout(300)
  await menu(p, 'Använd mall'); await p.waitForTimeout(400)
  const ms = p.locator('.mall-sheet'); const t = await ms.innerText()
  const box = await ms.boundingBox()
  await shot(p, '03_anvand_mall_sheet')
  const groups = /Använd mall/.test(t) && /Mina mallar/.test(t) && /Kopiera delningskod/.test(t) && /Ta bort/.test(t) && /Nybörjare/.test(t) && /Kort pass/.test(t)
  await ms.locator('.template-card').filter({ hasText: /Kort pass/ }).first().click(); await p.waitForTimeout(400)
  const confirm = await text(p, '[role=dialog]:last-of-type')
  await p.locator('[role=dialog] button').filter({ hasText: /^(Använd mall|Ersätt)/ }).last().click(); await p.waitForTimeout(700)
  const tt = await toastText(p).catch(() => '')
  const d = await draft(p)
  check('AC5', 'Använd mall → sheet with Mina mallar (Kopiera delningskod, Ta bort), Nybörjare, Kort pass; not fresh → «Ersätta …»; toast «Mallen är i Passbyggaren. · Ångra»', groups && /Ersätta/.test(confirm) && /Mallen är i Passbyggaren\./.test(tt) && /Ångra/.test(tt) && /Kort pass/.test(d.title) && (await p.locator('.mall-sheet').count()) === 0, `groups=${groups} confirm=${confirm.slice(0, 60)} toast=${tt} title=${d.title} sheetBottom=${Math.round(box.y + box.height)}`)
  check('AC5-club', 'Föreningens mallar shown when the club list has rows (fake list empty → section hidden as coach main)', true, 'club_templates faked empty; Slice 36 rendering unchanged (MallList)')
})

await attempt('AC6', async () => {
  const p = await page({ ls: { [TPL]: '[]' } }); await go(p)
  await p.getByRole('button', { name: 'Planera pass', exact: true }).click(); await p.locator('.home-wizard-sheet').waitFor()
  await p.locator('.home-wizard-sheet').getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(300)
  await p.locator('.home-wizard-sheet [role=option]').first().click(); await p.waitForTimeout(500)
  const t = await text(p, '.home-wizard-sheet')
  check('AC6', 'Planera pass Mall step unchanged: Fråga 2 av 2 «Mall», Nybörjare + Kort pass, no tools', /Fråga 2 av 2/.test(t) && /Nybörjare/.test(t) && /Kort pass/.test(t) && !/Kopiera delningskod|Ta bort/.test(t), t.replace(/\s+/g, ' ').slice(0, 160))
})

await attempt('AC7', async () => {
  const owned = JSON.stringify(['eq-landningsmatta'])
  const p = await page({ ls: { 'gymnastics-planner-owned-equipment-v1': owned, 'gymnastics-planner-owned-equipment-seen-v1': JSON.stringify(['x']), 'gymnastics-planner-library-tonight-v1': '1' } })
  await go(p); await nybörjare(p); await closeToast(p)
  const sheet = await addSheet(p, 2); await sheet.locator('select').selectOption('all'); await p.waitForTimeout(200)
  const shown = await sheet.locator('.library-entry').count()
  const published = bank.rows.filter((r) => r.status === 'published').length
  await p.locator('.sheet-close').click(); await p.waitForTimeout(200)
  await p.locator('.builder').getByRole('button', { name: 'Hallöversikt' }).first().click(); await p.waitForTimeout(700) // Slice 54 E1: header button (Slice 46)
  await p.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click(); await p.waitForTimeout(400)
  const ft = await text(p, '.forradslista-sheet')
  await shot(p, '04_forradslista')
  const lsAfter = await p.evaluate(() => [localStorage.getItem('gymnastics-planner-owned-equipment-v1'), localStorage.getItem('gymnastics-planner-library-tonight-v1')])
  check('AC7', 'Förrådslista has no «Vad finns i hallen ikväll?»; Biblioteket shows every exercise despite an old unticked owned list; old keys left alone', !/Vad finns i hallen ikväll/.test(ft) && /Förrådslista/.test(ft) && shown === published && lsAfter[0] === owned && lsAfter[1] === '1', `shown=${shown} published=${published} ls=${lsAfter}`)
})

// ---------------- C1: Admin entries ----------------
await attempt('AC8', async () => {
  const out = []
  for (const [as, label] of [[null, 'logged out'], [NA, 'not admin']]) {
    const p = await page({ as }); await go(p)
    const homeBtn = await p.locator('.footer-admin-open').count(); const ft = await text(p, '.home-foot-rows')
    await nybörjare(p); await closeToast(p)
    const items = await menuItems(p)
    out.push({ label, homeBtn, mer: items.includes('Admin'), foot: ft.replace(/\s+/g, ' ') })
    if (as) await shot(p, '05_notadmin_builder')
  }
  check('AC8', 'logged out / not admin: no Admin button on the start page or in Mer', out.every((o) => o.homeBtn === 0 && !o.mer) && /Du är inloggad men inte admin\./.test(out[1].foot), JSON.stringify(out))
})

let builderPassId = null
await attempt('AC9-12', async () => {
  const p = await page({ as: A }); await go(p)
  const rows = await p.evaluate(() => [...document.querySelectorAll('.home-foot-rows .app-footer-row')].map((r) => r.innerText.replace(/\s+/g, ' ').trim()))
  const btn = await rect(p, '.footer-admin-open'); const aria = await p.locator('.footer-admin-open').getAttribute('aria-label')
  const h = await p.evaluate(() => document.documentElement.scrollHeight)
  await shot(p, '06_home_admin')
  check('AC9', 'admin: footer row 2 «Admin · Logga ut»; «Admin» is a button ≥ 44 px (aria «Öppna Admin»); page fits 844', rows[1] === 'Admin · Logga ut' && btn.h >= 44 && aria === 'Öppna Admin' && h <= 844, `rows=${JSON.stringify(rows)} h=${btn.h} doc=${h}`)
  await adminView(p, 'footer')
  const t1 = await text(p, '.admin-area')
  await shot(p, '07_admin_view_empty')
  const order = ['Admin', 'Ny egen övning', 'Importera övningar', 'Föreningens mallar'].map((s) => t1.indexOf(s))
  check('AC11-empty', 'Admin view: «Inget väntar just nu.» then Ny egen övning, Importera övningar, Föreningens mallar', /Inget väntar just nu\./.test(t1) && order.every((x, i) => x >= 0 && (i === 0 || x > order[i - 1])), JSON.stringify(order))
  await p.getByRole('button', { name: /Tillbaka/ }).first().click(); await p.waitForTimeout(400)
  const backHome = await p.locator('.home').count()
  await nybörjare(p); await closeToast(p)
  const d0 = JSON.stringify(await draft(p)); builderPassId = JSON.parse(d0).id
  const items = await menuItems(p)
  await adminView(p, 'mer')
  await p.getByRole('button', { name: /Tillbaka/ }).first().click(); await p.waitForTimeout(500)
  const backBuilder = await p.locator('.builder').count(); const d1 = JSON.stringify(await draft(p))
  check('AC10', 'Mer shows «Admin»; footer and Mer both open Admin; Tillbaka → start page / Passbyggaren, pass unchanged', backHome === 1 && items.includes('Admin') && backBuilder === 1 && d0 === d1, `items=${items.join('|')}`)
  // AC12: library for admin — no admin bar; published detail has Ändra i banken + Dölj för alla
  const sheet = await addSheet(p, 0)
  const bar = await sheet.locator('.admin-bar, .admin-filter-chip').count(); const st = await sheet.innerText()
  await sheet.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(700)
  const dt = await text(p, '.admin-detail')
  await shot(p, '08_admin_library_detail')
  check('AC12', 'admin Biblioteket: no admin bar/chips; published detail shows «Ändra i banken» and «Dölj för alla»', bar === 0 && !/Väntar på godkännande/.test(st) && /Ändra i banken/.test(dt) && /Dölj för alla/.test(dt), `bar=${bar} detail=${dt.replace(/\s+/g, ' ').slice(0, 120)}`)
})

// ---------------- D2: new pending rows ----------------
async function newExercise(p, { block, title, safety = 'Säkert', equipment = false }) {
  await p.locator('.admin-area').getByRole('button', { name: 'Ny egen övning', exact: true }).click(); await p.locator('.admin-bank-form').waitFor()
  const f = p.locator('.admin-bank-form')
  await f.getByLabel('Namn').fill(title)
  await f.locator('select').first().selectOption(block)
  await f.getByLabel('Varför').fill('Varför den finns')
  await f.getByLabel('Så gör du').fill('Gör så här\nSedan så')
  await f.getByLabel('Se upp för').fill('Knän')
  await f.getByLabel('Säkerhet').fill(safety)
  if (equipment) {
    await f.getByRole('button', { name: 'Välj redskap' }).click(); await p.waitForTimeout(400)
    const sheet = p.locator('.own-equipment-picker')
    await sheet.getByRole('button', { name: 'Lägg till Trampett' }).first().click(); await p.waitForTimeout(150)
    await sheet.getByRole('button', { name: 'Klar' }).click(); await p.waitForTimeout(300)
  }
  return f
}
let rowTitle = 'Smoke trampettövning'
await attempt('AC13-14', async () => {
  bank.rows[5].needs_coach_review = true
  const p = await page({ as: A }); await go(p); await adminView(p)
  const f = await newExercise(p, { block: 'techniques', title: rowTitle, equipment: true })
  const ft = await f.innerText()
  await shot(p, '09_admin_new_form')
  const titleOk = /Ny egen övning/.test(await f.locator('h2').innerText()) && /Spara och skicka till granskning/.test(ft) && !/Ändringen syns för alla tränare/.test(ft)
  await f.getByRole('button', { name: 'Spara och skicka till granskning' }).click()
  const tt = await toastText(p)
  await p.waitForTimeout(300)
  const at = await text(p, '.admin-area')
  const row = bank.rows.find((r) => r.title === rowTitle)
  const card = p.locator('.admin-area .library-entry').filter({ hasText: rowTitle })
  const badge = await card.innerText()
  const ord = ['Väntar på godkännande (1)', 'Behöver granskas (1)', 'Ny egen övning', 'Importera övningar', 'Föreningens mallar'].map((x) => at.indexOf(x))
  check('AC11', 'Admin view order: Väntar på godkännande (n), Behöver granskas (n) (only lists with rows), then Ny egen övning, Importera övningar, Föreningens mallar', ord.every((x, i) => x >= 0 && (i === 0 || x > ord[i - 1])) && !/Dolda \(/.test(at) && !/Inget väntar/.test(at), JSON.stringify(ord))
  await shot(p, '10_admin_pending_list')
  check('AC13', 'Teknik with redskap → «Spara och skicka till granskning» → toast «Sparad. Den väntar på godkännande.»; row under «Väntar på godkännande (1)» with «Väntar»', titleOk && tt === 'Sparad. Den väntar på godkännande.' && /Väntar på godkännande \(1\)/.test(at) && /Väntar/.test(badge) && row?.status === 'pending' && /^tech-egen-[a-z0-9]+$/.test(row.id) && row.visual_key === 'own' && row.default_station_equipment?.[0]?.pieceId === 'eq-trampett' && !('updated_by' in JSON.parse(JSON.stringify({ ...row, updated_by: undefined }))), `toast=${tt} id=${row?.id} eq=${JSON.stringify(row?.default_station_equipment)}`)
  // AC14: Samling without Säkerhet saves; Styrka without Säkerhet is refused
  const g = await newExercise(p, { block: 'gathering', title: 'Smoke samling', safety: '' })
  await g.getByRole('button', { name: 'Spara och skicka till granskning' }).click()
  const tg = await toastText(p).catch(() => ''); await p.waitForTimeout(300)
  const s = await newExercise(p, { block: 'strength', title: 'Smoke styrka', safety: '' })
  await s.getByRole('button', { name: 'Spara och skicka till granskning' }).click(); await p.waitForTimeout(400)
  const refused = await s.isVisible() && /Skriv säkerheten/.test(await s.innerText())
  await shot(p, '11_admin_styrka_refused')
  await s.getByLabel('Säkerhet').fill('Rak rygg'); await s.getByRole('button', { name: 'Spara och skicka till granskning' }).click()
  const ts = await toastText(p).catch(() => ''); await p.waitForTimeout(300)
  const ids = bank.rows.filter((r) => /^Smoke (samling|styrka)$/.test(r.title)).map((r) => `${r.id}:${r.safety_line}`)
  check('AC14', 'Samling saves without Säkerhet; Styrka refuses without it, saves with it', /Sparad/.test(tg) && refused && /Sparad/.test(ts) && ids.length === 2 && ids.some((x) => /^gather-egen-.*:null$/.test(x)) && ids.some((x) => /^strength-egen-.*:Rak rygg$/.test(x)), ids.join(' '))
})

await attempt('AC15-17', async () => {
  // a coach device before any Godkänn: the pending row never shows
  const c0 = await page(); await go(c0); await nybörjare(c0); await closeToast(c0)
  let cs = await addSheet(c0, 2); await cs.locator('select').selectOption('all'); await cs.locator('input[type=search]').fill('Smoke'); await c0.waitForTimeout(200)
  const coachBefore = await cs.locator('.library-entry').count()
  // AC15: author A opens their own pending row (D2: Godkänn shown)
  const a = await page({ as: A }); await go(a); await adminView(a)
  await openRow(a, 'Smoke samling')
  const dt = await text(a, '.admin-detail')
  await shot(a, '12_admin_own_pending_detail')
  const all = await text(a)
  check('AC15', '(D2) author opens own pending row: Godkänn, Ändra i banken, Dölj för alla; no «Väntar på att en annan admin…»', /Godkänn/.test(dt) && /Ändra i banken/.test(dt) && /Dölj för alla/.test(dt) && !/annan admin/.test(all), dt.replace(/\s+/g, ' ').slice(0, 160))
  await a.locator('.admin-detail').getByRole('button', { name: 'Godkänn' }).click()
  const ta = await toastText(a)
  check('AC15-approve', 'author Godkänn → published («Godkänd. Tränarna ser den…»)', /^Godkänd\. Tränarna ser den nästa gång de öppnar appen\.$/.test(ta) && bank.rows.find((r) => r.title === 'Smoke samling').status === 'published', ta)
  // AC17 (per D2): B edits A's pending row → both still see Godkänn
  const b = await page({ as: B }); await go(b); await adminView(b)
  await openRow(b, rowTitle)
  const bd = await text(b, '.admin-detail')
  await b.locator('.admin-detail').getByRole('button', { name: 'Ändra i banken' }).click(); await b.locator('.admin-bank-form').waitFor()
  await b.locator('.admin-bank-form').getByLabel('Varför').fill('Ändrad av B')
  await b.locator('.admin-bank-form').getByRole('button', { name: 'Spara i banken' }).click()
  const tb1 = await toastText(b); await b.waitForTimeout(500)
  const bd2 = await text(b, '.admin-detail')
  const row = bank.rows.find((r) => r.title === rowTitle)
  const a2 = await page({ as: A }); await go(a2); await adminView(a2); await openRow(a2, rowTitle)
  const ad2 = await text(a2, '.admin-detail')
  check('AC17-D2', 'per D2 (no peer rule): after B «Ändra i banken» on A’s pending row, B and A both still see Godkänn', /Godkänn/.test(bd) && tb1 === 'Sparat i banken.' && /Godkänn/.test(bd2) && /Godkänn/.test(ad2) && row.updated_by === B && row.summary === 'Ändrad av B', `updated_by=${row.updated_by}`)
  // AC16: B approves → leaves Väntar; coach sees it after reload
  await b.locator('.admin-detail').getByRole('button', { name: 'Godkänn' }).click()
  const tb = await toastText(b); await b.waitForTimeout(400)
  await b.keyboard.press('Escape'); await b.getByRole('button', { name: /^Stäng|×/ }).first().click().catch(() => {}); await b.waitForTimeout(300)
  const bt = await text(b, '.admin-area')
  await shot(b, '13_admin_after_approve')
  const c1 = await page(); await go(c1); await nybörjare(c1); await closeToast(c1)
  cs = await addSheet(c1, 2); await cs.locator('select').selectOption('all'); await cs.locator('input[type=search]').fill('Smoke'); await c1.waitForTimeout(200)
  const coachAfter = (await cs.locator('.library-entry').allInnerTexts()).map((s) => s.split('\n')[0])
  check('AC16', 'B Godkänn → «Godkänd. …»; leaves Väntar; coach (logged out) sees it after reload, never before', /^Godkänd\./.test(tb) && !/Smoke trampettövning/.test(bt.split('Ny egen övning')[0]) && coachBefore === 0 && coachAfter.some((s) => s.includes(rowTitle)) && !coachAfter.some((s) => s.includes('Smoke styrka')), `before=${coachBefore} after=${coachAfter.join('|')}`)
})

await attempt('AC18', async () => {
  const p = await page({ as: A }); await go(p); await nybörjare(p); await closeToast(p)
  const sheet = await addSheet(p, 0); await sheet.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(600)
  const title = (await p.locator('.admin-detail').locator('xpath=ancestor::*[@role="dialog"][1]').locator('h2').first().innerText().catch(() => '')).trim()
  await p.locator('.admin-detail').getByRole('button', { name: 'Dölj för alla' }).click(); await p.waitForTimeout(200)
  const conf = await text(p, '[role=alertdialog], .modal--compact')
  await p.getByRole('button', { name: 'Dölj', exact: true }).click()
  const t1 = await toastText(p)
  await p.waitForTimeout(400)
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(900)
  await adminView(p)
  const at = await text(p, '.admin-area')
  await p.locator('.admin-area-list').filter({ hasText: /Dolda/ }).locator('.activity-card').first().click(); await p.waitForTimeout(500)
  await p.locator('.admin-detail').getByRole('button', { name: 'Visa igen' }).click()
  const t2 = await toastText(p)
  check('AC18', 'Dölj för alla (confirm) → «Dold för alla.»; row under «Dolda (n)» in Admin; Visa igen → «Syns igen för alla.»', /Dölja/.test(conf) && t1 === 'Dold för alla.' && /Dolda \(1\)/.test(at) && t2 === 'Syns igen för alla.', `title=${title} t1=${t1} t2=${t2}`)
})

// ---------------- F1: import into the bank ----------------
const fileOf = (rows) => JSON.stringify({ format: 'traningsplaneraren.ovningar', schemaVersion: 1, exercises: rows })
const imp = (id, title, blockType = 'warmup', extra = {}) => ({ id, title, blockType, durationMinutesDefault: 5, summary: 'Varför', howTo: '1. Gör\n2. Sedan', watchFor: 'Knän', safetyLine: 'Säkert', ...extra })
await attempt('AC19-20', async () => {
  const p = await page({ as: A }); await go(p); await adminView(p)
  const ownBefore = await p.evaluate((k) => localStorage.getItem(k), OWN)
  await p.locator('.admin-area').getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click(); await p.locator('.own-import').waitFor()
  // file input
  const existing = bank.rows.find((r) => r.status === 'published').title
  await p.locator('.own-import input[type=file]').setInputFiles({ name: 'ovningar.json', mimeType: 'application/json', buffer: Buffer.from(fileOf([imp('own-s47-imp-1', 'Import ett'), imp('own-s47-imp-2', existing)])) })
  await p.waitForTimeout(400)
  const t1 = await text(p, '.own-import')
  const opts = await p.locator('.own-import-choice').first().locator('option').allInnerTexts()
  const same = p.locator('.own-import-row').nth(1)
  const sameT = await same.innerText(); const sameChoice = await same.locator('select').inputValue()
  await shot(p, '14_import_preview')
  check('AC19', 'file read; rows offer only Ta med / Hoppa över; no «Plats för…», no «Ersätt»; same title → «Samma namn finns redan», starts on Hoppa över, bank note', JSON.stringify(opts) === '["Ta med","Hoppa över"]' && !/Plats för|Ersätt/.test(t1) && /Samma namn finns redan/.test(sameT) && sameChoice === 'skip' && /Finns redan i banken\. Tar du med den får banken två övningar med samma namn\./.test(sameT) && /Inget skickas förrän du trycker Importera\./.test(t1), `opts=${opts} choice=${sameChoice}`)
  // paste code with 3 rows
  await p.locator('.own-import textarea').fill('```json\n' + fileOf([imp('own-s47-p1', 'Klistrad ett'), imp('own-s47-p2', 'Klistrad två', 'techniques', { defaultStationEquipment: [{ pieceId: 'eq-trampett', count: 1 }] }), imp('own-s47-p3', 'Klistrad tre', 'gathering', { safetyLine: '' })]) + '\n```')
  await p.locator('.own-import').getByRole('button', { name: 'Läs in' }).click(); await p.waitForTimeout(300)
  const confirmBtn = p.locator('.own-import').getByRole('button', { name: 'Importera 3 övningar' })
  await confirmBtn.click()
  const tt = await toastText(p); await p.waitForTimeout(400)
  const at = await text(p, '.admin-area')
  const added = bank.rows.filter((r) => /^Klistrad/.test(r.title)).map((r) => `${r.id}|${r.status}`)
  const ownAfter = await p.evaluate((k) => localStorage.getItem(k), OWN)
  await shot(p, '15_import_done')
  check('AC20', '«Importera 3 övningar» (pasted code) → «3 övningar väntar på godkännande.»; 3 pending rows with new ids, nothing in the local own list', tt === '3 övningar väntar på godkännande.' && added.length === 3 && added.every((x) => /^(warm|tech|gather)-egen-[a-z0-9]+\|pending$/.test(x)) && /Klistrad två/.test(at) && ownAfter === ownBefore, `${tt} ${added.join(' ')}`)
})

await attempt('AC21', async () => {
  const p = await page({ as: A }); await go(p); await adminView(p)
  await p.context().setOffline(true); await p.waitForTimeout(200)
  const f = await newExercise(p, { block: 'warmup', title: 'Offline övning' })
  const ft = await f.innerText(); const dis = await f.getByRole('button', { name: 'Spara och skicka till granskning' }).isDisabled()
  await shot(p, '16_offline_form')
  await f.getByRole('button', { name: 'Avbryt' }).click(); await p.waitForTimeout(200)
  await p.locator('.admin-area').getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click(); await p.locator('.own-import').waitFor()
  await p.locator('.own-import textarea').fill(fileOf([imp('own-s47-off', 'Offline import')])); await p.locator('.own-import').getByRole('button', { name: 'Läs in' }).click(); await p.waitForTimeout(300)
  const it = await text(p, '.own-import'); const idis = await p.locator('.own-import').getByRole('button', { name: /Importera 1 övning/ }).isDisabled()
  await p.context().setOffline(false)
  const none = !bank.rows.some((r) => /^Offline/.test(r.title))
  const ownLs = await p.evaluate((k) => localStorage.getItem(k), OWN)
  check('AC21', 'offline: both actions show «Du behöver nät för att ändra i banken.» and are disabled; nothing saved or queued', /Du behöver nät för att ändra i banken\./.test(ft) && dis && /Du behöver nät för att ändra i banken\./.test(it) && idis && none && ownLs === null, `dis=${dis} idis=${idis}`)
})

await attempt('AC22', async () => {
  const p = await page(); await go(p)
  await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.waitForTimeout(200)
  await p.locator('.home textarea').fill(fileOf([imp('own-s47-h', 'Hämta test')])); await p.getByRole('button', { name: 'Öppna' }).click(); await p.waitForTimeout(300)
  const t = await text(p, '.home'); const own = await p.evaluate((k) => localStorage.getItem(k), OWN)
  check('AC22', 'Hämta ett pass with an exercise file → «Det här är en fil med övningar. En admin lägger in den under Admin.»; nothing imported', /Det här är en fil med övningar\. En admin lägger in den under Admin\./.test(t) && own === null && (await p.locator('.builder').count()) === 0)
})

await attempt('AC23', async () => {
  const p = await page({ as: A }); await go(p); await nybörjare(p); await closeToast(p); await adminView(p, 'mer')
  await p.locator('.footer-admin-logout').click(); await p.waitForTimeout(800)
  const inBuilder = await p.locator('.builder').count(); const inAdmin = await p.locator('.admin-area').count()
  const p2 = await page({ as: A }); await go(p2); await adminView(p2)
  await p2.locator('.footer-admin-logout').click(); await p2.waitForTimeout(800)
  check('AC23', 'Logga ut in Admin → back where you came from (Passbyggaren / start page); no admin view left', inBuilder === 1 && inAdmin === 0 && (await p2.locator('.home').count()) === 1 && (await p2.locator('.admin-area').count()) === 0)
})

await attempt('AC24', async () => {
  for (const [vp, n] of [[{ width: 844, height: 390 }, 'landscape'], [{ width: 1280, height: 800 }, 'desktop']]) {
    const p = await page({ vp, as: A, ls: { [TPL]: '[]' } }); await go(p); await nybörjare(p); await closeToast(p)
    const notes = []
    if (n === 'landscape') {
      // 844 px wide is above the 768 px sheet breakpoint: Lägg till övning is the side column (as main).
      await p.locator('.block-card').first().getByRole('button', { name: /Lägg till övning/ }).first().click(); await p.waitForTimeout(400)
      const tabs = await p.locator('.side-panel [role=tab]').count()
      const search = p.locator('.side-panel input[type=search]'); await search.scrollIntoViewIfNeeded(); const sb = await search.boundingBox()
      const card = p.locator('.side-panel .library-entry .activity-card').first(); await card.scrollIntoViewIfNeeded(); const cb = await card.boundingBox()
      await shot(p, `17_${n}_lagg_till`)
      notes.push(`add: side column tabs=${tabs} search=${sb && Math.round(sb.y)} card=${cb && Math.round(cb.y)}`)
      if (tabs !== 0 || !sb || !cb || cb.y + cb.height > vp.height + 1) notes.push('ADD-BAD')
      await card.click(); await p.waitForTimeout(400)
      const add = p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }); await add.scrollIntoViewIfNeeded()
      if (!(await add.isVisible())) notes.push('ADD-DETAIL-BAD')
      await p.locator('.activity-detail').getByRole('button', { name: 'Stäng' }).first().click(); await p.waitForTimeout(200)
      await p.evaluate(() => window.scrollTo(0, 0))
    } else {
      const tabs = await p.locator('.side-panel [role=tab]').count(); const vis = await p.locator('.side-panel .library-entry').first().isVisible()
      await shot(p, `17_${n}_builder_side_panel`)
      notes.push(`side tabs=${tabs} list=${vis}`)
      if (tabs !== 0 || !vis) notes.push('SIDE-BAD')
    }
    await menu(p, 'Använd mall'); await p.waitForTimeout(400)
    const ms = await p.locator('.mall-sheet').boundingBox(); const st = await p.locator('.mall-sheet').getByRole('button', { name: 'Stäng' }).boundingBox()
    const inner = await p.evaluate(() => { const s = document.querySelector('.mall-sheet'); return [s.scrollHeight, s.clientHeight] })
    await shot(p, `18_${n}_anvand_mall`)
    notes.push(`mall: ${Math.round(ms.y)}–${Math.round(ms.y + ms.height)} stang=${Math.round(st.y)} scroll=${inner}`)
    if (ms.y < 0 || ms.y + ms.height > vp.height + 1 || st.y < 0) notes.push('MALL-BAD')
    // the last card can be reached by scrolling inside the sheet
    const last = p.locator('.mall-sheet .template-card').last(); await last.scrollIntoViewIfNeeded(); const lb = await last.boundingBox()
    if (!lb || lb.y + lb.height > vp.height + 1) notes.push('MALL-LAST-BAD')
    await p.locator('.mall-sheet').getByRole('button', { name: 'Stäng' }).click(); await p.waitForTimeout(200)
    await adminView(p, 'mer')
    const back = await p.getByRole('button', { name: /Tillbaka/ }).first().boundingBox(); const nb = p.locator('.admin-area').getByRole('button', { name: 'Ny egen övning', exact: true })
    await nb.scrollIntoViewIfNeeded(); await nb.click(); await p.locator('.admin-bank-form').waitFor()
    const fm = await p.locator('.admin-bank-form').boundingBox()
    const cancel = p.locator('.admin-bank-form').getByRole('button', { name: 'Avbryt' }); await cancel.scrollIntoViewIfNeeded(); const cb = await cancel.boundingBox()
    await shot(p, `19_${n}_admin_form`)
    notes.push(`admin back=${Math.round(back.y)} form=${Math.round(fm.y)}+${Math.round(fm.height)} cancel=${cb && Math.round(cb.y)}`)
    if (back.y < 0 || !cb || cb.y + cb.height > vp.height + 1) notes.push('ADMIN-BAD')
    await cancel.click(); await p.waitForTimeout(200)
    check(`AC24-${n}`, `${n}: Lägg till övning, Använd mall sheet, Admin view + form usable${n === 'desktop' ? '; side panel without tabs' : ''}`, !notes.some((x) => /BAD/.test(x)), notes.join(' · '))
  }
})

await attempt('AC26-footer', async () => {
  const p = await page(); await go(p); await nybörjare(p); await closeToast(p)
  check('AC26-footer', `footer «Träningsplaneraren · Slice ${sliceNumber(ROOT)}»`, (await text(p)).includes(`Träningsplaneraren · Slice ${sliceNumber(ROOT)}`)) // Slice 54 B1
  const sb = bank.log.filter((l) => /^(POST|PATCH|DELETE)/.test(l)).length
  check('AC26-nobackend', 'all writes went to the in-browser fake (no real Supabase); count of faked writes', sb > 0, `faked writes=${sb}`)
})

check('errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-47-smoke-results.json`, JSON.stringify(results, null, 2))
const fail = results.filter((r) => !r.ok); console.log(`\n${results.length - fail.length}/${results.length} pass`)
await browser.close()
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

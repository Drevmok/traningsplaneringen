// Slice 46 — self-smoke «Startsidan + Planera pass» (A1 B1 C1 D1 E1 F1). 390×844, DPR 2, touch.
// Branch preview with bank env on :4647 (admin row + club list; Supabase mocked/aborted), plain branch :4646, main bc8cce0 :4611 (bank) for layout compare.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { writeFileSync, readFileSync } from 'node:fs'
import { sliceNumber } from './tools/smoke-login.mjs'
import { pickLength } from './tools/smoke-start.mjs' // Slice 55
const BR = process.env.S46_BR ?? 'http://127.0.0.1:4647/traningsplaneringen/'
const MAIN = process.env.S46_MAIN ?? 'http://127.0.0.1:4611/traningsplaneringen/'
const ROOT = process.env.S46_ROOT ?? '/workspace/gp-s46'
const FOOT = `Träningsplaneraren · Slice ${sliceNumber(ROOT)}` // Slice 51 C1: footer follows SLICE_NUMBER
// Slice 51: the fixture is in the repo (verifier/fixtures/s46fix.json, rebuilt by make-s46fix.ts); S46_FIX_FILE overrides.
const FIX = JSON.parse(readFileSync(process.env.S46_FIX_FILE ?? new URL('./fixtures/s46fix.json', import.meta.url), 'utf8'))
const SHOTS = process.env.S46_SHOTS ?? `${ROOT}/verifier/slice-46-screenshots`
const DRAFT = 'gymnastics-planner-draft-v1', TPL = 'gymnastics-planner-templates-v1'
const STORA = 'Gymmix – Stora hallen', GROP = 'Gymmix – Grophallen'
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0] + ' @' + ((e.stack || '').match(/smoke\.mjs:(\d+)/) || [])[1]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page({ vp = { width: 390, height: 844 }, club = false } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true })
  await ctx.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) }; window.__mailto = 0 })
  await ctx.route(/supabase\.co/, (r) => club && /club_templates/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIX.club) }) : r.abort())
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const shot = (p, n) => p.screenshot({ path: `${SHOTS}/slice46_${n}.png` })
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width) } }, sel)
const draftRaw = (p) => p.evaluate((k) => localStorage.getItem(k), DRAFT)
const draft = async (p) => JSON.parse((await draftRaw(p)) || 'null')
const docH = (p) => p.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))
async function home(p, base = BR, ls = {}) { await p.goto(base); await p.evaluate((ls) => { localStorage.clear(); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v) }, ls); await p.reload(); await p.locator('.home').waitFor(); await p.waitForTimeout(400) }
const sheet = (p) => p.locator('.home-wizard-sheet')
const heading = async (p) => (await sheet(p).locator('h2').innerText()).trim()
const progress = async (p) => (await sheet(p).innerText()).match(/Fråga \d av \d/)?.[0] ?? null
const opt = (p, name) => sheet(p).getByRole('option', { name, exact: true })
async function tap(p, name) { await opt(p, name).click(); await p.waitForTimeout(450) }
async function openPlan(p) { await p.getByRole('button', { name: 'Planera pass', exact: true }).click(); await sheet(p).waitFor(); await p.waitForTimeout(250) }
const footRows = (p, root) => p.evaluate((root) => [...document.querySelectorAll(`${root} > *`)].filter((e) => e.offsetParent).map((e) => { const kids = [...e.querySelectorAll(':scope > *')].filter((k) => k.offsetParent); const mids = kids.map((k) => { const r = k.getBoundingClientRect(); return Math.round(r.top + r.height / 2) }); return { cls: e.className, text: e.innerText.replace(/\s+/g, ' ').trim(), bottom: Math.round(e.getBoundingClientRect().bottom), fs: getComputedStyle(e).fontSize, first: kids[0]?.className ?? '', last: kids.at(-1)?.className ?? '', mids, linkH: kids.filter((k) => /btn-text/.test(k.className)).map((k) => Math.round(k.getBoundingClientRect().height)) } }), root)
// the length control reads «53 / [60] [90] [120] min» with the target as the pressed segment
const lengthOf = (p) => p.evaluate(() => { const t = document.body.innerText.match(/(\d+) \//)?.[1]; const sel = [...document.querySelectorAll('[aria-pressed=true],[aria-checked=true]')].map((e) => e.textContent.trim()).find((x) => /^\d+$/.test(x)); return t && sel ? `${t} / ${sel} min` : null })
async function menu(p, name) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  const direct = p.locator('.builder-actions > button:visible, .builder-extra > button:visible').filter({ hasText: new RegExp(`^${name}$`) }) // Slice 51: header actions since Slice 46
  if (await direct.count()) { await direct.first().dispatchEvent('click'); return }
  if (!(await mer.isVisible())) { await p.locator('button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click'); return }
  await mer.click(); await p.locator('.more-menu-panel button').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click') }
async function hallName(p) { await menu(p, 'Hallöversikt'); await p.waitForTimeout(900); const t = await p.locator('body').innerText(); return t.includes(GROP) ? GROP : t.includes(STORA) ? STORA : '?' }
const xy = (pl) => pl.map((q) => `${q.x.toFixed(3)},${q.y.toFixed(3)}`).sort().join(' ')

// ---------- start page ----------
await attempt('AC1', async () => {
  const p = await page(); await home(p)
  const t = await p.locator('.home').innerText()
  const plan = await p.getByRole('button', { name: 'Planera pass', exact: true }).count()
  check('AC1', 'no draft: one «Planera pass», no Tomt pass/Från mall, «Hämta ett pass» present', plan === 1 && !/Tomt pass|Från mall|Starta från mall/.test(t) && /Hämta ett pass/.test(t), t.replace(/\s+/g, ' '))
  await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.waitForTimeout(300)
  check('AC1-hamta', '«Hämta ett pass» still expands its import panel inline (as main)', await p.getByRole('button', { name: 'Importera fil' }).isVisible())
  await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.waitForTimeout(200)
  const h = await docH(p); const rows = await footRows(p, '.home-foot-rows')
  await shot(p, '01_home_nodraft')
  const upd = await rect(p, '.footer-update'), adm = await rect(p, '.footer-admin-login')
  check('AC3-nodraft', 'no draft: doc height ≤ 844; Uppdatera appen + Logga in som admin on screen', h <= 844 && upd.bottom <= 844 && adm && adm.bottom <= 844, `h=${h} upd=${upd.bottom} adm=${adm?.bottom}`)
  const texts = rows.map((r) => r.text)
  const ok4 = texts[0] === 'Tyck till · Uppdatera appen' && texts[1] === 'Logga in som admin' && texts[2] === 'Passen sparas bara på den här enheten.' && parseFloat(rows[2].fs) <= 12
  const seps = rows.every((r) => !/sep/.test(r.first) && !/sep/.test(r.last))
  const centre = rows.every((r) => r.mids.length < 2 || Math.max(...r.mids) - Math.min(...r.mids) <= 1)
  const tall = rows.every((r) => r.linkH.every((x) => x >= 44))
  check('AC4', 'footer rows: Tyck till · Uppdatera appen / Logga in som admin / note ≤ 12 px; no edge «·»; one centre line; links ≥ 44 px', ok4 && seps && centre && tall, JSON.stringify(rows.map((r) => [r.text, r.fs, r.mids, r.linkH])))
  // AC6: mailto tap — block navigation, check hint row + nothing pushed off-screen
  await p.route(/^mailto:/, (r) => r.abort()).catch(() => {})
  await p.evaluate(() => document.querySelector('.footer-feedback').addEventListener('click', (e) => e.preventDefault(), { once: true }))
  await p.locator('.footer-feedback').click(); await p.waitForTimeout(300)
  const hint = await rect(p, '.footer-feedback-hint'); const h2 = await docH(p); const adm2 = await rect(p, '.footer-admin-login')
  await shot(p, '02_home_tyck_till_hint')
  check('AC6', 'Tyck till shows the address line as its own row; page still ≤ 844, admin row on screen', hint && h2 <= 844 && adm2.bottom <= 844, `hint=${JSON.stringify(hint)} h=${h2} adm=${adm2.bottom}`)
  const m = await page(); await home(m, MAIN); await shot(m, '01b_main_home_nodraft')
  check('AC3-main-ref', 'reference: main bc8cce0 doc height (no draft)', true, `main h=${await docH(m)} branch h=${h}`)
})

let draftLS = null
await attempt('AC2', async () => {
  const p = await page(); await home(p)
  await openPlan(p); await tap(p, '7–9 år'); await tap(p, 'Trampett'); await tap(p, GROP); await tap(p, '90 min'); await p.locator('.builder').waitFor()
  draftLS = await draftRaw(p)
  await home(p, BR, { [DRAFT]: draftLS })
  const btns = await p.locator('.home button').evaluateAll((bs) => bs.filter((b) => b.offsetParent && !b.closest('.home-foot-rows')).map((b) => [b.innerText.replace(/\s+/g, ' ').trim(), Math.round(b.getBoundingClientRect().height)]))
  const i = (re) => btns.findIndex(([t]) => re.test(t))
  const order = i(/^Fortsätt passet/) === 0 && i(/^Planera pass$/) === 1 && i(/^Rensa passet/) === 2
  check('AC2', 'with draft: Fortsätt passet (title · min) → Planera pass → Rensa passet, each ≥ 44 px', order && /·.*min/.test(btns[0][0]) && btns.slice(0, 3).every(([, h]) => h >= 44), JSON.stringify(btns))
  const h = await docH(p); const adm = await rect(p, '.footer-admin-login'), upd = await rect(p, '.footer-update')
  await shot(p, '03_home_draft')
  check('AC3-draft', 'with draft: doc height ≤ 844; Uppdatera appen + Logga in som admin on screen', h <= 844 && adm.bottom <= 844 && upd.bottom <= 844, `h=${h} adm=${adm.bottom}`)
  const m = await page(); await home(m, MAIN, { [DRAFT]: draftLS }); await shot(m, '03b_main_home_draft')
  check('AC3-main-ref', 'reference: main bc8cce0 doc height (draft)', true, `main h=${await docH(m)} branch h=${h}`)
})

// ---------- sheet ----------
await attempt('AC7-10', async () => {
  const p = await page(); await home(p); await openPlan(p)
  const opts = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim())
  const t = await sheet(p).innerText()
  const close = await sheet(p).locator('button[aria-label*="Stäng"], .home-wizard-close').count()
  const back = await sheet(p).getByRole('button', { name: 'Tillbaka' }).count()
  await shot(p, '04_sheet_q1')
  check('AC7', 'Fråga 1 av 4 «Ålder», five chips, links Starta från mall + Tomt pass, no ×, only Avbryt', (await progress(p)) === 'Fråga 1 av 4' && (await heading(p)) === 'Ålder' && JSON.stringify(opts) === JSON.stringify(['4–6 år', '7–9 år', '10–12 år', '13–18 år', 'Nivå']) && /Starta från mall/.test(t) && /Tomt pass/.test(t) && close === 0 && back === 0 && /Avbryt/.test(t), `${opts.join('|')} close=${close} back=${back}`)
  const focus0 = await p.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.textContent)
  // AC8: chosen state, auto-advance ≈ 0.25 s, double tap advances once
  const o = opt(p, '7–9 år'); const box = await o.boundingBox()
  await p.mouse.click(box.x + 20, box.y + 10); await p.mouse.click(box.x + 20, box.y + 10)
  await p.waitForTimeout(80); const sel = await o.getAttribute('aria-selected').catch(() => 'gone')
  await p.waitForTimeout(400)
  const nextBtn = await sheet(p).getByRole('button', { name: /Nästa|Skapa pass/ }).count()
  check('AC8', 'chip marked chosen, Fråga 2 av 4 «Fokus» in ~0.3 s, no Nästa, double tap = one step', sel === 'true' && (await progress(p)) === 'Fråga 2 av 4' && (await heading(p)) === 'Fokus' && nextBtn === 0, `sel=${sel} ${await progress(p)}`)
  check('AC19-focus', 'focus moved to the new heading after advance', await p.evaluate(() => document.activeElement?.tagName === 'H2'), focus0)
  check('AC19-live', 'progress line aria-live, chips are role=option buttons with aria-selected', await p.evaluate(() => { const s = document.querySelector('.home-wizard-sheet'); const live = [...s.querySelectorAll('[aria-live]')].some((e) => /Fråga/.test(e.textContent)); const chips = [...s.querySelectorAll('[role=option]')]; return live && chips.length > 0 && chips.every((c) => c.tagName === 'BUTTON' && c.hasAttribute('aria-selected')) }))
  const f = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim()); const ft = await sheet(p).innerText()
  await shot(p, '05_sheet_q2')
  await tap(p, 'Trampett')
  const hallOpts = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim())
  check('AC9', 'Fokus: Satsbräda · Trampett · Tumbling · Blandat, no station/zone line; Hall: exactly the two Gymmix chips', JSON.stringify(f) === '["Satsbräda","Trampett","Tumbling","Blandat"]' && !/[Ss]tation|zon/.test(ft) && (await progress(p)) === 'Fråga 3 av 4' && JSON.stringify(hallOpts) === JSON.stringify([STORA, GROP]), `${f.join('|')} / ${hallOpts.join('|')}`)
  await shot(p, '06_sheet_q3')
  await tap(p, GROP)
  const lens = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim())
  const pre = await sheet(p).locator('[role=option][aria-selected=true]').count()
  await shot(p, '07_sheet_q4')
  await tap(p, '90 min'); await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  const body = await p.locator('body').innerText(); const len = await lengthOf(p)
  await shot(p, '08_builder_after_wizard')
  const hn = await hallName(p)
  // Slice 52: A1 — Slice 49 A1 «längden styr tiderna»: the sum is exactly the chosen length.
  check('AC10', 'Passlängd 60/90/120 none preselected → «Pass — trampett», «90 / 90 min», Grophallen', JSON.stringify(lens) === '["60 min","90 min","120 min"]' && pre === 0 && (await draft(p)).title === 'Pass — trampett' && len === '90 / 90 min' && hn === GROP, `${lens.join('|')} pre=${pre} len=${len} hall=${hn}`)
  const d = await draft(p)
  check('AC10-placed', 'Teknik items placed on the Grophallen grid', d.hallTemplateId === 'forening-vit' && (d.hallPlacements ?? []).length >= 1, `${d.hallTemplateId} ${(d.hallPlacements ?? []).length}`)
  await shot(p, '09_hall_grophallen')
})

await attempt('AC11', async () => {
  const p = await page(); await home(p); await openPlan(p)
  await opt(p, 'Nivå').click(); await p.waitForTimeout(300)
  const lv = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim()); const t = await sheet(p).innerText()
  await shot(p, '10_sheet_niva')
  const ok1 = lv.slice(0, 9).join('|') === 'Nivå 9|Nivå 8|Nivå 7|Nivå 6|Nivå 5|Nivå 4|Nivå 3|Nivå 2|Nivå 1' && t.includes('Nivå 9 är den lägsta. Nivå 1 är den högsta.')
  await sheet(p).getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(250)
  const backAge = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim()).includes('7–9 år')
  await opt(p, 'Nivå').click(); await p.waitForTimeout(300); await tap(p, 'Nivå 3')
  const h = await heading(p)
  await tap(p, 'Blandat'); await tap(p, STORA); await tap(p, '60 min'); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  const d = await draft(p)
  check('AC11', 'Nivå list 9…1 + hint; Tillbaka → age chips; Nivå 3 → Fokus; title «Nivå 3 — …»', ok1 && backAge && h === 'Fokus' && /^Nivå 3 — /.test(d.title), `${lv.join('|')} back=${backAge} h=${h} title=${d.title}`)
})

await attempt('AC12', async () => {
  const p = await page(); await home(p); await openPlan(p)
  await tap(p, '10–12 år'); await tap(p, 'Tumbling')
  const log = []
  await sheet(p).getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(250)
  log.push([await progress(p), await heading(p), await sheet(p).locator('[role=option][aria-selected=true]').innerText().catch(() => '-')])
  await sheet(p).getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(250)
  log.push([await progress(p), await heading(p), await sheet(p).locator('[role=option][aria-selected=true]').innerText().catch(() => '-')])
  await tap(p, '10–12 år'); log.push([await progress(p), await heading(p)])
  await tap(p, 'Satsbräda'); await tap(p, GROP)
  await sheet(p).getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(250)
  log.push([await progress(p), await heading(p), await sheet(p).locator('[role=option][aria-selected=true]').innerText().catch(() => '-')])
  await tap(p, STORA); await tap(p, '120 min'); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  const d = await draft(p)
  const exp = log[0][0] === 'Fråga 2 av 4' && log[0][2] === 'Tumbling' && log[1][0] === 'Fråga 1 av 4' && log[1][2] === '10–12 år' && log[2][0] === 'Fråga 2 av 4' && log[3][0] === 'Fråga 3 av 4' && log[3][2] === GROP
  check('AC12', 'Tillbaka shows earlier answer marked, progress updates, re-tap moves on, new answer replaces', exp && /satsbräda/i.test(d.title) && d.hallTemplateId === 'forening-bla', JSON.stringify(log) + ' ' + d.title + ' ' + d.hallTemplateId)
})

// AC13: Avbryt everywhere + tap outside, draft identical, focus on Planera pass
await attempt('AC13', async () => {
  const p = await page(); const out = []
  const paths = {
    q1: [], q2: ['7–9 år'], q3: ['7–9 år', 'Trampett'], q4: ['7–9 år', 'Trampett', GROP], niva: ['Nivå'],
    tomt_hall: ['@Tomt pass'], tomt_len: ['@Tomt pass', GROP], mall_hall: ['@Starta från mall'], mall_list: ['@Starta från mall', STORA],
  }
  for (const withDraft of [false, true]) for (const [k, steps] of Object.entries(paths).concat([['outside', ['7–9 år']]])) {
    await home(p, BR, withDraft ? { [DRAFT]: draftLS } : {}); const before = await draftRaw(p); await openPlan(p)
    for (const s of steps) { if (s.startsWith('@')) { await sheet(p).getByRole('button', { name: s.slice(1), exact: true }).click(); await p.waitForTimeout(300) } else if (s === 'Nivå') { await opt(p, s).click(); await p.waitForTimeout(250) } else await tap(p, s) }
    if (k === 'outside') await p.mouse.click(195, 60); else await sheet(p).getByRole('button', { name: 'Avbryt' }).click()
    await p.waitForTimeout(350)
    const closed = (await sheet(p).count()) === 0, same = (await draftRaw(p)) === before
    const foc = await p.evaluate(() => document.activeElement?.textContent?.trim())
    out.push(`${withDraft ? 'D' : '-'}${k}:${closed && same && foc === 'Planera pass' ? 'ok' : `closed=${closed} same=${same} focus=${foc}`}`)
  }
  check('AC13', 'Avbryt on q1–q4, Nivå, Tomt pass ×2, mall ×2 and outside tap (no draft + draft): closes, draft identical, focus Planera pass', out.every((s) => s.endsWith(':ok')), out.join(' '))
})

await attempt('AC14', async () => {
  const p = await page(); await home(p); await openPlan(p)
  await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(300)
  const a = [await progress(p), await heading(p)]
  await sheet(p).getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(250)
  const backH = await heading(p)
  await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(300)
  await shot(p, '11_sheet_tomt_hall')
  await tap(p, GROP); const b = [await progress(p), await heading(p)]
  await tap(p, '120 min'); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  const len = await lengthOf(p); const items = await p.locator('.builder').innerText()
  await shot(p, '12_builder_tomt')
  const saved = await draftRaw(p) // a blank pass is not written until edited (as main goNew)
  // empty Hallöversikt shows no hall name and a blank pass is not autosaved — «Spara som egen mall» writes the pass incl. its hall
  await menu(p, 'Spara som egen mall'); await p.waitForTimeout(500)
  const ok = p.locator('[role=dialog] button').filter({ hasText: /^Spara/ }); if (await ok.count()) { await ok.first().click(); await p.waitForTimeout(400) }
  const tp = await p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TPL)
  const hn = tp[0]?.pass?.hallTemplateId === 'forening-vit' ? GROP : String(tp[0]?.pass?.hallTemplateId)
  const blank = /Närvaro/.test(items) && /Dagens pass/.test(items) && !/Uppvärmningsvarv|Ljushopp/.test(items)
  check('AC14', 'Tomt pass: Fråga 1 av 2 Hall → Fråga 2 av 2 Passlängd → 120 → empty pass «… / 120 min» on Grophallen; Tillbaka → Ålder', a.join() === 'Fråga 1 av 2,Hall' && backH === 'Ålder' && b.join() === 'Fråga 2 av 2,Passlängd' && /\/ 120 min$/.test(len ?? '') && hn === GROP && blank, `${a} ${backH} ${b} len=${len} hall=${hn} blank=${blank} draftWritten=${saved !== null}`)
})

await attempt('AC15', async () => {
  const p = await page({ club: true }); await home(p, BR, { [TPL]: JSON.stringify(FIX.saved) }); await openPlan(p)
  await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(300)
  const a = [await progress(p), await heading(p)]
  await tap(p, GROP); await p.waitForTimeout(400)
  const b = [await progress(p), await heading(p)]; const t = await sheet(p).innerText()
  await shot(p, '13_sheet_mall_list')
  const lists = /Föreningens mallar/.test(t) && /Klubbmall test/.test(t) && /Mina mallar/.test(t) && /Min testmall/.test(t) && /Nybörjare/.test(t) && /Kort pass/.test(t)
  const tools = !/Kopiera delningskod|Ta bort|Hantera|Lägg till i föreningen/.test(t)
  check('AC17-sheet', 'Mall step has no admin tools, no Kopiera delningskod, no Ta bort', tools, t.replace(/\s+/g, ' ').slice(0, 400))
  await sheet(p).locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await pickLength(p) /* Slice 55 */; await p.locator('.builder').waitFor(); await p.waitForTimeout(500)
  const toast = await p.locator('body').innerText()
  await shot(p, '14_builder_mall_toast')
  const d = await draft(p)
  check('AC15', 'Starta från mall: Fråga 1 av 3 Hall → Fråga 2 av 3 Mall (Slice 55: then Passlängd) listing Föreningens/Mina/Nybörjare/Kort pass → Nybörjare on Grophallen with toast «Mallen är i Passbyggaren. · Ångra»', a.join() === 'Fråga 1 av 3,Hall' && b.join() === 'Fråga 2 av 3,Mall' && lists && /Mallen är i Passbyggaren\./.test(toast) && /Ångra/.test(toast) && d.hallTemplateId === 'forening-vit' && (d.hallPlacements ?? []).length >= 1, `${a} ${b} lists=${lists} hall=${d.hallTemplateId} pl=${(d.hallPlacements ?? []).length}`)
  await p.getByRole('button', { name: 'Ångra' }).first().click(); await p.waitForTimeout(400)
  const u = await draft(p)
  check('AC15-undo', 'Ångra returns to a blank pass on the answered hall', u.hallTemplateId === 'forening-vit' && !/Nybörjare/.test(u.title), `${u.title} ${u.hallTemplateId}`)
})

await attempt('AC16', async () => {
  const want = xy(FIX.placements); const out = []
  for (const [hall, kind, name] of [[STORA, 'saved', 'Min testmall'], [GROP, 'saved', 'Min testmall'], [GROP, 'club', 'Klubbmall test'], [STORA, 'club', 'Klubbmall test']]) {
    const p = await page({ club: true }); await home(p, BR, { [TPL]: JSON.stringify(FIX.saved) }); await openPlan(p)
    await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(300); await tap(p, hall); await p.waitForTimeout(500)
    await sheet(p).locator('.template-card').filter({ hasText: name }).first().click(); await pickLength(p) /* Slice 55 */; await p.locator('.builder').waitFor(); await p.waitForTimeout(500)
    const d = await draft(p); const got = xy(d.hallPlacements ?? [])
    out.push({ hall, kind, hallId: d.hallTemplateId, n: (d.hallPlacements ?? []).length, kept: got === want })
    if (kind === 'saved' && hall === GROP) await shot(p, '15_builder_mina_grophallen')
    await p.context().close()
  }
  const [s1, s2, c1, c2] = out
  check('AC16', 'Mina mall: same hall keeps placements, Grophallen re-places; Föreningens mall: hall as answered, markers placed', s1.hallId === 'forening-bla' && s1.kept && s2.hallId === 'forening-vit' && !s2.kept && s2.n === FIX.placements.length && c1.hallId === 'forening-vit' && c1.n >= 1 && c2.hallId === 'forening-bla' && c2.n >= 1, JSON.stringify(out))
})

await attempt('AC17', async () => {
  const p = await page({ club: true }); await home(p, BR, { [TPL]: JSON.stringify(FIX.saved), [DRAFT]: draftLS })
  await p.getByRole('button', { name: /^Fortsätt passet/ }).click(); await p.locator('.builder').waitFor()
  // Slice 52: A1 — Slice 47 A1 removed the tab row in Lägg till övning; the mall groups and the Mina mallar actions
  // live in «Använd mall» (MallSheet) in Passbyggaren.
  await menu(p, 'Använd mall'); await p.locator('.mall-sheet').waitFor(); await p.waitForTimeout(400)
  const t = await p.locator('.mall-sheet').innerText()
  await shot(p, '16_anvand_mall')
  check('AC17-usemall', '«Använd mall» lists Föreningens mallar and Mina mallar and keeps Kopiera delningskod / Ta bort on Mina mallar', /Föreningens mallar/.test(t) && /Mina mallar/.test(t) && /Kopiera delningskod/.test(t) && /Ta bort/.test(t), t.replace(/\s+/g, ' ').match(/Föreningens mallar.{0,300}/)?.[0])
})

await attempt('AC18', async () => {
  const p = await page(); await home(p, BR, { [DRAFT]: draftLS }); const before = await draft(p)
  await openPlan(p); await tap(p, '4–6 år'); await tap(p, 'Satsbräda'); await tap(p, STORA); await tap(p, '60 min'); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  const confirm = await p.locator('[role=alertdialog]').count(); const d = await draft(p)
  check('AC18', 'with draft: four answers replace the draft without asking', confirm === 0 && d.id !== before.id && /satsbräda/i.test(d.title), `${before.title} → ${d.title}`)
})

await attempt('AC20', async () => {
  const p = await page(); await home(p, BR, { [DRAFT]: draftLS })
  await p.getByRole('button', { name: /^Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  await p.locator('footer').scrollIntoViewIfNeeded()
  const rows = await footRows(p, 'footer.app-footer')
  await shot(p, '17_builder_footer')
  const tx = rows.map((r) => r.text)
  const seps = rows.every((r) => !/sep/.test(r.first) && !/sep/.test(r.last))
  check('AC20', 'builder footer: Tyck till · Visa tips igen · Uppdatera appen / Logga in som admin / «Träningsplaneraren · Slice 46»; no edge «·»', tx[0] === 'Tyck till · Visa tips igen · Uppdatera appen' && tx.includes('Logga in som admin') && tx.at(-1) === FOOT && seps, JSON.stringify(tx))
  await p.locator('.footer-visa-tips').click(); await p.waitForTimeout(300)
  const st = await p.locator('.visa-tips-feedback').innerText().catch(() => '')
  check('AC20-tips', 'Visa tips igen shows its status line', st.length > 0, st)
  await hallName(p); await p.locator('footer').scrollIntoViewIfNeeded().catch(() => {})
  const hr = await footRows(p, 'footer.app-footer')
  await shot(p, '18_hall_footer')
  check('AC20-hall', 'Hallöversikt footer ends with «Träningsplaneraren · Slice 46»', hr.at(-1)?.text === FOOT, JSON.stringify(hr.map((r) => r.text)))
})

await attempt('AC21', async () => {
  for (const [vp, n] of [[{ width: 844, height: 390 }, 'landscape'], [{ width: 1280, height: 800 }, 'desktop']]) {
    const p = await page({ vp }); await home(p); await shot(p, `19_${n}_home`)
    const m = await page({ vp }); await home(m, MAIN); await shot(m, `19b_${n}_main_home`)
    const heroB = await rect(p, '.home-hero, .home-art, .home-visual'), heroM = await rect(m, '.home-hero, .home-art, .home-visual')
    await openPlan(p); await tap(p, '7–9 år'); await tap(p, 'Trampett')
    const av = sheet(p).getByRole('button', { name: 'Avbryt' }); await av.scrollIntoViewIfNeeded(); const ab = await av.boundingBox()
    const sc = await p.evaluate(() => { const s = document.querySelector('.home-wizard-sheet'); return [s.scrollHeight, s.clientHeight, getComputedStyle(s).overflowY] })
    await shot(p, `20_${n}_sheet`)
    await av.click(); await p.waitForTimeout(300)
    const upd = await rect(p, '.footer-update')
    check(`AC21-${n}`, `${n}: sheet Avbryt reachable, footer usable, hero layout as main`, ab && ab.y + ab.height <= vp.height && (await sheet(p).count()) === 0 && upd && heroB.w === heroM.w && heroB.top === heroM.top, `avbryt=${ab && Math.round(ab.y + ab.height)} sheet=${sc} upd=${JSON.stringify(upd)} heroB=${JSON.stringify(heroB)} heroM=${JSON.stringify(heroM)}`)
  }
})

await attempt('AC22', async () => {
  const p = await page(); await home(p, BR, { [DRAFT]: draftLS })
  await p.getByRole('button', { name: /^Fortsätt passet/ }).click(); await p.locator('.builder').waitFor()
  await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(200)
  const vis = await p.evaluate(() => [...document.querySelectorAll('footer, .app-footer, .app-footer-note, .home-foot-rows')].filter((e) => e.offsetParent || getComputedStyle(e).display !== 'none').length)
  await shot(p, '21_print_builder')
  check('AC22', 'print media: no footer rows, no note', vis === 0, `visible=${vis}`)
})


// Follow-up M1: every sheet step at 844×390 (and 390×844, 320×568) — sheet fits the viewport; Avbryt / Tillbaka reachable (scroll inside the sheet) and hit-testable
await attempt('M1', async () => {
  const steps = { q1: [], niva: ['Nivå'], q2: ['7–9 år'], q3: ['7–9 år', 'Trampett'], q4: ['7–9 år', 'Trampett', GROP], tomt_hall: ['@Tomt pass'], tomt_len: ['@Tomt pass', GROP], mall_hall: ['@Starta från mall'], mall_list: ['@Starta från mall', STORA] }
  for (const vp of [{ width: 844, height: 390 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    const p = await page({ vp, club: true }); const out = []
    for (const [k, path] of Object.entries(steps)) {
      await home(p); await openPlan(p)
      for (const s of path) { if (s.startsWith('@')) { await sheet(p).getByRole('button', { name: s.slice(1), exact: true }).click(); await p.waitForTimeout(300) } else if (s === 'Nivå') { await opt(p, s).click(); await p.waitForTimeout(250) } else await tap(p, s) }
      const sh = await sheet(p).boundingBox(); const bad = []
      if (sh.y < -1 || sh.y + sh.height > vp.height + 1) bad.push(`sheet ${Math.round(sh.y)}+${Math.round(sh.height)}`)
      for (const name of ['Avbryt', 'Tillbaka']) {
        const b = sheet(p).getByRole('button', { name, exact: true })
        if (!(await b.count())) { if (name === 'Avbryt' || k !== 'q1') bad.push(`${name} missing`); continue }
        await b.scrollIntoViewIfNeeded(); const r = await b.boundingBox()
        const hit = await b.evaluate((el) => { const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === el || el.contains(h) })
        if (!r || r.y < 0 || r.y + r.height > vp.height || !hit) bad.push(`${name} y=${r && Math.round(r.y)} hit=${hit}`)
      }
      if (k === 'q4' && vp.width === 844) await shot(p, '22_landscape_q4_sheet')
      if (k === 'mall_list' && vp.width === 844) await shot(p, '23_landscape_mall_sheet')
      out.push(`${k}:${bad.length ? bad.join(',') : 'ok'}`)
    }
    // Avbryt actually closes after scrolling (landscape, Passlängd step)
    await home(p); await openPlan(p); for (const s of ['7–9 år', 'Trampett', GROP]) await tap(p, s)
    const av = sheet(p).getByRole('button', { name: 'Avbryt' }); await av.scrollIntoViewIfNeeded(); await av.click(); await p.waitForTimeout(300)
    const closed = (await sheet(p).count()) === 0
    check(`M1-${vp.width}x${vp.height}`, `${vp.width}×${vp.height}: every step — sheet inside viewport, Avbryt/Tillbaka reachable and clickable`, out.every((x) => x.endsWith(':ok')) && closed, out.join(' ') + ` closed=${closed}`)
    await p.context().close()
  }
})

// Follow-up m2: the start-page footer rows are a footer landmark again (exactly one contentinfo on the start page)
await attempt('m2', async () => {
  const p = await page(); await home(p)
  const lm = await p.evaluate(() => [...document.querySelectorAll('footer, [role=contentinfo]')].filter((e) => !e.closest('article,aside,main,nav,section') || e.getAttribute('role') === 'contentinfo').map((e) => e.className))
  const n = await p.getByRole('contentinfo').count()
  check('m2', 'start page: footer rows inside a <footer> landmark (one contentinfo)', n === 1 && lm.some((c) => /home-foot-rows/.test(c)), `contentinfo=${n} ${lm.join('|')}`)
})

check('errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-46-smoke-results.json`, JSON.stringify(results, null, 2))
const fail = results.filter((r) => !r.ok); console.log(`\n${results.length - fail.length}/${results.length} pass`)
await browser.close()
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

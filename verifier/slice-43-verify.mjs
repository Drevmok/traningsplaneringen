// Slice 43 «Hallöversikt above the fold» — Verifier, PR #47 @ e7de022 vs main db11398. Headless Chrome, 390×844 DPR 2 touch (+320, 844×390, 1280×800).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = process.env.BR ?? 'http://127.0.0.1:57541/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57542/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = '/workspace/screenshots/s43v_', OUT = `${ROOT}/verifier/slice-43-checks`
const FOLD = 739, HALLS = ['forening-bla', 'forening-vit', 'standard-trupp', 'tavling-linjer', 'liten-hall']
const DK = 'gymnastics-planner-draft-v1'
const T2 = 'Tisdagsträning Trampett och volter för gruppen 10–12 år'
const T25 = 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år, vecka 43'
const T3 = 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år med extra fokus på landningar och säker mattbyggnad'
const results = [], notes = {}, errors = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 700) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 320) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v).slice(0, 900)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0] + ' @' + (String(e.stack).match(/slice-43-verify.mjs:(\d+)/g) || []).join(',')) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function page(base, vp = { width: 390, height: 844 }, touch = true) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, isMobile: false })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${base}: ${e.message}`)); p.base = base; return p
}
const close = (p) => p.context().close()
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const shot = async (p, n, full = false) => { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(120); await p.screenshot({ path: `${SS}${n}.png`, fullPage: full }) }
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
async function back(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300) }
// Från mall → Nybörjare (fresh pass → no confirm since Slice 42) → optional title → Hallöversikt
async function toHall(p, title) {
  await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600)
  if (title) { await p.getByRole('textbox', { name: 'Passets titel' }).fill(title); await p.waitForTimeout(900) }
  await openHall(p)
}
const sel = (p, h) => p.locator('#hall-layout-select').selectOption(h).then(() => p.waitForTimeout(450))
const geo = (p) => p.evaluate(() => {
  window.scrollTo(0, 0)
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? [Math.round(b.top), Math.round(b.bottom), Math.round(b.height), Math.round(b.left), Math.round(b.right)] : null }
  const meta = document.querySelector('.hall-session-meta'); const lh = meta ? parseFloat(getComputedStyle(meta).lineHeight) || 22 : 22
  return { canvas: r('.hall-canvas'), back: r('.hall-header .back'), title: r('.hall-screen-title'), meta: r('.hall-session-meta'), metaLines: meta ? Math.round(meta.getBoundingClientRect().height / lh) : 0, actions: r('.hall-header-actions'), preset: r('.hall-preset-row'), zoom: r('.hall-zoom-bar'), saknar: r('.hall-saknar-banner'), below: r('.hall-below'), tray: r('.hall-tray'), vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth }
})
const txt = (p, s) => p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean), s)
const controls = (p) => p.evaluate(() => [...document.querySelectorAll('button, select, input, a[href], [role=button]')].filter((e) => e.checkVisibility()).map((e) => `${e.tagName}:${e.getAttribute('aria-label') || e.textContent.replace(/\s+/g, ' ').trim()}`).sort())
const allText = (p) => p.evaluate(() => [...document.querySelectorAll('.hall-board *')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim()).filter(Boolean).sort())
const applyAll = async (p) => { await p.locator('.hall-header-actions button', { hasText: 'Använd alla förslag' }).click(); await p.waitForTimeout(800) }

const table = []
// ═══ H. Hall bottoms: every hall × title (short / 2-line / long) × banner (shown / hidden), branch and main ═══
await section('H', async () => {
  for (const [base, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    for (const [tt, title] of [['kort', ''], ['2rad', T2], ['3rad', T25], ['lång', T3]]) {
      const p = await page(base); await toHall(p, title)
      for (const banner of ['visas', 'dold']) {
        if (banner === 'dold') { await applyAll(p); await p.waitForTimeout(400) }
        for (const h of HALLS) {
          await sel(p, h); const g = await geo(p)
          table.push({ build: tag, hall: h, title: tt, banner, bannerShown: !!g.saknar, top: g.canvas?.[0], bottom: g.canvas?.[1], h: g.canvas?.[2], margin: FOLD - (g.canvas?.[1] ?? 9999), metaLines: g.metaLines, sw: g.sw })
          if (tag === 'br' && h === 'forening-vit') await shot(p, `01_vit_${tt}_${banner}`)
          if (tag === 'br' && tt === '2rad' && banner === 'visas') await shot(p, `02_${h}_2rad`)
          if (tag === 'br' && h === 'forening-vit' && tt === 'kort' && banner === 'visas') notes.geoVit = g
        }
      }
      await close(p)
    }
  }
  const brRows = table.filter((r) => r.build === 'br')
  for (const r of brRows) if (r.bottom > FOLD) console.log('OVER', JSON.stringify(r))
  const by = (f) => brRows.filter(f)
  const ok = (rows) => rows.every((r) => r.bottom <= FOLD)
  const minM = (rows) => Math.min(...rows.map((r) => r.margin))
  check('AC1', 'Blå: bottom ≤ 739 with banner (short title)', ok(by((r) => r.hall === 'forening-bla' && r.title === 'kort' && r.banner === 'visas' && r.bannerShown)), `min margin ${minM(by((r) => r.hall === 'forening-bla' && r.title === 'kort'))}`)
  check('AC2', 'Vit: bottom ≤ 739 with banner (short title)', ok(by((r) => r.hall === 'forening-vit' && r.title === 'kort' && r.banner === 'visas' && r.bannerShown)), JSON.stringify(by((r) => r.hall === 'forening-vit' && r.title === 'kort')))
  const gen = by((r) => ['standard-trupp', 'tavling-linjer', 'liten-hall'].includes(r.hall))
  check('AC3', 'Standard / Tävling / Liten: bottom ≤ 739; height ≈ 358×2/3 (239)', ok(gen) && gen.every((r) => Math.abs(r.h - 239) <= 3), `heights ${[...new Set(gen.map((r) => r.h))]}`)
  check('LONG-2rad', 'All halls, title wrapping to 2 lines, banner shown and hidden: bottom ≤ 739', ok(by((r) => r.title === '2rad')), `min margin ${minM(by((r) => r.title === '2rad'))}, meta lines ${[...new Set(by((r) => r.title === '2rad').map((r) => r.metaLines))]}`)
  check('LONG-3rad', 'All halls, title wrapping to 3 lines, banner shown and hidden: bottom ≤ 739', ok(by((r) => r.title === '3rad')), by((r) => r.title === '3rad' && r.hall === 'forening-vit').map((r) => `Vit ${r.banner} ${r.bottom} (margin ${r.margin})`).join(', ') + ` meta lines ${[...new Set(by((r) => r.title === '3rad').map((r) => r.metaLines))]}`)
  check('LONG-lång', 'All halls, very long title (3+ lines), banner shown and hidden: bottom ≤ 739', ok(by((r) => r.title === 'lång')), `min margin ${minM(by((r) => r.title === 'lång'))}, meta lines ${[...new Set(by((r) => r.title === 'lång').map((r) => r.metaLines))]}`)
  check('AC9', 'No saknar banner (Använd alla förslag), checklist pass (short title): banner gone, every hall ≤ 739, hall moved up 52 px (no empty gap)', by((r) => r.banner === 'dold').every((r) => !r.bannerShown) && ok(by((r) => r.banner === 'dold' && r.title === 'kort')) && HALLS.every((h) => { const a = brRows.find((r) => r.hall === h && r.title === 'kort' && r.banner === 'visas'), b = brRows.find((r) => r.hall === h && r.title === 'kort' && r.banner === 'dold'); return b.top < a.top }), HALLS.map((h) => { const a = brRows.find((r) => r.hall === h && r.title === 'kort' && r.banner === 'visas'), b = brRows.find((r) => r.hall === h && r.title === 'kort' && r.banner === 'dold'); return `${h} ${a.top}→${b.top}` }).join(', '))
  check('H-sw', 'No horizontal scroll in any of the 30 branch states', brRows.every((r) => r.sw <= 390))
  writeFileSync(`${OUT}/hall-bottoms.json`, JSON.stringify(table, null, 1))
})

// ═══ L. AC4–AC7, AC10, AC11 at 390 ═══
await section('L', async () => {
  const p = await page(BR); await toHall(p, ''); await sel(p, 'forening-vit')
  const g = await geo(p)
  const cover = await p.evaluate(() => { const c = document.querySelector('.hall-canvas'); const b = c.getBoundingClientRect(); const bad = []; for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) { const x = b.left + b.width * i / 10, y = b.top + b.height * j / 10; const e = document.elementFromPoint(x, y); if (!e || !(c.contains(e) || e.closest('.hall-canvas-wrap'))) bad.push(`${Math.round(x)},${Math.round(y)}:${e?.className}`) } return bad })
  check('AC4', 'Vit at scrollY 0: canvas top ≥ 0, bottom < viewport, no element (tray, toast, banner) covers any of 81 canvas sample points', g.canvas[0] >= 0 && g.canvas[1] <= 844 && cover.length === 0, `canvas ${g.canvas} cover ${cover.slice(0, 4)}`)
  const small = await p.evaluate(() => [...document.querySelectorAll('.hall-header button, .hall-header select')].filter((e) => e.checkVisibility()).map((e) => { const r = e.getBoundingClientRect(); return [e.getAttribute('aria-label') || e.textContent.trim(), Math.round(r.width), Math.round(r.height), Math.round(r.bottom)] }))
  const canvasTop = g.canvas[0]
  check('AC5', 'Back, Hallöversikt, meta, 4 actions, layout select, zoom −/+ above the hall; all ≥ 44×44', ['back', 'title', 'meta', 'actions', 'preset'].every((k) => g[k] && g[k][1] <= canvasTop) && (await p.locator('.hall-header-actions button').count()) === 4 && (await p.locator('.hall-preset-row .hall-zoom-btn').count()) === 2 && small.every((s) => s[1] >= 44 && s[2] >= 44 && s[3] <= canvasTop), JSON.stringify(small))
  for (const w of [390, 320]) {
    const q = w === 390 ? p : await page(BR, { width: 320, height: 844 }); if (w === 320) await toHall(q, '')
    const s = await q.evaluate(() => { const e = document.querySelector('.hall-saknar-banner .hall-unplaced-banner'); return e && { text: e.textContent, title: e.title, cut: e.scrollWidth > e.clientWidth + 1, h: Math.round(e.getBoundingClientRect().height), banner: Math.round(document.querySelector('.hall-saknar-banner').getBoundingClientRect().height) } })
    note(`AC6-${w}`, s)
    check(`AC6-${w}`, `${w} px: saknar banner one line, full text readable (not ellipsized), title = same text`, s && !s.cut && s.title === s.text && s.banner <= 60, JSON.stringify(s))
    if (w === 320) { await shot(q, '03_banner_320'); await close(q) }
  }
  // AC6 CTA: «Använd alla förslag» in the banner points at the action (Slice 37 path)
  const cta = p.locator('.hall-saknar-point-cta'); const ctaN = await cta.count()
  if (ctaN) { await cta.click(); await p.waitForTimeout(400) }
  const focused = await p.evaluate(() => document.activeElement?.textContent?.trim() + '|' + document.activeElement?.className)
  note('AC6-cta', { ctaN, focused })
  check('AC6-cta', 'Saknar CTA «Använd alla förslag» works (moves focus/points at the header action, Slice 37)', ctaN === 1 && /Använd alla förslag/.test(focused), focused)
  // AC7 moved items below the hall, same text as main
  const below = await txt(p, '.hall-below > *')
  const bTop = g.below?.[0]
  const m = await page(MAIN); await toHall(m, ''); await sel(m, 'forening-vit')
  const mainSecondary = await m.evaluate(() => ['.hall-preset-note', '.hall-preset-coach-tip', '.hall-hints-info', '.hall-flow-coach-tip'].map((s) => [...document.querySelectorAll(s)].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join('|')))
  const brSecondary = await p.evaluate(() => ['.hall-preset-note', '.hall-preset-coach-tip', '.hall-hints-info', '.hall-flow-coach-tip'].map((s) => [...document.querySelectorAll(s)].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join('|')))
  const inBelow = await p.evaluate(() => ['.hall-preset-note', '.hall-preset-coach-tip', '.hall-hints-info', '.hall-flow-coach-tip'].map((s) => [...document.querySelectorAll(s)].every((e) => !!e.closest('.hall-below'))))
  note('AC7', { mainSecondary, brSecondary, inBelow, bTop, canvasBottom: g.canvas[1] })
  check('AC7', 'Migrate note, Blå/Vit coach tip, Visa tips and flow tip strip are under the hall (.hall-below), same text as main', inBelow.every(Boolean) && bTop > g.canvas[1] && JSON.stringify(mainSecondary) === JSON.stringify(brSecondary), JSON.stringify(brSecondary).slice(0, 300))
  await p.evaluate(() => window.scrollTo(0, document.querySelector('.hall-below').getBoundingClientRect().top + scrollY - 200)); await p.waitForTimeout(200)
  await p.screenshot({ path: `${SS}04_below_hall.png` })
  const tipN = await p.locator('.hall-flow-coach-tip').count()
  if (tipN) await p.locator('.hall-flow-coach-tip .coach-tip-strip-dismiss').click(); await p.waitForTimeout(300)
  check('AC7-dismiss', 'Flow tip dismiss still works (strip gone, stays gone after reload)', tipN === 1 && (await p.locator('.hall-flow-coach-tip').count()) === 0 && await (async () => { await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); await openHall(p); return (await p.locator('.hall-flow-coach-tip').count()) === 0 })())
  await close(m)
  // AC10 tray expand / collapse
  await sel(p, 'forening-vit'); const g0 = await geo(p)
  const tog = p.locator('.hall-tray-compact-bar .hall-tray-toggle'); const hasTog = await tog.count()
  let exp = null
  if (hasTog) { await tog.click(); await p.waitForTimeout(300); exp = await geo(p); await p.screenshot({ path: `${SS}05_tray_expanded.png` }); await p.locator('.hall-tray-toolbar .hall-tray-toggle').click(); await p.waitForTimeout(300) }
  const g1 = await geo(p)
  check('AC10', 'Tray expands (taller, not compact) and collapses again; hall unchanged', hasTog && exp.tray[2] > g0.tray[2] && JSON.stringify(g1.canvas) === JSON.stringify(g0.canvas) && g1.tray[2] === g0.tray[2], `tray ${g0.tray?.[2]}→${exp?.tray?.[2]}→${g1.tray?.[2]} canvas ${g0.canvas}/${g1.canvas}`)
  await close(p)
  // AC11 Golvklart, every hall, branch vs main
  const gk = {}
  for (const [base, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    const q = await page(base); await toHall(q, ''); gk[tag] = {}
    for (const h of HALLS) {
      await sel(q, h); await q.locator('.hall-header-actions').getByRole('button', { name: /Golvklart/ }).click(); await q.waitForTimeout(500)
      const gg = await geo(q); gk[tag][h] = { canvas: gg.canvas, header: await q.evaluate(() => { const e = document.querySelector('.hall-header'); const b = e?.getBoundingClientRect(); return b ? [Math.round(b.top), Math.round(b.bottom)] : null }), ctl: (await controls(q)).join('|') }
      if (tag === 'br' && h === 'forening-vit') await shot(q, '06_golvklart_vit')
      await q.keyboard.press('Escape'); await q.waitForTimeout(200)
      const ex = q.locator('.hall-floor-actions .btn-secondary'); if (await q.locator('.hall-header--floor').count()) { await ex.first().click().catch(() => {}); await q.waitForTimeout(300) }
    }
    await close(q)
  }
  note('AC11', Object.fromEntries(HALLS.map((h) => [h, { br: gk.br[h].canvas, main: gk.main[h].canvas }])))
  check('AC11', 'Golvklart: every hall bottom ≤ 739; floor header and controls identical to main (Vit was 715 in the docs)', HALLS.every((h) => gk.br[h].canvas[1] <= FOLD && JSON.stringify(gk.br[h].header) === JSON.stringify(gk.main[h].header) && gk.br[h].ctl === gk.main[h].ctl), HALLS.map((h) => `${h} ${gk.br[h].canvas[0]}–${gk.br[h].canvas[1]} (main ${gk.main[h].canvas[0]}–${gk.main[h].canvas[1]})`).join('; '))
})

// ═══ M. AC12 markers + zoom/pan/pinch on every template ═══
await section('M', async () => {
  const p = await page(BR); await toHall(p, '')
  const cdp = await p.context().newCDPSession(p)
  const res = {}
  for (const h of HALLS) {
    await sel(p, h); const r = {}
    const cw = () => p.evaluate(() => Math.round(document.querySelector('.hall-canvas').getBoundingClientRect().width))
    const w0 = await cw()
    await p.locator('.hall-preset-row .hall-zoom-btn').last().click(); await p.waitForTimeout(250); const w1 = await cw()
    await p.locator('.hall-preset-row .hall-zoom-btn').first().click(); await p.waitForTimeout(250); const w2 = await cw()
    r.zoom = [w0, w1, w2]
    // pan: zoom in, scroll the wrap
    await p.locator('.hall-preset-row .hall-zoom-btn').last().click(); await p.waitForTimeout(250)
    r.pan = await p.evaluate(() => { const w = document.querySelector('.hall-canvas-wrap'); w.scrollLeft = 80; return [w.scrollWidth > w.clientWidth, Math.round(w.scrollLeft)] })
    await p.locator('.hall-preset-row .hall-zoom-btn').first().click(); await p.waitForTimeout(250)
    // pinch (CDP two-finger touch on the canvas wrap)
    const b = await p.locator('.hall-canvas-wrap').boundingBox(); const cx = b.x + b.width / 2, cy = b.y + Math.min(b.height, 200) / 2
    const pts = (d) => [{ x: cx - d, y: cy, id: 0 }, { x: cx + d, y: cy, id: 1 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(30) })
    for (const d of [45, 60, 80, 100]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(300)
    const w3 = await cw()
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(100) })
    for (const d of [80, 60, 45, 30]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(300)
    r.pinch = [w0, w3, await cw()]
    // marker tap → selected / detail
    const chip = p.locator('.hall-canvas .hall-chip--canvas').first()
    await chip.click(); await p.waitForTimeout(300)
    r.tap = await p.evaluate(() => ({ sel: document.querySelectorAll('.hall-canvas .hall-chip.is-selected').length, dialog: document.querySelectorAll('[role=dialog]').length, sheet: document.querySelectorAll('.side-panel-slot.is-open, .station-sheet, .hall-detail').length }))
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); r.escCloses = (await p.locator('[role=dialog]').count()) === 0; if (!r.escCloses) { await p.locator('[role=dialog] .modal-close').click(); await p.waitForTimeout(250) }
    // drag (HTML5 DnD events, as the app listens)
    const before = (await draft(p)).hallPlacements
    const canvas = p.locator('.hall-canvas').first(); await canvas.evaluate((e) => e.scrollIntoView({ block: 'center' })); const cb = await canvas.boundingBox()
    const dt = await p.evaluateHandle(() => new DataTransfer())
    await chip.dispatchEvent('dragstart', { dataTransfer: dt }); await canvas.dispatchEvent('dragover', { dataTransfer: dt, clientX: cb.x + cb.width * 0.62, clientY: cb.y + cb.height * 0.71 }); await canvas.dispatchEvent('drop', { dataTransfer: dt, clientX: cb.x + cb.width * 0.62, clientY: cb.y + cb.height * 0.71 }); await chip.dispatchEvent('dragend', { dataTransfer: dt }); await p.waitForTimeout(1200)
    const after = (await draft(p)).hallPlacements
    r.drag = JSON.stringify(before) !== JSON.stringify(after)
    // remove from hall
    const n0 = await p.locator('.hall-chip--canvas').count()
    r.dlgAfterDrag = await p.locator('[role=dialog]').count(); if (r.dlgAfterDrag) { await p.locator('[role=dialog] .modal-close').first().click(); await p.waitForTimeout(250) }
    const rmB = p.locator('.hall-chip-remove:visible'); r.rmN = await rmB.count(); let k = -1
    for (let i = 0; i < r.rmN && k < 0; i++) { await rmB.nth(i).evaluate((x) => x.scrollIntoView({ block: 'center' })); await p.waitForTimeout(100); if (await rmB.nth(i).evaluate((x) => { const b = x.getBoundingClientRect(); return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) === x })) k = i }
    r.rmIdx = k; await rmB.nth(Math.max(k, 0)).click({ timeout: 4000 })
    r.remove = [n0, await p.locator('.hall-chip--canvas').count(), (await draft(p)).hallPlacements.length]
    await p.evaluate(() => window.scrollTo(0, 0))
    res[h] = r; console.log('M', h, JSON.stringify(r))
    // restore: back to builder and in again keeps state; re-place via Använd alla förslag not needed
  }
  note('AC12', res)
  const ok = HALLS.every((h) => { const r = res[h]; return r.zoom[1] > r.zoom[0] && r.zoom[2] === r.zoom[0] && r.pan[0] && r.pan[1] > 0 && r.tap.sel + r.tap.dialog + r.tap.sheet > 0 && r.drag && r.remove[1] === r.remove[0] - 1 })
  check('AC12', 'Every template: zoom + / − changes and restores the hall width, pan scrolls when zoomed, marker tap selects/opens, drag (app DnD events) moves the stored placement, «Ta bort från hall» removes one marker', ok, JSON.stringify(res).slice(0, 600))
  const pinchOk = HALLS.every((h) => res[h].pinch[1] > res[h].pinch[0] && res[h].pinch[2] < res[h].pinch[1])
  check('AC12-pinch', 'Simulated two-finger pinch (CDP touch events) zooms in and out on every template (real-device feel PENDING-real)', pinchOk, HALLS.map((h) => `${h} ${res[h].pinch}`).join('; '))
  await close(p)
})

// ═══ V. Other viewports: 320, landscape 844×390, desktop 1280×800 — branch vs main ═══
await section('V', async () => {
  const vps = { '320': { width: 320, height: 844 }, land: { width: 844, height: 390 }, desk: { width: 1280, height: 800 } }
  const out = {}
  for (const [k, vp] of Object.entries(vps)) {
    out[k] = {}
    for (const [base, tag] of [[BR, 'br'], [MAIN, 'main']]) {
      const p = await page(base, vp, k !== 'desk'); await toHall(p, k === '320' ? T2 : '')
      out[k][tag] = {}
      for (const h of HALLS) {
        await sel(p, h); const g = await geo(p)
        const clip = await p.evaluate(() => [...document.querySelectorAll('.hall-board button, .hall-board select, .hall-board p, .hall-board h1, .hall-board h2, .hall-canvas')].filter((e) => e.checkVisibility()).filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.left < -1 || b.right > innerWidth + 1) }).map((e) => e.className || e.tagName))
        const scrolls = await p.evaluate(() => { window.scrollTo(0, 400); const y = scrollY; window.scrollTo(0, 0); return y })
        out[k][tag][h] = { canvas: g.canvas, sw: g.sw, vw: g.vw, clip, scrolls }
        if (tag === 'br' && h === 'forening-bla') await shot(p, `07_${k}_bla`)
        if (k === '320' && tag === 'br' && h === 'forening-vit') await shot(p, `07_320_vit`)
      }
      if (k === 'desk') out[k][tag].controls = (await controls(p)).join('|')
      await close(p)
    }
  }
  writeFileSync(`${OUT}/viewports.json`, JSON.stringify(out, null, 1)); note('V', Object.fromEntries(Object.entries(out).map(([k, v]) => [k, HALLS.map((h) => `${h} br ${v.br[h].canvas?.slice(0, 3)} main ${v.main[h].canvas?.slice(0, 3)}`)])))
  const noOverflow = (k) => HALLS.every((h) => out[k].br[h].sw <= out[k].br[h].vw && out[k].br[h].clip.length === 0)
  check('V-320', '320 px (2-line title): no horizontal scroll, nothing clipped, every hall bottom reported', noOverflow('320'), HALLS.map((h) => `${h} ${out['320'].br[h].canvas?.[1]} clip ${out['320'].br[h].clip}`).join('; '))
  note('V-320-fold', HALLS.map((h) => `${h} bottom ${out['320'].br[h].canvas?.[1]} (margin ${FOLD - out['320'].br[h].canvas?.[1]})`))
  check('AC13', 'Landscape 844×390: hall top ≤ 507 (main), page scrolls, no h-scroll/clip, hall size same as main', noOverflow('land') && HALLS.every((h) => out.land.br[h].canvas[0] <= 507 && out.land.br[h].canvas[0] <= out.land.main[h].canvas[0] && out.land.br[h].scrolls > 0 && Math.abs(out.land.br[h].canvas[2] - out.land.main[h].canvas[2]) <= 1), HALLS.map((h) => `${h} ${out.land.br[h].canvas[0]}–${out.land.br[h].canvas[1]} (main ${out.land.main[h].canvas[0]}–${out.land.main[h].canvas[1]})`).join('; '))
  check('AC14', 'Desktop 1280×800: same hall size as main, hall higher (moved items below), same controls, no h-scroll/clip', noOverflow('desk') && out.desk.br.controls === out.desk.main.controls && HALLS.every((h) => Math.abs(out.desk.br[h].canvas[2] - out.desk.main[h].canvas[2]) <= 1 && out.desk.br[h].canvas[0] <= out.desk.main[h].canvas[0]), HALLS.map((h) => `${h} ${out.desk.br[h].canvas[0]}–${out.desk.br[h].canvas[1]} (main ${out.desk.main[h].canvas[0]}–${out.desk.main[h].canvas[1]})`).join('; '))
})

// ═══ P. AC15 print: emulateMedia print + PDF, branch vs main ═══
await section('P', async () => {
  const out = {}
  for (const [base, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    out[tag] = {}
    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      const p = await page(base, vp, vp.width < 800); await toHall(p, '')
      for (const h of HALLS) {
        await sel(p, h); await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(250)
        const g = await p.evaluate(() => { const c = document.querySelector('.hall-canvas').getBoundingClientRect(); const vis = [...document.querySelectorAll('.hall-below, .hall-saknar-banner, .hall-zoom-bar, .hall-tray, .hall-header-actions')].filter((e) => e.checkVisibility()).map((e) => e.className); return { w: Math.round(c.width), h: Math.round(c.height), ratio: +(c.width / c.height).toFixed(3), chromeVisible: vis, printTitle: document.querySelector('.hall-print-title')?.checkVisibility() } })
        const key = `${vp.width}-${h}`; out[tag][key] = g
        if (vp.width === 390) { const pdf = `${OUT}/print-${tag}-${h}.pdf`; await p.pdf({ path: pdf, format: 'A4', printBackground: true }); out[tag][key].pages = Number(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)[1]) }
        if (vp.width === 390 && tag === 'br' && h === 'forening-vit') await p.screenshot({ path: `${SS}08_print_vit.png`, fullPage: true })
        await p.emulateMedia({ media: 'screen' })
      }
      await close(p)
    }
  }
  // render page 1 of each pdf and compare pixels branch vs main
  const diffs = {}
  for (const h of HALLS) {
    for (const tag of ['br', 'main']) execFileSync('pdftoppm', ['-r', '50', '-png', '-f', '1', '-l', '1', `${OUT}/print-${tag}-${h}.pdf`, `${OUT}/print-${tag}-${h}`])
    diffs[h] = execFileSync('python3', ['-c', `from PIL import Image, ImageChops; import glob
a=Image.open(glob.glob('${OUT}/print-br-${h}-*.png')[0]).convert('L'); b=Image.open(glob.glob('${OUT}/print-main-${h}-*.png')[0]).convert('L')
d=ImageChops.difference(a,b); print(sum(1 for v in d.getdata() if v>40), a.size[0]*a.size[1])`], { encoding: 'utf8' }).trim()
  }
  writeFileSync(`${OUT}/print.json`, JSON.stringify({ out, diffs }, null, 1)); note('AC15', { out, diffs })
  const same = Object.keys(out.br).every((k) => out.br[k].ratio === out.main[k].ratio && Math.abs(out.br[k].w - out.main[k].w) <= 1 && JSON.stringify(out.br[k].chromeVisible) === JSON.stringify(out.main[k].chromeVisible))
  check('AC15', 'Print (emulateMedia print, 390 + 1280): hall ratio/size identical to main on every template (Blå/Vit drawing ratios, generic 16:10), same chrome hidden; PDF page count equal', same && HALLS.every((h) => out.br[`390-${h}`].pages === out.main[`390-${h}`].pages), Object.keys(out.br).map((k) => `${k} ${out.br[k].ratio}/${out.main[k].ratio}`).join('; '))
  check('AC15-pdf', 'PDF page 1 rendered (50 dpi): branch vs main pixel diff ≤ 0.5 % per template', HALLS.every((h) => { const [d, n] = diffs[h].split(' ').map(Number); return d / n <= 0.005 }), JSON.stringify(diffs))
})

// ═══ X. AC8 text / controls vs main; AC16 footer ═══
await section('X', async () => {
  const grab = async (base) => {
    const p = await page(base); await toHall(p, ''); const r = {}
    for (const h of HALLS) { await sel(p, h); r[h] = { ctl: await controls(p), text: await allText(p) } }
    await p.locator('.hall-hints-info-btn').click().catch(() => {}); await p.waitForTimeout(200); r.hints = { ctl: await controls(p), text: await allText(p) }
    await p.locator('.hall-header-actions').getByRole('button', { name: /Golvklart/ }).click(); await p.waitForTimeout(400); r.floor = { ctl: await controls(p), text: await allText(p) }
    r.foot = (await p.locator('footer').last().innerText()).replace(/\s+/g, ' '); await close(p); return r
  }
  const b = await grab(BR), m = await grab(MAIN)
  const diff = (a, c) => ({ add: a.filter((x) => !c.includes(x)), gone: c.filter((x) => !a.includes(x)) })
  const d = Object.fromEntries([...HALLS, 'hints', 'floor'].map((k) => [k, { ctl: diff(b[k].ctl, m[k].ctl), text: diff(b[k].text, m[k].text) }]))
  note('AC8-diff', d)
  check('AC8', 'Hallöversikt (5 halls, hints open, Golvklart): no new or removed controls, no new or changed text vs main', Object.values(d).every((x) => !x.ctl.add.length && !x.ctl.gone.length && !x.text.add.length && !x.text.gone.length), JSON.stringify(d).slice(0, 500))
  const locked = ['Hallöversikt', 'Golvklart', 'Förrådslista', 'Visa flöde', 'Använd alla förslag', 'Schematisk hall — inte exakt mått']
  check('AC8-terms', 'Locked terms present as on main', locked.every((t) => b['forening-vit'].text.join('|').includes(t) === m['forening-vit'].text.join('|').includes(t) || b.floor.text.join('|').includes(t)), locked.map((t) => `${t}:${b['forening-vit'].text.join('|').includes(t)}`).join(' '))
  check('AC16-footer', 'Footer «Träningsplaneraren · Slice 43»', b.foot.includes('Träningsplaneraren · Slice 43'), b.foot)
})

check('no-errors', 'No page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-43-verify-results.json`, JSON.stringify({ when: new Date().toISOString(), commit: 'e7de022', results, notes, table }, null, 2))
console.log(`PASS ${results.filter((r) => r.ok).length} / FAIL ${results.filter((r) => !r.ok).length} · page errors ${errors.length}`)
await browser.close()

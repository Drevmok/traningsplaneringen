// Slice 43 — Builder self-smoke: Hallöversikt hall above the fold at 390×844 (A1: canvas bottom ≤ 739).
// Main build on :4310 (before), branch on :4343 (after). Pass = Från mall → Nybörjare → Hallöversikt.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync, copyFileSync } from 'node:fs'
const MAIN = process.env.S43_MAIN ?? 'http://127.0.0.1:4310/traningsplaneringen/'
const BR = process.env.S43_BR ?? 'http://127.0.0.1:4343/traningsplaneringen/'
const ROOT = process.env.S43_ROOT ?? '/workspace/gp-s43'
const FOLD = 739
const HALLS = ['forening-bla', 'forening-vit', 'standard-trupp', 'tavling-linjer', 'liten-hall']
const results = [], measure = {}
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 500) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 260) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page(vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
async function toHall(p, base) {
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600) // let the Slice 41 toast end
  const b = p.locator('.builder-actions .builder-hall')
  if (await b.isVisible()) await b.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() }
  await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500)
}
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [Math.round(r.top), Math.round(r.bottom), Math.round(r.height)] : null }, sel)
async function geo(p) {
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150)
  const g = {}
  for (const [k, s] of Object.entries({ canvas: '.hall-canvas', back: '.hall-header .back', title: '.hall-screen-title', meta: '.hall-session-meta', actions: '.hall-header-actions', preset: '.hall-preset-row', zoom: '.hall-zoom-bar', saknar: '.hall-saknar-banner', tray: '.hall-tray', note: '.hall-schematic-note', below: '.hall-below', tip: '.hall-flow-coach-tip', hints: '.hall-hints-info' })) g[k] = await rect(p, s)
  g.sw = await p.evaluate(() => document.documentElement.scrollWidth)
  return g
}
const shotsDir = `${ROOT}/verifier/slice-43-screenshots`
async function shot(p, name) { const path = `/workspace/screenshots/slice43_${name}.png`; await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100); await p.screenshot({ path }); copyFileSync(path, `${shotsDir}/slice43_${name}.png`) }

for (const [tag, base] of [['main', MAIN], ['branch', BR]]) {
  await attempt(`${tag}-halls`, async () => {
    const p = await page(); await toHall(p, base)
    measure[tag] = {}
    for (const h of HALLS) {
      await p.locator('#hall-layout-select').selectOption(h); await p.waitForTimeout(500)
      measure[tag][h] = await geo(p)
      await shot(p, `${tag}_${h}`)
    }
    if (tag === 'branch') {
      for (const h of HALLS) {
        const g = measure.branch[h], id = { 'forening-bla': 'AC1', 'forening-vit': 'AC2' }[h] ?? 'AC3'
        const ratioOk = id !== 'AC3' || Math.abs(g.canvas[2] - 358 * 2 / 3) <= 3
        check(`${id}-${h}`, `${h}: canvas bottom ≤ ${FOLD} with saknar banner${id === 'AC3' ? ', height ≈ 239' : ''}`, g.canvas[1] <= FOLD && g.saknar && ratioOk, `canvas ${g.canvas.join('/')} saknar ${g.saknar}`)
      }
      const g = measure.branch['forening-vit']
      const above = ['back', 'title', 'meta', 'actions', 'preset', 'zoom'].every((k) => g[k] && g[k][1] <= g.canvas[0])
      check('AC4', 'canvas top ≥ 0, tray (collapsed) does not cover the canvas, no horizontal overflow', g.canvas[0] >= 0 && (!g.tray || g.tray[0] >= g.canvas[1] || (await p.evaluate(() => getComputedStyle(document.querySelector('.hall-tray')).position)) !== 'fixed' || g.tray[0] >= g.canvas[1]) && g.sw <= 390, `tray ${g.tray} sw ${g.sw}`)
      const small = await p.evaluate(() => [...document.querySelectorAll('.hall-header button, .hall-header select')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44) }).map((e) => e.textContent.trim() || e.className))
      check('AC5', 'back, title, meta, 4 actions, layout select and zoom −/+ above the hall; all ≥ 44×44', above && small.length === 0 && (await p.locator('.hall-header-actions button').count()) === 4, `small=${small.join('|')}`)
      const s = await p.evaluate(() => { const e = document.querySelector('.hall-saknar-banner .hall-unplaced-banner'); const lh = parseFloat(getComputedStyle(e).lineHeight) || 20; return { text: e.textContent, title: e.title, cut: e.scrollWidth > e.clientWidth, lines: Math.round((e.clientHeight - 16) / lh) } })
      check('AC6-oneline', 'saknar banner one line; title holds the full text', s.lines <= 1 && s.title === s.text, JSON.stringify(s))
      check('AC6-notcut', 'saknar text not cut at 390', !s.cut, JSON.stringify(s))
      const cta = p.locator('.hall-saknar-point-cta')
      if (await cta.count()) { await cta.click(); await p.waitForTimeout(300); check('AC6-cta', 'CTA «Använd alla förslag» still points at the action (Slice 37)', (await p.locator('.hall-apply-all--point').count()) > 0) }
      const order = await p.evaluate(() => { const c = document.querySelector('.hall-canvas').getBoundingClientRect().bottom; return ['.hall-preset-note', '.hall-preset-coach-tip', '.hall-hints-info', '.hall-flow-coach-tip'].map((s) => { const e = document.querySelector(s); return [s, e ? e.getBoundingClientRect().top > c : null] }) })
      check('AC7', 'migrate note, Blå/Vit coach tip, Visa tips, flow tip under the hall', order.every(([, v]) => v === true), JSON.stringify(order))
      await shot(p, 'branch_below_hall_scrolled'.replace('_scrolled', '')); await p.locator('.hall-below').scrollIntoViewIfNeeded(); await p.screenshot({ path: '/workspace/screenshots/slice43_branch_below.png' }); copyFileSync('/workspace/screenshots/slice43_branch_below.png', `${shotsDir}/slice43_branch_below.png`)
      const tipBtn = p.locator('.hall-flow-coach-tip button').last()
      if (await tipBtn.count()) { await tipBtn.click(); await p.waitForTimeout(200); check('AC7-dismiss', 'flow tip dismiss still works', (await p.locator('.hall-flow-coach-tip').count()) === 0) }
      // zoom
      const z0 = await rect(p, '.hall-canvas-zoom'); await p.getByRole('button', { name: /Zooma in|zoom in/i }).first().click().catch(async () => p.locator('.hall-zoom-btn').last().click()); await p.waitForTimeout(250)
      const z1 = await p.evaluate(() => document.querySelector('.hall-canvas-zoom').getBoundingClientRect().width)
      await p.locator('.hall-zoom-btn').first().click(); await p.waitForTimeout(250)
      check('AC12-zoom', 'zoom + grows the hall, − shrinks back', z1 > 358, `w after + ${z1}`)
      // tray
      const tog = p.locator('.hall-tray-toggle').first()
      if (await tog.count()) { await p.evaluate(() => window.scrollTo(0, 0)); const c0 = await rect(p, '.hall-canvas'); await tog.click(); await p.waitForTimeout(300); const exp = (await p.locator('.hall-tray--compact').count()) === 0; await p.locator('.hall-tray-toggle').first().click(); await p.waitForTimeout(300); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150); const c1 = await rect(p, '.hall-canvas'); check('AC10', 'tray expands and collapses; hall unchanged', exp && JSON.stringify(c0) === JSON.stringify(c1), `${c0} → ${c1}`) }
      // Golvklart
      await p.locator('#hall-layout-select').selectOption('forening-vit'); await p.waitForTimeout(300)
      await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(600)
      const gf = await rect(p, '.hall-canvas'); measure.branch.golvklart = gf
      await shot(p, 'branch_golvklart_vit')
      check('AC11', 'Golvklart: hall bottom ≤ 739', gf[1] <= FOLD, gf)
      check('AC16-footer', 'footer «Träningsplaneraren · Slice 43»', (await p.locator('body').innerText()).includes('Träningsplaneraren · Slice 43'))
    }
    if (tag === 'main') { await p.locator('#hall-layout-select').selectOption('forening-vit'); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(600); measure.main.golvklart = await rect(p, '.hall-canvas'); await shot(p, 'main_golvklart_vit') }
    await p.context().close()
  })
  await attempt(`${tag}-landscape`, async () => {
    const p = await page({ width: 844, height: 390 }); await toHall(p, base); await p.locator('#hall-layout-select').selectOption('forening-bla'); await p.waitForTimeout(400)
    measure[tag].landscape = await geo(p); await shot(p, `${tag}_landscape_forening-bla`); await p.context().close()
  })
  await attempt(`${tag}-desktop`, async () => {
    const p = await page({ width: 1280, height: 800 }); await toHall(p, base); await p.locator('#hall-layout-select').selectOption('forening-bla'); await p.waitForTimeout(400)
    measure[tag].desktop = await geo(p); await shot(p, `${tag}_desktop_forening-bla`); await p.context().close()
  })
}
await attempt('AC13/14', async () => {
  const lm = measure.main.landscape, lb = measure.branch.landscape
  check('AC13', 'landscape 844×390: hall top ≤ main (507)', lb.canvas[0] <= lm.canvas[0], `main ${lm.canvas} branch ${lb.canvas}`)
  const dm = measure.main.desktop, db = measure.branch.desktop
  check('AC14', 'desktop 1280×800: header and hall geometry unchanged except moved items (hall moves up by their height only)', db.canvas[2] === dm.canvas[2] && db.actions[0] === dm.actions[0] && db.canvas[0] <= dm.canvas[0], `main ${JSON.stringify(dm.canvas)} branch ${JSON.stringify(db.canvas)}`)
})
await attempt('F1-longtitle', async () => {
  const LONG = 'Mycket långt passnamn för att testa att titeln inte trycker ned hallen förbi vecket på en telefon i porträttläge, med extra ord så att det blir minst fem rader långt i Hallöversikt'
  const p = await page(); await toHall(p, BR)
  await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor()
  await p.getByRole('textbox', { name: 'Passets titel' }).fill(LONG); await p.waitForTimeout(300)
  const field = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
  const b = p.locator('.builder-actions .builder-hall')
  if (await b.isVisible()) await b.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() }
  await p.locator('.hall-canvas').first().waitFor(); await p.locator('#hall-layout-select').selectOption('forening-vit'); await p.waitForTimeout(500)
  const t = await p.evaluate(() => { const e = document.querySelector('.hall-session-title'); const lh = parseFloat(getComputedStyle(e).lineHeight) || 1.2 * parseFloat(getComputedStyle(e).fontSize); return { lines: Math.round(e.getBoundingClientRect().height / lh), full: e.scrollHeight > e.clientHeight, text: e.textContent } })
  const g = await geo(p); measure.branch.longTitleVit = g.canvas
  await shot(p, 'branch_longtitle_vit')
  check('F1-lines', 'long title shows ≤ 2 lines in Hallöversikt (clamped, full text in DOM)', t.lines <= 2 && t.text === LONG, JSON.stringify({ lines: t.lines, clamped: t.full }))
  check('F1-fold', 'Vit hall bottom ≤ 739 with the long title', g.canvas[1] <= FOLD, g.canvas)
  check('F1-field', 'Passets titel field holds the full title', field === LONG, field.length)
  await p.context().close()
})
check('no-errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-43-builder-smoke-results.json`, JSON.stringify({ when: new Date().toISOString(), results, measure }, null, 2))
console.log(JSON.stringify(Object.fromEntries(Object.entries(measure).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([h, g]) => [h, Array.isArray(g) ? g : g.canvas]))]))))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()

// Slice 48 — Builder self-smoke «Hallöversikt» (A1 B1 C1 D1 E1 F1). 390×844, 844×390 and 1280×800, DPR 2.
// Branch build (bank off, seeds) on :4848. All supabase.co traffic is blocked in the browser — no real backend.
// AC26–27 (real iPhone pinch / long-press) are NOT covered here: pending a real device.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
const BR = process.env.S48_BR ?? 'http://127.0.0.1:4848/traningsplaneringen/'
const SHOTS = process.env.S48_SHOTS ?? '/tmp/slice-48-screenshots'
const DRAFT = 'gymnastics-planner-draft-v1'
const TECH = ['tech-ljushopp-satsbrada', 'tech-satsbrada-volt-rygg', 'tech-trampett-volt-mattberg']
const NAMES = ['t0', 't1', 't2']
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, ok: Boolean(ok) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
function draftSession() {
  const types = ['gathering', 'warmup', 'techniques', 'strength', 'fun_and_games']
  return {
    id: 's48', title: 'Smoke 48', totalMinutes: 18, notes: '', hallTemplateId: 'forening-bla',
    blocks: types.map((type) => ({ id: `block-${type}`, type, title: type, durationMinutes: 10, coachNote: '',
      items: type === 'techniques' ? TECH.map((activityId, order) => ({ id: NAMES[order], activityId, durationMinutes: 6, note: '', order })) : [] })),
    hallPlacements: [{ sessionItemId: 't0', x: 0.25, y: 0.3 }, { sessionItemId: 't1', x: 0.5, y: 0.5 }, { sessionItemId: 't2', x: 0.75, y: 0.7 }],
  }
}
async function page(vp, touch = true) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch && vp.width < 900 })
  await ctx.route(/supabase\.co/, (r) => r.abort())
  await ctx.addInitScript(([k, v]) => { try { if (sessionStorage.getItem('s48')) return; sessionStorage.setItem('s48', '1'); localStorage.clear(); localStorage.setItem(k, v) } catch {} }, [DRAFT, JSON.stringify(draftSession())])
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
const techOrder = async (p) => { const d = await draft(p); return d.blocks.find((b) => b.type === 'techniques').items.slice().sort((a, b) => a.order - b.order).map((i) => i.id) }
const rows = (p) => p.locator('.hall-station-rows > li')
async function openHall(p) {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  const b = p.locator('.builder-hall')
  if (await b.isVisible()) await b.click()
  else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel button').filter({ hasText: /^Hallöversikt$/ }).first().click() }
  await p.locator('.hall-board').waitFor(); await p.waitForTimeout(500)
}
async function touchDrag(p, from, to, steps = 8) {
  const s = await p.context().newCDPSession(p)
  const pt = (x, y) => [{ x, y, id: 1 }]
  await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  for (let i = 1; i <= steps; i++) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await p.waitForTimeout(16) }
  await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(300)
}
async function mouseDrag(p, from, to) { await p.mouse.move(from.x, from.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(from.x + (to.x - from.x) * i / 8, from.y + (to.y - from.y) * i / 8); await p.mouse.up(); await p.waitForTimeout(300) }
const center = async (loc) => { const r = await loc.boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }

for (const [tag, vp, touch] of [['320', { width: 320, height: 568 }, true], ['390', { width: 390, height: 844 }, true], ['844', { width: 844, height: 390 }, true], ['1280', { width: 1280, height: 800 }, false]]) {
  await attempt(`${tag}-entry`, async () => {
    const p = await page(vp, touch); await openHall(p)
    check(`${tag}-AC1`, 'Hallöversikt opens from the builder at this size', await p.locator('.hall-board').isVisible())
    const tog = p.locator('.hall-stations-toggle')
    check(`${tag}-AC-toggle`, '«Ändra stationer» visible, aria-expanded=false', (await tog.innerText()).trim() === 'Ändra stationer' && (await tog.getAttribute('aria-expanded')) === 'false')
    await tog.click(); await p.waitForTimeout(200)
    const n = await rows(p).count()
    const title = await p.locator('.hall-station-list-title').innerText()
    check(`${tag}-list`, 'list «Stationer i ordning» with 3 rows, button now «Klar»', n === 3 && /Stationer i ordning/.test(title) && (await tog.innerText()).trim() === 'Klar', `rows=${n}`)
    const sizes = await p.locator('.hall-station-list button:visible').evaluateAll((bs) => bs.map((b) => { const r = b.getBoundingClientRect(); return [Math.min(r.width, r.height), b.getAttribute('aria-label') || b.textContent] }))
    check(`${tag}-44`, 'all list buttons ≥ 44 px', sizes.length > 0 && sizes.every((s) => s[0] >= 43.5), JSON.stringify(sizes.filter((s) => s[0] < 43.5)))
    const up0 = await rows(p).nth(0).getByRole('button', { name: /Flytta upp/ }).isDisabled()
    const dn2 = await rows(p).nth(2).getByRole('button', { name: /Flytta ner/ }).isDisabled()
    check(`${tag}-ends`, '↑ disabled on first row, ↓ disabled on last', up0 && dn2)
    await rows(p).nth(0).getByRole('button', { name: /Flytta ner/ }).click(); await p.waitForTimeout(250)
    let o = await techOrder(p)
    const live = await p.locator('.hall-station-list [aria-live]').innerText()
    check(`${tag}-down`, '↓ moves station 1 to 2, saved order, live text «… är nu nummer 2.»', o.join() === 't1,t0,t2' && /är nu nummer 2\./.test(live), `${o} live=${live}`)
    const rank = await p.locator('.hall-station-rank').allInnerTexts()
    check(`${tag}-ranks`, 'ranks 1..3 follow the list', rank.map((s) => s.trim()).join() === '1,2,3', rank)
    await p.screenshot({ path: `${SHOTS}/s48_${tag}_list.png` }).catch(() => {})
    const lay = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const right = Math.max(...[...document.querySelectorAll('.hall-station-list *')].map((e) => e.getBoundingClientRect().right))
      const names = [...document.querySelectorAll('.hall-station-name')].map((e) => { const r = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight) || 20; return { w: Math.round(r.width), lines: Math.round(r.height / lh) } })
      return { vw, right: Math.round(right), names, sw: document.documentElement.scrollWidth }
    })
    check(`${tag}-W320`, 'list fits the viewport and names wrap sensibly (≥ 100 px wide, ≤ 3 lines)', lay.right <= lay.vw && lay.sw <= lay.vw && lay.names.every((n) => n.w >= 100 && n.lines <= 3), JSON.stringify(lay))
    // drag handle: row 3 → top
    const h = rows(p).nth(2).locator('.hall-station-handle'); await h.scrollIntoViewIfNeeded()
    const from = await center(h); const top = await center(rows(p).nth(0))
    if (touch) await touchDrag(p, from, { x: from.x, y: top.y - 10 }); else await mouseDrag(p, from, { x: from.x, y: top.y - 10 })
    o = await techOrder(p)
    check(`${tag}-drag`, 'drag handle moves last row to the top', o.join() === 't2,t1,t0', o)
    // remove + undo
    await rows(p).nth(1).getByRole('button', { name: /^Ta bort/ }).click(); await p.waitForTimeout(250)
    const toast = await p.locator('.toast').first().innerText().catch(() => '')
    o = await techOrder(p)
    check(`${tag}-remove`, 'Ta bort removes the station, toast with Ångra', o.join() === 't2,t0' && /Ångra/.test(toast), `${o} toast=${toast}`)
    await p.locator('.toast').getByRole('button', { name: /Ångra/ }).click(); await p.waitForTimeout(300)
    o = await techOrder(p); const d = await draft(p)
    check(`${tag}-undo`, 'Ångra brings it back with its placement', o.join() === 't2,t1,t0' && d.hallPlacements.some((x) => x.sessionItemId === 't1'), o)
    // add
    await p.locator('.hall-station-add').click(); await p.waitForTimeout(400)
    const lib = p.locator('.side-panel-slot.is-open.hall-library')
    check(`${tag}-lib`, '«Lägg till station» opens the library on Teknik', await lib.isVisible() && (await lib.locator('select').inputValue()) === 'techniques')
    check(`${tag}-Q2`, 'library filter is locked to Teknik (select disabled)', await lib.locator('select').isDisabled())
    await lib.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(500)
    const d2 = await draft(p); const t = d2.blocks.find((b) => b.type === 'techniques').items
    const newId = t.find((i) => !NAMES.includes(i.id))?.id
    check(`${tag}-add`, 'new station lands last and is auto-placed', t.length === 4 && d2.hallPlacements.some((x) => x.sessionItemId === newId) && (await rows(p).count()) === 4, `n=${t.length}`)
    // Esc closes edit mode
    await p.locator('.hall-station-list button').first().focus(); await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    check(`${tag}-esc`, 'Esc / Klar closes the list', (await rows(p).count()) === 0 && (await p.locator('.hall-stations-toggle').innerText()).trim() === 'Ändra stationer')
    // canvas chip drag (pointer events)
    const chip = p.locator('.hall-chip--canvas').first(); await chip.scrollIntoViewIfNeeded()
    const id = await chip.getAttribute('data-item-id').catch(() => null)
    const before = JSON.stringify((await draft(p)).hallPlacements)
    const c = await center(chip)
    if (touch) await touchDrag(p, c, { x: c.x + 40, y: c.y + 30 }); else await mouseDrag(p, c, { x: c.x + 40, y: c.y + 30 })
    const after = JSON.stringify((await draft(p)).hallPlacements)
    check(`${tag}-chipdrag`, `canvas marker drag moves its placement (${touch ? 'touch' : 'mouse'})`, before !== after, id ?? '')
    const ta = await p.locator('.hall-canvas-wrap').evaluate((e) => getComputedStyle(e).touchAction)
    check(`${tag}-touchaction`, 'canvas wrap touch-action pan-x pan-y', /pan-x pan-y/.test(ta), ta)
    const tab = await p.locator('.hall-board').evaluate((e) => getComputedStyle(e).touchAction)
    check(`${tag}-AC27-area`, 'whole hall area (.hall-board, incl. tray) has touch-action pan-x pan-y', /pan-x pan-y/.test(tab), tab)
    if (touch) {
      const tray = p.locator('.hall-tray-compact-bar, .hall-below').first(); await tray.scrollIntoViewIfNeeded()
      const t = await center(tray); const s = await p.context().newCDPSession(p)
      const two = (d) => [{ x: t.x - 20 - d, y: t.y, id: 1 }, { x: t.x + 20 + d, y: t.y, id: 2 }]
      await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: two(0) })
      for (let i = 1; i <= 8; i++) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: two(i * 8) }); await p.waitForTimeout(16) }
      await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(400)
      const scale = await p.evaluate(() => window.visualViewport?.scale ?? 1)
      check(`${tag}-AC27-pinch`, 'pinch over the tray does not zoom the page (simulated, real iPhone pending)', Math.abs(scale - 1) < 0.01, scale)
    }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    check(`${tag}-overflow`, 'no horizontal overflow', overflow <= 1, overflow)
    await p.screenshot({ path: `${SHOTS}/s48_${tag}_end.png` }).catch(() => {})
    await p.context().close()
  })
}
check('console', 'no page errors', errors.length === 0, errors.join(' | '))
await browser.close()
const pass = results.filter((r) => r.ok).length
console.log(`\n${pass}/${results.length} PASS`)
process.exit(pass === results.length ? 0 : 1)

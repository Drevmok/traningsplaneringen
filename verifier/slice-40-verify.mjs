// Slice 40 — Verifier checks (a0ca4fe): spread Teknik markers in Blå / Vit. 390×844 headless Chrome. Local only:
// BR (branch plain), MAIN (45cce9b plain), ON (branch bank build → MY stand-in, S32_DIR). No live requests.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:56941/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:56942/traningsplaneringen/'
const ON = process.env.ON ?? 'http://127.0.0.1:56940/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const S32 = process.env.S32_DIR ?? '/tmp/s40v/sb'
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = '/workspace/screenshots/s40v_'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const results = [], notes = {}, errors = [], bankLog = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 500) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 400) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0]) } }
const env = () => JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(env().pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME } }).trim()
const seed = (hall, n, mode = '') => execFileSync('bun', [`${ROOT}/verifier/slice-40-seed.ts`, hall, String(n), mode], { encoding: 'utf8' }).trim()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function newPage(url) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request(); const u = new URL(req.url())
    if (u.host !== 'bank-mock.supabase.co') { bankLog.push('LIVE?' + u.host); return route.abort('failed') }
    bankLog.push(u.pathname); const headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${env().gatewayPort}` + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); p.base = url; p.ctx = ctx
  return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const builder = (p) => p.locator('.builder')
const teknikIds = (d) => d.blocks.find((b) => b.type === 'techniques').items.slice().sort((a, b) => a.order - b.order).map((i) => i.id)
const placed = (d) => d.hallPlacements ?? []
const coords = (d) => teknikIds(d).map((id) => placed(d).find((x) => x.sessionItemId === id)).filter(Boolean).map((x) => [x.x, x.y])
async function toHome(p) { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor() }
async function fresh(p) { await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
async function back(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await builder(p).waitFor() }
async function loadDraft(p, json, tmpl) { await p.goto(p.base); await p.evaluate(([k, v, t, tv]) => { localStorage.clear(); localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null]); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor() }
async function wizard(p, hall) {
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: new RegExp(hall) }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await builder(p).waitFor()
}
async function addTeknik(p, n = 0) {
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click(); else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor(); await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(n).click(); await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
}
// DOM geometry of the canvas markers: boxes, pairwise overlap (px), inside the canvas, visible share + tap hit per marker
async function dom(p) {
  await p.locator('.hall-canvas').first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150)
  return p.evaluate(() => {
    const cv = document.querySelector('.hall-canvas').getBoundingClientRect()
    const chips = [...document.querySelectorAll('.hall-canvas .hall-chip--canvas')]
    const boxes = chips.map((c) => { const r = c.getBoundingClientRect(); return { rank: c.querySelector('.hall-chip-rank')?.textContent.trim(), l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } })
    const pairs = []
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]; const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t)
      if (ox > 0 && oy > 0) pairs.push({ a: a.rank, b: b.rank, ox: +ox.toFixed(1), oy: +oy.toFixed(1) })
    }
    const vis = chips.map((c, i) => { const r = c.getBoundingClientRect(); let hit = 0, tot = 0
      for (let gx = 1; gx < 8; gx++) for (let gy = 1; gy < 8; gy++) { tot++; const el = document.elementFromPoint(r.left + (r.width * gx) / 8, r.top + (r.height * gy) / 8); if (el && el.closest('.hall-chip--canvas') === c) hit++ }
      const rk = c.querySelector('.hall-chip-rank'); let rankVisible = null
      if (rk) { const q = rk.getBoundingClientRect(); const el = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); rankVisible = !!el && el.closest('.hall-chip--canvas') === c }
      const ctr = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
      return { rank: boxes[i].rank, visiblePct: Math.round((100 * hit) / tot), rankVisible, centerTapHitsIt: !!ctr && ctr.closest('.hall-chip--canvas') === c } })
    const inside = boxes.every((b) => b.l >= cv.left - 0.5 && b.r <= cv.right + 0.5 && b.t >= cv.top - 0.5 && b.b <= cv.bottom + 0.5)
    const ranks = boxes.map((b) => b.rank)
    return { canvas: [Math.round(cv.width), Math.round(cv.height)], n: boxes.length, chip: boxes[0] ? [Math.round(boxes[0].w), Math.round(boxes[0].h)] : null, pairs, maxOx: Math.max(0, ...pairs.map((x) => x.ox)), maxOy: Math.max(0, ...pairs.map((x) => x.oy)), inside, minVisiblePct: Math.min(100, ...vis.map((v) => v.visiblePct)), allRanksVisible: vis.every((v) => v.rankVisible !== false), allCenterTaps: vis.every((v) => v.centerTapHitsIt), vis, ranks, sw: document.documentElement.scrollWidth }
  })
}
const rowMajor = (c) => c.every((q, i) => i === 0 || q[1] > c[i - 1][1] + 1e-9 || (Math.abs(q[1] - c[i - 1][1]) < 1e-9 && q[0] > c[i - 1][0]))
const near = (a, b) => a.length === b.length && a.every((q, i) => Math.abs(q[0] - b[i][0]) <= 0.001 && Math.abs(q[1] - b[i][1]) <= 0.001)
const shot = (p, n) => p.screenshot({ path: `${SS}${n}.png` })
async function hallShot(p, n) { await p.locator('.hall-canvas').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(200); await shot(p, n) }

// ═══ A. Planera pass (wizard) in Blå / Vit, branch vs main (AC1, AC2) ═══
await section('A', async () => {
  for (const hall of ['Blå hall', 'Vit hall']) {
    const tag = hall.startsWith('Blå') ? 'bla' : 'vit'
    for (const [url, who] of [[BR, 'br'], [MAIN, 'main']]) {
      const p = await newPage(url); await fresh(p); await wizard(p, hall)
      const d = await draft(p); await openHall(p); const g = await dom(p)
      notes[`A.${tag}.${who}`] = { hall: d.hallTemplateId, teknik: teknikIds(d).length, coords: coords(d), pairs: g.pairs, minVisiblePct: g.minVisiblePct }
      if (who === 'br') {
        check(`AC${tag === 'bla' ? 1 : 2}`, `Planera pass → ${hall}: every Teknik marker separate (no overlapping boxes), inside the hall, row-major`, g.n === teknikIds(d).length && g.pairs.length === 0 && g.inside && rowMajor(coords(d)), `teknik ${teknikIds(d).length}, ${JSON.stringify(coords(d))}, canvas ${g.canvas}, chip ${g.chip}`)
        await hallShot(p, `01_wizard_${tag}_branch`)
      } else { note(`A.${tag}.main`, `${g.n} markers, overlapping pairs ${g.pairs.length}, min visible ${g.minVisiblePct} %`); await hallShot(p, `02_wizard_${tag}_main`) }
      await p.ctx.close()
    }
  }
  note('A.wizardTeknik', 'Planera pass (7–9, Trampett) gives 3 Teknik stations; the ≥ 4 case is driven via seeded drafts (B) and add station (D)')
})

// ═══ B. HallBoard empty-hall auto-place on open, seeded drafts (AC3, AC4, AC5, AC6, AC7, AC10, AC8) ═══
await section('B', async () => {
  const W = { bla5: [[0.21, 0.38], [0.37, 0.38], [0.53, 0.38], [0.69, 0.38], [0.21, 0.62]], vit4: [[0.135, 0.29], [0.295, 0.29], [0.455, 0.29], [0.135, 0.53]] }
  const geo = {}
  for (const [hall, ns] of [['forening-bla', [1, 4, 5, 8, 12, 16]], ['forening-vit', [1, 4, 6, 8, 12, 16]]]) {
    for (const n of ns) {
      const p = await newPage(BR); await loadDraft(p, seed(hall, n)); await openHall(p)
      const d = await draft(p), g = await dom(p), c = coords(d)
      geo[`${hall} n=${n}`] = { canvas: g.canvas, chip: g.chip, overlapPairs: g.pairs.length, maxOverlapX: g.maxOx, maxOverlapY: g.maxOy, minVisiblePct: g.minVisiblePct, ranksVisible: g.allRanksVisible, centerTaps: g.allCenterTaps, inside: g.inside, rowMajor: rowMajor(c), sw: g.sw }
      if (hall === 'forening-bla' && n === 5) { check('AC3/AC10', 'Blå, 5 Teknik, empty hall opened → stored = worked values ±0.001 (4 + 1)', near(c, W.bla5), JSON.stringify(c)); await hallShot(p, '03_bla5_hall') }
      if (hall === 'forening-vit' && n === 4) { check('AC4', 'Vit, 4 Teknik → stored = worked values ±0.001 (3 + 1)', near(c, W.vit4), JSON.stringify(c)); await hallShot(p, '04_vit4_hall') }
      if (n === 1) check(`AC6-${hall}-1`, `${hall} n=1 → one marker, inside`, g.n === 1 && g.inside)
      if ([4, 8].includes(n) || (hall === 'forening-vit' && n === 6)) check(`AC6-${hall}-${n}`, `${hall} n=${n}: all inside the hall drawing, no overlap, rank order row-major`, g.inside && g.pairs.length === 0 && rowMajor(c) && g.ranks.join() === c.map((_, i) => String(i + 1)).join(), JSON.stringify(geo[`${hall} n=${n}`]))
      if (n >= 12) {
        const onlyVert = g.pairs.every((x) => x.ox >= g.chip[0] - 1)
        check(`AC7-${hall}-${n}`, `${hall} n=${n}: inside, order kept, no hang; overlap only vertical (overlapping pairs share a column)`, g.inside && rowMajor(c) && onlyVert, JSON.stringify(geo[`${hall} n=${n}`]))
        if (hall === 'forening-vit' && n === 12) await hallShot(p, '05_vit12_overlap')
        if (hall === 'forening-vit' && n === 16) await hallShot(p, '06_vit16_overlap')
      }
      await p.ctx.close()
    }
  }
  note('B.geometry_390', geo)
  // AC8: mixed redskap (satsbräda, trampett, tumbling, kon) in Blå
  const p = await newPage(BR); await loadDraft(p, seed('forening-bla', 4, 'mixed')); await openHall(p)
  const d = await draft(p), g = await dom(p), spots = new Set(coords(d).map((q) => q.join()))
  check('AC8', 'Blå, 4 stations with satsbräda / trampett / tumbling / kon → 4 distinct spots, no overlap', spots.size === 4 && g.pairs.length === 0, JSON.stringify(coords(d)))
  await hallShot(p, '07_bla_mixed'); await p.ctx.close()
  const pm = await newPage(MAIN); await loadDraft(pm, seed('forening-bla', 4, 'mixed')); await openHall(pm)
  const dm = await draft(pm); note('B.main_mixed', `main: ${new Set(coords(dm).map((q) => q.join())).size} distinct spots of 4: ${JSON.stringify(coords(dm))}`); await hallShot(pm, '08_bla_mixed_main'); await pm.ctx.close()
})

// ═══ C. Apply paths in Blå: Egen mall (Mina mallar), Föreningsmall (stand-in), built-in mall (AC12) ═══
await section('C', async () => {
  // Egen mall without placements, hall Blå (shape from the seed tool)
  const json = seed('forening-bla', 5); const s = JSON.parse(json)
  const mall = execFileSync('bun', [`${ROOT}/verifier/slice-40-seed.ts`, 'forening-bla', '5', 'mall'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const tmpl = execFileSync('bash', ['-c', `bun ${ROOT}/verifier/slice-40-seed.ts forening-bla 5 mall 2>&1 >/dev/null`], { encoding: 'utf8' }).trim()
  let p = await newPage(BR); await loadDraft(p, seed('standard-trupp', 2), tmpl)
  await menu(p, 'Använd mall'); await p.locator('.template-saved .template-card').filter({ hasText: 'S40 Blå mall' }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  let d = await draft(p)
  check('AC12-egen', 'Mina mallar (Blå, no placements) applied → hall Blå, grid as AC3', d.hallTemplateId === 'forening-bla' && near(coords(d), [[0.21, 0.38], [0.37, 0.38], [0.53, 0.38], [0.69, 0.38], [0.21, 0.62]]), `${d.hallTemplateId} ${JSON.stringify(coords(d))}`)
  await openHall(p); await hallShot(p, '09_egen_bla'); await p.ctx.close()
  // Föreningsmall via stand-in: hallTemplateId forening-vit, 4 Teknik, payload has no placements (DB check forbids them)
  const vs = JSON.parse(seed('forening-vit', 4))
  const blocks = vs.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) }))
  sql(`delete from public.club_templates where title = 'V40 Vit klubbmall'`)
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V40 Vit klubbmall', ${Math.max(1, vs.totalMinutes)}, '${JSON.stringify({ v: 1, title: 'V40 Vit klubbmall', notes: '', blocks, hallTemplateId: 'forening-vit' }).replace(/'/g, "''")}'::jsonb)`)
  p = await newPage(ON); await loadDraft(p, seed('standard-trupp', 2))
  await menu(p, 'Använd mall'); await p.waitForTimeout(800)
  await p.locator('section.club-templates .template-card').filter({ hasText: 'V40 Vit klubbmall' }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(500)
  d = await draft(p)
  check('AC12-club', 'Föreningsmall (stand-in, Vit, 4 Teknik) applied → grid as AC4', d.hallTemplateId === 'forening-vit' && near(coords(d), [[0.135, 0.29], [0.295, 0.29], [0.455, 0.29], [0.135, 0.53]]), `${d.hallTemplateId} ${JSON.stringify(coords(d))}`)
  await openHall(p); await hallShot(p, '10_club_vit'); await p.ctx.close()
  sql(`delete from public.club_templates where title = 'V40 Vit klubbmall'`)
  // Built-in mall on a Blå pass: which hall does it end up in?
  p = await newPage(BR); await fresh(p); await wizard(p, 'Blå hall')
  await menu(p, 'Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  d = await draft(p)
  note('C.builtin', `Built-in Nybörjare applied over a Blå pass → hallTemplateId ${d.hallTemplateId}, ${placed(d).length} placed: ${JSON.stringify(coords(d))}`)
  check('AC12-builtin', 'Built-in mall: placed in its own hall (Standard trupp, Slice 37 E1) — never reaches Blå/Vit, so standard path (byte-identical, see parity)', d.hallTemplateId === 'standard-trupp' && placed(d).length === teknikIds(d).length)
  await p.ctx.close()
})

// ═══ D. Add station to a Blå pass with 3 placed, one dragged by hand (AC11) + drag / Placera här / Ta bort (AC14) ═══
await section('D', async () => {
  const p = await newPage(BR); await loadDraft(p, seed('forening-bla', 3)); await openHall(p)
  const g0 = await dom(p)
  // drag marker 1 via the app's DnD handlers (one DataTransfer)
  const chip = p.locator('.hall-canvas .hall-chip--canvas').first(), canvas = p.locator('.hall-canvas').first()
  const cb = await canvas.boundingBox(); const X = cb.x + cb.width * 0.3, Y = cb.y + cb.height * 0.75
  const dt = await p.evaluateHandle(() => new DataTransfer())
  await chip.dispatchEvent('dragstart', { dataTransfer: dt }); await canvas.dispatchEvent('dragover', { dataTransfer: dt, clientX: X, clientY: Y })
  await canvas.dispatchEvent('drop', { dataTransfer: dt, clientX: X, clientY: Y }); await chip.dispatchEvent('dragend', { dataTransfer: dt }); await p.waitForTimeout(300)
  const d1 = await draft(p); const c1 = coords(d1)
  check('AC14-drag', 'Drag (app DnD events) moves marker 1 to the drop point; the others stay', Math.abs(c1[0][0] - 0.3) < 0.03 && Math.abs(c1[0][1] - 0.75) < 0.05 && near(c1.slice(1), [[0.45, 0.5], [0.61, 0.5]]), JSON.stringify(c1))
  await back(p); await addTeknik(p, 6); await p.waitForTimeout(1500)
  const d2 = await draft(p); const c2 = coords(d2); note('D.dbg', { teknik: teknikIds(d2).length, placed: placed(d2).length })
  check('AC11', 'Add station: the 3 (incl. the dragged one) do not move; the new one lands on slot 3 of 4 (x 0.69, y 0.50)', near(c2.slice(0, 3), c1) && near([c2[3]], [[0.69, 0.5]]), JSON.stringify(c2))
  await openHall(p); const g2 = await dom(p)
  note('D.add_overlap', { before: c1, after: c2, pairs: g2.pairs, minVisiblePct: g2.minVisiblePct })
  check('D-add-overlap', 'Info: new marker after an add does not overlap the existing ones (grid of 3 was centred for 3, slot 3 of 4 is computed for 4)', g2.pairs.length === 0, JSON.stringify(g2.pairs))
  await hallShot(p, '11_bla_add_station')
  // Ta bort från hall + Placera här
  const n0 = g2.n
  await p.locator('.hall-canvas .hall-chip--canvas').last().getByRole('button', { name: /Ta bort från hall/ }).click({ force: true }); await p.waitForTimeout(1500)
  const d3 = await draft(p)
  { const exp = p.getByRole('button', { name: 'Visa brickan med ej placerade stationer' }); if (await exp.count()) { await exp.first().click(); await p.waitForTimeout(200) } }
  check('AC14-remove', '«Ta bort från hall» → one placement fewer, marker in tray', placed(d3).length === n0 - 1 && (await p.locator('.hall-tray-list .hall-chip').count()) >= 1, `placed ${placed(d3).length}/${n0} tray ${await p.locator('.hall-tray-list .hall-chip').count()} canvas ${await p.locator('.hall-canvas .hall-chip--canvas').count()}`)
  if (!(await p.locator('.hall-tray-list .hall-chip').first().isVisible())) { const exp = p.getByRole('button', { name: /brickan/ }); if (await exp.count()) await exp.first().click() }
  await p.locator('.hall-tray-list .hall-chip').first().click()
  await p.locator('.hall-canvas').first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); const cv = await p.locator('.hall-canvas').boundingBox(); await p.mouse.click(cv.x + cv.width * 0.85, cv.y + cv.height * 0.3); await p.waitForTimeout(1500)
  const d4 = await draft(p); const np = placed(d4).find((x) => !placed(d3).some((y) => y.sessionItemId === x.sessionItemId))
  check('AC14-placera', '«Placera här» puts it where tapped (snapPlacement unchanged: Blå has no snap)', placed(d4).length === n0 && np && Math.abs(np.x - 0.85) < 0.03 && Math.abs(np.y - 0.3) < 0.05, `${placed(d4).length}/${n0} ${JSON.stringify(np)}`)
  // incremental adds from scratch: one at a time
  await p.ctx.close()
  const q = await newPage(BR); await loadDraft(q, seed('forening-bla', 0))
  for (let k = 0; k < 5; k++) { await addTeknik(q, k); await q.waitForTimeout(300) }; await q.waitForTimeout(1500)
  await openHall(q); const gi = await dom(q); const di = await draft(q)
  note('D.one_by_one_bla', { coords: coords(di), pairs: gi.pairs, minVisiblePct: gi.minVisiblePct, ranksVisible: gi.allRanksVisible })
  check('D-one-by-one', 'Info: Blå pass built by adding 5 stations one at a time → no overlapping markers', gi.pairs.length === 0, JSON.stringify(gi.pairs))
  await hallShot(q, '12_bla_one_by_one'); await q.ctx.close()
})

// ═══ E. D1: passes and Egen mall spots created on MAIN keep their positions on the branch (AC13) ═══
await section('E', async () => {
  const pm = await newPage(MAIN); await fresh(pm); await wizard(pm, 'Blå hall'); await openHall(pm)
  const mainDraft = await pm.evaluate((k) => localStorage.getItem(k), DK)
  await back(pm); await menu(pm, 'Spara som egen mall'); await pm.locator('.modal input').fill('Main Blå egen'); await pm.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await pm.waitForTimeout(300)
  const mainTmpl = await pm.evaluate((k) => localStorage.getItem(k), TK)
  const mainVit = JSON.parse(seed('forening-vit', 4)); await pm.ctx.close()
  const md = JSON.parse(mainDraft)
  const p = await newPage(BR); await loadDraft(p, mainDraft, mainTmpl)
  const same1 = (await p.evaluate((k) => localStorage.getItem(k), DK)) === mainDraft
  await openHall(p); await p.waitForTimeout(1200)
  const after = await draft(p)
  check('AC13', 'Main-made stacked Blå pass → opens with the stored positions, untouched by open + Hallöversikt (D1)', same1 && JSON.stringify(placed(after)) === JSON.stringify(placed(md)), `stored ${JSON.stringify(coords(md))}`)
  await hallShot(p, '13_main_stacked_on_branch')
  await back(p); await menu(p, 'Använd mall'); await p.locator('.template-saved .template-card').filter({ hasText: 'Main Blå egen' }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const ad = await draft(p)
  const egen = JSON.parse(mainTmpl)[0].pass
  const key = (d, pl) => pl.map((x) => [d.blocks.flatMap((b) => b.items).find((i) => i.id === x.sessionItemId)?.order, x.x, x.y]).map(String).sort().join('|')
  check('AC13-egen', 'Egen mall saved on main (with its stacked spots) applied on the branch → spots kept as saved (no re-layout)', key(ad, placed(ad)) === key(egen, egen.hallPlacements ?? []), `${JSON.stringify(coords(ad))} vs ${JSON.stringify((egen.hallPlacements ?? []).map((x) => [x.x, x.y]))}`)
  await p.ctx.close()
})

// ═══ F. Locks / no new controls or text; Golvklart + Förrådslista (AC14, AC16, golvklart) ═══
await section('F', async () => {
  const snap = async (url) => {
    const p = await newPage(url); await loadDraft(p, seed('forening-vit', 5, 'mixed')); await openHall(p)
    const btns = await p.getByRole('button').evaluateAll((e) => e.filter((x) => x.offsetParent).map((x) => x.getAttribute('aria-label') || x.textContent.trim()))
    const text = (await p.locator('body').innerText()).replace(/Slice \d+/g, 'Slice N').replace(/\s+/g, ' ')
    const opts = await p.locator('.hall-preset-select option').allTextContents()
    const d = await draft(p); const nonTek = placed(d).filter((x) => !teknikIds(d).includes(x.sessionItemId)).length
    await p.getByRole('button', { name: 'Golvklart', exact: true }).first().click(); await p.waitForTimeout(600)
    const gk = await dom(p); const gkText = (await p.locator('body').innerText()).replace(/\s+/g, ' ')
    const tag = url === BR ? 'branch' : 'main'
    await hallShot(p, `14_golvklart_vit_${tag}`)
    await p.getByRole('button', { name: /förrådslista/i }).first().click(); await p.waitForTimeout(500)
    const fl = (await p.locator('.forradslista, [role=dialog]').first().innerText().catch(() => '')).replace(/\s+/g, ' ')
    await shot(p, `15_forradslista_${tag}`)
    const foot = url === BR ? await (async () => { await p.keyboard.press('Escape'); await p.goto(p.base); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); return (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ') })() : ''
    await p.ctx.close()
    return { btns, text, opts, nonTek, gk, gkText, fl, foot, d }
  }
  const b = await snap(BR), m = await snap(MAIN)
  check('AC14-controls', 'Hallöversikt (Vit, 5 mixed): visible buttons, hall options and text identical to main (slice no. normalised)', JSON.stringify(b.btns) === JSON.stringify(m.btns) && JSON.stringify(b.opts) === JSON.stringify(m.opts) && b.text === m.text, `${b.btns.length}/${m.btns.length} buttons; text ${b.text.length}/${m.text.length}`)
  check('AC14-teknik', 'Only Teknik stations get markers (0 non-Teknik placements)', b.nonTek === 0 && b.gk.n === teknikIds(b.d).length)
  check('GK', 'Golvklart: same markers as the hall, none overlapping, inside; Förrådslista text identical to main', b.gk.pairs.length === 0 && b.gk.inside && b.fl === m.fl && b.fl.length > 0, `golvklart n=${b.gk.n}; förråd «${b.fl.slice(0, 120)}»`)
  check('AC16-footer', 'Footer «Träningsplaneraren · Slice 40»', b.foot.includes('Träningsplaneraren · Slice 40'), b.foot.slice(0, 80))
})

// ═══ G. AC9 manual spot check: snap halls give the same positions as main (browser, empty-hall open) ═══
await section('G', async () => {
  for (const hall of ['standard-trupp', 'tavling-linjer', 'liten-hall']) {
    const json = seed(hall, 5, 'mixed'); const out = []
    for (const url of [BR, MAIN]) { const p = await newPage(url); await loadDraft(p, json); await openHall(p); await p.waitForTimeout(800); out.push(placed(await draft(p))); if (url === BR && hall === 'standard-trupp') await hallShot(p, '16_standard_branch'); await p.ctx.close() }
    check(`AC9-${hall}`, `${hall}, 5 mixed Teknik, empty hall opened: placements identical to main`, out[0].length === 5 && JSON.stringify(out[0]) === JSON.stringify(out[1]), JSON.stringify(out[0].map((x) => [x.x, x.y])))
  }
})

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass} · page errors ${errors.length} · bank requests ${bankLog.length} (live: ${bankLog.filter((x) => x.startsWith('LIVE')).length})`)
if (!ONLY.length) writeFileSync(`${ROOT}/verifier/slice-40-verify-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes, errors }, null, 2))
await browser.close()

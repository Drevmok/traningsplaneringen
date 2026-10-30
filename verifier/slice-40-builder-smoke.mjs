// Slice 40 — Builder self-smoke: Teknik markers spread in Blå / Vit, 390×844.
// Main build on :4210 (before), branch build on :4211 (after). Drafts are seeded via slice-40-seed.ts.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { openMallList, startFragor } from './tools/smoke-start.mjs' // Slice 54 A1
import { sliceNumber } from './tools/smoke-login.mjs' // Slice 54 B1
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const MAIN = process.env.S40_MAIN ?? 'http://127.0.0.1:4210/traningsplaneringen/'
const BR = process.env.S40_BR ?? 'http://127.0.0.1:4211/traningsplaneringen/'
const ROOT = process.env.S40_ROOT ?? '/workspace/gp-s40'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const seed = (hall, n, mode = '') => execFileSync('bun', [`${ROOT}/verifier/slice-40-seed.ts`, hall, String(n), mode], { encoding: 'utf8' }).trim()
const seedMall = (hall, n) => spawnSync('bun', [`${ROOT}/verifier/slice-40-seed.ts`, hall, String(n), 'mall'], { encoding: 'utf8' }).stderr.trim()

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 400) })
  console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`)
}
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const near = (a, b) => Math.abs(a - b) <= 0.001

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errors = []
const p = await ctx.newPage()
p.setDefaultTimeout(10000)
p.on('pageerror', (e) => errors.push(e.message))
const shot = async (n) => { await p.evaluate(() => document.querySelector('.hall-canvas')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150); return p.screenshot({ path: `/workspace/screenshots/slice40_${n}.png` }) }
const draft = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const builder = () => p.locator('.builder')
const teknikIds = (d) => d.blocks.find((b) => b.type === 'techniques').items.map((i) => i.id)
const placed = (d) => teknikIds(d).map((id) => d.hallPlacements.find((pl) => pl.sessionItemId === id))

async function openHall() {
  const b = p.locator('.builder-actions .builder-hall')
  if (await b.isVisible()) await b.click()
  else { await p.locator('.more-menu > button').click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt' }).click() }
  await p.locator('.hall-canvas').first().waitFor()
  await p.waitForTimeout(500)
}
async function backToBuilder() { await p.getByRole('button', { name: '← Tillbaka till Passbyggaren' }).click(); await builder().waitFor() }
async function loadDraftAndOpen(base, json, templates) {
  await p.goto(base)
  await p.evaluate(([dk, v, tk, t]) => { localStorage.clear(); localStorage.setItem(dk, v); if (t) localStorage.setItem(tk, t) }, [DK, json, TK, templates ?? null])
  await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
}
async function chips() {
  return p.evaluate(() => {
    const canvas = document.querySelector('.hall-canvas').getBoundingClientRect()
    return [...document.querySelectorAll('.hall-canvas .hall-chip--canvas')].map((c) => {
      const r = c.getBoundingClientRect()
      return { rank: c.querySelector('.hall-chip-rank')?.textContent?.trim() ?? '', l: r.left, t: r.top, r: r.right, b: r.bottom, cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2, inside: r.left >= canvas.left - 0.5 && r.right <= canvas.right + 0.5 && r.top >= canvas.top - 0.5 && r.bottom <= canvas.bottom + 0.5 }
    })
  })
}
const overlaps = (cs) => cs.some((a, i) => cs.some((b, j) => j > i && a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5))
async function hallFromSeed(base, hall, n, mode, tag) {
  await loadDraftAndOpen(base, seed(hall, n, mode))
  await openHall()
  const d = await draft()
  const cs = await chips()
  if (tag) await shot(tag)
  return { d, cs, pts: placed(d) }
}

const GOLDEN = JSON.parse(readFileSync(new URL('./slice-40-golden-main-45cce9b.json', import.meta.url), 'utf8')) // Slice 54 E1
const HALL_NAME = { 'Blå hall': 'Gymmix – Stora hallen', 'Vit hall': 'Gymmix – Grophallen' } // Slice 54 A1
async function wizard(base, hallLabel) {
  await p.goto(base)
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  // Slice 54 A1: one tap per answer (Slice 46). The halls were renamed in Slice 45: Blå = «Gymmix – Stora hallen», Vit = «Gymmix – Grophallen».
  await startFragor(p, { age: /7–9/, focus: /^Trampett/, hall: HALL_NAME[hallLabel] })
  const d = await draft()
  await openHall()
  return { d, cs: await chips() }
}

// ── AC1 / AC2: wizard in Blå and Vit, before (main) and after (branch)
await attempt('W', async () => {
  for (const [hall, label, ac] of [['forening-bla', 'Blå hall', 'AC1'], ['forening-vit', 'Vit hall', 'AC2']]) {
    // Slice 54 E1 (widened to AC1/AC2): «before» = the golden file from main @ 45cce9b, same as AC8-main; no main build is opened.
    const gold = GOLDEN[hall].filter(([id]) => id.startsWith('g-')).slice(0, 3)
    const after = await wizard(BR, label)
    await shot(`0${ac === 'AC1' ? 2 : 4}_${hall}_wizard_after`)
    const n = teknikIds(after.d).length
    check(`${ac}-main`, `${label} on main (golden 45cce9b): first Teknik markers share one spot (the bug)`, new Set(gold.map(([, x, y]) => `${x},${y}`)).size < gold.length, JSON.stringify(gold.map(([, x, y]) => [x, y])))
    check(ac, `${label} wizard on branch: ${n} Teknik markers, each separate, none on top of another`, after.d.hallTemplateId === hall && after.cs.length === n && n >= 3 && !overlaps(after.cs), `${after.cs.length} chips / ${n} Teknik`)
  }
})

// ── AC3 / AC4 / AC10 (HallBoard empty-hall auto-place on seeded drafts) + AC5 order + AC8 mixed redskap
await attempt('G', async () => {
  const bla = await hallFromSeed(BR, 'forening-bla', 5, 'mixed', '05_bla5_after')
  const want3 = [[0.21, 0.28], [0.37, 0.28], [0.53, 0.28], [0.69, 0.28], [0.21, 0.5]] // fixed cells (Planner F1 ruling)
  check('AC3/AC10', 'Blå, 5 Teknik, empty hall → Hallöversikt: stored positions = first 5 fixed cells (4 + 1)', bla.pts.every((pt, i) => pt && near(pt.x, want3[i][0]) && near(pt.y, want3[i][1])), JSON.stringify(bla.pts.map((x) => [x?.x, x?.y])))
  check('AC8', 'Mixed redskap (satsbräda, trampett, tumbling, open) in Blå → no shared spot', new Set(bla.pts.map((x) => `${x.x},${x.y}`)).size === 5 && !overlaps(bla.cs))
  const ranks = [...bla.cs].sort((a, b) => (Math.abs(a.cy - b.cy) > 5 ? a.cy - b.cy : a.cx - b.cx)).map((c) => c.rank)
  check('AC5', 'Rank numbers read 1, 2, 3… left→right, top→bottom', ranks.join(',') === '1,2,3,4,5', ranks.join(','))
  // Slice 54 E1: «before» = the golden file recorded on main @ 45cce9b (today's main has the fix, so it can no longer show the bug).
  const golden = GOLDEN['forening-bla'].slice(0, 5)
  check('AC8-main', 'Same pass on main (golden 45cce9b): markers stack', new Set(golden.map(([, x, y]) => `${x},${y}`)).size < 5, JSON.stringify(golden.map(([, x, y]) => [x, y])))
  const vit = await hallFromSeed(BR, 'forening-vit', 4, '', '07_vit4_after')
  const want4 = [[0.135, 0.19], [0.295, 0.19], [0.455, 0.19], [0.135, 0.41]]
  check('AC4', 'Vit, 4 Teknik: stored positions = first 4 fixed cells (3 + 1)', vit.pts.every((pt, i) => pt && near(pt.x, want4[i][0]) && near(pt.y, want4[i][1])), JSON.stringify(vit.pts.map((x) => [x?.x, x?.y])))
  await hallFromSeed(MAIN, 'forening-vit', 4, '', '08_vit4_before_main')
})

// ── AC6 / AC7: fully inside the hall drawing, n = 1, 4, 8 and Vit 12
await attempt('E', async () => {
  const bad = []
  for (const hall of ['forening-bla', 'forening-vit']) for (const n of [1, 4, 8]) {
    const r = await hallFromSeed(BR, hall, n)
    if (r.cs.length !== n || !r.cs.every((c) => c.inside) || (n <= 6 && overlaps(r.cs)) || (hall === 'forening-bla' && n === 8 && overlaps(r.cs))) bad.push(`${hall} ${n}: ${r.cs.length} chips, inside ${r.cs.every((c) => c.inside)}, overlap ${overlaps(r.cs)}`)
  }
  check('AC6', 'Blå and Vit, n = 1/4/8: every marker fully inside the hall canvas; no overlap where the grid has room', bad.length === 0, bad.join(' | '))
  const t0 = Date.now()
  const big = await hallFromSeed(BR, 'forening-vit', 12, '', '09_vit12_after')
  const ms = Date.now() - t0
  const first9 = big.cs.slice(0, 9)
  check('AC7', 'Vit, 12 Teknik: all inside, no hang; the 9 free cells (capacity) do not overlap; markers 10–12 use the least-overlap fallback', big.cs.length === 12 && big.cs.every((c) => c.inside) && !overlaps(first9) && ms < 15000, `${ms} ms`)
})

// ── AC9: standard halls, manual spot check = main
await attempt('S', async () => {
  const diffs = []
  for (const hall of ['standard-trupp', 'tavling-linjer', 'liten-hall']) {
    const json = seed(hall, 6, 'mixed')
    await loadDraftAndOpen(MAIN, json); await openHall(); const a = placed(await draft())
    await loadDraftAndOpen(BR, json); await openHall(); const b = placed(await draft())
    if (JSON.stringify(a.map((x) => [x.x, x.y, x.zoneId])) !== JSON.stringify(b.map((x) => [x.x, x.y, x.zoneId]))) diffs.push(hall)
  }
  await shot('10_liten_hall_same_as_main')
  check('AC9', 'Standard trupp, Tävling / linjer, Liten hall: same seeded pass gives the same positions on main and branch', diffs.length === 0, diffs.join(','))
})

// ── AC11: add a station to a Blå pass with 3 placed (one dragged by hand)
await attempt('D', async () => {
  const s = JSON.parse(seed('forening-bla', 3))
  const ids = teknikIds(s)
  s.hallPlacements = [
    { sessionItemId: ids[0], x: 0.29, y: 0.5, zoneId: 'open' },
    { sessionItemId: ids[1], x: 0.45, y: 0.5, zoneId: 'open' },
    { sessionItemId: ids[2], x: 0.7, y: 0.83, zoneId: 'open' }, // dragged by hand
  ]
  await loadDraftAndOpen(BR, JSON.stringify(s))
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor()
  await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(6).click()
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
  await p.waitForTimeout(1200)
  const d = await draft()
  const pts = placed(d)
  check('AC11', 'Blå, 3 placed (1 dragged) + add from bank: the 3 stay; the new one takes the first free cell (0.21, 0.28), no overlap', JSON.stringify(pts.slice(0, 3)) === JSON.stringify(s.hallPlacements) && pts.length === 4 && near(pts[3].x, 0.21) && near(pts[3].y, 0.28), JSON.stringify(pts.map((x) => [x?.x, x?.y])))
  await openHall(); await shot('11_bla_add_station')
})

// ── AC12: Mina mallar with Blå hall → grid
await attempt('M', async () => {
  const tl = seedMall('forening-bla', 5)
  await loadDraftAndOpen(BR, seed('standard-trupp', 1), tl)
  await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor()
  await openMallList(p, { hall: 'Gymmix – Stora hallen' }) // Slice 54 A1 (Blå)
  await p.locator('.template-saved:not(.template-club) .template-card').filter({ hasText: 'S40 Blå mall' }).first().click()
  await p.waitForTimeout(400)
  const use = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true })
  if (await use.count()) await use.click()
  await builder().waitFor(); await p.waitForTimeout(300)
  const d = await draft()
  const want = [[0.21, 0.28], [0.37, 0.28], [0.53, 0.28], [0.69, 0.28], [0.21, 0.5]]
  check('AC12-mina', 'Mina mallar (Blå, 5 Teknik) applied → grid spread at once', d.hallTemplateId === 'forening-bla' && placed(d).every((pt, i) => pt && near(pt.x, want[i][0]) && near(pt.y, want[i][1])), JSON.stringify(placed(d).map((x) => [x?.x, x?.y])))
})

// ── AC13: saved pass from main with stacked markers opens unchanged
await attempt('L', async () => {
  const s = JSON.parse(seed('forening-bla', 4))
  s.hallPlacements = teknikIds(s).map((id) => ({ sessionItemId: id, x: 0.2784, y: 0.3152, zoneId: 'open' }))
  const json = JSON.stringify(s)
  await loadDraftAndOpen(BR, json); await openHall()
  await p.waitForTimeout(1200)
  const d = await draft()
  check('AC13', 'Stacked pass saved on main → opens with the stored positions, nothing re-laid out', JSON.stringify(d.hallPlacements) === JSON.stringify(s.hallPlacements))
  await shot('12_saved_stack_unchanged')
  // AC14: Hallöversikt controls identical to main for the same pass
  const btns = async () => (await p.locator('.hall-board button:visible, .hall-view button:visible').allInnerTexts()).map((t) => t.trim()).filter(Boolean).sort().join('|')
  const br = await btns()
  await loadDraftAndOpen(MAIN, json); await openHall()
  const mn = await btns()
  check('AC14', 'No new buttons or text in Hallöversikt (same visible buttons as main)', br === mn && br.length > 0, br === mn ? `${br.split('|').length} buttons` : `branch ${br} / main ${mn}`)
  await loadDraftAndOpen(BR, json)
  const f = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('AC16-footer', `Footer «Träningsplaneraren · Slice ${sliceNumber(ROOT)}»`, f.includes(`Träningsplaneraren · Slice ${sliceNumber(ROOT)}`), f) // Slice 54 B1
})

// ── F1: add stations one at a time from the bank (the coach's main path) — Blå up to 12, Vit up to 9
async function addFromBank(n) {
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor()
  await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(n).click()
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
}
await attempt('O', async () => {
  for (const [hall, cap, tag] of [['forening-bla', 12, '13_bla_one_by_one_12'], ['forening-vit', 9, '14_vit_one_by_one_9']]) {
    await loadDraftAndOpen(BR, seed(hall, 0))
    const bad = []
    for (let k = 0; k < cap; k++) {
      await addFromBank(k)
      if (k === 4 || k === cap - 1) {
        await openHall()
        const cs = await chips()
        if (cs.length !== k + 1 || overlaps(cs) || !cs.every((c) => c.inside)) bad.push(`after ${k + 1}: ${cs.length} chips, overlap ${overlaps(cs)}`)
        if (k === 4) await shot(`${tag.slice(0, 3)}${hall === 'forening-bla' ? 'bla' : 'vit'}_one_by_one_5`)
        else await shot(tag)
        await backToBuilder()
      }
    }
    const d = await draft()
    const pts = placed(d)
    let pairs = 0
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (Math.abs(pts[i].x - pts[j].x) < 0.145 && Math.abs(pts[i].y - pts[j].y) < 0.218) pairs++
    check(`F1-${hall}`, `${hall}: ${cap} stations added one by one from the bank → 0 overlapping markers (stored + on screen), all inside`, bad.length === 0 && pts.length === cap && pairs === 0, bad.join(' | ') || `${pts.length} placed, ${pairs} overlapping pairs`)
  }
})

check('E', 'No page errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-40-builder-smoke-results.json`, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
await browser.close()
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

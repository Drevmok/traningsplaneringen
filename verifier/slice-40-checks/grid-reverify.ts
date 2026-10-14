// Slice 40 re-verify (0cba89e), bun: fixed-cell grid in Blå / Vit. Real 390×844 canvases: Blå 358×264, Vit 358×374, marker 52 px.
// 1) one-by-one adds incl. dragged markers, 2) N at once vs one by one (N = 1 … cap+3), 3) Vit capacity FYI.
const br = await import('../../app/src/lib/hallSuggest.ts')
const hall = await import('../../app/src/lib/hall.ts')
const { seedActivities } = await import('../../app/src/data/seedActivities.ts')
const { createBlankSession } = await import('../../app/src/lib/session.ts')
const CAN: Record<string, [number, number]> = { 'forening-bla': [358, 264], 'forening-vit': [358, 374] }
const CHIP = 52
const tek = seedActivities.filter((a: any) => a.blockType === 'techniques')
function pass(n: number, h: string, k = 0) {
  const s: any = createBlankSession(); s.id = `p${k}`; s.hallTemplateId = h; s.hallPlacements = []
  s.blocks.find((b: any) => b.type === 'techniques').items = Array.from({ length: n }, (_, i) => ({ id: `i${i}`, activityId: tek[(i * 7 + k) % tek.length].id, durationMinutes: 5, note: '', order: i }))
  return s
}
function geo(pl: any[], h: string) {
  const [W, H] = CAN[h]; let pairs = 0, maxX = 0, maxY = 0, maxArea = 0, inside = true, full = 0
  const P = pl.map((p) => ({ x: p.x * W, y: p.y * H }))
  for (const q of P) if (q.x < CHIP / 2 - 0.5 || q.x > W - CHIP / 2 + 0.5 || q.y < CHIP / 2 - 0.5 || q.y > H - CHIP / 2 + 0.5) inside = false
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const ox = Math.max(0, CHIP - Math.abs(P[i].x - P[j].x)), oy = Math.max(0, CHIP - Math.abs(P[i].y - P[j].y))
    if (ox > 0 && oy > 0) { pairs++; maxX = Math.max(maxX, ox); maxY = Math.max(maxY, oy); maxArea = Math.max(maxArea, ox * oy); if (ox >= CHIP - 0.01 && oy >= CHIP - 0.01) full++ }
  }
  return { n: pl.length, pairs, fullStack: full, maxOverlapPx: `${+maxX.toFixed(1)}×${+maxY.toFixed(1)}`, maxAreaPct: Math.round((100 * maxArea) / (CHIP * CHIP)), inside }
}
const out: any = {}; let fails = 0; const ok = (c: boolean, m: string) => { if (!c) fails++; console.log(`${c ? 'PASS' : 'FAIL'} ${m}`) }
const ord = (s: any) => s.blocks.find((b: any) => b.type === 'techniques').items.map((i: any) => i.id)
const pos = (s: any) => ord(s).map((id: string) => s.hallPlacements.find((p: any) => p.sessionItemId === id)).map((p: any) => (p ? [p.x, p.y] : null))
for (const h of ['forening-bla', 'forening-vit']) {
  const open = hall.getPreset(h).zones.find((z: any) => z.id === 'open'); const cells = hall.openGridCells(open.bbox); const cap = cells.length
  console.log(`\n== ${h}: open bbox ${JSON.stringify(open.bbox)}; ${cap} cells ${JSON.stringify(cells)}`)
  const cellPx = cells.map((c: any) => [Math.round(c.x * CAN[h][0]), Math.round(c.y * CAN[h][1])]); console.log(`   cells px ${JSON.stringify(cellPx)}`)
  // (2) N at once vs one by one
  const rows: any[] = []
  for (let N = 1; N <= cap + 3; N++) {
    const s0 = pass(N, h, N); const batch = br.autoPlaceUnplaced(s0); const batchItems = br.autoPlaceItems(s0, new Set(ord(s0)))
    let one = s0; for (const id of ord(s0)) one = br.autoPlaceItems(one, new Set([id]))
    const same = JSON.stringify(pos(batch)) === JSON.stringify(pos(one)) && JSON.stringify(pos(batchItems)) === JSON.stringify(pos(one))
    const gb = geo(batch.hallPlacements, h), go = geo(one.hallPlacements, h)
    rows.push({ N, same, batch: gb, oneByOne: go, extraLandsOn: N > cap ? pos(one).slice(cap).map((p: any) => cells.findIndex((c: any) => c.x === p[0] && c.y === p[1]) + 1) : [] })
    if (N <= cap) ok(same && gb.pairs === 0 && go.pairs === 0 && gb.inside && go.inside, `${h} N=${N}: batch == one-by-one, 0 overlap, inside`)
    else ok(same && go.inside && go.pairs === N - cap, `${h} N=${N} (> cap ${cap}): batch == one-by-one, inside, ${go.pairs} overlapping pair(s) = N−cap, max ${go.maxOverlapPx}px (${go.maxAreaPct} %), extra on cell ${rows.at(-1).extraLandsOn}`)
  }
  out[`${h}.batchVsOne`] = rows
  // (1) dragged markers: drag marker 1 into a cell / between cells, then add one by one up to cap+3
  const [W, H] = CAN[h]
  const drags: Record<string, { x: number; y: number }> = {
    'into cell 3': cells[2],
    'between cells 1|2 (h-mid)': { x: (cells[0].x + cells[1].x) / 2, y: cells[0].y },
    'between 4 cells (1,2,c+1,c+2 centre)': { x: (cells[0].x + cells[1].x) / 2, y: (cells[0].y + cells[(cells.findIndex((c: any) => c.y !== cells[0].y))].y) / 2 },
    'off-grid, inside canvas corner (0.9,0.85)': { x: 0.9, y: 0.85 },
  }
  const dragRows: any[] = []
  for (const [name, d] of Object.entries(drags)) {
    const M = cap + 3; let s: any = pass(M, h, 77); const ids = ord(s)
    s = br.autoPlaceItems(s, new Set([ids[0]])); s.hallPlacements = s.hallPlacements.map((p: any) => (p.sessionItemId === ids[0] ? { ...p, x: d.x, y: d.y } : p))
    const steps: any[] = []; let firstOverlapAt: number | null = null; let moved = false
    for (let k = 1; k < M; k++) {
      const before = JSON.stringify(s.hallPlacements)
      s = br.autoPlaceItems(s, new Set([ids[k]]))
      if (!JSON.stringify(s.hallPlacements).startsWith(before.slice(0, -1))) moved = true
      const g = geo(s.hallPlacements, h); if (g.pairs > 0 && firstOverlapAt === null) firstOverlapAt = k + 1
      steps.push({ n: k + 1, ...g })
    }
    const blocked = cells.filter((c: any) => hall.markerOverlap(c, d) > 0).length
    const freeCap = cap - blocked + 1 // dragged one occupies an off-grid spot; cells it blocks are lost
    dragRows.push({ name, dragged: d, cellsBlocked: blocked, effectiveNoOverlapCount: freeCap, firstOverlapAt, moved, at: Object.fromEntries(steps.filter((x) => [cap - 1, cap, cap + 1, cap + 2, M].includes(x.n)).map((x) => [x.n, x])) })
    const upTo = firstOverlapAt === null ? M : firstOverlapAt - 1
    console.log(`${h} drag ${name}: blocks ${blocked} cell(s) → no overlap up to n=${upTo} (cap ${cap}); placed never moved: ${!moved}; inside all: ${steps.every((x) => x.inside)}; at n=${cap}: ${JSON.stringify(steps.find((x) => x.n === cap))}; at n=${M}: ${JSON.stringify(steps.at(-1))}`)
    ok(!moved && steps.every((x) => x.inside), `${h} drag ${name}: placed markers never move, all inside`)
  }
  out[`${h}.drags`] = dragRows
  // least-overlap sanity: past capacity, chosen cell's overlap = min over cells
  { let s: any = pass(cap + 3, h, 9); const ids = ord(s); for (const id of ids.slice(0, cap)) s = br.autoPlaceItems(s, new Set([id]))
    const scores = cells.map((c: any) => s.hallPlacements.reduce((a: number, p: any) => a + hall.markerOverlap(c, p), 0))
    s = br.autoPlaceItems(s, new Set([ids[cap]])); const np = s.hallPlacements.at(-1); const ci = cells.findIndex((c: any) => c.x === np.x && c.y === np.y)
    ok(ci >= 0 && scores[ci] === Math.min(...scores), `${h} marker cap+1 goes to least-overlap cell (cell ${ci + 1}, score ${scores[ci].toFixed(4)} = min ${Math.min(...scores).toFixed(4)}; all cells equal: ${new Set(scores.map((x: number) => x.toFixed(6))).size === 1})`) }
  // (11) capacity FYI in px
  const bw = open.bbox.w * W, bh = open.bbox.h * H, gaps = [4, 8, 12]
  out[`${h}.capacityFYI`] = { openPx: [Math.round(bw), Math.round(bh)], cellStepPx: [+(0.16 * W).toFixed(1), +(0.22 * H).toFixed(1)], grid: gaps.map((g) => { const cols = Math.floor((bw - CHIP) / (CHIP + g)) + 1, rows = Math.floor((bh - CHIP) / (CHIP + g)) + 1; return { gapPx: g, cols, rows, cells: cols * rows } }) }
  console.log(`${h} capacity FYI ${JSON.stringify(out[`${h}.capacityFYI`])}`)
}
await Bun.write(new URL('./reverify/grid-reverify.json', import.meta.url).pathname, JSON.stringify(out, null, 2))
console.log(fails ? `${fails} FAIL` : 'grid all PASS')

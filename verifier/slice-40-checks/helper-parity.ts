// Slice 40 Verifier check (bun): main 45cce9b vs branch helpers over all hall templates, plus Blå/Vit grid geometry.
// Usage: bun verifier/slice-40-checks/helper-parity.ts /tmp/s40v/main/app/src [canvasW canvasH]
const [mainSrc = '/tmp/s40v/main/app/src', cw = '358', ch = '239'] = process.argv.slice(2)
const W = Number(cw), H = Number(ch), CHIP = 52
const br = await import('../../app/src/lib/hallSuggest.ts')
const mn = await import(`${mainSrc}/lib/hallSuggest.ts`)
const { HALL_PRESET_ORDER } = await import('../../app/src/lib/hall.ts')
const { seedActivities } = await import('../../app/src/data/seedActivities.ts')
const { createBlankSession } = await import('../../app/src/lib/session.ts')
const tek = seedActivities.filter((a: any) => a.blockType === 'techniques')
let seed = 40; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
function pass(n: number, hall: string, k: number) {
  const s: any = createBlankSession(); s.id = `p${k}`; s.hallTemplateId = hall; s.hallPlacements = []
  const tb = s.blocks.find((b: any) => b.type === 'techniques')
  tb.items = Array.from({ length: n }, (_, i) => ({ id: `i${k}-${i}`, activityId: tek[Math.floor(rnd() * tek.length)].id, durationMinutes: 5, note: '', order: i }))
  return s
}
const key = (pl: any[]) => JSON.stringify(pl)
let fail = 0; const out = (ok: boolean, m: string) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${m}`) }
// 1. Parity on snap halls: autoPlaceUnplaced from empty, and incremental autoPlaceItems (some placed, rest added)
const snapHalls = HALL_PRESET_ORDER.filter((h: string) => !h.startsWith('forening'))
for (const h of snapHalls) {
  let same = 0, total = 0, inc = 0
  for (let k = 0; k < 400; k++) {
    const s = pass(1 + Math.floor(rnd() * 16), h, k)
    total++; if (key(br.autoPlaceUnplaced(s).hallPlacements) === key(mn.autoPlaceUnplaced(s).hallPlacements)) same++
    const items = s.blocks.find((b: any) => b.type === 'techniques').items
    const cut = Math.floor(items.length / 2); const first = new Set(items.slice(0, cut).map((i: any) => i.id)); const rest = new Set(items.slice(cut).map((i: any) => i.id))
    const pm = mn.autoPlaceItems(mn.autoPlaceItems(s, first), rest), pb = br.autoPlaceItems(br.autoPlaceItems(s, first), rest)
    if (key(pm.hallPlacements) === key(pb.hallPlacements)) inc++
  }
  out(same === total && inc === total, `${h}: byte-identical to main on ${same}/${total} random passes (1–16 Teknik) + ${inc}/${total} two-step adds`)
}
// 2. Blå / Vit geometry
const px = (p: any) => ({ x: p.x * W, y: p.y * H })
function geo(pl: any[]) {
  let minD = Infinity, maxOv = 0, maxOvX = 0, maxOvY = 0, pairs = 0, inside = true, stackedSame = 0
  const spots = new Set<string>()
  for (const p of pl) { const q = px(p); if (q.x < CHIP / 2 - 0.5 || q.x > W - CHIP / 2 + 0.5 || q.y < CHIP / 2 - 0.5 || q.y > H - CHIP / 2 + 0.5) inside = false; const s = `${p.x},${p.y}`; if (spots.has(s)) stackedSame++; spots.add(s) }
  for (let i = 0; i < pl.length; i++) for (let j = i + 1; j < pl.length; j++) {
    const a = px(pl[i]), b = px(pl[j]); const d = Math.hypot(a.x - b.x, a.y - b.y); minD = Math.min(minD, d)
    const ox = Math.max(0, CHIP - Math.abs(a.x - b.x)), oy = Math.max(0, CHIP - Math.abs(a.y - b.y))
    if (ox > 0 && oy > 0) { pairs++; maxOvX = Math.max(maxOvX, ox); maxOvY = Math.max(maxOvY, oy); maxOv = Math.max(maxOv, Math.min(ox, oy)) }
  }
  return { n: pl.length, minDistPx: +minD.toFixed(1), overlappingPairs: pairs, maxOverlapXpx: +maxOvX.toFixed(1), maxOverlapYpx: +maxOvY.toFixed(1), allInsideCanvas: inside, sameSpot: stackedSame }
}
for (const h of ['forening-bla', 'forening-vit']) {
  for (const n of [1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 20]) {
    const s = pass(n, h, 1000 + n)
    const b = br.autoPlaceUnplaced(s).hallPlacements, m = mn.autoPlaceUnplaced(s).hallPlacements
    const order = b.every((p: any, i: number) => i === 0 || p.y > b[i - 1].y + 1e-9 || (Math.abs(p.y - b[i - 1].y) < 1e-9 && p.x > b[i - 1].x))
    console.log(`${h} n=${n} branch ${JSON.stringify(geo(b))} order-row-major ${order} | main ${JSON.stringify(geo(m))}`)
    if (n === 5 || n === 4) console.log(`   coords ${b.map((p: any) => `(${p.x},${p.y})`).join(' ')}`)
  }
  // Incremental: add one marker at a time (add station from the bank), never moving earlier ones
  let s = pass(8, h, 2000); const ids = s.blocks.find((b: any) => b.type === 'techniques').items.map((i: any) => i.id)
  const steps: string[] = []
  for (let k = 0; k < ids.length; k++) { s = br.autoPlaceItems(s, new Set([ids[k]])); const g = geo(s.hallPlacements); steps.push(`n${k + 1}: min ${g.minDistPx}px, overlap pairs ${g.overlappingPairs}, max overlap ${g.maxOverlapXpx}×${g.maxOverlapYpx}px`) }
  console.log(`${h} one-at-a-time adds (bank «Lägg till»): ${steps.join(' | ')}`)
  console.log(`   final coords ${s.hallPlacements.map((p: any) => `(${p.x},${p.y})`).join(' ')}`)
}
console.log(fail ? `${fail} FAIL` : 'parity all PASS')

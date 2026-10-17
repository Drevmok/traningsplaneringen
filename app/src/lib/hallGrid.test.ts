import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HALL_PRESET_ORDER, HALL_PRESETS } from '../data/hallPresets.ts'
import { markerOverlap, openGridCells, pickOpenCell } from './hall.ts'
import { autoPlaceItems, autoPlaceUnplaced } from './hallSuggest.ts'
import { goldenSession } from './hallGoldenFixture.ts'
import type { Session } from '../types.ts'

type Row = [string, number, number, string | null]
const GOLDEN: Record<string, Row[]> = {
  // forening-bla: fixed-cell grid (Planner ruling on F1); supersedes the HANDOFF §2 count-based values
  "forening-bla": [
    ["g-vault", 0.21, 0.28, "open"],
    ["g-trampett", 0.37, 0.28, "open"],
    ["g-tumbling", 0.53, 0.28, "open"],
    ["g-mattberg", 0.69, 0.28, "open"],
    ["g-mats", 0.21, 0.5, "open"],
    ["g-open-1", 0.37, 0.5, "open"],
    ["g-open-2", 0.53, 0.5, "open"],
    ["g-open-3", 0.69, 0.5, "open"],
    ["g-open-4", 0.21, 0.72, "open"],
    ["g-vault-2", 0.37, 0.72, "open"],
    ["g-vault-3", 0.53, 0.72, "open"],
  ],
  // forening-vit: fixed-cell grid (Planner ruling on F1); supersedes the HANDOFF §2 count-based values
  "forening-vit": [
    ["g-vault", 0.135, 0.19, "open"],
    ["g-trampett", 0.295, 0.19, "open"],
    ["g-tumbling", 0.455, 0.19, "open"],
    ["g-mattberg", 0.135, 0.41, "open"],
    ["g-mats", 0.295, 0.41, "open"],
    ["g-open-1", 0.455, 0.41, "open"],
    ["g-open-2", 0.135, 0.63, "open"],
    ["g-open-3", 0.295, 0.63, "open"],
    ["g-open-4", 0.455, 0.63, "open"],
    ["g-vault-2", 0.135, 0.19, "open"],
    ["g-vault-3", 0.295, 0.19, "open"],
  ],
}

const box = (id: string) => HALL_PRESETS[id as keyof typeof HALL_PRESETS].zones.find((z) => z.id === 'open')!.bbox
const CAPACITY: Record<string, number> = { 'forening-bla': 12, 'forening-vit': 9 }
const pairOverlap = (pts: { x: number; y: number }[]) => {
  let n = 0
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (markerOverlap(pts[i], pts[j]) > 0) n++
  return n
}

/** Golden pass with the first n Teknik stations, n up to 16 (ids g-0…). */
function passOf(hall: string, n: number): Session {
  const s = goldenSession(hall as never)
  const tek = s.blocks.find((b) => b.type === 'techniques')!
  const base = tek.items[0]
  tek.items = Array.from({ length: n }, (_, i) => ({ ...base, id: `g-${i}`, order: i }))
  return s
}
/** Add stations one at a time, as the coach does from the bank (autoPlaceItems with one new id). */
function oneByOne(hall: string, n: number): Session {
  const full = passOf(hall, n)
  const tek = full.blocks.find((b) => b.type === 'techniques')!
  let s: Session = { ...full, blocks: full.blocks.map((b) => (b.type === 'techniques' ? { ...b, items: [] } : b)), hallPlacements: [] }
  for (const item of tek.items) {
    s = { ...s, blocks: s.blocks.map((b) => (b.type === 'techniques' ? { ...b, items: [...b.items, item] } : b)) }
    s = autoPlaceItems(s, new Set([item.id]))
  }
  return s
}

describe('Slice 40 golden: autoPlaceUnplaced over every hall template', () => {
  it('covers both Gymmix halls (Slice 45: generic templates removed)', () => assert.deepEqual([...HALL_PRESET_ORDER].sort(), Object.keys(GOLDEN).sort()))
  for (const id of HALL_PRESET_ORDER) {
    it(id, () => {
      const rows = autoPlaceUnplaced(goldenSession(id)).hallPlacements!.map((p) => [p.sessionItemId, p.x, p.y, p.zoneId ?? null])
      assert.deepEqual(rows, GOLDEN[id])
    })
  }
})

describe('Slice 40 fixed open grid', () => {
  it('cell values: Blå 4 × 3 = 12, Vit 3 × 3 = 9', () => {
    const b = openGridCells(box('forening-bla'))
    assert.equal(b.length, CAPACITY['forening-bla'])
    assert.deepEqual([...new Set(b.map((c) => c.x))], [0.21, 0.37, 0.53, 0.69])
    assert.deepEqual([...new Set(b.map((c) => c.y))], [0.28, 0.5, 0.72])
    const v = openGridCells(box('forening-vit'))
    assert.equal(v.length, CAPACITY['forening-vit'])
    assert.deepEqual([...new Set(v.map((c) => c.x))], [0.135, 0.295, 0.455])
    assert.deepEqual([...new Set(v.map((c) => c.y))], [0.19, 0.41, 0.63])
  })
  it('cells never overlap each other and keep the marker inside Öppen yta', () => {
    for (const id of ['forening-bla', 'forening-vit']) {
      const b = box(id), cells = openGridCells(b)
      assert.equal(pairOverlap(cells), 0, id)
      for (const c of cells) assert.ok(c.x - 0.145 / 2 >= b.x && c.x + 0.145 / 2 <= b.x + b.w && c.y - 0.218 / 2 >= b.y && c.y + 0.218 / 2 <= b.y + b.h, id)
    }
  })
  it('first marker goes to the first cell (row order)', () => {
    assert.deepEqual(autoPlaceUnplaced(passOf('forening-bla', 1)).hallPlacements![0], { sessionItemId: 'g-0', x: 0.21, y: 0.28, zoneId: 'open' })
    assert.deepEqual(autoPlaceUnplaced(passOf('forening-vit', 1)).hallPlacements![0], { sessionItemId: 'g-0', x: 0.135, y: 0.19, zoneId: 'open' })
  })
  it('fallback: all cells taken → least-overlapping cell, ties → row order', () => {
    const cells = [{ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.2 }]
    assert.deepEqual(pickOpenCell(cells, [{ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.2 }]), cells[0])
    assert.deepEqual(pickOpenCell(cells, [{ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.2 }, { x: 0.21, y: 0.21 }]), cells[1])
    assert.deepEqual(pickOpenCell(cells, [{ x: 0.2, y: 0.2 }, { x: 0.55, y: 0.25 }]), cells[1])
  })
})

describe('Slice 40 placing in Blå / Vit', () => {
  for (const hall of ['forening-bla', 'forening-vit']) {
    it(`${hall}: 1-by-1 adds up to 16 — 0 overlapping pairs up to capacity ${CAPACITY[hall]}, then least-overlap fallback`, () => {
      const s = oneByOne(hall, 16)
      const pts = s.hallPlacements!
      assert.equal(pts.length, 16)
      const cap = CAPACITY[hall]
      for (let n = 1; n <= cap; n++) assert.equal(pairOverlap(pts.slice(0, n)), 0, `n = ${n}`)
      // beyond capacity: each extra one sits on a cell, and the whole layout is the cells in order, wrapped
      const cells = openGridCells(box(hall))
      for (let i = 0; i < 16; i++) assert.deepEqual({ x: pts[i].x, y: pts[i].y }, cells[i % cap], `marker ${i}`)
      assert.ok(pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
    })
    it(`${hall}: batch place of N = 1-by-1 result (N = 1…16)`, () => {
      for (let n = 1; n <= 16; n++) {
        const batch = autoPlaceUnplaced(passOf(hall, n)).hallPlacements!.map((p) => [p.x, p.y])
        const single = oneByOne(hall, n).hallPlacements!.map((p) => [p.x, p.y])
        assert.deepEqual(batch, single, `n = ${n}`)
      }
    })
  }
  it('mix: pre-placed (one dragged onto a cell) + new → old never move, new take the free cells in row order', () => {
    const s = passOf('forening-bla', 6)
    s.hallPlacements = [
      { sessionItemId: 'g-0', x: 0.21, y: 0.28, zoneId: 'open' },
      { sessionItemId: 'g-1', x: 0.53, y: 0.29, zoneId: 'open' }, // dragged near cell 3
      { sessionItemId: 'g-2', x: 0.3, y: 0.85, zoneId: 'open' }, // dragged low, between cells 9 and 10
    ]
    const out = autoPlaceUnplaced(s).hallPlacements!
    assert.deepEqual(out.slice(0, 3), s.hallPlacements)
    assert.deepEqual(out.slice(3).map((p) => [p.x, p.y]), [[0.37, 0.28], [0.69, 0.28], [0.21, 0.5]])
    assert.equal(pairOverlap(out), 0)
  })
  it('AC11 case: 3 placed (one dragged) + add from bank → the 3 stay, new one on the first free cell', () => {
    const s = passOf('forening-bla', 4)
    s.hallPlacements = [
      { sessionItemId: 'g-0', x: 0.21, y: 0.28, zoneId: 'open' },
      { sessionItemId: 'g-1', x: 0.37, y: 0.28, zoneId: 'open' },
      { sessionItemId: 'g-2', x: 0.3, y: 0.75, zoneId: 'open' },
    ]
    const out = autoPlaceItems(s, new Set(['g-3'])).hallPlacements!
    assert.deepEqual(out.slice(0, 3), s.hallPlacements)
    assert.deepEqual(out[3], { sessionItemId: 'g-3', x: 0.53, y: 0.28, zoneId: 'open' })
  })
  it('placements of non-Teknik items are not counted as taken', () => {
    const s = passOf('forening-vit', 1)
    s.hallPlacements = [{ sessionItemId: 'g-warm', x: 0.135, y: 0.19, zoneId: 'open' }]
    assert.deepEqual(autoPlaceUnplaced(s).hallPlacements![1], { sessionItemId: 'g-0', x: 0.135, y: 0.19, zoneId: 'open' })
  })
})

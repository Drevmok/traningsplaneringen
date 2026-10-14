import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HALL_PRESET_ORDER, HALL_PRESETS } from '../data/hallPresets.ts'
import { gridPointInOpen } from './hall.ts'
import { autoPlaceItems, autoPlaceUnplaced } from './hallSuggest.ts'
import { goldenSession } from './hallGoldenFixture.ts'

type Row = [string, number, number, string | null]
const GOLDEN: Record<string, Row[]> = {
  // forening-bla: new Slice 40 grid values
  "forening-bla": [
    ["g-vault", 0.21, 0.26, "open"],
    ["g-trampett", 0.37, 0.26, "open"],
    ["g-tumbling", 0.53, 0.26, "open"],
    ["g-mattberg", 0.69, 0.26, "open"],
    ["g-mats", 0.21, 0.5, "open"],
    ["g-open-1", 0.37, 0.5, "open"],
    ["g-open-2", 0.53, 0.5, "open"],
    ["g-open-3", 0.69, 0.5, "open"],
    ["g-open-4", 0.21, 0.74, "open"],
    ["g-vault-2", 0.37, 0.74, "open"],
    ["g-vault-3", 0.53, 0.74, "open"],
  ],
  // forening-vit: new Slice 40 grid values
  "forening-vit": [
    ["g-vault", 0.135, 0.19, "open"],
    ["g-trampett", 0.295, 0.19, "open"],
    ["g-tumbling", 0.455, 0.19, "open"],
    ["g-mattberg", 0.135, 0.3367, "open"],
    ["g-mats", 0.295, 0.3367, "open"],
    ["g-open-1", 0.455, 0.3367, "open"],
    ["g-open-2", 0.135, 0.4833, "open"],
    ["g-open-3", 0.295, 0.4833, "open"],
    ["g-open-4", 0.455, 0.4833, "open"],
    ["g-vault-2", 0.135, 0.63, "open"],
    ["g-vault-3", 0.295, 0.63, "open"],
  ],
  // standard-trupp: snapshot captured on main @ 45cce9b before the change
  "standard-trupp": [
    ["g-vault", 0.77, 0.61, "vault"],
    ["g-trampett", 0.77, 0.18, "trampett"],
    ["g-tumbling", 0.77, 0.4, "tumbling"],
    ["g-mattberg", 0.7, 0.8, "mattberg"],
    ["g-mats", 0.86, 0.8, "mats"],
    ["g-open-1", 0.2056, 0.3184, "open"],
    ["g-open-2", 0.2406, 0.3184, "open"],
    ["g-open-3", 0.2756, 0.3184, "open"],
    ["g-open-4", 0.2056, 0.3584, "open"],
    ["g-vault-2", 0.805, 0.61, "vault"],
    ["g-vault-3", 0.8400000000000001, 0.61, "vault"],
  ],
  // tavling-linjer: snapshot captured on main @ 45cce9b before the change
  "tavling-linjer": [
    ["g-vault", 0.7, 0.55, "vault"],
    ["g-trampett", 0.7, 0.17, "trampett"],
    ["g-tumbling", 0.7, 0.36, "tumbling"],
    ["g-mattberg", 0.6, 0.76, "mattberg"],
    ["g-mats", 0.85, 0.76, "mats"],
    ["g-open-1", 0.1564, 0.32720000000000005, "open"],
    ["g-open-2", 0.19140000000000001, 0.32720000000000005, "open"],
    ["g-open-3", 0.22640000000000002, 0.32720000000000005, "open"],
    ["g-open-4", 0.1564, 0.3672, "open"],
    ["g-vault-2", 0.735, 0.55, "vault"],
    ["g-vault-3", 0.77, 0.55, "vault"],
  ],
  // liten-hall: snapshot captured on main @ 45cce9b before the change
  "liten-hall": [
    ["g-vault", 0.83, 0.56, "vault"],
    ["g-trampett", 0.83, 0.19, "trampett"],
    ["g-tumbling", 0.83, 0.38, "tumbling"],
    ["g-mattberg", 0.78, 0.76, "mattberg"],
    ["g-mats", 0.9, 0.76, "mats"],
    ["g-open-1", 0.2336, 0.3184, "open"],
    ["g-open-2", 0.2686, 0.3184, "open"],
    ["g-open-3", 0.3036, 0.3184, "open"],
    ["g-open-4", 0.2336, 0.3584, "open"],
    ["g-vault-2", 0.865, 0.56, "vault"],
    ["g-vault-3", 0.8999999999999999, 0.56, "vault"],
  ],
}

const box = (id: string) => HALL_PRESETS[id as keyof typeof HALL_PRESETS].zones.find((z) => z.id === 'open')!.bbox
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9

describe('Slice 40 golden: autoPlaceUnplaced over every hall template', () => {
  it('covers all 5 templates', () => assert.deepEqual([...HALL_PRESET_ORDER].sort(), Object.keys(GOLDEN).sort()))
  for (const id of HALL_PRESET_ORDER) {
    it(id, () => {
      const rows = autoPlaceUnplaced(goldenSession(id)).hallPlacements!.map((p) => [p.sessionItemId, p.x, p.y, p.zoneId ?? null])
      assert.deepEqual(rows, GOLDEN[id])
    })
  }
  it('Blå / Vit: no two markers share a spot (the old stack)', () => {
    for (const id of ['forening-bla', 'forening-vit']) {
      const pts = GOLDEN[id].map((r) => `${r[1]},${r[2]}`)
      assert.equal(new Set(pts).size, pts.length, id)
    }
  })
})

describe('Slice 40 gridPointInOpen', () => {
  it('worked values: Blå n = 5', () => {
    const pts = [0, 1, 2, 3, 4].map((i) => gridPointInOpen(box('forening-bla'), i, 5))
    assert.deepEqual(pts.map((p) => p.x), [0.21, 0.37, 0.53, 0.69, 0.21])
    assert.deepEqual(pts.map((p) => p.y), [0.38, 0.38, 0.38, 0.38, 0.62])
  })
  it('worked values: Vit n = 4', () => {
    const pts = [0, 1, 2, 3].map((i) => gridPointInOpen(box('forening-vit'), i, 4))
    assert.deepEqual(pts.map((p) => p.x), [0.135, 0.295, 0.455, 0.135])
    assert.deepEqual(pts.map((p) => p.y), [0.29, 0.29, 0.29, 0.53])
  })
  it('n = 1 sits in the middle of Öppen yta', () => {
    assert.deepEqual(gridPointInOpen(box('forening-bla'), 0, 1), { x: 0.45, y: 0.5 })
    assert.deepEqual(gridPointInOpen(box('forening-vit'), 0, 1), { x: 0.295, y: 0.41 })
  })
  it('Blå 8 = 4×2 and Vit 6 = 3×2 without overlap (steps ≥ marker size)', () => {
    const b = [...Array(8).keys()].map((i) => gridPointInOpen(box('forening-bla'), i, 8))
    assert.equal(new Set(b.map((p) => p.y)).size, 2)
    assert.ok(near(b[1].x - b[0].x, 0.16) && near(b[4].y - b[0].y, 0.24))
    const v = [...Array(6).keys()].map((i) => gridPointInOpen(box('forening-vit'), i, 6))
    assert.equal(new Set(v.map((p) => p.y)).size, 2)
    assert.ok(near(v[3].y - v[0].y, 0.24))
  })
  it('Vit with 3 rows compresses stepY to 0.22', () => {
    const v = [0, 3].map((i) => gridPointInOpen(box('forening-vit'), i, 9))
    assert.ok(near(v[1].y - v[0].y, 0.22))
  })
  it('n = 20 in Vit: inside the inner box, y non-decreasing, row-major, no NaN', () => {
    const b = box('forening-vit')
    const pts = [...Array(20).keys()].map((i) => gridPointInOpen(b, i, 20))
    for (const [i, p] of pts.entries()) {
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y))
      assert.ok(p.x >= b.x + 0.08 - 1e-9 && p.x <= b.x + b.w - 0.08 + 1e-9, `x ${i}`)
      assert.ok(p.y >= b.y + 0.11 - 1e-9 && p.y <= b.y + b.h - 0.11 + 1e-9, `y ${i}`)
      if (i > 0) assert.ok(p.y >= pts[i - 1].y)
      if (i > 0 && p.y === pts[i - 1].y) assert.ok(p.x > pts[i - 1].x)
    }
  })
  it('degenerate box never gives NaN or leaves 0–1', () => {
    const p = gridPointInOpen({ x: 0.95, y: 0.95, w: 0.01, h: 0.01 }, 3, 7)
    assert.ok(Number.isFinite(p.x) && p.x >= 0 && p.x <= 1 && Number.isFinite(p.y) && p.y >= 0 && p.y <= 1)
  })
})

describe('Slice 40 autoPlaceItems in an open-only hall', () => {
  it('pass order kept: index i before i + 1, row-major', () => {
    const rows = autoPlaceUnplaced(goldenSession('forening-bla')).hallPlacements!
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i]
      assert.ok(b.y > a.y || (b.y === a.y && b.x > a.x), `${i}`)
    }
  })
  it('D1: Blå with 3 placed (one dragged) + 1 new → the 3 stay, the new one is slot 3 of 4', () => {
    const s = goldenSession('forening-bla')
    const tek = s.blocks.find((b) => b.type === 'techniques')!
    tek.items = tek.items.slice(0, 4)
    s.hallPlacements = [
      { sessionItemId: 'g-vault', x: 0.3, y: 0.3, zoneId: 'open' },
      { sessionItemId: 'g-trampett', x: 0.62, y: 0.81, zoneId: 'open' },
      { sessionItemId: 'g-tumbling', x: 0.5, y: 0.4, zoneId: 'open' },
    ]
    const out = autoPlaceItems(s, new Set(['g-mattberg']))
    assert.deepEqual(out.hallPlacements!.slice(0, 3), s.hallPlacements)
    assert.deepEqual(out.hallPlacements![3], { sessionItemId: 'g-mattberg', x: 0.69, y: 0.5, zoneId: 'open' })
  })
  it('placements of non-Teknik items are not counted as existing', () => {
    const s = goldenSession('forening-vit')
    const tek = s.blocks.find((b) => b.type === 'techniques')!
    tek.items = tek.items.slice(0, 1)
    s.hallPlacements = [{ sessionItemId: 'g-warm', x: 0.1, y: 0.1, zoneId: 'open' }]
    const out = autoPlaceUnplaced(s)
    assert.deepEqual(out.hallPlacements![1], { sessionItemId: 'g-vault', x: 0.295, y: 0.41, zoneId: 'open' })
  })
})

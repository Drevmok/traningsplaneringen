// Slice 37 (A1, E1) — the three mall apply paths place unplaced Teknik with the wizard's helper.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedTemplates } from '../data/seedTemplates.ts'
import type { Session } from '../types.ts'
import { clubPayload, clubTemplateToSession, toClubTemplate, type ClubTemplate } from './clubTemplates.ts'
import { DEFAULT_HALL_TEMPLATE, placeableItems } from './hall.ts'
import { autoPlaceUnplaced } from './hallSuggest.ts'
import { savedTemplateToSession, type SavedTemplate } from './savedTemplates.ts'
import { cloneTemplate } from './session.ts'
import { applyMall } from './mallApply.ts'
import { sessionToShare } from './sharePass.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size
    },
  },
})

const teknikIds = (s: Session) => new Set(placeableItems(s).map((i) => i.id))
function assertOnlyTeknikPlaced(s: Session) {
  const placed = new Set((s.hallPlacements ?? []).map((p) => p.sessionItemId))
  const teknik = teknikIds(s)
  assert.ok(teknik.size >= 2, 'mall has ≥ 2 Teknik items')
  assert.deepEqual([...placed].sort(), [...teknik].sort())
  for (const b of s.blocks) if (b.type !== 'techniques') for (const i of b.items) assert.equal(placed.has(i.id), false, i.id)
}

const mall = seedTemplates.find((t) => t.blocks.some((b) => b.type === 'techniques' && b.items.length >= 2)) ?? seedTemplates[0]

describe('Slice 37 — Teknik placed on mall apply', () => {
  it('built-in mall: every Teknik item placed, nothing else, default hall kept', () => {
    const cloned = cloneTemplate(mall)
    assert.equal((cloned.hallPlacements ?? []).length, 0)
    const placed = autoPlaceUnplaced(cloned)
    assertOnlyTeknikPlaced(placed)
    assert.equal(placed.hallTemplateId, cloned.hallTemplateId)
    assert.equal(placed.hallTemplateId, DEFAULT_HALL_TEMPLATE)
  })

  it('club mall: placed after clubTemplateToSession; clubPayload still has no hallPlacements', () => {
    const src = autoPlaceUnplaced(cloneTemplate(mall))
    const payload = clubPayload(src, 'Klubbmall')
    assert.equal('hallPlacements' in payload, false)
    const t = toClubTemplate({ id: 'c1', title: 'Klubbmall', total_minutes: 50, payload, updated_at: '' }) as ClubTemplate
    const applied = clubTemplateToSession(t)
    assert.equal((applied.hallPlacements ?? []).length, 0)
    const placed = autoPlaceUnplaced(applied)
    assertOnlyTeknikPlaced(placed)
    assert.equal(placed.hallTemplateId, applied.hallTemplateId)
  })

  it('Egen mall with one saved placement keeps its x/y; only the rest are added', () => {
    const base = cloneTemplate(mall)
    const first = placeableItems(base)[0]
    const saved: Session = { ...base, hallPlacements: [{ sessionItemId: first.id, x: 0.123, y: 0.456 }] }
    const tpl: SavedTemplate = { id: 'm1', title: 'Egen', totalMinutes: saved.totalMinutes, savedAt: '', pass: sessionToShare(saved) }
    const placed = autoPlaceUnplaced(savedTemplateToSession(tpl))
    assertOnlyTeknikPlaced(placed)
    const kept = placed.hallPlacements?.find((p) => p.sessionItemId === first.id)
    assert.equal(kept?.x, 0.123)
    assert.equal(kept?.y, 0.456)
  })

  it('Egen mall without placements: all Teknik placed; the helper returns the same object when nothing is missing', () => {
    const tpl: SavedTemplate = { id: 'm2', title: 'Egen 2', totalMinutes: 0, savedAt: '', pass: sessionToShare(cloneTemplate(mall)) }
    const placed = autoPlaceUnplaced(savedTemplateToSession(tpl))
    assertOnlyTeknikPlaced(placed)
    assert.equal(autoPlaceUnplaced(placed), placed)
  })
})

describe('Slice 46 B1 — applyMall with the Hall answer', () => {
  const placedOn = (s: Session) => (s.hallPlacements ?? []).map((p) => p.sessionItemId)
  it('built-in mall on Grophallen: hall replaced, Teknik placed in pass order on its grid', () => {
    const s = applyMall({ kind: 'builtin', item: mall }, 'forening-vit')
    assert.equal(s.hallTemplateId, 'forening-vit')
    assertOnlyTeknikPlaced(s)
    assert.deepEqual(placedOn(s), placeableItems(s).map((i) => i.id))
    assert.ok(s.hallPlacements!.every((p) => p.zoneId === 'open'))
  })
  it('Mina mall on Stora hallen, same answer: its placements are kept', () => {
    const base = autoPlaceUnplaced(cloneTemplate(mall))
    const custom: Session = { ...base, hallTemplateId: 'forening-bla', hallPlacements: base.hallPlacements!.map((p, i) => ({ ...p, x: 0.1 + i * 0.05, y: 0.7 })) }
    const tpl: SavedTemplate = { id: 'm3', title: 'Egen 3', totalMinutes: 0, savedAt: '', pass: sessionToShare(custom) }
    const s = applyMall({ kind: 'saved', item: tpl }, 'forening-bla')
    assert.deepEqual(s.hallPlacements!.map((p) => [p.x, p.y]), custom.hallPlacements!.map((p) => [p.x, p.y]))
  })
  it('the same Mina mall answered with Grophallen: hall replaced, markers re-placed in pass order', () => {
    const base = autoPlaceUnplaced(cloneTemplate(mall))
    const custom: Session = { ...base, hallTemplateId: 'forening-bla', hallPlacements: base.hallPlacements!.map((p, i) => ({ ...p, x: 0.1 + i * 0.05, y: 0.7 })) }
    const tpl: SavedTemplate = { id: 'm4', title: 'Egen 4', totalMinutes: 0, savedAt: '', pass: sessionToShare(custom) }
    const s = applyMall({ kind: 'saved', item: tpl }, 'forening-vit')
    assert.equal(s.hallTemplateId, 'forening-vit')
    assert.deepEqual(placedOn(s), placeableItems(s).map((i) => i.id))
    assert.ok(s.hallPlacements!.every((p) => p.y !== 0.7))
  })
  it('föreningens mall: hall as answered, markers placed', () => {
    const payload = clubPayload(autoPlaceUnplaced(cloneTemplate(mall)), 'Klubb')
    const t = toClubTemplate({ id: 'c2', title: 'Klubb', total_minutes: 50, payload, updated_at: '' }) as ClubTemplate
    for (const hall of ['forening-bla', 'forening-vit'] as const) {
      const s = applyMall({ kind: 'club', item: t }, hall)
      assert.equal(s.hallTemplateId, hall)
      assertOnlyTeknikPlaced(s)
    }
  })
  it('no Hall answer (Mallar tab): as before', () => {
    const s = applyMall({ kind: 'builtin', item: mall })
    assert.equal(s.hallTemplateId, DEFAULT_HALL_TEMPLATE)
    assertOnlyTeknikPlaced(s)
  })
})

// Slice 55 A1/C1 — Starta från mall scales the whole pass to the chosen Passlängd.
const LENGTHS = [60, 90, 120] as const
const mins = (s: Session) => s.blocks.flatMap((b) => b.items.map((i) => i.durationMinutes))
const ids = (s: Session) => s.blocks.flatMap((b) => b.items.map((i) => i.activityId))
function assertScaled(orig: Session, scaled: Session, length: number) {
  assert.equal(scaled.totalMinutes, length)
  assert.equal(scaled.targetMinutes, length)
  assert.deepEqual(ids(scaled), ids(orig))
  const w = mins(orig).map((m) => Math.max(1, m))
  const sum = w.reduce((a, b) => a + b, 0)
  mins(scaled).forEach((m, i) => {
    assert.ok(Number.isInteger(m) && m >= 1, `item ${i}: ${m}`)
    assert.ok(Math.abs(m - (length * w[i]) / sum) <= 1, `item ${i}: ${m} vs ${(length * w[i]) / sum}`)
  })
}

describe('Slice 55 — applyMall with Passlängd', () => {
  it('every built-in mall × 60/90/120: exact total, whole ≥1 min, proportions ≤1 min off', () => {
    for (const t of seedTemplates) {
      const orig = applyMall({ kind: 'builtin', item: t })
      for (const L of LENGTHS) assertScaled(orig, applyMall({ kind: 'builtin', item: t }, 'forening-bla', L), L)
    }
  })

  it('Mina mall and föreningsmall: same checks; the mall itself is unchanged', () => {
    const src = autoPlaceUnplaced(cloneTemplate(mall))
    const saved: SavedTemplate = { id: 's55', title: 'Egen', totalMinutes: src.totalMinutes, savedAt: '', pass: sessionToShare(src) }
    const club = toClubTemplate({ id: 'c55', title: 'Klubb', total_minutes: 50, payload: clubPayload(src, 'Klubb'), updated_at: '' }) as ClubTemplate
    const before = JSON.stringify([saved, club, mall])
    for (const L of LENGTHS) {
      assertScaled(applyMall({ kind: 'saved', item: saved }), applyMall({ kind: 'saved', item: saved }, undefined, L), L)
      assertScaled(applyMall({ kind: 'club', item: club }), applyMall({ kind: 'club', item: club }, 'forening-vit', L), L)
    }
    assert.equal(JSON.stringify([saved, club, mall]), before)
  })

  it('without length: same times as main (golden, D1 Mallar tab)', () => {
    const s = applyMall({ kind: 'builtin', item: mall })
    assert.deepEqual(mins(s), mins(cloneTemplate(mall)))
    assert.equal(s.targetMinutes, cloneTemplate(mall).targetMinutes)
  })

  it('mall without exercises: only targetMinutes is set', () => {
    const empty = { ...mall, blocks: mall.blocks.map((b) => ({ ...b, items: [] })) }
    const s = applyMall({ kind: 'builtin', item: empty }, undefined, 90)
    assert.equal(s.targetMinutes, 90)
    assert.equal(s.totalMinutes, 0)
  })

  it('more exercises than minutes would need: still ≥1 each and exact total', async () => {
    const { scaleToLength } = await import('./mallApply.ts')
    const base = cloneTemplate(mall)
    const many = { ...base, blocks: base.blocks.map((b, i) => (i === 0 ? { ...b, items: [...b.items, ...Array.from({ length: 5 }, (_, k) => ({ ...b.items[0] ?? base.blocks.find((x) => x.items.length)!.items[0], id: `x${k}`, durationMinutes: 0 }))] } : b)) }
    const s = scaleToLength(many, 60)
    assert.equal(s.totalMinutes, 60)
    assert.ok(mins(s).every((m) => m >= 1))
  })
})

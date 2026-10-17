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

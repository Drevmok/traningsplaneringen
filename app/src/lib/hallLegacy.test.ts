import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedTemplates } from '../data/seedTemplates.ts'
import type { Session } from '../types.ts'
import { getPreset, isLegacyHall, migrateHallFields, normalizeTemplateId, placeableItems } from './hall.ts'
import { autoPlaceUnplaced } from './hallSuggest.ts'
import { savedTemplateToSession } from './savedTemplates.ts'
import { cloneTemplate } from './session.ts'
import { sessionToShare, shareToSession } from './sharePass.ts'

/** A Nybörjare pass on `hall` with every Teknik station placed in a generic snap zone. */
function legacyPass(hall: string | undefined): Session {
  const s = cloneTemplate(seedTemplates.find((t) => /Nybörjare/.test(t.title)) ?? seedTemplates[0])
  const tek = placeableItems(s)
  return {
    ...s,
    hallTemplateId: hall as Session['hallTemplateId'],
    hallPlacements: tek.map((it, i) => ({ sessionItemId: it.id, x: 0.02 + i * 0.01, y: 0.02, zoneId: 'trampett' as const })),
  }
}

/** What the builder shows: migrate on load, then the silent auto-place when the hall is empty. */
const opened = (s: Session) => {
  const m = migrateHallFields(s)
  return (m.hallPlacements ?? []).length === 0 ? autoPlaceUnplaced(m) : m
}

const gridOrder = (s: Session) =>
  autoPlaceUnplaced({ ...s, hallTemplateId: 'forening-bla', hallPlacements: [] }).hallPlacements

describe('Slice 45 A1: passes saved on a removed hall', () => {
  for (const id of ['standard-trupp', 'tavling-linjer', 'liten-hall', 'generic-trupp', undefined]) {
    it(`${id ?? 'no hallTemplateId'} → Gymmix – Stora hallen, markers on the open grid in pass order`, () => {
      const raw = legacyPass(id)
      assert.equal(isLegacyHall(raw), true)
      const migrated = migrateHallFields(raw)
      assert.equal(migrated.hallTemplateId, 'forening-bla')
      assert.deepEqual(migrated.hallPlacements, [])
      const s = opened(raw)
      assert.equal(getPreset(s.hallTemplateId).label, 'Gymmix – Stora hallen')
      assert.ok((s.hallPlacements ?? []).length >= 3)
      assert.ok(s.hallPlacements!.every((p) => p.zoneId === 'open'))
      assert.deepEqual(s.hallPlacements, gridOrder(raw))
      // stable: a second load is a no-op for the hall
      assert.deepEqual(migrateHallFields(s).hallPlacements, s.hallPlacements)
    })
  }

  it('forening-bla / forening-vit keep their exact placements', () => {
    for (const id of ['forening-bla', 'forening-vit'] as const) {
      const raw = legacyPass(id)
      const s = migrateHallFields(raw)
      assert.equal(isLegacyHall(raw), false)
      assert.equal(s.hallTemplateId, id)
      assert.deepEqual(s.hallPlacements, raw.hallPlacements)
    }
  })

  it('no hallTemplateId and only Öppen yta placements → Stora hallen, placements kept', () => {
    const raw = legacyPass(undefined)
    raw.hallPlacements = raw.hallPlacements!.map((p) => ({ ...p, zoneId: 'open' as const }))
    const s = migrateHallFields(raw)
    assert.equal(s.hallTemplateId, 'forening-bla')
    assert.deepEqual(s.hallPlacements, raw.hallPlacements)
  })

  it('never resolves to a legacy id', () => {
    for (const id of ['standard-trupp', 'tavling-linjer', 'liten-hall', 'generic-trupp', 'x', undefined]) {
      assert.equal(normalizeTemplateId(id), 'forening-bla')
      assert.equal(getPreset(id).id, 'forening-bla')
    }
  })

  it('old #dela= link / Mina mall on Standard trupp opens on Stora hallen with grid markers', () => {
    const raw = legacyPass('standard-trupp')
    const pass = sessionToShare(raw)
    assert.equal(pass.hallTemplateId, 'standard-trupp')
    for (const s of [shareToSession(pass), savedTemplateToSession({ id: 't', title: raw.title, totalMinutes: 0, savedAt: '', pass })]) {
      assert.equal(s.hallTemplateId, 'forening-bla')
      assert.deepEqual(s.hallPlacements, gridOrder(raw))
    }
  })

  it('a link on Grophallen still roundtrips its placements untouched', () => {
    const raw = legacyPass('forening-vit')
    const s = shareToSession(sessionToShare(raw))
    assert.equal(s.hallTemplateId, 'forening-vit')
    assert.deepEqual(s.hallPlacements, raw.hallPlacements)
  })
})

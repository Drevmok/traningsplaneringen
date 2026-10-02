import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EQUIPMENT_PIECES } from './equipmentPieces.ts'
import { seedActivities } from './seedActivities.ts'
import { validateTipCatalog } from './activityTips.ts'
import { sanitizeSource } from '../lib/source.ts'
import { VISUAL_ICON } from '../icons/map.ts'

/** Seed promotion 2DJ_oMM81mI — Prime Coaching Sport, "Fun gymnastics stations" (all except #4). */
const PROMOTED_2DJ = [
  'tech-grenhopp-trampett',
  'tech-formhopp-over-block',
  'tech-aggrullning-kil',
  'tech-l-hang-racke',
  'tech-stod-racke-pendel',
  'tech-asnesparkar',
  'tech-minihjul',
  'tech-soldatsparkar-bom',
  'tech-krabbgang-bom',
  'tech-ljushopp-rockringar',
  'tech-landning-plint',
]

describe('seed bank', () => {
  it('has unique ids', () => {
    const ids = seedActivities.map((a) => a.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  it('only uses redskap from the fixed library', () => {
    const known = new Set(EQUIPMENT_PIECES.map((p) => p.id))
    for (const a of seedActivities) {
      for (const slot of a.defaultStationEquipment ?? []) {
        assert.ok(known.has(slot.pieceId), `${a.id}: ${slot.pieceId}`)
        assert.ok(Number.isInteger(slot.count) && slot.count >= 1, `${a.id}: count`)
      }
    }
  })

  it('links resolve to seeds', () => {
    const ids = new Set(seedActivities.map((a) => a.id))
    for (const a of seedActivities) {
      if (a.progressionOf) assert.ok(ids.has(a.progressionOf), `${a.id} → ${a.progressionOf}`)
      if (a.regressionOf) assert.ok(ids.has(a.regressionOf), `${a.id} → ${a.regressionOf}`)
    }
  })
})

describe('seed promotion 2DJ_oMM81mI', () => {
  const byId = new Map(seedActivities.map((a) => [a.id, a]))
  const promoted = PROMOTED_2DJ.map((id) => byId.get(id))

  it('adds all 11 and not Spindelmannen (#4)', () => {
    assert.equal(promoted.filter(Boolean).length, 11)
    assert.ok(!seedActivities.some((a) => /spindel/i.test(a.id) || /Spindelmannen/.test(a.title)))
  })

  it('Teknik, 6 min, ≤4 steps, beginner-friendly, own icon key', () => {
    for (const a of promoted) {
      assert.ok(a)
      assert.equal(a.blockType, 'techniques', a.id)
      assert.equal(a.durationMinutesDefault, 6, a.id)
      const steps = a.howTo.split('\n').filter((l) => l.trim())
      assert.ok(steps.length >= 1 && steps.length <= 4, `${a.id}: ${steps.length} steps`)
      assert.ok(a.difficulty === 'intro' || a.difficulty === 'easy', a.id)
      assert.equal(a.newCoachOk, true, a.id)
      assert.equal(a.experiencedCoachOnly, false, a.id)
      assert.ok(a.tags.includes('new-coach-ok'), a.id)
      assert.ok(VISUAL_ICON[a.visualKey], `${a.id}: icon for ${a.visualKey}`)
      assert.equal(a.own, undefined, a.id)
      assert.equal(a.safetyLine, undefined, a.id)
    }
  })

  it('keeps a valid Källa source and stays flagged for review', () => {
    for (const a of promoted) {
      assert.ok(a)
      const s = sanitizeSource(a.source)
      assert.ok(s, a.id)
      assert.equal(s.creator, 'Prime Coaching Sport')
      assert.ok(s.url.startsWith('https://youtu.be/2DJ_oMM81mI?t='), a.id)
      assert.equal(typeof s.startSeconds, 'number', a.id)
      assert.equal(a.needsCoachReview, true, a.id)
    }
  })

  it('uses the Slice 30 redskap agreed for the batch', () => {
    const eq = (id: string) =>
      (byId.get(id)?.defaultStationEquipment ?? []).map((s) => `${s.pieceId}×${s.count}`).join(' ')
    assert.equal(eq('tech-formhopp-over-block'), 'eq-trampett×1 eq-skumblock×1 eq-landningsmatta×1')
    assert.equal(eq('tech-aggrullning-kil'), 'eq-kilmatta×1 eq-madrass×1')
    assert.equal(eq('tech-l-hang-racke'), 'eq-racke×1 eq-landningsmatta×1')
    assert.equal(eq('tech-stod-racke-pendel'), 'eq-racke×1 eq-landningsmatta×1')
    assert.equal(eq('tech-soldatsparkar-bom'), 'eq-bom×1 eq-landningsmatta×1')
    assert.equal(eq('tech-krabbgang-bom'), 'eq-bom×1')
    assert.equal(eq('tech-ljushopp-rockringar'), 'eq-rockring×4')
    assert.equal(eq('tech-landning-plint'), 'eq-plint×1')
  })

  it('tip catalog stays valid (safety lines live in ACTIVITY_SAFETY)', () => {
    assert.deepEqual(validateTipCatalog(seedActivities), [])
  })
})

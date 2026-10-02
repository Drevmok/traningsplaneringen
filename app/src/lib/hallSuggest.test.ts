import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import { activityFitsOwned } from './ownedEquipment.ts'
import { getActivityById } from '../data/seedActivities.ts'
import type { Session, SessionBlock } from '../types.ts'
import { autoPlaceItems, autoPlaceUnplaced, suggestZoneId } from './hallSuggest.ts'

function session(placements: Session['hallPlacements'] = []): Session {
  const blocks: SessionBlock[] = BLOCK_ORDER.map((type) => ({
    id: `block-${type}`,
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    coachNote: '',
    items:
      type === 'techniques'
        ? [
            {
              id: 'vault-1',
              activityId: 'tech-ljushopp-satsbrada',
              durationMinutes: 6,
              note: '',
              order: 0,
            },
            {
              id: 'vault-2',
              activityId: 'tech-satsbrada-volt-rygg',
              durationMinutes: 6,
              note: '',
              order: 1,
            },
            {
              id: 'tramp',
              activityId: 'tech-trampett-volt-mattberg',
              durationMinutes: 6,
              note: '',
              order: 2,
            },
          ]
        : [],
  }))
  return {
    id: 's',
    title: 'Test',
    totalMinutes: 18,
    notes: '',
    blocks,
    hallTemplateId: 'standard-trupp',
    hallPlacements: placements,
  }
}

describe('suggestZoneId', () => {
  it('puts satsbräda drills in the vault zone, trampett ahead of mattberg', () => {
    assert.equal(suggestZoneId({ activityId: 'tech-ljushopp-satsbrada' }), 'vault')
    assert.equal(suggestZoneId({ activityId: 'tech-trampett-volt-mattberg' }), 'trampett')
    assert.equal(suggestZoneId({ activityId: 'tech-rondat-flickis' }), 'tumbling')
    assert.equal(suggestZoneId({ activityId: 'tech-handstaende-falla-rygg' }), 'mats')
  })
})

describe('autoPlaceUnplaced', () => {
  it('places every teknik station and separates two in the same zone', () => {
    const next = autoPlaceUnplaced(session())
    const byId = new Map((next.hallPlacements ?? []).map((p) => [p.sessionItemId, p]))
    assert.equal(byId.get('vault-1')?.zoneId, 'vault')
    assert.equal(byId.get('vault-2')?.zoneId, 'vault')
    assert.equal(byId.get('tramp')?.zoneId, 'trampett')
    assert.notEqual(byId.get('vault-1')?.x, byId.get('vault-2')?.x)
  })

  it('does not move a station the coach already placed', () => {
    const placed = session([
      { sessionItemId: 'vault-1', x: 0.2, y: 0.2, zoneId: 'open' },
    ])
    const next = autoPlaceItems(placed, new Set(['vault-1', 'tramp']))
    const kept = next.hallPlacements?.find((p) => p.sessionItemId === 'vault-1')
    assert.equal(kept?.x, 0.2)
    assert.equal(kept?.zoneId, 'open')
    assert.equal(
      next.hallPlacements?.find((p) => p.sessionItemId === 'tramp')?.zoneId,
      'trampett',
    )
  })
})

describe('activityFitsOwned', () => {
  it('hides a drill that needs redskap the hall does not have', () => {
    const drill = getActivityById('tech-ljushopp-satsbrada')
    assert.ok(drill)
    assert.equal(activityFitsOwned(drill, ['eq-trampett', 'eq-landningsmatta']), false)
    assert.equal(
      activityFitsOwned(drill, ['eq-satsbrada', 'eq-landningsmatta']),
      true,
    )
    const gathering = getActivityById('gather-narvaro')
    assert.ok(gathering)
    assert.equal(activityFitsOwned(gathering, []), true)
  })
})

describe('suggestZoneId — Slice 30 redskap (AC 33)', () => {
  const at = (pieces: string[]) =>
    suggestZoneId({
      activityId: 'gather-narvaro',
      stationEquipment: pieces.map((pieceId) => ({ pieceId, count: 1 })),
    })

  it('places the five new pieces by the strongest apparatus', () => {
    assert.equal(at(['eq-trampett', 'eq-skumblock', 'eq-landningsmatta']), 'trampett')
    assert.equal(at(['eq-kilmatta', 'eq-madrass']), 'mats')
    assert.equal(at(['eq-racke', 'eq-landningsmatta']), 'open')
    assert.equal(at(['eq-bom']), 'open')
    assert.equal(at(['eq-rockring']), 'open')
    assert.equal(at(['eq-skumblock']), 'open')
  })
})

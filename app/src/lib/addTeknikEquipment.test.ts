import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedActivities as ACTIVITIES, getActivityById } from '../data/seedActivities.ts'
import { autoPlaceItems } from './hallSuggest.ts'
import { placeableItems } from './hall.ts'
import {
  addItemToBlock,
  applyAllSuggestedStationEquipment,
  placedTeknikMissingSavedEquipment,
  updateItemStationEquipment,
} from './session.ts'
import { composeWizardSession } from './wizard.ts'
import type { Session } from '../types.ts'

// Slice 56 A1/B1 — mirrors SessionBuilder.handleAddFromDetail chain.
function addAndFill(session: Session, blockType: string, activityId: string): { next: Session; newId: string } {
  const dest = session.blocks.find((b) => b.type === blockType)!
  const before = new Set(session.blocks.flatMap((b) => b.items.map((i) => i.id)))
  const addedSession = addItemToBlock(session, dest.id, activityId, 6)
  const added = new Set(addedSession.blocks.flatMap((b) => b.items.map((i) => i.id)).filter((id) => !before.has(id)))
  const placed = autoPlaceItems(addedSession, added)
  const next = dest.type === 'techniques' ? applyAllSuggestedStationEquipment(placed).session : placed
  return { next, newId: [...added][0] }
}

function base(): Session {
  return composeWizardSession({ age: 'age79', level: null, focus: 'trampett', hallTemplateId: 'forening-vit', targetMinutes: 90 } as never)
}

const eqOf = (s: Session) => Object.fromEntries(s.blocks.flatMap((b) => b.items.map((i) => [i.id, JSON.stringify(i.stationEquipment)])))

describe('Slice 56 — Lägg till i Teknik fyller redskap-förslag', () => {
  it('Kullerbytta framåt gets default equipment, no saknar-rad', () => {
    const { next, newId } = addAndFill(base(), 'techniques', 'tech-kullerbytta')
    const item = next.blocks.flatMap((b) => b.items).find((i) => i.id === newId)!
    assert.deepEqual(item.stationEquipment, getActivityById('tech-kullerbytta')!.defaultStationEquipment)
    assert.equal(placedTeknikMissingSavedEquipment(next).length, 0)
  })
  it('cleared [] stays [] and saved custom list unchanged', () => {
    let s = base()
    const items = placeableItems(s)
    assert.ok(items.length >= 2)
    s = updateItemStationEquipment(s, items[0].id, [])
    const custom = [{ pieceId: 'eq-madrass', count: 3 }]
    s = updateItemStationEquipment(s, items[1].id, custom)
    const { next } = addAndFill(s, 'techniques', 'tech-kullerbytta')
    const all = next.blocks.flatMap((b) => b.items)
    assert.deepEqual(all.find((i) => i.id === items[0].id)!.stationEquipment, [])
    assert.deepEqual(all.find((i) => i.id === items[1].id)!.stationEquipment, custom)
  })
  it('add to Uppvärmning changes no stationEquipment', () => {
    const s = base()
    const warm = ACTIVITIES.find((a) => a.blockType === 'warmup')!
    const { next } = addAndFill(s, 'warmup', warm.id)
    const before = eqOf(s), after = eqOf(next)
    for (const id of Object.keys(before)) assert.equal(after[id], before[id])
  })
  it('exercise without defaultStationEquipment: no crash, no change for it', () => {
    const plain = ACTIVITIES.find((a) => a.blockType === 'techniques' && !a.defaultStationEquipment?.length)
      ?? ACTIVITIES.find((a) => !a.defaultStationEquipment?.length)!
    const { next, newId } = addAndFill(base(), 'techniques', plain.id)
    const item = next.blocks.flatMap((b) => b.items).find((i) => i.id === newId)!
    assert.equal(item.stationEquipment, undefined)
  })
})

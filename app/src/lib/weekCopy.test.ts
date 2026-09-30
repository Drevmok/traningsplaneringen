import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Session, SessionBlock } from '../types.ts'
import { duplicateSession, replaceItemActivity } from './session.ts'
import { passSignature, sessionAlreadyArchived, startNewWeek } from './savedTemplates.ts'
import { sessionToShare } from './sharePass.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value)
    },
    removeItem: (key: string) => {
      mem.delete(key)
    },
    clear: () => mem.clear(),
    key: (index: number) => [...mem.keys()][index] ?? null,
    get length() {
      return mem.size
    },
  },
})

function session(): Session {
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
              id: 'keep-me',
              activityId: 'tech-ljushopp-satsbrada',
              durationMinutes: 6,
              note: 'kö',
              order: 0,
              stationEquipment: [{ pieceId: 'eq-satsbrada', count: 1 }],
            },
          ]
        : [],
  }))
  return {
    id: 'week-1',
    title: 'Torsdag',
    totalMinutes: 6,
    notes: '',
    blocks,
    hallTemplateId: 'standard-trupp',
    hallPlacements: [{ sessionItemId: 'keep-me', x: 0.42, y: 0.2, zoneId: 'vault' }],
  }
}

describe('new week', () => {
  it('copies the pass, keeps the chip on the new item, and archives once', () => {
    mem.clear()
    const copy = duplicateSession(session())
    assert.notEqual(copy.id, 'week-1')
    assert.equal(copy.title, 'Ny vecka — Torsdag')
    const item = copy.blocks.find((block) => block.type === 'techniques')?.items[0]
    assert.ok(item)
    assert.notEqual(item?.id, 'keep-me')
    assert.equal(item?.activityId, 'tech-ljushopp-satsbrada')
    assert.equal(item?.note, 'kö')
    assert.equal(copy.hallPlacements?.[0]?.sessionItemId, item?.id)
    assert.equal(copy.hallPlacements?.[0]?.zoneId, 'vault')
    assert.equal(passSignature(sessionToShare(session())), passSignature(sessionToShare(copy)))

    const first = startNewWeek(session())
    assert.equal(first.archived, true)
    assert.equal(first.session.title, 'Ny vecka — Torsdag')
    assert.equal(sessionAlreadyArchived(session()), true)
    const second = startNewWeek(session())
    assert.equal(second.archived, false)
  })

  it('swaps the drill and drops the old redskap recipe', () => {
    const next = replaceItemActivity(
      session(),
      'block-techniques',
      'keep-me',
      'tech-trampett-volt-mattberg',
    )
    const item = next.blocks.find((block) => block.type === 'techniques')?.items[0]
    assert.equal(item?.id, 'keep-me')
    assert.equal(item?.activityId, 'tech-trampett-volt-mattberg')
    assert.equal(item?.durationMinutes, 6)
    assert.equal(item?.stationEquipment, undefined)
    assert.equal(next.hallPlacements?.[0]?.sessionItemId, 'keep-me')
  })
})

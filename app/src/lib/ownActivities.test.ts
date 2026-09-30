import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { floorTip } from '../data/activityTips.ts'
import { getActivityById } from '../data/seedActivities.ts'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Session, SessionBlock } from '../types.ts'
import {
  clearOwnActivities,
  ownActivityIssues,
  saveOwnActivity,
  type OwnDraft,
} from './ownActivities.ts'
import { decodeShare, encodeShare } from './sharePass.ts'
import { saveDraft } from './session.ts'

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

function draft(overrides: Partial<OwnDraft> = {}): OwnDraft {
  return {
    title: 'Vår handvolt',
    blockType: 'techniques',
    durationMinutes: 8,
    summary: 'Så gör vi alltid i hallen.',
    howText: 'Stå stilla.\nHänderna i mattan.',
    watchFor: 'En i taget.',
    safety: 'Nästa väntar tills landningen är klar.',
    ...overrides,
  }
}

function sessionWith(activityId: string): Session {
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
              id: 'item-own',
              activityId,
              durationMinutes: 8,
              note: '',
              order: 0,
            },
          ]
        : [],
  }))
  return {
    id: 'session-own',
    title: 'Torsdag',
    totalMinutes: 8,
    notes: '',
    blocks,
    hallPlacements: [],
  }
}

describe('own activities', () => {
  it('requires a floor cue, and safety off the gathering block', () => {
    assert.deepEqual(ownActivityIssues(draft({ title: '  ' })), ['title'])
    assert.deepEqual(ownActivityIssues(draft({ howText: '' })), ['how'])
    assert.deepEqual(
      ownActivityIssues(draft({ howText: '1\n2\n3\n4\n5' })),
      ['how-too-long'],
    )
    assert.deepEqual(
      ownActivityIssues(draft({ blockType: 'gathering', safety: '' })),
      [],
    )
    assert.deepEqual(ownActivityIssues(draft({ safety: '' })), ['safety'])
  })

  it('keeps the coach safety line and does not write it until the pass is saved', async () => {
    clearOwnActivities()
    mem.clear()
    const saved = saveOwnActivity(draft())
    assert.equal(saved.ok, true)
    if (!saved.ok) return
    assert.equal(floorTip(saved.activity).safety, 'Nästa väntar tills landningen är klar.')
    assert.equal(floorTip(saved.activity).steps[0], 'Stå stilla.')
    const token = await encodeShare(sessionWith(saved.activity.id))
    clearOwnActivities()
    mem.delete('gymnastics-planner-own-activities-v1')
    const back = await decodeShare(token)
    assert.equal(back?.blocks.find((block) => block.type === 'techniques')?.items[0]?.activityId, saved.activity.id)
    assert.equal(getActivityById(saved.activity.id)?.title, 'Vår handvolt')
    assert.equal(mem.get('gymnastics-planner-own-activities-v1'), undefined)
    saveDraft(sessionWith(saved.activity.id))
    assert.match(mem.get('gymnastics-planner-own-activities-v1') ?? '', /Vår handvolt/)
  })
})

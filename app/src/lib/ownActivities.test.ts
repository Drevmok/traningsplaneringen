import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { floorTip } from '../data/activityTips.ts'
import { getActivityById } from '../data/seedActivities.ts'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { Session, SessionBlock } from '../types.ts'
import {
  clearOwnActivities,
  importOwnActivities,
  loadOwnActivities,
  markOwnReviewed,
  MAX_OWN,
  ownActivityIssues,
  sanitizeOwnActivity,
  saveOwnActivity,
  type OwnDraft,
} from './ownActivities.ts'
import type { Activity } from '../types.ts'
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
    equipment: [],
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

function imported(overrides: Partial<Activity> = {}): Activity {
  const activity = sanitizeOwnActivity({
    id: 'own-imp-test-01',
    title: 'Formhopp',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    summary: 'Höjd och form.',
    howTo: '1. Studsa.\n2. Landa.',
    watchFor: 'Landningen.',
    safetyLine: 'En i taget.',
    tags: ['Trampett', 'hopp', 'trampett'],
    difficulty: 'medium',
    defaultStationEquipment: [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-skumblock', count: 1 },
    ],
    progressionOf: 'tech-ljushopp-trampett',
    regressionOf: 'tech-kullerbytta',
    needsCoachReview: true,
    experiencedCoachOnly: true,
    source: { url: 'https://youtu.be/x?t=30', creator: 'Kanal', startSeconds: 30 },
    ...overrides,
  })
  if (!activity) throw new Error('fixture')
  return activity
}

describe('own activities — Slice 30 fields', () => {
  it('keeps redskap, tags, links, review, experienced and source through a reload (AC 7)', () => {
    clearOwnActivities()
    mem.clear()
    importOwnActivities([imported()])
    const raw = mem.get('gymnastics-planner-own-activities-v1') ?? '[]'
    clearOwnActivities()
    mem.set('gymnastics-planner-own-activities-v1', raw)
    // Re-read from storage (the cache was emptied by clearOwnActivities).
    const parsed = (JSON.parse(raw) as Activity[]).map((a) => sanitizeOwnActivity(a))
    const back = parsed[0]
    assert.ok(back)
    assert.deepEqual(back.tags, ['trampett', 'hopp', 'egen'])
    assert.equal(back.difficulty, 'medium')
    assert.deepEqual(back.defaultStationEquipment, [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-skumblock', count: 1 },
    ])
    assert.equal(back.progressionOf, 'tech-ljushopp-trampett')
    assert.equal(back.regressionOf, 'tech-kullerbytta')
    assert.equal(back.needsCoachReview, true)
    assert.equal(back.experiencedCoachOnly, true)
    assert.deepEqual(back.source, { url: 'https://youtu.be/x?t=30', creator: 'Kanal', startSeconds: 30 })
  })

  it('drops redskap off Teknik and http sources', () => {
    const warm = imported({ blockType: 'warmup', source: { url: 'http://x.se', creator: 'A' } })
    assert.equal(warm.defaultStationEquipment, undefined)
    assert.equal(warm.source, undefined)
  })

  it('Ändra keeps hidden fields, saves redskap and clears the review flag (AC 8, 9, 28)', () => {
    clearOwnActivities()
    mem.clear()
    importOwnActivities([imported()])
    const saved = saveOwnActivity(
      draft({
        title: 'Formhopp ändrad',
        equipment: [{ pieceId: 'eq-kilmatta', count: 2 }],
      }),
      'own-imp-test-01',
    )
    assert.equal(saved.ok, true)
    if (!saved.ok) return
    const a = saved.activity
    assert.equal(a.id, 'own-imp-test-01')
    assert.equal(a.title, 'Formhopp ändrad')
    assert.equal(a.needsCoachReview, undefined)
    assert.deepEqual(a.tags, ['trampett', 'hopp', 'egen'])
    assert.equal(a.difficulty, 'medium')
    assert.equal(a.progressionOf, 'tech-ljushopp-trampett')
    assert.equal(a.experiencedCoachOnly, true)
    assert.equal(a.source?.creator, 'Kanal')
    assert.deepEqual(a.defaultStationEquipment, [{ pieceId: 'eq-kilmatta', count: 2 }])
    const moved = saveOwnActivity(
      draft({ blockType: 'strength', equipment: [{ pieceId: 'eq-kilmatta', count: 2 }] }),
      'own-imp-test-01',
    )
    assert.equal(moved.ok && moved.activity.defaultStationEquipment, undefined)
  })

  it('Markera som granskad clears the flag and persists (AC 28)', () => {
    clearOwnActivities()
    mem.clear()
    importOwnActivities([imported()])
    const next = markOwnReviewed('own-imp-test-01')
    assert.equal(next[0]?.needsCoachReview, undefined)
    assert.doesNotMatch(mem.get('gymnastics-planner-own-activities-v1') ?? '', /needsCoachReview/)
  })

  it('caps own drills at 100 and keeps the four-step rule (AC 11)', () => {
    clearOwnActivities()
    mem.clear()
    assert.equal(MAX_OWN, 100)
    const list = Array.from({ length: 100 }, (_, i) => imported({ id: `own-fill-${i}`, title: `Fyll ${i}` }))
    assert.equal(importOwnActivities(list).ok, true)
    assert.equal(loadOwnActivities().length, 100)
    assert.deepEqual(saveOwnActivity(draft()), { ok: false, reason: 'full' })
    assert.deepEqual(importOwnActivities([imported({ id: 'own-one-more' })]), { ok: false, reason: 'full' })
    assert.deepEqual(ownActivityIssues(draft({ howText: '1\n2\n3\n4\n5' })), ['how-too-long'])
  })

  it('old stored drills without the new fields still load', () => {
    const old = sanitizeOwnActivity({
      id: 'own-abc-123',
      title: 'Gammal',
      blockType: 'warmup',
      durationMinutesDefault: 5,
      summary: 's',
      howTo: '1. a',
      watchFor: 'w',
      safetyLine: 'x',
    } as Partial<Activity>)
    assert.equal(old?.needsCoachReview, undefined)
    assert.deepEqual(old?.tags, ['egen'])
    assert.equal(old?.difficulty, 'easy')
  })
})

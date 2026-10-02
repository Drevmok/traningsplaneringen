import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import { getActivityById } from '../data/seedActivities.ts'
import type { Session, SessionBlock } from '../types.ts'
import {
  decodeShare,
  encodeShare,
  passFileName,
  sessionFromPassJson,
  sessionFromTransfer,
  sessionToShare,
  shareToSession,
  shareTokenFromHash,
} from './sharePass.ts'
import { stationCards } from './stationCards.ts'
import { clearOwnActivities, importOwnActivities, sanitizeOwnActivity } from './ownActivities.ts'
import type { Activity } from '../types.ts'

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
              id: 'item-a',
              activityId: 'tech-ljushopp-satsbrada',
              durationMinutes: 6,
              note: '',
              order: 0,
            },
            {
              id: 'item-b',
              activityId: 'tech-handstaende-falla-rygg',
              durationMinutes: 6,
              note: '',
              order: 1,
            },
          ]
        : type === 'gathering'
          ? [
              {
                id: 'item-g',
                activityId: 'gather-narvaro',
                durationMinutes: 3,
                note: '',
                order: 0,
              },
            ]
          : [],
  }))

  return {
    id: 'session-test',
    title: 'Torsdag',
    totalMinutes: 15,
    notes: 'Kort kö.',
    blocks,
    hallTemplateId: 'liten-hall',
    hallPlacements: [{ sessionItemId: 'item-b', x: 0.4, y: 0.6 }],
    hallShowFlow: false,
  }
}

describe('stationCards', () => {
  it('numbers every teknik station in pass order, not only placed ones', () => {
    const cards = stationCards(session())
    assert.deepEqual(
      cards.map((card) => card.rank),
      [1, 2],
    )
    assert.equal(cards[0]?.title, getActivityById('tech-ljushopp-satsbrada')?.title)
    assert.equal(cards[1]?.title, getActivityById('tech-handstaende-falla-rygg')?.title)
    assert.match(cards[0]?.safety ?? '', /En i taget/)
    assert.equal(cards.some((card) => card.title === 'Närvaro'), false)
  })
})

describe('sharePass', () => {
  it('roundtrips title, item ids and hall placements without the draft id', () => {
    const back = shareToSession(sessionToShare(session()))
    assert.equal(back.title, 'Torsdag')
    assert.equal(back.notes, 'Kort kö.')
    assert.equal(back.id, 'shared')
    assert.equal(back.hallTemplateId, 'liten-hall')
    assert.equal(back.hallShowFlow, false)
    assert.deepEqual(back.hallPlacements, [
      { sessionItemId: 'item-b', x: 0.4, y: 0.6 },
    ])
    const teknik = back.blocks.find((block) => block.type === 'techniques')
    assert.deepEqual(
      teknik?.items.map((item) => item.id),
      ['item-a', 'item-b'],
    )
    assert.equal(back.blocks.length, BLOCK_ORDER.length)
  })

  it('reads the hash token and rejects junk', async () => {
    assert.equal(shareTokenFromHash('#dela=abc'), 'abc')
    assert.equal(shareTokenFromHash('#dela='), null)
    assert.equal(shareTokenFromHash('#pass'), null)
    const token = await encodeShare(session())
    assert.ok(token.startsWith('j.') || token.startsWith('z.'))
    const back = await decodeShare(token)
    assert.equal(back?.title, 'Torsdag')
    assert.equal(
      back?.blocks.find((block) => block.type === 'techniques')?.items[0]?.id,
      'item-a',
    )
    assert.equal(await decodeShare('j.not-base64'), null)
  })

  it('reads a file and a pasted link without keeping the draft id', async () => {
    const json = JSON.stringify(sessionToShare(session()))
    const fromFile = sessionFromPassJson(json)
    assert.equal(fromFile?.title, 'Torsdag')
    assert.equal(fromFile?.id, 'shared')
    assert.equal(
      fromFile?.blocks.find((block) => block.type === 'techniques')?.items[1]?.id,
      'item-b',
    )
    assert.equal(sessionFromPassJson('inte json'), null)
    assert.equal(passFileName('Nytt pass'), 'nytt-pass.json')
    const token = await encodeShare(session())
    const fromUrl = await sessionFromTransfer(
      `https://example.test/traningsplaneringen/#dela=${token}`,
    )
    assert.equal(fromUrl?.title, 'Torsdag')
    assert.equal(await sessionFromTransfer(''), null)
  })
})

describe('sharePass — own drills carry Slice 30 fields (AC 6, 39)', () => {
  function withOwn(): Session {
    const s = session()
    const teknik = s.blocks.find((b) => b.type === 'techniques')
    teknik?.items.push({
      id: 'item-own',
      activityId: 'own-imp-share-01',
      durationMinutes: 6,
      note: '',
      order: 2,
    })
    return s
  }

  it('encodes source + redskap and the receiver sees them', async () => {
    const mem = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => mem.get(key) ?? null,
        setItem: (key: string, value: string) => void mem.set(key, value),
        removeItem: (key: string) => void mem.delete(key),
        clear: () => mem.clear(),
        key: (index: number) => [...mem.keys()][index] ?? null,
        get length() {
          return mem.size
        },
      },
    })
    clearOwnActivities()
    const drill = sanitizeOwnActivity({
      id: 'own-imp-share-01',
      title: 'Äggrullning nerför kil',
      blockType: 'techniques',
      durationMinutesDefault: 6,
      summary: 's',
      howTo: '1. a',
      watchFor: 'w',
      safetyLine: 'x',
      tags: ['kil'],
      defaultStationEquipment: [{ pieceId: 'eq-kilmatta', count: 1 }],
      regressionOf: 'tech-kullerbytta',
      needsCoachReview: true,
      source: { url: 'https://youtu.be/2DJ_oMM81mI?t=50', creator: 'Prime Coaching Sport', startSeconds: 50 },
    } as Partial<Activity>)
    assert.ok(drill)
    importOwnActivities([drill])
    const pass = sessionToShare(withOwn())
    assert.equal(pass.own?.[0]?.source?.creator, 'Prime Coaching Sport')
    const token = await encodeShare(withOwn())
    clearOwnActivities()
    mem.clear()
    const back = await decodeShare(token)
    assert.ok(back)
    const received = getActivityById('own-imp-share-01')
    assert.equal(received?.source?.startSeconds, 50)
    assert.deepEqual(received?.defaultStationEquipment, [{ pieceId: 'eq-kilmatta', count: 1 }])
    assert.equal(received?.regressionOf, 'tech-kullerbytta')
    assert.ok(received?.tags.includes('kil'))
    const fromJson = sessionFromPassJson(JSON.stringify(pass))
    assert.ok(fromJson)
    assert.equal(getActivityById('own-imp-share-01')?.source?.url, 'https://youtu.be/2DJ_oMM81mI?t=50')
  })

  it('an old pass file without the new fields still opens', () => {
    const old = {
      v: 1,
      title: 'Gammalt',
      notes: '',
      blocks: [
        {
          type: 'techniques',
          durationMinutes: 20,
          items: [{ id: 'i1', activityId: 'own-old-123', durationMinutes: 6, note: '', order: 0 }],
        },
      ],
      own: [
        {
          id: 'own-old-123',
          title: 'Gammal egen',
          blockType: 'techniques',
          durationMinutesDefault: 6,
          summary: 's',
          howTo: '1. a',
          watchFor: 'w',
          safetyLine: 'x',
        },
      ],
    }
    const back = sessionFromPassJson(JSON.stringify(old))
    assert.equal(back?.title, 'Gammalt')
    const own = getActivityById('own-old-123')
    assert.equal(own?.title, 'Gammal egen')
    assert.equal(own?.source, undefined)
    assert.equal(own?.needsCoachReview, undefined)
  })
})

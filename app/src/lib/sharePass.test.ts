import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import { getActivityById } from '../data/seedActivities.ts'
import type { Session, SessionBlock } from '../types.ts'
import {
  decodeShare,
  encodeShare,
  sessionToShare,
  shareToSession,
  shareTokenFromHash,
} from './sharePass.ts'
import { stationCards } from './stationCards.ts'

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
})

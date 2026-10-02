import { describe, expect, test } from 'bun:test'
import { detailCoachMeta } from './source'

const own = {
  own: true,
  needsCoachReview: true,
  source: { url: 'https://youtu.be/abc', creator: 'Prime Coaching Sport', startSeconds: 50 },
}

describe('detailCoachMeta (Slice 30 D1)', () => {
  test('Golvklart hides Källa and the review badge', () => {
    expect(detailCoachMeta(own, true)).toEqual({ showSource: false, showReview: false })
  })
  test('Hallöversikt edit / Bibliotek keep both', () => {
    expect(detailCoachMeta(own, false)).toEqual({ showSource: true, showReview: true })
    expect(detailCoachMeta(own)).toEqual({ showSource: true, showReview: true })
  })
  test('badge is own-only; invalid source shows nothing', () => {
    expect(detailCoachMeta({ needsCoachReview: true, source: { url: 'http://x.se', creator: 'A' } }))
      .toEqual({ showSource: false, showReview: false })
  })
})

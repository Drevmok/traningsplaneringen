import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { UI } from '../data/blockMeta.ts'
import type { Session } from '../types.ts'
import { setBankEnvForTests } from './bankConfig.ts'
import {
  applyClubTemplates,
  CLUB_CACHE_KEY,
  clubTemplateToSession,
  clubTitleKey,
  getClubSnapshot,
  initClubTemplates,
  refreshClubTemplates,
  resetClubForTests,
  toClubTemplate,
  type ClubTemplate,
} from './clubTemplates.ts'
import { cleanClubTitle, clubPayload } from './clubTemplates.ts'
import { findClubByTitle, fitsDb, toClubAdminRows } from './admin/clubWrite.ts'
import { clearOwnActivities, saveOwnActivity, setEphemeralOwn } from './ownActivities.ts'
import { sessionToShare } from './sharePass.ts'

const mem = new Map<string, string>()
let quotaFull = false
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (quotaFull) throw new Error('QuotaExceededError')
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

const ENV = { VITE_SUPABASE_URL: 'https://example-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }
const realFetch = globalThis.fetch
const realNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
let calls: Array<{ url: string; headers: Record<string, string> }> = []

function mockFetch(respond: (url: string, signal?: AbortSignal | null) => Response | Promise<Response>): void {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), headers: { ...(init?.headers as Record<string, string>) } })
    return respond(String(input), init?.signal)
  }) as typeof fetch
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
function setOnline(onLine: boolean): void {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine } })
}

function passSession(): Session {
  return {
    id: 'sess-1',
    title: 'Trampett 60',
    notes: 'Fokus landning',
    totalMinutes: 20,
    targetMinutes: 90,
    hallTemplateId: 'forening-vit',
    hallShowFlow: true,
    blocks: [
      {
        id: 'b-warm',
        type: 'warmup',
        title: 'Uppvärmning',
        durationMinutes: 10,
        coachNote: '',
        items: [{ id: 'it-w', activityId: 'warm-jogg', durationMinutes: 8, note: 'lugnt', order: 0 }],
      },
      {
        id: 'b-tech',
        type: 'techniques',
        title: 'Teknik',
        durationMinutes: 30,
        coachNote: '',
        items: [
          {
            id: 'it-t',
            activityId: 'tech-hjul',
            durationMinutes: 12,
            note: '',
            order: 0,
            stationEquipment: [{ pieceId: 'eq-trampett', count: 2 }],
          },
        ],
      },
    ],
    hallPlacements: [{ sessionItemId: 'it-t', x: 0.4, y: 0.5 }],
  } as unknown as Session
}

function row(id: string, title: string, extra: Record<string, unknown> = {}) {
  const { hallPlacements: _h, ...payload } = sessionToShare(passSession())
  void _h
  return { id, title, total_minutes: 20, payload: { ...payload, title }, updated_at: '2026-10-09T08:00:00Z', ...extra }
}

beforeEach(() => {
  mem.clear()
  calls = []
  quotaFull = false
  clearOwnActivities()
  setEphemeralOwn([])
  resetClubForTests()
  setBankEnvForTests(ENV)
  setOnline(true)
})
afterEach(() => {
  globalThis.fetch = realFetch
  setBankEnvForTests(undefined)
  resetClubForTests()
  if (realNavigator) Object.defineProperty(globalThis, 'navigator', realNavigator)
  else delete (globalThis as { navigator?: unknown }).navigator
  mem.clear()
})

describe('cache (D1)', () => {
  it('round-trips a valid list and starts from it before any fetch', async () => {
    mockFetch(() => json([row('a', 'Alfa'), row('b', 'Beta')]))
    initClubTemplates()
    assert.equal(await refreshClubTemplates(), 'fresh')
    resetClubForTests()
    const snap = initClubTemplates()
    assert.equal(snap.status, 'cached')
    assert.deepEqual(snap.items.map((t) => t.title), ['Alfa', 'Beta'])
    assert.equal(JSON.parse(mem.get(CLUB_CACHE_KEY) as string).v, 1)
  })

  it('ignores a bad or partial cache, drops tampered items, never throws', () => {
    for (const raw of ['{', 'null', '{"v":2,"items":[]}', '{"v":1}', '{"v":1,"items":"x"}']) {
      mem.set(CLUB_CACHE_KEY, raw)
      assert.equal(initClubTemplates().status, 'none')
    }
    const good = toClubTemplate(row('a', 'Alfa')) as ClubTemplate
    mem.set(
      CLUB_CACHE_KEY,
      JSON.stringify({ v: 1, items: [good, { ...good, id: 'x', pass: { v: 2, blocks: [] } }, { ...good, id: 'y', totalMinutes: 'NaN' }, { ...good, id: 'z', pass: { v: 1 } }] }),
    )
    const snap = initClubTemplates()
    assert.deepEqual(snap.items.map((t) => t.id), ['a'])
  })

  it('swallows a quota error', async () => {
    quotaFull = true
    mockFetch(() => json([row('a', 'Alfa')]))
    initClubTemplates()
    assert.equal(await refreshClubTemplates(), 'fresh')
    assert.equal(getClubSnapshot().items.length, 1)
  })
})

describe('refresh (D1)', () => {
  it('fresh replaces; one GET with apikey, no Authorization, hidden=is.false', async () => {
    mockFetch(() => json([row('a', 'Alfa')]))
    initClubTemplates()
    await refreshClubTemplates()
    await refreshClubTemplates()
    assert.equal(calls.length, 1)
    assert.ok(calls[0].url.startsWith('https://example-ref.supabase.co/rest/v1/club_templates?'))
    assert.ok(calls[0].url.includes('hidden=is.false'))
    assert.ok(calls[0].url.includes('select=id,title,total_minutes,payload,updated_at'))
    assert.ok(calls[0].url.includes('order=sort_order,title'))
    assert.equal(calls[0].headers.apikey, 'sb_publishable_test')
    assert.equal(Object.keys(calls[0].headers).some((h) => h.toLowerCase() === 'authorization'), false)
  })

  it('an empty array clears the list and the cache (fresh, n = 0)', async () => {
    mem.set(CLUB_CACHE_KEY, JSON.stringify({ v: 1, items: [toClubTemplate(row('a', 'Alfa'))] }))
    initClubTemplates()
    mockFetch(() => json([]))
    assert.equal(await refreshClubTemplates(), 'fresh')
    assert.equal(getClubSnapshot().items.length, 0)
    assert.equal(mem.has(CLUB_CACHE_KEY), false)
  })

  for (const [name, respond] of [
    ['500', () => json({ message: 'x' }, 500)],
    ['bad JSON', () => new Response('<html>', { status: 200 })],
    ['not an array', () => json({ items: [] })],
    ['network error', () => Promise.reject(new TypeError('fetch failed'))],
  ] as const) {
    it(`${name} → stale, list kept`, async () => {
      mem.set(CLUB_CACHE_KEY, JSON.stringify({ v: 1, items: [toClubTemplate(row('a', 'Alfa'))] }))
      initClubTemplates()
      mockFetch(respond as () => Response)
      assert.equal(await refreshClubTemplates(), 'stale')
      assert.deepEqual(getClubSnapshot().items.map((t) => t.id), ['a'])
      assert.ok(mem.has(CLUB_CACHE_KEY))
    })
  }

  it('timeout → stale, list kept', async () => {
    mem.set(CLUB_CACHE_KEY, JSON.stringify({ v: 1, items: [toClubTemplate(row('a', 'Alfa'))] }))
    initClubTemplates()
    mockFetch(
      (_u, signal) =>
        new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))),
    )
    assert.equal(await refreshClubTemplates({ timeoutMs: 10 }), 'stale')
    assert.equal(getClubSnapshot().items.length, 1)
  })

  it('offline → stale without a request; first load offline keeps "no list"', async () => {
    setOnline(false)
    mockFetch(() => json([]))
    initClubTemplates()
    assert.equal(await refreshClubTemplates(), 'stale')
    assert.equal(calls.length, 0)
    assert.equal(getClubSnapshot().items.length, 0)
  })

  it('bank off → no fetch, no list, never stale', async () => {
    setBankEnvForTests({})
    mem.set(CLUB_CACHE_KEY, JSON.stringify({ v: 1, items: [toClubTemplate(row('a', 'Alfa'))] }))
    mockFetch(() => json([row('a', 'Alfa')]))
    assert.equal(initClubTemplates().status, 'none')
    assert.equal(await refreshClubTemplates(), 'none')
    assert.equal(calls.length, 0)
    assert.equal(getClubSnapshot().items.length, 0)
  })

  it('applyClubTemplates (admin re-read) never caches hidden rows', () => {
    initClubTemplates()
    applyClubTemplates([row('a', 'Alfa'), row('b', 'Beta', { hidden: true })])
    const cached = JSON.parse(mem.get(CLUB_CACHE_KEY) as string)
    assert.deepEqual(cached.items.map((t: ClubTemplate) => t.id), ['a'])
  })
})

describe('publish payload (C1, E1)', () => {
  it('has no hallPlacements key, v = 1, own drills kept, title trimmed to 80', () => {
    const saved = saveOwnActivity({
      title: 'Egen bana',
      blockType: 'warmup',
      durationMinutes: 5,
      summary: 'x',
      howText: '1. x',
      watchFor: 'x',
      safety: 'x',
      equipment: [],
    })
    assert.equal(saved.ok, true)
    const s = passSession()
    if (saved.ok) s.blocks[0].items.push({ id: 'it-own', activityId: saved.activity.id, durationMinutes: 4, note: '', order: 1 })
    const long = `  ${'x'.repeat(100)}  `
    const p = clubPayload(s, long)
    assert.equal('hallPlacements' in p, false)
    assert.equal(p.v, 1)
    assert.equal(p.title.length, 80)
    assert.equal(cleanClubTitle(long), 'x'.repeat(80))
    assert.equal(p.own?.length, 1)
    assert.equal(p.hallTemplateId, 'forening-vit')
    assert.equal(JSON.stringify(p).includes('hallPlacements'), false)
  })

  it('refuses a payload over 64 kB or minutes outside 1–240 before any request (§8.7)', () => {
    const s = passSession()
    assert.equal(fitsDb({ totalMinutes: 20, payload: (t) => clubPayload(s, t) }, 'Ok'), true)
    assert.equal(fitsDb({ totalMinutes: 0, payload: (t) => clubPayload(s, t) }, 'Ok'), false)
    assert.equal(fitsDb({ totalMinutes: 20, payload: (t) => clubPayload(s, t) }, '   '), false)
    const big = { ...passSession(), notes: 'x'.repeat(70000) } as Session
    assert.equal(fitsDb({ totalMinutes: 20, payload: (t) => clubPayload(big, t) }, 'Ok'), false)
  })
})

describe('apply (E1)', () => {
  it('clears placements, gives fresh ids, keeps blocks/timings/stationEquipment', () => {
    const t = toClubTemplate({ ...row('a', 'Trampett 60'), payload: { ...sessionToShare(passSession()), title: 'Trampett 60' } }) as ClubTemplate
    const s = clubTemplateToSession(t)
    assert.deepEqual(s.hallPlacements, [])
    assert.equal(s.title, 'Trampett 60')
    assert.equal(s.targetMinutes, 90)
    const items = s.blocks.flatMap((b) => b.items)
    assert.equal(items.some((i) => i.id === 'it-w' || i.id === 'it-t'), false)
    const slim = (blocks: Session['blocks']) =>
      blocks
        .filter((b) => b.items.length)
        .map((b) => ({ type: b.type, d: b.durationMinutes, items: b.items.map((i) => [i.activityId, i.durationMinutes, i.note, i.order, i.stationEquipment ?? null]) }))
    assert.deepEqual(slim(s.blocks), slim(passSession().blocks))
    assert.notEqual(s.id, 'sess-1')
  })
})

describe('overwrite lookup (F1)', () => {
  it('matches by name, case- and outer-whitespace-insensitive, hidden rows too', () => {
    const rows = toClubAdminRows([row('a', 'Trampett 60'), row('b', 'Volt', { hidden: true })])
    assert.equal(findClubByTitle(rows, '  trampett 60 ')?.id, 'a')
    assert.equal(findClubByTitle(rows, 'VOLT')?.id, 'b')
    assert.equal(findClubByTitle(rows, 'Volt 2'), undefined)
    assert.equal(clubTitleKey(' Ab C '), 'ab c')
  })
})

describe('UI keys (Slice 36)', () => {
  it('exist verbatim and have no exclamation mark', () => {
    const keys = [
      'clubTemplatesTitle', 'clubTemplatesHint', 'clubTemplateBadge', 'clubTemplateCardAria', 'clubTemplatesEmpty',
      'clubTemplatesStale', 'clubTemplateApplied', 'clubPublish', 'clubPublishTitle',
      'clubPublishNameLabel', 'clubPublishBody', 'clubPublishConfirm', 'clubOverwriteTitle', 'clubOverwriteBody',
      'clubOverwriteConfirm', 'clubPublished', 'clubOverwritten', 'clubHideAria', 'clubHideConfirm', 'clubHiddenTitle',
      'clubUnhideAria', 'clubOffline', 'clubWriteFailed',
    ] as const
    const ui = UI as unknown as Record<string, string>
    for (const k of keys) {
      assert.equal(typeof ui[k], 'string', k)
      assert.equal(ui[k].includes('!'), false, k)
    }
    assert.equal(UI.footerSliceLabel, 'Träningsplaneraren · Slice 56')
    assert.equal(UI.clubTemplatesTitle, 'Föreningens mallar')
    assert.equal(UI.clubOverwriteTitle, 'Det finns redan en mall som heter ”{title}”')
  })
})

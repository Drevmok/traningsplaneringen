import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { floorTip } from '../data/activityTips.ts'
import { activitiesForBlock, getActivityById, seedActivities } from '../data/seedActivities.ts'
import type { Activity, Session } from '../types.ts'
import {
  applyBankEntries,
  BANK_CACHE_KEY,
  bankStatus,
  initBank,
  listBankActivities,
  refreshBank,
  resetBankForTests,
} from './bank.ts'
import { setBankEnvForTests } from './bankConfig.ts'
import { activityToBankRow, rowToEntry, type BankEntry, type BankRow } from './bankRow.ts'
import { clearOwnActivities, saveOwnActivity, setEphemeralOwn } from './ownActivities.ts'
import { EXERCISE_FORMAT, EXERCISE_SCHEMA_VERSION, parseExerciseFile } from './ownImport.ts'
import { runSteps } from './runPass.ts'
import { stationCards } from './stationCards.ts'

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

const ENV = {
  VITE_SUPABASE_URL: 'https://example-ref.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
}
const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '')
const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${b64({ role })}.sig`
const realFetch = globalThis.fetch
const realNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
const quiet = console.warn

interface Call {
  url: string
  headers: Record<string, string>
}
let calls: Call[] = []

function bankRows(edit?: (rows: BankRow[]) => BankRow[]): BankRow[] {
  const rows = seedActivities.map((a, i) => activityToBankRow(a, i, floorTip(a).safety ?? null))
  return edit ? edit(rows) : rows
}
const redskapRows = [{ id: 'eq-trampett', label_sv: 'Trampett', visual_key: 'eq-trampett', sort_order: 10 }]

function mockFetch(respond: (url: string) => Response | Promise<Response>): void {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, headers: { ...(init?.headers as Record<string, string>) } })
    return respond(url)
  }) as typeof fetch
}
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
function serveBank(rows: BankRow[]): void {
  mockFetch((url) => (url.includes('/rest/v1/exercises') ? json(rows) : json(redskapRows)))
}
function setOnline(onLine: boolean): void {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine } })
}
function withTitle(id: string, title: string) {
  return (rows: BankRow[]) => rows.map((r) => (r.id === id ? { ...r, title } : r))
}
function draftWith(activityId: string): Session {
  return {
    id: 'draft-1',
    title: 'Gammalt pass',
    totalMinutes: 6,
    blocks: [
      {
        id: 'b-tech',
        type: 'techniques',
        title: 'Teknik',
        durationMinutes: 30,
        coachNote: '',
        items: [{ id: 'it-1', activityId, durationMinutes: 6, note: '', order: 0 }],
      },
    ],
  } as unknown as Session
}

beforeEach(() => {
  mem.clear()
  calls = []
  clearOwnActivities()
  setEphemeralOwn([])
  resetBankForTests()
  setBankEnvForTests(undefined)
  setOnline(true)
  console.warn = () => {}
})
afterEach(() => {
  globalThis.fetch = realFetch
  setBankEnvForTests(undefined)
  resetBankForTests()
  if (realNavigator) Object.defineProperty(globalThis, 'navigator', realNavigator)
  else delete (globalThis as { navigator?: unknown }).navigator
  console.warn = quiet
  mem.clear()
})

describe('bank off — no repo variables (AC 12)', () => {
  it('uses the bundled seeds, makes no request and never goes stale', async () => {
    setBankEnvForTests({})
    mockFetch(() => json([]))
    mem.set(BANK_CACHE_KEY, JSON.stringify({ v: 1, exercises: [], hiddenIds: [], redskapLabels: {} }))
    initBank()
    assert.equal(bankStatus(), 'bundled')
    assert.equal(listBankActivities(), seedActivities)
    assert.equal(await refreshBank(), 'bundled')
    assert.equal(calls.length, 0)
    assert.equal(bankStatus(), 'bundled')
  })

  it('a half-set config (URL only), http, or a non-public key also means off', async () => {
    mockFetch(() => json([]))
    for (const env of [
      { VITE_SUPABASE_URL: ENV.VITE_SUPABASE_URL },
      { VITE_SUPABASE_URL: 'http://example-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x' },
      { VITE_SUPABASE_URL: ENV.VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_unknown_kind_of_key' },
      { VITE_SUPABASE_URL: ENV.VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY: jwt('authenticated') },
    ]) {
      resetBankForTests()
      setBankEnvForTests(env)
      initBank()
      await refreshBank()
      assert.equal(bankStatus(), 'bundled')
    }
    assert.equal(calls.length, 0)
  })
})

describe('bank config', () => {
  it('accepts the publishable key or a legacy anon JWT', async () => {
    const { bankConfigFrom } = await import('./bankConfig.ts')
    assert.ok(bankConfigFrom(ENV))
    assert.ok(bankConfigFrom({ VITE_SUPABASE_URL: ENV.VITE_SUPABASE_URL + '/', VITE_SUPABASE_PUBLISHABLE_KEY: jwt('anon') }))
    assert.equal(bankConfigFrom({ VITE_SUPABASE_URL: ' ', VITE_SUPABASE_PUBLISHABLE_KEY: ' ' }), null)
  })
})

describe('start from cache or seeds (D1, AC 9, 10, 17)', () => {
  it('first visit: bundled seeds before any fetch', () => {
    setBankEnvForTests(ENV)
    initBank()
    assert.equal(bankStatus(), 'bundled')
    assert.equal(listBankActivities().length, 51)
  })

  it('a good fetch replaces the store, writes the cache, sends apikey only', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(bankRows(withTitle('fun-frysdans', 'Frysdans TEST')))
    assert.equal(await refreshBank(), 'fresh')
    assert.equal(calls.length, 2)
    const ex = calls.find((c) => c.url.includes('/rest/v1/exercises')) as Call
    assert.match(ex.url, /^https:\/\/example-ref\.supabase\.co\/rest\/v1\/exercises\?select=id,block_type,/)
    assert.match(ex.url, /status=in\.\(published,hidden\)&order=sort_order\.asc$/)
    for (const c of calls) {
      assert.equal(c.headers.apikey, 'sb_publishable_test')
      assert.equal('Authorization' in c.headers || 'authorization' in c.headers, false)
    }
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans TEST')
    const cache = JSON.parse(mem.get(BANK_CACHE_KEY) ?? '{}')
    assert.equal(cache.v, 1)
    assert.equal(cache.exercises.length, 51)
  })

  it('next load starts from the cache; a failed fetch keeps it and goes stale', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(bankRows(withTitle('fun-frysdans', 'Frysdans TEST')))
    await refreshBank()
    // reload
    resetBankForTests()
    initBank()
    assert.equal(bankStatus(), 'cached')
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans TEST')
    mockFetch(() => json({ message: 'boom' }, 500))
    assert.equal(await refreshBank(), 'stale')
    assert.equal(bankStatus(), 'stale')
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans TEST')
    assert.equal(listBankActivities().length, 51)
  })

  it('first visit + failed fetch → bundled seeds, stale', async () => {
    setBankEnvForTests(ENV)
    initBank()
    mockFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    assert.equal(await refreshBank(), 'stale')
    assert.equal(listBankActivities().length, 51)
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans')
    assert.equal(mem.has(BANK_CACHE_KEY), false)
  })

  it('0 valid rows counts as a failure (AC 11)', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(bankRows((rows) => rows.map((r) => ({ ...r, how_to: '' }))))
    assert.equal(await refreshBank(), 'stale')
    assert.equal(mem.has(BANK_CACHE_KEY), false)
    assert.equal(listBankActivities().length, 51)
  })

  it('bad rows are dropped, the rest shown (AC 11)', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(
      bankRows((rows) =>
        rows.map((r) =>
          r.id === 'tech-hjul' ? { ...r, how_to: '1. a\n2. b\n3. c\n4. d\n5. e\n6. f' } : r.id === 'tech-bro' ? { ...r, safety_line: null } : r,
        ),
      ),
    )
    assert.equal(await refreshBank(), 'fresh')
    const ids = listBankActivities().map((a) => a.id)
    assert.equal(ids.length, 49)
    assert.equal(ids.includes('tech-hjul'), false)
    assert.equal(ids.includes('tech-bro'), false)
  })

  it('timeout → stale', async () => {
    setBankEnvForTests(ENV)
    initBank()
    globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise((_resolve, rejectFetch) => {
        calls.push({ url: String(_input), headers: {} })
        init?.signal?.addEventListener('abort', () => rejectFetch(new DOMException('aborted', 'AbortError')))
      })) as typeof fetch
    assert.equal(await refreshBank({ timeoutMs: 20 }), 'stale')
  })

  it('offline → stale without a request', async () => {
    setBankEnvForTests(ENV)
    initBank()
    setOnline(false)
    mockFetch(() => json([]))
    assert.equal(await refreshBank(), 'stale')
    assert.equal(calls.length, 0)
  })

  it('a corrupt or future-shaped cache is ignored (AC 17)', async () => {
    setBankEnvForTests(ENV)
    for (const bad of ['{', JSON.stringify({ v: 2, exercises: [] }), JSON.stringify({ v: 1, exercises: 'x' })]) {
      resetBankForTests()
      mem.set(BANK_CACHE_KEY, bad)
      mem.set('gymnastics-planner-draft-v1', '{"keep":true}')
      initBank()
      assert.equal(bankStatus(), 'bundled')
      assert.equal(mem.get('gymnastics-planner-draft-v1'), '{"keep":true}')
    }
    serveBank(bankRows())
    assert.equal(await refreshBank(), 'fresh')
    assert.equal(JSON.parse(mem.get(BANK_CACHE_KEY) ?? '{}').v, 1)
  })

  it('one fetch per load', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(bankRows())
    await refreshBank()
    await refreshBank()
    assert.equal(calls.length, 2)
  })
})

describe('hidden exercises (AC 13)', () => {
  async function hideFrysdans(): Promise<void> {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(
      bankRows((rows) => rows.map((r) => (r.id === 'fun-frysdans' ? { ...r, status: 'hidden', title: 'Frysdans (dold)' } : r))),
    )
    assert.equal(await refreshBank(), 'fresh')
  }

  it('are not listed, not in block lists or the import duplicate check', async () => {
    await hideFrysdans()
    assert.equal(listBankActivities().some((a) => a.id === 'fun-frysdans'), false)
    assert.equal(activitiesForBlock('fun_and_games').some((a) => a.id === 'fun-frysdans'), false)
    const file = JSON.stringify({
      format: EXERCISE_FORMAT,
      schemaVersion: EXERCISE_SCHEMA_VERSION,
      exercises: [
        {
          id: 'own-imp-frys-01',
          title: 'Frysdans (dold)',
          blockType: 'fun_and_games',
          durationMinutesDefault: 5,
          summary: 'x',
          howTo: '1. x',
          watchFor: 'x',
          safetyLine: 'x',
        },
      ],
    })
    const parsed = parseExerciseFile(file, { own: [], seeds: listBankActivities() })
    assert.equal(parsed.ok, true)
    if (parsed.ok) assert.equal(parsed.rows[0].state, 'new')
  })

  it('still render in an old pass / draft (title, Kör passet, stationskort)', async () => {
    await hideFrysdans()
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans (dold)')
    const steps = runSteps(draftWith('fun-frysdans'))
    assert.equal(steps[0].title, 'Frysdans (dold)')
    // a hidden Teknik station keeps its station card
    resetBankForTests()
    initBank()
    serveBank(bankRows((rows) => rows.map((r) => (r.id === 'tech-hjul' ? { ...r, status: 'hidden' } : r))))
    await refreshBank()
    assert.equal(listBankActivities().some((a) => a.id === 'tech-hjul'), false)
    assert.equal(stationCards(draftWith('tech-hjul'))[0].title, 'Hjul')
  })

  it('survive a reload from the cache, still hidden', async () => {
    await hideFrysdans()
    resetBankForTests()
    initBank()
    assert.equal(bankStatus(), 'cached')
    assert.equal(listBankActivities().some((a) => a.id === 'fun-frysdans'), false)
    assert.equal(getActivityById('fun-frysdans')?.title, 'Frysdans (dold)')
  })
})

describe('lookup order own → bank → bundled (AC 14)', () => {
  it('bank wins over bundled; bundled-only ids still resolve; own wins over both', async () => {
    setBankEnvForTests(ENV)
    initBank()
    serveBank(bankRows((rows) => withTitle('tech-hjul', 'Hjul (bank)')(rows).filter((r) => r.id !== 'tech-bro')))
    await refreshBank()
    assert.equal(getActivityById('tech-hjul')?.title, 'Hjul (bank)')
    assert.equal(getActivityById('tech-bro')?.title, 'Bro')
    const saved = saveOwnActivity({
      title: 'Egen',
      blockType: 'warmup',
      durationMinutes: 5,
      summary: 'x',
      howText: '1. x',
      watchFor: 'x',
      safety: 'x',
      equipment: [],
    })
    assert.equal(saved.ok, true)
    if (saved.ok) assert.equal(getActivityById(saved.activity.id)?.title, 'Egen')
    const ownLike: Activity = { ...(getActivityById('tech-hjul') as Activity), title: 'Hjul (egen)', own: true }
    setEphemeralOwn([ownLike])
    assert.equal(getActivityById('tech-hjul')?.title, 'Hjul (egen)')
  })
})

describe('admin writes update this device without pending rows (Slice 32 AC 38)', () => {
  it('applyBankEntries keeps pending out of the store and the cache key', () => {
    setBankEnvForTests(ENV)
    initBank()
    const rows = bankRows((r) =>
      r.map((row, i) => (i === 0 ? { ...row, status: 'pending' } : i === 1 ? { ...row, status: 'hidden' } : row)),
    )
    const entries = rows
      .map((r) => rowToEntry(r, { allowPending: true }))
      .filter((e): e is BankEntry => e !== null)
    assert.equal(entries[0].status, 'pending')
    assert.equal(applyBankEntries(entries), true)
    const pendingId = rows[0].id
    const hiddenId = rows[1].id
    assert.equal(listBankActivities().some((a) => a.id === pendingId), false)
    assert.equal(listBankActivities().some((a) => a.id === hiddenId), false)
    assert.equal(bankStatus(), 'fresh')
    const cache = mem.get(BANK_CACHE_KEY) ?? ''
    assert.equal(cache.includes(`"${pendingId}"`), false)
    assert.equal(cache.includes(`"${hiddenId}"`), true)
  })
  it('the coach path never accepts pending rows', () => {
    const row = { ...bankRows()[0], status: 'pending' }
    assert.equal(rowToEntry(row), null)
  })
  it('refuses to apply when the bank is off or nothing is published', () => {
    setBankEnvForTests({})
    assert.equal(applyBankEntries([]), false)
    setBankEnvForTests(ENV)
    assert.equal(applyBankEntries([]), false)
  })
})

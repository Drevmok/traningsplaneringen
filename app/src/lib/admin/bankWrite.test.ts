import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { seedActivities } from '../../data/seedActivities.ts'
import { setBankEnvForTests } from '../bankConfig.ts'
import { resetBankForTests } from '../bank.ts'
import { setAdminClientForTests } from './client.ts'
import { approveRow, hideRow, markRowReviewed, saveRow, writeRow } from './bankWrite.ts'
import { getAdminBank, resetAdminStateForTests, type AdminEntry } from './state.ts'
import { refreshAdminRow, setAdminEntries } from './adminBank.ts'
import { activityToBankRow } from '../bankRow.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void Reflect.apply(Map.prototype.delete, mem, [k]),
  },
})
function setOnline(onLine: boolean): void {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine } })
}

interface Recorded {
  table: string
  update: unknown
  eqs: [string, unknown][]
}

function fake(result: { data: unknown; error: unknown } | 'throw') {
  const log: Recorded[] = []
  const methods: string[] = []
  return {
    log,
    methods,
    from(table: string) {
      const rec: Recorded = { table, update: undefined, eqs: [] }
      const q = {
        update(u: unknown) {
          methods.push('update')
          rec.update = u
          log.push(rec)
          return q
        },
        eq(col: string, v: unknown) {
          rec.eqs.push([col, v])
          return q
        },
        select() {
          return q
        },
        order() {
          return q
        },
        async abortSignal() {
          if (rec.update === undefined) return { data: [], error: null } // reload after write
          if (result === 'throw') throw new Error('network')
          return result
        },
      }
      return new Proxy(q, {
        get(target, prop: string) {
          if (!(prop in target)) methods.push(prop)
          return (target as Record<string, unknown>)[prop]
        },
      })
    },
  }
}

const entry: AdminEntry = {
  activity: seedActivities[0],
  status: 'pending',
  sortOrder: 1,
  updatedAt: '2026-10-02T10:00:00.123456+00:00',
  updatedBy: 'bot:planner',
  needsReview: true,
}

beforeEach(() => {
  setOnline(true)
  setBankEnvForTests({ VITE_SUPABASE_URL: 'https://example-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' })
  resetBankForTests()
})
afterEach(() => {
  setAdminClientForTests(null)
  setBankEnvForTests(undefined)
})

describe('bankWrite (Slice 32 F1)', () => {
  it('guards every write by id + the loaded updated_at', async () => {
    const f = fake({ data: [{ id: entry.activity.id }], error: null })
    setAdminClientForTests(f)
    assert.equal(await approveRow(entry), 'ok')
    assert.deepEqual(f.log[0].update, { status: 'published' })
    assert.deepEqual(f.log[0].eqs, [
      ['id', entry.activity.id],
      ['updated_at', entry.updatedAt],
    ])
  })
  it('0 rows back → conflict (nothing overwritten)', async () => {
    setAdminClientForTests(fake({ data: [], error: null }))
    assert.equal(await hideRow(entry), 'conflict')
  })
  it('error or network failure → failed', async () => {
    setAdminClientForTests(fake({ data: null, error: { message: 'permission denied' } }))
    assert.equal(await markRowReviewed(entry), 'failed')
    setAdminClientForTests(fake('throw'))
    assert.equal(await writeRow(entry, { status: 'published' }), 'failed')
  })
  it('offline → offline, no request at all', async () => {
    setOnline(false)
    const f = fake({ data: [{ id: 'x' }], error: null })
    setAdminClientForTests(f)
    assert.equal(await approveRow(entry), 'offline')
    assert.equal(f.log.length, 0)
  })
  it('save clears needs_coach_review and never sends updated_by / status / tags', async () => {
    const f = fake({ data: [{ id: entry.activity.id }], error: null })
    setAdminClientForTests(f)
    await saveRow(entry, {
      title: 'T',
      block_type: 'teknik',
      duration_minutes_default: 10,
      summary: 's',
      how_to: 'a',
      watch_for: 'w',
      safety_line: null,
      default_station_equipment: null,
      source: null,
      experienced_coach_only: false,
    })
    const u = f.log[0].update as Record<string, unknown>
    assert.equal(u.needs_coach_review, false)
    for (const k of ['updated_by', 'updated_at', 'status', 'tags', 'difficulty', 'progression_of', 'visual_key', 'sort_order', 'id']) {
      assert.equal(k in u, false, k)
    }
  })
  it('conflict re-reads the row + its version, so a reopen saves instead of conflicting again (C1)', async () => {
    resetAdminStateForTests()
    setAdminEntries([entry])
    const fresh = { ...activityToBankRow(entry.activity, 0, null, 'pending'), title: 'Ändrad av någon annan', updated_at: '2026-10-02T11:11:11.5+00:00', updated_by: 'other@test.local' }
    const calls: string[] = []
    let current = { at: fresh.updated_at }
    const client = {
      from(table: string) {
        assert.equal(table, 'exercises')
        let isUpdate = false
        const eqs: [string, unknown][] = []
        const q = {
          update() { isUpdate = true; return q },
          select() { return q },
          eq(c: string, v: unknown) { eqs.push([c, v]); return q },
          order() { return q },
          async abortSignal() {
            const at = eqs.find(([c]) => c === 'updated_at')?.[1]
            if (isUpdate) {
              calls.push(`update@${at}`)
              return { data: at === current.at ? [{ id: entry.activity.id }] : [], error: null }
            }
            calls.push(eqs.some(([c]) => c === 'id') ? 'select-row' : 'select-all')
            return { data: [fresh], error: null }
          },
        }
        return q
      },
    }
    setAdminClientForTests(client)
    // 1st save with the stale version → conflict, and the row is fetched right away
    assert.equal(await hideRow(entry), 'conflict')
    assert.deepEqual(calls, [`update@${entry.updatedAt}`, 'select-row'])
    const reopened = getAdminBank().byId.get(entry.activity.id) as AdminEntry
    assert.equal(reopened.updatedAt, fresh.updated_at)
    assert.equal(reopened.activity.title, 'Ändrad av någon annan')
    assert.equal(reopened.updatedBy, 'other@test.local')
    // «Stäng och öppna den igen»: the reopened entry carries the new version → saves
    assert.equal(await hideRow(reopened), 'ok')
    assert.equal(calls[2], `update@${fresh.updated_at}`)
    // opening the detail refetches one row too (AdminDetailPanel) and keeps the other entries
    current = { at: 'later' }
    assert.equal(await refreshAdminRow(entry.activity.id), true)
    assert.equal(calls.at(-1), 'select-row')
    assert.equal(getAdminBank().entries.length, 1)
    resetAdminStateForTests()
  })
  it('no delete or insert anywhere in the admin code (AC 35)', () => {
    const dir = new URL('.', import.meta.url).pathname
    const files = readdirSync(dir).filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts'))
    for (const n of files) {
      const src = readFileSync(dir + n, 'utf8')
      assert.equal(/\.delete\(/.test(src), false, n)
      assert.equal(/\.insert\(|\.upsert\(/.test(src), false, n)
    }
  })
})

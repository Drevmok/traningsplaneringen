/**
 * Slice 31 (A1 + D1) — the shared exercise bank, read-only.
 *
 * initBank()    sync, before first render: device cache → else the bundled seeds.
 * refreshBank() async, once per load, after first render: two GETs (exercises + redskap)
 *               with the publishable key on `apikey` only, 8 s timeout. A fully valid
 *               answer replaces the store and the cache ('fresh'); anything else keeps
 *               the current copy ('stale'). Bank not configured → nothing happens.
 *
 * Lists use published rows; findBankActivity also sees hidden rows so old passes,
 * drafts and share links keep their text. Pending rows never reach a coach's device.
 */
import { seedActivities } from '../data/seedActivities'
import type { Activity } from '../types'
import { bankConfig, bankEnabled } from './bankConfig'
import { activityToBankRow, BANK_EXERCISE_COLUMNS, rowToEntry, type BankEntry } from './bankRow'

export type BankStatus = 'bundled' | 'cached' | 'fresh' | 'stale'

export interface BankSnapshot {
  status: BankStatus
  /** Published exercises in bank order (Biblioteket, block lists, import duplicates). */
  activities: Activity[]
  /** Hidden ("Dold") ids — resolvable by id, never listed. */
  hiddenIds: ReadonlySet<string>
  redskapLabels: Readonly<Record<string, string>>
}

export const BANK_CACHE_KEY = 'gymnastics-planner-bank-cache-v1'
export const BANK_TIMEOUT_MS = 8000

interface CacheV1 {
  v: 1
  fetchedAt: string
  /** Published + hidden, in bank order. */
  exercises: Activity[]
  hiddenIds: string[]
  redskapLabels: Record<string, string>
}

let snapshot: BankSnapshot | null = null
let byId = new Map<string, Activity>()
let refreshed = false
const listeners = new Set<() => void>()

let bundledSnapshot: BankSnapshot | null = null
function bundled(): BankSnapshot {
  bundledSnapshot ??= {
    status: 'bundled',
    activities: seedActivities,
    hiddenIds: new Set(),
    redskapLabels: {},
  }
  return bundledSnapshot
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function setSnapshot(next: BankSnapshot, all: readonly Activity[]): void {
  snapshot = next
  byId = new Map(all.map((a) => [a.id, a]))
  for (const fn of listeners) fn()
}

function split(entries: BankEntry[]): { published: Activity[]; hidden: Activity[]; all: Activity[] } {
  const sorted = [...entries].sort((a, b) => a.sortOrder - b.sortOrder)
  const all = sorted.map((e) => e.activity)
  return {
    all,
    published: sorted.filter((e) => e.status === 'published').map((e) => e.activity),
    hidden: sorted.filter((e) => e.status === 'hidden').map((e) => e.activity),
  }
}

function readCache(): { entries: BankEntry[]; redskapLabels: Record<string, string> } | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(BANK_CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<CacheV1> | null
    if (!data || data.v !== 1 || !Array.isArray(data.exercises)) return null
    const hidden = new Set(Array.isArray(data.hiddenIds) ? data.hiddenIds.filter((x) => typeof x === 'string') : [])
    const entries: BankEntry[] = []
    data.exercises.forEach((a, index) => {
      if (!a || typeof a !== 'object') return
      // Same guard as a fresh fetch: a tampered or half-written cache never reaches the UI.
      const row = activityToBankRow(a, index, a.safetyLine ?? null, hidden.has(a.id) ? 'hidden' : 'published')
      const entry = rowToEntry(row)
      if (entry) entries.push(entry)
    })
    if (!entries.some((e) => e.status === 'published')) return null
    const labels: Record<string, string> = {}
    if (data.redskapLabels && typeof data.redskapLabels === 'object') {
      for (const [k, v] of Object.entries(data.redskapLabels)) if (typeof v === 'string') labels[k] = v
    }
    return { entries, redskapLabels: labels }
  } catch {
    return null
  }
}

function writeCache(all: Activity[], hiddenIds: string[], redskapLabels: Record<string, string>): void {
  const store = storage()
  if (!store) return
  const data: CacheV1 = { v: 1, fetchedAt: new Date().toISOString(), exercises: all, hiddenIds, redskapLabels }
  try {
    store.setItem(BANK_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Quota or private mode: the bank still works for this load.
  }
}

/** Sync, before first render. Bank off → bundled seeds only (the cache is not even read). */
export function initBank(): BankSnapshot {
  refreshed = false
  if (!bankEnabled()) {
    setSnapshot(bundled(), seedActivities)
    return bundled()
  }
  const cached = readCache()
  if (!cached) {
    setSnapshot(bundled(), seedActivities)
    return bundled()
  }
  const { all, published, hidden } = split(cached.entries)
  setSnapshot(
    { status: 'cached', activities: published, hiddenIds: new Set(hidden.map((a) => a.id)), redskapLabels: cached.redskapLabels },
    all,
  )
  return snapshot as BankSnapshot
}

function markStale(): void {
  const current = snapshot ?? bundled()
  if (current.status === 'stale') return
  setSnapshot({ ...current, status: 'stale' }, snapshot ? [...byId.values()] : seedActivities)
}

async function getJson(url: string, key: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, {
    method: 'GET',
    // Publishable key on `apikey` only — never `Authorization: Bearer` (config-pages.md).
    headers: { apikey: key, Accept: 'application/json' },
    signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export interface RefreshOptions {
  timeoutMs?: number
}

/**
 * One background fetch per load. Resolves to the resulting status
 * (or the current one when the bank is off / already refreshed).
 */
export async function refreshBank(options: RefreshOptions = {}): Promise<BankStatus> {
  const config = bankConfig()
  if (!config) return getBankSnapshot().status
  if (refreshed) return getBankSnapshot().status
  refreshed = true
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    markStale()
    return 'stale'
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? BANK_TIMEOUT_MS)
  try {
    const select = BANK_EXERCISE_COLUMNS.join(',')
    const [rows, redskap] = await Promise.all([
      getJson(
        `${config.url}/rest/v1/exercises?select=${select}&status=in.(published,hidden)&order=sort_order.asc`,
        config.key,
        controller.signal,
      ),
      getJson(`${config.url}/rest/v1/redskap?select=id,label_sv,visual_key,sort_order&order=sort_order.asc`, config.key, controller.signal),
    ])
    if (!Array.isArray(rows) || !Array.isArray(redskap)) throw new Error('shape')
    const entries = rows.map(rowToEntry).filter((e): e is BankEntry => e !== null)
    const { all, published, hidden } = split(entries)
    if (published.length === 0) throw new Error('no valid exercises')
    const labels: Record<string, string> = {}
    for (const r of redskap) {
      if (r && typeof r === 'object' && typeof r.id === 'string' && typeof r.label_sv === 'string') labels[r.id] = r.label_sv
    }
    const hiddenIds = hidden.map((a) => a.id)
    writeCache(all, hiddenIds, labels)
    setSnapshot({ status: 'fresh', activities: published, hiddenIds: new Set(hiddenIds), redskapLabels: labels }, all)
    return 'fresh'
  } catch {
    markStale()
    return 'stale'
  } finally {
    clearTimeout(timer)
  }
}

export function getBankSnapshot(): BankSnapshot {
  return snapshot ?? bundled()
}

export function subscribeBank(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function bankStatus(): BankStatus {
  return getBankSnapshot().status
}

/** Published exercises (Biblioteket, block lists, import duplicate check). */
export function listBankActivities(): Activity[] {
  return getBankSnapshot().activities
}

/** Published + hidden. Bundled seeds when the store holds the bundled copy. */
export function findBankActivity(id: string): Activity | undefined {
  if (!snapshot) return undefined
  return byId.get(id)
}

/** Every id the bank can resolve (published + hidden). */
export function bankActivityIds(): string[] {
  return snapshot ? [...byId.keys()] : []
}

export function bankRedskapLabel(id: string): string | undefined {
  return getBankSnapshot().redskapLabels[id]
}

/** Tests only. */
export function resetBankForTests(): void {
  snapshot = null
  byId = new Map()
  refreshed = false
  listeners.clear()
}

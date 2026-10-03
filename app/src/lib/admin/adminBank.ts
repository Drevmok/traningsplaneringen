/**
 * Slice 32 (lazy chunk) — the admin's view of the bank: every row incl. pending, plus who/when.
 * Lives in memory only. Pending rows never touch the coach store or its cache key:
 * applyBankEntries() takes published + hidden only.
 */
import { applyBankEntries } from '../bank'
import { BANK_EXERCISE_COLUMNS, rowToEntry } from '../bankRow'
import { getAdminClient } from './client'
import { EMPTY_ADMIN_BANK, getAdminBank, setAdminBankSnapshot, type AdminEntry } from './state'

export type { AdminEntry }

export const ADMIN_COLUMNS = [...BANK_EXERCISE_COLUMNS, 'updated_at', 'updated_by'].join(',')
export const ADMIN_TIMEOUT_MS = 10000

/** Rows from the server → entries (same guards as the coach path, pending allowed). */
export function toAdminEntries(rows: readonly unknown[]): AdminEntry[] {
  const out: AdminEntry[] = []
  for (const raw of rows) {
    const entry = rowToEntry(raw, { allowPending: true })
    if (!entry) continue
    const r = raw as Record<string, unknown>
    out.push({
      ...entry,
      updatedAt: typeof r.updated_at === 'string' ? r.updated_at : '',
      updatedBy: typeof r.updated_by === 'string' ? r.updated_by : null,
      needsReview: r.needs_coach_review === true,
    })
  }
  return out.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function setAdminEntries(entries: AdminEntry[]): void {
  const counts = { pending: 0, review: 0, hidden: 0 }
  for (const e of entries) {
    if (e.status === 'pending') counts.pending += 1
    else if (e.status === 'hidden') counts.hidden += 1
    else if (e.needsReview) counts.review += 1
  }
  setAdminBankSnapshot({ loaded: true, entries, byId: new Map(entries.map((e) => [e.activity.id, e])), counts })
  // This device's coach view updates at once (published + hidden only — never pending).
  applyBankEntries(entries)
}

/** Reads every row the admin may see (RLS: all statuses). False on any failure. */
export async function loadAdminBank(): Promise<boolean> {
  const pending = getAdminClient()
  if (!pending) return false
  try {
    const client = await pending
    const { data, error } = await client
      .from('exercises')
      .select(ADMIN_COLUMNS)
      .order('sort_order', { ascending: true })
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error || !Array.isArray(data)) return false
    setAdminEntries(toAdminEntries(data))
    return true
  } catch {
    return false
  }
}

export function clearAdminBank(): void {
  if (getAdminBank() !== EMPTY_ADMIN_BANK) setAdminBankSnapshot(EMPTY_ADMIN_BANK)
}

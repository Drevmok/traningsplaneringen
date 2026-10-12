/**
 * Slice 36 (B1, C1, F1) — admin writes to «Föreningens mallar». Lazy: loaded only in admin
 * mode, never on a coach visit. Uses the admin client (the admin's own session).
 *
 * Publish = lookup by name (lower(trim), like the DB's unique index) → insert, or, after the
 * overwrite confirm, update that row. A 23505 on insert (same name published in between) →
 * re-read and ask for the overwrite. Dölj för alla / Visa igen = update hidden. No delete
 * anywhere (the database has no delete policy or grant either). Offline → 'offline', nothing
 * queued, nothing retried.
 */
import { useSyncExternalStore } from 'react'
// Only the store and types: importing sharePass/session code from a lazy chunk makes the
// bundler move shared app modules out of the main chunk (see SLICE36-SHIPPED.md § Bundle).
import { applyClubTemplates, cleanClubTitle, clubTitleKey, toClubTemplate, type ClubTemplate } from '../clubStore'
import type { SharePass } from '../sharePass'
/** Same as adminBank (not imported, so this chunk stays independent of the bank admin chunk). */
const ADMIN_TIMEOUT_MS = 10000
import { getAdminClient } from './client'

export interface ClubAdminRow extends ClubTemplate {
  hidden: boolean
  updatedBy: string | null
}

export interface ClubAdminSnapshot {
  loaded: boolean
  rows: ClubAdminRow[]
}

export type ClubWriteResult = 'ok' | 'offline' | 'failed'
export type PublishResult = ClubWriteResult | { exists: ClubAdminRow }

const COLUMNS = 'id,title,total_minutes,payload,hidden,updated_at,updated_by'
export const CLUB_PAYLOAD_MAX = 65536

/** What the caller (the open pass) gives: minutes + `clubPayload(session, title)` from clubTemplates.ts. */
export interface ClubDraft {
  totalMinutes: number
  payload: (title: string) => Omit<SharePass, 'hallPlacements'>
}

let snapshot: ClubAdminSnapshot = { loaded: false, rows: [] }
let listeners: Array<() => void> = []

function set(next: ClubAdminSnapshot): void {
  snapshot = next
  for (const fn of listeners) fn()
}

export function getClubAdmin(): ClubAdminSnapshot {
  return snapshot
}

export function useClubAdmin(): ClubAdminSnapshot {
  return useSyncExternalStore(
    (fn) => {
      listeners = [...listeners, fn]
      return () => {
        listeners = listeners.filter((f) => f !== fn)
      }
    },
    getClubAdmin,
    getClubAdmin,
  )
}

/** Server rows → admin rows (same guards as the coach path, hidden allowed). */
export function toClubAdminRows(rows: readonly unknown[]): ClubAdminRow[] {
  const out: ClubAdminRow[] = []
  for (const raw of rows) {
    const t = toClubTemplate(raw)
    if (!t) continue
    const r = raw as Record<string, unknown>
    out.push({ ...t, hidden: r.hidden === true, updatedBy: typeof r.updated_by === 'string' ? r.updated_by : null })
  }
  return out
}

/** The overwrite target: any row (also hidden, §8.4) with the same name. */
export function findClubByTitle(rows: readonly ClubAdminRow[], title: string): ClubAdminRow | undefined {
  const key = clubTitleKey(cleanClubTitle(title))
  return rows.find((r) => clubTitleKey(r.title) === key)
}

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/** Admin re-read (RLS gives hidden rows too). The coach store/cache gets visible rows only. */
export async function loadClubAdmin(): Promise<boolean> {
  const pending = getAdminClient()
  if (!pending) return false
  try {
    const client = await pending
    const { data, error } = await client
      .from('club_templates')
      .select(COLUMNS)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error || !Array.isArray(data)) return false
    const rows = toClubAdminRows(data)
    set({ loaded: true, rows })
    applyClubTemplates(rows.filter((r) => !r.hidden))
    return true
  } catch {
    return false
  }
}

export function fitsDb(draft: ClubDraft, title: string): boolean {
  const name = cleanClubTitle(title)
  const minutes = draft.totalMinutes
  if (!name || !Number.isInteger(minutes) || minutes < 1 || minutes > 240) return false
  // §8.7 — the DB caps the payload at 64 kB; refuse early with the same «clubWriteFailed».
  return new TextEncoder().encode(JSON.stringify(draft.payload(name))).length <= CLUB_PAYLOAD_MAX
}

/** Insert a new mall, or report the row with the same name (the caller shows the overwrite confirm). */
export async function publishClubTemplate(draft: ClubDraft, title: string): Promise<PublishResult> {
  if (offline()) return 'offline'
  if (!snapshot.loaded && !(await loadClubAdmin())) return 'failed'
  const match = findClubByTitle(snapshot.rows, title)
  if (match) return { exists: match }
  if (!fitsDb(draft, title)) return 'failed'
  const pending = getAdminClient()
  if (!pending) return 'failed'
  try {
    const client = await pending
    const name = cleanClubTitle(title)
    const { data, error } = await client
      .from('club_templates')
      .insert({ title: name, total_minutes: draft.totalMinutes, payload: draft.payload(name) })
      .select('id')
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error?.code === '23505') {
      await loadClubAdmin()
      const raced = findClubByTitle(snapshot.rows, title)
      return raced ? { exists: raced } : 'failed'
    }
    if (error || !Array.isArray(data) || data.length === 0) return 'failed'
    await loadClubAdmin()
    return 'ok'
  } catch {
    return offline() ? 'offline' : 'failed'
  }
}

async function updateRow(id: string, update: Record<string, unknown>): Promise<ClubWriteResult> {
  if (offline()) return 'offline'
  const pending = getAdminClient()
  if (!pending) return 'failed'
  try {
    const client = await pending
    const { data, error } = await client
      .from('club_templates')
      .update(update)
      .eq('id', id)
      .select('id')
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    // 401/403/42501 or 0 rows (not admin any more) → failed, never retried silently.
    if (error || !Array.isArray(data) || data.length === 0) return 'failed'
    await loadClubAdmin()
    return 'ok'
  } catch {
    return offline() ? 'offline' : 'failed'
  }
}

/** F1 — replace the row with the same name (same id); also shows it again if it was hidden. */
export function overwriteClubTemplate(match: ClubAdminRow, draft: ClubDraft, title: string): Promise<ClubWriteResult> {
  if (!fitsDb(draft, title)) return Promise.resolve('failed')
  const name = cleanClubTitle(title)
  return updateRow(match.id, { title: name, total_minutes: draft.totalMinutes, payload: draft.payload(name), hidden: false })
}

export const hideClubTemplate = (row: ClubAdminRow) => updateRow(row.id, { hidden: true })
export const unhideClubTemplate = (row: ClubAdminRow) => updateRow(row.id, { hidden: false })

/** Tests only. */
export function resetClubAdminForTests(rows: ClubAdminRow[] = [], loaded = false): void {
  snapshot = { loaded, rows }
  listeners = []
}

/**
 * Slice 32/33 — the small, always-loaded part of admin: two in-memory stores (login state and
 * the admin's bank copy) and the "should admin start at all?" check. Everything that talks
 * to Supabase (session.ts, adminBank.ts, bankWrite.ts, supabase-js) is loaded lazily so a
 * coach's main chunk barely grows (AC 49) and never fetches supabase-js (AC 26).
 * Slice 33: login is by a code typed into the sheet, so only a saved session starts admin
 * on load; an address (old `?code=` link) never does.
 *
 *   'none'      nobody logged in → footer shows «Logga in som admin»
 *   'checking'  session being checked → footer shows only the slice label
 *   'admin'     on public.admins → admin mode
 *   'notAdmin'  valid session, not on the list → «Du är inloggad men inte admin.» + Logga ut
 */
import type { Activity } from '../../types'
import { bankEnabled } from '../bankConfig'
import type { BankRowStatus } from '../bankRow'

export const ADMIN_AUTH_KEY = 'gymnastics-planner-admin-auth-v1'

export type AdminState = 'none' | 'checking' | 'admin' | 'notAdmin'

export interface AdminSnapshot {
  state: AdminState
}

// Plain arrays (not Sets): the admin folder has no delete call of any kind — AC 35 greps for it.
let snapshot: AdminSnapshot = { state: 'none' }
let listeners: Array<() => void> = []

export function setAdminSnapshot(next: Partial<AdminSnapshot>): void {
  snapshot = { ...snapshot, ...next }
  for (const fn of listeners) fn()
}

export function getAdminSnapshot(): AdminSnapshot {
  return snapshot
}

export function subscribeAdmin(fn: () => void): () => void {
  listeners = [...listeners, fn]
  return () => {
    listeners = listeners.filter((f) => f !== fn)
  }
}

/** The footer link exists only when the bank is configured (same build vars as Slice 31). */
export function adminAvailable(): boolean {
  return bankEnabled()
}

function hasStoredSession(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(ADMIN_AUTH_KEY) !== null
  } catch {
    return false
  }
}

/** True when this load must look at admin state (and therefore load the admin chunk): a saved session only. */
export function shouldStartAdmin(): boolean {
  return bankEnabled() && hasStoredSession()
}

// ---- the admin's copy of the bank (all statuses; memory only) ----

export interface AdminEntry {
  activity: Activity
  status: BankRowStatus
  sortOrder: number
  /** Exactly as the server sent it — echoed back on writes (conflict check). */
  updatedAt: string
  updatedBy: string | null
  needsReview: boolean
}

export interface AdminBankSnapshot {
  loaded: boolean
  entries: readonly AdminEntry[]
  byId: ReadonlyMap<string, AdminEntry>
  counts: { pending: number; review: number; hidden: number }
}

export const EMPTY_ADMIN_BANK: AdminBankSnapshot = {
  loaded: false,
  entries: [],
  byId: new Map(),
  counts: { pending: 0, review: 0, hidden: 0 },
}
let bank: AdminBankSnapshot = EMPTY_ADMIN_BANK
let bankListeners: Array<() => void> = []

export function setAdminBankSnapshot(next: AdminBankSnapshot): void {
  if (next === bank) return
  bank = next
  for (const fn of bankListeners) fn()
}

export function getAdminBank(): AdminBankSnapshot {
  return bank
}

export function subscribeAdminBank(fn: () => void): () => void {
  bankListeners = [...bankListeners, fn]
  return () => {
    bankListeners = bankListeners.filter((f) => f !== fn)
  }
}

export function adminEntry(id: string): AdminEntry | undefined {
  return bank.byId.get(id)
}

/** Tests only. */
export function resetAdminStateForTests(): void {
  snapshot = { state: 'none' }
  listeners = []
  bank = EMPTY_ADMIN_BANK
  bankListeners = []
}

/**
 * Slice 36 — the club-mall store (no share/session code, so the lazy admin chunk can use it
 * without pulling app modules out of the main chunk). clubTemplates.ts holds load/refresh/apply.
 */
import { useSyncExternalStore } from 'react'
import type { SharePass } from './sharePass'

export type ClubStatus = 'none' | 'cached' | 'fresh' | 'stale'

export interface ClubTemplate {
  id: string
  title: string
  totalMinutes: number
  pass: SharePass
  updatedAt: string
}

export interface ClubSnapshot {
  status: ClubStatus
  items: ClubTemplate[]
}

export const CLUB_CACHE_KEY = 'gymnastics-planner-club-templates-v1'

export const NO_CLUB: ClubSnapshot = { status: 'none', items: [] }
let snapshot: ClubSnapshot = NO_CLUB
let listeners: Array<() => void> = []

export function setClubSnapshot(next: ClubSnapshot): void {
  snapshot = next
  for (const fn of listeners) fn()
}

export function clubStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** A cached item (same shape) or a server row → a club mall, or null when anything is off. */
export function toClubTemplate(raw: unknown): ClubTemplate | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const pass = (r.pass ?? r.payload) as SharePass | undefined
  const minutes = r.totalMinutes ?? r.total_minutes
  if (typeof r.id !== 'string' || !r.id || typeof r.title !== 'string' || !r.title.trim()) return null
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return null
  if (!pass || pass.v !== 1 || !Array.isArray(pass.blocks)) return null
  return { id: r.id, title: r.title, totalMinutes: minutes, pass, updatedAt: String(r.updatedAt ?? r.updated_at ?? '') }
}

export function validClubList(list: unknown): ClubTemplate[] {
  return Array.isArray(list) ? list.map(toClubTemplate).filter((t): t is ClubTemplate => t !== null) : []
}

function writeCache(items: ClubTemplate[]): void {
  const store = clubStorage()
  if (!store) return
  try {
    if (items.length === 0) store.removeItem(CLUB_CACHE_KEY)
    else store.setItem(CLUB_CACHE_KEY, JSON.stringify({ v: 1, fetchedAt: new Date().toISOString(), items }))
  } catch {
    // Quota or private mode: the list still works for this load.
  }
}

/**
 * Visible rows (from the coach GET, or an admin's re-read) → store + cache.
 * Hidden rows are dropped here, so they never reach the cache.
 */
export function applyClubTemplates(rows: readonly unknown[]): void {
  const items = validClubList(rows.filter((r) => !(r && typeof r === 'object' && (r as { hidden?: unknown }).hidden === true)))
  writeCache(items)
  setClubSnapshot({ status: 'fresh', items })
}

export function getClubSnapshot(): ClubSnapshot {
  return snapshot
}

export function subscribeClub(fn: () => void): () => void {
  if (!listeners.includes(fn)) listeners = [...listeners, fn]
  return () => {
    listeners = listeners.filter((f) => f !== fn)
  }
}

export function useClubTemplates(): ClubSnapshot {
  return useSyncExternalStore(subscribeClub, getClubSnapshot, getClubSnapshot)
}

/** Overwrite key (F1): same name regardless of case and outer spaces, like the DB index lower(btrim(title)). */
export function clubTitleKey(title: string): string {
  return title.trim().toLowerCase()
}

export const CLUB_TITLE_MAX = 80

export function cleanClubTitle(title: string): string {
  return title.trim().slice(0, CLUB_TITLE_MAX).trim()
}

/** Tests only. */
export function resetClubStoreForTests(): void {
  snapshot = NO_CLUB
  listeners = []
}

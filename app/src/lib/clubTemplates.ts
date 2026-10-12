/**
 * Slice 36 (A1 + D1) — «Föreningens mallar», read-only on a coach's device.
 *
 * initClubTemplates()    sync, before first render: the device cache (visible rows only) or none.
 * refreshClubTemplates() once per load, after first render, only when the bank is configured:
 *                        one GET with the publishable key on `apikey` only, 8 s timeout.
 *                        A valid array (also an empty one) replaces store + cache ('fresh');
 *                        anything else keeps the current list ('stale').
 * clubTemplateToSession() makes a club mall the coach's own pass: hall placements cleared,
 * fresh ids, nothing links back to the row. clubPayload() is what an admin publishes.
 * No admin code is imported here; the store lives in clubStore.ts.
 */
import type { Session } from '../types'
import { BANK_TIMEOUT_MS } from './bank'
import { bankConfig, bankEnabled } from './bankConfig'
import {
  applyClubTemplates,
  CLUB_CACHE_KEY,
  cleanClubTitle,
  clubStorage,
  getClubSnapshot,
  NO_CLUB,
  resetClubStoreForTests,
  setClubSnapshot,
  validClubList,
  type ClubSnapshot,
  type ClubStatus,
  type ClubTemplate,
} from './clubStore'
import { clearHallPlacements } from './hall'
import { activitiesFromShareOwn, setEphemeralOwn } from './ownActivities'
import { duplicateSession } from './session'
import { sessionToShare, shareToSession, type SharePass } from './sharePass'

export * from './clubStore'

let refreshed = false

/** Sync, before first render. Bank off → nothing (the cache is not even read). */
export function initClubTemplates(): ClubSnapshot {
  refreshed = false
  if (!bankEnabled()) {
    setClubSnapshot(NO_CLUB)
    return NO_CLUB
  }
  let items: ClubTemplate[] = []
  try {
    const raw = clubStorage()?.getItem(CLUB_CACHE_KEY)
    const data = raw ? (JSON.parse(raw) as { v?: unknown; items?: unknown } | null) : null
    if (data && data.v === 1) items = validClubList(data.items)
  } catch {
    items = []
  }
  setClubSnapshot(items.length > 0 ? { status: 'cached', items } : NO_CLUB)
  return getClubSnapshot()
}

/** One background GET per load. Resolves to the resulting status. */
export async function refreshClubTemplates(options: { timeoutMs?: number } = {}): Promise<ClubStatus> {
  const config = bankConfig()
  if (!config || refreshed) return getClubSnapshot().status
  refreshed = true
  const stale = () => {
    setClubSnapshot({ ...getClubSnapshot(), status: 'stale' })
    return 'stale' as const
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return stale()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? BANK_TIMEOUT_MS)
  try {
    const res = await fetch(
      `${config.url}/rest/v1/club_templates?select=id,title,total_minutes,payload,updated_at&hidden=is.false&order=sort_order,title`,
      // Publishable key on `apikey` only — never `Authorization` (same as the bank).
      { headers: { apikey: config.key }, signal: controller.signal, cache: 'no-store' },
    )
    if (!res.ok) return stale()
    const rows = (await res.json()) as unknown
    if (!Array.isArray(rows)) return stale()
    applyClubTemplates(rows)
    return 'fresh'
  } catch {
    return stale()
  } finally {
    clearTimeout(timer)
  }
}

/** E1 — a club mall becomes the coach's own pass: no placements, fresh ids, same title. */
export function clubTemplateToSession(template: ClubTemplate): Session {
  setEphemeralOwn(activitiesFromShareOwn(template.pass.own))
  const base = shareToSession({ ...template.pass, hallPlacements: [] })
  return clearHallPlacements({ ...duplicateSession(base), title: base.title })
}

/** C1 + E1 — SharePass v1 without hallPlacements; own drills and the hall choice kept. */
export function clubPayload(session: Session, title: string): Omit<SharePass, 'hallPlacements'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hallPlacements, ...pass } = sessionToShare(clearHallPlacements(session))
  void hallPlacements
  return { ...pass, title: cleanClubTitle(title) }
}

/** Tests only. */
export function resetClubForTests(): void {
  resetClubStoreForTests()
  refreshed = false
}

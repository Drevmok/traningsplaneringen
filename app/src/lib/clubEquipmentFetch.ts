/**
 * Slice 68 — React hook + one background GET (publishable key on `apikey` only).
 * Kept off the store module so the admin chunk does not share this graph.
 */
import { useSyncExternalStore } from 'react'
import { BANK_TIMEOUT_MS } from './bank'
import { bankConfig, bankEnabled } from './bankConfig'
import {
  applyClubEquipment,
  getClubEquipment,
  readClubEquipmentCache,
  setClubEquipmentState,
  subscribeClubEquipment,
  type ClubEquipmentState,
} from './clubEquipmentStore'
import { sanitizePieceIds } from './clubEquipment'

let refreshed = false

export function useClubEquipment(): ClubEquipmentState {
  return useSyncExternalStore(subscribeClubEquipment, getClubEquipment, getClubEquipment)
}

/** Sync, before first render. Bank off → not filled (cache is not read). */
export function initClubEquipment(): ClubEquipmentState {
  refreshed = false
  if (!bankEnabled()) {
    setClubEquipmentState({ filled: false })
    return getClubEquipment()
  }
  setClubEquipmentState(readClubEquipmentCache())
  return getClubEquipment()
}

/** One background GET per load. 0 rows or a failed/missing table → keep cache or stay not filled. */
export async function refreshClubEquipment(options: { timeoutMs?: number } = {}): Promise<void> {
  const config = bankConfig()
  if (!config || refreshed) return
  refreshed = true
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? BANK_TIMEOUT_MS)
  try {
    const res = await fetch(
      `${config.url}/rest/v1/club_equipment?select=piece_ids,updated_at&id=eq.club`,
      { headers: { apikey: config.key }, signal: controller.signal, cache: 'no-store' },
    )
    if (!res.ok) return
    const rows = (await res.json()) as unknown
    if (!Array.isArray(rows)) return
    if (rows.length === 0) {
      applyClubEquipment(null)
      return
    }
    const ids = (rows[0] as { piece_ids?: unknown })?.piece_ids
    applyClubEquipment(sanitizePieceIds(Array.isArray(ids) ? ids : []))
  } catch {
    /* table missing / network: stale cache or not filled — no error UI */
  } finally {
    clearTimeout(timer)
  }
}

export function resetClubEquipmentFetchForTests(): void {
  refreshed = false
}

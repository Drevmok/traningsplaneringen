/** Slice 68 B1 — admin upsert of the single `club_equipment` row. No DELETE. Lazy admin chunk. */
import { getAdminClient } from './client'
import type { ClubWriteResult } from './clubWrite'

const ADMIN_TIMEOUT_MS = 10000

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function rawIds(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []
}

function syncCoach(ids: string[] | null): void {
  window.dispatchEvent(new CustomEvent('tp-club-eq', { detail: ids }))
}

export async function loadClubEquipmentAdmin(): Promise<{ filled: boolean; ids: string[] }> {
  const pending = getAdminClient()
  if (!pending) return { filled: false, ids: [] }
  try {
    const client = await pending
    const { data, error } = await client
      .from('club_equipment')
      .select('piece_ids')
      .eq('id', 'club')
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error || !Array.isArray(data) || data.length === 0) return { filled: false, ids: [] }
    const ids = rawIds((data[0] as { piece_ids?: unknown }).piece_ids)
    syncCoach(ids)
    return { filled: true, ids }
  } catch {
    return { filled: false, ids: [] }
  }
}

/** Upsert the `id = 'club'` row. Never DELETE. */
export async function saveClubEquipment(ids: string[]): Promise<ClubWriteResult> {
  if (offline()) return 'offline'
  const pending = getAdminClient()
  if (!pending) return 'failed'
  const piece_ids = rawIds(ids)
  try {
    const client = await pending
    const { error } = await client
      .from('club_equipment')
      .upsert({ id: 'club', piece_ids }, { onConflict: 'id' })
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error) return 'failed'
    syncCoach(piece_ids)
    return 'ok'
  } catch {
    return offline() ? 'offline' : 'failed'
  }
}

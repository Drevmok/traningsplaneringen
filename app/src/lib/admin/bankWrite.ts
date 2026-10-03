/**
 * Slice 32 (F1) — admin writes. Every write is an UPDATE of one row guarded by the
 * `updated_at` the admin loaded: 0 rows back → someone else changed it → 'conflict'
 * (nothing overwritten, nothing merged). No insert from the app, and no delete anywhere:
 * "Dölj" is status = 'hidden' (the database refuses deletes too).
 * Network needed: offline → 'offline', nothing queued.
 */
import type { ActivitySource, BlockType, StationEquipmentSlot } from '../../types'
import { loadAdminBank, ADMIN_TIMEOUT_MS, type AdminEntry } from './adminBank'
import { getAdminClient } from './client'

export type WriteResult = 'ok' | 'conflict' | 'failed' | 'offline'

/** The columns «Ändra i banken» may change. Tags, difficulty, links, visual and order are not here. */
export interface BankPatch {
  title: string
  block_type: BlockType
  duration_minutes_default: number
  summary: string
  how_to: string
  watch_for: string
  safety_line: string | null
  default_station_equipment: StationEquipmentSlot[] | null
  source: ActivitySource | null
  experienced_coach_only: boolean
}

type RowUpdate = Partial<BankPatch> & { status?: 'published' | 'hidden'; needs_coach_review?: boolean }

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export async function writeRow(entry: AdminEntry, update: RowUpdate): Promise<WriteResult> {
  if (offline()) return 'offline'
  const pending = getAdminClient()
  if (!pending) return 'failed'
  try {
    const client = await pending
    const { data, error } = await client
      .from('exercises')
      .update(update)
      .eq('id', entry.activity.id)
      .eq('updated_at', entry.updatedAt)
      .select('id')
      .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
    if (error) return 'failed'
    if (!Array.isArray(data) || data.length === 0) return 'conflict'
    await loadAdminBank()
    return 'ok'
  } catch {
    return 'failed'
  }
}

export const approveRow = (entry: AdminEntry) => writeRow(entry, { status: 'published' })
export const hideRow = (entry: AdminEntry) => writeRow(entry, { status: 'hidden' })
export const unhideRow = (entry: AdminEntry) => writeRow(entry, { status: 'published' })
export const markRowReviewed = (entry: AdminEntry) => writeRow(entry, { needs_coach_review: false })
/** Saving counts as reviewed (Slice 30 D1 parity). updated_by is stamped by the database. */
export const saveRow = (entry: AdminEntry, patch: BankPatch) => writeRow(entry, { ...patch, needs_coach_review: false })

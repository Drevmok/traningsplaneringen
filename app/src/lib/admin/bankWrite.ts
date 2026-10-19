/**
 * Slice 32 (F1) — admin writes. Every write is an UPDATE of one row guarded by the
 * `updated_at` the admin loaded: 0 rows back → someone else changed it → 'conflict'
 * (nothing overwritten, nothing merged; the row is re-read so a reopen starts fresh). Slice 47: the one insert is
 * a new row with status 'pending' (insertPendingRow, existing admin insert policy). No delete anywhere:
 * "Dölj" is status = 'hidden' (the database refuses deletes too).
 * Network needed: offline → 'offline', nothing queued.
 */
import type { Activity, ActivitySource, BlockType, Difficulty, StationEquipmentSlot } from '../../types'
import { loadAdminBank, refreshAdminRow, ADMIN_TIMEOUT_MS, type AdminEntry } from './adminBank'
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
    if (!Array.isArray(data) || data.length === 0) {
      // Someone else changed it: fetch the row and its new version now, so closing and
      // reopening (adminSaveConflict) starts from the fresh row instead of conflicting again.
      await refreshAdminRow(entry.activity.id)
      return 'conflict'
    }
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

/** Slice 47: id prefixes the bank's id rule allows (`^(gather|warm|tech|strength|fun)-[a-z0-9-]{2,60}$`). */
const PREFIX: Record<BlockType, string> = {
  gathering: 'gather',
  warmup: 'warm',
  techniques: 'tech',
  strength: 'strength',
  fun_and_games: 'fun',
}

export function newBankId(blockType: BlockType, now = Date.now(), random = Math.random): string {
  const tail = Math.floor(random() * 36 ** 4).toString(36).padStart(4, '0')
  return `${PREFIX[blockType]}-egen-${now.toString(36)}${tail}`
}

export interface PendingExtra {
  tags?: string[]
  difficulty?: Difficulty
  needs_coach_review?: boolean
}

/** The row a new exercise becomes: pending, visual 'own', redskap only on Teknik. updated_by is stamped by the database. */
export function pendingRow(patch: BankPatch, extra: PendingExtra = {}, id = newBankId(patch.block_type)) {
  const teknik = patch.block_type === 'techniques'
  return {
    ...patch,
    id,
    status: 'pending' as const,
    visual_key: 'own',
    safety_line: patch.block_type === 'gathering' ? patch.safety_line : patch.safety_line?.trim() || null,
    default_station_equipment: teknik && patch.default_station_equipment?.length ? patch.default_station_equipment : null,
    tags: (extra.tags ?? []).filter((t) => t !== 'egen').slice(0, 8),
    ...(extra.difficulty ? { difficulty: extra.difficulty } : {}),
    needs_coach_review: extra.needs_coach_review ?? false,
  }
}

/**
 * Slice 47 D2: «Spara och skicka till granskning» / import — one new pending row. A clash on the id
 * (Postgres 23505) retries once with a new id, then 'exists'. Offline → 'offline', nothing queued.
 */
export async function insertPendingRow(patch: BankPatch, extra?: PendingExtra, reload = true): Promise<WriteResult | 'exists'> {
  if (offline()) return 'offline'
  const pending = getAdminClient()
  if (!pending) return 'failed'
  try {
    const client = await pending
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await client
        .from('exercises')
        .insert(pendingRow(patch, extra))
        .select('id')
        .abortSignal(AbortSignal.timeout(ADMIN_TIMEOUT_MS))
      if (!error) {
        if (reload) await loadAdminBank()
        return 'ok'
      }
      if (error.code !== '23505') return 'failed'
    }
    return 'exists'
  } catch {
    return 'failed'
  }
}

/** Slice 47 F1: an imported drill → the bank columns (file id, links and the 'egen' tag are dropped). */
export function activityPatch(a: Activity): { patch: BankPatch; extra: PendingExtra } {
  return {
    patch: {
      title: a.title,
      block_type: a.blockType,
      duration_minutes_default: a.durationMinutesDefault,
      summary: a.summary,
      how_to: a.howTo,
      watch_for: a.watchFor,
      safety_line: a.safetyLine?.trim() || null,
      default_station_equipment: a.defaultStationEquipment ?? null,
      source: a.source ?? null,
      experienced_coach_only: a.experiencedCoachOnly === true,
    },
    extra: { tags: a.tags, difficulty: a.difficulty, needs_coach_review: a.needsCoachReview === true },
  }
}

/** «Importera {n} övningar»: one pending row each, in order; stops at the first failure. */
export async function importPendingRows(list: readonly Activity[]): Promise<{ count: number; result: WriteResult | 'exists' }> {
  let count = 0
  let result: WriteResult | 'exists' = 'ok'
  for (const a of list) {
    const { patch, extra } = activityPatch(a)
    result = await insertPendingRow(patch, extra, false)
    if (result !== 'ok') break
    count += 1
  }
  if (count > 0) await loadAdminBank()
  return { count, result }
}

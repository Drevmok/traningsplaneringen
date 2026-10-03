/**
 * Slice 31 — one row of public.exercises (snake_case, slice-31/content/schema-31.sql)
 * ↔ the app's Activity. The same guards as own exercises / import: unknown redskap
 * dropped, https-only Källa, 1–4 steps, Säkerhet required off Samling, length limits.
 * Text is kept verbatim so a bank row equals the bundled seed (+ safetyLine).
 */
import { BLOCK_ORDER } from '../data/blockMeta'
import { sanitizeStationEquipment } from '../data/equipmentPieces'
import type { Activity, ActivitySource, BlockType, Difficulty, StationEquipmentSlot } from '../types'
import { parseHowLines, sanitizeLinkId } from './ownActivities'
import { sanitizeSource } from './source'

export type BankStatusValue = 'published' | 'hidden'
/** Slice 32 — 'pending' rows reach admins only (RLS), never a coach device. */
export type BankRowStatus = BankStatusValue | 'pending'

export interface BankRow {
  id: string
  block_type: BlockType
  title: string
  duration_minutes_default: number
  summary: string
  how_to: string
  watch_for: string
  watch_for_required: boolean
  safety_line: string | null
  visual_key: string
  difficulty: Difficulty
  tags: string[]
  default_station_equipment: StationEquipmentSlot[] | null
  legacy_equipment: string[] | null
  progression_of: string | null
  regression_of: string | null
  experienced_coach_only: boolean
  new_coach_ok: boolean
  needs_coach_review: boolean
  source: ActivitySource | null
  status: BankStatusValue | 'pending'
  sort_order: number
}

/** Columns the app asks for (no created_at / updated_by). */
export const BANK_EXERCISE_COLUMNS = [
  'id',
  'block_type',
  'title',
  'duration_minutes_default',
  'summary',
  'how_to',
  'watch_for',
  'watch_for_required',
  'safety_line',
  'visual_key',
  'difficulty',
  'tags',
  'default_station_equipment',
  'legacy_equipment',
  'progression_of',
  'regression_of',
  'experienced_coach_only',
  'new_coach_ok',
  'needs_coach_review',
  'source',
  'status',
  'sort_order',
] as const

export const BANK_LIMITS = {
  title: 80,
  summary: 240,
  howTo: 800,
  watchFor: 240,
  safety: 240,
  visualKey: 60,
  tags: 8,
  tag: 24,
  steps: 4,
  minutesMax: 180,
} as const

const ID_RE = /^(gather|warm|tech|strength|fun)-[a-z0-9-]{2,60}$/
const DIFFICULTIES: readonly Difficulty[] = ['intro', 'easy', 'medium', 'hard']

export interface BankEntry {
  activity: Activity
  status: BankRowStatus
  sortOrder: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (!t || t.length > max) return null
  return value
}

/** Strings only, trimmed, deduped, ≤8 (each ≤24). Verbatim otherwise — no `egen`. */
export function sanitizeBankTags(raw: unknown): string[] {
  const out: string[] = []
  if (!Array.isArray(raw)) return out
  for (const entry of raw) {
    if (typeof entry !== 'string') continue
    const tag = entry.trim()
    if (!tag || tag.length > BANK_LIMITS.tag || out.includes(tag)) continue
    if (out.length >= BANK_LIMITS.tags) break
    out.push(tag)
  }
  return out
}

function reject(id: unknown, why: string): null {
  if (typeof console !== 'undefined') {
    console.warn(`bank: skipped ${typeof id === 'string' ? id : '?'} (${why})`)
  }
  return null
}

/**
 * A valid published/hidden row → Activity, else null (+ console.warn with the id).
 * `allowPending` is for the admin list only (Slice 32); the coach path never sets it.
 */
export function rowToEntry(raw: unknown, options?: { allowPending?: boolean }): BankEntry | null {
  // An options object (not a bare boolean) so `rows.map(rowToEntry)` can never switch pending on via the index.
  const allowPending = typeof options === 'object' && options !== null && options.allowPending === true
  if (!isRecord(raw)) return reject(undefined, 'not an object')
  const id = raw.id
  if (typeof id !== 'string' || !ID_RE.test(id)) return reject(id, 'id')
  const status = raw.status
  if (status !== 'published' && status !== 'hidden' && !(allowPending && status === 'pending')) return reject(id, 'status')
  const blockType = raw.block_type as BlockType
  if (!BLOCK_ORDER.includes(blockType)) return reject(id, 'block')
  const title = text(raw.title, BANK_LIMITS.title)
  const summary = text(raw.summary, BANK_LIMITS.summary)
  const howTo = text(raw.how_to, BANK_LIMITS.howTo)
  const watchFor = text(raw.watch_for, BANK_LIMITS.watchFor)
  const visualKey = text(raw.visual_key, BANK_LIMITS.visualKey)
  if (!title || !summary || !howTo || !watchFor || !visualKey) return reject(id, 'text')
  const steps = parseHowLines(howTo).length
  if (steps < 1 || steps > BANK_LIMITS.steps) return reject(id, 'steps')
  const minutes = raw.duration_minutes_default
  if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 1 || minutes > BANK_LIMITS.minutesMax) {
    return reject(id, 'minutes')
  }
  let safetyLine: string | undefined
  if (raw.safety_line !== null && raw.safety_line !== undefined) {
    const s = text(raw.safety_line, BANK_LIMITS.safety)
    if (!s) return reject(id, 'safety')
    safetyLine = s
  }
  if (blockType !== 'gathering' && !safetyLine) return reject(id, 'safety')

  const activity: Activity = {
    id,
    title,
    blockType,
    durationMinutesDefault: minutes,
    difficulty: DIFFICULTIES.includes(raw.difficulty as Difficulty) ? (raw.difficulty as Difficulty) : 'easy',
    tags: sanitizeBankTags(raw.tags),
    summary,
    howTo,
    watchFor,
    watchForRequired: raw.watch_for_required !== false,
    visualKey,
    stub: false,
    newCoachOk: raw.new_coach_ok === true,
    experiencedCoachOnly: raw.experienced_coach_only === true,
  }
  if (raw.needs_coach_review === true) activity.needsCoachReview = true
  if (blockType === 'techniques') {
    const slots = sanitizeStationEquipment(raw.default_station_equipment)
    if (slots && slots.length > 0) activity.defaultStationEquipment = slots
  }
  const progressionOf = sanitizeLinkId(raw.progression_of)
  if (progressionOf) activity.progressionOf = progressionOf
  const regressionOf = sanitizeLinkId(raw.regression_of)
  if (regressionOf) activity.regressionOf = regressionOf
  const source = sanitizeSource(raw.source)
  if (source) activity.source = source
  if (Array.isArray(raw.legacy_equipment)) {
    activity.equipment = raw.legacy_equipment.filter((e): e is string => typeof e === 'string')
  }
  if (safetyLine) activity.safetyLine = safetyLine

  const sortOrder = typeof raw.sort_order === 'number' && Number.isFinite(raw.sort_order) ? raw.sort_order : 10000
  return { activity, status, sortOrder }
}

export function rowToActivity(raw: unknown): Activity | null {
  return rowToEntry(raw)?.activity ?? null
}

export const BANK_ID_RE = ID_RE

/**
 * Activity → row. Used by tools/bank/export-seed.ts (bank-seed.sql), the parity test,
 * and to re-check the device cache with the same guard as a fresh fetch.
 */
export function activityToBankRow(
  a: Activity,
  index: number,
  safetyLine: string | null,
  status: BankRowStatus = 'published',
): BankRow {
  return {
    id: a.id,
    block_type: a.blockType,
    title: a.title,
    duration_minutes_default: a.durationMinutesDefault,
    summary: a.summary,
    how_to: a.howTo,
    watch_for: a.watchFor,
    watch_for_required: a.watchForRequired,
    safety_line: safetyLine,
    visual_key: a.visualKey,
    difficulty: a.difficulty,
    tags: a.tags,
    default_station_equipment: a.defaultStationEquipment ?? null,
    legacy_equipment: a.equipment ?? null,
    progression_of: a.progressionOf ?? null,
    regression_of: a.regressionOf ?? null,
    experienced_coach_only: a.experiencedCoachOnly ?? false,
    new_coach_ok: a.newCoachOk ?? false,
    needs_coach_review: a.needsCoachReview ?? false,
    source: a.source ?? null,
    status,
    sort_order: (index + 1) * 10,
  }
}

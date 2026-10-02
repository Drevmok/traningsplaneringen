import { BLOCK_ORDER } from '../data/blockMeta'
import { isKnownPieceId } from '../data/equipmentPieces'
import { seedActivities } from '../data/seedActivities'
import { bankActivityIds, listBankActivities } from './bank'
import type { Activity, ActivitySource, BlockType } from '../types'
import {
  MAX_OWN,
  OWN_LIMITS,
  importOwnActivities,
  loadOwnActivities,
  normalizeHowTo,
  parseHowLines,
  sanitizeLinkId,
  sanitizeOwnActivity,
} from './ownActivities'
import { sanitizeSource } from './source'

/** Schema v1 envelope (slice-30/content/import-schema.md). */
export const EXERCISE_FORMAT = 'traningsplaneraren.ovningar'
export const EXERCISE_SCHEMA_VERSION = 1

const ID_RE = /^own-[a-z0-9-]{3,60}$/

export type ImportFailure = 'bad' | 'newer' | 'empty' | 'isPass'
export type RowState = 'new' | 'sameName' | 'exists' | 'invalid' | 'noRoom'
export type RowChoice = 'include' | 'skip' | 'replace'
export type MissingField = 'namn' | 'varför' | 'så gör du' | 'se upp för' | 'säkerhet'

export type RowNote =
  | { kind: 'clipped' }
  | { kind: 'steps' }
  | { kind: 'unknownPiece'; pieces: string[] }
  | { kind: 'notTeknik' }
  | { kind: 'link' }
  | { kind: 'source' }
  | { kind: 'dupId' }
  | { kind: 'badFormat' }
  | { kind: 'missing'; fields: MissingField[] }

export interface ImportRow {
  /** Position in the file — stable React key and choice index. */
  index: number
  title: string
  blockType?: BlockType
  minutes?: number
  /** Sanitized own drill; null when the row cannot be imported. */
  activity: Activity | null
  /** State from the file alone. `noRoom` is applied later by `resolveRows`. */
  state: Exclude<RowState, 'noRoom'>
  notes: RowNote[]
  defaultChoice: RowChoice
}

export type ParseResult =
  | { ok: false; reason: ImportFailure }
  | { ok: true; batchNote?: string; rows: ImportRow[]; room: number }

export interface ImportContext {
  own: readonly Activity[]
  seeds: readonly Activity[]
}

/** Accepts a raw JSON paste or a ```json block copied from a chat. */
export function stripFence(text: string): string {
  const trimmed = text.trim()
  const fenced = /^```[a-zA-Z]*[^\S\n]*\n([\s\S]*?)\n?```\s*$/.exec(trimmed)
  return fenced ? fenced[1].trim() : trimmed
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(stripFence(text)) as unknown
  } catch {
    return undefined
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Home → Hämta ett pass uses this to point at Bibliotek instead of failing. */
export function isExerciseFile(text: string): boolean {
  const data = parseJson(text)
  return isRecord(data) && data.format === EXERCISE_FORMAT
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function joinNote(rows: RowNote[], note: RowNote): void {
  if (!rows.some((n) => n.kind === note.kind)) rows.push(note)
}

interface RowDraft {
  activity: Activity | null
  notes: RowNote[]
  title: string
  blockType?: BlockType
  minutes?: number
  invalid: boolean
}

function readRow(raw: unknown, knownIds: ReadonlySet<string>): RowDraft {
  const notes: RowNote[] = []
  if (!isRecord(raw)) {
    return { activity: null, notes: [{ kind: 'badFormat' }], title: '', invalid: true }
  }
  const title = str(raw.title)
  const blockType = BLOCK_ORDER.includes(raw.blockType as BlockType)
    ? (raw.blockType as BlockType)
    : undefined
  const minutesRaw = raw.durationMinutesDefault
  const minutes =
    typeof minutesRaw === 'number' && Number.isFinite(minutesRaw) ? minutesRaw : undefined
  const id = typeof raw.id === 'string' ? raw.id : ''

  let badFormat = !ID_RE.test(id) || !blockType || minutes === undefined
  const missing: MissingField[] = []
  if (!title) missing.push('namn')
  if (!str(raw.summary)) missing.push('varför')
  const steps = parseHowLines(typeof raw.howTo === 'string' ? raw.howTo : '')
  if (typeof raw.howTo !== 'string' && raw.howTo !== undefined) badFormat = true
  if (steps.length === 0) missing.push('så gör du')
  if (!str(raw.watchFor)) missing.push('se upp för')
  if (blockType !== 'gathering' && !str(raw.safetyLine)) missing.push('säkerhet')

  const shown = {
    title: title.slice(0, OWN_LIMITS.title),
    blockType,
    minutes,
  }
  if (badFormat || missing.length > 0) {
    if (badFormat) notes.push({ kind: 'badFormat' })
    if (missing.length > 0) notes.push({ kind: 'missing', fields: missing })
    return { activity: null, notes, invalid: true, ...shown }
  }

  if (steps.length > OWN_LIMITS.steps) notes.push({ kind: 'steps' })
  const clipped =
    title.length > OWN_LIMITS.title ||
    str(raw.summary).length > OWN_LIMITS.text ||
    str(raw.watchFor).length > OWN_LIMITS.text ||
    str(raw.safetyLine).length > OWN_LIMITS.text ||
    steps.slice(0, OWN_LIMITS.steps).some((step) => step.length > OWN_LIMITS.step)
  if (clipped) notes.push({ kind: 'clipped' })

  const equipment = Array.isArray(raw.defaultStationEquipment)
    ? raw.defaultStationEquipment
    : []
  if (equipment.length > 0 && blockType !== 'techniques') {
    notes.push({ kind: 'notTeknik' })
  } else if (equipment.length > 0) {
    const unknown = equipment
      .map((slot) => (isRecord(slot) ? slot.pieceId : undefined))
      .filter((pieceId) => typeof pieceId !== 'string' || !isKnownPieceId(pieceId))
      .map((pieceId) => String(pieceId))
    if (unknown.length > 0) {
      notes.push({ kind: 'unknownPiece', pieces: [...new Set(unknown)] })
    }
  }

  const links: Record<'progressionOf' | 'regressionOf', string | undefined> = {
    progressionOf: undefined,
    regressionOf: undefined,
  }
  for (const key of ['progressionOf', 'regressionOf'] as const) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === '') continue
    const target = sanitizeLinkId(raw[key])
    if (target && target !== id && knownIds.has(target)) links[key] = target
    else joinNote(notes, { kind: 'link' })
  }

  let source: ActivitySource | undefined
  if (raw.source !== undefined && raw.source !== null) {
    source = sanitizeSource(raw.source)
    if (!source) notes.push({ kind: 'source' })
  }

  const activity = sanitizeOwnActivity({
    id,
    title,
    blockType,
    durationMinutesDefault: minutes,
    summary: str(raw.summary),
    howTo: normalizeHowTo(raw.howTo as string),
    watchFor: str(raw.watchFor),
    safetyLine: str(raw.safetyLine),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : undefined,
    difficulty: raw.difficulty as Activity['difficulty'],
    defaultStationEquipment:
      blockType === 'techniques'
        ? (equipment as Activity['defaultStationEquipment'])
        : undefined,
    progressionOf: links.progressionOf,
    regressionOf: links.regressionOf,
    // Imports start unreviewed unless the file says otherwise.
    needsCoachReview: typeof raw.needsCoachReview === 'boolean' ? raw.needsCoachReview : true,
    experiencedCoachOnly: raw.experiencedCoachOnly === true,
    source,
  })
  if (!activity) {
    return { activity: null, notes: [{ kind: 'badFormat' }], invalid: true, ...shown }
  }
  return { activity, notes, invalid: false, ...shown }
}

/** Nothing is written here. Rows carry sanitized drills + what the preview should say. */
export function parseExerciseFile(text: string, context?: ImportContext): ParseResult {
  const data = parseJson(text)
  if (!isRecord(data)) return { ok: false, reason: 'bad' }
  if (Array.isArray(data.blocks)) return { ok: false, reason: 'isPass' }
  if (data.format !== EXERCISE_FORMAT) return { ok: false, reason: 'bad' }
  const version = data.schemaVersion
  if (typeof version === 'number' && version > EXERCISE_SCHEMA_VERSION) {
    return { ok: false, reason: 'newer' }
  }
  if (version !== EXERCISE_SCHEMA_VERSION) return { ok: false, reason: 'bad' }
  const list = data.exercises
  if (!Array.isArray(list) || list.length === 0) return { ok: false, reason: 'empty' }

  const own = context?.own ?? loadOwnActivities()
  const seeds = context?.seeds ?? listBankActivities()
  const ownIds = new Set(own.map((a) => a.id))
  const titles = new Set([...own, ...seeds].map((a) => a.title.trim().toLowerCase()))
  const fileIds = new Set(
    list
      .map((entry) => (isRecord(entry) && typeof entry.id === 'string' ? entry.id : ''))
      .filter((id) => ID_RE.test(id)),
  )
  // Links may point at any resolvable exercise, hidden bank rows included.
  const knownIds = new Set([...seeds.map((a) => a.id), ...bankActivityIds(), ...ownIds, ...fileIds])

  const seen = new Set<string>()
  const rows: ImportRow[] = list.slice(0, MAX_OWN * 2).map((entry, index) => {
    const id = isRecord(entry) && typeof entry.id === 'string' ? entry.id : ''
    const dup = id !== '' && seen.has(id)
    if (id) seen.add(id)
    const row = readRow(entry, knownIds)
    if (dup) {
      return {
        index,
        title: row.title,
        blockType: row.blockType,
        minutes: row.minutes,
        activity: null,
        state: 'invalid',
        notes: [{ kind: 'dupId' }],
        defaultChoice: 'skip',
      }
    }
    if (row.invalid || !row.activity) {
      return {
        index,
        title: row.title,
        blockType: row.blockType,
        minutes: row.minutes,
        activity: null,
        state: 'invalid',
        notes: row.notes,
        defaultChoice: 'skip',
      }
    }
    const exists = ownIds.has(row.activity.id)
    const sameName = !exists && titles.has(row.activity.title.toLowerCase())
    return {
      index,
      title: row.activity.title,
      blockType: row.activity.blockType,
      minutes: row.activity.durationMinutesDefault,
      activity: row.activity,
      state: exists ? 'exists' : sameName ? 'sameName' : 'new',
      notes: row.notes,
      defaultChoice: exists ? 'skip' : 'include',
    }
  })

  const batchNote = str(data.batchNote).slice(0, OWN_LIMITS.text)
  return {
    ok: true,
    ...(batchNote ? { batchNote } : {}),
    rows,
    room: Math.max(0, MAX_OWN - own.length),
  }
}

export interface ResolvedRow extends Omit<ImportRow, 'state'> {
  state: RowState
  choice: RowChoice
  /** Choice control is locked (invalid or no room left). */
  locked: boolean
}

/**
 * Applies the coach's choices and the room left. New rows use up room in
 * file order; once it is gone the rest are `Ingen plats` and locked off.
 * Ersätt never needs room.
 */
export function resolveRows(
  rows: readonly ImportRow[],
  choices: ReadonlyMap<number, RowChoice>,
  room: number,
): ResolvedRow[] {
  let left = room
  return rows.map((row) => {
    const wanted = choices.get(row.index) ?? row.defaultChoice
    if (row.state === 'invalid') return { ...row, choice: 'skip', locked: true }
    if (row.state === 'exists') {
      const choice: RowChoice = wanted === 'replace' ? 'replace' : 'skip'
      return { ...row, choice, locked: false }
    }
    if (wanted !== 'include') return { ...row, choice: 'skip', locked: false }
    if (left <= 0) return { ...row, state: 'noRoom', choice: 'skip', locked: true }
    left -= 1
    return { ...row, choice: 'include', locked: false }
  })
}

export function chosenCount(rows: readonly ResolvedRow[]): number {
  return rows.filter((row) => row.choice !== 'skip' && row.activity).length
}

/** The one write. Links to rows that were not taken (and do not exist) are dropped. */
export function applyImport(rows: readonly ResolvedRow[]): { ok: boolean; count: number } {
  const chosen = rows
    .filter((row) => row.choice !== 'skip' && row.activity)
    .map((row) => row.activity as Activity)
  if (chosen.length === 0) return { ok: false, count: 0 }
  const resolvable = new Set([
    ...bankActivityIds(),
    ...seedActivities.map((a) => a.id),
    ...loadOwnActivities().map((a) => a.id),
    ...chosen.map((a) => a.id),
  ])
  const clean = chosen.map((activity) => {
    const copy = { ...activity }
    if (copy.progressionOf && !resolvable.has(copy.progressionOf)) delete copy.progressionOf
    if (copy.regressionOf && !resolvable.has(copy.regressionOf)) delete copy.regressionOf
    return copy
  })
  const result = importOwnActivities(clean)
  return result.ok ? { ok: true, count: chosen.length } : { ok: false, count: 0 }
}

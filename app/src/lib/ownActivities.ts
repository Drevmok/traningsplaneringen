import { BLOCK_ORDER, ITEM_MINUTES_MAX } from '../data/blockMeta'
import { sanitizeStationEquipment } from '../data/equipmentPieces'
import type {
  Activity,
  ActivitySource,
  BlockType,
  Difficulty,
  Session,
  StationEquipmentSlot,
} from '../types'
import { sanitizeSource } from './source'

const KEY = 'gymnastics-planner-own-activities-v1'
/** E1 — room for several imported videos. */
export const MAX_OWN = 100

/** One set of limits for the form, storage, share links and import. */
export const OWN_LIMITS = {
  title: 80,
  text: 240,
  step: 180,
  steps: 4,
  tags: 8,
  tag: 24,
  link: 80,
} as const

const DIFFICULTIES: readonly Difficulty[] = ['intro', 'easy', 'medium', 'hard']

export type OwnIssue = 'title' | 'why' | 'how' | 'how-too-long' | 'watch' | 'safety'

export interface OwnDraft {
  title: string
  blockType: BlockType
  durationMinutes: number
  summary: string
  howText: string
  watchFor: string
  safety: string
  /** Redskap förslag. Saved only when the block is Teknik. */
  equipment: StationEquipmentSlot[]
}

export interface ShareOwn {
  id: string
  title: string
  blockType: BlockType
  durationMinutesDefault: number
  summary: string
  howTo: string
  watchFor: string
  safetyLine?: string
  /** Slice 30 — all optional so older links still parse. */
  tags?: string[]
  difficulty?: Difficulty
  defaultStationEquipment?: StationEquipmentSlot[]
  progressionOf?: string
  regressionOf?: string
  needsCoachReview?: boolean
  experiencedCoachOnly?: boolean
  source?: ActivitySource
}

export type SaveOwnResult =
  | { ok: true; activity: Activity }
  | { ok: false; reason: 'invalid' | 'full' }

let cache: Activity[] | null = null
let ephemeral: Activity[] = []

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function clip(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) return 5
  return Math.max(1, Math.min(ITEM_MINUTES_MAX, Math.round(value)))
}

export function parseHowLines(howText: string): string[] {
  return howText
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean)
}

export function ownActivityIssues(draft: OwnDraft): OwnIssue[] {
  const issues: OwnIssue[] = []
  if (!draft.title.trim()) issues.push('title')
  if (!draft.summary.trim()) issues.push('why')
  const steps = parseHowLines(draft.howText)
  if (steps.length === 0) issues.push('how')
  else if (steps.length > 4) issues.push('how-too-long')
  if (!draft.watchFor.trim()) issues.push('watch')
  if (draft.blockType !== 'gathering' && !draft.safety.trim()) issues.push('safety')
  return issues
}

/** Lower-case, trimmed, deduped, at most 8 (each ≤24). `egen` is always added. */
export function sanitizeTags(raw: unknown): string[] {
  const out: string[] = []
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry !== 'string') continue
      const tag = entry.trim().toLowerCase().slice(0, OWN_LIMITS.tag)
      if (!tag || tag === 'egen' || out.includes(tag)) continue
      if (out.length >= OWN_LIMITS.tags) break
      out.push(tag)
    }
  }
  return [...out, 'egen']
}

export function sanitizeDifficulty(raw: unknown): Difficulty {
  return DIFFICULTIES.includes(raw as Difficulty) ? (raw as Difficulty) : 'easy'
}

/** Redskap förslag live on Teknik drills only. Unknown pieces are dropped. */
export function sanitizeOwnEquipment(
  blockType: BlockType,
  raw: unknown,
): StationEquipmentSlot[] | undefined {
  if (blockType !== 'techniques') return undefined
  const slots = sanitizeStationEquipment(raw)
  return slots && slots.length > 0 ? slots : undefined
}

export function sanitizeLinkId(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const id = raw.trim()
  if (!id || id.length > OWN_LIMITS.link || !/^[a-z0-9-]+$/.test(id)) return undefined
  return id
}

/** "1. …\n2. …" with at most four steps, each ≤180. */
export function normalizeHowTo(howText: string): string {
  return parseHowLines(howText)
    .slice(0, OWN_LIMITS.steps)
    .map((line, index) => `${index + 1}. ${clip(line, OWN_LIMITS.step)}`)
    .join('\n')
}

type HiddenFields = Pick<
  Activity,
  | 'tags'
  | 'difficulty'
  | 'progressionOf'
  | 'regressionOf'
  | 'needsCoachReview'
  | 'experiencedCoachOnly'
  | 'source'
>

/** Fields the own form does not show. Shared by storage, share links and import. */
function hiddenFields(raw: Partial<Activity>): HiddenFields {
  const fields: HiddenFields = {
    tags: sanitizeTags(raw.tags),
    difficulty: sanitizeDifficulty(raw.difficulty),
    experiencedCoachOnly: raw.experiencedCoachOnly === true,
  }
  const progressionOf = sanitizeLinkId(raw.progressionOf)
  if (progressionOf) fields.progressionOf = progressionOf
  const regressionOf = sanitizeLinkId(raw.regressionOf)
  if (regressionOf) fields.regressionOf = regressionOf
  if (raw.needsCoachReview === true) fields.needsCoachReview = true
  const source = sanitizeSource(raw.source)
  if (source) fields.source = source
  return fields
}

/** The one sanitizer for own drills (storage, share links, import). */
export function sanitizeOwnActivity(raw: Partial<Activity> | null | undefined): Activity | null {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.id !== 'string' || !raw.id.startsWith('own-')) return null
  if (!BLOCK_ORDER.includes(raw.blockType as BlockType)) return null
  const blockType = raw.blockType as BlockType
  const title = clip(raw.title, OWN_LIMITS.title)
  if (!title) return null
  const activity: Activity = {
    id: raw.id,
    title,
    blockType,
    durationMinutesDefault: clampMinutes(raw.durationMinutesDefault ?? 5),
    summary: clip(raw.summary, OWN_LIMITS.text),
    howTo: clip(raw.howTo, 800),
    watchFor: clip(raw.watchFor, OWN_LIMITS.text),
    watchForRequired: true,
    visualKey: 'own',
    own: true,
    newCoachOk: true,
    stub: false,
    ...hiddenFields(raw),
  }
  const safety = clip(raw.safetyLine, OWN_LIMITS.text)
  if (safety) activity.safetyLine = safety
  const equipment = sanitizeOwnEquipment(blockType, raw.defaultStationEquipment)
  if (equipment) activity.defaultStationEquipment = equipment
  return activity
}

const asActivity = sanitizeOwnActivity

function readStored(): Activity[] {
  const box = storage()
  if (!box) return []
  try {
    const raw = box.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => asActivity(item as Partial<Activity>))
      .filter((item): item is Activity => Boolean(item))
      .slice(0, MAX_OWN)
  } catch {
    return []
  }
}

export function loadOwnActivities(): Activity[] {
  if (cache) return cache
  cache = readStored()
  return cache
}

function write(list: Activity[]): void {
  cache = list.slice(0, MAX_OWN)
  const box = storage()
  if (!box) return
  try {
    box.setItem(KEY, JSON.stringify(cache))
  } catch {
    // The list still works for this page view.
  }
}

export function clearOwnActivities(): void {
  write([])
  ephemeral = []
}

function newId(): string {
  return `own-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Form fields from the draft; hidden fields kept from the drill being edited. */
function build(draft: OwnDraft, id: string, base?: Activity): Activity {
  const activity = asActivity({
    ...(base ?? {}),
    id,
    title: draft.title,
    blockType: draft.blockType,
    durationMinutesDefault: draft.durationMinutes,
    summary: draft.summary,
    howTo: normalizeHowTo(draft.howText),
    watchFor: draft.watchFor,
    safetyLine: draft.safety,
    defaultStationEquipment: draft.equipment,
    // D1 — saving an edit counts as reviewed.
    needsCoachReview: false,
  })
  if (!activity) throw new Error('own drill failed its own sanitizer')
  return activity
}

export function saveOwnActivity(draft: OwnDraft, existingId?: string): SaveOwnResult {
  if (ownActivityIssues(draft).length > 0) return { ok: false, reason: 'invalid' }
  if (!BLOCK_ORDER.includes(draft.blockType)) return { ok: false, reason: 'invalid' }
  const current = loadOwnActivities()
  const existing =
    existingId && existingId.startsWith('own-')
      ? current.find((item) => item.id === existingId)
      : undefined
  if (!existing && current.length >= MAX_OWN) return { ok: false, reason: 'full' }
  const activity = build(draft, existing?.id ?? newId(), existing)
  const next = existing
    ? current.map((item) => (item.id === existing.id ? activity : item))
    : [activity, ...current]
  write(next)
  return { ok: true, activity }
}

/** D1 — clears Behöver granskas. Returns the updated list. */
export function markOwnReviewed(id: string): Activity[] {
  const current = loadOwnActivities()
  if (!current.some((item) => item.id === id && item.needsCoachReview)) return current
  const next = current.map((item) => {
    if (item.id !== id) return item
    const copy = { ...item }
    delete copy.needsCoachReview
    return copy
  })
  write(next)
  return next
}

export type ImportOwnResult =
  | { ok: true; added: number; replaced: number; list: Activity[] }
  | { ok: false; reason: 'full' }

/**
 * One write for a whole import. Activities whose id already exists replace
 * that drill in place (same id, so passes using it get the new text); the
 * rest are added on top in file order.
 */
export function importOwnActivities(incoming: readonly Activity[]): ImportOwnResult {
  const current = loadOwnActivities()
  const clean = incoming
    .map((item) => asActivity(item))
    .filter((item): item is Activity => Boolean(item))
  const byId = new Map(clean.map((item) => [item.id, item]))
  const known = new Set(current.map((item) => item.id))
  const added = [...byId.values()].filter((item) => !known.has(item.id))
  if (current.length + added.length > MAX_OWN) return { ok: false, reason: 'full' }
  const replacedList = current.map((item) => byId.get(item.id) ?? item)
  const replaced = current.filter((item) => byId.has(item.id)).length
  const next = [...added, ...replacedList]
  write(next)
  return { ok: true, added: added.length, replaced, list: next }
}

export function deleteOwnActivity(id: string): Activity[] {
  const next = loadOwnActivities().filter((item) => item.id !== id)
  write(next)
  return next
}

export function findOwnActivity(id: string): Activity | undefined {
  return loadOwnActivities().find((item) => item.id === id) ?? ephemeral.find((item) => item.id === id)
}

export function setEphemeralOwn(list: Activity[]): void {
  ephemeral = list
}

export function activitiesFromShareOwn(raw: unknown): Activity[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => asActivity(item as Partial<Activity>))
    .filter((item): item is Activity => Boolean(item))
    .slice(0, MAX_OWN)
}

export function activityToShareOwn(activity: Activity): ShareOwn {
  return {
    id: activity.id,
    title: activity.title,
    blockType: activity.blockType,
    durationMinutesDefault: activity.durationMinutesDefault,
    summary: activity.summary,
    howTo: activity.howTo,
    watchFor: activity.watchFor,
    ...(activity.safetyLine ? { safetyLine: activity.safetyLine } : {}),
    ...(activity.tags.some((tag) => tag !== 'egen') ? { tags: activity.tags } : {}),
    ...(activity.difficulty !== 'easy' ? { difficulty: activity.difficulty } : {}),
    ...(activity.defaultStationEquipment?.length
      ? { defaultStationEquipment: activity.defaultStationEquipment }
      : {}),
    ...(activity.progressionOf ? { progressionOf: activity.progressionOf } : {}),
    ...(activity.regressionOf ? { regressionOf: activity.regressionOf } : {}),
    ...(activity.needsCoachReview ? { needsCoachReview: true } : {}),
    ...(activity.experiencedCoachOnly ? { experiencedCoachOnly: true } : {}),
    ...(activity.source ? { source: activity.source } : {}),
  }
}

function idsInSession(session: Session): Set<string> {
  const ids = new Set<string>()
  for (const block of session.blocks) {
    for (const item of block.items) ids.add(item.activityId)
  }
  return ids
}

/** Local catalog first, then drills that arrived with a shared pass and are not saved yet. */
export function ownActivitiesForIds(ids: ReadonlySet<string>): Activity[] {
  const local = loadOwnActivities().filter((item) => ids.has(item.id))
  const known = new Set(local.map((item) => item.id))
  const extra = ephemeral.filter((item) => ids.has(item.id) && !known.has(item.id))
  return [...local, ...extra]
}

/** Copy shared drill text into this browser. Does not replace a drill you already saved. */
export function persistEphemeralOwn(session: Session): void {
  const ids = idsInSession(session)
  const incoming = ephemeral.filter((item) => ids.has(item.id))
  if (incoming.length === 0) return
  const current = loadOwnActivities()
  const known = new Set(current.map((item) => item.id))
  const add = incoming.filter((item) => !known.has(item.id))
  if (add.length === 0) return
  write([...add, ...current])
}

import { BLOCK_ORDER } from '../data/blockMeta'
import type { Activity, BlockType, Session } from '../types'

const KEY = 'gymnastics-planner-own-activities-v1'
const MAX_OWN = 40

export type OwnIssue = 'title' | 'why' | 'how' | 'how-too-long' | 'watch' | 'safety'

export interface OwnDraft {
  title: string
  blockType: BlockType
  durationMinutes: number
  summary: string
  howText: string
  watchFor: string
  safety: string
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
  return Math.max(1, Math.min(60, Math.round(value)))
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

function asActivity(raw: Partial<Activity> | null | undefined): Activity | null {
  if (!raw || typeof raw.id !== 'string' || !raw.id.startsWith('own-')) return null
  if (!BLOCK_ORDER.includes(raw.blockType as BlockType)) return null
  const title = clip(raw.title, 80)
  if (!title) return null
  const activity: Activity = {
    id: raw.id,
    title,
    blockType: raw.blockType as BlockType,
    durationMinutesDefault: clampMinutes(raw.durationMinutesDefault ?? 5),
    summary: clip(raw.summary, 240),
    howTo: clip(raw.howTo, 800),
    watchFor: clip(raw.watchFor, 240),
    watchForRequired: true,
    visualKey: 'own',
    difficulty: 'easy',
    tags: ['egen'],
    own: true,
    newCoachOk: true,
    experiencedCoachOnly: false,
    stub: false,
  }
  const safety = clip(raw.safetyLine, 240)
  if (safety) activity.safetyLine = safety
  return activity
}

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

function build(draft: OwnDraft, id: string): Activity {
  const steps = parseHowLines(draft.howText).slice(0, 4)
  const activity: Activity = {
    id,
    title: clip(draft.title, 80),
    blockType: draft.blockType,
    durationMinutesDefault: clampMinutes(draft.durationMinutes),
    summary: clip(draft.summary, 240),
    howTo: steps.map((line, index) => `${index + 1}. ${clip(line, 180)}`).join('\n'),
    watchFor: clip(draft.watchFor, 240),
    watchForRequired: true,
    visualKey: 'own',
    difficulty: 'easy',
    tags: ['egen'],
    own: true,
    newCoachOk: true,
    experiencedCoachOnly: false,
    stub: false,
  }
  const safety = clip(draft.safety, 240)
  if (safety) activity.safetyLine = safety
  return activity
}

export function saveOwnActivity(draft: OwnDraft, existingId?: string): SaveOwnResult {
  if (ownActivityIssues(draft).length > 0) return { ok: false, reason: 'invalid' }
  if (!BLOCK_ORDER.includes(draft.blockType)) return { ok: false, reason: 'invalid' }
  const current = loadOwnActivities()
  const id =
    existingId && existingId.startsWith('own-') && current.some((item) => item.id === existingId)
      ? existingId
      : newId()
  const updating = current.some((item) => item.id === id)
  if (!updating && current.length >= MAX_OWN) return { ok: false, reason: 'full' }
  const activity = build(draft, id)
  const next = updating
    ? current.map((item) => (item.id === id ? activity : item))
    : [activity, ...current]
  write(next)
  return { ok: true, activity }
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

import type { Session } from '../types'
import { activitiesFromShareOwn, setEphemeralOwn } from './ownActivities'
import { duplicateSession } from './session'
import { sessionToShare, shareToSession, type SharePass } from './sharePass'

const KEY = 'gymnastics-planner-templates-v1'
const MAX_TEMPLATES = 8

export interface SavedTemplate {
  id: string
  title: string
  totalMinutes: number
  savedAt: string
  pass: SharePass
}

export function loadSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedTemplate[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) => item && item.pass?.v === 1 && typeof item.id === 'string',
    )
  } catch {
    return []
  }
}

function writeTemplates(list: SavedTemplate[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function saveSessionAsTemplate(session: Session, title?: string): SavedTemplate {
  const name = (title ?? session.title).trim().slice(0, 80) || 'Mall'
  const next: SavedTemplate = {
    id: `mall-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: name,
    totalMinutes: session.totalMinutes,
    savedAt: new Date().toISOString(),
    pass: sessionToShare(session),
  }
  writeTemplates([next, ...loadSavedTemplates()].slice(0, MAX_TEMPLATES))
  return next
}

/** Same drills and placements, ignoring ids and the title. */
export function passSignature(pass: SharePass): string {
  const blocks = Array.isArray(pass.blocks) ? pass.blocks : []
  const keyOf = new Map<string, string>()
  for (const block of blocks) {
    for (const item of block.items ?? []) {
      keyOf.set(item.id, `${block.type}:${item.order}:${item.activityId}`)
    }
  }
  const slim = blocks.map((block) => ({
    type: block.type,
    items: [...(block.items ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((item) => [
        item.activityId,
        item.durationMinutes,
        item.order,
        JSON.stringify(item.stationEquipment ?? null),
      ]),
  }))
  const places = (pass.hallPlacements ?? [])
    .map((placement) => ({
      k: keyOf.get(placement.sessionItemId) ?? placement.sessionItemId,
      x: Math.round(placement.x * 1000) / 1000,
      y: Math.round(placement.y * 1000) / 1000,
      z: placement.zoneId ?? '',
    }))
    .sort((a, b) => a.k.localeCompare(b.k))
  return JSON.stringify({
    blocks: slim,
    places,
    hall: pass.hallTemplateId ?? '',
  })
}

export function sessionAlreadyArchived(session: Session): boolean {
  const signature = passSignature(sessionToShare(session))
  return loadSavedTemplates().some((item) => passSignature(item.pass) === signature)
}

/** Keep last week as a mall when the drills are not already stored. */
export function archiveSessionIfNew(session: Session): SavedTemplate | null {
  if (sessionAlreadyArchived(session)) return null
  return saveSessionAsTemplate(session)
}

export function startNewWeek(session: Session): { session: Session; archived: boolean } {
  const archived = archiveSessionIfNew(session)
  return { session: duplicateSession(session), archived: Boolean(archived) }
}

export function activityIdInTemplates(activityId: string): boolean {
  return loadSavedTemplates().some((item) =>
    item.pass.blocks?.some((block) =>
      block.items.some((entry) => entry.activityId === activityId),
    ),
  )
}

export function deleteSavedTemplate(id: string): SavedTemplate[] {
  const list = loadSavedTemplates().filter((item) => item.id !== id)
  writeTemplates(list)
  return list
}

export function savedTemplateToSession(template: SavedTemplate): Session {
  setEphemeralOwn(activitiesFromShareOwn(template.pass.own))
  return shareToSession(template.pass)
}

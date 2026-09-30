import { getActivityById } from '../data/seedActivities'
import type { HallZoneId, Session, SessionItem, StationEquipmentSlot } from '../types'
import { getPreset, normalizeTemplateId, placeableItems, pointInZone } from './hall'

/** Strongest apparatus wins. Landing mats alone are not a vault. */
const PIECE_ZONE: ReadonlyArray<readonly [string, HallZoneId]> = [
  ['eq-satsbrada', 'vault'],
  ['eq-trampett', 'trampett'],
  ['eq-tumblingmatta', 'tumbling'],
  ['eq-airtrack', 'tumbling'],
  ['eq-flickiskudde', 'tumbling'],
  ['eq-mattberg', 'mattberg'],
  ['eq-plint', 'open'],
  ['eq-madrass', 'mats'],
  ['eq-landningsmatta', 'mats'],
  ['eq-kon', 'open'],
]

function zoneFromTags(activityId: string): HallZoneId {
  const activity = getActivityById(activityId)
  if (!activity) return 'open'
  const tags = activity.tags ?? []
  if (tags.includes('vault')) return 'vault'
  if (tags.includes('trampett')) return 'trampett'
  if (tags.includes('floor')) {
    const hay = `${activityId} ${activity.title}`.toLowerCase()
    if (/flickis|rondat/.test(hay)) return 'tumbling'
    return 'open'
  }
  return 'open'
}

function zoneFromSlots(slots: StationEquipmentSlot[]): HallZoneId | null {
  for (const [pieceId, zone] of PIECE_ZONE) {
    if (slots.some((slot) => slot.pieceId === pieceId && slot.count > 0)) {
      return zone
    }
  }
  return null
}

/** Zone from saved redskap, otherwise the drill's förslag, otherwise tags. */
export function suggestZoneId(item: Pick<SessionItem, 'activityId' | 'stationEquipment'>): HallZoneId {
  const saved = item.stationEquipment
  if (saved && saved.length > 0) {
    const fromSaved = zoneFromSlots(saved)
    if (fromSaved) return fromSaved
  }
  const suggested = getActivityById(item.activityId)?.defaultStationEquipment
  if (suggested && suggested.length > 0) {
    const fromDefault = zoneFromSlots(suggested)
    if (fromDefault) return fromDefault
  }
  return zoneFromTags(item.activityId)
}

/**
 * Place only the given unplaced Teknik items. Already placed stations stay.
 * Same zone gets the next free slot so chips do not stack.
 */
export function autoPlaceItems(session: Session, itemIds: ReadonlySet<string>): Session {
  if (itemIds.size === 0) return session
  const preset = getPreset(session.hallTemplateId)
  const counts = new Map<HallZoneId, number>()
  for (const placement of session.hallPlacements ?? []) {
    if (!placement.zoneId) continue
    counts.set(placement.zoneId, (counts.get(placement.zoneId) ?? 0) + 1)
  }
  const placed = new Set((session.hallPlacements ?? []).map((p) => p.sessionItemId))
  const additions = []
  for (const item of placeableItems(session)) {
    if (!itemIds.has(item.id) || placed.has(item.id)) continue
    const zoneId = suggestZoneId(item)
    const index = counts.get(zoneId) ?? 0
    counts.set(zoneId, index + 1)
    const point = pointInZone(preset, zoneId, index)
    additions.push({ sessionItemId: item.id, ...point })
  }
  if (additions.length === 0) return session
  return {
    ...session,
    hallTemplateId: normalizeTemplateId(session.hallTemplateId),
    hallPlacements: [...(session.hallPlacements ?? []), ...additions],
  }
}

export function autoPlaceUnplaced(session: Session): Session {
  const ids = new Set(
    placeableItems(session)
      .filter(
        (item) =>
          !(session.hallPlacements ?? []).some((p) => p.sessionItemId === item.id),
      )
      .map((item) => item.id),
  )
  return autoPlaceItems(session, ids)
}

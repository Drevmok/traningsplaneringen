import { EQUIPMENT_PIECES } from '../data/equipmentPieces'
import type { Activity } from '../types'

const KEY = 'gymnastics-planner-owned-equipment-v1'
const TONIGHT_KEY = 'gymnastics-planner-library-tonight-v1'

function allPieceIds(): string[] {
  return EQUIPMENT_PIECES.map((piece) => piece.id)
}

/** Missing key means the hall has the whole catalog. An explicit list can be empty. */
export function loadOwnedEquipment(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return allPieceIds()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return allPieceIds()
    const known = new Set(allPieceIds())
    return parsed.filter((id): id is string => typeof id === 'string' && known.has(id))
  } catch {
    return allPieceIds()
  }
}

export function saveOwnedEquipment(ids: readonly string[]): void {
  const known = new Set(allPieceIds())
  const next = ids.filter((id) => known.has(id))
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function ownsEveryPiece(ids: readonly string[]): boolean {
  const owned = new Set(ids)
  return allPieceIds().every((id) => owned.has(id))
}

/** Drills without redskap always fit. Others need every förslag-piece. */
export function activityFitsOwned(activity: Activity, ownedIds: readonly string[]): boolean {
  const slots = activity.defaultStationEquipment
  if (!slots || slots.length === 0) return true
  const owned = new Set(ownedIds)
  return slots.every((slot) => owned.has(slot.pieceId))
}

export function loadTonightFilter(): boolean | null {
  try {
    const raw = localStorage.getItem(TONIGHT_KEY)
    if (raw === '1') return true
    if (raw === '0') return false
    return null
  } catch {
    return null
  }
}

export function saveTonightFilter(on: boolean): void {
  localStorage.setItem(TONIGHT_KEY, on ? '1' : '0')
}

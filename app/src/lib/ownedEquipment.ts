import { EQUIPMENT_PIECES, LEGACY_PIECE_IDS } from '../data/equipmentPieces'
import type { Activity } from '../types'

const KEY = 'gymnastics-planner-owned-equipment-v1'
/** Slice 30 — catalog ids the coach has already had the chance to untick. */
const SEEN_KEY = 'gymnastics-planner-owned-equipment-seen-v1'
const TONIGHT_KEY = 'gymnastics-planner-library-tonight-v1'

function allPieceIds(): string[] {
  return EQUIPMENT_PIECES.map((piece) => piece.id)
}

/** Lists saved before the seen key existed were saved against the first ten pieces. */
function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (raw === null) return new Set(LEGACY_PIECE_IDS)
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set(LEGACY_PIECE_IDS)
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set(LEGACY_PIECE_IDS)
  }
}

function markAllSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(allPieceIds()))
  } catch {
    // Still works for this page view.
  }
}

/**
 * Missing key means the hall has the whole catalog. An explicit list can be empty.
 * New catalog pieces count as owned once (so "Visa bara övningar vi kan köra
 * ikväll" does not switch itself on); later unticks stick.
 */
export function loadOwnedEquipment(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return allPieceIds()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return allPieceIds()
    const known = new Set(allPieceIds())
    const owned = parsed.filter((id): id is string => typeof id === 'string' && known.has(id))
    const seen = readSeen()
    const unseen = allPieceIds().filter((id) => !seen.has(id))
    if (unseen.length === 0) return owned
    const next = [...owned, ...unseen.filter((id) => !owned.includes(id))]
    localStorage.setItem(KEY, JSON.stringify(next))
    markAllSeen()
    return next
  } catch {
    return allPieceIds()
  }
}

export function saveOwnedEquipment(ids: readonly string[]): void {
  const known = new Set(allPieceIds())
  const next = ids.filter((id) => known.has(id))
  localStorage.setItem(KEY, JSON.stringify(next))
  markAllSeen()
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

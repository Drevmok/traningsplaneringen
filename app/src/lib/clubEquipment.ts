/**
 * Slice 68 (A1) — föreningens tillgängliga redskap.
 * Not filled (no row / no cache) → all 15 available. A filled list (also empty) is the source.
 * Never reads Slice 47 keys.
 */
import { EQUIPMENT_PIECES } from '../data/equipmentPieces'
import { UI } from '../data/blockMeta'
import type { StationEquipmentSlot } from '../types'
import {
  applyClubEquipment,
  getClubEquipment,
  type ClubEquipmentState,
} from './clubEquipmentStore'

export {
  applyClubEquipment,
  CLUB_EQUIPMENT_CACHE_KEY,
  getClubEquipment,
  resetClubEquipmentForTests,
  type ClubEquipmentState,
} from './clubEquipmentStore'

/** Known EQUIPMENT_PIECES ids only, unique, library order. */
export function sanitizePieceIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const want = new Set<string>()
  for (const id of raw) if (typeof id === 'string') want.add(id)
  return EQUIPMENT_PIECES.filter((p) => want.has(p.id)).map((p) => p.id)
}

/**
 * `available` null = not filled → no missing marks.
 * Filled (even empty) → pieces in `slots` that the club does not have, library order.
 */
export function missingClubPieces(
  slots: readonly Pick<StationEquipmentSlot, 'pieceId'>[],
  available: ReadonlySet<string> | null,
): Array<{ pieceId: string; labelSv: string }> {
  if (!available) return []
  const need = new Set(slots.map((s) => s.pieceId))
  const out: Array<{ pieceId: string; labelSv: string }> = []
  for (const p of EQUIPMENT_PIECES) {
    if (need.has(p.id) && !available.has(p.id)) out.push({ pieceId: p.id, labelSv: p.labelSv })
  }
  return out
}

export function clubMissingCopy(
  slots: readonly Pick<StationEquipmentSlot, 'pieceId'>[],
  available: ReadonlySet<string> | null,
): string | undefined {
  const miss = missingClubPieces(slots, available)
  if (!miss[0]) return
  return UI.clubMissingLine.replace('{labels}', miss.map((m) => m.labelSv).join(', '))
}

export function clubAvailableSet(s: ClubEquipmentState = getClubEquipment()): ReadonlySet<string> | null {
  return s.filled ? new Set(sanitizePieceIds(s.ids)) : null
}

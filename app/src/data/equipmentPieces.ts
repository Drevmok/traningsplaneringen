import type { EquipmentPiece, StationEquipmentSlot } from '../types'
import type { IconId } from '../icons/types'

/** Soft caps — phone compose UI stays sane (document in ship notes). */
export const STATION_EQUIPMENT_MAX_SLOTS = 8
export const STATION_EQUIPMENT_MAX_COUNT = 9

/**
 * Fixed Swedish redskap library (Slice 13) — all 10 pieces.
 * Mattberg is ONE catalog piece (not N×matta).
 */
export const EQUIPMENT_PIECES: EquipmentPiece[] = [
  { id: 'eq-trampett', labelSv: 'Trampett', visualKey: 'eq-trampett' },
  { id: 'eq-satsbrada', labelSv: 'Satsbräda', visualKey: 'eq-satsbrada' },
  { id: 'eq-plint', labelSv: 'Plint', visualKey: 'eq-plint' },
  {
    id: 'eq-landningsmatta',
    labelSv: 'Landningsmatta',
    visualKey: 'eq-landningsmatta',
  },
  {
    id: 'eq-tumblingmatta',
    labelSv: 'Tumblingmatta',
    visualKey: 'eq-tumblingmatta',
  },
  { id: 'eq-madrass', labelSv: 'Madrass', visualKey: 'eq-madrass' },
  /** ONE piece — club abstraction, not stacked mattor */
  { id: 'eq-mattberg', labelSv: 'Mattberg', visualKey: 'eq-mattberg' },
  {
    id: 'eq-flickiskudde',
    labelSv: 'Flickiskudde',
    visualKey: 'eq-flickiskudde',
  },
  { id: 'eq-airtrack', labelSv: 'Airtrack', visualKey: 'eq-airtrack' },
  { id: 'eq-kon', labelSv: 'Kon', visualKey: 'eq-kon' },
]

const PIECE_BY_ID = new Map(EQUIPMENT_PIECES.map((p) => [p.id, p]))

/** Map equipment visualKey → existing IconId (reuse Slice 03 icons). */
export const EQUIPMENT_ICON: Record<string, IconId> = {
  'eq-trampett': 'bounce',
  'eq-satsbrada': 'jump-board',
  'eq-plint': 'circuit',
  'eq-landningsmatta': 'pad',
  'eq-tumblingmatta': 'pad',
  'eq-madrass': 'pad',
  'eq-mattberg': 'mats-stack',
  'eq-flickiskudde': 'pad',
  'eq-airtrack': 'fall-back',
  'eq-kon': 'flag',
}

export function getEquipmentPiece(
  pieceId: string,
): EquipmentPiece | undefined {
  return PIECE_BY_ID.get(pieceId)
}

export function isKnownPieceId(pieceId: string): boolean {
  return PIECE_BY_ID.has(pieceId)
}

export function equipmentIconId(visualKey: string | undefined): IconId {
  if (!visualKey) return 'fallback'
  return EQUIPMENT_ICON[visualKey] ?? 'fallback'
}

export function formatEquipmentLabel(
  pieceId: string,
  count: number,
  labels: { one: string; many: string },
): string {
  const piece = getEquipmentPiece(pieceId)
  const label = piece?.labelSv ?? pieceId
  if (count === 1) return labels.one.replace('{label}', label)
  return labels.many
    .replace('{n}', String(count))
    .replace('{label}', label)
}

/**
 * Sanitize persisted / draft slots: drop unknown ids, clamp count,
 * merge duplicate pieceIds (keep first order, sum counts capped).
 */
export function sanitizeStationEquipment(
  raw: unknown,
): StationEquipmentSlot[] | undefined {
  if (raw === undefined || raw === null) return undefined
  if (!Array.isArray(raw)) return undefined

  const out: StationEquipmentSlot[] = []
  const indexById = new Map<string, number>()

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.pieceId !== 'string' || !isKnownPieceId(e.pieceId)) continue
    let count =
      typeof e.count === 'number' && Number.isFinite(e.count)
        ? Math.round(e.count)
        : 1
    if (count < 1) continue
    count = Math.min(STATION_EQUIPMENT_MAX_COUNT, count)

    const existing = indexById.get(e.pieceId)
    if (existing !== undefined) {
      const prev = out[existing]
      out[existing] = {
        pieceId: prev.pieceId,
        count: Math.min(
          STATION_EQUIPMENT_MAX_COUNT,
          prev.count + count,
        ),
      }
      continue
    }
    if (out.length >= STATION_EQUIPMENT_MAX_SLOTS) continue
    indexById.set(e.pieceId, out.length)
    out.push({ pieceId: e.pieceId, count })
  }

  // Explicit empty array is valid (coach cleared) — preserve []
  return out
}

export function slot(
  pieceId: string,
  count = 1,
): StationEquipmentSlot {
  return { pieceId, count }
}

/** Slice 15 — one aggregated packing-list row (library order). */
export interface AggregatedEquipmentRow {
  pieceId: string
  count: number
  labelSv: string
}

/**
 * Slice 15 — pass-wide Förrådslista aggregate.
 * Omits unset / [] ; ignores unknown ids; does NOT include förslag /
 * defaultStationEquipment; does NOT clamp sum to STATION_EQUIPMENT_MAX_COUNT.
 * Emit order = EQUIPMENT_PIECES library order.
 */
export function aggregateStationEquipment(
  items: ReadonlyArray<{ stationEquipment?: StationEquipmentSlot[] }>,
): AggregatedEquipmentRow[] {
  const map = new Map<string, number>()

  for (const item of items) {
    const eq = item.stationEquipment
    if (!Array.isArray(eq) || eq.length === 0) continue
    for (const slot of eq) {
      const piece = getEquipmentPiece(slot.pieceId)
      if (!piece) continue
      const n =
        typeof slot.count === 'number' && Number.isFinite(slot.count)
          ? Math.round(slot.count)
          : 0
      if (n < 1) continue
      map.set(slot.pieceId, (map.get(slot.pieceId) ?? 0) + n)
    }
  }

  const rows: AggregatedEquipmentRow[] = []
  for (const piece of EQUIPMENT_PIECES) {
    const count = map.get(piece.id)
    if (count !== undefined && count > 0) {
      rows.push({ pieceId: piece.id, count, labelSv: piece.labelSv })
    }
  }
  return rows
}

/**
 * Slice 57 — the saved 2,5D station sketch (B1 / C1). Pure logic, no React.
 * `expand` is the Slice 13 heuristic moved here from StationSketch so the sketch and the
 * layout sheet share one order and the same caps.
 */
import type { StationEquipmentSlot, StationLayout, StationPose } from '../types'
import type { EquipmentKind } from '../components/equipmentMark'

export const LAYOUT_ORDER: ReadonlyArray<readonly [string, EquipmentKind, number]> = [
  ['eq-airtrack', 'air', 1],
  ['eq-tumblingmatta', 'track', 1],
  ['eq-madrass', 'cushion', 4],
  ['eq-kilmatta', 'wedge', 2],
  ['eq-satsbrada', 'board', 2],
  ['eq-trampett', 'trampett', 3],
  ['eq-skumblock', 'block', 3],
  ['eq-flickiskudde', 'flick', 2],
  ['eq-plint', 'plint', 2],
  ['eq-mattberg', 'hill', 1],
  ['eq-racke', 'bar', 1],
  ['eq-bom', 'beam', 1],
  ['eq-landningsmatta', 'landing', 2],
  ['eq-kon', 'cone', 4],
  ['eq-rockring', 'hoop', 4],
]

const KIND_BY_ID = new Map(LAYOUT_ORDER.map(([id, kind]) => [id, kind] as const))

export function kindOf(pieceId: string): EquipmentKind | undefined {
  return KIND_BY_ID.get(pieceId)
}

function counts(slots: readonly StationEquipmentSlot[], cap = 9): Map<string, number> {
  const count = new Map<string, number>()
  for (const slot of slots) {
    if (slot.count < 1) continue
    count.set(slot.pieceId, Math.min(cap, (count.get(slot.pieceId) ?? 0) + slot.count))
  }
  return count
}

/** Slice 13 heuristic (unchanged): order, caps and automatic approach mats. */
export function expand(slots: StationEquipmentSlot[]): { pieces: EquipmentKind[]; approach: boolean } {
  const count = counts(slots)
  const hasRunway =
    count.has('eq-tumblingmatta') || count.has('eq-airtrack') || count.has('eq-madrass')
  const approach =
    (count.has('eq-trampett') || count.has('eq-satsbrada')) && !hasRunway
  const pieces: EquipmentKind[] = []
  if (approach) {
    for (let i = 0; i < 4; i++) pieces.push('cushion')
  }
  for (const [id, kind, cap] of LAYOUT_ORDER) {
    const n = Math.min(count.get(id) ?? 0, cap)
    for (let i = 0; i < n; i++) pieces.push(kind)
  }
  return { pieces, approach }
}

const PI = Math.PI
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** Wrap any angle into [-π, π]. */
export function normalizeYaw(yaw: number): number {
  let y = yaw % (2 * PI)
  if (y > PI) y -= 2 * PI
  if (y < -PI) y += 2 * PI
  return y
}

/** v must be 1; x/z clamped, yaw wrapped; poses for pieces not in the list dropped; count mismatch → undefined. */
export function sanitizeStationLayout(
  raw: unknown,
  slots: readonly StationEquipmentSlot[] | undefined,
): StationLayout | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const r = raw as Record<string, unknown>
  if (r.v !== 1 || !Array.isArray(r.poses) || !slots || slots.length === 0) return undefined
  if (r.poses.length > 72) return undefined
  const want = counts(slots)
  const poses: StationPose[] = []
  for (const entry of r.poses) {
    if (!entry || typeof entry !== 'object') return undefined
    const p = entry as Record<string, unknown>
    if (typeof p.pieceId !== 'string' || !want.has(p.pieceId)) continue
    const { x, z, yaw } = p
    if (typeof x !== 'number' || typeof z !== 'number' || typeof yaw !== 'number') return undefined
    if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(yaw)) return undefined
    poses.push({ pieceId: p.pieceId, x: clamp01(x), z: clamp01(z), yaw: normalizeYaw(yaw) })
  }
  const have = new Map<string, number>()
  for (const p of poses) have.set(p.pieceId, (have.get(p.pieceId) ?? 0) + 1)
  if (have.size !== want.size) return undefined
  for (const [id, n] of want) if (have.get(id) !== n) return undefined
  return { v: 1, poses }
}

/** C1: the layout follows the chip list. New/more → appended at the end; fewer/removed → last poses dropped. */
export function syncLayout(layout: StationLayout, slots: readonly StationEquipmentSlot[]): StationLayout {
  const want = counts(slots)
  const seen = new Map<string, number>()
  const kept: StationPose[] = []
  // Keep the first `want` poses of each piece (drop the last ones when the count went down).
  for (const p of layout.poses) {
    const n = seen.get(p.pieceId) ?? 0
    if (n >= (want.get(p.pieceId) ?? 0)) continue
    seen.set(p.pieceId, n + 1)
    kept.push(p)
  }
  let lastX = kept.length > 0 ? kept[kept.length - 1].x : 0
  for (const [id, n] of want) {
    for (let i = seen.get(id) ?? 0; i < n; i++) {
      lastX = kept.length > 0 ? Math.min(1, lastX + 0.08) : 0.5
      kept.push({ pieceId: id, x: lastX, z: 0.5, yaw: 0 })
    }
  }
  return { v: 1, poses: kept }
}

/** Start state in the sheet: the heuristic order (no approach mats — they are not in the list), spread over 0–1. */
export function defaultLayoutFrom(slots: readonly StationEquipmentSlot[]): StationLayout {
  const want = counts(slots)
  const ids: string[] = []
  for (const [id] of LAYOUT_ORDER) for (let i = 0; i < (want.get(id) ?? 0); i++) ids.push(id)
  for (const [id, n] of want) if (!KIND_BY_ID.has(id)) for (let i = 0; i < n; i++) ids.push(id)
  const n = ids.length
  const poses = ids.map((pieceId, i) => ({
    pieceId,
    x: Math.round(((i + 0.5) / n) * 1000) / 1000,
    z: 0.5,
    yaw: 0,
  }))
  return { v: 1, poses }
}

export function sameRecipe(a: readonly StationEquipmentSlot[], b: readonly StationEquipmentSlot[]): boolean {
  if (a.length !== b.length) return false
  return a.every((s, i) => s.pieceId === b[i]?.pieceId && s.count === b[i]?.count)
}

/**
 * E1: the admin layout applies only while the station uses the suggested list
 * (unset, or equal to defaultStationEquipment). A pass's own list → heuristic.
 */
export function layoutForStation(
  activity: { defaultStationEquipment?: StationEquipmentSlot[]; defaultStationLayout?: StationLayout } | undefined,
  stationEquipment: StationEquipmentSlot[] | undefined,
): StationLayout | undefined {
  if (!activity?.defaultStationLayout) return undefined
  if (stationEquipment === undefined) return activity.defaultStationLayout
  const suggested = activity.defaultStationEquipment
  return suggested && sameRecipe(stationEquipment, suggested) ? activity.defaultStationLayout : undefined
}

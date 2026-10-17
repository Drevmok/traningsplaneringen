import { BLOCK_ORDER } from '../data/blockMeta'
import {
  HALL_PRESETS,
  HALL_PRESET_ORDER,
  ZONE_PRIORITY,
  type HallPreset,
  type HallZoneDef,
} from '../data/hallPresets'
import { getActivityById } from '../data/seedActivities'
import type {
  HallPlacement,
  HallTemplateId,
  HallZoneId,
  Session,
  SessionItem,
} from '../types'

export { HALL_PRESETS, HALL_PRESET_ORDER, ZONE_PRIORITY }
export type { HallPreset, HallZoneDef }

export const DEFAULT_HALL_TEMPLATE: HallTemplateId = 'forening-bla'

/** Slice 45 A1: hall ids that can no longer be chosen. */
const LEGACY_TEMPLATES = new Set<string>(['generic-trupp', 'standard-trupp', 'tavling-linjer', 'liten-hall'])

export const HALL_ZONE_LABELS: Record<HallZoneId, string> = {
  open: 'Öppen yta',
  trampett: 'Trampett',
  tumbling: 'Tumbling',
  vault: 'Satsbräda',
  mattberg: 'Mattberg',
  mats: 'Mattor',
}

const KNOWN_ZONES = new Set<string>(ZONE_PRIORITY)

const KNOWN_TEMPLATES = new Set<string>(HALL_PRESET_ORDER)

/** Multi-chip offset (normalized) from data-model.md */
const OFFSET_X = 0.035
const OFFSET_Y = 0.04

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}


/** View-only hall zoom (Slice 07 buttons; Slice 21 pinch). Stored placements unchanged. */
export const HALL_ZOOM_MIN = 1
export const HALL_ZOOM_MAX = 2
export const HALL_ZOOM_STEP = 0.25

export function clampHallZoom(z: number): number {
  if (!Number.isFinite(z)) return HALL_ZOOM_MIN
  return Math.min(HALL_ZOOM_MAX, Math.max(HALL_ZOOM_MIN, z))
}

/** Round to hundredths so continuous pinch stays stable near button steps. */
export function roundHallZoom(z: number): number {
  return Math.round(clampHallZoom(z) * 100) / 100
}

export function touchDistance(
  a: { clientX: number; clientY: number },
  b: { clientX: number; clientY: number },
): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/** Resolve preset; legacy or unknown ids → Gymmix – Stora hallen (Slice 45 A1). */
export function getPreset(
  id: HallTemplateId | string | undefined | null,
): HallPreset {
  return HALL_PRESETS[normalizeTemplateId(id)]
}

export function normalizeTemplateId(
  id: string | undefined | null,
): HallTemplateId {
  if (id && KNOWN_TEMPLATES.has(id)) return id as HallTemplateId
  return DEFAULT_HALL_TEMPLATE
}

/**
 * Slice 45 A1: a pass on a removed hall — a legacy id, or no/unknown id with placements snapped
 * to a zone other than «Öppen yta» (the generic drawings were the only ones with such zones).
 */
export function isLegacyHall(session: Pick<Session, 'hallTemplateId' | 'hallPlacements'>): boolean {
  const id = session.hallTemplateId as string | undefined
  if (id && LEGACY_TEMPLATES.has(id)) return true
  if (id && KNOWN_TEMPLATES.has(id)) return false
  const placements = Array.isArray(session.hallPlacements) ? session.hallPlacements : []
  return placements.some((p) => !!p && typeof p === 'object' && typeof p.zoneId === 'string' && p.zoneId !== 'open')
}

/**
 * Slice 45 A1: move a legacy pass to forening-bla and drop its placements (a position on a generic
 * drawing means nothing on the club drawing); auto-place then puts Teknik on the fixed grid in pass
 * order. Deliberate exception to «do not auto-snap on load», for legacy halls only.
 */
export function migrateLegacyHall<T extends Session>(session: T): T {
  if (!isLegacyHall(session)) return session
  return { ...session, hallTemplateId: DEFAULT_HALL_TEMPLATE, hallPlacements: [] }
}

/**
 * Pass order for stationsordning: walk BLOCK_ORDER explicitly, then item.order asc.
 * Prefer this over raw session.blocks array order so ranks stay stable.
 */
export function passOrder(session: Session): SessionItem[] {
  const out: SessionItem[] = []
  for (const type of BLOCK_ORDER) {
    const block = session.blocks.find((b) => b.type === type)
    if (!block) continue
    const sorted = [...block.items].sort((a, b) => a.order - b.order)
    out.push(...sorted)
  }
  return out
}

/** Same sequence as passOrder (BLOCK_ORDER + item.order). */
export function listSessionItems(session: Session): SessionItem[] {
  return passOrder(session)
}

/** Slice 11: only Teknik (techniques) items are placeable on the hall. */
export function isPlaceableItem(item: SessionItem): boolean {
  const activity = getActivityById(item.activityId)
  return activity?.blockType === 'techniques'
}

/**
 * Placeable set — single source of truth for tray, canvas, ranks, flow, prune.
 * Missing activity → not placeable.
 */
export function placeableItems(session: Session): SessionItem[] {
  return passOrder(session).filter(isPlaceableItem)
}

export function countPlaceableItems(session: Session): number {
  return placeableItems(session).length
}

/** 1-based ranks among *placed Teknik* only, in Passbyggaren order. */
export function stationRanks(session: Session): Map<string, number> {
  const placedIds = new Set(
    (session.hallPlacements ?? []).map((p) => p.sessionItemId),
  )
  const ranks = new Map<string, number>()
  let n = 0
  for (const item of placeableItems(session)) {
    if (placedIds.has(item.id)) {
      n += 1
      ranks.set(item.id, n)
    }
  }
  return ranks
}

/** Default ON when hallShowFlow is missing. */
export function isHallShowFlow(session: Session): boolean {
  return session.hallShowFlow !== false
}

export interface FlowSegment {
  fromId: string
  toId: string
  x1: number
  y1: number
  x2: number
  y2: number
}

/** Soft connectors between consecutive placed stations in pass order. */
export function flowSegments(session: Session): FlowSegment[] {
  if (!isHallShowFlow(session)) return []
  const byId = new Map(
    (session.hallPlacements ?? []).map((p) => [p.sessionItemId, p]),
  )
  const ordered: Array<{ id: string; x: number; y: number }> = []
  for (const item of placeableItems(session)) {
    const p = byId.get(item.id)
    if (p) ordered.push({ id: item.id, x: p.x, y: p.y })
  }
  if (ordered.length < 2) return []
  const segs: FlowSegment[] = []
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]
    segs.push({
      fromId: a.id,
      toId: b.id,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
    })
  }
  return segs
}

export function countSessionItems(session: Session): number {
  return session.blocks.reduce((n, b) => n + b.items.length, 0)
}

export function getPlacement(
  session: Session,
  sessionItemId: string,
): HallPlacement | undefined {
  return (session.hallPlacements ?? []).find(
    (p) => p.sessionItemId === sessionItemId,
  )
}

export function getUnplacedItems(session: Session): SessionItem[] {
  const placed = new Set(
    (session.hallPlacements ?? []).map((p) => p.sessionItemId),
  )
  return placeableItems(session).filter((it) => !placed.has(it.id))
}

export function getPlacedItems(
  session: Session,
): Array<{ item: SessionItem; placement: HallPlacement }> {
  const byId = new Map(placeableItems(session).map((it) => [it.id, it]))
  const out: Array<{ item: SessionItem; placement: HallPlacement }> = []
  for (const p of session.hallPlacements ?? []) {
    const item = byId.get(p.sessionItemId)
    if (item) out.push({ item, placement: p })
  }
  return out
}

function zoneById(preset: HallPreset, id: HallZoneId): HallZoneDef | undefined {
  return preset.zones.find((z) => z.id === id)
}

function pointInBbox(
  x: number,
  y: number,
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
}

/** Priority hit-test against that preset’s bboxes. */
export function resolveZoneId(
  preset: HallPreset,
  x: number,
  y: number,
): HallZoneId | undefined {
  for (const id of preset.zonePriority) {
    const zone = zoneById(preset, id)
    if (zone && pointInBbox(x, y, zone.bbox)) return id
  }
  return undefined
}

function clampToZone(
  x: number,
  y: number,
  bbox: { x: number; y: number; w: number; h: number },
): { x: number; y: number } {
  const margin = 0.02
  const minX = bbox.x + margin
  const maxX = bbox.x + bbox.w - margin
  const minY = bbox.y + margin
  const maxY = bbox.y + bbox.h - margin
  return {
    x: clamp01(Math.min(Math.max(x, minX), Math.max(minX, maxX))),
    y: clamp01(Math.min(Math.max(y, minY), Math.max(minY, maxY))),
  }
}

function offsetFromSlot(
  snap: { x: number; y: number },
  index: number,
  bbox?: { x: number; y: number; w: number; h: number },
): { x: number; y: number } {
  const ox = snap.x + (index % 3) * OFFSET_X
  const oy = snap.y + Math.floor(index / 3) * OFFSET_Y
  if (bbox) return clampToZone(ox, oy, bbox)
  return { x: clamp01(ox), y: clamp01(oy) }
}

/**
 * Slice 40 (Planner ruling on Verifier F1; supersedes the count-based grid of HANDOFF §2).
 * Halls with only Öppen yta (Blå, Vit) get a FIXED grid of cells sized from the marker, not from
 * the number of stations. A new marker takes the first free cell in row order; placed markers never move.
 * Marker = 52 px on a ~358 × 239 px phone canvas → 0.145 × 0.218 of the hall (HANDOFF §2).
 */
export const OPEN_MARKER_W = 0.145
export const OPEN_MARKER_H = 0.218
const OPEN_CELL_W = 0.16 // marker + small gap
const OPEN_CELL_H = 0.22
const OPEN_MARGIN_X = 0.08 // > half a marker, so a marker never sticks out of Öppen yta
const OPEN_MARGIN_Y = 0.11

/** Cell centers in row order, the block centered in the zone's inner box. Stable for a hall. */
export function openGridCells(b: { x: number; y: number; w: number; h: number }): { x: number; y: number }[] {
  const iw = Math.max(0, b.w - 2 * OPEN_MARGIN_X)
  const ih = Math.max(0, b.h - 2 * OPEN_MARGIN_Y)
  const cols = Math.floor(iw / OPEN_CELL_W + 1e-9) + 1
  const rows = Math.floor(ih / OPEN_CELL_H + 1e-9) + 1
  const x0 = b.x + OPEN_MARGIN_X + (iw - OPEN_CELL_W * (cols - 1)) / 2
  const y0 = b.y + OPEN_MARGIN_Y + (ih - OPEN_CELL_H * (rows - 1)) / 2
  const r4 = (v: number) => clamp01(Math.round(v * 1e4) / 1e4)
  const cells = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: r4(x0 + c * OPEN_CELL_W), y: r4(y0 + r * OPEN_CELL_H) })
  return cells
}

/** Overlap area of two marker boxes centered at a and b (0 = no overlap). */
export function markerOverlap(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.max(0, OPEN_MARKER_W - Math.abs(a.x - b.x)) * Math.max(0, OPEN_MARKER_H - Math.abs(a.y - b.y))
}

/** First cell (row order) that overlaps no placed marker; if none, the least-overlapping (ties → row order). */
export function pickOpenCell(
  cells: { x: number; y: number }[],
  placed: { x: number; y: number }[],
): { x: number; y: number } {
  let best = cells[0]
  let bestScore = Infinity
  for (const cell of cells) {
    let score = 0
    for (const p of placed) score += markerOverlap(cell, p)
    if (score === 0) return cell
    if (score < bestScore - 1e-12) { best = cell; bestScore = score }
  }
  return best
}

/** Suggested chip center in a zone. Later indexes step aside so they don't stack. */
export function pointInZone(
  preset: HallPreset,
  zoneId: HallZoneId,
  index: number,
): { x: number; y: number; zoneId: HallZoneId } {
  const zone = zoneById(preset, zoneId) ?? zoneById(preset, 'open')
  if (!zone) return { x: 0.4, y: 0.45, zoneId: 'open' }
  if (zone.snaps && zone.snap) {
    const point = offsetFromSlot(zone.snap, index, zone.bbox)
    return { x: point.x, y: point.y, zoneId: zone.id }
  }
  const origin = {
    x: zone.bbox.x + zone.bbox.w * 0.28,
    y: zone.bbox.y + zone.bbox.h * 0.28,
  }
  const point = offsetFromSlot(origin, index, zone.bbox)
  return { x: point.x, y: point.y, zoneId: zone.id }
}

/**
 * Snap write-time helper used by DnD and phone Placera här.
 * Apparatus zones → snap slot (+ multi-chip offset); open stays free;
 * outside zones → free, zoneId undefined.
 */
export function snapPlacement(
  preset: HallPreset,
  x: number,
  y: number,
  occupied?: HallPlacement[],
  excludeSessionItemId?: string,
): Omit<HallPlacement, 'sessionItemId'> {
  const cx = clamp01(x)
  const cy = clamp01(y)
  const zoneId = resolveZoneId(preset, cx, cy)

  if (!zoneId) {
    return { x: cx, y: cy }
  }

  const zone = zoneById(preset, zoneId)
  if (!zone) {
    return { x: cx, y: cy, zoneId }
  }

  // Open stays free — exact drop, no snap
  if (!zone.snaps || zoneId === 'open' || !zone.snap) {
    return { x: cx, y: cy, zoneId }
  }

  const others = (occupied ?? []).filter(
    (p) =>
      p.zoneId === zoneId &&
      (!excludeSessionItemId || p.sessionItemId !== excludeSessionItemId),
  )
  const index = others.length
  const snapped = offsetFromSlot(zone.snap, index, zone.bbox)
  return { x: snapped.x, y: snapped.y, zoneId }
}

export function upsertPlacement(
  session: Session,
  placement: HallPlacement,
): Session {
  const item = listSessionItems(session).find(
    (it) => it.id === placement.sessionItemId,
  )
  if (!item || !isPlaceableItem(item)) return session

  const preset = getPreset(session.hallTemplateId)
  const occupied = session.hallPlacements ?? []
  const snapped = snapPlacement(
    preset,
    placement.x,
    placement.y,
    occupied,
    placement.sessionItemId,
  )
  const next: HallPlacement = {
    sessionItemId: placement.sessionItemId,
    x: snapped.x,
    y: snapped.y,
    ...(snapped.zoneId ? { zoneId: snapped.zoneId } : {}),
  }
  const rest = occupied.filter((p) => p.sessionItemId !== next.sessionItemId)
  return {
    ...session,
    hallTemplateId: normalizeTemplateId(session.hallTemplateId),
    hallPlacements: [...rest, next],
  }
}

export function removePlacement(
  session: Session,
  sessionItemId: string,
): Session {
  return {
    ...session,
    hallPlacements: (session.hallPlacements ?? []).filter(
      (p) => p.sessionItemId !== sessionItemId,
    ),
  }
}

/**
 * Drop placements whose session item is missing OR not Teknik.
 * Silent — no toast. Used on migrate / load / open.
 */
export function pruneHallPlacements(session: Session): Session {
  const placeableIds = new Set(placeableItems(session).map((it) => it.id))
  const pruned = (session.hallPlacements ?? []).filter((p) =>
    placeableIds.has(p.sessionItemId),
  )
  if (pruned.length === (session.hallPlacements ?? []).length) {
    return session
  }
  return { ...session, hallPlacements: pruned }
}

export function clearHallPlacements(session: Session): Session {
  return {
    ...session,
    hallTemplateId: normalizeTemplateId(session.hallTemplateId),
    hallPlacements: [],
  }
}

function sanitizePlacement(raw: unknown): HallPlacement | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.sessionItemId !== 'string' || !p.sessionItemId) return null
  if (typeof p.x !== 'number' || typeof p.y !== 'number') return null
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null
  const zoneId =
    typeof p.zoneId === 'string' && KNOWN_ZONES.has(p.zoneId)
      ? (p.zoneId as HallZoneId)
      : undefined
  return {
    sessionItemId: p.sessionItemId,
    x: clamp01(p.x),
    y: clamp01(p.y),
    ...(zoneId ? { zoneId } : {}),
  }
}

/**
 * Migrate additive hall fields on load.
 * Legacy halls → forening-bla without placements (Slice 45 A1); accept six zone ids;
 * otherwise do NOT auto-snap on load.
 */
export function migrateHallFields(input: Session): Session {
  const session = migrateLegacyHall(input)
  const rawPlacements = Array.isArray(session.hallPlacements)
    ? session.hallPlacements
    : []
  const hallPlacements: HallPlacement[] = []
  const seen = new Set<string>()
  for (const raw of rawPlacements) {
    const p = sanitizePlacement(raw)
    if (!p || seen.has(p.sessionItemId)) continue
    seen.add(p.sessionItemId)
    hallPlacements.push(p)
  }
  const hallTemplateId = normalizeTemplateId(
    session.hallTemplateId as string | undefined,
  )
  const hallShowFlow =
    typeof session.hallShowFlow === 'boolean' ? session.hallShowFlow : undefined

  return pruneHallPlacements({
    ...session,
    hallTemplateId,
    hallPlacements,
    ...(hallShowFlow !== undefined ? { hallShowFlow } : {}),
  })
}

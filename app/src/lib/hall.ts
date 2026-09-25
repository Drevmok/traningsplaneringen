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

export const DEFAULT_HALL_TEMPLATE: HallTemplateId = 'standard-trupp'

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

/** Resolve preset; alias legacy Slice 05 `generic-trupp` → `standard-trupp`. */
export function getPreset(
  id: HallTemplateId | string | undefined | null,
): HallPreset {
  if (id === 'generic-trupp' || !id || !KNOWN_TEMPLATES.has(id)) {
    return HALL_PRESETS[DEFAULT_HALL_TEMPLATE]
  }
  return HALL_PRESETS[id as HallTemplateId]
}

export function normalizeTemplateId(
  id: string | undefined | null,
): HallTemplateId {
  if (id === 'generic-trupp') return 'standard-trupp'
  if (id && KNOWN_TEMPLATES.has(id)) return id as HallTemplateId
  return DEFAULT_HALL_TEMPLATE
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

/**
 * Switch hall preset; remap by zoneId→snap when possible.
 * NEVER dumps chips to tray.
 */
export function applyPreset(
  session: Session,
  nextId: HallTemplateId | string,
): Session {
  const templateId = normalizeTemplateId(nextId)
  const preset = getPreset(templateId)
  const remapped: HallPlacement[] = []
  const zoneCounts = new Map<HallZoneId, number>()

  for (const p of session.hallPlacements ?? []) {
    const zone =
      p.zoneId && KNOWN_ZONES.has(p.zoneId)
        ? zoneById(preset, p.zoneId)
        : undefined

    if (zone && zone.snaps && zone.snap) {
      const index = zoneCounts.get(zone.id) ?? 0
      zoneCounts.set(zone.id, index + 1)
      const snapped = offsetFromSlot(zone.snap, index, zone.bbox)
      remapped.push({
        sessionItemId: p.sessionItemId,
        x: snapped.x,
        y: snapped.y,
        zoneId: zone.id,
      })
    } else {
      const x = clamp01(p.x)
      const y = clamp01(p.y)
      const zoneId = resolveZoneId(preset, x, y)
      remapped.push({
        sessionItemId: p.sessionItemId,
        x,
        y,
        ...(zoneId ? { zoneId } : {}),
      })
      // If remapped into a snappable zone via keep-xy path, still count for
      // subsequent same-zone remaps? Spec: keep x,y + re-resolve — do not
      // auto-snap on that branch. Only bump counts for explicit zone snaps.
    }
  }

  return {
    ...session,
    hallTemplateId: templateId,
    hallPlacements: remapped,
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
 * Alias generic-trupp → standard-trupp; accept six zone ids;
 * do NOT auto-snap on load.
 */
export function migrateHallFields(session: Session): Session {
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

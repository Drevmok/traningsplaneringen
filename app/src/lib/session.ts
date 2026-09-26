import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER, DEFAULT_TARGET_MINUTES } from '../data/blockMeta'
import { orderedTemplateBlocks, seedTemplates } from '../data/seedTemplates'
import { sanitizeStationEquipment } from '../data/equipmentPieces'
import type {
  BlockType,
  Session,
  SessionBlock,
  SessionItem,
  SessionTemplate,
  StationEquipmentSlot,
} from '../types'
import { getActivityById } from '../data/seedActivities'
import {
  clearHallPlacements,
  DEFAULT_HALL_TEMPLATE,
  migrateHallFields,
  placeableItems,
  pruneHallPlacements,
} from './hall'

const STORAGE_KEY = 'gymnastics-planner-draft-v1'

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function createEmptyBlocks(): SessionBlock[] {
  return BLOCK_ORDER.map((type) => ({
    id: uid(`block-${type}`),
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    items: [],
    coachNote: '',
  }))
}

export function createBlankSession(): Session {
  return {
    id: uid('session'),
    title: 'Nytt pass',
    totalMinutes: 0,
    notes: '',
    blocks: createEmptyBlocks(),
    hallTemplateId: DEFAULT_HALL_TEMPLATE,
    hallPlacements: [],
  }
}

export function computeTotal(session: Session): number {
  return session.blocks.reduce(
    (sum, block) =>
      sum + block.items.reduce((s, item) => s + item.durationMinutes, 0),
    0,
  )
}

export function withComputedTotal(session: Session): Session {
  return { ...session, totalMinutes: computeTotal(session) }
}

export function cloneTemplate(template: SessionTemplate): Session {
  const blocks = orderedTemplateBlocks(template).map((b) => ({
    ...b,
    id: uid(`block-${b.type}`),
    title: BLOCK_LABELS[b.type],
    durationMinutes: BLOCK_BUDGETS[b.type],
    coachNote: '',
    items: b.items.map((it, order) => ({
      ...it,
      id: uid('item'),
      order,
      note: '',
    })),
  }))
  return clearHallPlacements(
    withComputedTotal({
      id: uid('session'),
      title: template.title,
      totalMinutes: 0,
      notes: '',
      basedOnTemplateId: template.id,
      blocks,
      hallTemplateId: DEFAULT_HALL_TEMPLATE,
      hallPlacements: [],
    }),
  )
}

export function blockFilledMinutes(block: SessionBlock): number {
  return block.items.reduce((s, i) => s + i.durationMinutes, 0)
}

export function saveDraft(session: Session): void {
  const toSave = withComputedTotal(session)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

export function loadDraft(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.id || !Array.isArray(parsed.blocks)) return null
    return withComputedTotal(
      migrateHallFields(migrateSessionEquipment(parsed)),
    )
  } catch {
    return null
  }
}

export function hasDraft(): boolean {
  return loadDraft() !== null
}

export function createSessionItem(
  activityId: string,
  durationMinutes: number,
  order: number,
  stationEquipment?: StationEquipmentSlot[],
): SessionItem {
  const item: SessionItem = {
    id: uid('item'),
    activityId,
    durationMinutes,
    note: '',
    order,
  }
  // Leave unset (undefined) so UI can show seed förslag until coach saves.
  if (stationEquipment !== undefined) {
    item.stationEquipment = sanitizeStationEquipment(stationEquipment) ?? []
  }
  return item
}

/**
 * Slice 13 — sanitize stationEquipment on every SessionItem.
 * Unknown pieceIds dropped; [] preserved (coach cleared); missing stays undefined.
 */
export function migrateSessionEquipment(session: Session): Session {
  let changed = false
  const blocks = session.blocks.map((block) => {
    const items = block.items.map((item) => {
      if (!('stationEquipment' in item) || item.stationEquipment === undefined) {
        return item
      }
      const sanitized = sanitizeStationEquipment(item.stationEquipment)
      // sanitize returns undefined only for non-array; treat as cleared empty
      const nextEq = sanitized === undefined ? [] : sanitized
      const prev = item.stationEquipment
      const same =
        Array.isArray(prev) &&
        prev.length === nextEq.length &&
        prev.every(
          (s, i) =>
            s.pieceId === nextEq[i]?.pieceId && s.count === nextEq[i]?.count,
        )
      if (same) return item
      changed = true
      return { ...item, stationEquipment: nextEq }
    })
    if (items === block.items) return block
    // Always rebuild if any item object changed
    const itemsChanged = items.some((it, i) => it !== block.items[i])
    if (!itemsChanged) return block
    changed = true
    return { ...block, items }
  })
  return changed ? { ...session, blocks } : session
}

/** Persist composed redskap on a SessionItem (Klar / Använd förslag). */
export function updateItemStationEquipment(
  session: Session,
  itemId: string,
  stationEquipment: StationEquipmentSlot[],
): Session {
  const sanitized = sanitizeStationEquipment(stationEquipment) ?? []
  const blocks = session.blocks.map((block) => {
    const idx = block.items.findIndex((i) => i.id === itemId)
    if (idx < 0) return block
    const items = block.items.map((i) =>
      i.id === itemId ? { ...i, stationEquipment: sanitized } : i,
    )
    return { ...block, items }
  })
  return withComputedTotal({ ...session, blocks })
}


/** Placed Teknik with unset stationEquipment + non-empty seed (Slice 19). */
export function eligibleSuggestedStationEquipmentItems(
  session: Session,
): SessionItem[] {
  const placedIds = new Set(
    (session.hallPlacements ?? []).map((p) => p.sessionItemId),
  )
  return placeableItems(session).filter((item) => {
    if (!placedIds.has(item.id)) return false
    if (item.stationEquipment !== undefined) return false
    const seed = getActivityById(item.activityId)?.defaultStationEquipment
    return Array.isArray(seed) && seed.length > 0
  })
}

/**
 * Slice 25 — placed Teknik with missing saved redskap (unset OR empty []).
 * Does not change Slice 19 eligibility (still unset + seed only).
 */
export function placedTeknikMissingSavedEquipment(
  session: Session,
): SessionItem[] {
  const placedIds = new Set(
    (session.hallPlacements ?? []).map((p) => p.sessionItemId),
  )
  return placeableItems(session).filter((item) => {
    if (!placedIds.has(item.id)) return false
    const eq = item.stationEquipment
    if (eq === undefined) return true
    return Array.isArray(eq) && eq.length === 0
  })
}

/**
 * Bulk-persist unset Teknik seeds via the same path as Använd förslag (Slice 19).
 * Recomputes eligibility; skips saved lists and cleared `[]`.
 */
export function applyAllSuggestedStationEquipment(
  session: Session,
): { session: Session; appliedCount: number } {
  const eligible = eligibleSuggestedStationEquipmentItems(session)
  let next = session
  for (const item of eligible) {
    const seed = getActivityById(item.activityId)?.defaultStationEquipment
    if (!seed || seed.length === 0) continue
    next = updateItemStationEquipment(next, item.id, seed)
  }
  return { session: next, appliedCount: eligible.length }
}

export function findSessionItem(
  session: Session,
  itemId: string,
): SessionItem | undefined {
  for (const block of session.blocks) {
    const found = block.items.find((i) => i.id === itemId)
    if (found) return found
  }
  return undefined
}

export function getTemplateById(id: string): SessionTemplate | undefined {
  return seedTemplates.find((t) => t.id === id)
}

export { DEFAULT_TARGET_MINUTES, seedTemplates }

export function moveItemWithinBlock(
  session: Session,
  blockId: string,
  itemId: string,
  direction: 'up' | 'down',
): Session {
  const blocks = session.blocks.map((block) => {
    if (block.id !== blockId) return block
    const items = [...block.items].sort((a, b) => a.order - b.order)
    const idx = items.findIndex((i) => i.id === itemId)
    if (idx < 0) return block
    const swapWith = direction === 'up' ? idx - 1 : idx + 1
    if (swapWith < 0 || swapWith >= items.length) return block
    const tmp = items[idx]
    items[idx] = items[swapWith]
    items[swapWith] = tmp
    return {
      ...block,
      items: items.map((it, order) => ({ ...it, order })),
    }
  })
  return withComputedTotal({ ...session, blocks })
}

export function moveItemToBlock(
  session: Session,
  fromBlockId: string,
  toBlockId: string,
  itemId: string,
): Session {
  if (fromBlockId === toBlockId) return session
  let moving: SessionItem | null = null
  const without = session.blocks.map((block) => {
    if (block.id !== fromBlockId) return block
    const found = block.items.find((i) => i.id === itemId)
    if (found) moving = { ...found }
    return {
      ...block,
      items: block.items
        .filter((i) => i.id !== itemId)
        .map((it, order) => ({ ...it, order })),
    }
  })
  if (!moving) return session
  const blocks = without.map((block) => {
    if (block.id !== toBlockId) return block
    // Slice 05: keep SessionItem.id so hall placements survive cross-block moves
    const items = [
      ...block.items,
      { ...moving!, order: block.items.length },
    ].map((it, order) => ({ ...it, order }))
    return { ...block, items }
  })
  return withComputedTotal({ ...session, blocks })
}

export function removeItem(
  session: Session,
  blockId: string,
  itemId: string,
): Session {
  const blocks = session.blocks.map((block) => {
    if (block.id !== blockId) return block
    return {
      ...block,
      items: block.items
        .filter((i) => i.id !== itemId)
        .map((it, order) => ({ ...it, order })),
    }
  })
  return pruneHallPlacements(withComputedTotal({ ...session, blocks }))
}

export function updateItemDuration(
  session: Session,
  blockId: string,
  itemId: string,
  durationMinutes: number,
): Session {
  const minutes = Math.max(1, Math.min(60, Math.round(durationMinutes) || 1))
  const blocks = session.blocks.map((block) => {
    if (block.id !== blockId) return block
    return {
      ...block,
      items: block.items.map((i) =>
        i.id === itemId ? { ...i, durationMinutes: minutes } : i,
      ),
    }
  })
  return withComputedTotal({ ...session, blocks })
}

export function addItemToBlock(
  session: Session,
  blockId: string,
  activityId: string,
  durationMinutes: number,
): Session {
  const blocks = session.blocks.map((block) => {
    if (block.id !== blockId) return block
    const newItem = createSessionItem(
      activityId,
      durationMinutes,
      block.items.length,
    )
    return { ...block, items: [...block.items, newItem] }
  })
  return withComputedTotal({ ...session, blocks })
}

export function findBlock(
  session: Session,
  blockId: string,
): SessionBlock | undefined {
  return session.blocks.find((b) => b.id === blockId)
}

export function blockTypeLabel(type: BlockType): string {
  return BLOCK_LABELS[type]
}

import type { AdminEntry } from './state'

/**
 * Slice 59 B1 — Teknik with redskap and no valid layout, published or pending.
 * Hidden rows stay out. Sanitizing already happened in `toAdminEntries`.
 */
export function needsLayout(e: AdminEntry): boolean {
  return (
    e.status !== 'hidden' &&
    e.activity.blockType === 'techniques' &&
    (e.activity.defaultStationEquipment?.length ?? 0) > 0 &&
    !e.activity.defaultStationLayout
  )
}

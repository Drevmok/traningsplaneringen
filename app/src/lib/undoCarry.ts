import type { Session } from '../types'

/**
 * Slice 36/41: a new pass gets a new id and App keys the builder by session id, so the builder
 * remounts right after a mall is applied. The toast for that moment and the one undo level ride
 * across the remount here. Slice 46: the start page's mall path arms the same undo.
 */
export type CarriedToast = { text: string; undo?: boolean; focus?: boolean }
export const carry: {
  toast: CarriedToast | null
  /** Slice 41 (C1): one undo level — the pass before × / Använd mall and the pass that action produced. */
  undo: { before: Session; after: Session; blockId: string | null } | null
} = { toast: null, undo: null }

/** Slice 41/46: after a mall is applied — «Mallen är i Passbyggaren. · Ångra», undo back to `before`. */
export function armMallUndo(before: Session, after: Session, text: string): void {
  carry.undo = { before, after, blockId: null }
  carry.toast = { text, undo: true, focus: true }
}

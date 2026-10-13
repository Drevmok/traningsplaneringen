// Slice 39 — Spara passet automatiskt.
// Lives in its own module (not session.ts) to avoid the session.ts ⇄ savedTemplates.ts import cycle
// (savedTemplates imports duplicateSession from session). session.ts only exposes a write hook.
import { UI } from '../data/blockMeta'
import type { Session } from '../types'
import { countSessionItems } from './hall'
import { saveSessionAsTemplate, sessionAlreadyArchived } from './savedTemplates'
import { loadDraft, saveDraft, setBeforeDraftWrite } from './session'

export const AUTOSAVE_DELAY = 800

/** Keep a stored pass with ≥ 1 station in Mina mallar before another pass takes the slot. */
export function archiveReplacedDraft(next: Pick<Session, 'id'>): boolean {
  try {
    const old = loadDraft()
    if (!old || old.id === next.id || countSessionItems(old) < 1 || sessionAlreadyArchived(old)) return false
    saveSessionAsTemplate(old, old.title.trim() || UI.untitledPass)
    return true
  } catch {
    // A full Mina mallar write must never block the pass write.
    return false
  }
}

/**
 * Slice 39 fix (Verifier F1): the debounced write still waiting for the pass on screen.
 * Set by useAutosave. Any write of a *different* pass flushes it first, so the old pass's
 * last edit is stored (and then copied to Mina mallar) before the new pass takes the slot,
 * and a late timer can never put the old pass back.
 */
export const pendingWrite: { current: { id: string; run: () => void } | null } = { current: null }

export function beforeDraftWrite(next: Pick<Session, 'id'>): void {
  const p = pendingWrite.current
  if (p && p.id !== next.id) {
    pendingWrite.current = null
    p.run()
  }
  archiveReplacedDraft(next)
}

// Every draft write (saveDraft, adoptAsDraft, HallBoard, Ny vecka, wizard) goes through the guard.
setBeforeDraftWrite(beforeDraftWrite)

/** Never throws. false = storage full, blocked or private mode. */
export function trySaveDraft(session: Session): boolean {
  try {
    saveDraft(session)
    return true
  } catch {
    return false
  }
}

/**
 * E1: a pass that is not the stored one waits until a station is added beyond the ones it
 * started with (Tomt pass starts with Närvaro + Dagens pass, Slice 27). The stored pass
 * (same id) always saves, also when its last station is removed.
 */
export function shouldAutosave(session: Pick<Session, 'id' | 'blocks'>, storedId: string | null, startItems = 0): boolean {
  return storedId === session.id || countSessionItems(session as Session) > startItems
}

export function storedDraftId(): string | null {
  return loadDraft()?.id ?? null
}

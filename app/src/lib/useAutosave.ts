import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '../types'
import { AUTOSAVE_DELAY, lastWritten, pendingWrite, shouldAutosave, storedDraftId, trySaveDraft } from './autosave'
import { countSessionItems } from './hall'
import { withComputedTotal } from './session'

export type SaveStatus = 'idle' | 'saved' | 'failed'

/** Slice 39 A1: debounced write ~800 ms after the last change; flush() writes a pending change now. */
export function useAutosave(session: Session, active: boolean): { status: SaveStatus; flush: () => void } {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const start = useRef<{ id: string; items: number } | null>(null)
  const pending = useRef<Session | null>(null)
  const timer = useRef<number | null>(null)

  const write = useCallback((s: Session) => {
    pending.current = null
    if (pendingWrite.current?.id === s.id) pendingWrite.current = null
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    const stored = storedDraftId()
    if (!shouldAutosave(s, stored, start.current?.id === s.id ? start.current.items : 0)) return
    const json = JSON.stringify(withComputedTotal(s))
    if (lastWritten.current?.id === s.id && lastWritten.current.json === json && stored === s.id) return
    const ok = trySaveDraft(s)
    if (ok) lastWritten.current = { id: s.id, json }
    setStatus(ok ? 'saved' : 'failed')
  }, [])

  const flush = useCallback(() => {
    if (pending.current) write(pending.current)
  }, [write])

  useEffect(() => {
    if (!active) return
    const json = JSON.stringify(withComputedTotal(session))
    if (start.current?.id !== session.id) {
      // Id changed: a still-pending write of the previous pass goes out now (normally the
      // replacing write already flushed it via beforeDraftWrite; this covers any other path).
      if (pending.current && pending.current.id !== session.id) write(pending.current)
      // New pass on screen: one that is already the stored draft (Fortsätt passet, C1 save on create)
      // starts as «Sparat» without a write; a fresh Tomt pass starts hidden and unwritten.
      const stored = storedDraftId() === session.id
      start.current = { id: session.id, items: countSessionItems(session) }
      lastWritten.current = { id: session.id, json }
      setStatus(stored ? 'saved' : 'idle')
      return
    }
    if (lastWritten.current?.json === json) {
      // Slice 41: back to the written state (Ångra) — a still-waiting write of the undone edit must not land.
      if (timer.current !== null) window.clearTimeout(timer.current)
      timer.current = null
      pending.current = null
      if (pendingWrite.current?.id === session.id) pendingWrite.current = null
      return
    }
    pending.current = session
    pendingWrite.current = { id: session.id, run: () => write(session) }
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => write(session), AUTOSAVE_DELAY)
  }, [session, active, write])

  useEffect(() => {
    const onHide = () => flush()
    const onVis = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [flush])

  return { status, flush }
}

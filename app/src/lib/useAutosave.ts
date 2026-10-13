import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '../types'
import { AUTOSAVE_DELAY, shouldAutosave, storedDraftId, trySaveDraft } from './autosave'
import { countSessionItems } from './hall'
import { withComputedTotal } from './session'

export type SaveStatus = 'idle' | 'saved' | 'failed'

/** Slice 39 A1: debounced write ~800 ms after the last change; flush() writes a pending change now. */
export function useAutosave(session: Session, active: boolean): { status: SaveStatus; flush: () => void } {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const last = useRef<{ id: string; json: string } | null>(null)
  const start = useRef<{ id: string; items: number } | null>(null)
  const pending = useRef<Session | null>(null)
  const timer = useRef<number | null>(null)

  const write = useCallback((s: Session) => {
    pending.current = null
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    const stored = storedDraftId()
    if (!shouldAutosave(s, stored, start.current?.id === s.id ? start.current.items : 0)) return
    const json = JSON.stringify(withComputedTotal(s))
    if (last.current?.id === s.id && last.current.json === json && stored === s.id) return
    const ok = trySaveDraft(s)
    if (ok) last.current = { id: s.id, json }
    setStatus(ok ? 'saved' : 'failed')
  }, [])

  const flush = useCallback(() => {
    if (pending.current) write(pending.current)
  }, [write])

  useEffect(() => {
    if (!active) return
    const json = JSON.stringify(withComputedTotal(session))
    if (start.current?.id !== session.id) {
      // New pass on screen: one that is already the stored draft (Fortsätt passet, C1 save on create)
      // starts as «Sparat» without a write; a fresh Tomt pass starts hidden and unwritten.
      const stored = storedDraftId() === session.id
      start.current = { id: session.id, items: countSessionItems(session) }
      last.current = { id: session.id, json }
      setStatus(stored ? 'saved' : 'idle')
      return
    }
    if (last.current?.json === json) return
    pending.current = session
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

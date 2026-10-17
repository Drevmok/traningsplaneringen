import { useEffect, useState } from 'react'

export const PRINT_CLASS = 'is-print-pass'
export const PRINT_STALL_MS = 1500

/**
 * Slice 44 A1/B1 — the print page stays armed after the tap. WebKit returns from print() at once and
 * fires afterprint before it renders the print copy, so nothing is torn down on afterprint. If
 * beforeprint never arrives (iOS home-screen app), `onStalled`.
 * Verifier F2: once our print has had its afterprint, the coach's next touch or key in the page
 * (Ctrl/Cmd+P included) drops the class and `onDone` disarms, so a later browser print in Golvklart
 * or Hallöversikt shows the hall. The page cannot be touched while the iOS print sheet is open.
 * Plain function so it can be tested without React. The returned cleanup runs on the next tap or unmount.
 */
export function startPassPrint(win: Window, onStalled: () => void, onDone: () => void = () => {}): () => void {
  let seen = false
  let printed = false
  const onBefore = () => { seen = true }
  const onAfter = () => { printed = true }
  const onUser = () => {
    if (!printed) return
    win.document.body.classList.remove(PRINT_CLASS)
    onDone()
  }
  win.document.body.classList.add(PRINT_CLASS)
  win.addEventListener('beforeprint', onBefore, { once: true })
  win.addEventListener('afterprint', onAfter)
  win.addEventListener('pointerdown', onUser, true)
  win.addEventListener('keydown', onUser, true)
  const raf = win.requestAnimationFrame(() => win.print())
  const timer = win.setTimeout(() => { if (!seen) onStalled() }, PRINT_STALL_MS)
  return () => {
    win.cancelAnimationFrame(raf)
    win.clearTimeout(timer)
    win.removeEventListener('beforeprint', onBefore)
    win.removeEventListener('afterprint', onAfter)
    win.removeEventListener('pointerdown', onUser, true)
    win.removeEventListener('keydown', onUser, true)
  }
}

export function usePassPrint(): { armed: boolean; stalled: boolean; print: () => void } {
  const [request, setRequest] = useState(0)
  const [armed, setArmed] = useState(false)
  const [stalled, setStalled] = useState(false)
  useEffect(() => {
    if (request === 0) return
    return startPassPrint(window, () => setStalled(true), () => setArmed(false))
  }, [request])
  useEffect(() => () => document.body.classList.remove(PRINT_CLASS), [])
  return {
    armed,
    stalled,
    print: () => {
      setStalled(false)
      setArmed(true)
      setRequest((n) => n + 1)
    },
  }
}

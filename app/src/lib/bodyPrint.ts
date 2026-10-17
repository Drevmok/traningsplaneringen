import { useEffect, useState } from 'react'

export const PRINT_CLASS = 'is-print-pass'
export const PRINT_STALL_MS = 1500

/**
 * Slice 44 A1/B1 — the print page stays armed after the tap. WebKit returns from print() at once and
 * fires afterprint before it renders the print copy, so nothing is torn down on afterprint; the body
 * class goes when the owner unmounts. If beforeprint never arrives (iOS home-screen app), `stalled`.
 * Plain function so it can be tested without React.
 */
export function startPassPrint(win: Window, onStalled: () => void): () => void {
  let seen = false
  const onBefore = () => { seen = true }
  win.document.body.classList.add(PRINT_CLASS)
  win.addEventListener('beforeprint', onBefore, { once: true })
  const raf = win.requestAnimationFrame(() => win.print())
  const timer = win.setTimeout(() => { if (!seen) onStalled() }, PRINT_STALL_MS)
  return () => {
    win.cancelAnimationFrame(raf)
    win.clearTimeout(timer)
    win.removeEventListener('beforeprint', onBefore)
  }
}

export function usePassPrint(): { armed: boolean; stalled: boolean; print: () => void } {
  const [request, setRequest] = useState(0)
  const [stalled, setStalled] = useState(false)
  useEffect(() => {
    if (request === 0) return
    return startPassPrint(window, () => setStalled(true))
  }, [request])
  useEffect(() => () => document.body.classList.remove(PRINT_CLASS), [])
  return {
    armed: request > 0,
    stalled,
    print: () => {
      setStalled(false)
      setRequest((n) => n + 1)
    },
  }
}

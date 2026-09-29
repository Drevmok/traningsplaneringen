import { useLayoutEffect, useRef } from 'react'

export type BodyPrintMode = 'stations' | 'pass'

/** Print after the portal is in the DOM. Clears the body class when the dialog closes. */
export function useBodyPrint(
  mode: BodyPrintMode | null,
  onDone: () => void,
): void {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useLayoutEffect(() => {
    if (!mode) return
    const cls = mode === 'stations' ? 'is-print-stations' : 'is-print-pass'
    document.body.classList.add(cls)
    let cancelled = false
    function done() {
      if (cancelled) return
      document.body.classList.remove('is-print-stations', 'is-print-pass')
      onDoneRef.current()
    }
    window.addEventListener('afterprint', done)
    const id = requestAnimationFrame(() => {
      if (!cancelled) window.print()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
      window.removeEventListener('afterprint', done)
      document.body.classList.remove('is-print-stations', 'is-print-pass')
    }
  }, [mode])
}

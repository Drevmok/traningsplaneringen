/**
 * Slice 48 C1 — tiny Pointer Events drag helper (mouse, touch, pen). No dependency.
 * The drag starts only after the pointer has moved DRAG_THRESHOLD px; a press that never
 * crosses it is a tap and the element's own click handles it.
 */
export const DRAG_THRESHOLD = 6

export function pastThreshold(dx: number, dy: number, threshold = DRAG_THRESHOLD): boolean {
  return dx * dx + dy * dy >= threshold * threshold
}

/** Insertion index among the other rows: how many row midpoints lie above y. */
export function dropIndex(y: number, mids: number[]): number {
  let n = 0
  for (const mid of mids) if (mid < y) n += 1
  return n
}

export interface PointerDragHandlers {
  /** Called once when the threshold is crossed. */
  onStart?: () => void
  onMove: (e: PointerEvent) => void
  onDrop: (e: PointerEvent) => void
  onCancel?: () => void
}

type PointerLike = {
  pointerId: number
  clientX: number
  clientY: number
  button: number
  currentTarget: EventTarget | null
}

/** Captures the pointer and drives the handlers until up / cancel / Esc. */
export function startPointerDrag(e: PointerLike, h: PointerDragHandlers): void {
  if (e.button !== 0) return
  const el = e.currentTarget as Element | null
  if (!el) return
  const { pointerId, clientX: x0, clientY: y0 } = e
  let dragging = false
  try {
    el.setPointerCapture(pointerId)
  } catch {
    /* capture is best effort */
  }

  function finish() {
    el!.removeEventListener('pointermove', move as EventListener)
    el!.removeEventListener('pointerup', up as EventListener)
    el!.removeEventListener('pointercancel', cancel as EventListener)
    window.removeEventListener('keydown', key)
    try {
      el!.releasePointerCapture(pointerId)
    } catch {
      /* already released */
    }
  }
  function move(ev: PointerEvent) {
    if (ev.pointerId !== pointerId) return
    if (!dragging) {
      if (!pastThreshold(ev.clientX - x0, ev.clientY - y0)) return
      dragging = true
      h.onStart?.()
    }
    ev.preventDefault()
    h.onMove(ev)
  }
  function up(ev: PointerEvent) {
    if (ev.pointerId !== pointerId) return
    finish()
    if (dragging) h.onDrop(ev)
  }
  function cancel(ev: PointerEvent) {
    if (ev.pointerId !== pointerId) return
    finish()
    if (dragging) h.onCancel?.()
  }
  function key(ev: KeyboardEvent) {
    if (ev.key !== 'Escape') return
    finish()
    if (dragging) h.onCancel?.()
  }
  el.addEventListener('pointermove', move as EventListener)
  el.addEventListener('pointerup', up as EventListener)
  el.addEventListener('pointercancel', cancel as EventListener)
  window.addEventListener('keydown', key)
}

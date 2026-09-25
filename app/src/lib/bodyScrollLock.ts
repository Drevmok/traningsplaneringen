/**
 * Slice 20 — nested body scroll lock with refcount.
 * Prevents prev=`hidden` from sticking when TemplateConfirm / sheets nest
 * under SessionBuilder's narrow panel lock.
 */

import { useEffect } from 'react'

let lockCount = 0

/** Acquire a body scroll lock. Returns a release function (safe to call once). */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  lockCount += 1
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden'
  }
  let released = false
  return () => {
    if (released) return
    released = true
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) {
      document.body.style.overflow = ''
    }
  }
}

/** React helper: lock while `active` is true. */
export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return
    return lockBodyScroll()
  }, [active])
}

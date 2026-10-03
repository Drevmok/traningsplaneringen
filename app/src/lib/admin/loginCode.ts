/**
 * Slice 33 — pure helpers for the code login (lazy: used by the login sheet and session.ts).
 *
 *   normalizeCode   typing, paste («123 456», «123-456», full-width digits) and autofill → digits only, max 6
 *   pending login   `gymnastics-planner-admin-pending-v1` = { email, sentAt }: the sheet reopens on the
 *                   code step after an app reload (iPhone home-screen app) for up to 60 minutes.
 *                   Never read on load, never starts admin; coaches never have it.
 */
export const CODE_LENGTH = 6
export const RESEND_COOLDOWN_MS = 60_000
export const PENDING_MAX_AGE_MS = 60 * 60_000
export const ADMIN_PENDING_KEY = 'gymnastics-planner-admin-pending-v1'

export function normalizeCode(raw: string): string {
  return raw.normalize('NFKC').replace(/\D/g, '').slice(0, CODE_LENGTH)
}

export interface PendingLogin {
  email: string
  sentAt: number
}

export function clearPendingLogin(): void {
  try {
    localStorage.removeItem(ADMIN_PENDING_KEY)
  } catch {
    // private mode
  }
}

export function writePendingLogin(email: string, sentAt: number): void {
  try {
    localStorage.setItem(ADMIN_PENDING_KEY, JSON.stringify({ email, sentAt }))
  } catch {
    // private mode / full: the sheet just opens on step 1 next time
  }
}

/** The pending login if it is younger than 60 minutes; an old or broken entry is removed. */
export function readPendingLogin(now: number = Date.now()): PendingLogin | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(ADMIN_PENDING_KEY)
  } catch {
    return null
  }
  if (raw === null) return null
  try {
    const v = JSON.parse(raw) as Partial<PendingLogin>
    const age = now - (v.sentAt as number)
    if (typeof v.email === 'string' && v.email.trim() && typeof v.sentAt === 'number' && age >= 0 && age < PENDING_MAX_AGE_MS) {
      return { email: v.email, sentAt: v.sentAt }
    }
  } catch {
    // fall through
  }
  clearPendingLogin()
  return null
}

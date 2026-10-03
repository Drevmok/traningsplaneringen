/**
 * Slice 33 (lazy chunk) — admin login with a 6-digit code from the e-mail (replaces the
 * Slice 32 link, which opened the browser instead of the home-screen app).
 *
 *   sendLoginCode(email)          signInWithOtp, shouldCreateUser false, no redirect
 *   verifyLoginCode(email, code)  verifyOtp type 'email' → session in the response body
 *
 * Loaded only when this browser already holds an admin session (`gymnastics-planner-admin-auth-v1`),
 * or when someone opens the login sheet / logs out. State lives in state.ts (always loaded, tiny).
 */
import { clearAdminBank, loadAdminBank } from './adminBank'
import { getAdminClient } from './client'
import { clearPendingLogin } from './loginCode'
import { ADMIN_AUTH_KEY, getAdminSnapshot, setAdminSnapshot, shouldStartAdmin } from './state'

export type SendResult = 'sent' | 'wait' | 'failed'
export type VerifyResult = 'ok' | 'wrong' | 'wait' | 'failed'

const CODE_VERIFIER_KEY = `${ADMIN_AUTH_KEY}-code-verifier`

let started = false
let watching = false
const set = setAdminSnapshot

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // private mode
  }
}

async function settleState(): Promise<void> {
  const pending = getAdminClient()
  if (!pending) return set({ state: 'none' })
  const client = await pending
  const { data } = await client.auth.getSession()
  if (!data.session) {
    clearAdminBank()
    return set({ state: 'none' })
  }
  const { data: row, error } = await client.from('admins').select('user_id').maybeSingle()
  if (error) {
    // Could not ask (network): no admin UI, but keep the session for the next load.
    clearAdminBank()
    return set({ state: 'none' })
  }
  if (!row) {
    clearAdminBank()
    return set({ state: 'notAdmin' })
  }
  set({ state: 'admin' })
  await loadAdminBank()
}

function watchAuth(): void {
  if (watching) return
  const pending = getAdminClient()
  if (!pending) return
  watching = true
  void pending.then((client) => {
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (getAdminSnapshot().state !== 'none') {
          clearAdminBank()
          set({ state: 'none' })
        }
      }
    })
  })
}

/** Once per load, from main.tsx, only when a session is saved in this browser. */
export async function startAdmin(): Promise<void> {
  if (started) return
  started = true
  if (!shouldStartAdmin()) return
  set({ state: 'checking' })
  try {
    await settleState()
    watchAuth()
  } catch {
    set({ state: 'none' })
  }
}

interface AuthErrorLike {
  status?: number
  code?: string
  name?: string
}

function isRateLimit(error: AuthErrorLike, status: number): boolean {
  return status === 429 || error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit'
}

function isUnreachable(error: AuthErrorLike, status: number): boolean {
  return error.name === 'AuthRetryableFetchError' || status === 0 || status >= 500
}

/**
 * Any answer about the address itself counts as sent (same text for every e-mail, so nobody
 * can test who is admin). Rate limit → wait. Never reached the login service → failed.
 */
export function classifySendError(error: AuthErrorLike | null | undefined): SendResult {
  if (!error) return 'sent'
  const status = typeof error.status === 'number' ? error.status : 0
  if (isRateLimit(error, status)) return 'wait'
  if (isUnreachable(error, status)) return 'failed'
  return 'sent'
}

/** Refused code (403 otp_expired: wrong AND expired, or any other 4xx) → wrong. 429 → wait. Unreachable → failed. */
export function classifyVerifyError(error: AuthErrorLike | null | undefined): VerifyResult {
  if (!error) return 'ok'
  const status = typeof error.status === 'number' ? error.status : 0
  if (isRateLimit(error, status)) return 'wait'
  if (isUnreachable(error, status)) return 'failed'
  return 'wrong'
}

export async function sendLoginCode(email: string): Promise<SendResult> {
  if (offline()) return 'failed'
  try {
    const pending = getAdminClient()
    if (!pending) return 'failed'
    const client = await pending
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } })
    return classifySendError(error)
  } catch {
    return 'failed'
  }
}

export async function verifyLoginCode(email: string, code: string): Promise<VerifyResult> {
  if (offline()) return 'failed'
  try {
    const pending = getAdminClient()
    if (!pending) return 'failed'
    const client = await pending
    const { data, error } = await client.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' })
    const result = classifyVerifyError(error)
    if (result !== 'ok') return result
    if (!data.session) return 'failed'
    started = true
    removeKey(CODE_VERIFIER_KEY)
    clearPendingLogin()
    await settleState()
    watchAuth()
    return 'ok'
  } catch {
    return 'failed'
  }
}

/** Logs out at once: server sign-out if reachable, and always the local keys. */
export async function signOutAdmin(): Promise<void> {
  const pending = getAdminClient()
  if (pending) {
    try {
      const client = await pending
      await client.auth.signOut({ scope: 'local' })
    } catch {
      // offline: the local removal below is what matters
    }
  }
  removeKey(ADMIN_AUTH_KEY)
  removeKey(CODE_VERIFIER_KEY)
  clearPendingLogin()
  clearAdminBank()
  set({ state: 'none' })
}

/** Tests only. */
export function resetAdminForTests(): void {
  started = false
  watching = false
}

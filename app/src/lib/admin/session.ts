/**
 * Slice 32 (B2 + C1, lazy chunk) — admin login with a link sent by e-mail.
 *
 * Loaded only when the address carries a login return (`?code=` / `?error_code=`), when this
 * browser already holds an admin session (`gymnastics-planner-admin-auth-v1`), or when someone
 * opens the login sheet / logs out. State lives in state.ts (always loaded, tiny).
 */
import { clearAdminBank, loadAdminBank } from './adminBank'
import { readAuthReturn } from './authReturn'
import { getAdminClient } from './client'
import { ADMIN_AUTH_KEY, getAdminSnapshot, setAdminSnapshot, shouldStartAdmin } from './state'

export type SendResult = 'sent' | 'wait' | 'failed'

let started = false
let watching = false
const set = setAdminSnapshot

function offline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

async function settleState(linkFailed: boolean): Promise<void> {
  const pending = getAdminClient()
  if (!pending) return set({ state: 'none', linkFailed })
  const client = await pending
  const { data } = await client.auth.getSession()
  if (!data.session) {
    clearAdminBank()
    return set({ state: 'none', linkFailed })
  }
  const { data: row, error } = await client.from('admins').select('user_id').maybeSingle()
  if (error) {
    // Could not ask (network): no admin UI, but keep the session for the next load.
    clearAdminBank()
    return set({ state: 'none', linkFailed })
  }
  if (!row) {
    clearAdminBank()
    return set({ state: 'notAdmin', linkFailed: false })
  }
  set({ state: 'admin', linkFailed: false })
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

/**
 * Once per load, from main.tsx. Cleans `?code=` / error params from the address first
 * (keeping `#dela=…`), then exchanges the code with the verifier this browser saved.
 */
export async function startAdmin(): Promise<void> {
  if (started) return
  started = true
  if (!shouldStartAdmin()) return
  set({ state: 'checking' })
  const ret = readAuthReturn(window.location.href)
  if (ret.cleanUrl !== null) window.history.replaceState(window.history.state, '', ret.cleanUrl)
  let linkFailed = ret.failed
  try {
    const pending = getAdminClient()
    if (!pending) return set({ state: 'none', linkFailed })
    const client = await pending
    if (ret.code) {
      const { error } = await client.auth.exchangeCodeForSession(ret.code)
      if (error) linkFailed = true
    }
    await settleState(linkFailed)
    watchAuth()
  } catch {
    set({ state: 'none', linkFailed })
  }
}

/** Where the e-mail link comes back to: the app's own address (Pages base path). */
export function loginRedirectUrl(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`
}

interface SendError {
  status?: number
  code?: string
  name?: string
}

/**
 * Any answer about the address itself counts as sent (same text for every e-mail, so nobody
 * can test who is admin). Rate limit → wait. Never reached the login service → failed.
 */
export function classifySendError(error: SendError | null | undefined): SendResult {
  if (!error) return 'sent'
  const status = typeof error.status === 'number' ? error.status : 0
  if (status === 429 || error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') return 'wait'
  if (error.name === 'AuthRetryableFetchError' || status === 0 || status >= 500) return 'failed'
  return 'sent'
}

export async function sendLoginLink(email: string): Promise<SendResult> {
  if (offline()) return 'failed'
  try {
    const pending = getAdminClient()
    if (!pending) return 'failed'
    const client = await pending
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: loginRedirectUrl() },
    })
    return classifySendError(error)
  } catch {
    return 'failed'
  }
}

/** Logs out at once: server sign-out if reachable, and always the local session key. */
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
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY)
    localStorage.removeItem(`${ADMIN_AUTH_KEY}-code-verifier`)
  } catch {
    // private mode
  }
  clearAdminBank()
  set({ state: 'none', linkFailed: false })
}

/** Tests only. */
export function resetAdminForTests(): void {
  started = false
  watching = false
}

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { setBankEnvForTests } from '../bankConfig.ts'
import { resetBankForTests } from '../bank.ts'
import { getAdminBank } from './state.ts'
import { setAdminClientForTests } from './client.ts'
import {
  classifySendError,
  classifyVerifyError,
  resetAdminForTests,
  sendLoginCode,
  signOutAdmin,
  startAdmin,
  verifyLoginCode,
} from './session.ts'
import { ADMIN_PENDING_KEY, writePendingLogin } from './loginCode.ts'
import { ADMIN_AUTH_KEY, getAdminSnapshot, resetAdminStateForTests, shouldStartAdmin } from './state.ts'
import { activityToBankRow } from '../bankRow.ts'
import { seedActivities } from '../../data/seedActivities.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void Reflect.apply(Map.prototype.delete, mem, [k]),
    clear: () => mem.clear(),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size
    },
  },
})

let href = 'https://drevmok.github.io/traningsplaneringen/'
const replaced: string[] = []
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    get location() {
      const u = new URL(href)
      return { href, origin: u.origin }
    },
    history: {
      state: null,
      replaceState: (_s: unknown, _t: string, url: string) => {
        replaced.push(url)
        href = new URL(url, href).href
      },
    },
  },
})

const ENV = { VITE_SUPABASE_URL: 'https://example-ref.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }

interface FakeOpts {
  session?: boolean
  isAdmin?: boolean
  adminsError?: boolean
  otpError?: { status?: number; code?: string; name?: string } | null
  verifyError?: { status?: number; code?: string; name?: string } | null
  verifyNoSession?: boolean
}

function fakeClient(o: FakeOpts) {
  const calls: string[] = []
  const otpArgs: unknown[] = []
  const verifyArgs: unknown[] = []
  let session = o.session ?? false
  const rows = seedActivities.slice(0, 3).map((a, i) => ({
    ...activityToBankRow(a, i, null),
    status: i === 2 ? 'pending' : 'published',
    updated_at: '2026-10-02T10:00:00.000Z',
    updated_by: 'seed-script',
  }))
  const query = (table: string) => {
    const q = {
      select: () => q,
      order: () => q,
      abortSignal: async () => ({ data: table === 'exercises' ? rows : [], error: null }),
      maybeSingle: async () => {
        calls.push(`admins:${table}`)
        if (o.adminsError) return { data: null, error: { message: 'net' } }
        return { data: o.isAdmin ? { user_id: 'u1' } : null, error: null }
      },
    }
    return q
  }
  return {
    calls,
    otpArgs,
    verifyArgs,
    auth: {
      getSession: async () => ({ data: { session: session ? { user: { id: 'u1' } } : null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOtp: async (args: unknown) => {
        otpArgs.push(args)
        calls.push('otp')
        return { data: {}, error: o.otpError ?? null }
      },
      verifyOtp: async (args: unknown) => {
        verifyArgs.push(args)
        calls.push('verify')
        if (o.verifyError) return { data: { session: null, user: null }, error: o.verifyError }
        if (o.verifyNoSession) return { data: { session: null, user: null }, error: null }
        session = true
        mem.set(ADMIN_AUTH_KEY, '{"access_token":"x"}')
        return { data: { session: { user: { id: 'u1' } }, user: { id: 'u1' } }, error: null }
      },
      signOut: async () => {
        calls.push('signOut')
        session = false
        return { error: null }
      },
    },
    from: (table: string) => query(table),
  }
}

beforeEach(() => {
  mem.clear()
  replaced.length = 0
  href = 'https://drevmok.github.io/traningsplaneringen/'
  setBankEnvForTests(ENV)
  resetBankForTests()
  resetAdminStateForTests()
  resetAdminForTests()
})
afterEach(() => {
  setAdminClientForTests(null)
  setBankEnvForTests(undefined)
})

describe('classifySendError (Slice 32/33)', () => {
  it('no error → sent', () => assert.equal(classifySendError(null), 'sent'))
  it('rate limit → wait', () => {
    assert.equal(classifySendError({ status: 429 }), 'wait')
    assert.equal(classifySendError({ status: 400, code: 'over_email_send_rate_limit' }), 'wait')
    assert.equal(classifySendError({ status: 400, code: 'over_request_rate_limit' }), 'wait')
  })
  it('network / 5xx → failed', () => {
    assert.equal(classifySendError({ name: 'AuthRetryableFetchError', status: 0 }), 'failed')
    assert.equal(classifySendError({ status: 502 }), 'failed')
    assert.equal(classifySendError({}), 'failed')
  })
  it('unknown address / sign-ups off → sent (no account guessing, AC 8)', () => {
    assert.equal(classifySendError({ status: 422, code: 'otp_disabled' }), 'sent')
    assert.equal(classifySendError({ status: 400, code: 'signup_disabled' }), 'sent')
  })
})

describe('classifyVerifyError (Slice 33)', () => {
  it('no error → ok', () => assert.equal(classifyVerifyError(null), 'ok'))
  it('refused code (wrong or expired, 403 otp_expired) → wrong', () => {
    assert.equal(classifyVerifyError({ status: 403, code: 'otp_expired' }), 'wrong')
    assert.equal(classifyVerifyError({ status: 400, code: 'validation_failed' }), 'wrong')
  })
  it('rate limit → wait', () => {
    assert.equal(classifyVerifyError({ status: 429 }), 'wait')
    assert.equal(classifyVerifyError({ status: 400, code: 'over_request_rate_limit' }), 'wait')
    assert.equal(classifyVerifyError({ status: 400, code: 'over_email_send_rate_limit' }), 'wait')
  })
  it('network / 5xx → failed', () => {
    assert.equal(classifyVerifyError({ name: 'AuthRetryableFetchError', status: 0 }), 'failed')
    assert.equal(classifyVerifyError({ status: 500 }), 'failed')
    assert.equal(classifyVerifyError({}), 'failed')
  })
})

describe('shouldStartAdmin (Slice 33)', () => {
  it('bank off → never', () => {
    setBankEnvForTests({})
    mem.set(ADMIN_AUTH_KEY, '{}')
    assert.equal(shouldStartAdmin(), false)
  })
  it('plain coach visit, old ?code= / ?error_code= address → no', () => {
    href = 'https://x.test/?code=abc#dela=a'
    assert.equal(shouldStartAdmin(), false)
    href = 'https://x.test/?error_code=otp_expired'
    assert.equal(shouldStartAdmin(), false)
  })
  it('a pending code login alone does not start admin', () => {
    writePendingLogin('a@b.se', Date.now())
    assert.equal(shouldStartAdmin(), false)
  })
  it('stored session → yes', () => {
    mem.set(ADMIN_AUTH_KEY, '{}')
    assert.equal(shouldStartAdmin(), true)
  })
})

describe('startAdmin (Slice 32/33: stored session only)', () => {
  it('stored session + on admins → admin, admin bank loaded, address untouched', async () => {
    href = 'https://drevmok.github.io/traningsplaneringen/#dela=v1.x'
    mem.set(ADMIN_AUTH_KEY, '{}')
    const fake = fakeClient({ session: true, isAdmin: true })
    setAdminClientForTests(fake)
    await startAdmin()
    assert.deepEqual(replaced, [])
    assert.deepEqual(getAdminSnapshot(), { state: 'admin' })
    assert.equal(getAdminBank().loaded, true)
    assert.equal(getAdminBank().counts.pending, 1)
  })
  it('no stored session → nothing (no client call)', async () => {
    href = 'https://drevmok.github.io/traningsplaneringen/?code=old'
    const fake = fakeClient({})
    setAdminClientForTests(fake)
    await startAdmin()
    assert.deepEqual(fake.calls, [])
    assert.deepEqual(getAdminSnapshot(), { state: 'none' })
  })
  it('session but not on admins → notAdmin, no admin bank', async () => {
    mem.set(ADMIN_AUTH_KEY, '{}')
    setAdminClientForTests(fakeClient({ session: true, isAdmin: false }))
    await startAdmin()
    assert.equal(getAdminSnapshot().state, 'notAdmin')
    assert.equal(getAdminBank().loaded, false)
  })
  it('admins check fails (network) → none, session kept', async () => {
    mem.set(ADMIN_AUTH_KEY, '{}')
    setAdminClientForTests(fakeClient({ session: true, adminsError: true }))
    await startAdmin()
    assert.equal(getAdminSnapshot().state, 'none')
    assert.equal(mem.has(ADMIN_AUTH_KEY), true)
  })
  it('Logga ut removes the session, verifier and pending keys and the admin bank', async () => {
    mem.set(ADMIN_AUTH_KEY, '{}')
    mem.set(`${ADMIN_AUTH_KEY}-code-verifier`, 'v')
    writePendingLogin('a@b.se', Date.now())
    const fake = fakeClient({ session: true, isAdmin: true })
    setAdminClientForTests(fake)
    await startAdmin()
    assert.equal(getAdminSnapshot().state, 'admin')
    await signOutAdmin()
    assert.ok(fake.calls.includes('signOut'))
    assert.equal(mem.has(ADMIN_AUTH_KEY), false)
    assert.equal(mem.has(`${ADMIN_AUTH_KEY}-code-verifier`), false)
    assert.equal(mem.has(ADMIN_PENDING_KEY), false)
    assert.equal(getAdminSnapshot().state, 'none')
    assert.equal(getAdminBank().loaded, false)
  })
})

describe('sendLoginCode (Slice 33)', () => {
  it('never creates users and sends no return address', async () => {
    const fake = fakeClient({})
    setAdminClientForTests(fake)
    assert.equal(await sendLoginCode('  a@b.se '), 'sent')
    assert.deepEqual(fake.otpArgs, [{ email: 'a@b.se', options: { shouldCreateUser: false } }])
  })
  it('maps rate limit and server errors', async () => {
    setAdminClientForTests(fakeClient({ otpError: { status: 429, code: 'over_email_send_rate_limit' } }))
    assert.equal(await sendLoginCode('a@b.se'), 'wait')
    setAdminClientForTests(fakeClient({ otpError: { status: 503 } }))
    assert.equal(await sendLoginCode('a@b.se'), 'failed')
  })
  it('bank off → failed', async () => {
    setBankEnvForTests({})
    assert.equal(await sendLoginCode('a@b.se'), 'failed')
  })
})

describe('verifyLoginCode (Slice 33)', () => {
  it('right code + on admins → admin; verifier and pending keys removed', async () => {
    mem.set(`${ADMIN_AUTH_KEY}-code-verifier`, 'v')
    writePendingLogin('a@b.se', Date.now())
    const fake = fakeClient({ isAdmin: true })
    setAdminClientForTests(fake)
    assert.equal(await verifyLoginCode(' a@b.se ', '123456'), 'ok')
    assert.deepEqual(fake.verifyArgs, [{ email: 'a@b.se', token: '123456', type: 'email' }])
    assert.deepEqual(getAdminSnapshot(), { state: 'admin' })
    assert.equal(getAdminBank().loaded, true)
    assert.equal(mem.has(`${ADMIN_AUTH_KEY}-code-verifier`), false)
    assert.equal(mem.has(ADMIN_PENDING_KEY), false)
    assert.equal(mem.has(ADMIN_AUTH_KEY), true)
  })
  it('right code, not on admins → notAdmin', async () => {
    setAdminClientForTests(fakeClient({ isAdmin: false }))
    assert.equal(await verifyLoginCode('a@b.se', '123456'), 'ok')
    assert.equal(getAdminSnapshot().state, 'notAdmin')
    assert.equal(getAdminBank().loaded, false)
  })
  it('wrong / expired code → wrong, pending kept, still none', async () => {
    writePendingLogin('a@b.se', Date.now())
    setAdminClientForTests(fakeClient({ verifyError: { status: 403, code: 'otp_expired' } }))
    assert.equal(await verifyLoginCode('a@b.se', '000000'), 'wrong')
    assert.equal(mem.has(ADMIN_PENDING_KEY), true)
    assert.equal(getAdminSnapshot().state, 'none')
  })
  it('429 → wait; 5xx → failed; no session in answer → failed', async () => {
    setAdminClientForTests(fakeClient({ verifyError: { status: 429, code: 'over_request_rate_limit' } }))
    assert.equal(await verifyLoginCode('a@b.se', '123456'), 'wait')
    setAdminClientForTests(fakeClient({ verifyError: { status: 502 } }))
    assert.equal(await verifyLoginCode('a@b.se', '123456'), 'failed')
    setAdminClientForTests(fakeClient({ verifyNoSession: true }))
    assert.equal(await verifyLoginCode('a@b.se', '123456'), 'failed')
  })
})

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { setBankEnvForTests } from '../bankConfig.ts'
import { resetBankForTests } from '../bank.ts'
import { getAdminBank } from './state.ts'
import { setAdminClientForTests } from './client.ts'
import { classifySendError, resetAdminForTests, sendLoginLink, signOutAdmin, startAdmin } from './session.ts'
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
  exchangeError?: boolean
  session?: boolean
  isAdmin?: boolean
  adminsError?: boolean
  otpError?: { status?: number; code?: string; name?: string } | null
}

function fakeClient(o: FakeOpts) {
  const calls: string[] = []
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
    auth: {
      exchangeCodeForSession: async (code: string) => {
        calls.push(`exchange:${code}`)
        if (o.exchangeError) return { data: null, error: { message: 'bad_code_verifier', status: 400 } }
        session = true
        return { data: {}, error: null }
      },
      getSession: async () => ({ data: { session: session ? { user: { id: 'u1' } } : null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOtp: async (args: { email: string; options: { shouldCreateUser: boolean; emailRedirectTo: string } }) => {
        calls.push(`otp:${args.email}:${args.options.shouldCreateUser}:${args.options.emailRedirectTo}`)
        return { data: {}, error: o.otpError ?? null }
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

describe('classifySendError (Slice 32)', () => {
  it('no error → sent', () => assert.equal(classifySendError(null), 'sent'))
  it('rate limit → wait', () => {
    assert.equal(classifySendError({ status: 429 }), 'wait')
    assert.equal(classifySendError({ status: 400, code: 'over_email_send_rate_limit' }), 'wait')
  })
  it('network / 5xx → failed', () => {
    assert.equal(classifySendError({ name: 'AuthRetryableFetchError', status: 0 }), 'failed')
    assert.equal(classifySendError({ status: 502 }), 'failed')
    assert.equal(classifySendError({}), 'failed')
  })
  it('unknown address / sign-ups off → sent (no account guessing)', () => {
    assert.equal(classifySendError({ status: 422, code: 'otp_disabled' }), 'sent')
    assert.equal(classifySendError({ status: 400, code: 'signup_disabled' }), 'sent')
  })
})

describe('shouldStartAdmin (Slice 32)', () => {
  it('bank off → never', () => {
    setBankEnvForTests({})
    mem.set(ADMIN_AUTH_KEY, '{}')
    assert.equal(shouldStartAdmin('https://x.test/?code=abc'), false)
  })
  it('plain coach visit → no', () => assert.equal(shouldStartAdmin('https://x.test/#dela=a'), false))
  it('code, error or stored session → yes', () => {
    assert.equal(shouldStartAdmin('https://x.test/?code=abc'), true)
    assert.equal(shouldStartAdmin('https://x.test/?error_code=otp_expired'), true)
    mem.set(ADMIN_AUTH_KEY, '{}')
    assert.equal(shouldStartAdmin('https://x.test/'), true)
  })
})

describe('startAdmin (Slice 32)', () => {
  it('good code + on admins → admin, URL cleaned, #dela= kept, admin bank loaded', async () => {
    href = 'https://drevmok.github.io/traningsplaneringen/?code=c1#dela=v1.x'
    const fake = fakeClient({ isAdmin: true })
    setAdminClientForTests(fake)
    await startAdmin()
    assert.deepEqual(replaced, ['/traningsplaneringen/#dela=v1.x'])
    assert.ok(fake.calls.includes('exchange:c1'))
    assert.deepEqual(getAdminSnapshot(), { state: 'admin', linkFailed: false })
    assert.equal(getAdminBank().loaded, true)
    assert.equal(getAdminBank().counts.pending, 1)
  })
  it('failed exchange → linkFailed (login sheet), not admin', async () => {
    href = 'https://drevmok.github.io/traningsplaneringen/?code=used'
    setAdminClientForTests(fakeClient({ exchangeError: true }))
    await startAdmin()
    assert.deepEqual(getAdminSnapshot(), { state: 'none', linkFailed: true })
  })
  it('?error_code= → linkFailed without any exchange', async () => {
    href = 'https://drevmok.github.io/traningsplaneringen/?error=access_denied&error_code=otp_expired'
    const fake = fakeClient({})
    setAdminClientForTests(fake)
    await startAdmin()
    assert.equal(fake.calls.some((c) => c.startsWith('exchange')), false)
    assert.deepEqual(getAdminSnapshot(), { state: 'none', linkFailed: true })
    assert.deepEqual(replaced, ['/traningsplaneringen/'])
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
  it('Logga ut removes the session keys and admin bank', async () => {
    mem.set(ADMIN_AUTH_KEY, '{}')
    mem.set(`${ADMIN_AUTH_KEY}-code-verifier`, 'v')
    const fake = fakeClient({ session: true, isAdmin: true })
    setAdminClientForTests(fake)
    await startAdmin()
    assert.equal(getAdminSnapshot().state, 'admin')
    await signOutAdmin()
    assert.ok(fake.calls.includes('signOut'))
    assert.equal(mem.has(ADMIN_AUTH_KEY), false)
    assert.equal(mem.has(`${ADMIN_AUTH_KEY}-code-verifier`), false)
    assert.equal(getAdminSnapshot().state, 'none')
    assert.equal(getAdminBank().loaded, false)
  })
})

describe('sendLoginLink (Slice 32)', () => {
  it('never creates users and returns to the app address', async () => {
    const fake = fakeClient({})
    setAdminClientForTests(fake)
    assert.equal(await sendLoginLink('  a@b.se '), 'sent')
    assert.deepEqual(fake.calls, ['otp:a@b.se:false:https://drevmok.github.io/'])
  })
  it('maps rate limit and server errors', async () => {
    setAdminClientForTests(fakeClient({ otpError: { status: 429, code: 'over_email_send_rate_limit' } }))
    assert.equal(await sendLoginLink('a@b.se'), 'wait')
    setAdminClientForTests(fakeClient({ otpError: { status: 503 } }))
    assert.equal(await sendLoginLink('a@b.se'), 'failed')
  })
})

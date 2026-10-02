/**
 * Slice 31 (A1) — where the shared bank lives. Both values are public by design
 * (project URL + publishable key) and come only from the build env
 * (GitHub repository variables → Pages workflow, or app/.env.local).
 * Either value missing → bank off: bundled seeds only, no request, no stale line.
 */
export interface BankConfig {
  url: string
  key: string
}

export interface BankEnv {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

let override: BankEnv | undefined

function buildEnv(): BankEnv {
  try {
    const env = import.meta.env as BankEnv | undefined
    return {
      VITE_SUPABASE_URL: env?.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: env?.VITE_SUPABASE_PUBLISHABLE_KEY,
    }
  } catch {
    return {}
  }
}

/** https origin + a key that is not a secret key, or null (bank off). */
export function bankConfigFrom(env: BankEnv): BankConfig | null {
  const url = String(env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
  const key = String(env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()
  if (!url || !key) return null
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(url)) return null
  if (!isPublicKey(key)) return null
  return { url, key }
}

/**
 * Only keys meant for browsers: the publishable key, or a legacy JWT whose role is `anon`.
 * Anything else (a key that bypasses RLS) turns the bank off instead of shipping it.
 */
function isPublicKey(key: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true
  const parts = key.split('.')
  if (parts.length !== 3 || !key.startsWith('eyJ')) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown }
    return payload.role === 'anon'
  } catch {
    return false
  }
}

export function bankConfig(): BankConfig | null {
  return bankConfigFrom(override ?? buildEnv())
}

export function bankEnabled(): boolean {
  return bankConfig() !== null
}

/** Tests only: pretend the build had these values (undefined = real build env). */
export function setBankEnvForTests(env: BankEnv | undefined): void {
  override = env
}

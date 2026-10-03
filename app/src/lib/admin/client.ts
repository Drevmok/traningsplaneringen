/**
 * Slice 32 — the Supabase client for admins only, loaded lazily.
 *
 * `@supabase/supabase-js` is imported dynamically, so it lands in its own chunk and a
 * normal coach visit never downloads it (AC 26). The client only ever holds the public
 * project URL + publishable key (from the build env) and, after login, the admin's own
 * session. PKCE, never implicit: tokens must not land in `#…`, which `#dela=` share links use.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { bankConfig } from '../bankConfig'
import { ADMIN_AUTH_KEY } from './state'

let clientPromise: Promise<SupabaseClient> | null = null

/** null when the bank is not configured (no login possible). Rejects if the chunk can't load. */
export function getAdminClient(): Promise<SupabaseClient> | null {
  if (clientPromise) return clientPromise
  const config = bankConfig()
  if (!config) return null
  clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(config.url, config.key, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        // session.ts handles ?code= / ?error_code= itself (clean URL first, keep #dela=).
        detectSessionInUrl: false,
        autoRefreshToken: true,
        storageKey: ADMIN_AUTH_KEY,
      },
    }),
  )
  clientPromise.catch(() => {
    clientPromise = null
  })
  return clientPromise
}

/** Tests only: inject a fake client (or null to reset). */
export function setAdminClientForTests(client: unknown): void {
  clientPromise = client ? Promise.resolve(client as SupabaseClient) : null
}

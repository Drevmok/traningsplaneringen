/**
 * Slice 32 — reading the address after the e-mail link (pure, unit-tested).
 *
 * Good link  → `?code=…` (PKCE). Bad link → `?error=…&error_code=…&error_description=…`,
 * sometimes also mirrored in the hash (`#error=…&sb=`). We strip only those parameters and
 * keep everything else, including a `#dela=…` share hash.
 */
const AUTH_PARAMS = ['code', 'error', 'error_code', 'error_description']

export interface AuthReturn {
  code: string | null
  /** Expired, used or otherwise refused link (before any exchange). */
  failed: boolean
  /** The cleaned address to put back with history.replaceState, or null when nothing to clean. */
  cleanUrl: string | null
}

function isAuthErrorHash(hash: string): boolean {
  if (!hash || hash === '#') return false
  const params = new URLSearchParams(hash.slice(1))
  return params.has('error_code') || params.has('error_description') || (params.has('error') && params.has('sb'))
}

export function readAuthReturn(href: string): AuthReturn {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return { code: null, failed: false, cleanUrl: null }
  }
  const code = url.searchParams.get('code')
  const queryError = url.searchParams.has('error_code') || url.searchParams.has('error')
  const hashError = isAuthErrorHash(url.hash)
  const touched = AUTH_PARAMS.some((p) => url.searchParams.has(p)) || hashError
  if (!touched) return { code: null, failed: false, cleanUrl: null }
  const kept = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    if (!AUTH_PARAMS.includes(key)) kept.append(key, value)
  })
  const search = kept.toString()
  const hash = hashError ? '' : url.hash
  const cleanUrl = `${url.pathname}${search ? `?${search}` : ''}${hash}`
  return { code: queryError ? null : code, failed: queryError || hashError, cleanUrl }
}

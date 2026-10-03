/**
 * Slice 33 — cleaner for leftovers of the retired e-mail link (pure, unit-tested, eager + tiny).
 *
 * Slice 32 logged admins in with a link that came back as `?code=…` or, when refused, as
 * `?error=…&error_code=…&error_description=…` (sometimes mirrored in the hash: `#error=…&sb=`).
 * Admins now type a code instead, so an old link from a mail only needs a clean address:
 * we strip exactly those parameters, never read or use a code, and keep everything else,
 * including a `#dela=…` share hash.
 */
const AUTH_PARAMS = ['code', 'error', 'error_code', 'error_description']

function isAuthErrorHash(hash: string): boolean {
  if (!hash || hash === '#') return false
  const params = new URLSearchParams(hash.slice(1))
  return params.has('error_code') || params.has('error_description') || (params.has('error') && params.has('sb'))
}

/** The cleaned path + query + hash to put back with history.replaceState, or null when nothing to clean. */
export function cleanAuthLeftovers(href: string): string | null {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  const hashError = isAuthErrorHash(url.hash)
  const touched = AUTH_PARAMS.some((p) => url.searchParams.has(p)) || hashError
  if (!touched) return null
  const kept = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    if (!AUTH_PARAMS.includes(key)) kept.append(key, value)
  })
  const search = kept.toString()
  const hash = hashError ? '' : url.hash
  return `${url.pathname}${search ? `?${search}` : ''}${hash}`
}

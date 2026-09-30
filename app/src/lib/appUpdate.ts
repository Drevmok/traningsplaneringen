/** Build id baked in by Vite. Preview and local builds stay "dev". */
export function localBuild(): string {
  const env = import.meta.env as { VITE_APP_BUILD?: string }
  const value = env.VITE_APP_BUILD
  return typeof value === 'string' && value.length > 0 ? value : 'dev'
}

export function isNewerBuild(local: string, remote: string | null): boolean {
  if (!remote) return false
  if (!local || local === 'dev') return false
  return remote !== local
}

/** New query so a hemskärms-app actually fetches. Hash (delad länk) stays. */
export function withUpdateParam(href: string, version: string): string {
  const url = new URL(href)
  url.searchParams.set('v', version)
  return url.toString()
}

export async function fetchRemoteBuild(baseUrl: string): Promise<string | null> {
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const url = new URL(`${root}version.json`, window.location.origin)
  url.searchParams.set('t', String(Date.now()))
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { build?: unknown }
    return typeof data.build === 'string' && data.build.length > 0 ? data.build : null
  } catch {
    return null
  }
}

export function applyUpdate(version?: string | null): void {
  const stamp = version && version.length > 0 ? version : String(Date.now())
  window.location.replace(withUpdateParam(window.location.href, stamp))
}

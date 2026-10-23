// Slice 50: Playwright recorder (PW_CORE shim). Re-exports playwright-core; every browser context logs each
// request URL to $NETLOG and aborts any request to the live project host (logged as BLOCKED). AC6.
import { appendFileSync } from 'node:fs'
import * as real from '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'
export * from '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'
const LOG = process.env.NETLOG ?? '/tmp/tpv-netlog.log'
const TAG = process.env.NETTAG ?? (process.argv[1] || '').split('/').pop()
const LIVE = /fhzqwbdlejzohetdoluw/
const log = (s) => { try { appendFileSync(LOG, `${TAG}\t${s}\n`) } catch {} }
async function hook(ctx) {
  ctx.on('request', (r) => log(`${r.method()}\t${r.url().slice(0, 300)}`))
  await ctx.route(LIVE, (route) => { log(`BLOCKED\t${route.request().url().slice(0, 300)}`); return route.abort() }).catch(() => {})
  return ctx
}
function wrapBrowser(b) {
  const nc = b.newContext.bind(b), np = b.newPage.bind(b)
  b.newContext = async (...a) => hook(await nc(...a))
  b.newPage = async (...a) => { const p = await np(...a); await hook(p.context()); return p }
  return b
}
const c = real.chromium
export const chromium = new Proxy(c, { get(t, k) {
  if (k === 'launch') return async (...a) => wrapBrowser(await t.launch(...a))
  if (k === 'launchPersistentContext') return async (...a) => hook(await t.launchPersistentContext(...a))
  const v = t[k]; return typeof v === 'function' ? v.bind(t) : v } })
export default { ...real, chromium }

// Slice 47 smoke helper — an in-memory stand-in for the Supabase REST/auth calls the app makes.
// Never talks to the real project: every *.supabase.co request is answered here (or aborted).
import { readFileSync } from 'node:fs'
export function fakeBank(seedPath) {
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
  const t0 = Date.parse('2026-10-01T10:00:00Z')
  let tick = 0
  const stamp = () => new Date(t0 + ++tick * 1000).toISOString()
  const rows = seed.exercises.map((r) => ({ status: 'published', ...r, updated_at: stamp(), updated_by: 'seed-script' }))
  const admins = new Set()
  const log = []
  const byId = (id) => rows.find((r) => r.id === id)
  const eq = (u, col) => { const v = u.searchParams.get(col); return v?.startsWith('eq.') ? v.slice(3) : null }
  async function handle(route, email) {
    const req = route.request(); const u = new URL(req.url()); const p = u.pathname; const m = req.method()
    const json = (status, body, headers = {}) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', ...headers }, body: body === undefined ? '' : JSON.stringify(body) })
    if (m === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } })
    log.push(`${m} ${p}${u.search}`)
    if (p.startsWith('/auth/v1/logout')) return json(204)
    if (p.startsWith('/auth/v1/user')) return email ? json(200, { id: 'u-' + email, aud: 'authenticated', role: 'authenticated', email }) : json(401, { message: 'no' })
    if (p.startsWith('/auth/')) return json(400, { message: 'not faked' })
    if (p === '/rest/v1/redskap') return json(200, seed.redskap)
    if (p === '/rest/v1/club_templates') return json(200, [])
    if (p === '/rest/v1/admins') {
      const isAdmin = email && admins.has(email)
      const single = (req.headers()['accept'] || '').includes('vnd.pgrst.object')
      if (single) return isAdmin ? json(200, { user_id: 'u-' + email }) : json(406, { code: 'PGRST116', message: '0 rows' })
      return json(200, isAdmin ? [{ user_id: 'u-' + email }] : [])
    }
    if (p === '/rest/v1/exercises') {
      if (m === 'GET') {
        const st = u.searchParams.get('status'); const id = eq(u, 'id')
        let out = rows
        if (st === 'in.(published,hidden)' || !email || !admins.has(email)) out = out.filter((r) => r.status !== 'pending')
        if (id) out = out.filter((r) => r.id === id)
        const coach = st === 'in.(published,hidden)'
        return json(200, out.map((r) => { if (!coach) return r; const { updated_at, updated_by, ...rest } = r; return rest }))
      }
      if (!email || !admins.has(email)) return json(403, { code: '42501', message: 'denied' })
      const body = JSON.parse(req.postData() || 'null')
      if (m === 'POST') {
        const list = Array.isArray(body) ? body : [body]
        for (const r of list) { if (byId(r.id)) return json(409, { code: '23505', message: 'dup' }) }
        const added = list.map((r) => ({ difficulty: 'easy', watch_for_required: true, legacy_equipment: null, progression_of: null, regression_of: null, new_coach_ok: false, sort_order: 10000, ...r, updated_at: stamp(), updated_by: email }))
        rows.push(...added)
        return json(201, added.map((r) => ({ id: r.id })))
      }
      if (m === 'PATCH') {
        const id = eq(u, 'id'); const at = eq(u, 'updated_at'); const r = byId(id)
        if (!r || (at && r.updated_at !== at)) return json(200, [])
        Object.assign(r, body, { updated_at: stamp(), updated_by: email })
        return json(200, [{ id }])
      }
    }
    return json(404, { message: 'not faked ' + p })
  }
  return { rows, admins, log, handle, byId }
}
export function fakeSessionValue(email) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600 * 24
  const user = { id: 'u-' + email, aud: 'authenticated', role: 'authenticated', email, app_metadata: {}, user_metadata: {} }
  const access_token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, email, exp, role: 'authenticated', aud: 'authenticated' })}.sig`
  return JSON.stringify({ access_token, token_type: 'bearer', expires_in: 86400, expires_at: exp, refresh_token: 'r-' + email, user })
}

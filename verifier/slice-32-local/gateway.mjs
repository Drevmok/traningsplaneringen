// Local stand-in for the Supabase API gateway (Slice 32 smoke only — never for production).
// Reads its settings from the JSON file in $S32_ENV (written by setup.sh into /tmp, never the repo).
//
//   /rest/v1/*  → PostgREST     /auth/v1/*  → the auth server (GoTrue)
//
// Key rules, as on Supabase:
//   publishable key  → role anon, unless a user's access token rides in Authorization
//   bot (secret) key → role service_role; refused when the request comes from a browser (Origin)
//   missing / unknown / revoked key → 401
// Bot keys are read from a file on every request, so deleting a line = "delete the key in the dashboard".
// Request log (no key values) → $S32_DIR/gateway.log.jsonl
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'

const cfg = JSON.parse(fs.readFileSync(process.env.S32_ENV, 'utf8'))
const LOG = `${cfg.dir}/gateway.log.jsonl`

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}
function sign(payload) {
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(crypto.createHmac('sha256', cfg.jwtSecret).update(`${head}.${body}`).digest())
  return `${head}.${body}.${sig}`
}
const now = Math.floor(Date.now() / 1000)
const ANON_JWT = sign({ role: 'anon', iss: 'supabase-local', iat: now, exp: now + 86400 * 30 })
const SERVICE_JWT = sign({ role: 'service_role', iss: 'supabase-local', iat: now, exp: now + 86400 * 30 })

function botKeys() {
  try {
    return fs.readFileSync(cfg.botKeysFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  } catch {
    return []
  }
}

function cors(req) {
  return {
    'access-control-allow-origin': req.headers.origin || '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': req.headers['access-control-request-headers'] || 'apikey,authorization,content-type,prefer,x-client-info',
    'access-control-expose-headers': 'content-range,content-location,x-supabase-api-version',
    'access-control-max-age': '600',
    vary: 'Origin',
  }
}

function log(entry) {
  fs.appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), ...entry }) + '\n')
}

const OPEN_AUTH = ['/auth/v1/verify', '/auth/v1/callback', '/auth/v1/authorize']

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://gw')
  const path = url.pathname
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors(req))
    return res.end()
  }
  const isRest = path.startsWith('/rest/v1/')
  const isAuth = path.startsWith('/auth/v1/')
  if (!isRest && !isAuth) {
    res.writeHead(404, cors(req))
    return res.end()
  }
  const headers = { ...req.headers }
  delete headers.host
  delete headers['content-length']
  const key = headers.apikey || url.searchParams.get('apikey') || ''
  let kind = 'none'
  if (!OPEN_AUTH.includes(path)) {
    const auth = headers.authorization || ''
    if (!key) kind = 'missing'
    else if (key === cfg.publishableKey) kind = 'publishable'
    else if (botKeys().includes(key)) kind = 'bot'
    else kind = 'invalid'
    if (kind === 'missing' || kind === 'invalid') {
      log({ method: req.method, path, kind, status: 401 })
      res.writeHead(401, { 'content-type': 'application/json', ...cors(req) })
      return res.end(JSON.stringify({ message: kind === 'missing' ? 'No API key found in request' : 'Invalid API key' }))
    }
    if (kind === 'bot' && req.headers.origin) {
      log({ method: req.method, path, kind: 'bot-from-browser', status: 401 })
      res.writeHead(401, { 'content-type': 'application/json', ...cors(req) })
      return res.end(JSON.stringify({ message: 'Forbidden use of secret API key in browser' }))
    }
    const userToken = auth.startsWith('Bearer ') && auth.slice(7) !== key && auth.slice(7).split('.').length === 3
    if (!userToken) headers.authorization = `Bearer ${kind === 'bot' ? SERVICE_JWT : ANON_JWT}`
    else kind = `${kind}+user`
  }
  delete headers.apikey
  const target = isRest
    ? `http://127.0.0.1:${cfg.postgrestPort}${path.slice('/rest/v1'.length)}${url.search}`
    : `http://127.0.0.1:${cfg.gotruePort}${path.slice('/auth/v1'.length)}${url.search}`
  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = chunks.length ? Buffer.concat(chunks) : undefined
  try {
    const up = await fetch(target, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body, redirect: 'manual' })
    const out = { ...cors(req) }
    up.headers.forEach((v, k) => {
      if (!['content-encoding', 'transfer-encoding', 'connection', 'content-length'].includes(k)) out[k] = v
    })
    const buf = Buffer.from(await up.arrayBuffer())
    log({ method: req.method, path, query: url.search.length > 300 ? url.search.slice(0, 300) : url.search, kind, status: up.status })
    res.writeHead(up.status, out)
    res.end(buf)
  } catch (err) {
    log({ method: req.method, path, kind, status: 502, error: String(err) })
    res.writeHead(502, cors(req))
    res.end()
  }
})
server.listen(cfg.gatewayPort, '127.0.0.1')

// Slice 32 follow-up (Security Advisor lints 0028/0029): stamp_updated_by lives in private, nobody can call it,
// stamping still works. Needs setup.sh + start.sh + users.sh. Run: bun verifier/slice-32-local/check-advisor.ts
import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { $ } from 'bun'
const env = JSON.parse(readFileSync('/tmp/s32/env.json', 'utf8'))
const BOT = readFileSync('/tmp/s32/bot-keys.txt', 'utf8').split('\n')[0].trim()
const PUB = env.publishableKey
const GW = 'http://127.0.0.1:54340'
const REPO = new URL('../..', import.meta.url).pathname.replace(/\/$/, '')
const psql = async (sql: string) => (await $`env PGOPTIONS=-cclient_min_messages=warning psql -h 127.0.0.1 -p 54341 -U postgres -d bank -v ON_ERROR_STOP=1 -qAt -c ${sql}`.text()).trim()
const b64 = (o: any) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url')
const jwt = (sub: string, email: string) => {
  const now = Math.floor(Date.now() / 1000)
  const h = b64({ alg: 'HS256', typ: 'JWT' }), p = b64({ sub, email, role: 'authenticated', aud: 'authenticated', iat: now, exp: now + 600 })
  return `${h}.${p}.${createHmac('sha256', env.jwtSecret).update(`${h}.${p}`).digest('base64url')}`
}
let fails = 0
const ok = (cond: boolean, msg: string) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++ }

const schemas = await psql(`select coalesce(string_agg(n.nspname, ',' order by n.nspname), '') from pg_proc p join pg_namespace n on n.oid = p.pronamespace where p.proname = 'stamp_updated_by'`)
ok(schemas === 'private', `stamp_updated_by exists only in: ${schemas}`)
const trig = await psql(`select n.nspname || '.' || p.proname from pg_trigger t join pg_proc p on p.oid = t.tgfoid join pg_namespace n on n.oid = p.pronamespace where t.tgname = 'exercises_stamp' and t.tgrelid = 'public.exercises'::regclass`)
ok(trig === 'private.stamp_updated_by', `trigger exercises_stamp → ${trig}`)
const secdef = await psql(`select prosecdef from pg_proc where oid = 'private.stamp_updated_by()'::regprocedure`)
ok(secdef === 't', `still SECURITY DEFINER (needs auth.users read): ${secdef}`)
const acl = await psql(`select coalesce(proacl::text, 'NULL(default=PUBLIC execute!)') from pg_proc where oid = 'private.stamp_updated_by()'::regprocedure`)
for (const r of ['anon', 'authenticated', 'service_role']) {
  const v = await psql(`select has_function_privilege('${r}', 'private.stamp_updated_by()', 'execute')`)
  ok(v === 'f', `has_function_privilege(${r}, execute) = ${v}`)
}
console.log(`     proacl = ${acl}`)

const users = Object.fromEntries((await psql(`select email || '=' || id from auth.users`)).split('\n').map((l) => l.split('=')))
const callers: [string, Record<string, string>][] = [
  ['anon', { apikey: PUB }],
  ['authenticated (nonadmin)', { apikey: PUB, authorization: `Bearer ${jwt(users['nonadmin@test.local'], 'nonadmin@test.local')}` }],
  ['authenticated (admin)', { apikey: PUB, authorization: `Bearer ${jwt(users['admin@test.local'], 'admin@test.local')}` }],
]
for (const [who, h] of callers) {
  for (const path of ['/rest/v1/rpc/stamp_updated_by', '/rest/v1/rpc/private.stamp_updated_by']) {
    const r = await fetch(GW + path, { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body: '{}' })
    const body = await r.text()
    ok(r.status >= 400, `${who} POST ${path} → ${r.status} ${body.slice(0, 90)}`)
  }
}
// sanity: the user token is real (admin can read via REST)
{
  const r = await fetch(`${GW}/rest/v1/exercises?select=id&limit=1`, { headers: callers[2][1] })
  ok(r.status === 200, `sanity: admin token accepted by REST (${r.status})`)
}
// admin update through REST → stamped with e-mail even if the client sends another value
{
  const id = await psql(`select id from public.exercises where status = 'published' order by id limit 1`)
  const r = await fetch(`${GW}/rest/v1/exercises?id=eq.${id}`, { method: 'PATCH', headers: { ...callers[2][1], 'content-type': 'application/json', prefer: 'return=representation' }, body: JSON.stringify({ updated_by: 'spoof' }) })
  const rows = await r.json() as any[]
  const db = await psql(`select updated_by from public.exercises where id = '${id}'`)
  ok(r.status === 200 && rows[0]?.updated_by === 'admin@test.local' && db === 'admin@test.local', `admin PATCH ${id} via REST → ${r.status}, updated_by = ${db}`)
}
// bot push (service_role via secret key) keeps 'bot:planner'
{
  await psql(`delete from public.exercises where id in ('tech-test-formhopp-over-lagt-block','tech-test-aggrullning-kil')`)
  const out = await $`bun ${REPO}/tools/bank/push-promote.ts ${REPO}/tools/bank/fixtures/promote-2.json --url ${GW}`.env({ ...process.env, SUPABASE_PLANNER_BOT_KEY: BOT }).nothrow().quiet()
  const who = await psql(`select string_agg(id || ':' || updated_by || ':' || status, ' ' order by id) from public.exercises where id in ('tech-test-formhopp-over-lagt-block','tech-test-aggrullning-kil')`)
  ok(out.exitCode === 0 && /^tech-test-aggrullning-kil:bot:planner:pending tech-test-formhopp-over-lagt-block:bot:planner:pending$/.test(who), `bot push exit ${out.exitCode} → ${who}`)
}
// RLS smoke (rolls back)
{
  const r = await $`psql -h 127.0.0.1 -p 54341 -U postgres -d bank -v ON_ERROR_STOP=1 -qAt -f ${REPO}/tools/bank/out/setup-32/05-rls-smoke-valfri.sql`.nothrow().quiet()
  const txt = r.stdout.toString() + r.stderr.toString()
  const pass = (txt.match(/PASS/g) || []).length, fail = (txt.match(/FAIL/g) || []).length
  ok(r.exitCode === 0 && fail === 0 && pass > 0, `05-rls-smoke: exit ${r.exitCode}, ${pass} PASS, ${fail} FAIL`)
}
console.log(fails ? `RESULT: ${fails} FAIL` : 'RESULT: all OK')
process.exit(fails ? 1 : 0)

// Slice 32 C2: the bot key (service_role) has exactly exercises SELECT/INSERT/UPDATE + redskap SELECT,
// nothing on admins — in the catalog AND over HTTP — while the bot's insert and --replace update still work.
// Needs setup.sh + start.sh + users.sh (same S32_DIR). Run: bun verifier/slice-32-local/check-grants.ts
import { readFileSync } from 'node:fs'
import { $ } from 'bun'
const DIR = process.env.S32_DIR ?? '/tmp/s32'
const env = JSON.parse(readFileSync(`${DIR}/env.json`, 'utf8'))
const BOT = readFileSync(env.botKeysFile, 'utf8').split('\n')[0].trim()
const GW = `http://127.0.0.1:${env.gatewayPort}`
const REPO = new URL('../..', import.meta.url).pathname.replace(/\/$/, '')
const psql = async (sql: string) => (await $`env PGOPTIONS=-cclient_min_messages=warning psql -h 127.0.0.1 -p ${String(env.pgPort)} -U postgres -d bank -v ON_ERROR_STOP=1 -qAt -c ${sql}`.text()).trim()
let fails = 0
const ok = (cond: boolean, msg: string) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++ }

// 1. catalog: every privilege service_role holds on any public table (aclexplode sees MAINTAIN too)
const acl = await psql(`select coalesce(string_agg(c.relname || ':' || a.privilege_type, ' ' order by c.relname, a.privilege_type), '')
  from pg_class c join pg_namespace n on n.oid = c.relnamespace, aclexplode(c.relacl) a
  where n.nspname = 'public' and c.relkind in ('r','v','m','p') and a.grantee = 'service_role'::regrole`)
ok(acl === 'exercises:INSERT exercises:SELECT exercises:UPDATE redskap:SELECT', `service_role table privileges: ${acl || '(none)'}`)
const isq = await psql(`select string_agg(table_name || ':' || privilege_type, ' ' order by table_name, privilege_type) from information_schema.role_table_grants where table_schema = 'public' and grantee = 'service_role'`)
ok(isq === 'exercises:INSERT exercises:SELECT exercises:UPDATE redskap:SELECT', `information_schema.role_table_grants: ${isq}`)
const owner = await psql(`select string_agg(email, ',') from public.admins`)
ok(owner === 'admin@test.local', `admins list intact: ${owner}`)

// 2. HTTP with the bot key (gateway → service_role)
const h = { apikey: BOT, 'content-type': 'application/json', prefer: 'return=representation' }
const call = async (method: string, path: string, body?: unknown) => {
  const r = await fetch(GW + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  return { status: r.status, text: (await r.text()).slice(0, 70) }
}
const denied = (s: number) => s === 401 || s === 403
for (const [m, p, b] of [
  ['GET', '/rest/v1/admins?select=email'],
  ['POST', '/rest/v1/admins', { user_id: crypto.randomUUID(), email: 'bot@example.se' }],
  ['PATCH', '/rest/v1/admins?email=eq.admin@test.local', { note: 'bot' }],
  ['DELETE', '/rest/v1/admins?email=eq.admin@test.local'],
  ['POST', '/rest/v1/redskap', { id: 'eq-bot-test', label_sv: 'x', visual_key: 'x', sort_order: 999 }],
  ['PATCH', '/rest/v1/redskap?id=eq.eq-kon', { label_sv: 'Bot' }],
  ['DELETE', '/rest/v1/redskap?id=eq.eq-kon'],
  ['DELETE', '/rest/v1/exercises?id=eq.tech-kullerbytta'],
] as [string, string, unknown?][]) {
  const r = await call(m, p, b)
  ok(denied(r.status), `bot ${m} ${p.split('?')[0]} → ${r.status} ${r.text}`)
}
const rk = await call('GET', '/rest/v1/redskap?select=id')
ok(rk.status === 200, `bot GET redskap → ${rk.status}`)
const ex = await call('GET', '/rest/v1/exercises?select=id&limit=1')
ok(ex.status === 200, `bot GET exercises → ${ex.status}`)
ok((await psql(`select count(*) from public.admins`)) === '1' && (await psql(`select label_sv from public.redskap where id = 'eq-kon'`)) !== 'Bot', 'admins + redskap unchanged after the bot attempts')

// 3. bot script: insert, then --replace (update) — both keep bot:planner
const ids = ['tech-test-formhopp-over-lagt-block', 'tech-test-aggrullning-kil']
await psql(`delete from public.exercises where id in ('${ids.join("','")}')`)
const benv = { ...process.env, SUPABASE_PLANNER_BOT_KEY: BOT }
const ins = await $`bun ${REPO}/tools/bank/push-promote.ts ${REPO}/tools/bank/fixtures/promote-2.json --url ${GW}`.env(benv).nothrow().quiet()
const after1 = await psql(`select string_agg(id || ':' || updated_by || ':' || status, ' ' order by id) from public.exercises where id in ('${ids.join("','")}')`)
ok(ins.exitCode === 0 && after1 === 'tech-test-aggrullning-kil:bot:planner:pending tech-test-formhopp-over-lagt-block:bot:planner:pending', `push-promote insert (exit ${ins.exitCode}) → ${after1}`)
await psql(`update public.exercises set title = 'changed by owner' where id = 'tech-test-aggrullning-kil'`)
const rep = await $`bun ${REPO}/tools/bank/push-promote.ts ${REPO}/tools/bank/fixtures/promote-2.json --url ${GW} --replace tech-test-aggrullning-kil`.env(benv).nothrow().quiet()
const after2 = await psql(`select title || ' · ' || updated_by || ' · ' || status from public.exercises where id = 'tech-test-aggrullning-kil'`)
ok(rep.exitCode === 0 && /Ersatta: tech-test-aggrullning-kil/.test(rep.stdout.toString()) && !after2.startsWith('changed by owner') && after2.endsWith('· bot:planner · pending'), `push-promote --replace (PATCH, exit ${rep.exitCode}) → ${after2}`)
const again = await $`bun ${REPO}/tools/bank/push-promote.ts ${REPO}/tools/bank/fixtures/promote-2.json --url ${GW}`.env(benv).nothrow().quiet()
const lastLine = again.stdout.toString().trim().split('\n').at(-1) ?? ''
ok(again.exitCode === 0 && lastLine.startsWith('Inget nytt') && !again.stdout.toString().includes('Väntar på godkännande'), `re-push, all skipped (C5) → «${lastLine}»`)

// 4. RLS smoke incl. Part 3 (bot)
const r = await $`psql -h 127.0.0.1 -p ${String(env.pgPort)} -U postgres -d bank -v ON_ERROR_STOP=1 -qAt -f ${REPO}/tools/bank/out/setup-32/05-rls-smoke-valfri.sql`.nothrow().quiet()
const txt = r.stdout.toString() + r.stderr.toString()
const pass = (txt.match(/PASS/g) || []).length, fail = (txt.match(/FAIL/g) || []).length, bot = (txt.match(/PASS bot/g) || []).length
ok(r.exitCode === 0 && fail === 0 && bot === 10, `05-rls-smoke: exit ${r.exitCode}, ${pass} PASS (${bot} bot), ${fail} FAIL`)
console.log(fails ? `RESULT: ${fails} FAIL` : 'RESULT: all OK')
process.exit(fails ? 1 : 0)

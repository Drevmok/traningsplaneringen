/**
 * Slice 32 (E1) — bot write script tests. Pure + mocked fetch always; the live part runs only
 * against the local stand-in (verifier/slice-32-local) when S32_GATEWAY is set.
 *   bun test tools/bank
 *   S32_GATEWAY=http://127.0.0.1:54340 bun test tools/bank   (after setup.sh + start.sh)
 */
import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkKey, checkUrl, parseArgs, planPromote, replaceBody, scrub } from './promote-lib.ts'
import { KEY_DEAD, run } from './push-promote.ts'
import { seedActivities } from '../../app/src/data/seedActivities.ts'

const FIXTURE = join(import.meta.dir, 'fixtures', 'promote-2.json')
const fixtureText = readFileSync(FIXTURE, 'utf8')
const known = seedActivities.map((a, i) => ({ id: a.id, block_type: a.blockType, sort_order: (i + 1) * 10, title: a.title }))
const FAKE_KEY = 'localbot_0123456789abcdef'
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${b64({ role })}.sig`

describe('args, url, key', () => {
  it('parses flags', () => {
    const a = parseArgs(['p.json', '--dry-run', '--replace', 'tech-a', '--url', 'https://x.supabase.co'])
    expect(a).toMatchObject({ file: 'p.json', dryRun: true, replace: ['tech-a'], url: 'https://x.supabase.co', errors: [] })
    expect(parseArgs(['--replace']).errors.length).toBe(1)
    expect(parseArgs(['--force']).errors[0]).toContain('Okänd')
  })
  it('url: https, or http only for localhost', () => {
    expect(checkUrl('https://abc.supabase.co/').ok).toBe(true)
    expect(checkUrl('http://127.0.0.1:54340').ok).toBe(true)
    expect(checkUrl('http://abc.supabase.co').ok).toBe(false)
    expect(checkUrl('').ok).toBe(false)
  })
  it('key: refuses missing, publishable and anon/authenticated JWTs; message never contains the key', () => {
    expect(checkKey(undefined).ok).toBe(false)
    const pub = checkKey('sb_publishable_abc123')
    expect(pub.ok).toBe(false)
    if (!pub.ok) expect(pub.why).not.toContain('abc123')
    expect(checkKey(jwt('anon')).ok).toBe(false)
    expect(checkKey(jwt('authenticated')).ok).toBe(false)
    expect(checkKey(jwt('service_role')).ok).toBe(true)
    expect(checkKey(FAKE_KEY).ok).toBe(true)
    expect(checkKey('a b').ok).toBe(false)
  })
  it('scrub removes the key from any text', () => {
    expect(scrub(`bad key ${FAKE_KEY}!`, FAKE_KEY)).toBe('bad key [nyckel]!')
  })
})

describe('planPromote', () => {
  it('maps to pending bot rows with bank rules', () => {
    const plan = planPromote(fixtureText, known)
    expect(plan.ok).toBe(true)
    const [a, b] = plan.rows
    expect(a.row).toMatchObject({ id: 'tech-test-formhopp-over-lagt-block', status: 'pending', needs_coach_review: true, updated_by: 'bot:planner', new_coach_ok: true, visual_key: 'tech-test-formhopp-over-lagt-block', progression_of: 'tech-ljushopp-trampett' })
    expect(a.row.tags).toContain('new-coach-ok')
    expect(a.row.tags).not.toContain('egen')
    expect(a.row.default_station_equipment?.length).toBeGreaterThan(0)
    expect(a.row.source?.url.startsWith('https://')).toBe(true)
    // link to another row in the same file → rewritten to its seedId
    expect(b.row.progression_of).toBe('tech-test-formhopp-over-lagt-block')
    expect(b.row.new_coach_ok).toBe(false)
    expect(b.row.tags).not.toContain('new-coach-ok')
    const maxTech = Math.max(...known.filter((k) => k.block_type === 'techniques').map((k) => k.sort_order))
    expect(a.row.sort_order).toBe(maxTech + 10)
    expect(b.row.sort_order).toBe(maxTech + 20)
  })
  it('drops links to ids that are not in the bank', () => {
    const d = JSON.parse(fixtureText)
    d.exercises[0].progressionOf = 'tech-finns-inte'
    const plan = planPromote(JSON.stringify(d), known)
    expect(plan.ok).toBe(true)
    expect(plan.rows[0].row.progression_of).toBe(null)
    expect(plan.rows[0].notes.join(' ')).toContain('tech-finns-inte')
  })
  it('all-or-nothing: bad seedId, wrong prefix, duplicate, invalid row, >100', () => {
    const bad = (edit: (d: { exercises: Record<string, unknown>[] }) => void) => {
      const d = JSON.parse(fixtureText)
      edit(d)
      return planPromote(JSON.stringify(d), known)
    }
    expect(bad((d) => delete d.exercises[0].seedId).ok).toBe(false)
    expect(bad((d) => (d.exercises[0].seedId = 'own-x')).ok).toBe(false)
    expect(bad((d) => (d.exercises[0].seedId = 'warm-formhopp')).problems[0]).toContain('tech-')
    expect(bad((d) => (d.exercises[1].seedId = d.exercises[0].seedId)).ok).toBe(false)
    expect(bad((d) => delete d.exercises[0].safetyLine).ok).toBe(false)
    expect(bad((d) => (d.exercises = Array.from({ length: 101 }, () => d.exercises[0]))).problems[0]).toContain('max 100')
    expect(planPromote('nope', known).ok).toBe(false)
  })
  it('marks existing ids; replace body never carries status / id / sort order', () => {
    const k2 = [...known, { id: 'tech-test-aggrullning-kil', block_type: 'techniques', sort_order: 5 }]
    const plan = planPromote(fixtureText, k2, ['tech-test-aggrullning-kil'])
    expect(plan.rows[1].exists).toBe(true)
    expect(plan.rows[1].replace).toBe(true)
    const body = replaceBody(plan.rows[1].row)
    expect('status' in body || 'id' in body || 'sort_order' in body).toBe(false)
    expect(body.updated_by).toBe('bot:planner')
    expect(planPromote(fixtureText, known, ['tech-not-in-file']).ok).toBe(false)
  })
})

interface Req {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}
function mockFetch(handler: (r: Req) => Response) {
  const reqs: Req[] = []
  const f = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const r: Req = { url: String(input), method: init?.method ?? 'GET', headers: (init?.headers ?? {}) as Record<string, string>, body: init?.body as string | undefined }
    reqs.push(r)
    return handler(r)
  }) as typeof fetch
  return { f, reqs }
}
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'Content-Type': 'application/json' } })
const env = { SUPABASE_PLANNER_BOT_KEY: FAKE_KEY, SUPABASE_URL: 'https://example-ref.supabase.co' }

describe('run (mocked bank)', () => {
  it('dry-run: reads ids, writes nothing', async () => {
    const m = mockFetch(() => json(known))
    const lines: string[] = []
    const r = await run([FIXTURE, '--dry-run'], env, m.f, (l) => lines.push(l))
    expect(r.code).toBe(0)
    expect(m.reqs.every((q) => q.method === 'GET')).toBe(true)
    expect(lines.join('\n')).toContain('Inget skrevs')
  })
  it('dry-run works without a key (offline check against the bundled bank)', async () => {
    const m = mockFetch(() => json([]))
    const r = await run([FIXTURE, '--dry-run'], {}, m.f, () => {})
    expect(r.code).toBe(0)
    expect(m.reqs.length).toBe(0)
  })
  it('real run without a key refuses', async () => {
    const lines: string[] = []
    const r = await run([FIXTURE], {}, mockFetch(() => json([])).f, (l) => lines.push(l))
    expect(r.code).toBe(1)
    expect(lines[0]).toContain('SUPABASE_PLANNER_BOT_KEY')
  })
  it('refuses the publishable key', async () => {
    const r = await run([FIXTURE], { ...env, SUPABASE_PLANNER_BOT_KEY: 'sb_publishable_x' }, mockFetch(() => json([])).f, () => {})
    expect(r.code).toBe(1)
  })
  it('POSTs new rows with apikey only, skips existing, never DELETE, never prints the key', async () => {
    const existing = [...known, { id: 'tech-test-aggrullning-kil', block_type: 'techniques', sort_order: 999 }]
    const m = mockFetch((q) => (q.method === 'GET' ? json(existing) : json([{ ...JSON.parse(q.body ?? '{}') }], 201)))
    const lines: string[] = []
    const r = await run([FIXTURE], env, m.f, (l) => lines.push(l))
    expect(r).toMatchObject({ code: 0, inserted: ['tech-test-formhopp-over-lagt-block'], skipped: ['tech-test-aggrullning-kil'], replaced: [] })
    const post = m.reqs.find((q) => q.method === 'POST')!
    expect(post.url).toBe('https://example-ref.supabase.co/rest/v1/exercises')
    expect(post.headers).toMatchObject({ apikey: FAKE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' })
    expect(post.headers.Authorization).toBeUndefined()
    expect(JSON.parse(post.body!)).toMatchObject({ status: 'pending', updated_by: 'bot:planner', needs_coach_review: true })
    expect(m.reqs.some((q) => q.method === 'DELETE' || q.method === 'PUT')).toBe(false)
    expect(lines.join('\n')).not.toContain(FAKE_KEY)
    expect(lines.join('\n')).toContain('Väntar på godkännande i appen')
  })
  it('--replace PATCHes by id without status', async () => {
    const existing = [...known, { id: 'tech-test-aggrullning-kil', block_type: 'techniques', sort_order: 999 }]
    const m = mockFetch((q) => (q.method === 'GET' ? json(existing) : json([{ id: 'x', status: 'published', updated_by: 'bot:planner' }], q.method === 'POST' ? 201 : 200)))
    const r = await run([FIXTURE, '--replace', 'tech-test-aggrullning-kil'], env, m.f, () => {})
    expect(r.replaced).toEqual(['tech-test-aggrullning-kil'])
    const patch = m.reqs.find((q) => q.method === 'PATCH')!
    expect(patch.url).toContain('id=eq.tech-test-aggrullning-kil')
    expect('status' in JSON.parse(patch.body!)).toBe(false)
  })
  it('409 on insert → skipped, not overwritten', async () => {
    const m = mockFetch((q) => (q.method === 'GET' ? json(known) : json({ code: '23505' }, 409)))
    const r = await run([FIXTURE], env, m.f, () => {})
    expect(r.skipped.length).toBe(2)
    expect(r.inserted.length).toBe(0)
  })
  it('revoked key (401) → clear message, no key in output', async () => {
    const m = mockFetch(() => json({ message: `Invalid API key ${FAKE_KEY}` }, 401))
    const lines: string[] = []
    const r = await run([FIXTURE], env, m.f, (l) => lines.push(l))
    expect(r.code).toBe(1)
    expect(lines.join('\n')).toContain(KEY_DEAD)
    expect(lines.join('\n')).not.toContain(FAKE_KEY)
  })
})

// ---------------------------------------------------------------- live: local stand-in only
const GATEWAY = process.env.S32_GATEWAY
const liveDescribe = GATEWAY && /^http:\/\/127\.0\.0\.1:\d+$/.test(GATEWAY) ? describe : describe.skip
liveDescribe('run (local stand-in: PostgREST + schema-31/32 behind a Supabase-like gateway)', () => {
  const localKey = () => readFileSync('/tmp/s32/bot-keys.txt', 'utf8').split('\n').filter(Boolean)[0]
  const envLocal = () => ({ SUPABASE_PLANNER_BOT_KEY: localKey(), SUPABASE_URL: GATEWAY })
  const pub = () => JSON.parse(readFileSync('/tmp/s32/env.json', 'utf8')).publishableKey as string
  const rest = (path: string, key: string, init: RequestInit = {}) =>
    fetch(`${GATEWAY}/rest/v1/${path}`, { ...init, headers: { apikey: key, 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) } })

  it('dry-run against the DB writes nothing', async () => {
    const before = await (await rest('exercises?select=id', localKey())).json()
    const r = await run([FIXTURE, '--dry-run'], envLocal(), fetch, () => {})
    expect(r.code).toBe(0)
    const after = await (await rest('exercises?select=id', localKey())).json()
    expect(after.length).toBe(before.length)
  })
  it('inserts pending rows; second run skips (no overwrite); anon cannot see them', async () => {
    const r1 = await run([FIXTURE], envLocal(), fetch, () => {})
    expect(r1.code).toBe(0)
    const rows = await (await rest('exercises?select=id,status,needs_coach_review,updated_by&id=like.tech-test-*', localKey())).json()
    expect(rows.length).toBe(2)
    for (const row of rows) expect(row).toMatchObject({ status: 'pending', needs_coach_review: true, updated_by: 'bot:planner' })
    const r2 = await run([FIXTURE], envLocal(), fetch, () => {})
    expect(r2.skipped.sort()).toEqual(['tech-test-aggrullning-kil', 'tech-test-formhopp-over-lagt-block'])
    expect(r2.inserted.length).toBe(0)
    const anon = await (await rest('exercises?select=id&id=like.tech-test-*', pub())).json()
    expect(anon).toEqual([])
  })
  it('--replace changes text but not status', async () => {
    const d = JSON.parse(fixtureText)
    d.exercises[1].summary = 'Ändrad sammanfattning från boten (test).'
    const tmp = '/tmp/s32/promote-replace.json'
    await Bun.write(tmp, JSON.stringify(d))
    const r = await run([tmp, '--replace', 'tech-test-aggrullning-kil'], envLocal(), fetch, () => {})
    expect(r.replaced).toEqual(['tech-test-aggrullning-kil'])
    const [row] = await (await rest('exercises?select=summary,status&id=eq.tech-test-aggrullning-kil', localKey())).json()
    expect(row).toEqual({ summary: 'Ändrad sammanfattning från boten (test).', status: 'pending' })
  })
  it('the bot key cannot DELETE (permission denied, row still there)', async () => {
    const res = await rest('exercises?id=eq.tech-test-aggrullning-kil', localKey(), { method: 'DELETE' })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(await res.text()).toContain('permission denied')
    const rows = await (await rest('exercises?select=id&id=eq.tech-test-aggrullning-kil', localKey())).json()
    expect(rows.length).toBe(1)
  })
  it('a revoked key fails clearly', async () => {
    const lines: string[] = []
    const r = await run([FIXTURE], { ...envLocal(), SUPABASE_PLANNER_BOT_KEY: 'localbot_revoked_or_deleted' }, fetch, (l) => lines.push(l))
    expect(r.code).toBe(1)
    expect(lines.join('\n')).toContain(KEY_DEAD)
  })
})

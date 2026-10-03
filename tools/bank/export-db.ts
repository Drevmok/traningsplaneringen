#!/usr/bin/env bun
/**
 * Slice 32 (E1) — read-only backup of the shared bank (published + hidden rows + redskap).
 * The free plan has no automatic backups; run after each approved batch, at least monthly.
 *
 *   SUPABASE_URL=https://<ref>.supabase.co bun tools/bank/export-db.ts [--out tools/bank/out/bank-snapshot.json]
 *
 * Key only from SUPABASE_PLANNER_BOT_KEY (never printed, never written). Output = public
 * exercise texts in the bank-seed.json shape (+ status). Pending rows are left out.
 * Not wired into the app bundle in Slice 32 (bundle budget AC 49) — see app/SLICE32-SHIPPED.md.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkKey, checkUrl, KEY_ENV, scrub } from './promote-lib.ts'
import { rowToEntry } from '../../app/src/lib/bankRow.ts'

const argv = process.argv.slice(2)
const val = (n: string) => {
  const i = argv.indexOf(n)
  return i >= 0 ? argv[i + 1] : undefined
}
const k = checkKey(process.env[KEY_ENV])
if (!k.ok) {
  console.error(`Fel: ${k.why}`)
  process.exit(1)
}
const u = checkUrl(val('--url') ?? process.env.SUPABASE_URL)
if (!u.ok) {
  console.error(`Fel: ${u.why}`)
  process.exit(1)
}
const headers: Record<string, string> = { apikey: k.key }
if (k.key.startsWith('eyJ')) headers.Authorization = `Bearer ${k.key}`
const get = async (path: string) => {
  const res = await fetch(`${u.url}/rest/v1/${path}`, { headers })
  if (res.status === 401 || res.status === 403) throw new Error('Nyckeln fungerar inte längre (borttagen eller fel).')
  if (!res.ok) throw new Error(`banken svarade ${res.status}: ${scrub((await res.text()).slice(0, 200), k.key)}`)
  return res.json()
}
try {
  const exercises = (await get('exercises?select=*&status=in.(published,hidden)&order=sort_order')) as Record<string, unknown>[]
  const redskap = await get('redskap?select=id,label_sv,visual_key,sort_order&order=sort_order')
  const bad = exercises.filter((r) => !rowToEntry(r)).map((r) => r.id)
  const clean = exercises.map(({ created_at: _c, ...r }) => r)
  const out = val('--out') ?? join(import.meta.dir, 'out', 'bank-snapshot.json')
  writeFileSync(out, JSON.stringify({ format: 'traningsplaneraren.bank', schemaVersion: 1, exportedAt: new Date().toISOString(), redskap, exercises: clean }, null, 2) + '\n')
  const pub = exercises.filter((r) => r.status === 'published').length
  console.log(`${out}: ${pub} publicerade, ${exercises.length - pub} dolda, ${(redskap as unknown[]).length} redskap${bad.length ? ` · ogiltiga i appen: ${bad.join(', ')}` : ''}`)
} catch (e) {
  console.error(`Fel: ${scrub((e as Error).message, k.key)}`)
  process.exit(1)
}

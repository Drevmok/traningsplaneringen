/**
 * Slice 31 — seed exporter: bundled bank (seedActivities.ts + equipmentPieces.ts + seed
 * Säkerhet lines via floorTip) → ONE transaction of idempotent upserts for Supabase.
 * From slice-31/content/export_bank_seed.ts; the row mapping is shared with the app
 * (activityToBankRow in app/src/lib/bankRow.ts) so the bank and the app cannot drift.
 *
 *   bun tools/bank/export-seed.ts            > tools/bank/out/bank-seed.sql
 *   bun tools/bank/export-seed.ts --json     > tools/bank/out/bank-seed.json
 *   bun tools/bank/export-seed.ts --new-only > tools/bank/out/bank-new.sql   (Slice 32+: never overwrite DB edits)
 *   bun tools/bank/export-seed.ts --chunked             → tools/bank/out/parts/bank-seed-del-K-av-N.sql (≤ 16 000 bytes each)
 *   bun tools/bank/export-seed.ts --new-only --chunked  → tools/bank/out/parts-new/bank-new-del-K-av-N.sql
 *   … --existing ids.txt   leave out ids already in the bank (one id per line)
 *
 * Paste the .sql into Supabase → SQL Editor (runs as the project owner; no key involved).
 * Re-running never duplicates rows and never changes `status` (an admin's Dölj stays).
 * The output holds only public exercise texts — no keys, no secrets.
 */
import { seedActivities } from '../../app/src/data/seedActivities.ts'
import { EQUIPMENT_PIECES } from '../../app/src/data/equipmentPieces.ts'
import { floorTip } from '../../app/src/data/activityTips.ts'
import { activityToBankRow } from '../../app/src/lib/bankRow.ts'

const q = (v: string | null | undefined): string =>
  v === null || v === undefined ? 'null' : `'${v.replace(/'/g, "''")}'`
const qb = (v: boolean | undefined, d = false): string => String(v ?? d)
const qj = (v: unknown): string => (v === undefined || v === null ? 'null' : `${q(JSON.stringify(v))}::jsonb`)
const qa = (v: string[] | null | undefined): string =>
  v === undefined || v === null ? 'null' : `array[${v.map(q).join(', ')}]::text[]`

const redskap = EQUIPMENT_PIECES.map((p, i) => ({
  id: p.id,
  label_sv: p.labelSv,
  visual_key: p.visualKey,
  sort_order: (i + 1) * 10,
}))

const exercises = seedActivities.map((a, i) => {
  const { status: _status, ...row } = activityToBankRow(a, i, a.safetyLine?.trim() || floorTip(a).safety || null)
  return row
})

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ format: 'traningsplaneraren.bank', schemaVersion: 1, redskap, exercises }, null, 2))
  process.exit(0)
}

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(name)
const flagValue = (name: string): string | undefined => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : undefined
}

const newOnly = flag('--new-only')
const chunked = flag('--chunked')
/** Optional: a file with one id per line (e.g. `select id from public.exercises` copied out) → those rows are left out. */
const existingFile = flagValue('--existing')
const existing = new Set<string>()
if (existingFile) {
  const { readFileSync } = await import('node:fs')
  for (const line of readFileSync(existingFile, 'utf8').split(/\r?\n/)) {
    const id = line.trim().replace(/^"|"$/g, '')
    if (id) existing.add(id)
  }
}
const rows = exercises.filter((e) => !existing.has(e.id))

const cols = [
  'id', 'block_type', 'title', 'duration_minutes_default', 'summary', 'how_to', 'watch_for',
  'watch_for_required', 'safety_line', 'visual_key', 'difficulty', 'tags', 'default_station_equipment',
  'legacy_equipment', 'progression_of', 'regression_of', 'experienced_coach_only', 'new_coach_ok',
  'needs_coach_review', 'source', 'sort_order', 'updated_by',
]
const updatable = cols.filter((c) => c !== 'id')

function redskapSql(r: (typeof redskap)[number]): string {
  return (
    `insert into public.redskap (id, label_sv, visual_key, sort_order) values (${q(r.id)}, ${q(r.label_sv)}, ${q(r.visual_key)}, ${r.sort_order})` +
    (newOnly
      ? ' on conflict (id) do nothing;'
      : ` on conflict (id) do update set label_sv = excluded.label_sv, visual_key = excluded.visual_key, sort_order = excluded.sort_order;`)
  )
}

/** `links: false` → progression_of / regression_of written as null (chunked parts set them in the last part). */
function exerciseSql(e: (typeof exercises)[number], links: boolean): string {
  const vals = [
    q(e.id), q(e.block_type), q(e.title), String(e.duration_minutes_default), q(e.summary), q(e.how_to),
    q(e.watch_for), qb(e.watch_for_required, true), q(e.safety_line), q(e.visual_key), q(e.difficulty),
    qa(e.tags), qj(e.default_station_equipment), qa(e.legacy_equipment),
    links ? q(e.progression_of) : 'null', links ? q(e.regression_of) : 'null',
    qb(e.experienced_coach_only), qb(e.new_coach_ok), qb(e.needs_coach_review),
    qj(e.source), String(e.sort_order), q('seed-script'),
  ]
  return (
    `insert into public.exercises (${cols.join(', ')}) values (${vals.join(', ')})` +
    (newOnly
      ? ' on conflict (id) do nothing;'
      : ` on conflict (id) do update set ${updatable.map((c) => `${c} = excluded.${c}`).join(', ')};`)
  )
}

/** Links set after every row exists. --new-only: only fills links that are still empty (never overwrites). */
function linkUpdates(): string[] {
  const out: string[] = []
  for (const e of rows) {
    if (newOnly) {
      if (e.progression_of) out.push(`update public.exercises set progression_of = ${q(e.progression_of)} where id = ${q(e.id)} and progression_of is null;`)
      if (e.regression_of) out.push(`update public.exercises set regression_of = ${q(e.regression_of)} where id = ${q(e.id)} and regression_of is null;`)
      continue
    }
    const sets: string[] = []
    if (e.progression_of) sets.push(`progression_of = ${q(e.progression_of)}`)
    if (e.regression_of) sets.push(`regression_of = ${q(e.regression_of)}`)
    if (sets.length) out.push(`update public.exercises set ${sets.join(', ')} where id = ${q(e.id)};`)
  }
  return out
}

const checkSelect =
  "select (select count(*) from public.exercises where status = 'published') as ovningar_publicerade, (select count(*) from public.redskap) as redskap;"

if (!chunked) {
  const out: string[] = []
  out.push(`-- Generated by tools/bank/export-seed.ts from seedActivities.ts — ${rows.length} övningar, ${redskap.length} redskap.`)
  out.push(
    newOnly
      ? '-- NEW ONLY: inserts rows whose id is not in the bank yet; never changes an existing row (admin edits stay).'
      : '-- Paste into Supabase → SQL Editor → Run (after schema-31.sql). Idempotent; keeps status on re-run.',
  )
  out.push('begin;')
  out.push('set constraints all deferred;')
  for (const r of redskap) out.push(redskapSql(r))
  for (const e of rows) out.push(exerciseSql(e, !newOnly))
  if (newOnly) out.push(...linkUpdates())
  out.push('commit;')
  out.push(`-- Check: select status, count(*) from public.exercises group by status;  → published ${exercises.length}`)
  out.push(`-- Check: select count(*) from public.redskap;  → ${redskap.length}`)
  console.log(out.join('\n'))
  process.exit(0)
}

// ---- --chunked: parts ≤ 16 000 bytes each, for the Supabase SQL Editor (it truncated a 100 KB paste) ----
export const PART_LIMIT_BYTES = 16000
const bytes = (s: string) => Buffer.byteLength(s, 'utf8')
const prefix = newOnly ? 'bank-new' : 'bank-seed'
const dataHeader = (k: number, n: number) =>
  `-- ${prefix} del ${k} av ${n}. Klistra in allt och kör (Run). Kör delarna i ordning.\nbegin;\n`
const dataFooter = 'commit;\n'
const stmts = [...redskap.map(redskapSql), ...rows.map((e) => exerciseSql(e, false))]
// Reserve room for the longest possible header ("del 99 av 99").
const overhead = bytes(dataHeader(99, 99)) + bytes(dataFooter)
const groups: string[][] = []
let cur: string[] = []
let curBytes = overhead
for (const s of stmts) {
  const b = bytes(s) + 1
  if (overhead + b > PART_LIMIT_BYTES) throw new Error(`one statement is larger than ${PART_LIMIT_BYTES} bytes`)
  if (cur.length && curBytes + b > PART_LIMIT_BYTES) {
    groups.push(cur)
    cur = []
    curBytes = overhead
  }
  cur.push(s)
  curBytes += b
}
if (cur.length) groups.push(cur)
const n = groups.length + 1
const files: [string, string][] = groups.map((g, i) => [
  `${prefix}-del-${i + 1}-av-${n}.sql`,
  dataHeader(i + 1, n) + g.join('\n') + '\n' + dataFooter,
])
const last =
  `-- ${prefix} del ${n} av ${n}: kopplingar mellan övningar + kontroll` +
  (newOnly ? ' (fyller bara tomma kopplingar).' : '.') +
  `\nbegin;\n${linkUpdates().join('\n')}\ncommit;\n${checkSelect}\n`
files.push([`${prefix}-del-${n}-av-${n}.sql`, last])
for (const [name, text] of files) {
  if (bytes(text) > PART_LIMIT_BYTES) throw new Error(`${name} is ${bytes(text)} bytes`)
}

const { mkdirSync, readdirSync, rmSync, writeFileSync } = await import('node:fs')
const { join } = await import('node:path')
const outDir = flagValue('--out-dir') ?? join(import.meta.dir, 'out', newOnly ? 'parts-new' : 'parts')
mkdirSync(outDir, { recursive: true })
for (const f of readdirSync(outDir)) if (f.startsWith(`${prefix}-del-`) && f.endsWith('.sql')) rmSync(join(outDir, f))
for (const [name, text] of files) {
  writeFileSync(join(outDir, name), text)
  console.log(`${name}\t${bytes(text)} bytes`)
}
console.log(`${rows.length} övningar, ${redskap.length} redskap → ${files.length} delar i ${outDir}`)

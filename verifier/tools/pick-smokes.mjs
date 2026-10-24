#!/usr/bin/env node
// Slice 50 (C1): pick smokes from a diff.   node verifier/tools/pick-smokes.mjs <base> <head> [--all] [--json]
// Rules (slice-50/README.md C1):
//   - always: the two latest slices' smokes + slice-48 (liggande 844×390)
//   - a changed app file that no smoke-map entry covers → HELA LOOPEN
//   - a change in app/src/lib/session.ts, app/src/data/blockMeta.ts or app/src/App.css → HELA LOOPEN
//   - otherwise: every script whose "paths" include a changed file, plus changed verifier/<script>.mjs
// "Hela loopen" = every entry with inLoop ≠ false. Entries with inLoop=false (no fixtures / stale selectors /
// crash, see smoke-map "note") are listed as INFO and compared only against the main baseline; --all runs them too.
// Entries with "karantan" print those AC ids as INFO (D1/D2). Output: one line per script with its reason;
// the last line is "RUN: <script> …" (machine-readable; --json gives the same as JSON).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
const [base, head] = args.filter((a) => !a.startsWith('--'))
if (!base || !head) { console.error('usage: pick-smokes.mjs <base> <head> [--all] [--json]'); process.exit(2) }
const ALL = args.includes('--all'), JSON_OUT = args.includes('--json')
const map = JSON.parse(readFileSync(process.env.SMOKE_MAP ?? join(REPO, 'verifier', 'smoke-map.json'), 'utf8'))
const files = (process.env.PICK_FILES ?? execFileSync('git', ['-C', REPO, 'diff', '--name-only', `${base}...${head}`], { encoding: 'utf8' }))
  .split('\n').map((s) => s.trim()).filter(Boolean)
const CORE = ['app/src/lib/session.ts', 'app/src/data/blockMeta.ts', 'app/src/App.css']
const sliceNo = (s) => Number((s.match(/slice-(\d+)/) ?? [])[1] ?? -1)
const covered = new Set(Object.values(map).flatMap((e) => e.paths))
// Files that never reach the bundle: docs, tests, markdown anywhere under app/.
const inert = (f) => /\.md$/.test(f) || /\.test\.tsx?$/.test(f) || !f.startsWith('app/')
const reasons = new Map()
const add = (s, why) => { if (!reasons.has(s)) reasons.set(s, []); reasons.get(s).push(why) }
const info = []
let full = null
for (const f of files) {
  if (CORE.includes(f)) { full ??= `${f} är delad kärna`; continue }
  if (f.startsWith('verifier/') && f.endsWith('.mjs')) { const s = f.slice(9, -4); if (map[s]) add(s, `skriptet ändrat (${f})`); continue }
  if (inert(f)) continue
  if (!covered.has(f)) { full ??= `${f} finns inte i smoke-map.json`; continue }
}
const loop = Object.keys(map).filter((s) => ALL || map[s].inLoop !== false)
if (full) for (const s of loop) add(s, `hela loopen: ${full}`)
else for (const f of files) for (const [s, e] of Object.entries(map)) if (e.paths.includes(f) && (ALL || e.inLoop !== false)) add(s, `rör ${f} (${e.feature})`)
const bySlice = [...new Set(Object.keys(map).map(sliceNo))].filter((n) => n > 0).sort((a, b) => b - a)
for (const n of bySlice.slice(0, 2)) for (const s of Object.keys(map)) if (sliceNo(s) === n && map[s].inLoop !== false) add(s, `alltid: senaste slicerna (s${n})`)
if (map['slice-48-builder-smoke']) add('slice-48-builder-smoke', 'alltid: s48 (liggande 844×390)')
for (const [s, e] of Object.entries(map)) {
  if (e.inLoop === false && !reasons.has(s)) info.push(`INFO ${s}: körs inte (${e.baseline}${e.note ? ': ' + e.note : ''}) — bara main-baslinjen; --all kör den`)
  if (e.karantan?.length) info.push(`INFO ${s}: karantän ${e.karantan.join(', ')} — räknas inte som FAIL; manuell rad i checklistan för slices som rör inloggning`)
}
const run = Object.keys(map).filter((s) => reasons.has(s))
if (JSON_OUT) { console.log(JSON.stringify({ base, head, full: full ?? null, run, reasons: Object.fromEntries(reasons), info }, null, 2)); process.exit(0) }
console.log(`pick-smokes ${base}..${head}: ${files.length} filer${full ? ` → HELA LOOPEN (${full})` : ''}`)
for (const s of run) console.log(`${s}  [${map[s].baseline}]  ${reasons.get(s).join('; ')}`)
for (const l of info) console.log(l)
console.log(`RUN: ${run.join(' ')}`)

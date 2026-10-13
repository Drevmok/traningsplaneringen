// Slice 37 Verifier check (bun): the placements the UI wrote on apply equal autoPlaceUnplaced() on the same pass with no
// placements (branch helper AND main @ c6a11d5 helper = the wizard/HallBoard-fallback helper), and shows the stacking case.
// Usage: bun verifier/slice-37-checks/helper-parity.ts /tmp/s37v/drafts /tmp/s37v/main/app/src
import { readFileSync } from 'node:fs'
const [dir = '/tmp/s37v/drafts', mainSrc = '/tmp/s37v/main/app/src'] = process.argv.slice(2)
const br = await import('../../app/src/lib/hallSuggest.ts')
const mn = await import(`${mainSrc}/lib/hallSuggest.ts`)
let fail = 0
const out = (ok: boolean, msg: string) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`) }
const key = (pl: any[]) => JSON.stringify(pl.map((p) => [p.sessionItemId, p.zoneId, +p.x.toFixed(6), +p.y.toFixed(6)]).sort())
for (const name of ['builtin', 'club', 'egen_without', 'wizard']) {
  const d = JSON.parse(readFileSync(`${dir}/${name}.json`, 'utf8'))
  const bare = { ...d, hallPlacements: [] }
  const b = br.autoPlaceUnplaced(bare).hallPlacements, m = mn.autoPlaceUnplaced(bare).hallPlacements
  out(key(d.hallPlacements) === key(b) && key(b) === key(m), `${name} (${d.hallTemplateId}): UI placements == branch helper == main helper (${b.length})`)
  const spots = d.hallPlacements.map((p: any) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)
  const stacked = spots.length - new Set(spots).size
  console.log(`  ${name}: ${stacked} chip(s) share a spot with another; zones ${d.hallPlacements.map((p: any) => p.zoneId).join(',')}`)
}
// Same club pass on every hall preset with main's helper (= Planera pass / HallBoard fallback today).
const club = JSON.parse(readFileSync(`${dir}/club.json`, 'utf8'))
for (const h of ['standard-trupp', 'tavling-linjer', 'forening-bla', 'forening-vit', 'liten-hall']) {
  const pl = mn.autoPlaceUnplaced({ ...club, hallTemplateId: h, hallPlacements: [] }).hallPlacements
  const spots = pl.map((p: any) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)
  console.log(`  main helper, club pass on ${h}: ${pl.length} placed, ${spots.length - new Set(spots).size} stacked`)
}
console.log(fail ? `${fail} FAIL` : 'all PASS')

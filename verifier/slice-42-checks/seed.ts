// Slice 42 Verifier seed (bun). bun seed.ts <mode> [title]
//  pass <title> [n]      → draft with n Teknik (placed) on stdout
//  blank [title]         → blank Tomt pass (soft pair) on stdout
//  notes                 → blank pass with pass notes only
//  blocknote             → blank pass with one block coachNote only
//  mallar <nHand> [auto] → Mina mallar list JSON (nHand hand-saved, +1 auto if 'auto')
import { seedActivities } from '../../app/src/data/seedActivities.ts'
import { createBlankSession, createSessionItem, withComputedTotal } from '../../app/src/lib/session.ts'
import { sessionToShare } from '../../app/src/lib/sharePass.ts'
const [mode, a1 = '', a2 = '3'] = process.argv.slice(2)
const tech = seedActivities.filter((a: any) => a.blockType === 'techniques')
const pass = (title: string, n: number) => { const s: any = createBlankSession(); s.title = title
  const it = Array.from({ length: n }, (_, i) => ({ ...createSessionItem(tech[i + 1].id, 4 + i, i), note: `n${i}` }))
  s.blocks.find((b: any) => b.type === 'techniques').items = it
  s.hallPlacements = it.map((x: any, i: number) => ({ sessionItemId: x.id, x: 0.2 + 0.15 * i, y: 0.4 })); return withComputedTotal(s) }
if (mode === 'pass') console.log(JSON.stringify(pass(a1, Number(a2))))
else if (mode === 'blank') { const s: any = createBlankSession(); s.title = a1; console.log(JSON.stringify(s)) }
else if (mode === 'notes') { const s: any = createBlankSession(); s.notes = 'Passanteckning'; console.log(JSON.stringify(s)) }
else if (mode === 'blocknote') { const s: any = createBlankSession(); s.blocks[1].coachNote = 'Blockanteckning'; console.log(JSON.stringify(s)) }
else if (mode === 'mallar') {
  const n = Number(a1); const out: any[] = []
  for (let i = 0; i < n; i++) { const s = pass(`Hand ${i + 1}`, 1 + (i % 3)); out.push({ id: `hand-${i}`, title: `Hand ${i + 1}`, totalMinutes: s.totalMinutes, savedAt: `2026-10-0${1 + (i % 8)}T08:00:00.000Z`, pass: sessionToShare(s) }) }
  if (a2 === 'auto') { const s = pass('Gammal auto', 1); out.push({ id: 'auto-old', title: 'Gammal auto', totalMinutes: s.totalMinutes, savedAt: '2026-10-01T07:00:00.000Z', pass: sessionToShare(s), auto: true }) }
  console.log(JSON.stringify(out))
}

// Slice 42 smoke helper (copy of slice-41-seed): a draft with n Teknik stations (distinct minutes, notes), each placed in the hall.
// Mode `mall` also prints (stderr) a Mina mallar entry.
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession, createSessionItem, withComputedTotal } from '../app/src/lib/session.ts'
const [title, nRaw, mode] = process.argv.slice(2)
const n = Number(nRaw)
const s = createBlankSession()
s.title = title
const tech = seedActivities.filter((a) => a.blockType === 'techniques')
const items = Array.from({ length: n }, (_, i) => ({ ...createSessionItem(tech[i].id, 3 + i, i), note: `not ${i + 1}` }))
s.blocks.find((b) => b.type === 'techniques')!.items = items
s.hallPlacements = items.map((it, i) => ({ sessionItemId: it.id, x: 0.2 + 0.15 * i, y: 0.4 }))
console.log(JSON.stringify(withComputedTotal(s)))
if (mode === 'mall') {
  const { sessionToShare } = await import('../app/src/lib/sharePass.ts')
  console.error(JSON.stringify([{ id: 'mall-s42', title: 'S42 egen mall', totalMinutes: s.totalMinutes, savedAt: new Date().toISOString(), pass: sessionToShare(s) }]))
}

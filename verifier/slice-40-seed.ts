// Slice 40 smoke helper: drafts (gymnastics-planner-draft-v1 shape) with n Teknik stations in a given hall,
// no placements, so Hallöversikt auto-places them on open. `mixed` forces satsbräda / trampett / tumbling / open.
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession, createSessionItem, withComputedTotal } from '../app/src/lib/session.ts'
const [hall, nRaw, mode] = process.argv.slice(2)
const n = Number(nRaw)
const s = createBlankSession()
s.title = `S40 ${hall} ${n}${mode ? ' ' + mode : ''}`
s.hallTemplateId = hall as never
s.hallPlacements = []
const tech = seedActivities.filter((a) => a.blockType === 'techniques')
const MIX = ['eq-satsbrada', 'eq-trampett', 'eq-tumblingmatta', 'eq-kon']
s.blocks.find((b) => b.type === 'techniques')!.items = Array.from({ length: n }, (_, i) =>
  createSessionItem(tech[i % tech.length].id, 3, i, mode === 'mixed' ? [{ pieceId: MIX[i % 4], count: 1 }] : undefined),
)
console.log(JSON.stringify(withComputedTotal(s)))
if (mode === 'mall') {
  const { sessionToShare } = await import('../app/src/lib/sharePass.ts')
  console.error(JSON.stringify([{ id: 'mall-s40', title: 'S40 Blå mall', totalMinutes: s.totalMinutes, savedAt: new Date().toISOString(), pass: sessionToShare(s) }]))
}

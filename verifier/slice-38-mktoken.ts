// Slice 38 smoke helper: #dela= token for the checklist pass: 3 steps across 2 blocks,
// warmup 2 min → teknik 1 min (longest seed title) → teknik 1 min = 4 min.
import { encodeShare } from '../app/src/lib/sharePass.ts'
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession } from '../app/src/lib/session.ts'
const s = createBlankSession()
s.title = 'Slice 38 testpass'
const by = (t: string) => seedActivities.filter((a) => a.blockType === t)
const w = by('warmup')
const tech = by('techniques').sort((a, b) => b.title.length - a.title.length)
const plan: Record<string, [string, number][]> = {
  warmup: [[w[0].id, 2]],
  techniques: [[tech[0].id, 1], [tech[1].id, 1]],
}
s.blocks = s.blocks.map((b) => ({ ...b, items: (plan[b.type] ?? []).map(([id, m], n) => ({ id: `i-${b.type}-${n}`, activityId: id, durationMinutes: m, note: '', order: n })) }))
console.log(JSON.stringify({ token: await encodeShare(s), titles: [w[0].title, tech[0].title, tech[1].title] }))

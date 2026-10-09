// Slice 34 smoke helper: #dela= token for a 4-step pass across 2 blocks:
// warmup (1 min, 1 min) → teknik (longest seed title, 0 min) → teknik (1 min).
import { encodeShare } from '../app/src/lib/sharePass.ts'
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession } from '../app/src/lib/session.ts'
const s = createBlankSession()
s.title = 'Slice 34 testpass'
const by = (t: string) => seedActivities.filter((a) => a.blockType === t)
const w = by('warmup')
const tech = by('techniques').sort((a, b) => b.title.length - a.title.length)
const plan: Record<string, [string, number][]> = {
  warmup: [[w[0].id, 1], [w[1].id, 1]],
  techniques: [[tech[0].id, 0], [tech[1].id, 1]],
}
s.blocks = s.blocks.map((b) => ({ ...b, items: (plan[b.type] ?? []).map(([id, m], n) => ({ id: `i-${b.type}-${n}`, activityId: id, durationMinutes: m, note: '', order: n })) }))
console.log(JSON.stringify({ token: await encodeShare(s), titles: [w[0].title, w[1].title, tech[0].title, tech[1].title] }))

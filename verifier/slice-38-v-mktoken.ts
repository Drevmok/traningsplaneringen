// Slice 38 Verifier: #dela= token from a plan. argv[2] = JSON {title, plan:{blockType:[[activityId|'LONG'|'TOP', minutes],...]}}
import { encodeShare, decodeShare } from '../app/src/lib/sharePass.ts'
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession } from '../app/src/lib/session.ts'
const spec = JSON.parse(process.argv[2])
const s = createBlankSession()
s.title = spec.title
const longest = [...seedActivities].sort((a, b) => b.title.length - a.title.length)
const pick = (t: string, n: number) => seedActivities.filter((a) => a.blockType === t)[n].id
s.blocks = s.blocks.map((b) => ({ ...b, items: (spec.plan[b.type] ?? []).map(([id, m]: [string, number], n: number) => ({ id: `i-${b.type}-${n}`, activityId: id === 'TOP' ? longest[0].id : id.startsWith('#') ? pick(b.type, Number(id.slice(1))) : id, durationMinutes: m, note: '', order: n })) }))
const token = await encodeShare(s)
let roundTrip: unknown = null
try { roundTrip = await (decodeShare as any)(token) } catch (e) { roundTrip = String(e) }
console.log(JSON.stringify({ token, longestSeed: longest[0].title, ids: s.blocks.flatMap((b) => b.items.map((i) => i.activityId)), roundTripItems: (roundTrip as any)?.blocks?.flatMap?.((b: any) => b.items.map((i: any) => i.activityId)) ?? roundTrip }))

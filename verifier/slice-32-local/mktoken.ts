// Slice 32 smoke helper: prints a valid #dela= share token for a small pass (AC 25 hash survival).
import { encodeShare } from '../../app/src/lib/sharePass.ts'
import { seedTemplates } from '../../app/src/data/seedTemplates.ts'
import { createBlankSession } from '../../app/src/lib/session.ts'
const s = createBlankSession()
const t = seedTemplates[0]
s.title = 'Delat testpass'
s.blocks = s.blocks.map((b) => ({ ...b, items: (t.blocks.find((x) => x.type === b.type)?.items ?? []).map((i, n) => ({ id: `i-${b.type}-${n}`, activityId: i.activityId, durationMinutes: i.durationMinutes ?? 5, note: '', order: n })) }))
console.log(await encodeShare(s))

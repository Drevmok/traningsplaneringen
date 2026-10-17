// Slice 44 verify: branch-code token for Nybörjare with only stations 2 and 3 placed (station 1 unplaced) → marker vs print number check.
import { encodeShare } from '../../app/src/lib/sharePass.ts'
import { cloneTemplate, getTemplateById } from '../../app/src/lib/session.ts'
import { seedTemplates } from '../../app/src/data/seedTemplates.ts'
import { placeableItems } from '../../app/src/lib/hall.ts'
const nyb = seedTemplates.find((t) => /Nybörjare/.test(t.title))!
const s = cloneTemplate(getTemplateById(nyb.id)!)
s.title = 'Delvis placerad'
s.hallTemplateId = 'standard-trupp'
const tek = placeableItems(s)
s.hallPlacements = tek.slice(1).map((it, i) => ({ sessionItemId: it.id, x: 0.3 + 0.3 * i, y: 0.5 }))
console.log(JSON.stringify({ token: await encodeShare(s), tek: tek.map((t) => t.activityId), placed: tek.slice(1).map((t) => t.activityId) }))

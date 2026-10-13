// Slice 39 smoke helper: a draft in the main-branch shape (gymnastics-planner-draft-v1) with 3 Teknik stations.
import { seedActivities } from '../app/src/data/seedActivities.ts'
import { createBlankSession, createSessionItem, withComputedTotal } from '../app/src/lib/session.ts'
const s = createBlankSession()
s.title = 'Tisdag gammalt pass'
const tech = seedActivities.filter((a) => a.blockType === 'techniques')
s.blocks.find((b) => b.type === 'techniques')!.items = [0, 1, 2].map((n) => createSessionItem(tech[n].id, 5, n))
console.log(JSON.stringify(withComputedTotal(s)))

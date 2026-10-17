// Slice 44 verify: SharePass v1 tokens made with MAIN's code (copied into the main worktree @ 0d88da5 and run there).
import { encodeShare, sessionToShare } from './src/lib/sharePass.ts'
import { cloneTemplate, getTemplateById } from './src/lib/session.ts'
import { seedTemplates } from './src/data/seedTemplates.ts'
import { placeableItems } from './src/lib/hall.ts'
const nyb = seedTemplates.find((t) => /Nybörjare/.test(t.title))!
const a = cloneTemplate(getTemplateById(nyb.id)!)
a.title = 'Måndag – Nybörjare åäö «test» & 50%'
a.targetMinutes = 90
a.hallTemplateId = 'forening-vit'
a.hallShowFlow = true
const tek = placeableItems(a)
a.hallPlacements = tek.map((it, i) => ({ sessionItemId: it.id, x: 0.2 + 0.25 * i, y: 0.3 + 0.15 * i }))
const tb = a.blocks.find((b) => b.type === 'techniques')!
tb.items.push({ id: 'old-exp-1', activityId: 'tech-rondat-flickis', durationMinutes: 7, note: 'gammal länk', order: 99 })
tb.items[0] = { ...tb.items[0], stationEquipment: [{ pieceId: 'eq-plint', count: 2 }] }
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const empty = cloneTemplate(getTemplateById(nyb.id)!); empty.title = 'Tomt gammalt'; empty.blocks = empty.blocks.map((b) => ({ ...b, items: [] })); empty.hallPlacements = []
console.log(JSON.stringify({
  base: 'main 0d88da5',
  zip: await encodeShare(a),
  raw: 'j.' + b64(JSON.stringify(sessionToShare(a))),
  plainJson: encodeURIComponent(JSON.stringify(sessionToShare(a))),
  empty: await encodeShare(empty),
  expect: { title: a.title, targetMinutes: 90, hallTemplateId: a.hallTemplateId, placements: a.hallPlacements, blocks: a.blocks.map((b) => ({ type: b.type, items: b.items.map((i) => [i.activityId, i.durationMinutes]) })) },
}))

// Slice 41 Verifier seed (bun): rich pass — 4 Teknik (distinct minutes, notes, saved redskap), 3 Uppvärmning,
// Teknik placed in the hall (zoneId kept). Usage: bun seed.ts "<title>" [hall] [nTeknik] → draft JSON on stdout.
import { seedActivities } from '../../app/src/data/seedActivities.ts'
import { createBlankSession, createSessionItem, withComputedTotal } from '../../app/src/lib/session.ts'
const [title = 'S41V pass', hall = 'standard-trupp', nRaw = '4'] = process.argv.slice(2)
const s: any = createBlankSession(); s.title = title; s.hallTemplateId = hall
const tech = seedActivities.filter((a: any) => a.blockType === 'techniques'), warm = seedActivities.filter((a: any) => a.blockType === 'warmup')
const eq = [[{ pieceId: 'eq-trampett', count: 1 }, { pieceId: 'eq-landningsmatta', count: 2 }], [{ pieceId: 'eq-satsbrada', count: 1 }], [], [{ pieceId: 'eq-plint', count: 1 }, { pieceId: 'eq-tumblingmatta', count: 1 }]]
const t = Array.from({ length: Number(nRaw) }, (_, i) => ({ ...createSessionItem(tech[i + 2].id, 4 + i, i), note: `teknik-not ${i + 1} åäö`, stationEquipment: eq[i % 4] }))
s.blocks.find((b: any) => b.type === 'techniques').items = t
s.blocks.find((b: any) => b.type === 'warmup').items = Array.from({ length: 3 }, (_, i) => ({ ...createSessionItem(warm[i].id, 2 + i, i), note: `uv ${i + 1}` }))
s.hallPlacements = t.map((it: any, i: number) => ({ sessionItemId: it.id, x: +(0.18 + 0.17 * i).toFixed(4), y: +(0.33 + 0.07 * i).toFixed(4), ...(i % 2 ? { zoneId: 'open' } : {}) }))
console.log(JSON.stringify(withComputedTotal(s)))

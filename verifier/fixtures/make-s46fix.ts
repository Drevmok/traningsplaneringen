// Slice 51: rebuilds verifier/fixtures/s46fix.json (the slice-46 smoke fixture that only lived in /tmp/s46fix.json).
//   bun verifier/fixtures/make-s46fix.ts > verifier/fixtures/s46fix.json
// saved  = one «Min testmall» (gymnastics-planner-templates-v1 entry) on Stora hallen with every Teknik station placed
// placements = those placements; club = one «Klubbmall test» row as PostgREST returns it (no placements).
import { seedTemplates } from '../../app/src/data/seedTemplates'
import { cloneTemplate, withComputedTotal } from '../../app/src/lib/session'
import { autoPlaceUnplaced } from '../../app/src/lib/hallSuggest'
import { sessionToShare } from '../../app/src/lib/sharePass'
import { clubPayload } from '../../app/src/lib/clubTemplates'

const base = withComputedTotal({ ...cloneTemplate(seedTemplates[0]), title: 'Min testmall', hallTemplateId: 'forening-bla' })
const placed = autoPlaceUnplaced(base)
const pass = sessionToShare(placed)
const saved = [{ id: 'tpl-s46-test', title: 'Min testmall', totalMinutes: placed.totalMinutes, savedAt: '2026-10-16T10:00:00.000Z', pass }]
const club = [{ id: '00000000-0000-4000-8000-000000000046', title: 'Klubbmall test', total_minutes: placed.totalMinutes, payload: clubPayload(placed, 'Klubbmall test'), updated_at: '2026-10-16T10:00:00+00:00' }]
console.log(JSON.stringify({ saved, placements: placed.hallPlacements ?? [], club }, null, 1))

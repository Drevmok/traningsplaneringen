// Slice 51: rebuilds verifier/fixtures/s30own.json — the coach own list the old Slice 30 coach import produced.
//   bun verifier/fixtures/make-s30own.ts > verifier/fixtures/s30own.json
// The coach import left the coach UI in Slice 47 (F1: import is admin-only), so slice-30-builder-smoke.mjs seeds
// this list into gymnastics-planner-own-activities-v1 instead. Same parser, same file, same order as importOwnActivities.
import { readFileSync } from 'node:fs'
import { parseExerciseFile, resolveRows, chosenActivities } from '../../app/src/lib/ownImport'

const text = readFileSync(new URL('../../slice-30/content/example-import.json', import.meta.url), 'utf8')
const parsed = parseExerciseFile(text, { titles: [] })
if (!parsed.ok) throw new Error('example-import.json did not parse: ' + parsed.reason)
console.log(JSON.stringify(chosenActivities(resolveRows(parsed.rows, new Map())), null, 1))

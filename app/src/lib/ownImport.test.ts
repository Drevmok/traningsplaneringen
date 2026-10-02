import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { seedActivities } from '../data/seedActivities.ts'
import type { Activity } from '../types.ts'
import {
  clearOwnActivities,
  loadOwnActivities,
  MAX_OWN,
  sanitizeOwnActivity,
} from './ownActivities.ts'
import {
  applyImport,
  chosenCount,
  isExerciseFile,
  parseExerciseFile,
  resolveRows,
  stripFence,
  type ImportRow,
  type RowChoice,
} from './ownImport.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value)
    },
    removeItem: (key: string) => {
      mem.delete(key)
    },
    clear: () => mem.clear(),
    key: (index: number) => [...mem.keys()][index] ?? null,
    get length() {
      return mem.size
    },
  },
})

const OWN_KEY = 'gymnastics-planner-own-activities-v1'
const content = new URL('../../../slice-30/content/', import.meta.url)
const example = readFileSync(new URL('example-import.json', content), 'utf8')
const edge = readFileSync(new URL('example-import-edge.json', content), 'utf8')

function fresh(): void {
  clearOwnActivities()
  mem.clear()
}

function rowsOf(text: string): { rows: ImportRow[]; room: number; batchNote?: string } {
  const result = parseExerciseFile(text)
  assert.equal(result.ok, true)
  if (!result.ok) throw new Error('not ok')
  return result
}

describe('parseExerciseFile — envelope (AC 17)', () => {
  it('tells bad, newer, empty and pass files apart', () => {
    fresh()
    assert.deepEqual(parseExerciseFile('inte json'), { ok: false, reason: 'bad' })
    const doc = JSON.parse(example)
    assert.deepEqual(
      parseExerciseFile(JSON.stringify({ ...doc, schemaVersion: 2 })),
      { ok: false, reason: 'newer' },
    )
    assert.deepEqual(
      parseExerciseFile(JSON.stringify({ ...doc, schemaVersion: 0 })),
      { ok: false, reason: 'bad' },
    )
    assert.deepEqual(
      parseExerciseFile(JSON.stringify({ ...doc, format: 'annat' })),
      { ok: false, reason: 'bad' },
    )
    assert.deepEqual(
      parseExerciseFile(JSON.stringify({ ...doc, exercises: [] })),
      { ok: false, reason: 'empty' },
    )
    assert.deepEqual(
      parseExerciseFile(JSON.stringify({ v: 1, title: 'Pass', blocks: [] })),
      { ok: false, reason: 'isPass' },
    )
    assert.equal(isExerciseFile(example), true)
    assert.equal(isExerciseFile(JSON.stringify({ v: 1, blocks: [] })), false)
  })

  it('accepts a fenced ```json block from a chat', () => {
    fresh()
    const fenced = '```json\n' + example + '\n```'
    assert.equal(stripFence(fenced), example.trim())
    assert.equal(rowsOf(fenced).rows.length, 2)
  })
})

describe('example import (AC 14, 15, 7, 24)', () => {
  it('previews two new rows, default Ta med, with the batch note — and writes nothing', () => {
    fresh()
    const { rows, room, batchNote } = rowsOf(example)
    assert.equal(rows.length, 2)
    assert.deepEqual(rows.map((r) => r.state), ['new', 'new'])
    assert.deepEqual(rows.map((r) => r.defaultChoice), ['include', 'include'])
    assert.match(batchNote ?? '', /Prime Coaching Sport/)
    assert.equal(room, MAX_OWN)
    assert.equal(mem.get(OWN_KEY), undefined)
  })

  it('keeps redskap, tags, links, review flag and source after the write', () => {
    fresh()
    const { rows, room } = rowsOf(example)
    const resolved = resolveRows(rows, new Map(), room)
    assert.equal(chosenCount(resolved), 2)
    assert.deepEqual(applyImport(resolved), { ok: true, count: 2 })
    const stored = JSON.parse(mem.get(OWN_KEY) ?? '[]') as Activity[]
    const formhopp = stored.find((a) => a.id === 'own-imp-2dj-02-formhopp-over-block')
    assert.ok(formhopp)
    assert.deepEqual(formhopp.defaultStationEquipment, [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-skumblock', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ])
    assert.ok(formhopp.tags.includes('trampett'))
    assert.ok(formhopp.tags.includes('egen'))
    assert.equal(formhopp.progressionOf, 'tech-ljushopp-trampett')
    assert.equal(formhopp.needsCoachReview, true)
    assert.deepEqual(formhopp.source, {
      url: 'https://youtu.be/2DJ_oMM81mI?t=30',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 30,
    })
    assert.equal('confidence' in formhopp, false)
    const agg = stored.find((a) => a.id === 'own-imp-2dj-03-aggrullning-kil')
    assert.equal(agg?.difficulty, 'intro')
    assert.equal(agg?.regressionOf, 'tech-kullerbytta')
  })

  it('re-import → Finns redan, Hoppa över; Ersätt replaces in place with the same id', () => {
    fresh()
    const first = rowsOf(example)
    applyImport(resolveRows(first.rows, new Map(), first.room))
    const doc = JSON.parse(example)
    doc.exercises[0].title = 'Formhopp över block — ny text'
    const again = rowsOf(JSON.stringify(doc))
    assert.deepEqual(again.rows.map((r) => r.state), ['exists', 'exists'])
    assert.deepEqual(again.rows.map((r) => r.defaultChoice), ['skip', 'skip'])
    const none = resolveRows(again.rows, new Map(), again.room)
    assert.equal(chosenCount(none), 0)
    const choices = new Map<number, RowChoice>([[0, 'replace']])
    const resolved = resolveRows(again.rows, choices, again.room)
    assert.deepEqual(applyImport(resolved), { ok: true, count: 1 })
    const list = loadOwnActivities()
    assert.equal(list.length, 2)
    const replaced = list.find((a) => a.id === 'own-imp-2dj-02-formhopp-over-block')
    assert.equal(replaced?.title, 'Formhopp över block — ny text')
  })
})

describe('edge fixture (AC 19–23, 26)', () => {
  it('handles one rule per row', () => {
    fresh()
    const { rows, room } = rowsOf(edge)
    assert.equal(rows.length, 7)
    const [r1, r2, r3, r4, r5, r6, r7] = rows

    assert.equal(r1.state, 'new')
    assert.deepEqual(r1.notes, [{ kind: 'unknownPiece', pieces: ['eq-ringar'] }])
    assert.deepEqual(r1.activity?.defaultStationEquipment, [{ pieceId: 'eq-trampett', count: 1 }])

    assert.equal(r2.state, 'new')
    assert.ok(r2.notes.some((n) => n.kind === 'steps'))
    assert.equal(r2.activity?.howTo.split('\n').length, 4)

    assert.equal(r3.state, 'invalid')
    assert.deepEqual(r3.notes, [{ kind: 'missing', fields: ['säkerhet'] }])
    assert.equal(r4.state, 'invalid')
    assert.deepEqual(r4.notes, [{ kind: 'dupId' }])

    assert.equal(r5.state, 'sameName')
    assert.ok(r5.notes.some((n) => n.kind === 'link'))
    assert.ok(r5.notes.some((n) => n.kind === 'source'))
    assert.equal(r5.activity?.progressionOf, undefined)
    assert.equal(r5.activity?.source, undefined)

    assert.equal(r6.state, 'new')
    assert.deepEqual(r6.notes, [{ kind: 'notTeknik' }])
    assert.equal(r6.activity?.defaultStationEquipment, undefined)
    assert.equal(r6.activity?.needsCoachReview, undefined)

    assert.equal(r7.state, 'invalid')
    assert.deepEqual(r7.notes, [{ kind: 'badFormat' }])

    const resolved = resolveRows(rows, new Map(), room)
    assert.deepEqual(
      resolved.map((r) => r.locked),
      [false, false, true, true, false, false, true],
    )
    assert.equal(chosenCount(resolved), 4)
  })

  it('clips long fields with Förkortad', () => {
    fresh()
    const doc = JSON.parse(example)
    doc.exercises = [
      {
        ...doc.exercises[0],
        id: 'own-imp-long-01',
        title: 'T'.repeat(120),
        summary: 'S'.repeat(300),
        howTo: `1. ${'a'.repeat(250)}\n2. kort`,
      },
    ]
    const { rows } = rowsOf(JSON.stringify(doc))
    assert.ok(rows[0].notes.some((n) => n.kind === 'clipped'))
    assert.equal(rows[0].activity?.title.length, 80)
    assert.equal(rows[0].activity?.summary.length, 240)
    const firstStep = rows[0].activity?.howTo.split('\n')[0] ?? ''
    assert.equal(firstStep.replace(/^1\. /, '').length, 180)
  })
})

describe('room (AC 25)', () => {
  it('with 99 own drills only the first new row fits', () => {
    fresh()
    const list = Array.from({ length: 99 }, (_, i) =>
      sanitizeOwnActivity({
        id: `own-fill-${i}`,
        title: `Fyll ${i}`,
        blockType: 'warmup',
        durationMinutesDefault: 5,
        summary: 'x',
        howTo: '1. x',
        watchFor: 'x',
        safetyLine: 'x',
      }),
    )
    const result = parseExerciseFile(example, {
      own: list.filter((a): a is Activity => Boolean(a)),
      seeds: seedActivities,
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.room, 1)
    const resolved = resolveRows(result.rows, new Map(), result.room)
    assert.deepEqual(resolved.map((r) => r.state), ['new', 'noRoom'])
    assert.equal(resolved[1].locked, true)
    // Skipping the first frees the room for the second.
    const swapped = resolveRows(result.rows, new Map([[0, 'skip' as RowChoice]]), result.room)
    assert.deepEqual(swapped.map((r) => r.state), ['new', 'new'])
    assert.deepEqual(swapped.map((r) => r.choice), ['skip', 'include'])
  })
})


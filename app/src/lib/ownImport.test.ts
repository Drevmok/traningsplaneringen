import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { clearOwnActivities } from './ownActivities.ts'
import {
  chosenActivities,
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

const content = new URL('../../../slice-30/content/', import.meta.url)
const example = readFileSync(new URL('example-import.json', content), 'utf8')
const edge = readFileSync(new URL('example-import-edge.json', content), 'utf8')

function fresh(): void {
  clearOwnActivities()
  mem.clear()
}

function rowsOf(text: string, titles?: string[]): { rows: ImportRow[]; batchNote?: string } {
  const result = parseExerciseFile(text, titles ? { titles } : undefined)
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

describe('example import into the bank (Slice 47 F1)', () => {
  it('a title already in the bank → Samma namn finns redan, starts on Hoppa över; writes nothing', () => {
    fresh()
    const { rows, batchNote } = rowsOf(example)
    assert.equal(rows.length, 2)
    // Both example drills are seeds since promotion 2DJ_oMM81mI → Samma namn finns redan.
    assert.deepEqual(rows.map((r) => r.state), ['sameName', 'sameName'])
    assert.deepEqual(rows.map((r) => r.defaultChoice), ['skip', 'skip'])
    assert.match(batchNote ?? '', /Prime Coaching Sport/)
    assert.equal(mem.size, 0)
    assert.equal(chosenActivities(resolveRows(rows, new Map())).length, 0)
  })

  it('titles come from the admin bank copy; Ta med carries redskap, tags, review flag and source', () => {
    fresh()
    const { rows } = rowsOf(example, ['Något annat'])
    assert.deepEqual(rows.map((r) => r.state), ['new', 'new'])
    assert.deepEqual(rows.map((r) => r.defaultChoice), ['include', 'include'])
    const chosen = chosenActivities(resolveRows(rows, new Map<number, RowChoice>([[1, 'skip']])))
    assert.equal(chosen.length, 1)
    const formhopp = chosen[0]
    assert.deepEqual(formhopp.defaultStationEquipment, [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-skumblock', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ])
    assert.ok(formhopp.tags.includes('trampett'))
    assert.equal(formhopp.needsCoachReview, true)
    assert.equal(formhopp.source?.creator, 'Prime Coaching Sport')
    assert.equal(mem.size, 0)
  })

  it('no room, Ersätt or Finns redan states any more', () => {
    fresh()
    const { rows } = rowsOf(edge)
    for (const r of resolveRows(rows, new Map())) {
      assert.ok(['new', 'sameName', 'invalid'].includes(r.state), r.state)
      assert.ok(['include', 'skip'].includes(r.choice), r.choice)
    }
  })
})

describe('edge fixture (AC 19–23, 26)', () => {
  it('handles one rule per row', () => {
    fresh()
    const { rows } = rowsOf(edge)
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
    assert.equal(r5.defaultChoice, 'skip')
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

    const resolved = resolveRows(rows, new Map())
    assert.deepEqual(
      resolved.map((r) => r.locked),
      [false, false, true, true, false, false, true],
    )
    assert.equal(chosenActivities(resolved).length, 3)
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

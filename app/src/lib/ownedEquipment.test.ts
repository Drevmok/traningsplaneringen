import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EQUIPMENT_PIECES, LEGACY_PIECE_IDS } from '../data/equipmentPieces.ts'
import { loadOwnedEquipment, ownsEveryPiece, saveOwnedEquipment } from './ownedEquipment.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => void mem.set(key, value),
    removeItem: (key: string) => void mem.delete(key),
    clear: () => mem.clear(),
    key: (index: number) => [...mem.keys()][index] ?? null,
    get length() {
      return mem.size
    },
  },
})

const KEY = 'gymnastics-planner-owned-equipment-v1'
const SEEN = 'gymnastics-planner-owned-equipment-seen-v1'

describe('redskap library (AC 30)', () => {
  it('has 15 pieces with the five new ones after Kon', () => {
    assert.equal(EQUIPMENT_PIECES.length, 15)
    assert.deepEqual(
      EQUIPMENT_PIECES.slice(9).map((p) => [p.id, p.labelSv]),
      [
        ['eq-kon', 'Kon'],
        ['eq-kilmatta', 'Kilmatta'],
        ['eq-skumblock', 'Skumblock'],
        ['eq-bom', 'Bom'],
        ['eq-racke', 'Räcke'],
        ['eq-rockring', 'Rockring'],
      ],
    )
  })
})

describe('owned redskap migration (AC 35)', () => {
  it('a saved list of the old ten owns all 15 after upgrade; later unticks stick', () => {
    mem.clear()
    mem.set(KEY, JSON.stringify(LEGACY_PIECE_IDS))
    const owned = loadOwnedEquipment()
    assert.equal(owned.length, 15)
    assert.equal(ownsEveryPiece(owned), true)
    assert.equal(JSON.parse(mem.get(SEEN) ?? '[]').length, 15)
    saveOwnedEquipment(owned.filter((id) => id !== 'eq-bom'))
    const again = loadOwnedEquipment()
    assert.equal(again.includes('eq-bom'), false)
    assert.equal(again.length, 14)
  })

  it('an old list where something was unticked keeps it unticked', () => {
    mem.clear()
    mem.set(KEY, JSON.stringify(LEGACY_PIECE_IDS.filter((id) => id !== 'eq-airtrack')))
    const owned = loadOwnedEquipment()
    assert.equal(owned.includes('eq-airtrack'), false)
    assert.equal(owned.includes('eq-kilmatta'), true)
    assert.equal(owned.length, 14)
  })

  it('no saved list means the whole catalog, without writing anything', () => {
    mem.clear()
    assert.equal(loadOwnedEquipment().length, 15)
    assert.equal(mem.size, 0)
  })
})

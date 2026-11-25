import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EQUIPMENT_PIECES } from '../data/equipmentPieces.ts'
import {
  applyClubEquipment,
  clubAvailableSet,
  missingClubPieces,
  resetClubEquipmentForTests,
  sanitizePieceIds,
} from './clubEquipment.ts'

const trampett = { pieceId: 'eq-trampett' }
const matta = { pieceId: 'eq-landningsmatta' }
const plint = { pieceId: 'eq-plint' }

describe('clubEquipment (Slice 68, A1 F1)', () => {
  it('sanitize: known ids unique in library order; unknown dropped; non-array → []', () => {
    assert.deepEqual(sanitizePieceIds(['eq-plint', 'eq-trampett', 'eq-plint', 'nope', 1]), [
      'eq-trampett',
      'eq-plint',
    ])
    assert.deepEqual(sanitizePieceIds(null), [])
    assert.equal(sanitizePieceIds(EQUIPMENT_PIECES.map((p) => p.id)).length, 15)
  })

  it('not filled (null set) → no missing marks, even with slots', () => {
    assert.deepEqual(missingClubPieces([trampett, matta], null), [])
  })

  it('filled list: missing labels in library order; empty list → every slotted piece missing', () => {
    const has = new Set(['eq-plint'])
    assert.deepEqual(missingClubPieces([matta, trampett, plint], has), [
      { pieceId: 'eq-trampett', labelSv: 'Trampett' },
      { pieceId: 'eq-landningsmatta', labelSv: 'Landningsmatta' },
    ])
    assert.deepEqual(missingClubPieces([trampett, matta], new Set()), [
      { pieceId: 'eq-trampett', labelSv: 'Trampett' },
      { pieceId: 'eq-landningsmatta', labelSv: 'Landningsmatta' },
    ])
  })

  it('apply: filled even when empty; null clears to not filled', () => {
    applyClubEquipment([])
    assert.deepEqual(clubAvailableSet(), new Set())
    applyClubEquipment(['eq-trampett', 'nope'])
    assert.deepEqual([...clubAvailableSet()!], ['eq-trampett'])
    applyClubEquipment(null)
    assert.equal(clubAvailableSet(), null)
    resetClubEquipmentForTests()
  })
})

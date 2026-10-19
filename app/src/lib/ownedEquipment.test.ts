import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EQUIPMENT_PIECES } from '../data/equipmentPieces.ts'

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

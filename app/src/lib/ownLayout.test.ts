import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultLayoutFrom } from '../data/stationLayout.ts'
import { activityPatch, pendingRow } from './admin/bankWrite.ts'
import { activityToShareOwn, sanitizeOwnActivity } from './ownActivities.ts'

const slots = [{ pieceId: 'eq-trampett', count: 1 }, { pieceId: 'eq-landningsmatta', count: 1 }]
const layout = defaultLayoutFrom(slots)
const raw = {
  id: 'own-x',
  title: 'Egen',
  blockType: 'techniques',
  durationMinutesDefault: 5,
  summary: 'Varför',
  howTo: 'Steg ett',
  watchFor: 'Titta',
  safetyLine: 'Säkert',
  defaultStationEquipment: slots,
  defaultStationLayout: layout,
}

describe('Slice 57 — own drill layout (1b)', () => {
  it('kept on Teknik, dropped elsewhere, shared, sent to the bank', () => {
    const a = sanitizeOwnActivity(raw)
    assert.deepEqual(a?.defaultStationLayout, layout)
    assert.equal(sanitizeOwnActivity({ ...raw, blockType: 'warmup' })?.defaultStationLayout, undefined)
    assert.deepEqual(activityToShareOwn(a!).defaultStationLayout, layout)
    const { patch } = activityPatch(a!)
    assert.deepEqual(pendingRow(patch, {}, 'tech-egen-x').default_station_layout, layout)
  })
  it('pending row without a layout does not send the column', () => {
    const a = sanitizeOwnActivity({ ...raw, defaultStationLayout: undefined })!
    const row = pendingRow(activityPatch(a).patch, {}, 'tech-egen-y')
    assert.equal('default_station_layout' in row, false)
    const warm = pendingRow({ ...activityPatch(a).patch, block_type: 'warmup', default_station_layout: layout }, {}, 'warm-egen-z')
    assert.equal('default_station_layout' in warm, false)
  })
})

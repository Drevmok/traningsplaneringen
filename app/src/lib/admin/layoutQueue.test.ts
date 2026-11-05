import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { floorTip } from '../../data/activityTips.ts'
import { seedActivities } from '../../data/seedActivities.ts'
import { defaultLayoutFrom } from '../../data/stationLayout.ts'
import type { Activity } from '../../types.ts'
import { activityToBankRow, type BankRowStatus } from '../bankRow.ts'
import { toAdminEntries } from './adminBank.ts'
import { needsLayout } from './layoutQueue.ts'

const teknik = seedActivities.find((a) => a.id === 'tech-formhopp-over-block') as Activity
const warm = seedActivities.find((a) => a.blockType === 'warmup') as Activity

function row(a: Activity, status: BankRowStatus = 'published') {
  return activityToBankRow(a, 0, floorTip(a).safety ?? null, status)
}

function admin(raw: unknown) {
  const entries = toAdminEntries([raw])
  assert.equal(entries.length, 1)
  return entries[0]
}

describe('Slice 59 needsLayout (B1)', () => {
  it('published Teknik with redskap and no layout → true', () => {
    assert.equal(teknik.defaultStationEquipment!.length > 0, true)
    assert.equal(needsLayout(admin(row(teknik))), true)
  })

  it('the same row with a valid layout → false', () => {
    const layout = defaultLayoutFrom(teknik.defaultStationEquipment!)
    assert.equal(needsLayout(admin(row({ ...teknik, defaultStationLayout: layout }))), false)
  })

  it('pending → true', () => {
    assert.equal(needsLayout(admin(row(teknik, 'pending'))), true)
  })

  it('hidden → false', () => {
    assert.equal(needsLayout(admin(row(teknik, 'hidden'))), false)
  })

  it('Teknik without redskap → false', () => {
    const raw = row(teknik)
    raw.default_station_equipment = null
    assert.equal(needsLayout(admin(raw)), false)
  })

  it('uppvärmning with redskap → false', () => {
    const raw = row(warm)
    raw.default_station_equipment = [{ pieceId: 'eq-trampett', count: 1 }]
    assert.equal(needsLayout(admin(raw)), false)
  })

  it('raw row whose layout count does not match, through toAdminEntries → true', () => {
    const raw = row(teknik)
    raw.default_station_layout = { v: 1, poses: [{ pieceId: 'eq-trampett', x: 0.2, z: 0.4, yaw: 0 }] }
    const entry = admin(raw)
    assert.equal(entry.activity.defaultStationLayout, undefined)
    assert.equal(needsLayout(entry), true)
  })
})

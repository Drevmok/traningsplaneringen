import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { UI } from './blockMeta.ts'
import { seedActivities } from './seedActivities.ts'
import {
  defaultLayoutFrom,
  layoutForStation,
  sanitizeStationLayout,
  syncLayout,
} from './stationLayout.ts'
import { StationSketch } from '../components/StationSketch.tsx'
import { StationSketch as MainSketch } from '../components/StationSketch.main-fixture.tsx'
import { stationCards } from '../lib/stationCards.ts'
import type { Activity, Session, StationEquipmentSlot, StationLayout } from '../types.ts'

const slots: StationEquipmentSlot[] = [
  { pieceId: 'eq-trampett', count: 1 },
  { pieceId: 'eq-landningsmatta', count: 2 },
]
const good: StationLayout = {
  v: 1,
  poses: [
    { pieceId: 'eq-trampett', x: 0.2, z: 0.1, yaw: 0 },
    { pieceId: 'eq-landningsmatta', x: 0.6, z: 0.5, yaw: Math.PI / 2 },
    { pieceId: 'eq-landningsmatta', x: 0.8, z: 0.9, yaw: 0 },
  ],
}

describe('Slice 57 sanitizeStationLayout', () => {
  it('keeps a good layout', () => assert.deepEqual(sanitizeStationLayout(good, slots), good))
  it('wrong version / NaN / wrong count / unknown-only piece → undefined', () => {
    assert.equal(sanitizeStationLayout({ ...good, v: 2 }, slots), undefined)
    const nan = structuredClone(good)
    nan.poses[0].x = Number.NaN
    assert.equal(sanitizeStationLayout(nan, slots), undefined)
    assert.equal(sanitizeStationLayout({ v: 1, poses: good.poses.slice(0, 2) }, slots), undefined)
    const unknown = structuredClone(good)
    unknown.poses[0].pieceId = 'eq-okand'
    assert.equal(sanitizeStationLayout(unknown, slots), undefined)
    assert.equal(sanitizeStationLayout(null, slots), undefined)
    assert.equal(sanitizeStationLayout('x', slots), undefined)
    assert.equal(sanitizeStationLayout(good, []), undefined)
  })
  it('clamps x/z and wraps yaw; drops poses for pieces not in the list', () => {
    const raw = structuredClone(good) as StationLayout
    raw.poses[0] = { pieceId: 'eq-trampett', x: 2, z: -1, yaw: 3 * Math.PI }
    raw.poses.push({ pieceId: 'eq-kon', x: 0.5, z: 0.5, yaw: 0 })
    const out = sanitizeStationLayout(raw, slots) as StationLayout
    assert.equal(out.poses.length, 3)
    assert.equal(out.poses[0].x, 1)
    assert.equal(out.poses[0].z, 0)
    assert.ok(Math.abs(out.poses[0].yaw) <= Math.PI + 1e-9)
  })
})

describe('Slice 57 syncLayout (C1)', () => {
  it('appends new / more pieces at last x + 0.08, z 0.5, yaw 0', () => {
    const out = syncLayout(good, [...slots, { pieceId: 'eq-kon', count: 1 }])
    assert.deepEqual(out.poses.at(-1), { pieceId: 'eq-kon', x: 0.88, z: 0.5, yaw: 0 })
    const more = syncLayout(good, [{ pieceId: 'eq-trampett', count: 3 }, slots[1]])
    assert.equal(more.poses.filter((p) => p.pieceId === 'eq-trampett').length, 3)
    assert.ok(more.poses.every((p) => p.x <= 1))
  })
  it('fewer → last poses of that piece go; removed → all go', () => {
    const fewer = syncLayout(good, [slots[0], { pieceId: 'eq-landningsmatta', count: 1 }])
    assert.deepEqual(fewer.poses.map((p) => p.x), [0.2, 0.6])
    const removed = syncLayout(good, [slots[0]])
    assert.deepEqual(removed.poses.map((p) => p.pieceId), ['eq-trampett'])
  })
  it('1 → 3 → 2 stays valid for the trigger rules', () => {
    const one = [{ pieceId: 'eq-kon', count: 1 }]
    const three = [{ pieceId: 'eq-kon', count: 3 }]
    const two = [{ pieceId: 'eq-kon', count: 2 }]
    const a = syncLayout(defaultLayoutFrom(one), three)
    assert.equal(a.poses.length, 3)
    const b = syncLayout(a, two)
    assert.ok(sanitizeStationLayout(b, two))
  })
})

describe('Slice 57 defaultLayoutFrom', () => {
  it('heuristic order without approach mats; one pose per counted piece', () => {
    const s: StationEquipmentSlot[] = [
      { pieceId: 'eq-landningsmatta', count: 1 },
      { pieceId: 'eq-trampett', count: 1 },
    ]
    const out = defaultLayoutFrom(s)
    assert.deepEqual(out.poses.map((p) => p.pieceId), ['eq-trampett', 'eq-landningsmatta'])
    const t = defaultLayoutFrom([{ pieceId: 'eq-trampett', count: 1 }])
    assert.equal(t.poses.length, 1) // no cushions
    assert.ok(sanitizeStationLayout(out, s))
  })
})

describe('Slice 57 StationSketch (D1)', () => {
  const golden = seedActivities.filter((a) => a.defaultStationEquipment?.length)
  it('without layout: markup identical to main for every seed (incl. Ljushopp på satsbräda + trampett)', () => {
    assert.ok(golden.some((a) => a.title === 'Ljushopp på satsbräda'))
    assert.ok(golden.some((a) => a.id === 'tech-ljushopp-trampett'))
    for (const a of golden) {
      const slotsA = a.defaultStationEquipment as StationEquipmentSlot[]
      assert.equal(
        renderToStaticMarkup(createElement(StationSketch, { slots: slotsA })),
        renderToStaticMarkup(createElement(MainSketch, { slots: slotsA })),
        a.id,
      )
    }
  })
  it('with layout: no approach text, broken layout falls back', () => {
    const tramp = [{ pieceId: 'eq-trampett', count: 1 }]
    const withApproach = renderToStaticMarkup(createElement(StationSketch, { slots: tramp }))
    assert.ok(withApproach.includes(UI.stationSketchApproach))
    const html = renderToStaticMarkup(
      createElement(StationSketch, { slots: tramp, layout: defaultLayoutFrom(tramp) }),
    )
    assert.ok(!html.includes(UI.stationSketchApproach))
    assert.ok(html.includes('rotate('))
    const broken = { v: 9, poses: [] } as unknown as StationLayout
    assert.equal(
      renderToStaticMarkup(createElement(StationSketch, { slots: tramp, layout: broken })),
      withApproach,
    )
  })
})

describe('Slice 57 E1 — pass list ≠ förslag → no layout', () => {
  const base = seedActivities.find((a) => a.id === 'tech-ljushopp-trampett') as Activity
  const suggested = base.defaultStationEquipment as StationEquipmentSlot[]
  const a: Activity = { ...base, defaultStationLayout: defaultLayoutFrom(suggested) }
  it('layoutForStation', () => {
    assert.ok(layoutForStation(a, undefined))
    assert.ok(layoutForStation(a, suggested.map((s) => ({ ...s }))))
    assert.equal(layoutForStation(a, [{ pieceId: 'eq-kon', count: 1 }]), undefined)
    assert.equal(layoutForStation(a, []), undefined)
    assert.equal(layoutForStation(base, undefined), undefined)
  })
  it('stationCards: seeds have no layout', () => {
    const s = {
      id: 's',
      title: 'p',
      totalMinutes: 5,
      blocks: [
        {
          id: 'b',
          type: 'techniques',
          title: 'Teknik',
          durationMinutes: 5,
          coachNote: '',
          items: [{ id: 'i', activityId: base.id, durationMinutes: 5, note: '', order: 0 }],
        },
      ],
    } as unknown as Session
    assert.equal(stationCards(s)[0]?.equipmentLayout, undefined)
  })
})

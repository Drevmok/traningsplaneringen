import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { UI } from './blockMeta.ts'
import { seedActivities } from './seedActivities.ts'
import {
  defaultLayoutFrom,
  DETAIL_FLOOR,
  layoutBounds,
  layoutForStation,
  SHEET_FLOOR,
  SURFACE_STEP_H,
  SURFACE_STEP_W,
  sanitizeStationLayout,
  syncLayout,
} from './stationLayout.ts'
import { StationSketch } from '../components/StationSketch.tsx'
import { poseTransform, sortedPoses } from '../components/stationPose.ts'
import { StationSketch as MainSketch } from '../components/StationSketch.main-fixture.tsx'
import { StationSketch as S57Sketch } from '../components/StationSketch.s57-fixture.tsx'
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

describe('Slice 58 y + yta (A1 C1 D1)', () => {
  const two: StationEquipmentSlot[] = [{ pieceId: 'eq-landningsmatta', count: 2 }]
  const base = (extra: Record<string, unknown> = {}, y?: unknown) => ({
    v: 1,
    poses: [
      { pieceId: 'eq-landningsmatta', x: 0.5, z: 0.5, yaw: 0, ...(y === undefined ? {} : { y }) },
      { pieceId: 'eq-landningsmatta', x: 0.5, z: 0.5, yaw: 0 },
    ],
    ...extra,
  })
  it('y missing → omitted; 1.7 → 1; 0.3 → 0.25; NaN/string → omitted', () => {
    assert.equal('y' in sanitizeStationLayout(base(), two)!.poses[0], false)
    assert.equal(sanitizeStationLayout(base({}, 1.7), two)!.poses[0].y, 1)
    assert.equal(sanitizeStationLayout(base({}, 0.3), two)!.poses[0].y, 0.25)
    assert.equal('y' in sanitizeStationLayout(base({}, NaN), two)!.poses[0], false)
    assert.equal('y' in sanitizeStationLayout(base({}, 'hög'), two)!.poses[0], false)
    assert.equal(sanitizeStationLayout(base({}, 5), two)!.poses[0].y, 1)
  })
  it('surface clamped 0–2; invalid or zero → omitted', () => {
    assert.deepEqual(sanitizeStationLayout(base({ surface: { w: 5, h: -1 } }), two)!.surface, { w: 2, h: 0 })
    assert.equal(sanitizeStationLayout(base({ surface: { w: -3, h: -3 } }), two)!.surface, undefined)
    assert.equal(sanitizeStationLayout(base({ surface: 'stor' }), two)!.surface, undefined)
    assert.deepEqual(sanitizeStationLayout(base({ surface: { w: 1.4, h: 2 } }), two)!.surface, { w: 1, h: 2 })
  })
  it('Slice 57 layout without new fields round-trips identically', () => {
    const old = base()
    assert.equal(JSON.stringify(sanitizeStationLayout(old, two)), JSON.stringify(old))
  })
  it('syncLayout keeps surface; new poses have no y', () => {
    const l = sanitizeStationLayout(base({ surface: { w: 1, h: 1 } }, 0.125), two)!
    const synced = syncLayout(l, [{ pieceId: 'eq-landningsmatta', count: 3 }])
    assert.deepEqual(synced.surface, { w: 1, h: 1 })
    assert.equal(synced.poses[0].y, 0.125)
    assert.equal('y' in synced.poses[2], false)
  })
  it('layoutBounds: never below today height, min 320 wide, grows with stack and surface', () => {
    const empty = layoutBounds({ v: 1, poses: [] })
    assert.deepEqual(empty, DETAIL_FLOOR)
    const sparse = layoutBounds(sanitizeStationLayout(base(), two)!)
    assert.ok(sparse.w >= 320 && sparse.w < 640, `sparse w ${sparse.w}`)
    assert.ok(sparse.y0 <= DETAIL_FLOOR.y0 && sparse.y0 + sparse.h >= 190)
    const stacked = layoutBounds(sanitizeStationLayout(base({}, 1), two)!)
    assert.ok(stacked.y0 < sparse.y0, 'stack raises the top')
    const dense = layoutBounds({
      v: 1,
      poses: [
        { pieceId: 'eq-bom', x: 0, z: 0, yaw: Math.PI / 4 },
        { pieceId: 'eq-bom', x: 1, z: 1, yaw: -Math.PI / 2 },
      ],
    })
    assert.ok(dense.x0 < 0 && dense.x0 + dense.w > 640, 'dense marks at both ends are not clipped')
    const grown = layoutBounds(sanitizeStationLayout(base({ surface: { w: 2, h: 1 } }), two)!)
    assert.equal(grown.w, sparse.w + 2 * SURFACE_STEP_W)
    assert.equal(grown.h, sparse.h + SURFACE_STEP_H)
    const sheet = layoutBounds({ v: 1, poses: [] }, SHEET_FLOOR)
    assert.deepEqual(sheet, SHEET_FLOOR)
  })
  it('poseOrder: y before z, then index; y 0 transform equals Slice 57 string', () => {
    const poses = [
      { pieceId: 'a', x: 0, z: 0, yaw: 0, y: 0.5 },
      { pieceId: 'b', x: 0, z: 1, yaw: 0 },
      { pieceId: 'c', x: 0, z: 0, yaw: 0 },
    ]
    assert.deepEqual(sortedPoses({ v: 1, poses }).map((p) => p.pieceId), ['b', 'c', 'a'])
    assert.equal(
      poseTransform({ pieceId: 'x', x: 0.5, z: 0.5, yaw: 0 }, 'landing'),
      'translate(320.0 140.0) rotate(0.0) scale(0.925) translate(-82 0)',
    )
    assert.equal(
      poseTransform({ pieceId: 'x', x: 0.5, z: 0.5, yaw: 0, y: 0.125 }, 'landing'),
      'translate(320.0 134.0) rotate(0.0) scale(0.925) translate(-82 0)',
    )
  })
  it('StationSketch: Slice 57 layout without y has main markup except viewBox/background', () => {
    const l = sanitizeStationLayout(base(), two)!
    const strip = (h: string) => h.replace(/viewBox="[^"]*"/, '').replace(/<rect[^>]*>/g, '')
    const now = renderToStaticMarkup(createElement(StationSketch, { slots: two, layout: l }))
    const main = renderToStaticMarkup(createElement(S57Sketch, { slots: two, layout: l }))
    assert.equal(strip(now), strip(main))
  })
  it('bank row round-trip keeps y and surface', () => {
    const l = base({ surface: { w: 1, h: 2 } }, 0.25)
    const json = JSON.parse(JSON.stringify(sanitizeStationLayout(l, two)))
    assert.deepEqual(sanitizeStationLayout(json, two), sanitizeStationLayout(l, two))
  })
})

import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { UI } from '../data/blockMeta'
import { getEquipmentPiece } from '../data/equipmentPieces'
import {
  defaultLayoutFrom,
  kindOf,
  layoutBounds,
  MAX_LAYERS,
  normalizeYaw,
  SHEET_FLOOR,
  syncLayout,
  type LayoutBox,
} from '../data/stationLayout'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import type { StationEquipmentSlot, StationLayout, StationPose } from '../types'
import { EquipmentMark } from './equipmentMark'
import { layerLift, LAYOUT_VIEW_W, poseOrder, poseTransform, SKETCH_FLOOR_Y } from './stationPose'

interface Props {
  slots: StationEquipmentSlot[]
  initialLayout?: StationLayout
  /** undefined = «Ställ i rad igen» (back to the heuristic). */
  onDone: (layout?: StationLayout) => void
  onClose: () => void
}

const STEP = 0.02
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** Slice 57 (A2) — own sheet: drag the redskap, Vrid 90°. No drag library. */
export function StationLayoutSheet({ slots, initialLayout, onDone, onClose }: Props) {
  useBodyScrollLock(true)
  const [start] = useState(() => (initialLayout ? syncLayout(initialLayout, slots) : defaultLayoutFrom(slots)))
  const [poses, setPoses] = useState<StationPose[]>(start.poses)
  const [surface, setSurface] = useState({ w: start.surface?.w ?? 0, h: start.surface?.h ?? 0 })
  /** Frozen viewBox while a drag is in progress (D1), so the area never jumps under the finger. */
  const [frozen, setFrozen] = useState<LayoutBox | null>(null)
  const [reset, setReset] = useState(false)
  const [selected, setSelected] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const empty = slots.length === 0

  function update(index: number, change: (p: StationPose) => StationPose) {
    setReset(false)
    setPoses((prev) => prev.map((p, i) => (i === index ? change(p) : p)))
  }

  function toFloor(clientX: number, clientY: number, lift = 0): { x: number; z: number } | null {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: clamp01((pt.x - 16) / (LAYOUT_VIEW_W - 32)), z: clamp01((SKETCH_FLOOR_Y - lift - pt.y) / 60) }
  }

  function onPointerDown(e: ReactPointerEvent<SVGGElement>, index: number) {
    if (e.button !== 0) return
    setSelected(index)
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    setFrozen(box)
    const lift = layerLift(poses[index])
    const move = (ev: PointerEvent) => {
      const at = toFloor(ev.clientX, ev.clientY, lift)
      if (at) update(index, (p) => ({ ...p, x: at.x, z: at.z }))
    }
    const end = () => {
      setFrozen(null)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
  }

  function rotate(index: number) {
    update(index, (p) => ({ ...p, yaw: normalizeYaw(p.yaw + Math.PI / 2) }))
  }

  function layers(index: number): number {
    return Math.round((poses[index]?.y ?? 0) * MAX_LAYERS)
  }

  /** B1: one step = one layer (1/8); 0 → y omitted so floor poses stay as in Slice 57. */
  function lift(index: number, delta: number) {
    update(index, (p) => {
      const n = Math.min(MAX_LAYERS, Math.max(0, Math.round((p.y ?? 0) * MAX_LAYERS) + delta))
      const { y: _old, ...rest } = p
      void _old
      return n === 0 ? rest : { ...rest, y: n / MAX_LAYERS }
    })
  }

  function grow(key: 'w' | 'h') {
    setReset(false)
    setSurface((s) => ({ ...s, [key]: Math.min(2, s[key] + 1) }))
  }

  function onKey(e: KeyboardEvent<SVGGElement>, index: number) {
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      lift(index, e.key === 'PageUp' ? 1 : -1)
      return
    }
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, STEP],
      ArrowDown: [0, -STEP],
    }
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault()
      rotate(index)
      return
    }
    const step = d[e.key]
    if (!step) return
    e.preventDefault()
    update(index, (p) => ({ ...p, x: clamp01(p.x + step[0]), z: clamp01(p.z + step[1]) }))
  }

  const order = poses.map((p, i) => ({ p, i })).sort(poseOrder)
  const surfaceOut = surface.w || surface.h ? surface : undefined
  const box = frozen ?? layoutBounds({ v: 1, poses, surface: surfaceOut }, SHEET_FLOOR)
  const current = poses[selected]
  const currentLayers = layers(selected)
  const currentLabel = current ? getEquipmentPiece(current.pieceId)?.labelSv ?? current.pieceId : ''

  return (
    <div
      className="modal-backdrop station-compose-backdrop station-layout-backdrop own-equipment-picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-layout-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal station-compose-sheet station-layout-sheet">
        <h2 id="station-layout-title">{UI.stationLayoutTitle}</h2>
        {empty ? (
          <p className="station-layout-empty">{UI.stationLayoutEmpty}</p>
        ) : (
          <>
            <p className="station-layout-hint">{UI.stationLayoutHint}</p>
            <svg
              ref={svgRef}
              className="station-sketch station-layout-floor"
              viewBox={`${box.x0} ${box.y0} ${box.w} ${box.h}`}
              role="group"
              aria-label={UI.stationLayoutTitle}
            >
              <rect x={box.x0} y={box.y0} width={box.w} height={box.h} fill="#e7e5e1" />
              <rect x={box.x0 + 16} y="142" width={box.w - 32} height="28" fill="#d7d4ce" />
              {order.map(({ p, i }) => {
                const kind = kindOf(p.pieceId)
                if (!kind) return null
                const label = getEquipmentPiece(p.pieceId)?.labelSv ?? p.pieceId
                return (
                  <g
                    key={i}
                    className={`station-layout-piece${i === selected ? ' is-selected' : ''}`}
                    transform={poseTransform(p, kind)}
                    tabIndex={0}
                    role="button"
                    aria-label={label}
                    onPointerDown={(e) => onPointerDown(e, i)}
                    onFocus={() => setSelected(i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <EquipmentMark kind={kind} x={0} y={0} />
                  </g>
                )
              })}
            </svg>
          </>
        )}
        <div className="modal-actions station-layout-actions">
          {!empty && current && (
            <button
              type="button"
              className="btn-secondary"
              aria-label={UI.stationLayoutRotateAria(currentLabel)}
              onClick={() => rotate(selected)}
            >
              {UI.stationLayoutRotate}
            </button>
          )}
          {!empty && current && (
            <>
              <button
                type="button"
                className="btn-secondary"
                aria-label={UI.stationLayoutRaiseAria(currentLabel)}
                disabled={currentLayers >= MAX_LAYERS}
                onClick={() => lift(selected, 1)}
              >
                {UI.stationLayoutRaise}
              </button>
              <button
                type="button"
                className="btn-secondary"
                aria-label={UI.stationLayoutLowerAria(currentLabel)}
                disabled={currentLayers <= 0}
                onClick={() => lift(selected, -1)}
              >
                {UI.stationLayoutLower}
              </button>
              {currentLayers > 0 && (
                <span className="station-layout-layer">{UI.stationLayoutLayer(currentLayers)}</span>
              )}
            </>
          )}
          {!empty && (
            <>
              <button type="button" className="btn-secondary" disabled={surface.w >= 2} onClick={() => grow('w')}>
                {UI.stationLayoutWider}
              </button>
              <button type="button" className="btn-secondary" disabled={surface.h >= 2} onClick={() => grow('h')}>
                {UI.stationLayoutTaller}
              </button>
              {surfaceOut && (
                <button type="button" className="btn-secondary" onClick={() => setSurface({ w: 0, h: 0 })}>
                  {UI.stationLayoutSurfaceReset}
                </button>
              )}
            </>
          )}
          {!empty && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setReset(true)
                setPoses(defaultLayoutFrom(slots).poses)
                setSurface({ w: 0, h: 0 })
              }}
            >
              {UI.stationLayoutReset}
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              onDone(empty || reset ? undefined : surfaceOut ? { v: 1, poses, surface: surfaceOut } : { v: 1, poses })
            }
          >
            {UI.stationLayoutDone}
          </button>
        </div>
      </div>
    </div>
  )
}

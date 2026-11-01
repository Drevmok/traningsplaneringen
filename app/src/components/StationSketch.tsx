import { UI } from '../data/blockMeta'
import { expand, kindOf, layoutBounds, sanitizeStationLayout } from '../data/stationLayout'
import type { StationEquipmentSlot, StationLayout } from '../types'
import { LAYOUT_VIEW_W, poseTransform, sortedPoses } from './stationPose'
import { EQUIPMENT_ROW_WIDTH, EquipmentMark } from './equipmentMark'

interface Props {
  slots: StationEquipmentSlot[]
  /** Slice 57 (D1) — saved poses; valid → drawn as placed, no approach mats or text. */
  layout?: StationLayout
}

export function StationSketch({ slots, layout }: Props) {
  const valid = layout ? sanitizeStationLayout(layout, slots) : undefined
  if (valid) {
    const vbW = LAYOUT_VIEW_W
    const b = layoutBounds(valid)
    return (
      <figure className="station-sketch-wrap">
        <svg
          className="station-sketch"
          viewBox={`${b.x0} ${b.y0} ${b.w} ${b.h}`}
          role="img"
          aria-label={UI.stationSketchCaption}
        >
          <rect x={b.x0} y={b.y0} width={b.w} height={b.h} fill="#e7e5e1" />
          <rect x={b.x0 + 16} y="142" width={b.w - 32} height="28" fill="#d7d4ce" />
          {sortedPoses(valid).map((pose, index) => {
            const kind = kindOf(pose.pieceId)
            if (!kind) return null
            return (
              <g key={`${pose.pieceId}-${index}`} transform={poseTransform(pose, kind, vbW)}>
                <EquipmentMark kind={kind} x={0} y={0} />
              </g>
            )
          })}
        </svg>
        <figcaption className="station-sketch-caption">{UI.stationSketchCaption}</figcaption>
      </figure>
    )
  }

  const { pieces, approach } = expand(slots)
  if (pieces.length === 0) return null

  const gap = 10
  const total =
    pieces.reduce((sum, kind) => sum + EQUIPMENT_ROW_WIDTH[kind], 0) +
    gap * Math.max(0, pieces.length - 1)
  const vbW = Math.max(total + 56, 320)
  let cursor = (vbW - total) / 2
  const y = 150

  return (
    <figure className="station-sketch-wrap">
      <svg
        className="station-sketch"
        viewBox={`0 78 ${vbW} 112`}
        role="img"
        aria-label={UI.stationSketchCaption}
      >
        <rect x="0" y="78" width={vbW} height="112" fill="#e7e5e1" />
        <rect x="16" y="142" width={vbW - 32} height="28" fill="#d7d4ce" />
        {pieces.map((kind, index) => {
          const x = cursor
          cursor += EQUIPMENT_ROW_WIDTH[kind] + gap
          return <EquipmentMark key={`${kind}-${index}`} kind={kind} x={x} y={y} />
        })}
      </svg>
      <figcaption className="station-sketch-caption">
        {UI.stationSketchCaption}
        {approach ? ` ${UI.stationSketchApproach}` : ''}
      </figcaption>
    </figure>
  )
}

import { UI } from '../data/blockMeta'
import type { StationEquipmentSlot } from '../types'
import {
  EQUIPMENT_ROW_WIDTH,
  EquipmentMark,
  type EquipmentKind,
} from './equipmentMark'

interface Props {
  slots: StationEquipmentSlot[]
}

function expand(slots: StationEquipmentSlot[]): { pieces: EquipmentKind[]; approach: boolean } {
  const count = new Map<string, number>()
  for (const slot of slots) {
    if (slot.count < 1) continue
    count.set(slot.pieceId, Math.min(9, (count.get(slot.pieceId) ?? 0) + slot.count))
  }
  const hasRunway =
    count.has('eq-tumblingmatta') || count.has('eq-airtrack') || count.has('eq-madrass')
  const approach =
    (count.has('eq-trampett') || count.has('eq-satsbrada')) && !hasRunway
  const pieces: EquipmentKind[] = []
  if (approach) {
    for (let i = 0; i < 4; i++) pieces.push('cushion')
  }
  const order: Array<[string, EquipmentKind, number]> = [
    ['eq-airtrack', 'air', 1],
    ['eq-tumblingmatta', 'track', 1],
    ['eq-madrass', 'cushion', 4],
    ['eq-satsbrada', 'board', 2],
    ['eq-trampett', 'trampett', 3],
    ['eq-flickiskudde', 'flick', 2],
    ['eq-plint', 'plint', 2],
    ['eq-mattberg', 'hill', 1],
    ['eq-landningsmatta', 'landing', 2],
    ['eq-kon', 'cone', 4],
  ]
  for (const [id, kind, cap] of order) {
    const n = Math.min(count.get(id) ?? 0, cap)
    for (let i = 0; i < n; i++) pieces.push(kind)
  }
  return { pieces, approach }
}

export function StationSketch({ slots }: Props) {
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

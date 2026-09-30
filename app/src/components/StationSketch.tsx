import { UI } from '../data/blockMeta'
import type { StationEquipmentSlot } from '../types'

interface Props {
  slots: StationEquipmentSlot[]
}

type Kind =
  | 'cushion'
  | 'trampett'
  | 'board'
  | 'plint'
  | 'track'
  | 'air'
  | 'landing'
  | 'hill'
  | 'flick'
  | 'cone'

const WIDTH: Record<Kind, number> = {
  cushion: 62,
  trampett: 132,
  board: 84,
  plint: 72,
  track: 156,
  air: 168,
  landing: 176,
  hill: 108,
  flick: 78,
  cone: 30,
}

function expand(slots: StationEquipmentSlot[]): { pieces: Kind[]; approach: boolean } {
  const count = new Map<string, number>()
  for (const slot of slots) {
    if (slot.count < 1) continue
    count.set(slot.pieceId, Math.min(9, (count.get(slot.pieceId) ?? 0) + slot.count))
  }
  const hasRunway =
    count.has('eq-tumblingmatta') || count.has('eq-airtrack') || count.has('eq-madrass')
  const approach =
    (count.has('eq-trampett') || count.has('eq-satsbrada')) && !hasRunway
  const pieces: Kind[] = []
  if (approach) {
    for (let i = 0; i < 4; i++) pieces.push('cushion')
  }
  const order: Array<[string, Kind, number]> = [
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

function Box({
  x,
  y,
  w,
  d,
  h,
  front,
  top,
  side,
}: {
  x: number
  y: number
  w: number
  d: number
  h: number
  front: string
  top: string
  side: string
}) {
  const dx = d * 0.42
  const dy = d * 0.26
  return (
    <g>
      <polygon
        points={`${x + w},${y - h} ${x + w + dx},${y - h - dy} ${x + w + dx},${y - dy} ${x + w},${y}`}
        fill={side}
        stroke="#161616"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <rect
        x={x}
        y={y - h}
        width={w}
        height={h}
        fill={front}
        stroke="#161616"
        strokeWidth="1.3"
      />
      <polygon
        points={`${x},${y - h} ${x + w},${y - h} ${x + w + dx},${y - h - dy} ${x + dx},${y - h - dy}`}
        fill={top}
        stroke="#161616"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </g>
  )
}

function Cushion({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={50} d={28} h={22} front="#5348e6" top="#6a60f2" side="#3d34c4" />
}

function Trampett({ x, y }: { x: number; y: number }) {
  const legs = [14, 38, 68, 92]
  return (
    <g>
      {legs.map((lx) => (
        <rect key={lx} x={x + lx} y={y - 16} width={5} height={16} rx="1" fill="#e6c56a" stroke="#161616" strokeWidth="1.1" />
      ))}
      <Box x={x + 4} y={y - 30} w={108} d={36} h={14} front="#4a42dc" top="#5c54ea" side="#332cae" />
      <polygon
        points={`${x + 18},${y - 46} ${x + 96},${y - 46} ${x + 108},${y - 54} ${x + 30},${y - 54}`}
        fill="#c5c8ce"
        stroke="#161616"
        strokeWidth="1.3"
      />
    </g>
  )
}

function Board({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Box x={x} y={y} w={64} d={32} h={12} front="#3f3a9e" top="#514cc0" side="#2c2878" />
      <polygon
        points={`${x + 10},${y - 14} ${x + 54},${y - 14} ${x + 64},${y - 20} ${x + 20},${y - 20}`}
        fill="#f3f0ea"
        stroke="#161616"
        strokeWidth="1.2"
      />
    </g>
  )
}

function Landing({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={148} d={52} h={36} front="#4c44e0" top="#675ef2" side="#332ea8" />
}

function Hill({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Box x={x} y={y} w={90} d={40} h={18} front="#5a52e4" top="#726bf2" side="#3a32b8" />
      <Box x={x + 18} y={y - 18} w={56} d={30} h={16} front="#675ef0" top="#7d76f6" side="#453cc4" />
    </g>
  )
}

function Track({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={140} d={28} h={10} front="#2a2424" top="#3a3232" side="#161212" />
}

function Air({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={150} d={32} h={14} front="#f0e35a" top="#fff27a" side="#c9b63a" />
}

function Plint({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={52} d={34} h={34} front="#2f6f86" top="#3d8ea8" side="#1e4c5e" />
}

function Flick({ x, y }: { x: number; y: number }) {
  return <Box x={x} y={y} w={58} d={32} h={26} front="#e8a23a" top="#f6c15c" side="#b87a1e" />
}

function Cone({ x, y }: { x: number; y: number }) {
  return (
    <polygon
      points={`${x + 8},${y} ${x + 16},${y} ${x + 13},${y - 22} ${x + 11},${y - 22}`}
      fill="#f0c14a"
      stroke="#161616"
      strokeWidth="1.1"
    />
  )
}

const DRAW = {
  cushion: Cushion,
  trampett: Trampett,
  board: Board,
  plint: Plint,
  track: Track,
  air: Air,
  landing: Landing,
  hill: Hill,
  flick: Flick,
  cone: Cone,
} as const

export function StationSketch({ slots }: Props) {
  const { pieces, approach } = expand(slots)
  if (pieces.length === 0) return null

  const gap = 10
  const total = pieces.reduce((sum, kind) => sum + WIDTH[kind], 0) + gap * Math.max(0, pieces.length - 1)
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
          cursor += WIDTH[kind] + gap
          const Glyph = DRAW[kind]
          return <Glyph key={`${kind}-${index}`} x={x} y={y} />
        })}
      </svg>
      <figcaption className="station-sketch-caption">
        {UI.stationSketchCaption}
        {approach ? ` ${UI.stationSketchApproach}` : ''}
      </figcaption>
    </figure>
  )
}

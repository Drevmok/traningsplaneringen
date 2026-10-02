const stroke = {
  stroke: '#161616',
  strokeLinejoin: 'round' as const,
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
        strokeWidth="1.3"
        {...stroke}
      />
      <rect
        x={x}
        y={y - h}
        width={w}
        height={h}
        fill={front}
        strokeWidth="1.3"
        {...stroke}
      />
      <polygon
        points={`${x},${y - h} ${x + w},${y - h} ${x + w + dx},${y - h - dy} ${x + dx},${y - h - dy}`}
        fill={top}
        strokeWidth="1.3"
        {...stroke}
      />
    </g>
  )
}

function Springs({ x, y, xs }: { x: number; y: number; xs: number[] }) {
  return (
    <g>
      {xs.map((lx) => (
        <rect
          key={lx}
          x={x + lx}
          y={y}
          width="5"
          height="14"
          rx="1"
          fill="#e6c56a"
          strokeWidth="1.1"
          {...stroke}
        />
      ))}
    </g>
  )
}

export type EquipmentKind =
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
  | 'wedge'
  | 'block'
  | 'beam'
  | 'bar'
  | 'hoop'

export const EQUIPMENT_KIND: Record<string, EquipmentKind> = {
  'eq-trampett': 'trampett',
  'eq-satsbrada': 'board',
  'eq-plint': 'plint',
  'eq-landningsmatta': 'landing',
  'eq-tumblingmatta': 'track',
  'eq-madrass': 'cushion',
  'eq-mattberg': 'hill',
  'eq-flickiskudde': 'flick',
  'eq-airtrack': 'air',
  'eq-kon': 'cone',
  'eq-kilmatta': 'wedge',
  'eq-skumblock': 'block',
  'eq-bom': 'beam',
  'eq-racke': 'bar',
  'eq-rockring': 'hoop',
}

/** Horizontal room each piece needs on a station row. */
export const EQUIPMENT_ROW_WIDTH: Record<EquipmentKind, number> = {
  cushion: 78,
  trampett: 142,
  board: 114,
  plint: 86,
  track: 164,
  air: 168,
  landing: 164,
  hill: 128,
  flick: 96,
  cone: 40,
  wedge: 120,
  block: 64,
  beam: 168,
  bar: 110,
  hoop: 44,
}

export function EquipmentMark({
  kind,
  x,
  y,
}: {
  kind: EquipmentKind
  x: number
  y: number
}) {
  switch (kind) {
    case 'trampett':
      return (
        <g>
          <Springs x={x} y={y - 14} xs={[16, 42, 74, 100]} />
          <Box x={x + 2} y={y - 14} w={116} d={34} h={12} front="#4a42dc" top="#5c54ea" side="#332cae" />
          <polygon
            points={`${x + 16},${y - 28} ${x + 100},${y - 28} ${x + 112},${y - 36} ${x + 28},${y - 36}`}
            fill="#d5d8de"
            strokeWidth="1.3"
            {...stroke}
          />
        </g>
      )
    case 'board':
      return (
        <g>
          <Springs x={x} y={y - 14} xs={[18, 40, 62]} />
          <polygon
            points={`${x},${y - 14} ${x + 78},${y - 14} ${x + 86},${y - 28} ${x + 8},${y - 22}`}
            fill="#514cc0"
            strokeWidth="1.3"
            {...stroke}
          />
          <polygon
            points={`${x + 8},${y - 22} ${x + 86},${y - 28} ${x + 96},${y - 34} ${x + 18},${y - 28}`}
            fill="#f3f0ea"
            strokeWidth="1.2"
            {...stroke}
          />
        </g>
      )
    case 'plint':
      return (
        <g>
          <Box x={x} y={y} w={54} d={32} h={12} front="#2f6f86" top="#3d8ea8" side="#1e4c5e" />
          <Box x={x + 4} y={y - 12} w={46} d={28} h={12} front="#357d96" top="#49a0ba" side="#24586c" />
          <Box x={x + 8} y={y - 24} w={38} d={24} h={12} front="#3d8ea8" top="#5cb4cc" side="#2a6278" />
        </g>
      )
    case 'landing':
      return <Box x={x} y={y} w={132} d={46} h={32} front="#4c44e0" top="#675ef2" side="#332ea8" />
    case 'track':
      return (
        <g>
          <Box x={x} y={y} w={140} d={26} h={8} front="#2a2424" top="#3a3232" side="#161212" />
          <line x1={x + 16} y1={y - 12} x2={x + 124} y2={y - 12} stroke="#161616" strokeWidth="1" />
        </g>
      )
    case 'cushion':
      return <Box x={x} y={y} w={58} d={30} h={20} front="#5348e6" top="#6a60f2" side="#3d34c4" />
    case 'hill':
      return (
        <g>
          <Box x={x} y={y} w={96} d={36} h={14} front="#5a52e4" top="#726bf2" side="#3a32b8" />
          <Box x={x + 16} y={y - 14} w={66} d={28} h={14} front="#675ef0" top="#7d76f6" side="#453cc4" />
          <Box x={x + 32} y={y - 28} w={36} d={22} h={12} front="#746cf4" top="#8d86f8" side="#5148cc" />
        </g>
      )
    case 'flick':
      return (
        <g>
          <polygon points={`${x},${y} ${x + 70},${y} ${x + 78},${y - 8} ${x + 8},${y - 8}`} fill="#b87a1e" strokeWidth="1.3" {...stroke} />
          <polygon points={`${x},${y} ${x},${y - 8} ${x + 70},${y - 28} ${x + 70},${y}`} fill="#e8a23a" strokeWidth="1.3" {...stroke} />
          <polygon points={`${x},${y - 8} ${x + 8},${y - 14} ${x + 78},${y - 14} ${x + 70},${y - 28}`} fill="#f6c15c" strokeWidth="1.3" {...stroke} />
        </g>
      )
    case 'air':
      return <Box x={x} y={y} w={142} d={30} h={16} front="#f0e35a" top="#fff27a" side="#c9b63a" />
    case 'cone':
      return (
        <g>
          <ellipse cx={x + 16} cy={y - 2} rx="12" ry="4" fill="#e6b43a" strokeWidth="1.1" {...stroke} />
          <polygon points={`${x + 6},${y - 4} ${x + 26},${y - 4} ${x + 16},${y - 36}`} fill="#f0c14a" strokeWidth="1.2" {...stroke} />
        </g>
      )
    case 'wedge': {
      // Triangular prism, high end left (Kilmatta).
      const w = 96
      const h = 34
      const dx = 14
      const dy = 9
      return (
        <g>
          <polygon
            points={`${x},${y - h} ${x + dx},${y - h - dy} ${x + dx},${y - dy} ${x},${y}`}
            fill="#3d34c4"
            strokeWidth="1.3"
            {...stroke}
          />
          <polygon
            points={`${x},${y - h} ${x + w},${y} ${x + w + dx},${y - dy} ${x + dx},${y - h - dy}`}
            fill="#6a60f2"
            strokeWidth="1.3"
            {...stroke}
          />
          <polygon points={`${x},${y} ${x + w},${y} ${x},${y - h}`} fill="#5348e6" strokeWidth="1.3" {...stroke} />
        </g>
      )
    }
    case 'block':
      return <Box x={x + 4} y={y} w={44} d={26} h={18} front="#e2674f" top="#ee8a74" side="#b84a36" />
    case 'beam':
      return (
        <g>
          <rect x={x + 14} y={y - 10} width="6" height="10" fill="#a5845a" strokeWidth="1.1" {...stroke} />
          <rect x={x + 130} y={y - 10} width="6" height="10" fill="#a5845a" strokeWidth="1.1" {...stroke} />
          <Box x={x} y={y - 10} w={150} d={14} h={8} front="#c9a77a" top="#dcc29c" side="#a5845a" />
        </g>
      )
    case 'bar':
      return (
        <g>
          <rect x={x + 4} y={y - 4} width="18" height="4" rx="1" fill="#6b7079" strokeWidth="1.1" {...stroke} />
          <rect x={x + 82} y={y - 4} width="18" height="4" rx="1" fill="#6b7079" strokeWidth="1.1" {...stroke} />
          <rect x={x + 10} y={y - 50} width="6" height="46" fill="#8a8f99" strokeWidth="1.2" {...stroke} />
          <rect x={x + 88} y={y - 50} width="6" height="46" fill="#8a8f99" strokeWidth="1.2" {...stroke} />
          <line x1={x + 8} y1={y - 48} x2={x + 96} y2={y - 48} stroke="#161616" strokeWidth="6" strokeLinecap="round" />
          <line x1={x + 8} y1={y - 48} x2={x + 96} y2={y - 48} stroke="#d5d8de" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      )
    case 'hoop':
      return (
        <ellipse cx={x + 20} cy={y - 6} rx="18" ry="6" fill="none" stroke="#d9534f" strokeWidth="4" />
      )
  }
}

const ICON_FRAME: Record<EquipmentKind, { vb: string; x: number; y: number }> = {
  trampett: { vb: '0 78 150 96', x: 12, y: 156 },
  board: { vb: '0 78 120 96', x: 12, y: 156 },
  plint: { vb: '0 78 100 96', x: 16, y: 162 },
  landing: { vb: '0 78 168 96', x: 8, y: 162 },
  track: { vb: '0 86 164 88', x: 8, y: 158 },
  cushion: { vb: '0 90 100 84', x: 16, y: 158 },
  hill: { vb: '0 78 140 96', x: 12, y: 162 },
  flick: { vb: '0 90 108 84', x: 14, y: 160 },
  air: { vb: '0 86 168 88', x: 8, y: 158 },
  cone: { vb: '0 90 56 84', x: 12, y: 162 },
  wedge: { vb: '0 90 128 84', x: 10, y: 160 },
  block: { vb: '0 96 76 78', x: 10, y: 160 },
  beam: { vb: '0 86 168 88', x: 6, y: 158 },
  bar: { vb: '0 90 110 84', x: 4, y: 162 },
  hoop: { vb: '0 112 56 62', x: 8, y: 160 },
}

export function EquipmentIcon({ pieceId }: { pieceId: string }) {
  const kind = EQUIPMENT_KIND[pieceId]
  if (!kind) return null
  const frame = ICON_FRAME[kind]
  return (
    <svg className="equipment-icon" viewBox={frame.vb} aria-hidden focusable="false">
      <rect width="200" height="200" fill="#e7e5e1" />
      <rect x="0" y="148" width="200" height="18" fill="#d7d4ce" />
      <EquipmentMark kind={kind} x={frame.x} y={frame.y} />
    </svg>
  )
}

import type { CSSProperties, ReactNode } from 'react'
import type { IconId } from './types'

interface IconProps {
  id: IconId
  size?: number
  className?: string
  style?: CSSProperties
}

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({
  children,
  size = 24,
  className,
  style,
}: {
  children: ReactNode
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  )
}

function glyph(id: IconId): ReactNode {
  switch (id) {
    case 'users-wave':
      return (
        <>
          <circle cx="8" cy="7" r="2.2" {...stroke} />
          <path d="M4.5 18c.4-3.2 2-5 3.5-5s3.1 1.8 3.5 5" {...stroke} />
          <circle cx="15.5" cy="7.5" r="2" {...stroke} />
          <path d="M13 18c.3-2.4 1.4-3.8 2.5-3.8 1.2 0 2.2 1.2 2.6 3" {...stroke} />
          <path d="M18.5 5.5c1.2.4 2 1.4 2 2.7" {...stroke} />
        </>
      )
    case 'clipboard':
      return (
        <>
          <rect x="6" y="4" width="12" height="16" rx="2" {...stroke} />
          <path d="M9 4.5h6v2.5H9z" {...stroke} />
          <path d="M9 11h6M9 14.5h4" {...stroke} />
        </>
      )
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <circle cx="12" cy="12" r="4.5" {...stroke} />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </>
      )
    case 'flame':
      return (
        <path
          d="M12 20c3.2 0 5.5-2.2 5.5-5.2 0-2.4-1.4-4-2.8-5.4.2 1.6-.4 2.6-1.4 3.2 0-3.6-1.6-6.2-3.8-8.1C9.2 7 8 9.4 8 11.6c0 .9.2 1.7.5 2.4C7.6 13 7 12 6.6 10.6 6.2 13.2 7.6 20 12 20z"
          {...stroke}
        />
      )
    case 'run':
      return (
        <>
          <circle cx="14.5" cy="5.5" r="1.8" {...stroke} />
          <path d="M8 20l2.2-5.2 3.3 1.6L16 20" {...stroke} />
          <path d="M10.2 14.8 8.5 11l3.2-1.5 2.8 2.2" {...stroke} />
          <path d="M11.7 9.5 14 7.2 17.5 9" {...stroke} />
        </>
      )
    case 'music':
      return (
        <>
          <path d="M9 18V7l10-2v11" {...stroke} />
          <circle cx="7" cy="18" r="2.2" {...stroke} />
          <circle cx="17" cy="16" r="2.2" {...stroke} />
        </>
      )
    case 'numbers-123':
      return (
        <>
          <path d="M5.5 8.5V16M5.5 8.5c.8-.8 1.6-1.2 2.2-1.2" {...stroke} />
          <path d="M10.5 9.2c0-1.4 1-2.2 2.3-2.2s2.2.9 2.2 2c0 1.4-1.3 2-2.3 2.7-1 .7-2.2 1.3-2.2 2.8h4.5" {...stroke} />
          <path d="M17.2 7.5h2.6c.9 0 1.5.6 1.5 1.4 0 .7-.4 1.2-1.1 1.4l1.4 3.2h-2.2l-1-2.6h-.2" {...stroke} />
        </>
      )
    case 'stretch':
      return (
        <>
          <circle cx="8" cy="5.5" r="1.8" {...stroke} />
          <path d="M8 7.5v5.5l3.5 3.5M8 13l-3.5 4" {...stroke} />
          <path d="M11.5 10.5c2.5-2 5-2.5 7.5-1.5" {...stroke} />
        </>
      )
    case 'jump-board':
      return (
        <>
          <path d="M4 17.5h16" {...stroke} />
          <path d="M5 17.5l5-8h9l-3 8" {...stroke} />
          <path d="M12 5.5c1.5 1.2 2.8 2.8 3.5 4.5" {...stroke} />
        </>
      )
    case 'bounce':
      return (
        <>
          <ellipse cx="12" cy="18" rx="7" ry="2.2" {...stroke} />
          <path d="M12 16V7" {...stroke} />
          <path d="M8.5 10.5c1.2-2 2.3-3.2 3.5-3.5 1.2.3 2.3 1.5 3.5 3.5" {...stroke} />
          <path d="M9.5 7.5c.8-1.4 1.6-2.2 2.5-2.5.9.3 1.7 1.1 2.5 2.5" {...stroke} />
        </>
      )
    case 'rotate':
      return (
        <>
          <path d="M18 12a6 6 0 1 1-1.8-4.3" {...stroke} />
          <path d="M18 5.5V10h-4.5" {...stroke} />
        </>
      )
    case 'mats-stack':
      return (
        <>
          <rect x="5" y="14.5" width="14" height="3.5" rx="1" {...stroke} />
          <rect x="6.5" y="10.5" width="11" height="3.5" rx="1" {...stroke} />
          <rect x="8" y="6.5" width="8" height="3.5" rx="1" {...stroke} />
        </>
      )
    case 'flip':
      return (
        <>
          <path d="M5 17.5c2-4 4.5-7 7-8.5 2.5-1.5 5-1.8 7-1" {...stroke} />
          <path d="M16 5.5c1.5.8 2.5 2 3 3.5" {...stroke} />
          <circle cx="7.5" cy="16.5" r="1.4" {...stroke} />
          <path d="M10 14.5l2.5-1.5" {...stroke} />
        </>
      )
    case 'pad':
      return (
        <>
          <rect x="4.5" y="8" width="15" height="9" rx="4" {...stroke} />
          <path d="M8 11.5h8M8 14h5" {...stroke} />
        </>
      )
    case 'fall-back':
      return (
        <>
          <path d="M6 8h12" {...stroke} />
          <path d="M12 8v8.5" {...stroke} />
          <path d="M8.5 13.5 12 17l3.5-3.5" {...stroke} />
          <path d="M5 19.5h14" {...stroke} />
        </>
      )
    case 'salto-height':
      return (
        <>
          <path d="M4 18.5h7V12H4z" {...stroke} />
          <path d="M14 10.5c2.2-1.8 4.5-1.5 5.5.5 1 2-.4 4.2-2.8 4.5-1.6.2-3-.6-3.7-1.8" {...stroke} />
          <path d="M13.5 8.5l1.2 2.5" {...stroke} />
        </>
      )
    case 'handstand':
      return (
        <>
          <path d="M7 20.5h10" {...stroke} />
          <path d="M9.5 20.5V14l2.5-6 2.5 6v6.5" {...stroke} />
          <circle cx="12" cy="5.5" r="1.8" {...stroke} />
        </>
      )
    case 'circuit':
      return (
        <>
          <circle cx="12" cy="5.5" r="2" {...stroke} />
          <circle cx="6.5" cy="16.5" r="2" {...stroke} />
          <circle cx="17.5" cy="16.5" r="2" {...stroke} />
          <path d="M12 7.5 7.8 14.5M12 7.5l4.2 7M8.5 16.5h7" {...stroke} />
        </>
      )
    case 'burst':
      return (
        <>
          <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" {...stroke} />
          <path d="M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8" {...stroke} />
          <circle cx="12" cy="12" r="2.2" {...stroke} />
        </>
      )
    case 'ball':
      return (
        <>
          <circle cx="12" cy="12" r="7.5" {...stroke} />
          <path d="M12 4.5c2.2 2 3.5 4.5 3.5 7.5S14.2 17.5 12 19.5c-2.2-2-3.5-4.5-3.5-7.5S9.8 6.5 12 4.5z" {...stroke} />
          <path d="M5 10.5h14M5 13.5h14" {...stroke} />
        </>
      )
    case 'arrow-up':
      return (
        <>
          <path d="M12 19.5V5.5" {...stroke} />
          <path d="M7 10.5 12 5.5l5 5" {...stroke} />
        </>
      )
    case 'flag':
      return (
        <>
          <path d="M6 4.5v15" {...stroke} />
          <path d="M6 5.5h11l-2.5 3.5L17 12.5H6" {...stroke} />
        </>
      )
    case 'shuffle':
      return (
        <>
          <path d="M5 8h3.5l3 4-3 4H5" {...stroke} />
          <path d="M19 8h-3.5l-1.5 2" {...stroke} />
          <path d="M19 16h-3.5l-1.5-2" {...stroke} />
          <path d="M16 6.5 19 8l-3 1.5M16 14.5 19 16l-3 1.5" {...stroke} />
          <path d="M11.5 12H14" {...stroke} />
        </>
      )
    case 'mask':
      return (
        <>
          <path d="M4.5 11c1.5-3.5 4-5 7.5-5s6 1.5 7.5 5c0 3-2.2 5.5-4.5 5.5-1.2 0-2.2-.6-3-1.5-.8.9-1.8 1.5-3 1.5-2.3 0-4.5-2.5-4.5-5.5z" {...stroke} />
          <circle cx="9" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
        </>
      )
    case 'hands-up':
      return (
        <>
          <circle cx="12" cy="14" r="2.2" {...stroke} />
          <path d="M12 16.2v3.3M9.5 19.5h5" {...stroke} />
          <path d="M8.5 13.5c-1.5-2-2.5-4-2.8-6.2M15.5 13.5c1.5-2 2.5-4 2.8-6.2" {...stroke} />
          <path d="M5.5 5.5c.3 1 .8 1.8 1.5 2.5M18.5 5.5c-.3 1-.8 1.8-1.5 2.5" {...stroke} />
        </>
      )
    case 'invert-head':
      return (
        <>
          <path d="M7 20.5h10" {...stroke} />
          <path d="M9 20.5v-4.5h6v4.5" {...stroke} />
          <circle cx="12" cy="10" r="3.2" {...stroke} />
          <path d="M12 6.8V4.5" {...stroke} />
        </>
      )
    case 'moon':
      return (
        <path
          d="M15.5 3.5A8.5 8.5 0 1 0 20.5 14 6.5 6.5 0 0 1 15.5 3.5z"
          {...stroke}
        />
      )
    case 'spark':
      return (
        <>
          <path d="M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6" {...stroke} />
          <path d="M7 7l3 3M14 14l3 3M17 7l-3 3M10 14l-3 3" {...stroke} />
        </>
      )
    case 'dumbbell':
      return (
        <>
          <path d="M7.5 12h9" {...stroke} />
          <rect x="3.5" y="8.5" width="3.5" height="7" rx="1" {...stroke} />
          <rect x="17" y="8.5" width="3.5" height="7" rx="1" {...stroke} />
          <path d="M7 10v4M17 10v4" {...stroke} />
        </>
      )
    case 'smile':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
          <path d="M8.5 14c1 1.8 2.5 2.6 3.5 2.6s2.5-.8 3.5-2.6" {...stroke} />
        </>
      )
    case 'fallback':
    default:
      return (
        <>
          <rect x="5" y="5" width="14" height="14" rx="3" {...stroke} />
          <path d="M9 12h6M12 9v6" {...stroke} />
        </>
      )
  }
}

export function Icon({ id, size = 24, className, style }: IconProps) {
  return (
    <Svg size={size} className={className} style={style}>
      {glyph(id)}
    </Svg>
  )
}

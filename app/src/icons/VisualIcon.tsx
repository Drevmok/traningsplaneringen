import type { CSSProperties } from 'react'
import { BLOCK_COLORS } from '../data/blockMeta'
import type { BlockType } from '../types'
import { Icon } from './Icon'
import type { IconId, VisualIconSize } from './types'
import { VISUAL_ICON_SIZES } from './types'
import { resolveIconId } from './map'

const FALLBACK_COLORS = {
  bg: '#f1f5f9',
  border: '#cbd5e1',
  text: '#64748b',
}

interface VisualIconProps {
  visualKey?: string
  iconId?: IconId
  blockType?: BlockType
  size?: VisualIconSize
  className?: string
}

export function VisualIcon({
  visualKey,
  iconId: iconIdProp,
  blockType,
  size = 'card',
  className,
}: VisualIconProps) {
  const iconId = iconIdProp ?? resolveIconId(visualKey)
  const dims = VISUAL_ICON_SIZES[size]
  const colors =
    blockType != null ? BLOCK_COLORS[blockType] : FALLBACK_COLORS

  const style = {
    width: dims.tile,
    height: dims.tile,
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    ['--icon-draw' as string]: `${dims.draw}px`,
  } as CSSProperties

  return (
    <span
      className={`visual-icon-tile${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden
    >
      <Icon id={iconId} size={dims.draw} />
    </span>
  )
}

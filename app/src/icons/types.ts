export type IconId =
  | 'users-wave'
  | 'clipboard'
  | 'target'
  | 'flame'
  | 'run'
  | 'music'
  | 'numbers-123'
  | 'stretch'
  | 'jump-board'
  | 'bounce'
  | 'rotate'
  | 'mats-stack'
  | 'flip'
  | 'pad'
  | 'fall-back'
  | 'salto-height'
  | 'handstand'
  | 'circuit'
  | 'burst'
  | 'ball'
  | 'arrow-up'
  | 'flag'
  | 'shuffle'
  | 'mask'
  | 'hands-up'
  | 'invert-head'
  | 'moon'
  | 'spark'
  | 'dumbbell'
  | 'smile'
  | 'fallback'

export type VisualIconSize = 'block' | 'item' | 'card' | 'marker' | 'detail'

export const VISUAL_ICON_SIZES: Record<
  VisualIconSize,
  { tile: number; draw: number }
> = {
  block: { tile: 36, draw: 20 },
  item: { tile: 40, draw: 22 },
  card: { tile: 44, draw: 24 },
  /** Slice 12 — hall floor station marker (icon-led) */
  marker: { tile: 48, draw: 28 },
  detail: { tile: 64, draw: 36 },
}

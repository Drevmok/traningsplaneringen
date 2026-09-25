import type { BlockType } from '../types'
import type { IconId } from './types'

/** visualKey → iconId for all 28 seed activities (Slice 03 keys). */
export const VISUAL_ICON: Record<string, IconId> = {
  'gather-checkin': 'users-wave',
  'gather-attendance': 'clipboard',
  'gather-today-tech': 'target',
  'warm-hall-lap': 'run',
  'warm-dance': 'music',
  'warm-123-volt': 'numbers-123',
  'warm-stretch-athletes': 'stretch',
  'warm-stretch-coach': 'stretch',
  'tech-ljushopp-board': 'jump-board',
  'tech-ljushopp-trampett': 'bounce',
  'tech-board-volt-back': 'rotate',
  'tech-trampett-mattberg': 'mats-stack',
  'tech-rondat-flickis': 'flip',
  'tech-flickis-pad': 'pad',
  'tech-fall-back': 'fall-back',
  'tech-salto-height': 'salto-height',
  'tech-hs-fall-back': 'handstand',
  'str-circuit': 'circuit',
  'str-burpee': 'burst',
  'str-songs': 'music',
  'fun-medball': 'ball',
  'fun-highjump': 'arrow-up',
  'fun-relay': 'flag',
  'fun-123-move': 'shuffle',
  'fun-mafia': 'mask',
  'fun-hs-challenge': 'hands-up',
  'fun-headstand': 'invert-head',
  'fun-dark-hide': 'moon',
}

export const BLOCK_ICON_IDS: Record<BlockType, IconId> = {
  gathering: 'users-wave',
  warmup: 'flame',
  techniques: 'spark',
  strength: 'dumbbell',
  fun_and_games: 'smile',
}

export function resolveIconId(visualKey: string | undefined): IconId {
  if (!visualKey) return 'fallback'
  return VISUAL_ICON[visualKey] ?? 'fallback'
}

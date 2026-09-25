export type BlockType =
  | 'gathering'
  | 'warmup'
  | 'techniques'
  | 'strength'
  | 'fun_and_games'

export type Difficulty = 'intro' | 'easy' | 'medium' | 'hard'

export type TargetLevel = 'new_coach_safe' | 'beginner' | 'intermediate'

/** Slice 13 — one slot in a station equipment recipe */
export interface StationEquipmentSlot {
  pieceId: string
  count: number
}

/** Slice 13 — fixed catalog piece (Swedish redskap library) */
export interface EquipmentPiece {
  id: string
  labelSv: string
  visualKey: string
}

export interface Activity {
  id: string
  title: string
  blockType: BlockType
  durationMinutesDefault: number
  summary: string
  howTo: string
  watchFor: string
  watchForRequired: boolean
  visualKey: string
  difficulty: Difficulty
  tags: string[]
  /** Legacy free-text — do NOT surface as Redskap compose model */
  equipment?: string[]
  /**
   * Slice 13 — suggested redskap for vault/trampett/mattberg-style Teknik only.
   * Shown as förslag when SessionItem.stationEquipment is unset (undefined).
   */
  defaultStationEquipment?: StationEquipmentSlot[]
  progressionOf?: string
  regressionOf?: string
  stub?: boolean
  experiencedCoachOnly?: boolean
  newCoachOk?: boolean
  needsCoachReview?: boolean
}

export interface SessionItem {
  id: string
  activityId: string
  durationMinutes: number
  note: string
  order: number
  /**
   * Slice 13 — composed redskap for this Teknik station instance.
   * undefined = unset (UI may show activity defaultStationEquipment as förslag)
   * [] = coach explicitly cleared
   * non-empty = saved recipe
   */
  stationEquipment?: StationEquipmentSlot[]
}

export interface SessionBlock {
  id: string
  type: BlockType
  title: string
  durationMinutes: number
  items: SessionItem[]
  coachNote: string
}

export interface Session {
  id: string
  title: string
  date?: string
  totalMinutes: number
  notes: string
  basedOnTemplateId?: string
  blocks: SessionBlock[]
  /** Slice 05+ */
  hallTemplateId?: HallTemplateId
  hallPlacements?: HallPlacement[]
  /** Slice 07 — show flow connectors between placed stations. Default true when absent. */
  hallShowFlow?: boolean
}

export interface SessionTemplate {
  id: string
  title: string
  description: string
  targetLevel: TargetLevel
  totalMinutes: number
  blocks: SessionBlock[]
}

export type SideTab = 'library' | 'tips' | 'templates'

export interface MismatchWarning {
  blockId: string
  intendedBlockType: BlockType
  activityTitle: string
}

export type HallZoneId =
  | 'open'
  | 'trampett'
  | 'tumbling'
  | 'vault'
  | 'mattberg'
  | 'mats'

export type HallTemplateId =
  | 'standard-trupp'
  | 'tavling-linjer'
  | 'liten-hall'

/** Legacy Slice 05 id — migrate on load only; do not write anew */
export type LegacyHallTemplateId = 'generic-trupp'

export interface HallPlacement {
  /** SessionItem.id — instance on this pass */
  sessionItemId: string
  /** Normalized 0–1, chip center relative to canvas width */
  x: number
  /** Normalized 0–1, chip center relative to canvas height */
  y: number
  /** Soft tag when center was inside a zone bbox at last drop; optional */
  zoneId?: HallZoneId
}

import type { HallTemplateId, HallZoneId } from '../types'

export interface HallZoneDef {
  id: HallZoneId
  label: string
  bbox: { x: number; y: number; w: number; h: number }
  /** Chip-center snap target; unused for open (free place) */
  snap?: { x: number; y: number }
  /** If true, drops inside bbox snap to snap point (default: id !== 'open') */
  snaps: boolean
}

export interface HallPlanShape {
  kind: 'floor' | 'mat' | 'block' | 'track' | 'rail' | 'wall' | 'line' | 'bars' | 'poly'
  x: number
  y: number
  w: number
  h: number
  /** SVG path in a 0–100 viewBox. Used by poly. */
  d?: string
}

export interface HallPreset {
  id: HallTemplateId
  label: string
  aspect?: '16:10' | '3:2'
  zones: HallZoneDef[]
  /** Hit-test priority: first match wins (apparatus before open) */
  zonePriority: HallZoneId[]
  /** Club floor plan. When set, the canvas draws these shapes instead of zone boxes. */
  plan?: HallPlanShape[]
}

/** Shared hit priority for all presets (apparatus before open). */
export const ZONE_PRIORITY: HallZoneId[] = [
  'trampett',
  'tumbling',
  'vault',
  'mattberg',
  'mats',
  'open',
]

export const HALL_PRESET_ORDER: HallTemplateId[] = [
  'forening-bla',
  'forening-vit',
]

/** Slice 45: the club's two halls only (ids unchanged; generic schemes removed). */
export const HALL_PRESETS: Record<HallTemplateId, HallPreset> = {
  'forening-bla': {
    id: 'forening-bla',
    label: 'Gymmix – Stora hallen',
    zonePriority: ZONE_PRIORITY,
    plan: [
      { kind: 'floor', x: 0.05, y: 0.05, w: 0.822, h: 0.92 },
      { kind: 'mat', x: 0.054, y: 0.521, w: 0.182, h: 0.449 },
      { kind: 'mat', x: 0.63, y: 0.517, w: 0.335, h: 0.453 },
      { kind: 'mat', x: 0.172, y: 0.223, w: 0.486, h: 0.036 },
      { kind: 'mat', x: 0.154, y: 0.407, w: 0.487, h: 0.036 },
      { kind: 'rail', x: 0.152, y: 0.099, w: 0.333, h: 0.014 },
      { kind: 'rail', x: 0.152, y: 0.158, w: 0.333, h: 0.014 },
      { kind: 'track', x: 0.152, y: 0.113, w: 0.333, h: 0.045 },
      { kind: 'block', x: 0.051, y: 0.068, w: 0.098, h: 0.135 },
      { kind: 'block', x: 0.052, y: 0.358, w: 0.098, h: 0.135 },
      { kind: 'block', x: 0.661, y: 0.17, w: 0.099, h: 0.135 },
      { kind: 'block', x: 0.488, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.541, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.595, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.649, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.702, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.756, y: 0.111, w: 0.051, h: 0.043 },
      { kind: 'block', x: 0.871, y: 0.051, w: 0.102, h: 0.231 },
      { kind: 'mat', x: 0.88, y: 0.062, w: 0.085, h: 0.207 },
      { kind: 'wall', x: 0.872, y: 0.283, w: 0.102, h: 0.23 },
      { kind: 'track', x: 0.66, y: 0.383, w: 0.088, h: 0.077 },
    ],
    zones: [
      {
        id: 'open',
        label: 'Öppen yta',
        bbox: { x: 0.06, y: 0.08, w: 0.78, h: 0.84 },
        snaps: false,
      },
    ],
  },
  'forening-vit': {
    id: 'forening-vit',
    label: 'Gymmix – Grophallen',
    zonePriority: ZONE_PRIORITY,
    plan: [
      { kind: 'mat', x: 0.026, y: 0.048, w: 0.949, h: 0.731 },
      { kind: 'mat', x: 0.026, y: 0.779, w: 0.949, h: 0.204 },
      { kind: 'line', x: 0.026, y: 0.777, w: 0.949, h: 0.004 },
      {
        kind: 'poly',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        d: 'M 75.5 8.5 H 92.6 V 66.9 H 56.4 V 48.1 H 80.4 V 21.1 H 75.5 Z',
      },
      { kind: 'rail', x: 0.466, y: 0.118, w: 0.288, h: 0.055 },
      { kind: 'block', x: 0.487, y: 0.287, w: 0.12, h: 0.083 },
      { kind: 'block', x: 0.607, y: 0.283, w: 0.15, h: 0.087 },
      { kind: 'rail', x: 0.501, y: 0.301, w: 0.091, h: 0.054 },
      { kind: 'bars', x: 0.601, y: 0.016, w: 0.093, h: 0.03 },
      { kind: 'bars', x: 0.748, y: 0.016, w: 0.095, h: 0.03 },
    ],
    zones: [
      {
        id: 'open',
        label: 'Öppen yta',
        bbox: { x: 0.05, y: 0.08, w: 0.49, h: 0.66 },
        snaps: false,
      },
    ],
  },
}

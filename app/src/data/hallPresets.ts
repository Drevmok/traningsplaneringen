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

export interface HallPreset {
  id: HallTemplateId
  label: string
  aspect?: '16:10' | '3:2'
  zones: HallZoneDef[]
  /** Hit-test priority: first match wins (apparatus before open) */
  zonePriority: HallZoneId[]
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
  'standard-trupp',
  'tavling-linjer',
  'liten-hall',
]

/** Canonical layouts from slice-06/hall-presets.md */
export const HALL_PRESETS: Record<HallTemplateId, HallPreset> = {
  'standard-trupp': {
    id: 'standard-trupp',
    label: 'Standard trupp',
    aspect: '16:10',
    zonePriority: ZONE_PRIORITY,
    zones: [
      {
        id: 'open',
        label: 'Öppen yta',
        bbox: { x: 0.06, y: 0.1, w: 0.52, h: 0.78 },
        snaps: false,
      },
      {
        id: 'trampett',
        label: 'Trampett',
        bbox: { x: 0.62, y: 0.1, w: 0.3, h: 0.16 },
        snap: { x: 0.77, y: 0.18 },
        snaps: true,
      },
      {
        id: 'tumbling',
        label: 'Tumbling',
        bbox: { x: 0.62, y: 0.3, w: 0.3, h: 0.2 },
        snap: { x: 0.77, y: 0.4 },
        snaps: true,
      },
      {
        id: 'vault',
        label: 'Satsbräda',
        bbox: { x: 0.62, y: 0.54, w: 0.3, h: 0.14 },
        snap: { x: 0.77, y: 0.61 },
        snaps: true,
      },
      {
        id: 'mattberg',
        label: 'Mattberg',
        bbox: { x: 0.62, y: 0.72, w: 0.16, h: 0.16 },
        snap: { x: 0.7, y: 0.8 },
        snaps: true,
      },
      {
        id: 'mats',
        label: 'Mattor',
        bbox: { x: 0.8, y: 0.72, w: 0.12, h: 0.16 },
        snap: { x: 0.86, y: 0.8 },
        snaps: true,
      },
    ],
  },
  'tavling-linjer': {
    id: 'tavling-linjer',
    label: 'Tävling / linjer',
    aspect: '16:10',
    zonePriority: ZONE_PRIORITY,
    zones: [
      {
        id: 'open',
        label: 'Öppen yta',
        bbox: { x: 0.05, y: 0.12, w: 0.38, h: 0.74 },
        snaps: false,
      },
      {
        id: 'trampett',
        label: 'Trampett',
        bbox: { x: 0.46, y: 0.1, w: 0.48, h: 0.14 },
        snap: { x: 0.7, y: 0.17 },
        snaps: true,
      },
      {
        id: 'tumbling',
        label: 'Tumbling',
        bbox: { x: 0.46, y: 0.28, w: 0.48, h: 0.16 },
        snap: { x: 0.7, y: 0.36 },
        snaps: true,
      },
      {
        id: 'vault',
        label: 'Satsbräda',
        bbox: { x: 0.46, y: 0.48, w: 0.48, h: 0.14 },
        snap: { x: 0.7, y: 0.55 },
        snaps: true,
      },
      {
        id: 'mattberg',
        label: 'Mattberg',
        bbox: { x: 0.46, y: 0.66, w: 0.28, h: 0.2 },
        snap: { x: 0.6, y: 0.76 },
        snaps: true,
      },
      {
        id: 'mats',
        label: 'Mattor',
        bbox: { x: 0.76, y: 0.66, w: 0.18, h: 0.2 },
        snap: { x: 0.85, y: 0.76 },
        snaps: true,
      },
    ],
  },
  'liten-hall': {
    id: 'liten-hall',
    label: 'Liten hall',
    aspect: '16:10',
    zonePriority: ZONE_PRIORITY,
    zones: [
      {
        id: 'open',
        label: 'Öppen yta',
        bbox: { x: 0.06, y: 0.1, w: 0.62, h: 0.78 },
        snaps: false,
      },
      {
        id: 'trampett',
        label: 'Trampett',
        bbox: { x: 0.72, y: 0.12, w: 0.22, h: 0.14 },
        snap: { x: 0.83, y: 0.19 },
        snaps: true,
      },
      {
        id: 'tumbling',
        label: 'Tumbling',
        bbox: { x: 0.72, y: 0.3, w: 0.22, h: 0.16 },
        snap: { x: 0.83, y: 0.38 },
        snaps: true,
      },
      {
        id: 'vault',
        label: 'Satsbräda',
        bbox: { x: 0.72, y: 0.5, w: 0.22, h: 0.12 },
        snap: { x: 0.83, y: 0.56 },
        snaps: true,
      },
      {
        id: 'mattberg',
        label: 'Mattberg',
        bbox: { x: 0.72, y: 0.66, w: 0.12, h: 0.2 },
        snap: { x: 0.78, y: 0.76 },
        snaps: true,
      },
      {
        id: 'mats',
        label: 'Mattor',
        bbox: { x: 0.86, y: 0.66, w: 0.08, h: 0.2 },
        snap: { x: 0.9, y: 0.76 },
        snaps: true,
      },
    ],
  },
}

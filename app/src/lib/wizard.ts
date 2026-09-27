/**
 * Slice 29 — pure compose for Home 3-question wizard.
 * Does NOT touch createBlankSession Soft inject or cloneTemplate.
 */

import {
  teknikActivityIdsFor,
  wizardSessionTitle,
  WIZARD_SHARED_SKELETON,
  WIZARD_TEKNIK_DURATION,
  type WizardAge,
  type WizardFocus,
} from '../data/wizardPaths'
import { getActivityById } from '../data/seedActivities'
import type { HallZoneId, Session } from '../types'
import {
  getPreset,
  normalizeTemplateId,
  upsertPlacement,
} from './hall'
import {
  createEmptyBlocks,
  createSessionItem,
  withComputedTotal,
} from './session'

export interface WizardAnswers {
  age: WizardAge
  focus: WizardFocus
  hallTemplateId: string
}

/**
 * D1 Docs tag → zone map:
 * vault tag → vault; trampett → trampett;
 * floor + flickis|rondat → tumbling; floor otherwise → open; fallback → open.
 */
export function mapActivityToZone(activityId: string): HallZoneId {
  const activity = getActivityById(activityId)
  if (!activity) return 'open'
  const tags = activity.tags ?? []
  if (tags.includes('vault')) return 'vault'
  if (tags.includes('trampett')) return 'trampett'
  if (tags.includes('floor')) {
    const hay = `${activityId} ${activity.title}`.toLowerCase()
    if (/flickis|rondat/.test(hay)) return 'tumbling'
    return 'open'
  }
  return 'open'
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function bboxCenter(bbox: { x: number; y: number; w: number; h: number }): {
  x: number
  y: number
} {
  return { x: bbox.x + bbox.w / 2, y: bbox.y + bbox.h / 2 }
}

/**
 * Compose a complete five-block session from wizard answers and
 * pre-place Teknik into matching hall zones.
 */
export function composeWizardSession(answers: WizardAnswers): Session {
  const { age, focus } = answers
  const hallTemplateId = normalizeTemplateId(answers.hallTemplateId)
  const blocks = createEmptyBlocks()

  const gathering = blocks.find((b) => b.type === 'gathering')
  if (gathering) {
    gathering.items = WIZARD_SHARED_SKELETON.gathering.map((it, order) =>
      createSessionItem(it.activityId, it.durationMinutes, order),
    )
  }

  const warmup = blocks.find((b) => b.type === 'warmup')
  if (warmup) {
    warmup.items = WIZARD_SHARED_SKELETON.warmup.map((it, order) =>
      createSessionItem(it.activityId, it.durationMinutes, order),
    )
  }

  const techniques = blocks.find((b) => b.type === 'techniques')
  const teknikIds = teknikActivityIdsFor(age, focus)
  if (techniques) {
    techniques.items = teknikIds.map((activityId, order) =>
      createSessionItem(activityId, WIZARD_TEKNIK_DURATION, order),
    )
  }

  const strength = blocks.find((b) => b.type === 'strength')
  if (strength) {
    strength.items = WIZARD_SHARED_SKELETON.strength.map((it, order) =>
      createSessionItem(it.activityId, it.durationMinutes, order),
    )
  }

  const fun = blocks.find((b) => b.type === 'fun_and_games')
  if (fun) {
    fun.items = WIZARD_SHARED_SKELETON.fun.map((it, order) =>
      createSessionItem(it.activityId, it.durationMinutes, order),
    )
  }

  let session: Session = withComputedTotal({
    id: uid('session'),
    title: wizardSessionTitle(focus),
    totalMinutes: 0,
    notes: '',
    blocks,
    hallTemplateId,
    hallPlacements: [],
  })

  const preset = getPreset(hallTemplateId)
  const teknikItems = techniques?.items ?? []
  for (const item of teknikItems) {
    const zoneId = mapActivityToZone(item.activityId)
    const zone = preset.zones.find((z) => z.id === zoneId)
    const center = zone ? bboxCenter(zone.bbox) : { x: 0.5, y: 0.5 }
    const x = zone?.snap?.x ?? center.x
    const y = zone?.snap?.y ?? center.y
    session = upsertPlacement(session, {
      sessionItemId: item.id,
      x,
      y,
      zoneId,
    })
  }

  return withComputedTotal(session)
}

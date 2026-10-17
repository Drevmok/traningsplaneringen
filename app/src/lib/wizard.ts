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
  type WizardLevel,
} from '../data/wizardPaths'
import { getActivityById } from '../data/seedActivities'
import type { PassLength } from '../data/blockMeta'
import type { HallZoneId, Session } from '../types'
import { normalizeTemplateId } from './hall'
import { autoPlaceUnplaced } from './hallSuggest'
import {
  createEmptyBlocks,
  createSessionItem,
  withComputedTotal,
} from './session'

export interface WizardAnswers {
  age: WizardAge | null
  level: WizardLevel | null
  focus: WizardFocus
  hallTemplateId: string
  /** Slice 46 D1: the pass length only; the proposal stays the same (53 min). */
  targetMinutes: PassLength
}

/** Slice 46: three paths through the Planera pass sheet. */
export type WizardPath = 'questions' | 'empty' | 'mall'
export type WizardStep = 'age' | 'focus' | 'hall' | 'length' | 'mall'
export const WIZARD_STEPS: Record<WizardPath, readonly WizardStep[]> = {
  questions: ['age', 'focus', 'hall', 'length'],
  empty: ['hall', 'length'],
  mall: ['hall', 'mall'],
}
export interface WizardPos {
  path: WizardPath
  index: number
}
export const WIZARD_START: WizardPos = { path: 'questions', index: 0 }

export const wizardStepAt = (pos: WizardPos): WizardStep => WIZARD_STEPS[pos.path][pos.index]

/** C1: an answer moves on; the last step of a path finishes. */
export function wizardAdvance(pos: WizardPos): WizardPos | 'finish' {
  return pos.index + 1 < WIZARD_STEPS[pos.path].length ? { ...pos, index: pos.index + 1 } : 'finish'
}

/** C1: Tillbaka — one step back; Hall (first step of Tomt pass / mall) returns to Ålder; there is none on Ålder. */
export function wizardBack(pos: WizardPos): WizardPos | null {
  if (pos.index > 0) return { ...pos, index: pos.index - 1 }
  return pos.path === 'questions' ? null : WIZARD_START
}

/**
 * Tag fallback when a drill has no redskap. Prefer suggestZoneId.
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

/**
 * Compose a complete five-block session from wizard answers and
 * pre-place Teknik into matching hall zones.
 */
export function composeWizardSession(answers: WizardAnswers): Session {
  const { age, focus, level } = answers
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
  const teknikIds = teknikActivityIdsFor(age, focus, level)
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
    title: wizardSessionTitle(focus, level),
    totalMinutes: 0,
    notes: '',
    blocks,
    hallTemplateId,
    hallPlacements: [],
    targetMinutes: answers.targetMinutes,
  })

  session = autoPlaceUnplaced(session)
  return withComputedTotal(session)
}

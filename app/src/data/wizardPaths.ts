/**
 * Slice 29 — curated Home wizard path table (C1).
 * Soft Samling + focus Teknik + shared non-Teknik skeleton.
 * Durations chosen to stay ≤ block budgets (warmup ≤10; never short-mall 11).
 */

import type { PassLength } from './blockMeta'
import type { BlockType } from '../types'

export type WizardAge = 'age46' | 'age79' | 'age1012' | 'age1318'
export type WizardLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type WizardFocus = 'vault' | 'trampett' | 'tumbling' | 'mixed'

export interface WizardPathItem {
  activityId: string
  durationMinutes: number
}

/** Shared non-Teknik skeleton for every curated path. */
export const WIZARD_SHARED_SKELETON: {
  gathering: WizardPathItem[]
  warmup: WizardPathItem[]
  strength: WizardPathItem[]
  fun: WizardPathItem[]
} = {
  gathering: [
    { activityId: 'gather-narvaro', durationMinutes: 3 },
    { activityId: 'gather-dagens-teknik', durationMinutes: 3 },
  ],
  warmup: [{ activityId: 'warm-hall-varv', durationMinutes: 10 }],
  strength: [
    { activityId: 'strength-styrkelatar', durationMinutes: 5 },
    { activityId: 'strength-burpee-emom', durationMinutes: 8 },
  ],
  fun: [{ activityId: 'fun-rundpingis-medicinboll', durationMinutes: 6 }],
}

/** Title focus labels (lowercase) for `Pass — {fokus}`. */
export const WIZARD_FOCUS_TITLE_LABEL: Record<WizardFocus, string> = {
  vault: 'satsbräda',
  trampett: 'trampett',
  tumbling: 'tumbling',
  mixed: 'blandat',
}

const TEKNIK_BY_FOCUS: Record<WizardFocus, string[]> = {
  vault: [
    'tech-ljushopp-satsbrada',
    'tech-satsbrada-volt-rygg',
    'tech-handstaende-falla-rygg',
  ],
  trampett: [
    'tech-ljushopp-trampett',
    'tech-trampett-volt-mattberg',
    'tech-falla-bakat-hojd',
  ],
  tumbling: [
    'tech-flickis-kudde',
    'tech-handstaende-falla-rygg',
    'tech-falla-bakat-hojd',
  ],
  mixed: [
    'tech-ljushopp-satsbrada',
    'tech-handstaende-falla-rygg',
    'tech-falla-bakat-hojd',
  ],
}

/** Age46 only: drop middle “volt” drill when present; gentler three-seed set. */
const TEKNIK_AGE46: Partial<Record<WizardFocus, string[]>> = {
  vault: [
    'tech-ljushopp-satsbrada',
    'tech-handstaende-falla-rygg',
    'tech-falla-bakat-hojd',
  ],
  trampett: [
    'tech-ljushopp-trampett',
    'tech-handstaende-falla-rygg',
    'tech-falla-bakat-hojd',
  ],
}

/** Teknik activity IDs. 4–6 år and nivå 8–9 stay on the gentler set. */
export function teknikActivityIdsFor(
  age: WizardAge | null,
  focus: WizardFocus,
  level: WizardLevel | null = null,
): string[] {
  const gentle =
    age === 'age46' || (level != null && level >= 8)
  if (gentle && TEKNIK_AGE46[focus]) {
    return [...TEKNIK_AGE46[focus]!]
  }
  return [...TEKNIK_BY_FOCUS[focus]]
}

/** Slice 49 A1: minutes per block for each pass length (sum = the length). Edit freely. */
export const WIZARD_BLOCK_MINUTES: Record<PassLength, Record<BlockType, number>> = {
  60: { gathering: 6, warmup: 10, techniques: 21, strength: 15, fun_and_games: 8 },
  90: { gathering: 6, warmup: 15, techniques: 36, strength: 20, fun_and_games: 13 },
  120: { gathering: 8, warmup: 20, techniques: 45, strength: 27, fun_and_games: 20 },
}

/** Split `total` whole minutes by `weights`, largest remainder (ties: first item). */
export function splitMinutes(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map((w) => (total * w) / sum)
  const out = raw.map(Math.floor)
  let left = total - out.reduce((a, b) => a + b, 0)
  const order = raw.map((_, i) => i).sort((a, b) => raw[b] - out[b] - (raw[a] - out[a]) || a - b)
  for (const i of order) {
    if (left <= 0) break
    out[i]++
    left--
  }
  return out
}

export function focusTitleLabel(focus: WizardFocus): string {
  return WIZARD_FOCUS_TITLE_LABEL[focus]
}

export function wizardSessionTitle(
  focus: WizardFocus,
  level?: WizardLevel | null,
): string {
  const name = focusTitleLabel(focus)
  if (level) return `Nivå ${level} — ${name}`
  return `Pass — ${name}`
}

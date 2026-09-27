/**
 * Slice 29 — curated Home wizard path table (C1).
 * Soft Samling + focus Teknik + shared non-Teknik skeleton.
 * Durations chosen to stay ≤ block budgets (warmup ≤10; never short-mall 11).
 */

export type WizardAge = 'age46' | 'age79' | 'beginner' | 'training'
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

/** Teknik activity IDs for age + focus (durations applied in compose). */
export function teknikActivityIdsFor(
  age: WizardAge,
  focus: WizardFocus,
): string[] {
  if (age === 'age46' && TEKNIK_AGE46[focus]) {
    return [...TEKNIK_AGE46[focus]!]
  }
  return [...TEKNIK_BY_FOCUS[focus]]
}

export const WIZARD_TEKNIK_DURATION = 6

export function focusTitleLabel(focus: WizardFocus): string {
  return WIZARD_FOCUS_TITLE_LABEL[focus]
}

export function wizardSessionTitle(focus: WizardFocus): string {
  return `Pass — ${focusTitleLabel(focus)}`
}

/**
 * Slice 29 — curated Home wizard path table (C1).
 * Soft Samling + focus Teknik + shared non-Teknik skeleton.
 * Durations chosen to stay ≤ block budgets (warmup ≤10; never short-mall 11).
 */

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

export const WIZARD_TEKNIK_DURATION = 6

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

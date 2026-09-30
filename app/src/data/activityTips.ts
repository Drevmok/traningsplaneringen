import type { Activity } from '../types'

/**
 * One-line safety, only where the existing drill copy already states a
 * concrete control. Not new progressions.
 */
const ACTIVITY_SAFETY: Record<string, string> = {
  'warm-hall-varv':
    'Handstående och bakåtkullerbytta kräver madrass och uppsikt. Tvinga inte max.',
  'warm-uppvarmningsdans':
    'Inga vilda hopp på hårt golv. Erbjud en lugnare variant.',
  'warm-123-voltpositioner':
    'Ingen full volt här — bara formerna.',
  'warm-tojning-gymnaster':
    'Ingen press djupare än behagligt. Rätta farliga vinklar.',
  'warm-tojning-coach':
    'Studsa inte i stretchen. Smärta är inte målet.',
  'tech-ljushopp-satsbrada':
    'En i taget. Ingen springer in förrän landningen är klar.',
  'tech-ljushopp-trampett':
    'En i taget. Landning på madrass — vänta tills den är klar.',
  'tech-satsbrada-volt-rygg':
    'Madrassen måste räcka bakåt innan första försöket. En i taget.',
  'tech-trampett-volt-mattberg':
    'Mattberget ska stå stabilt. Nästa väntar tills landningen är klar.',
  'tech-rondat-flickis':
    'Endast med erfaren ledare och aktiv spotting. Avbryt om tekniken fallerar.',
  'tech-flickis-kudde':
    'Kudden enligt klubbens metod. Kasta inte bakåt utan handstöd.',
  'tech-falla-bakat-hojd':
    'Tjock och lång madrass bakom. Huvudet får inte ta emot.',
  'tech-salto-fran-hojd':
    'Endast med erfaren ledare, spotting och madrass före första försöket. Stoppa osäkra försök.',
  'tech-handstaende-falla-rygg':
    'Madrass bakom innan någon går upp i handstående.',
  'strength-cirkeltraning':
    'Teknik före tempo. Låt inte nybörjare ta skadliga genvägar.',
  'strength-burpee-emom':
    'Avbryt setet när formen faller. Step-back eller utan hopp är tillåtet.',
  'strength-styrkelatar':
    'Knän och axlar håller formen. En eller två låtar räcker.',
  'fun-rundpingis-medicinboll':
    'Lagom bollvikt. Inga hårda kast mot ansikte eller händer.',
  'fun-hojdhopp':
    'Mjuk landning på två fötter. Ingen hård ribba i ansiktshöjd.',
  'fun-stafett':
    'Håll banan fri från redskap. Se upp för krockar i växlingen.',
  'fun-123-forflyttning':
    'Tydliga gränser i hallen så ingen krockar när ni springer.',
  'fun-maffia':
    'Ingen fysisk attack. Byt roller ofta.',
  'fun-handstaende-utmaning':
    'Madrass redo. Belöna form, inte bara att någon vågar.',
  'fun-huvudstaende-utmaning':
    'Aldrig utan madrass. Avbryt vid smärta. Ingen knuffar upp någon annan.',
  'fun-morkerkurragomma':
    'Regler innan ljuset dämpas. Nödutgångsljus på. Räkna in alla efteråt.',
}

export interface FloorTip {
  why: string
  steps: string[]
  watchFor: string
  safety?: string
}

const MAX_FLOOR_STEPS = 4

export type TipIssueCode =
  | 'missing-why'
  | 'missing-how'
  | 'how-too-long'
  | 'missing-watch'
  | 'missing-safety'
  | 'orphan-safety'

export interface TipIssue {
  code: TipIssueCode
  message: string
  activityId?: string
}

/** Safety line is required off the gathering block, and always for experienced-only drills. */
export function needsSafetyLine(activity: Activity): boolean {
  return activity.blockType !== 'gathering' || activity.experiencedCoachOnly === true
}

export function validateActivityTip(activity: Activity): TipIssue[] {
  const tip = floorTip(activity)
  const issues: TipIssue[] = []

  if (!tip.why) {
    issues.push({ code: 'missing-why', message: 'Saknar varför.' })
  }
  if (tip.steps.length === 0) {
    issues.push({ code: 'missing-how', message: 'Saknar så gör du.' })
  } else if (tip.steps.length > MAX_FLOOR_STEPS) {
    issues.push({
      code: 'how-too-long',
      message: 'För många steg för golvet — högst fyra.',
    })
  }
  if (activity.watchForRequired && !tip.watchFor) {
    issues.push({ code: 'missing-watch', message: 'Saknar se upp för.' })
  }
  if (needsSafetyLine(activity) && !tip.safety?.trim()) {
    issues.push({ code: 'missing-safety', message: 'Saknar säkerhet.' })
  }

  return issues
}

export function validateTipCatalog(activities: Activity[]): TipIssue[] {
  const ids = new Set(activities.map((activity) => activity.id))
  const issues: TipIssue[] = []

  for (const activity of activities) {
    for (const issue of validateActivityTip(activity)) {
      issues.push({ ...issue, activityId: activity.id })
    }
  }

  for (const [id, text] of Object.entries(ACTIVITY_SAFETY)) {
    if (!ids.has(id) || !text.trim()) {
      issues.push({
        code: 'orphan-safety',
        activityId: id,
        message: 'Säkerhet utan övning.',
      })
    }
  }

  return issues
}

export function floorTip(activity: Activity): FloorTip {
  const steps = activity.howTo
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean)

  const safety = activity.safetyLine?.trim() || ACTIVITY_SAFETY[activity.id]

  return {
    why: activity.summary.trim(),
    steps,
    watchFor: activity.watchFor.trim(),
    safety,
  }
}

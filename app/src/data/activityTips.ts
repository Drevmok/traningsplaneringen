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
  'warm-djurpromenad':
    'Håll avstånd mellan leden. Inga hopp på hårt golv.',
  'warm-fotarbete':
    'Mjuka landningar. Ingen maxhopp på hårt golv.',
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
  'tech-kullerbytta':
    'Madrass under. Hakan i. Nästa väntar tills mattan är fri.',
  'tech-hjul':
    'Fri bana. En i taget. Båda hållen, utan att någon står i vägen.',
  'tech-bro':
    'Ingen trycker ner ryggen. Avbryt om handlederna gör ont.',
  'tech-balansgang':
    'Linjen är på golvet, inte på en upphöjd bänk. En i taget.',
  'strength-cirkeltraning':
    'Teknik före tempo. Låt inte nybörjare ta skadliga genvägar.',
  'strength-burpee-emom':
    'Avbryt setet när formen faller. Step-back eller utan hopp är tillåtet.',
  'strength-styrkelatar':
    'Knän och axlar håller formen. En eller två låtar räcker.',
  'strength-planka':
    'Höfterna får sjunka till knäna. Avbryt om ryggen gör ont.',
  'strength-djurkryp':
    'Korta banor. Ingen tävling in i varandra.',
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
  'fun-folja-ledaren':
    'Ledaren lägger inte in volter. Håll banan fri.',
  'fun-frysdans':
    'Frys på två fötter. Inga vilda hopp när musiken går.',
  // Seed promotion 2DJ_oMM81mI (Prime Coaching Sport)
  'tech-grenhopp-trampett':
    'Landningsmatta direkt efter trampetten. En i taget. Ingen springer in förrän landningen är klar.',
  'tech-formhopp-over-block':
    'Bara mjuka block, aldrig hårda kanter. Landningsmattan ska räcka långt bakom blocket. En i taget.',
  'tech-aggrullning-kil':
    'Kilen ligger stadigt på en matta. Bara en i taget i backen.',
  'tech-l-hang-racke':
    'Matta under räcket. Räcket så lågt att gymnasten når själv. Ledare nära vid första försöken.',
  'tech-stod-racke-pendel':
    'Matta under och bakom räcket. Räcket i lagom höjd för gruppen. Ledare står nära vid nedgången.',
  'tech-asnesparkar':
    'Matta under. Avstånd mellan gymnasterna så ingen får en spark. Ingen tävling om höjd.',
  'tech-minihjul':
    'Fri bana. En i taget på mattan. Ingen står där fötterna landar.',
  'tech-soldatsparkar-bom':
    'Låg bom med matta bredvid och vid nedhoppet. En i taget på bommen.',
  'tech-krabbgang-bom':
    'Bom som står stadigt på golvet. Avbryt om handlederna eller axlarna gör ont.',
  'tech-ljushopp-rockringar':
    'Ringarna ligger platt på golvet. Avstånd mellan gymnasterna i banan.',
  'tech-landning-plint':
    'Låg och stadig plint. Mjukt underlag vid nedhoppet. En i taget.',
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

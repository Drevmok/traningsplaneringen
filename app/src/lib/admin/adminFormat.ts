/** Slice 32 — small pure helpers for the admin UI (unit-tested). */
import { UI } from '../../data/blockMeta'
import { seedTemplates } from '../../data/seedTemplates'
import { teknikActivityIdsFor, WIZARD_SHARED_SKELETON, type WizardAge, type WizardFocus, type WizardLevel } from '../../data/wizardPaths'
import { createBlankSession } from '../session'

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

/** `2 okt`, or `2 okt 2025` when it isn't this year (Europe/Stockholm calendar day). */
export function formatBankDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const parts = (date: Date) => {
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Stockholm', year: 'numeric', month: 'numeric', day: 'numeric' })
    const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]))
    return { y: Number(p.year), m: Number(p.month), d: Number(p.day) }
  }
  const a = parts(d)
  const b = parts(now)
  const base = `${a.d} ${MONTHS[a.m - 1]}`
  return a.y === b.y ? base : `${base} ${a.y}`
}

/** «Senast ändrad 2 okt av …» / «Oförändrad sedan 2 okt» / «Senast ändrad 2 okt». */
export function lastChangedText(updatedAt: string, updatedBy: string | null, now: Date = new Date()): string {
  const datum = formatBankDate(updatedAt, now)
  if (!datum) return ''
  const who = (updatedBy ?? '').trim()
  if (who === 'seed-script') return UI.adminLastChangedFirst.replace('{datum}', datum)
  if (!who || who === 'service') return UI.adminLastChangedNoWho.replace('{datum}', datum)
  const vem = who === 'bot:planner' ? 'Planner' : who
  return UI.adminLastChanged.replace('{datum}', datum).replace('{vem}', vem)
}

let usedIds: Set<string> | null = null

/** Ids the code itself puts into passes: malls, Planera pass paths, the blank pass. */
export function idsUsedByMallsOrWizard(): ReadonlySet<string> {
  if (usedIds) return usedIds
  const ids = new Set<string>()
  for (const t of seedTemplates) for (const b of t.blocks) for (const i of b.items) ids.add(i.activityId)
  for (const list of Object.values(WIZARD_SHARED_SKELETON)) for (const i of list) ids.add(i.activityId)
  const ages: (WizardAge | null)[] = [null, 'age46', 'age79', 'age1012', 'age1318']
  const focuses: WizardFocus[] = ['vault', 'trampett', 'tumbling', 'mixed']
  const levels: (WizardLevel | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (const age of ages) for (const focus of focuses) for (const level of levels) {
    for (const id of teknikActivityIdsFor(age, focus, level)) ids.add(id)
  }
  for (const b of createBlankSession().blocks) for (const i of b.items) ids.add(i.activityId)
  usedIds = ids
  return ids
}

/** "0:16" / "1:02:05" / "" → seconds | undefined | null (null = unreadable). */
export function parseStartTime(raw: string): number | undefined | null {
  const t = raw.trim()
  if (!t) return undefined
  if (!/^\d{1,2}(:\d{2}){1,2}$/.test(t)) return null
  const parts = t.split(':').map(Number)
  const secs = parts.reduce((acc, n) => acc * 60 + n, 0)
  return parts.slice(1).every((n) => n < 60) ? secs : null
}

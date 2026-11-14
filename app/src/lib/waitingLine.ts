import { normalizeHowTo } from './ownActivities'

/** Slice 61 — an unnumbered last how_to line; never counted as a step. */
export const WAITING_PREFIX = 'Medan du väntar:'
const WAITING_RE = /^\s*(\d+\.\s*)?Medan du väntar:/

export const isWaitingLine = (line: string): boolean => WAITING_RE.test(line)

const payload = (text: string): string => text.replace(WAITING_RE, '').trim()

/** Text after the prefix on the last waiting line ('' when none). Form field value. */
export const waitingText = (howTo: string): string => payload(howTo.split('\n').filter(isWaitingLine).pop() ?? '')

/** Last matching line as `Medan du väntar: …`, or undefined. */
export function waitingLine(howTo: string): string | undefined {
  const text = waitingText(howTo)
  return text ? `${WAITING_PREFIX} ${text}` : undefined
}

/** How-to without the waiting line (numbering kept as stored). */
export const howToSteps = (howTo: string): string =>
  howTo
    .split('\n')
    .filter((line) => !isWaitingLine(line))
    .join('\n')

/** Steps (1–4) plus an optional waiting line (≤120); total ≤800 by shortening the waiting text. */
export function composeHowTo(howText: string, waiting: string): string {
  const steps = normalizeHowTo(howText)
  const text = payload(waiting).slice(0, Math.min(120, 782 - steps.length)).trim()
  return text ? `${steps}\n${WAITING_PREFIX} ${text}` : steps
}

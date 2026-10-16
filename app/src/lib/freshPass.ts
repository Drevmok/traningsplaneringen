// Slice 42 — «rätt tips i rätt läge»: soft pair, empty pass and fresh pass (README Definitions).
// session.ts must not import this module (import cycle, see lib/autosave.ts:1–3).
import { UI } from '../data/blockMeta'
import type { Session } from '../types'
import { passSignature } from './savedTemplates'
import { sessionToShare } from './sharePass'

const SOFT = new Set(['gather-narvaro', 'gather-dagens-teknik'])

/** Items that are not the Slice 27 soft pair (Närvaro + Dagens pass). */
export const coachStationCount = (s: Session) =>
  s.blocks.reduce((n, b) => n + b.items.filter((i) => !SOFT.has(i.activityId)).length, 0)

export function isEmptyPass(s: Session): boolean {
  const t = s.title.trim()
  return coachStationCount(s) === 0 && (!t || t === UI.untitledPass) && !(s.notes ?? '').trim()
    && s.blocks.every((b) => !(b.coachNote ?? '').trim())
}

const freshSig = (s: Session) =>
  JSON.stringify([passSignature(sessionToShare(s)), s.title, s.notes ?? '', s.blocks.map((b) => b.coachNote ?? '')])

/** In memory only (not kept over reload): the last pass created by a mall, the wizard or Tomt pass. */
let origin: { id: string; sig: string } | null = null

export function markFresh(s: Session): void {
  origin = { id: s.id, sig: freshSig(s) }
}

export function isFreshPass(s: Session): boolean {
  return isEmptyPass(s) || (origin?.id === s.id && origin.sig === freshSig(s))
}

/** Any edit ends «fresh» for good, also if the coach puts the value back by hand (AC12). */
export function noteChange(s: Session): void {
  if (origin?.id === s.id && origin.sig !== freshSig(s)) origin = null
}

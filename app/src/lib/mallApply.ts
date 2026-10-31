import type { HallTemplateId, Session, SessionTemplate } from '../types'
import { clubTemplateToSession, type ClubTemplate } from './clubTemplates'
import { autoPlaceUnplaced } from './hallSuggest'
import { savedTemplateToSession, type SavedTemplate } from './savedTemplates'
import type { PassLength } from '../data/blockMeta'
import { splitMinutes } from '../data/wizardPaths'
import { cloneTemplate, setSessionLength, withComputedTotal } from './session'

/** Slice 46: the three mall kinds, shared by the Mallar tab and the start page's Mall step. */
export type MallPick =
  | { kind: 'builtin'; item: SessionTemplate }
  | { kind: 'saved'; item: SavedTemplate }
  | { kind: 'club'; item: ClubTemplate }

/**
 * The pass a mall becomes (no save, no undo — callers own those). With a Hall answer that differs
 * from the mall's own hall, the hall is replaced and Teknik is placed again in pass order; the same
 * hall keeps a Mina mall's placements. Unplaced Teknik is placed either way (Slice 37).
 */
/**
 * Slice 55 A1/C1: every exercise keeps its share of the mall (weight = its minutes, at least 1),
 * whole minutes, at least 1 each, summing exactly to `length`. No exercises → only the target.
 */
export function scaleToLength(session: Session, length: PassLength): Session {
  const items = session.blocks.flatMap((b) => b.items)
  const split = splitMinutes(length, items.map((it) => Math.max(1, it.durationMinutes)))
  for (let i = 0; i < split.length; i++) {
    if (split[i] < 1) {
      split[split.indexOf(Math.max(...split))]--
      split[i] = 1
    }
  }
  let k = 0
  const blocks = session.blocks.map((b) => ({ ...b, items: b.items.map((it) => ({ ...it, durationMinutes: split[k++] })) }))
  return withComputedTotal(setSessionLength({ ...session, blocks }, length))
}

export function applyMall(pick: MallPick, hallTemplateId?: HallTemplateId, length?: PassLength): Session {
  const base =
    pick.kind === 'builtin'
      ? cloneTemplate(pick.item)
      : pick.kind === 'saved'
        ? savedTemplateToSession(pick.item)
        : clubTemplateToSession(pick.item)
  const onHall =
    hallTemplateId && base.hallTemplateId !== hallTemplateId
      ? { ...base, hallTemplateId, hallPlacements: [] }
      : base
  const placed = autoPlaceUnplaced(onHall)
  return length ? scaleToLength(placed, length) : placed
}

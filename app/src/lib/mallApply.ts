import type { HallTemplateId, Session, SessionTemplate } from '../types'
import { clubTemplateToSession, type ClubTemplate } from './clubTemplates'
import { autoPlaceUnplaced } from './hallSuggest'
import { savedTemplateToSession, type SavedTemplate } from './savedTemplates'
import { cloneTemplate } from './session'

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
export function applyMall(pick: MallPick, hallTemplateId?: HallTemplateId): Session {
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
  return autoPlaceUnplaced(onHall)
}

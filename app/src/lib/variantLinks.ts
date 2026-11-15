import { activitiesForBlock } from '../data/seedActivities'
import type { Activity, Session } from '../types'

type GetById = (id: string) => Activity | undefined
type Key = 'progressionOf' | 'regressionOf'

/** Own link first, else the first catalog drill linking back; never itself or a missing id. */
function linked(a: Activity, getById: GetById, own: Key, back: Key, catalog: Activity[]): Activity | undefined {
  const id = a[own] ?? catalog.find((c) => c[back] === a.id)?.id
  return id && id !== a.id ? getById(id) : undefined
}

/** Slice 62 — «Lättare»: progressionOf («Bygger på»), else a drill whose regressionOf is this one. */
export const easierOf = (a: Activity, getById: GetById, catalog = activitiesForBlock(a.blockType)) =>
  linked(a, getById, 'progressionOf', 'regressionOf', catalog)

/** Slice 62 — «Svårare»: regressionOf («Lättare variant av»), else a drill whose progressionOf is this one. */
export const harderOf = (a: Activity, getById: GetById, catalog = activitiesForBlock(a.blockType)) =>
  linked(a, getById, 'regressionOf', 'progressionOf', catalog)

/** Swap only `activityId` on one item; id, minutes, note, order and redskap stay. */
export function swapSessionActivity(session: Session, itemId: string, nextActivityId: string): Session {
  const hit = session.blocks.some((b) => b.items.some((i) => i.id === itemId && i.activityId !== nextActivityId))
  if (!hit) return session
  return {
    ...session,
    blocks: session.blocks.map((b) => ({
      ...b,
      items: b.items.map((i) => (i.id === itemId ? { ...i, activityId: nextActivityId } : i)),
    })),
  }
}

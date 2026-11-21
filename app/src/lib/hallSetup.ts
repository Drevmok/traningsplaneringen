import { getActivityById } from '../data/seedActivities'
import { layoutForStation } from '../data/stationLayout'
import type { Session, StationEquipmentSlot, StationLayout } from '../types'
import { placeableItems, stationRanks } from './hall'

/** Slice 65 B1/C1 — «Bygg hallen»: placed Teknik in marker order, then unplaced without a rank. */
export function hallSetupSteps(
  session: Session,
): Array<{ itemId: string; rank?: number; slots: StationEquipmentSlot[]; layout?: StationLayout }> {
  const ranks = stationRanks(session)
  return placeableItems(session)
    .map((item) => {
      const activity = getActivityById(item.activityId)
      return {
        itemId: item.id,
        rank: ranks.get(item.id),
        slots: item.stationEquipment ?? activity?.defaultStationEquipment ?? [],
        layout: layoutForStation(activity, item.stationEquipment),
      }
    })
    .sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9))
}


import { BLOCK_LABELS, stationEquipmentLabelText } from '../data/blockMeta'
import { floorTip } from '../data/activityTips'
import { getEquipmentPiece } from '../data/equipmentPieces'
import { getActivityById } from '../data/seedActivities'
import { placeableItems } from './hall'
import type { Session, StationEquipmentSlot } from '../types'

export interface StationCardModel {
  rank: number
  title: string
  minutes: number
  blockLabel: string
  watch: string
  safety?: string
  equipment?: string
  experienced: boolean
}

function equipmentLine(slots: StationEquipmentSlot[] | undefined): string | undefined {
  if (!slots || slots.length === 0) return undefined
  return slots
    .map((slot) => {
      const label = getEquipmentPiece(slot.pieceId)?.labelSv ?? slot.pieceId
      return stationEquipmentLabelText(label, slot.count)
    })
    .join(' · ')
}

/** Teknik stations in pass order. The number is the order, not the map position. */
export function stationCards(session: Session): StationCardModel[] {
  return placeableItems(session).map((item, index) => {
    const activity = getActivityById(item.activityId)
    const tip = activity ? floorTip(activity) : null
    const slots = item.stationEquipment ?? activity?.defaultStationEquipment
    return {
      rank: index + 1,
      title: activity?.title ?? item.activityId,
      minutes: item.durationMinutes,
      blockLabel: BLOCK_LABELS.techniques,
      watch: tip?.watchFor || '',
      safety: tip?.safety,
      equipment: equipmentLine(slots),
      experienced: Boolean(activity?.experiencedCoachOnly),
    }
  })
}

import type { StationLayout, StationPose } from '../types'
import { EQUIPMENT_ROW_WIDTH, type EquipmentKind } from './equipmentMark'

/** Floor-strip geometry shared by the sketch and the layout sheet (Slice 57). */
export const SKETCH_FLOOR_Y = 150
export const LAYOUT_VIEW_W = 640

/** Pose → SVG placement: x across the strip, z into it as 2,5D (up + smaller). */
export function poseTransform(pose: StationPose, kind: EquipmentKind, vbW = LAYOUT_VIEW_W): string {
  const w = EQUIPMENT_ROW_WIDTH[kind]
  const scale = 1 - 0.15 * pose.z
  const cx = 16 + pose.x * (vbW - 32)
  const cy = SKETCH_FLOOR_Y - 20 * pose.z
  const deg = (pose.yaw * 180) / Math.PI
  return `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${scale.toFixed(3)}) translate(${-w / 2} 0)`
}

export function sortedPoses(layout: StationLayout): StationPose[] {
  return [...layout.poses].sort((a, b) => b.z - a.z)
}


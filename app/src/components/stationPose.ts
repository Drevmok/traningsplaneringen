import type { StationLayout, StationPose } from '../types'
import { EQUIPMENT_ROW_WIDTH, type EquipmentKind } from './equipmentMark'

/** Floor-strip geometry shared by the sketch and the layout sheet (Slice 57). */
export const SKETCH_FLOOR_Y = 150
export const LAYOUT_VIEW_W = 640
/** Slice 58 (C1) — one layer ≈ a landningsmatta's mark height; y = 1 lifts 8 layers. */
export const LAYER_PX = 6

/** Lift in SVG units for a pose's height. */
export function layerLift(pose: StationPose): number {
  return 8 * LAYER_PX * (pose.y ?? 0)
}

/** Anchor point and scale for a pose: x across, z into the strip (up + smaller), y stacks up. */
export function poseGeometry(pose: StationPose, vbW = LAYOUT_VIEW_W): { cx: number; cy: number; scale: number } {
  return {
    cx: 16 + pose.x * (vbW - 32),
    cy: SKETCH_FLOOR_Y - 20 * pose.z - layerLift(pose),
    scale: 1 - 0.15 * pose.z,
  }
}

/** Pose → SVG placement. */
export function poseTransform(pose: StationPose, kind: EquipmentKind, vbW = LAYOUT_VIEW_W): string {
  const w = EQUIPMENT_ROW_WIDTH[kind]
  const { cx, cy, scale } = poseGeometry(pose, vbW)
  const deg = (pose.yaw * 180) / Math.PI
  return `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${scale.toFixed(3)}) translate(${-w / 2} 0)`
}

/** C1: y ascending, then z descending (back first), then original index. */
export function poseOrder(a: { p: StationPose; i: number }, b: { p: StationPose; i: number }): number {
  return (a.p.y ?? 0) - (b.p.y ?? 0) || b.p.z - a.p.z || a.i - b.i
}

export function sortedPoses(layout: StationLayout): StationPose[] {
  return layout.poses.map((p, i) => ({ p, i })).sort(poseOrder).map(({ p }) => p)
}

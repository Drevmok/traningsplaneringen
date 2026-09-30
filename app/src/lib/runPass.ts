import { BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta'
import { floorTip } from '../data/activityTips'
import { getActivityById } from '../data/seedActivities'
import type { Session } from '../types'

/** One exercise in pass order. The cue is the first how-step, not the whole sheet. */
export interface RunStep {
  itemId: string
  blockLabel: string
  title: string
  seconds: number
  why: string
  cue: string
  watch: string
  safety?: string
  experienced: boolean
}

export function runSeconds(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0
  return Math.round(minutes * 60)
}

/** mm:ss. Minutes are not wrapped at 60 — a long block stays readable. */
export function formatRunClock(totalSeconds: number): string {
  const s = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

/**
 * Every item in the pass, not only Teknik.
 * Block label follows where the coach placed the item.
 */
export function runSteps(session: Session): RunStep[] {
  const rows: RunStep[] = []
  for (const type of BLOCK_ORDER) {
    const block = session.blocks.find((b) => b.type === type)
    if (!block) continue
    const items = [...block.items].sort((a, b) => a.order - b.order)
    for (const item of items) {
      const activity = getActivityById(item.activityId)
      const tip = activity ? floorTip(activity) : null
      rows.push({
        itemId: item.id,
        blockLabel: BLOCK_LABELS[type],
        title: activity?.title ?? item.activityId,
        seconds: runSeconds(item.durationMinutes),
        why: tip?.why ?? '',
        cue: tip?.steps[0] ?? '',
        watch: tip?.watchFor ?? '',
        safety: tip?.safety,
        experienced: Boolean(activity?.experiencedCoachOnly),
      })
    }
  }
  return rows
}

export interface RunClock {
  index: number
  deadline: number
  paused: boolean
  /** Seconds left when paused. Ignored while running. */
  frozen: number
}

export function startClock(index: number, seconds: number, now: number): RunClock {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  return { index, deadline: now + s * 1000, paused: false, frozen: s }
}

export function clockRemaining(clock: RunClock, now: number): number {
  if (clock.paused) return Math.max(0, clock.frozen)
  const left = Math.round((clock.deadline - now) / 1000)
  return Math.max(0, left)
}

export function pauseClock(clock: RunClock, now: number): RunClock {
  if (clock.paused) return clock
  return { ...clock, paused: true, frozen: clockRemaining(clock, now) }
}

export function resumeClock(clock: RunClock, now: number): RunClock {
  if (!clock.paused) return clock
  return {
    ...clock,
    paused: false,
    deadline: now + Math.max(0, clock.frozen) * 1000,
  }
}

/** Slice 09 — coach tips & Kom igång persistence (local only). */

export const TIPS_STORAGE_KEY = 'gymnastics-planner-tips-v1'

export const TIP_BUILDER_EMPTY = 'tip-builder-empty'
export const TIP_HALL_PLACE = 'tip-hall-place'
export const TIP_HALL_FLOW_GOLVKLART = 'tip-hall-flow-golvklart'
export const TIP_EXPERIENCED_SAFETY = 'tip-experienced-safety'
/** Slice 13 — soft guidance after first hall detail / compose entry */
export const TIP_STATION_COMPOSE = 'tip-station-compose'

export type ChecklistKey =
  | 'chooseOrBuildPass'
  | 'addActivities'
  | 'openHallAndPlace'
  | 'composeStationEquipment'
  | 'useGolvklart'

export type CoachTipsStateV1 = {
  version: 1
  updatedAt?: string
  checklistDismissed: boolean
  checklist: {
    chooseOrBuildPass: boolean
    addActivities: boolean
    openHallAndPlace: boolean
    composeStationEquipment: boolean
    useGolvklart: boolean
  }
  dismissed: Record<string, boolean>
  showTipsAgain?: boolean
  openedHall?: boolean
  openedGolvklart?: boolean
  builderFirstVisitSeen?: boolean
  /** Slice 22 — durable after first successful Teknik place ever */
  hallHintsCompact?: boolean
  /** Slice 22 — coach collapsed Kom igång summary */
  komIgangCollapsed?: boolean
}

export function defaultCoachTips(): CoachTipsStateV1 {
  return {
    version: 1,
    checklistDismissed: false,
    checklist: {
      chooseOrBuildPass: false,
      addActivities: false,
      openHallAndPlace: false,
      composeStationEquipment: false,
      useGolvklart: false,
    },
    dismissed: {},
  }
}

function normalize(raw: unknown): CoachTipsStateV1 {
  const base = defaultCoachTips()
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Partial<CoachTipsStateV1>
  const checklist = o.checklist ?? base.checklist
  return {
    version: 1,
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : undefined,
    checklistDismissed: Boolean(o.checklistDismissed),
    checklist: {
      chooseOrBuildPass: Boolean(checklist.chooseOrBuildPass),
      addActivities: Boolean(checklist.addActivities),
      openHallAndPlace: Boolean(checklist.openHallAndPlace),
      // Slice 16 — missing key → false (older localStorage)
      composeStationEquipment: Boolean(checklist.composeStationEquipment),
      useGolvklart: Boolean(checklist.useGolvklart),
    },
    dismissed:
      o.dismissed && typeof o.dismissed === 'object' ? { ...o.dismissed } : {},
    showTipsAgain: o.showTipsAgain ? true : undefined,
    openedHall: o.openedHall ? true : undefined,
    openedGolvklart: o.openedGolvklart ? true : undefined,
    builderFirstVisitSeen: o.builderFirstVisitSeen ? true : undefined,
    // Slice 22 — missing → false/undefined (older localStorage)
    hallHintsCompact: o.hallHintsCompact ? true : undefined,
    komIgangCollapsed: o.komIgangCollapsed ? true : undefined,
  }
}

export function loadCoachTips(): CoachTipsStateV1 {
  try {
    const raw = localStorage.getItem(TIPS_STORAGE_KEY)
    if (!raw) return defaultCoachTips()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultCoachTips()
  }
}

export function saveCoachTips(state: CoachTipsStateV1): CoachTipsStateV1 {
  const next: CoachTipsStateV1 = {
    ...state,
    version: 1,
    updatedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota / private mode — keep in-memory shape for the session.
  }
  return next
}

export function isTipDismissed(
  state: CoachTipsStateV1,
  tipId: string,
): boolean {
  return Boolean(state.dismissed[tipId])
}

export function dismissTip(
  state: CoachTipsStateV1,
  tipId: string,
): CoachTipsStateV1 {
  return saveCoachTips({
    ...state,
    dismissed: { ...state.dismissed, [tipId]: true },
    showTipsAgain: undefined,
  })
}

export function dismissChecklist(state: CoachTipsStateV1): CoachTipsStateV1 {
  return saveCoachTips({
    ...state,
    checklistDismissed: true,
    showTipsAgain: undefined,
  })
}

/** Clears dismissals so checklist + tips reappear. Does not touch draft.
 * Slice 22 Q4 — also clears hallHintsCompact + komIgangCollapsed.
 */
export function resetTipsVisibility(state: CoachTipsStateV1): CoachTipsStateV1 {
  return saveCoachTips({
    ...state,
    checklistDismissed: false,
    dismissed: {},
    showTipsAgain: true,
    hallHintsCompact: undefined,
    komIgangCollapsed: undefined,
  })
}

export function anyTipsHidden(state: CoachTipsStateV1): boolean {
  if (state.checklistDismissed) return true
  return Object.values(state.dismissed).some(Boolean)
}

export function markChecklist(
  state: CoachTipsStateV1,
  key: ChecklistKey,
  done = true,
): CoachTipsStateV1 {
  if (state.checklist[key] === done) return state
  return saveCoachTips({
    ...state,
    checklist: { ...state.checklist, [key]: done },
  })
}

export function markOpenedHall(state: CoachTipsStateV1): CoachTipsStateV1 {
  if (state.openedHall && state.checklist.openHallAndPlace) return state
  return saveCoachTips({
    ...state,
    openedHall: true,
    checklist: { ...state.checklist, openHallAndPlace: true },
  })
}

export function markOpenedGolvklart(state: CoachTipsStateV1): CoachTipsStateV1 {
  if (state.openedGolvklart && state.checklist.useGolvklart) return state
  return saveCoachTips({
    ...state,
    openedGolvklart: true,
    checklist: { ...state.checklist, useGolvklart: true },
  })
}

export function markBuilderVisited(state: CoachTipsStateV1): CoachTipsStateV1 {
  if (state.builderFirstVisitSeen && state.checklist.chooseOrBuildPass) {
    return state
  }
  return saveCoachTips({
    ...state,
    builderFirstVisitSeen: true,
    checklist: { ...state.checklist, chooseOrBuildPass: true },
  })
}

export function markChooseOrBuild(state: CoachTipsStateV1): CoachTipsStateV1 {
  return markChecklist(state, 'chooseOrBuildPass', true)
}

/**
 * Auto-progress from draft / session heuristics (data-model.md §4).
 * Does not clear already-true flags.
 */
export function syncChecklistHeuristics(
  state: CoachTipsStateV1,
  opts: {
    hasDraft: boolean
    itemCount: number
    placementCount: number
    /** Slice 16 — any non-empty saved stationEquipment on the draft */
    hasComposedEquipment?: boolean
  },
): CoachTipsStateV1 {
  const checklist = { ...state.checklist }
  let changed = false

  if (!checklist.chooseOrBuildPass && opts.hasDraft) {
    checklist.chooseOrBuildPass = true
    changed = true
  }
  if (!checklist.addActivities && opts.itemCount >= 1) {
    checklist.addActivities = true
    changed = true
  }
  if (
    !checklist.openHallAndPlace &&
    (opts.placementCount >= 1 || state.openedHall)
  ) {
    checklist.openHallAndPlace = true
    changed = true
  }
  // Slice 16 — auto-progress on saved non-empty stationEquipment only (never clear)
  if (!checklist.composeStationEquipment && opts.hasComposedEquipment) {
    checklist.composeStationEquipment = true
    changed = true
  }
  if (!checklist.useGolvklart && state.openedGolvklart) {
    checklist.useGolvklart = true
    changed = true
  }

  if (!changed) return state
  return saveCoachTips({ ...state, checklist })
}


/** Slice 22 A1 — durable compact after first successful Teknik place (idempotent). */
export function markHallHintsCompact(state: CoachTipsStateV1): CoachTipsStateV1 {
  if (state.hallHintsCompact) return state
  return saveCoachTips({ ...state, hallHintsCompact: true })
}

/** Slice 22 B1 — persist Kom igång collapsed preference. */
export function setKomIgangCollapsed(
  state: CoachTipsStateV1,
  collapsed: boolean,
): CoachTipsStateV1 {
  if (collapsed) {
    if (state.komIgangCollapsed) return state
    return saveCoachTips({ ...state, komIgangCollapsed: true })
  }
  if (!state.komIgangCollapsed) return state
  return saveCoachTips({ ...state, komIgangCollapsed: undefined })
}

export function checklistDoneCount(state: CoachTipsStateV1): number {
  const c = state.checklist
  return (
    Number(c.chooseOrBuildPass) +
    Number(c.addActivities) +
    Number(c.openHallAndPlace) +
    Number(c.composeStationEquipment) +
    Number(c.useGolvklart)
  )
}

export const CHECKLIST_TOTAL = 5

export function checklistAllDone(state: CoachTipsStateV1): boolean {
  return checklistDoneCount(state) >= CHECKLIST_TOTAL
}

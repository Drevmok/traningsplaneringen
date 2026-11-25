export const CLUB_EQUIPMENT_CACHE_KEY = 'gymnastics-planner-club-equipment-v1'

export type ClubEquipmentState = { filled: false } | { filled: true; ids: readonly string[] }

const EMPTY: ClubEquipmentState = { filled: false }
let state: ClubEquipmentState = EMPTY
let listeners: Array<() => void> = []

function emit(next: ClubEquipmentState): void {
  state = next
  for (const fn of listeners) fn()
}

export function subscribeClubEquipment(fn: () => void): () => void {
  listeners = [...listeners, fn]
  return () => {
    listeners = listeners.filter((f) => f !== fn)
  }
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function applyClubEquipment(ids: string[] | null): void {
  if (ids === null) {
    storage()?.removeItem(CLUB_EQUIPMENT_CACHE_KEY)
    emit(EMPTY)
    return
  }
  try {
    storage()?.setItem(CLUB_EQUIPMENT_CACHE_KEY, JSON.stringify({ v: 1, ids }))
  } catch {
    /* private mode */
  }
  emit({ filled: true, ids })
}

export function getClubEquipment(): ClubEquipmentState {
  return state
}

export function readClubEquipmentCache(): ClubEquipmentState {
  try {
    const raw = storage()?.getItem(CLUB_EQUIPMENT_CACHE_KEY)
    const data = raw ? (JSON.parse(raw) as { v?: unknown; ids?: unknown } | null) : null
    if (data && data.v === 1 && Array.isArray(data.ids)) {
      return { filled: true, ids: data.ids.filter((id): id is string => typeof id === 'string') }
    }
  } catch {
    /* ignore */
  }
  return EMPTY
}

export function setClubEquipmentState(next: ClubEquipmentState): void {
  emit(next)
}

export function resetClubEquipmentForTests(next: ClubEquipmentState = EMPTY): void {
  storage()?.removeItem(CLUB_EQUIPMENT_CACHE_KEY)
  emit(next)
}

if (typeof window !== 'undefined') {
  window.addEventListener('tp-club-eq', (e: Event) => {
    applyClubEquipment((e as CustomEvent<string[] | null>).detail)
  })
}

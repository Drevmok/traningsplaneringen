import { useSyncExternalStore } from 'react'
import { getBankSnapshot, subscribeBank, type BankSnapshot } from './bank'

/** Slice 31 — re-render when fresh bank data lands (in place; no remount). */
export function useBank(): BankSnapshot {
  return useSyncExternalStore(subscribeBank, getBankSnapshot, getBankSnapshot)
}

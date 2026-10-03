import { useSyncExternalStore } from 'react'
import {
  getAdminBank,
  getAdminSnapshot,
  subscribeAdmin,
  subscribeAdminBank,
  type AdminBankSnapshot,
  type AdminSnapshot,
} from './state'

export function useAdmin(): AdminSnapshot {
  return useSyncExternalStore(subscribeAdmin, getAdminSnapshot, getAdminSnapshot)
}

export function useAdminBank(): AdminBankSnapshot {
  return useSyncExternalStore(subscribeAdminBank, getAdminBank, getAdminBank)
}

function subscribeOnline(fn: () => void): () => void {
  window.addEventListener('online', fn)
  window.addEventListener('offline', fn)
  return () => {
    window.removeEventListener('online', fn)
    window.removeEventListener('offline', fn)
  }
}
const getOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false)

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, getOnline, () => true)
}

import { UI } from '../data/blockMeta'

/** Slice 32 — «Väntar» / «Dold» on bank rows, admin mode only. */
export function AdminStatusBadge({ status }: { status: 'pending' | 'hidden' }) {
  return status === 'pending' ? (
    <span className="admin-badge admin-badge-pending" aria-label={UI.adminPendingBadgeAria} title={UI.adminPendingBadgeAria}>
      {UI.adminPendingBadge}
    </span>
  ) : (
    <span className="admin-badge admin-badge-hidden">{UI.adminHiddenBadge}</span>
  )
}

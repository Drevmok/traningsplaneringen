import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { lastChangedText } from '../lib/admin/adminFormat'
import { approveRow, hideRow, markRowReviewed, unhideRow, type WriteResult } from '../lib/admin/bankWrite'
import { useAdminBank, useOnline } from '../lib/admin/useAdmin'
import { AdminHideConfirm } from './AdminHideConfirm'

interface Props {
  id: string
  onToast: (text: string) => void
  onEdit: () => void
}

/**
 * Slice 32 — screen-spec §5, admin mode only, bank rows only.
 * pending: Godkänn · Ändra i banken — published: Ändra i banken · Dölj för alla — hidden: Visa igen · Ändra i banken.
 */
export function AdminDetailPanel({ id, onToast, onEdit }: Props) {
  const bank = useAdminBank()
  const online = useOnline()
  const entry = bank.byId.get(id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'conflict' | 'failed' | null>(null)
  const [confirmHide, setConfirmHide] = useState(false)
  if (!entry) return null
  const disabled = !online || busy

  async function run(action: () => Promise<WriteResult>, toast: string) {
    setBusy(true)
    setError(null)
    const result = await action()
    setBusy(false)
    if (result === 'ok') onToast(toast)
    else if (result === 'conflict') setError('conflict')
    else if (result === 'failed') setError('failed')
    // 'offline': buttons are disabled with adminOffline; nothing queued.
  }

  const current = entry
  return (
    <div className="admin-detail">
      {current.needsReview && (
        <div className="review-hint">
          <p>{UI.adminReviewHint}</p>
          <button
            type="button"
            className="btn-secondary"
            disabled={disabled}
            aria-label={UI.ownMarkReviewedAria.replace('{title}', current.activity.title)}
            onClick={() => void run(() => markRowReviewed(current), UI.ownReviewedToast)}
          >
            {UI.ownMarkReviewed}
          </button>
        </div>
      )}
      {!online && <p className="admin-offline muted">{UI.adminOffline}</p>}
      <div className="modal-actions admin-actions">
        {current.status === 'pending' && (
          <>
            <button type="button" className="btn-primary" disabled={disabled} onClick={() => void run(() => approveRow(current), UI.adminApproved)}>
              {UI.adminApprove}
            </button>
            <button type="button" className="btn-secondary" disabled={disabled} onClick={onEdit}>
              {UI.adminEdit}
            </button>
          </>
        )}
        {current.status === 'published' && (
          <>
            <button type="button" className="btn-secondary" disabled={disabled} onClick={onEdit}>
              {UI.adminEdit}
            </button>
            <button type="button" className="btn-secondary" disabled={disabled} onClick={() => setConfirmHide(true)}>
              {UI.adminHide}
            </button>
          </>
        )}
        {current.status === 'hidden' && (
          <>
            <button type="button" className="btn-secondary" disabled={disabled} onClick={() => void run(() => unhideRow(current), UI.adminUnhidden)}>
              {UI.adminUnhide}
            </button>
            <button type="button" className="btn-secondary" disabled={disabled} onClick={onEdit}>
              {UI.adminEdit}
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error === 'conflict' ? UI.adminSaveConflict : UI.adminSaveFailed}
        </p>
      )}
      <p className="admin-last-changed muted">{lastChangedText(current.updatedAt, current.updatedBy)}</p>
      {confirmHide && (
        <AdminHideConfirm
          id={current.activity.id}
          title={current.activity.title}
          onCancel={() => setConfirmHide(false)}
          onConfirm={() => {
            setConfirmHide(false)
            void run(() => hideRow(current), UI.adminHidden)
          }}
        />
      )}
    </div>
  )
}

import { UI } from '../data/blockMeta'
import { idsUsedByMallsOrWizard } from '../lib/admin/adminFormat'

interface Props {
  id: string
  title: string
  onConfirm: () => void
  onCancel: () => void
}

/** Slice 32 — screen-spec §6. */
export function AdminHideConfirm({ id, title, onConfirm, onCancel }: Props) {
  const usedInCode = idsUsedByMallsOrWizard().has(id)
  return (
    <div
      className="modal-backdrop replace-draft-backdrop admin-hide-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.adminHide}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal admin-hide-confirm">
        <p>{UI.adminHideConfirm.replace('{title}', title)}</p>
        {usedInCode && <p className="muted">{UI.adminHideUsedIn}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.adminCancel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {UI.adminHideConfirmYes}
          </button>
        </div>
      </div>
    </div>
  )
}

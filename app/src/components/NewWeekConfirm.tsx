import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function NewWeekConfirm({ onConfirm, onCancel }: Props) {
  useBodyScrollLock(true)

  return (
    <div
      className="modal-backdrop replace-draft-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.newWeekTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal">
        <h2>{UI.newWeekTitle}</h2>
        <p>{UI.newWeekBody}</p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.templateCancel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {UI.newWeekConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

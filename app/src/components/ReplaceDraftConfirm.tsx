import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function ReplaceDraftConfirm({ onConfirm, onCancel }: Props) {
  useBodyScrollLock(true)

  return (
    <div
      className="modal-backdrop replace-draft-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.replaceDraftTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal">
        <h2>{UI.replaceDraftTitle}</h2>
        <p>{UI.replaceDraftBody}</p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.templateCancel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {UI.replaceDraftConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

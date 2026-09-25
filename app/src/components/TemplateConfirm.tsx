import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import type { SessionTemplate } from '../types'

interface Props {
  template: SessionTemplate
  onConfirm: () => void
  onCancel: () => void
}

export function TemplateConfirm({ template, onConfirm, onCancel }: Props) {
  useBodyScrollLock(true)

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal">
        <h2>{UI.templateTitle}</h2>
        <p>
          {UI.templateBody} ({template.title})
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.templateCancel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {UI.templateConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'

interface Props {
  initialTitle: string
  onSave: (title: string) => void
  onCancel: () => void
}

export function SaveTemplateDialog({ initialTitle, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle)
  useBodyScrollLock(true)

  return (
    <div
      className="modal-backdrop replace-draft-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.saveOwnTemplateTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(title)
        }}
      >
        <h2>{UI.saveOwnTemplateTitle}</h2>
        <p>{UI.saveOwnTemplateHint}</p>
        <label className="own-field">
          <span>{UI.templateName}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
            autoFocus
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.templateCancel}
          </button>
          <button type="submit" className="btn-primary">
            {UI.saveOwnTemplate}
          </button>
        </div>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { overwriteClubTemplate, publishClubTemplate, type ClubAdminRow, type ClubDraft } from '../lib/admin/clubWrite'
import { useBodyScrollLock } from '../lib/bodyScrollLock'

interface Props {
  /** Prefill for «Namn på mallen». */
  initialTitle: string
  draft: ClubDraft
  onDone: (toast: string) => void
  onCancel: () => void
}

/** Slice 36 (C1, F1) — «Publicera som föreningsmall», admin only, lazy chunk. */
export default function ClubPublishDialog({ initialTitle, draft, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [match, setMatch] = useState<ClubAdminRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useBodyScrollLock(true)

  async function submit() {
    if (busy || !title.trim()) return
    setBusy(true)
    setError(null)
    if (match) {
      const result = await overwriteClubTemplate(match, draft, title)
      setBusy(false)
      if (result === 'ok') onDone(UI.clubOverwritten)
      else setError(result === 'offline' ? UI.clubOffline : UI.clubWriteFailed)
      return
    }
    const result = await publishClubTemplate(draft, title)
    setBusy(false)
    if (result === 'ok') onDone(UI.clubPublished)
    else if (typeof result === 'object') setMatch(result.exists)
    else setError(result === 'offline' ? UI.clubOffline : UI.clubWriteFailed)
  }

  const heading = match ? UI.clubOverwriteTitle.replace('{title}', match.title) : UI.clubPublishTitle

  return (
    <div
      className="modal-backdrop replace-draft-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <h2>{heading}</h2>
        {match ? (
          <p>{UI.clubOverwriteBody}</p>
        ) : (
          <>
            <p>{UI.clubPublishBody}</p>
            <label className="own-field">
              <span>{UI.clubPublishNameLabel}</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required autoFocus />
            </label>
          </>
        )}
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.adminCancel}
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {match ? UI.clubOverwriteConfirm : UI.clubPublishConfirm}
          </button>
        </div>
      </form>
    </div>
  )
}

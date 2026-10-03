import { useState, type FormEvent } from 'react'
import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { sendLoginLink, type SendResult } from '../lib/admin/session'

interface Props {
  /** Back from an expired / used / other-browser link (adminLinkFailed above the form). */
  linkFailed: boolean
  onClose: () => void
}

/** Slice 32 (C1) — screen-spec §3. The only way in is the footer link. */
export function AdminLoginSheet({ linkFailed, onClose }: Props) {
  useBodyScrollLock(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || sending) return
    setSending(true)
    const next = await sendLoginLink(email)
    setSending(false)
    setResult(next)
  }

  return (
    <div
      className="modal-backdrop admin-login-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal admin-login">
        <button type="button" className="modal-close" onClick={onClose} aria-label={UI.adminCloseAria}>
          ×
        </button>
        <h2 id="admin-login-title">{UI.adminLoginTitle}</h2>
        {result === 'sent' ? (
          <p className="admin-link-sent" role="status">
            {UI.adminLinkSent}
          </p>
        ) : (
          <form onSubmit={submit}>
            {linkFailed && <p className="admin-link-failed">{UI.adminLinkFailed}</p>}
            <p id="admin-login-hint">{UI.adminLoginHint}</p>
            <label className="own-field">
              <span>{UI.adminEmailLabel}</span>
              <input
                type="email"
                autoComplete="email"
                aria-describedby="admin-login-hint"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={!email.trim() || sending}>
                {UI.adminSendLink}
              </button>
            </div>
            {result === 'wait' && <p className="admin-send-error">{UI.adminWait}</p>}
            {result === 'failed' && <p className="admin-send-error">{UI.adminSendFailed}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

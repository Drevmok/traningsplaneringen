import { useEffect, useRef, useState, type FormEvent } from 'react'
import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import {
  CODE_LENGTH,
  RESEND_COOLDOWN_MS,
  clearPendingLogin,
  normalizeCode,
  readPendingLogin,
  writePendingLogin,
} from '../lib/admin/loginCode'
import { sendLoginCode, verifyLoginCode, type SendResult, type VerifyResult } from '../lib/admin/session'

interface Props {
  onClose: () => void
  /** Code accepted: the parent closes the sheet and moves focus to the footer «Logga ut». */
  onLoggedIn: () => void
}

type Step = 'email' | 'code'
type VerifyError = Exclude<VerifyResult, 'ok'>

/**
 * Slice 33 — slice-33/HANDOFF.md «The flow». Step 1: e-post → Skicka kod. Step 2: the 6-digit
 * code from the mail → Logga in, plus Skicka ny kod (60 s cooldown) and Byt e-post.
 * A send that reaches step 2 is remembered for 60 minutes, so an app reload (home-screen app
 * while the admin reads the mail) reopens on step 2. The only way in is the footer link.
 */
export function AdminLoginSheet({ onClose, onLoggedIn }: Props) {
  useBodyScrollLock(true)
  const [initial] = useState(() => readPendingLogin())
  const [step, setStep] = useState<Step>(initial ? 'code' : 'email')
  const [email, setEmail] = useState(initial?.email ?? '')
  // The address the code went to (shown in adminCodeSent, used for verify + resend).
  const [sentTo, setSentTo] = useState(initial?.email ?? '')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendNote, setResendNote] = useState<Exclude<SendResult, 'sent'> | null>(null)
  const [verifyError, setVerifyError] = useState<VerifyError | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(() => (initial ? initial.sentAt + RESEND_COOLDOWN_MS : 0))
  const [now, setNow] = useState(() => Date.now())
  const emailRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  // What to focus after the next render: the field of the step we just moved to.
  const focusTarget = useRef<'email' | 'code' | 'code-select' | null>(initial ? 'code' : null)

  const coolingDown = now < cooldownUntil
  useEffect(() => {
    if (!coolingDown) return
    const t = window.setTimeout(() => setNow(Date.now()), cooldownUntil - now + 50)
    return () => window.clearTimeout(t)
  }, [coolingDown, cooldownUntil, now])

  // Runs after every render; acts only when an event asked for a focus move.
  useEffect(() => {
    const target = focusTarget.current
    if (!target) return
    focusTarget.current = null
    if (target === 'email') {
      emailRef.current?.focus()
      emailRef.current?.select()
    } else {
      codeRef.current?.focus()
      if (target === 'code-select') codeRef.current?.select()
    }
  })

  function enterCodeStep(to: string, result: SendResult) {
    const sentAt = Date.now()
    writePendingLogin(to, sentAt)
    setSentTo(to)
    setStep('code')
    setCode('')
    setVerifyError(null)
    setInvalid(false)
    setResent(false)
    setResendNote(result === 'wait' ? 'wait' : null)
    setCooldownUntil(sentAt + RESEND_COOLDOWN_MS)
    setNow(sentAt)
    focusTarget.current = 'code'
  }

  async function sendFirst(e: FormEvent) {
    e.preventDefault()
    const to = email.trim()
    if (!to || busy) return
    setBusy(true)
    setSendError(false)
    const result = await sendLoginCode(to)
    setBusy(false)
    if (result === 'failed') setSendError(true)
    else enterCodeStep(to, result)
  }

  async function resend() {
    if (busy || coolingDown) return
    setBusy(true)
    setResendNote(null)
    const result = await sendLoginCode(sentTo)
    setBusy(false)
    const sentAt = Date.now()
    if (result === 'failed') {
      setResendNote('failed')
      return
    }
    writePendingLogin(sentTo, sentAt)
    setCooldownUntil(sentAt + RESEND_COOLDOWN_MS)
    setNow(sentAt)
    if (result === 'wait') {
      setResendNote('wait')
      return
    }
    setResent(true)
    setCode('')
    setVerifyError(null)
    setInvalid(false)
    focusTarget.current = 'code'
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    if (code.length !== CODE_LENGTH || busy) return
    setBusy(true)
    setVerifyError(null)
    setInvalid(false)
    const result = await verifyLoginCode(sentTo, code)
    setBusy(false)
    if (result === 'ok') {
      onLoggedIn()
      return
    }
    setVerifyError(result)
    if (result === 'wrong') {
      setInvalid(true)
      focusTarget.current = 'code-select'
    }
  }

  function changeEmail() {
    clearPendingLogin()
    setStep('email')
    setEmail(sentTo || email)
    setCode('')
    setVerifyError(null)
    setInvalid(false)
    setResent(false)
    setResendNote(null)
    setSendError(false)
    focusTarget.current = 'email'
  }

  const errorText =
    verifyError === 'wrong' ? UI.adminCodeWrong : verifyError === 'wait' ? UI.adminVerifyWait : verifyError === 'failed' ? UI.adminVerifyFailed : null
  const describedBy = ['admin-code-status', errorText ? 'admin-code-error' : ''].filter(Boolean).join(' ')

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
        {step === 'email' ? (
          <form onSubmit={sendFirst} className="admin-login-step admin-login-email">
            <p id="admin-login-hint">{UI.adminLoginHint}</p>
            <label className="own-field">
              <span>{UI.adminEmailLabel}</span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                autoComplete="email"
                aria-describedby="admin-login-hint"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={!email.trim() || busy}>
                {UI.adminSendCode}
              </button>
            </div>
            {sendError && (
              <p className="admin-send-error" role="alert">
                {UI.adminSendFailed}
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={verify} className="admin-login-step admin-login-code" noValidate>
            <p id="admin-code-status" className="admin-code-status" role="status">
              {resent ? UI.adminCodeResent : UI.adminCodeSent.replace('{email}', sentTo)}
            </p>
            <label className="own-field">
              <span>{UI.adminCodeLabel}</span>
              <input
                ref={codeRef}
                className="admin-code-input"
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={UI.adminCodePlaceholder}
                aria-describedby={describedBy}
                aria-invalid={invalid ? 'true' : undefined}
                value={code}
                onChange={(e) => {
                  setCode(normalizeCode(e.target.value))
                  if (invalid) setInvalid(false)
                }}
              />
            </label>
            {errorText && (
              <p id="admin-code-error" className="admin-send-error" role="alert">
                {errorText}
              </p>
            )}
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={code.length !== CODE_LENGTH || busy}>
                {UI.adminVerify}
              </button>
            </div>
            <div className="admin-code-more">
              <div className="admin-resend-row">
                <button
                  type="button"
                  className="btn-text admin-resend"
                  disabled={coolingDown || busy}
                  aria-describedby={coolingDown ? 'admin-resend-soon' : undefined}
                  onClick={() => void resend()}
                >
                  {UI.adminResend}
                </button>
                {coolingDown && (
                  <span id="admin-resend-soon" className="admin-resend-soon muted">
                    {UI.adminResendSoon}
                  </span>
                )}
              </div>
              {resendNote && (
                <p className="admin-send-error" role="alert">
                  {resendNote === 'wait' ? UI.adminWait : UI.adminSendFailed}
                </p>
              )}
              <button type="button" className="btn-text admin-change-email" onClick={changeEmail}>
                {UI.adminChangeEmail}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

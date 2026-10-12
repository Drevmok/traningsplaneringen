import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { FEEDBACK_TO, feedbackHref } from '../lib/feedback'

const HREF = feedbackHref()
const HINT = UI.feedbackFallback.split('{email}')

/**
 * Slice 35 — footer «Tyck till»: a real mailto anchor (works in installed PWAs). A tap also shows
 * one quiet line with the address (a browser can't tell whether a mail app opened). Not persisted.
 */
export function FooterFeedback() {
  const [hint, setHint] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () =>
    navigator.clipboard?.writeText(FEEDBACK_TO).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, () => {})

  return (
    <>
      <a href={HREF} className="btn-text visa-tips-igen footer-feedback" aria-label={UI.feedbackLinkAria} onClick={() => setHint(true)}>
        {UI.feedbackLink}
      </a>
      <span className="app-footer-sep" aria-hidden>
        ·
      </span>
      {hint && (
        <p className="footer-feedback-hint">
          {HINT[0]}
          <span>{FEEDBACK_TO}</span>
          {HINT[1]}{' '}
          <button type="button" className="btn-text visa-tips-igen" onClick={copy}>
            {copied ? <span role="status">{UI.feedbackCopied}</span> : UI.feedbackCopy}
          </button>
        </p>
      )}
    </>
  )
}

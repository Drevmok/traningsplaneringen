import { useState, type ReactNode } from 'react'
import { UI } from '../data/blockMeta'
import { FEEDBACK_TO, feedbackHref } from '../lib/feedback'

const HREF = feedbackHref()
const HINT = UI.feedbackFallback.split('{email}')

/**
 * Slice 35 — footer «Tyck till»: a real mailto anchor (works in installed PWAs). A tap also shows
 * one quiet line with the address (a browser can't tell whether a mail app opened). Not persisted.
 */
/** Slice 46 E1: «Tyck till» heads footer row 1; `after` is the rest of that row; the address line is its own row under it. */
export function FooterFeedback({ after }: { after?: ReactNode }) {
  const [hint, setHint] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () =>
    navigator.clipboard?.writeText(FEEDBACK_TO).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, () => {})

  return (
    <>
      <div className="app-footer-row">
        <a href={HREF} className="btn-text visa-tips-igen footer-feedback" aria-label={UI.feedbackLinkAria} onClick={() => setHint(true)}>
          {UI.feedbackLink}
        </a>
        {after}
      </div>
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

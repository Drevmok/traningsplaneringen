import type { ReactNode } from 'react'
import { UI } from '../data/blockMeta'

interface Props {
  tipId: string
  onDismiss: (tipId: string) => void
  className?: string
  /** Emphasize a leading keyword (e.g. Erfaren) */
  leadStrong?: string
  text?: string
  children?: ReactNode
}

/** Dismissible coach tip strip — edit chrome only (use with no-print). */
export function CoachTipStrip({
  tipId,
  onDismiss,
  className = '',
  leadStrong,
  text,
  children,
}: Props) {
  let body: ReactNode = children
  if (text != null) {
    if (leadStrong && text.startsWith(leadStrong)) {
      body = (
        <>
          <strong>{leadStrong}</strong>
          {text.slice(leadStrong.length)}
        </>
      )
    } else if (text.includes('Golvklart')) {
      const idx = text.indexOf('Golvklart')
      body = (
        <>
          {text.slice(0, idx)}
          <strong>Golvklart</strong>
          {text.slice(idx + 'Golvklart'.length)}
        </>
      )
    } else {
      body = text
    }
  }

  return (
    <div
      className={`coach-tip-strip no-print ${className}`.trim()}
      role="note"
      data-tip-id={tipId}
    >
      <p className="coach-tip-strip-body">{body}</p>
      <button
        type="button"
        className="coach-tip-strip-dismiss"
        aria-label={UI.tipDismissAria}
        onClick={() => onDismiss(tipId)}
      >
        <span aria-hidden>×</span>
        <span className="coach-tip-strip-dismiss-label">{UI.tipDismiss}</span>
      </button>
    </div>
  )
}

import { sourceAriaText, sourceLineText } from '../data/blockMeta'
import { formatSourceTime, sanitizeSource } from '../lib/source'
import type { ActivitySource } from '../types'

/** F1 — quiet credit line. Link out only: no embed, no thumbnail, no fetch. */
export function SourceLine({ source }: { source?: ActivitySource }) {
  const safe = sanitizeSource(source)
  if (!safe) return null
  const time =
    safe.startSeconds !== undefined ? formatSourceTime(safe.startSeconds) : undefined
  return (
    <p className="source-line">
      <a
        href={safe.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={sourceAriaText(safe.creator, safe.title)}
      >
        {sourceLineText(safe.creator, time)}
        <span aria-hidden="true"> ↗</span>
      </a>
    </p>
  )
}

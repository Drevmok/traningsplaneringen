import { useEffect, useRef, useState } from 'react'
import { UI } from '../data/blockMeta'
import { floorTip, validateActivityTip } from '../data/activityTips'
import type { Activity } from '../types'

interface Props {
  activity: Activity
  onOpen?: () => void
  /** Icon-only toggle, used on the pass list. */
  compact?: boolean
}

const WIDE = '(min-width: 769px)'

/** Scannable floor card: why, how, watch, safety. Folded on a phone. */
export function ActivityTip({ activity, onOpen, compact = false }: Props) {
  const tip = floorTip(activity)
  const issues = validateActivityTip(activity)
  const foldRef = useRef<HTMLDetailsElement>(null)
  const [tipOpen, setTipOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(WIDE).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    function apply() {
      const fold = foldRef.current
      if (!fold) return
      if (mq.matches) {
        fold.open = true
        setTipOpen(true)
      }
    }
    apply()
    mq.addEventListener('change', apply)
    function openForPrint() {
      if (foldRef.current) foldRef.current.open = true
    }
    window.addEventListener('beforeprint', openForPrint)
    return () => {
      mq.removeEventListener('change', apply)
      window.removeEventListener('beforeprint', openForPrint)
    }
  }, [])

  return (
    <div className="activity-tip-slot">
      {issues.length > 0 && (
        <p className="activity-tip-invalid" role="alert">
          {UI.tipIncomplete} {issues.map((issue) => issue.message).join(' ')}
        </p>
      )}
      <details
        className="activity-tip-fold"
        ref={foldRef}
        onToggle={(e) => setTipOpen(e.currentTarget.open)}
      >
        <summary
          className="activity-tip-toggle"
          aria-label={
            compact
              ? tipOpen
                ? UI.hideDescription
                : UI.seeDescription
              : undefined
          }
        >
          {compact ? (
            <svg
              className="activity-tip-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="7.5" r="1.15" fill="currentColor" />
            </svg>
          ) : null}
          <span className={compact ? 'visually-hidden activity-tip-when-closed' : 'activity-tip-when-closed'}>
            {UI.seeDescription}
          </span>
          <span className={compact ? 'visually-hidden activity-tip-when-open' : 'activity-tip-when-open'}>
            {UI.hideDescription}
          </span>
        </summary>
        <div className="activity-tip">
          <p className="activity-tip-why">{tip.why}</p>
          {tip.steps.length > 0 && (
            <ol className="activity-tip-steps">
              {tip.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {tip.watchFor && (
            <p className="activity-tip-line">
              <span className="activity-tip-label">{UI.watchFor}. </span>
              {tip.watchFor}
            </p>
          )}
          {tip.safety && (
            <p className="activity-tip-line activity-tip-safety">
              <span className="activity-tip-label">{UI.safety}. </span>
              {tip.safety}
            </p>
          )}
          {onOpen && (
            <button
              type="button"
              className="item-tip-more"
              onClick={(e) => {
                e.stopPropagation()
                onOpen()
              }}
            >
              {UI.openExercise}
            </button>
          )}
        </div>
      </details>
    </div>
  )
}

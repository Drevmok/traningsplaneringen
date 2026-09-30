import { useEffect, useRef } from 'react'
import { UI } from '../data/blockMeta'
import { floorTip, validateActivityTip } from '../data/activityTips'
import type { Activity } from '../types'

interface Props {
  activity: Activity
  onOpen?: () => void
}

const WIDE = '(min-width: 769px)'

/** Scannable floor card: why, how, watch, safety. Folded on a phone. */
export function ActivityTip({ activity, onOpen }: Props) {
  const tip = floorTip(activity)
  const issues = validateActivityTip(activity)
  const foldRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    function apply() {
      const fold = foldRef.current
      if (!fold) return
      if (mq.matches) fold.open = true
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
      <details className="activity-tip-fold" ref={foldRef}>
        <summary className="activity-tip-toggle">
          <span className="activity-tip-when-closed">{UI.seeDescription}</span>
          <span className="activity-tip-when-open">{UI.hideDescription}</span>
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

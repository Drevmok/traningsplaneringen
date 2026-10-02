import { useEffect, useRef, useState } from 'react'
import { UI } from '../data/blockMeta'
import { floorTip, validateActivityTip } from '../data/activityTips'
import type { Activity } from '../types'
import { SourceLine } from './SourceLine'

interface Props {
  activity: Activity
  onOpen?: () => void
  /** Icon button beside remove. Minutes live in the opened description. */
  compact?: boolean
  minutes?: number
  onMinutesChange?: (minutes: number) => void
}

const WIDE = '(min-width: 769px)'

function howSteps(howTo: string): string[] {
  return howTo
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean)
}

/** Scannable floor card: why, how, watch, safety. Folded on a phone. */
export function ActivityTip({
  activity,
  onOpen,
  compact = false,
  minutes,
  onMinutesChange,
}: Props) {
  const tip = floorTip(activity)
  const issues = validateActivityTip(activity)
  const foldRef = useRef<HTMLDetailsElement>(null)
  const [tipOpen, setTipOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(WIDE).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    function apply() {
      if (mq.matches) setTipOpen(true)
      const fold = foldRef.current
      if (fold && mq.matches) fold.open = true
    }
    apply()
    mq.addEventListener('change', apply)
    function openForPrint() {
      setTipOpen(true)
      if (foldRef.current) foldRef.current.open = true
    }
    window.addEventListener('beforeprint', openForPrint)
    return () => {
      mq.removeEventListener('change', apply)
      window.removeEventListener('beforeprint', openForPrint)
    }
  }, [])

  const minutesField =
    onMinutesChange != null && minutes != null ? (
      <label className="item-duration">
        <input
          type="number"
          min={1}
          max={180}
          value={minutes}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onMinutesChange(Number(e.target.value))}
        />
        min
      </label>
    ) : null

  const steps = howSteps(activity.howTo)

  const fullBody = (
    <div className="activity-tip">
      {activity.experiencedCoachOnly && (
        <p className="activity-tip-note activity-tip-safety">
          <span className="activity-tip-kicker">{UI.experiencedCoach}</span>
          {UI.experiencedCoachWarning}
        </p>
      )}
      <p className="activity-tip-why">{activity.summary}</p>
      {steps.length > 0 && (
        <div className="activity-tip-block">
          <p className="activity-tip-kicker">{UI.howTo}</p>
          {steps.length === 1 ? (
            <p className="activity-tip-copy">{steps[0]}</p>
          ) : (
            <ol className="activity-tip-steps">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
      {activity.watchFor && (
        <div className="activity-tip-block">
          <p className="activity-tip-kicker">{UI.watchFor}</p>
          <p className="activity-tip-copy">{activity.watchFor}</p>
        </div>
      )}
      {tip.safety && (
        <div className="activity-tip-block activity-tip-safety">
          <p className="activity-tip-kicker">{UI.safety}</p>
          <p className="activity-tip-copy">{tip.safety}</p>
        </div>
      )}
      {minutesField && <div className="activity-tip-foot">{minutesField}</div>}
      <SourceLine source={activity.source} />
    </div>
  )

  const tipBody = (
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
  )

  if (compact) {
    return (
      <>
        <button
          type="button"
          className="item-info"
          aria-expanded={tipOpen}
          aria-label={tipOpen ? UI.hideDescription : UI.seeDescription}
          onClick={(e) => {
            e.stopPropagation()
            setTipOpen((open) => !open)
          }}
        >
          <svg
            className="activity-tip-icon"
            width="22"
            height="22"
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
        </button>
        <div className="activity-tip-panel" hidden={!tipOpen}>
          {issues.length > 0 && (
            <p className="activity-tip-invalid" role="alert">
              {UI.tipIncomplete}{' '}
              {issues.map((issue) => issue.message).join(' ')}
            </p>
          )}
          {fullBody}
        </div>
      </>
    )
  }

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
        <summary className="activity-tip-toggle">
          <span className="activity-tip-when-closed">{UI.seeDescription}</span>
          <span className="activity-tip-when-open">{UI.hideDescription}</span>
        </summary>
        {tipBody}
      </details>
    </div>
  )
}

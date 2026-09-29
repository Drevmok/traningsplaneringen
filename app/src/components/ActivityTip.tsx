import { UI } from '../data/blockMeta'
import { floorTip, validateActivityTip } from '../data/activityTips'
import type { Activity } from '../types'

interface Props {
  activity: Activity
  onOpen?: () => void
}

/** Scannable floor card: why, how, watch, safety. */
export function ActivityTip({ activity, onOpen }: Props) {
  const tip = floorTip(activity)
  const issues = validateActivityTip(activity)

  return (
    <div className="activity-tip">
      {issues.length > 0 && (
        <p className="activity-tip-invalid" role="alert">
          {UI.tipIncomplete} {issues.map((issue) => issue.message).join(' ')}
        </p>
      )}
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
}

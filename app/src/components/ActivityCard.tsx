import { UI } from '../data/blockMeta'
import { validateActivityTip } from '../data/activityTips'
import { VisualIcon } from '../icons'
import type { Activity } from '../types'

interface Props {
  activity: Activity
  onSelect: (activity: Activity) => void
}

export function ActivityCard({ activity, onSelect }: Props) {
  return (
    <button
      type="button"
      className="activity-card"
      onClick={() => onSelect(activity)}
    >
      <VisualIcon
        visualKey={activity.visualKey}
        blockType={activity.blockType}
        size="card"
        className="activity-visual"
      />
      <span className="activity-card-body">
        <span className="activity-title">
          {activity.title}
          {activity.own && <span className="own-badge">{UI.ownBadge}</span>}
          {activity.own && activity.needsCoachReview && (
            <span className="review-badge">{UI.ownNeedsReview}</span>
          )}
          {activity.stub && <span className="stub-badge">{UI.stub}</span>}
          {activity.experiencedCoachOnly && (
            <span className="experienced-badge">{UI.experiencedCoach}</span>
          )}
          {validateActivityTip(activity).length > 0 && (
            <span className="tip-invalid-badge">{UI.tipIncomplete}</span>
          )}
        </span>
        <span className="activity-duration">
          {activity.durationMinutesDefault} min
        </span>
        <span className="activity-cue">{activity.summary}</span>
      </span>
    </button>
  )
}

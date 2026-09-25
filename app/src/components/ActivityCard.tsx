import { UI } from '../data/blockMeta'
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
          {activity.stub && <span className="stub-badge">{UI.stub}</span>}
          {activity.experiencedCoachOnly && (
            <span className="experienced-badge">{UI.experiencedCoach}</span>
          )}
        </span>
        <span className="activity-duration">
          {activity.durationMinutesDefault} min
        </span>
      </span>
    </button>
  )
}

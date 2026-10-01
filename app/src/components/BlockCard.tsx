import {
  BLOCK_LABELS,
  EMPTY_TIPS,
  UI,
} from '../data/blockMeta'
import { getActivityById } from '../data/seedActivities'
import { BLOCK_ICON_IDS, VisualIcon } from '../icons'
import type { MismatchWarning, SessionBlock } from '../types'
import { MismatchBanner } from './MismatchBanner'
import { ActivityTip } from './ActivityTip'

interface Props {
  block: SessionBlock
  mismatch?: MismatchWarning
  onAdd: () => void
  onBrowse: () => void
  onDismissMismatch: () => void
  onRemoveItem: (itemId: string) => void
  onDurationChange: (itemId: string, minutes: number) => void
}

export function BlockCard({
  block,
  mismatch,
  onAdd,
  onBrowse,
  onDismissMismatch,
  onRemoveItem,
  onDurationChange,
}: Props) {
  const empty = block.items.length === 0
  const tip = EMPTY_TIPS[block.type]

  return (
    <article className="block-card">
      <header className="block-header">
        <VisualIcon
          iconId={BLOCK_ICON_IDS[block.type]}
          size="block"
          neutral
          className="block-icon"
        />
        <h3>{BLOCK_LABELS[block.type]}</h3>
      </header>

      {mismatch && mismatch.blockId === block.id && (
        <MismatchBanner warning={mismatch} onDismiss={onDismissMismatch} />
      )}

      {empty ? (
        <div className="block-empty">
          <p className="empty-tip">{tip.tip}</p>
          <p className="empty-cta-label">{tip.addLabel}</p>
          <div className="empty-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
            >
              {UI.addActivity}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={(e) => {
                e.stopPropagation()
                onBrowse()
              }}
            >
              {UI.browseIdeas}
            </button>
          </div>
        </div>
      ) : (
        <ul className="block-items">
          {[...block.items]
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const activity = getActivityById(item.activityId)
              return (
                <li key={item.id} className="session-item">
                  <div className="session-item-main">
                  <VisualIcon
                    visualKey={activity?.visualKey}
                    size="item"
                    neutral
                    className="item-visual"
                  />
                  <div className="item-body">
                    <span className="item-title">
                      {activity?.title ?? item.activityId}
                      {activity?.own && (
                        <span className="own-badge">{UI.ownBadge}</span>
                      )}
                      {activity?.stub && (
                        <span className="stub-badge">{UI.stub}</span>
                      )}
                    </span>
                  </div>
                  <div
                    className="item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activity && (
                      <ActivityTip
                        compact
                        activity={activity}
                        minutes={item.durationMinutes}
                        onMinutesChange={(minutes) =>
                          onDurationChange(item.id, minutes)
                        }
                      />
                    )}
                    <button
                      type="button"
                      className="item-remove"
                      title={UI.remove}
                      onClick={() => onRemoveItem(item.id)}
                    >
                      ×
                    </button>
                  </div>
                  </div>
                </li>
              )
            })}
        </ul>
      )}

      {!empty && (
        <button
          type="button"
          className="btn-add-inline"
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
        >
          + {UI.addActivity}
        </button>
      )}
    </article>
  )
}

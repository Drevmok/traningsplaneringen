import type { CSSProperties } from 'react'
import {
  BLOCK_COLORS,
  BLOCK_LABELS,
  EMPTY_TIPS,
  UI,
} from '../data/blockMeta'
import { getActivityById } from '../data/seedActivities'
import { BLOCK_ICON_IDS, VisualIcon } from '../icons'
import { blockFilledMinutes } from '../lib/session'
import type { MismatchWarning, SessionBlock, Activity } from '../types'
import { MismatchBanner } from './MismatchBanner'
import { ActivityTip } from './ActivityTip'

interface Props {
  block: SessionBlock
  selected: boolean
  mismatch?: MismatchWarning
  onSelect: () => void
  onAdd: () => void
  onBrowse: () => void
  onDismissMismatch: () => void
  onRemoveItem: (itemId: string) => void
  onDurationChange: (itemId: string, minutes: number) => void
  onOpenActivity: (activity: Activity) => void
}

export function BlockCard({
  block,
  selected,
  mismatch,
  onSelect,
  onAdd,
  onBrowse,
  onDismissMismatch,
  onRemoveItem,
  onDurationChange,
  onOpenActivity,
}: Props) {
  const colors = BLOCK_COLORS[block.type]
  const filled = blockFilledMinutes(block)
  const over = filled > block.durationMinutes
  const empty = block.items.length === 0
  const tip = EMPTY_TIPS[block.type]

  return (
    <article
      className={`block-card${selected ? ' selected' : ''}${over ? ' overflow' : ''}`}
      style={
        {
          '--block-bg': colors.bg,
          '--block-border': colors.border,
          '--block-text': colors.text,
        } as CSSProperties
      }
      onClick={onSelect}
    >
      <header className="block-header">
        <VisualIcon
          iconId={BLOCK_ICON_IDS[block.type]}
          blockType={block.type}
          size="block"
          className="block-icon"
        />
        <h3>{BLOCK_LABELS[block.type]}</h3>
        {!empty && (
          <span className={`block-budget${over ? ' over' : ''}`}>
            {filled} / {block.durationMinutes} min
            {over && <span className="overflow-tag"> · {UI.overflow}</span>}
          </span>
        )}
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
                    blockType={activity?.blockType}
                    size="item"
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
                        onOpen={() => onOpenActivity(activity)}
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

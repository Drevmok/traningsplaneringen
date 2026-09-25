import type { CSSProperties } from 'react'
import {
  BLOCK_COLORS,
  BLOCK_LABELS,
  BLOCK_ORDER,
  EMPTY_TIPS,
  UI,
} from '../data/blockMeta'
import { getActivityById } from '../data/seedActivities'
import { BLOCK_ICON_IDS, VisualIcon } from '../icons'
import { blockFilledMinutes } from '../lib/session'
import type { BlockType, MismatchWarning, SessionBlock } from '../types'
import { MismatchBanner } from './MismatchBanner'

interface Props {
  block: SessionBlock
  selected: boolean
  mismatch?: MismatchWarning
  onSelect: () => void
  onAdd: () => void
  onBrowse: () => void
  onDismissMismatch: () => void
  onRemoveItem: (itemId: string) => void
  onMoveItem: (itemId: string, direction: 'up' | 'down') => void
  onMoveItemToBlock: (itemId: string, toBlockType: BlockType) => void
  onDurationChange: (itemId: string, minutes: number) => void
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
  onMoveItem,
  onMoveItemToBlock,
  onDurationChange,
}: Props) {
  const colors = BLOCK_COLORS[block.type]
  const filled = blockFilledMinutes(block)
  const over = filled > block.durationMinutes
  const empty = block.items.length === 0
  const tip = EMPTY_TIPS[block.type]
  const otherBlocks = BLOCK_ORDER.filter((t) => t !== block.type)

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
        <span className={`block-budget${over ? ' over' : ''}`}>
          {filled} / {block.durationMinutes} min
          {over && <span className="overflow-tag"> · {UI.overflow}</span>}
        </span>
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
            .map((item, idx) => {
              const activity = getActivityById(item.activityId)
              return (
                <li key={item.id} className="session-item">
                  <VisualIcon
                    visualKey={activity?.visualKey}
                    blockType={activity?.blockType}
                    size="item"
                    className="item-visual"
                  />
                  <div className="item-body">
                    <span className="item-title">
                      {activity?.title ?? item.activityId}
                      {activity?.stub && (
                        <span className="stub-badge">{UI.stub}</span>
                      )}
                    </span>
                    <label className="item-duration">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={item.durationMinutes}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onDurationChange(item.id, Number(e.target.value))
                        }
                      />
                      min
                    </label>
                  </div>
                  <div
                    className="item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title={UI.moveUp}
                      disabled={idx === 0}
                      onClick={() => onMoveItem(item.id, 'up')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title={UI.moveDown}
                      disabled={idx === block.items.length - 1}
                      onClick={() => onMoveItem(item.id, 'down')}
                    >
                      ↓
                    </button>
                    <select
                      aria-label={UI.moveTo}
                      defaultValue=""
                      onChange={(e) => {
                        const t = e.target.value as BlockType
                        if (t) onMoveItemToBlock(item.id, t)
                        e.target.value = ''
                      }}
                    >
                      <option value="" disabled>
                        {UI.moveTo}…
                      </option>
                      {otherBlocks.map((t) => (
                        <option key={t} value={t}>
                          {BLOCK_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="danger"
                      title={UI.remove}
                      onClick={() => onRemoveItem(item.id)}
                    >
                      ×
                    </button>
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

import { useRef, type DragEvent } from 'react'
import {
  hallTileA11yText,
  stationEquipmentLabelText,
  BLOCK_COLORS,
  UI,
} from '../data/blockMeta'
import {
  getEquipmentPiece,
  STATION_EQUIPMENT_MAX_SLOTS,
} from '../data/equipmentPieces'
import { getActivityById } from '../data/seedActivities'
import { VisualIcon } from '../icons'
import type { SessionItem } from '../types'

export const HALL_CHIP_MIME = 'application/x-gp-hall-item'

interface Props {
  item: SessionItem
  /** tray | canvas */
  variant?: 'tray' | 'canvas'
  selected?: boolean
  draggable?: boolean
  /** 1…N among placed only — canvas chips; omit for tray */
  stationRank?: number
  onDragStart?: (e: DragEvent, itemId: string) => void
  onDragEnd?: () => void
  onClick?: (itemId: string) => void
  onRemove?: (itemId: string) => void
  showRemove?: boolean
}

/**
 * Slice 12: canvas = icon-first station marker; tray stays readable.
 * Drag vs tap: HTML5 dragstart sets a suppress flag so the synthetic
 * click after dragend does not open station detail.
 */
export function HallChip({
  item,
  variant = 'tray',
  selected = false,
  draggable = true,
  stationRank,
  onDragStart,
  onDragEnd,
  onClick,
  onRemove,
  showRemove = false,
}: Props) {
  const activity = getActivityById(item.activityId)
  const missing = !activity
  const title = activity?.title ?? UI.hallMissingActivity
  const blockType = activity?.blockType
  const colors = blockType
    ? BLOCK_COLORS[blockType]
    : {
        bg: '#f1f5f9',
        border: '#cbd5e1',
        text: '#64748b',
      }
  const experienced = Boolean(activity?.experiencedCoachOnly)
  const isCanvas = variant === 'canvas'
  const hasEquipment =
    Array.isArray(item.stationEquipment) && item.stationEquipment.length > 0

  /** Slice 14 — resolved under-markör lines (ignore unknown ids; soft cap 8). */
  const equipmentLines =
    isCanvas && hasEquipment
      ? item.stationEquipment!
          .slice(0, STATION_EQUIPMENT_MAX_SLOTS)
          .flatMap((slot) => {
            const piece = getEquipmentPiece(slot.pieceId)
            if (!piece) return []
            return [
              {
                pieceId: slot.pieceId,
                text: stationEquipmentLabelText(piece.labelSv, slot.count),
              },
            ]
          })
      : []

  const suppressClickRef = useRef(false)

  const a11yName = isCanvas
    ? hallTileA11yText(title, {
        rank: stationRank,
        experienced,
        hasEquipment,
      })
    : experienced
      ? `${typeof stationRank === 'number' ? `${stationRank}. ${title}` : title}, ${UI.experiencedCoach}`
      : typeof stationRank === 'number'
        ? `${stationRank}. ${title}`
        : title

  function handleActivate() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    onClick?.(item.id)
  }

  return (
    <div
      className={`hall-chip hall-chip--${variant}${selected ? ' is-selected' : ''}${missing ? ' is-missing' : ''}${!draggable ? ' is-readonly' : ''}${experienced && isCanvas ? ' has-erfaren' : ''}`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) {
          e.preventDefault()
          return
        }
        // Any real drag must not open detail when the browser fires click after drop.
        suppressClickRef.current = true
        e.dataTransfer.setData(HALL_CHIP_MIME, item.id)
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.(e, item.id)
      }}
      onDragEnd={() => {
        onDragEnd?.()
        // If no click follows (cancelled drag), clear leftover suppress.
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 120)
      }}
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      aria-label={a11yName}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          suppressClickRef.current = false
          onClick?.(item.id)
        }
      }}
    >
      {typeof stationRank === 'number' && (
        <span className="hall-chip-rank" aria-hidden>
          {stationRank}
        </span>
      )}
      <VisualIcon
        visualKey={activity?.visualKey}
        blockType={blockType}
        size={isCanvas ? 'marker' : 'block'}
        className="hall-chip-icon"
      />
      {isCanvas ? (
        <>
          {/* Edit canvas: hidden; Golvklart (.is-floor) + print CSS show short title (Slice 17) */}
          <span className="hall-chip-title hall-chip-title--print" aria-hidden>
            {title}
          </span>
          {experienced && (
            <span
              className="hall-chip-exp hall-chip-exp--mark"
              title={UI.experiencedCoach}
              aria-hidden
            >
              {UI.hallExperiencedShort}
            </span>
          )}
          {/* Slice 14: under-markör redskap — CSS shows only on Golvklart + print */}
          {equipmentLines.length > 0 && (
            <div className="hall-chip-equipment" aria-hidden>
              {equipmentLines.map((line) => (
                <span
                  key={line.pieceId}
                  className="hall-chip-equipment-line"
                >
                  {line.text}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="hall-chip-body">
          <span className="hall-chip-title">{title}</span>
          <span className="hall-chip-meta">
            {item.durationMinutes} min
            {experienced && (
              <span className="hall-chip-exp" title={UI.experiencedCoach}>
                {UI.hallExperiencedShort}
              </span>
            )}
          </span>
        </div>
      )}
      {showRemove && onRemove && (
        <button
          type="button"
          className="hall-chip-remove"
          title={UI.hallRemove}
          aria-label={UI.hallRemove}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

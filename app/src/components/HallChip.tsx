import type { PointerEvent as ReactPointerEvent } from 'react'
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

interface Props {
  item: SessionItem
  /** tray | canvas */
  variant?: 'tray' | 'canvas'
  selected?: boolean
  /** Slice 48 C1 — false on Golvklart / share / print (read-only marker). */
  movable?: boolean
  /** Lifted while a pointer drag moves it. */
  dragging?: boolean
  /** 1…N among placed only — canvas chips; omit for tray */
  stationRank?: number
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>, itemId: string) => void
  onClick?: (itemId: string) => void
  onRemove?: (itemId: string) => void
  showRemove?: boolean
}

/**
 * Slice 12: canvas = icon-first station marker; tray stays readable.
 * Slice 48 C1: drag is Pointer Events (lib/pointerDrag via onPointerDown); a tap without
 * movement still clicks and opens station detail.
 */
export function HallChip({
  item,
  variant = 'tray',
  selected = false,
  movable = true,
  dragging = false,
  stationRank,
  onPointerDown,
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

  return (
    <div
      className={`hall-chip hall-chip--${variant}${selected ? ' is-selected' : ''}${missing ? ' is-missing' : ''}${!movable ? ' is-readonly' : ''}${dragging ? ' is-dragging' : ''}${experienced && isCanvas ? ' has-erfaren' : ''}`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      onPointerDown={
        movable && onPointerDown ? (e) => onPointerDown(e, item.id) : undefined
      }
      onClick={() => onClick?.(item.id)}
      role="button"
      tabIndex={0}
      aria-label={a11yName}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
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
          onPointerDown={(e) => {
            e.stopPropagation()
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  hallStationDownAria,
  hallStationRemoveAria,
  hallStationUpAria,
  UI,
} from '../data/blockMeta'
import { getActivityById } from '../data/seedActivities'
import { placeableItems, stationRanks } from '../lib/hall'
import { dropIndex, startPointerDrag } from '../lib/pointerDrag'
import type { Session } from '../types'

interface Props {
  session: Session
  /** Move to an insertion slot among the other stations (0..n−1). */
  onMoveTo: (itemId: string, slot: number) => void
  onRemove: (itemId: string) => void
  onAdd: () => void
  onDone: () => void
  /** Row to focus after add / move (focuses its handle-less title row button). */
  focusId?: string | null
  /** aria-live text after a move. */
  liveText?: string
}

/** Slice 48 B1 — «Stationer i ordning»: one row per Teknik station, in Teknik-block order (D1). */
export function HallStationList({
  session,
  onMoveTo,
  onRemove,
  onAdd,
  onDone,
  focusId,
  liveText,
}: Props) {
  const items = placeableItems(session)
  const ranks = stationRanks(session)
  const listRef = useRef<HTMLOListElement | null>(null)
  const [drag, setDrag] = useState<{ id: string; slot: number } | null>(null)

  useEffect(() => {
    if (!focusId) return
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-item-id="${focusId}"] .hall-station-focus`,
    )
    row?.focus()
  }, [focusId])

  function slotAt(id: string, y: number): number {
    const rows = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('.hall-station-row') ?? [],
    ).filter((row) => row.dataset.itemId !== id)
    const mids = rows.map((row) => {
      const r = row.getBoundingClientRect()
      return r.top + r.height / 2
    })
    return dropIndex(y, mids)
  }

  const others = drag ? items.filter((it) => it.id !== drag.id) : []
  const targetId = drag ? (others[drag.slot]?.id ?? null) : null
  const afterLast = Boolean(drag && drag.slot >= others.length)
  const lastOtherId = others[others.length - 1]?.id

  return (
    <section
      className="hall-station-list no-print"
      aria-labelledby="hall-station-list-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !drag) {
          e.preventDefault()
          onDone()
        }
      }}
    >
      <h2 id="hall-station-list-title" className="hall-station-list-title">
        {UI.hallStationsTitle}
      </h2>
      <ol ref={listRef} className="hall-station-rows">
        {items.map((item, index) => {
          const title = getActivityById(item.activityId)?.title ?? UI.hallMissingActivity
          const rank = ranks.get(item.id)
          const isTarget =
            (targetId === item.id && !afterLast) ||
            (afterLast && lastOtherId === item.id)
          return (
            <li
              key={item.id}
              data-item-id={item.id}
              className={`hall-station-row${drag?.id === item.id ? ' is-dragging' : ''}${
                isTarget ? ' is-drop-target' : ''
              }${isTarget && afterLast ? ' is-drop-after' : ''}`}
            >
              <span
                className="hall-station-handle"
                aria-hidden="true"
                title={UI.hallStationDragAria}
                onPointerDown={(e) => {
                  const id = item.id
                  startPointerDrag(e, {
                    onStart: () => setDrag({ id, slot: slotAt(id, e.clientY) }),
                    onMove: (ev) => setDrag({ id, slot: slotAt(id, ev.clientY) }),
                    onDrop: (ev) => {
                      setDrag(null)
                      onMoveTo(id, slotAt(id, ev.clientY))
                    },
                    onCancel: () => setDrag(null),
                  })
                }}
              >
                ⋮⋮
              </span>
              <span className="hall-station-rank" aria-hidden="true">
                {rank ?? '–'}
              </span>
              <span className="hall-station-focus hall-station-name" tabIndex={-1}>
                {title}
              </span>
              <button
                type="button"
                className="btn-secondary hall-tap-target hall-station-move"
                aria-label={hallStationUpAria(title)}
                disabled={index === 0}
                onClick={() => onMoveTo(item.id, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn-secondary hall-tap-target hall-station-move"
                aria-label={hallStationDownAria(title)}
                disabled={index === items.length - 1}
                onClick={() => onMoveTo(item.id, index + 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn-secondary hall-tap-target hall-station-remove"
                aria-label={hallStationRemoveAria(title)}
                onClick={() => onRemove(item.id)}
              >
                {UI.hallStationRemove}
              </button>
            </li>
          )
        })}
      </ol>
      <button
        type="button"
        className="btn-secondary hall-tap-target hall-station-add"
        onClick={onAdd}
      >
        {UI.hallStationAdd}
      </button>
      <p className="sr-only" aria-live="polite">
        {liveText ?? ''}
      </p>
    </section>
  )
}

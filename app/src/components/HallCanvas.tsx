import { useEffect, useRef, type DragEvent, type MouseEvent } from 'react'
import { UI } from '../data/blockMeta'
import {
  flowSegments,
  getPlacedItems,
  getPreset,
  roundHallZoom,
  stationRanks,
  touchDistance,
} from '../lib/hall'
import type { Session } from '../types'
import { HallChip, HALL_CHIP_MIME } from './HallChip'

export type HallMode = 'edit' | 'floor'

interface Props {
  session: Session
  hallMode: HallMode
  placeModeItemId: string | null
  selectedItemId: string | null
  viewZoom: number
  /** Slice 21 A1 — pinch updates viewZoom (parent clamps / persists view only). */
  onViewZoomChange?: (zoom: number) => void
  onPlaceAt: (sessionItemId: string, x: number, y: number) => void
  onChipClick: (itemId: string) => void
  onRemovePlacement: (itemId: string) => void
  onDragOverCanvas: (e: DragEvent) => void
  draggingId: string | null
  setDraggingId: (id: string | null) => void
  allUnplaced: boolean
}

function clientToNormalized(
  e: { clientX: number; clientY: number },
  el: HTMLElement,
): { x: number; y: number } {
  const rect = el.getBoundingClientRect()
  const x = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5
  const y = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5
  return { x, y }
}

interface PinchState {
  initialDistance: number
  initialZoom: number
}

export function HallCanvas({
  session,
  hallMode,
  placeModeItemId,
  selectedItemId,
  viewZoom,
  onViewZoomChange,
  onPlaceAt,
  onChipClick,
  onRemovePlacement,
  onDragOverCanvas,
  draggingId,
  setDraggingId,
  allUnplaced,
}: Props) {
  const placed = getPlacedItems(session)
  const preset = getPreset(session.hallTemplateId)
  const ranks = stationRanks(session)
  const segments = flowSegments(session)
  const isFloor = hallMode === 'floor'
  const editPlaceMode = !isFloor && placeModeItemId

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const viewZoomRef = useRef(viewZoom)
  const pinchRef = useRef<PinchState | null>(null)

  viewZoomRef.current = viewZoom

  // Slice 21 A1/C1 — two-finger pinch → viewZoom; one-finger empty uses wrap overflow pan.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !onViewZoomChange) return
    const setZoom: (zoom: number) => void = onViewZoomChange

    function beginPinch(touches: TouchList) {
      if (touches.length < 2) return
      const a = touches.item(0)
      const b = touches.item(1)
      if (!a || !b) return
      const dist = touchDistance(a, b)
      if (dist <= 0) return
      pinchRef.current = {
        initialDistance: dist,
        initialZoom: viewZoomRef.current,
      }
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        beginPinch(e.touches)
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length < 2 || !pinchRef.current) return
      const a = e.touches.item(0)
      const b = e.touches.item(1)
      if (!a || !b) return
      const dist = touchDistance(a, b)
      if (dist <= 0 || pinchRef.current.initialDistance <= 0) return
      // Block browser page-zoom while we own the pinch; single-finger pan stays native.
      e.preventDefault()
      const scale = dist / pinchRef.current.initialDistance
      const next = roundHallZoom(pinchRef.current.initialZoom * scale)
      if (next !== viewZoomRef.current) {
        setZoom(next)
      }
    }

    function endPinchIfNeeded(e: TouchEvent) {
      if (e.touches.length < 2) {
        pinchRef.current = null
      }
    }

    wrap.addEventListener('touchstart', onTouchStart, { passive: true })
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })
    wrap.addEventListener('touchend', endPinchIfNeeded)
    wrap.addEventListener('touchcancel', endPinchIfNeeded)

    return () => {
      wrap.removeEventListener('touchstart', onTouchStart)
      wrap.removeEventListener('touchmove', onTouchMove)
      wrap.removeEventListener('touchend', endPinchIfNeeded)
      wrap.removeEventListener('touchcancel', endPinchIfNeeded)
      pinchRef.current = null
    }
  }, [onViewZoomChange])

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (isFloor) return
    e.preventDefault()
    const id =
      e.dataTransfer.getData(HALL_CHIP_MIME) ||
      e.dataTransfer.getData('text/plain')
    if (!id) return
    const { x, y } = clientToNormalized(e, e.currentTarget)
    onPlaceAt(id, x, y)
    setDraggingId(null)
  }

  function handleCanvasClick(e: MouseEvent<HTMLDivElement>) {
    if (isFloor || !placeModeItemId) return
    if ((e.target as HTMLElement).closest('.hall-chip')) return
    const { x, y } = clientToNormalized(e, e.currentTarget)
    onPlaceAt(placeModeItemId, x, y)
  }

  return (
    <div className="hall-canvas-wrap" ref={wrapRef}>
      <div
        className="hall-canvas-zoom"
        style={{
          width: `${viewZoom * 100}%`,
          minWidth: '100%',
        }}
      >
        <div
          className={`hall-canvas${editPlaceMode ? ' is-place-mode' : ''}${isFloor ? ' is-floor' : ''}`}
          onDragOver={(e) => {
            if (isFloor) return
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            onDragOverCanvas(e)
          }}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
          role="application"
          aria-label={UI.hallOverview}
        >
          <div className="hall-floor" aria-hidden>
            {preset.zones.map((zone) => {
              const b = zone.bbox
              return (
                <div
                  key={zone.id}
                  className={`hall-zone hall-zone--${zone.id}`}
                  style={{
                    left: `${b.x * 100}%`,
                    top: `${b.y * 100}%`,
                    width: `${b.w * 100}%`,
                    height: `${b.h * 100}%`,
                  }}
                >
                  {zone.id === 'mattberg' && (
                    <svg
                      className="hall-zone-mattberg-cue"
                      viewBox="0 0 64 40"
                      aria-hidden
                    >
                      <path
                        d="M4 34 L18 18 L28 26 L40 12 L60 34 Z"
                        fill="rgba(148,163,184,0.35)"
                        stroke="rgba(100,116,139,0.55)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 34 L22 22 L32 28 L44 16 L56 34 Z"
                        fill="rgba(226,232,240,0.45)"
                        stroke="none"
                      />
                    </svg>
                  )}
                  <span className="hall-zone-label">{zone.label}</span>
                </div>
              )
            })}
          </div>

          {segments.length > 0 && (
            <svg
              className="hall-flow-layer"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {segments.map((seg) => (
                <line
                  key={`${seg.fromId}-${seg.toId}`}
                  x1={seg.x1 * 100}
                  y1={seg.y1 * 100}
                  x2={seg.x2 * 100}
                  y2={seg.y2 * 100}
                  className="hall-flow-line"
                />
              ))}
            </svg>
          )}

          <p className="hall-schematic-note">{UI.hallSchematicNote}</p>

          {!isFloor && allUnplaced && (
            <div className="hall-drop-hint" aria-hidden>
              <p>{UI.hallDropHintStations}</p>
              <p className="hall-coach-tip">{UI.hallCoachTip}</p>
            </div>
          )}

          {placed.map(({ item, placement }) => (
            <div
              key={item.id}
              className="hall-chip-anchor"
              style={{
                left: `${placement.x * 100}%`,
                top: `${placement.y * 100}%`,
                opacity: draggingId === item.id ? 0.45 : 1,
              }}
            >
              <HallChip
                item={item}
                variant="canvas"
                selected={!isFloor && selectedItemId === item.id}
                stationRank={ranks.get(item.id)}
                draggable={!isFloor}
                onDragStart={
                  isFloor ? undefined : (_e, id) => setDraggingId(id)
                }
                onDragEnd={isFloor ? undefined : () => setDraggingId(null)}
                onClick={onChipClick}
                onRemove={isFloor ? undefined : onRemovePlacement}
                showRemove={!isFloor}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

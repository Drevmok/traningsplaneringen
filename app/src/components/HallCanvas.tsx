import {
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { UI } from '../data/blockMeta'
import {
  clientToNormalized,
  flowSegments,
  getPlacedItems,
  getPreset,
  roundHallZoom,
  stationRanks,
  touchDistance,
} from '../lib/hall'
import type { Session } from '../types'
import { HallChip } from './HallChip'

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
  /** Slice 48 C1 — pointer drag of a placed marker (edit mode only). */
  onChipPointerDown?: (
    e: ReactPointerEvent<HTMLDivElement>,
    itemId: string,
  ) => void
  /** Live position of the marker being dragged (normalized 0..1). */
  dragPreview?: { id: string; x: number; y: number } | null
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
  onChipPointerDown,
  dragPreview = null,
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

  const zoomCb = useRef(onViewZoomChange)

  viewZoomRef.current = viewZoom

  useEffect(() => {
    zoomCb.current = onViewZoomChange
  })

  // Slice 21 A1/C1 — two-finger pinch → viewZoom; one-finger empty uses wrap overflow pan.
  // Slice 48 F1 — one stable listener ([] deps, callback via ref): a re-render mid-pinch no longer
  // drops pinchRef, so iOS never takes the gesture over and zooms the page.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

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
        zoomCb.current?.(next)
      }
    }

    function endPinchIfNeeded(e: TouchEvent) {
      if (e.touches.length < 2) {
        pinchRef.current = null
      }
    }

    // Safari-only gesture* events: never let them zoom the page over the hall.
    function blockGesture(e: Event) {
      e.preventDefault()
    }

    wrap.addEventListener('touchstart', onTouchStart, { passive: true })
    wrap.addEventListener('gesturestart', blockGesture, { passive: false })
    wrap.addEventListener('gesturechange', blockGesture, { passive: false })
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })
    wrap.addEventListener('touchend', endPinchIfNeeded)
    wrap.addEventListener('touchcancel', endPinchIfNeeded)

    return () => {
      wrap.removeEventListener('touchstart', onTouchStart)
      wrap.removeEventListener('touchmove', onTouchMove)
      wrap.removeEventListener('touchend', endPinchIfNeeded)
      wrap.removeEventListener('touchcancel', endPinchIfNeeded)
      wrap.removeEventListener('gesturestart', blockGesture)
      wrap.removeEventListener('gesturechange', blockGesture)
    }
  }, [])

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
          className={`hall-canvas${preset.plan ? ' hall-canvas--plan hall-canvas--' + preset.id : ''}${editPlaceMode ? ' is-place-mode' : ''}${isFloor ? ' is-floor' : ''}`}
          onClick={handleCanvasClick}
          role="application"
          aria-label={UI.hallOverview}
        >
          {preset.plan ? (
            <div className="hall-plan-layer" aria-hidden>
              {preset.plan.map((shape, index) =>
                shape.kind === 'poly' && shape.d ? (
                  <svg
                    key={`${shape.kind}-${index}`}
                    className="hall-plan hall-plan--poly"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path d={shape.d} />
                  </svg>
                ) : (
                  <div
                    key={`${shape.kind}-${index}`}
                    className={`hall-plan hall-plan--${shape.kind}`}
                    style={{
                      left: `${shape.x * 100}%`,
                      top: `${shape.y * 100}%`,
                      width: `${shape.w * 100}%`,
                      height: `${shape.h * 100}%`,
                    }}
                  />
                ),
              )}
            </div>
          ) : (
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
          )}

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

          <div className="hall-chip-layer">
          {placed.map(({ item, placement }) => {
            const live = dragPreview?.id === item.id ? dragPreview : null
            return (
            <div
              key={item.id}
              className={`hall-chip-anchor${live ? ' is-dragging' : ''}`}
              style={{
                left: `${(live ?? placement).x * 100}%`,
                top: `${(live ?? placement).y * 100}%`,
              }}
            >
              <HallChip
                item={item}
                variant="canvas"
                selected={!isFloor && selectedItemId === item.id}
                stationRank={ranks.get(item.id)}
                movable={!isFloor}
                dragging={Boolean(live)}
                onPointerDown={isFloor ? undefined : onChipPointerDown}
                onClick={onChipClick}
                onRemove={isFloor ? undefined : onRemovePlacement}
                showRemove={!isFloor}
              />
            </div>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}

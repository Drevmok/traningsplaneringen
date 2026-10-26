import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  hallApplyAllSuggestedResultText,
  hallSaknarRedskapBannerText,
  hallStationCountText,
  hallUnplacedBannerText,
  hallUnplacedWithCountText,
  hallStationMovedText,
  stationEquipmentLabelText,
  UI,
} from '../data/blockMeta'
import { aggregateStationEquipment } from '../data/equipmentPieces'
import {
  isTipDismissed,
  TIP_HALL_FLOW_GOLVKLART,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { getActivityById } from '../data/seedActivities'
import { useBank } from '../lib/useBank'
import {
  clampHallZoom,
  clientToNormalized,
  countPlaceableItems,
  countSessionItems,
  getPreset,
  getUnplacedItems,
  HALL_ZOOM_MAX,
  HALL_ZOOM_MIN,
  HALL_ZOOM_STEP,
  isHallShowFlow,
  listSessionItems,
  normalizeTemplateId,
  pruneHallPlacements,
  placeableItems,
  removePlacement,
  roundHallZoom,
  techniqueIndexFor,
  upsertPlacement,
} from '../lib/hall'
import { autoPlaceUnplaced } from '../lib/hallSuggest'
import {
  addItemToBlock,
  applyAllSuggestedStationEquipment,
  eligibleSuggestedStationEquipmentItems,
  findSessionItem,
  moveTechniqueTo,
  placedTeknikMissingSavedEquipment,
  removeItem,
  saveDraft,
  updateItemStationEquipment,
} from '../lib/session'
import type { Activity, Session, StationEquipmentSlot } from '../types'
import type { SaveStatus } from '../lib/useAutosave'
import { ActivityDetail } from './ActivityDetail'
import { CoachTipStrip } from './CoachTipStrip'
import { HallCanvas, type HallMode } from './HallCanvas'
import { ForradslistaSheet } from './ForradslistaSheet'
import { HallChip } from './HallChip'
import { HallStationList } from './HallStationList'
import { LibraryPanel } from './LibraryPanel'
import { loadOwnActivities } from '../lib/ownActivities'
import { startPointerDrag } from '../lib/pointerDrag'
import { PassPrint } from './PassPrint'
import { StationComposeSheet } from './StationComposeSheet'
import { usePassPrint } from '../lib/bodyPrint'

interface Props {
  session: Session
  onChange: (session: Session) => void
  onBack: () => void
  tips: CoachTipsStateV1
  onDismissTip: (tipId: string) => void
  initialFloor?: boolean
  onEnterGolvklart?: () => void
  /** Slice 53 A1: same quiet «Sparat» / «Inte sparat» as Passbyggaren. */
  saveStatus?: SaveStatus
}

export function HallBoard({
  session,
  onChange,
  onBack,
  tips,
  onDismissTip,
  initialFloor = false,
  onEnterGolvklart,
  saveStatus = 'idle',
}: Props) {
  const [hallMode, setHallMode] = useState<HallMode>(
    initialFloor ? 'floor' : 'edit',
  )
  /** Slice 48 C1 — pointer drag: live marker position + which chip is lifted. */
  const [dragPreview, setDragPreview] = useState<{ id: string; x: number; y: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const justDraggedAt = useRef(0)
  /** Slice 48 B1 — Ändra stationer. */
  const [stationsEdit, setStationsEdit] = useState(false)
  const stationsBtnRef = useRef<HTMLButtonElement | null>(null)
  const [stationFocusId, setStationFocusId] = useState<string | null>(null)
  const [stationLive, setStationLive] = useState('')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryOwn] = useState(() => loadOwnActivities())
  /** Slice 48 E1 — one undo level for «Ta bort» in the list (Slice 41 rule: any other change ends it). */
  const [undo, setUndo] = useState<{ before: Session; after: Session } | null>(null)
  const [undoToast, setUndoToast] = useState<{ text: string; undo: boolean } | null>(null)
  const [placeModeItemId, setPlaceModeItemId] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  /** Slice 13 — hall detail tracks SessionItem so redskap can persist */
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [forradOpen, setForradOpen] = useState(false)
  const [applyAllStatus, setApplyAllStatus] = useState<string | null>(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [viewZoom, setViewZoom] = useState(1)
  /** Slice 21 B1 — phone edit tray collapsed by default to free canvas. */
  const [trayCollapsed, setTrayCollapsed] = useState(true)
  const trayRef = useRef<HTMLElement | null>(null)
  const applyAllBtnRef = useRef<HTMLButtonElement | null>(null)
  const [trayHeight, setTrayHeight] = useState(0)
  /** Slice 24 — brief highlight when Förråd soft CTA points at apply-all */
  const [applyAllHighlight, setApplyAllHighlight] = useState(false)
  const pp = usePassPrint()

  // Slice 31 — activity-derived values are plain (not memoized on session) so a bank
  // refresh that re-renders the board shows the new text in place.
  useBank()
  const itemCount = useMemo(() => countSessionItems(session), [session])
  const placeableCount = countPlaceableItems(session)
  const unplaced = getUnplacedItems(session)
  const noStations = itemCount > 0 && placeableCount === 0
  const activeTemplateId = normalizeTemplateId(session.hallTemplateId)
  const showFlow = isHallShowFlow(session)
  const isFloor = hallMode === 'floor'
  const presetLabel = getPreset(activeTemplateId).label

  // Slice 45 C1: under the hall only the caption and the flow tip about the numbers.
  const headerTipVisible =
    !isFloor && !isTipDismissed(tips, TIP_HALL_FLOW_GOLVKLART)
  // C1 Golvklart: no tip strip on floor today (edit tips already hidden); banner alone.

  const detailItem = detailItemId
    ? findSessionItem(session, detailItemId) ?? null
    : null
  const detailActivity = detailItem
    ? getActivityById(detailItem.activityId) ?? null
    : null

  const forradRows = useMemo(
    () => aggregateStationEquipment(listSessionItems(session)),
    [session],
  )
  const eligibleSuggestedCount =
    eligibleSuggestedStationEquipmentItems(session).length
  /** Slice 25 — placed Teknik with unset or [] saved redskap (edit banner). */
  const missingSavedCompositionCount =
    placedTeknikMissingSavedEquipment(session).length

  // Silent prune of non-Teknik / missing placements when Hallöversikt is open.
  useEffect(() => {
    const pruned = pruneHallPlacements(session)
    if (pruned !== session) {
      onChange(pruned)
      saveDraft(pruned)
      return
    }
    if (countPlaceableItems(session) < 1) return
    if ((session.hallPlacements ?? []).length > 0) return
    const suggested = autoPlaceUnplaced(session)
    if (suggested === session) return
    onChange(suggested)
    saveDraft(suggested)
    // Suggest once when the hall is still empty. Later removals stay removed.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session identity is the trigger
  }, [session.id, session.hallPlacements, session.blocks])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Reset zoom when leaving phone layout
  useEffect(() => {
    if (!isNarrow) setViewZoom(1)
  }, [isNarrow])

  // Reserve the rendered tray height so the last canvas area can scroll above it.
  useEffect(() => {
    if (!isNarrow || isFloor || !trayRef.current) {
      setTrayHeight(0)
      return
    }

    const tray = trayRef.current
    const updateTrayHeight = () => {
      setTrayHeight(Math.ceil(tray.getBoundingClientRect().height))
    }
    updateTrayHeight()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateTrayHeight)
    observer.observe(tray)
    return () => observer.disconnect()
  }, [isNarrow, isFloor])

  function persist(next: Session) {
    onChange(next)
    saveDraft(next)
  }

  // Slice 41 rule, hall copy: any other change to the pass ends the undo.
  useEffect(() => {
    if (undo && session !== undo.after) {
      setUndo(null)
      setUndoToast((t) => (t?.undo ? null : t))
    }
  }, [session, undo])

  useEffect(() => {
    if (!undoToast) return
    const timer = window.setTimeout(() => {
      setUndoToast(null)
      setUndo(null)
    }, undoToast.undo ? 5000 : 2200)
    return () => window.clearTimeout(timer)
  }, [undoToast])

  function teknikBlockId(): string | null {
    return session.blocks.find((b) => b.type === 'techniques')?.id ?? null
  }

  function closeStationsEdit() {
    setStationsEdit(false)
    window.setTimeout(() => stationsBtnRef.current?.focus(), 0)
  }

  function handleStationMove(itemId: string, slot: number) {
    const next = moveTechniqueTo(session, itemId, techniqueIndexFor(session, itemId, slot))
    if (next === session) return
    persist(next)
    const n = placeableItems(next).findIndex((it) => it.id === itemId) + 1
    const item = findSessionItem(next, itemId)
    const title = item ? (getActivityById(item.activityId)?.title ?? '') : ''
    setStationLive(hallStationMovedText(title, n))
    setStationFocusId(null)
    window.setTimeout(() => setStationFocusId(itemId), 0)
  }

  function handleStationRemove(itemId: string) {
    const blockId = teknikBlockId()
    if (!blockId) return
    const after = removeItem(session, blockId, itemId)
    setUndo({ before: session, after })
    persist(after)
    setUndoToast({ text: UI.undoRemoved, undo: true })
  }

  function runUndo() {
    const u = undo
    setUndo(null)
    if (!u || session !== u.after) {
      setUndoToast(null)
      return
    }
    persist(u.before)
    setUndoToast({ text: UI.undoDone, undo: false })
  }

  function handleAddStation(activity: Activity) {
    const blockId = teknikBlockId()
    setLibraryOpen(false)
    if (!blockId) return
    const before = new Set(placeableItems(session).map((it) => it.id))
    const added = addItemToBlock(session, blockId, activity.id, activity.durationMinutesDefault)
    const next = autoPlaceUnplaced(added)
    persist(next)
    const fresh = placeableItems(next).find((it) => !before.has(it.id))
    if (fresh) window.setTimeout(() => setStationFocusId(fresh.id), 0)
  }

  /** Slice 48 C1 — pointer drag for canvas markers and tray chips (replaces HTML5 drag). */
  function handleChipPointerDown(e: ReactPointerEvent<HTMLDivElement>, itemId: string) {
    if (isFloor) return
    const isPlaced = (session.hallPlacements ?? []).some((p) => p.sessionItemId === itemId)
    const canvas = document.querySelector<HTMLElement>('.hall-board .hall-canvas')
    const overTray = (ev: PointerEvent) =>
      Boolean(trayRef.current && inside(trayRef.current, ev))
    const overCanvas = (ev: PointerEvent) => Boolean(canvas && inside(canvas, ev))
    startPointerDrag(e, {
      onStart: () => setDraggingId(itemId),
      onMove: (ev) => {
        if (!isPlaced || !canvas) return
        const { x, y } = clientToNormalized(ev, canvas)
        setDragPreview({ id: itemId, x: clamp01(x), y: clamp01(y) })
      },
      onDrop: (ev) => {
        justDraggedAt.current = performance.now()
        setDragPreview(null)
        setDraggingId(null)
        if (isPlaced && overTray(ev)) {
          handleRemove(itemId)
          return
        }
        if (canvas && overCanvas(ev)) {
          const { x, y } = clientToNormalized(ev, canvas)
          placeAt(itemId, clamp01(x), clamp01(y))
        }
      },
      onCancel: () => {
        setDragPreview(null)
        setDraggingId(null)
      },
    })
  }

  function recentlyDragged(): boolean {
    return performance.now() - justDraggedAt.current < 400
  }

  /** Shared by mouse DnD and phone Placera här — snap lives in upsertPlacement. */
  function placeAt(sessionItemId: string, x: number, y: number) {
    if (isFloor) return
    const next = upsertPlacement(session, {
      sessionItemId,
      x,
      y,
    })
    persist(next)
    setPlaceModeItemId(null)
    setSelectedItemId(null)
  }

  function handleRemove(sessionItemId: string) {
    if (isFloor) return
    persist(removePlacement(session, sessionItemId))
    if (placeModeItemId === sessionItemId) setPlaceModeItemId(null)
    if (selectedItemId === sessionItemId) setSelectedItemId(null)
  }

  function toggleFlow() {
    const nextOn = !showFlow
    persist({ ...session, hallShowFlow: nextOn })
  }

  function enterFloor() {
    setPlaceModeItemId(null)
    setSelectedItemId(null)
    setDraggingId(null)
    setDragPreview(null)
    setStationsEdit(false)
    setHallMode('floor')
    onEnterGolvklart?.()
  }

  function exitFloor() {
    setTrayCollapsed(true)
    setHallMode('edit')
  }

  function zoomIn() {
    setViewZoom((z) => roundHallZoom(z + HALL_ZOOM_STEP))
  }

  function zoomOut() {
    setViewZoom((z) => roundHallZoom(z - HALL_ZOOM_STEP))
  }

  function handlePinchZoom(next: number) {
    setViewZoom(clampHallZoom(roundHallZoom(next)))
  }

  function handleChipClick(itemId: string) {
    if (recentlyDragged()) return
    const isUnplaced = unplaced.some((it) => it.id === itemId)
    if (!isFloor && isNarrow && isUnplaced) {
      setPlaceModeItemId((prev) => (prev === itemId ? null : itemId))
      setSelectedItemId(itemId)
      return
    }
    openDetail(itemId)
  }

  function openDetail(itemId: string) {
    const item = findSessionItem(session, itemId)
    if (!item) return
    const activity = getActivityById(item.activityId)
    if (!activity) return
    setDetailItemId(itemId)
    setComposeOpen(false)
  }

  function closeDetail() {
    setComposeOpen(false)
    setDetailItemId(null)
  }

  function handleSaveEquipment(slots: StationEquipmentSlot[]) {
    if (!detailItemId) return
    const next = updateItemStationEquipment(session, detailItemId, slots)
    persist(next)
    setComposeOpen(false)
  }

  function handleUseSuggested(slots: StationEquipmentSlot[]) {
    if (!detailItemId) return
    const next = updateItemStationEquipment(session, detailItemId, slots)
    persist(next)
  }

  function handleApplyAllSuggested() {
    const { session: next, appliedCount } =
      applyAllSuggestedStationEquipment(session)
    if (appliedCount > 0) persist(next)
    setApplyAllStatus(hallApplyAllSuggestedResultText(appliedCount))
    window.setTimeout(() => setApplyAllStatus(null), 2200)
  }

  /** Shared point-at Använd alla förslag (Slice 24/25) — no auto-apply. */
  function pointAtApplyAll(toast: string) {
    window.setTimeout(() => {
      const btn = applyAllBtnRef.current
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        btn.focus({ preventScroll: true })
        setApplyAllHighlight(true)
        window.setTimeout(() => setApplyAllHighlight(false), 1800)
      }
      setApplyAllStatus(toast)
      window.setTimeout(() => setApplyAllStatus(null), 2200)
    }, 80)
  }

  /** Slice 24 B1 — close Förråd, ensure edit, point at Använd alla förslag (no auto-apply). */
  function pointAtApplyAllFromForrad() {
    setForradOpen(false)
    if (isFloor) exitFloor()
    pointAtApplyAll(UI.forradslistaPointApplyAllToast)
  }

  if (itemCount === 0) {
    return (
      <div className="hall-board">
        <header className="hall-header">
          <button type="button" className="btn-text back" onClick={onBack}>
            ← {UI.hallBack}
          </button>
          <h1 className="hall-screen-title">{UI.hallOverview}</h1>
        </header>
        <div className="hall-empty-pass">
          <p>{UI.hallEmptyPass}</p>
          <button type="button" className="btn-primary" onClick={onBack}>
            {UI.hallBackShort}
          </button>
        </div>
      </div>
    )
  }

  if (noStations) {
    return (
      <div className="hall-board">
        <header className="hall-header">
          <button type="button" className="btn-text back" onClick={onBack}>
            ← {UI.hallBack}
          </button>
          <div className="hall-header-main">
            <h1 className="hall-screen-title">{UI.hallOverview}</h1>
            <p className="hall-session-meta">
              <span className="hall-session-title">{session.title}</span>
            </p>
          </div>
        </header>
        <p className="hall-stations-only-hint">{UI.hallStationsOnlyHint}</p>
        <div className="hall-empty-pass hall-empty-stations">
          <h2 className="hall-no-stations-title">{UI.hallNoStationsTitle}</h2>
          <p>{UI.hallNoStationsBody}</p>
          <button type="button" className="btn-primary" onClick={onBack}>
            {UI.hallNoStationsCta}
          </button>
        </div>
      </div>
    )
  }

  // Slice 43 D1b: in edit mode the zoom − / + sits in the layout row; Golvklart keeps it above the hall.
  const zoomBar = isNarrow && (
    <div className="hall-zoom-bar no-print" role="group" aria-label={UI.hallZoom}>
            <button
              type="button"
              className="btn-secondary hall-zoom-btn hall-tap-target"
              aria-label={UI.hallZoomOut}
              disabled={viewZoom <= HALL_ZOOM_MIN}
              onClick={zoomOut}
            >
              −
            </button>
            <button
              type="button"
              className="btn-secondary hall-zoom-btn hall-tap-target"
              aria-label={UI.hallZoomIn}
              disabled={viewZoom >= HALL_ZOOM_MAX}
              onClick={zoomIn}
            >
              +
            </button>
          </div>
  )

  return (
    <div className={`hall-board${isFloor ? ' hall-board--floor' : ''}`}>
      {isFloor ? (
        <header className="hall-header hall-header--floor no-print-hide">
          <div className="hall-floor-actions no-print">
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              onClick={exitFloor}
            >
              {UI.hallExitFloor}
            </button>
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              aria-label={UI.forradslistaOpenAria}
              onClick={() => setForradOpen(true)}
            >
              {UI.forradslistaOpen}
            </button>
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              onClick={pp.print}
            >
              {UI.exportPrintPass}
            </button>
          </div>
          {pp.stalled && <p className="muted" role="status">{UI.printStalled}</p>}
          <div className="hall-header-main">
            <h1 className="hall-screen-title">
              {UI.hallFloorModeLabel}
              {session.totalMinutes > 0 && (
                <span className="hall-floor-duration">
                  {' '}
                  · {session.totalMinutes} min
                </span>
              )}
            </h1>
            <p className="hall-session-meta">
              <span className="hall-session-title">{session.title}</span>
              <span className="hall-preset-readonly">{presetLabel}</span>
            </p>
          </div>
          {unplaced.length > 0 && (
            <p className="hall-unplaced-banner" role="status">
              {hallUnplacedBannerText(unplaced.length)}
            </p>
          )}
        </header>
      ) : (
        <header className="hall-header no-print-hide">
          <button type="button" className="btn-text back" onClick={onBack}>
            ← {UI.hallBack}
          </button>
          <div className="hall-header-main">
            <h1 className="hall-screen-title">{UI.hallOverview}</h1>
            <p className="hall-session-meta">
              <span className="hall-session-title">{session.title}</span>
              <span className="hall-session-count">
                {hallStationCountText(placeableCount)}
              </span>
              <span className="hall-preset-readonly">{presetLabel}</span>
            </p>
          </div>
          <div className="hall-header-actions">
            <button
              ref={stationsBtnRef}
              type="button"
              className="btn-secondary hall-tap-target hall-stations-toggle"
              aria-expanded={stationsEdit}
              onClick={() => (stationsEdit ? closeStationsEdit() : setStationsEdit(true))}
            >
              {stationsEdit ? UI.hallStationsDone : UI.hallStationsEdit}
            </button>
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              aria-pressed={showFlow}
              onClick={toggleFlow}
            >
              {showFlow ? UI.hallHideFlow : UI.hallShowFlow}
            </button>
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              aria-label={UI.forradslistaOpenAria}
              onClick={() => setForradOpen(true)}
            >
              {UI.forradslistaOpen}
            </button>
            {eligibleSuggestedCount >= 1 && (
              <button
                ref={applyAllBtnRef}
                type="button"
                className={`btn-secondary hall-tap-target${
                  applyAllHighlight ? ' hall-apply-all--point' : ''
                }`}
                aria-label={UI.hallApplyAllSuggestedAria}
                onClick={handleApplyAllSuggested}
              >
                {UI.hallApplyAllSuggested}
              </button>
            )}
            <button
              type="button"
              className="btn-primary hall-tap-target"
              onClick={enterFloor}
            >
              {UI.hallFloorReady}
            </button>
            {saveStatus !== 'idle' && (
              <span className={`save-status${saveStatus === 'failed' ? ' save-status-failed' : ''}`}>
                {saveStatus === 'failed' ? UI.autosaveFailed : UI.autosaveSaved}
              </span>
            )}
          </div>
          {/* Slice 45 B1: no layout picker; the row keeps the zoom − / + (Slice 43 place). */}
          {zoomBar && <div className="hall-preset-row">{zoomBar}</div>}
          {missingSavedCompositionCount >= 1 && (
            <div className="hall-saknar-banner no-print">
              <p
                className="hall-unplaced-banner"
                role="status"
                title={hallSaknarRedskapBannerText(missingSavedCompositionCount)}
              >
                {hallSaknarRedskapBannerText(missingSavedCompositionCount)}
              </p>
            </div>
          )}
        </header>
      )}

      {/* Print-only title strip (visible when chrome hidden) */}
      <div className="hall-print-title print-only" aria-hidden>
        <strong>{session.title}</strong>
        {session.totalMinutes > 0 && <span> · {session.totalMinutes} min</span>}
        {session.date && <span> · {session.date}</span>}
      </div>

      {isFloor && zoomBar}

      <div
        className={`hall-layout${isFloor ? ' hall-layout--floor' : ''}`}
        style={
          {
            '--hall-tray-reserved':
              isNarrow && !isFloor && trayHeight > 0
                ? `${trayHeight}px`
                : '14rem',
          } as CSSProperties
        }
      >
        <HallCanvas
          session={session}
          hallMode={hallMode}
          placeModeItemId={isFloor ? null : placeModeItemId}
          selectedItemId={selectedItemId}
          viewZoom={viewZoom}
          onViewZoomChange={handlePinchZoom}
          onPlaceAt={placeAt}
          onChipClick={(id) => {
            if (recentlyDragged()) return
            if (isFloor) {
              openDetail(id)
              return
            }
            const isUnplacedItem = unplaced.some((it) => it.id === id)
            if (isUnplacedItem) {
              handleChipClick(id)
            } else {
              openDetail(id)
            }
          }}
          onRemovePlacement={handleRemove}
          onChipPointerDown={handleChipPointerDown}
          dragPreview={dragPreview}
        />
        <p className="hall-schematic-note">{UI.hallSchematicNote}</p>
        {!isFloor && stationsEdit && (
          <HallStationList
            session={session}
            onMoveTo={handleStationMove}
            onRemove={handleStationRemove}
            onAdd={() => {
              setLibraryOpen(true)
            }}
            onDone={closeStationsEdit}
            focusId={stationFocusId}
            liveText={stationLive}
          />
        )}
        {!isFloor && (
          <div className="hall-below no-print">
              {headerTipVisible && (
                <CoachTipStrip
                  tipId={TIP_HALL_FLOW_GOLVKLART}
                  className="hall-flow-coach-tip"
                  text={UI.tipHallFlowGolvklart}
                  onDismiss={onDismissTip}
                />
              )}
          </div>
        )}

        {!isFloor && (
          <aside
            ref={trayRef}
            className={`hall-tray${isNarrow ? ' hall-tray--sticky' : ''}${isNarrow && trayCollapsed ? ' hall-tray--compact' : ''} no-print`}
          >
            {isNarrow && trayCollapsed ? (
              <div className="hall-tray-compact-bar">
                <p className="hall-tray-compact-count">
                  {hallUnplacedWithCountText(unplaced.length)}
                </p>
                <button
                  type="button"
                  className="btn-secondary hall-tap-target hall-tray-toggle"
                  aria-label={UI.hallTrayExpandAria}
                  aria-expanded={false}
                  onClick={() => setTrayCollapsed(false)}
                >
                  {UI.hallTrayExpand}
                </button>
              </div>
            ) : (
              <>
                {isNarrow && (
                  <div className="hall-tray-toolbar">
                    <button
                      type="button"
                      className="btn-secondary hall-tap-target hall-tray-toggle"
                      aria-label={UI.hallTrayCollapseAria}
                      aria-expanded={true}
                      onClick={() => {
                        setPlaceModeItemId(null)
                        setTrayCollapsed(true)
                      }}
                    >
                      {UI.hallTrayCollapse}
                    </button>
                  </div>
                )}
                <h2 className="hall-tray-title">
                  {UI.hallUnplacedStations} ({unplaced.length})
                </h2>

                {placeModeItemId && isNarrow && (
                  <p className="hall-place-mode-hint" role="status">
                    {UI.hallPlaceHere}
                  </p>
                )}

                {unplaced.length === 0 ? (
                  <p className="hall-tray-empty">{UI.hallTrayEmptyStations}</p>
                ) : (
                  <ul className="hall-tray-list">
                    {unplaced.map((item) => (
                      <li key={item.id}>
                        <HallChip
                          item={item}
                          variant="tray"
                          selected={placeModeItemId === item.id}
                          dragging={draggingId === item.id}
                          onPointerDown={handleChipPointerDown}
                          onClick={handleChipClick}
                        />
                        {isNarrow && placeModeItemId === item.id && (
                          <p className="hall-place-here-label">{UI.hallPlaceHere}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </aside>

        )}
      </div>

      {forradRows.length > 0 && (
        <section className="forradslista-print print-only" aria-hidden>
          <h2 className="forradslista-print-heading">
            {UI.forradslistaPrintHeading}
          </h2>
          <p className="forradslista-print-intro">{UI.forradslistaPrintIntro}</p>
          <ul className="forradslista-print-list">
            {forradRows.map((row) => (
              <li key={row.pieceId}>
                {stationEquipmentLabelText(row.labelSv, row.count)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {detailActivity && detailItem && (
        <ActivityDetail
          activity={detailActivity}
          readOnly
          floor={isFloor}
          onClose={closeDetail}
          tips={tips}
          onDismissTip={onDismissTip}
          showStationEquipment
          stationEquipment={detailItem.stationEquipment}
          onEditEquipment={() => setComposeOpen(true)}
          onUseSuggestedEquipment={handleUseSuggested}
        />
      )}

      {composeOpen && detailActivity && detailItem && (
        <StationComposeSheet
          activityTitle={detailActivity.title}
          initialSlots={
            detailItem.stationEquipment ??
            detailActivity.defaultStationEquipment ??
            []
          }
          onSave={handleSaveEquipment}
          onClose={() => setComposeOpen(false)}
        />
      )}

      {forradOpen && (
        <ForradslistaSheet
          rows={forradRows}
          eligibleSuggestedCount={eligibleSuggestedCount}
          onClose={() => setForradOpen(false)}
          onPointAtApplyAll={pointAtApplyAllFromForrad}
        />
      )}

      {libraryOpen && (
        <div className="side-panel-slot is-open hall-library">
          <button
            type="button"
            className="sheet-backdrop"
            aria-label={UI.close}
            onClick={() => setLibraryOpen(false)}
          />
          <div
            className="side-panel-frame"
            role="dialog"
            aria-modal="true"
            aria-label={UI.addActivity}
          >
            <div className="sheet-chrome">
              <button
                type="button"
                className="btn-secondary sheet-close"
                onClick={() => setLibraryOpen(false)}
              >
                {UI.close}
              </button>
            </div>
            <LibraryPanel
              filterBlockType="techniques"
              onSelectActivity={handleAddStation}
              ownActivities={libraryOwn}
            />
          </div>
        </div>
      )}

      {undoToast && (
        <div
          className="toast"
          role="status"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setUndoToast(null)
              setUndo(null)
            }
          }}
        >
          <span>{undoToast.text}</span>
          {undoToast.undo && (
            <>
              <span aria-hidden="true"> · </span>
              <button type="button" className="toast-action" onClick={runUndo}>
                {UI.undoAction}
              </button>
            </>
          )}
        </div>
      )}

      {applyAllStatus && (
        <div className="toast" role="status">
          {applyAllStatus}
        </div>
      )}
      {pp.armed && createPortal(<PassPrint session={session} />, document.body)}
    </div>
  )
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function inside(el: Element, p: { clientX: number; clientY: number }): boolean {
  const r = el.getBoundingClientRect()
  return p.clientX >= r.left && p.clientX <= r.right && p.clientY >= r.top && p.clientY <= r.bottom
}

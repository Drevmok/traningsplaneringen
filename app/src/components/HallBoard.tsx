import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import {
  hallApplyAllSuggestedResultText,
  hallStationCountText,
  hallUnplacedBannerText,
  hallUnplacedWithCountText,
  stationEquipmentLabelText,
  UI,
} from '../data/blockMeta'
import { aggregateStationEquipment } from '../data/equipmentPieces'
import {
  isTipDismissed,
  markHallHintsCompact,
  TIP_HALL_FLOW_GOLVKLART,
  TIP_HALL_PLACE,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { HALL_PRESET_ORDER, HALL_PRESETS } from '../data/hallPresets'
import { getActivityById } from '../data/seedActivities'
import {
  applyPreset,
  clampHallZoom,
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
  removePlacement,
  roundHallZoom,
  upsertPlacement,
} from '../lib/hall'
import {
  applyAllSuggestedStationEquipment,
  eligibleSuggestedStationEquipmentItems,
  findSessionItem,
  saveDraft,
  updateItemStationEquipment,
} from '../lib/session'
import type { HallTemplateId, Session, StationEquipmentSlot } from '../types'
import { ActivityDetail } from './ActivityDetail'
import { CoachTipStrip } from './CoachTipStrip'
import { HallCanvas, type HallMode } from './HallCanvas'
import { ForradslistaSheet } from './ForradslistaSheet'
import { HallChip, HALL_CHIP_MIME } from './HallChip'
import { StationComposeSheet } from './StationComposeSheet'

interface Props {
  session: Session
  onChange: (session: Session) => void
  onBack: () => void
  tips: CoachTipsStateV1
  onDismissTip: (tipId: string) => void
  /** Slice 22 — tips mutators (hallHintsCompact on place) */
  onTips?: (updater: (prev: CoachTipsStateV1) => CoachTipsStateV1) => void
  initialFloor?: boolean
  onEnterGolvklart?: () => void
}

export function HallBoard({
  session,
  onChange,
  onBack,
  tips,
  onDismissTip,
  onTips,
  initialFloor = false,
  onEnterGolvklart,
}: Props) {
  const [hallMode, setHallMode] = useState<HallMode>(
    initialFloor ? 'floor' : 'edit',
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
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
  /** Slice 22 A1 — session-local expand for progressive hints info panel */
  const [hintsInfoOpen, setHintsInfoOpen] = useState(false)
  const trayRef = useRef<HTMLElement | null>(null)
  const [trayHeight, setTrayHeight] = useState(0)

  const itemCount = useMemo(() => countSessionItems(session), [session])
  const placeableCount = useMemo(
    () => countPlaceableItems(session),
    [session],
  )
  const unplaced = useMemo(() => getUnplacedItems(session), [session])
  const allUnplaced =
    placeableCount > 0 && unplaced.length === placeableCount
  const noStations = itemCount > 0 && placeableCount === 0
  const activeTemplateId = normalizeTemplateId(session.hallTemplateId)
  const showFlow = isHallShowFlow(session)
  const isFloor = hallMode === 'floor'
  const presetLabel = getPreset(activeTemplateId).label

  // Slice 22 A1/C1 — progressive hints + one chrome layer
  const headerTipVisible =
    !isFloor && !isTipDismissed(tips, TIP_HALL_FLOW_GOLVKLART)
  const trayTipVisible =
    !isFloor &&
    !(isNarrow && trayCollapsed) &&
    !isTipDismissed(tips, TIP_HALL_PLACE)
  const anyEditTipVisible = headerTipVisible || trayTipVisible
  const showMultiLineHints = !tips.hallHintsCompact && !anyEditTipVisible
  const showHintsInfo = Boolean(tips.hallHintsCompact) || anyEditTipVisible
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
  const eligibleSuggestedCount = useMemo(
    () => eligibleSuggestedStationEquipmentItems(session).length,
    [session],
  )

  // Silent prune of non-Teknik / missing placements when Hallöversikt is open.
  useEffect(() => {
    const pruned = pruneHallPlacements(session)
    if (pruned !== session) {
      onChange(pruned)
      saveDraft(pruned)
    }
    // Only on mount / when placements or blocks identity shifts via session ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prune on open/session change
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

  /** Shared by mouse DnD and phone Placera här — snap lives in upsertPlacement. */
  function placeAt(sessionItemId: string, x: number, y: number) {
    if (isFloor) return
    const next = upsertPlacement(session, {
      sessionItemId,
      x,
      y,
    })
    persist(next)
    // Slice 22 A1 — durable quiet chrome after first successful Teknik place
    onTips?.(markHallHintsCompact)
    setPlaceModeItemId(null)
    setSelectedItemId(null)
  }

  function handlePresetChange(e: ChangeEvent<HTMLSelectElement>) {
    if (isFloor) return
    const nextId = e.target.value as HallTemplateId
    if (nextId === activeTemplateId) return
    persist(applyPreset(session, nextId))
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
    setHallMode('floor')
    onEnterGolvklart?.()
  }

  function exitFloor() {
    setTrayCollapsed(true)
    setHallMode('edit')
  }

  function handlePrint() {
    window.print()
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

  function handleTrayDrop(e: DragEvent) {
    if (isFloor) return
    e.preventDefault()
    const id =
      e.dataTransfer.getData(HALL_CHIP_MIME) ||
      e.dataTransfer.getData('text/plain')
    if (id) handleRemove(id)
    setDraggingId(null)
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
              className="btn-primary hall-tap-target"
              onClick={handlePrint}
            >
              {UI.hallPrint}
            </button>
          </div>
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
            </p>
          </div>
          <div className="hall-header-actions">
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
            <button
              type="button"
              className="btn-secondary hall-tap-target"
              aria-label={UI.hallApplyAllSuggestedAria}
              title={
                eligibleSuggestedCount === 0
                  ? UI.hallApplyAllSuggestedDisabled
                  : undefined
              }
              disabled={eligibleSuggestedCount === 0}
              onClick={handleApplyAllSuggested}
            >
              {UI.hallApplyAllSuggested}
            </button>
            <button
              type="button"
              className="btn-primary hall-tap-target"
              onClick={enterFloor}
            >
              {UI.hallFloorReady}
            </button>
          </div>
          <div className="hall-preset-row">
            <label className="hall-preset-label" htmlFor="hall-layout-select">
              {UI.hallLayout}
            </label>
            <select
              id="hall-layout-select"
              className="hall-preset-select"
              aria-label={UI.hallLayout}
              value={activeTemplateId}
              onChange={handlePresetChange}
            >
              {HALL_PRESET_ORDER.map((id) => (
                <option key={id} value={id}>
                  {HALL_PRESETS[id].label}
                </option>
              ))}
            </select>
            <p className="hall-preset-note">{UI.hallPresetMigrateNote}</p>
            <p className="hall-preset-coach-tip">{UI.hallPresetCoachTip}</p>
          </div>
          {showMultiLineHints && (
            <>
              <p className="hall-station-hint">{UI.hallStationOrderHint}.</p>
              <p className="hall-stations-only-hint">{UI.hallStationsOnlyHint}</p>
              <p className="hall-tile-hint">{UI.hallTileHint}</p>
            </>
          )}
          {!showMultiLineHints && showHintsInfo && (
            <div className="hall-hints-info no-print">
              <button
                type="button"
                className="btn-secondary hall-tap-target hall-hints-info-btn"
                aria-label={
                  hintsInfoOpen ? UI.hallHintsHideAria : UI.hallHintsInfoAria
                }
                aria-expanded={hintsInfoOpen}
                onClick={() => setHintsInfoOpen((o) => !o)}
              >
                {hintsInfoOpen ? UI.hallHintsHide : UI.hallHintsInfo}
              </button>
              {hintsInfoOpen && (
                <div className="hall-hints-info-panel" role="region">
                  <p className="hall-station-hint">{UI.hallStationOrderHint}.</p>
                  <p className="hall-stations-only-hint">
                    {UI.hallStationsOnlyHint}
                  </p>
                  <p className="hall-tile-hint">{UI.hallTileHint}</p>
                  <p className="hall-tray-hint">{UI.hallDragHint}</p>
                  <p className="hall-tray-hint hall-snap-hint">{UI.hallSnapHint}</p>
                </div>
              )}
            </div>
          )}
          {headerTipVisible && (
            <CoachTipStrip
              tipId={TIP_HALL_FLOW_GOLVKLART}
              className="hall-flow-coach-tip"
              text={UI.tipHallFlowGolvklart}
              onDismiss={onDismissTip}
            />
          )}
        </header>
      )}

      {/* Print-only title strip (visible when chrome hidden) */}
      <div className="hall-print-title print-only" aria-hidden>
        <strong>{session.title}</strong>
        {session.totalMinutes > 0 && <span> · {session.totalMinutes} min</span>}
        {session.date && <span> · {session.date}</span>}
      </div>

      {isNarrow && (
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
      )}

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
          onDragOverCanvas={() => {}}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          allUnplaced={allUnplaced}
        />

        {!isFloor && (
          <aside
            ref={trayRef}
            className={`hall-tray${isNarrow ? ' hall-tray--sticky' : ''}${isNarrow && trayCollapsed ? ' hall-tray--compact' : ''} no-print`}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={handleTrayDrop}
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
                {showMultiLineHints && (
                  <>
                    <p className="hall-tray-hint">{UI.hallDragHint}</p>
                    <p className="hall-tray-hint hall-snap-hint">{UI.hallSnapHint}</p>
                  </>
                )}
                {trayTipVisible && (
                  <CoachTipStrip
                    tipId={TIP_HALL_PLACE}
                    className="hall-place-coach-tip"
                    text={UI.tipHallPlace}
                    onDismiss={onDismissTip}
                  />
                )}

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
                          onDragStart={(_e, id) => setDraggingId(id)}
                          onDragEnd={() => setDraggingId(null)}
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
          onClose={() => setForradOpen(false)}
        />
      )}

      {applyAllStatus && (
        <div className="toast" role="status">
          {applyAllStatus}
        </div>
      )}
    </div>
  )
}

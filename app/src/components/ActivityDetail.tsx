import { useEffect, useState } from 'react'
import {
  BLOCK_LABELS,
  stationEquipmentLabelText,
  UI,
} from '../data/blockMeta'
import {
  equipmentIconId,
  getEquipmentPiece,
} from '../data/equipmentPieces'
import {
  isTipDismissed,
  TIP_EXPERIENCED_SAFETY,
  TIP_STATION_COMPOSE,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { CoachTipStrip } from './CoachTipStrip'
import { VisualIcon } from '../icons'
import type { Activity, StationEquipmentSlot } from '../types'

interface Props {
  activity: Activity
  onAdd?: (duration: number) => void
  onClose: () => void
  /** Hall board: hide add actions; keep experienced warning */
  readOnly?: boolean
  tips?: CoachTipsStateV1
  onDismissTip?: (tipId: string) => void
  /**
   * Slice 13 — hall detail only.
   * undefined = unset (may show seed förslag);
   * [] = coach cleared;
   * non-empty = saved recipe.
   * Omit entirely when not from hall compose path.
   */
  stationEquipment?: StationEquipmentSlot[]
  /** When true, Redskap section + Redigera redskap are shown (hall detail). */
  showStationEquipment?: boolean
  onEditEquipment?: () => void
  onUseSuggestedEquipment?: (slots: StationEquipmentSlot[]) => void
}

export function ActivityDetail({
  activity,
  onAdd,
  onClose,
  readOnly = false,
  tips,
  onDismissTip,
  stationEquipment,
  showStationEquipment = false,
  onEditEquipment,
  onUseSuggestedEquipment,
}: Props) {
  const [editingDuration, setEditingDuration] = useState(false)
  const [duration, setDuration] = useState(activity.durationMinutesDefault)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const suggested = activity.defaultStationEquipment
  const equipmentUnset = stationEquipment === undefined
  const equipmentList =
    stationEquipment !== undefined ? stationEquipment : undefined
  const showSuggested =
    showStationEquipment &&
    equipmentUnset &&
    Array.isArray(suggested) &&
    suggested.length > 0
  const showEmpty =
    showStationEquipment &&
    !showSuggested &&
    (equipmentList === undefined || equipmentList.length === 0)
  const showSavedList =
    showStationEquipment &&
    equipmentList !== undefined &&
    equipmentList.length > 0

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal activity-detail">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={readOnly ? UI.hallDetailCloseAria : UI.close}
          title={readOnly ? UI.hallDetailClose : UI.close}
        >
          ×
        </button>
        <VisualIcon
          visualKey={activity.visualKey}
          blockType={activity.blockType}
          size="detail"
          className="detail-visual"
        />
        <h2>
          {activity.title}
          {activity.stub && <span className="stub-badge">{UI.stub}</span>}
          {activity.experiencedCoachOnly && (
            <span className="experienced-badge">{UI.experiencedCoach}</span>
          )}
        </h2>
        <p className="detail-meta">
          {BLOCK_LABELS[activity.blockType]} · {activity.durationMinutesDefault}{' '}
          min
        </p>

        {activity.experiencedCoachOnly && (
          <div className="experienced-warning" role="alert">
            <strong>{UI.experiencedCoach}</strong>
            <p>{UI.experiencedCoachWarning}</p>
          </div>
        )}

        {activity.experiencedCoachOnly &&
          tips &&
          onDismissTip &&
          !isTipDismissed(tips, TIP_EXPERIENCED_SAFETY) && (
            <CoachTipStrip
              tipId={TIP_EXPERIENCED_SAFETY}
              className="experienced-coach-tip"
              text={UI.tipExperiencedSafety}
              leadStrong="Erfaren"
              onDismiss={onDismissTip}
            />
          )}

        <section>
          <h3>{UI.summary}</h3>
          <p>{activity.summary}</p>
        </section>
        <section>
          <h3>{UI.howTo}</h3>
          <p className="howto-steps">{activity.howTo}</p>
        </section>
        <section>
          <h3>{UI.watchFor}</h3>
          <p>{activity.watchFor || '—'}</p>
        </section>

        {showStationEquipment && (
          <section className="station-equipment-section">
            <h3>{UI.stationEquipmentHeading}</h3>

            {showSuggested && suggested && (
              <div className="station-equipment-suggested">
                <p className="station-equipment-suggested-label">
                  {UI.stationEquipmentSuggested}
                </p>
                <ul className="station-equipment-list">
                  {suggested.map((s) => {
                    const piece = getEquipmentPiece(s.pieceId)
                    const label = piece?.labelSv ?? s.pieceId
                    return (
                      <li key={s.pieceId} className="station-equipment-item">
                        <VisualIcon
                          iconId={equipmentIconId(piece?.visualKey)}
                          size="item"
                        />
                        <span>{stationEquipmentLabelText(label, s.count)}</span>
                      </li>
                    )
                  })}
                </ul>
                {onUseSuggestedEquipment && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onUseSuggestedEquipment(suggested)}
                  >
                    {UI.stationEquipmentUseSuggested}
                  </button>
                )}
              </div>
            )}

            {showSavedList && equipmentList && (
              <ul className="station-equipment-list">
                {equipmentList.map((s) => {
                  const piece = getEquipmentPiece(s.pieceId)
                  const label = piece?.labelSv ?? s.pieceId
                  return (
                    <li key={s.pieceId} className="station-equipment-item">
                      <VisualIcon
                        iconId={equipmentIconId(piece?.visualKey)}
                        size="item"
                      />
                      <span>{stationEquipmentLabelText(label, s.count)}</span>
                    </li>
                  )
                })}
              </ul>
            )}

            {showEmpty && (
              <div className="station-equipment-empty">
                <p>{UI.stationEquipmentEmpty}</p>
                <p className="muted">{UI.stationEquipmentEmptyHint}</p>
              </div>
            )}

            {onEditEquipment && (
              <div className="station-equipment-actions">
                <button
                  type="button"
                  className="btn-primary"
                  aria-label={UI.stationEquipmentEditAria}
                  onClick={onEditEquipment}
                >
                  {UI.stationEquipmentEdit}
                </button>
              </div>
            )}

            {tips &&
              onDismissTip &&
              !isTipDismissed(tips, TIP_STATION_COMPOSE) && (
                <CoachTipStrip
                  tipId={TIP_STATION_COMPOSE}
                  className="station-compose-coach-tip"
                  text={UI.tipStationCompose}
                  onDismiss={onDismissTip}
                />
              )}
          </section>
        )}

        {!readOnly && onAdd && (
          editingDuration ? (
            <div className="duration-edit">
              <label>
                Tid (min)
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onAdd(duration)}
              >
                Lägg till med {duration} min
              </button>
            </div>
          ) : (
            <div className="modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => onAdd(activity.durationMinutesDefault)}
              >
                {UI.addToBlock}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditingDuration(true)}
              >
                {UI.addAndEditDuration}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

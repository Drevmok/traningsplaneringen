import { useState, type FormEvent } from 'react'
import { BLOCK_LABELS, BLOCK_ORDER, stationEquipmentLabelText, UI } from '../data/blockMeta'
import { getEquipmentPiece } from '../data/equipmentPieces'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import {
  ownActivityIssues,
  parseHowLines,
  saveOwnActivity,
  type OwnDraft,
  type OwnIssue,
} from '../lib/ownActivities'
import type { Activity, BlockType, StationEquipmentSlot } from '../types'
import { EquipmentIcon } from './equipmentMark'
import { StationComposeSheet } from './StationComposeSheet'
import { StationLayoutSheet } from './StationLayoutSheet'
import { syncLayout } from '../data/stationLayout'

interface Props {
  /** Slice 47 E1: edit only — coaches cannot add new own exercises. */
  initial: Activity
  onSaved: () => void
  onCancel: () => void
}

const ISSUE_TEXT: Record<OwnIssue, string> = {
  title: UI.ownNeedTitle,
  why: UI.ownNeedWhy,
  how: UI.ownNeedHow,
  'how-too-long': UI.ownNeedHow,
  watch: UI.ownNeedWatch,
  safety: UI.ownNeedSafety,
}

export function OwnActivityForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<OwnDraft>(() => ({
    title: initial.title,
    blockType: initial.blockType,
    durationMinutes: initial.durationMinutesDefault,
    summary: initial.summary,
    howText: parseHowLines(initial.howTo).join('\n'),
    watchFor: initial.watchFor,
    safety: initial.safetyLine ?? '',
    equipment: initial.defaultStationEquipment ?? [],
    layout: initial.defaultStationLayout,
  }))
  const [picking, setPicking] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [issues, setIssues] = useState<OwnIssue[]>([])
  useBodyScrollLock(true)

  function set<K extends keyof OwnDraft>(key: K, value: OwnDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const nextIssues = ownActivityIssues(draft)
    setIssues(nextIssues)
    if (nextIssues.length > 0) return
    if (saveOwnActivity(draft, initial.id).ok) onSaved()
  }

  return (
    <div
      className="modal-backdrop own-form-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.ownEdit}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form className="modal own-form" onSubmit={submit}>
        <h2>{UI.ownEdit}</h2>
        {issues.length > 0 && (
          <ul className="own-issues">
            {[...new Set(issues)].map((issue) => (
              <li key={issue}>{ISSUE_TEXT[issue]}</li>
            ))}
          </ul>
        )}
        <label className="own-field">
          <span>{UI.ownTitle}</span>
          <input
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label className="own-field">
          <span>{UI.filters}</span>
          <select
            value={draft.blockType}
            onChange={(e) => set('blockType', e.target.value as BlockType)}
          >
            {BLOCK_ORDER.map((type) => (
              <option key={type} value={type}>
                {BLOCK_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="own-field">
          <span>{UI.ownMinutes}</span>
          <input
            type="number"
            min={1}
            max={180}
            value={draft.durationMinutes}
            onChange={(e) => set('durationMinutes', Number(e.target.value))}
          />
        </label>
        <label className="own-field">
          <span>{UI.why}</span>
          <textarea
            rows={2}
            value={draft.summary}
            onChange={(e) => set('summary', e.target.value)}
            maxLength={240}
          />
        </label>
        <label className="own-field">
          <span>{UI.ownSteps}</span>
          <textarea
            rows={4}
            value={draft.howText}
            onChange={(e) => set('howText', e.target.value)}
            placeholder={UI.ownStepsHint}
          />
        </label>
        {draft.blockType === 'techniques' && (
          <div className="own-field own-equipment" role="group" aria-labelledby="own-equipment-label">
            <span id="own-equipment-label">{UI.ownEquipment}</span>
            {draft.equipment.length === 0 ? (
              <p className="own-equipment-none">{UI.ownEquipmentNone}</p>
            ) : (
              <ul className="own-equipment-chips">
                {draft.equipment.map((slot: StationEquipmentSlot) => (
                  <li key={slot.pieceId} className="own-equipment-chip">
                    <EquipmentIcon pieceId={slot.pieceId} />
                    <span>
                      {stationEquipmentLabelText(
                        getEquipmentPiece(slot.pieceId)?.labelSv ?? slot.pieceId,
                        slot.count,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-secondary" onClick={() => setPicking(true)}>
              {UI.ownEquipmentPick}
            </button>
            <button type="button" className="btn-secondary station-layout-open" onClick={() => setPlacing(true)}>
              {UI.stationLayoutOpen}
            </button>
            <p className="own-equipment-hint">{UI.ownEquipmentHint}</p>
          </div>
        )}
        <label className="own-field">
          <span>{UI.watchFor}</span>
          <textarea
            rows={2}
            value={draft.watchFor}
            onChange={(e) => set('watchFor', e.target.value)}
            maxLength={240}
          />
        </label>
        <label className="own-field">
          <span>{UI.safety}</span>
          <textarea
            rows={2}
            value={draft.safety}
            onChange={(e) => set('safety', e.target.value)}
            maxLength={240}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.templateCancel}
          </button>
          <button type="submit" className="btn-primary">
            {UI.ownSave}
          </button>
        </div>
      </form>
      {placing && (
        <StationLayoutSheet
          slots={draft.equipment}
          initialLayout={draft.layout}
          onClose={() => setPlacing(false)}
          onDone={(layout) => {
            set('layout', layout)
            setPlacing(false)
          }}
        />
      )}
      {picking && (
        <StationComposeSheet
          activityTitle={draft.title}
          title={UI.ownEquipmentPick}
          backdropClassName="own-equipment-picker"
          initialSlots={draft.equipment}
          onClose={() => setPicking(false)}
          onSave={(slots) => {
            // C1: the sketch follows the chip list.
            setDraft((prev) => ({
              ...prev,
              equipment: slots,
              layout: prev.layout && slots.length > 0 ? syncLayout(prev.layout, slots) : undefined,
            }))
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}

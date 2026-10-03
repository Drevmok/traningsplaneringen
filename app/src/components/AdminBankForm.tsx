import { useState, type FormEvent } from 'react'
import { BLOCK_LABELS, BLOCK_ORDER, stationEquipmentLabelText, UI } from '../data/blockMeta'
import { getEquipmentPiece } from '../data/equipmentPieces'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { parseStartTime } from '../lib/admin/adminFormat'
import { useAdminBank, useOnline } from '../lib/admin/useAdmin'
import { saveRow, type BankPatch } from '../lib/admin/bankWrite'
import { ownActivityIssues, normalizeHowTo, parseHowLines, type OwnDraft, type OwnIssue } from '../lib/ownActivities'
import { formatSourceTime, sanitizeSource } from '../lib/source'
import type { BlockType, StationEquipmentSlot } from '../types'
import { EquipmentIcon } from './equipmentMark'
import { StationComposeSheet } from './StationComposeSheet'

interface Props {
  id: string
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

/**
 * Slice 32 — screen-spec §7 «Ändra i banken». Same fields and validation as the own form,
 * plus Källa and Bara för erfarna. Tags, difficulty, links, visual and order are never sent,
 * so the database keeps them. Saving clears Behöver granskas. Lazy chunk (admins only).
 */
export default function AdminBankForm({ id, onSaved, onCancel }: Props) {
  useBodyScrollLock(true)
  const bank = useAdminBank()
  const online = useOnline()
  const [entry] = useState(() => bank.byId.get(id))
  const a = entry?.activity
  const [draft, setDraft] = useState<OwnDraft>(() => ({
    title: a?.title ?? '',
    blockType: a?.blockType ?? 'techniques',
    durationMinutes: a?.durationMinutesDefault ?? 5,
    summary: a?.summary ?? '',
    howText: a ? parseHowLines(a.howTo).join('\n') : '',
    watchFor: a?.watchFor ?? '',
    safety: a?.safetyLine ?? '',
    equipment: a?.defaultStationEquipment ?? [],
  }))
  const [sourceUrl, setSourceUrl] = useState(a?.source?.url ?? '')
  const [sourceCreator, setSourceCreator] = useState(a?.source?.creator ?? '')
  const [sourceTime, setSourceTime] = useState(
    a?.source?.startSeconds !== undefined ? formatSourceTime(a.source.startSeconds) : '',
  )
  const [experienced, setExperienced] = useState(a?.experiencedCoachOnly === true)
  const [issues, setIssues] = useState<OwnIssue[]>([])
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<'conflict' | 'failed' | null>(null)

  if (!entry || !a) return null
  const current = entry

  function set<K extends keyof OwnDraft>(key: K, value: OwnDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const nextIssues = ownActivityIssues(draft)
    setIssues(nextIssues)
    if (nextIssues.length > 0 || saving) return
    const url = sourceUrl.trim()
    let source: BankPatch['source'] = null
    if (url) {
      const start = parseStartTime(sourceTime)
      const clean = sanitizeSource({
        url,
        creator: sourceCreator,
        title: current.activity.source?.url === url ? current.activity.source.title : undefined,
        startSeconds: start ?? undefined,
      })
      if (!clean || start === null) return
      source = clean
    }
    const blockType: BlockType = draft.blockType
    const patch: BankPatch = {
      title: draft.title.trim(),
      block_type: blockType,
      duration_minutes_default: Math.max(1, Math.min(180, Math.round(draft.durationMinutes) || 1)),
      summary: draft.summary.trim(),
      how_to: normalizeHowTo(draft.howText),
      watch_for: draft.watchFor.trim(),
      safety_line: draft.safety.trim() || null,
      default_station_equipment: blockType === 'techniques' && draft.equipment.length > 0 ? draft.equipment : null,
      source,
      experienced_coach_only: experienced,
    }
    setSaving(true)
    setError(null)
    const result = await saveRow(current, patch)
    setSaving(false)
    if (result === 'ok') onSaved()
    else if (result === 'conflict') setError('conflict')
    else if (result === 'failed') setError('failed')
  }

  return (
    <div
      className="modal-backdrop own-form-backdrop admin-form-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={UI.adminFormTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form className="modal own-form admin-bank-form" onSubmit={submit}>
        <h2>{UI.adminFormTitle}</h2>
        {issues.length > 0 && (
          <ul className="own-issues">
            {[...new Set(issues)].map((issue) => (
              <li key={issue}>{ISSUE_TEXT[issue]}</li>
            ))}
          </ul>
        )}
        <label className="own-field">
          <span>{UI.ownTitle}</span>
          <input value={draft.title} onChange={(e) => set('title', e.target.value)} maxLength={80} required />
        </label>
        <label className="own-field">
          <span>{UI.filters}</span>
          <select value={draft.blockType} onChange={(e) => set('blockType', e.target.value as BlockType)}>
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
          <textarea rows={2} value={draft.summary} onChange={(e) => set('summary', e.target.value)} maxLength={240} />
        </label>
        <label className="own-field">
          <span>{UI.ownSteps}</span>
          <textarea rows={4} value={draft.howText} onChange={(e) => set('howText', e.target.value)} placeholder={UI.ownStepsHint} />
        </label>
        {draft.blockType === 'techniques' && (
          <div className="own-field own-equipment" role="group" aria-labelledby="admin-equipment-label">
            <span id="admin-equipment-label">{UI.ownEquipment}</span>
            {draft.equipment.length === 0 ? (
              <p className="own-equipment-none">{UI.ownEquipmentNone}</p>
            ) : (
              <ul className="own-equipment-chips">
                {draft.equipment.map((slot: StationEquipmentSlot) => (
                  <li key={slot.pieceId} className="own-equipment-chip">
                    <EquipmentIcon pieceId={slot.pieceId} />
                    <span>{stationEquipmentLabelText(getEquipmentPiece(slot.pieceId)?.labelSv ?? slot.pieceId, slot.count)}</span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-secondary" onClick={() => setPicking(true)}>
              {UI.ownEquipmentPick}
            </button>
          </div>
        )}
        <label className="own-field">
          <span>{UI.watchFor}</span>
          <textarea rows={2} value={draft.watchFor} onChange={(e) => set('watchFor', e.target.value)} maxLength={240} />
        </label>
        <label className="own-field">
          <span>{UI.safety}</span>
          <textarea rows={2} value={draft.safety} onChange={(e) => set('safety', e.target.value)} maxLength={240} />
        </label>
        <label className="own-field">
          <span>{UI.adminFormSourceUrl}</span>
          <input
            type="url"
            inputMode="url"
            pattern="https://.+"
            maxLength={300}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </label>
        <label className="own-field">
          <span>{UI.adminFormSourceCreator}</span>
          <input value={sourceCreator} maxLength={80} required={sourceUrl.trim() !== ''} onChange={(e) => setSourceCreator(e.target.value)} />
        </label>
        <label className="own-field">
          <span>{UI.adminFormSourceTime}</span>
          <input
            inputMode="numeric"
            pattern="\d{1,2}(:\d{2}){1,2}"
            value={sourceTime}
            onChange={(e) => setSourceTime(e.target.value)}
          />
        </label>
        <label className="admin-form-check">
          <input type="checkbox" checked={experienced} onChange={(e) => setExperienced(e.target.checked)} />
          <span>{UI.adminFormExperienced}</span>
        </label>
        <p className="muted admin-form-hint">{UI.adminFormHint}</p>
        {!online && <p className="admin-offline muted">{UI.adminOffline}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {UI.adminCancel}
          </button>
          <button type="submit" className="btn-primary" disabled={!online || saving}>
            {UI.adminFormSave}
          </button>
        </div>
        {error && (
          <p className="admin-error" role="alert">
            {error === 'conflict' ? UI.adminSaveConflict : UI.adminSaveFailed}
          </p>
        )}
      </form>
      {picking && (
        <StationComposeSheet
          activityTitle={draft.title}
          title={UI.ownEquipmentPick}
          backdropClassName="own-equipment-picker"
          initialSlots={draft.equipment}
          onClose={() => setPicking(false)}
          onSave={(slots) => {
            set('equipment', slots)
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}

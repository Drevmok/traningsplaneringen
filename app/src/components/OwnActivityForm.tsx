import { useState, type FormEvent } from 'react'
import { BLOCK_LABELS, BLOCK_ORDER, UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import {
  ownActivityIssues,
  parseHowLines,
  saveOwnActivity,
  type OwnDraft,
  type OwnIssue,
} from '../lib/ownActivities'
import type { Activity, BlockType } from '../types'

interface Props {
  initial: Activity | null
  blockType: BlockType
  onSaved: () => void
  onCancel: () => void
}

function linesFromActivity(activity: Activity | null): string {
  if (!activity) return ''
  return parseHowLines(activity.howTo).join('\n')
}

const ISSUE_TEXT: Record<OwnIssue, string> = {
  title: UI.ownNeedTitle,
  why: UI.ownNeedWhy,
  how: UI.ownNeedHow,
  'how-too-long': UI.ownNeedHow,
  watch: UI.ownNeedWatch,
  safety: UI.ownNeedSafety,
}

export function OwnActivityForm({ initial, blockType, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<OwnDraft>(() => ({
    title: initial?.title ?? '',
    blockType: initial?.blockType ?? blockType,
    durationMinutes: initial?.durationMinutesDefault ?? 5,
    summary: initial?.summary ?? '',
    howText: linesFromActivity(initial),
    watchFor: initial?.watchFor ?? '',
    safety: initial?.safetyLine ?? '',
  }))
  const [issues, setIssues] = useState<OwnIssue[]>([])
  const [full, setFull] = useState(false)
  useBodyScrollLock(true)

  function set<K extends keyof OwnDraft>(key: K, value: OwnDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const nextIssues = ownActivityIssues(draft)
    setIssues(nextIssues)
    setFull(false)
    if (nextIssues.length > 0) return
    const saved = saveOwnActivity(draft, initial?.id)
    if (!saved.ok) {
      if (saved.reason === 'full') setFull(true)
      return
    }
    onSaved()
  }

  return (
    <div
      className="modal-backdrop own-form-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={initial ? UI.ownEdit : UI.ownNew}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form className="modal own-form" onSubmit={submit}>
        <h2>{initial ? UI.ownEdit : UI.ownNew}</h2>
        <p>{UI.ownHint}</p>
        {issues.length > 0 && (
          <ul className="own-issues">
            {[...new Set(issues)].map((issue) => (
              <li key={issue}>{ISSUE_TEXT[issue]}</li>
            ))}
          </ul>
        )}
        {full && <p className="own-issues">{UI.ownFull}</p>}
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
            max={60}
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
    </div>
  )
}

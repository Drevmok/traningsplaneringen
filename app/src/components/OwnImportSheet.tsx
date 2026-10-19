import { useMemo, useState } from 'react'
import { BLOCK_LABELS, ownImportConfirmText, ownImportMissingText, UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { importPendingRows } from '../lib/admin/bankWrite'
import { useAdminBank, useOnline } from '../lib/admin/useAdmin'
import {
  chosenActivities,
  parseExerciseFile,
  resolveRows,
  type ImportFailure,
  type ImportRow,
  type ResolvedRow,
  type RowChoice,
  type RowNote,
  type RowState,
} from '../lib/ownImport'

interface Props {
  /** Slice 47 F1 (Admin only): called with the number of new pending bank rows. */
  onImported: (count: number) => void
  onClose: () => void
}

const FAILURE_TEXT: Record<ImportFailure, string> = {
  bad: UI.ownImportBad,
  newer: UI.ownImportNewer,
  empty: UI.ownImportEmpty,
  isPass: UI.ownImportIsPass,
}

const STATE_TEXT: Record<RowState, string> = {
  new: UI.ownImportStateNew,
  sameName: UI.ownImportStateSameName,
  invalid: UI.ownImportStateInvalid,
}

function noteText(note: RowNote): string {
  switch (note.kind) {
    case 'clipped':
      return UI.ownImportNoteClipped
    case 'steps':
      return UI.ownImportNoteSteps
    case 'unknownPiece':
      return UI.ownImportNoteUnknownPiece.replace('{list}', note.pieces.join(', '))
    case 'notTeknik':
      return UI.ownImportNoteNotTeknik
    case 'link':
      return UI.ownImportNoteLink
    case 'source':
      return UI.ownImportNoteSource
    case 'dupId':
      return UI.ownImportNoteDupId
    case 'badFormat':
      return UI.ownImportNoteBadFormat
    case 'missing':
      return ownImportMissingText(note.fields)
  }
}

function rowNotes(row: ResolvedRow): string[] {
  const lines = row.notes.map(noteText)
  if (row.state === 'sameName') lines.push(UI.adminImportNoteSameName)
  return lines
}

interface Preview {
  batchNote?: string
  rows: ImportRow[]
}

export default function OwnImportSheet({ onImported, onClose }: Props) {
  const bank = useAdminBank()
  const online = useOnline()
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState(false)
  const [code, setCode] = useState('')
  const [fileText, setFileText] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [choices, setChoices] = useState<Map<number, RowChoice>>(() => new Map())

  useBodyScrollLock(true)

  const resolved = useMemo(
    () => (preview ? resolveRows(preview.rows, choices) : []),
    [preview, choices],
  )
  const chosen = chosenActivities(resolved)
  const count = chosen.length

  function read(text: string) {
    const result = parseExerciseFile(text, { titles: bank.entries.map((e) => e.activity.title) })
    if (!result.ok) {
      setPreview(null)
      setError(FAILURE_TEXT[result.reason])
      return
    }
    setError(null)
    setChoices(new Map())
    setPreview({ batchNote: result.batchNote, rows: result.rows })
  }

  function choose(index: number, choice: RowChoice) {
    setChoices((prev) => new Map(prev).set(index, choice))
  }

  async function confirm() {
    if (busy || count === 0) return
    setBusy(true)
    setWriteError(false)
    const { count: done } = await importPendingRows(chosen)
    setBusy(false)
    // Stops at the first failure; what went in is reported by the toast, the rest stays in the file.
    if (done > 0) onImported(done)
    else setWriteError(true)
  }

  const input = fileText ?? code

  return (
    <div
      className="modal-backdrop own-import-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="own-import-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal own-import">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={UI.ownImportCloseAria}
          title={UI.ownImportCloseAria}
        >
          ×
        </button>
        <h2 id="own-import-title">{UI.ownImportTitle}</h2>
        <p className="muted">{UI.ownImportHint}</p>

        <div className="own-import-input">
          <label className="btn-secondary receive-file">
            {UI.ownImportFile}
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                void file.text().then((text) => {
                  setFileText(text)
                  setFileName(file.name)
                  read(text)
                })
              }}
            />
          </label>
          {fileName && <p className="own-import-file muted">{fileName}</p>}
          <label className="own-field">
            <span>{UI.ownImportPaste}</span>
            <textarea
              rows={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setFileText(null)
                setFileName('')
              }}
            />
          </label>
          <button
            type="button"
            className="btn-secondary"
            disabled={input.trim().length === 0}
            onClick={() => read(input)}
          >
            {UI.ownImportRead}
          </button>
          {error && (
            <p className="own-import-error" role="alert">
              {error}
            </p>
          )}
        </div>

        {preview && (
          <section className="own-import-preview" aria-live="polite">
            {preview.batchNote && <p className="own-import-batch muted">{preview.batchNote}</p>}
            <ul className="own-import-rows">
              {resolved.map((row) => (
                <li
                  key={row.index}
                  className={`own-import-row is-${row.state}`}
                  data-state={row.state}
                >
                  <div className="own-import-row-head">
                    <strong className="own-import-row-title">{row.title || '—'}</strong>
                    {row.blockType && (
                      <span className="own-import-row-meta">
                        {BLOCK_LABELS[row.blockType]}
                        {row.minutes !== undefined ? ` · ${row.activity?.durationMinutesDefault ?? row.minutes} min` : ''}
                      </span>
                    )}
                  </div>
                  <div className="own-import-row-foot">
                    <span className="own-import-state">{STATE_TEXT[row.state]}</span>
                    <select
                      className="own-import-choice"
                      aria-label={UI.ownImportChoiceAria.replace('{title}', row.title || '—')}
                      value={row.choice}
                      disabled={row.locked}
                      onChange={(e) => choose(row.index, e.target.value as RowChoice)}
                    >
                      <option value="include">{UI.ownImportInclude}</option>
                      <option value="skip">{UI.ownImportSkip}</option>
                    </select>
                  </div>
                  {rowNotes(row).map((line) => (
                    <p key={line} className="own-import-note">
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!online && <p className="admin-offline muted">{UI.adminOffline}</p>}
        {writeError && (
          <p className="admin-error" role="alert">
            {UI.adminSaveFailed}
          </p>
        )}
        <div className="modal-actions own-import-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {UI.ownImportCancel}
          </button>
          {preview && (
            <button
              type="button"
              className="btn-primary"
              disabled={count === 0 || !online || busy}
              onClick={() => void confirm()}
            >
              {ownImportConfirmText(count)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

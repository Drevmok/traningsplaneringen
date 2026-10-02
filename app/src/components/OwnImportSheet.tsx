import { useMemo, useState } from 'react'
import {
  BLOCK_LABELS,
  ownImportConfirmText,
  ownImportMissingText,
  ownImportRoomText,
  UI,
} from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import {
  applyImport,
  chosenCount,
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
  /** Called after the one write with the number of drills added or replaced. */
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
  exists: UI.ownImportStateExists,
  invalid: UI.ownImportStateInvalid,
  noRoom: UI.ownImportStateNoRoom,
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
  if (row.state === 'sameName') lines.push(UI.ownImportNoteSameName)
  if (row.state === 'exists' && row.choice === 'replace') lines.push(UI.ownImportNoteExists)
  return lines
}

interface Preview {
  batchNote?: string
  rows: ImportRow[]
  room: number
}

export function OwnImportSheet({ onImported, onClose }: Props) {
  const [code, setCode] = useState('')
  const [fileText, setFileText] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [choices, setChoices] = useState<Map<number, RowChoice>>(() => new Map())

  useBodyScrollLock(true)

  const resolved = useMemo(
    () => (preview ? resolveRows(preview.rows, choices, preview.room) : []),
    [preview, choices],
  )
  const count = chosenCount(resolved)

  function read(text: string) {
    const result = parseExerciseFile(text)
    if (!result.ok) {
      setPreview(null)
      setError(FAILURE_TEXT[result.reason])
      return
    }
    setError(null)
    setChoices(new Map())
    setPreview({ batchNote: result.batchNote, rows: result.rows, room: result.room })
  }

  function choose(index: number, choice: RowChoice) {
    setChoices((prev) => new Map(prev).set(index, choice))
  }

  function confirm() {
    const result = applyImport(resolved)
    if (!result.ok) return
    onImported(result.count)
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
            <p className="own-import-room">{ownImportRoomText(preview.room)}</p>
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
                      {row.state === 'exists' ? (
                        <>
                          <option value="skip">{UI.ownImportSkip}</option>
                          <option value="replace">{UI.ownImportReplace}</option>
                        </>
                      ) : (
                        <>
                          <option value="include">{UI.ownImportInclude}</option>
                          <option value="skip">{UI.ownImportSkip}</option>
                        </>
                      )}
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

        <div className="modal-actions own-import-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {UI.ownImportCancel}
          </button>
          {preview && (
            <button
              type="button"
              className="btn-primary"
              disabled={count === 0}
              onClick={confirm}
            >
              {ownImportConfirmText(count)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

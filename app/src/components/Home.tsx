import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { loadDraft, clearDraft } from '../lib/session'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { sessionFromTransfer } from '../lib/sharePass'
import { isExerciseFile } from '../lib/ownImport'
import type { Session } from '../types'
import heroUrl from '../assets/home-hero.jpg'
import { HomeWizard, type WizardFinishAnswers } from './HomeWizard'
import { ReplaceDraftConfirm } from './ReplaceDraftConfirm'

interface Props {
  onNew: () => void
  onTemplate: () => void
  onContinue: () => void
  onWizardFinish: (answers: WizardFinishAnswers) => void
  onReceive: (session: Session) => void
}

export function Home({
  onNew,
  onTemplate,
  onContinue,
  onWizardFinish,
  onReceive,
}: Props) {
  const [draft, setDraft] = useState(() => loadDraft())
  const [confirmClear, setConfirmClear] = useState(false)
  useBodyScrollLock(confirmClear)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [code, setCode] = useState('')
  const [receiveError, setReceiveError] = useState<string | null>(null)
  const [pendingReceive, setPendingReceive] = useState<Session | null>(null)

  function handleWizardFinish(answers: WizardFinishAnswers) {
    setWizardOpen(false)
    onWizardFinish(answers)
  }

  async function takeTransfer(text: string) {
    // Slice 30 — an exercise file belongs in Bibliotek; the draft stays as it is.
    if (isExerciseFile(text)) {
      setReceiveError(UI.importIsExercises)
      return
    }
    const next = await sessionFromTransfer(text)
    if (!next) {
      setReceiveError(UI.receiveBad)
      return
    }
    setReceiveError(null)
    if (draft) setPendingReceive(next)
    else onReceive(next)
  }

  return (
    <div className="home home-entry">
      <div className="home-hero" aria-hidden="true">
        <img src={heroUrl} alt="" />
      </div>
      <div className="home-pane">
      <div className="home-entry-main">
        <h1>{UI.appName}</h1>
        <p className="home-promise">{UI.homePromise}</p>

        <div className="home-start">
          {draft ? (
            <button
              type="button"
              className="btn-primary home-start-primary"
              onClick={onContinue}
            >
              <span>{UI.continuePass}</span>
              <span className="home-start-meta">
                {draft.title} · {draft.totalMinutes} min
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary home-start-primary"
              onClick={() => setWizardOpen(true)}
            >
              {UI.homeWizardPrimary}
            </button>
          )}

          <div className="home-start-links">
            <button type="button" className="btn-text home-alt" onClick={onNew}>
              {UI.emptyPass}
            </button>
            <button type="button" className="btn-text home-alt" onClick={onTemplate}>
              {UI.fromTemplate}
            </button>
          </div>
          {draft && (
            <button
              type="button"
              className="btn-text home-clear"
              onClick={() => setConfirmClear(true)}
            >
              {UI.clearPass}
            </button>
          )}
        </div>
      </div>

      <div className="home-entry-foot">
        <p className="home-start-note">{UI.draftHonestyBodyShort}</p>
        <button
          type="button"
          className="btn-text home-fetch"
          aria-expanded={receiveOpen}
          onClick={() => setReceiveOpen((open) => !open)}
        >
          {UI.fetchPass}
        </button>
        {receiveOpen && (
          <div className="home-receive">
            <p className="home-start-note">{UI.receiveHint}</p>
            <label className="btn-secondary receive-file">
              {UI.importFile}
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void file.text().then((text) => takeTransfer(text))
                }}
              />
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label={UI.pasteCode}
              placeholder={UI.pasteCode}
              rows={3}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={code.trim().length === 0}
              onClick={() => void takeTransfer(code)}
            >
              {UI.openCode}
            </button>
            {receiveError && <p role="alert">{receiveError}</p>}
          </div>
        )}
      </div>
      </div>

      {confirmClear && (
        <div
          className="modal-backdrop replace-draft-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={UI.clearPassTitle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmClear(false)
          }}
        >
          <div className="modal">
            <h2>{UI.clearPassTitle}</h2>
            <p>{UI.clearPassBody}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmClear(false)}
              >
                {UI.wizardCancel}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  clearDraft()
                  setDraft(null)
                  setConfirmClear(false)
                }}
              >
                {UI.clearPassConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingReceive && (
        <ReplaceDraftConfirm
          onCancel={() => setPendingReceive(null)}
          onConfirm={() => {
            const next = pendingReceive
            setPendingReceive(null)
            onReceive(next)
          }}
        />
      )}

      {wizardOpen && (
        <HomeWizard
          onFinish={handleWizardFinish}
          onCancel={() => setWizardOpen(false)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { loadDraft } from '../lib/session'
import { sessionFromTransfer } from '../lib/sharePass'
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
  const draft = loadDraft()
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
        <div className="home-mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 16.5 14 10l10 6.5L14 23Z" fill="currentColor" />
            <path d="M4 16.5 14 23v3.2L4 19.7Z" fill="currentColor" opacity="0.55" />
            <path d="M24 16.5 14 23v3.2l10-6.5Z" fill="currentColor" opacity="0.35" />
          </svg>
        </div>
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

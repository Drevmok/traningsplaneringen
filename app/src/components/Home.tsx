import { useState } from 'react'
import { UI } from '../data/blockMeta'
import { loadDraft } from '../lib/session'
import { sessionFromTransfer } from '../lib/sharePass'
import type { Session } from '../types'
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
    <div className="home">
      <header className="home-header">
        <h1>{UI.appName}</h1>
      </header>

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
          <button type="button" className="btn-text" onClick={onNew}>
            {UI.emptyPass}
          </button>
          <button type="button" className="btn-text" onClick={onTemplate}>
            {UI.fromTemplate}
          </button>
        </div>

        <p className="home-start-note">{UI.draftHonestyBodyShort}</p>

        <button
          type="button"
          className="btn-text"
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

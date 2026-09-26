import { useRef, useState } from 'react'
import { UI } from '../data/blockMeta'
import {
  anyTipsHidden,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { hasDraft } from '../lib/session'
import { KomIgangCard, type KomIgangAction } from './KomIgangCard'

interface Props {
  tips: CoachTipsStateV1
  itemCount: number
  canOpenHall: boolean
  onNew: () => void
  onTemplate: () => void
  onContinue: () => void
  onOpenBuilder: () => void
  onOpenHall: () => boolean
  onOpenGolvklart: () => boolean
  onDismissChecklist: () => void
  onShowTipsAgain: () => 'restored' | 'already'
  onChecklistStepDone: (action: KomIgangAction) => void
  onKomIgangCollapseChange?: (collapsed: boolean) => void
}

export function Home({
  tips,
  itemCount,
  canOpenHall,
  onNew,
  onTemplate,
  onContinue,
  onOpenBuilder,
  onOpenHall,
  onOpenGolvklart,
  onDismissChecklist,
  onShowTipsAgain,
  onChecklistStepDone,
  onKomIgangCollapseChange,
}: Props) {
  const draftExists = hasDraft()
  const actionsRef = useRef<HTMLDivElement>(null)
  const [stepHint, setStepHint] = useState<string | null>(null)
  const [tipsFeedback, setTipsFeedback] = useState<string | null>(null)

  function flashHint(msg: string) {
    setStepHint(msg)
    window.setTimeout(() => setStepHint(null), 2800)
  }

  function handleStep(action: KomIgangAction) {
    onChecklistStepDone(action)
    if (action === 'chooseOrBuild') {
      actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      actionsRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
      return
    }
    if (action === 'addActivities') {
      onOpenBuilder()
      return
    }
    if (action === 'openHall') {
      if (!onOpenHall()) {
        flashHint(UI.komIgangNeedActivity)
      }
      return
    }
    if (action === 'openGolvklart') {
      if (!onOpenGolvklart()) {
        flashHint(
          itemCount < 1 ? UI.komIgangNeedActivity : UI.komIgangNeedHall,
        )
      }
    }
  }

  function handleShowTipsAgain() {
    const result = onShowTipsAgain()
    setTipsFeedback(
      result === 'restored' ? UI.visaTipsIgenDone : UI.visaTipsIgenAlready,
    )
    window.setTimeout(() => setTipsFeedback(null), 2200)
  }

  return (
    <div className="home">
      <header className="home-header">
        <p className="home-eyebrow">{UI.home}</p>
        <h1>{UI.appName}</h1>
        <p className="home-invite">{UI.homeInvite}</p>
      </header>

      <KomIgangCard
        key={`kom-${Boolean(tips.showTipsAgain)}-${tips.checklistDismissed}`}
        tips={tips}
        itemCount={itemCount}
        canOpenHall={canOpenHall}
        onDismiss={onDismissChecklist}
        onStep={handleStep}
        onCollapseChange={onKomIgangCollapseChange}
        stepHint={stepHint}
      />

      <div className="home-actions" ref={actionsRef}>
        <button type="button" className="home-card primary" onClick={onNew}>
          <span className="home-card-icon" aria-hidden>
            ➕
          </span>
          <span className="home-card-title">{UI.newSession}</span>
          <span className="home-card-desc">{UI.planFirst}</span>
        </button>

        <button type="button" className="home-card" onClick={onTemplate}>
          <span className="home-card-icon" aria-hidden>
            📋
          </span>
          <span className="home-card-title">{UI.startFromTemplate}</span>
          <span className="home-card-desc">{UI.browseTemplates}</span>
        </button>

        <button
          type="button"
          className="home-card"
          onClick={onContinue}
          disabled={!draftExists}
          title={draftExists ? undefined : 'Inget sparat utkast ännu'}
        >
          <span className="home-card-icon" aria-hidden>
            📝
          </span>
          <span className="home-card-title">{UI.continueDraft}</span>
          <span className="home-card-desc">
            {draftExists
              ? 'Öppna det du sparade senast.'
              : 'Inget utkast sparat ännu.'}
          </span>
        </button>
      </div>

      <div className="home-tips-again no-print">
        <button
          type="button"
          className="btn-text visa-tips-igen"
          onClick={handleShowTipsAgain}
        >
          {UI.visaTipsIgen}
        </button>
        {tipsFeedback && (
          <span className="visa-tips-feedback" role="status">
            {tipsFeedback}
          </span>
        )}
        {!tipsFeedback && anyTipsHidden(tips) && (
          <span className="visa-tips-hint">Återställ dolda tips</span>
        )}
      </div>

      {/* Slice 10 — always-on localStorage honesty (no-print; not dismissible) */}
      <aside
        className="home-honesty no-print"
        aria-labelledby="home-honesty-title"
      >
        <h2 id="home-honesty-title" className="home-honesty-title">
          {UI.draftHonestyTitle}
        </h2>
        <p className="home-honesty-body">{UI.draftHonestyBody}</p>
        <p className="home-honesty-other">{UI.draftHonestyOtherDevice}</p>
      </aside>
    </div>
  )
}

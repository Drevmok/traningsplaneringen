import { useState } from 'react'
import {
  CHECKLIST_TOTAL,
  checklistAllDone,
  checklistDoneCount,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { komIgangProgressText, UI } from '../data/blockMeta'

export type KomIgangAction =
  | 'chooseOrBuild'
  | 'addActivities'
  | 'openHall'
  | 'openGolvklart'

interface Props {
  tips: CoachTipsStateV1
  itemCount: number
  canOpenHall: boolean
  onDismiss: () => void
  onStep: (action: KomIgangAction) => void
  /** Slice 22 B1 — persist collapse preference */
  onCollapseChange?: (collapsed: boolean) => void
  stepHint?: string | null
}

type Step = {
  key: keyof CoachTipsStateV1['checklist']
  action: KomIgangAction
  label: string
  hint: string
  disabled?: boolean
  disabledReason?: string
}

export function KomIgangCard({
  tips,
  itemCount,
  canOpenHall,
  onDismiss,
  onStep,
  onCollapseChange,
  stepHint,
}: Props) {
  const done = checklistDoneCount(tips)
  const allDone = checklistAllDone(tips)

  // B1: default collapsed when progress > 0 OR previously collapsed
  const [expanded, setExpanded] = useState(
    () => !(done > 0 || tips.komIgangCollapsed === true),
  )

  if (tips.checklistDismissed) return null

  function collapse() {
    setExpanded(false)
    onCollapseChange?.(true)
  }

  function expand() {
    setExpanded(true)
    onCollapseChange?.(false)
  }

  const steps: Step[] = [
    {
      key: 'chooseOrBuildPass',
      action: 'chooseOrBuild',
      label: UI.komIgangStep1,
      hint: UI.komIgangStep1Hint,
    },
    {
      key: 'addActivities',
      action: 'addActivities',
      label: UI.komIgangStep2,
      hint: UI.komIgangStep2Hint,
    },
    {
      key: 'openHallAndPlace',
      action: 'openHall',
      label: UI.komIgangStep3,
      hint: UI.komIgangStep3Hint,
      disabled: !canOpenHall,
      disabledReason: UI.komIgangNeedActivity,
    },
    {
      // Slice 16 — soft compose step; CTA opens Hallöversikt (same path as place)
      key: 'composeStationEquipment',
      action: 'openHall',
      label: UI.komIgangStepCompose,
      hint: UI.komIgangStepComposeHint,
      disabled: !canOpenHall,
      disabledReason:
        itemCount < 1 ? UI.komIgangNeedActivity : UI.komIgangNeedComposeHall,
    },
    {
      // Soft only — never disabled for missing compose (locked D)
      key: 'useGolvklart',
      action: 'openGolvklart',
      label: UI.komIgangStep4,
      hint: UI.komIgangStep4Hint,
      disabled: !canOpenHall,
      disabledReason:
        itemCount < 1 ? UI.komIgangNeedActivity : UI.komIgangNeedHall,
    },
  ]

  if (!expanded) {
    return (
      <section
        className="kom-igang kom-igang--collapsed no-print"
        aria-labelledby="kom-igang-title"
      >
        <div className="kom-igang-summary">
          <div className="kom-igang-summary-text">
            <h2 id="kom-igang-title" className="kom-igang-title">
              {UI.komIgangTitle}
            </h2>
            <p className="kom-igang-progress" aria-live="polite">
              {komIgangProgressText(done, CHECKLIST_TOTAL)}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary hall-tap-target kom-igang-toggle"
            aria-label={UI.komIgangExpandAria}
            aria-expanded={false}
            onClick={expand}
          >
            {UI.komIgangExpand}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="kom-igang no-print"
      aria-labelledby="kom-igang-title"
    >
      <div className="kom-igang-header">
        <h2 id="kom-igang-title" className="kom-igang-title">
          {UI.komIgangTitle}
        </h2>
        <div className="kom-igang-header-actions">
          <button
            type="button"
            className="btn-secondary hall-tap-target kom-igang-toggle"
            aria-label={UI.komIgangCollapseAria}
            aria-expanded={true}
            onClick={collapse}
          >
            {UI.komIgangCollapse}
          </button>
          <button
            type="button"
            className="kom-igang-dismiss"
            aria-label={UI.komIgangDismiss}
            onClick={onDismiss}
          >
            {UI.komIgangDismiss}
          </button>
        </div>
      </div>
      <p className="kom-igang-intro">{UI.komIgangIntro}</p>
      <p className="kom-igang-progress" aria-live="polite">
        {komIgangProgressText(done, CHECKLIST_TOTAL)}
      </p>

      {allDone ? (
        <div className="kom-igang-all-done">
          <p>{UI.komIgangAllDone}</p>
          <p className="kom-igang-all-done-hint">{UI.komIgangAllDoneHint}</p>
        </div>
      ) : (
        <ul className="kom-igang-list">
          {steps.map((step) => {
            const isDone = tips.checklist[step.key]
            return (
              <li key={step.key} className="kom-igang-step">
                <button
                  type="button"
                  className={`kom-igang-step-btn${isDone ? ' is-done' : ''}${
                    step.disabled && !isDone ? ' is-disabled' : ''
                  }`}
                  aria-checked={isDone}
                  role="checkbox"
                  disabled={step.disabled && !isDone}
                  title={
                    step.disabled && !isDone ? step.disabledReason : undefined
                  }
                  onClick={() => onStep(step.action)}
                >
                  <span className="kom-igang-check" aria-hidden>
                    {isDone ? '✓' : ''}
                  </span>
                  <span className="kom-igang-step-text">
                    <span className="kom-igang-step-label">{step.label}</span>
                    <span className="kom-igang-step-hint">{step.hint}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {stepHint && (
        <p className="kom-igang-step-feedback" role="status">
          {stepHint}
        </p>
      )}

      <button
        type="button"
        className="btn-text kom-igang-alt-dismiss"
        onClick={onDismiss}
      >
        {UI.komIgangDismissAlt}
      </button>
    </section>
  )
}

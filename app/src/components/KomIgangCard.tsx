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
  stepHint,
}: Props) {
  if (tips.checklistDismissed) return null

  const done = checklistDoneCount(tips)
  const allDone = checklistAllDone(tips)

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

  return (
    <section
      className="kom-igang no-print"
      aria-labelledby="kom-igang-title"
    >
      <div className="kom-igang-header">
        <h2 id="kom-igang-title" className="kom-igang-title">
          {UI.komIgangTitle}
        </h2>
        <button
          type="button"
          className="kom-igang-dismiss"
          aria-label={UI.komIgangDismiss}
          onClick={onDismiss}
        >
          {UI.komIgangDismiss}
        </button>
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

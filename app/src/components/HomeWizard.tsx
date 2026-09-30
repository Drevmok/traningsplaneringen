import { useState } from 'react'
import { UI, wizardStepProgressText } from '../data/blockMeta'
import { HALL_PRESET_ORDER, HALL_PRESETS } from '../data/hallPresets'
import type { WizardAge, WizardFocus } from '../data/wizardPaths'
import type { HallTemplateId } from '../types'
import { useBodyScrollLock } from '../lib/bodyScrollLock'

export interface WizardFinishAnswers {
  age: WizardAge
  focus: WizardFocus
  hallTemplateId: HallTemplateId
}

interface Props {
  onFinish: (answers: WizardFinishAnswers) => void
  onCancel: () => void
}

const AGE_OPTIONS: { id: WizardAge; label: string }[] = [
  { id: 'age46', label: UI.wizardQ1Age46 },
  { id: 'age79', label: UI.wizardQ1Age79 },
  { id: 'beginner', label: UI.wizardQ1Beginner },
  { id: 'training', label: UI.wizardQ1Training },
]

const FOCUS_OPTIONS: { id: WizardFocus; label: string }[] = [
  { id: 'vault', label: UI.wizardQ2Vault },
  { id: 'trampett', label: UI.wizardQ2Trampett },
  { id: 'tumbling', label: UI.wizardQ2Tumbling },
  { id: 'mixed', label: UI.wizardQ2Mixed },
]

const PRESET_LABEL: Record<HallTemplateId, string> = {
  'forening-bla': UI.hallPresetBla,
  'forening-vit': UI.hallPresetVit,
  'standard-trupp': UI.hallPresetStandard,
  'tavling-linjer': UI.hallPresetTavling,
  'liten-hall': UI.hallPresetLiten,
}

export function HomeWizard({ onFinish, onCancel }: Props) {
  useBodyScrollLock(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [age, setAge] = useState<WizardAge | null>(null)
  const [focus, setFocus] = useState<WizardFocus | null>(null)
  const [hallTemplateId, setHallTemplateId] = useState<HallTemplateId | null>(
    null,
  )

  function handleBack() {
    if (step === 1) {
      onCancel()
      return
    }
    setStep((s) => (s === 3 ? 2 : 1))
  }

  function handleNext() {
    if (step === 1 && age) setStep(2)
    else if (step === 2 && focus) setStep(3)
  }

  function handleFinish() {
    if (!age || !focus || !hallTemplateId) return
    onFinish({ age, focus, hallTemplateId })
  }

  const canNext =
    (step === 1 && age !== null) || (step === 2 && focus !== null)
  const canFinish = step === 3 && hallTemplateId !== null

  return (
    <div
      className="modal-backdrop home-wizard-backdrop no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-wizard-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal home-wizard-sheet">
        <header className="home-wizard-header">
          <div>
            <p className="home-wizard-progress" id="home-wizard-title">
              {wizardStepProgressText(step)}
            </p>
            <h2 className="home-wizard-label">
              {step === 1
                ? UI.wizardQ1Label
                : step === 2
                  ? UI.wizardQ2Label
                  : UI.wizardQ3Label}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            aria-label={UI.wizardClose}
            title={UI.wizardClose}
          >
            ×
          </button>
        </header>

        {step === 3 && (
          <p className="home-wizard-hint muted">{UI.wizardQ3Hint}</p>
        )}

        {(step === 2 || step === 3) && (
          <p className="home-wizard-honesty muted">{UI.wizardFocusHonesty}</p>
        )}

        <div className="home-wizard-options" role="listbox">
          {step === 1 &&
            AGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={age === opt.id}
                className={
                  'home-wizard-chip' + (age === opt.id ? ' selected' : '')
                }
                onClick={() => setAge(opt.id)}
              >
                {opt.label}
              </button>
            ))}

          {step === 2 &&
            FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={focus === opt.id}
                className={
                  'home-wizard-chip' + (focus === opt.id ? ' selected' : '')
                }
                onClick={() => setFocus(opt.id)}
              >
                {opt.label}
              </button>
            ))}

          {step === 3 &&
            HALL_PRESET_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={hallTemplateId === id}
                className={
                  'home-wizard-chip' +
                  (hallTemplateId === id ? ' selected' : '')
                }
                onClick={() => setHallTemplateId(id)}
              >
                {PRESET_LABEL[id] ?? HALL_PRESETS[id].label}
              </button>
            ))}
        </div>

        <div className="home-wizard-actions modal-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            {step === 1 ? UI.wizardCancel : UI.wizardBack}
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canNext}
              onClick={handleNext}
            >
              {UI.wizardNext}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={!canFinish}
              onClick={handleFinish}
            >
              {UI.wizardFinish}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

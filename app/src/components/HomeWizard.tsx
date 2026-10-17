import { useEffect, useRef, useState } from 'react'
import { PASS_LENGTHS, UI, wizardStepProgressText, type PassLength } from '../data/blockMeta'
import { HALL_PRESET_ORDER, HALL_PRESETS } from '../data/hallPresets'
import type { WizardAge, WizardFocus, WizardLevel } from '../data/wizardPaths'
import type { HallTemplateId } from '../types'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { useClubTemplates } from '../lib/clubTemplates'
import type { MallPick } from '../lib/mallApply'
import { loadSavedTemplates } from '../lib/savedTemplates'
import { getTemplateById } from '../lib/session'
import { WIZARD_START, WIZARD_STEPS, wizardAdvance, wizardBack, wizardStepAt, type WizardAnswers, type WizardPos } from '../lib/wizard'
import { MallList } from './MallList'

/** Slice 46: what a finished Planera pass sheet hands to App. */
export type PlanResult =
  | { path: 'questions'; answers: WizardAnswers & { hallTemplateId: HallTemplateId } }
  | { path: 'empty'; hallTemplateId: HallTemplateId; targetMinutes: PassLength }
  | { path: 'mall'; hallTemplateId: HallTemplateId; pick: MallPick }

interface Props {
  onFinish: (result: PlanResult) => void
  onCancel: () => void
}

interface Answers {
  age: WizardAge | null
  level: WizardLevel | null
  focus: WizardFocus | null
  hall: HallTemplateId | null
  length: PassLength | null
}

const AGE_OPTIONS: { id: WizardAge; label: string }[] = [
  { id: 'age46', label: UI.wizardQ1Age46 },
  { id: 'age79', label: UI.wizardQ1Age79 },
  { id: 'age1012', label: UI.wizardQ1Age1012 },
  { id: 'age1318', label: UI.wizardQ1Age1318 },
]

const LEVELS: WizardLevel[] = [9, 8, 7, 6, 5, 4, 3, 2, 1]

const FOCUS_OPTIONS: { id: WizardFocus; label: string }[] = [
  { id: 'vault', label: UI.wizardQ2Vault },
  { id: 'trampett', label: UI.wizardQ2Trampett },
  { id: 'tumbling', label: UI.wizardQ2Tumbling },
  { id: 'mixed', label: UI.wizardQ2Mixed },
]

/** C1: the chosen chip shows for this long, then the next question opens. */
const ADVANCE_MS = 250

function result(pos: WizardPos, a: Answers, pick: MallPick | null): PlanResult | null {
  if (!a.hall) return null
  if (pos.path === 'mall') return pick ? { path: 'mall', hallTemplateId: a.hall, pick } : null
  if (!a.length) return null
  if (pos.path === 'empty') return { path: 'empty', hallTemplateId: a.hall, targetMinutes: a.length }
  if ((!a.age && !a.level) || !a.focus) return null
  return { path: 'questions', answers: { age: a.age, level: a.level, focus: a.focus, hallTemplateId: a.hall, targetMinutes: a.length } }
}

/** Slice 46 — Planera pass: Ålder → Fokus → Hall → Passlängd, or Tomt pass / Starta från mall, one tap per answer. */
export function HomeWizard({ onFinish, onCancel }: Props) {
  useBodyScrollLock(true)
  const club = useClubTemplates()
  const [savedTemplates] = useState(() => loadSavedTemplates())
  const [pos, setPos] = useState<WizardPos>(WIZARD_START)
  const [showLevels, setShowLevels] = useState(false)
  const [answers, setAnswers] = useState<Answers>({ age: null, level: null, focus: null, hall: null, length: null })
  const busy = useRef(false)
  const timer = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const step = wizardStepAt(pos)
  const steps = WIZARD_STEPS[pos.path]

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    heading.current?.focus()
  }, [pos, showLevels])

  /** C1: a tap is the answer; further taps are ignored until the next step opens (no double advance). */
  function choose(patch: Partial<Answers>, pick: MallPick | null = null) {
    if (busy.current) return
    busy.current = true
    const next = { ...answers, ...patch }
    setAnswers(next)
    timer.current = window.setTimeout(() => {
      busy.current = false
      const to = wizardAdvance(pos)
      if (to !== 'finish') {
        setPos(to)
        return
      }
      const done = result(pos, next, pick)
      if (done) onFinish(done)
    }, ADVANCE_MS)
  }

  function go(to: WizardPos) {
    if (busy.current) return
    setShowLevels(false)
    setPos(to)
  }

  function handleBack() {
    if (busy.current) return
    if (step === 'age' && showLevels) {
      setShowLevels(false)
      setAnswers((a) => ({ ...a, level: null }))
      return
    }
    const to = wizardBack(pos)
    if (to) setPos(to)
  }

  type Opt = { key: string | number; label: string; selected: boolean; patch: Partial<Answers> | null }
  const options: Opt[] =
    step === 'age'
      ? showLevels
        ? LEVELS.map((n) => ({ key: n, label: `${UI.wizardQ1Level} ${n}`, selected: answers.level === n, patch: { level: n, age: null } }))
        : [
            ...AGE_OPTIONS.map((o) => ({ key: o.id, label: o.label, selected: answers.age === o.id, patch: { age: o.id, level: null } })),
            { key: 'level', label: UI.wizardQ1Level, selected: answers.level !== null, patch: null },
          ]
      : step === 'focus'
        ? FOCUS_OPTIONS.map((o) => ({ key: o.id, label: o.label, selected: answers.focus === o.id, patch: { focus: o.id } }))
        : step === 'hall'
          ? HALL_PRESET_ORDER.map((id) => ({ key: id, label: HALL_PRESETS[id].label, selected: answers.hall === id, patch: { hall: id } }))
          : step === 'length'
            ? PASS_LENGTHS.map((n) => ({ key: n, label: `${n} ${UI.passLengthMinutes}`, selected: answers.length === n, patch: { length: n } }))
            : []
  function openLevels() {
    if (!busy.current) setShowLevels(true)
  }

  const title =
    step === 'age'
      ? showLevels
        ? UI.wizardQ1Level
        : UI.wizardQ1Label
      : step === 'focus'
        ? UI.wizardQ2Label
        : step === 'hall'
          ? UI.wizardQ3Label
          : step === 'length'
            ? UI.passLength
            : UI.wizardMallLabel
  const hasBack = !(step === 'age' && !showLevels)

  return (
    <div
      className="modal-backdrop home-wizard-backdrop no-print"
      role="dialog"
      aria-modal="true"
      aria-label={UI.homeWizardPrimary}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal home-wizard-sheet">
        <header className="home-wizard-header">
          <div>
            <p className="home-wizard-progress" aria-live="polite">
              {wizardStepProgressText(pos.index + 1, steps.length)}
            </p>
            <h2 className="home-wizard-label" ref={heading} tabIndex={-1}>
              {title}
            </h2>
          </div>
        </header>

        {step === 'age' && showLevels && <p className="home-wizard-hint muted">{UI.wizardLevelsHint}</p>}

        {step === 'mall' ? (
          <div className="home-wizard-malls">
            <MallList
              club={club}
              savedTemplates={savedTemplates}
              onPickBuiltIn={(id) => {
                const item = getTemplateById(id)
                if (item) choose({}, { kind: 'builtin', item })
              }}
              onPickSaved={(id) => {
                const item = savedTemplates.find((t) => t.id === id)
                if (item) choose({}, { kind: 'saved', item })
              }}
              onPickClub={(item) => choose({}, { kind: 'club', item })}
            />
          </div>
        ) : (
          <div className="home-wizard-options" role="listbox" aria-label={title}>
            {options.map((o) => (
              <button
                key={o.key}
                type="button"
                role="option"
                aria-selected={o.selected}
                className={'home-wizard-chip' + (o.selected ? ' selected' : '')}
                onClick={() => (o.patch ? choose(o.patch) : openLevels())}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {step === 'age' && !showLevels && (
          <div className="home-wizard-alt">
            <button type="button" className="btn-text" onClick={() => go({ path: 'mall', index: 0 })}>
              {UI.startFromTemplate}
            </button>
            <button type="button" className="btn-text" onClick={() => go({ path: 'empty', index: 0 })}>
              {UI.emptyPass}
            </button>
          </div>
        )}

        <div className="home-wizard-actions">
          {hasBack && (
            <button type="button" className="btn-secondary" onClick={handleBack}>
              {UI.wizardBack}
            </button>
          )}
          <button type="button" className="btn-text home-wizard-cancel" onClick={onCancel}>
            {UI.wizardCancel}
          </button>
        </div>
      </div>
    </div>
  )
}

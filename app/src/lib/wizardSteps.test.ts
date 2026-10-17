import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { wizardStepProgressText } from '../data/blockMeta.ts'
import { HALL_PRESETS } from '../data/hallPresets.ts'
import { placeableItems } from './hall.ts'
import { composeWizardSession, WIZARD_START, WIZARD_STEPS, wizardAdvance, wizardBack, wizardStepAt, type WizardPos } from './wizard.ts'

describe('Slice 46 — Planera pass steps', () => {
  it('three paths', () => {
    assert.deepEqual(WIZARD_STEPS.questions, ['age', 'focus', 'hall', 'length'])
    assert.deepEqual(WIZARD_STEPS.empty, ['hall', 'length'])
    assert.deepEqual(WIZARD_STEPS.mall, ['hall', 'mall'])
    assert.equal(wizardStepAt(WIZARD_START), 'age')
  })
  it('an answer moves on; the last step of each path finishes', () => {
    let pos: WizardPos = WIZARD_START
    const seen = [wizardStepAt(pos)]
    for (;;) {
      const to = wizardAdvance(pos)
      if (to === 'finish') break
      pos = to
      seen.push(wizardStepAt(pos))
    }
    assert.deepEqual(seen, ['age', 'focus', 'hall', 'length'])
    assert.equal(wizardAdvance({ path: 'empty', index: 1 }), 'finish')
    assert.equal(wizardAdvance({ path: 'mall', index: 1 }), 'finish')
  })
  it('Tillbaka: none on Ålder; one step back; Hall of Tomt pass / mall returns to Ålder', () => {
    assert.equal(wizardBack(WIZARD_START), null)
    assert.deepEqual(wizardBack({ path: 'questions', index: 3 }), { path: 'questions', index: 2 })
    assert.deepEqual(wizardBack({ path: 'empty', index: 0 }), WIZARD_START)
    assert.deepEqual(wizardBack({ path: 'mall', index: 0 }), WIZARD_START)
    assert.deepEqual(wizardBack({ path: 'mall', index: 1 }), { path: 'mall', index: 0 })
  })
  it('progress line', () => {
    assert.equal(wizardStepProgressText(2, 4), 'Fråga 2 av 4')
    assert.equal(wizardStepProgressText(1, 2), 'Fråga 1 av 2')
  })
})

describe('Slice 46 D1 — composeWizardSession sets the pass length only', () => {
  for (const hall of ['forening-vit', 'forening-bla'] as const) {
    it(`${HALL_PRESETS[hall].label}, 90 min`, () => {
      const s = composeWizardSession({ age: 'age79', level: null, focus: 'trampett', hallTemplateId: hall, targetMinutes: 90 })
      assert.equal(s.targetMinutes, 90)
      assert.equal(s.totalMinutes, 53)
      assert.equal(s.hallTemplateId, hall)
      assert.deepEqual((s.hallPlacements ?? []).map((p) => p.sessionItemId), placeableItems(s).map((i) => i.id))
    })
  }
})

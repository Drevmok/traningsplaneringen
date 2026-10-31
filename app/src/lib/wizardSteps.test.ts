import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { clubSectionVisible } from '../components/ClubTemplates.tsx'
import { PASS_LENGTHS, wizardStepProgressText } from '../data/blockMeta.ts'
import { getActivityById } from '../data/seedActivities.ts'
import { splitMinutes, WIZARD_BLOCK_MINUTES } from '../data/wizardPaths.ts'
import { HALL_PRESETS } from '../data/hallPresets.ts'
import { placeableItems } from './hall.ts'
import { composeWizardSession, WIZARD_START, WIZARD_STEPS, wizardAdvance, wizardBack, wizardStepAt, type WizardPos } from './wizard.ts'

describe('Slice 46 — Planera pass steps', () => {
  it('three paths', () => {
    assert.deepEqual(WIZARD_STEPS.questions, ['age', 'focus', 'hall', 'length'])
    assert.deepEqual(WIZARD_STEPS.empty, ['hall', 'length'])
    assert.deepEqual(WIZARD_STEPS.mall, ['hall', 'mall', 'length'])
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
    assert.deepEqual(wizardAdvance({ path: 'mall', index: 1 }), { path: 'mall', index: 2 })
    assert.equal(wizardAdvance({ path: 'mall', index: 2 }), 'finish')
  })
  it('Tillbaka: none on Ålder; one step back; Hall of Tomt pass / mall returns to Ålder', () => {
    assert.equal(wizardBack(WIZARD_START), null)
    assert.deepEqual(wizardBack({ path: 'questions', index: 3 }), { path: 'questions', index: 2 })
    assert.deepEqual(wizardBack({ path: 'empty', index: 0 }), WIZARD_START)
    assert.deepEqual(wizardBack({ path: 'mall', index: 0 }), WIZARD_START)
    assert.deepEqual(wizardBack({ path: 'mall', index: 1 }), { path: 'mall', index: 0 })
    assert.deepEqual(wizardBack({ path: 'mall', index: 2 }), { path: 'mall', index: 1 })
  })
  it('progress line', () => {
    assert.equal(wizardStepProgressText(2, 4), 'Fråga 2 av 4')
    assert.equal(wizardStepProgressText(1, 2), 'Fråga 1 av 2')
  })
})

describe('Slice 49 A1 — the pass length sets the times', () => {
  const ages = ['age46', 'age79', 'age1012', 'age1318'] as const
  const focuses = ['vault', 'trampett', 'tumbling', 'mixed'] as const
  for (const hall of ['forening-vit', 'forening-bla'] as const) {
    for (const len of PASS_LENGTHS) {
      it(`${HALL_PRESETS[hall].label}, ${len} min: total, block sums, whole minutes, saved redskap`, () => {
        for (const age of ages) {
          for (const focus of focuses) {
            const s = composeWizardSession({ age, level: null, focus, hallTemplateId: hall, targetMinutes: len })
            assert.equal(s.targetMinutes, len)
            assert.equal(s.totalMinutes, len)
            assert.equal(s.hallTemplateId, hall)
            assert.deepEqual((s.hallPlacements ?? []).map((p) => p.sessionItemId), placeableItems(s).map((i) => i.id))
            for (const b of s.blocks) {
              assert.equal(b.items.reduce((n, it) => n + it.durationMinutes, 0), WIZARD_BLOCK_MINUTES[len][b.type], `${age} ${focus} ${b.type}`)
              for (const it of b.items) assert.ok(Number.isInteger(it.durationMinutes) && it.durationMinutes >= 1)
            }
            const placed = new Set((s.hallPlacements ?? []).map((p) => p.sessionItemId))
            const tek = s.blocks.find((b) => b.type === 'techniques')!.items
            for (const it of tek) {
              if (placed.has(it.id) && getActivityById(it.activityId)?.defaultStationEquipment?.length) {
                assert.ok(it.stationEquipment && it.stationEquipment.length > 0, `${age} ${focus} ${it.activityId}`)
              }
            }
          }
        }
      })
    }
  }
  it('Teknik splits equally (90 → 3×12) and the table sums to the length', () => {
    const s = composeWizardSession({ age: 'age79', level: null, focus: 'trampett', hallTemplateId: 'forening-vit', targetMinutes: 90 })
    assert.deepEqual(s.blocks.find((b) => b.type === 'techniques')!.items.map((i) => i.durationMinutes), [12, 12, 12])
    for (const len of PASS_LENGTHS) assert.equal(Object.values(WIZARD_BLOCK_MINUTES[len]).reduce((a, b) => a + b, 0), len)
  })
  it('largest remainder, ties to the first item', () => {
    assert.deepEqual(splitMinutes(15, [5, 8]), [6, 9])
    assert.deepEqual(splitMinutes(7, [1, 1]), [4, 3])
    assert.deepEqual(splitMinutes(10, [1, 1, 1]), [4, 3, 3])
  })
})

describe('Slice 49 E1 — Föreningens mallar only with ≥1 template', () => {
  it('fresh + 0 → hidden; ≥1 → shown', () => {
    assert.equal(clubSectionVisible({ status: 'fresh', items: [] }), false)
    assert.equal(clubSectionVisible({ status: 'fresh', items: [{} as never] }), true)
  })
})

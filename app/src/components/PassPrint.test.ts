import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { UI } from '../data/blockMeta.ts'
import { seedTemplates } from '../data/seedTemplates.ts'
import { cloneTemplate } from '../lib/session.ts'
import { stationCards } from '../lib/stationCards.ts'
import { PassPrint } from './PassPrint.tsx'

describe('Slice 44 PassPrint (C1)', () => {
  const s = cloneTemplate(seedTemplates.find((t) => /Nybörjare/.test(t.title)) ?? seedTemplates[0])
  const html = renderToStaticMarkup(createElement(PassPrint, { session: s }))
  const cards = stationCards(s)
  it('one station row per station card, numbered 1…n', () => {
    assert.ok(cards.length > 0)
    assert.equal((html.match(/class="pass-station"/g) ?? []).length, cards.length)
    cards.forEach((c) => assert.ok(html.includes(`${c.rank}. `)))
  })
  it('card fields render with the card labels', () => {
    if (cards.some((c) => c.watch)) assert.ok(html.includes(`${UI.watchFor}. `))
    if (cards.some((c) => c.safety)) assert.ok(html.includes(`${UI.safety}. `))
    if (cards.some((c) => c.equipment)) assert.ok(html.includes(`${UI.stationEquipmentHeading}. `))
  })
  it('Erfaren ledare shows on a station that has it', () => {
    const hasIt = cards.some((c) => c.experienced)
    assert.equal(html.includes(UI.experiencedCoach), hasIt)
  })
})

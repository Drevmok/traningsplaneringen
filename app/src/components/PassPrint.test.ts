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
    // numbers now follow the hall (see F1 test below)
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

describe('Verifier F1: pass print numbers = hall numbers', () => {
  it('only placed Teknik stations are numbered, with stationRanks', async () => {
    const { stationRanks, placeableItems } = await import('../lib/hall.ts')
    const s = cloneTemplate(seedTemplates.find((t) => /Nybörjare/.test(t.title)) ?? seedTemplates[0])
    const tek = placeableItems(s)
    assert.ok(tek.length >= 3)
    // place the 3rd and 1st only, so hall numbers are 1 (first) and 2 (third); the second stays unplaced
    s.hallPlacements = [{ sessionItemId: tek[2].id, x: 0.2, y: 0.3 }, { sessionItemId: tek[0].id, x: 0.6, y: 0.3 }]
    const ranks = stationRanks(s)
    const html = renderToStaticMarkup(createElement(PassPrint, { session: s }))
    const rows = [...html.matchAll(/<li class="pass-station"><span>(.*?)<\/span>/g)].map((m) => m[1].replace(/<!-- -->/g, ''))
    assert.equal(rows.length, tek.length)
    const title = (i: number) => stationCards(s)[i].title
    assert.ok(rows[0].startsWith(`${ranks.get(tek[0].id)}. ${title(0)}`))
    assert.equal(rows[1].startsWith(title(1)), true, rows[1])
    assert.ok(rows[2].startsWith(`${ranks.get(tek[2].id)}. ${title(2)}`))
    assert.deepEqual([ranks.get(tek[0].id), ranks.get(tek[1].id), ranks.get(tek[2].id)], [1, undefined, 2])
  })
})

describe('Slice 66 C1: Bygg hallen print section labels unplaced stations', () => {
  it('unplaced → «☐ Titel — Saknar plats» without a number; placed stays «☐ n. Titel»', async () => {
    const { placeableItems } = await import('../lib/hall.ts')
    const s = cloneTemplate(seedTemplates.find((t) => /Nybörjare/.test(t.title)) ?? seedTemplates[0])
    const tek = placeableItems(s)
    s.hallPlacements = [{ sessionItemId: tek[2].id, x: 0.2, y: 0.3 }, { sessionItemId: tek[0].id, x: 0.6, y: 0.3 }]
    const html = renderToStaticMarkup(createElement(PassPrint, { session: s }))
    const section = html.slice(html.indexOf('class="pass-sheet-build"'))
    const rows = [...section.matchAll(/<strong>(.*?)<\/strong>/g)].map((m) => m[1].replace(/<!-- -->/g, ''))
    const title = (i: number) => stationCards(s)[i].title
    assert.deepEqual(rows, [`☐ 1. ${title(0)}`, `☐ 2. ${title(2)}`, `☐ ${title(1)} — ${UI.buildHallUnplaced}`])
  })
})

describe('Slice 68 C1: Bygg hallen print «Föreningen saknar»', () => {
  it('line only when the club list is filled and a slot is missing; otherwise unchanged', async () => {
    const { applyClubEquipment, resetClubEquipmentForTests } = await import('../lib/clubEquipment.ts')
    const s = cloneTemplate(seedTemplates.find((t) => /Nybörjare/.test(t.title)) ?? seedTemplates[0])
    const none = renderToStaticMarkup(createElement(PassPrint, { session: s }))
    const section = (html: string) => html.slice(html.indexOf('class="pass-sheet-build"'))
    assert.equal(section(none).includes(UI.clubMissingLine.split('{')[0]), false)
    applyClubEquipment(['eq-plint'])
    const filled = section(renderToStaticMarkup(createElement(PassPrint, { session: s })))
    assert.ok(filled.includes('Föreningen saknar:'), filled.slice(0, 400))
    assert.ok(filled.includes('Satsbräda'), filled)
    applyClubEquipment(null)
    assert.equal(section(renderToStaticMarkup(createElement(PassPrint, { session: s }))).includes('Föreningen saknar:'), false)
    resetClubEquipmentForTests()
  })
})

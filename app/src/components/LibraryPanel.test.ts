import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LibraryPanel } from './LibraryPanel.tsx'

const base = { onSelectActivity: () => {}, ownActivities: [] }

describe('Slice 48 Q2 — hall «Lägg till station» locks the filter to Teknik', () => {
  it('no onFilterChange → select disabled and set to techniques', () => {
    const html = renderToStaticMarkup(createElement(LibraryPanel, { ...base, filterBlockType: 'techniques' }))
    assert.match(html, /<select[^>]*disabled/)
    assert.match(html, /<option value="techniques" selected/)
  })
  it('builder sheet (onFilterChange given) keeps the filter usable', () => {
    const html = renderToStaticMarkup(createElement(LibraryPanel, { ...base, filterBlockType: 'warmup', onFilterChange: () => {} }))
    assert.doesNotMatch(html, /<select[^>]*disabled/)
  })
})

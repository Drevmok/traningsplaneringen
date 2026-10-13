import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SLICE_NUMBER, UI } from '../data/blockMeta.ts'
import { FEEDBACK_TO, feedbackBody, feedbackHref } from './feedback.ts'
import { FooterFeedback } from '../components/FooterFeedback.tsx'

const BODY = [
  'Hej,',
  '',
  'Här är vad jag tycker om Träningsplaneraren.',
  '',
  'Vad fungerade bra?',
  '',
  '',
  'Vad var krångligt?',
  '',
  '',
  'Vad saknade du?',
  '',
  '',
  'Tack för att du tar dig tid.',
  '',
  'Version: Slice 38',
].join('\r\n')

describe('feedbackHref (Slice 35)', () => {
  const href = feedbackHref()
  it('mailto to the address, subject first, CRLF encoded, no + for spaces', () => {
    assert.ok(href.startsWith('mailto:drevmok@gmail.com?subject='))
    assert.ok(href.includes('%0D%0A'))
    assert.ok(!href.includes('+'))
    assert.ok(href.includes('%C3%A5'))
    assert.ok(href.length < 2000)
  })
  it('decodes to the exact subject and body (åäö, blank lines, version line)', () => {
    const q = href.slice(href.indexOf('?') + 1)
    const [s, b] = q.split('&')
    assert.equal(decodeURIComponent(s.replace(/^subject=/, '')), 'Tyck till om Träningsplaneraren')
    assert.equal(decodeURIComponent(b.replace(/^body=/, '')), BODY)
    assert.equal(feedbackBody(), BODY)
  })
  it('version line and footer label share SLICE_NUMBER', () => {
    assert.equal(SLICE_NUMBER, '38')
    assert.equal(UI.footerSliceLabel, 'Träningsplaneraren · Slice 38')
    assert.ok(feedbackBody().endsWith(`Version: Slice ${UI.footerSliceLabel.match(/Slice (\d+)/)?.[1]}`))
  })
})

describe('FooterFeedback render (Slice 35)', () => {
  it('one real mailto anchor with the aria name; no fallback line before a tap', () => {
    const html = renderToStaticMarkup(createElement('footer', null, createElement(FooterFeedback)))
    assert.equal((html.match(/<a /g) ?? []).length, 1)
    assert.equal((html.match(/href="mailto:/g) ?? []).length, 1)
    assert.ok(html.startsWith('<footer>') && html.includes('aria-label="Tyck till om appen via e-post"') && html.includes('>Tyck till</a>'))
    assert.ok(!html.includes('target=') && !html.includes(FEEDBACK_TO + ' ') && !html.includes('Hittar du'))
  })
})

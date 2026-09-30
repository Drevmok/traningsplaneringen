import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isNewerBuild, withUpdateParam } from './appUpdate.ts'

describe('isNewerBuild', () => {
  it('ignores dev and missing remote builds', () => {
    assert.equal(isNewerBuild('dev', 'abc'), false)
    assert.equal(isNewerBuild('abc', null), false)
    assert.equal(isNewerBuild('abc', 'abc'), false)
  })

  it('notices a published build that is not the one on screen', () => {
    assert.equal(isNewerBuild('aaa', 'bbb'), true)
  })
})

describe('withUpdateParam', () => {
  it('keeps a shared pass in the hash and replaces an old stamp', () => {
    const next = withUpdateParam(
      'https://drevmok.github.io/traningsplaneringen/?v=old#dela=abc',
      'new',
    )
    const url = new URL(next)
    assert.equal(url.searchParams.get('v'), 'new')
    assert.equal(url.hash, '#dela=abc')
    assert.equal(url.pathname, '/traningsplaneringen/')
  })
})

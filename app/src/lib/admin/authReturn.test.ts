import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readAuthReturn } from './authReturn.ts'

const BASE = 'https://drevmok.github.io/traningsplaneringen/'

describe('readAuthReturn (Slice 32)', () => {
  it('leaves a normal address alone', () => {
    assert.deepEqual(readAuthReturn(BASE), { code: null, failed: false, cleanUrl: null })
    assert.deepEqual(readAuthReturn(`${BASE}#dela=abc`), { code: null, failed: false, cleanUrl: null })
  })
  it('takes ?code= and removes it, keeping other params and the #dela= hash', () => {
    const r = readAuthReturn(`${BASE}?x=1&code=11111111-2222-3333-4444-555555555555#dela=v1.abc`)
    assert.equal(r.code, '11111111-2222-3333-4444-555555555555')
    assert.equal(r.failed, false)
    assert.equal(r.cleanUrl, '/traningsplaneringen/?x=1#dela=v1.abc')
  })
  it('treats ?error_code= as a failed link and strips query + error hash', () => {
    const r = readAuthReturn(
      `${BASE}?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid#error=access_denied&error_code=otp_expired&sb=`,
    )
    assert.equal(r.code, null)
    assert.equal(r.failed, true)
    assert.equal(r.cleanUrl, '/traningsplaneringen/')
  })
  it('treats an error only in the hash as failed', () => {
    const r = readAuthReturn(`${BASE}#error=access_denied&error_code=otp_expired&error_description=x`)
    assert.equal(r.failed, true)
    assert.equal(r.cleanUrl, '/traningsplaneringen/')
  })
  it('ignores a code when an error is present', () => {
    const r = readAuthReturn(`${BASE}?code=abc&error_code=otp_expired`)
    assert.equal(r.code, null)
    assert.equal(r.failed, true)
  })
  it('survives garbage', () => {
    assert.deepEqual(readAuthReturn('not a url'), { code: null, failed: false, cleanUrl: null })
  })
})

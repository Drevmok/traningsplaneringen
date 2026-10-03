import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cleanAuthLeftovers } from './authReturn.ts'

const BASE = 'https://drevmok.github.io/traningsplaneringen/'

describe('cleanAuthLeftovers (Slice 33)', () => {
  it('leaves a normal address alone', () => {
    assert.equal(cleanAuthLeftovers(BASE), null)
    assert.equal(cleanAuthLeftovers(`${BASE}#dela=abc`), null)
    assert.equal(cleanAuthLeftovers(`${BASE}?x=1#dela=abc`), null)
  })
  it('strips ?code= (never returns it), keeps other params and the #dela= hash', () => {
    const clean = cleanAuthLeftovers(`${BASE}?x=1&code=11111111-2222-3333-4444-555555555555#dela=v1.abc`)
    assert.equal(clean, '/traningsplaneringen/?x=1#dela=v1.abc')
    assert.equal(clean?.includes('11111111'), false)
    assert.equal(cleanAuthLeftovers(`${BASE}?code=abc`), '/traningsplaneringen/')
    assert.equal(cleanAuthLeftovers(`${BASE}?code=abc#dela=v1.tok`), '/traningsplaneringen/#dela=v1.tok')
  })
  it('strips ?error_code= query and the mirrored error hash', () => {
    assert.equal(
      cleanAuthLeftovers(`${BASE}?error=access_denied&error_code=otp_expired&error_description=x#error=access_denied&error_code=otp_expired&sb=`),
      '/traningsplaneringen/',
    )
  })
  it('strips an error only in the hash', () => {
    assert.equal(cleanAuthLeftovers(`${BASE}#error=access_denied&error_code=otp_expired&error_description=x`), '/traningsplaneringen/')
  })
  it('code + error together → both gone', () => {
    assert.equal(cleanAuthLeftovers(`${BASE}?code=abc&error_code=otp_expired&keep=1`), '/traningsplaneringen/?keep=1')
  })
  it('survives garbage', () => {
    assert.equal(cleanAuthLeftovers('not a url'), null)
  })
})

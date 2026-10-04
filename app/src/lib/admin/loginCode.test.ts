import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import {
  ADMIN_PENDING_KEY,
  PENDING_MAX_AGE_MS,
  clearPendingLogin,
  normalizeCode,
  readPendingLogin,
  writePendingLogin,
} from './loginCode.ts'

const mem = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void Reflect.apply(Map.prototype.delete, mem, [k]),
    clear: () => mem.clear(),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size
    },
  },
})

beforeEach(() => mem.clear())

describe('normalizeCode (Slice 33, AC 11)', () => {
  it('keeps digits only, max 6', () => {
    assert.equal(normalizeCode('123456'), '123456')
    assert.equal(normalizeCode('123 456'), '123456')
    assert.equal(normalizeCode(' 123456 '), '123456')
    assert.equal(normalizeCode('123-456'), '123456')
    assert.equal(normalizeCode('12 34'), '1234')
    assert.equal(normalizeCode('1234567'), '123456')
    assert.equal(normalizeCode('Koden: 123456.'), '123456')
    assert.equal(normalizeCode('abc'), '')
  })
  it('full-width digits (paste from some keyboards) → ASCII', () => {
    assert.equal(normalizeCode('１２３４５６'), '123456')
  })
})

describe('pending login (Slice 33, AC 6)', () => {
  it('write → read within 60 min', () => {
    writePendingLogin('a@b.se', 1_000)
    assert.deepEqual(readPendingLogin(1_000 + PENDING_MAX_AGE_MS - 1), { email: 'a@b.se', sentAt: 1_000 })
  })
  it('older than 60 min → null and removed', () => {
    writePendingLogin('a@b.se', 1_000)
    assert.equal(readPendingLogin(1_000 + PENDING_MAX_AGE_MS), null)
    assert.equal(mem.has(ADMIN_PENDING_KEY), false)
  })
  it('broken or future entry → null and removed', () => {
    mem.set(ADMIN_PENDING_KEY, '{nope')
    assert.equal(readPendingLogin(5), null)
    assert.equal(mem.has(ADMIN_PENDING_KEY), false)
    writePendingLogin('a@b.se', 10_000)
    assert.equal(readPendingLogin(5), null)
    mem.set(ADMIN_PENDING_KEY, JSON.stringify({ email: ' ', sentAt: 1 }))
    assert.equal(readPendingLogin(2), null)
  })
  it('clear removes it; nothing stored → null', () => {
    writePendingLogin('a@b.se', 1)
    clearPendingLogin()
    assert.equal(readPendingLogin(2), null)
  })
})

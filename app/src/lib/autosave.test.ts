import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import { UI } from '../data/blockMeta.ts'
import type { Session } from '../types.ts'

const mem = new Map<string, string>()
let failWrites = false
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (failWrites) throw new DOMException('full', 'QuotaExceededError')
      mem.set(k, v)
    },
    removeItem: (k: string) => { mem.delete(k) },
    clear: () => mem.clear(),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() { return mem.size },
  },
})

const { archiveReplacedDraft, pendingWrite, shouldAutosave, trySaveDraft } = await import('./autosave.ts')
const { adoptAsDraft, createBlankSession, createEmptyBlocks, createSessionItem, loadDraft, saveDraft } = await import('./session.ts')
const { loadSavedTemplates, startNewWeek } = await import('./savedTemplates.ts')
const { seedActivities } = await import('../data/seedActivities.ts')

function pass(title: string, ids: string[]): Session {
  const s = createBlankSession()
  s.title = title
  s.blocks = createEmptyBlocks()
  const tech = s.blocks.find((b) => b.type === 'techniques')!
  tech.items = ids.map((id, n) => createSessionItem(id, 5, n))
  return s
}
const tech = seedActivities.filter((a) => a.blockType === 'techniques').map((a) => a.id)

describe('Slice 39 autosave', () => {
  beforeEach(() => { mem.clear(); failWrites = false })

  it('trySaveDraft: true on success, false (never throws) when storage is full', () => {
    const s = pass('A', [tech[0]])
    assert.equal(trySaveDraft(s), true)
    assert.equal(loadDraft()?.id, s.id)
    failWrites = true
    assert.doesNotThrow(() => trySaveDraft(pass('B', [tech[1]])))
    assert.equal(trySaveDraft(pass('B', [tech[1]])), false)
  })

  it('replacing a stored pass with stations and another id archives it once', () => {
    const old = pass('Tisdag', [tech[0], tech[1]])
    saveDraft(old)
    saveDraft(pass('Ny', [tech[2]]))
    let t = loadSavedTemplates()
    assert.equal(t.length, 1)
    assert.equal(t[0].title, 'Tisdag')
    // same old contents replaced again → dedupe
    saveDraft(old)
    saveDraft(pass('Ny 2', [tech[3]]))
    t = loadSavedTemplates()
    assert.equal(t.filter((x) => x.title === 'Tisdag').length, 1)
  })

  it('same id (editing) → no archive; empty old → no archive', () => {
    const s = pass('Edit', [tech[0]])
    saveDraft(s)
    s.title = 'Edit 2'
    saveDraft(s)
    assert.equal(loadSavedTemplates().length, 0)
    mem.clear()
    const empty = pass('Tom', [])
    saveDraft(empty)
    saveDraft(pass('Annat', [tech[1]]))
    assert.equal(loadSavedTemplates().length, 0)
  })

  it('adoptAsDraft (mall, import, receive) runs the guard too', () => {
    saveDraft(pass('Gammal', [tech[0]]))
    adoptAsDraft(pass('Mottagen', [tech[1]]))
    assert.deepEqual(loadSavedTemplates().map((t) => t.title), ['Gammal'])
  })

  it('archive title falls back to «Nytt pass»', () => {
    saveDraft(pass('   ', [tech[0]]))
    saveDraft(pass('X', [tech[1]]))
    assert.equal(loadSavedTemplates()[0].title, UI.untitledPass)
    assert.equal(UI.untitledPass, 'Nytt pass')
    assert.equal(createBlankSession().title, 'Nytt pass')
  })

  it('archive failure never blocks the pass write', () => {
    const old = pass('Old', [tech[0]])
    saveDraft(old)
    const realSet = localStorage.setItem
    ;(localStorage as unknown as { setItem: (k: string, v: string) => void }).setItem = (k, v) => {
      if (k === 'gymnastics-planner-templates-v1') throw new Error('full')
      mem.set(k, v)
    }
    const next = pass('New', [tech[1]])
    assert.equal(trySaveDraft(next), true)
    assert.equal(loadDraft()?.id, next.id)
    ;(localStorage as unknown as { setItem: typeof realSet }).setItem = realSet
    assert.equal(archiveReplacedDraft(next), false)
  })

  it('E1 skip rule: empty fresh pass waits; stored pass always saves', () => {
    const fresh = pass('T', [])
    assert.equal(shouldAutosave(fresh, 'other-id'), false)
    assert.equal(shouldAutosave(fresh, null), false)
    assert.equal(shouldAutosave(fresh, fresh.id), true)
    assert.equal(shouldAutosave(pass('T', [tech[0]]), null), true)
    // Tomt pass starts with Närvaro + Dagens pass (2 items): waits until a third is added
    const blank = createBlankSession()
    assert.equal(shouldAutosave(blank, 'other', 2), false)
    blank.blocks[0].items.push(createSessionItem(tech[0], 5, 9))
    assert.equal(shouldAutosave(blank, 'other', 2), true)
  })

  it('strings verbatim; removed keys gone', () => {
    const u = UI as Record<string, unknown>
    assert.equal(u.autosaveSaved, 'Sparat')
    assert.equal(u.autosaveFailed, 'Inte sparat')
    assert.equal(u.autosaveFailedToast, 'Passet kunde inte sparas här. Skicka det till telefonen eller ladda ner en fil, så finns det kvar.')
    assert.equal(u.templateBody, 'Om du börjar från en mall ersätts blocken och övningarna du har nu. Passet du hade finns kvar under Mina mallar.')
    assert.equal(u.oppnaPaTelefonHonesty, 'Appen på telefonen är tom tills du skickar passet dit. Passet sparas bara i den webbläsare där du planerar det.')
    assert.equal(u.saveDraft, undefined)
    assert.equal(u.savedToast, undefined)
  })

  it('F1 race (Använd mall): a pending write of the old pass is flushed before the new pass is saved', () => {
    const old = pass('Måndag', [tech[0]])
    saveDraft(old)
    const edited = { ...old, title: 'Måndag ändrad' }
    let runs = 0
    pendingWrite.current = { id: old.id, run: () => { runs++; trySaveDraft(edited) } }
    const mall = pass('Mall', [tech[1], tech[2]])
    adoptAsDraft(mall)
    assert.equal(runs, 1)
    assert.equal(pendingWrite.current, null)
    const slot = loadDraft()!
    assert.equal(slot.title, 'Mall')
    assert.deepEqual(loadSavedTemplates().map((t) => t.title), ['Måndag ändrad'])
  })

  it('F1 race (Ny vecka → Skapa kopia): old edit flushed, copy stays in the slot, one archive', () => {
    const old = pass('Vecka 1', [tech[0], tech[1]])
    saveDraft(old)
    const edited = { ...old, title: 'Vecka 1 ändrad' }
    pendingWrite.current = { id: old.id, run: () => { trySaveDraft(edited) } }
    const started = startNewWeek(edited)
    saveDraft(started.session)
    assert.equal(loadDraft()!.id, started.session.id)
    assert.deepEqual(loadSavedTemplates().map((t) => t.title), ['Vecka 1 ändrad'])
    assert.equal(pendingWrite.current, null)
  })

  it('a pending write of the same pass is not flushed by its own save', () => {
    const s = pass('Samma', [tech[0]])
    saveDraft(s)
    let runs = 0
    pendingWrite.current = { id: s.id, run: () => { runs++ } }
    saveDraft({ ...s, title: 'Samma 2' })
    assert.equal(runs, 0)
    pendingWrite.current = null
  })
})

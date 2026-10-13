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

describe('Slice 39 Mina mallar cap: auto-copies vs hand-saved', async () => {
  const st = await import('./savedTemplates.ts')
  const TK = 'gymnastics-planner-templates-v1'
  const mk = (title: string, n: number, auto = false) => {
    const t = { ...st.saveSessionAsTemplate(pass(title, [tech[n % tech.length], tech[(n + 1) % tech.length]])) }
    return auto ? { ...t, auto: true as const } : t
  }
  beforeEach(() => { mem.clear(); failWrites = false; pendingWrite.current = null })

  it('auto-copy into a full list evicts the oldest other auto-copy, never a hand-saved one', () => {
    const list = [mk('H1', 1), mk('A-ny', 2, true), mk('H2', 3), mk('H3', 4), mk('H4', 5), mk('A-gammal', 6, true), mk('H5', 7), mk('H6', 8)]
    mem.set(TK, JSON.stringify(list))
    const old = pass('Ersatt', [tech[9], tech[10]])
    saveDraft(old)
    saveDraft(pass('Ny', [tech[11]]))
    const titles = st.loadSavedTemplates().map((t) => t.title)
    assert.equal(titles.length, 8)
    assert.equal(titles[0], 'Ersatt')
    assert.ok(!titles.includes('A-gammal'))
    assert.ok(titles.includes('A-ny'))
    for (const h of ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']) assert.ok(titles.includes(h), h)
  })

  it('8 hand-saved + an auto-copy → 9 (the spare slot); nothing hand-saved is lost', () => {
    const list = Array.from({ length: 8 }, (_, i) => mk(`H${i}`, i))
    mem.set(TK, JSON.stringify(list))
    saveDraft(pass('Ersatt', [tech[9], tech[10]]))
    const next = pass('Ny', [tech[11]])
    assert.equal(trySaveDraft(next), true)
    assert.equal(loadDraft()!.id, next.id)
    const t = st.loadSavedTemplates()
    assert.equal(t.length, 9)
    assert.equal(t[0].title, 'Ersatt')
    assert.equal(t[0].auto, true)
    assert.deepEqual(t.slice(1).map((x) => x.title), list.map((x) => x.title))
  })

  it('a newer auto-copy replaces the spare (still 9, one auto)', () => {
    const list = Array.from({ length: 8 }, (_, i) => mk(`H${i}`, i))
    mem.set(TK, JSON.stringify(list))
    saveDraft(pass('Ersatt 1', [tech[9], tech[10]]))
    saveDraft(pass('Ersatt 2', [tech[11], tech[12]]))
    saveDraft(pass('Ny', [tech[13]]))
    const t = st.loadSavedTemplates()
    assert.equal(t.length, 9)
    assert.deepEqual(t.filter((x) => x.auto).map((x) => x.title), ['Ersatt 2'])
    assert.ok(!t.some((x) => x.title === 'Ersatt 1'))
  })

  it('a hand-save into 8 hand-saved + spare evicts the spare first, then the oldest entry (back to 8)', () => {
    const list = Array.from({ length: 8 }, (_, i) => mk(`H${i}`, i))
    mem.set(TK, JSON.stringify(list))
    saveDraft(pass('Ersatt', [tech[9], tech[10]]))
    saveDraft(pass('Ny', [tech[11]]))
    assert.equal(st.loadSavedTemplates().length, 9)
    st.saveSessionAsTemplate(pass('Hand ny', [tech[12]]))
    const t = st.loadSavedTemplates()
    assert.equal(t.length, 8)
    assert.equal(t[0].title, 'Hand ny')
    assert.ok(!t.some((x) => x.auto), 'spare auto went first')
    assert.ok(!t.some((x) => x.title === 'H7'), 'then the oldest hand-saved, as on main')
  })

  it('7 hand-saved + 1 auto (full) → a new auto-copy replaces the old auto (normal rule, stays 8)', () => {
    const list = [...Array.from({ length: 7 }, (_, i) => mk(`H${i}`, i)), mk('A-gammal', 8, true)]
    mem.set(TK, JSON.stringify(list))
    saveDraft(pass('Ersatt', [tech[9], tech[10]]))
    saveDraft(pass('Ny', [tech[11]]))
    const t = st.loadSavedTemplates()
    assert.equal(t.length, 8)
    assert.deepEqual(t.filter((x) => x.auto).map((x) => x.title), ['Ersatt'])
  })

  it('the auto flag survives a reload (storage round trip); hand-saves are unflagged', () => {
    saveDraft(pass('Ersatt', [tech[9]]))
    saveDraft(pass('Ny', [tech[11]]))
    st.saveSessionAsTemplate(pass('Hand', [tech[12]]))
    const raw = JSON.parse(mem.get(TK)!) as { title: string; auto?: boolean }[]
    assert.equal(raw.find((t) => t.title === 'Ersatt')!.auto, true)
    assert.equal(raw.find((t) => t.title === 'Hand')!.auto, undefined)
    const reloaded = st.loadSavedTemplates()
    assert.equal(reloaded.find((t) => t.title === 'Ersatt')!.auto, true)
  })

  it('hand-save into a full list evicts the oldest auto-copy first, else the oldest entry (as before)', () => {
    const list = [mk('A1', 1, true), ...Array.from({ length: 7 }, (_, i) => mk(`H${i}`, i + 2))]
    mem.set(TK, JSON.stringify(list))
    st.saveSessionAsTemplate(pass('Hand ny', [tech[12]]))
    let titles = st.loadSavedTemplates().map((t) => t.title)
    assert.ok(!titles.includes('A1') && titles.includes('H6') && titles[0] === 'Hand ny')
    st.saveSessionAsTemplate(pass('Hand 2', [tech[13]]))
    titles = st.loadSavedTemplates().map((t) => t.title)
    assert.equal(titles.length, 8)
    assert.ok(!titles.includes('H6'), 'no auto left → oldest entry goes, as on main')
  })

  it('dedupe stays: an identical replaced pass is not copied twice', () => {
    const old = pass('Samma', [tech[1], tech[2]])
    saveDraft(old); saveDraft(pass('X', [tech[3]]))
    saveDraft({ ...old, id: 'other-id' }); saveDraft(pass('Y', [tech[4]]))
    assert.equal(st.loadSavedTemplates().filter((t) => t.title === 'Samma').length, 1)
  })
})

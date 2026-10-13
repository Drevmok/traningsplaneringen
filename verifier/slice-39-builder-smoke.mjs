// Slice 39 — Builder self-smoke: Spara passet automatiskt + replaced-pass guard, 390×844.
// Plain build preview on :4199 (S39_URL). localStorage writes to the draft key are counted by an init-script spy;
// __failDraft = true makes those writes throw (storage full).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const URL0 = process.env.S39_URL ?? 'http://127.0.0.1:4199/traningsplaneringen/'
const ROOT = process.env.S39_ROOT ?? '/workspace/gp-s39'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const SEED = execFileSync('bun', [`${ROOT}/verifier/slice-39-seed.ts`], { encoding: 'utf8' }).trim()
const MD = readFileSync(`${ROOT}/slice-39/content/microcopy.sv.md`, 'utf8')
const md = (k) => MD.match(new RegExp('^\\| `' + k + '`(?: \\*\\*[^*]+\\*\\*)?(?: \\([^)]*\\))? \\| ([^|]+?) \\|', 'm'))[1].trim()
const S = { saved: md('autosaveSaved'), failed: md('autosaveFailed'), toast: md('autosaveFailedToast'), untitled: md('untitledPass'), footer: md('footerSliceLabel') }

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`)
}
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }

const SPY = (DK) => {
  window.__w = []
  const orig = Storage.prototype.setItem
  Storage.prototype.setItem = function (k, v) {
    if (k === DK) {
      if (window.__failDraft) throw new DOMException('full', 'QuotaExceededError')
      window.__w.push(performance.now())
    }
    return orig.call(this, k, v)
  }
}
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
await ctx.addInitScript(SPY, DK)
const errors = []
let p = await ctx.newPage()
const watch = (pg) => { pg.setDefaultTimeout(10000); pg.on('pageerror', (e) => errors.push(e.message)) }
watch(p)
const shot = (n) => p.screenshot({ path: `/workspace/screenshots/slice39_${n}.png` })
const draft = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const tmpls = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const writes = () => p.evaluate(() => window.__w.length)
const status = p0 => (p0 ?? p).locator('.save-status')
const builder = () => p.locator('.builder')
const homeMeta = async () => (await p.locator('.home').innerText()).replace(/\s+/g, ' ')
async function toHome() { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor() }
async function addTeknik(n = 0) {
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor()
  await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(n).click()
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
}

await attempt('A', async () => {
  // AC13 — existing main-shape draft loads unchanged
  await p.goto(URL0)
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v) }, [DK, SEED])
  await p.reload(); await p.locator('.home').waitFor()
  const seed = JSON.parse(SEED)
  check('AC13a', 'Seeded main draft shows on Home: Fortsätt passet · title · min', (await homeMeta()).includes(`Fortsätt passet`) && (await homeMeta()).includes(`${seed.title} · ${seed.totalMinutes} min`), await homeMeta())
  const w0 = await writes()
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  await p.waitForTimeout(1500)
  check('AC13b', 'Open → «Sparat» shown, no write until a change; stored pass byte-identical', (await status().innerText()) === S.saved && (await writes()) === w0 && JSON.stringify(await draft()) === SEED)
  check('AC1', 'No «Spara utkast» anywhere (row + Fler)', await (async () => {
    const row = await p.getByRole('button', { name: 'Spara utkast' }).count()
    await p.getByRole('button', { name: 'Fler åtgärder' }).or(p.locator('.more-menu > button')).first().click()
    const more = await p.getByRole('button', { name: 'Spara utkast' }).count()
    await p.locator('.more-backdrop').click()
    return row === 0 && more === 0 && !(await p.locator('body').innerText()).includes('Spara utkast')
  })())
  // AC3 — rapid edits → one write
  const w1 = await writes()
  const t = p.getByRole('textbox', { name: 'Passets titel' })
  await t.fill('')
  await t.pressSequentially('Onsdag pass', { delay: 40 })
  for (const m of ['90', '60', '90', '60', '90']) await p.locator('.pass-length').getByRole('button', { name: m, exact: true }).click()
  const seen = []
  for (let i = 0; i < 8; i++) { seen.push(await status().isVisible()); await p.waitForTimeout(50) }
  await p.waitForTimeout(1200)
  const d1 = await draft()
  check('AC3', 'Title typing + 5 taps → exactly one write after ~800 ms; «Sparat» never disappears', (await writes()) - w1 === 1 && d1.title === 'Onsdag pass' && seen.every(Boolean), `writes ${(await writes()) - w1}`)
  check('AC13c', 'First edit overwrites in place (same id)', d1.id === seed.id)
  await p.evaluate(() => window.scrollTo(0, 0))
  await shot('01_builder_sparat')
  // AC2 — add a station → Sparat within ~1 s; reload → Home shows it
  await addTeknik(5)
  await p.waitForTimeout(1100)
  const d2 = await draft()
  check('AC2a', 'Add station → saved within ~1 s, «Sparat» muted in the action row', d2.blocks.reduce((n, b) => n + b.items.length, 0) === seed.blocks.reduce((n, b) => n + b.items.length, 0) + 1 && (await status().innerText()) === S.saved && (await status().evaluate((e) => getComputedStyle(e).color)) === 'rgb(120, 113, 108)' && !!(await status().evaluate((e) => e.closest('.builder-actions'))))
  check('AC17', '«Sparat» is plain text: no role / aria-live', await status().evaluate((e) => !e.getAttribute('role') && !e.getAttribute('aria-live') && !e.closest('[aria-live]')))
  await p.reload(); await p.locator('.home, .builder').first().waitFor()
  if (await builder().count()) await toHome()
  check('AC2b', 'Reload → Home Fortsätt passet shows the change', (await homeMeta()).includes(`Onsdag pass · ${d2.totalMinutes} min`), await homeMeta())
  // AC4 — edit then Till startsidan within 300 ms
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  await t.fill('Snabb hem')
  await toHome()
  check('AC4', 'Edit → Till startsidan at once → Home shows new title (flush)', (await homeMeta()).includes('Snabb hem ·'), await homeMeta())
  // AC5 — edit then close tab within 300 ms
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  await t.fill('Stängd flik')
  await p.close({ runBeforeUnload: true })
  p = await ctx.newPage(); watch(p)
  await p.goto(URL0); await p.locator('.home, .builder').first().waitFor()
  if (await builder().count()) await toHome()
  check('AC5', 'Edit → close tab at once → reopen → kept (pagehide flush)', (await homeMeta()).includes('Stängd flik ·'), await homeMeta())
  // AC10 — many edits, no new Mina mallar entries
  check('AC10', 'Editing one pass many times → Mina mallar still empty; one pass on Home', (await tmpls()).length === 0)
})

let oldTitle = 'Stängd flik'
await attempt('B', async () => {
  // AC8 — Tomt pass, back Home without adding
  const w0 = await writes()
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder().waitFor()
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Nytt test')
  await p.waitForTimeout(1200)
  check('AC8a', 'Tomt pass (title edit only): «Sparat» not shown, nothing written', (await status().count()) === 0 && (await writes()) === w0)
  await toHome()
  check('AC8b', 'Back Home → old pass still on Home', (await homeMeta()).includes(`${oldTitle} ·`), await homeMeta())
  // AC9 — Tomt pass + first station → saved; old pass in Mina mallar
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder().waitFor()
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Torsdag nytt')
  await addTeknik(1)
  await p.waitForTimeout(1100)
  check('AC9a', 'First station → «Sparat»', (await status().innerText()) === S.saved)
  await shot('02_tomt_first_station')
  await toHome()
  const t = await tmpls()
  check('AC9b', 'Home shows the new pass; old pass is in Mina mallar under its title', (await homeMeta()).includes('Torsdag nytt ·') && t.length === 1 && t[0].title === oldTitle, t.map((x) => x.title).join(','))
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click()
  await p.locator('.template-saved .template-card').filter({ hasText: oldTitle }).first().waitFor()
  await shot('03_mina_mallar_archived')
  await p.keyboard.press('Escape')
})

await attempt('C', async () => {
  // AC6 — built-in mall → apply → at once Home
  await p.goto(URL0); await p.locator('.home, .builder').first().waitFor()
  if (await builder().count()) await toHome()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click()
  const card = p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first()
  const mallTitle = (await card.locator('h3, .template-title, strong').first().innerText().catch(() => 'Nybörjare')).trim()
  await card.click()
  await p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }).click()
  await builder().waitFor()
  await toHome()
  const d = await draft()
  check('AC6a', 'Built-in mall → apply → Home at once → Fortsätt passet shows that pass', (await homeMeta()).includes(`${d.title} · ${d.totalMinutes} min`) && /Nybörjare/.test(d.title), `${mallTitle} / ${d.title}`)
  await p.reload(); await p.locator('.home').waitFor()
  const d2 = await draft()
  const tek = d2.blocks.find((b) => b.type === 'techniques').items.map((i) => i.id)
  check('AC6b', 'Reload keeps it, Teknik placements included', d2.id === d.id && tek.length > 0 && tek.every((id) => d2.hallPlacements.some((pl) => pl.sessionItemId === id)))
  const t = await tmpls()
  check('AC9c/guard', 'Replaced «Torsdag nytt» landed in Mina mallar', t.some((x) => x.title === 'Torsdag nytt'), t.map((x) => x.title).join(','))
  // AC11 — replace again with the same old contents → no duplicate
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click()
  await p.locator('.template-saved .template-card').filter({ hasText: 'Torsdag nytt' }).first().click()
  await p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }).click()
  await builder().waitFor()
  await toHome()
  // now Torsdag nytt (copy) is on Home; replace it with the same built-in → Torsdag copy archived? same signature → dedupe
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click()
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }).click()
  await builder().waitFor(); await toHome()
  const t2 = await tmpls()
  check('AC7a/AC11', 'Mina mallar apply saves at once; replacing the same contents twice → one archived copy each', t2.filter((x) => x.title === 'Torsdag nytt').length === 1 && t2.filter((x) => /Nybörjare/.test(x.title)).length === 1, t2.map((x) => x.title).join(','))
  // AC7 wizard — Home shows Planera pass only without a stored pass, so clear the slot first (Mina mallar kept)
  await p.evaluate((k) => localStorage.removeItem(k), DK)
  await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await builder().waitFor()
  const dw = await draft()
  check('AC7b', 'Wizard pass saved at create; «Sparat» shown', (await status().innerText()) === S.saved)
  await toHome()
  check('AC7c', 'Wizard → Home at once → Fortsätt passet shows it', (await homeMeta()).includes(`${dw.title} · ${dw.totalMinutes} min`))
  const footer = await (async () => { await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor(); return (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ') })()
  check('AC22a', `Footer «${S.footer}»`, footer.includes(S.footer), footer)
})

await attempt('D', async () => {
  // AC12 — empty title
  const t = p.getByRole('textbox', { name: 'Passets titel' })
  await t.fill('')
  await toHome()
  check('AC12a', 'Empty title → Home meta «Nytt pass · N min»', /Fortsätt passet Nytt pass · \d+ min/.test(await homeMeta()), await homeMeta())
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder().waitFor()
  await addTeknik(2); await p.waitForTimeout(1100)
  const tl = await tmpls()
  check('AC12b', 'Replaced untitled pass archived as «Nytt pass»', tl.some((x) => x.title === S.untitled), tl.map((x) => x.title).join(','))
  // AC14 — storage full
  await p.evaluate(() => { window.__failDraft = true })
  await t.fill('Fullt 1'); await p.waitForTimeout(1100)
  const toast = p.locator('.toast')
  check('AC14a', '«Inte sparat» in the row + the exact toast once', (await status().innerText()) === S.failed && (await toast.innerText()).trim() === S.toast && (await toast.getAttribute('role')) === 'status')
  await p.evaluate(() => window.scrollTo(0, 0))
  await shot('04_inte_sparat_toast')
  await p.waitForTimeout(3000)
  await t.fill('Fullt 2'); await p.waitForTimeout(1100)
  check('AC14b', 'Further failing edits: no second toast, still «Inte sparat»', (await toast.count()) === 0 && (await status().innerText()) === S.failed)
  await p.evaluate(() => { window.__failDraft = false })
  await t.fill('Fullt 3'); await p.waitForTimeout(1100)
  check('AC14c', 'Un-stub → next edit «Sparat»; no crash', (await status().innerText()) === S.saved && (await draft()).title === 'Fullt 3')
  // AC16 — remove every station of the stored pass
  while (await p.locator('.item-remove').count()) { await p.locator('.item-remove').first().click() }
  await p.waitForTimeout(1100)
  const d = await draft()
  check('AC16', 'Removing the last station still saves (0 min pass)', d.blocks.every((b) => b.items.length === 0) && d.totalMinutes === 0)
  // AC18 — row layout
  await addTeknik(0); await p.waitForTimeout(1100)
  const lay = await p.locator('.builder-actions').evaluate((row) => {
    const s = row.querySelector('.save-status').getBoundingClientRect()
    const others = [...row.querySelectorAll(':scope > button, :scope > .more-menu')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect())
    const hit = others.some((o) => !(s.right <= o.left || s.left >= o.right || s.bottom <= o.top || s.top >= o.bottom))
    return { hit, right: s.right, sw: document.documentElement.scrollWidth }
  })
  check('AC18', 'Action row: «Sparat» does not overlap Kör passet / Hallöversikt / Fler; no horizontal scroll', !lay.hit && lay.right <= 390 && lay.sw <= 390, JSON.stringify(lay))
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200)
  await shot('05_row_390')
  // AC19 — Hallöversikt still works; Använd alla förslag still a tap
  const hallBtn = p.locator('.builder-actions .builder-hall')
  if (await hallBtn.isVisible()) await hallBtn.click()
  else { await p.locator('.more-menu > button').click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt' }).click() }
  await p.locator('.hall-canvas, .hall-board').first().waitFor()
  // The real apply-all button (exact aria), not the «Saknar» hint button that shares the visible text.
  await p.waitForTimeout(1200)
  const eqCount = (d) => d.blocks.flatMap((b) => b.items).filter((i) => i.stationEquipment?.length).length
  const pre = eqCount(await draft())
  const aa = p.getByRole('button', { name: 'Spara redskapsförslag på alla stationer som fortfarande saknar sparade redskap', exact: true })
  const dis = await aa.isDisabled()
  await shot('06_hall')
  if (!dis) await aa.click()
  await p.waitForTimeout(200)
  const post = eqCount(await draft())
  check('AC19', 'Hallöversikt: no redskap stored by autosave before the tap; one tap on the real «Använd alla förslag» stores them', pre === 0 && !dis && post > 0, `before ${pre}, disabled ${dis}, after ${post}`)
  await p.getByRole('button', { name: '← Tillbaka till Passbyggaren' }).click()
  await builder().waitFor()
})

// ── F1 race (Verifier): edit, then replace the pass within the 800 ms debounce.
async function moreBtn(name) { await p.locator('.more-menu > button').click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function race(label, act) {
  await p.evaluate(([dk, tk]) => { localStorage.removeItem(dk); localStorage.removeItem(tk) }, [DK, TK])
  await p.goto(URL0); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click()
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }).click()
  await builder().waitFor()
  const oldId = (await draft()).id
  await p.getByRole('textbox', { name: 'Passets titel' }).fill(`${label} gammal`)
  const t0 = Date.now()
  await act()
  const ms = Date.now() - t0
  await builder().waitFor(); await p.waitForTimeout(1500)
  const onScreen = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
  const d = await draft()
  await toHome()
  const home = (await homeMeta()).match(/Fortsätt passet (.*?) · \d+ min/)?.[1]
  return { ms, onScreen, stored: d.title, storedIsOld: d.id === oldId, home, mallar: (await tmpls()).map((x) => x.title) }
}
await attempt('F', async () => {
  const r1 = await race('Mall', async () => {
    await moreBtn('Använd mall')
    await p.locator('.template-card').filter({ hasText: /Kort/ }).first().click()
    await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click()
  })
  check('F1-mall', 'Edit → Använd mall within the debounce: Home = pass on screen; old pass (with the edit) in Mina mallar', r1.ms < 800 && r1.home === r1.onScreen && r1.stored === r1.onScreen && !r1.storedIsOld && r1.mallar.includes('Mall gammal'), JSON.stringify(r1))
  await shot('07_race_mall_home')
  const r2 = await race('Vecka', async () => {
    await moreBtn('Ny vecka från det här passet')
    await p.getByRole('button', { name: 'Skapa kopia', exact: true }).click()
  })
  check('F1-nyvecka', 'Edit → Ny vecka → Skapa kopia within the debounce: Home = the copy on screen; old pass (with the edit) in Mina mallar once', r2.ms < 800 && r2.home === r2.onScreen && !r2.storedIsOld && r2.mallar.filter((t) => t === 'Vecka gammal').length === 1, JSON.stringify(r2))
})

const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
check('AC22b', 'Keys verbatim; saveDraft / savedToast gone; no «!»', meta.includes(`autosaveSaved: '${S.saved}'`) && meta.includes(`autosaveFailed: '${S.failed}'`) && meta.includes(S.toast) && !/^\s+(saveDraft|savedToast):/m.test(meta) && !/!/.test(Object.values(S).join('')))
check('E', 'No page errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-39-builder-smoke-results.json`, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
await browser.close()

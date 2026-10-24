// Slice 30 — Builder self-smoke (drives the real preview build like a coach).
// Run: node verifier/slice-30-builder-smoke.mjs  (preview on 127.0.0.1:4173)
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs') // Slice 51 B1
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { sliceNumber } from './tools/smoke-login.mjs'
import { startFragor, startTomt, startMall } from './tools/smoke-start.mjs'
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = process.env.S30_URL ?? 'http://127.0.0.1:4173/traningsplaneringen/'
const SHOTS = '/workspace/screenshots'
const ROOT = process.env.SMOKE_ROOT ?? '/workspace/gymnastics-planner'
const SLICE = sliceNumber(ROOT) // Slice 51: footer follows SLICE_NUMBER
const EXAMPLE = `${ROOT}/slice-30/content/example-import.json`
const OWN_KEY = 'gymnastics-planner-own-activities-v1'
const DRAFT_KEY = 'gymnastics-planner-draft-v1'
const exampleText = readFileSync(EXAMPLE, 'utf8')
// Slice 51: the coach import left the coach UI in Slice 47 (F1: import is admin-only; A1: Biblioteket has no
// own buttons; E1: OwnActivityForm is edit-only; B1: «ikväll»/ownedEquipment removed). The two example drills are
// seeded as the own list the old import produced (verifier/fixtures/s30own.json, built by make-s30own.ts).
const OWN_SEED = readFileSync(`${ROOT}/verifier/fixtures/s30own.json`, 'utf8')
const seedOwn = `(() => { if (sessionStorage.getItem('own-seeded')) return; sessionStorage.setItem('own-seeded','1');
  localStorage.setItem('${OWN_KEY}', ${JSON.stringify(JSON.stringify(JSON.parse(OWN_SEED)))}); })()`

const results = []
const log = []
function check(id, name, ok, detail = '') {
  results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + detail : ''}`)
}
function note(line) {
  log.push(line)
  console.log('  · ' + line)
}
async function shot(page, name) {
  const path = `${SHOTS}/slice30_${name}.png`
  await page.screenshot({ path, fullPage: false })
  note(`shot ${path}`)
}
async function attempt(id, name, fn) {
  try {
    await fn()
  } catch (err) {
    check(id, name, false, `error: ${String(err.message || err).split('\n').slice(0, 4).join(' ⏎ ')}`)
  }
}

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox'],
})
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, acceptDownloads: true }

async function freshPage(init) {
  const ctx = await browser.newContext(phone)
  if (init) await ctx.addInitScript(init)
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => note(`pageerror: ${e.message}`))
  await page.goto(BASE)
  return { ctx, page }
}
const store = (page, key) => page.evaluate((k) => localStorage.getItem(k), key)
const own = async (page) => JSON.parse((await store(page, OWN_KEY)) ?? '[]')

async function builderAction(page, name) {
  const direct = page.locator('.builder-actions > button, .builder-extra > button').filter({ hasText: name })
  for (const b of await direct.all()) {
    if (await b.isVisible()) return b.click()
  }
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name }).click()
}
async function openTeknikLibrary(page) {
  // Slice 51: no Bibliotek tab since Slice 47 A1 — the open side panel is the library.
  if (await page.locator('.side-panel-slot.is-open').count()) return
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await page.locator('.side-panel-slot.is-open').waitFor()
}
async function closeLibrary(page) {
  const btn = page.locator('.sheet-close')
  if (await btn.isVisible()) await btn.click()
}
const libraryCard = (page, title) =>
  page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: title }) }).first()
// Slice 51: the seed bank now holds rows with the same titles (2DJ), so own cards are picked by their Egen badge.
const ownCard = (page, title) =>
  page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: title }) }).filter({ has: page.locator('.own-badge') }).first()
const waitDraftHas = (page, id) => page.waitForFunction(([k, i]) => (localStorage.getItem(k) ?? '').includes(i), [DRAFT_KEY, id]) // Slice 39 autosave replaces Spara utkast
const noCoachImport = async (p) =>
  (await p.getByRole('button', { name: 'Ny egen övning' }).count()) === 0 &&
  (await p.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).count()) === 0

// ───────── A. Home + footer ─────────
let { ctx, page } = await freshPage(seedOwn)
const code = await page.evaluate(async (u) => (await fetch(u)).status, BASE)
note(`doctor status ${code}`)
await shot(page, 'home')

// ───────── B. Bibliotek entry ─────────
await startTomt(page)
await attempt('42', `Footer Slice ${SLICE}`, async () => {
  const footer = page.locator('footer.app-footer')
  const txt = (await footer.innerText()).replace(/\s+/g, ' ')
  check('42', `Footer reads Träningsplaneraren · Slice ${SLICE}`, txt.includes(`Träningsplaneraren · Slice ${SLICE}`), txt)
  await footer.scrollIntoViewIfNeeded()
  await shot(page, 'footer')
  await page.evaluate(() => window.scrollTo(0, 0))
})
await attempt('13', 'Import entry', async () => {
  await openTeknikLibrary(page)
  // Slice 51 (Slice 47 A1/E1/F1): was «Ny egen övning + Importera övningar side by side»; both left the coach library.
  check('13a', 'Coach Biblioteket has no Ny egen övning / Importera övningar (Slice 47 A1/F1)', await noCoachImport(page))
  await shot(page, 'library_entry')
})

// ───────── C/D. Seeded own list (was: import via file / paste — removed, Slice 47 F1) ─────────
await attempt('16', 'Own list badges', async () => {
  check('16b', 'Both drills stored', (await own(page)).length === 2)
  const card = ownCard(page, 'Formhopp över block från trampett')
  await card.scrollIntoViewIfNeeded()
  const badges = await card.locator('.own-badge, .review-badge').allTextContents()
  check('16c', 'Card shows Egen + Behöver granskas', badges.join('|') === 'Egen|Behöver granskas', badges.join('|'))
  await shot(page, 'library_badges')
  // block filter
  await page.locator('.filter-row select').selectOption('techniques')
  check('16d', 'Filterable by block (Teknik shows imported drill)', await ownCard(page, 'Äggrullning nerför kil').isVisible())
  const seedCard = libraryCard(page, 'Kullerbytta framåt')
  check('29a', 'Seed card has no review badge', (await seedCard.locator('.review-badge').count()) === 0)
  await page.locator('.filter-row select').selectOption('gathering')
  const narvaro = libraryCard(page, 'Närvaro')
  check('29b', 'Seed Närvaro (needsCoachReview seed) has no badge', (await narvaro.count()) > 0 && (await narvaro.locator('.review-badge').count()) === 0)
  await page.locator('.filter-row select').selectOption('techniques')
})

// ───────── E. Detail: Källa, Bygger på, sketch, badge ─────────
await attempt('2', 'Detail Formhopp', async () => {
  await ownCard(page, 'Formhopp över block från trampett').locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  const link = d.locator('.source-line a')
  const text = (await link.textContent()).replace(/\s+/g, ' ').trim()
  check('2a', 'Detail Källa line', text === 'Källa: Prime Coaching Sport · 0:30 ↗', text)
  check('3a', 'Link → https url, new tab, noopener noreferrer',
    (await link.getAttribute('href')) === 'https://youtu.be/2DJ_oMM81mI?t=30' &&
      (await link.getAttribute('target')) === '_blank' &&
      (await link.getAttribute('rel')) === 'noopener noreferrer',
    `aria="${await link.getAttribute('aria-label')}"`)
  const links = await d.locator('.detail-link-line').allTextContents()
  check('12a', 'Bygger på resolves to seed title', links.some((l) => l.startsWith('Bygger på: Ljushopp')), links.join(' / '))
  check('27a', 'Detail badge + hint + Markera som granskad',
    (await d.locator('h2 .review-badge').textContent()) === 'Behöver granskas' &&
      (await d.getByText('Importerad övning. Läs igenom den och ändra så att den passar er hall.').isVisible()) &&
      (await d.getByRole('button', { name: /Markera .* som granskad/ }).isVisible()))
  check('32a', 'Sketch drawn for trampett → skumblock → landningsmatta', (await d.locator('.station-sketch').count()) === 1)
  await d.locator('.source-line').scrollIntoViewIfNeeded()
  check('4a', 'No iframe/video/img for source in DOM', (await page.locator('iframe, video').count()) === 0 && (await d.locator('img').count()) === 0)
  await shot(page, 'detail_formhopp')
  await d.getByRole('button', { name: 'Lägg till i valt block' }).click()
  check('29c', 'Badge does not block adding to a pass', (await page.locator('.activity-detail').count()) === 0)
})

// ───────── F. Markera som granskad ─────────
await attempt('28', 'Markera som granskad', async () => {
  await openTeknikLibrary(page)
  await page.locator('.filter-row select').selectOption('techniques')
  await ownCard(page, 'Äggrullning nerför kil').locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  const links = await d.locator('.detail-link-line').allTextContents()
  check('12b', 'Lättare variant av: Kullerbytta framåt', links.includes('Lättare variant av: Kullerbytta framåt'), links.join(' / '))
  const src = (await d.locator('.source-line a').textContent()).replace(/\s+/g, ' ').trim()
  check('2b', 'Äggrullning Källa · 0:50', src === 'Källa: Prime Coaching Sport · 0:50 ↗', src)
  await shot(page, 'detail_aggrullning_kil_sketch')
  await d.getByRole('button', { name: /Markera .* som granskad/ }).click()
  const toast = await page.locator('.toast').textContent()
  check('28a', 'Markera som granskad → badge gone + toast',
    (await d.locator('.review-badge').count()) === 0 && toast === 'Markerad som granskad.', toast)
  await shot(page, 'marked_reviewed')
  await d.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await closeLibrary(page)
  await waitDraftHas(page, 'own-imp-2dj-03-aggrullning-kil') // Slice 51: Spara utkast removed in Slice 39 (autosave)
  await page.reload()
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  await openTeknikLibrary(page)
  await page.locator('.filter-row select').selectOption('techniques')
  const agg = ownCard(page, 'Äggrullning nerför kil')
  const form = ownCard(page, 'Formhopp över block från trampett')
  check('28b', 'After reload: Äggrullning badge gone, Formhopp still flagged',
    (await agg.locator('.review-badge').count()) === 0 && (await form.locator('.review-badge').count()) === 1)
})

// ───────── G. Ändra → Välj redskap → save clears badge ─────────
await attempt('9', 'Own form redskap', async () => {
  const form = ownCard(page, 'Formhopp över block från trampett')
  await form.getByRole('button', { name: 'Ändra' }).click()
  const f = page.locator('.own-form')
  await f.waitFor()
  const chips = await f.locator('.own-equipment-chip').allTextContents()
  check('9a', 'Form shows Redskap chips for a Teknik drill', chips.join('|') === 'Trampett|Skumblock|Landningsmatta', chips.join('|'))
  check('9b', 'Redskap chips draw icons', (await f.locator('.own-equipment-chip svg.equipment-icon').count()) === 3)
  await f.locator('.own-equipment').scrollIntoViewIfNeeded()
  await shot(page, 'form_redskap')
  await f.locator('select').first().selectOption('warmup')
  check('9c', 'Redskap field hidden when block ≠ Teknik', (await f.locator('.own-equipment').count()) === 0)
  await f.locator('select').first().selectOption('techniques')
  await f.getByRole('button', { name: 'Välj redskap' }).click()
  const picker = page.locator('.own-equipment-picker .station-compose-sheet')
  await picker.waitFor()
  check('9d', 'Picker titled Välj redskap', (await picker.locator('h2').textContent()) === 'Välj redskap')
  const tiles = picker.locator('.station-compose-library-btn')
  const labels = await tiles.allTextContents()
  check('30a', 'Picker grid has 15 tiles, new five after Kon',
    labels.length === 15 && labels.slice(9).join('|') === 'Kon|Kilmatta|Skumblock|Bom|Räcke|Rockring', labels.join('|'))
  const blank = await tiles.evaluateAll((els) => els.filter((el) => !el.querySelector('svg.equipment-icon')).length)
  check('31a', 'Every tile has an icon (no blank tiles)', blank === 0)
  const overflow = await page.evaluate(() => {
    const s = document.querySelector('.own-equipment-picker .station-compose-sheet')
    return { doc: document.documentElement.scrollWidth, win: window.innerWidth, sheet: s.scrollWidth - s.clientWidth }
  })
  check('36a', '15-tile grid fits 390 px without horizontal scroll', overflow.doc <= overflow.win && overflow.sheet <= 0, JSON.stringify(overflow))
  await picker.locator('.station-compose-library').scrollIntoViewIfNeeded()
  await shot(page, 'picker_15_tiles')
  await picker.getByRole('button', { name: 'Lägg till Rockring' }).click()
  await picker.getByRole('button', { name: 'Lägg till Rockring' }).click()
  await picker.getByRole('button', { name: 'Klar' }).click()
  const chips2 = await f.locator('.own-equipment-chip').allTextContents()
  check('9e', 'Picked redskap shows as chip (2× Rockring)', chips2.includes('2× Rockring'), chips2.join('|'))
  await f.getByRole('button', { name: 'Spara övning' }).click()
  const toast = await page.locator('.toast').textContent()
  const list = await own(page)
  const saved = list.find((a) => a.id === 'own-imp-2dj-02-formhopp-over-block')
  check('28c', 'Saving via Ändra clears Behöver granskas', toast === 'Egen övning sparad.' && !saved.needsCoachReview &&
    (await ownCard(page, 'Formhopp över block från trampett').locator('.review-badge').count()) === 0)
  check('8a', 'Edit preserved tags/difficulty/links/source',
    saved.tags.includes('trampett') && saved.tags.includes('egen') && saved.progressionOf === 'tech-ljushopp-trampett' &&
      saved.source?.creator === 'Prime Coaching Sport' && saved.source?.startSeconds === 30, JSON.stringify({ tags: saved.tags, src: saved.source }))
  check('9f', 'Chosen pieces saved to defaultStationEquipment',
    JSON.stringify(saved.defaultStationEquipment) === JSON.stringify([
      { pieceId: 'eq-trampett', count: 1 }, { pieceId: 'eq-skumblock', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 }, { pieceId: 'eq-rockring', count: 2 }]))
})

// ───────── G2. New own drill — removed: OwnActivityForm is edit-only since Slice 47 E1 (9g/9h/32b/9i) ─────────
// ───────── H. Pass-row info panel Källa ─────────
await attempt('2', 'Info panel Källa', async () => {
  await closeLibrary(page)
  const row = page.locator('.session-item').filter({ hasText: 'Formhopp över block från trampett' })
  await row.getByRole('button', { name: 'Se beskrivning' }).click()
  const panel = row.locator('.activity-tip-panel')
  const t = (await panel.locator('.source-line').textContent()).replace(/\s+/g, ' ').trim()
  check('2c', 'Pass-row info panel ends with the Källa line', t === 'Källa: Prime Coaching Sport · 0:30 ↗', t)
  check('29d', 'No review badge on pass rows', (await page.locator('.session-item .review-badge').count()) === 0)
  await row.scrollIntoViewIfNeeded()
  await shot(page, 'tip_source_line')
})

// ───────── I. Hall: auto-place, caption, Använd alla, Förrådslista ─────────
await attempt('10', 'Hall', async () => {
  await builderAction(page, 'Hallöversikt')
  await page.getByText('Schematisk hall — inte exakt mått').first().waitFor()
  check('40a', 'Caption Schematisk hall — inte exakt mått', true)
  const draft = JSON.parse(await store(page, DRAFT_KEY))
  const items = draft.blocks.flatMap((b) => b.items.map((i) => ({ ...i, type: b.type })))
  const zoneOf = (aid) => {
    const it = items.find((i) => i.activityId === aid)
    return draft.hallPlacements?.find((p) => p.sessionItemId === it?.id)?.zoneId
  }
  const zf = zoneOf('own-imp-2dj-02-formhopp-over-block')
  const za = zoneOf('own-imp-2dj-03-aggrullning-kil')
  // Slice 51: Teknik markers sit on the Stora hallen grid since Slice 45 (zoneId «open»), so «placed» replaces trampett/mats.
  check('10a', 'Own drills auto-placed on the hall', Boolean(zf) && Boolean(za), `formhopp=${zf} agg=${za}`)
  const gatherIds = new Set(items.filter((i) => i.type === 'gathering').map((i) => i.id))
  check('40b', 'Samling never placed on the hall', !(draft.hallPlacements ?? []).some((p) => gatherIds.has(p.sessionItemId)))
  await shot(page, 'hall_autoplaced')
  await page.locator('button.hall-tap-target').filter({ hasText: /^Använd alla förslag$/ }).first().click()
  const applied = await page.getByText('Sparade redskap på 2 stationer').first().isVisible()
  check('10b', 'Använd alla förslag uses own drills\' redskap (2 stationer)', applied)
  await page.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click()
  await page.locator('.forradslista-row').first().waitFor() // Slice 51: «Vad finns i hallen ikväll?» removed (Slice 47 B1)
  const rows = await page.locator('.forradslista-row').allTextContents()
  const expected = ['Trampett', 'Landningsmatta', 'Madrass', 'Kilmatta', 'Skumblock', '2× Rockring']
  check('34a', 'Förrådslista sums new pieces in library order (after the first ten)', JSON.stringify(rows) === JSON.stringify(expected), rows.join(' · '))
  // Slice 51: 34b (owned toggles) removed — ownedEquipment left in Slice 47 B1.
  await shot(page, 'forradslista')
})

// ───────── I2. Golvklart / stationskort: no Källa, no badge ─────────
await attempt('5', 'Golvklart', async () => {
  await page.keyboard.press('Escape')
  await page.goto(BASE)
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  // Slice 51: Golvklart lives in Hallöversikt; the Export sheet lost Helskär in Slice 44 (Dela = länk + utskrift).
  await builderAction(page, 'Hallöversikt')
  await page.getByRole('button', { name: 'Golvklart', exact: true }).first().click()
  await page.waitForTimeout(400)
  const deckText = await page.locator('body').innerText()
  check('5a', 'Golvklart / stationskort show no Källa and no Behöver granskas', !/Källa:/.test(deckText) && !/Behöver granskas/.test(deckText))
  // Slice 51: stationskort (Helskär) left in Slice 44; Golvklart lists each station's redskap under its marker instead of a sketch.
  check('31b', 'Golvklart lists the own drill\'s new redskap (2× Rockring)', /2× Rockring/.test(deckText))
  await shot(page, 'golvklart_sketch')
  await page.keyboard.press('Escape')
  await page.goto(BASE)
})

// ───────── J. Share link carries source ─────────
let shareUrl = ''
await attempt('6', 'Share', async () => {
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  // Slice 51: «Exportera / dela» is «Dela» since Slice 44 — Kopiera länk + Skriv ut, no file download, so 6a checks
  // the link; the receiving device (6b/6c) proves source + redskap travel with it.
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'])
  await builderAction(page, 'Dela')
  const sheet = page.locator('.export-sheet')
  await sheet.getByRole('button', { name: 'Kopiera länk' }).click()
  await page.waitForTimeout(300)
  shareUrl = await page.evaluate(() => navigator.clipboard.readText())
  check('6a', 'Dela gives a #dela= share link', /\/traningsplaneringen\/#dela=/.test(shareUrl), shareUrl.slice(0, 60))
  await shot(page, 'export_share')
})
await ctx.close()

await attempt('6', 'Share receive', async () => {
  const second = await freshPage()
  const p2 = second.page
  await p2.goto(shareUrl.replace(/^https?:\/\/[^/]+\/traningsplaneringen\//, BASE))
  await p2.getByRole('button', { name: 'Spara på den här enheten' }).click()
  const row = p2.locator('.session-item').filter({ hasText: 'Äggrullning nerför kil' })
  await row.getByRole('button', { name: 'Se beskrivning' }).click()
  const t = (await row.locator('.source-line').textContent()).replace(/\s+/g, ' ').trim()
  check('6b', 'Receiving device (2nd profile) shows the same Källa line', t === 'Källa: Prime Coaching Sport · 0:50 ↗', t)
  const stored = await own(p2)
  check('6c', 'Received own drills saved with source + redskap', stored.some((a) => a.source?.startSeconds === 50 && a.defaultStationEquipment?.[0]?.pieceId === 'eq-kilmatta'))
  await row.scrollIntoViewIfNeeded()
  await shot(p2, 'share_received_source')
  await second.ctx.close()
})

// ───────── K–N, M, P. Edge fixture, re-import, file errors, cap 99, owned migration — removed ─────────
// Slice 51: these drove the coach import sheet and the «ikväll» toggles, which left the coach UI in Slice 47
// (F1 import admin-only, E1 no Ny egen övning, B1 ownedEquipment gone). Ids removed: 19a–23b, 24a–24d, 17a, 25a–25c,
// 11a, 11b, 34c, 35a–35c. Admin import is covered by the Slice 47 smoke.

// ───────── O. Home Hämta ett pass with an exercise file ─────────
await attempt('18', 'Home importIsExercises', async () => {
  ;({ ctx, page } = await freshPage())
  await startTomt(page)
  await page.waitForTimeout(500) // Slice 51: no Spara utkast since Slice 39; whatever autosave holds must stay untouched
  const before = await store(page, DRAFT_KEY)
  await page.goto(BASE)
  await page.getByRole('button', { name: 'Hämta ett pass' }).click()
  await page.getByRole('textbox', { name: 'Länk eller kod' }).fill(exampleText)
  await page.getByRole('button', { name: 'Öppna', exact: true }).click()
  const alert = await page.locator('.home-receive [role=alert]').textContent()
  // Slice 51: text follows Slice 47 F1 (import is under Admin).
  check('18a', 'Home shows importIsExercises; draft untouched',
    alert === 'Det här är en fil med övningar. En admin lägger in den under Admin.' && (await store(page, DRAFT_KEY)) === before, alert)
  await shot(page, 'home_is_exercises')
  await ctx.close()
})

// ───────── Q. Regression: wizard, Soft blank, mall ─────────
await attempt('41', 'Wizard', async () => {
  ;({ ctx, page } = await freshPage())
  await startFragor(page, { age: /7–9/, focus: /^Trampett/ }) // Slice 51: question path; Standard trupp left the hall list (Slice 45)
  const draft = JSON.parse(await store(page, DRAFT_KEY))
  const filled = draft.blocks.filter((b) => b.items.length > 0).length
  const zones = (draft.hallPlacements ?? []).map((p) => p.zoneId)
  check('41a', 'Planera pass wizard → five blocks filled, Teknik pre-placed', filled === 5 && zones.length > 0 /* Slice 51: Stora hallen grid (zoneId open) since Slice 45 */, `filled=${filled} zones=${zones}`)
  await shot(page, 'regress_wizard')
  await ctx.close()
})
await attempt('41', 'Soft blank', async () => {
  ;({ ctx, page } = await freshPage())
  await startTomt(page)
  const samling = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Samling$/ }) })
  const titles = await samling.locator('.item-title').allTextContents()
  check('41b', 'Soft Samling on blank Tomt pass', titles.length === 2, titles.join(' | '))
  await shot(page, 'regress_soft_blank')
  await ctx.close()
})
await attempt('41', 'Mall', async () => {
  ;({ ctx, page } = await freshPage())
  await startMall(page, /Nybörjare/)
  const draftItems = await page.locator('.session-item').count()
  check('41c', 'Starta från mall → pass with items', draftItems > 3, `items=${draftItems}`)
  await shot(page, 'regress_mall')
  await ctx.close()
})

await attempt('13', 'Desktop library', async () => {
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const dp = await dctx.newPage()
  dp.setDefaultTimeout(8000)
  await dp.goto(BASE)
  await startTomt(dp)
  await openTeknikLibrary(dp)
  // Slice 51 (Slice 47 F1): was «Importera övningar in the side library»; the desktop side library has no coach import.
  check('13c', 'Desktop side library has no coach import (Slice 47 F1)', await noCoachImport(dp))
  await shot(dp, 'desktop_library')
  await dctx.close()
})

await browser.close()
writeFileSync(`${ROOT}/verifier/slice-30-smoke-results.json`, JSON.stringify({ results, log }, null, 2))
const pass = results.filter((r) => r.ok).length
const fail = results.filter((r) => !r.ok).length
console.log(`\nTOTAL PASS ${pass} FAIL ${fail}`)
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

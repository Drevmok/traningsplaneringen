// Slice 30 — Builder self-smoke (drives the real preview build like a coach).
// Run: node verifier/slice-30-builder-smoke.mjs  (preview on 127.0.0.1:4173)
import { chromium } from '/usr/local/lib/node_modules/playwright-core/index.mjs'
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/traningsplaneringen/'
const SHOTS = '/workspace/screenshots'
const ROOT = '/workspace/gymnastics-planner'
const EXAMPLE = `${ROOT}/slice-30/content/example-import.json`
const EDGE = `${ROOT}/slice-30/content/example-import-edge.json`
const OWN_KEY = 'gymnastics-planner-own-activities-v1'
const DRAFT_KEY = 'gymnastics-planner-draft-v1'
const exampleText = readFileSync(EXAMPLE, 'utf8')
const edgeText = readFileSync(EDGE, 'utf8')

const results = []
const log = []
function check(id, name, ok, detail = '') {
  results.push({ id, name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + detail : ''}`)
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
  if (await page.locator('.side-panel-slot.is-open').count()) {
    await page.getByRole('tab', { name: 'Bibliotek' }).click()
    return
  }
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

// ───────── A. Home + footer ─────────
let { ctx, page } = await freshPage()
const code = await page.evaluate(async (u) => (await fetch(u)).status, BASE)
note(`doctor status ${code}`)
await shot(page, 'home')

// ───────── B. Bibliotek entry ─────────
await page.getByRole('button', { name: 'Tomt pass' }).click()
await attempt('42', 'Footer Slice 30', async () => {
  const footer = page.locator('footer.app-footer')
  const txt = (await footer.innerText()).replace(/\s+/g, ' ')
  check('42', 'Footer reads Träningsplaneraren · Slice 30', txt.includes('Träningsplaneraren · Slice 30'), txt)
  await footer.scrollIntoViewIfNeeded()
  await shot(page, 'footer')
  await page.evaluate(() => window.scrollTo(0, 0))
})
await attempt('13', 'Import entry', async () => {
  await openTeknikLibrary(page)
  const newBtn = page.getByRole('button', { name: 'Ny egen övning' })
  const imp = page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' })
  check('13a', 'Bibliotek shows Ny egen övning + Importera övningar side by side',
    (await newBtn.isVisible()) && (await imp.isVisible()) && (await imp.textContent()) === 'Importera övningar')
  await shot(page, 'library_entry')
})

// ───────── C. Import via file → Avbryt writes nothing ─────────
await attempt('14', 'Import via file', async () => {
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  await sheet.waitFor()
  check('13b', 'Sheet has Välj fil + Klistra in kod + Läs in',
    (await sheet.getByText('Välj fil', { exact: true }).isVisible()) &&
      (await sheet.getByText('Klistra in kod', { exact: true }).isVisible()) &&
      (await sheet.getByRole('button', { name: 'Läs in' }).isVisible()))
  await sheet.locator('input[type=file]').setInputFiles(EXAMPLE)
  await sheet.locator('.own-import-row').first().waitFor()
  const states = await sheet.locator('.own-import-state').allTextContents()
  const choices = await sheet.locator('.own-import-choice').evaluateAll((els) => els.map((e) => e.selectedOptions[0].textContent))
  const batch = await sheet.locator('.own-import-batch').textContent()
  const room = await sheet.locator('.own-import-room').textContent()
  check('14a', 'File → 2 rows, both Ny, default Ta med, batch note on top',
    states.join('|') === 'Ny|Ny' && choices.join('|') === 'Ta med|Ta med' && /Prime Coaching Sport/.test(batch),
    `states=${states} choices=${choices} room="${room}"`)
  check('15a', 'Nothing written before Importera', (await store(page, OWN_KEY)) === null)
  await shot(page, 'import_preview_file')
  await sheet.getByRole('button', { name: 'Avbryt' }).click()
  check('15b', 'Avbryt leaves own list unchanged', (await store(page, OWN_KEY)) === null && !(await sheet.isVisible()))
})

// ───────── D. Import via paste ─────────
await attempt('14', 'Import via paste', async () => {
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  await sheet.locator('textarea').fill('```json\n' + exampleText + '\n```')
  await sheet.getByRole('button', { name: 'Läs in' }).click()
  await sheet.locator('.own-import-row').first().waitFor()
  const states = await sheet.locator('.own-import-state').allTextContents()
  check('14b', 'Paste (fenced ```json) → 2 rows Ny', states.join('|') === 'Ny|Ny')
  await shot(page, 'import_preview_paste')
  const confirm = sheet.getByRole('button', { name: 'Importera 2 övningar' })
  check('14c', 'Primary reads Importera 2 övningar', await confirm.isVisible())
  await confirm.click()
  const toast = await page.locator('.toast').textContent()
  check('16a', 'Toast after import', toast === '2 övningar importerade. Läs igenom dem före passet.', toast)
  const list = await own(page)
  check('16b', 'Both drills stored', list.length === 2)
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
  const card = libraryCard(page, 'Formhopp över block från trampett')
  await card.scrollIntoViewIfNeeded()
  const badges = await card.locator('.own-badge, .review-badge').allTextContents()
  check('16c', 'Card shows Egen + Behöver granskas', badges.join('|') === 'Egen|Behöver granskas', badges.join('|'))
  await shot(page, 'library_badges')
  // block filter
  await page.locator('.filter-row select').selectOption('techniques')
  check('16d', 'Filterable by block (Teknik shows imported drill)', await libraryCard(page, 'Äggrullning nerför kil').isVisible())
  const seedCard = libraryCard(page, 'Kullerbytta framåt')
  check('29a', 'Seed card has no review badge', (await seedCard.locator('.review-badge').count()) === 0)
  await page.locator('.filter-row select').selectOption('gathering')
  const narvaro = libraryCard(page, 'Närvaro')
  check('29b', 'Seed Närvaro (needsCoachReview seed) has no badge', (await narvaro.count()) > 0 && (await narvaro.locator('.review-badge').count()) === 0)
  await page.locator('.filter-row select').selectOption('techniques')
})

// ───────── E. Detail: Källa, Bygger på, sketch, badge ─────────
await attempt('2', 'Detail Formhopp', async () => {
  await libraryCard(page, 'Formhopp över block från trampett').locator('.activity-card').click()
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
  await libraryCard(page, 'Äggrullning nerför kil').locator('.activity-card').click()
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
  await page.getByRole('button', { name: 'Spara utkast' }).click()
  await page.reload()
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  await openTeknikLibrary(page)
  await page.locator('.filter-row select').selectOption('techniques')
  const agg = libraryCard(page, 'Äggrullning nerför kil')
  const form = libraryCard(page, 'Formhopp över block från trampett')
  check('28b', 'After reload: Äggrullning badge gone, Formhopp still flagged',
    (await agg.locator('.review-badge').count()) === 0 && (await form.locator('.review-badge').count()) === 1)
})

// ───────── G. Ändra → Välj redskap → save clears badge ─────────
await attempt('9', 'Own form redskap', async () => {
  const form = libraryCard(page, 'Formhopp över block från trampett')
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
    (await libraryCard(page, 'Formhopp över block från trampett').locator('.review-badge').count()) === 0)
  check('8a', 'Edit preserved tags/difficulty/links/source',
    saved.tags.includes('trampett') && saved.tags.includes('egen') && saved.progressionOf === 'tech-ljushopp-trampett' &&
      saved.source?.creator === 'Prime Coaching Sport' && saved.source?.startSeconds === 30, JSON.stringify({ tags: saved.tags, src: saved.source }))
  check('9f', 'Chosen pieces saved to defaultStationEquipment',
    JSON.stringify(saved.defaultStationEquipment) === JSON.stringify([
      { pieceId: 'eq-trampett', count: 1 }, { pieceId: 'eq-skumblock', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 }, { pieceId: 'eq-rockring', count: 2 }]))
})

// ───────── G2. New own drill: Teknik with redskap, then moved off Teknik ─────────
await attempt('9', 'New own drill block switch', async () => {
  await page.getByRole('button', { name: 'Ny egen övning' }).click()
  const f = page.locator('.own-form')
  await f.waitFor()
  check('9g', 'New form defaults: Inga redskap valda.', await f.getByText('Inga redskap valda.').isVisible())
  await f.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input').fill('Bomgång test')
  await f.locator('select').first().selectOption('techniques')
  await f.getByRole('button', { name: 'Välj redskap' }).click()
  const picker = page.locator('.own-equipment-picker .station-compose-sheet')
  await picker.getByRole('button', { name: 'Lägg till Bom' }).click()
  await picker.getByRole('button', { name: 'Lägg till Räcke' }).click()
  await picker.getByRole('button', { name: 'Klar' }).click()
  await f.locator('label.own-field').filter({ hasText: 'Varför' }).locator('textarea').fill('Balans.')
  await f.locator('label.own-field').filter({ hasText: 'Så gör du' }).locator('textarea').fill('Gå.\nVänd.')
  await f.locator('label.own-field').filter({ hasText: 'Se upp för' }).locator('textarea').fill('Blicken.')
  await f.locator('label.own-field').filter({ hasText: 'Säkerhet' }).locator('textarea').fill('Matta under.')
  await f.getByRole('button', { name: 'Spara övning' }).click()
  let list = await own(page)
  const bom = list.find((a) => a.title === 'Bomgång test')
  check('9h', 'New Teknik drill saves Bom + Räcke', JSON.stringify(bom?.defaultStationEquipment) === JSON.stringify([{ pieceId: 'eq-bom', count: 1 }, { pieceId: 'eq-racke', count: 1 }]))
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
  await libraryCard(page, 'Bomgång test').locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  check('32b', 'Sketch draws räcke + bom', (await d.locator('.station-sketch').count()) === 1)
  await shot(page, 'sketch_bom_racke')
  await d.locator('.modal-close').click()
  await libraryCard(page, 'Bomgång test').getByRole('button', { name: 'Ändra' }).click()
  await f.locator('select').first().selectOption('strength')
  await f.getByRole('button', { name: 'Spara övning' }).click()
  list = await own(page)
  check('9i', 'Moving the drill off Teknik and saving clears redskap', list.find((a) => a.title === 'Bomgång test')?.defaultStationEquipment === undefined)
})

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
  check('10a', 'Own drills auto-placed: Formhopp → trampett, Äggrullning → mats', zf === 'trampett' && za === 'mats', `formhopp=${zf} agg=${za}`)
  const gatherIds = new Set(items.filter((i) => i.type === 'gathering').map((i) => i.id))
  check('40b', 'Samling never placed on the hall', !(draft.hallPlacements ?? []).some((p) => gatherIds.has(p.sessionItemId)))
  await shot(page, 'hall_autoplaced')
  await page.locator('button.hall-tap-target').filter({ hasText: /^Använd alla förslag$/ }).first().click()
  const applied = await page.getByText('Sparade redskap på 2 stationer').first().isVisible()
  check('10b', 'Använd alla förslag uses own drills\' redskap (2 stationer)', applied)
  await page.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click()
  await page.getByText('Vad finns i hallen ikväll?').first().waitFor()
  const rows = await page.locator('.forradslista-row').allTextContents()
  const expected = ['Trampett', 'Landningsmatta', 'Madrass', 'Kilmatta', 'Skumblock', '2× Rockring']
  check('34a', 'Förrådslista sums new pieces in library order (after the first ten)', JSON.stringify(rows) === JSON.stringify(expected), rows.join(' · '))
  const toggles = await page.locator('.forrad-owned-list input[type=checkbox]').count()
  check('34b', 'Owned toggles list 15', toggles === 15, `checkboxes=${toggles}`)
  await shot(page, 'forradslista')
})

// ───────── I2. Golvklart / stationskort: no Källa, no badge ─────────
await attempt('5', 'Golvklart', async () => {
  await page.keyboard.press('Escape')
  await page.goto(BASE)
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  await builderAction(page, 'Exportera / dela')
  await page.locator('.export-sheet').waitFor()
  await page.getByRole('button', { name: 'Helskär' }).click()
  await page.waitForTimeout(400)
  const deckText = await page.locator('body').innerText()
  check('5a', 'Golvklart / stationskort show no Källa and no Behöver granskas', !/Källa:/.test(deckText) && !/Behöver granskas/.test(deckText))
  check('31b', 'Stationskort sketch present for own drill with new redskap', (await page.locator('.station-sketch').count()) > 0)
  await shot(page, 'golvklart_sketch')
  await page.keyboard.press('Escape')
  await page.goto(BASE)
})

// ───────── J. Share link + pass JSON carry source ─────────
let shareUrl = ''
let passJson = null
await attempt('6', 'Share', async () => {
  await page.getByRole('button', { name: /Fortsätt/ }).first().click()
  await builderAction(page, 'Exportera / dela')
  const sheet = page.locator('.export-sheet')
  await sheet.locator('textarea.export-url').waitFor()
  shareUrl = await sheet.locator('textarea.export-url').inputValue()
  const [download] = await Promise.all([page.waitForEvent('download'), sheet.getByRole('button', { name: 'Ladda ner fil' }).click()])
  const path = await download.path()
  passJson = JSON.parse(readFileSync(path, 'utf8'))
  writeFileSync(`${ROOT}/verifier/slice-30-pass-export.json`, JSON.stringify(passJson, null, 2))
  const o = (passJson.own ?? []).find((x) => x.id === 'own-imp-2dj-02-formhopp-over-block')
  check('6a', 'Pass JSON carries source + redskap + tags for own drills',
    o?.source?.creator === 'Prime Coaching Sport' && o?.defaultStationEquipment?.length === 4 && o?.tags?.includes('trampett'),
    `saved to verifier/slice-30-pass-export.json`)
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

// ───────── K. Edge fixture ─────────
;({ ctx, page } = await freshPage())
await page.getByRole('button', { name: 'Tomt pass' }).click()
await openTeknikLibrary(page)
async function openImport(text) {
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  await sheet.locator('textarea').fill(text)
  await sheet.getByRole('button', { name: 'Läs in' }).click()
  return sheet
}
await attempt('19', 'Edge fixture', async () => {
  const sheet = await openImport(edgeText)
  await sheet.locator('.own-import-row').first().waitFor()
  const rows = sheet.locator('.own-import-row')
  const info = await rows.evaluateAll((els) => els.map((el) => ({
    title: el.querySelector('.own-import-row-title').textContent,
    state: el.querySelector('.own-import-state').textContent,
    locked: el.querySelector('select').disabled,
    notes: [...el.querySelectorAll('.own-import-note')].map((n) => n.textContent),
  })))
  note('edge rows ' + JSON.stringify(info))
  const [r1, r2, r3, r4, r5, r6, r7] = info
  check('19a', 'Row 01 importable + Okänt redskap togs bort: eq-ringar', r1.state === 'Ny' && r1.notes.includes('Okänt redskap togs bort: eq-ringar'))
  check('20a', 'Row 02 importable + Högst fyra steg', r2.state === 'Ny' && r2.notes.includes('Högst fyra steg. Resten togs bort.'))
  check('21a', 'Row 03 Kan inte importeras · Saknar säkerhet.', r3.state === 'Kan inte importeras' && r3.locked && r3.notes.includes('Saknar säkerhet.'))
  check('21b', 'Row 04 dup id → Kan inte importeras', r4.state === 'Kan inte importeras' && r4.locked && r4.notes.includes('Samma övning finns två gånger i filen.'))
  check('22a', 'Row 05 Samma namn finns redan + link + source notes', r5.state === 'Samma namn finns redan' &&
    r5.notes.includes('Kopplingen till en annan övning togs bort.') && r5.notes.includes('Källan togs bort. Den behöver en https-länk och ett namn.'))
  check('23a', 'Row 06 importable, redskap dropped (not Teknik)', r6.state === 'Ny' && r6.notes.includes('Redskapen togs bort. De används bara i Teknik.'))
  check('21c', 'Row 07 BAD-ID → Kan inte importeras · fel format', r7.state === 'Kan inte importeras' && r7.locked && r7.notes.includes('Övningen har fel format.'))
  await shot(page, 'import_edge')
  await sheet.locator('.own-import-rows').scrollIntoViewIfNeeded()
  await sheet.getByRole('button', { name: 'Importera 4 övningar' }).click()
  const list = await own(page)
  const r1s = list.find((a) => a.id === 'own-imp-edge-01-okant-redskap')
  const r2s = list.find((a) => a.id === 'own-imp-edge-02-fem-steg')
  const r6s = list.find((a) => a.id === 'own-imp-edge-06-redskap-utanfor-teknik')
  check('19b', 'Saved row 01 redskap = trampett only', JSON.stringify(r1s?.defaultStationEquipment) === '[{"pieceId":"eq-trampett","count":1}]')
  check('20b', 'Saved row 02 howTo has exactly 4 steps', r2s?.howTo.split('\n').length === 4)
  check('23b', 'Row 06 no review badge (needsCoachReview:false honoured)',
    !r6s?.needsCoachReview && (await libraryCard(page, 'Redskap utanför Teknik').locator('.review-badge').count()) === 0)
})

// ───────── L. Re-import → Finns redan → Ersätt in place ─────────
await attempt('24', 'Re-import Ersätt', async () => {
  let sheet = await openImport(exampleText)
  await sheet.getByRole('button', { name: 'Importera 2 övningar' }).click()
  // put Formhopp in the pass
  await page.locator('.filter-row select').selectOption('techniques')
  await libraryCard(page, 'Formhopp över block från trampett').locator('.activity-card').click()
  await page.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  await openTeknikLibrary(page)
  const doc = JSON.parse(exampleText)
  doc.exercises[0].title = 'Formhopp över block (ny version)'
  sheet = await openImport(JSON.stringify(doc))
  await sheet.locator('.own-import-row').first().waitFor()
  const states = await sheet.locator('.own-import-state').allTextContents()
  const choices = await sheet.locator('.own-import-choice').evaluateAll((els) => els.map((e) => e.selectedOptions[0].textContent))
  check('24a', 'Re-import → both Finns redan, default Hoppa över', states.join('|') === 'Finns redan|Finns redan' && choices.join('|') === 'Hoppa över|Hoppa över')
  check('24b', 'Nothing chosen → Välj minst en övning först (disabled)', await sheet.getByRole('button', { name: 'Välj minst en övning först' }).isDisabled())
  await sheet.locator('.own-import-choice').first().selectOption('replace')
  check('24c', 'Ersätt shows its note', await sheet.getByText('Ersätt skriver över din version. Pass som använder övningen får den nya texten.').isVisible())
  await shot(page, 'import_replace')
  await sheet.getByRole('button', { name: 'Importera 1 övning' }).click()
  const toast = await page.locator('.toast').textContent()
  const list = await own(page)
  const replaced = list.filter((a) => a.id === 'own-imp-2dj-02-formhopp-over-block')
  await closeLibrary(page)
  const passRow = await page.locator('.session-item').filter({ hasText: 'Formhopp över block (ny version)' }).count()
  check('24d', 'Ersätt updates in place (same id) and the pass shows the new text',
    replaced.length === 1 && replaced[0].title === 'Formhopp över block (ny version)' && passRow === 1 && toast === '1 övning importerad. Läs igenom den före passet.', toast)
})

// ───────── N. File-level errors ─────────
await attempt('17', 'File errors', async () => {
  await openTeknikLibrary(page)
  const doc = JSON.parse(exampleText)
  const cases = [
    ['inte json', 'Filen eller koden gick inte att läsa.'],
    [JSON.stringify({ ...doc, schemaVersion: 2 }), 'Filen kommer från en nyare version av appen. Uppdatera appen och försök igen.'],
    [JSON.stringify({ ...doc, exercises: [] }), 'Det finns inga övningar i filen.'],
    [JSON.stringify(passJson ?? { v: 1, blocks: [] }), 'Det här är ett pass. Öppna det under Hämta ett pass på startsidan.'],
  ]
  const got = []
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  for (const [text] of cases) {
    await sheet.locator('textarea').fill(text)
    await sheet.getByRole('button', { name: 'Läs in' }).click()
    got.push(await sheet.locator('.own-import-error').textContent())
  }
  check('17a', 'bad / newer / empty / isPass messages', got.every((g, i) => g === cases[i][1]), got.join(' | '))
  await shot(page, 'import_error_ispass')
  await sheet.getByRole('button', { name: 'Avbryt' }).click()
})
await ctx.close()

// ───────── M. Cap 100 ─────────
function fillScript(n) {
  return `(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1');
    const list = Array.from({ length: ${n} }, (_, i) => ({ id: 'own-fill-' + i, title: 'Fyll ' + i, blockType: 'warmup',
      durationMinutesDefault: 5, summary: 'x', howTo: '1. x', watchFor: 'x', safetyLine: 'x' }));
    localStorage.setItem('${OWN_KEY}', JSON.stringify(list)); })()`
}
await attempt('25', 'Cap 99', async () => {
  ;({ ctx, page } = await freshPage(fillScript(99)))
  await page.getByRole('button', { name: 'Tomt pass' }).click()
  await openTeknikLibrary(page)
  const sheet = await openImport(exampleText)
  await sheet.locator('.own-import-row').first().waitFor()
  const states = await sheet.locator('.own-import-state').allTextContents()
  const room = await sheet.locator('.own-import-room').textContent()
  const locked = await sheet.locator('.own-import-choice').evaluateAll((els) => els.map((e) => e.disabled))
  check('25a', 'With 99 own: first importable, second Ingen plats, Plats för 1 till',
    states.join('|') === 'Ny|Ingen plats' && room === 'Plats för 1 till' && locked.join() === 'false,true', `${states} · ${room}`)
  await shot(page, 'import_cap_99')
  await sheet.getByRole('button', { name: 'Importera 1 övning' }).click()
  check('25b', 'Import fills to exactly 100', (await own(page)).length === 100)
  await page.getByRole('button', { name: 'Ny egen övning' }).click()
  const f = page.locator('.own-form')
  await f.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input').fill('Nummer 101')
  await f.locator('select').first().selectOption('warmup')
  await f.locator('label.own-field').filter({ hasText: 'Varför' }).locator('textarea').fill('x')
  await f.locator('label.own-field').filter({ hasText: 'Så gör du' }).locator('textarea').fill('1\n2\n3\n4\n5')
  await f.locator('label.own-field').filter({ hasText: 'Se upp för' }).locator('textarea').fill('x')
  await f.locator('label.own-field').filter({ hasText: 'Säkerhet' }).locator('textarea').fill('x')
  await f.getByRole('button', { name: 'Spara övning' }).click()
  check('11b', 'Five steps still rejected (Högst fyra)', await f.getByText('Skriv minst ett steg, högst fyra.').isVisible())
  await f.locator('label.own-field').filter({ hasText: 'Så gör du' }).locator('textarea').fill('1\n2')
  await f.getByRole('button', { name: 'Spara övning' }).click()
  check('11a', '101st save → Du har 100 egna övningar. Ta bort en först.', await f.getByText('Du har 100 egna övningar. Ta bort en först.').isVisible())
  await shot(page, 'own_full_100')
  await f.getByRole('button', { name: 'Fortsätt redigera' }).click().catch(() => page.keyboard.press('Escape'))
  const sheet2 = await openImport(JSON.stringify({ ...JSON.parse(exampleText), exercises: [{ ...JSON.parse(exampleText).exercises[0], id: 'own-imp-extra-01' }] }))
  await sheet2.locator('.own-import-row').first().waitFor()
  check('25c', 'At 100: room line reads ownImportRoomNone', (await sheet2.locator('.own-import-room').textContent()) === 'Du har redan 100 egna övningar. Ta bort några för att importera fler.')
  await ctx.close()
})

// ───────── O. Home Hämta ett pass with an exercise file ─────────
await attempt('18', 'Home importIsExercises', async () => {
  ;({ ctx, page } = await freshPage())
  await page.getByRole('button', { name: 'Tomt pass' }).click()
  await page.getByRole('button', { name: 'Spara utkast' }).click()
  const before = await store(page, DRAFT_KEY)
  await page.getByRole('button', { name: /Till start|Hem|Startsida/ }).first().click().catch(() => page.goto(BASE))
  await page.goto(BASE)
  await page.getByRole('button', { name: 'Hämta ett pass' }).click()
  await page.getByRole('textbox', { name: 'Länk eller kod' }).fill(exampleText)
  await page.getByRole('button', { name: 'Öppna', exact: true }).click()
  const alert = await page.locator('.home-receive [role=alert]').textContent()
  check('18a', 'Home shows importIsExercises; draft untouched',
    alert === 'Det här är övningar. Importera dem under Bibliotek → Importera övningar.' && (await store(page, DRAFT_KEY)) === before, alert)
  await shot(page, 'home_is_exercises')
  await ctx.close()
})

// ───────── P. «ikväll» migration from an old saved owned list ─────────
await attempt('35', 'Owned migration', async () => {
  const old = JSON.stringify(['eq-trampett', 'eq-satsbrada', 'eq-plint', 'eq-landningsmatta', 'eq-tumblingmatta',
    'eq-madrass', 'eq-mattberg', 'eq-flickiskudde', 'eq-airtrack', 'eq-kon'])
  ;({ ctx, page } = await freshPage(`(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1');
    localStorage.setItem('gymnastics-planner-owned-equipment-v1', '${old}'); })()`))
  await page.getByRole('button', { name: 'Tomt pass' }).click()
  await openTeknikLibrary(page)
  const tonight = page.locator('.library-tonight input[type=checkbox]')
  check('35a', 'Old explicit 10-list: tonight filter does NOT switch on', !(await tonight.isChecked()))
  const owned = JSON.parse(await store(page, 'gymnastics-planner-owned-equipment-v1'))
  check('35b', 'After upgrade all 15 owned + seen key written', owned.length === 15 &&
    JSON.parse(await store(page, 'gymnastics-planner-owned-equipment-seen-v1')).length === 15, `owned=${owned.length}`)
  await shot(page, 'migration_tonight_off')
  // untick Bom through the real Förrådslista toggles
  await page.locator('.filter-row select').selectOption('techniques')
  await libraryCard(page, 'Kullerbytta framåt').locator('.activity-card').click()
  await page.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  await closeLibrary(page)
  await builderAction(page, 'Hallöversikt')
  await page.getByRole('button', { name: 'Visa förrådslista för passet' }).first().click()
  const bom = page.locator('label').filter({ hasText: /^Bom$/ }).locator('input[type=checkbox]')
  check('34c', 'Owned toggles include the new pieces, ticked', (await bom.count()) === 1 && (await bom.isChecked()))
  await bom.uncheck()
  await shot(page, 'migration_owned_toggles')
  await page.reload()
  const after = JSON.parse(await store(page, 'gymnastics-planner-owned-equipment-v1'))
  check('35c', 'Unticking Bom sticks after reload', !after.includes('eq-bom') && after.length === 14, `owned=${after.length}`)
  await ctx.close()
})

// ───────── Q. Regression: wizard, Soft blank, mall ─────────
await attempt('41', 'Wizard', async () => {
  ;({ ctx, page } = await freshPage())
  await page.getByRole('button', { name: 'Planera pass' }).click()
  const w = page.locator('[aria-labelledby="home-wizard-title"]')
  await w.getByRole('option', { name: /7–9/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /^Trampett/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /Standard trupp/ }).first().click()
  await w.getByRole('button', { name: 'Skapa pass' }).click()
  const draft = JSON.parse(await store(page, DRAFT_KEY))
  const filled = draft.blocks.filter((b) => b.items.length > 0).length
  const zones = (draft.hallPlacements ?? []).map((p) => p.zoneId)
  check('41a', 'Planera pass wizard → five blocks filled, Teknik pre-placed (trampett zone)', filled === 5 && zones.includes('trampett'), `filled=${filled} zones=${zones}`)
  await shot(page, 'regress_wizard')
  await ctx.close()
})
await attempt('41', 'Soft blank', async () => {
  ;({ ctx, page } = await freshPage())
  await page.getByRole('button', { name: 'Tomt pass' }).click()
  const samling = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Samling$/ }) })
  const titles = await samling.locator('.item-title').allTextContents()
  check('41b', 'Soft Samling on blank Tomt pass', titles.length === 2, titles.join(' | '))
  await shot(page, 'regress_soft_blank')
  await ctx.close()
})
await attempt('41', 'Mall', async () => {
  ;({ ctx, page } = await freshPage())
  await page.getByRole('button', { name: 'Från mall' }).click()
  await page.locator('.template-card').first().click()
  await page.getByRole('button', { name: 'Använd mall' }).last().click()
  const draftItems = await page.locator('.session-item').count()
  check('41c', 'Starta från mall → pass with items', draftItems > 3, `items=${draftItems}`)
  await shot(page, 'regress_mall')
  await ctx.close()
})

await attempt('13', 'Desktop import sheet', async () => {
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const dp = await dctx.newPage()
  dp.setDefaultTimeout(8000)
  await dp.goto(BASE)
  await dp.getByRole('button', { name: 'Tomt pass' }).click()
  await dp.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = dp.locator('.own-import')
  await sheet.locator('textarea').fill(exampleText)
  await sheet.getByRole('button', { name: 'Läs in' }).click()
  await sheet.locator('.own-import-row').first().waitFor()
  check('13c', 'Desktop: Importera övningar in the side library, preview renders', (await sheet.locator('.own-import-row').count()) === 2)
  await shot(dp, 'desktop_import_preview')
  await dctx.close()
})

await browser.close()
writeFileSync(`${ROOT}/verifier/slice-30-smoke-results.json`, JSON.stringify({ results, log }, null, 2))
const pass = results.filter((r) => r.ok).length
const fail = results.filter((r) => !r.ok).length
console.log(`\nTOTAL PASS ${pass} FAIL ${fail}`)

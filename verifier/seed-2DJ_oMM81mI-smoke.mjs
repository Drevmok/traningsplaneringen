// Seed promotion 2DJ_oMM81mI — headless smoke at 390×844 against the local preview.
// Run: node verifier/seed-2DJ_oMM81mI-smoke.mjs  (preview on 127.0.0.1:4173)
// playwright-core: /usr/local/lib/node_modules was gone on 2026-10-02; PW_CORE overrides.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/traningsplaneringen/'
const ROOT = '/workspace/gymnastics-planner'
const exampleText = readFileSync(`${ROOT}/slice-30/content/example-import.json`, 'utf8')
const SEEDS = [
  { n: 1, title: 'Grenhopp från trampett', t: '0:16', url: 'https://youtu.be/2DJ_oMM81mI?t=16' },
  { n: 2, title: 'Formhopp över block från trampett', t: '0:30', url: 'https://youtu.be/2DJ_oMM81mI?t=30', sketch: 'cushion cushion cushion cushion trampett block landing' },
  { n: 3, title: 'Äggrullning nerför kil', t: '0:50', url: 'https://youtu.be/2DJ_oMM81mI?t=50', sketch: 'cushion wedge' },
  { n: 5, title: 'L-häng i räcke', t: '1:39', url: 'https://youtu.be/2DJ_oMM81mI?t=99', sketch: 'bar landing' },
  { n: 6, title: 'Stöd på räcke med pendel', t: '1:55', url: 'https://youtu.be/2DJ_oMM81mI?t=115', sketch: 'bar landing' },
  { n: 7, title: 'Åsnesparkar', t: '2:26', url: 'https://youtu.be/2DJ_oMM81mI?t=146' },
  { n: 8, title: 'Minihjul (krabbhjul)', t: '2:45', url: 'https://youtu.be/2DJ_oMM81mI?t=165' },
  { n: 9, title: 'Soldatsparkar på bom', t: '3:04', url: 'https://youtu.be/2DJ_oMM81mI?t=184', sketch: 'beam landing' },
  { n: 10, title: 'Krabbgång längs bom', t: '3:25', url: 'https://youtu.be/2DJ_oMM81mI?t=205', sketch: 'beam' },
  { n: 11, title: 'Ljushopp i rockringar', t: '3:47', url: 'https://youtu.be/2DJ_oMM81mI?t=227', sketch: 'hoop hoop hoop hoop' },
  { n: 12, title: 'Landningar upp på och ner från plint', t: '4:05', url: 'https://youtu.be/2DJ_oMM81mI?t=245', sketch: 'plint' },
]
const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + detail : ''}`)
}
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/seed2dj_${n}.png` })
async function attempt(id, name, fn) {
  try { await fn() } catch (e) { check(id, name, false, 'error: ' + String(e.message).split('\n')[0]) }
}

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const errors = []
async function freshPage() {
  const ctx = await browser.newContext(phone)
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(BASE)
  return { ctx, page }
}
const libraryCard = (page, t) =>
  page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: new RegExp(`^${t.replace(/[()]/g, '\\$&')}$`) }) })

// Classify each sketch mark by its colours (equipmentMark.tsx).
const sketchKinds = (d) =>
  d.locator('svg.station-sketch').evaluate((svg) =>
    // Marks are <g> groups, except the hoop which is a bare <ellipse>.
    [...svg.children].filter((el) => ['g', 'ellipse'].includes(el.tagName.toLowerCase())).map((g) => {
      const html = g.outerHTML
      const tri = [...g.querySelectorAll('polygon')].some(
        (p) => p.getAttribute('fill') === '#5348e6' && p.getAttribute('points').trim().split(/\s+/).length === 3)
      if (html.includes('#4a42dc')) return 'trampett'
      if (html.includes('#e2674f')) return 'block'
      if (html.includes('#4c44e0')) return 'landing'
      if (html.includes('#8a8f99')) return 'bar'
      if (html.includes('#c9a77a')) return 'beam'
      if (html.includes('#d9534f')) return 'hoop'
      if (html.includes('#2f6f86')) return 'plint'
      if (tri) return 'wedge'
      if (html.includes('#5348e6')) return 'cushion'
      return '?'
    }).join(' '))

let { ctx, page } = await freshPage()
await page.getByRole('button', { name: 'Tomt pass' }).click()
await attempt('F', 'Footer', async () => {
  const f = (await page.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('F', 'Footer still Träningsplaneraren · Slice 30', f.includes('Träningsplaneraren · Slice 30'))
})

await attempt('L', 'Library', async () => {
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  await teknik.getByRole('button', { name: 'Lägg till övning', exact: true }).first().click()
  await page.locator('.side-panel-slot.is-open').waitFor()
  await page.locator('.filter-row select').selectOption('techniques')
  const titles = await page.locator('.library-entry .activity-title').allTextContents()
  const missing = SEEDS.filter((s) => !titles.includes(s.title)).map((s) => s.title)
  check('L1', 'All 11 promoted seeds listed in Bibliotek (Teknik)', missing.length === 0, missing.length ? `missing: ${missing}` : `${titles.length} Teknik drills`)
  check('L2', 'Spindelmannen (#4) not listed', !titles.some((t) => /Spindelmannen/i.test(t)))
  await page.locator('.search-input').fill('Spindel')
  check('L3', 'Search "Spindel" finds nothing', (await page.locator('.library-entry').count()) === 0)
  await page.locator('.search-input').fill('')
  const own = await page.locator('.library-entry .own-badge').count()
  check('L4', 'New seeds are not marked Egen (fresh device, no own drills)', own === 0, `own badges=${own}`)
  await libraryCard(page, 'Grenhopp från trampett').first().scrollIntoViewIfNeeded()
  await shot(page, 'library')
})

for (const s of SEEDS) {
  await attempt(`D${s.n}`, s.title, async () => {
    const card = libraryCard(page, s.title)
    check(`D${s.n}a`, `#${s.n} ${s.title}: exactly one card, no Behöver granskas badge`,
      (await card.count()) === 1 && (await card.locator('.review-badge').count()) === 0)
    await card.first().scrollIntoViewIfNeeded()
    await card.first().locator('.activity-card').click()
    const d = page.locator('.activity-detail')
    await d.waitFor()
    const link = d.locator('.source-line a')
    const text = (await link.textContent()).replace(/\s+/g, ' ').trim()
    const href = await link.getAttribute('href')
    const ok = text === `Källa: Prime Coaching Sport · ${s.t} ↗` && href === s.url &&
      (await link.getAttribute('target')) === '_blank' && (await link.getAttribute('rel')) === 'noopener noreferrer'
    check(`D${s.n}b`, `#${s.n} Källa line`, ok, `"${text}" ${href}`)
    check(`D${s.n}c`, `#${s.n} no badge / hint / Markera som granskad in detail; no video embed`,
      (await d.locator('.review-badge, .review-hint').count()) === 0 &&
        (await d.getByText(/som granskad/).count()) === 0 &&
        (await page.locator('iframe, video').count()) === 0)
    const meta = (await d.locator('.detail-meta').textContent()).replace(/\s+/g, ' ').trim()
    check(`D${s.n}d`, `#${s.n} Teknik · 6 min`, meta === 'Teknik · 6 min', meta)
    if (s.sketch) {
      const kinds = await sketchKinds(d)
      check(`D${s.n}e`, `#${s.n} sketch draws ${s.sketch}`, kinds === s.sketch, kinds)
      await d.locator('svg.station-sketch').scrollIntoViewIfNeeded()
    }
    if ([2, 3, 5, 9, 11, 12].includes(s.n) || s.n === 1) {
      await d.locator('.source-line').scrollIntoViewIfNeeded()
      await shot(page, `detail_${String(s.n).padStart(2, '0')}`)
    }
    await d.locator('.modal-close').click()
    await d.waitFor({ state: 'detached' })
  })
}

await attempt('B', 'Links', async () => {
  await libraryCard(page, 'Grenhopp från trampett').first().locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  const lines = (await d.locator('.detail-link-line').allTextContents()).map((t) => t.trim())
  check('B1', 'Grenhopp links: Bygger på Landningar… / Lättare variant av Formhopp…',
    lines.includes('Bygger på: Landningar upp på och ner från plint') && lines.includes('Lättare variant av: Formhopp över block från trampett'), lines.join(' | '))
  await d.locator('.modal-close').click()
  await libraryCard(page, 'Minihjul (krabbhjul)').first().locator('.activity-card').click()
  await d.waitFor()
  const l2 = (await d.locator('.detail-link-line').allTextContents()).map((t) => t.trim())
  check('B2', 'Minihjul: Lättare variant av: Hjul', l2.includes('Lättare variant av: Hjul'), l2.join(' | '))
  await d.locator('.modal-close').click()
})

await attempt('P', 'Add to pass + tip panel', async () => {
  await libraryCard(page, 'Ljushopp i rockringar').first().locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.getByRole('button', { name: 'Lägg till i valt block' }).click()
  const close = page.locator('.sheet-close')
  if (await close.isVisible()) await close.click()
  const row = page.locator('.session-item').filter({ hasText: 'Ljushopp i rockringar' })
  check('P1', 'Seed can be added to Teknik (no badge on pass row)', (await row.count()) === 1 && (await page.locator('.session-item .review-badge').count()) === 0)
  await row.getByRole('button', { name: 'Se beskrivning' }).click()
  const t = (await row.locator('.activity-tip-panel .source-line').textContent()).replace(/\s+/g, ' ').trim()
  const tip = await row.locator('.activity-tip-panel').innerText()
  check('P2', 'Pass-row info panel: Källa line + seed safety line', t === 'Källa: Prime Coaching Sport · 3:47 ↗' && tip.includes('Ringarna ligger platt på golvet.'), t)
  await row.scrollIntoViewIfNeeded()
  await shot(page, 'pass_row_tip')
})

await attempt('I', 'Dubblett vs seed', async () => {
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  await teknik.locator('.btn-add-inline').click()
  await page.locator('.side-panel-slot.is-open').waitFor()
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  await sheet.locator('textarea').fill(exampleText)
  await sheet.getByRole('button', { name: 'Läs in' }).click()
  await sheet.locator('.own-import-row').first().waitFor()
  const states = await sheet.locator('.own-import-state').allTextContents()
  check('I1', 'Importing the old trial file now shows Samma namn finns redan (seed exists)', states.join('|') === 'Samma namn finns redan|Samma namn finns redan', states.join('|'))
  await shot(page, 'import_samename')
  await sheet.getByRole('button', { name: 'Avbryt' }).click()
})
await ctx.close()

await attempt('W', 'Planera pass', async () => {
  ;({ ctx, page } = await freshPage())
  await page.getByRole('button', { name: 'Planera pass' }).click()
  const w = page.locator('[aria-labelledby="home-wizard-title"]')
  await w.getByRole('option', { name: /7–9/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /^Trampett/ }).first().click()
  await w.getByRole('button', { name: 'Nästa' }).click()
  await w.getByRole('option', { name: /Standard trupp/ }).first().click()
  await w.getByRole('button', { name: 'Skapa pass' }).click()
  const draft = JSON.parse(await page.evaluate(() => localStorage.getItem('gymnastics-planner-draft-v1')))
  const filled = draft.blocks.filter((b) => b.items.length > 0).length
  const zones = (draft.hallPlacements ?? []).map((p) => p.zoneId)
  check('W1', 'Planera pass wizard → five blocks filled, Teknik pre-placed', filled === 5 && zones.length > 0, `filled=${filled} zones=${zones}`)
  await shot(page, 'wizard')
  await ctx.close()
})

check('E', 'No page errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/seed-2DJ_oMM81mI-results.json`, JSON.stringify(results, null, 2))
await browser.close()

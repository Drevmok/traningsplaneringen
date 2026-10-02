// Slice 30 — B1 fix smoke: Golvklart chip detail hides Källa + Behöver granskas;
// Hallöversikt edit mode and Bibliotek keep them. Run with preview on 127.0.0.1:4173.
import { chromium } from '/usr/local/lib/node_modules/playwright-core/index.mjs'
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173/traningsplaneringen/'
const ROOT = '/workspace/gymnastics-planner'
const exampleText = readFileSync(`${ROOT}/slice-30/content/example-import.json`, 'utf8')
const TITLE = 'Formhopp över block från trampett'
const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + detail : ''}`)
}
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/slice30_fix_${n}.png` })

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const page = await ctx.newPage()
page.setDefaultTimeout(8000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(BASE)

async function builderAction(name) {
  const direct = page.locator('.builder-actions > button, .builder-extra > button').filter({ hasText: name })
  for (const b of await direct.all()) if (await b.isVisible()) return b.click()
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name }).click()
}
const libraryCard = (t) =>
  page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: t }) }).first()

try {
  // Setup: blank pass, import the example (own drills with source + needsCoachReview)
  await page.getByRole('button', { name: 'Tomt pass' }).click()
  const footer = (await page.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('F1', 'Footer still Träningsplaneraren · Slice 30', footer.includes('Träningsplaneraren · Slice 30'), footer)
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  await teknik.getByRole('button', { name: 'Lägg till övning', exact: true }).first().click()
  await page.locator('.side-panel-slot.is-open').waitFor()
  await page.getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click()
  const sheet = page.locator('.own-import')
  await sheet.locator('textarea').fill(exampleText)
  await sheet.getByRole('button', { name: 'Läs in' }).click()
  await sheet.getByRole('button', { name: 'Importera 2 övningar' }).click()
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('gymnastics-planner-own-activities-v1')))
  const fh = stored.find((a) => a.title === TITLE)
  check('S0', 'Own drill has source + needsCoachReview, Teknik', fh?.source?.creator === 'Prime Coaching Sport' && fh?.needsCoachReview === true && fh?.blockType === 'techniques')

  // Bibliotek detail unchanged
  await page.locator('.filter-row select').selectOption('techniques')
  await libraryCard(TITLE).locator('.activity-card').click()
  let d = page.locator('.activity-detail')
  await d.waitFor()
  check('L1', 'Bibliotek detail: Källa line + badge still shown',
    (await d.locator('.source-line').count()) === 1 && (await d.locator('h2 .review-badge').count()) === 1)
  await shot(page, 'bibliotek_detail')
  await d.getByRole('button', { name: 'Lägg till i valt block' }).click()
  const close = page.locator('.sheet-close')
  if (await close.isVisible()) await close.click()

  // Hallöversikt edit mode: detail keeps both
  await builderAction('Hallöversikt')
  await page.getByText('Schematisk hall — inte exakt mått').first().waitFor()
  const chip = page.locator('.hall-chip-anchor').filter({ hasText: /Formhopp/ }).first()
  await chip.locator('button, [role=button]').first().click().catch(() => chip.click())
  d = page.locator('.activity-detail')
  await d.waitFor()
  const editSrc = (await d.locator('.source-line').count()) === 1 ? (await d.locator('.source-line').innerText()).replace(/\s+/g, ' ').trim() : ''
  check('E1', 'Hallöversikt edit detail shows Källa line', editSrc === 'Källa: Prime Coaching Sport · 0:30 ↗', editSrc)
  check('E2', 'Hallöversikt edit detail shows Behöver granskas badge', (await d.locator('h2 .review-badge').count()) === 1)
  await shot(page, 'hall_edit_detail')
  await d.locator('.modal-close').click()
  await d.waitFor({ state: 'detached' })

  // Golvklart: detail hides both
  await page.getByRole('button', { name: /^(Golvklart|Visa för golvet)$/ }).first().click()
  await page.getByRole('button', { name: 'Avsluta golvklart' }).first().waitFor()
  await shot(page, 'golvklart')
  const fchip = page.locator('.hall-chip-anchor').filter({ hasText: /Formhopp/ }).first()
  await fchip.locator('button, [role=button]').first().click().catch(() => fchip.click())
  d = page.locator('.activity-detail')
  await d.waitFor()
  const txt = await d.innerText()
  check('G0', 'Golvklart chip opens the Formhopp detail', txt.includes(TITLE))
  check('G1', 'Golvklart detail: NO Källa line', (await d.locator('.source-line').count()) === 0 && !/Källa:/.test(txt))
  check('G2', 'Golvklart detail: NO Behöver granskas badge / hint / button',
    (await d.locator('.review-badge, .review-hint').count()) === 0 && !/Behöver granskas|som granskad/.test(txt))
  check('G3', 'Golvklart detail still shows Redskap + sketch', (await d.locator('.station-equipment-section').count()) === 1)
  await shot(page, 'golvklart_detail')
  await d.locator('.modal-close').click()

  // Back to edit: still shown
  await page.getByRole('button', { name: 'Avsluta golvklart' }).first().click()
  const echip = page.locator('.hall-chip-anchor').filter({ hasText: /Formhopp/ }).first()
  await echip.locator('button, [role=button]').first().click().catch(() => echip.click())
  d = page.locator('.activity-detail')
  await d.waitFor()
  check('E3', 'After Avsluta golvklart, edit detail shows Källa + badge again',
    (await d.locator('.source-line').count()) === 1 && (await d.locator('h2 .review-badge').count()) === 1)
  await shot(page, 'hall_edit_detail_after')
} catch (e) {
  check('X', 'smoke error', false, String(e.message).split('\n')[0])
}
check('P', 'No page errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-30-fix-b1-results.json`, JSON.stringify(results, null, 2))
await browser.close()

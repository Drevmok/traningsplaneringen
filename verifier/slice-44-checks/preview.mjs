// Slice 44 verify — REAL desktop Chrome print preview (headed google-chrome on a private Xvfb :44, 1300×860 window).
// Each run: Från mall → Nybörjare → (optional hall layout) → surface → «Skriv ut passet» → Chrome's print preview → tick
// «Background graphics» → Save (as PDF) through the real print dialog → pdfinfo / pdftotext. Screens grabbed with ffmpeg x11grab.
const { chromium } = await import('/workspace/s44v/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync, rmSync } from 'node:fs'
const BR = 'http://127.0.0.1:57741/traningsplaneringen/', MAIN = 'http://127.0.0.1:57742/traningsplaneringen/'
const ROOT = new URL('../..', import.meta.url).pathname.replace(/\/$/, '')
const OUT = `${ROOT}/verifier/slice-44-screenshots`, PDF = `${ROOT}/verifier/slice-44-checks/preview`
execFileSync('mkdir', ['-p', PDF])
const env = { ...process.env, DISPLAY: ':44' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const grab = (n) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-video_size', '1400x900', '-i', ':44', '-frames:v', '1', `${OUT}/${n}.png`])
const xd = (...a) => execFileSync('xdotool', a, { env })
const runs = (process.env.RUNS ?? 'br-dela,main-dela,br-golvklart,br-delat,br-bla,main-bla,br-vit,main-vit,br-twice').split(',')
const res = {}
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: false, args: ['--no-sandbox', '--window-size=1300,860', '--window-position=0,0', '--lang=sv-SE', '--disable-features=Translate,TranslateUI'], env })
async function toHall(p) {
  const b1 = p.locator('.builder-actions .builder-hall'); if (await b1.count() && await b1.isVisible()) await b1.click()
  else await p.getByRole('button', { name: 'Hallöversikt' }).first().click()
  await p.locator('.hall-canvas').first().waitFor()
}
async function setup(base, hall) {
  const ctx = await b.newContext({ viewport: null, locale: 'sv-SE', permissions: ['clipboard-read', 'clipboard-write'] })
  const p = await ctx.newPage()
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600)
  if (hall) {
    await toHall(p); await p.locator('#hall-layout-select').selectOption(hall); await p.waitForTimeout(400)
    const all = p.locator('.hall-header-actions button', { hasText: 'Använd alla förslag' }); if (await all.count() && await all.isEnabled()) { await all.click(); await p.waitForTimeout(800) }
    await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  }
  return { ctx, p }
}
async function openDela(p) {
  const more = p.getByRole('button', { name: 'Fler saker med passet' })
  if (await more.isVisible()) { await more.click(); await p.locator('.more-menu-panel').getByRole('button', { name: /^(Dela|Exportera \/ dela)$/ }).click() }
  else await p.getByRole('button', { name: /^(Dela|Exportera \/ dela)$/ }).first().click()
  await p.locator('.export-sheet').waitFor()
}
async function previewSave(tag) {
  await sleep(4500); grab(`s44v_preview_${tag}`)
  xd('mousemove', '941', '428', 'click', '1'); await sleep(2500); grab(`s44v_preview_${tag}_bg`)
  xd('mousemove', '1091', '700', 'click', '1'); await sleep(2000)
  const path = `${PDF}/preview-${tag}.pdf`; rmSync(path, { force: true })
  xd('key', 'ctrl+a'); xd('type', path); await sleep(400); xd('mousemove', '1050', '656', 'click', '1')
  for (let i = 0; i < 30 && !existsSync(path); i++) await sleep(500)
  await sleep(1000)
  if (!existsSync(path)) return { error: 'no pdf' }
  const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' })
  const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' })
  execFileSync('pdftoppm', ['-png', '-r', '60', path, `${OUT}/s44v_preview_${tag}_pdf`])
  return { pages: Number(/Pages:\s+(\d+)/.exec(info)[1]), size: /Page size:\s+(.*)/.exec(info)[1], footers: text.split('\f').map((t) => (t.trim().split('\n').filter(Boolean).pop()?.trim() ?? '').replace(/^\S+\s+/, '')), hasApp: /Fler saker med passet|Kopiera länk|Passbyggaren/.test(text), hasStations: /Se upp för\./.test(text), mapWithHeading: text.split('\f').some((t) => /Hallöversikt/.test(t) && t.trim().split('\n').filter(Boolean).length > 3 || false) }
}
for (const run of runs) {
  const [who, what] = run.split('-'); const base = who === 'br' ? BR : MAIN
  try {
    const hall = what === 'bla' ? 'forening-bla' : what === 'vit' ? 'forening-vit' : null
    const { ctx, p } = await setup(base, hall)
    if (what === 'golvklart') { await toHall(p); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500); await p.locator('.hall-floor-actions').getByRole('button', { name: 'Skriv ut passet' }).click({ noWaitAfter: true }) }
    else if (what === 'delat') { await openDela(p); await p.locator('.export-sheet').getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(300); const link = await p.evaluate(() => navigator.clipboard.readText()); await p.goto('about:blank'); await p.goto(link); await p.locator('.share-actions').waitFor(); await p.getByRole('button', { name: 'Skriv ut passet' }).click({ noWaitAfter: true }) }
    else if (what === 'twice') {
      await openDela(p); await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click({ noWaitAfter: true })
      await sleep(4500); grab('s44v_preview_twice_1'); xd('mousemove', '1013', '700', 'click', '1'); await sleep(1500)
      const after1 = await p.evaluate(() => ({ cls: document.body.className, sheet: !!document.querySelector('.export-sheet'), hosts: document.querySelectorAll('.print-host').length }))
      await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click({ noWaitAfter: true })
      await sleep(4500); grab('s44v_preview_twice_2'); xd('mousemove', '1013', '700', 'click', '1'); await sleep(1500)
      const after2 = await p.evaluate(() => ({ cls: document.body.className, sheet: !!document.querySelector('.export-sheet'), status: document.querySelector('.export-sheet [role=status]')?.textContent ?? null }))
      await p.locator('.export-sheet .modal-close').click(); await p.waitForTimeout(300)
      await p.getByRole('textbox', { name: 'Passets titel' }).fill('Efter avbruten utskrift'); await p.waitForTimeout(300)
      const usable = await p.evaluate(() => ({ cls: document.body.className, title: document.querySelector('[aria-label="Passets titel"]')?.value, scroll: (window.scrollTo(0, 500), window.scrollY) }))
      grab('s44v_preview_twice_after'); res[run] = { after1, after2, usable }; console.log(run, JSON.stringify(res[run])); await ctx.close(); continue
    }
    else { await openDela(p); await p.locator('.export-sheet').getByRole('button', { name: 'Skriv ut passet' }).click({ noWaitAfter: true }) }
    res[run] = await previewSave(run)
    console.log(run, JSON.stringify(res[run]))
    await ctx.close().catch(() => {})
  } catch (e) { res[run] = { error: String(e.message).split('\n')[0] }; console.log(run, 'ERR', res[run].error) }
}
writeFileSync(`${PDF}/preview.json`, JSON.stringify(res, null, 2))
await b.close().catch(() => {})

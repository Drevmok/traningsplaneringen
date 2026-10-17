// Slice 44 — Builder self-smoke: Dela = Kopiera länk + Skriv ut passet; print stays armed (WebKit timing); card fields in the pass print.
// Branch on :4444, main on :4410 (old-link check). 390×844, DPR 2. Print checked with emulateMedia('print') + page.pdf (A4).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = process.env.S44_BR ?? 'http://127.0.0.1:4444/traningsplaneringen/'
const MAIN = process.env.S44_MAIN ?? 'http://127.0.0.1:4410/traningsplaneringen/'
const ROOT = process.env.S44_ROOT ?? '/workspace/gp-s44'
const PDF = `${ROOT}/verifier/slice-44-print`
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 500) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 260) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
// mode: 'webkit' = afterprint right after print() returns, with beforeprint; 'chromium' = before/after synchronously; 'dead' = nothing fires (iOS 27 PWA)
async function page(mode = 'webkit', vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, permissions: ['clipboard-read', 'clipboard-write'] })
  await ctx.addInitScript((m) => {
    window.__prints = []
    window.print = () => {
      const snap = () => ({ cls: document.body.className, hosts: document.querySelectorAll('.print-host').length })
      if (m === 'dead') { window.__prints.push({ dead: true }); return }
      window.dispatchEvent(new Event('beforeprint'))
      if (m === 'chromium') { window.__prints.push(snap()); window.dispatchEvent(new Event('afterprint')); return }
      window.__prints.push(snap())
      setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0)
    }
  }, mode)
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const shot = (p, n) => p.screenshot({ path: `/workspace/screenshots/slice44_${n}.png` })
async function mall(p, base = BR) {
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600)
}
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
const sheet = (p) => p.locator('.export-sheet')
async function pdfCheck(p, tag) {
  await p.emulateMedia({ media: 'print' })
  await p.screenshot({ path: `/workspace/screenshots/slice44_${tag}_print_media.png`, fullPage: true })
  const path = `${PDF}/slice44_${tag}.pdf`
  await p.pdf({ path, format: 'A4', preferCSSPageSize: true, printBackground: true })
  await p.emulateMedia({ media: 'screen' })
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [path], { encoding: 'utf8' }))[1])
  const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' })
  const perPage = text.split('\f')
  execFileSync('pdftoppm', ['-png', '-r', '50', path, `/workspace/screenshots/slice44_${tag}_pdf`])
  return { pages, text, perPage }
}
let link = null
const measure = {}

await attempt('Dela', async () => {
  const p = await page('webkit'); await mall(p)
  await p.getByRole('button', { name: 'Fler saker med passet' }).click()
  const items = await p.locator('.more-menu-panel button').allInnerTexts()
  check('AC1-menu', 'Mer shows «Dela», not «Exportera / dela»', items.includes('Dela') && !items.some((t) => t.includes('Exportera')), items.join('|'))
  await p.locator('.more-menu-panel').getByRole('button', { name: 'Dela', exact: true }).click(); await sheet(p).waitFor()
  check('AC1-title', 'sheet titled «Dela»', (await sheet(p).locator('h2').innerText()) === 'Dela')
  const btns = (await sheet(p).locator('button:visible').allInnerTexts()).map((t) => t.trim())
  check('AC2', 'exactly Kopiera länk + Skriv ut passet (+ ×); no file input, textarea, QR', JSON.stringify(btns) === JSON.stringify(['×', 'Kopiera länk', 'Skriv ut passet']) && (await sheet(p).locator('input, textarea, svg, label').count()) === 0, btns.join('|'))
  const g = await sheet(p).evaluate((el) => ({ sw: document.documentElement.scrollWidth, small: [...el.querySelectorAll('.export-block button')].filter((b) => { const r = b.getBoundingClientRect(); return r.height < 44 || r.width < 44 }).length, hints: [...el.querySelectorAll('.export-block p')].map((x) => x.textContent) }))
  check('AC3', 'buttons ≥ 44×44, no horizontal scroll, hints as microcopy', g.small === 0 && g.sw <= 390 && g.hints[0].startsWith('Skicka länken till en annan tränare.') && g.hints[1].startsWith('Hela passet på papper:'), JSON.stringify(g))
  await shot(p, '01_dela_sheet')
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(300)
  link = await p.evaluate(() => navigator.clipboard.readText())
  const lab = await sheet(p).locator('.btn-primary').innerText()
  await shot(p, '02_copied')
  await p.waitForTimeout(3200); const lab2 = await sheet(p).locator('.btn-primary').innerText()
  check('AC4', 'clipboard holds …/traningsplaneringen/#dela=…; «Länken är kopierad.» then back after ~3 s', /\/traningsplaneringen\/#dela=/.test(link) && lab === 'Länken är kopierad.' && lab2 === 'Kopiera länk', `${link.slice(0, 60)}… ${lab} → ${lab2}`)
  // print with WebKit-like timing
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const pr = await p.evaluate(() => ({ prints: window.__prints, now: { cls: document.body.className, hosts: document.querySelectorAll('.print-host').length } }))
  check('A1-webkit', 'WebKit timing: after afterprint the class and the print host are still there', pr.now.cls.includes('is-print-pass') && pr.now.hosts === 1, JSON.stringify(pr))
  const r = await pdfCheck(p, 'webkit_pass')
  check('AC14', 'print = the pass, not the app (title, minutes, 5 blocks), A4', r.text.includes('Nybörjare') && ['Samling', 'Uppvärmning', 'Teknik', 'Styrka', 'Lek'].filter((b) => r.text.includes(b)).length >= 4 && !r.text.includes('Fler saker med passet') && !r.text.includes('Kopiera länk'), `pages=${r.pages}`)
  const nums = ['1. ', '2. ', '3. '].every((n) => r.text.includes(n))
  check('AC15', 'Teknik rows «1.» «2.» «3.» with Se upp för / Säkerhet / Redskap', nums && r.text.includes('Se upp för.') && r.text.includes('Säkerhet.') && r.text.includes('Redskap.'), `pages=${r.pages}`)
  const lastLines = r.perPage.slice(0, -1).map((t) => t.trim().split('\n').filter(Boolean).pop()?.trim() ?? '')
  const mapPage = r.perPage.findIndex((t) => t.includes('Hallöversikt'))
  check('AC16', 'no page ends on a block heading; Hallöversikt heading on the page with the map', !lastLines.some((l) => /^(Samling|Uppvärmning|Teknik|Styrka|Lek|Hallöversikt) · \d+ min$|^Hallöversikt$/.test(l)) && mapPage >= 0, `pages=${r.pages} last=${JSON.stringify(lastLines)} mapPage=${mapPage}`)
  measure.webkitPages = r.pages
  // print twice
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  check('AC18', 'second tap prints again; no stall line', (await p.evaluate(() => window.__prints.length)) === 2 && (await sheet(p).locator('[role=status]').count()) === 0)
  await sheet(p).locator('.modal-close').click(); await p.waitForTimeout(300)
  check('AC8', 'close → back in Passbyggaren, no stray is-print-pass, page scrolls', !(await p.evaluate(() => document.body.className)).includes('is-print-pass') && (await p.locator('.builder').count()) === 1 && (await p.evaluate(() => { window.scrollTo(0, 400); return window.scrollY > 0 })))
  check('AC22-footer', 'footer «Träningsplaneraren · Slice 44»', (await p.locator('body').innerText()).includes('Träningsplaneraren · Slice 44'))
  await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300)
  const dlg = await p.locator('.modal-actions .btn-primary').count(); if (dlg) await p.locator('.modal-actions .btn-primary').last().click(); await p.waitForTimeout(300)
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem('gymnastics-planner-templates-v1') || '[]').length)
  check('AC13', 'Mer «Spara som egen mall» dialog still saves', dlg > 0 && n >= 1, `saved=${n}`)
  await p.context().close()
})
await attempt('Chromium-print', async () => {
  const p = await page('chromium'); await mall(p); await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const pr = await p.evaluate(() => window.__prints[0])
  const r = await pdfCheck(p, 'chromium_pass')
  check('A1-chromium', 'Chromium timing: print host present at print time; same pass PDF', pr.hosts === 1 && r.text.includes('Se upp för.'), `${JSON.stringify(pr)} pages=${r.pages}`)
  measure.chromiumPages = r.pages
  await p.context().close()
})
await attempt('Stalled', async () => {
  const p = await page('dead'); await mall(p); await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(500)
  const early = await sheet(p).locator('[role=status]').count()
  await p.waitForTimeout(1400)
  const line = await sheet(p).locator('[role=status]').innerText().catch(() => '')
  await shot(p, '03_print_stalled')
  check('AC20-sim', 'no beforeprint → printStalled line within ~2 s (not before 1.5 s)', early === 0 && line.startsWith('Utskriften kom inte igång.'), line)
  await p.context().close()
})
await attempt('CopyFail', async () => {
  const p = await page('webkit'); await mall(p)
  await p.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')), readText: () => Promise.resolve('') }, configurable: true }); document.execCommand = () => false })
  await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(300)
  const lab = await sheet(p).locator('.btn-primary').innerText()
  const msg = await sheet(p).locator('[role=status]').innerText().catch(() => '')
  const val = await sheet(p).locator('input[readonly]').inputValue().catch(() => '')
  await shot(p, '04_copy_failed')
  check('AC7', 'copy failure → exportCopyManual + read-only field with the link; label not «kopierad»', lab === 'Kopiera länk' && msg.startsWith('Det gick inte att kopiera.') && /#dela=/.test(val), `${lab} / ${msg.slice(0, 40)} / ${val.slice(0, 40)}`)
  await p.context().close()
})
await attempt('SharePass', async () => {
  const p = await page('webkit'); await p.goto(link); await p.waitForTimeout(800)
  const t = await p.locator('body').innerText()
  const btns = (await p.locator('.share-actions button:visible').allInnerTexts()).map((x) => x.trim())
  await shot(p, '05_delat_pass')
  check('AC5', 'link opens Delat pass with the same title and blocks', t.includes('Pass från en annan enhet.') && t.includes('Nybörjare') && t.includes('Teknik'))
  check('AC10', 'Delat pass actions: Kör passet · Spara och kör · Spara på den här enheten · Skriv ut passet · Till planeringen', JSON.stringify(btns) === JSON.stringify(['Kör passet', 'Spara och kör', 'Spara på den här enheten', 'Skriv ut passet', 'Till planeringen']), btns.join('|'))
  await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const r = await pdfCheck(p, 'delat_pass')
  check('AC17-share', 'print from Delat pass = same pages as from Dela', r.pages === measure.webkitPages && r.text.includes('Se upp för.'), `pages=${r.pages} vs ${measure.webkitPages}`)
  await p.getByRole('button', { name: 'Spara på den här enheten' }).click(); await p.waitForTimeout(300)
  const c = p.locator('.modal-backdrop[role=dialog] .btn-primary'); if (await c.count()) await c.last().click(); await p.waitForTimeout(500)
  const d = await p.evaluate(() => JSON.parse(localStorage.getItem('gymnastics-planner-draft-v1') || 'null'))
  check('AC5-save', '«Spara på den här enheten» saves it', d && d.title.includes('Nybörjare'), d?.title)
  await p.context().close()
})
await attempt('Golvklart', async () => {
  const p = await page('webkit'); await mall(p)
  const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt')
  await p.locator('.hall-canvas').first().waitFor(); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500)
  const btns = (await p.locator('.hall-floor-actions button').allInnerTexts()).map((x) => x.trim())
  await shot(p, '06_golvklart')
  check('AC9', 'Golvklart actions: Avsluta Golvklart · Förrådslista · Skriv ut passet', btns.length === 3 && btns[1] === 'Förrådslista' && btns[2] === 'Skriv ut passet' && /golvklart/i.test(btns[0]), btns.join('|'))
  await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const r = await pdfCheck(p, 'golvklart')
  check('AC17-golv', 'print from Golvklart = same pages', r.pages === measure.webkitPages && r.text.includes('Se upp för.'), `pages=${r.pages}`)
  await p.locator('.hall-floor-actions').getByRole('button', { name: 'Förrådslista' }).click(); await p.waitForTimeout(400)
  check('AC9-forrad', 'Förrådslista still opens', (await p.locator('.forradslista-header, [aria-label*="Förråd"]').count()) > 0)
  await p.context().close()
})
await attempt('AC6', async () => {
  const p = await page('webkit'); await mall(p, MAIN)
  await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(300)
  const old = await p.evaluate(() => navigator.clipboard.readText())
  const p2 = await page('webkit'); await p2.goto(old.replace('4410', '4444')); await p2.waitForTimeout(800)
  check('AC6', 'link made on main 0d88da5 opens on the branch (SharePass v1)', (await p2.locator('body').innerText()).includes('Pass från en annan enhet.'), old.slice(0, 70))
  // AC12: paste link on Home
  await p2.goto(BR); await p2.evaluate(() => localStorage.clear()); await p2.reload(); await p2.locator('.home').waitFor()
  await p2.getByRole('button', { name: 'Hämta ett pass' }).click(); await p2.locator('.home-receive textarea').fill(old.replace('4410', '4444'))
  await p2.locator('.home-receive .btn-primary').click(); await p2.waitForTimeout(800)
  const t12 = await p2.getByRole('textbox', { name: 'Passets titel' }).inputValue().catch(() => '')
  check('AC12-paste', 'Home «Hämta ett pass» pasted link still opens the pass (in Passbyggaren)', t12.includes('Nybörjare'), t12)
  await p.context().close(); await p2.context().close()
})
// ── Verifier F1: print numbers = hall numbers (placed Teknik only) ──
await attempt('F1', async () => {
  const p = await page('webkit'); await mall(p)
  const d = await p.evaluate(() => JSON.parse(localStorage.getItem('gymnastics-planner-draft-v1')))
  const tek = d.blocks.find((b) => b.type === 'techniques').items.sort((a, b) => a.order - b.order)
  d.hallPlacements = (d.hallPlacements || []).filter((pl) => pl.sessionItemId !== tek[1].id)
  await p.evaluate((v) => localStorage.setItem('gymnastics-planner-draft-v1', JSON.stringify(v)), d)
  await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor()
  const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt')
  await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400)
  const hallRanks = await p.locator('.hall-canvas .hall-chip--canvas .hall-chip-rank').allInnerTexts()
  await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor()
  await menu(p, 'Dela'); await sheet(p).waitFor(); await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const rows = await p.locator('.print-host li.pass-station > span:first-child').allInnerTexts()
  const r = await pdfCheck(p, 'f1_numbering')
  const titles = rows.map((x) => x.replace(/^\d+\.\s*/, ''))
  check('F1-dom', 'print rows: placed Teknik numbered 1, 2 in hall order; the unplaced one has no number', /^1\. /.test(rows[0]) && !/^\d+\. /.test(rows[1]) && /^2\. /.test(rows[2]), rows.join(' | '))
  check('F1-hall', 'same numbers the hall shows (2 markers: 1, 2)', JSON.stringify(hallRanks.map((x) => x.trim()).sort()) === JSON.stringify(['1', '2']), hallRanks.join(','))
  const flat = r.text.replace(/\s+/g, ' ')
  check('F1-pdf', 'PDF text: «1. <first>», «<second>» without number, «2. <third>»', flat.includes(`1. ${titles[0]}`) && flat.includes(`2. ${titles[2]}`) && !flat.includes(`. ${titles[1]}`), `${titles.join(' / ')}`)
  await p.context().close()
})
// ── Verifier F2: a later browser print in Golvklart / Hallöversikt shows the hall, not the pass ──
await attempt('F2', async () => {
  const p = await page('webkit'); await mall(p)
  const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt')
  await p.locator('.hall-canvas').first().waitFor(); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(400)
  await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const armed = await p.evaluate(() => ({ cls: document.body.className, hosts: document.querySelectorAll('.print-host').length }))
  // Ctrl/Cmd+P: the key press reaches the page first (headless opens no dialog); then print media is rendered
  await p.keyboard.press('Control+p'); await p.waitForTimeout(200)
  const after = await p.evaluate(() => ({ cls: document.body.className, hosts: document.querySelectorAll('.print-host').length }))
  const r = await pdfCheck(p, 'f2_golvklart_cmdp')
  await p.emulateMedia({ media: 'print' })
  const hallVisible = await p.evaluate(() => { const c = document.querySelector('.hall-canvas'); return !!c && c.getBoundingClientRect().height > 0 })
  await p.screenshot({ path: '/workspace/screenshots/slice44_f2_golvklart_cmdp.png', fullPage: true }); await p.emulateMedia({ media: 'screen' })
  check('F2-golvklart', 'after pass print, Ctrl/Cmd+P in Golvklart prints the hall: class gone, no print host, hall visible, no pass text', armed.cls.includes('is-print-pass') && !after.cls.includes('is-print-pass') && after.hosts === 0 && hallVisible && !r.text.includes('Se upp för.'), `${JSON.stringify(armed)} → ${JSON.stringify(after)} pages=${r.pages}`)
  // print the pass again from Golvklart still works after the cleanup
  await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600)
  const r2 = await pdfCheck(p, 'f2_golvklart_pass_again')
  check('F2-again', 'tapping Skriv ut passet again still prints the pass', r2.text.includes('Se upp för.'), `pages=${r2.pages}`)
  // Hallöversikt (edit): leave Golvklart, Ctrl/Cmd+P → hall
  await p.getByRole('button', { name: /Avsluta golvklart/i }).click(); await p.waitForTimeout(400)
  await p.keyboard.press('Control+p'); await p.waitForTimeout(200)
  const r3 = await pdfCheck(p, 'f2_hallöversikt_cmdp')
  const cls3 = await p.evaluate(() => document.body.className)
  check('F2-hall', 'then Ctrl/Cmd+P in Hallöversikt prints the hall (no pass)', !cls3.includes('is-print-pass') && !r3.text.includes('Se upp för.'), `cls=${cls3} pages=${r3.pages}`)
  await p.context().close()
})
check('no-errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-44-builder-smoke-results.json`, JSON.stringify({ when: new Date().toISOString(), results, measure }, null, 2))
console.log(JSON.stringify(measure)); console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()

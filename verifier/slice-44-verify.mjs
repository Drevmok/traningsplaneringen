// Slice 44 «Dela och utskrift» — Verifier formal run (branch 800651e on :57741, main 0d88da5 on :57742).
// 390×844 DPR 2 touch unless noted. Headless google-chrome via playwright-core. Real desktop Chrome print preview is in
// slice-44-checks/preview.mjs (headed, private Xvfb); this script covers the rest and the print layout via emulateMedia + page.pdf.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s44v/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = process.env.BR ?? 'http://127.0.0.1:57741/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57742/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-44-screenshots/s44v_`, CK = `${ROOT}/verifier/slice-44-checks`
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const OLD = JSON.parse(readFileSync(`${CK}/old-tokens.json`, 'utf8'))
const PART = JSON.parse(readFileSync(`${CK}/partial-token.json`, 'utf8'))
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const results = [], notes = {}, errors = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 900) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
const note = (k, v) => { notes[k] = v }
async function attempt(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const PHONE = { width: 390, height: 844 }
// print stub: 'webkit' = beforeprint, return, afterprint on next task; 'chromium' = synchronous; 'dead' = nothing fires
async function page(mode = 'webkit', { vp = PHONE, perms = ['clipboard-read', 'clipboard-write'], touch = true, init } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, permissions: perms, acceptDownloads: true })
  await ctx.addInitScript((m) => {
    window.__prints = []
    window.print = () => {
      const snap = () => ({ t: performance.now(), cls: document.body.className, hosts: document.querySelectorAll('.print-host').length })
      if (m === 'dead') { window.__prints.push({ dead: true, t: performance.now() }); return }
      window.dispatchEvent(new Event('beforeprint'))
      if (m === 'chromium') { window.__prints.push(snap()); window.dispatchEvent(new Event('afterprint')); return }
      setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0)
      window.__prints.push(snap())
    }
  }, mode)
  if (init) await ctx.addInitScript(init)
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const shot = (p, n, full = false) => p.screenshot({ path: `${SS}${n}.png`, fullPage: full })
const sheet = (p) => p.locator('.export-sheet')
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function mall(p, base = BR) {
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(1500)
}
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
async function backFromHall(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300) }
const card = (p, h) => p.locator('.block-card').filter({ has: p.locator('h3', { hasText: new RegExp(`^${h}$`) }) }).first()
async function addTeknikByTitle(p, title) {
  const c = card(p, 'Teknik'); const inline = c.locator('.btn-add-inline')
  if (await inline.count()) await inline.first().click(); else await c.getByRole('button', { name: 'Lägg till övning' }).first().click()
  await p.locator('input.search-input:visible').first().fill(title); await p.waitForTimeout(400)
  await p.locator('.library-entry .activity-card').filter({ hasText: title }).first().click()
  await p.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(400)
}
async function pdfOf(p, tag) {
  await p.emulateMedia({ media: 'print' })
  const geo = await p.evaluate(() => {
    const host = document.querySelectorAll('.print-host'); const vis = [...document.body.children].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.className || e.tagName)
    const c = document.querySelector('.print-host .pass-sheet-map .hall-canvas'); const r = c?.getBoundingClientRect()
    return { hosts: host.length, visibleBodyChildren: vis, mapClass: c?.className ?? null, mapRatio: r ? +(r.width / r.height).toFixed(4) : null, mapW: r?.width, mapH: r?.height,
      rows: [...document.querySelectorAll('.print-host .pass-station > span:first-child')].map((s) => s.textContent.trim()),
      markers: [...document.querySelectorAll('.print-host .hall-canvas .hall-chip')].map((c) => ({ rank: c.querySelector('.hall-chip-rank')?.textContent?.trim() ?? null, label: c.getAttribute('aria-label') ?? c.textContent.trim().slice(0, 60) })) }
  })
  const path = `${CK}/pdf/${tag}.pdf`
  await p.pdf({ path, format: 'A4', preferCSSPageSize: true, printBackground: true })
  await p.emulateMedia({ media: 'screen' })
  const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' })
  const text = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' })
  return { pages: Number(/Pages:\s+(\d+)/.exec(info)[1]), size: /Page size:\s+(.*)/.exec(info)[1], text, perPage: text.split('\f').filter((t, i, a) => i < a.length - 1 || t.trim()), geo }
}
const lastLines = (perPage) => perPage.slice(0, -1).map((t) => t.trim().split('\n').filter(Boolean).pop()?.trim() ?? '')
const isHeading = (l) => /^(Samling|Uppvärmning|Teknik|Styrka|Lek och spel|Lek|Avslutning)\s+·\s+\d+\s+min$|^Hallöversikt$|^Förrådslista$/.test(l.replace(/\s+/g, ' '))
execFileSync('mkdir', ['-p', `${CK}/pdf`])
let linkDraft = null, link = process.env.LINK ?? null, mainLink = null, mainFile = null
const microcopy = {
  shareHint: 'Skicka länken till en annan tränare. Den som öppnar den ser hela passet och kan spara det hos sig. Passet finns i länken, så det behövs inget konto.',
  printHint: 'Hela passet på papper: tidslinjen, varje station med skiss, Se upp för och Säkerhet, och hallkartan. Vill du ha en fil väljer du Spara som PDF.',
  stalled: 'Utskriften kom inte igång. Från hemskärmen kan iPhone ibland inte skriva ut. Kopiera länken, öppna den i Safari och skriv ut passet därifrån.',
  manual: 'Det gick inte att kopiera. Håll fingret på länken nedan och välj Kopiera.',
}
const stripS = (s) => ({ title: s.title, total: s.totalMinutes, target: s.targetMinutes ?? 60, hall: s.hallTemplateId ?? null, place: (s.hallPlacements ?? []).map((x) => [x.sessionItemId, +x.x.toFixed(4), +x.y.toFixed(4)]), blocks: s.blocks.map((b) => [b.type, b.items.map((i) => [i.activityId, i.durationMinutes, i.stationEquipment ? JSON.stringify(i.stationEquipment) : null])]) })

await attempt('Dela', async () => {
  const p = await page('webkit'); await mall(p)
  await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.waitForTimeout(200)
  const items = (await p.locator('.more-menu-panel button:visible').allInnerTexts()).map((t) => t.trim())
  await shot(p, '01_mer_menu')
  await p.locator('.more-menu-panel').getByRole('button', { name: 'Dela', exact: true }).click(); await sheet(p).waitFor()
  const dlg = await p.locator('.export-sheet-backdrop').getAttribute('aria-label')
  check('AC1', 'Mer shows «Dela» (no «Exportera / dela»); tap opens a sheet titled «Dela» (dialog aria-label «Dela»)', items.includes('Dela') && !items.some((t) => /Exportera/.test(t)) && (await sheet(p).locator('h2').innerText()) === 'Dela' && dlg === 'Dela', `menu=${items.join('|')} aria=${dlg}`)
  const inv = await sheet(p).evaluate((el) => ({
    buttons: [...el.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.textContent.trim()),
    inputs: el.querySelectorAll('input, textarea, select').length, svg: el.querySelectorAll('svg, img, canvas').length, labels: el.querySelectorAll('label').length,
    headings: [...el.querySelectorAll('h2, h3')].map((h) => h.textContent.trim()), text: el.innerText,
  }))
  const banned = ['Helskär', 'Skriv ut kort', 'Ladda ner fil', 'Importera fil', 'Spara som egen mall', 'QR', 'Stationskort', 'Skicka till telefonen']
  check('AC2', 'exactly two actions «Kopiera länk» + «Skriv ut passet» (+ ×); no Helskär/Skriv ut kort/Ladda ner fil/link field/QR/Importera fil/Spara som egen mall', JSON.stringify(inv.buttons) === JSON.stringify(['×', 'Kopiera länk', 'Skriv ut passet']) && inv.inputs === 0 && inv.svg === 0 && inv.labels === 0 && !banned.some((b) => inv.text.includes(b)), JSON.stringify({ ...inv, text: undefined }))
  const g = await sheet(p).evaluate((el) => ({ sw: document.documentElement.scrollWidth, esw: el.scrollWidth, ecw: el.clientWidth, sheetTop: Math.round(el.getBoundingClientRect().top), sheetBottom: Math.round(el.getBoundingClientRect().bottom), contentBottom: Math.round([...el.querySelectorAll('.export-block')].pop().getBoundingClientRect().bottom), btn: [...el.querySelectorAll('.export-block button, .modal-close')].map((b) => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.width), Math.round(r.height)] }), hints: [...el.querySelectorAll('.export-block p')].map((x) => x.textContent) }))
  note('AC3-geometry', g)
  const big = g.btn.filter(([t]) => t !== '×').every(([, w, h]) => w >= 44 && h >= 44)
  check('AC3', 'both buttons ≥ 44×44; no horizontal scroll; hint texts = microcopy', big && g.sw <= 390 && g.esw <= g.ecw && g.hints[0] === microcopy.shareHint && g.hints[1] === microcopy.printHint, JSON.stringify(g))
  await shot(p, '02_dela_sheet')
  await p.setViewportSize({ width: 320, height: 640 }); await p.waitForTimeout(300)
  const g320 = await sheet(p).evaluate((el) => ({ sw: document.documentElement.scrollWidth, esw: el.scrollWidth, ecw: el.clientWidth, btn: [...el.querySelectorAll('.export-block button')].map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] }) }))
  check('AC3-320', '320×640: no horizontal scroll, buttons ≥ 44×44', g320.sw <= 320 && g320.esw <= g320.ecw && g320.btn.every(([w, h]) => w >= 44 && h >= 44), JSON.stringify(g320))
  await shot(p, '02b_dela_sheet_320'); await p.setViewportSize(PHONE); await p.waitForTimeout(300)
  const t0 = Date.now()
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(250)
  link = await p.evaluate(() => navigator.clipboard.readText())
  const lab = await sheet(p).locator('.btn-primary').innerText(); await shot(p, '03_copied')
  let flip = null; for (let i = 0; i < 50; i++) { await p.waitForTimeout(100); if ((await sheet(p).locator('.btn-primary').innerText()) === 'Kopiera länk') { flip = Date.now() - t0; break } }
  linkDraft = await draft(p)
  check('AC4', 'clipboard = …/traningsplaneringen/#dela=…; label «Länken är kopierad.» then «Kopiera länk» after ~3 s', /^http:\/\/127\.0\.0\.1:57741\/traningsplaneringen\/#dela=z\./.test(link) && lab === 'Länken är kopierad.' && flip > 2800 && flip < 3700, `len=${link.length} label=${lab} flipAfter=${flip}ms`)
  await sheet(p).locator('.modal-close').click(); await p.waitForTimeout(300)
  const c1 = await p.evaluate(() => ({ cls: document.body.className, sheet: !!document.querySelector('.export-sheet'), builder: !!document.querySelector('.builder') }))
  await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
  const pr = await p.evaluate(() => ({ prints: window.__prints, now: { cls: document.body.className, hosts: document.querySelectorAll('.print-host').length } }))
  check('A1-webkit', 'WebKit timing (afterprint right after print returns): body.is-print-pass + 1 .print-host still there after afterprint', pr.prints.length === 1 && pr.now.cls.includes('is-print-pass') && pr.now.hosts === 1, JSON.stringify(pr))
  const r = await pdfOf(p, 'br-dela-webkit-390')
  execFileSync('pdftoppm', ['-png', '-r', '60', `${CK}/pdf/br-dela-webkit-390.pdf`, `${SS}print_dela_p`])
  note('print-dela-webkit', { pages: r.pages, size: r.size, geo: r.geo, last: lastLines(r.perPage) })
  const blocks = ['Samling · 6 min', 'Uppvärmning · 10 min', 'Teknik · 18 min', 'Styrka · 13 min', 'Lek och spel · 6 min']
  const norm = r.text.replace(/[ \t]+/g, ' ')
  check('AC14-content', 'print (WebKit timing) = the pass, not the app: title, total minutes, all five blocks with rows + minutes, A4 portrait', r.size.includes('594.96 x 841.92') && norm.includes('Nybörjare — ca 55 min') && /\n\s*5\d min\s*\n/.test(r.text) && blocks.every((b) => norm.includes(b)) && !/Fler saker med passet|Kopiera länk|Passbyggaren/.test(r.text) && r.geo.visibleBodyChildren.length === 1 && /print-host/.test(r.geo.visibleBodyChildren[0]), `pages=${r.pages} size=${r.size} vis=${r.geo.visibleBodyChildren}`)
  check('AC15-base', 'Teknik rows «1.» «2.» «3.» each with sketch, «Se upp för.», «Säkerhet.», «Redskap.»', JSON.stringify(r.geo.rows.map((x) => x.split('.')[0])) === '["1","2","3"]' && (norm.match(/Se upp för\./g) ?? []).length === 3 && (norm.match(/Säkerhet\./g) ?? []).length === 3 && (norm.match(/Redskap\./g) ?? []).length === 3 && (await p.locator('.print-host .pass-station .station-sketch').count()) === 3, JSON.stringify(r.geo.rows))
  const mOk = r.geo.markers.length === 3 && r.geo.markers.every((m) => { const row = r.geo.rows.find((x) => x.startsWith(m.rank + '.')); return row && m.label.includes(row.replace(/^\d+\.\s*/, '').slice(0, 8)) })
  check('AC15-markers', 'print row numbers = hall map marker numbers (all stations placed)', mOk, JSON.stringify({ rows: r.geo.rows, markers: r.geo.markers }))
  check('AC16-breaks', 'no page ends on a block heading; Hallöversikt heading on the same page as the map', !lastLines(r.perPage).some(isHeading) && r.perPage.some((t) => t.includes('Hallöversikt')), JSON.stringify(lastLines(r.perPage)))
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
  check('AC18-stub', 'second tap in the same sheet calls print() again; no stall line (beforeprint arrived)', (await p.evaluate(() => window.__prints.length)) === 2 && (await sheet(p).locator('[role=status]').count()) === 0)
  const hit = await p.evaluate(() => document.elementFromPoint(195, 835)?.className); note('AC8-backdrop-hit', hit)
  await p.mouse.click(195, 835); await p.waitForTimeout(400)
  const c2 = await p.evaluate(() => { const y0 = scrollY; window.scrollTo(0, 600); return { cls: document.body.className, sheet: !!document.querySelector('.export-sheet'), hosts: document.querySelectorAll('.print-host').length, builder: !!document.querySelector('.builder'), scrolled: scrollY > y0 } })
  check('AC8', '× and backdrop tap close the sheet → Passbyggaren, page scrolls, no stray is-print-pass, print host gone', !c1.sheet && c1.builder && !c1.cls.includes('is-print-pass') && !c2.sheet && c2.builder && !c2.cls.includes('is-print-pass') && c2.hosts === 0 && c2.scrolled, JSON.stringify({ c1, c2, hit }))
  check('AC22-footer', 'footer «Träningsplaneraren · Slice 44»', (await p.locator('body').innerText()).includes('Träningsplaneraren · Slice 44'))
  await p.evaluate(() => window.scrollTo(0, 0))
  await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300)
  const d13 = p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Spara som egen mall' })
  const dlgShown = await d13.count(); await shot(p, '04_spara_egen_mall')
  const nameIn = d13.locator('input'); if (await nameIn.count()) await nameIn.first().fill('S44V egen mall')
  await d13.locator('.btn-primary').last().click(); await p.waitForTimeout(400)
  const saved = await p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]').map((t) => t.title), TK)
  check('AC13', 'Mer «Spara som egen mall» opens its dialog and saves (Mina mallar)', dlgShown > 0 && saved.includes('S44V egen mall'), JSON.stringify(saved))
  await p.context().close()
})

await attempt('Ratios', async () => {
  const out = {}
  for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
    for (const hall of ['forening-bla', 'forening-vit', 'standard-trupp']) {
      // 'dead' stub: no afterprint, so main's teardown-on-afterprint leaves its host mounted for measuring
      const p = await page('dead', { vp: { width: 1280, height: 800 }, touch: false }); await mall(p, base)
      await openHall(p); await p.locator('#hall-layout-select').selectOption(hall); await p.waitForTimeout(500); await backFromHall(p)
      await p.getByRole('button', { name: /^(Dela|Exportera \/ dela)$/ }).first().click(); await sheet(p).waitFor()
      await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
      const r = await pdfOf(p, `${tag}-${hall}-1280`)
      out[`${tag}-${hall}`] = { pages: r.pages, ratio: r.geo.mapRatio, w: r.geo.mapW, h: r.geo.mapH, cls: r.geo.mapClass, last: lastLines(r.perPage), mapPage: r.perPage.findIndex((t) => /Hallöversikt/.test(t)) }
      await p.context().close()
    }
  }
  note('AC16-ratios', out)
  const same = ['forening-bla', 'forening-vit', 'standard-trupp'].every((h) => out[`br-${h}`].ratio === out[`main-${h}`].ratio && Math.abs(out[`br-${h}`].w - out[`main-${h}`].w) < 1)
  check('AC16-ratios', 'Blå / Vit (and Standard) print map ratio and size identical to main (Blå 2132/1572≈1.3562, Vit 2108/2200≈0.9582)', same && Math.abs(out['br-forening-bla'].ratio - 2132 / 1572) < 0.01 && Math.abs(out['br-forening-vit'].ratio - 2108 / 2200) < 0.01, JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [v.ratio, Math.round(v.w), Math.round(v.h), v.pages]]))))
  check('AC16-breaks-halls', 'no page ends on a heading for Blå/Vit/Standard prints', Object.entries(out).filter(([k]) => k.startsWith('br-')).every(([, v]) => !v.last.some(isHeading)), JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.last]))))
})

await attempt('AC15-exp', async () => {
  const p = await page('webkit'); await mall(p)
  await addTeknikByTitle(p, 'Rondat–flickis')
  await openHall(p)
  const all = p.locator('.hall-header-actions button', { hasText: 'Använd alla förslag' }); if (await all.count() && await all.isEnabled()) { await all.click(); await p.waitForTimeout(800) }
  const screenMarkers = await p.evaluate(() => [...document.querySelectorAll('.hall-canvas .hall-chip')].map((c) => ({ rank: c.querySelector('.hall-chip-rank')?.textContent?.trim(), label: c.getAttribute('aria-label') ?? c.textContent.trim() })))
  await shot(p, '05_hall_4_stations')
  await backFromHall(p); await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
  const r = await pdfOf(p, 'br-4stations-exp')
  execFileSync('pdftoppm', ['-png', '-r', '60', `${CK}/pdf/br-4stations-exp.pdf`, `${SS}print_4st_p`])
  const norm = r.text.replace(/[ \t]+/g, ' ')
  const titles = r.geo.rows.map((x) => x.replace(/^\d+\.\s*/, '').replace(/ · Erfaren ledare$/, ''))
  const split = titles.map((t) => { const key = t.slice(0, 14); const pg = r.perPage.findIndex((pp) => pp.replace(/\s+/g, ' ').includes(key)); const after = r.perPage[pg]?.replace(/\s+/g, ' ').split(key)[1] ?? ''; return { t, pg, redskapSamePage: /Redskap\./.test(after) } })
  note('AC15-exp', { rows: r.geo.rows, screenMarkers, printMarkers: r.geo.markers, pages: r.pages, split, last: lastLines(r.perPage) })
  const mm = screenMarkers.length === 4 && screenMarkers.every((m) => { const row = r.geo.rows.find((x) => x.startsWith(m.rank + '.')); return row && m.label.includes(row.replace(/^\d+\.\s*/, '').slice(0, 8)) })
  check('AC15-exp', '4th station Rondat–flickis prints «4. Rondat–flickis · Erfaren ledare» with sketch / Se upp för / Säkerhet / Redskap; numbers = hall markers', r.geo.rows[3]?.startsWith('4. Rondat–flickis · Erfaren ledare') && (norm.match(/Se upp för\./g) ?? []).length === 4 && (norm.match(/Redskap\./g) ?? []).length === 4 && mm, JSON.stringify({ rows: r.geo.rows, screenMarkers }))
  check('AC16-nosplit', 'no station split across pages (title and its Redskap. line on one page); no page ends on a heading', split.every((s) => s.pg >= 0 && s.redskapSamePage) && !lastLines(r.perPage).some(isHeading), JSON.stringify({ pages: r.pages, split, last: lastLines(r.perPage) }))
  await p.context().close()
})

await attempt('Markers-partial', async () => {
  const p = await page('webkit'); await p.goto(BR + '#dela=' + PART.token); await p.locator('.share-actions').waitFor(); await p.waitForTimeout(400)
  const screen = await p.evaluate(() => [...document.querySelectorAll('.share-pass .hall-canvas .hall-chip')].map((c) => ({ rank: c.querySelector('.hall-chip-rank')?.textContent?.trim(), label: (c.getAttribute('aria-label') ?? c.textContent).trim() })))
  await shot(p, '06_partial_share_map', true)
  await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
  const r = await pdfOf(p, 'br-partial')
  execFileSync('pdftoppm', ['-png', '-r', '110', `${CK}/pdf/br-partial.pdf`, `${CK}/pdf/br-partial-p`])
  const pairs = r.geo.markers.map((m) => ({ marker: m.rank, label: m.label.slice(0, 40), printRow: r.geo.rows.find((x) => m.label.includes(x.replace(/^\d+\.\s*/, '').slice(0, 8))) }))
  note('markers-partial', { screen, rows: r.geo.rows, printMarkers: r.geo.markers, pairs })
  check('MARKERS-partial', 'station 1 unplaced (2 of 3 on the map): print numbers still equal the map marker numbers', pairs.length === 2 && pairs.every((x) => x.printRow?.startsWith(x.marker + '.')), JSON.stringify(pairs))
  await p.context().close()
})

await attempt('Stalled', async () => {
  const p = await page('dead'); await mall(p); await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Skriv ut passet' }).click()
  const t0 = Date.now(); let at = null
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); if (await sheet(p).locator('[role=status]').count()) { at = Date.now() - t0; break } }
  const line = await sheet(p).locator('[role=status]').innerText().catch(() => '')
  const pos = await p.evaluate(() => { const s = document.querySelector('.export-sheet [role=status]'); const b = [...document.querySelectorAll('.export-sheet button')].find((x) => x.textContent === 'Skriv ut passet'); return s && b ? { below: s.getBoundingClientRect().top >= b.getBoundingClientRect().bottom, sameBlock: s.parentElement === b.parentElement } : null })
  await shot(p, '07_print_stalled')
  check('AC20-sim', 'no beforeprint → printStalled text (exact) under the button after ~1.5 s (not before)', at >= 1400 && at <= 2200 && line === microcopy.stalled && pos?.below && pos?.sameBlock, `at=${at}ms ${JSON.stringify(pos)}`)
  await sheet(p).locator('.modal-close').click(); await p.waitForTimeout(200)
  check('AC20-sim-close', 'closing after a stalled print leaves no is-print-pass', !(await p.evaluate(() => document.body.className)).includes('is-print-pass'))
  await openHall(p); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(400)
  await p.locator('.hall-floor-actions').getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(1900)
  const g = await p.locator('.hall-board [role=status]').filter({ hasText: 'Utskriften kom inte igång' }).count()
  await shot(p, '07b_golvklart_stalled')
  const p2 = await page('dead'); await p2.goto(link); await p2.locator('.share-actions').waitFor()
  await p2.getByRole('button', { name: 'Skriv ut passet' }).click(); await p2.waitForTimeout(1900)
  const s = await p2.locator('.share-pass [role=status]').filter({ hasText: 'Utskriften kom inte igång' }).count()
  await shot(p2, '07c_delat_stalled')
  check('AC20-sim-surfaces', 'printStalled also on Golvklart and Delat pass', g === 1 && s === 1, `golvklart=${g} delat=${s}`)
  await p.context().close(); await p2.context().close()
  for (const m of ['webkit', 'chromium']) {
    const q = await page(m); await mall(q); await menu(q, 'Dela'); await sheet(q).waitFor()
    await sheet(q).getByRole('button', { name: 'Skriv ut passet' }).click(); await q.waitForTimeout(2200)
    check(`AC20-noline-${m}`, `print starts (${m} timing) → no stall line after 2.2 s`, (await sheet(q).locator('[role=status]').count()) === 0)
    await q.context().close()
  }
})

await attempt('CopyFail', async () => {
  // (a) real permission: no clipboard grant → writeText rejects → execCommand fallback
  const p = await page('webkit', { perms: [] }); await mall(p)
  await p.evaluate(() => { window.__wt = []; const o = navigator.clipboard.writeText.bind(navigator.clipboard); navigator.clipboard.writeText = (v) => o(v).then(() => window.__wt.push('ok'), (e) => { window.__wt.push('rej:' + e.name); throw e }); const ex = document.execCommand.bind(document); document.execCommand = (c, ...a) => { const r = ex(c, ...a); window.__wt.push('exec:' + r); return r } })
  await menu(p, 'Dela'); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(400)
  const a = { label: await sheet(p).locator('.btn-primary').innerText(), trace: await p.evaluate(() => window.__wt), manual: await sheet(p).locator('input[readonly]').count() }
  note('AC7-a-no-permission', a); console.log('AC7a', JSON.stringify(a))
  await p.context().close()
  // (b) both paths fail
  const q = await page('webkit', { init: () => { Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => ({ writeText: (v) => { window.__tried = v; return Promise.reject(new DOMException('denied', 'NotAllowedError')) }, readText: () => Promise.resolve('') }), configurable: true }); Document.prototype.execCommand = function () { return false } } })
  await mall(q); await menu(q, 'Dela'); await sheet(q).waitFor()
  await sheet(q).getByRole('button', { name: 'Kopiera länk' }).click(); await q.waitForTimeout(400)
  const b = await sheet(q).evaluate((el) => { const i = el.querySelector('input'); return { label: el.querySelector('.btn-primary').textContent, status: el.querySelector('[role=status]')?.textContent, readOnly: i?.readOnly, value: i?.value, aria: i?.getAttribute('aria-label'), fieldW: i ? [Math.round(i.getBoundingClientRect().width), i.scrollWidth] : null, sw: document.documentElement.scrollWidth } })
  await shot(q, '08_copy_failed')
  await sheet(q).locator('input[readonly]').focus(); await q.waitForTimeout(150)
  const sel = await q.evaluate(() => { const i = document.activeElement; return [i.selectionStart, i.selectionEnd, i.value.length] })
  await q.waitForTimeout(3200); const later = await sheet(q).locator('.btn-primary').innerText()
  const tried = await q.evaluate(() => window.__tried)
  const sameToken = !!b.value && b.value === tried && /^http:\/\/127\.0\.0\.1:57741\/traningsplaneringen\/#dela=z\./.test(b.value)
  check('AC7', 'both copy paths fail → exportCopyManual line + read-only field holding the full link; label never says «kopierad»', b.label === 'Kopiera länk' && later === 'Kopiera länk' && b.status === microcopy.manual && b.readOnly === true && sameToken && b.sw <= 390, JSON.stringify({ ...b, value: b.value?.slice(0, 60) + '…', sameToken, sel }))
  check('AC7-select', 'focusing the field selects the whole link (copy by hand)', sel[0] === 0 && sel[1] === sel[2], JSON.stringify(sel))
  await q.context().close()
  // (c) execCommand throws
  const r = await page('webkit', { init: () => { Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => ({ writeText: () => Promise.reject(new Error('x')) }), configurable: true }); Document.prototype.execCommand = function () { throw new Error('boom') } } })
  await mall(r); await menu(r, 'Dela'); await sheet(r).waitFor()
  await sheet(r).getByRole('button', { name: 'Kopiera länk' }).click(); await r.waitForTimeout(400)
  const c = { label: await sheet(r).locator('.btn-primary').innerText(), manual: await sheet(r).locator('input[readonly]').count(), leftover: await r.evaluate(() => document.querySelectorAll('body > textarea').length) }
  check('AC7-throw', 'execCommand throwing is also caught → manual field, no leftover textarea', c.label === 'Kopiera länk' && c.manual === 1 && c.leftover === 0, JSON.stringify(c))
  await r.context().close()
  // (d) no navigator.clipboard
  const d = await page('webkit', { init: () => { Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined, configurable: true }); Document.prototype.execCommand = function () { return false } } })
  await mall(d); await menu(d, 'Dela'); await sheet(d).waitFor()
  await sheet(d).getByRole('button', { name: 'Kopiera länk' }).click(); await d.waitForTimeout(400)
  check('AC7-noapi', 'no navigator.clipboard at all + execCommand false → manual field', (await sheet(d).locator('input[readonly]').count()) === 1 && (await sheet(d).locator('.btn-primary').innerText()) === 'Kopiera länk')
  await d.context().close()
})

await attempt('SharePass', async () => {
  const srcDraft = linkDraft
  const p = await page('webkit'); await p.goto(link); await p.locator('.share-actions').waitFor(); await p.waitForTimeout(400)
  const t = await p.locator('.share-pass').innerText()
  const btns = (await p.locator('.share-actions button:visible').allInnerTexts()).map((x) => x.trim())
  await shot(p, '09_delat_pass')
  check('AC10', 'Delat pass actions exactly: Kör passet · Spara och kör · Spara på den här enheten · Skriv ut passet · Till planeringen', JSON.stringify(btns) === JSON.stringify(['Kör passet', 'Spara och kör', 'Spara på den här enheten', 'Skriv ut passet', 'Till planeringen']), btns.join('|'))
  await p.getByRole('button', { name: 'Spara på den här enheten' }).click(); await p.waitForTimeout(500)
  const cf = p.locator('.modal-backdrop[role=dialog] .btn-primary'); if (await cf.count()) { await cf.last().click(); await p.waitForTimeout(500) }
  await p.waitForTimeout(1200); const d = await draft(p)
  const eq = d && JSON.stringify(stripS(d)) === JSON.stringify(stripS(srcDraft))
  check('AC5', 'link in a fresh context → Delat pass with banner; «Spara på den här enheten» saves the same title, blocks, minutes and hall placements', t.includes('Pass från en annan enhet. Ingenting sparas här förrän du själv sparar.') && eq, JSON.stringify({ saved: d?.title, place: d?.hallPlacements?.length, eq }))
  note('AC5', { src: stripS(srcDraft), saved: d && stripS(d) })
  await p.context().close()
  const pages = {}
  for (const where of ['dela', 'golvklart', 'delat']) {
    const q = await page('chromium'); await mall(q)
    if (where === 'dela') { await menu(q, 'Dela'); await sheet(q).waitFor(); await sheet(q).getByRole('button', { name: 'Skriv ut passet' }).click() }
    if (where === 'golvklart') { await openHall(q); await q.getByRole('button', { name: 'Golvklart', exact: true }).click(); await q.waitForTimeout(400); await q.locator('.hall-floor-actions').getByRole('button', { name: 'Skriv ut passet' }).click() }
    if (where === 'delat') { await q.goto(link); await q.locator('.share-actions').waitFor(); await q.getByRole('button', { name: 'Skriv ut passet' }).click() }
    await q.waitForTimeout(700); const r = await pdfOf(q, `br-ac17-${where}`); pages[where] = { pages: r.pages, text: r.text.replace(/\s+/g, ' ').trim() }
    await q.context().close()
  }
  check('AC17', 'Dela, Golvklart and Delat pass print the same pages (page count + identical text)', pages.dela.pages === pages.golvklart.pages && pages.dela.pages === pages.delat.pages && pages.dela.text === pages.golvklart.text && pages.dela.text === pages.delat.text, JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, [v.pages, v.text.length]]))))
})

await attempt('AC11', async () => {
  const out = {}
  for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
    const p = await page('webkit'); await mall(p, base)
    await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).first().click(); await p.waitForTimeout(800)
    const a = await p.evaluate(() => ({ fs: document.fullscreenElement?.tagName ?? null, kicker: document.querySelector('.run-kicker')?.textContent ?? null }))
    if (tag === 'br') await shot(p, '10_kor_passet_fullscreen')
    await p.context().close()
    const q = await page('webkit'); await q.goto(tag === 'br' ? link : base + '#dela=' + OLD.zip); await q.locator('.share-actions').waitFor()
    await q.getByRole('button', { name: 'Kör passet, en övning i taget' }).first().click(); await q.waitForTimeout(800)
    const b = await q.evaluate(() => ({ fs: document.fullscreenElement?.tagName ?? null, kicker: document.querySelector('.run-kicker')?.textContent ?? null }))
    out[tag] = { builder: a, delat: b }
    await q.context().close()
  }
  note('AC11', out)
  check('AC11', 'Kör passet enters fullscreen (document.fullscreenElement = HTML) from Passbyggaren and from Delat pass, as on main; run view shows', out.br.builder.fs === 'HTML' && out.br.delat.fs === 'HTML' && out.main.builder.fs === 'HTML' && out.main.delat.fs === 'HTML' && out.br.builder.kicker && out.br.delat.kicker, JSON.stringify(out))
})

await attempt('Golvklart', async () => {
  const res = {}
  for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
    const p = await page('webkit'); await mall(p, base); await openHall(p)
    await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500)
    const btns = (await p.locator('.hall-floor-actions button:visible').allInnerTexts()).map((x) => x.trim())
    if (tag === 'br') await shot(p, '11_golvklart')
    const media = async () => { await p.emulateMedia({ media: 'print' }); const v = await p.evaluate(() => ({ cls: document.body.className, rootDisplay: getComputedStyle(document.querySelector('#root')).display, hostVisible: [...document.querySelectorAll('.print-host')].some((h) => getComputedStyle(h).display !== 'none'), floor: !!document.querySelector('.hall-header--floor') })); await p.emulateMedia({ media: 'screen' }); return v }
    const before = await media()
    await p.locator('.hall-floor-actions').getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(700)
    const after = await media()
    await p.locator('.hall-floor-actions button').first().click(); await p.waitForTimeout(400)
    const edit = await media()
    if (tag === 'br') { await p.emulateMedia({ media: 'print' }); const path = `${CK}/pdf/br-hall-edit-ctrlp-after-golvklart-print.pdf`; await p.pdf({ path, format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' }); edit.pdfText = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' }).replace(/\s+/g, ' ').slice(0, 120) }
    await backFromHall(p)
    const back = await p.evaluate(() => document.body.className)
    await openHall(p); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(400)
    await p.locator('.hall-floor-actions').getByRole('button', { name: 'Förrådslista' }).click(); await p.waitForTimeout(500)
    const fl = await p.evaluate(() => { const s = document.querySelector('.forradslista-backdrop, .forradslista-sheet'); return s ? { text: s.innerText.slice(0, 200), items: s.querySelectorAll('li').length } : null })
    if (tag === 'br') await shot(p, '12_forradslista')
    res[tag] = { btns, before, after, edit, back, fl }
    await p.context().close()
  }
  note('AC9-golvklart', res)
  check('AC9', 'Golvklart actions exactly Avsluta golvklart · Förrådslista · Skriv ut passet; Förrådslista opens with its list (same as main)', res.br.btns.length === 3 && /^Avsluta golvklart$/i.test(res.br.btns[0]) && res.br.btns[1] === 'Förrådslista' && res.br.btns[2] === 'Skriv ut passet' && res.br.fl && res.br.fl.items > 0 && res.br.fl.items === res.main.fl?.items, JSON.stringify({ br: res.br.btns, fl: res.br.fl?.items, mainFl: res.main.fl?.items }))
  check('BLAST-hall-ctrlp', 'after «Skriv ut passet» in Golvklart, a browser print (Ctrl+P / share-sheet print) of Golvklart / Hallöversikt prints the hall again, as on main', res.br.edit.rootDisplay !== 'none' && !res.br.edit.hostVisible && res.br.after.rootDisplay !== 'none', JSON.stringify({ brAfter: res.br.after, brEdit: res.br.edit, mainAfter: res.main.after, mainEdit: res.main.edit, brBack: res.br.back }))
})

await attempt('OldLinks', async () => {
  const m = await page('webkit'); await mall(m, MAIN); await menu(m, 'Exportera / dela'); await sheet(m).waitFor()
  await sheet(m).getByRole('button', { name: 'Kopiera länk' }).click(); await m.waitForTimeout(300)
  mainLink = await m.evaluate(() => navigator.clipboard.readText())
  const [dl] = await Promise.all([m.waitForEvent('download'), sheet(m).getByRole('button', { name: 'Ladda ner fil' }).click()])
  mainFile = `${CK}/main-ladda-ner-fil-${dl.suggestedFilename()}`; await dl.saveAs(mainFile)
  await m.waitForTimeout(1200); const mainDraft = await draft(m); await m.context().close()
  const res = {}
  const cases = [
    ['main-ui', mainLink.replace('57742', '57741'), stripS(mainDraft)],
    ['main-code-zip', BR + '#dela=' + OLD.zip, null],
    ['main-code-raw-j', BR + '#dela=' + OLD.raw, null],
    ['main-code-plain-json', BR + '#dela=' + OLD.plainJson, null],
    ['main-code-empty', BR + '#dela=' + OLD.empty, null],
  ]
  const expBlocks = JSON.stringify(OLD.expect.blocks.map((b) => [b.type, b.items.map(([a, d]) => [a, d])]))
  for (const [k, url, want] of cases) {
    const p = await page('webkit'); await p.goto(url); await p.waitForTimeout(900)
    const v = await p.evaluate(() => ({ banner: document.querySelector('.share-banner')?.textContent ?? null, bad: document.body.innerText.includes('Länken gick inte att läsa.'), h1: document.querySelector('.share-head h1')?.textContent, min: document.querySelector('.share-head p')?.textContent, chips: document.querySelectorAll('.share-pass .hall-canvas .hall-chip').length, actions: [...document.querySelectorAll('.share-actions button')].map((b) => b.textContent) }))
    if (k === 'main-code-zip') await shot(p, '13_old_link_main_code', true)
    let saved = null
    if (v.banner) { await p.getByRole('button', { name: 'Spara på den här enheten' }).click(); await p.waitForTimeout(500); const cf = p.locator('.modal-backdrop[role=dialog] .btn-primary'); if (await cf.count()) { await cf.last().click(); await p.waitForTimeout(400) } await p.waitForTimeout(1200); const d = await draft(p); saved = d && stripS(d) }
    let printOk = null
    if (v.banner && k !== 'main-code-empty') { await p.goto(url); await p.waitForTimeout(500); await p.locator('.share-actions').waitFor(); await p.getByRole('button', { name: 'Skriv ut passet' }).click(); await p.waitForTimeout(600); const r = await pdfOf(p, `old-${k}`); printOk = { pages: r.pages, rows: r.geo.rows, markers: r.geo.markers.map((x) => x.rank) } }
    let match
    if (want) match = saved && JSON.stringify(saved) === JSON.stringify(want)
    else if (k === 'main-code-empty') match = saved && saved.title === 'Tomt gammalt'
    else match = saved && saved.title === OLD.expect.title && saved.target === 90 && saved.hall === 'forening-vit' && saved.place.length === OLD.expect.placements.length && JSON.stringify(saved.blocks.map(([t, it]) => [t, it.map(([a, d]) => [a, d])])) === expBlocks && saved.blocks.find((b) => b[0] === 'techniques')[1][0][2] === JSON.stringify([{ pieceId: 'eq-plint', count: 2 }])
    res[k] = { ...v, match, printOk, savedTitle: saved?.title }
    await p.context().close()
  }
  note('AC6', res)
  check('AC6', 'old SharePass v1 links made with main 0d88da5 (main UI copy, main code z./j./plain JSON, empty pass) open Delat pass on the branch and save the identical pass (title, 90-min, Vit, placements, minutes, saved redskap)', Object.values(res).every((v) => v.banner && !v.bad && v.match), JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, [!!v.banner, v.match, v.chips, v.printOk?.pages]]))))
  check('AC6-print', 'old link prints with station numbers incl. the old experienced drill («· Erfaren ledare») and marker numbers 1…n', res['main-code-zip'].printOk?.rows?.length === 4 && res['main-code-zip'].printOk.rows[3].includes('Rondat–flickis · Erfaren ledare') && JSON.stringify(res['main-code-zip'].printOk.markers) === '["1","2","3"]', JSON.stringify(res['main-code-zip'].printOk))
  const out12 = {}
  for (const withDraft of [false, true]) {
    const p = await page('webkit')
    if (withDraft) { await mall(p); await p.waitForTimeout(1000); await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor() }
    else { await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
    await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.locator('.home-receive').waitFor()
    if (!withDraft) await shot(p, '14_home_hamta')
    await p.locator('.home-receive input[type=file]').setInputFiles(mainFile); await p.waitForTimeout(900)
    const cf = p.locator('.modal-backdrop[role=dialog]'); const confirm = (await cf.count()) ? await cf.innerText() : null
    if (confirm) { await cf.locator('.btn-primary').last().click(); await p.waitForTimeout(600) }
    const title = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue().catch(() => null)
    await p.waitForTimeout(1200); const d = await draft(p)
    out12[withDraft ? 'draft' : 'clean'] = { confirm: confirm?.replace(/\s+/g, ' ').slice(0, 80) ?? null, title, match: d && JSON.stringify(stripS(d)) === JSON.stringify(stripS(mainDraft)) }
    await p.context().close()
  }
  const p = await page('webkit'); await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.locator('.home-receive textarea').fill(mainLink.replace('57742', '57741'))
  await p.locator('.home-receive .btn-primary').click(); await p.waitForTimeout(900)
  const pasteTitle = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue().catch(() => null)
  const q = await page('webkit'); await q.goto(BR); await q.evaluate(() => localStorage.clear()); await q.reload(); await q.locator('.home').waitFor()
  await q.getByRole('button', { name: 'Hämta ett pass' }).click()
  writeFileSync(`${CK}/bad-pass.json`, '{"nope":1}')
  await q.locator('.home-receive input[type=file]').setInputFiles(`${CK}/bad-pass.json`); await q.waitForTimeout(500)
  const bad = await q.locator('.home-receive [role=alert]').innerText().catch(() => null)
  out12.paste = pasteTitle; out12.bad = bad
  note('AC12', out12)
  check('AC12', 'Home «Hämta ett pass»: file from main «Ladda ner fil» imports (clean; with a draft → replace confirm), pasted link opens, bad file → «Filen eller koden gick inte att läsa.»', out12.clean.match && out12.draft.match && out12.draft.confirm && pasteTitle?.includes('Nybörjare') && bad === 'Filen eller koden gick inte att läsa.', JSON.stringify(out12))
  await p.context().close(); await q.context().close()
})

await attempt('AC21-ui', async () => {
  const p = await page('webkit'); await mall(p)
  const seen = new Set()
  const grab = async () => (await p.evaluate(() => document.body.innerText)).split('\n').forEach((l) => seen.add(l.trim()))
  await grab(); await menu(p, 'Dela'); await sheet(p).waitFor(); await grab(); await sheet(p).locator('.modal-close').click()
  await openHall(p); await grab(); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(300); await grab()
  await p.goto(link); await p.locator('.share-actions').waitFor(); await grab()
  const banned = ['Helskär', 'Skriv ut kort', 'Ladda ner fil', 'Stationskort', 'Skicka till telefonen', 'Exportera / dela', 'QR', 'Inga teknikstationer i passet.', 'Sparad som egen mall på den här enheten.']
  const hits = [...seen].filter((l) => banned.some((b) => l.includes(b)))
  check('AC21-ui', 'no deleted label visible on Passbyggaren, Dela, Hallöversikt, Golvklart, Delat pass', hits.length === 0, hits.join('|'))
  await p.context().close()
})

check('no-page-errors', 'no page errors during the run', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-44-verify-results.json`, JSON.stringify({ when: new Date().toISOString(), branch: '800651e', main: '0d88da5', results, notes }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()

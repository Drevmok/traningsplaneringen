// Slice 45 «Hallar och städning» — Verifier formal run. Branch dea69d2 (plain :57841, bank :57840 → local stand-in
// via https://bank-mock.supabase.co), main 4fe44c0 (:57842). Headless Chrome 390×844 DPR 2 touch (+320, 844×390, 1280×800).
// PART env selects sections (default all). Writes slice-45-verify-results.json (merged per part), s45v_ screenshots.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s45v/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = process.env.BR ?? 'http://127.0.0.1:57841/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57842/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-45-screenshots-v/s45v_`, CK = `${ROOT}/verifier/slice-45-checks`, RES = `${ROOT}/verifier/slice-45-verify-results.json`
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const STORA = 'Gymmix – Stora hallen', GROP = 'Gymmix – Grophallen', LEGACY = ['standard-trupp', 'tavling-linjer', 'liten-hall', 'generic-trupp']
const PARTS = (process.env.PART ?? 'p1').split(',')
const prev = existsSync(RES) ? JSON.parse(readFileSync(RES, 'utf8')) : { results: [], notes: {} }
const results = prev.results.filter((r) => !PARTS.includes(r.part)), notes = prev.notes
let PART = ''
const check = (id, name, ok, detail = '') => { results.push({ part: PART, id, name, ok: !!ok, detail: String(detail).slice(0, 900) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 400) : ''}`) }
const note = (k, v) => { notes[k] = v }
const errors = []
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0] + ' @' + ((e.stack || '').match(/verify\.mjs:(\d+)/) || [])[1]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const PHONE = { width: 390, height: 844 }
async function page({ vp = PHONE, touch = true, print = 'webkit', perms = ['clipboard-read', 'clipboard-write'] } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, permissions: perms })
  await ctx.addInitScript((m) => { window.__prints = 0; window.print = () => { window.__prints++; if (m === 'dead') return; window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) } }, print)
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${p.url()} ${e.message}`)); return p
}
const shot = (p, n, full = false) => p.screenshot({ path: `${SS}${n}.png`, fullPage: full })
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left) } }, sel)
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const allStorage = (p) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])))
async function home(p, base = BR) { await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function mall(p, base = BR, name = /Nybörjare/) {
  await home(p, base)
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: name }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5800) // let the Slice 41 «Ångra» toast expire
}
async function menu(p, name) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  if (await mer.isVisible().catch(() => false)) { await mer.click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
  else await p.locator('button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().click()
}
async function hall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(600) }
async function back(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300) }
async function wizard(p, base, hallName) {
  await home(p, base); await p.getByRole('button', { name: 'Planera pass' }).click(); await p.locator('.home-wizard-sheet').waitFor()
  await p.getByRole('option').first().click(); await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(200)
  await p.getByRole('option', { name: 'Trampett' }).click(); await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(200)
  await p.getByRole('option', { name: hallName }).click(); await p.getByRole('button', { name: 'Skapa pass' }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800)
}
// markers on the screen hall: rank, title, centre, inside the open zone?
const markers = (p, root = '.hall-board') => p.evaluate((root) => {
  const cv = document.querySelector(`${root} .hall-canvas`); const rr = (sel) => [...(cv?.querySelectorAll(sel) ?? [])].map((e) => e.getBoundingClientRect())
  const walls = rr('.hall-plan--wall'), floor = rr('.hall-plan--floor')[0] ?? cv?.getBoundingClientRect(), inside = (b, x, y) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom
  return [...(cv?.querySelectorAll('.hall-chip') ?? [])].map((c) => { const r = c.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2
    return { rank: Number(c.querySelector('.hall-chip-rank')?.textContent?.trim()), title: (c.getAttribute('aria-label') ?? '').replace(/^Station \d+: /, '').split('.')[0], inOpen: !!floor && inside(floor, x, y) && !walls.some((w) => inside(w, x, y)) } })
}, root)
const canvasHall = (p, root = '.hall-board') => p.evaluate((root) => (document.querySelector(`${root} .hall-canvas`)?.className.match(/hall-canvas--(forening-[a-z]+)/) ?? [])[1] ?? (document.querySelector(`${root} .hall-canvas`)?.className ?? null), root)
const teknik = (d) => (d.blocks.find((b) => b.type === 'techniques')?.items ?? []).slice().sort((a, b) => a.order - b.order)
// everything except the hall fields (data-loss check)
const content = (d) => { const { hallTemplateId, hallPlacements, updatedAt, savedAt, ...rest } = d; return JSON.stringify(rest, Object.keys(rest).sort()) + JSON.stringify(d.blocks) }
const UNDER_GONE = ['Placerade övningar flyttas', 'Blå hall och Vit hall', 'Tips om placering', 'Stationsordning följer passet', 'Endast Teknik-stationer', 'Stationerna visas som markörer', 'Förslagen ligger redan', 'Släpp på en zon', 'Stationerna föreslås i zonen', 'Hallayout', 'Välj den layout', 'Stationerna är förslag']

// ───────────────────────────── PART p1: AC1–AC12 ─────────────────────────────
if (PARTS.includes('p1')) {
PART = 'p1'
let mainData = existsSync(`${CK}/main-data.json`) && !process.env.FRESH ? JSON.parse(readFileSync(`${CK}/main-data.json`, 'utf8')) : null
let gridRef = null

await attempt('main-data', async () => {
  if (mainData) return
  const p = await page(); await mall(p, MAIN)
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('S45V gammalt pass'); await p.waitForTimeout(300)
  await hall(p)
  const all = p.locator('button', { hasText: 'Använd alla förslag' }).first(); if (await all.count() && await all.isEnabled()) { await all.click(); await p.waitForTimeout(800) }
  const d = {}
  d.std = await draft(p)
  for (const id of ['tavling-linjer', 'liten-hall', 'forening-bla', 'forening-vit']) { await p.locator('#hall-layout-select').selectOption(id); await p.waitForTimeout(900); d[id] = await draft(p) }
  // Mina mall on Liten hall, made in the main UI
  await p.locator('#hall-layout-select').selectOption('liten-hall'); await p.waitForTimeout(800); await back(p)
  await menu(p, 'Spara som egen mall'); await p.locator('[role=dialog] input').first().fill('S45V mall liten hall'); await p.locator('[role=dialog]').getByRole('button', { name: /^Spara/ }).first().click(); await p.waitForTimeout(800)
  d.templates = await p.evaluate((k) => localStorage.getItem(k), TK)
  // old #dela= link made in the main UI on Standard trupp
  await hall(p); await p.locator('#hall-layout-select').selectOption('standard-trupp'); await p.waitForTimeout(900); d.linkDraft = await draft(p); await back(p)
  await menu(p, 'Dela'); await p.locator('.export-sheet').getByRole('button', { name: 'Kopiera länk' }).click(); await p.waitForTimeout(400)
  d.link = await p.evaluate(() => navigator.clipboard.readText())
  mainData = d; writeFileSync(`${CK}/main-data.json`, JSON.stringify(d, null, 1))
  await p.context().close()
})
note('main-data', { std: mainData?.std?.hallTemplateId, stdZones: [...new Set(mainData?.std?.hallPlacements?.map((x) => x.zoneId))], tav: mainData?.['tavling-linjer']?.hallTemplateId, tavZones: [...new Set(mainData?.['tavling-linjer']?.hallPlacements?.map((x) => x.zoneId))], liten: mainData?.['liten-hall']?.hallTemplateId, litenZones: [...new Set(mainData?.['liten-hall']?.hallPlacements?.map((x) => x.zoneId))], linkLen: mainData?.link?.length, linkHall: mainData?.linkDraft?.hallTemplateId, equip: teknik(mainData?.std ?? { blocks: [] }).map((i) => (i.stationEquipment ?? []).length) })

await attempt('AC1-AC3', async () => {
  const p = await page(); await home(p)
  await p.getByRole('button', { name: 'Planera pass' }).click(); await p.locator('.home-wizard-sheet').waitFor()
  await p.getByRole('option').first().click(); await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(250)
  const q2 = await p.locator('.home-wizard-sheet').innerText(); const q2title = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  await shot(p, '01_wizard_q2')
  await p.getByRole('option', { name: 'Trampett' }).click(); await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(250)
  const q3 = await p.locator('.home-wizard-sheet').innerText(); const q3title = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  const opts = (await p.getByRole('option').allInnerTexts()).map((s) => s.trim())
  await shot(p, '02_wizard_q3_hall')
  note('AC1', { q3title, opts, step: /Fråga 3 av 3/.test(q3) })
  check('AC1', 'Planera pass → Q3 titled «Hall», exactly two chips «Gymmix – Stora hallen», «Gymmix – Grophallen» (en dash)', q3title === 'Hall' && JSON.stringify(opts) === JSON.stringify([STORA, GROP]) && opts.every((o) => o.includes(' – ')), `${q3title} | ${opts.join(' | ')} | step3of3=${/Fråga 3 av 3/.test(q3)}`)
  const bad = (t) => /Stationerna är förslag|Välj den layout/.test(t)
  await p.getByRole('button', { name: 'Tillbaka' }).click(); await p.waitForTimeout(200); const backTitle = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  await p.getByRole('button', { name: 'Nästa' }).click(); await p.waitForTimeout(200); const fwdTitle = (await p.locator('.home-wizard-sheet h2').innerText()).trim()
  await p.getByRole('option', { name: GROP }).click(); await p.getByRole('button', { name: 'Skapa pass' }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800)
  const d = await draft(p)
  check('AC2', 'Q2 (Fokus) and Q3 have no «Stationerna är förslag…» / «Välj den layout…» line; Tillbaka / Nästa / Skapa pass work', !bad(q2) && !bad(q3) && q2title === 'Fokus' && backTitle === 'Fokus' && fwdTitle === 'Hall' && d?.hallTemplateId === 'forening-vit', `q2=${q2title} back=${backTitle} fwd=${fwdTitle} hall=${d?.hallTemplateId}`)
  await hall(p)
  const meta = (await p.locator('.hall-session-meta').first().innerText()).trim()
  const zones = await p.evaluate(() => [...document.querySelectorAll('.hall-board .hall-canvas .hall-zone')].map((z) => z.className.replace('hall-zone hall-zone--', '')))
  const cv = await rect(p, '.hall-board .hall-canvas')
  await shot(p, '03_hall_grophallen')
  await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500)
  const gmeta = (await p.locator('.hall-session-meta').first().innerText()).trim()
  await shot(p, '04_golvklart_grophallen')
  note('AC3', { meta, gmeta, zones, cv })
  check('AC3', 'Grophallen pass: Hallöversikt shows the Grophallen drawing and «Gymmix – Grophallen» in the meta line; Golvklart meta the same', meta.includes(GROP) && gmeta.includes(GROP) && !meta.includes(STORA), `meta=«${meta}» golvklart=«${gmeta}» zones=${zones.join(',')} ratio=${(cv.w / cv.h).toFixed(4)}`)
  await p.context().close()
})

await attempt('AC4', async () => {
  const out = {}
  const p = await page(); await home(p); await p.getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(500)
  // Tomt pass has no Teknik → Hallöversikt is the no-stations state; add one Teknik drill, then the hall shows its name
  const c = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) }).first()
  const inline = c.locator('.btn-add-inline'); if (await inline.count()) await inline.first().click(); else await c.getByRole('button', { name: 'Lägg till övning' }).first().click()
  await p.locator('input.search-input:visible').first().fill('Salto från höjd'); await p.waitForTimeout(400)
  await p.locator('.library-entry .activity-card').filter({ hasText: 'Salto från höjd' }).first().click()
  await p.getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(600)
  await hall(p); out.tomt = { hall: (await draft(p))?.hallTemplateId, meta: (await p.locator('.hall-session-meta').first().innerText()).trim(), drawing: await canvasHall(p), markers: await markers(p) }; await p.context().close()
  const q = await page(); await mall(q); await hall(q)
  const m = await markers(q); const d = await draft(q); const t = teknik(d)
  out.mall = { hall: d.hallTemplateId, meta: (await q.locator('.hall-session-meta').first().innerText()).trim(), markers: m, teknik: t.map((i) => i.id), placed: d.hallPlacements.map((x) => [x.sessionItemId, x.zoneId, +x.x.toFixed(3), +x.y.toFixed(3)]) }
  gridRef = d.hallPlacements
  await shot(q, '05_hall_stora_nyborjare')
  const orderOk = m.length === t.length && m.every((x, i) => x.rank === i + 1) && t.every((it, i) => d.hallPlacements.find((pl) => pl.sessionItemId === it.id))
  // pass order on the grid: placement of rank k precedes rank k+1 in grid (row-major) order
  const pos = t.map((it) => d.hallPlacements.find((pl) => pl.sessionItemId === it.id))
  const gridOrder = pos.every((pl, i) => i === 0 || (pl.y > pos[i - 1].y + 1e-6) || (Math.abs(pl.y - pos[i - 1].y) < 1e-6 && pl.x > pos[i - 1].x))
  note('AC4', out)
  check('AC4', 'Tomt pass and Från mall → Nybörjare start on «Gymmix – Stora hallen»; Teknik markers auto-placed on the fixed grid (open zone) in pass order', out.tomt.hall === 'forening-bla' && out.tomt.meta.includes(STORA) && out.tomt.drawing === 'forening-bla' && out.tomt.markers.length === 1 && out.tomt.markers[0].inOpen && d.hallTemplateId === 'forening-bla' && out.mall.meta.includes(STORA) && orderOk && m.every((x) => x.inOpen) && d.hallPlacements.every((x) => x.zoneId === 'open'), `tomt=${out.tomt.hall} «${out.tomt.meta.replace(/\n/g, ' · ')}» drawing=${out.tomt.drawing} mall=${d.hallTemplateId} markers=${m.map((x) => x.rank + ':' + x.title + (x.inOpen ? '' : '!wall')).join(' ')} gridRowMajor=${gridOrder}`)
  await q.context().close()
})

await attempt('AC5', async () => {
  // canvas top / bottom, banner, zoom buttons, select — branch vs main, scenarios
  const meas = async (p) => p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), w: Math.round(b.width), h: Math.round(b.height) } }
    const zoom = [...document.querySelectorAll('button')].filter((b) => /^Zooma (ut|in)$/.test(b.getAttribute('aria-label') ?? '')).map((b) => { const x = b.getBoundingClientRect(); return [b.getAttribute('aria-label'), Math.round(x.width), Math.round(x.height)] })
    return { canvas: r('.hall-board .hall-canvas'), banner: !!document.querySelector('.hall-saknar-banner'), select: !!document.querySelector('#hall-layout-select'), label: [...document.querySelectorAll('label,span,p')].some((e) => e.textContent.trim() === 'Hallayout'), zoom, title: r('.hall-header h1, .hall-header h2, .hall-session-title'), meta: r('.hall-session-meta'), sw: document.documentElement.scrollWidth } })
  const LONG = 'Nybörjare tisdag — trampett, hjul och rondat för de yngsta'
  const res = {}
  for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
    for (const vp of [PHONE, { width: 320, height: 844 }]) {
      const w = vp.width; const k = (s) => `${tag}-${w}-${s}`
      // S1 Från mall Nybörjare (banner: stations without redskap)
      let p = await page({ vp }); await mall(p, base); await hall(p); res[k('mall-banner')] = await meas(p)
      if (tag === 'br' && w === 390) await shot(p, '06_hall_banner_390')
      // S2 same after «Använd alla förslag» → no banner
      const all = p.locator('button', { hasText: 'Använd alla förslag' }).first(); if (await all.count() && await all.isEnabled()) { await all.click(); await p.waitForTimeout(800) }
      res[k('mall-nobanner')] = await meas(p)
      if (tag === 'br' && w === 390) await shot(p, '07_hall_nobanner_390')
      // S3 long (2-line) title, no banner
      await back(p); await p.getByRole('textbox', { name: 'Passets titel' }).fill(LONG); await p.waitForTimeout(300); await hall(p); res[k('long-nobanner')] = await meas(p)
      if (tag === 'br' && w === 390) await shot(p, '08_hall_longtitle_390')
      if (w === 320 && tag === 'br') await shot(p, '09_hall_320')
      // S4 Grophallen / Vit, banner and not
      await p.context().close(); p = await page({ vp }); await wizard(p, base, tag === 'br' ? GROP : 'Vit hall'); await hall(p)
      res[k('vit')] = await meas(p)
      if (tag === 'br' && w === 390) await shot(p, '09b_hall_grophallen_banner_390')
      const all2 = p.locator('button', { hasText: 'Använd alla förslag' }).first(); if (await all2.count() && await all2.isEnabled()) { await all2.click(); await p.waitForTimeout(800) }
      res[k('vit-nobanner')] = await meas(p)
      await p.context().close()
      p = await page({ vp }); await wizard(p, base, tag === 'br' ? STORA : 'Blå hall'); await hall(p); res[k('wiz-bla')] = await meas(p)
      const all3 = p.locator('button', { hasText: 'Använd alla förslag' }).first(); if (await all3.count() && await all3.isEnabled()) { await all3.click(); await p.waitForTimeout(800) }
      res[k('wiz-bla-nobanner')] = await meas(p); res[k('wiz-bla-nobanner')].metaLines = await p.evaluate(() => { const m = document.querySelector('.hall-session-meta'); return m ? Math.round(m.getBoundingClientRect().height) : null })
      await p.context().close()
    }
  }
  note('AC5', res)
  const br = res['br-390-mall-banner'], brNo = res['br-390-mall-nobanner']
  const z = br.zoom; const zoomOk = z.length === 2 && z.every((x) => x[1] >= 44 && x[2] >= 44)
  const noLower = Object.keys(res).filter((k) => k.startsWith('br-')).every((k) => { const m = res[k.replace('br-', 'main-')]; return !m || res[k].canvas.top <= m.canvas.top })
  const fold = Object.keys(res).filter((k) => k.startsWith('br-390')).map((k) => `${k.slice(7)} ${res[k].canvas.top}–${res[k].canvas.bottom}${res[k].banner ? ' (banner)' : ''} | main ${res[k.replace('br-', 'main-')]?.canvas.top}–${res[k.replace('br-', 'main-')]?.canvas.bottom}`).join('; ')
  check('AC5-controls', 'Hallöversikt has no «Hallayout» label and no layout select; zoom − / + present and ≥ 44×44 (390 and 320)', !br.select && !br.label && !res['br-320-mall-banner'].select && zoomOk && res['br-320-mall-banner'].zoom.every((x) => x[1] >= 44 && x[2] >= 44), JSON.stringify({ zoom: z, z320: res['br-320-mall-banner'].zoom }))
  check('AC5-top310', 'hall canvas top ≤ 310 (checklist text) — every branch scenario at 390', Object.keys(res).filter((k) => k.startsWith('br-390')).every((k) => res[k].canvas.top <= 310), fold)
  check('AC5-notlower', 'hall canvas top not lower than main in every scenario (390 and 320, banner / no banner / 2-line title / Grophallen)', noLower, fold)
  check('AC5-320', '320 px: no horizontal scroll on Hallöversikt', Object.keys(res).filter((k) => k.startsWith('br-320')).every((k) => res[k].sw <= 320), Object.keys(res).filter((k) => k.startsWith('br-320')).map((k) => `${k} sw=${res[k].sw} top=${res[k].canvas.top}`).join('; '))
  check('AC5-fold', 'fold 739 at 390×844: Stora hallen canvas bottom ≤ 739 without banner (info; Slice 43 rule)', true, Object.keys(res).filter((k) => k.startsWith('br-390') || k.startsWith('main-390')).map((k) => `${k}:${res[k].canvas.bottom}`).join(' '))
})

await attempt('AC6-AC7', async () => {
  const p = await page(); await mall(p); await hall(p)
  const below = ((await p.locator('.hall-schematic-note').allInnerTexts()).join('\n') + '\n' + (await p.locator('.hall-below').innerText())).trim()
  const body = await p.locator('body').innerText()
  const gone = UNDER_GONE.filter((s) => body.includes(s))
  const lines = below.split('\n').map((s) => s.trim()).filter(Boolean)
  note('AC6', { lines })
  await shot(p, '10_hall_below', true)
  const tipX = p.locator('.hall-below button').filter({ hasText: 'Dölj tips' })
  const hasCap = lines.includes('Schematisk hall — inte exakt mått'), hasFlow = lines.some((l) => l.startsWith('Siffrorna följer'))
  let after = null; if (await tipX.count()) { await tipX.first().click(); await p.waitForTimeout(400); after = ((await p.locator('.hall-schematic-note').allInnerTexts()).join('\n') + '\n' + (await p.locator('.hall-below').innerText())).trim().split('\n').map((s) => s.trim()).filter(Boolean) }
  check('AC6', 'under the hall only «Schematisk hall — inte exakt mått» + the flow tip (until dismissed); no migrate note, Blå/Vit tip, «Tips om placering», multi-line hints', hasCap && hasFlow && gone.length === 0 && lines.filter((l) => l !== 'Schematisk hall — inte exakt mått' && !l.startsWith('Siffrorna följer') && !/Dölj tips/.test(l) && l !== '×').length === 0 && JSON.stringify(after) === JSON.stringify(['Schematisk hall — inte exakt mått']), JSON.stringify({ lines, gone, after }))
  // AC7 tray: remove station 2 → tray, expand, hints, Placera här, collapse
  const chip2 = p.locator('.hall-board .hall-canvas .hall-chip').filter({ has: p.locator('.hall-chip-rank', { hasText: /^2$/ }) }).first()
  let rm = chip2.locator('.hall-chip-remove'); if (!(await rm.isVisible().catch(() => false))) { await chip2.click(); await p.waitForTimeout(300); for (let j = 0; j < 2 && (await p.locator('[role=dialog]').count()); j++) { await p.locator('[role=dialog] .modal-close').first().click().catch(() => {}); await p.waitForTimeout(250) } }
  await rm.evaluate((x) => x.scrollIntoView({ block: 'center' })); await rm.click(); await p.waitForTimeout(500)
  const m1 = await markers(p)
  const expand = p.locator('.hall-tray-toggle[aria-expanded=false]'); const hadCompact = await expand.count(); if (hadCompact) { await expand.first().click(); await p.waitForTimeout(300) }
  const tray = (await p.locator('.hall-tray').innerText()).trim()
  await shot(p, '11_tray_expanded')
  const trayGone = ['Dra', 'Släpp', 'fäster', 'Stationerna föreslås i zonen'].filter((s) => tray.includes(s))
  await p.locator('.hall-tray-list .hall-chip').first().click(); await p.waitForTimeout(300)
  const placeLbl = await p.locator('.hall-place-here-label, .hall-tray').filter({ hasText: 'Placera här' }).count()
  const cv = p.locator('.hall-board .hall-canvas').first(); await cv.evaluate((x) => x.scrollIntoView({ block: 'center' })); const bb = await cv.boundingBox()
  await p.mouse.click(bb.x + bb.width * 0.3, bb.y + bb.height * 0.6); await p.waitForTimeout(500)
  const m2 = await markers(p)
  const col = p.locator('.hall-tray-toggle[aria-expanded=true]'); const canCollapse = await col.count(); if (canCollapse) { await col.first().click(); await p.waitForTimeout(300) }
  const collapsed = await p.locator('.hall-tray--compact').count()
  note('AC7', { tray, trayGone, m1: m1.length, m2: m2.length, placeLbl, hadCompact, canCollapse, collapsed })
  check('AC7', 'expanded tray: no drag/snap hint lines, no «Stationerna föreslås i zonen…»; remove, expand, Placera här, collapse work', trayGone.length === 0 && m1.length === 2 && m2.length === 3 && placeLbl > 0 && collapsed > 0, JSON.stringify({ trayText: tray.slice(0, 200), trayGone, removedTo: m1.length, placedBackTo: m2.length, placeLbl, collapsed }))
  await p.context().close()
  // drag on desktop (mouse): move marker 1, placement changes and stays in the open zone
  const q = await page({ vp: { width: 1280, height: 800 }, touch: false }); await mall(q); await hall(q)
  const before = (await draft(q)).hallPlacements.map((x) => ({ ...x }))
  const c1 = q.locator('.hall-board .hall-canvas .hall-chip').first(); const b1 = await c1.boundingBox()
  await q.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await q.mouse.down(); await q.mouse.move(b1.x + b1.width / 2 + 60, b1.y + b1.height / 2 + 40, { steps: 8 }); await q.mouse.up(); await q.waitForTimeout(800)
  for (let j = 0; j < 2 && (await q.locator('[role=dialog]').count()); j++) { await q.locator('[role=dialog] .modal-close').first().click().catch(() => {}); await q.waitForTimeout(250) }
  const afterD = (await draft(q)).hallPlacements
  const moved = afterD.filter((a) => { const bf = before.find((x) => x.sessionItemId === a.sessionItemId); return bf && (Math.abs(bf.x - a.x) > 0.01 || Math.abs(bf.y - a.y) > 0.01) })
  check('AC7-drag', 'desktop drag of a marker moves it (placement saved), as Slice 20/21/40', moved.length === 1, JSON.stringify(moved))
  await q.context().close()
})

// legacy drafts from main → branch
async function openDraft(p, json) { await p.goto(BR); await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v) }, [DK, JSON.stringify(json)]); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800) }
await attempt('AC8-AC9', async () => {
  const cases = [['standard-trupp', mainData.std], ['tavling-linjer', mainData['tavling-linjer']], ['liten-hall', mainData['liten-hall']], ['generic-trupp', { ...mainData.std, hallTemplateId: 'generic-trupp' }], ['no-id', (({ hallTemplateId, ...r }) => r)(mainData.std)]]
  const out = {}
  for (const [name, src] of cases) {
    const p = await page(); await openDraft(p, src)
    await p.waitForTimeout(1500); const d0 = await draft(p) // stored right after open + 1.5 s idle (before Hallöversikt)
    await hall(p); const m = await markers(p); const meta = (await p.locator('.hall-session-meta').first().innerText()).trim()
    if (name === 'standard-trupp') await shot(p, '12_legacy_standard_on_stora')
    await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(500)
    const d1 = await draft(p); const store = JSON.stringify(await allStorage(p))
    const t = teknik(d1)
    const legacyLeft = LEGACY.filter((id) => store.includes(`"${id}"`) || store.includes(`\\"${id}\\"`))
    const sameAsGrid = gridRef && t.every((it, i) => { const a = d1.hallPlacements.find((x) => x.sessionItemId === it.id), g = gridRef[i]; return a && g && Math.abs(a.x - g.x) < 1e-6 && Math.abs(a.y - g.y) < 1e-6 })
    out[name] = { srcHall: src.hallTemplateId ?? null, srcZones: [...new Set((src.hallPlacements ?? []).map((x) => x.zoneId))], storedAtOpen: d0?.hallTemplateId, stored: d1.hallTemplateId, meta, markers: m.map((x) => `${x.rank}:${x.title}${x.inOpen ? '' : '!WALL'}`), zones: [...new Set(d1.hallPlacements.map((x) => x.zoneId))], sameAsGrid, contentSame: content(d1) === content(src), legacyLeft, idSame: d1.id === src.id, title: d1.title }
    out[name].canvas = await canvasHall(p); check(name === 'standard-trupp' ? 'AC8' : `AC9-${name}`, `legacy draft ${name} → opens, «${STORA}», markers on the open grid in pass order, nothing on walls, draft stores forening-bla, pass content unchanged`, d1.hallTemplateId === 'forening-bla' && meta.includes(STORA) && m.length === t.length && m.every((x, i) => x.rank === i + 1 && x.inOpen) && out[name].zones.join() === 'open' && sameAsGrid && out[name].contentSame && legacyLeft.length === 0 && out[name].idSame, JSON.stringify(out[name]))
    await p.context().close()
  }
  note('AC8-AC9', out)
})

await attempt('AC10', async () => {
  const p = await page(); await home(p); await p.goto('about:blank'); await p.goto(mainData.link.replace(MAIN, BR)); await p.locator('.share-actions').waitFor(); await p.waitForTimeout(600)
  const view = await p.evaluate(() => ({ meta: [...document.querySelectorAll('.hall-session-meta, .share-pass .hall-preset-readonly, .share-hall-name')].map((e) => e.textContent.trim()), chips: document.querySelectorAll('.hall-canvas .hall-chip').length, text: document.body.innerText }))
  view.hall = await canvasHall(p, 'body'); view.m = await markers(p, 'body'); await shot(p, '13_old_link_delat_pass', true)
  await p.getByRole('button', { name: 'Spara på den här enheten' }).click(); await p.waitForTimeout(1200)
  const d = await draft(p); const store = JSON.stringify(await allStorage(p))
  const t = teknik(d)
  note('AC10', { meta: view.meta, chips: view.chips, stora: view.text.includes(STORA), stored: d?.hallTemplateId, place: d?.hallPlacements?.length, title: d?.title })
  check('AC10', 'old #dela= link made on main (Standard trupp): Delat pass shows Stora hallen with markers; «Spara på den här enheten» stores forening-bla; pass content as on main', view.hall === 'forening-bla' && view.m.every((x, i) => x.rank === i + 1 && x.inOpen) && view.chips === t.length && t.length > 0 && d.hallTemplateId === 'forening-bla' && !LEGACY.some((id) => store.includes(id)) && d.title === mainData.linkDraft.title && JSON.stringify(teknik(d).map((i) => [i.activityId, i.durationMinutes, i.stationEquipment ?? null])) === JSON.stringify(teknik(mainData.linkDraft).map((i) => [i.activityId, i.durationMinutes, i.stationEquipment ?? null])), JSON.stringify({ drawing: view.hall, markers: view.m, chips: view.chips, nameShown: view.text.includes(STORA), stored: d?.hallTemplateId, title: d?.title }))
  await p.context().close()
})

await attempt('AC11', async () => {
  // Mina mall saved in main's UI on Liten hall → branch Använd mall
  const p = await page(); await p.goto(BR); await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v) }, [TK, mainData.templates]); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
  const card = p.locator('.template-saved .template-card, .template-card').filter({ hasText: 'S45V mall liten hall' }).first(); const seen = await card.count()
  await card.click(); await p.waitForTimeout(400); const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5800); await hall(p)
  const m = await markers(p); const d = await draft(p); const meta = (await p.locator('.hall-session-meta').first().innerText()).trim(); const tpls = await p.evaluate((k) => localStorage.getItem(k), TK)
  await shot(p, '14_mina_mall_liten_on_stora')
  note('AC11-mina', { seen, hall: d.hallTemplateId, meta, markers: m.length, tplStillThere: tpls.includes('S45V mall liten hall'), tplHalls: [...new Set((tpls.match(/"hallTemplateId":"[a-z-]+"/g) ?? []))] })
  check('AC11-mina', 'Mina mall saved on main with Liten hall: Använd mall gives a Stora hallen pass with markers; the saved mall itself is kept', seen && d.hallTemplateId === 'forening-bla' && meta.includes(STORA) && m.length === teknik(d).length && m.every((x, i) => x.rank === i + 1 && x.inOpen) && tpls.includes('S45V mall liten hall'), JSON.stringify(notes['AC11-mina']))
  await p.context().close()
  // föreningens mall: unit test present and passing
  const ut = execFileSync('bash', ['-c', `cd ${ROOT}/app && bun test src/lib/hallLegacy.test.ts 2>&1; true`], { encoding: 'utf8' })
  const club = execFileSync('bash', ['-c', `cd ${ROOT}/app && grep -n -i "förening\\|club" src/lib/hallLegacy.test.ts | head -5; true`], { encoding: 'utf8' })
  check('AC11-club-unit', 'föreningens mall on a generic hall: unit test exists and passes (UI path PENDING-real / stand-in)', /\b0 fail/.test(ut) && /pass/.test(ut), (ut.match(/\d+ pass|\d+ fail/g) ?? []).join(' ') + ' | ' + club.replace(/\n/g, ' ¶ ').slice(0, 300))
})

await attempt('AC12', async () => {
  const out = {}
  for (const id of ['forening-bla', 'forening-vit']) {
    const src = JSON.parse(JSON.stringify(mainData[id]))
    // a coach-moved marker: put station 1 at a custom spot in the open zone
    src.hallPlacements[0] = { ...src.hallPlacements[0], x: 0.2137, y: 0.4242 }
    const p = await page(); await openDraft(p, src); await hall(p); await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(500)
    const d = await draft(p)
    const same = JSON.stringify(d.hallPlacements) === JSON.stringify(src.hallPlacements)
    out[id] = { same, hall: d.hallTemplateId, n: d.hallPlacements.length, contentSame: content(d) === content(src), p0: d.hallPlacements[0] }
    check(`AC12-${id}`, `pass on ${id} (made on main, one marker moved by hand) keeps its exact placements and ids after open + Hallöversikt + reload`, same && d.hallTemplateId === id && out[id].contentSame, JSON.stringify(out[id]))
    await p.context().close()
  }
  note('AC12', out)
})
}

writeFileSync(RES, JSON.stringify({ when: new Date().toISOString(), branch: 'dea69d2', main: '4fe44c0', results, notes, errors }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass · page errors ${errors.length}`)
await browser.close()

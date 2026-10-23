// Slice 48 «Hallöversikt» — Verifier formal run. Branch f523774 vs main e605b3f. Criteria slice-48-docs @ 29ef308 (AC1–36).
// Previews: branch plain :57880, main plain :57882, branch bank :57881, main bank :57883 (bank builds use https://bank-mock.supabase.co,
// routed to MY stand-in gateway :57870; nothing live). PW_CORE = recording shim. 390×844 DPR 2 touch (+320, 844×390, 1280×800). PART/ONLY select.
// Headless Chrome 390×844 DPR 2 touch (+320, 844×390, 1280×800). PART env selects sections; ONLY= single checks.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s48v/pwshim/index.mjs')
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = 'http://127.0.0.1:57880/traningsplaneringen/', MAIN = 'http://127.0.0.1:57882/traningsplaneringen/'
const BRB = 'http://127.0.0.1:57881/traningsplaneringen/', MAINB = 'http://127.0.0.1:57883/traningsplaneringen/'
const GW = 'http://127.0.0.1:57870', S32 = process.env.S32_DIR ?? '/workspace/s48v/sb'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-48-screenshots/s48v_`, CK = `${ROOT}/verifier/slice-48-checks`, RES = `${ROOT}/verifier/slice-48-verify-results.json`
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const STORA = 'Gymmix – Stora hallen', GROP = 'Gymmix – Grophallen', NOTE = 'Passen sparas bara på den här enheten.'
const PARTS = (process.env.PART ?? 'p1').split(',')
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const prev = existsSync(RES) ? JSON.parse(readFileSync(RES, 'utf8')) : { results: [], notes: {} }
const results = prev.results.filter((r) => !PARTS.includes(r.part) || (ONLY && !ONLY.some((o) => r.id.startsWith(o)))), notes = prev.notes
let PART = ''
const check = (id, name, ok, detail = '') => { results.push({ part: PART, id, name, ok: !!ok, detail: String(detail).slice(0, 1200) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 500) : ''}`) }
const note = (k, v) => { notes[k] = v }
const errors = []
async function attempt(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0] + ' @' + ((e.stack || '').match(/verify\.mjs:(\d+)/) || [])[1]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const PHONE = { width: 390, height: 844 }
const live = []
async function page({ vp = PHONE, touch = true, bank = false } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, permissions: ['clipboard-read', 'clipboard-write'] })
  await ctx.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) }; window.__mailto = []; document.addEventListener('click', (e) => { const a = e.target.closest?.('a[href^="mailto:"]'); if (a) { window.__mailto.push(a.href); e.preventDefault() } }, true) })
  ctx.on('request', (q) => { if (/supabase\.co/.test(q.url()) && !q.url().startsWith('https://bank-mock.supabase.co')) live.push(q.url()) })
  await ctx.route('https://bank-mock.supabase.co/**', async (route) => { if (!bank) return route.abort(); const req = route.request(); const u = new URL(req.url()); const headers = { ...req.headers() }; delete headers.host
    try { const resp = await route.fetch({ url: GW + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined, maxRedirects: 0 }); return route.fulfill({ response: resp }) } catch { return route.abort('failed').catch(() => {}) } })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${p.url()} ${e.message}`)); return p
}
const shot = (p, n, full = false) => p.screenshot({ path: `${SS}${n}.png`, fullPage: full })
const rect = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) } }, sel)
const draftRaw = (p) => p.evaluate((k) => localStorage.getItem(k), DK)
const draft = async (p) => JSON.parse((await draftRaw(p)) || 'null')
const mallar = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const allStorage = (p) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])))
const docH = (p) => p.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))
const docW = (p) => p.evaluate(() => document.documentElement.scrollWidth)
async function home(p, base = BR, ls = {}) { await p.goto(base); await p.evaluate((ls) => { localStorage.clear(); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v) }, ls); await p.reload(); await p.locator('.home').waitFor(); await p.waitForTimeout(300) }
const sheet = (p) => p.locator('.home-wizard-sheet')
const heading = async (p) => (await sheet(p).locator('h2').innerText()).trim()
const progress = async (p) => ((await sheet(p).locator('.home-wizard-progress').innerText().catch(() => '')) || '').trim()
const opt = (p, name) => sheet(p).getByRole('option', { name, exact: true })
async function tap(p, name) { await opt(p, name).click(); await p.waitForTimeout(500) }
async function openPlan(p) { await p.getByRole('button', { name: 'Planera pass', exact: true }).click(); await sheet(p).waitFor(); await p.waitForTimeout(250) }
const cancel = (p) => sheet(p).locator('.home-wizard-cancel')
const backBtn = (p) => sheet(p).locator('.home-wizard-actions .btn-secondary')
const selected = (p) => sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option][aria-selected=true]')].map((e) => e.textContent.trim()))
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}.${a.className}:${(a.textContent || '').trim().slice(0, 30)}` : '' })
const items = (d) => d.blocks.flatMap((b) => b.items)
const teknik = (d) => (d.blocks.find((b) => b.type === 'techniques')?.items ?? []).slice().sort((a, b) => a.order - b.order)
async function wizard(p, { age = '7–9 år', focus = 'Trampett', hall = GROP, len = '90 min' } = {}) { await openPlan(p); await tap(p, age); await tap(p, focus); await tap(p, hall); await opt(p, len).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(900) }
async function closeOverlays(p) { for (let i = 0; i < 3; i++) { const c = p.locator('.modal-close:visible, [role=dialog] .sheet-close:visible, [role=dialog] button:visible:text-is("Stäng"), .modal button:visible:text-is("Stäng"), .side-panel-slot.is-open .sheet-close:visible'); if (!(await c.count())) break; await c.first().click().catch(() => {}); await p.waitForTimeout(250) } }
async function menu(p, name) { const tag = async (t, f) => { try { return await f() } catch (e) { const top = await p.evaluate((nm) => { const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent && (x.getAttribute('aria-label') === 'Fler saker med passet' || x.innerText.trim() === nm)); if (!b) return 'nobtn'; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return `${Math.round(r.top)},${Math.round(r.left)} ${innerWidth}x${innerHeight} top=${e?.tagName}.${(e?.className || '').toString().slice(0, 60)} in=${e?.closest('[class]')?.parentElement?.className?.toString().slice(0, 40)}` }, name).catch((x) => 'eval ' + x.message); throw new Error(`menu(${name}) ${t} [${top}]: ` + String(e.message).split('\n')[0] + ' | visible: ' + (await p.locator('button:visible').allInnerTexts().catch(() => [])).map((x) => x.trim()).filter(Boolean).slice(0, 20).join('|')) } }
  const mer = p.getByRole('button', { name: 'Fler saker med passet' }); if (await mer.isVisible().catch(() => false)) { await tag('mer', () => mer.click()); await p.waitForTimeout(250); const it = p.locator('.more-menu-panel').getByRole('button', { name, exact: true }); if (await it.count()) { await tag('item', () => it.click()); return } await p.locator('.more-backdrop').click().catch(() => {}); await p.waitForTimeout(200) }
  const fb = p.locator('button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first(); await tag('fallback', () => fb.click()) }
async function hall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
async function toHome(p) { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor(); await p.waitForTimeout(300) }
const markers = (p) => p.evaluate(() => { const cv = document.querySelector('.hall-canvas'); const rr = (sel) => [...(cv?.querySelectorAll(sel) ?? [])].map((e) => e.getBoundingClientRect()); const walls = rr('.hall-plan--wall'), floor = rr('.hall-plan--floor')[0] ?? cv?.getBoundingClientRect(), inside = (b, x, y) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; return [...(cv?.querySelectorAll('.hall-chip') ?? [])].map((c) => { const r = c.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; return { rank: Number(c.querySelector('.hall-chip-rank')?.textContent?.trim()), inOpen: !!floor && inside(floor, x, y) && !walls.some((w) => inside(w, x, y)) } }) })
const canvasHall = (p) => p.evaluate(() => (document.querySelector('.hall-canvas')?.className.match(/hall-canvas--(forening-[a-z]+)/) || [])[1] ?? null)
const lengthText = (p) => p.evaluate(() => (document.querySelector('.builder')?.innerText.match(/\d+ \//) || [''])[0])
const lenSel = (p) => p.evaluate(() => [...document.querySelectorAll('.builder [aria-pressed=true], .builder [aria-checked=true]')].map((e) => e.textContent.trim()).join('|'))
const card = (p, h) => p.locator('.block-card').filter({ has: p.locator('h3', { hasText: new RegExp(`^${h}$`) }) }).first()
// ---------- Slice 48 helpers ----------
const rowsL = (p) => p.locator('.hall-station-rows > li')
const techIds = async (p) => teknik(await draft(p)).map((i) => i.id)
const plc = async (p) => Object.fromEntries(((await draft(p)).hallPlacements ?? []).map((x) => [x.sessionItemId, `${x.x},${x.y},${x.zoneId ?? ''}`]))
const listNames = (p) => p.locator('.hall-station-name').allInnerTexts().then((a) => a.map((s) => s.trim()))
const listRanks = (p) => p.locator('.hall-station-rank').allInnerTexts().then((a) => a.map((s) => s.trim()))
const chipLabels = (p) => p.locator('.hall-chip--canvas').evaluateAll((es) => es.map((e) => e.getAttribute('aria-label')).sort())
const builderTeknik = (p) => p.evaluate(() => { const c = [...document.querySelectorAll('.block-card')].find((b) => b.querySelector('h3')?.textContent.trim() === 'Teknik'); return c ? [...c.querySelectorAll('.item-title, .session-item-title, h4')].map((e) => e.textContent.trim()).filter(Boolean) : null })
const center = async (loc) => { const r = await loc.boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }
async function touchDrag(p, from, to, steps = 10, mid = null) {
  const s = await p.context().newCDPSession(p); const pt = (x, y) => [{ x, y, id: 1 }]
  await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  for (let i = 1; i <= steps; i++) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await p.waitForTimeout(16); if (mid && i === steps) await mid() }
  await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(350)
}
async function mouseDrag(p, from, to, mid = null) { await p.mouse.move(from.x, from.y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(from.x + (to.x - from.x) * i / 10, from.y + (to.y - from.y) * i / 10); await p.waitForTimeout(16) } if (mid) await mid(); await p.mouse.up(); await p.waitForTimeout(350) }
async function tapAt(p, c) { const s = await p.context().newCDPSession(p); await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await p.waitForTimeout(60); await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(400) }
async function prep(p, { base = BR, hallName = STORA } = {}) { await home(p, base); await wizard(p, { hall: hallName, len: '60 min' }) }
async function editOn(p) { const t = p.locator('.hall-stations-toggle'); if ((await t.innerText()).trim() !== 'Klar') await t.click(); await p.waitForTimeout(250) }
const back = (p) => p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first()
const toastNow = (p) => p.locator('.toast').first().innerText().then((s) => s.replace(/\s+/g, ' ').trim()).catch(() => '')
const snapshotState = async (p) => { const d = await draft(p); return JSON.stringify({ t: teknik(d).map((i) => [i.id, i.activityId, i.order, i.durationMinutes]), pl: (d.hallPlacements ?? []).slice().sort((a, b) => a.sessionItemId.localeCompare(b.sessionItemId)) }) }

if (PARTS.includes('p1')) { PART = 'p1'
  // A — row
  await attempt('AC1', async () => {
    const p = await page(); await prep(p)
    const b = await p.evaluate(() => ['Kör passet', 'Hallöversikt', 'Mer'].map((t) => { const e = [...document.querySelectorAll('.builder button')].find((x) => x.offsetParent && x.innerText.trim() === t); if (!e) return null; const r = e.getBoundingClientRect(); return { t, top: Math.round(r.top), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right), clip: e.scrollWidth > e.clientWidth + 1 } }))
    check('AC1', '«Kör passet», «Hallöversikt», «Mer» on one row, ≥44 px, no clipped text, in that order', b.every(Boolean) && new Set(b.map((x) => x.top)).size === 1 && b.every((x) => x.h >= 44 && !x.clip && x.r <= 390) && b[0].l < b[1].l && b[1].l < b[2].l, JSON.stringify(b))
    await shot(p, '01_builder_row_390')
    await p.locator('.builder-hall').click(); await p.locator('.hall-board').waitFor()
    const ok1 = await p.locator('.hall-canvas').isVisible(); await back(p).click(); await p.locator('.builder').waitFor()
    check('AC2', 'one tap «Hallöversikt» opens the hall; «Tillbaka till Passbyggaren» returns', ok1 && await p.locator('.builder').isVisible())
    await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.waitForTimeout(300)
    const mer = (await p.locator('.more-menu-panel button:visible').allInnerTexts()).map((s) => s.trim())
    check('AC3', '«Mer» has no «Hallöversikt»', mer.length > 0 && !mer.includes('Hallöversikt'), mer.join('|'))
    await shot(p, '02_mer_390'); await p.context().close()
  })
  await attempt('AC4', async () => {
    const p = await page(); await prep(p)
    // empty pass: remove all items in every block
    for (let i = 0; i < 60; i++) { const x = p.locator('.item-remove:visible').first(); if (!(await x.count())) break; await x.click(); await p.waitForTimeout(120) }
    await p.waitForTimeout(1500); const n = items(await draft(p)).length + (await p.locator('.item-remove:visible').count())
    const st = await p.locator('.builder-hall').evaluate((e) => ({ dis: e.disabled || e.getAttribute('aria-disabled') === 'true', db: e.getAttribute('aria-describedby'), vis: !!e.offsetParent }))
    const hint = st.db ? await p.evaluate((ids) => ids.split(' ').map((i) => document.getElementById(i)?.textContent.trim()).join(' '), st.db) : ''
    const hintCls = await p.locator('#hall-cta-hint').count()
    check('AC4', 'empty pass: «Hallöversikt» disabled with an announced explanation (hall-cta-hint)', n === 0 && st.vis && st.dis && hint.length > 5 && hintCls > 0, `items=${n} ${JSON.stringify(st)} hint=«${hint}» hintEls=${hintCls}`)
    await shot(p, '03_empty_disabled_390'); await p.context().close()
  })
  // B — edit mode
  await attempt('AC6', async () => {
    const p = await page(); await prep(p); await hall(p)
    const tog = p.locator('.hall-stations-toggle'); const t0 = (await tog.innerText()).trim()
    await tog.click(); await p.waitForTimeout(250)
    const n = await rowsL(p).count(), tk = (await techIds(p)).length, title = await p.locator('.hall-station-list-title').innerText().catch(() => '')
    check('AC6', '«Ändra stationer» → «Stationer i ordning», one row per Teknik station, button «Klar»', t0 === 'Ändra stationer' && /Stationer i ordning/.test(title) && n === tk && n >= 3 && (await tog.innerText()).trim() === 'Klar', `rows=${n} teknik=${tk}`)
    const r = await p.evaluate(() => [...document.querySelectorAll('.hall-station-rows > li')].map((li) => ({ rank: li.querySelector('.hall-station-rank')?.textContent.trim(), name: li.querySelector('.hall-station-name')?.textContent.trim(), handle: (() => { const h = li.querySelector('.hall-station-handle'); if (!h) return null; const r = h.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })(), btns: [...li.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); return [b.getAttribute('aria-label') || b.textContent.trim(), Math.round(r.width), Math.round(r.height), b.disabled] }) })))
    const sizesOk = r.every((x) => x.handle && x.handle[0] >= 44 && x.handle[1] >= 44 && x.btns.length === 3 && x.btns.every((b) => b[1] >= 44 && b[2] >= 44))
    const ends = r[0].btns.find((b) => /Flytta upp/.test(b[0]))?.[3] === true && r.at(-1).btns.find((b) => /Flytta ner/.test(b[0]))?.[3] === true && r[0].btns.find((b) => /Flytta ner/.test(b[0]))?.[3] === false
    check('AC7', 'each row: number, name, handle, ↑, ↓, «Ta bort», all ≥44×44; ↑ off on first, ↓ off on last', sizesOk && ends && r.every((x) => x.rank && x.name) && r.every((x) => x.btns.some((b) => /^Ta bort/.test(b[0]))), JSON.stringify(r).slice(0, 900))
    const add = await rect(p, '.hall-station-add'); check('AC7-add', '«Lägg till station» last and ≥44 px', add && add.h >= 44, JSON.stringify(add))
    await shot(p, '04_edit_list_390', true)
    await tog.click(); await p.waitForTimeout(250)
    const f1 = await active(p); const gone = (await rowsL(p).count()) === 0
    await tog.click(); await p.waitForTimeout(250); await rowsL(p).nth(1).locator('button').first().focus(); await p.keyboard.press('Escape'); await p.waitForTimeout(250)
    const f2 = await active(p)
    check('AC8', '«Klar» closes the list, focus on «Ändra stationer»; Esc in the list does the same', gone && /hall-stations-toggle/.test(f1) && (await rowsL(p).count()) === 0 && /hall-stations-toggle/.test(f2), `${f1} || ${f2}`)
    await tog.click(); await p.waitForTimeout(250)
    await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500)
    const g = await p.evaluate(() => ({ edit: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && /Ändra stationer|^Klar$/.test(b.innerText.trim())).length, del: [...document.querySelectorAll('button')].filter((b) => b.offsetParent && /^Ta bort/.test((b.getAttribute('aria-label') || b.innerText).trim())).length, list: !!document.querySelector('.hall-station-list') }))
    check('AC9', '«Golvklart» closes edit mode; Golvklart has no «Ändra stationer» and no «Ta bort»', !g.list && g.edit === 0 && g.del === 0, JSON.stringify(g))
    await shot(p, '05_golvklart_390', true)
    await p.context().close()
  })
  // D/C — reorder via drag + ranks everywhere + placements unchanged + reload
  await attempt('AC11', async () => {
    const p = await page(); await prep(p); await hall(p); await editOn(p)
    const ids0 = await techIds(p), pl0 = await plc(p), names0 = await listNames(p)
    const h = rowsL(p).nth(2).locator('.hall-station-handle'); await h.scrollIntoViewIfNeeded()
    const from = await center(h), top = await center(rowsL(p).nth(0))
    const sy0 = await p.evaluate(() => scrollY)
    let ind = null, sy1 = null
    await touchDrag(p, from, { x: from.x, y: top.y - 12 }, 12, async () => { ind = await p.evaluate(() => { const e = document.querySelector('.hall-station-row.is-drop-target'); if (!e) return null; const s = getComputedStyle(e, '::before'); const s2 = getComputedStyle(e, '::after'); return { idx: [...e.parentElement.children].indexOf(e), cls: e.className, line: [s.content, s.height, s.backgroundColor, s2.content, s2.height, getComputedStyle(e).boxShadow, getComputedStyle(e).borderTopWidth].join(' ') } }); sy1 = await p.evaluate(() => scrollY) })
    const ids1 = await techIds(p)
    check('AC11', 'touch: drag row 3 handle to place 1 — a drop line shows, row 3 becomes first', ids1[0] === ids0[2] && ids1.length === ids0.length && ind && ind.idx === 0, `before=${ids0} after=${ids1} ind=${JSON.stringify(ind)}`)
    check('AC12a', 'touch: page does not scroll while dragging the handle', sy1 === sy0, `scrollY ${sy0}→${sy1}`)
    const hta = await p.locator('.hall-station-handle').first().evaluate((e) => getComputedStyle(e).touchAction), rta = await rowsL(p).first().evaluate((e) => getComputedStyle(e).touchAction)
    // outside handle: swipe on the name scrolls the page
    const nm = await center(p.locator('.hall-station-name').nth(1)); const s0 = await p.evaluate(() => scrollY)
    await touchDrag(p, nm, { x: nm.x, y: nm.y - 200 }, 10); const s1 = await p.evaluate(() => scrollY)
    check('AC12b', 'touch: outside the handle the list/page scrolls normally (handle touch-action none, row not)', hta === 'none' && rta !== 'none' && s1 !== s0 && (await techIds(p)).join() === ids1.join(), `handle=${hta} row=${rta} scroll ${s0}→${s1}`)
    const pl1 = await plc(p)
    check('AC20', 'markers keep their positions when only the order changes', JSON.stringify(pl0) === JSON.stringify(pl1), `${JSON.stringify(pl0)} vs ${JSON.stringify(pl1)}`)
    const names1 = await listNames(p), ranks = await listRanks(p), chips = await chipLabels(p)
    const expect = names1.map((n, i) => `${i + 1}. ${n}`).sort()
    check('AC17', 'markers show 1,2,3 in the new order', JSON.stringify(chips.map((c) => c.replace(/^Station (\d+): (.*?)\. Tryck.*$/, '$1. $2')).sort()) === JSON.stringify(expect) && ranks.join() === names1.map((_, i) => i + 1).join(), `chips=${JSON.stringify(chips)} list=${JSON.stringify(names1)}`)
    const flow = await p.evaluate(() => [...document.querySelectorAll('.hall-canvas svg path, .hall-canvas svg line, .hall-flow *')].length)
    note('flowElements', flow)
    await shot(p, '06_after_drag_390', true)
    // AC10 reload
    await p.reload(); await p.locator('.home, .builder, .hall-board').first().waitFor(); await p.waitForTimeout(800)
    const idsR = await techIds(p), plR = await plc(p)
    check('AC10', 'changes survive reload without saving', idsR.join() === ids1.join() && JSON.stringify(plR) === JSON.stringify(pl1), `${idsR}`)
    if (await p.locator('.home').isVisible().catch(() => false)) await p.getByRole('button', { name: 'Fortsätt passet' }).first().click()
    await p.locator('.builder, .hall-board').first().waitFor(); await p.waitForTimeout(500)
    if (await p.locator('.hall-board').isVisible().catch(() => false)) { await back(p).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300) }
    const bt = await builderTeknik(p)
    check('AC18', 'back in Passbyggaren the Teknik block has the same order', bt && bt.length >= names1.length && names1.every((n, i) => bt[i]?.includes(n) || n.includes(bt[i])), `builder=${JSON.stringify(bt)} hall=${JSON.stringify(names1)}`)
    // AC19 Golvklart + Förrådslista numbering
    await hall(p); await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500)
    const gl = await p.locator('.hall-chip').evaluateAll((es) => es.map((e) => e.getAttribute('aria-label')).filter(Boolean).sort())
    const glN = gl.map((c) => c.replace(/^Station (\d+): (.*?)\..*$/, '$1. $2')); const glOk = gl.length > 0 && expect.every((x) => glN.includes(x))
    await p.getByRole('button', { name: 'Avsluta golvklart' }).click(); await p.waitForTimeout(400)
    if (!(await p.locator('.hall-board').isVisible().catch(() => false))) await hall(p)
    note('btnsBeforeForrad', await p.locator('button:visible').evaluateAll((es) => es.map((e) => e.innerText.trim() || e.getAttribute('aria-label')).join('|'))); note('url', p.url());
    const fb = p.locator('button:visible', { hasText: /^Förrådslista$/ }).first(); note('forradAria', await fb.getAttribute('aria-label')); await fb.click(); await p.waitForTimeout(500)
    const fr = await p.locator('.forradslista-sheet').innerText().catch(() => '')
    const frNums = [...fr.matchAll(/(\d+)\.\s|station(?:er)? ([\d, och]+)/gi)].map((m) => m[0]).slice(0, 20)
    note('forradslistaText', fr.slice(0, 1500))
    check('AC19', 'Golvklart and Förrådslista use the same numbers (Golvklart chip labels; Förrådslista text recorded)', glOk, `golvklart=${JSON.stringify(gl)} expect=${JSON.stringify(expect)} forrad=${JSON.stringify(frNums)}`)
    await shot(p, '07_forradslista_390'); await p.context().close()
  })
  // C — canvas marker drag, tap, to tray
  await attempt('AC13', async () => {
    const p = await page(); await prep(p); await hall(p)
    const chip = p.locator('.hall-chip--canvas').first(); await chip.scrollIntoViewIfNeeded()
    const lbl = await chip.getAttribute('aria-label'); const ids = await techIds(p); const pl0 = (await draft(p)).hallPlacements
    const cv = await p.locator('.hall-canvas').first().boundingBox(); const c = await center(chip)
    const target = { x: cv.x + cv.width * 0.62, y: cv.y + cv.height * 0.55 }
    await touchDrag(p, c, target, 12)
    const pl1 = (await draft(p)).hallPlacements; const moved = pl1.find((x) => !pl0.some((y) => y.sessionItemId === x.sessionItemId && y.x === x.x && y.y === x.y))
    const nx = (target.x - cv.x) / cv.width, ny = (target.y - cv.y) / cv.height
    const c2 = await center(p.locator('.hall-chip--canvas').filter({ has: p.locator(':scope') }).locator(`xpath=//*[@aria-label="${lbl}"]`).first()).catch(() => null)
    check('AC13a', 'touch: drag a marker to a new spot — it lands where released (grid snap)', moved && Math.abs(moved.x - nx) < 0.12 && Math.abs(moved.y - ny) < 0.12 && pl1.length === pl0.length, `target=${nx.toFixed(2)},${ny.toFixed(2)} got=${JSON.stringify(moved)} chipNow=${JSON.stringify(c2)}`)
    // short tap opens detail
    const chip2 = p.locator('.hall-chip--canvas').nth(1); const cc = await center(chip2); const plb = JSON.stringify((await draft(p)).hallPlacements)
    await tapAt(p, cc)
    const det = await p.locator('.modal.activity-detail, .hall-detail, [role=dialog]').first().isVisible().catch(() => false)
    check('AC13b', 'touch: a short tap without movement opens the detail view, nothing moves', det && plb === JSON.stringify((await draft(p)).hallPlacements), `detail=${det}`)
    await shot(p, '08_tap_detail_390'); await closeOverlays(p); await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300)
    // drag to tray → unplaced
    const tray = p.locator('.hall-tray').first(); await tray.scrollIntoViewIfNeeded().catch(() => {})
    const chip3 = p.locator('.hall-chip--canvas').last(); await chip3.scrollIntoViewIfNeeded(); const c3 = await center(chip3); const tr = await center(tray)
    const nBefore = (await draft(p)).hallPlacements.length
    await touchDrag(p, c3, tr, 14)
    const d = await draft(p)
    check('AC14', 'touch: a marker dragged to the tray is lifted off the plan (pass keeps the station)', d.hallPlacements.length === nBefore - 1 && (await techIds(p)).join() === ids.join(), `placements ${nBefore}→${d.hallPlacements.length}`)
    await shot(p, '09_to_tray_390', true); await p.context().close()
  })
  // E — add / remove / undo
  await attempt('AC21', async () => {
    const p = await page(); await prep(p); await hall(p); await editOn(p)
    const ids0 = await techIds(p), pl0 = (await draft(p)).hallPlacements
    await p.locator('.hall-station-add').click(); await p.waitForTimeout(500)
    const L = p.locator('.side-panel-slot.is-open'); const sel = L.locator('select').first()
    const fv = await sel.inputValue().catch(() => null), fdis = await sel.isDisabled().catch(() => null)
    const head = await L.innerText().catch(() => '') + ' ' + (await L.evaluate((e) => [...e.querySelectorAll('[aria-label],h1,h2,h3')].map((x) => x.getAttribute('aria-label') || x.textContent).join('|')).catch(() => ''))
    await shot(p, '10_add_station_lib_390')
    const firstCard = L.locator('.library-entry .activity-card').first(); const pickTitle = (await firstCard.innerText()).split('\n')[0].trim()
    await firstCard.click(); await p.waitForTimeout(700)
    const open = await L.isVisible().catch(() => false), detOpen = await p.locator('.modal.activity-detail').isVisible().catch(() => false)
    const d = await draft(p), ids1 = teknik(d).map((i) => i.id), nu = ids1.find((i) => !ids0.includes(i))
    const np = d.hallPlacements.find((x) => x.sessionItemId === nu)
    const clash = np && pl0.some((x) => Math.abs(x.x - np.x) < 0.05 && Math.abs(x.y - np.y) < 0.05)
    const lastName = (await listNames(p)).at(-1)
    check('AC21', '«Lägg till station» → «Lägg till övning» on Teknik; choosing closes the sheet, new station last in list and on a free spot', fv === 'techniques' && /Lägg till övning/.test(head) && !open && !detOpen && ids1.length === ids0.length + 1 && ids1.at(-1) === nu && np && !clash && (lastName || '').length > 0, `filter=${fv} head=«${head}» sheetOpen=${open} detail=${detOpen} picked=«${pickTitle}» last=«${lastName}» np=${JSON.stringify(np)} clash=${clash}`)
    note('Q2_filterDisabled', fdis)
    check('Q2', 'Builder-reported PO ruling Q2: hall library filter locked to Teknik (select disabled) — pack E1 only says «filtret satt till Teknik»', fdis === true, `disabled=${fdis}`)
    const pl1 = (await draft(p)).hallPlacements
    check('AC21-keep', 'adding a station does not move existing markers', pl0.every((a) => pl1.some((b) => b.sessionItemId === a.sessionItemId && b.x === a.x && b.y === a.y)))
    // remove + toast ~5 s + undo
    const before = await snapshotState(p)
    const t0 = Date.now(); await rowsL(p).nth(1).getByRole('button', { name: /^Ta bort/ }).click(); await p.waitForTimeout(200)
    const tt = await toastNow(p), ids2 = await techIds(p), chipsN = await p.locator('.hall-chip--canvas').count()
    check('AC22', '«Ta bort» removes the station from pass and hall; «Borttagen · Ångra» shows', ids2.length === ids1.length - 1 && !ids2.includes(ids1[1]) && !(await draft(p)).hallPlacements.some((x) => x.sessionItemId === ids1[1]) && /Borttagen/.test(tt) && /Ångra/.test(tt), `toast=«${tt}» chips=${chipsN}`)
    await shot(p, '11_removed_toast_390')
    await p.locator('.toast').getByRole('button', { name: /Ångra/ }).click(); await p.waitForTimeout(300)
    const tt2 = await toastNow(p), after = await snapshotState(p)
    check('AC23', '«Ångra» restores station, its placement and the order; then «Ångrat.»', before === after && /Ångrat\./.test(tt2), `toast2=«${tt2}» same=${before === after}`)
    // toast duration
    await rowsL(p).nth(0).getByRole('button', { name: /^Ta bort/ }).click()
    const gone = await p.evaluate(async () => { const t0 = performance.now(); while (performance.now() - t0 < 12000) { if (!/Ångra/.test(document.querySelector('.toast')?.innerText ?? '')) return Math.round(performance.now() - t0); await new Promise((r) => setTimeout(r, 50)) } return null })
    check('AC22-time', 'undo toast stays about 5 s', gone && gone > 4000 && gone < 7000, `${gone} ms`)
    await p.context().close()
  })
  await attempt('AC24', async () => {
    let p = await page(); await prep(p); await hall(p); await editOn(p)
    const ids0 = await techIds(p)
    await rowsL(p).nth(0).getByRole('button', { name: /^Ta bort/ }).click(); await p.waitForTimeout(250)
    const t1 = await toastNow(p)
    await rowsL(p).nth(0).getByRole('button', { name: /Flytta ner/ }).click(); await p.waitForTimeout(300)
    const t2 = await toastNow(p), hasUndo = await p.locator('.toast').getByRole('button', { name: /Ångra/ }).count()
    check('AC24', 'another change before «Ångra» ends the undo toast (Slice 41 rule)', /Ångra/.test(t1) && hasUndo === 0, `before=«${t1}» after=«${t2}»`)
    // also: drag a canvas marker counts as another change
    await p.locator('.hall-stations-toggle').click(); await p.waitForTimeout(200)
    await editOn(p); await rowsL(p).nth(0).getByRole('button', { name: /^Ta bort/ }).click(); await p.waitForTimeout(250)
    const ch = p.locator('.hall-chip--canvas').first(); await ch.scrollIntoViewIfNeeded(); const c = await center(ch); await touchDrag(p, c, { x: c.x + 50, y: c.y + 40 })
    check('AC24b', 'a marker drag also ends the undo toast', (await p.locator('.toast').getByRole('button', { name: /Ångra/ }).count()) === 0, await toastNow(p))
    // AC25 outside mode: «Ta bort från hall»
    await p.context().close(); p = await page(); await prep(p); await hall(p)
    const idsA = await techIds(p), nA = (await draft(p)).hallPlacements.length
    const rm = p.locator('.hall-chip-remove').first(); const rml = await rm.getAttribute('aria-label'); await rm.click(); await p.waitForTimeout(300)
    let path = 'chip ×'
    if ((await draft(p)).hallPlacements.length === nA) { const b = p.getByRole('button', { name: /Ta bort från hall/ }).first(); if (await b.count()) { await b.click(); path = 'Ta bort från hall'; await p.waitForTimeout(300) } }
    check('AC25', 'outside edit mode «Ta bort från hall» lifts the marker only, nothing removed from the pass', (await draft(p)).hallPlacements.length === nA - 1 && (await techIds(p)).join() === idsA.join(), `${path} aria=«${rml}»`)
    await p.context().close()
  })
  await attempt('AC28', async () => {
    const p = await page(); await prep(p); await hall(p)
    const z = () => p.evaluate(() => { const c = document.querySelector('.hall-canvas'); return c ? Math.round(c.getBoundingClientRect().width) : 0 })
    const w0 = await z(); await p.getByRole('button', { name: 'Zooma in' }).first().click(); await p.waitForTimeout(250); const w1 = await z(); await p.getByRole('button', { name: 'Zooma ut' }).first().click(); await p.waitForTimeout(250); const w2 = await z()
    const vm = await p.evaluate(() => document.querySelector('meta[name=viewport]')?.content)
    check('AC28', 'zoom − / + work as before; viewport meta unchanged', w1 > w0 && w2 === w0 && vm === 'width=device-width, initial-scale=1.0', `${w0}→${w1}→${w2} meta=${vm}`)
    const foot = await p.evaluate(() => document.body.innerText.match(/Träningsplaneraren · Slice \d+/)?.[0])
    check('AC33', 'footer «Träningsplaneraren · Slice 48»', foot === 'Träningsplaneraren · Slice 48', foot)
    await p.context().close()
  })
}
// ---------- p2: landscape / 320 / desktop ----------
const LAND = { width: 844, height: 390 }
const reach = (p, loc) => loc.evaluate(async (e) => { e.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 150)); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { ok: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1 && (t === e || e.contains(t)), top: Math.round(r.top), bottom: Math.round(r.bottom), hit: t?.className?.toString().slice(0, 40) } })
async function allReach(p, scope) { const bs = p.locator(`${scope} button:visible`); const n = await bs.count(); const bad = []; for (let i = 0; i < n; i++) { const b = bs.nth(i); const r = await reach(p, b).catch((e) => ({ ok: false, err: String(e).slice(0, 60) })); if (!r.ok) bad.push(`${(await b.innerText().catch(() => '')).trim() || await b.getAttribute('aria-label')}:${JSON.stringify(r)}`) } return { n, bad } }
async function openLib(p) { const b = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) }).getByRole('button', { name: /Lägg till övning|Lägg till/ }).first(); await b.click(); await p.locator('.side-panel-slot.is-open').waitFor(); await p.waitForTimeout(400); return p.locator('.side-panel-slot.is-open') }
if (PARTS.includes('p2')) { PART = 'p2'
  await attempt('AC5', async () => {
    for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
      const p = await page({ vp: LAND }); await prep(p, { base })
      const b = await p.locator('.builder-actions .builder-hall').isVisible().catch(() => false)
      if (tag === 'br') { check('AC5', '844×390: «Hallöversikt» visible in the row', b); await shot(p, '12_builder_row_844') } else note('AC5_main_rowHall', b)
      // AC29 detail
      const L = await openLib(p); const c = L.locator('.library-entry .activity-card').first(); await c.click(); await p.waitForTimeout(600)
      const det = p.locator('.modal.activity-detail'); const sc = await det.evaluate((e) => { const els = [e, ...e.querySelectorAll('*')]; return els.some((x) => x.scrollHeight > x.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(x).overflowY)) || document.documentElement.scrollHeight > innerHeight })
      const r1 = await reach(p, det.getByRole('button', { name: /Lägg till i valt block/ }).first()).catch((e) => ({ ok: false, err: String(e).slice(0, 80) }))
      const r2 = await reach(p, det.getByRole('button', { name: /Lägg till och ändra tid/ }).first()).catch((e) => ({ ok: false, err: String(e).slice(0, 80) }))
      if (tag === 'br') { check('AC29', '844×390 detail scrollable; «Lägg till i valt block» and «Lägg till och ändra tid» reachable', sc && r1.ok && r2.ok, `scroll=${sc} ${JSON.stringify(r1)} ${JSON.stringify(r2)}`); await shot(p, '13_detail_844') } else note('AC29_main', JSON.stringify({ sc, r1, r2 }))
      if (tag === 'br') { const n0 = items(await draft(p)).length; await det.getByRole('button', { name: /Lägg till i valt block/ }).first().click(); await p.waitForTimeout(1500); check('AC29-tap', '«Lägg till i valt block» tappable at 844×390 (adds item)', items(await draft(p)).length === n0 + 1) }
      await closeOverlays(p)
      // AC30 library to last
      const L2 = p.locator('.side-panel-slot.is-open').isVisible().catch(() => false) ? p.locator('.side-panel-slot.is-open') : await openLib(p)
      if (!(await L2.isVisible().catch(() => false))) await openLib(p)
      const last = p.locator('.side-panel-slot.is-open .library-entry').last()
      const r3 = await reach(p, last).catch((e) => ({ ok: false, err: String(e).slice(0, 80) }))
      if (tag === 'br') check('AC30', '844×390 library scrolls to the last drill', r3.ok, JSON.stringify(r3)); else note('AC30_main', JSON.stringify(r3))
      await closeOverlays(p); await p.context().close()
    }
  })
  await attempt('AC31', async () => {
    const p = await page({ vp: LAND }); await prep(p); await hall(p)
    const outside = await allReach(p, '.hall-board'); await editOn(p)
    const k = await reach(p, p.locator('.hall-stations-toggle'))
    const inEdit = await allReach(p, '.hall-board')
    check('AC31', '844×390 edit mode open: «Klar» reachable', k.ok && (await p.locator('.hall-stations-toggle').innerText()).trim() === 'Klar', JSON.stringify(k))
    await shot(p, '14_edit_844')
    check('L-reach', '844×390 every hall button reachable by scrolling (outside + edit mode)', outside.bad.length === 0 && inEdit.bad.length === 0, `outside ${outside.n} bad=${outside.bad.join(';')} edit ${inEdit.n} bad=${inEdit.bad.join(';')}`)
    await p.locator('.hall-stations-toggle').click(); await p.waitForTimeout(200)
    // add sheet + forradslista + tray + golvklart
    await editOn(p); await p.locator('.hall-station-add').click(); await p.waitForTimeout(500)
    const add = await allReach(p, '.side-panel-slot.is-open'); const lastA = await reach(p, p.locator('.side-panel-slot.is-open .library-entry').last()).catch(() => ({ ok: false }))
    await closeOverlays(p); await p.locator('.hall-stations-toggle').click().catch(() => {}); await p.waitForTimeout(200)
    await p.locator('button:visible', { hasText: /^Förrådslista$/ }).first().click(); await p.waitForTimeout(400)
    const fr = await allReach(p, '.forradslista-sheet'); await closeOverlays(p)
    await p.locator('.hall-tray-toggle').click().catch(() => {}); await p.waitForTimeout(300); const tr = await allReach(p, '.hall-tray')
    await p.locator('.hall-tray-toggle').click().catch(() => {})
    await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(400); const gk = await allReach(p, 'body'); await shot(p, '15_golvklart_844')
    check('L-sheets', '844×390 add-station sheet (to last drill), Förrådslista, tray, Golvklart controls reachable', add.bad.length === 0 && lastA.ok && fr.bad.length === 0 && tr.bad.length === 0 && gk.bad.length === 0, `add ${add.n}/${add.bad} last=${lastA.ok} forrad ${fr.n}/${fr.bad} tray ${tr.n}/${tr.bad} golvklart ${gk.n}/${gk.bad}`)
    await p.context().close()
  })
  await attempt('W320', async () => {
    const p = await page({ vp: { width: 320, height: 640 } }); await prep(p)
    const w0 = await docW(p); await hall(p); await editOn(p); const w1 = await docW(p)
    const rowOk = await rowsL(p).evaluateAll((ls) => ls.every((l) => { const r = l.getBoundingClientRect(); return r.right <= 321 && [...l.querySelectorAll('button')].every((b) => { const q = b.getBoundingClientRect(); return q.right <= 321 && q.width >= 40 && q.height >= 40 }) }))
    const ids0 = await techIds(p); await rowsL(p).nth(0).getByRole('button', { name: /^Flytta ner/ }).click(); await p.waitForTimeout(300)
    const ids1 = await techIds(p)
    const geo = await rowsL(p).first().evaluate((l) => { const b = l.querySelector('.hall-station-remove').getBoundingClientRect(); const r = l.getBoundingClientRect(); return `row ${Math.round(r.left)}–${Math.round(r.right)} remove ${Math.round(b.left)}–${Math.round(b.right)}` })
    check('W320', '320 px: no horizontal overflow (builder, hall edit); rows/buttons fit ≥40 px; ↓ works', w0 <= 320 && w1 <= 320 && rowOk && ids1[1] === ids0[0], `docW ${w0}/${w1} rowOk=${rowOk} ${geo}`)
    await shot(p, '16_edit_320'); await p.context().close()
  })
  await attempt('AC15', async () => {
    const p = await page({ vp: { width: 1280, height: 800 }, touch: false }); await prep(p); await hall(p); await editOn(p)
    const ids0 = await techIds(p), pl0 = await plc(p)
    await p.locator('.hall-station-list').scrollIntoViewIfNeeded(); await p.evaluate(() => document.querySelector('.hall-station-list').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
    const h = await center(p.locator('.hall-station-handle').nth(0)); const tgt = await center(rowsL(p).nth(2))
    let dropSeen = false
    await mouseDrag(p, h, { x: tgt.x, y: tgt.y + 10 }, async () => { dropSeen = (await p.locator('.is-drop-target').count()) > 0 })
    await p.waitForTimeout(400); const ids1 = await techIds(p)
    const ok11 = ids1.join() !== ids0.join() && ids1.slice().sort().join() === ids0.slice().sort().join() && JSON.stringify(await plc(p)) === JSON.stringify(pl0)
    await p.locator('.hall-stations-toggle').click(); await p.waitForTimeout(200)
    const ch = p.locator('.hall-chip--canvas').first(); await ch.scrollIntoViewIfNeeded(); const lab = await ch.getAttribute('aria-label'); const c = await center(ch); const plA = await plc(p)
    await mouseDrag(p, c, { x: c.x + 60, y: c.y + 40 }); await p.waitForTimeout(400); const plB = await plc(p)
    const moved = Object.keys(plA).filter((k) => plA[k] !== plB[k]).length
    const detOpen0 = await p.locator('.modal').isVisible().catch(() => false)
    await p.locator('.hall-chip--canvas').first().click(); await p.waitForTimeout(400); const detOpen = await p.locator('.modal').isVisible().catch(() => false)
    check('AC15', 'desktop mouse: list handle drag reorders (AC11) and marker drag moves one marker without opening details; click opens details (AC13)', ok11 && moved === 1 && !detOpen0 && detOpen, `reorder=${ok11} dropLine=${dropSeen} moved=${moved} detAfterDrag=${detOpen0} detOnClick=${detOpen} ${lab}`)
    await shot(p, '17_desktop_1280'); await p.context().close()
  })
}
// ---------- p3: old passes from main ----------
if (PARTS.includes('p3')) { PART = 'p3'
  for (const [tag, hn] of [['Blå', STORA], ['Vit', GROP]]) {
    await attempt(`OLD-${tag}`, async () => {
      const m = await page(); await home(m, MAIN); await wizard(m, { hall: hn, len: '60 min' }); await hall(m)
      const sug = m.getByRole('button', { name: /^Använd alla förslag/ }).filter({ visible: true }).first(); if (await sug.count()) { await sug.click(); await m.waitForTimeout(500) }
      // hand placement: drag first chip
      const ch = m.locator('.hall-chip--canvas').first(); if (await ch.count()) { const c = await center(ch); await touchDrag(m, c, { x: c.x + 40, y: c.y + 30 }) }
      await m.waitForTimeout(800); const ls = await allStorage(m); const dm = await draft(m); await m.context().close()
      const p = await page(); await home(p, BR, ls); await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(500)
      const d0 = await draft(p)
      const hallId = d0.hallId ?? d0.hall?.id ?? d0.hallTemplateId
      const keep0 = JSON.stringify(d0.hallPlacements) === JSON.stringify(dm.hallPlacements) && JSON.stringify(items(d0).map((i) => i.id)) === JSON.stringify(items(dm).map((i) => i.id))
      await hall(p); const chips0 = await p.locator('.hall-chip--canvas').count(); const canv = await canvasHall(p)
      check(`OLD-${tag}-load`, `old ${tag} pass from main (with hand placement + equipment) loads unchanged on the branch`, keep0 && chips0 === dm.hallPlacements.length && dm.hallPlacements.length > 0, `hall=${canv} placements main=${dm.hallPlacements.length} chips=${chips0} keep=${keep0}`)
      await shot(p, `18_old_${tag === 'Blå' ? 'bla' : 'vit'}_390`)
      const pl0 = await plc(p); await editOn(p)
      const ids0 = await techIds(p); await rowsL(p).nth(0).getByRole('button', { name: /^Flytta ner/ }).click(); await p.waitForTimeout(300)
      const pl1 = await plc(p)
      await p.locator('.hall-station-add').click(); await p.waitForTimeout(400); await p.locator('.side-panel-slot.is-open .library-entry .activity-card').first().click(); await p.waitForTimeout(600)
      const pl2 = await plc(p); const keptAfterAdd = Object.entries(pl0).every(([k, v]) => pl2[k] === v)
      const s3 = await snapshotState(p); await rowsL(p).nth(1).getByRole('button', { name: /^Ta bort/ }).click(); await p.waitForTimeout(300)
      await p.locator('.toast').getByRole('button', { name: /Ångra/ }).click(); await p.waitForTimeout(400); const s4 = await snapshotState(p)
      check(`OLD-${tag}-edit`, `old ${tag} pass: ↓, add, remove+Ångra keep every existing hand placement`, JSON.stringify(pl1) === JSON.stringify(pl0) && keptAfterAdd && s3 === s4, `reorderKeep=${JSON.stringify(pl1) === JSON.stringify(pl0)} addKeep=${keptAfterAdd} undoExact=${s3 === s4}`)
      await p.reload(); await p.waitForTimeout(800); const d5 = await draft(p)
      check(`OLD-${tag}-reload`, `old ${tag} pass after edits survives reload`, JSON.stringify(Object.fromEntries(d5.hallPlacements.map((x) => [x.sessionItemId, `${x.x},${x.y},${x.zoneId ?? ''}`]))) === JSON.stringify(await plc(p)) && d5.hallPlacements.length === Object.keys(pl2).length)
      // Print numbering
      if (!(await p.locator('.hall-board').isVisible().catch(() => false))) { if (await p.locator('.home').isVisible().catch(() => false)) await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder, .hall-board').first().waitFor(); if (!(await p.locator('.hall-board').isVisible().catch(() => false))) await hall(p) }
      const names = await listNames(p).catch(() => []); await p.locator('.hall-stations-toggle').click().catch(() => {})
      await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(400)
      const gl = await p.locator('.hall-chip').evaluateAll((es) => es.map((e) => e.getAttribute('aria-label')).filter(Boolean))
      const editInGK = await p.locator('.hall-stations-toggle:visible, .hall-station-list:visible').count()
      const pr0 = await p.evaluate(() => window.__prints)
      await p.locator('button:visible', { hasText: /^Skriv ut passet$/ }).first().click(); await p.waitForTimeout(500); const pr1 = await p.evaluate(() => window.__prints); await p.emulateMedia({ media: 'print' })
      const prText = await p.evaluate(() => document.body.innerText.slice(0, 3000)); await p.emulateMedia({ media: 'screen' })
      note(`print_${tag}`, prText.slice(0, 1200))
      const okNums = gl.every((g) => { const m = g.match(/^Station (\d+): (.*?)\./); return m && (names.length === 0 || names[+m[1] - 1] === m[2]) })
      check(`OLD-${tag}-golvklart`, `${tag}: Golvklart numbers follow the list order, no edit mode; «Skriv ut passet» prints`, okNums && editInGK === 0 && pr1 === pr0 + 1, `gl=${JSON.stringify(gl)} names=${JSON.stringify(names)} edit=${editInGK} prints ${pr0}→${pr1}`)
      await p.context().close()
    })
  }
  await attempt('UNKNOWN-HALL', async () => {
    const m = await page(); await home(m, MAIN); await wizard(m, { hall: STORA, len: '60 min' }); await m.waitForTimeout(500); const ls = await allStorage(m); await m.context().close()
    const d = JSON.parse(ls[DK]); for (const k of ['hallId', 'hallTemplateId']) if (k in d) d[k] = 'legacy-okand'; ls[DK] = JSON.stringify(d)
    const p = await page(); await home(p, BR, ls); await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder').waitFor(); await hall(p); await editOn(p)
    const n = await rowsL(p).count(); check('UNKNOWN-HALL', 'legacy/unknown hall pass opens; edit list works (no crash)', n > 0 && errors.length === 0, `rows=${n} hall=${await canvasHall(p)}`); await p.context().close()
  })
}
// ---------- p4: pinch sim, AC32, AC36, Q3 ----------
if (PARTS.includes('p4')) { PART = 'p4'
  await attempt('AC26', async () => {
    const p = await page(); await prep(p); await hall(p)
    const cv = p.locator('.hall-canvas').first(); const b = await cv.boundingBox(); const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const zoomOf = () => p.evaluate(() => { const w = document.querySelector('.hall-canvas-wrap').clientWidth; const z = document.querySelector('.hall-canvas-zoom').getBoundingClientRect().width; return { t: `matrix(${(z / w).toFixed(3)}`, vv: visualViewport.scale } })
    const s = await p.context().newCDPSession(p); const tp = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }]
    const z0 = await zoomOf(); const seq = []
    await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(40) })
    for (const d of [50, 60, 70, 80, 70, 60, 70, 80, 90, 100]) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(d) }); await p.waitForTimeout(40); seq.push((await zoomOf()).t) }
    await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(300); const z1 = await zoomOf()
    const sc = seq.map((t) => +(t?.match(/matrix\(([\d.]+)/)?.[1] ?? 1)); note('AC26_seq', JSON.stringify({ z0, z1, sc }))
    const followsBack = sc[4] < sc[3] && sc[9] > sc[6]
    check('AC26-sim', 'SIMULATED (CDP two-touch, not iPhone): zoom follows fingers continuously, back and forth, page scale stays 1', followsBack && z1.vv === 1 && Math.max(...sc) <= 2.01, `scales=${sc.map((x) => x.toFixed(2)).join(',')} vv=${z1.vv}`)
    // AC27: pinch starting under the plan
    await p.locator('.hall-tray').scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(300); const tray = await p.locator('.hall-tray').boundingBox().catch(() => null); const y2 = tray ? tray.y + 10 : b.y + b.height + 20
    const tp2 = (d) => [{ x: cx - d, y: y2, id: 1 }, { x: cx + d, y: y2, id: 2 }]
    await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp2(40) }); for (const d of [60, 80, 100]) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp2(d) }); await p.waitForTimeout(40) }
    await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(300)
    const ta = await p.evaluate(() => [...document.querySelectorAll('.hall-board, .hall-tray, .hall-board *')].filter((e) => /none|pan-y|manipulation/.test(getComputedStyle(e).touchAction)).length)
    const vv2 = await p.evaluate(() => visualViewport.scale); check('AC27-sim', 'SIMULATED: pinch starting in the tray area does not zoom the page (visualViewport.scale 1)', vv2 === 1, `vv=${vv2} y=${Math.round(y2)} tray=${JSON.stringify(tray)} touchAction-restricted els=${ta}`)
    await p.context().close()
  })
  await attempt('AC32', async () => {
    const out = {}
    for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
      const p = await page(); await prep(p, { base }); const L = await openLib(p); await L.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(600)
      const det = await p.locator('.modal.activity-detail').evaluate((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.innerText.length] })
      await shot(p, `19_detail_390_${tag}`); note(`AC32_detBtns_${tag}`, await p.locator('.modal.activity-detail button').evaluateAll((es) => es.map((e) => (e.innerText.trim() || e.getAttribute('aria-label')) + '.' + e.className))); for (let i = 0; i < 4 && await p.locator('.modal.activity-detail').isVisible().catch(() => false); i++) { await p.locator('.modal.activity-detail').getByRole('button', { name: /Stäng|Tillbaka|^×$|Close/ }).first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(300) } await closeOverlays(p)
      await menu(p, 'Dela'); await p.waitForTimeout(500); const dl = await p.locator('[role=dialog]:visible').last().evaluate((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.innerText.replace(/\s+/g, ' ').trim()] }).catch(() => null)
      await shot(p, `20_dela_390_${tag}`); await closeOverlays(p)
      out[tag] = { det, dl }; await p.context().close()
    }
    note('AC32', JSON.stringify(out))
    check('AC32', '390×844 detail and Dela sheets same size and text as main', JSON.stringify(out.br) === JSON.stringify(out.main), JSON.stringify(out))
  })
  await attempt('AC36', async () => {
    const p = await page(); await prep(p); const t1 = await p.locator('body').innerText(); await hall(p); const t2 = await p.locator('body').innerText()
    const terms = ['Hallöversikt', 'Passbyggaren', 'Golvklart', 'Förrådslista', 'Redigera redskap']; const miss = terms.filter((t) => !(t1 + t2).includes(t))
    await editOn(p); await p.locator('.hall-stations-toggle').click(); await p.locator('.hall-chip--canvas').first().click(); await p.waitForTimeout(400); const t3 = await p.locator('body').innerText(); const miss2 = miss.filter((t) => !t3.includes(t))
    check('AC36', 'locked terms present unchanged in UI (builder, hall, chip detail); source counts in report', miss2.length === 0, `missing=${miss2}`); await p.context().close()
  })
}
// ---------- end ----------
check(`console-${PARTS.join('+')}`, 'no page errors in this run', errors.length === 0, errors.join(' | '))
check(`live-${PARTS.join('+')}`, 'no browser request to a non-mock supabase.co host', live.length === 0, live.slice(0, 5).join(' '))
await browser.close()
const seen = new Map(); for (const r of results) seen.set(r.id, r)
const out = [...seen.values()]
writeFileSync(RES, JSON.stringify({ target: 'f523774', main: 'e605b3f', criteria: '29ef308', results: out, notes }, null, 1))
const cur = out.filter((r) => PARTS.includes(r.part))
console.log(`\n${PARTS}: ${cur.filter((r) => r.ok).length}/${cur.length} PASS · total ${out.filter((r) => r.ok).length}/${out.length}`)

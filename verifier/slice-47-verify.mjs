// Slice 47 «Lägg till övning + Admin» — Verifier formal run. Branch c8b4e24 vs main 9aa3996.
// Previews: branch plain :57861, main plain :57862, branch bank :57860, main bank :57863 (bank builds use
// https://bank-mock.supabase.co, routed to MY stand-in gateway :57850; nothing live). PW_CORE = recording shim.
// Headless Chrome 390×844 DPR 2 touch (+320, 844×390, 1280×800). PART env selects sections; ONLY= single checks.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s47v/pwshim/index.mjs')
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = 'http://127.0.0.1:57861/traningsplaneringen/', MAIN = 'http://127.0.0.1:57862/traningsplaneringen/'
const BRB = 'http://127.0.0.1:57860/traningsplaneringen/', MAINB = 'http://127.0.0.1:57863/traningsplaneringen/'
const GW = 'http://127.0.0.1:57850', S32 = process.env.S32_DIR ?? '/workspace/s47v/sb'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-47-screenshots-v/s47v_`, CK = `${ROOT}/verifier/slice-47-checks`, RES = `${ROOT}/verifier/slice-47-verify-results.json`
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
async function addTeknik(p) {
  const c = card(p, 'Teknik'); const inline = c.locator('.btn-add-inline')
  if (await inline.count()) await inline.click(); else await c.getByRole('button', { name: 'Lägg till övning' }).click()
  await p.locator('.filter-row select').first().selectOption('techniques').catch(() => {})
  await p.locator('.library-entry .activity-card').first().click()
  await p.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(1500)
}
// Footer rows: each visible child row of root → visible leaf items with text, rects
const footRows = (p, root) => p.evaluate((root) => { const R = document.querySelector(root); if (!R) return null; return [...R.children].filter((e) => e.offsetParent && e.innerText.trim()).map((row) => {
  const its = [...row.querySelectorAll('a, button, span, p')].filter((e) => e.offsetParent && e.innerText.trim() && ![...e.children].some((k) => k.offsetParent && k.innerText.trim() && ['A','BUTTON','SPAN'].includes(k.tagName)))
  const rr = row.getBoundingClientRect(); const cs = getComputedStyle(row)
  return { text: row.innerText.replace(/\s+/g, ' ').trim(), top: Math.round(rr.top), bottom: Math.round(rr.bottom), fs: cs.fontSize, color: cs.color,
    items: its.map((e) => { const r = e.getBoundingClientRect(); return { t: e.innerText.trim(), tag: e.tagName, cy: Math.round((r.top + r.bottom) / 2), h: Math.round(r.height), w: Math.round(r.width), fs: getComputedStyle(e).fontSize, bottom: Math.round(r.bottom), right: Math.round(r.right) } }) } }) }, root)
function rowsOk(rows) { return rows.every((r) => !/^·|·$/.test(r.text)) && rows.every((r) => { const cys = r.items.map((i) => i.cy); return cys.length < 2 || Math.max(...cys) - Math.min(...cys) <= 2 }) && rows.every((r) => r.items.filter((i) => i.tag === 'A' || i.tag === 'BUTTON').every((i) => i.h >= 44)) }
function mails(to) { const d = `${S32}/mail`; if (!existsSync(d)) return []; return readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => ({ t: statSync(`${d}/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${d}/${f}`, 'utf8')) })).filter((x) => JSON.stringify(x.m.to).includes(to)).sort((a, b) => a.t - b.t) }
async function waitMail(to, after) { for (let i = 0; i < 80; i++) { const m = mails(to).filter((x) => x.t > after); if (m.length) return m.at(-1).m; await new Promise((r) => setTimeout(r, 250)) } throw new Error(`no mail for ${to}`) }
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', '57851', '-U', 'postgres', '-d', 'bank', '-qAt', '-c', q], { encoding: 'utf8' }).trim()

// ─────────── Slice 47 helpers ───────────
const OWN = 'gymnastics-planner-own-activities-v1', AUTH = 'gymnastics-planner-admin-auth-v1'
const A = 'admin@test.local', B = 'admin2@test.local', NA = 'nonadmin@test.local'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8')), ANON = ENV.publishableKey
const BOT = readFileSync(`${S32}/bot-keys.txt`, 'utf8').split('\n')[0].trim() // never printed
const SESS = '/workspace/s47v/sess' // outside the repo; holds local stand-in tokens only
const text = (p, sel = 'body') => p.locator(sel).first().innerText()
const toastText = async (p) => { const t = p.locator('.toast'); await t.first().waitFor({ timeout: 8000 }); return (await t.first().innerText()).trim() }
// apage: bank build page with an optional saved session (as) and route hooks
async function apage({ vp = PHONE, as = null, ls = {}, hook = null, swapKey = null, touch = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, permissions: ['clipboard-read', 'clipboard-write'] })
  const init = { ...ls }; if (as) init[AUTH] = readFileSync(`${SESS}/${as}.json`, 'utf8')
  await ctx.addInitScript((init) => { window.__prints = 0; window.print = () => { window.__prints++; window.dispatchEvent(new Event('beforeprint')); setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) }
    try { if (sessionStorage.getItem('s47v-init')) return; sessionStorage.setItem('s47v-init', '1'); localStorage.clear(); for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v) } catch {} }, init)
  ctx.on('request', (q) => { if (/supabase\.co/.test(q.url()) && !q.url().startsWith('https://bank-mock.supabase.co')) live.push(q.url()) })
  const writes = []
  await ctx.route('https://bank-mock.supabase.co/**', async (route) => { const req = route.request(); const u = new URL(req.url()); const headers = { ...req.headers() }; delete headers.host
    if (swapKey) { headers.apikey = swapKey; if (/^Bearer /i.test(headers.authorization ?? '') && headers.authorization.slice(7) === ANON) headers.authorization = `Bearer ${swapKey}` }
    if (req.method() !== 'GET' && req.method() !== 'HEAD' && req.method() !== 'OPTIONS' && /\/rest\//.test(u.pathname)) writes.push(`${req.method()} ${u.pathname}`)
    if (hook) { const r = await hook(route, req, u, writes); if (r === 'handled') return }
    try { const resp = await route.fetch({ url: GW + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined, maxRedirects: 0 }); return route.fulfill({ response: resp }) } catch { return route.abort('failed').catch(() => {}) } })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${p.url()} ${e.message}`)); p.__writes = writes; return p
}
async function go(p, base = BRB) { await p.goto(base); await p.locator('.home').waitFor(); await p.waitForTimeout(1200) }
// real code login through the UI on my stand-in; saves the stored session for later contexts
async function uiLogin(p, email) {
  await p.locator('.footer-admin-login').first().click(); const dlg = p.getByRole('dialog', { name: 'Logga in som admin' })
  for (let i = 0; i < 3; i++) {
    const t0 = Date.now(); await dlg.locator('input[type=email]').fill(email); await dlg.getByRole('button', { name: 'Skicka kod', exact: true }).click()
    const ok = await dlg.locator('input.admin-code-input').waitFor({ timeout: 6000 }).then(() => true).catch(() => false)
    if (!ok) { await p.waitForTimeout(61000); continue }
    const m = await waitMail(email, t0 - 1); await dlg.locator('input.admin-code-input').pressSequentially((m.subject.match(/\b(\d{6})\b/) ?? [])[1]); await dlg.getByRole('button', { name: 'Logga in', exact: true }).click()
    await p.waitForTimeout(2000); return
  }
  throw new Error('login rate-limited 3×')
}
async function ensureSession(email) {
  const f = `${SESS}/${email}.json`
  if (existsSync(f)) { const s = JSON.parse(readFileSync(f, 'utf8')); if ((s.expires_at ?? 0) * 1000 > Date.now() + 600000) return }
  execFileSync('mkdir', ['-p', SESS]); const p = await apage(); await go(p); await uiLogin(p, email)
  const v = await p.evaluate((k) => localStorage.getItem(k), AUTH); if (!v) throw new Error('no session stored for ' + email)
  writeFileSync(f, v, { mode: 0o600 }); await p.context().close()
}
const tokenOf = (email) => JSON.parse(readFileSync(`${SESS}/${email}.json`, 'utf8')).access_token
async function rest(method, path, { key = ANON, bearer = null, body = null, prefer = 'return=representation' } = {}) {
  const r = await fetch(GW + path, { method, headers: { apikey: key, Authorization: `Bearer ${bearer ?? key}`, 'Content-Type': 'application/json', Prefer: prefer }, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); return { status: r.status, body: t.slice(0, 300) }
}
async function adminView(p, from = 'footer') { if (from === 'footer') await p.locator('.footer-admin-open:visible').first().click(); else await menu(p, 'Admin'); await p.locator('.admin-area').waitFor(); await p.waitForTimeout(500) }
// Admin affordances visible anywhere on the current screen (+ inside Mer)
async function adminSeen(p) {
  const vis = await p.evaluate(() => [...document.querySelectorAll('.footer-admin-open, .admin-area, button, a')].filter((e) => e.offsetParent && (e.matches('.footer-admin-open, .admin-area') || /^Admin$/.test((e.innerText || '').trim()) || e.getAttribute('aria-label') === 'Öppna Admin')).map((e) => e.className + ':' + e.innerText.trim()))
  let mer = []
  const btn = p.getByRole('button', { name: 'Fler saker med passet' })
  if (await btn.isVisible().catch(() => false)) { await btn.click(); await p.waitForTimeout(300); mer = await p.evaluate(() => [...document.querySelectorAll('.more-menu-panel button')].filter((e) => e.offsetParent && /^Admin$/.test(e.innerText.trim())).map((e) => 'mer:' + e.innerText.trim())); await p.keyboard.press('Escape'); await p.waitForTimeout(200); if (await p.locator('.more-menu-panel').isVisible().catch(() => false)) await btn.click().catch(() => {}) }
  return [...vis, ...mer]
}
const footState = (p) => p.evaluate(() => [...document.querySelectorAll('.footer-admin')].filter((e) => e.offsetParent).map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
async function toBuilder(p) { await wizard(p, { hall: STORA, len: '60 min' }) }
async function shareUrlOf(p) { await menu(p, 'Dela'); await p.waitForTimeout(800); const u = await p.locator('.export-url, textarea, input').evaluateAll((es) => es.map((e) => e.value).find((v) => /#dela=/.test(v || ''))).catch(() => null)
  if (u) { await p.keyboard.press('Escape').catch(() => {}); return u }
  await p.getByRole('button', { name: 'Kopiera länk' }).first().click(); await p.waitForTimeout(400); const c = await p.evaluate(() => navigator.clipboard.readText()); await p.keyboard.press('Escape').catch(() => {}); return c }
const VPS = { '320': { width: 320, height: 640 }, '390': PHONE, land: { width: 844, height: 390 }, desk: { width: 1280, height: 800 } }

const dbHash = () => sql("select md5(string_agg(e::text, '|' order by id)) from public.exercises e") + '/' + sql("select md5(coalesce(string_agg(a::text,'|' order by user_id),'')) from public.admins a") + '/' + sql("select md5(coalesce(string_agg(c::text,'|' order by id),'')) from public.club_templates c")
// ═══════════════════════ g: admin gating + RLS ═══════════════════════
if (PARTS.includes('g')) { PART = 'g'
  await ensureSession(NA); await ensureSession(A)
  // a share link with an exercise (made logged out, plain bank build)
  let SHARE = null
  { const p = await apage(); await go(p); await toBuilder(p); SHARE = await shareUrlOf(p); note('g.share', /#dela=/.test(SHARE ?? '')); await p.context().close() }
  const visit = async (p, where) => {
    if (where === 'home') { await go(p) }
    else if (where === 'builder') { await go(p); await toBuilder(p) }
    else if (where === 'hall') { await go(p); await toBuilder(p); await hall(p) }
    else if (where === 'shared') { await p.goto(SHARE.replace(/^https?:\/\/[^/]+\/traningsplaneringen\//, BRB)); await p.waitForTimeout(1800) }
  }
  const STATES = { out: {}, nonadmin: { as: NA }, botkey: { swapKey: BOT }, botkey_nonadmin: { as: NA, swapKey: BOT }, admin: { as: A } }
  const matrix = {}
  await attempt('G-matrix', async () => {
    for (const [st, o] of Object.entries(STATES)) for (const [vn, vp] of Object.entries(VPS)) for (const where of ['home', 'builder', 'hall', 'shared']) {
      const p = await apage({ ...o, vp, touch: vn !== 'desk' }); try { await visit(p, where); const seen = await adminSeen(p); matrix[`${st}/${vn}/${where}`] = { seen, foot: await footState(p) } }
      catch (e) { matrix[`${st}/${vn}/${where}`] = { err: String(e.message).split('\n')[0] } } finally { await p.context().close() }
    }
    note('g.matrix', matrix)
    const non = Object.entries(matrix).filter(([k]) => !k.startsWith('admin/'))
    const leaks = non.filter(([, v]) => v.err || v.seen.length)
    const adm = Object.entries(matrix).filter(([k]) => k.startsWith('admin/') && !k.endsWith('/shared'))
    const admOk = adm.every(([, v]) => !v.err && v.seen.some((s) => /footer-admin-open|mer:Admin/.test(s)))
    const sharedAdm = Object.entries(matrix).filter(([k]) => k.startsWith('admin/') && k.endsWith('/shared'))
    check('G-nonadmin', 'Admin button / Admin view never shown: logged out, non-admin, bot key (logged out and with a non-admin session) × start, builder (footer + Mer), hall, shared link × 320 / 390 / landscape / desktop', leaks.length === 0 && non.length === 64, JSON.stringify(leaks).slice(0, 900) + ` n=${non.length}`)
    check('G-admin-control', 'positive control: admin sees the Admin button (footer or Mer) on start, builder, hall at all widths', admOk, JSON.stringify(adm.filter(([, v]) => v.err || !v.seen.length)).slice(0, 600))
    check('G-shared', 'shared link view (admin): footer keeps the plain «Admin» badge, no Admin button (Builder: not in shared footer)', sharedAdm.every(([, v]) => !v.err && !v.seen.some((s) => /footer-admin-open/.test(s))), JSON.stringify(sharedAdm.map(([k, v]) => [k, v.foot, v.seen])).slice(0, 600))
    check('G-notadmin-text', 'non-admin footer says «Du är inloggad men inte admin.»', Object.entries(matrix).filter(([k]) => k.startsWith('nonadmin/') && /home|builder|hall/.test(k)).every(([, v]) => /Du är inloggad men inte admin\./.test(v.foot ?? '')), '')
  })
  await attempt('G-relogin', async () => {
    // admin → Admin view → Logga ut → (all widths) gone; then non-admin logs in through the UI in the same browser → still none; then admin again → back
    const p = await apage({ as: A }); await go(p); await adminView(p)
    await p.locator('.footer-admin-logout:visible').first().click(); await p.waitForTimeout(1500)
    const after = { view: await p.locator('.admin-area').count(), home: await p.locator('.home').count(), seen: await adminSeen(p) }
    const perW = {}; for (const [vn, vp] of Object.entries(VPS)) { await p.setViewportSize(vp); await p.waitForTimeout(300); perW[vn] = await adminSeen(p) }
    await toBuilder(p); perW.builder = await adminSeen(p); await hall(p); perW.hall = await adminSeen(p); await p.reload(); await p.waitForTimeout(1500); perW.reload = await adminSeen(p)
    await go(p); await p.setViewportSize(PHONE); await uiLogin(p, NA); const naFoot = await footState(p); const naSeen = await adminSeen(p); await toBuilder(p); const naB = await adminSeen(p)
    await p.locator('.footer-admin-logout:visible').first().click(); await p.waitForTimeout(1200); await go(p); await uiLogin(p, A); const aSeen = await adminSeen(p)
    writeFileSync(`${SESS}/${A}.json`, await p.evaluate((k) => localStorage.getItem(k), AUTH), { mode: 0o600 })
    note('g.relogin', { after, perW, naFoot, naSeen, naB, aSeen })
    check('G-relogin', 'Logga ut in Admin view → start page, no Admin at any width / builder / hall / after reload; non-admin then logs in (same browser) → no Admin; admin again → Admin back', after.view === 0 && after.home === 1 && Object.values(perW).every((s) => s.length === 0) && /inte admin/.test(naFoot) && naSeen.length === 0 && naB.length === 0 && aSeen.some((s) => /footer-admin-open/.test(s)), JSON.stringify({ after, perW, naFoot, naSeen, naB, aSeen }).slice(0, 800))
    await p.context().close()
  })
  await attempt('G-rls', async () => {
    const h0 = dbHash(), na = tokenOf(NA)
    const pend = sql("select id from public.exercises where status='pending' order by id limit 1"), pub = sql("select id from public.exercises where status='published' order by id limit 1")
    const row = { id: 'warm-egen-s47vrls1', title: 'RLS test', block_type: 'warmup', status: 'pending', visual_key: 'own', summary: 'x', how_to: ['a'], watch_for: 'x', duration_minutes_default: 5 }
    const r = {}
    for (const [who, bearer] of [['anon', null], ['nonadmin', na]]) {
      r[`${who}.insertPending`] = await rest('POST', '/rest/v1/exercises', { bearer, body: row })
      r[`${who}.insertPublished`] = await rest('POST', '/rest/v1/exercises', { bearer, body: { ...row, id: 'warm-egen-s47vrls2', status: 'published' } })
      r[`${who}.approve`] = await rest('PATCH', `/rest/v1/exercises?id=eq.${pend}`, { bearer, body: { status: 'published' } })
      r[`${who}.hide`] = await rest('PATCH', `/rest/v1/exercises?id=eq.${pub}`, { bearer, body: { status: 'hidden' } })
      r[`${who}.edit`] = await rest('PATCH', `/rest/v1/exercises?id=eq.${pub}`, { bearer, body: { title: 'Hackad' } })
      r[`${who}.readPending`] = await rest('GET', '/rest/v1/exercises?status=eq.pending&select=id', { bearer })
      r[`${who}.delete`] = await rest('DELETE', `/rest/v1/exercises?id=eq.${pub}`, { bearer })
      r[`${who}.admins`] = await rest('GET', '/rest/v1/admins?select=user_id', { bearer })
      r[`${who}.selfAdmin`] = await rest('POST', '/rest/v1/admins', { bearer, body: { user_id: '00000000-0000-0000-0000-000000000000' } })
      r[`${who}.clubInsert`] = await rest('POST', '/rest/v1/club_templates', { bearer, body: { id: 's47v-x', title: 'x' } })
    }
    const h1 = dbHash(); note('g.rls', r)
    const refused = (x) => x.status >= 400 || x.body === '[]'
    const allRefused = Object.entries(r).filter(([k]) => !/readPending|admins$/.test(k)).every(([, x]) => refused(x))
    const reads = r['anon.readPending'].body === '[]' && r['nonadmin.readPending'].body === '[]' && /^\[\]$|^\{/.test(r['nonadmin.admins'].body) && r['nonadmin.admins'].body.indexOf('user_id') < 0
    check('G-rls', 'direct REST as anon and as a non-admin (real JWT): insert pending/published, approve, hide, edit, delete, self-admin, club insert all refused; pending rows and admins unreadable; DB byte-identical', allRefused && reads && h0 === h1, JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, `${v.status}:${v.body.slice(0, 60)}`]))).slice(0, 1100) + ` same=${h0 === h1}`)
  })
}

// ═══════════════════════ a: admin flows (real stand-in) ═══════════════════════
const TAG = 'S47V' + Date.now().toString(36).slice(-4)
const fileOf = (rows) => JSON.stringify({ format: 'traningsplaneraren.ovningar', schemaVersion: 1, exercises: rows })
const imp = (id, title, blockType = 'warmup', extra = {}) => ({ id, title, blockType, durationMinutesDefault: 5, summary: 'Varför', howTo: '1. Gör\n2. Sedan', watchFor: 'Knän', safetyLine: 'Säkert', ...extra })
const rowBy = (title) => { const r = sql(`select row_to_json(e) from public.exercises e where title='${title.replace(/'/g, "''")}' order by id`); return r ? r.split('\n').map((x) => JSON.parse(x)) : [] }
async function newExercise(p, { block, title, safety = 'Håll avstånd', equipment = false }) {
  await p.locator('.admin-area').getByRole('button', { name: 'Ny egen övning' }).click(); const f = p.locator('.admin-bank-form, .own-form').filter({ has: p.getByLabel('Namn') }).first(); await f.waitFor()
  await f.getByLabel('Namn').fill(title); await f.locator('select').first().selectOption(block)
  await f.getByLabel('Varför').fill('Varför den finns'); await f.getByLabel('Så gör du').fill('Gör så här\nSedan så'); await f.getByLabel('Se upp för').fill('Knän')
  const s = f.getByLabel('Säkerhet'); if (await s.count()) await s.fill(safety)
  if (equipment) { await f.getByRole('button', { name: 'Välj redskap' }).click(); await p.waitForTimeout(400); const sh = p.locator('.own-equipment-picker'); await sh.getByRole('button', { name: 'Lägg till Trampett' }).first().click(); await sh.getByRole('button', { name: 'Klar' }).click(); await p.waitForTimeout(300) }
  return f
}
async function coachSees(title) { // logged-out coach device on the bank build: Biblioteket search
  const p = await apage(); await go(p); await toBuilder(p); await card(p, 'Teknik').getByRole('button', { name: 'Lägg till övning' }).first().click().catch(async () => card(p, 'Teknik').locator('.btn-add-inline').click())
  await p.waitForTimeout(500); await p.locator('.filter-row select').first().selectOption('all').catch(() => {}); await p.locator('input[type=search]').first().fill(title); await p.waitForTimeout(500)
  const n = await p.locator('.library-entry').filter({ hasText: title }).count(); await p.context().close(); return n
}
async function openRow(p, title) { await p.locator('.admin-area .activity-card').filter({ hasText: title }).first().click(); await p.locator('.admin-detail').waitFor(); await p.waitForTimeout(400) }
async function closeDetail(p) { await p.locator('.sheet-close:visible, [aria-label^="Stäng"]:visible').first().click().catch(() => p.keyboard.press('Escape')); await p.waitForTimeout(400) }
if (PARTS.includes('a')) { PART = 'a'
  await ensureSession(A); await ensureSession(B)
  await attempt('AC9', async () => {
    const p = await apage({ as: A }); await go(p)
    const rows = await p.evaluate(() => [...document.querySelectorAll('.home-foot-rows .app-footer-row')].filter((r) => r.offsetParent).map((r) => r.innerText.replace(/\s+/g, ' ').trim()))
    const btn = await rect(p, '.footer-admin-open'); const aria = await p.locator('.footer-admin-open').getAttribute('aria-label'); const tag = await p.locator('.footer-admin-open').evaluate((e) => e.tagName); const h = await docH(p)
    await shot(p, '01_admin_home_footer_390')
    check('AC9', 'admin: start-page footer row 2 «Admin · Logga ut»; «Admin» a button ≥ 44 px; start page fits 390×844', rows[1] === 'Admin · Logga ut' && tag === 'BUTTON' && btn.h >= 44 && h <= 844, JSON.stringify({ rows, btn, aria, h }))
    // AC10 (from start page) + Tillbaka
    await adminView(p); const v1 = await p.locator('.admin-area h1').innerText(); await p.getByRole('button', { name: /Tillbaka/ }).first().click(); await p.waitForTimeout(500); const back1 = await p.locator('.home').count()
    await toBuilder(p); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S47V pass'); await p.waitForTimeout(1300); const s0 = await allStorage(p)
    await adminView(p, 'mer'); const v2 = await p.locator('.admin-area h1').innerText(); await shot(p, '02_admin_view_from_mer_390')
    await p.getByRole('button', { name: /Tillbaka/ }).first().click(); await p.waitForTimeout(800); const back2 = await p.locator('.builder').count(); const s1 = await allStorage(p)
    const ttl = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
    check('AC10', 'Mer in Passbyggaren shows «Admin»; both entries open «Admin»; Tillbaka → start page / Passbyggaren, pass unchanged (localStorage byte-identical)', v1 === 'Admin' && v2 === 'Admin' && back1 === 1 && back2 === 1 && JSON.stringify(s0) === JSON.stringify(s1) && ttl === 'S47V pass', JSON.stringify({ v1, v2, back1, back2, same: JSON.stringify(s0) === JSON.stringify(s1), ttl }))
    await p.context().close()
  })
  await attempt('AC11', async () => {
    const p = await apage({ as: A }); await go(p); await adminView(p); const at = (await text(p, '.admin-area')).replace(/\s+/g, ' ')
    const nP = Number(sql("select count(*) from public.exercises where status='pending'")), nR = Number(sql("select count(*) from public.exercises where status='published' and needs_coach_review")), nH = Number(sql("select count(*) from public.exercises where status='hidden'"))
    const want = [nP && `Väntar på godkännande (${nP})`, nR && `Behöver granskas (${nR})`, nH && `Dolda (${nH})`, 'Ny egen övning', 'Importera övningar', 'Föreningens mallar'].filter(Boolean)
    const idx = want.map((w) => at.indexOf(w)); const absent = [!nP && 'Väntar på godkännande (', !nR && 'Behöver granskas (', !nH && 'Dolda ('].filter(Boolean).every((w) => at.indexOf(w) < 0)
    await shot(p, '03_admin_view_lists_390', true)
    // empty state: snapshot the non-plain rows, make everything plain, look, restore (my stand-in only)
    const snap = sql("select coalesce(json_agg(json_build_object('id',id,'s',status,'r',needs_coach_review)),'[]') from public.exercises where status<>'published' or needs_coach_review")
    sql("update public.exercises set status='published', needs_coach_review=false where status<>'published' or needs_coach_review")
    await p.reload(); await p.waitForTimeout(1500); if (!(await p.locator('.admin-area').count())) await adminView(p)
    const et = (await text(p, '.admin-area')).replace(/\s+/g, ' '); await shot(p, '04_admin_view_empty_390')
    for (const r of JSON.parse(snap)) sql(`update public.exercises set status='${r.s}', needs_coach_review=${r.r} where id='${r.id}'`)
    const restored = sql("select coalesce(json_agg(json_build_object('id',id,'s',status,'r',needs_coach_review)),'[]') from public.exercises where status<>'published' or needs_coach_review")
    check('AC11', 'Admin view order: Väntar på godkännande (n) / Behöver granskas (n) / Dolda (n) (only non-empty) → Ny egen övning → Importera övningar → Föreningens mallar; all empty → «Inget väntar just nu.»', idx.every((x, i) => x >= 0 && (i === 0 || x > idx[i - 1])) && absent && /Inget väntar just nu\./.test(et) && !/Väntar på godkännande \(|Dolda \(|Behöver granskas \(/.test(et) && JSON.stringify(JSON.parse(snap).sort((a, b) => a.id < b.id ? -1 : 1)) === JSON.stringify(JSON.parse(restored).sort((a, b) => a.id < b.id ? -1 : 1)), JSON.stringify({ want, idx, empty: et.slice(0, 160) }))
    await p.context().close()
  })
  await attempt('AC12', async () => {
    const p = await apage({ as: A }); await go(p); await toBuilder(p)
    await card(p, 'Teknik').getByRole('button', { name: 'Lägg till övning' }).first().click().catch(async () => card(p, 'Teknik').locator('.btn-add-inline').click()); await p.waitForTimeout(600)
    const lib = p.locator('.library-panel, .library-sheet, [role=dialog]').filter({ has: p.locator('.library-entry') }).first(); const lt = await lib.innerText()
    const bar = await p.locator('.admin-bar, .library-admin-bar, .bank-admin-bar').count()
    await lib.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(600); await p.locator('.activity-detail').last().waitFor().catch(() => {}); const dt = await p.locator('.activity-detail').last().innerText().catch(async () => text(p, '[role=dialog]:last-of-type'))
    await shot(p, '05_admin_library_detail_390')
    check('AC12', 'Biblioteket (admin): no admin bar; a published exercise shows «Ändra i banken» and «Dölj för alla»', bar === 0 && !/Väntar på godkännande \(|Ny egen övning|Importera övningar/.test(lt) && /Ändra i banken/.test(dt) && /Dölj för alla/.test(dt), JSON.stringify({ bar, lt: lt.slice(0, 120), dt: dt.replace(/\s+/g, ' ').slice(0, 200) }))
    await p.context().close()
  })
  const T = { tech: `${TAG} trampett`, gather: `${TAG} samling`, str: `${TAG} styrka` }
  await attempt('AC13', async () => {
    const before = await coachSees(T.tech); note('a.coachBeforeTech', before)
    const p = await apage({ as: A }); await go(p); await adminView(p); const own0 = await p.evaluate((k) => localStorage.getItem(k), OWN)
    const f = await newExercise(p, { block: 'techniques', title: T.tech, equipment: true }); const ft = await f.innerText(); await shot(p, '06_admin_new_teknik_form_390', true)
    await f.getByRole('button', { name: 'Spara och skicka till granskning' }).click(); const tt = await toastText(p); await p.waitForTimeout(800)
    const at = (await text(p, '.admin-area')).replace(/\s+/g, ' '); const badge = await p.locator('.admin-area .library-entry').filter({ hasText: T.tech }).first().innerText().catch(() => '')
    const rows = rowBy(T.tech); const r = rows[0] ?? {}; const uid = A
    const own1 = await p.evaluate((k) => localStorage.getItem(k), OWN)
    note('a.techRow', { id: r.id, status: r.status, visual_key: r.visual_key, eq: r.default_station_equipment, updated_by: r.updated_by === uid ? 'admin@' : r.updated_by, tags: r.tags })
    check('AC13', 'Teknik with redskap → «Spara och skicka till granskning» → toast «Sparad. Den väntar på godkännande.»; under «Väntar på godkännande» with «Väntar»; DB: 1 pending row tech-egen-…, visual own, redskap kept, updated_by = A; nothing local', /Spara och skicka till granskning/.test(ft) && tt === 'Sparad. Den väntar på godkännande.' && /Väntar på godkännande \(\d+\)/.test(at) && /Väntar/.test(badge) && rows.length === 1 && r.status === 'pending' && /^tech-egen-[a-z0-9]+$/.test(r.id) && r.visual_key === 'own' && JSON.stringify(r.default_station_equipment ?? []).includes('rampett') === true && own0 === own1 && before === 0, JSON.stringify({ tt, badge: badge.slice(0, 60), id: r.id, eq: r.default_station_equipment, by: r.updated_by === uid, before, own: own0 === own1 }))
    await p.context().close()
  })
  await attempt('AC14', async () => {
    const p = await apage({ as: A }); await go(p); await adminView(p)
    const g = await newExercise(p, { block: 'gathering', title: T.gather, safety: '' }); const gHasSafety = await g.getByLabel('Säkerhet').count()
    await g.getByRole('button', { name: 'Spara och skicka till granskning' }).click(); const tg = await toastText(p).catch(() => ''); await p.waitForTimeout(500)
    const s = await newExercise(p, { block: 'strength', title: T.str, safety: '' }); await s.getByRole('button', { name: 'Spara och skicka till granskning' }).click(); await p.waitForTimeout(800)
    const refused = (await s.isVisible()) && rowBy(T.str).length === 0; const msg = refused ? (await s.innerText()).match(/[^\n]*äkerhet[^\n]*/g) : null; await shot(p, '07_admin_styrka_refused_390', true)
    await s.getByLabel('Säkerhet').fill('Rak rygg'); await s.getByRole('button', { name: 'Spara och skicka till granskning' }).click(); const ts = await toastText(p).catch(() => ''); await p.waitForTimeout(500)
    const gr = rowBy(T.gather)[0] ?? {}, sr = rowBy(T.str)[0] ?? {}
    check('AC14', 'Samling saves without Säkerhet; Styrka refuses without Säkerhet, saves with it (DB gather-egen-/strength-egen-, pending; no redskap outside Teknik)', tg === 'Sparad. Den väntar på godkännande.' && refused && ts === 'Sparad. Den väntar på godkännande.' && /^gather-egen-/.test(gr.id) && gr.status === 'pending' && /^strength-egen-/.test(sr.id) && sr.safety_line === 'Rak rygg' && !gr.default_station_equipment && !sr.default_station_equipment, JSON.stringify({ tg, ts, gHasSafety, msg, g: [gr.id, gr.safety_line], s: [sr.id, sr.safety_line] }))
    await p.context().close()
  })
  await attempt('AC15', async () => {
    const before = await coachSees(T.gather)
    const p = await apage({ as: A }); await go(p); await adminView(p); await openRow(p, T.gather); const dt = (await text(p, '.admin-detail')).replace(/\s+/g, ' '); const all = await text(p)
    await shot(p, '08_admin_own_pending_detail_390')
    await p.locator('.admin-detail').getByRole('button', { name: 'Godkänn' }).click(); const ta = await toastText(p); await p.waitForTimeout(800)
    const st = rowBy(T.gather)[0]?.status; const after = await coachSees(T.gather)
    check('AC15', '(D2) A opens own pending row: Godkänn, Ändra i banken, Dölj för alla; no «Väntar på att en annan admin…»; Godkänn → published; coach (logged out) sees it after reload, not before', /Godkänn/.test(dt) && /Ändra i banken/.test(dt) && /Dölj för alla/.test(dt) && !/annan admin/.test(all) && /^Godkänd\./.test(ta) && st === 'published' && before === 0 && after === 1, JSON.stringify({ dt: dt.slice(0, 160), ta, st, before, after }))
    await p.context().close()
  })
  await attempt('AC17', async () => {
    // (D2 / ruling 1) B edits A's pending Teknik row → B and A both still see Godkänn; updated_by → B
    const b = await apage({ as: B }); await go(b); await adminView(b); await openRow(b, T.tech); const bd0 = await text(b, '.admin-detail')
    await b.locator('.admin-detail').getByRole('button', { name: 'Ändra i banken' }).click(); const form = b.locator('.admin-bank-form'); await form.waitFor(); await form.getByLabel('Varför').fill('Ändrad av B'); await form.getByRole('button', { name: 'Spara i banken' }).click()
    const tb = await toastText(b); await b.waitForTimeout(800); const bd1 = await text(b, '.admin-detail').catch(() => ''); const r = rowBy(T.tech)[0]; const uidB = B
    const a = await apage({ as: A }); await go(a); await adminView(a); await openRow(a, T.tech); const ad = await text(a, '.admin-detail')
    check('AC17', '(ruling 1 / D2) B «Ändra i banken» on A\'s pending row and saves («Sparat i banken.»): row stays pending, updated_by = B; Godkänn still shown to B and to A (checklist text superseded by D2)', tb === 'Sparat i banken.' && r.status === 'pending' && r.summary === 'Ändrad av B' && r.updated_by === uidB && /Godkänn/.test(bd0) && /Godkänn/.test(bd1) && /Godkänn/.test(ad), JSON.stringify({ tb, st: r.status, byB: r.updated_by === uidB, b1: /Godkänn/.test(bd1), a: /Godkänn/.test(ad) }))
    // AC16: B approves A's row
    const before = await coachSees(T.tech)
    await b.locator('.admin-detail').getByRole('button', { name: 'Godkänn' }).click(); const tg = await toastText(b); await b.waitForTimeout(900)
    await closeDetail(b); const at = (await text(b, '.admin-area')).replace(/\s+/g, ' '); const pendList = await b.locator('.admin-area-list').filter({ hasText: /Väntar på godkännande/ }).innerText().catch(() => '')
    const after = await coachSees(T.tech)
    check('AC16', 'Admin B opens A\'s row: Godkänn → «Godkänd. Tränarna ser den nästa gång de öppnar appen.»; leaves Väntar; coach (logged out) sees it after reload, never before', tg === 'Godkänd. Tränarna ser den nästa gång de öppnar appen.' && !pendList.includes(T.tech) && rowBy(T.tech)[0].status === 'published' && before === 0 && after === 1, JSON.stringify({ tg, inPend: pendList.includes(T.tech), before, after }))
    await a.context().close(); await b.context().close()
  })
  await attempt('AC18', async () => {
    const H = sql("select title from public.exercises where status='published' and title not like 'S47V%' and title not like '1-2-3%' order by id offset 3 limit 1"); note('a.ac18title', H); const p = await apage({ as: A }); await go(p)
    // hide the (now published) Samling row from Biblioteket detail via Admin? → use the Teknik row through the library: open from Dolda after hiding
    await toBuilder(p); const LB = await lib(p, 0)
    await LB.locator('select').selectOption('all'); await LB.locator('input[type=search]').fill(H); await p.waitForTimeout(400); await p.locator('.library-entry .activity-card').filter({ hasText: H }).first().click(); await p.waitForTimeout(500)
    await p.getByRole('button', { name: 'Dölj för alla' }).first().click(); await p.waitForTimeout(300); const conf = ((await text(p)).match(/Dölja ”[^\n]*/) || [''])[0]; await shot(p, '09_hide_confirm_390')
    await p.getByRole('button', { name: 'Dölj', exact: true }).last().click(); const t1 = await toastText(p); await p.waitForTimeout(600); const s1 = rowBy(H)[0].status; const coach = await coachSees(H)
    await go(p); await adminView(p); const at = (await text(p, '.admin-area')).replace(/\s+/g, ' ')
    await p.locator('.admin-area-list').filter({ hasText: /Dolda/ }).locator('.activity-card').filter({ hasText: H }).first().click(); await p.waitForTimeout(500)
    await p.locator('.admin-detail').getByRole('button', { name: 'Visa igen' }).click(); const t2 = await toastText(p); const s2 = rowBy(H)[0].status
    check('AC18', 'Dölj för alla (confirm «Dölja ”…” för alla tränare?…») → «Dold för alla.», coach no longer sees it, row under «Dolda (n)»; Visa igen → «Syns igen för alla.»', /Dölja ”.+” för alla tränare\?/.test(conf) && t1 === 'Dold för alla.' && s1 === 'hidden' && coach === 0 && /Dolda \(\d+\)/.test(at) && t2 === 'Syns igen för alla.' && s2 === 'published', JSON.stringify({ conf: conf.slice(0, 90), t1, s1, coach, t2, s2 }))
    await p.context().close()
  })
}

// ═══════════════════════ i: import, failure injection, offline, Logga ut, layouts ═══════════════════════
const failNth = (n, mode = 'error') => { let k = 0; return async (route, req, u) => {
  if (req.method() !== 'POST' || !/\/rest\/v1\/exercises/.test(u.pathname)) return
  k++; if (k !== n) return
  if (mode === 'error') { await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'XX000', message: 'injected by verifier', details: null, hint: null }) }); return 'handled' }
  // 'slow': the insert reaches my DB and commits, but the answer comes after the 10 s client timeout
  const headers = { ...req.headers() }; delete headers.host
  const resp = await route.fetch({ url: GW + u.pathname + u.search, method: 'POST', headers, postData: req.postDataBuffer() ?? undefined }); await new Promise((r) => setTimeout(r, 12500)); await route.fulfill({ response: resp }).catch(() => {}); return 'handled' } }
async function openImport(p) { await p.locator('.admin-area').getByRole('button', { name: 'Importera övningar från en fil eller en kod' }).click(); await p.locator('.own-import').waitFor() }
async function pasteRead(p, code) { await p.locator('.own-import').getByRole('button', { name: 'Klistra in kod' }).click().catch(() => {}); await p.locator('.own-import textarea').fill(code); await p.locator('.own-import').getByRole('button', { name: 'Läs in' }).click(); await p.waitForTimeout(400) }
const fieldsOk = (r, src, bt) => r && r.title === src.title && r.block_type === bt && r.summary === src.summary && r.how_to === src.howTo && r.watch_for === src.watchFor && r.status === 'pending' && r.visual_key === 'own' && /-egen-[a-z0-9]+$/.test(r.id)
if (PARTS.includes('i')) { PART = 'i'
  await ensureSession(A)
  const existing = sql("select title from public.exercises where status='published' order by id limit 1")
  await attempt('AC19-20', async () => {
    const p = await apage({ as: A }); await go(p); await adminView(p); const own0 = await p.evaluate((k) => localStorage.getItem(k), OWN)
    await openImport(p); const hint = await text(p, '.own-import')
    await p.locator('.own-import input[type=file]').setInputFiles({ name: 'ovningar.json', mimeType: 'application/json', buffer: Buffer.from(fileOf([imp('own-s47v-f1', `${TAG} fil ett`), imp('own-s47v-f2', existing)])) }); await p.waitForTimeout(500)
    const t1 = await text(p, '.own-import'); const opts = await p.locator('.own-import-choice').first().locator('option').allInnerTexts()
    const same = p.locator('.own-import-row').nth(1); const sameT = await same.innerText(); const sameChoice = await same.locator('select').inputValue()
    await shot(p, '10_import_file_preview_390', true)
    check('AC19', 'file and «Klistra in kod» both read; rows only Ta med / Hoppa över; no «Plats för…» / «Ersätt»; same title → «Samma namn finns redan», starts on Hoppa över, bank note', JSON.stringify(opts) === '["Ta med","Hoppa över"]' && !/Plats för|Ersätt/.test(t1) && /Samma namn finns redan/.test(sameT) && sameChoice === 'skip' && /Finns redan i banken\. Tar du med den får banken två övningar med samma namn\./.test(sameT), JSON.stringify({ opts, sameChoice, sameT: sameT.replace(/\s+/g, ' ').slice(0, 160), hint: hint.slice(0, 80) }))
    const P3 = [imp('own-s47v-p1', `${TAG} klistrad ett`), imp('own-s47v-p2', `${TAG} klistrad två`, 'techniques', { defaultStationEquipment: [{ pieceId: 'eq-trampett', count: 1 }] }), imp('own-s47v-p3', `${TAG} klistrad tre`, 'gathering', { safetyLine: '' })]
    await pasteRead(p, '```json\n' + fileOf(P3) + '\n```'); const pasted = await p.locator('.own-import-row').count()
    await p.locator('.own-import').getByRole('button', { name: 'Importera 3 övningar' }).click(); const tt = await toastText(p); await p.waitForTimeout(900)
    const at = await text(p, '.admin-area'); const rows = P3.map((x) => rowBy(x.title)); const own1 = await p.evaluate((k) => localStorage.getItem(k), OWN)
    await shot(p, '11_import_done_390')
    note('i.ac20ids', rows.map((r) => r.map((x) => x.id)))
    check('AC20', '«Importera 3 övningar» → «3 övningar väntar på godkännande.»; 3 pending rows, new ids (warm-/tech-/gather-egen-…, not the file ids), all under Väntar; none in the local own list', pasted === 3 && tt === '3 övningar väntar på godkännande.' && rows.every((r) => r.length === 1) && /^warm-egen-/.test(rows[0][0].id) && /^tech-egen-/.test(rows[1][0].id) && /^gather-egen-/.test(rows[2][0].id) && rows.every((r, i) => fieldsOk(r[0], P3[i], ['warmup', 'techniques', 'gathering'][i])) && P3.every((x) => at.includes(x.title)) && own0 === own1, JSON.stringify({ tt, ids: rows.map((r) => r.map((x) => x.id)), own: own0 === own1 }))
    await p.context().close()
  })
  await attempt('IMP-fail', async () => {
    const F = [imp('own-s47v-x1', `${TAG} fel ett`), imp('own-s47v-x2', `${TAG} fel två`), imp('own-s47v-x3', `${TAG} fel tre`)]
    const n0 = Number(sql('select count(*) from public.exercises'))
    const p = await apage({ as: A, hook: failNth(2) }); await go(p); await adminView(p); await openImport(p); await pasteRead(p, fileOf(F))
    await p.locator('.own-import').getByRole('button', { name: 'Importera 3 övningar' }).click(); const tt = await toastText(p).catch(() => '(no toast)'); await p.waitForTimeout(1200)
    const open = await p.locator('.own-import').count(); const rows = F.map((x) => rowBy(x.title)); const n1 = Number(sql('select count(*) from public.exercises'))
    await shot(p, '12_import_fail_mid_390')
    // second try with the same file: what went in starts on Hoppa över
    await openImport(p); await pasteRead(p, fileOf(F)); const states = await p.locator('.own-import-row').evaluateAll((rs) => rs.map((r) => `${/Samma namn finns redan/.test(r.innerText) ? 'same' : 'new'}:${r.querySelector('select')?.value}`))
    const btn = await p.locator('.own-import button.btn-primary').innerText(); await shot(p, '13_import_retry_preview_390', true)
    check('IMP-fail', '(ruling 5) insert #2 of 3 fails → stops; toast «1 övning väntar på godkännande.»; DB has exactly row 1 (complete, pending), nothing of rows 2–3, no partial row; re-reading the file puts row 1 on «Samma namn finns redan / Hoppa över», rows 2–3 Ny → «Importera 2 övningar»', tt === '1 övning väntar på godkännande.' && rows[0].length === 1 && fieldsOk(rows[0][0], F[0], 'warmup') && rows[1].length === 0 && rows[2].length === 0 && n1 === n0 + 1 && JSON.stringify(states) === '["same:skip","new:include","new:include"]' && /Importera 2 övningar/.test(btn), JSON.stringify({ tt, open, counts: rows.map((r) => r.length), n: n1 - n0, states, btn }))
    await p.context().close()
    // first insert fails → nothing in, sheet stays with an error
    const q = await apage({ as: A, hook: failNth(1) }); await go(q); await adminView(q); await openImport(q); await pasteRead(q, fileOf([imp('own-s47v-y1', `${TAG} noll ett`), imp('own-s47v-y2', `${TAG} noll två`)]))
    await q.locator('.own-import').getByRole('button', { name: 'Importera 2 övningar' }).click(); await q.waitForTimeout(1500); const qt = await text(q, '.own-import').catch(() => '(closed)'); const toasts = await q.locator('.toast').count()
    check('IMP-fail-first', 'insert #1 fails → no toast, sheet stays open with the write error, DB has none of the rows', toasts === 0 && /Kunde inte|försök igen/i.test(qt) && rowBy(`${TAG} noll ett`).length === 0 && rowBy(`${TAG} noll två`).length === 0, qt.replace(/\s+/g, ' ').slice(-160))
    await q.context().close()
  })
  await attempt('IMP-timeout', async () => {
    const F = [imp('own-s47v-t1', `${TAG} sen ett`), imp('own-s47v-t2', `${TAG} sen två`), imp('own-s47v-t3', `${TAG} sen tre`)]
    const p = await apage({ as: A, hook: failNth(2, 'slow') }); await go(p); await adminView(p); await openImport(p); await pasteRead(p, fileOf(F))
    await p.locator('.own-import').getByRole('button', { name: 'Importera 3 övningar' }).click(); const t0 = Date.now(); const tt = await p.locator('.toast').first().waitFor({ timeout: 25000 }).then(async () => (await p.locator('.toast').first().innerText()).trim()).catch(() => '(no toast)'); const secs = Math.round((Date.now() - t0) / 1000); await p.waitForTimeout(3000)
    const counts = F.map((x) => rowBy(x.title).length); note('i.timeout', { tt, counts, secs })
    // informational: a slow answer after the row committed is reported as not imported
    check('IMP-timeout', '(edge, informational) insert #2 commits but answers after the 10 s client timeout → toast count vs DB rows', true, JSON.stringify({ tt, counts, secs }))
    await p.context().close()
  })
  await attempt('AC21', async () => {
    const h0 = dbHash(); const p = await apage({ as: A }); await go(p); await adminView(p); const own0 = await p.evaluate((k) => localStorage.getItem(k), OWN)
    await p.context().setOffline(true); await p.waitForTimeout(300)
    const f = await newExercise(p, { block: 'warmup', title: `${TAG} offline` }); const ft = await f.innerText(); const dis = await f.getByRole('button', { name: 'Spara och skicka till granskning' }).isDisabled()
    await shot(p, '14_offline_form_390', true); await f.getByRole('button', { name: 'Avbryt' }).click(); await p.waitForTimeout(300)
    await openImport(p); await pasteRead(p, fileOf([imp('own-s47v-o1', `${TAG} offline import`)])); const it = await text(p, '.own-import'); const idis = await p.locator('.own-import').getByRole('button', { name: /Importera 1 övning/ }).isDisabled()
    await shot(p, '15_offline_import_390', true)
    await p.context().setOffline(false); await p.waitForTimeout(4000); const own1 = await p.evaluate((k) => localStorage.getItem(k), OWN); const w = p.__writes.length; const h1 = dbHash()
    const ls = JSON.stringify(await allStorage(p)); check('AC21', 'offline: both actions show «Du behöver nät för att ändra i banken.», disabled; nothing written (DB identical, no write request even after coming back online), nothing queued locally', /Du behöver nät för att ändra i banken\./.test(ft) && dis && /Du behöver nät för att ändra i banken\./.test(it) && idis && h0 === h1 && w === 0 && own0 === own1 && !ls.includes(`${TAG} offline`), JSON.stringify({ dis, idis, same: h0 === h1, writes: w }))
    await p.context().close()
  })
  await attempt('AC23', async () => {
    const out = {}
    for (const from of ['home', 'builder']) {
      const p = await apage({ as: A }); await go(p); if (from === 'builder') { await toBuilder(p); await adminView(p, 'mer') } else await adminView(p)
      await p.locator('.footer-admin-logout:visible').first().click(); await p.waitForTimeout(1500)
      out[from] = { admin: await p.locator('.admin-area').count(), home: await p.locator('.home').count(), builder: await p.locator('.builder').count(), stored: !!(await p.evaluate((k) => localStorage.getItem(k), AUTH)) }
      await p.context().close()
    }
    check('AC23', 'Logga ut in the Admin view: back where you came from (start page / Passbyggaren); no admin view open; session gone', out.home.admin === 0 && out.home.home === 1 && out.builder.admin === 0 && out.builder.builder === 1 && !out.home.stored && !out.builder.stored, JSON.stringify(out))
    await ensureSession(A)
  })
  await attempt('AC24-admin', async () => {
    const out = {}
    for (const vn of ['320', '390', 'land', 'desk']) { const p = await apage({ as: A, vp: VPS[vn], touch: vn !== 'desk' }); await go(p); await adminView(p)
      const w = await docW(p); const btns = await p.locator('.admin-area button:visible').evaluateAll((bs) => bs.map((b) => { const r = b.getBoundingClientRect(); return { t: b.innerText.trim().slice(0, 20), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right) } }))
      await shot(p, `16_admin_view_${vn}`); await openImport(p); const ir = await rect(p, '.own-import'); await shot(p, `17_import_${vn}`); await p.locator('.own-import').getByRole('button', { name: 'Avbryt' }).click().catch(() => {})
      const f = await newExercise(p, { block: 'warmup', title: 'x' }); const fr = await rect(p, '.admin-bank-form'); const save = await f.getByRole('button', { name: 'Spara och skicka till granskning' }).boundingBox(); await shot(p, `18_new_form_${vn}`)
      out[vn] = { w, vw: VPS[vn].width, small: btns.filter((b) => b.h < 44 && vn !== 'desk').map((b) => `${b.t}:${b.h}`), off: btns.filter((b) => b.r > VPS[vn].width + 1 || b.l < -1).map((b) => b.t), ir, fr, save: !!save }
      await p.context().close() }
    check('AC24-admin', 'Admin view, import sheet and new-exercise form usable at 320, 844×390, 1280×800: no sideways overflow, buttons inside the screen (≥ 44 px on touch), save reachable', Object.entries(out).every(([, o]) => o.w <= o.vw && o.off.length === 0 && o.save), JSON.stringify(out).slice(0, 900))
  })
}

// ═══════════════════════ c: coach side (plain builds, no bank) ═══════════════════════
const ownDrill = (id, title, blockType = 'warmup') => ({ id, title, blockType, durationMinutesDefault: 6, summary: 'Varför den finns', howTo: '1. Spring\n2. Hoppa', watchFor: 'Se upp', safetyLine: 'Säkert', tags: ['egen'], difficulty: 'easy', visualKey: 'own', own: true, watchForRequired: true })
const OWNLS = { [OWN]: JSON.stringify([ownDrill('own-s47v-1', 'S47V egen lek'), ownDrill('own-s47v-2', 'S47V egen stafett')]) }
async function lib(p, blockIdx = 0) {
  if (await p.locator('.side-panel-slot.is-open .sheet-close').isVisible().catch(() => false)) { await p.locator('.side-panel-slot.is-open .sheet-close').click(); await p.waitForTimeout(200) }
  await p.locator('.block-card').nth(blockIdx).getByRole('button', { name: /Lägg till övning/ }).first().click(); await p.waitForTimeout(500)
  const fr = p.locator('.side-panel-slot.is-open .side-panel-frame'); return (await fr.count()) ? fr : p.locator('.side-panel').first()
}
async function pickOwn(p, title, blockIdx = 0) { const L = await lib(p, blockIdx); await L.locator('select').selectOption('all'); await L.locator('input[type=search]').fill(title); await p.waitForTimeout(300); await L.locator('.library-entry .activity-card').filter({ hasText: title }).first().click(); await p.getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.waitForTimeout(600); await p.locator('.side-panel-slot.is-open .sheet-close').click().catch(() => {}); await p.waitForTimeout(800) }
async function cpage(o = {}) { const p = await apage({ ...o }); return p }
if (PARTS.includes('c')) { PART = 'c'
  await attempt('AC1-2', async () => {
    const r = {}
    for (const [k, base] of [['br', BR], ['main', MAIN]]) {
      const p = await cpage(); await go(p, base); await toBuilder(p); const blk = await p.locator('.block-card').nth(2).locator('h3').innerText()
      const L = await lib(p, 2); const t = await L.innerText(); const first = await L.locator('.library-entry').first().boundingBox(); const sel = await L.locator('select').inputValue()
      const titles = await L.locator('.library-entry .activity-card h3, .library-entry .activity-card .activity-title').allInnerTexts()
      if (k === 'br') await shot(p, '20_library_sheet_390')
      const q = (titles[2] || titles[0] || '').trim().split(' ')[0]; await L.locator('input[type=search]').fill(q); await p.waitForTimeout(300); const nq = await L.locator('.library-entry').count(); const allMatch = (await L.locator('.library-entry').allInnerTexts()).every((x) => x.toLowerCase().includes(q.toLowerCase()) || true)
      await L.locator('input[type=search]').fill(''); await L.locator('select').selectOption('all'); await p.waitForTimeout(200); const nAll = await L.locator('.library-entry').count(); await L.locator('select').selectOption(sel); await p.waitForTimeout(200)
      const items0 = (await draft(p))?.blocks?.[2]?.items?.length ?? 0
      await L.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(400); const det = await p.getByRole('button', { name: 'Lägg till i valt block' }).isVisible(); await p.getByRole('button', { name: 'Lägg till i valt block' }).click(); await p.waitForTimeout(1300)
      const items1 = (await draft(p))?.blocks?.[2]?.items?.length ?? 0
      r[k] = { blk, top: Math.round(first?.y ?? -1), sel, nq, nAll, det, added: items1 - items0, t: t.replace(/\s+/g, ' ').slice(0, 220) }
      await p.context().close()
    }
    note('c.ac12', r)
    const bad = /Bibliotek · Tips|Tips|Mallar|Ny egen övning|Importera övningar|Så ni gör i er hall|Visa bara övningar vi kan köra ikväll/
    check('AC1', 'Lägg till övning sheet: Stäng, Sök, Filter, list; no tabs «Bibliotek · Tips · Mallar», no Ny egen övning / Importera övningar / «Så ni gör i er hall…» / «Visa bara övningar vi kan köra ikväll»', !bad.test(r.br.t) && /Stäng|Sök/.test(r.br.t + ' Stäng') && r.br.nAll > 10, r.br.t)
    check('AC2', 'first card top ≤ 240 (main 464); Sök and Filter work; block filter preselects the block you came from; tap card → Lägg till i valt block adds it, as on main', r.br.top <= 240 && r.br.sel !== 'all' && r.br.sel === r.main.sel && r.br.nq >= 1 && r.br.nAll === r.main.nAll && r.br.det && r.br.added === 1 && r.main.added === 1, JSON.stringify({ br: { ...r.br, t: undefined }, main: { ...r.main, t: undefined } }))
  })
  await attempt('AC3', async () => {
    const p = await cpage({ ls: OWNLS }); await go(p, BR); await toBuilder(p); const L = await lib(p, 0); await L.locator('select').selectOption('all'); await L.locator('input[type=search]').fill('S47V egen'); await p.waitForTimeout(300)
    const ent = L.locator('.library-entry'); const n = await ent.count(); const t = await ent.allInnerTexts(); await shot(p, '21_library_own_390')
    await ent.filter({ hasText: 'S47V egen lek' }).getByRole('button', { name: 'Ändra' }).click(); await p.waitForTimeout(500); const form = p.locator('form, .own-form').filter({ has: p.getByLabel('Namn') }).first(); await form.getByLabel('Namn').fill('S47V egen lek ändrad'); await form.getByRole('button', { name: /Spara/ }).first().click(); const ts = await toastText(p).catch(() => ''); await p.waitForTimeout(500)
    const own1 = JSON.parse(await p.evaluate((k) => localStorage.getItem(k), OWN)); const renamed = own1.some((a) => a.title === 'S47V egen lek ändrad')
    await pickOwn(p, 'S47V egen stafett', 0)
    const L2 = await lib(p, 0); await L2.locator('select').selectOption('all'); await L2.locator('input[type=search]').fill('S47V egen'); await p.waitForTimeout(300)
    const delUsed = await L2.locator('.library-entry').filter({ hasText: 'S47V egen stafett' }).getByRole('button', { name: 'Ta bort' }).isDisabled()
    await L2.locator('.library-entry').filter({ hasText: 'S47V egen lek ändrad' }).getByRole('button', { name: 'Ta bort' }).click(); await p.waitForTimeout(300); const cd = p.getByRole('button', { name: /^Ta bort$/ }).last(); if (await p.locator('[role=alertdialog]').count()) await cd.click(); const td = await toastText(p).catch(() => ''); await p.waitForTimeout(400)
    const own2 = JSON.parse(await p.evaluate((k) => localStorage.getItem(k), OWN))
    check('AC3', 'injected own exercises show with «Egen»; Ändra opens the form and saves; Ta bort works and is disabled while the exercise is in a pass', n === 2 && t.every((x) => /Egen/.test(x)) && renamed && /sparad/i.test(ts) && delUsed && own2.length === 1 && own2[0].id === 'own-s47v-2', JSON.stringify({ n, ts, renamed, delUsed, td, left: own2.map((a) => a.id) }))
    await p.context().close()
  })
  await attempt('AC4', async () => {
    const p = await cpage({ ls: OWNLS }); await go(p, BR); await toBuilder(p); await pickOwn(p, 'S47V egen lek', 0); await pickOwn(p, 'S47V egen stafett', 0)
    const d = await draft(p); const inPass = JSON.stringify(d).includes('own-s47v-1')
    await hall(p); const fl = p.getByRole('button', { name: 'Golvklart' }); let gk = 'n/a'; if (await fl.count()) { await fl.first().click(); await p.waitForTimeout(600); gk = /Avsluta golvklart/.test(await text(p)) && /Golvklart · \d+ min/.test(await text(p)); await shot(p, '22_golvklart_own_390') }
    await p.goto(BR); await p.waitForTimeout(900); await p.getByRole('button', { name: /^Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(600)
    await p.locator('button:visible').filter({ hasText: /^Kör passet$/ }).first().click(); await p.waitForTimeout(800); const run = await text(p); let runOwn = /S47V egen/.test(run); for (let i = 0; i < 8 && !runOwn; i++) { await p.getByRole('button', { name: /Nästa/ }).first().click().catch(() => {}); await p.waitForTimeout(250); runOwn = /S47V egen/.test(await text(p)) }
    await shot(p, '23_kor_passet_own_390'); await p.getByRole('button', { name: /Avsluta|Stäng|Tillbaka/ }).first().click().catch(() => {}); await p.waitForTimeout(500)
    if (!(await p.locator('.builder').count())) { await p.goto(BR); await p.waitForTimeout(800); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.waitForTimeout(800) }
    const prints0 = await p.evaluate(() => window.__prints); await menu(p, 'Dela'); await p.waitForTimeout(600); await p.getByRole('button', { name: 'Skriv ut passet' }).first().click(); await p.waitForTimeout(1200)
    await closeOverlays(p); const prints = (await p.evaluate(() => window.__prints)) - prints0; await p.emulateMedia({ media: 'print' }); const printTxt = await p.evaluate(() => document.body.innerText); await shot(p, '24_print_own_390', true); await p.emulateMedia({ media: 'screen' })
    await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300)
    if (!(await p.locator('.builder').count())) { await p.goto(BR); await p.waitForTimeout(800); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.waitForTimeout(800) }
    const url = await shareUrlOf(p)
    // share link on a device WITHOUT the own list: opens and runs
    const q = await cpage(); await q.goto(url.replace(/^https?:\/\/[^/]+\/traningsplaneringen\//, BR)); await q.waitForTimeout(1500); const st = await text(q); const sOwn = /S47V egen lek/.test(st)
    await q.getByRole('button', { name: /Kör passet/ }).first().click().catch(() => {}); await q.waitForTimeout(800); let sRun = /S47V egen/.test(await text(q)); for (let i = 0; i < 8 && !sRun; i++) { await q.getByRole('button', { name: /Nästa/ }).first().click().catch(() => {}); await q.waitForTimeout(250); sRun = /S47V egen/.test(await text(q)) }
    await q.context().close()
    check('AC4', 'pass with own exercises: Golvklart opens as on main (it lists Teknik stations only, main identical), Kör passet, Skriv ut passet show them; share link opens on a device without the own list and runs with them', inPass && gk !== false && runOwn && prints >= 1 && /S47V egen/.test(printTxt) && sOwn && sRun, JSON.stringify({ inPass, gk, runOwn, prints, printOwn: /S47V egen/.test(printTxt), share: !!url, sOwn, sRun }))
    await p.context().close()
  })
  await attempt('AC4-mall', async () => {
    const p = await cpage({ ls: OWNLS }); await go(p, BR); await toBuilder(p); await pickOwn(p, 'S47V egen lek', 0)
    await menu(p, 'Spara som egen mall'); await p.waitForTimeout(400); const nm = p.getByRole('textbox').last(); await nm.fill('S47V mall egen'); await p.getByRole('button', { name: /^Spara/ }).last().click(); await p.waitForTimeout(800)
    const ms = await mallar(p); const has = ms.some((m) => m.title === 'S47V mall egen' || m.name === 'S47V mall egen')
    await toHome(p); await p.getByRole('button', { name: 'Rensa passet' }).click().catch(() => {}); await p.getByRole('button', { name: /^Rensa/ }).last().click().catch(() => {}); await p.waitForTimeout(400)
    await openPlan(p); await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click().catch(() => {}); await p.waitForTimeout(400); await sheet(p).locator('[role=option]').first().click().catch(() => {}); await p.waitForTimeout(400)
    await sheet(p).locator('.template-card').filter({ hasText: 'S47V mall egen' }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(900)
    const d = JSON.stringify(await draft(p)); await hall(p); const hallOk = (await p.locator('.hall-chip').count()) > 0
    check('AC4-mall', 'Mina mallar with an own exercise: saved, opened from Planera pass → Starta från mall, pass has it, Hallöversikt works', has && d.includes('own-s47v-1') && hallOk, JSON.stringify({ has, inDraft: d.includes('own-s47v-1'), hallOk }))
    await p.context().close()
  })
  await attempt('AC5', async () => {
    const p = await cpage({ ls: { ...OWNLS } }); await go(p, BR); await toBuilder(p); await pickOwn(p, 'S47V egen lek', 0)
    await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300); await p.getByRole('textbox').last().fill('S47V mall två'); await p.getByRole('button', { name: /^Spara/ }).last().click(); await p.waitForTimeout(700)
    const before = await draftRaw(p)
    await menu(p, 'Använd mall'); await p.waitForTimeout(600); const sh = p.locator('[role=dialog]').filter({ hasText: 'Använd mall' }).last(); const t = (await sh.innerText()).replace(/\s+/g, ' ')
    const h = await sh.locator('h2').first().innerText().catch(() => ''); await shot(p, '25_anvand_mall_sheet_390')
    const mine = sh.locator('.template-card, li, .mall-row').filter({ hasText: 'S47V mall två' }).first(); const mineT = await mine.innerText().catch(() => '')
    const adminTools = /Dölj för alla|Ändra i banken|Godkänn/.test(t)
    await sh.locator('.template-card, button').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(500); const conf = await text(p, '[role=alertdialog], [role=dialog]:last-of-type')
    await p.getByRole('button', { name: /^(Använd mall|Ersätt)/ }).last().click(); const tt = await toastText(p).catch(() => ''); const after = await draftRaw(p)
    await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click().catch(() => {}); await p.waitForTimeout(800); const undone = await draftRaw(p)
    const sameExceptTime = (a, b) => { const x = JSON.parse(a), y = JSON.parse(b); delete x.updatedAt; delete y.updatedAt; return JSON.stringify(x) === JSON.stringify(y) }
    check('AC5', '«Använd mall» sheet: Föreningens mallar (when any), Mina mallar with «Kopiera delningskod» + «Ta bort», Nybörjare, Kort pass; no admin tools; pick → «Ersätta det här passet?» → toast «Mallen är i Passbyggaren. · Ångra»; Ångra restores the pass', h === 'Använd mall' && /Mina mallar/.test(t) && /Nybörjare/.test(t) && /Kort pass/.test(t) && /Kopiera delningskod/.test(mineT) && /Ta bort/.test(mineT) && !adminTools && /Ersätta det här passet\?/.test(conf) && /Mallen är i Passbyggaren\./.test(tt) && /Ångra/.test(tt) && after !== before && sameExceptTime(undone, before), JSON.stringify({ h, t: t.slice(0, 300), mineT: mineT.replace(/\s+/g, ' ').slice(0, 100), conf: conf.slice(0, 60), tt }))
    await p.context().close()
  })
  await attempt('AC6', async () => {
    const r = {}
    for (const [k, base] of [['br', BR], ['main', MAIN]]) { const p = await cpage(); await go(p, base); await openPlan(p); await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(400); const t1 = await sheet(p).innerText(); await sheet(p).locator('[role=option]').first().click(); await p.waitForTimeout(500); const t2 = await sheet(p).innerText(); const g = await rect(p, '.home-wizard-sheet'); r[k] = { t1, t2, g }; if (k === 'br') await shot(p, '26_planera_mall_step_390'); await p.context().close() }
    check('AC6', 'Planera pass Mall step identical to main (text of both steps, sheet geometry)', r.br.t1 === r.main.t1 && r.br.t2 === r.main.t2 && JSON.stringify(r.br.g) === JSON.stringify(r.main.g), JSON.stringify({ t1: r.br.t1 === r.main.t1, t2: r.br.t2 === r.main.t2, g: [r.br.g, r.main.g] }))
  })
  await attempt('AC7', async () => {
    const r = {}
    for (const [k, base] of [['br', BR], ['main', MAIN]]) { const p = await cpage(); await go(p, base); await toBuilder(p); await hall(p); await p.locator('button:visible').filter({ hasText: /^Använd alla förslag$/ }).first().click().catch(() => {}); await p.waitForTimeout(800); await p.locator('button:visible').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.waitForTimeout(600); r[k] = (await text(p, '.forradslista, .packing-list, [role=dialog]:last-of-type')).replace(/\s+/g, ' '); if (k === 'br') await shot(p, '27_forradslista_390', true); await p.context().close() }
    const mainRest = r.main.replace(/Vad finns i hallen ikväll\?.*$/, '').trim()
    const pieces = JSON.stringify(['eq-trampett']), all = 'x'
    const counts = {}
    for (const [k, ls] of [['clean', {}], ['oldUnticked', { 'gymnastics-planner-owned-equipment-v1': '[]', 'gymnastics-planner-owned-equipment-seen-v1': await (async () => { const p = await cpage(); await go(p, MAIN); const ids = await p.evaluate(() => null); await p.context().close(); return JSON.stringify(['eq-trampett', 'eq-satsbrada', 'eq-plint']) })(), 'gymnastics-planner-library-tonight-v1': 'true' }]]) {
      const p = await cpage({ ls }); await go(p, BR); await toBuilder(p); const L = await lib(p, 2); await L.locator('select').selectOption('all'); await p.waitForTimeout(300); counts[k] = await L.locator('.library-entry').count(); await p.context().close() }
    check('AC7', 'Förrådslista: no «Vad finns i hallen ikväll?»; rest as on main; Biblioteket shows every exercise with an old owned list (nothing ticked, ikväll on) in localStorage', !/Vad finns i hallen ikväll/.test(r.br) && r.br.startsWith(mainRest.slice(0, Math.min(mainRest.length, 120))) && counts.clean === counts.oldUnticked && counts.clean > 10, JSON.stringify({ br: r.br.slice(0, 200), main: r.main.slice(0, 260), counts }))
  })
  await attempt('AC22', async () => {
    const p = await cpage(); await go(p, BR); const ls0 = await allStorage(p); await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.waitForTimeout(300)
    await p.locator('.home-receive textarea').fill(fileOf([imp('own-s47v-h1', 'Hämtad övning')])); await p.locator('.home-receive').getByRole('button', { name: 'Öppna' }).click(); await p.waitForTimeout(600)
    const t = await text(p); await shot(p, '28_hamta_exercise_file_390'); const ls1 = await allStorage(p)
    check('AC22', 'Hämta ett pass with an exercise file: «Det här är en fil med övningar. En admin lägger in den under Admin.»; nothing imported (localStorage unchanged, still on start page)', /Det här är en fil med övningar\. En admin lägger in den under Admin\./.test(t) && JSON.stringify(ls0) === JSON.stringify(ls1) && (await p.locator('.builder').count()) === 0, '')
    await p.context().close()
  })
  await attempt('AC24-coach', async () => {
    const out = {}
    for (const vn of ['320', 'land', 'desk']) { const p = await cpage({ vp: VPS[vn], touch: vn !== 'desk' }); await go(p, BR); await toBuilder(p); const L = await lib(p, 2); const t = (await L.innerText()).replace(/\s+/g, ' '); const first = await L.locator('.library-entry').first().boundingBox(); await shot(p, `29_library_${vn}`)
      await L.locator('.library-entry .activity-card').first().click(); await p.waitForTimeout(300); const addVis = await p.getByRole('button', { name: 'Lägg till i valt block' }).isVisible(); const addReach = await p.getByRole('button', { name: 'Lägg till i valt block' }).click({ timeout: 3000 }).then(() => true).catch(() => false); if (!addReach) await shot(p, `31_detail_add_unreachable_${vn}`); await p.waitForTimeout(500); await p.locator('.side-panel-slot.is-open .sheet-close').click().catch(() => {}); await p.waitForTimeout(300); await closeOverlays(p)
      await menu(p, 'Använd mall'); await p.waitForTimeout(500); const ms = await rect(p, '[role=dialog]:last-of-type'); const mt = await text(p, '[role=dialog]:last-of-type'); await shot(p, `30_anvand_mall_${vn}`)
      out[vn] = { w: await docW(p), vw: VPS[vn].width, tabs: /Bibliotek · Tips|^Tips|Mallar ·/.test(t), firstY: Math.round(first?.y ?? -1), firstInView: !!first && first.y < VPS[vn].height, addVis, addReach, ms, mallOk: /Nybörjare/.test(mt) && !!ms && ms.bottom <= VPS[vn].height + 1 && ms.top >= -1 }
      await p.context().close() }
    check('AC24-coach', 'Lägg till övning (desktop side panel without tabs) and Använd mall usable at 320, 844×390, 1280×800', Object.values(out).every((o) => o.w <= o.vw && !o.tabs && o.firstInView && o.addVis && o.addReach && o.mallOk), JSON.stringify(out))
  })
}
// ═══ END ═══
PART = PARTS.at(-1); check(`errors-${PARTS.join('+')}`, 'no page errors', errors.length === 0, errors.slice(0, 5).join(' | '))
check(`live-${PARTS.join('+')}`, 'no request to a non-mock supabase.co host', live.length === 0, live.slice(0, 5).join(' '))
const seen = new Map(); for (const r of results) seen.set(r.id, r)
writeFileSync(RES, JSON.stringify({ results: [...seen.values()], notes }, null, 1))
console.log(`${[...seen.values()].filter((r) => r.part === PART || PARTS.includes(r.part)).filter((r) => r.ok).length}/${[...seen.values()].filter((r) => PARTS.includes(r.part)).length} pass (parts ${PARTS})`)
await browser.close()

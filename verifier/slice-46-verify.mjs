// Slice 46 «Startsidan + Planera pass» — Verifier formal run. Branch fe5e51e vs main bc8cce0.
// Previews: branch plain :57841, main plain :57842, branch bank :57840, main bank :57843 (bank builds use
// https://bank-mock.supabase.co, routed here to MY local stand-in gateway :57830; nothing live).
// Headless Chrome 390×844 DPR 2 touch (+320, 844×390, 1280×800). PART env selects sections; ONLY= single checks.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s46v/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const BR = 'http://127.0.0.1:57841/traningsplaneringen/', MAIN = 'http://127.0.0.1:57842/traningsplaneringen/'
const BRB = 'http://127.0.0.1:57840/traningsplaneringen/', MAINB = 'http://127.0.0.1:57843/traningsplaneringen/'
const GW = 'http://127.0.0.1:57830', S32 = process.env.S32_DIR ?? '/workspace/s46v/sb'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-46-screenshots-v/s46v_`, CK = `${ROOT}/verifier/slice-46-checks`, RES = `${ROOT}/verifier/slice-46-verify-results.json`
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
async function menu(p, name) { const mer = p.getByRole('button', { name: 'Fler saker med passet' }); if (await mer.isVisible().catch(() => false)) { await mer.click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() } else await p.locator('button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().click() }
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
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', '57831', '-U', 'postgres', '-d', 'bank', '-qAt', '-c', q], { encoding: 'utf8' }).trim()

// ═══════════════════════ p1: start page + footer ═══════════════════════
if (PARTS.includes('p1')) { PART = 'p1'
  const seedDraft = async () => { const p = await page(); await home(p, BR); await wizard(p, { hall: STORA, len: '60 min' }); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V utkast'); await p.waitForTimeout(1200); const d = await draftRaw(p); await p.context().close(); return d }
  const DRAFT = await seedDraft(); note('p1.draftTitle', JSON.parse(DRAFT).title)
  const homeInfo = async (p) => p.evaluate(() => { const btns = [...document.querySelectorAll('.home button, .home a')].filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return { t: b.innerText.replace(/\s+/g, ' ').trim(), cls: b.className, top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) } }); return { btns, text: document.querySelector('.home').innerText.replace(/\s+/g, ' ') } })
  await attempt('AC1', async () => {
    const p = await page({ bank: true }); await home(p, BRB); await p.waitForTimeout(1200)
    const h = await homeInfo(p); await shot(p, '01_home_nodraft_390')
    const plan = h.btns.filter((b) => b.t === 'Planera pass'); const hasTomt = h.btns.some((b) => /^Tomt pass$|^Från mall$|Starta från mall/.test(b.t))
    await p.getByRole('button', { name: 'Hämta ett pass' }).click(); await p.waitForTimeout(300); const recv = await p.locator('.home-receive').isVisible()
    const m = await page({ bank: true }); await home(m, MAINB); const mh = await homeInfo(m); await m.getByRole('button', { name: 'Hämta ett pass' }).click(); await m.waitForTimeout(300); const mrecv = await m.locator('.home-receive').isVisible()
    const rtxt = await p.locator('.home-receive').innerText(), mtxt = await m.locator('.home-receive').innerText()
    check('AC1', 'No draft: one «Planera pass», no «Tomt pass»/«Från mall» on the page; «Hämta ett pass» opens its panel as on main', plan.length === 1 && !hasTomt && recv && mrecv && rtxt === mtxt, JSON.stringify({ br: h.btns.map((b) => b.t), main: mh.btns.map((b) => b.t), recvSame: rtxt === mtxt }))
    await p.context().close(); await m.context().close()
  })
  await attempt('AC2', async () => {
    const p = await page({ bank: true }); await home(p, BRB, { [DK]: DRAFT }); await p.waitForTimeout(1200)
    const h = await homeInfo(p); await shot(p, '02_home_draft_390')
    const order = h.btns.filter((b) => /Fortsätt passet|^Planera pass$|Rensa passet/.test(b.t))
    const ok = order.length === 3 && /Fortsätt passet/.test(order[0].t) && /S46V utkast · \d+ min/.test(order[0].t) && order[1].t === 'Planera pass' && /Rensa passet/.test(order[2].t) && order[0].top < order[1].top && order[1].top < order[2].top && order.every((b) => b.h >= 44)
    check('AC2', 'With draft: «Fortsätt passet» (title · min) first, «Planera pass» under it, then «Rensa passet»; each ≥ 44 px', ok, JSON.stringify(order))
    await p.context().close()
  })
  await attempt('AC3', async () => {
    const out = {}
    for (const [k, base, ls] of [['br-nodraft', BRB, {}], ['br-draft', BRB, { [DK]: DRAFT }], ['main-nodraft', MAINB, {}], ['main-draft', MAINB, { [DK]: DRAFT }]]) {
      const p = await page({ bank: true }); await home(p, base, ls); await p.locator('.footer-admin-login').first().waitFor({ timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500)
      const upd = await p.evaluate(() => { const f = (re) => { const e = [...document.querySelectorAll('a, button')].find((x) => x.offsetParent && re.test(x.innerText.trim())); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } }; return { upd: f(/^Uppdatera appen$/), admin: f(/^Logga in som admin$/) } })
      out[k] = { docH: await docH(p), ...upd }; await p.context().close()
    }
    const ok = ['br-nodraft', 'br-draft'].every((k) => out[k].docH <= 844 && out[k].upd && out[k].upd.bottom <= 844 && out[k].admin && out[k].admin.bottom <= 844)
    check('AC3', 'Start page (admin available), no draft and with draft: doc height ≤ 844, no scroll; «Uppdatera appen» and «Logga in som admin» fully on screen', ok, JSON.stringify(out))
    note('AC3', out)
  })
  await attempt('AC4', async () => {
    const p = await page({ bank: true }); await home(p, BRB); await p.locator('.footer-admin-login').first().waitFor({ timeout: 8000 }); await p.waitForTimeout(400)
    const rows = await footRows(p, '.home-foot-rows'); note('AC4.rows', rows)
    const t = rows.map((r) => r.text)
    const noteRow = rows.find((r) => r.text === NOTE); const noteFs = noteRow ? Math.max(...noteRow.items.map((i) => parseFloat(i.fs)), parseFloat(noteRow.fs)) : 99
    const ok = t[0] === 'Tyck till · Uppdatera appen' && t[1] === 'Logga in som admin' && t[2] === NOTE && noteFs <= 12 && rowsOk(rows)
    check('AC4', 'Footer rows: «Tyck till · Uppdatera appen» / «Logga in som admin» / note ≤ 12 px grey; no edge «·»; one centre line per row; links ≥ 44 px', ok, JSON.stringify(rows.map((r) => ({ t: r.text, fs: r.fs, color: r.color, items: r.items.map((i) => `${i.tag}:${i.t}:h${i.h}:cy${i.cy}:${i.fs}`) }))))
    await shot(p, '03_footer_rows_390')
    await p.context().close()
  })
  await attempt('AC6', async () => {
    const p = await page({ bank: true }); await home(p, BRB); await p.locator('.footer-admin-login').first().waitFor({ timeout: 8000 }); await p.waitForTimeout(300)
    const before = await footRows(p, '.home-foot-rows')
    await p.locator('.home-foot-rows a').filter({ hasText: 'Tyck till' }).first().click(); await p.waitForTimeout(500)
    const mail = await p.evaluate(() => window.__mailto); const after = await footRows(p, '.home-foot-rows'); const dh = await docH(p)
    const vis = await p.evaluate(() => [...document.querySelectorAll('.home a, .home button')].filter((e) => e.offsetParent).map((e) => ({ t: e.innerText.trim(), b: Math.round(e.getBoundingClientRect().bottom) })).filter((x) => x.b > 844))
    await shot(p, '04_tyck_till_fallback_390')
    const addrRow = after.find((r) => /@/.test(r.text) && !/Tyck till/.test(r.text))
    check('AC6', 'Tyck till opens the mail (mailto) and shows the fallback line with the address as its own row; nothing else moves off screen', mail.length === 1 && !!addrRow && vis.length === 0 && dh <= 844, JSON.stringify({ mail: mail[0]?.slice(0, 40), rows: after.map((r) => `${r.text}@${r.top}-${r.bottom}`), offscreen: vis, docH: dh, rowsBefore: before.length }))
    await p.context().close()
  })
  await attempt('W-home', async () => {
    const out = {}
    for (const [k, vp] of [['320', { width: 320, height: 640 }], ['390', PHONE], ['land', { width: 844, height: 390 }], ['desk', { width: 1280, height: 800 }]]) {
      for (const [who, base] of [['br', BRB], ['main', MAINB]]) {
        const p = await page({ vp, touch: k !== 'desk', bank: true }); await home(p, base); await p.locator('.footer-admin-login').first().waitFor({ timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400)
        out[`${k}-${who}`] = { docH: await docH(p), docW: await docW(p), hero: await rect(p, '.home-hero'), pane: await rect(p, '.home-pane'), foot: await rect(p, '.home-foot-rows') ?? await rect(p, 'footer.app-footer'), appFooter: await rect(p, 'footer.app-footer'), plan: await rect(p, '.home-start-primary'), upd: await p.evaluate(() => { const e = [...document.querySelectorAll('a,button')].find((x) => x.offsetParent && x.innerText.trim() === 'Uppdatera appen'); return e ? Math.round(e.getBoundingClientRect().bottom) : null }) }
        if (who === 'br') await shot(p, `05_home_${k}`); if (who === 'main' && k === 'desk') await shot(p, '05m_home_desk_main')
        await p.context().close()
      }
    }
    note('W-home', out)
    const d = out['desk-br'], dm = out['desk-main']
    const footInPane = d.foot && d.pane && d.foot.left >= d.pane.left - 1 && d.foot.right <= d.pane.right + 1
    check('AC21-home-land', 'Landscape 844×390 start page: no horizontal scroll; Planera pass and footer reachable (scroll)', out['land-br'].docW <= 844 && out['land-br'].plan, JSON.stringify({ br: out['land-br'], main: out['land-main'] }))
    check('AC21-home-desk', 'Desktop 1280×800 start page: hero layout vs main (measured); footer position', d.hero && dm.hero && Math.abs(d.hero.h - dm.hero.h) <= 20 && d.hero.left === dm.hero.left && d.hero.w === dm.hero.w, JSON.stringify({ br: { hero: d.hero, pane: d.pane, foot: d.foot, docH: d.docH }, main: { hero: dm.hero, pane: dm.pane, foot: dm.foot, appFooter: dm.appFooter, docH: dm.docH }, footInPane }))
    check('W-320-home', '320×640 start page: no horizontal scroll; footer usable', out['320-br'].docW <= 320, JSON.stringify({ br: out['320-br'], main: out['320-main'] }))
  })
  await attempt('AC5-local', async () => {
    // Local only: code login against MY stand-in (GoTrue + SMTP catcher). The live admin is PENDING-real.
    const res = {}
    for (const [label, email] of [['admin', 'admin@test.local'], ['nonadmin', 'nonadmin@test.local']]) {
      const p = await page({ bank: true }); await home(p, BRB); await p.locator('.footer-admin-login').first().click()
      const dlg = p.getByRole('dialog', { name: 'Logga in som admin' }); await dlg.waitFor()
      const t0 = Date.now(); await dlg.locator('input[type=email]').fill(email); await dlg.getByRole('button', { name: 'Skicka kod', exact: true }).click(); await dlg.locator('input.admin-code-input').waitFor()
      const m = await waitMail(email, t0 - 1); const code = (m.subject.match(/\b(\d{6})\b/) ?? [])[1]
      await dlg.locator('input.admin-code-input').pressSequentially(code); await dlg.getByRole('button', { name: 'Logga in', exact: true }).click()
      await p.locator('.footer-admin-logout').first().waitFor({ timeout: 15000 }); await p.waitForTimeout(1500)
      const rows = await footRows(p, '.home-foot-rows'); const act = await active(p); const dh = await docH(p)
      await shot(p, `06_home_${label}_loggedin`)
      await p.locator('.footer-admin-logout').first().click(); await p.waitForTimeout(1500)
      const rowsOut = await footRows(p, '.home-foot-rows')
      res[label] = { rows: rows.map((r) => r.text), rowsOk: rowsOk(rows), act, docH: dh, afterLogout: rowsOut.map((r) => r.text) }
      await p.context().close()
    }
    note('AC5-local', res)
    const ok = res.admin.rows[1] === 'Admin · Logga ut' && res.nonadmin.rows[1] === 'Du är inloggad men inte admin. · Logga ut' && /footer-admin-logout/.test(res.admin.act) && res.admin.afterLogout[1] === 'Logga in som admin' && res.nonadmin.afterLogout[1] === 'Logga in som admin' && res.admin.rowsOk && res.nonadmin.rowsOk && res.admin.docH <= 844 && res.nonadmin.docH <= 844
    check('AC5-local', 'LOCAL stand-in: admin row «Admin · Logga ut»; non-admin «Du är inloggad men inte admin. · Logga ut»; focus on Logga ut after code login; Logga ut works; rows tidy, page ≤ 844', ok, JSON.stringify(res))
  })
}

// ═══════════════════════ p2: Planera pass sheet ═══════════════════════
if (PARTS.includes('p2')) { PART = 'p2'
  await attempt('AC7', async () => {
    const p = await page(); await home(p); await openPlan(p)
    const o = await sheet(p).evaluate((s) => ({ opts: [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim()), alt: [...s.querySelectorAll('.home-wizard-alt button')].map((e) => e.textContent.trim()), altBorder: getComputedStyle(s.querySelector('.home-wizard-alt')).borderTopWidth, headerBtns: [...s.querySelectorAll('.home-wizard-header button')].map((e) => e.textContent.trim()), actions: [...s.querySelectorAll('.home-wizard-actions button')].filter((e) => e.offsetParent).map((e) => e.textContent.trim()), x: [...s.querySelectorAll('button')].some((b) => b.textContent.trim() === '×' || /Stäng/.test(b.getAttribute('aria-label') || '')), sheet: (() => { const r = s.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)] })() }))
    const pr = await progress(p), h = await heading(p); await shot(p, '10_sheet_step1')
    check('AC7', 'Sheet opens on «Fråga 1 av 4» «Ålder», chips 4–6 · 7–9 · 10–12 · 13–18 år · Nivå, a thin line then «Starta från mall» and «Tomt pass»; no ×; bottom row only «Avbryt»', pr === 'Fråga 1 av 4' && h === 'Ålder' && JSON.stringify(o.opts) === JSON.stringify(['4–6 år', '7–9 år', '10–12 år', '13–18 år', 'Nivå']) && JSON.stringify(o.alt) === JSON.stringify(['Starta från mall', 'Tomt pass']) && parseFloat(o.altBorder) > 0 && !o.x && JSON.stringify(o.actions) === JSON.stringify(['Avbryt']), JSON.stringify({ pr, h, ...o }))
    await p.context().close()
  })
  await attempt('AC8', async () => {
    const p = await page(); await home(p); await openPlan(p)
    await p.evaluate(() => { window.__t = null; const s = document.querySelector('.home-wizard-progress'); new MutationObserver(() => { if (window.__t == null && /Fråga 2/.test(s.textContent)) window.__t = performance.now() - window.__t0 }).observe(s, { childList: true, characterData: true, subtree: true }); window.__selAt = null; const c = [...document.querySelectorAll('[role=option]')].find((e) => e.textContent.trim() === '7–9 år'); new MutationObserver(() => { if (window.__selAt == null && c.getAttribute('aria-selected') === 'true') window.__selAt = performance.now() - window.__t0 }).observe(c, { attributes: true }) })
    await p.evaluate(() => { window.__t0 = performance.now() }); await opt(p, '7–9 år').click(); await p.waitForTimeout(1000)
    const t = await p.evaluate(() => ({ adv: window.__t, sel: window.__selAt }))
    const pr = await progress(p), h = await heading(p)
    const anyNext = await p.evaluate(() => [...document.querySelectorAll('.home-wizard-sheet button')].some((b) => /Nästa|Skapa pass/.test(b.textContent)))
    await cancel(p).click(); await p.waitForTimeout(300); await openPlan(p)
    const box = await opt(p, '10–12 år').boundingBox(); await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(60); await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(1200)
    const pr2 = await progress(p), sel2 = await selected(p)
    const box3 = await opt(p, 'Satsbräda').boundingBox(); await p.mouse.dblclick(box3.x + box3.width / 2, box3.y + box3.height / 2); await p.waitForTimeout(1200)
    const pr3 = await progress(p), h3 = await heading(p)
    check('AC8', 'Tap «7–9 år»: chip chosen, then «Fråga 2 av 4» «Fokus» within ~0.3 s; no «Nästa»/«Skapa pass»; a quick double tap advances one step only', t.sel != null && t.sel < t.adv && t.adv >= 150 && t.adv <= 450 && pr === 'Fråga 2 av 4' && h === 'Fokus' && !anyNext && pr2 === 'Fråga 2 av 4' && sel2.length === 0 && pr3 === 'Fråga 3 av 4' && h3 === 'Hall', JSON.stringify({ selMs: Math.round(t.sel), advMs: Math.round(t.adv), pr, h, anyNext, doubleTap: { pr2, sel2 }, dblclickFokus: { pr3, h3 } }))
    await p.context().close()
  })
  await attempt('AC9-AC10', async () => {
    const p = await page(); await home(p); await openPlan(p); await tap(p, '7–9 år')
    const f = await sheet(p).evaluate((s) => ({ opts: [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim()), text: s.innerText }))
    await shot(p, '11_sheet_fokus'); await tap(p, 'Trampett')
    const hh = { pr: await progress(p), h: await heading(p), opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())) }
    await shot(p, '12_sheet_hall'); await tap(p, GROP)
    const L = { pr: await progress(p), h: await heading(p), opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())), sel: await selected(p) }
    await shot(p, '13_sheet_passlangd'); await opt(p, '90 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(1000)
    const title = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue(); const len = await lengthText(p); const lsel = await lenSel(p); const d = await draft(p)
    await shot(p, '14_builder_after_wizard'); await hall(p); const meta = await p.locator('.hall-session-meta').innerText(); const mk = await markers(p); const ch = await canvasHall(p)
    check('AC9', 'Fokus: Satsbräda · Trampett · Tumbling · Blandat, no station/zone line; Trampett → «Fråga 3 av 4» «Hall» with exactly the two Gymmix halls', JSON.stringify(f.opts) === JSON.stringify(['Satsbräda', 'Trampett', 'Tumbling', 'Blandat']) && !/station|zon/i.test(f.text) && hh.pr === 'Fråga 3 av 4' && hh.h === 'Hall' && JSON.stringify(hh.opts) === JSON.stringify([STORA, GROP]), JSON.stringify({ f, hh }))
    check('AC10', 'Grophallen → «Fråga 4 av 4» «Passlängd» 60/90/120, none preselected; 90 → Passbyggaren «Pass — trampett», «53 / 90 min», Teknik on Grophallen', L.pr === 'Fråga 4 av 4' && L.h === 'Passlängd' && JSON.stringify(L.opts) === JSON.stringify(['60 min', '90 min', '120 min']) && L.sel.length === 0 && title === 'Pass — trampett' && /53 \/\s*90/.test(len + ' ' + lsel) && d.targetMinutes === 90 && d.hallTemplateId === 'forening-vit' && meta.includes(GROP) && ch === 'forening-vit' && mk.length === teknik(d).length && mk.length > 0 && mk.every((m) => m.inOpen), JSON.stringify({ L, title, len, lsel, target: d.targetMinutes, total: d.totalMinutes, hall: d.hallTemplateId, meta, ch, mk, teknik: teknik(d).length }))
    await p.context().close()
  })
  await attempt('AC11', async () => {
    const p = await page(); await home(p); await openPlan(p); await opt(p, 'Nivå').click(); await p.waitForTimeout(500)
    const lv = { opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())), hint: (await sheet(p).locator('.home-wizard-hint').innerText().catch(() => '')).trim(), actions: await sheet(p).evaluate((s) => [...s.querySelectorAll('.home-wizard-actions button')].filter((e) => e.offsetParent).map((e) => e.textContent.trim())), pr: await progress(p) }
    await shot(p, '15_sheet_niva'); await backBtn(p).click(); await p.waitForTimeout(400)
    const back = { opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())), pr: await progress(p) }
    await opt(p, 'Nivå').click(); await p.waitForTimeout(400); await tap(p, 'Nivå 3'); const h = await heading(p), pr = await progress(p)
    await tap(p, 'Tumbling'); await tap(p, STORA); await opt(p, '60 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800)
    const title = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
    check('AC11', 'Nivå → Nivå 9…1 + «Nivå 9 är den lägsta. Nivå 1 är den högsta.»; Tillbaka → age chips; Nivå 3 → Fokus; title «Nivå 3 — …»', JSON.stringify(lv.opts) === JSON.stringify(['Nivå 9', 'Nivå 8', 'Nivå 7', 'Nivå 6', 'Nivå 5', 'Nivå 4', 'Nivå 3', 'Nivå 2', 'Nivå 1']) && lv.hint === 'Nivå 9 är den lägsta. Nivå 1 är den högsta.' && lv.actions.includes('Tillbaka') && back.opts.includes('7–9 år') && h === 'Fokus' && pr === 'Fråga 2 av 4' && /^Nivå 3 — /.test(title), JSON.stringify({ lv, back, h, pr, title }))
    await p.context().close()
  })
  await attempt('AC12', async () => {
    const p = await page(); await home(p); await openPlan(p); const log = []
    const st = async (tag) => log.push({ tag, pr: await progress(p), h: await heading(p), sel: await selected(p), back: await backBtn(p).isVisible().catch(() => false) })
    await st('q1'); await tap(p, '7–9 år'); await st('q2'); await backBtn(p).click(); await p.waitForTimeout(400); await st('back→q1')
    await tap(p, '7–9 år'); await st('retap→q2'); await tap(p, 'Trampett'); await st('q3'); await backBtn(p).click(); await p.waitForTimeout(400); await st('back→q2')
    await tap(p, 'Tumbling'); await st('other→q3'); await tap(p, GROP); await st('q4'); await backBtn(p).click(); await p.waitForTimeout(400); await st('back→q3')
    await tap(p, STORA); await st('other→q4'); await opt(p, '60 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800)
    const d = await draft(p); const title = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
    const L = Object.fromEntries(log.map((x) => [x.tag, x]))
    const ok = !L.q1.back && L['back→q1'].pr === 'Fråga 1 av 4' && JSON.stringify(L['back→q1'].sel) === '["7–9 år"]' && L['retap→q2'].pr === 'Fråga 2 av 4' && L['back→q2'].pr === 'Fråga 2 av 4' && JSON.stringify(L['back→q2'].sel) === '["Trampett"]' && L['other→q3'].pr === 'Fråga 3 av 4' && JSON.stringify(L['back→q3'].sel) === `["${GROP}"]` && L['other→q4'].pr === 'Fråga 4 av 4' && title === 'Pass — tumbling' && d.hallTemplateId === 'forening-bla' && d.targetMinutes === 60
    check('AC12', 'Tillbaka on steps 2–4: one step back, earlier answer marked; re-tap moves on; another answer replaces it; progress updates; no Tillbaka on step 1', ok, JSON.stringify({ log, title, hall: d.hallTemplateId, target: d.targetMinutes }))
    await p.context().close()
  })
  await attempt('AC13', async () => {
    const D0 = await (async () => { const p = await page(); await home(p); await wizard(p, { hall: STORA, len: '60 min' }); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V AC13'); await p.waitForTimeout(1200); const d = await draftRaw(p); await p.context().close(); return d })()
    const tomt = (p) => sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }), frm = (p) => sheet(p).getByRole('button', { name: 'Starta från mall', exact: true })
    const steps = {
      q1: async () => {}, q2: async (p) => { await tap(p, '7–9 år') }, q3: async (p) => { await tap(p, '7–9 år'); await tap(p, 'Trampett') }, q4: async (p) => { await tap(p, '7–9 år'); await tap(p, 'Trampett'); await tap(p, GROP) },
      niva: async (p) => { await opt(p, 'Nivå').click(); await p.waitForTimeout(400) },
      'tomt-hall': async (p) => { await tomt(p).click(); await p.waitForTimeout(400) }, 'tomt-len': async (p) => { await tomt(p).click(); await p.waitForTimeout(400); await tap(p, GROP) },
      'mall-hall': async (p) => { await frm(p).click(); await p.waitForTimeout(400) }, 'mall-list': async (p) => { await frm(p).click(); await p.waitForTimeout(400); await tap(p, GROP) },
    }
    const out = []
    for (const withDraft of [false, true]) for (const [name, go] of Object.entries(steps)) for (const how of name === 'q2' || name === 'mall-list' || name === 'q4' ? ['avbryt', 'outside'] : ['avbryt']) {
      const p = await page(); await home(p, BR, withDraft ? { [DK]: D0 } : {}); const before = await allStorage(p)
      await openPlan(p); await go(p); const pr = await progress(p)
      if (how === 'avbryt') await cancel(p).click(); else await p.mouse.click(195, 20)
      await p.waitForTimeout(500)
      const after = await allStorage(p); const open = await sheet(p).count(); const act = await active(p); const view = await p.locator('.home').count()
      out.push({ withDraft, name, how, pr, open, sameDraft: before[DK] === after[DK], diffKeys: Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]), focus: act, home: view })
      await p.context().close()
    }
    note('AC13', out)
    const bad = out.filter((x) => x.open !== 0 || !x.sameDraft || !/Planera pass/.test(x.focus) || x.home !== 1)
    check('AC13', 'Avbryt on every step (q1–q4, Nivå, Tomt pass ×2, mall ×2) and a tap outside (q2, q4, mall list): sheet closes, start page unchanged, draft identical, focus on «Planera pass» (no draft and with draft)', bad.length === 0, JSON.stringify({ n: out.length, bad, otherKeysChanged: [...new Set(out.flatMap((x) => x.diffKeys))] }))
    const p = await page(); await home(p); await openPlan(p); await tap(p, '7–9 år'); await tap(p, 'Trampett'); await cancel(p).click(); await p.waitForTimeout(300); await openPlan(p)
    const re = { pr: await progress(p), sel: await selected(p) }
    check('AC13-forget', 'After Avbryt the next Planera pass starts on step 1 with nothing marked', re.pr === 'Fråga 1 av 4' && re.sel.length === 0, JSON.stringify(re))
    await p.context().close()
  })
  await attempt('AC14', async () => {
    const p = await page(); await home(p); await openPlan(p); await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(400)
    const s1 = { pr: await progress(p), h: await heading(p), opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())) }
    await backBtn(p).click(); await p.waitForTimeout(400); const back = { pr: await progress(p), h: await heading(p) }
    await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(400); await tap(p, GROP)
    const s2 = { pr: await progress(p), h: await heading(p), opts: await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => e.textContent.trim())), sel: await selected(p) }
    await opt(p, '120 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(1000)
    const txt = (await p.locator('.builder').innerText()).replace(/\s+/g, ' ')
    const len = await lengthText(p), lsel = await lenSel(p), stored = await draftRaw(p)
    await shot(p, '16_tomt_pass_120_grop')
    const itemsBefore = await p.evaluate(() => document.querySelectorAll('.builder .session-item, .builder .item-row, .builder li.block-item').length)
    await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V tomt'); await p.waitForTimeout(1300); const afterTitle = await draftRaw(p)
    await addTeknik(p); const d = await draft(p)
    note('AC14.firstEdit', { afterTitleOnly: afterTitle ? 'stored' : 'not stored', afterStation: d ? `${d.title}|${items(d).length}` : null })
    check('AC14', 'Tomt pass: «Fråga 1 av 2» «Hall» → Grophallen → «Fråga 2 av 2» «Passlängd» → 120 → empty pass (Närvaro + Dagens pass), «… / 120 min», hall Grophallen; Tillbaka on Hall → step 1', s1.pr === 'Fråga 1 av 2' && s1.h === 'Hall' && JSON.stringify(s1.opts) === JSON.stringify([STORA, GROP]) && back.pr === 'Fråga 1 av 4' && back.h === 'Ålder' && s2.pr === 'Fråga 2 av 2' && s2.h === 'Passlängd' && s2.sel.length === 0 && /\/\s*120/.test(len + ' ' + lsel + ' ' + txt) && txt.includes('Närvaro') && txt.includes('Dagens pass') && d?.hallTemplateId === 'forening-vit' && d?.targetMinutes === 120 && items(d).length === 3 && txt.includes('Närvaro') && txt.includes('Dagens pass'), JSON.stringify({ s1, back, s2, len, lsel, storedBeforeEdit: stored === null ? 'not stored' : 'stored', afterStation: d && { title: d.title, hall: d.hallTemplateId, target: d.targetMinutes, items: items(d).map((i) => i.activityId) }, afterTitleOnly: afterTitle ? 'stored' : 'not stored' }))
    await p.context().close()
  })
  await attempt('TOMT-reload', async () => {
    const res = {}
    const startTomt = async (p, who, H = GROP, L = '120 min') => { if (who === 'br') { await openPlan(p); await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(400); await tap(p, H); await opt(p, L).click() } else await p.getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.locator('.builder').waitFor() }
    for (const [who, base] of [['br', BR], ['main', MAIN]]) {
      for (const exit of ['reload', 'home']) {
        const p = await page(); await home(p, base); await startTomt(p, who); await p.waitForTimeout(1500); const st0 = await draftRaw(p)
        if (exit === 'reload') { await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(500) } else { await toHome(p) }
        res[`${who}-${exit}`] = { storedBefore: !!st0, view: (await p.locator('.builder').count()) ? 'builder' : 'home', fortsatt: await p.getByRole('button', { name: /Fortsätt passet/ }).count(), storedAfter: !!(await draftRaw(p)) }
        await p.context().close()
      }
      const p = await page(); await home(p, base); await startTomt(p, who, STORA, '60 min')
      await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V tomt titel'); await p.waitForTimeout(1500); const t1 = await draft(p)
      res[`${who}-edit-title`] = { stored: t1?.title ?? null }
      await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V tomt notes'); await p.locator('textarea').first().fill('S46V anteckning').catch(() => {}); await p.waitForTimeout(1500)
      await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(400); res[`${who}-title+note-reload`] = { stored: (await draft(p))?.title ?? null, view: (await p.locator('.builder').count()) ? 'builder' : 'home' }
      await p.goto(base); await p.locator('.home').waitFor(); await startTomt(p, who, STORA, '60 min'); await addTeknik(p); const t2 = await draft(p)
      await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(400)
      res[`${who}-station`] = { stored: t2 ? items(t2).length : null, afterReload: !!(await draftRaw(p)) }
      await p.context().close()
    }
    note('TOMT-reload', res)
    const same = ['reload', 'home'].every((e) => JSON.stringify(res[`br-${e}`]) === JSON.stringify(res[`main-${e}`]))
    check('TOMT-reload', 'Blank Tomt pass: not stored until edited — same as main\'s Tomt pass (reload / Till startsidan → start page without a draft); stored after the first added station (title/notes alone are not written — same as main)', same && res['br-edit-title'].stored === res['main-edit-title'].stored && res['br-station'].stored === 3 && res['br-station'].afterReload && JSON.stringify(res['br-title+note-reload']) === JSON.stringify(res['main-title+note-reload']), JSON.stringify(res))
  })
  await attempt('AC15', async () => {
    const p = await page({ bank: true }); await home(p, BRB); await p.waitForTimeout(1200); await openPlan(p); await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(400)
    const s1 = { pr: await progress(p), h: await heading(p) }; await tap(p, GROP); await p.waitForTimeout(800)
    const s2 = { pr: await progress(p), h: await heading(p), text: (await sheet(p).innerText()).replace(/\s+/g, ' ').slice(0, 600) }
    await shot(p, '17_sheet_mall_list')
    await sheet(p).locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(500)
    const toast = ((await p.locator('.toast').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
    await p.waitForTimeout(800); const d = await draft(p)
    await hall(p); const meta = await p.locator('.hall-session-meta').innerText(); const mk = await markers(p); const ch = await canvasHall(p); await shot(p, '18_mall_on_grophallen')
    check('AC15', 'Starta från mall: «Hall» → Grophallen → «Fråga 2 av 2» «Mall» (Föreningens/Nybörjare/Kort pass) → Nybörjare: Passbyggaren, toast «Mallen är i Passbyggaren. · Ångra», Grophallen, markers on its grid', s1.h === 'Hall' && s1.pr === 'Fråga 1 av 2' && s2.pr === 'Fråga 2 av 2' && s2.h === 'Mall' && /Föreningens mallar/.test(s2.text) && /Nybörjare/.test(s2.text) && /Kort pass/.test(s2.text) && toast === 'Mallen är i Passbyggaren. · Ångra' && d.hallTemplateId === 'forening-vit' && ch === 'forening-vit' && meta.includes(GROP) && mk.length === teknik(d).length && mk.length > 0 && mk.every((m) => m.inOpen), JSON.stringify({ s1, s2, toast, hall: d.hallTemplateId, meta, mk }))
    await p.context().close()
  })
  await attempt('AC19', async () => {
    const p = await page({ touch: false, vp: { width: 1280, height: 800 } }); await home(p); await p.getByRole('button', { name: 'Planera pass', exact: true }).focus(); await p.keyboard.press('Enter'); await sheet(p).waitFor(); await p.waitForTimeout(400)
    const a0 = await active(p)
    const chipInfo = await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => `${e.tagName}:${e.getAttribute('aria-selected')}`))
    const lv = await sheet(p).evaluate((s) => s.querySelector('.home-wizard-progress')?.getAttribute('aria-live'))
    await opt(p, '7–9 år').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(600); const a1 = await active(p)
    await opt(p, 'Blandat').focus(); await p.keyboard.press(' '); await p.waitForTimeout(600); const a2 = await active(p), pr2 = await progress(p)
    await p.keyboard.press('Escape'); await p.waitForTimeout(400); const esc = { open: await sheet(p).count(), focus: await active(p) }
    check('AC19', 'Keyboard: after each advance focus is on the new heading; progress line aria-live; chips are buttons with aria-selected', /^H2/.test(a1) && /^H2/.test(a2) && pr2 === 'Fråga 3 av 4' && lv === 'polite' && chipInfo.every((c) => /^BUTTON:(true|false)$/.test(c)), JSON.stringify({ a0, a1, a2, pr2, live: lv, chipInfo, escape: esc }))
    await p.context().close()
  })
  await attempt('W-sheet', async () => {
    const out = {}
    for (const [k, vp, touch] of [['320', { width: 320, height: 640 }, true], ['390', PHONE, true], ['land', { width: 844, height: 390 }, true], ['desk', { width: 1280, height: 800 }, false]]) {
      const p = await page({ vp, touch }); await home(p)
      await openPlan(p); const s1 = await rect(p, '.home-wizard-sheet'); const sw = await docW(p)
      const scroll1 = await sheet(p).evaluate((s) => ({ sh: s.scrollHeight, ch: s.clientHeight, ov: getComputedStyle(s).overflowY }))
      const canc = await cancel(p).boundingBox()
      const chipW = await sheet(p).evaluate((s) => [...s.querySelectorAll('[role=option]')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.right)] }))
      await shot(p, `19_sheet_step1_${k}`)
      await opt(p, 'Nivå').click(); await p.waitForTimeout(400); const sN = await rect(p, '.home-wizard-sheet'); const scrollN = await sheet(p).evaluate((s) => ({ sh: s.scrollHeight, ch: s.clientHeight }))
      await cancel(p).scrollIntoViewIfNeeded(); const cN = await cancel(p).boundingBox(); await shot(p, `19_sheet_niva_${k}`)
      await cancel(p).click(); await p.waitForTimeout(300); const closed = (await sheet(p).count()) === 0
      await wizard(p, { age: '13–18 år', focus: 'Satsbräda', hall: STORA, len: '120 min' }); const d = await draft(p)
      out[k] = { sheet: s1, docW: sw, scroll1, cancel: canc && [Math.round(canc.y), Math.round(canc.y + canc.height), Math.round(canc.height)], chipW, niva: sN, scrollN, cancelN: cN && [Math.round(cN.y), Math.round(cN.y + cN.height)], closed, path: d && `${d.title}|${d.targetMinutes}|${d.hallTemplateId}` }
      await p.context().close()
    }
    note('W-sheet', out)
    const vh = { '320': 640, '390': 844, land: 390, desk: 800 }, vw = { '320': 320, '390': 390, land: 844, desk: 1280 }
    const ok = Object.entries(out).every(([k, o]) => o.closed && o.docW <= vw[k] && o.cancelN && o.cancelN[1] <= vh[k] && o.path === 'Pass — satsbräda|120|forening-bla' && o.chipW.every((c) => c[1] >= 44 && c[2] <= vw[k]))
    check('AC21-sheet', 'Sheet at 320, 390, landscape 844×390 (scrolls inside, Avbryt reachable) and desktop 1280×800: chips ≥ 44 px and on screen, no horizontal scroll, Avbryt reachable on step 1 and the Nivå list, full path works', ok, JSON.stringify(out))
  })
}

// ═══════════════════════ p3: malls, draft replacement, footers, print ═══════════════════════
if (PARTS.includes('p3')) { PART = 'p3'
  const pickMall = async (p, hallName, title, club = false) => {
    await openPlan(p); await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(400); await tap(p, hallName); await p.waitForTimeout(club ? 1500 : 300)
    const scope = club ? sheet(p).locator('section.club-templates .template-card') : sheet(p).locator('.template-card')
    await scope.filter({ hasText: title }).first().click()
    const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); await p.waitForTimeout(300); if (await c.count()) await c.click()
    await p.locator('.builder').waitFor(); await p.waitForTimeout(1500)
  }
  const openMallarTab = async (p) => { await p.locator('button:visible').filter({ hasText: /^Lägg till övning$/ }).first().click().catch(() => {}); await p.getByRole('tab', { name: 'Mallar', exact: true }).click(); await p.waitForTimeout(800) }
  // An edited Stora-hallen pass archived into Mina mallar via Planera pass (questions path), then own placement nudged.
  const makeMina = async (p, title) => {
    await home(p); await wizard(p, { hall: STORA, len: '60 min' }); await p.getByRole('textbox', { name: 'Passets titel' }).fill(title); await p.waitForTimeout(1300)
    await toHome(p); await wizard(p, { age: '10–12 år', focus: 'Tumbling', hall: GROP, len: '60 min' }); await toHome(p)
    await p.evaluate(([k, title]) => { const l = JSON.parse(localStorage.getItem(k)); const t = l.find((x) => x.title === title); t.pass.hallPlacements[0] = { ...t.pass.hallPlacements[0], x: 0.2137, y: 0.4242 }; localStorage.setItem(k, JSON.stringify(l)) }, [TK, title]); await p.reload(); await p.locator('.home').waitFor()
    return (await mallar(p)).find((x) => x.title === title)
  }
  await attempt('AC16-mina', async () => {
    const p = await page(); const src = await makeMina(p, 'S46V mina')
    await pickMall(p, STORA, 'S46V mina'); const d1 = await draft(p); await hall(p); const m1 = await markers(p); await shot(p, '20_mina_on_stora_kept')
    await toHome(p); await pickMall(p, GROP, 'S46V mina'); const d2 = await draft(p); await hall(p); const m2 = await markers(p); const meta2 = await p.locator('.hall-session-meta').innerText(); await shot(p, '21_mina_on_grop_replaced')
    const t2 = teknik(d2); const order2x = 0; const order2 = m2.every((x, i) => x.rank === i + 1)
    const r = { srcHall: src?.pass.hallTemplateId, srcP0: src?.pass.hallPlacements[0], stora: { hall: d1.hallTemplateId, same: JSON.stringify(d1.hallPlacements) === JSON.stringify(src.pass.hallPlacements), p0: d1.hallPlacements[0], markers: m1.length }, grop: { hall: d2.hallTemplateId, meta: meta2, p0: d2.hallPlacements[0], zones: [...new Set(d2.hallPlacements.map((x) => x.zoneId))], markers: m2, teknik: t2.length, order2 } }
    note('AC16-mina', r)
    check('AC16-mina', 'Mina mall (Stora hallen, own placements): chosen with Stora → placements kept exactly; chosen with Grophallen → hall Grophallen, markers re-placed on its grid in pass order', src && r.stora.hall === 'forening-bla' && r.stora.same && r.grop.hall === 'forening-vit' && meta2.includes(GROP) && m2.length === t2.length && m2.every((x) => x.inOpen) && order2 && d2.hallPlacements[0].x !== 0.2137, JSON.stringify(r))
    await p.context().close()
  })
  await attempt('AC16-club', async () => {
    const p0 = await page(); await home(p0); await wizard(p0, { hall: STORA, len: '60 min' }); const src = await draft(p0); await p0.context().close()
    const blocks = src.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: i.note ?? '', order: i.order, ...(i.stationEquipment ? { stationEquipment: i.stationEquipment } : {}) })) }))
    const payload = { v: 1, title: 'S46V klubbmall', notes: '', blocks, hallTemplateId: 'forening-bla' }
    sql(`delete from public.club_templates where title like 'S46V klubbmall%'`)
    sql(`insert into public.club_templates (title, total_minutes, payload) values ('S46V klubbmall', ${src.totalMinutes || 53}, '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb)`)
    const before = sql(`select md5(payload::text) from public.club_templates where title = 'S46V klubbmall'`)
    const r = {}; const live0 = live.length
    for (const [k, H, id] of [['grop', GROP, 'forening-vit'], ['stora', STORA, 'forening-bla']]) {
      const p = await page({ bank: true }); await home(p, BRB); await p.waitForTimeout(1200); await pickMall(p, H, 'S46V klubbmall', true)
      const toast = ((await p.locator('.toast').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
      const d = await draft(p); await hall(p); const m = await markers(p); await shot(p, `22_club_on_${k}`)
      r[k] = { hall: d.hallTemplateId, want: id, markers: m.length, teknik: teknik(d).length, inOpen: m.every((x) => x.inOpen), toast }
      await p.context().close()
    }
    const after = sql(`select md5(payload::text) from public.club_templates where title = 'S46V klubbmall'`)
    r.dbSame = before === after; r.live = live.length - live0
    sql(`delete from public.club_templates where title like 'S46V klubbmall%'`)
    note('AC16-club', r)
    check('AC16-club', 'Föreningens mall (local stand-in): hall as answered (Grophallen / Stora), markers placed on the grid; DB row unchanged; 0 live requests', ['grop', 'stora'].every((k) => r[k].hall === r[k].want && r[k].markers === r[k].teknik && r[k].markers > 0 && r[k].inOpen) && r.dbSame && r.live === 0, JSON.stringify(r))
  })
  await attempt('AC17', async () => {
    const p = await page({ bank: true }); await home(p, BRB)
    await p.locator('.footer-admin-login').first().click(); const dlg = p.getByRole('dialog', { name: 'Logga in som admin' }); await dlg.waitFor()
    const t0 = Date.now(); await dlg.locator('input[type=email]').fill('admin2@test.local'); await dlg.getByRole('button', { name: 'Skicka kod', exact: true }).click(); await dlg.locator('input.admin-code-input').waitFor()
    const m = await waitMail('admin2@test.local', t0 - 1); await dlg.locator('input.admin-code-input').pressSequentially((m.subject.match(/\b(\d{6})\b/) ?? [])[1]); await dlg.getByRole('button', { name: 'Logga in', exact: true }).click()
    await p.locator('.footer-admin-logout').first().waitFor({ timeout: 15000 })
    // a Mina mall so the Mina tools would show if wired
    await p.evaluate((k) => localStorage.setItem(k, JSON.stringify([])), TK)
    await wizard(p, { hall: STORA, len: '60 min' }); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V mina17'); await p.waitForTimeout(1300); await toHome(p); await wizard(p); await toHome(p)
    await openPlan(p); await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(400); await tap(p, STORA); await p.waitForTimeout(1500)
    const inSheet = await sheet(p).evaluate((s) => ({ text: s.innerText.replace(/\s+/g, ' '), copy: /Kopiera delningskod/.test(s.innerText), del: [...s.querySelectorAll('button')].some((b) => /^Ta bort/.test(b.textContent.trim())), hide: [...s.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Dölj'), changed: !!s.querySelector('.admin-last-changed'), mina: /S46V mina17/.test(s.innerText) }))
    await shot(p, '23_mall_step_admin_no_tools')
    await cancel(p).click(); await p.waitForTimeout(300); await p.locator('.home-start-primary, button:has-text("Fortsätt passet")').filter({ hasText: /Fortsätt passet/ }).first().click(); await p.locator('.builder').waitFor()
    await openMallarTab(p)
    const tab = await p.locator('.side-panel').evaluate((s) => ({ copy: /Kopiera delningskod/.test(s.innerText), del: [...s.querySelectorAll('button')].some((b) => /^Ta bort/.test(b.textContent.trim())), hide: [...s.querySelectorAll('button')].some((b) => /Dölj/.test(b.textContent.trim())), changed: !!s.querySelector('.admin-last-changed') })).catch((e) => ({ err: e.message }))
    await shot(p, '24_mallar_tab_admin_tools')
    note('AC17', { inSheet: { ...inSheet, text: inSheet.text.slice(0, 300) }, tab })
    check('AC17', 'Mall step (admin logged in): no admin tools, no «Kopiera delningskod», no «Ta bort»; Mallar tab still has Kopiera delningskod / Ta bort and the club admin tools', inSheet.mina && !inSheet.copy && !inSheet.del && !inSheet.hide && !inSheet.changed && tab.copy && tab.del, JSON.stringify({ inSheet: { ...inSheet, text: undefined }, tab }))
    await p.locator('.footer-admin-logout').first().click().catch(() => {}); await p.context().close()
  })
  await attempt('AC18', async () => {
    const sig = (pass) => JSON.stringify((pass.blocks ?? []).map((b) => [b.type, b.items.map((i) => i.activityId)]))
    const out = {}
    const mkOld = async (p, edited) => { await home(p); await wizard(p, { hall: STORA, len: '60 min' }); if (edited) { await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V gammal'); await p.waitForTimeout(1300) } const d = await draft(p); await toHome(p); return d }
    const paths = {
      questions: async (p) => { await wizard(p, { age: '10–12 år', focus: 'Tumbling', hall: GROP, len: '90 min' }) },
      'tomt-edit': async (p) => { await openPlan(p); await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(400); await tap(p, GROP); await opt(p, '60 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(600); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V ny tomt'); await addTeknik(p) },
      'tomt-noedit-home': async (p) => { await openPlan(p); await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.waitForTimeout(400); await tap(p, GROP); await opt(p, '60 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(1500); await toHome(p) },
      mall: async (p) => { await pickMall(p, GROP, 'Nybörjare') },
      'mall-undo': async (p) => { await pickMall(p, GROP, 'Nybörjare'); await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(1500) },
    }
    for (const edited of [true, false]) for (const [name, go] of Object.entries(paths)) {
      const p = await page(); const old = await mkOld(p, edited); const m0 = (await mallar(p)).length
      let dialogs = 0; p.on('dialog', async (d) => { dialogs++; await d.dismiss() })
      await go(p); const confirmShown = dialogs + await p.locator('.modal-backdrop[role=dialog]:visible').count()
      const cur = await draft(p); const ml = await mallar(p); const copy = ml.find((x) => x.auto && sig(x.pass) === sig(old))
      await p.reload(); await p.locator('.home, .builder').first().waitFor(); await p.waitForTimeout(500)
      const curR = await draft(p); const mlR = await mallar(p)
      const fortsatt = ((await p.locator('button').filter({ hasText: /Fortsätt passet/ }).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
      out[`${edited ? 'edited' : 'fresh'}-${name}`] = { oldTitle: old.title, mallarBefore: m0, confirmShown, stored: cur ? `${cur.title}|${cur.hallTemplateId}|${items(cur).length}` : null, storedIsOld: cur?.id === old.id, autoCopy: copy ? { title: copy.title, sameContent: true, hall: copy.pass.hallTemplateId, placements: JSON.stringify(copy.pass.hallPlacements) === JSON.stringify(old.hallPlacements) } : null, mallarAfter: ml.length, afterReload: { stored: curR ? `${curR.title}|${items(curR).length}` : null, mallar: mlR.length, view: (await p.locator('.builder').count()) ? 'builder' : 'home', fortsatt } }
      if (edited && name === 'mall-undo') await shot(p, '25_after_mall_undo_reload')
      await p.context().close()
    }
    note('AC18', out)
    const E = (k) => out[`edited-${k}`], F = (k) => out[`fresh-${k}`]
    const keptEdited = ['questions', 'tomt-edit', 'mall', 'mall-undo'].every((k) => E(k).autoCopy && E(k).autoCopy.placements && E(k).afterReload.mallar === E(k).mallarAfter)
    const noConfirm = Object.values(out).every((x) => x.confirmShown === 0)
    check('AC18', 'With a draft: Planera pass replaces the draft without asking (all 4 paths); the edited old draft is kept in Mina mallar as an auto copy (same content + placements), as Använd mall autosave does', noConfirm && keptEdited, JSON.stringify(out))
    check('AC18-fresh', 'INFO: an untouched (fresh) old draft is not archived (Slice 42 D1 rule)', true, JSON.stringify(Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('fresh')).map(([k, v]) => [k, { autoCopy: !!v.autoCopy, stored: v.stored, afterReload: v.afterReload }]))))
  })
  await attempt('AC18-main-ref', async () => {
    const sig = (pass) => JSON.stringify((pass.blocks ?? []).map((b) => [b.type, b.items.map((i) => i.activityId)]))
    const r = {}
    for (const [name, go] of Object.entries({
      'fran-mall-undo': async (p) => { await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(800); await p.locator('.template-card').filter({ hasText: 'Nybörjare' }).first().click(); const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); await p.waitForTimeout(300); r.confirm = await c.count(); if (r.confirm) await c.click(); await p.waitForTimeout(1500); await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(1500) },
      'tomt-edit': async (p) => { await p.getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.locator('.builder').waitFor(); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V ny tomt'); await addTeknik(p) },
    })) {
      const p = await page(); await home(p, MAIN); await p.getByRole('button', { name: 'Tomt pass', exact: true }).click(); await p.locator('.builder').waitFor(); await p.getByRole('textbox', { name: 'Passets titel' }).fill('S46V gammal'); await addTeknik(p); const old = await draft(p); await toHome(p)
      const btns = await p.locator('.home button:visible').allInnerTexts()
      await go(p); const cur = await draft(p); const ml = await mallar(p)
      r[name] = { homeButtonsWithDraft: btns.map((t) => t.replace(/\s+/g, ' ')), stored: cur && `${cur.title}|${items(cur).length}`, storedIsOld: cur?.id === old.id, autoCopy: ml.some((x) => x.auto && sig(x.pass) === sig(old)), mallar: ml.length }
      await p.context().close()
    }
    note('AC18-main-ref', r)
    check('AC18-main-ref', 'INFO main reference: start page with a draft; Från mall → Nybörjare → Ångra and Tomt pass → edit', true, JSON.stringify(r))
  })
  await attempt('AC20', async () => {
    const r = {}
    for (const [k, go] of [['builder', async () => {}], ['hall', async (p) => { await hall(p) }]]) {
      const p = await page({ bank: true }); await home(p, BRB); await wizard(p); await go(p); await p.locator('.footer-admin-login').first().waitFor({ timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400)
      const rows = await footRows(p, 'footer.app-footer')
      const last = rows?.at(-1); const lastFs = last ? parseFloat(last.fs) : 0; const otherFs = rows ? rows.slice(0, -1).flatMap((x) => x.items.map((i) => parseFloat(i.fs))) : []
      await p.locator('footer.app-footer button').filter({ hasText: 'Visa tips igen' }).first().click(); await p.waitForTimeout(300)
      const status = ((await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ').match(/Tips visas igen|Tips syns redan/) || [null])[0]
      const footerText = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
      await shot(p, `26_footer_${k}`); await p.locator('footer.app-footer').scrollIntoViewIfNeeded(); await shot(p, `26_footer_${k}_scrolled`)
      r[k] = { rows: rows?.map((x) => x.text), rowsOk: rows ? rowsOk(rows) : false, lastFs, maxOtherFs: Math.max(...otherFs), status, footerText }
      await p.context().close()
    }
    note('AC20', r)
    const ok = ['builder', 'hall'].every((k) => r[k].rows[0] === 'Tyck till · Visa tips igen · Uppdatera appen' && r[k].rows.includes('Logga in som admin') && r[k].rows.at(-1) === 'Träningsplaneraren · Slice 46' && r[k].rowsOk && r[k].lastFs <= r[k].maxOtherFs && !!r[k].status)
    check('AC20', 'Passbyggaren and Hallöversikt footer: «Tyck till · Visa tips igen · Uppdatera appen» / «Logga in som admin» / «Träningsplaneraren · Slice 46» (smallest); no edge «·»; Visa tips igen shows its status line', ok, JSON.stringify(r))
  })
  await attempt('AC22', async () => {
    const r = {}
    const strs = ['Tyck till', 'Uppdatera appen', 'Logga in som admin', NOTE, 'Träningsplaneraren · Slice', 'Visa tips igen']
    for (const [k, go] of [['home', async () => {}], ['pass', async (p) => { await wizard(p) }], ['golvklart', async (p) => { await wizard(p); await hall(p) }]]) {
      const p = await page({ vp: { width: 1280, height: 800 }, touch: false }); await home(p); await go(p)
      await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(300)
      const vis = await p.evaluate((strs) => { const out = []; for (const e of document.querySelectorAll('footer, .app-footer, .home-foot-rows, .home-entry-foot, .home-wizard-backdrop')) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); if (cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 0) out.push(e.className) } return out }, strs)
      const pdf = `${CK}/s46v_print_${k}.pdf`; await p.pdf({ path: pdf, format: 'A4', printBackground: true })
      const txt = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' })
      r[k] = { visibleFooters: vis, found: strs.filter((s) => txt.includes(s)), chars: txt.length }
      await p.context().close()
    }
    note('AC22', r)
    check('AC22', 'Print (pass, Golvklart; start page too): no footer rows, no note, no version line (print media + PDF text)', Object.values(r).every((x) => x.visibleFooters.length === 0 && x.found.length === 0) , JSON.stringify(r))
  })
}

note('live-requests', live.length)
check('LIVE', 'No request to any real *.supabase.co host during the run', live.length === 0, live.slice(0, 5).join(' '))
note('errors', errors.slice(0, 30))
const dedup = [...new Map(results.map((r) => [r.id, r])).values()]; results.length = 0; results.push(...dedup)
writeFileSync(RES, JSON.stringify({ when: new Date().toISOString(), branch: 'fe5e51e', main: 'bc8cce0', results, notes, errors }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass · page errors ${errors.length}`)
await browser.close()

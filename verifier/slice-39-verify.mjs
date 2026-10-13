// Slice 39 — Verifier independent checks (b0f9eab): Spara passet automatiskt. 390×844 headless Chrome.
// Local only. Plain branch preview (BR), main 4b056c8 preview (MAIN), bank build (ON) routed to MY stand-in
// (verifier/slice-36-local with S32_DIR=/tmp/s39v/sb, gateway :56870). No live Supabase requests.
// Usage: BR=… MAIN=… ON=… S32_DIR=/tmp/s39v/sb ONLY=A,B node verifier/slice-39-verify.mjs
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:56901/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:56902/traningsplaneringen/'
const ON = process.env.ON ?? 'http://127.0.0.1:56900/traningsplaneringen/'
const ROOT = process.env.S39_ROOT ?? new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const S32 = process.env.S32_DIR ?? '/tmp/s39r/sb'
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = process.env.SS ?? '/workspace/screenshots/s39vr_'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const MD = readFileSync(`${ROOT}/slice-39/content/microcopy.sv.md`, 'utf8')
const md = (k) => MD.match(new RegExp('^\\| `' + k + '`(?: \\*\\*[^*]+\\*\\*)?(?: \\([^)]*\\))? \\| ([^|]+?) \\|', 'm'))[1].trim()
const S = { saved: md('autosaveSaved'), failed: md('autosaveFailed'), toast: md('autosaveFailedToast'), untitled: md('untitledPass'), tbody: md('templateBody'), footer: md('footerSliceLabel') }
const results = [], notes = {}
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 400) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 300) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0]) } }
const sql = (q) => { const env = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8')); return execFileSync('psql', ['-h', '127.0.0.1', '-p', String(env.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME } }).trim() }

// Init script: draft-key write spy (timestamps), storage-full switch, toast / live-region mutation counters.
const SPY = ([DK, TK]) => {
  window.__w = []; window.__tw = 0; window.__toasts = []; window.__live = 0
  const orig = Storage.prototype.setItem
  Storage.prototype.setItem = function (k, v) {
    if (k === DK) { if (window.__failDraft) throw new DOMException('full', 'QuotaExceededError'); window.__w.push(performance.now()) }
    if (k === TK) window.__tw++
    return orig.call(this, k, v)
  }
  const start = () => new MutationObserver((ms) => {
    for (const m of ms) {
      const el = m.target.nodeType === 1 ? m.target : m.target.parentElement
      if (!el) continue
      for (const n of m.addedNodes ?? []) if (n.nodeType === 1 && n.matches?.('.toast')) window.__toasts.push(n.textContent)
      if (el.closest?.('[aria-live],[role=status],[role=alert],[role=log]')) window.__live++
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start)
}
const GATEWAY = (() => { try { return `http://127.0.0.1:${JSON.parse(readFileSync(`${S32}/env.json`, 'utf8')).gatewayPort}` } catch { return null } })()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const bankLog = []
async function newCtx() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route('https://bank-mock.supabase.co/**', async (route) => {
    const req = route.request(); const u = new URL(req.url()); bankLog.push(u.pathname); const headers = { ...req.headers() }; delete headers.host
    if (!GATEWAY) return route.abort('failed')
    try { return await route.fulfill({ response: await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  await ctx.route(/supabase\.co/, (route) => { const h = new URL(route.request().url()).host; if (h === 'bank-mock.supabase.co') return route.fallback(); bankLog.push('LIVE?' + h); return route.abort('failed') })
  await ctx.addInitScript(SPY, [DK, TK])
  return ctx
}
const errors = []
async function newPage(ctx, url) { const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); p.base = url; return p }
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const tmpls = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const nItems = (d) => d ? d.blocks.reduce((n, b) => n + b.items.length, 0) : -1
const status = (p) => p.locator('.save-status')
const builder = (p) => p.locator('.builder')
const title = (p) => p.getByRole('textbox', { name: 'Passets titel' })
const homeText = async (p) => (await p.locator('.home').innerText()).replace(/\s+/g, ' ')
const now = (p) => p.evaluate(() => performance.now())
const writesSince = (p, t) => p.evaluate((t) => window.__w.filter((x) => x >= t), t)
const shot = (p, n) => p.screenshot({ path: `${SS}${n}.png` })
async function toHome(p) { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor() }
async function boot(p) { await p.goto(p.base); await p.locator('.home, .builder').first().waitFor(); if (await builder(p).count()) await toHome(p) }
async function fresh(p) { await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function cont(p) { await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor() }
async function wizard(p) {
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await builder(p).waitFor()
}
async function addTeknik(p, n = 0) {
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click(); else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor()
  await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(n).click()
  await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
}
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor() }
async function fromMall(p) { await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).first().click() }
async function applyBuiltIn(p, re = /Nybörjare/) {
  await p.locator('.template-card').filter({ hasText: re }).first().click()
  const dlg = p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true })
  if (await dlg.count()) await dlg.click()
  await builder(p).waitFor()
}

// ═══ A. Debounce timing per edit kind + flush edges (AC2–AC5) ═══
await section('A', async () => {
  const ctx = await newCtx(); let p = await newPage(ctx, BR)
  await fresh(p); await wizard(p); await toHome(p); await cont(p)
  const id0 = (await draft(p)).id
  const timing = {}
  async function measure(kind, act, verify) {
    await p.waitForTimeout(1200)
    const t0 = await now(p); await act(); const t1 = await now(p)
    await p.waitForTimeout(1600)
    const w = await writesSince(p, t0); const d = await draft(p)
    timing[kind] = { writes: w.length, msAfterEdit: w.length ? Math.round(w[0] - t1) : null }
    check(`A-${kind}`, `${kind}: exactly one write ~800 ms after the edit, change stored, same id`, w.length === 1 && w[0] - t1 > 600 && w[0] - t1 < 1100 && (await verify(d)) && d.id === id0, JSON.stringify(timing[kind]))
  }
  await measure('title', () => title(p).fill('Tisdag A'), (d) => d.title === 'Tisdag A')
  await measure('passlength', () => p.locator('.pass-length').getByRole('button', { name: '90', exact: true }).click(), (d) => d.targetMinutes === 90)
  let before = nItems(await draft(p))
  await measure('add-station', async () => { await addTeknik(p, 3) }, (d) => nItems(d) === before + 1)
  await measure('item-minutes', async () => {
    const it = p.locator('.session-item').first(); await it.locator('.item-info').click()
    await it.locator('.item-duration input').fill('7')
  }, (d) => d.blocks.some((b) => b.items.some((i) => i.durationMinutes === 7)))
  before = nItems(await draft(p))
  await measure('remove-station', () => p.locator('.item-remove').last().click(), (d) => nItems(d) === before - 1)
  note('A.timing', timing)
  note('A.noUI', 'Passbyggaren has no station reorder (Flytta upp/ner keys exist but are unused in components) and no pass-notes field, so those edit kinds cannot be driven')
  // Burst: 12 keystrokes 120 ms apart + 5 length taps → one write after the last change
  await p.waitForTimeout(1200)
  const tb = await now(p); const vis = []
  await title(p).fill('')
  for (const ch of 'Snabbskrivet') { await title(p).press(ch === ' ' ? 'Space' : ch); vis.push(await status(p).isVisible()); await p.waitForTimeout(120) }
  for (const m of ['60', '90', '60', '90', '120']) await p.locator('.pass-length').getByRole('button', { name: m, exact: true }).click()
  const tl = await now(p); await p.waitForTimeout(1600)
  const wb = await writesSince(p, tb)
  check('A-burst', 'Burst (12 keys + 5 taps over ~2 s) → 1 write ~800 ms after the last change; «Sparat» visible throughout', wb.length === 1 && wb[0] - tl > 600 && wb[0] - tl < 1100 && vis.every(Boolean) && (await draft(p)).title === 'Snabbskrivet', `writes ${wb.length}, +${wb.length ? Math.round(wb[0] - tl) : '-'} ms`)
  // Edge: edit then reload at once (no wait) → pagehide flush
  await title(p).fill('Reload direkt'); await p.reload(); await p.locator('.home, .builder').first().waitFor()
  check('A-reload', 'Edit → reload at once (0 ms) → change kept', (await draft(p)).title === 'Reload direkt', (await draft(p)).title)
  if (await builder(p).count()) await toHome(p)
  await cont(p)
  // Edge: visibilitychange → hidden flushes at once
  await title(p).fill('Dold flik'); const tv = await now(p)
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')) })
  const wv = await writesSince(p, tv)
  check('A-vis', 'visibilitychange:hidden → write within the same task (no 800 ms wait)', wv.length === 1 && (await draft(p)).title === 'Dold flik', `writes ${wv.length} +${wv.length ? Math.round(wv[0] - tv) : '-'} ms`)
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }) })
  // Edge: navigate away (goto other URL) at once
  await title(p).fill('Bort direkt'); await p.goto('about:blank'); await p.goto(BR); await p.locator('.home, .builder').first().waitFor()
  check('A-nav', 'Edit → navigate away at once → kept', (await draft(p)).title === 'Bort direkt')
  if (await builder(p).count()) await toHome(p)
  await cont(p)
  // Edge: close tab at once — with and without beforeunload
  await title(p).fill('Stängd A'); await p.close({ runBeforeUnload: true })
  p = await newPage(ctx, BR); await boot(p)
  check('A-close1', 'Edit → close tab at once (runBeforeUnload) → reopen → kept', (await draft(p)).title === 'Stängd A')
  await cont(p); await title(p).fill('Stängd B'); await p.close()
  p = await newPage(ctx, BR); await boot(p)
  const cb = (await draft(p)).title
  note('A.closeNoUnload', `page.close() without unload handlers (Playwright skips pagehide) → stored title «${cb}»`)
  // AC4: edit then Till startsidan within 300 ms
  await cont(p); await title(p).fill('Hem snabbt'); await p.locator('.pass-length').getByRole('button', { name: '60', exact: true }).click()
  const th = await now(p); await toHome(p); const th2 = await now(p)
  check('AC4', 'Edit → Till startsidan at once → Home shows new title / minutes', (await homeText(p)).includes(`Hem snabbt · ${(await draft(p)).totalMinutes} min`) && th2 - th < 300, `${Math.round(th2 - th)} ms; ${await homeText(p)}`.slice(0, 200))
  // AC19 bit: Kör passet right after an edit flushes
  await cont(p); await title(p).fill('Kör direkt')
  await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).click(); await p.locator('.run-pass').waitFor()
  check('A-run', 'Edit → Kör passet at once → stored (flush)', (await draft(p)).title === 'Kör direkt')
  await p.locator('.run-pass').getByRole('button', { name: 'Avsluta' }).click()
  await ctx.close()
})

// ═══ B. «Spara utkast» gone everywhere; quiet «Sparat»; no toast / live-region noise (AC1, AC2, AC3, AC17, AC18, AC22) ═══
await section('B', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  const ctxM = await newCtx(); const pm = await newPage(ctxM, MAIN)
  for (const q of [p, pm]) { await fresh(q); await wizard(q) }
  const seen = { branch: [], main: [] }
  async function scan(q, key, where) { const t = await q.locator('body').innerText(); const b = await q.getByRole('button', { name: /Spara utkast/ }).count(); if (t.includes('Spara utkast') || b) seen[key].push(where) }
  for (const [q, key] of [[p, 'branch'], [pm, 'main']]) {
    await scan(q, key, 'builder row')
    await q.getByRole('button', { name: 'Fler saker med passet' }).click(); await q.waitForTimeout(300); await scan(q, key, 'Fler'); await q.keyboard.press('Escape'); await q.waitForTimeout(200)
    if (await q.locator('.more-menu-panel').isVisible()) await q.locator('.more-backdrop').click().catch(() => {})
    await menu(q, 'Använd mall'); await q.waitForTimeout(400); await scan(q, key, 'Använd mall sheet'); await q.locator('.sheet-close').first().click().catch(() => {}); await q.waitForTimeout(300)
    await menu(q, 'Spara som egen mall'); await q.waitForTimeout(300); await scan(q, key, 'Spara som egen mall'); await q.getByRole('button', { name: 'Fortsätt redigera' }).click(); await q.waitForTimeout(200)
    await openHall(q); await scan(q, key, 'Hallöversikt')
    await q.getByRole('button', { name: /Golvklart/ }).first().click(); await q.waitForTimeout(500); await scan(q, key, 'Golvklart')
    await q.goto(q.base); await q.locator('.home, .builder').first().waitFor(); if (await builder(q).count()) await toHome(q)
    await scan(q, key, 'Home')
  }
  check('AC1', 'No «Spara utkast» on branch (row, Fler, Använd mall sheet, Spara som egen mall, Hallöversikt, Golvklart, Home); main has it', seen.branch.length === 0 && seen.main.includes('builder row'), JSON.stringify(seen))
  // «Sparat»: exact text, muted, inside .builder-actions, no role/aria-live; live-region + toast noise vs main over the same edits
  await cont(p); await cont(pm)
  const st = await status(p).evaluate((e) => ({ text: e.textContent, color: getComputedStyle(e).color, inRow: !!e.closest('.builder-actions'), role: e.getAttribute('role'), live: e.getAttribute('aria-live'), liveAnc: !!e.parentElement.closest('[aria-live],[role=status],[role=alert]'), ariaHidden: e.getAttribute('aria-hidden') }))
  check('AC2/B1', '«Sparat» exact text, muted rgb(120,113,108), in .builder-actions, plain text (no role / aria-live / live ancestor)', st.text === S.saved && st.color === 'rgb(120, 113, 108)' && st.inRow && !st.role && !st.live && !st.liveAnc, JSON.stringify(st))
  for (const q of [p, pm]) await q.evaluate(() => { window.__toasts = []; window.__live = 0 })
  for (const q of [p, pm]) {
    for (const v of ['Ett', 'Två', 'Tre']) { await title(q).fill(v); await q.waitForTimeout(1000) }
    await addTeknik(q, 2); await q.waitForTimeout(1000); await q.locator('.item-remove').last().click(); await q.waitForTimeout(1000)
  }
  const nb = await p.evaluate(() => ({ toasts: window.__toasts, live: window.__live })), nm = await pm.evaluate(() => ({ toasts: window.__toasts, live: window.__live }))
  check('AC3/AC17', 'Five saved edits: 0 toasts; live-region mutations same as main (no extra announcements); «Sparat» stays (no «Sparar…»)', nb.toasts.length === 0 && nb.live <= nm.live && (await status(p).innerText()) === S.saved && !(await p.locator('body').innerText()).includes('Sparar'), `branch ${JSON.stringify(nb)} main ${JSON.stringify(nm)}`)
  // AC18: row layout at 390
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200)
  const lay = await p.locator('.builder-actions').evaluate((row) => {
    const s = row.querySelector('.save-status').getBoundingClientRect()
    const kids = [...row.querySelectorAll('button, .more-menu')].filter((e) => e.offsetParent && !e.closest('.more-menu-panel')).map((e) => ({ t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 20), r: e.getBoundingClientRect() }))
    const hit = kids.filter((o) => !(s.right <= o.r.left || s.left >= o.r.right || s.bottom <= o.r.top || s.top >= o.r.bottom)).map((o) => o.t)
    const tops = [...new Set([s, ...kids.map((k) => k.r)].map((r) => Math.round(r.top)))]
    return { hit, s: [Math.round(s.left), Math.round(s.top), Math.round(s.right), Math.round(s.bottom)], kids: kids.map((k) => k.t), tops, sw: document.documentElement.scrollWidth }
  })
  check('AC18', '390 px: «Sparat» overlaps nothing, inside viewport, no horizontal scroll', lay.hit.length === 0 && lay.s[2] <= 390 && lay.sw <= 390, JSON.stringify(lay))
  await shot(p, '01_builder_sparat_390')
  // AC22: footer, template confirm text
  const foot = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('AC22a', `Footer «${S.footer}»`, foot.includes(S.footer), foot.slice(0, 120))
  await menu(p, 'Använd mall'); await p.waitForTimeout(400)
  await p.locator('.template-card').filter({ hasText: /Kort/ }).first().click()
  const dlg = p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Ersätta det här passet?' })
  await dlg.waitFor(); const dt = (await dlg.innerText()).replace(/\s+/g, ' ')
  check('AC22b', 'Använd mall confirm shows the new templateBody verbatim', dt.includes(S.tbody), dt.slice(0, 220))
  await shot(p, '02_anvand_mall_confirm')
  await dlg.getByRole('button', { name: 'Fortsätt redigera' }).click()
  await ctx.close(); await ctxM.close()
})

// ═══ C. Saved at creation, reload right after (AC6, AC7, AC8, AC9) ═══
await section('C', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await fresh(p)
  // Built-in mall → reload at once
  await fromMall(p); await applyBuiltIn(p, /Nybörjare/); const dB = await draft(p); await p.reload(); await p.locator('.home, .builder').first().waitFor()
  const dB2 = await draft(p); const tek = dB2?.blocks.find((b) => b.type === 'techniques')?.items.map((i) => i.id) ?? []
  check('AC6', 'Built-in mall → apply → reload at once → stored = that mall, Teknik placements kept', dB && dB2 && dB2.id === dB.id && /Nybörjare/.test(dB2.title) && tek.length > 0 && tek.every((id) => dB2.hallPlacements.some((x) => x.sessionItemId === id)), `${dB2?.title} tek ${tek.length} placed ${dB2?.hallPlacements?.length}`)
  if (await builder(p).count()) await toHome(p)
  check('AC6-home', 'Home shows Fortsätt passet · that mall', (await homeText(p)).includes(`${dB2.title} · ${dB2.totalMinutes} min`))
  // Egen mall (Mina mallar): save current as own mall, then a new pass, then apply the own mall → reload at once
  await cont(p); await menu(p, 'Spara som egen mall'); await p.locator('.modal input').fill('V39 egen'); await p.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await p.waitForTimeout(300)
  await toHome(p); await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 6); await title(p).fill('Mellanpass'); await toHome(p)
  await fromMall(p); await p.locator('.template-saved .template-card').filter({ hasText: 'V39 egen' }).first().click()
  const d1 = p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }); if (await d1.count()) await d1.click()
  await builder(p).waitFor(); const dE = await draft(p); await p.reload(); await p.locator('.home, .builder').first().waitFor()
  const dE2 = await draft(p)
  check('AC7-egen', 'Mina mallar «V39 egen» → apply → reload at once → stored (fresh id, mall contents; pass keeps its own title)', dE2.id === dE.id && dE2.id !== dB2.id && dE2.title !== 'Mellanpass' && nItems(dE2) === nItems(dB2), `${dE2.title}, items ${nItems(dE2)}`)
  // Wizard → reload at once (Planera pass shows only with an empty slot)
  await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor()
  await wizard(p); const dW = await draft(p); await p.reload(); await p.locator('.home, .builder').first().waitFor()
  check('AC7-wizard', 'Planera pass wizard → reload at once → stored, «Sparat» after reopen', dW && (await draft(p)).id === dW.id)
  if (await builder(p).count()) await toHome(p)
  await cont(p); check('AC7-wizard-sparat', 'Reopened wizard pass shows «Sparat»', (await status(p).innerText()) === S.saved)
  await toHome(p)
  // AC8: Tomt pass, title only, back Home / reload → old pass kept, «Sparat» never shown
  const old = await draft(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor()
  await title(p).fill('Bara titel'); await p.waitForTimeout(1300)
  const shown = await status(p).count()
  await p.reload(); await p.locator('.home, .builder').first().waitFor(); if (await builder(p).count()) await toHome(p)
  check('AC8', 'Tomt pass + title only → no «Sparat», reload → old pass still on Home (not replaced)', shown === 0 && (await draft(p)).id === old.id && (await homeText(p)).includes(`${old.title} ·`), (await homeText(p)).slice(0, 120))
  // AC9: Tomt pass + first station → reload at once (pagehide flush) → new pass; old in Mina mallar under its title
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor()
  await title(p).fill('Första station'); await addTeknik(p, 4); await p.reload(); await p.locator('.home, .builder').first().waitFor(); if (await builder(p).count()) await toHome(p)
  const t9 = await tmpls(p)
  check('AC9', 'Tomt pass + first station → reload at once → Home = new pass; old pass in Mina mallar under its title', (await homeText(p)).includes('Första station ·') && t9.some((x) => x.title === old.title), t9.map((x) => x.title).join(' | '))
  await cont(p); check('AC9-sparat', '«Sparat» shown on the new pass', (await status(p).innerText()) === S.saved)
  // E1 corner: Tomt pass, add a station then remove it again → «more stations than it started with» rule
  await toHome(p); const keep = (await draft(p)).id
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await p.locator('.item-remove').first().click(); await p.waitForTimeout(1200)
  check('E1-remove', 'Tomt pass: removing a starter row (no station added) does not write', (await draft(p)).id === keep)
  await toHome(p); await ctx.close()
})

// ═══ C2. Föreningsmall via the stand-in (AC7) ═══
await section('C2', async () => {
  sql(`delete from public.club_templates where title = 'V39 klubbmall'`)
  const payload = { v: 1, title: 'V39 klubbmall', notes: '', hallTemplateId: 'forening-bla', blocks: [
    { type: 'warmup', durationMinutes: 10, items: [{ id: 'c1', activityId: 'warm-jogg', durationMinutes: 10, note: '', order: 0 }] },
    { type: 'techniques', durationMinutes: 20, items: [{ id: 'c2', activityId: 'tech-hjul', durationMinutes: 10, note: '', order: 0 }, { id: 'c3', activityId: 'tech-kullerbytta', durationMinutes: 10, note: '', order: 1 }] }] }
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V39 klubbmall', 30, '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb)`)
  const ctx = await newCtx(); const p = await newPage(ctx, ON)
  await fresh(p); await fromMall(p); await p.waitForTimeout(800)
  await p.locator('section.club-templates .template-card').filter({ hasText: 'V39 klubbmall' }).first().click()
  const b = p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }); if (await b.count()) await b.click()
  await builder(p).waitFor(); const dC = await draft(p)
  await p.reload(); await p.locator('.home, .builder').first().waitFor()
  const dC2 = await draft(p)
  check('AC7-club', 'Föreningsmall (stand-in) → apply → reload at once → stored, Teknik placed', dC && dC2?.id === dC.id && dC2.title === 'V39 klubbmall' && dC2.hallPlacements.length >= 1, `${dC2?.title} placements ${dC2?.hallPlacements?.length}`)
  if (await builder(p).count()) await toHome(p)
  await shot(p, '03_home_club_saved')
  await ctx.close()
})

// ═══ D. One pass, one id, no duplicates (AC10) ═══
await section('D', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await fresh(p); await wizard(p); const id = (await draft(p)).id
  for (let i = 0; i < 15; i++) { await title(p).fill(`Version ${i}`); await p.waitForTimeout(i % 3 ? 200 : 900) }
  await addTeknik(p, 1); await p.waitForTimeout(900); await toHome(p)
  for (let i = 0; i < 3; i++) { await cont(p); await title(p).fill(`Igen ${i}`); await toHome(p) }
  const keys = await p.evaluate(() => Object.keys(localStorage).sort())
  check('AC10', '20 edits + 3 reopen cycles → same id, Mina mallar empty, one Fortsätt passet, no new storage keys', (await draft(p)).id === id && (await tmpls(p)).length === 0 && (await p.getByRole('button', { name: /Fortsätt passet/ }).count()) === 1, keys.join(','))
  note('D.keys', keys)
  await ctx.close()
})

// ═══ E. Replaced pass → Mina mallar, cap 8 (D1 guard, AC9, AC11, AC12) ═══
await section('E', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await fresh(p)
  // Hand-saved own mall first (the coach's deliberate one)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 0); await title(p).fill('Pass 0')
  await menu(p, 'Spara som egen mall'); await p.locator('.modal input').fill('Min handsparade mall'); await p.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await p.waitForTimeout(300)
  await toHome(p)
  const log = []
  for (let k = 1; k <= 9; k++) {
    await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor()
    await title(p).fill(`Pass ${k}`); await addTeknik(p, k); await p.waitForTimeout(950); await toHome(p)
    log.push((await tmpls(p)).map((x) => x.title).join(' | '))
  }
  note('E.after_each_replace', log)
  const t = await tmpls(p)
  check('E-archive-names', 'Replaced passes archived under their own titles, newest first (Pass 8 … Pass 2) + the hand-saved one', t.map((x) => x.title).join() === ['Pass 8', 'Pass 7', 'Pass 6', 'Pass 5', 'Pass 4', 'Pass 3', 'Pass 2', 'Min handsparade mall'].join(), t.map((x) => x.title + (x.auto ? '*' : '')).join(' | '))
  check('E-cap', 'Cap 8 holds: list length 8 after 10 entries', t.length === 8, t.length)
  const handGone = !t.some((x) => x.title === 'Min handsparade mall')
  note('E.cap_drop', `oldest dropped first; hand-saved «Min handsparade mall» ${handGone ? 'SILENTLY EVICTED' : 'kept'}; «Pass 0» ${t.some((x) => x.title === 'Pass 0') ? 'kept' : 'evicted'}; no message shown`)
  check('E-cap-hand-kept', '4b92442 rule: auto-copies push out only auto-copies; the hand-saved mall survives 9 replacements', !handGone && t.filter((x) => x.auto).length === 7, notes['E.cap_drop'])
  await fromMall(p); await p.waitForTimeout(300); await shot(p, '04_mina_mallar_cap8'); await p.keyboard.press('Escape')
  // Dedupe by contents ignores the title: a different-titled pass with identical contents is not archived again
  await p.goto(p.base); await p.locator('.home').waitFor()
  const before11 = (await tmpls(p)).length
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('Kopia av 5'); await addTeknik(p, 5); await p.waitForTimeout(950); await toHome(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 12); await p.waitForTimeout(950); await toHome(p)
  const t2 = await tmpls(p)
  note('E.dedupe_title', `«Kopia av 5» (same stations as «Pass 5», other title) replaced → Mina mallar: ${t2.map((x) => x.title).join(' | ')}`)
  check('AC11-title', 'Dedupe is by contents only: «Kopia av 5» is NOT archived under its own title because «Pass 5» has the same contents (recorded)', !t2.some((x) => x.title === 'Kopia av 5') && t2.some((x) => x.title === 'Pass 5'), `${before11} → ${t2.length}`)
  // Same old pass replaced twice: re-open Pass 5 from Mina mallar (new id, same contents), replace it twice
  await fromMall(p); await p.locator('.template-saved .template-card').filter({ hasText: 'Pass 5' }).first().click()
  { const d = p.getByRole('dialog').getByRole('button', { name: 'Använd mall', exact: true }); if (await d.count()) await d.click() }
  await builder(p).waitFor(); await toHome(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 13); await p.waitForTimeout(950); await toHome(p)
  const t3 = await tmpls(p)
  check('AC11', 'Same old pass contents replaced twice → one archived copy («Pass 5» once)', t3.filter((x) => x.title === 'Pass 5').length === 1, t3.map((x) => x.title).join(' | '))
  // AC12: empty title → Home «Nytt pass», archived as «Nytt pass»
  await cont(p); await title(p).fill(''); await toHome(p)
  const h12 = await homeText(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 14); await p.waitForTimeout(950); await toHome(p)
  const t12 = await tmpls(p)
  check('AC12', 'Empty title → Home «Fortsätt passet Nytt pass · N min»; archived as «Nytt pass»', /Fortsätt passet Nytt pass · \d+ min/.test(h12) && t12[0].title === S.untitled, `${h12.slice(0, 90)} / ${t12[0].title}`)
  await ctx.close()
})

// ═══ F. Hallöversikt interplay (AC19 + race) ═══
await section('F', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await fresh(p); await wizard(p)
  const placed0 = (await draft(p)).hallPlacements.length
  // Edit then open Hallöversikt at once (flush), then remove a chip within 300 ms
  await title(p).fill('Hall före'); await openHall(p)
  check('F1', 'Edit → Hallöversikt at once → title flushed before the hall shows', (await draft(p)).title === 'Hall före')
  await p.locator('[aria-label="Ta bort från hall"]').first().click({ force: true })
  const afterRm = await draft(p)
  check('F2', '«Ta bort från hall» is written at once (HallBoard saveDraft), title kept', afterRm.hallPlacements.length === placed0 - 1 && afterRm.title === 'Hall före', `${placed0} → ${afterRm.hallPlacements.length}`)
  // Placera här: expand tray, pick the unplaced chip, tap the canvas
  const exp = p.getByRole('button', { name: /Visa|ej placerade/i }).filter({ has: p.locator(':scope') })
  const tray = p.locator('.hall-tray-toggle'); if (await tray.count() && (await tray.getAttribute('aria-expanded')) === 'false') await tray.click()
  await p.locator('.hall-tray-list .hall-chip, .hall-tray-list button').first().click()
  const cv = await p.locator('.hall-canvas').boundingBox(); await p.mouse.click(cv.x + cv.width * 0.3, cv.y + cv.height * 0.4)
  await p.waitForTimeout(100)
  const afterPl = await draft(p)
  check('F3', '«Placera här» (tray chip → tap canvas) written at once', afterPl.hallPlacements.length === placed0, `${afterPl.hallPlacements.length}`)
  // Använd alla förslag
  await p.waitForTimeout(1200)
  const pre = (await draft(p)).blocks.flatMap((b) => b.items).filter((i) => i.stationEquipment?.length).length
  check('AC19-manual', 'Använd alla förslag still manual: no redskap stored by autosave before the tap', pre === 0, pre)
  const aa = p.getByRole('button', { name: 'Spara redskapsförslag på alla stationer som fortfarande saknar sparade redskap', exact: true })
  const dis = await aa.isDisabled()
  if (!dis) await aa.click(); await p.waitForTimeout(100)
  const afterAA = await draft(p)
  const eq = afterAA.blocks.flatMap((b) => b.items).filter((i) => i.stationEquipment?.length).length
  check('F4', 'Använd alla förslag (one tap) → redskap written at once', !dis && eq > 0, `disabled ${dis}, items with redskap ${eq}`)
  // Wait past the autosave delay: the hook must not write a stale pass over the hall data
  await p.waitForTimeout(1500)
  const later = await draft(p)
  check('F5', 'After 1.5 s (autosave timer): hall data intact (placements + redskap + title)', JSON.stringify(later.hallPlacements) === JSON.stringify(afterAA.hallPlacements) && later.title === 'Hall före' && later.blocks.flatMap((b) => b.items).filter((i) => i.stationEquipment?.length).length === eq)
  await shot(p, '05_hall_after_changes')
  // Back to builder, edit at once, Home at once → both hall data and edit kept
  await p.getByRole('button', { name: /Tillbaka|Passbyggaren/ }).first().click(); await builder(p).waitFor()
  await title(p).fill('Hall efter'); await toHome(p)
  const fin = await draft(p)
  check('F6', 'Hall → builder → edit → Home at once: edit and all hall changes kept', fin.title === 'Hall efter' && JSON.stringify(fin.hallPlacements) === JSON.stringify(afterAA.hallPlacements))
  // Hall change → leave hall within 100 ms → Home within 100 ms → reload
  await cont(p); await openHall(p)
  await p.locator('[aria-label="Ta bort från hall"]').first().click({ force: true })
  const r1 = await draft(p)
  await p.getByRole('button', { name: /Tillbaka|Passbyggaren/ }).first().click(); await builder(p).waitFor(); await toHome(p); await p.reload(); await p.locator('.home').waitFor()
  await p.waitForTimeout(1200)
  check('F7', 'Hall remove → back → Home → reload within ~300 ms → removal kept', JSON.stringify((await draft(p)).hallPlacements) === JSON.stringify(r1.hallPlacements))
  // Golvklart round trip
  await cont(p); await openHall(p); await p.getByRole('button', { name: /Golvklart/ }).first().click(); await p.waitForTimeout(500)
  check('AC19-golv', 'Golvklart opens from Hallöversikt; no write on entering', JSON.stringify((await draft(p)).hallPlacements) === JSON.stringify(r1.hallPlacements))
  await ctx.close()
})

// ═══ G. Two tabs on the same pass (HANDOFF Open 2: last write wins, not handled) ═══
await section('G', async () => {
  const ctx = await newCtx(); const a = await newPage(ctx, BR)
  await fresh(a); await wizard(a); await toHome(a)
  const b = await newPage(ctx, BR); await boot(b)
  await cont(a); await cont(b)
  const id = (await draft(a)).id
  await b.evaluate(() => { window.__storageEv = 0; addEventListener('storage', () => window.__storageEv++) })
  await title(a).fill('Ändrat i A'); await a.waitForTimeout(1200)
  const afterA = await draft(a)
  const bTitle = await title(b).inputValue(), bEv = await b.evaluate(() => window.__storageEv)
  await addTeknik(b, 7); await b.waitForTimeout(1200)
  const afterB = await draft(b)
  note('G.tabs', { afterA_title: afterA.title, tabB_title_shown_after_A: bTitle, storageEventsInB: bEv, afterB_title: afterB.title, afterB_items: nItems(afterB), sameId: afterB.id === id })
  check('G1', 'Tab B is not updated from A (no storage listener): B still shows the old title', bTitle !== 'Ändrat i A', `B shows «${bTitle}», storage events ${bEv}`)
  check('G2', 'Last write wins: B\'s autosave overwrites A\'s title silently (A\'s change lost from storage; same id, no archive)', afterB.title !== 'Ändrat i A' && afterB.id === id && (await tmpls(a)).length === 0, `stored title «${afterB.title}»`)
  await title(a).fill('A igen'); await a.waitForTimeout(1200)
  const afterA2 = await draft(a)
  check('G3', 'A edits again → overwrites B\'s added station (B\'s change lost from storage)', afterA2.title === 'A igen' && nItems(afterA2) === nItems(afterA), `items ${nItems(afterA2)} vs B ${nItems(afterB)}`)
  await a.evaluate(() => window.scrollTo(0, 0)); await shot(a, '06_two_tabs_A'); await shot(b, '07_two_tabs_B')
  // Main has the same model (no storage event) but only on an explicit Spara utkast
  // Tab B with a Tomt pass + station while A owns the slot → A's pass archived to Mina mallar
  await toHome(b); await b.getByRole('button', { name: 'Tomt pass' }).click(); await builder(b).waitFor(); await addTeknik(b, 9); await b.waitForTimeout(1200)
  const t = await tmpls(b)
  note('G.tabB_newpass', `B starts a new pass: slot = «${(await draft(b)).title}», Mina mallar = ${t.map((x) => x.title).join(' | ')}; A still edits «${await title(a).inputValue()}»`)
  await title(a).fill('A tredje'); await a.waitForTimeout(1200)
  const t2 = await tmpls(a)
  note('G.tabA_after', `A edits again: slot = «${(await draft(a)).title}», Mina mallar = ${t2.map((x) => x.title).join(' | ')}`)
  check('G4', 'Two tabs on different passes ping-pong the slot but each replaced pass lands in Mina mallar (no silent total loss)', t2.length >= 1)
  await ctx.close()
})

// ═══ H. Stale-timer races: id change while a debounced write is pending ═══
await section('H', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  async function race(label, gap, act) {
    await fresh(p); await wizard(p); await toHome(p); await cont(p)
    const oldId = (await draft(p)).id
    await title(p).fill(`${label} gammal`)
    await act(gap)
    await builder(p).waitFor(); await p.waitForTimeout(1500)
    const onScreen = await title(p).inputValue(); const d = await draft(p)
    await toHome(p); const home = await homeText(p)
    const t = await tmpls(p)
    const r = { gapMs: gap, onScreen, storedTitle: d.title, storedIsOld: d.id === oldId, home: home.match(/Fortsätt passet (.*?) · \d+ min/)?.[1], mallar: t.map((x) => x.title) }
    note(`H.${label}.${gap}`, r)
    return r
  }
  for (const gap of [0, 100, 400, 790]) {
    const r = await race('Nyvecka', gap, async (g) => {
      const t0 = Date.now()
      await p.getByRole('button', { name: 'Fler saker med passet' }).click()
      await p.locator('.more-menu-panel').getByRole('button', { name: 'Ny vecka från det här passet' }).click()
      const left = g - (Date.now() - t0); if (left > 0) await p.waitForTimeout(left)
      await p.getByRole('button', { name: 'Skapa kopia', exact: true }).click(); notes[`H.Nyvecka.${g}.ms`] = Date.now() - t0
    })
    check(`H-nyvecka-${gap}`, `Edit → Ny vecka → Skapa kopia at ~${gap} ms (measured ${notes[`H.Nyvecka.${gap}.ms`]} ms): Home = copy on screen; old pass with its edit in Mina mallar`, r.home === r.onScreen && !r.storedIsOld && r.mallar.includes('Nyvecka gammal'), JSON.stringify(r))
  }
  for (const gap of [0, 100, 400, 790]) {
    const r = await race('Anvandmall', gap, async (g) => {
      const t0 = Date.now()
      await menu(p, 'Använd mall')
      await p.locator('.template-card').filter({ hasText: /Kort/ }).first().click()
      const left = g - (Date.now() - t0); if (left > 0) await p.waitForTimeout(left)
      await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); notes[`H.Anvandmall.${g}.ms`] = Date.now() - t0
    })
    check(`H-mall-${gap}`, `Edit → Använd mall (Kort) at ~${gap} ms (measured ${notes[`H.Anvandmall.${gap}.ms`]} ms): Home = mall on screen; old pass with its edit in Mina mallar`, r.home === r.onScreen && !r.storedIsOld && r.mallar.includes('Anvandmall gammal'), JSON.stringify(r))
    if (gap === 0) await shot(p, '08_race_fixed_home')
  }
  // Human pace (> 800 ms between edit and the confirm) for contrast
  const r = await race('Anvandmall', 900, async (g) => {
    await menu(p, 'Använd mall'); await p.waitForTimeout(g)
    await p.locator('.template-card').filter({ hasText: /Kort/ }).first().click()
    await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click()
  })
  check('H-mall-900', 'Same at ≥ 0.9 s: Home shows the mall pass; the edited old pass is in Mina mallar with its edit', r.home === r.onScreen && r.mallar.includes('Anvandmall gammal'), JSON.stringify(r))
  await ctx.close()
})

// ═══ I. Existing main draft, storage full, last station removed (AC13, AC14, AC16) ═══
await section('I', async () => {
  const ctxM = await newCtx(); const pm = await newPage(ctxM, MAIN)
  await fresh(pm); await wizard(pm); await title(pm).fill('Från main'); await pm.getByRole('button', { name: 'Spara utkast' }).click(); await pm.waitForTimeout(300)
  const seed = await pm.evaluate((k) => localStorage.getItem(k), DK); await ctxM.close()
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await p.goto(BR); await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v) }, [DK, seed]); await p.reload(); await p.locator('.home').waitFor()
  const s = JSON.parse(seed)
  const h = await homeText(p)
  const t0 = await now(p); await cont(p); await p.waitForTimeout(1300)
  const untouched = (await writesSince(p, t0)).length === 0 && (await p.evaluate((k) => localStorage.getItem(k), DK)) === seed
  await p.locator('.pass-length').getByRole('button', { name: '120', exact: true }).click(); await p.waitForTimeout(1200)
  const d = await draft(p)
  check('AC13', 'Draft written by main (Spara utkast) → Fortsätt passet · title · min; opening writes nothing (byte-identical); first edit overwrites in place (same id), nothing archived', h.includes(`Från main · ${s.totalMinutes} min`) && untouched && d.id === s.id && d.targetMinutes === 120 && nItems(d) === nItems(s) && (await tmpls(p)).length === 0, `untouched ${untouched}`)
  // AC14: storage full
  await p.evaluate(() => { window.__failDraft = true; window.__toasts = [] })
  await title(p).fill('Fullt 1'); await p.waitForTimeout(1200)
  const st1 = await status(p).innerText(); const toastT = await p.locator('.toast').innerText().catch(() => ''), role = await p.locator('.toast').getAttribute('role').catch(() => null)
  await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, '09_inte_sparat_toast')
  await p.waitForTimeout(3500); await title(p).fill('Fullt 2'); await p.waitForTimeout(1200); await title(p).fill('Fullt 3'); await p.waitForTimeout(1200)
  const toasts = await p.evaluate(() => window.__toasts)
  check('AC14a', '«Inte sparat» + exactly one toast with the exact text (role=status); more failing edits → no second toast', st1 === S.failed && toastT.trim() === S.toast && role === 'status' && toasts.length === 1 && (await status(p).innerText()) === S.failed, `${st1} / toasts ${toasts.length}`)
  // flush paths while failing: Till startsidan must not crash
  await toHome(p); check('AC14b', 'Storage failing: Till startsidan works, no crash, Home shows last stored pass', (await homeText(p)).includes('Från main') && errors.length === 0)
  await cont(p); await p.evaluate(() => { window.__failDraft = false })
  await title(p).fill('Fungerar igen'); await p.waitForTimeout(1200)
  check('AC14c', 'Un-stub → next edit «Sparat», stored', (await status(p).innerText()) === S.saved && (await draft(p)).title === 'Fungerar igen')
  // AC16: remove every station
  while (await p.locator('.item-remove').count()) await p.locator('.item-remove').first().click()
  await p.waitForTimeout(1200); await toHome(p)
  const d16 = await draft(p)
  check('AC16', 'Remove last station of the stored pass → saved; Home shows «… · 0 min»', nItems(d16) === 0 && (await homeText(p)).includes('Fungerar igen · 0 min'), (await homeText(p)).slice(0, 100))
  await shot(p, '10_home_0min')
  await ctx.close()
})

// ═══ J. Re-verify 4b92442: cap / eviction matrix (auto: true flag) ═══
await section('J', async () => {
  const ctx = await newCtx(); const p = await newPage(ctx, BR)
  await fresh(p)
  // One real entry shape from the app (hand-save), used as the template for seeded lists
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 0); await title(p).fill('Bas')
  await menu(p, 'Spara som egen mall'); await p.locator('.modal input').fill('Bas'); await p.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await p.waitForTimeout(300)
  const base = (await tmpls(p))[0]; await toHome(p)
  const mk = (label, auto, i) => ({ ...base, id: `mall-seed-${label}`, title: label, savedAt: new Date(Date.UTC(2026, 9, 1, 0, 8 - i)).toISOString(), ...(auto ? { auto: true } : {}) })
  const seed = async (list) => { await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [TK, list]); await p.reload(); await p.locator('.home, .builder').first().waitFor(); if (await builder(p).count()) await toHome(p) }
  const view = async () => (await tmpls(p)).map((x) => x.title + (x.auto ? '*' : ''))
  // newest first; * = auto
  const mixed = () => ['H1', 'A1', 'H2', 'A2', 'H3', 'A3', 'H4', 'A4'].map((l, i) => mk(l, l.startsWith('A'), i))
  const hands = () => ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'].map((l, i) => mk(l, false, i))
  let n = 1
  async function autoCopy(newTitle) { // stored pass «Gammal k» (unique contents) replaced by a Tomt pass + station
    await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor()
    await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill(newTitle); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
    await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill(newTitle + ' ny'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  }
  async function handSave(name) { await cont(p); await menu(p, 'Spara som egen mall'); await p.locator('.modal input').fill(name); await p.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await p.waitForTimeout(300); await toHome(p) }
  const M = {}
  // J1 auto-copy into a full mixed list (seed after the old pass is stored, so the seed is the list the copy meets)
  await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J1 gammal'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  await seed(mixed())
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J1 ny'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  M.J1 = await view()
  check('J1', 'Auto-copy into full mixed list → oldest auto-copy (A4) out, all H kept, copy on top flagged', M.J1.join() === ['J1 gammal*', 'H1', 'A1*', 'H2', 'A2*', 'H3', 'A3*', 'H4'].join() && (await draft(p)).title === 'J1 ny', M.J1.join(' | '))
  // J2 all 8 hand-saved → auto-copy skipped, new pass still saved
  await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J2 gammal'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  await seed(hands())
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J2 ny'); await addTeknik(p, n++); await p.waitForTimeout(950)
  const st2 = await status(p).innerText(); await toHome(p)
  M.J2 = await view()
  check('J2', '8 hand-saved → auto-copy skipped (list unchanged), new pass saved, «Sparat», Home = new pass', M.J2.join() === hands().map((x) => x.title).join() && (await draft(p)).title === 'J2 ny' && st2 === S.saved && (await homeText(p)).includes('J2 ny ·'), `${M.J2.join(' | ')} / ${st2}`)
  note('J2.lost', 'Consequence: «J2 gammal» is no longer anywhere (slot = J2 ny, not in Mina mallar). Intended by the rule; no message shown')
  await shot(p, '09_j2_all_hand_skipped')
  // J3 hand-save into full mixed list → oldest auto out
  await seed(mixed()); await handSave('J3 hand')
  M.J3 = await view()
  check('J3', 'Hand-save into full mixed list → oldest auto-copy (A4) out', M.J3.join() === ['J3 hand', 'H1', 'A1*', 'H2', 'A2*', 'H3', 'A3*', 'H4'].join(), M.J3.join(' | '))
  // J4 hand-save into 8 hand-saved → oldest hand (H8) out
  await seed(hands()); await handSave('J4 hand')
  M.J4 = await view()
  check('J4', 'Hand-save into 8 hand-saved → oldest hand-saved (H8) out', M.J4.join() === ['J4 hand', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'].join(), M.J4.join(' | '))
  // J5 flag survives reload and later writes
  await seed(mixed()); await p.reload(); await p.locator('.home').waitFor(); await handSave('J5 hand'); await p.reload(); await p.locator('.home').waitFor()
  M.J5 = await view()
  check('J5', 'auto flag survives reload + a later write (A1–A3 still *, new hand entry not *)', M.J5.join() === ['J5 hand', 'H1', 'A1*', 'H2', 'A2*', 'H3', 'A3*', 'H4'].join(), M.J5.join(' | '))
  // J5b auto-copy only ever pushes out the auto-copy flagged entries, also through the UI-made copies
  await fresh(p); n = 0
  for (let k = 0; k < 9; k++) await autoCopy(`U${k}`)
  M.J5b = await view()
  check('J5b', 'UI only: 9+ auto-copies → list of 8 auto (*), newest first, no throw', M.J5b.length === 8 && M.J5b.every((x) => x.endsWith('*')), M.J5b.join(' | '))
  // J6 legacy entries saved by a MAIN build (no flag) = hand-saved
  const ctxM = await newCtx(); const pm = await newPage(ctxM, MAIN); await fresh(pm)
  await pm.getByRole('button', { name: 'Tomt pass' }).click(); await builder(pm).waitFor()
  for (let k = 1; k <= 8; k++) { await addTeknik(pm, k); await menu(pm, 'Spara som egen mall'); await pm.locator('.modal input').fill(`L${k}`); await pm.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await pm.waitForTimeout(250) }
  const legacy = await tmpls(pm); await ctxM.close()
  check('J6a', 'Main build wrote 8 entries with no auto key', legacy.length === 8 && legacy.every((x) => !('auto' in x)), legacy.map((x) => x.title).join(' | '))
  await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J6 gammal'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  await seed(legacy)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('J6 ny'); await addTeknik(p, n++); await p.waitForTimeout(950); await toHome(p)
  M.J6b = await view()
  check('J6b', 'Legacy (main) entries treated as hand-saved: auto-copy skipped, list unchanged, new pass saved', M.J6b.join() === legacy.map((x) => x.title).join() && (await draft(p)).title === 'J6 ny', M.J6b.join(' | '))
  await handSave('J6 hand'); M.J6c = await view()
  check('J6c', 'Hand-save into 8 legacy → oldest legacy (L1) out', M.J6c[0] === 'J6 hand' && !M.J6c.includes('L1') && M.J6c.length === 8, M.J6c.join(' | '))
  // F4 vs flags: replaced pass with the same contents as a HAND-saved entry → no auto-copy (dedupe); hand-save of an auto-copied pass → second entry
  await fresh(p); await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await title(p).fill('Dubbel'); await addTeknik(p, 3); await p.waitForTimeout(950)
  await menu(p, 'Spara som egen mall'); await p.locator('.modal input').fill('Dubbel hand'); await p.locator('.modal').getByRole('button', { name: 'Spara som egen mall' }).click(); await p.waitForTimeout(300); await toHome(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 4); await p.waitForTimeout(950); await toHome(p)
  M.F4a = await view()
  check('F4a', 'Dedupe vs flags: replaced «Dubbel» = same contents as hand-saved «Dubbel hand» → no auto-copy', M.F4a.join() === 'Dubbel hand', M.F4a.join(' | '))
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await addTeknik(p, 5); await p.waitForTimeout(950); await toHome(p)
  await fresh(p).catch(() => {})
  note('J.matrix', M)
  await fromMall(p).catch(() => {})
  await ctx.close()
})

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass} · page errors ${errors.length} · bank requests ${bankLog.length} (live: ${bankLog.filter((x) => x.startsWith('LIVE')).length})`)
if (!ONLY.length) writeFileSync(`${ROOT}/verifier/slice-39-verify-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes, errors }, null, 2))
await browser.close()

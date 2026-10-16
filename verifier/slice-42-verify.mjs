// Slice 42 «rätt tips i rätt läge» — Verifier, PR #46 @ 91c7e19. Headless Chrome 390×844 DPR 2 touch (+320 for layout).
// BR = branch plain, MAIN = 1814e50 plain, ON = branch bank build → MY local stand-in (S32_DIR). Nothing against live.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:57441/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57442/traningsplaneringen/'
const ON = process.env.ON ?? 'http://127.0.0.1:57440/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const S32 = process.env.S32_DIR ?? '/tmp/s42v/sb'
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = '/workspace/screenshots/s42v_'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const TIP = 'Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Varje övning visar varför, hur och vad du ska se upp för.'
const MT = 'Mallen är i Passbyggaren. · Ångra'
const results = [], notes = {}, errors = [], bankLog = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 300) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v).slice(0, 700)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0] + ' @' + (String(e.stack).match(/slice-42-verify.mjs:(\d+)/g) || []).join(',')) } }
const env = () => JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(env().pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME } }).trim()
const seed = (...a) => execFileSync('bun', [`${ROOT}/verifier/slice-42-checks/seed.ts`, ...a.map(String)], { encoding: 'utf8' }).trim()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctxs = []
async function newPage(url, w = 390) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, hasTouch: true }); ctxs.push(ctx)
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request(); const u = new URL(req.url())
    if (u.host !== 'bank-mock.supabase.co') { bankLog.push('LIVE?' + u.host); return route.abort('failed') }
    bankLog.push(u.pathname); const headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${env().gatewayPort}` + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${url}: ${e.message}`)); p.base = url
  return p
}
const close = async (p) => p.context().close()
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const mallar = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const builder = (p) => p.locator('.builder')
const tipLoc = (p) => p.locator('.builder-coach-tip')
const tipShown = async (p) => (await tipLoc(p).count()) > 0 && (await tipLoc(p).first().innerText()).includes('Tomt pass?')
const confirmDlg = (p) => p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Ersätta det här passet?' })
const confirmShown = async (p) => (await confirmDlg(p).count()) > 0
const toastText = async (p) => ((await p.locator('.toast').count()) ? (await p.locator('.toast').innerText()).replace(/\s+/g, ' ').trim() : '')
const card = (p, h) => p.locator('.block-card').filter({ has: p.locator('h3', { hasText: new RegExp(`^${h}$`) }) }).first()
const title = (p) => p.getByRole('textbox', { name: 'Passets titel' })
const shot = (p, n) => p.screenshot({ path: `${SS}${n}.png` })
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function clean(p) { await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function load(p, json, tmpl, keepTips = false) { await p.goto(p.base); await p.evaluate(([k, v, t, tv, keep]) => { if (!keep) localStorage.clear(); if (v) localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null, keepTips]); await p.reload(); await p.locator('.home').waitFor(); if (json) { await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300) } }
async function tomt(p) { await p.getByRole('button', { name: 'Tomt pass', exact: true }).click(); await builder(p).waitFor(); await p.waitForTimeout(300) }
async function home(p) { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor() }
async function reloadCont(p) { await p.waitForTimeout(1000); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300) }
// pick a mall; returns whether the confirm showed (and leaves it open)
async function pick(p, kind = 'builtin', name = /Nybörjare/) {
  if (!(await p.locator('.template-card:visible').count())) await menu(p, 'Använd mall'); await p.waitForTimeout(kind === 'club' ? 1200 : 250)
  const loc = kind === 'saved' ? p.locator('.template-saved .template-card') : kind === 'club' ? p.locator('section.club-templates .template-card') : p.locator('.template-card')
  await loc.filter({ hasText: name }).first().click(); await p.waitForTimeout(500)
  return confirmShown(p)
}
const confirmUse = async (p) => { await confirmDlg(p).getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(500) }
const confirmKeep = async (p) => { await confirmDlg(p).getByRole('button', { name: 'Fortsätt redigera', exact: true }).click(); await p.waitForTimeout(300) }
async function addTeknik(p) {
  const c = card(p, 'Teknik'); const inline = c.locator('.btn-add-inline')
  if (await inline.count()) await inline.click(); else await c.getByRole('button', { name: 'Lägg till övning' }).click()
  await p.locator('.filter-row select').first().selectOption('techniques').catch(() => {})
  await p.locator('.library-entry .activity-card').first().click()
  await p.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(300)
}
async function setMinutes(p, h, v) {
  await card(p, h).getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(200)
  const inp = p.locator('.item-duration input:visible').first(); const old = await inp.inputValue()
  await inp.fill(String(v(Number(old)))); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(150)
  if (await p.locator('.sheet-close:visible').count()) await p.locator('.sheet-close:visible').first().click().catch(() => {})
  await p.waitForTimeout(200); return Number(old)
}
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
async function backFromHall(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await builder(p).waitFor(); await p.waitForTimeout(300) }
async function dragChip(p, fx, fy) {
  const chip = p.locator('.hall-canvas .hall-chip--canvas').first(), canvas = p.locator('.hall-canvas').first()
  await canvas.evaluate((e) => e.scrollIntoView({ block: 'center' })); const cb = await canvas.boundingBox(); const X = cb.x + cb.width * fx, Y = cb.y + cb.height * fy
  const dt = await p.evaluateHandle(() => new DataTransfer())
  await chip.dispatchEvent('dragstart', { dataTransfer: dt }); await canvas.dispatchEvent('dragover', { dataTransfer: dt, clientX: X, clientY: Y }); await canvas.dispatchEvent('drop', { dataTransfer: dt, clientX: X, clientY: Y }); await chip.dispatchEvent('dragend', { dataTransfer: dt }); await p.waitForTimeout(600)
}
const storeEmpty = async (p) => { await addTeknik(p); await p.waitForTimeout(1200); await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(5600) } // Tomt pass is only stored once it grows (Slice 39 E1)
const removeSoft = async (p) => { const s = card(p, 'Samling'); while (await s.locator('.item-remove').count()) { await s.locator('.item-remove').first().click(); await p.waitForTimeout(150) } }
const mallPass = async (p) => { await clean(p); await tomt(p); const c = await pick(p); if (c) await confirmUse(p); await p.waitForTimeout(5600); return c }   // untouched built-in mall pass, toast gone
const layout = (p) => p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.height)] }; return { vw: innerWidth, sw: document.documentElement.scrollWidth, tip: r('.builder-coach-tip'), dlg: r('.modal-backdrop[role=dialog] .modal, .modal-backdrop[role=dialog] > *') } })

// ═══ T. Tip (AC1–AC6), text, a11y, spam, 320 ═══
await section('T', async () => {
  let p = await newPage(BR); await clean(p); await tomt(p)
  const d0 = await draft(p)
  const tipTxt = (await tipLoc(p).locator('.coach-tip-strip-body').innerText()).trim()
  check('AC1', 'Hem → Tomt pass (Närvaro + Dagens pass) → tip shows', (await tipShown(p)) && (await card(p, 'Samling').locator('.item-remove').count()) === 2, `soft items ${await card(p, 'Samling').locator('.item-remove').count()}`)
  await shot(p, '01_tomt_tip_390')
  const a11y = await tipLoc(p).evaluate((e) => ({ role: e.getAttribute('role'), live: e.getAttribute('aria-live'), liveAnc: !!e.closest('[aria-live],[role=status],[role=alert]'), dismiss: e.querySelector('button')?.getAttribute('aria-label'), n: document.querySelectorAll('.builder-coach-tip').length }))
  check('TIP-text', 'Tip text verbatim (microcopy), no «!»', tipTxt === TIP && !tipTxt.includes('!'), tipTxt)
  note('TIP-a11y', a11y)
  check('TIP-a11y', 'Tip is role=note, not inside a live region (no announce), dismiss has aria-label, one strip only', a11y.role === 'note' && !a11y.liveAnc && !!a11y.dismiss && a11y.n === 1, JSON.stringify(a11y))
  await addTeknik(p)
  check('AC2-hide', 'Add one bank station → tip hides at once', !(await tipShown(p)) && (await card(p, 'Teknik').locator('.item-remove').count()) === 1)
  await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(250)
  check('AC2-back', '× it → tip shows again', await tipShown(p))
  await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(300)
  check('AC2-undo', '× → Ångra brings the station back → tip hides again', !(await tipShown(p)) && (await card(p, 'Teknik').locator('.item-remove').count()) === 1)
  // AC5
  await clean(p); await tomt(p); await removeSoft(p)
  check('AC5-soft', 'Närvaro and Dagens pass removed → tip still shows', await tipShown(p))
  await title(p).fill('Bara titel'); await p.waitForTimeout(300)
  check('AC5-title', 'Title only → tip still shows', await tipShown(p))
  note('AC5-stored-after-soft-removed', { stored: !!(await draft(p)) && (await draft(p)).title })
  await clean(p); await tomt(p); await storeEmpty(p); await title(p).fill('Bara titel'); await reloadCont(p)
  check('AC5-reload', 'Titled Tomt pass (soft pair kept) after reload → tip still shows', await tipShown(p), await title(p).inputValue())
  await close(p)
  // AC3: first visit via Från mall; also first visit via Fortsätt passet on a pass with content (the bug) — branch vs main
  for (const [u, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    p = await newPage(u); await clean(p)
    await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(400)
    await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(500)
    const c = await confirmShown(p); if (c) await confirmUse(p); await p.waitForTimeout(300)
    const t = await tipShown(p), n = await p.locator('.item-remove').count()
    if (tag === 'br') { check('AC3', 'First visit (clean) via Från mall → mall pass with stations, no tip', !t && n > 2, `tip=${t} items=${n} confirm=${c}`); await shot(p, '02_firstvisit_mall_no_tip') } else note('AC3-main', { tip: t, items: n, confirm: c })
    await load(p, seed('pass', 'S42V innehåll', 3))
    const t2 = await tipShown(p)
    if (tag === 'br') check('AC3-cont', 'First visit (clean tips) via Fortsätt passet on a 3-station pass → no tip', !t2, `tip=${t2}`); else note('AC3-cont-main', { tip: t2 })
    await close(p)
  }
  // AC4 wizard
  p = await newPage(BR); await clean(p); await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option').first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click(); await builder(p).waitFor(); await p.waitForTimeout(400)
  check('AC4', 'Wizard pass → no tip', !(await tipShown(p)), `items ${await p.locator('.item-remove').count()}`)
  await shot(p, '03_wizard_no_tip')
  // AC6 dismiss kept (also over reload)
  await clean(p); await tomt(p); await tipLoc(p).locator('.coach-tip-strip-dismiss').click(); await p.waitForTimeout(200)
  const gone = !(await tipShown(p))
  await home(p); await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor(); await tomt(p)
  const later = !(await tipShown(p)); await removeSoft(p); await addTeknik(p); await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(300)
  check('AC6', 'Dismiss → hidden at once, stays hidden on a later empty pass after reload and after 0→1→0 stations', gone && later && !(await tipShown(p)))
  await close(p)
  // tip spam: sample tip presence every 20 ms while loading a pass with content, and over add/remove cycles
  p = await newPage(BR); await p.goto(BR); await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v) }, [DK, seed('pass', 'S42V spam', 2)])
  await p.addInitScript(() => { window.__tip = []; const t0 = performance.now(); const iv = setInterval(() => { const on = !!document.querySelector('.builder-coach-tip'); const l = window.__tip; if (!l.length || l.at(-1)[1] !== on) l.push([Math.round(performance.now() - t0), on]) }, 20); window.__stopTip = () => clearInterval(iv) })
  await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(800)
  const flashLoad = await p.evaluate(() => window.__tip.filter((x) => x[1]).length)
  for (let i = 0; i < 2; i++) await card(p, 'Teknik').locator('.item-remove').first().click().then(() => p.waitForTimeout(200))
  const atZero = await tipShown(p)
  await setMinutes(p, 'Samling', (v) => v + 1); await title(p).fill('Spam titel'); await p.waitForTimeout(300)
  const tl = await p.evaluate(() => window.__tip)
  const strips = await p.locator('.coach-tip-strip').count()
  check('TIP-spam', 'No tip flash while a pass with stations loads; tip appears once at 0 stations and stays put over minute/title edits; one tip strip on screen', flashLoad === 0 && atZero && tl.filter((x) => x[1]).length === 1 && strips <= 1, JSON.stringify(tl))
  await close(p)
  // 320 + 390 layout of the tip and the confirm
  for (const w of [320, 390]) {
    p = await newPage(BR, w); await clean(p); await tomt(p)
    const lt = await layout(p); await shot(p, `04_tip_${w}`)
    await title(p).fill('Tisdag'); await p.waitForTimeout(200); const c = await pick(p); const lc = await layout(p); await shot(p, `05_confirm_${w}`)
    const dlgBox = await confirmDlg(p).locator('button').last().boundingBox()
    check(`L-${w}`, `${w} px: tip inside the viewport, no horizontal scroll; confirm (title only) inside viewport, buttons reachable`, lt.tip && lt.tip[0] >= 0 && lt.tip[1] <= w && lt.sw <= w && c && lc.sw <= w && dlgBox && dlgBox.x >= 0 && dlgBox.x + dlgBox.width <= w, JSON.stringify({ lt, lc, dlgBox }))
    await close(p)
  }
})

// ═══ C. Confirm skip (AC7–AC17) ═══
await section('C', async () => {
  let p = await newPage(BR); await clean(p); await tomt(p)
  const blankId = (await draft(p))?.id, blankTitle = await title(p).inputValue()
  const c7 = await pick(p); const t7 = await toastText(p); const f7 = await p.evaluate(() => document.activeElement?.textContent?.trim())
  check('AC7', 'Untouched Tomt pass → built-in mall applied at once, no confirm; toast «Mallen är i Passbyggaren. · Ångra», focus on Ångra', !c7 && t7 === MT && (await title(p).inputValue()).includes('Nybörjare') && f7 === 'Ångra', `confirm=${c7} toast=${t7} focus=${f7}`)
  await shot(p, '06_no_confirm_toast')
  await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(400)
  check('AC14', 'AC7 → Ångra → the Tomt pass is back (tip, 2 soft items, same default title; stored = blank pass)', (await tipShown(p)) && (await p.locator('.item-remove').count()) === 2 && (await title(p).inputValue()) === blankTitle && (await draft(p))?.blocks.every((b) => b.items.every((i) => /gather-(narvaro|dagens-teknik)/.test(i.activityId))), `tip=${await tipShown(p)} items=${await p.locator('.item-remove').count()} title=«${await title(p).inputValue()}» stored=${(await draft(p))?.id === blankId ? 'blank id' : JSON.stringify((await draft(p))?.title)}`)
  const c14 = await pick(p)
  check('ANG-1', 'Restored Tomt pass (empty) → pick a mall → still no confirm (empty is fresh by definition)', !c14)
  await p.waitForTimeout(5600)
  const c9 = await pick(p, 'builtin', /Kort pass/)
  check('AC9', 'Untouched mall pass → pick another mall → no confirm', !c9 && (await title(p).inputValue()).includes('Kort pass'))
  check('AC15', 'Mina mallar after AC7 + AC9: no auto-copy of the blank or untouched pass (0)', (await mallar(p)).length === 0, (await mallar(p)).map((m) => m.title).join('|'))
  // Ångra after mall over mall pass → previous mall pass is back but not fresh
  await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(400)
  const backT = await title(p).inputValue(); const cA = await pick(p, 'builtin', /Kort pass/)
  check('ANG-2', 'Mall A → mall B (no confirm) → Ångra → A back → pick a mall → confirm shows (Ångra does not re-mark fresh)', backT.includes('Nybörjare') && cA, `back=${backT} confirm=${cA}`)
  if (cA) await confirmKeep(p)
  await close(p)
  // × → Ångra on a mall pass → not fresh
  p = await newPage(BR); await mallPass(p)
  await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(200); await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(400)
  const cX = await pick(p, 'builtin', /Kort pass/)
  check('ANG-3', 'Untouched mall pass → × → Ångra (pass identical again) → pick a mall → confirm shows', cX)
  if (cX) await confirmKeep(p)
  await reloadCont(p); const cXr = await pick(p, 'builtin', /Kort pass/)
  check('ANG-3-reload', '… and after reload → confirm shows', cXr); if (cXr) await confirmKeep(p)
  await close(p)
  // wizard → mall
  p = await newPage(BR); await clean(p); await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option').first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click(); await builder(p).waitFor(); await p.waitForTimeout(1000)
  const cW = await pick(p)
  check('AC9-wizard', 'Untouched wizard pass → pick a mall → no confirm; toast with Ångra; no auto-copy', !cW && (await toastText(p)) === MT && (await mallar(p)).length === 0, `${await toastText(p)} mallar ${(await mallar(p)).length}`)
  await close(p)
  // AC8 Mina mallar
  p = await newPage(BR); await clean(p); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [TK, seed('mallar', 2)]); await p.reload(); await p.locator('.home').waitFor(); await tomt(p)
  const c8 = await pick(p, 'saved', 'Hand 2')
  check('AC8-mina', 'Untouched Tomt pass → Mina mallar → no confirm, toast «Mallen är i Passbyggaren. · Ångra», Mina mallar still 2', !c8 && (await toastText(p)) === MT && (await title(p).inputValue()) === 'Hand 2' && (await mallar(p)).length === 2, `${await toastText(p)} ${(await mallar(p)).length}`)
  await p.waitForTimeout(5600); const c8b = await pick(p, 'saved', 'Hand 1')
  check('AC9-mina', 'Untouched Mina mallar pass → another Mina mallar → no confirm, no auto-copy', !c8b && (await mallar(p)).length === 2)
  await close(p)
  // AC8 föreningsmall (stand-in, bank build)
  const vs = JSON.parse(seed('pass', 'V42 klubb src', 3))
  const blocks = vs.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) }))
  sql(`delete from public.club_templates where title like 'V42 klubbmall%'`)
  for (const t of ['V42 klubbmall A', 'V42 klubbmall B']) sql(`insert into public.club_templates (title, total_minutes, payload) values ('${t}', ${Math.max(1, vs.totalMinutes)}, '${JSON.stringify({ v: 1, title: t, notes: '', blocks, hallTemplateId: 'forening-vit' }).replace(/'/g, "''")}'::jsonb)`)
  p = await newPage(ON); await clean(p); await tomt(p)
  const cC = await pick(p, 'club', 'V42 klubbmall A'); const tC = await toastText(p); await shot(p, '07_club_no_confirm')
  check('AC8-club', 'Untouched Tomt pass → Föreningsmall (stand-in) → no confirm, same toast, mall applied (Vit, 3 Teknik)', !cC && tC === MT && (await title(p).inputValue()) === 'V42 klubbmall A' && (await card(p, 'Teknik').locator('.item-remove').count()) === 3, `confirm=${cC} toast=${tC}`)
  await p.waitForTimeout(5600); const cC2 = await pick(p, 'club', 'V42 klubbmall B')
  check('AC9-club', 'Untouched föreningsmall pass → another föreningsmall → no confirm; Mina mallar 0', !cC2 && (await mallar(p)).length === 0)
  await p.waitForTimeout(5600); await setMinutes(p, 'Teknik', (v) => v + 1); const cC3 = await pick(p, 'club', 'V42 klubbmall A')
  check('AC11-club', 'Edited föreningsmall pass → föreningsmall → confirm shows', cC3); if (cC3) await confirmKeep(p)
  await close(p); sql(`delete from public.club_templates where title like 'V42 klubbmall%'`)
  // AC10: title (UI), pass note / block note (no editor in UI → stored state), control
  p = await newPage(BR); await clean(p); await tomt(p); await title(p).fill('Bara titel'); await p.waitForTimeout(300)
  const c10t = await pick(p); await shot(p, '08_title_confirm')
  const body = c10t ? (await confirmDlg(p).innerText()).replace(/\s+/g, ' ') : ''
  check('AC10-title', 'Tomt pass with a typed title → pick a mall → confirm shows', c10t, body)
  if (c10t) await confirmKeep(p)
  check('AC10-keep', 'Fortsätt redigera keeps the titled pass', (await title(p).inputValue()) === 'Bara titel')
  for (const [m, id] of [['notes', 'AC10-passnote'], ['blocknote', 'AC10-blocknote']]) {
    await load(p, seed(m)); const c = await pick(p)
    check(id, `0-station pass with ${m === 'notes' ? 'pass note' : 'block coachNote'} only (stored state; no editor for it in the UI) → pick a mall → confirm shows; tip still shows`, c && (await tipShown(p).catch(() => false) || true), `confirm=${c}`)
    if (c) await confirmKeep(p); check(id + '-tip', `${m}: tip shows (0 coach stations)`, await tipShown(p))
  }
  await load(p, seed('blank', '')); const cb = await pick(p)
  check('AC10-control', 'Control: stored untitled blank pass (after reload) → no confirm (empty counts over reload)', !cb)
  await close(p)
  // AC11 variants on an untouched mall pass + Fortsätt redigera keeps
  for (const v of ['minutes', 'add', 'remove', 'hall', 'title']) {
    p = await newPage(BR); await mallPass(p); const before = await draft(p)
    if (v === 'minutes') await setMinutes(p, 'Teknik', (x) => x + 1)
    if (v === 'add') await addTeknik(p)
    if (v === 'remove') { await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(5600) }
    if (v === 'hall') { await openHall(p); await dragChip(p, 0.61, 0.77); await backFromHall(p) }
    if (v === 'title') { await title(p).fill('Ändrad titel'); await p.waitForTimeout(300) }
    await p.waitForTimeout(1000); const mid = await draft(p)
    const c = await pick(p, 'builtin', /Kort pass/); if (v === 'minutes') await shot(p, '09_edited_confirm')
    const n0 = (await mallar(p)).length
    if (c) await confirmKeep(p)
    const kept = (await title(p).inputValue()).includes(v === 'title' ? 'Ändrad' : 'Nybörjare')
    check(`AC11-${v}`, `Mall pass, ${v} edit → pick a mall → confirm shows; Fortsätt redigera keeps the pass`, c && kept && JSON.stringify(mid) !== JSON.stringify(before), `confirm=${c} kept=${kept}`)
    if (v === 'minutes') {
      const c2 = await pick(p, 'builtin', /Kort pass/); const bodyTxt = (await confirmDlg(p).innerText()).replace(/\s+/g, ' ')
      await confirmUse(p); const m = await mallar(p)
      check('AC16', 'Edited pass → confirm → Använd mall → Mina mallar +1 auto-copy of the edited pass; body text true', c2 && m.length === n0 + 1 && m[0].auto === true && m[0].title.includes('Nybörjare') && bodyTxt.includes('Passet du hade finns kvar under Mina mallar.'), `${n0}→${m.length} ${m[0]?.title}`)
      note('confirm-body', bodyTxt)
    }
    await close(p)
  }
  // AC12 noteChange: edit then put back by hand → still not fresh (also after reload)
  for (const v of ['minutes', 'add-remove', 'title', 'hall']) {
    p = await newPage(BR); await mallPass(p); const before = await draft(p)
    if (v === 'minutes') { const o = await setMinutes(p, 'Teknik', (x) => x + 1); await setMinutes(p, 'Teknik', () => o) }
    if (v === 'add-remove') { await addTeknik(p); const c = card(p, 'Teknik'); await c.locator('.item-remove').last().click(); await p.waitForTimeout(5600) }
    if (v === 'title') { const o = await title(p).inputValue(); await title(p).fill(o + ' x'); await p.waitForTimeout(300); await title(p).fill(o); await p.waitForTimeout(300) }
    if (v === 'hall') { await openHall(p); const pl0 = (await draft(p)).hallPlacements; await dragChip(p, 0.61, 0.77); await backFromHall(p); await p.waitForTimeout(1000); await p.evaluate(([k, pl]) => 0, [DK, pl0]); }
    await p.waitForTimeout(1200); const after = await draft(p)
    const same = JSON.stringify(after.blocks) === JSON.stringify(before.blocks) && after.title === before.title
    const c = await pick(p, 'builtin', /Kort pass/); if (v === 'minutes') await shot(p, '10_putback_confirm')
    if (c) await confirmKeep(p)
    await reloadCont(p); const cr = await pick(p, 'builtin', /Kort pass/); if (cr) await confirmKeep(p)
    check(`AC12-${v}`, `Mall pass, ${v} then put back by hand${v === 'hall' ? ' (drag only; exact put-back not possible by drag)' : ''} → confirm still shows; and after reload`, c && cr && (v === 'hall' || same), `confirm=${c} reload=${cr} identical=${same}`)
    await close(p)
  }
  // AC13
  p = await newPage(BR); await clean(p); await tomt(p); await pick(p); await reloadCont(p)
  const c13 = await pick(p, 'builtin', /Kort pass/)
  check('AC13', 'Untouched mall pass → reload → pick a mall → confirm shows', c13)
  if (c13) await confirmUse(p)
  check('AC13-copy', '… Använd mall → the untouched-but-reloaded mall pass is auto-copied (+1, conservative)', (await mallar(p)).length === 1, (await mallar(p)).map((m) => m.title).join('|'))
  // Tomt pass edit-then-back: add + remove station → empty again → fresh again (by definition)
  await clean(p); await tomt(p); await addTeknik(p); await card(p, 'Teknik').locator('.item-remove').first().click(); await p.waitForTimeout(5600)
  const cE = await pick(p)
  check('AC12-tomt', 'Tomt pass add + remove a station (empty again) → no confirm (empty is fresh by definition, not a noteChange case); tip was back', !cE)
  await close(p)
})

// ═══ S. Slice 39 change: titled empty pass is coach work → auto-copy on replace; untitled empty is not; cap + spare ═══
await section('S', async () => {
  let p = await newPage(BR)
  for (const [u, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    p.base = u; await clean(p); await tomt(p); await storeEmpty(p); await title(p).fill('Tomt med titel'); await p.waitForTimeout(1200)
    const st = await draft(p); const c = await pick(p); if (c) await confirmUse(p); await p.waitForTimeout(400)
    const m = await mallar(p)
    if (tag === 'br') check('S39-titled', 'Titled empty Tomt pass (stored) → mall → confirm → Använd mall → Mina mallar +1 auto-copy «Tomt med titel»', st?.title === 'Tomt med titel' && c && m.length === 1 && m[0].title === 'Tomt med titel' && m[0].auto === true, `confirm=${c} ${m.map((x) => x.title + (x.auto ? '*' : ''))}`)
    else note('S39-titled-main', { confirm: c, mallar: m.map((x) => x.title) })
    // untitled empty, stored (soft minutes edited so it is written)
    await clean(p); await tomt(p); await storeEmpty(p); await p.waitForTimeout(1200)
    const st2 = await draft(p); const c2 = await pick(p); if (c2) await confirmUse(p); await p.waitForTimeout(400)
    const m2 = await mallar(p)
    if (tag === 'br') check('S39-untitled', 'Untitled empty pass (station added + removed, stored) → mall → no confirm, Mina mallar 0', !!st2 && !c2 && m2.length === 0, `stored=${!!st2} confirm=${c2} ${m2.length}`)
    else note('S39-untitled-main', { stored: !!st2, confirm: c2, mallar: m2.length })
  }
  p.base = BR
  // cap: 8 hand-saved → titled empty replaced → spare slot (9); then again → newer auto replaces the spare (9)
  await load(p, seed('blank', 'Tom A'), seed('mallar', 8)); await title(p).fill('Tom A'); await p.waitForTimeout(1200)
  let c = await pick(p); if (c) await confirmUse(p); let m = await mallar(p)
  check('S39-cap-spare', '8 hand-saved + titled empty pass replaced → copy takes the spare slot (9), no hand-saved lost', c && m.length === 9 && m.filter((x) => !x.auto).length === 8 && m[0].title === 'Tom A', m.map((x) => x.title + (x.auto ? '*' : '')).join('|'))
  await home(p); await p.waitForTimeout(300); await tomt(p); await storeEmpty(p); await title(p).fill('Tom B'); await p.waitForTimeout(1200)
  c = await pick(p); if (c) await confirmUse(p); m = await mallar(p)
  check('S39-cap-replace', 'Again with «Tom B» → newer auto-copy replaces the spare (still 9, 8 hand + Tom B)', c && m.length === 9 && m.filter((x) => !x.auto).length === 8 && m[0].title === 'Tom B' && !m.some((x) => x.title === 'Tom A'), m.map((x) => x.title + (x.auto ? '*' : '')).join('|'))
  // 7 hand + 1 old auto → titled empty → old auto goes, total 8
  await load(p, seed('blank', 'Tom C'), seed('mallar', 7, 'auto')); await title(p).fill('Tom C'); await p.waitForTimeout(1200)
  c = await pick(p); if (c) await confirmUse(p); m = await mallar(p)
  check('S39-cap-auto', '7 hand + 1 old auto + titled empty replaced → oldest auto goes, 8 total, 7 hand kept', c && m.length === 8 && m.filter((x) => !x.auto).length === 7 && m[0].title === 'Tom C' && !m.some((x) => x.title === 'Gammal auto'), m.map((x) => x.title + (x.auto ? '*' : '')).join('|'))
  // titled Tomt pass that was never stored, with an older stored pass X: what does Mina mallar get?
  for (const [u, tag] of [[BR, 'br'], [MAIN, 'main']]) {
    p.base = u; await load(p, seed('pass', 'Gammalt pass X', 2)); await home(p); await tomt(p); await title(p).fill('Osparad titel'); await p.waitForTimeout(1200)
    const st = (await draft(p))?.title; c = await pick(p); const bodyT = c ? (await confirmDlg(p).innerText()).replace(/\s+/g, ' ') : ''; if (c) await confirmUse(p); m = await mallar(p)
    note(`S39-unsaved-${tag}`, { stored: st, confirm: c, mallar: m.map((x) => x.title + (x.auto ? '*' : '')) })
    if (tag === 'br') check('S39-unsaved', 'Titled Tomt pass never stored (older pass X stored) → confirm promises «Passet du hade finns kvar under Mina mallar» → is «Osparad titel» in Mina mallar?', c && m.some((x) => x.title === 'Osparad titel'), JSON.stringify({ stored: st, mallar: m.map((x) => x.title) }))
  }
  p.base = BR
  // Hem → Tomt pass over a stored untouched mall pass: observe whether the mall pass is copied (D1 edge, out of scope «Nytt pass från Hem»)
  await clean(p); await tomt(p); await pick(p); await p.waitForTimeout(1200); await home(p); await tomt(p); await addTeknik(p); await p.waitForTimeout(1500)
  note('D1-hem-edge', { mallar: (await mallar(p)).map((x) => x.title + (x.auto ? '*' : '')) })
  await close(p)
})

// ═══ X. AC17 (no new buttons / text vs main), AC18 footer ═══
await section('X', async () => {
  const grab = async (u) => {
    const p = await newPage(u); await clean(p); const homeBtns = await p.locator('.home button').allInnerTexts(); await tomt(p)
    const btns = (await p.locator('.builder button:visible').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim())
    const tip = (await tipLoc(p).innerText()).replace(/\s+/g, ' ')
    await title(p).fill('X'); await p.waitForTimeout(200); await pick(p); const dlg = (await confirmDlg(p).innerText()).replace(/\s+/g, ' ')
    const dlgBtns = await confirmDlg(p).locator('button').allInnerTexts(); await confirmUse(p); const t = await toastText(p)
    const foot = (await p.locator('footer').last().innerText()).replace(/\s+/g, ' ')
    await close(p); return { homeBtns, btns, tip, dlg, dlgBtns, t, foot }
  }
  const b = await grab(BR), m = await grab(MAIN)
  note('X-br', b); note('X-main', m)
  check('AC17-buttons', 'Same buttons as main (Hem, Passbyggaren on a Tomt pass, confirm)', JSON.stringify(b.homeBtns) === JSON.stringify(m.homeBtns) && JSON.stringify(b.btns) === JSON.stringify(m.btns) && JSON.stringify(b.dlgBtns) === JSON.stringify(m.dlgBtns))
  check('AC17-text', 'Tip, confirm and mall toast text identical to main', b.tip === m.tip && b.dlg === m.dlg && b.t === m.t && b.t === MT, b.dlg)
  check('AC18-footer', 'Footer «Träningsplaneraren · Slice 42» (main: Slice 41)', b.foot.includes('Träningsplaneraren · Slice 42') && m.foot.includes('Slice 41'), b.foot)
})

check('no-errors', 'No page errors', errors.length === 0, errors.join(' | '))
check('no-live', 'No request to any host but the bank-mock (→ local stand-in)', !bankLog.some((x) => x.startsWith('LIVE')), `${bankLog.length} bank requests`)
writeFileSync(`${ROOT}/verifier/slice-42-verify-results.json`, JSON.stringify({ when: new Date().toISOString(), commit: '91c7e19', results, notes }, null, 2))
console.log(`PASS ${results.filter((r) => r.ok).length} / FAIL ${results.filter((r) => !r.ok).length} · page errors ${errors.length} · bank requests ${bankLog.length} (live: ${bankLog.filter((x) => x.startsWith('LIVE')).length})`)
await browser.close()

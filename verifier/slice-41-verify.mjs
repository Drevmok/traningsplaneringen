// Slice 41 — Verifier formal drive (12fb874): «Ångra» after × and Använd mall. 390×844 headless Chrome (+1280×800 for AC18 desktop).
// Local only: BR = branch plain build (:4173), MAIN = ce799ca plain build, ON = branch bank build → MY local stand-in (S32_DIR).
// Independent of verifier/slice-41-builder-smoke.mjs; reuses only verifier/slice-41-seed.ts for deterministic passes.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:4173/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57241/traningsplaneringen/'
const ON = process.env.ON ?? 'http://127.0.0.1:57240/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const S32 = process.env.S32_DIR ?? '/tmp/s41x/sb'
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = `${ROOT}/verifier/slice-41-screenshots/v41_`
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const results = [], notes = {}, errors = [], bankLog = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 400) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0]) } }
const env = () => JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(env().pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME } }).trim()
const seed = (t, n) => execFileSync('bun', [`${ROOT}/verifier/slice-41-seed.ts`, t, String(n)], { encoding: 'utf8' }).trim()
const seedMall = (t, n) => execFileSync('bash', ['-c', `bun ${ROOT}/verifier/slice-41-seed.ts '${t}' ${n} mall 2>&1 >/dev/null`], { encoding: 'utf8' }).trim().replaceAll('S41 egen mall', t)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function newPage(url, vp = { width: 390, height: 844 }, touch = true) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch })
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin })
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request(); const u = new URL(req.url())
    if (u.host !== 'bank-mock.supabase.co') { bankLog.push('LIVE?' + u.host); return route.abort('failed') }
    bankLog.push(u.pathname); const headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${env().gatewayPort}` + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  // toast log: every DOM change records whether .toast is present and its text (for lifetimes and "announced once")
  await ctx.addInitScript(() => {
    window.__tl = []
    const rec = () => { const t = document.querySelector('.toast'); const last = window.__tl[window.__tl.length - 1]; const s = t ? t.textContent : null; if (!last || last.s !== s) window.__tl.push({ t: performance.now(), s }) }
    new MutationObserver(rec).observe(document, { subtree: true, childList: true, characterData: true })
  })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(`${url}: ${e.message}`)); p.base = url; p.ctx = ctx
  return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const mallar = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const builder = (p) => p.locator('.builder')
const toast = (p) => p.locator('.toast')
const toastText = async (p) => (await toast(p).count()) ? (await toast(p).innerText()).replace(/\s+/g, ' ').trim() : null
const undo = (p) => toast(p).getByRole('button', { name: 'Ångra' })
const tek = (d) => d.blocks.find((b) => b.type === 'techniques')
const tekCard = (p) => p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
const removeBtn = (p, i) => tekCard(p).locator('.item-remove').nth(i)
const titles = (p) => tekCard(p).locator('.item-title').allInnerTexts()
const shot = (p, n) => p.screenshot({ path: `${SS}${n}.png` })
const tlMark = (p) => p.evaluate(() => { window.__tl = [{ t: performance.now(), s: document.querySelector('.toast')?.textContent ?? null }]; return performance.now() })
const tl = (p) => p.evaluate(() => window.__tl)
// lifetime (ms) of the first toast whose text matches re, from the log
async function lifetime(p, re) { const l = await tl(p); const i = l.findIndex((e) => e.s && re.test(e.s)); if (i < 0) return null; const j = l.findIndex((e, k) => k > i && e.s === null); return j < 0 ? null : Math.round(l[j].t - l[i].t) }
async function menu(p, name) { const m = p.getByRole('button', { name: 'Fler saker med passet' }); if (await m.isVisible()) { await m.click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() } else await p.locator('.builder').getByRole('button', { name, exact: true }).first().click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
async function back(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await builder(p).waitFor() }
async function fresh(p) { await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function load(p, json, tmpl) { await p.goto(p.base); await p.evaluate(([k, v, t, tv]) => { localStorage.clear(); localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null]); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300) }
async function pickBuiltin(p) { await menu(p, 'Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click() }
const confirmBtn = (p) => p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true })
async function markers(p) { return p.evaluate(() => { const cv = document.querySelector('.hall-canvas').getBoundingClientRect(); return [...document.querySelectorAll('.hall-canvas .hall-chip--canvas')].map((c) => { const r = c.getBoundingClientRect(); return { rank: c.querySelector('.hall-chip-rank')?.textContent.trim(), cx: +((r.left + r.width / 2 - cv.left) / cv.width).toFixed(3), cy: +((r.top + r.height / 2 - cv.top) / cv.height).toFixed(3) } }) }) }
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ═══ Doctor ═══
await section('D', async () => {
  const p = await newPage(BR); await load(p, seed('V41 doc', 1))
  const f = await p.locator('footer').innerText().catch(() => '')
  check('Doctor', `base ${BR} loads; footer (Passbyggaren) «Träningsplaneraren · Slice 41»`, f.includes('Träningsplaneraren · Slice 41'), f.replace(/\s+/g, ' ').slice(0, 120))
  await p.ctx.close()
})

// ═══ AC1 / AC2 / AC20 tap target ═══
await section('A12', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  const t0 = await titles(p); const midId = tek(orig).items[1].id
  await tlMark(p); await removeBtn(p, 1).tap(); await p.waitForTimeout(120)
  const t1 = await titles(p), dialogs = await p.locator('[role=dialog], [role=alertdialog]').count(), tt = await toastText(p)
  await shot(p, '01_ac1_removed_toast')
  const tb = await toast(p).boundingBox(), ub = await undo(p).boundingBox()
  check('AC1', 'tap × on middle → gone at once, no dialog, toast «Borttagen · Ångra» at bottom', t1.length === 2 && eq(t1, [t0[0], t0[2]]) && dialogs === 0 && tt === 'Borttagen · Ångra' && tb.y + tb.height > 844 - 80, `titles ${JSON.stringify(t1)} dialogs=${dialogs} toast="${tt}" toastBox y=${Math.round(tb.y)} h=${Math.round(tb.height)}`)
  check('AC20-tap', 'Ångra tap target ≥ 44 px tall', ub.height >= 44, `${ub.width.toFixed(0)}×${ub.height.toFixed(0)}`)
  await p.waitForTimeout(6000)
  const life = await lifetime(p, /Borttagen/); const d = await draft(p)
  check('AC2', 'toast closes by itself after ~5 s (±0.5); station stays removed; stored pass has no such station', life >= 4500 && life <= 5500 && (await toast(p).count()) === 0 && tek(d).items.length === 2 && !tek(d).items.some((i) => i.id === midId) && !(d.hallPlacements ?? []).some((h) => h.sessionItemId === midId), `lifetime=${life} ms; stored items=${tek(d).items.length}`)
  await shot(p, '02_ac2_after_5s')
  await p.ctx.close()
})

// ═══ AC3 / AC4 / AC5 ═══
await section('A345', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  const t0 = await titles(p)
  await openHall(p); const m0 = await markers(p); await p.locator('.hall-canvas').first().screenshot({ path: `${SS}03_ac4_hall_before.png` }); await back(p)
  await removeBtn(p, 1).tap(); await p.waitForTimeout(1500)
  await tlMark(p); await undo(p).tap(); await p.waitForTimeout(150)
  const t1 = await titles(p), d = await draft(p), tt = await toastText(p), nbtn = await toast(p).locator('button').count()
  await shot(p, '04_ac3_undone_toast')
  check('AC3', '× → Ångra (1.5 s) → same block, same order, same minutes/redskap/text (deep-equal); stored at once', eq(t1, t0) && eq(tek(d).items, tek(orig).items) && eq(d.blocks, orig.blocks), `titles ${JSON.stringify(t1)}`)
  await p.waitForTimeout(2800)
  const life = await lifetime(p, /^Ångrat\.$/)
  check('AC3-toast', '«Ångrat.» shows briefly (~2.2 s), no button', tt === 'Ångrat.' && nbtn === 0 && life >= 1700 && life <= 2700, `"${tt}" buttons=${nbtn} lifetime=${life} ms`)
  await openHall(p); const m1 = await markers(p); await p.locator('.hall-canvas').first().screenshot({ path: `${SS}05_ac4_hall_after_undo.png` })
  check('AC4', 'hall placement back: stored hallPlacements equal; Hallöversikt markers at same x/y', eq(d.hallPlacements, orig.hallPlacements) && eq(m1, m0) && m1.length === 3, `before ${JSON.stringify(m0)} after ${JSON.stringify(m1)}`)
  await back(p)
  // AC5 a: Ångra 1.5 s after ×, reload at once
  await removeBtn(p, 2).tap(); await p.waitForTimeout(1500); await undo(p).tap(); const ta = Date.now(); await p.reload(); const ra = Date.now() - ta
  await p.locator('.home').waitFor(); let r = await draft(p)
  check('AC5', 'Ångra then reload at once (<1 s) → restored station stored', ra < 1000 && eq(r.blocks, orig.blocks) && eq(r.hallPlacements, orig.hallPlacements), `reload issued ${ra} ms after Ångra; stored items=${tek(r).items.length}`)
  // AC5 b (race): × then Ångra within 300 ms (inside the 800 ms debounce), wait 1.5 s, reload
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300)
  await removeBtn(p, 0).tap(); await p.waitForTimeout(250); await undo(p).tap(); await p.waitForTimeout(1500)
  await p.reload(); await p.locator('.home').waitFor(); r = await draft(p)
  check('AC5-race', '× → Ångra inside the 800 ms autosave debounce → after 1.5 s + reload the station is still there (debounced removal write did not land)', eq(r.blocks, orig.blocks), `stored items=${tek(r).items.length}`)
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300)
  const ss = await p.locator('.save-status').innerText().catch(() => '')
  check('B-autosave', 'after Ångra + reload, header save status reads «Sparat» (Slice 39 unaffected)', ss.trim() === 'Sparat', ss)
  await p.ctx.close()
})

// ═══ AC2 variant: × → Ångra → × the same station again → stored? (autosave vs restoreDraft) ═══
await section('A2x', async () => {
  for (const [k, url] of [['branch', BR]]) {
    const p = await newPage(url); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig)); const midId = tek(orig).items[1].id
    await removeBtn(p, 1).tap(); await p.waitForTimeout(1500); const s1 = tek(await draft(p)).items.length
    await undo(p).tap(); await p.waitForTimeout(300); const s2 = tek(await draft(p)).items.length
    await removeBtn(p, 1).tap(); await p.waitForTimeout(6000)
    const scr = await tekCard(p).locator('.item-remove').count(), d = await draft(p), status = await p.locator('.save-status').innerText().catch(() => '')
    await shot(p, '22_ac2x_rex_screen_says_sparat')
    await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor(); await p.reload(); await p.locator('.home').waitFor()
    await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(300)
    const back = await tekCard(p).locator('.item-remove').count(); await shot(p, '23_ac2x_after_home_reload_station_back')
    check('AC2-reX', '× → (1.5 s) Ångra → × the same station again → after 6 s the stored pass has no such station; Hem + reload keeps it removed', scr === 2 && !tek(d).items.some((i) => i.id === midId) && back === 2, `stored after ×=${s1}, after Ångra=${s2}; after 2nd × screen=${scr} stored=${tek(d).items.length} status="${status}"; after Hem+reload screen=${back}`)
    await p.ctx.close()
  }
  // control: same sequence but the 2nd × hits a different station → stored correctly
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  await removeBtn(p, 1).tap(); await p.waitForTimeout(1500); await undo(p).tap(); await p.waitForTimeout(300); await removeBtn(p, 0).tap(); await p.waitForTimeout(6000)
  check('AC2-reX-control', 'control: × → Ångra → × a different station → stored correctly (2 items)', tek(await draft(p)).items.length === 2)
  await p.ctx.close()
})

// ═══ AC6 ═══
await section('A6', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  const [A, B, C] = tek(orig).items.slice().sort((a, b) => a.order - b.order)
  await tlMark(p); await removeBtn(p, 0).tap(); await p.waitForTimeout(3000); await removeBtn(p, 0).tap(); const tB = Date.now()
  await p.waitForTimeout(150); const n = await toast(p).count(), tt = await toastText(p)
  await p.waitForTimeout(3850) // 4 s after B, 7 s after A
  const still = await undo(p).count(); await shot(p, '06_ac6_second_toast_4s')
  await undo(p).tap(); await p.waitForTimeout(200)
  const d = await draft(p), ids = tek(d).items.slice().sort((a, b) => a.order - b.order).map((i) => i.id)
  check('AC6', '× A then × B within 5 s → one toast, fresh 5 s (still there 7 s after A); Ångra brings back B only, A stays removed', n === 1 && tt === 'Borttagen · Ångra' && still === 1 && eq(ids, [B.id, C.id]) && !ids.includes(A.id), `toasts=${n} at7s=${still} ids=${ids.map((i) => i.slice(5, 9))}`)
  // fresh 5 s: second run, measure lifetime from second ×
  await load(p, JSON.stringify(orig)); await removeBtn(p, 0).tap(); await p.waitForTimeout(3000); await tlMark(p); await removeBtn(p, 0).tap(); await p.waitForTimeout(6000)
  const l = await tl(p); const gone = l.find((e) => e.s === null && e.t > l[0].t); const life = gone ? Math.round(gone.t - l[0].t) : null
  check('AC6-timer', 'toast after the second × lives ~5 s from the second × (re-armed)', life >= 4500 && life <= 5600, `lifetime from 2nd × = ${life} ms`)
  await p.ctx.close()
})

// ═══ AC7 ═══
await section('A7', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  await removeBtn(p, 1).tap(); await p.waitForTimeout(200)
  await tekCard(p).getByRole('button', { name: 'Se beskrivning' }).nth(1).click(); await p.waitForTimeout(200)
  const u0 = await undo(p).count()
  await p.locator('.item-duration input:visible').first().fill('9'); await p.waitForTimeout(250)
  const u1 = await undo(p).count(), tc = await toast(p).count(); await shot(p, '07_ac7_after_minutes'); await p.waitForTimeout(1200); const d = await draft(p)
  check('AC7', '× → change minutes on another station → toast closes, no Ångra left; edit stored, station still removed', u0 === 1 && u1 === 0 && tc === 0 && tek(d).items.length === 2 && tek(d).items.some((i) => i.durationMinutes === 9), `undo before edit=${u0} after=${u1} toasts=${tc} mins=${tek(d).items.map((i) => i.durationMinutes)}`)
  // title edit variant
  await load(p, JSON.stringify(orig)); await removeBtn(p, 1).tap(); await p.waitForTimeout(200)
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('V41 ändrad'); await p.waitForTimeout(250)
  check('AC7-title', '× → edit pass title → toast closes, no Ångra left', (await undo(p).count()) === 0)
  await p.ctx.close()
})

// ═══ AC8: Hallöversikt / Hem / Kör passet / Golvklart ═══
await section('A8', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); const dj = JSON.stringify(orig)
  // Hallöversikt
  await load(p, dj); await removeBtn(p, 1).tap(); await p.waitForTimeout(300); await openHall(p); await back(p); await p.waitForTimeout(150)
  let d = await draft(p)
  check('AC8-hall', '× → Hallöversikt → back (<5 s) → no toast, station still removed', (await toast(p).count()) === 0 && (await tekCard(p).locator('.item-remove').count()) === 2 && tek(d).items.length === 2)
  // Hem
  await load(p, dj); await removeBtn(p, 1).tap(); await p.waitForTimeout(300); await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor(); await p.waitForTimeout(150); d = await draft(p)
  check('AC8-home', '× → Hem → Fortsätt passet (<5 s) → no toast, station still removed', (await toast(p).count()) === 0 && (await tekCard(p).locator('.item-remove').count()) === 2 && tek(d).items.length === 2)
  // Golvklart (via Hallöversikt → Golvklart → Avsluta golvklart → Tillbaka)
  await load(p, dj); await removeBtn(p, 1).tap(); await p.waitForTimeout(300); await openHall(p)
  const g = p.getByRole('button', { name: /^Golvklart$/ }).first(); let gOk = false
  if (await g.count()) { await g.click(); await p.waitForTimeout(300); const ex = p.getByRole('button', { name: /Avsluta golvklart/ }).first(); if (await ex.count()) { await ex.click(); await p.waitForTimeout(200); gOk = true } }
  await back(p); await p.waitForTimeout(150); d = await draft(p)
  check('AC8-golvklart', '× → Hallöversikt → Golvklart → Avsluta → back (<5 s) → no toast, station still removed', gOk && (await toast(p).count()) === 0 && (await tekCard(p).locator('.item-remove').count()) === 2 && tek(d).items.length === 2, `golvklart reached=${gOk}`)
  // Kör passet (overlay over the mounted builder)
  await load(p, dj); await tlMark(p); await removeBtn(p, 1).tap(); const tx = Date.now(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).click(); await p.locator('.run-pass').waitFor(); await p.waitForTimeout(700)
  const inRunToast = await toast(p).count(); await shot(p, '08_ac8_in_kor_passet')
  await p.locator('.run-pass').getByRole('button', { name: 'Avsluta' }).first().click(); await p.locator('.run-pass').waitFor({ state: 'detached' }); const tback = Date.now() - tx
  await p.waitForTimeout(150); const afterRun = await toastText(p), undoLeft = await undo(p).count(); await shot(p, '09_ac8_back_from_kor_passet')
  let restoredByUndo = null
  if (undoLeft) { await undo(p).tap(); await p.waitForTimeout(250); restoredByUndo = tek(await draft(p)).items.length }
  check('AC8-korpasset', '× → Kör passet → Avsluta (<5 s) → no toast, undo expired, station still removed', afterRun === null && undoLeft === 0, `back after ${tback} ms; toast during run (DOM)=${inRunToast}; toast after run="${afterRun}"; Ångra still tappable=${undoLeft}${restoredByUndo !== null ? `; tapping it restored the station (stored items=${restoredByUndo})` : ''}`)
  await p.ctx.close()
})

// ═══ AC9 / AC12 / AC13 / AC14 / AC15 (built-in mall over a pass with own placements) ═══
await section('A9', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 eget', 3)); await load(p, JSON.stringify(orig))
  const n0 = (await mallar(p)).length, t0 = await titles(p)
  await openHall(p); const m0 = await markers(p); await back(p)
  await pickBuiltin(p); await p.waitForTimeout(200)
  const confirmText = (await p.locator('.modal-backdrop[role=dialog]').innerText()).replace(/\s+/g, ' ').trim(); note('confirmText.branch', confirmText)
  await tlMark(p); await confirmBtn(p).click(); await p.waitForTimeout(400)
  const tt = await toastText(p), nT = await toast(p).count(), mid = await draft(p)
  await shot(p, '10_ac9_mall_toast')
  check('AC9-toast', 'built-in mall: Använd mall → one toast «Mallen är i Passbyggaren. · Ångra»', tt === 'Mallen är i Passbyggaren. · Ångra' && nT === 1 && mid.id !== orig.id, `"${tt}" mall pass "${mid.title}" placed=${(mid.hallPlacements ?? []).length}`)
  await undo(p).tap(); await p.waitForTimeout(400)
  const d = await draft(p), title = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue(), t2 = await toastText(p)
  await shot(p, '11_ac9_after_undo')
  check('AC9', 'Ångra → previous pass back (id, title, blocks, stations, hall) on screen and stored', d.id === orig.id && title === orig.title && eq(d.blocks, orig.blocks) && d.hallTemplateId === orig.hallTemplateId && eq(await titles(p), t0) && t2 === 'Ångrat.', `${title} / ${d.id === orig.id ? 'same id' : 'id differs'} / toast "${t2}"`)
  await openHall(p); const m1 = await markers(p); await p.locator('.hall-canvas').first().screenshot({ path: `${SS}12_ac12_hall_after_mall_undo.png` }); await back(p)
  const midPlaced = (mid.hallPlacements ?? []).filter((h) => tek(mid).items.some((i) => i.id === h.sessionItemId)).length
  check('AC12', 'mall had Teknik auto-placed; after Ångra Hallöversikt shows the old pass markers only (stored equal, DOM same x/y)', midPlaced > 0 && eq(d.hallPlacements, orig.hallPlacements) && eq(m1, m0) && !(d.hallPlacements ?? []).some((h) => (mid.hallPlacements ?? []).some((x) => x.sessionItemId === h.sessionItemId)), `mall auto-placed=${midPlaced}; markers before ${m0.length} after ${m1.length}`)
  const m = await mallar(p)
  check('AC14', 'Mina mallar after mall undo = before + 1 (Slice 39 auto-copy of the old pass, left); no copy of the mall pass', m.length === n0 + 1 && m.filter((x) => x.title === orig.title).length === 1 && !m.some((x) => x.title === mid.title), `${n0} → ${m.length}: ${m.map((x) => x.title).join(' | ')}`)
  await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor()
  const rt = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
  check('AC13', 'reload → stored pass = previous pass (same id); Fortsätt passet on Hem opens it', r.id === orig.id && eq(r.blocks, orig.blocks) && rt === orig.title && (await tekCard(p).locator('.item-remove').count()) === 3, `stored id same=${r.id === orig.id}; opened "${rt}"`)
  await pickBuiltin(p); await confirmBtn(p).click(); await p.waitForTimeout(500)
  const m2 = await mallar(p); await shot(p, '13_ac15_mall_again')
  check('AC15', 'Använd mall again over the restored pass → no second identical auto-copy', m2.filter((x) => x.title === orig.title).length === 1 && m2.length === n0 + 1, `${m2.length}: ${m2.map((x) => x.title).join(' | ')}`)
  await p.ctx.close()
})

// AC9 via Hem «Från mall» (App goTemplate: new blank pass + picker open, one-shot -tmpl key) — observation of the Home path
await section('A9h', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 hem', 2)); await load(p, JSON.stringify(orig))
  await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Från mall', exact: true }).click(); await builder(p).waitFor(); await p.waitForTimeout(400)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(200)
  const confirmShown = await confirmBtn(p).count(); if (confirmShown) await confirmBtn(p).click(); await p.waitForTimeout(500)
  const tt = await toastText(p), mid = await draft(p); await undo(p).tap(); await p.waitForTimeout(400); const d = await draft(p), m = await mallar(p)
  const panelOpen = await p.locator('.side-panel-slot.is-open').count(), t2 = await toastText(p)
  await shot(p, '14_ac9_home_path_after_undo')
  note('A9h', { confirmShown, toast: tt, mid: mid?.title, afterUndo: { title: d?.title, items: d?.blocks.map((b) => b.items.length), sameIdAsOld: d?.id === orig.id }, mallar: m.map((x) => x.title), toastAfter: t2, panelOpen })
  check('AC9-home', 'Hem «Från mall» → mall → «… · Ångra» → Ångra → the pass that was on screen (the new blank pass App created) comes back; old pass with stations kept as Slice 39 copy in Mina mallar; picker does not reopen', tt === 'Mallen är i Passbyggaren. · Ångra' && t2 === 'Ångrat.' && panelOpen === 0 && d.id !== mid.id && m.some((x) => x.title === orig.title), `confirm=${confirmShown} after Ångra title="${d.title}" items=${JSON.stringify(d.blocks.map((b) => b.items.length))} sameIdAsOldPass=${d.id === orig.id}`)
  await p.ctx.close()
})

// ═══ AC10 Mina mallar ═══
await section('A10', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 före egen', 2)); await load(p, JSON.stringify(orig), seedMall('V41 egen mall', 4))
  const n0 = (await mallar(p)).length
  await menu(p, 'Använd mall'); await p.locator('.template-saved .template-card').filter({ hasText: 'V41 egen mall' }).first().click()
  await confirmBtn(p).click(); await p.waitForTimeout(400); const tt = await toastText(p), mid = await draft(p); await shot(p, '15_ac10_mina_mallar_toast')
  await undo(p).tap(); await p.waitForTimeout(400); const d = await draft(p), m = await mallar(p)
  check('AC10', 'Mina mallar → toast «… · Ångra» → Ångra → previous pass back (id, title, blocks, hall)', tt === 'Mallen är i Passbyggaren. · Ångra' && d.id === orig.id && d.title === orig.title && eq(d.blocks, orig.blocks) && eq(d.hallPlacements, orig.hallPlacements) && mid.title === 'V41 egen mall', `"${tt}" mid="${mid.title}" same id=${d.id === orig.id}`)
  check('AC10-mallar', 'Mina mallar = before + 1 (auto-copy of old pass), source mall untouched', m.length === n0 + 1 && m.some((x) => x.title === 'V41 egen mall') && m.some((x) => x.title === orig.title), m.map((x) => x.title).join(' | '))
  await p.ctx.close()
})

// ═══ AC11 föreningsmall (bank build → local stand-in) ═══
await section('A11', async () => {
  const vs = JSON.parse(seed('V41 klubb', 3))
  const blocks = vs.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) }))
  sql(`delete from public.club_templates where title = 'V41 klubbmall'`)
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V41 klubbmall', ${Math.max(1, vs.totalMinutes)}, '${JSON.stringify({ v: 1, title: 'V41 klubbmall', notes: '', blocks, hallTemplateId: vs.hallTemplateId }).replace(/'/g, "''")}'::jsonb)`)
  const p = await newPage(ON); const orig = JSON.parse(seed('V41 före klubb', 2)); await load(p, JSON.stringify(orig))
  const n0 = (await mallar(p)).length
  await menu(p, 'Använd mall'); await p.waitForTimeout(900)
  await p.locator('section.club-templates .template-card').filter({ hasText: 'V41 klubbmall' }).first().click()
  await tlMark(p); await confirmBtn(p).click(); await p.waitForTimeout(500)
  const tt = await toastText(p), nT = await toast(p).count(), mid = await draft(p); await shot(p, '16_ac11_club_toast')
  await undo(p).tap(); await p.waitForTimeout(400); const d = await draft(p), t2 = await toastText(p)
  await p.waitForTimeout(3500); const after = await toastText(p)
  const log = (await tl(p)).map((e) => e.s).filter((s) => s !== null)
  const mallShown = log.filter((s) => /Mallen är i Passbyggaren/.test(s)).length
  await shot(p, '17_ac11_club_after_undo')
  check('AC11', 'föreningsmall → one toast «… · Ångra»; Ångra → previous pass back; «Mallen är i Passbyggaren.» not shown twice nor after Ångra', tt === 'Mallen är i Passbyggaren. · Ångra' && nT === 1 && mid.title === 'V41 klubbmall' && d.id === orig.id && eq(d.blocks, orig.blocks) && eq(d.hallPlacements, orig.hallPlacements) && t2 === 'Ångrat.' && after === null && mallShown === 1, `toast seq ${JSON.stringify(log)}; mid="${mid.title}"; same id=${d.id === orig.id}`)
  const m = await mallar(p)
  check('AC11-mallar', 'club mall undo: Mina mallar = before + 1, no copy of the club pass', m.length === n0 + 1 && !m.some((x) => x.title === 'V41 klubbmall'), m.map((x) => x.title).join(' | '))
  sql(`delete from public.club_templates where title = 'V41 klubbmall'`)
  note('bankLog', [...new Set(bankLog)])
  await p.ctx.close()
})

// ═══ AC16 blank pass ═══
await section('A16', async () => {
  const p = await newPage(BR); await fresh(p)
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await p.waitForTimeout(400)
  const before = await draft(p), n0 = (await mallar(p)).length, title0 = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue(), rows0 = await p.locator('.item-remove').count(), rowT0 = await p.locator('.item-title').allInnerTexts()
  note('A16.blank', { storedBeforeMall: !!before, rows: rowT0 })
  await pickBuiltin(p); await confirmBtn(p).click(); await p.waitForTimeout(400)
  const mid = await draft(p); await undo(p).tap(); await p.waitForTimeout(400)
  const d = await draft(p), m = await mallar(p)
  check('AC16', 'Tomt pass (only soft Samling rows) → mall → Ångra → blank pass back (title, rows; stored), Mina mallar unchanged', mid.id !== d.id && (!before || d.id === before.id) && eq(await p.locator('.item-title').allInnerTexts(), rowT0) && d.blocks.filter((b) => b.type !== 'gathering').every((b) => b.items.length === 0) && (await p.locator('.item-remove').count()) === rows0 && (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()) === title0 && m.length === n0 && n0 === 0, `rows ${JSON.stringify(rowT0)}; stored before mall=${!!before}; Mina mallar ${n0} → ${m.length}`)
  // strictly 0 stations (seed n=0, no Samling)
  const z = JSON.parse(seed('V41 noll', 0)); z.blocks.forEach((b) => { b.items = [] }); z.hallPlacements = []
  await load(p, JSON.stringify(z)); await pickBuiltin(p); await confirmBtn(p).click(); await p.waitForTimeout(400); await undo(p).tap(); await p.waitForTimeout(400)
  const d2 = await draft(p), m2 = await mallar(p)
  check('AC16-zero', 'pass with 0 stations → mall → Ångra → that pass back, Mina mallar unchanged (0)', d2.id === z.id && d2.blocks.every((b) => b.items.length === 0) && m2.length === 0, `Mina mallar ${m2.length}`)
  await p.ctx.close()
})

// ═══ AC17 ═══
await section('A17', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 eget', 2)); await load(p, JSON.stringify(orig))
  await pickBuiltin(p); await confirmBtn(p).click(); await p.waitForTimeout(400)
  const mid = await draft(p), u0 = await undo(p).count(), n0 = mid.blocks.reduce((a, b) => a + b.items.length, 0)
  const teknik = tekCard(p); const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click(); else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor(); await p.locator('.filter-row select').selectOption('techniques')
  await p.locator('.library-entry .activity-card').nth(5).click(); await p.locator('.activity-detail').getByRole('button', { name: 'Lägg till i valt block' }).click()
  const c = p.locator('.sheet-close'); if (await c.isVisible()) await c.click()
  await p.waitForTimeout(1200); const d = await draft(p), n1 = d.blocks.reduce((a, b) => a + b.items.length, 0)
  await shot(p, '18_ac17_after_add')
  check('AC17', 'mall → add a station before Ångra → toast gone; mall pass stays with the edit (stored)', u0 === 1 && (await undo(p).count()) === 0 && d.id === mid.id && n1 === n0 + 1, `undo before=${u0}, items ${n0} → ${n1}, same mall id=${d.id === mid.id}`)
  await p.ctx.close()
})

// ═══ AC18 keyboard (390 then desktop 1280) ═══
for (const [tag, vp, touch] of [['390', { width: 390, height: 844 }, true], ['desktop', { width: 1280, height: 800 }, false]]) {
  await section('A18-' + tag, async () => {
    const p = await newPage(BR, vp, touch); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
    // real Tab walk until the 2nd × in Teknik has focus
    await p.getByRole('textbox', { name: 'Passets titel' }).focus()
    const target = await removeBtn(p, 1).evaluate((e) => { e.dataset.v41 = '1'; return true })
    let tabs = 0; for (; tabs < 80; tabs++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => document.activeElement?.dataset?.v41 === '1')) break }
    const reached = tabs < 80
    await p.keyboard.press('Enter'); await p.waitForTimeout(150)
    const f = await p.evaluate(() => ({ cls: document.activeElement?.className, txt: document.activeElement?.textContent, fv: document.activeElement?.matches(':focus-visible') }))
    await shot(p, `19_ac18_${tag}_focus_on_angra`)
    await p.waitForTimeout(7000); const held = await undo(p).count()
    await p.keyboard.press('Enter'); await p.waitForTimeout(200)
    const d = await draft(p)
    check(`AC18-${tag}-enter`, `${tag}: Tab to × (${tabs + 1} Tabs) + Enter → focus on Ångra (focus-visible); toast held 7 s while focused; Enter undoes`, reached && f.cls === 'toast-action' && f.txt === 'Ångra' && f.fv && held === 1 && eq(tek(d).items, tek(orig).items), `focus=${f.cls}/${f.txt} fv=${f.fv} held@7s=${held} restored=${eq(tek(d).items, tek(orig).items)}`)
    const after = await p.evaluate(() => ({ tag: document.activeElement?.tagName, cls: document.activeElement?.className }))
    note(`A18.${tag}.focusAfterUndo`, after)
    await removeBtn(p, 1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    const escUi = { toasts: await toast(p).count(), rows: await tekCard(p).locator('.item-remove').count() }
    await p.waitForTimeout(900); const d2 = await draft(p)
    check(`AC18-${tag}-esc`, `${tag}: Escape closes the toast without undo (on screen)`, escUi.toasts === 0 && escUi.rows === 2, JSON.stringify(escUi))
    note(`A18.${tag}.escStored`, `same station × again after an Ångra → stored Teknik items ${tek(d2).items.length} (screen 2) — see AC2-reX`)
    // focus leaves the toast (Shift+Tab) → timer restarts, toast closes ~5 s later
    await load(p, JSON.stringify(orig)); await removeBtn(p, 1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(3000); await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(3000); const stillAfterBlur = await toast(p).count(); await p.waitForTimeout(2600)
    check(`AC18-${tag}-blur`, `${tag}: focus out of the toast → timer runs again, toast closes ~5 s later`, stillAfterBlur === 1 && (await toast(p).count()) === 0, `3 s after blur toast=${stillAfterBlur}`)
    // mall via keyboard: Enter on confirm → focus on Ångra
    await load(p, JSON.stringify(orig)); await pickBuiltin(p); await confirmBtn(p).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500)
    const fm = await p.evaluate(() => ({ cls: document.activeElement?.className, fv: document.activeElement?.matches(':focus-visible') })); await p.waitForTimeout(6000); const heldM = await undo(p).count()
    await p.keyboard.press('Enter'); await p.waitForTimeout(400); const dm = await draft(p)
    check(`AC18-${tag}-mall`, `${tag}: keyboard Använd mall → focus on Ångra, held while focused, Enter undoes`, fm.cls === 'toast-action' && heldM === 1 && dm.id === orig.id, `focus=${fm.cls} fv=${fm.fv} held@6s=${heldM}`)
    await p.ctx.close()
  })
}

// pointer/touch focus: does a tap move focus and hold the toast forever?
await section('A18-touch', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  await pickBuiltin(p); await confirmBtn(p).tap(); await p.waitForTimeout(400)
  const fm = await p.evaluate(() => ({ cls: document.activeElement?.className, fv: document.activeElement?.matches(':focus-visible') }))
  await p.waitForTimeout(5600); const gone = (await toast(p).count()) === 0
  check('AC18-touch-mall', 'tap Använd mall: focus moved to Ångra but not :focus-visible → timer not held, toast closes after ~5 s (Chrome emulation)', gone, `focus=${fm.cls} focus-visible=${fm.fv} closed by 6 s=${gone}`)
  await load(p, JSON.stringify(orig)); await removeBtn(p, 1).tap(); await p.waitForTimeout(150)
  const fx = await p.evaluate(() => ({ cls: document.activeElement?.className, fv: document.activeElement?.matches(':focus-visible') }))
  await p.waitForTimeout(5400)
  check('AC18-touch-x', 'tap ×: toast not held, closes after ~5 s', (await toast(p).count()) === 0, `focus=${fx.cls} fv=${fx.fv}`)
  await p.ctx.close()
})

// ═══ AC19 proxy (a11y tree / live region) — real VoiceOver is manual ═══
await section('A19', async () => {
  const p = await newPage(BR); const orig = JSON.parse(seed('V41 tre', 3)); await load(p, JSON.stringify(orig))
  await p.evaluate(() => { window.__mut = 0; window.__mo = new MutationObserver((ms) => { for (const m of ms) if (m.target.closest?.('.toast') || m.target.parentElement?.closest?.('.toast')) window.__mut++ }); window.__mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true }) })
  await removeBtn(p, 1).tap(); await p.waitForTimeout(100)
  const live = await p.evaluate(() => { const t = document.querySelector('.toast'); return { role: t?.getAttribute('role'), ariaLive: t?.getAttribute('aria-live'), liveRegions: document.querySelectorAll('[role=status]').length, sepHidden: t?.querySelector('[aria-hidden=true]')?.textContent, btnTag: t?.querySelector('button')?.tagName, btnType: t?.querySelector('button')?.type } })
  const snap = await toast(p).ariaSnapshot().catch((e) => 'n/a ' + e.message)
  await p.evaluate(() => { window.__mut = 0 }); await p.waitForTimeout(4000); const muts = await p.evaluate(() => window.__mut)
  await undo(p).tap(); await p.waitForTimeout(150); const snap2 = await toast(p).ariaSnapshot().catch(() => 'n/a')
  check('AC19-proxy', 'live region role=status mounted per toast; separator aria-hidden; Ångra is a <button>; no toast DOM changes during the 5 s (no repeat/tick); «Ångrat.» in role=status', live.role === 'status' && live.sepHidden?.trim() === '·' && live.btnTag === 'BUTTON' && muts === 0 && /Ångrat\./.test(snap2), `${JSON.stringify(live)} mutations during life=${muts} aria=${JSON.stringify(snap)} after=${JSON.stringify(snap2)}`)
  await p.ctx.close()
})

// ═══ AC20: E1 confirm unchanged vs main; other toasts 2.2 s no button; toast vs bottom row ═══
await section('A20', async () => {
  const conf = {}
  for (const [k, url] of [['main', MAIN], ['branch', BR]]) {
    const p = await newPage(url); await load(p, seed('V41 eget', 2)); await pickBuiltin(p); await p.waitForTimeout(200)
    conf[k] = (await p.locator('.modal-backdrop[role=dialog]').innerHTML()).replace(/\s+/g, ' ')
    await p.locator('.modal-backdrop[role=dialog]').screenshot({ path: `${SS}20_ac20_confirm_${k}.png` })
    await p.ctx.close()
  }
  check('AC20-E1', 'Använd mall confirm (TemplateConfirm) markup identical on main ce799ca and branch', conf.main === conf.branch, `len main=${conf.main.length} branch=${conf.branch.length}`)
  const p = await newPage(BR); await load(p, seed('V41 tre', 2))
  const out = {}
  // Spara som egen mall
  await tlMark(p); await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300); await p.locator('.modal-actions .btn-primary').last().click(); await p.waitForTimeout(150)
  out.save = { text: await toastText(p), btn: await toast(p).locator('button').count() }; await p.waitForTimeout(2700); out.save.life = await lifetime(p, /Sparad som egen mall/)
  // Kopierat (Mina mallar → Kopiera delningskod)
  await menu(p, 'Använd mall'); await p.waitForTimeout(300); await tlMark(p)
  await p.locator('.template-saved').getByRole('button', { name: /Kopiera delningskod/ }).first().click(); await p.waitForTimeout(300)
  out.copy = { text: await toastText(p), btn: await toast(p).locator('button').count() }; await p.waitForTimeout(2700); out.copy.life = await lifetime(p, /kopierad/)
  const cl = p.locator('.sheet-close'); if (await cl.isVisible()) await cl.click(); await p.waitForTimeout(200)
  // import (Exportera / dela → Ladda ner fil → Importera fil → Ersätt utkast), on main AND branch
  out.import = {}
  for (const [k, url] of [['main', MAIN], ['branch', BR]]) {
    const q = await newPage(url); await load(q, seed('V41 imp', 2))
    try {
      await menu(q, 'Exportera / dela'); await q.waitForTimeout(300)
      const [dl] = await Promise.all([q.waitForEvent('download', { timeout: 5000 }), q.getByRole('button', { name: 'Ladda ner fil' }).first().click()])
      const fpath = `/tmp/s41x/export-${k}.json`; await dl.saveAs(fpath)
      await q.locator('input[type=file]').first().setInputFiles(fpath); await q.waitForTimeout(400); await tlMark(q)
      await q.getByRole('button', { name: 'Ersätt utkast', exact: true }).click(); await q.waitForTimeout(3000)
      out.import[k] = { seen: (await tl(q)).map((e) => e.s).filter(Boolean) }
    } catch (e) { out.import[k] = { error: String(e.message).split('\n')[0] } }
    await q.ctx.close()
  }
  // failure toast (localStorage write throws)
  await load(p, seed('V41 fail', 2)); await p.evaluate(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'gymnastics-planner-draft-v1') throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v) } })
  await tlMark(p); await p.getByRole('textbox', { name: 'Passets titel' }).fill('V41 fail x'); await p.waitForTimeout(1300)
  out.fail = { text: await toastText(p), btn: await toast(p).locator('button').count() }; await p.waitForTimeout(2600); out.fail.life = await lifetime(p, /.+/)
  note('A20.otherToasts', out)
  const okT = (o) => o && o.text && o.btn === 0 && o.life >= 1700 && o.life <= 2700
  check('AC20-plain', 'other toasts (Sparad som mall, Kopierat, failure) ~2.2 s, no button; import toast behaves as on main', okT(out.save) && okT(out.copy) && okT(out.fail) && eq(out.import.main, out.import.branch) && !out.import.branch.error, JSON.stringify(out))
  // bottom row after toast closes
  await p.evaluate(() => { Storage.prototype.setItem = Storage.prototype.setItem }); await load(p, seed('V41 tre', 3))
  await removeBtn(p, 1).tap(); await p.waitForTimeout(150)
  const geo = await p.evaluate(() => { const t = document.querySelector('.toast').getBoundingClientRect(); const els = [...document.querySelectorAll('button')].filter((b) => { const r = b.getBoundingClientRect(); return r.height > 0 && r.bottom > t.top && r.top < t.bottom && r.right > t.left && r.left < t.right && !b.closest('.toast') }); return { toast: [Math.round(t.left), Math.round(t.top), Math.round(t.width), Math.round(t.height)], under: els.map((b) => b.textContent.trim().slice(0, 30)) } })
  await shot(p, '21_ac20_toast_geometry'); await p.waitForTimeout(5400)
  const after = await p.evaluate((names) => names.map((n) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith(n)); if (!b) return [n, 'n/a']; b.scrollIntoView({ block: 'end' }); const r = b.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return [n, el === b || b.contains(el)] }), geo.under)
  check('AC20-bottom', 'after the toast closes, the controls it covered are hittable again (nothing left over them)', after.every(([, ok]) => ok === true || ok === 'n/a') && (await toast(p).count()) === 0, `toast box ${JSON.stringify(geo.toast)} over: ${JSON.stringify(geo.under)}; after close hit: ${JSON.stringify(after)}`)
  await p.ctx.close()
})

// ═══ Blast radius: HallBoard toast untouched, Slice 37 auto-place on mall unchanged vs main ═══
await section('BR', async () => {
  const res = {}
  for (const [k, url] of [['main', MAIN], ['branch', BR]]) {
    const p = await newPage(url); await load(p, seed('V41 eget', 2)); await pickBuiltin(p); await confirmBtn(p).click(); await p.waitForTimeout(500)
    const d = await draft(p); res[k] = { blocks: d.blocks.map((b) => [b.type, b.items.map((i) => [i.activityId, i.durationMinutes, i.order])]), hall: d.hallTemplateId, placed: (d.hallPlacements ?? []).map((h) => [d.blocks.flatMap((b) => b.items).find((i) => i.id === h.sessionItemId)?.activityId, h.x, h.y]), mallar: (await mallar(p)).map((x) => x.title), toast: await toastText(p) }
    await p.ctx.close()
  }
  note('BR.mall', res)
  check('BR-mall', 'built-in mall result (blocks, Slice 37 placements, Slice 39 Mina mallar copy) identical main vs branch; only the toast differs', eq(res.main.blocks, res.branch.blocks) && eq(res.main.placed, res.branch.placed) && res.main.hall === res.branch.hall && eq(res.main.mallar, res.branch.mallar), `toast main="${res.main.toast}" branch="${res.branch.toast}"`)
})

check('no-errors', 'no page errors in any run', errors.length === 0, errors.join(' | '))
check('no-live', 'no request to a live Supabase host', !bankLog.some((x) => x.startsWith('LIVE?')), bankLog.filter((x) => x.startsWith('LIVE?')).join())
writeFileSync(`${ROOT}/verifier/slice-41-verify-results.json`, JSON.stringify({ when: new Date().toISOString(), sha: execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), results, notes }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()

// Slice 41 «Ångra» — re-verify "-b" at ccd3c31 (0836eb6 fixes + toast CSS). 390×844 headless Chrome, DPR 2, touch (keyboard checks on a desktop-size ctx too).
// BR = branch plain, MAIN = ce799ca plain, ON = branch bank build → MY local stand-in (S32_DIR). Nothing against live.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:57341/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:57342/traningsplaneringen/'
const ON = process.env.ON ?? 'http://127.0.0.1:57340/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const S32 = process.env.S32_DIR ?? '/tmp/s41r/sb'
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean)
const SS = '/workspace/s45v/out/x41_'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const results = [], notes = {}, errors = [], bankLog = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: !!ok, detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 400) : ''}`) }
const note = (k, v) => { notes[k] = v; console.log(`NOTE ${k}: ${typeof v === 'string' ? v : JSON.stringify(v).slice(0, 900)}`) }
async function section(id, fn) { if (ONLY.length && !ONLY.includes(id)) return; try { await fn() } catch (e) { check(id, 'section error', false, String(e.message).split('\n')[0]) } }
const env = () => JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(env().pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME } }).trim()
const seed = (title, hall = 'forening-bla', n = 4) => execFileSync('bun', [`${ROOT}/verifier/slice-41-checks/seed.ts`, title, hall, String(n)], { encoding: 'utf8' }).trim()
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function newPage(url, desk = false) {
  const ctx = await browser.newContext(desk ? { viewport: { width: 1280, height: 900 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request(); const u = new URL(req.url())
    if (u.host !== 'bank-mock.supabase.co') { bankLog.push('LIVE?' + u.host); return route.abort('failed') }
    bankLog.push(u.pathname); const headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: `http://127.0.0.1:${env().gatewayPort}` + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); p.base = url; p.ctx = ctx
  return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const mallar = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const builder = (p) => p.locator('.builder')
const toast = (p) => p.locator('.toast')
const undoBtn = (p) => p.locator('.toast').getByRole('button', { name: 'Ångra' })
const card = (p, h) => p.locator('.block-card').filter({ has: p.locator('h3', { hasText: new RegExp(`^${h}$`) }) }).first()
const rm = (p, h, i) => card(p, h).locator('.item-remove').nth(i)
const blk = (d, t) => d.blocks.find((b) => b.type === t)
const eqJ = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const strip = (d) => { const c = JSON.parse(JSON.stringify(d)); delete c.updatedAt; delete c.savedAt; return c }
async function menu(p, name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
async function back(p) { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await builder(p).waitFor() }
async function cont(p) { await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder(p).waitFor() }
async function load(p, json, tmpl) { await p.goto(p.base); await p.evaluate(([k, v, t, tv]) => { localStorage.clear(); localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null]); await p.reload(); await p.locator('.home').waitFor(); await cont(p); await p.waitForTimeout(300) }
const toastText = async (p) => ((await toast(p).count()) ? (await toast(p).innerText()).replace(/\s+/g, ' ').trim() : '')
const shot = (p, n) => p.screenshot({ path: `${SS}${n}.png` })
// in-page sampler of the stored draft + toast text, every 20 ms
const startSampler = (p) => p.evaluate((k) => { window.__s = []; const t0 = performance.now(); window.__t0 = t0; window.__iv = setInterval(() => { const v = localStorage.getItem(k); let d = null; try { d = JSON.parse(v) } catch {} ; const tk = d?.blocks?.find((b) => b.type === 'techniques'); window.__s.push({ t: Math.round(performance.now() - t0), id: d?.id ?? null, title: d?.title ?? null, nT: tk ? tk.items.length : null, h: v ? v.length : 0, toast: document.querySelector('.toast')?.innerText.replace(/\s+/g, ' ').trim() ?? '' }) }, 20) }, DK)
const stopSampler = (p) => p.evaluate(() => { clearInterval(window.__iv); return window.__s })
async function applyMall(p, kind, name) {
  await menu(p, 'Använd mall'); await p.waitForTimeout(kind === 'club' ? 900 : 200)
  const loc = kind === 'saved' ? p.locator('.template-saved .template-card') : kind === 'club' ? p.locator('section.club-templates .template-card') : p.locator('.template-card')
  await loc.filter({ hasText: name }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click()
}
const mallEntry = (title, json) => { const s = JSON.parse(json); const { blocks, hallTemplateId, notes = '' } = s; return { id: 'mall-s41v-' + title.replace(/\W/g, ''), title, totalMinutes: s.totalMinutes, savedAt: '2026-10-01T08:00:00.000Z', pass: { v: 1, title, notes, blocks: blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ activityId: i.activityId, durationMinutes: i.durationMinutes, note: i.note, order: i.order, ...(i.stationEquipment ? { stationEquipment: i.stationEquipment } : {}) })) })), hallTemplateId } } }

// ═══ A. × then Ångra: first / middle / last Teknik, middle Uppvärmning, dragged marker (AC1, AC3, AC4, AC5, AC2) ═══
await section('A', async () => {
  for (const [h, i, tag] of [['Teknik', 0, 'first'], ['Teknik', 1, 'middle'], ['Teknik', 3, 'last'], ['Uppvärmning', 1, 'uv-middle']]) {
    const p = await newPage(BR); await load(p, seed(`S41V ${tag}`)); await p.waitForTimeout(1000)
    const before = await draft(p); const nCard = await card(p, h).locator('.item-remove').count()
    await rm(p, h, i).click(); await p.waitForTimeout(150)
    const mid = await draft(p); const t = await toastText(p); const dialogs = await p.locator('[role=dialog], [role=alertdialog]').count()
    if (tag === 'middle') { await shot(p, '01_removed_toast'); check('AC1', '× on middle of ≥ 3 → gone at once, no dialog, toast «Borttagen · Ångra»', (await card(p, h).locator('.item-remove').count()) === nCard - 1 && dialogs === 0 && t === 'Borttagen · Ångra', t) }
    await undoBtn(p).click(); await p.waitForTimeout(120)
    const after = await draft(p); const t2 = await toastText(p)
    const bT = blk(before, h === 'Teknik' ? 'techniques' : 'warmup'), aT = blk(after, h === 'Teknik' ? 'techniques' : 'warmup')
    check(`AC3-${tag}`, `× ${h} #${i + 1} → Ångra → whole stored pass deep-equal to before (order, minutes, note, redskap, every block); toast «Ångrat.» no button`, eqJ(strip(after), strip(before)) && eqJ(aT.items, bT.items) && t2 === 'Ångrat.' && (await toast(p).locator('button').count()) === 0, `${bT.items.length}→${blk(mid, bT.type).items.length}→${aT.items.length}; toast «${t2}»`)
    if (h === 'Teknik') check(`AC4-${tag}`, `hallPlacements entry back with exact x/y (+zoneId) and in the same array position`, eqJ(after.hallPlacements, before.hallPlacements) , JSON.stringify(after.hallPlacements.map((x) => [x.x, x.y, x.zoneId ?? '-'])))
    if (tag === 'middle') {
      await shot(p, '02_undone_toast')
      await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
      check('AC5', 'Reload right after Ångra (< 1 s) → restored station stored', eqJ(strip(r), strip(before)))
    }
    await p.ctx.close()
  }
  // dragged marker: drag Teknik #3 in Hallöversikt, back, × it, Ångra
  const p = await newPage(BR); await load(p, seed('S41V drag', 'forening-bla')); await openHall(p)
  const chip = p.locator('.hall-canvas .hall-chip--canvas').filter({ has: p.locator('.hall-chip-rank', { hasText: /^3$/ }) }).first(), canvas = p.locator('.hall-canvas').first()
  await canvas.evaluate((e) => e.scrollIntoView({ block: 'center' })); const cb = await canvas.boundingBox(); const X = cb.x + cb.width * 0.613, Y = cb.y + cb.height * 0.777
  const dt = await p.evaluateHandle(() => new DataTransfer())
  await chip.dispatchEvent('dragstart', { dataTransfer: dt }); await canvas.dispatchEvent('dragover', { dataTransfer: dt, clientX: X, clientY: Y }); await canvas.dispatchEvent('drop', { dataTransfer: dt, clientX: X, clientY: Y }); await chip.dispatchEvent('dragend', { dataTransfer: dt })
  await p.waitForTimeout(1200); await back(p); await p.waitForTimeout(900)
  const before = await draft(p); const id3 = blk(before, 'techniques').items[2].id; const pl3 = before.hallPlacements.find((x) => x.sessionItemId === id3)
  await rm(p, 'Teknik', 2).click(); await p.waitForTimeout(100); await undoBtn(p).click(); await p.waitForTimeout(150)
  const after = await draft(p); await openHall(p); await canvas.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  const cb2 = await canvas.boundingBox(); const r3 = await p.locator('.hall-canvas .hall-chip--canvas').filter({ has: p.locator('.hall-chip-rank', { hasText: /^3$/ }) }).first().boundingBox()
  const cx = (r3.x + r3.width / 2 - cb2.x) / cb2.width, cy = (r3.y + r3.height / 2 - cb2.y) / cb2.height
  check('AC4-dragged', 'Dragged marker (Blå) → × → Ångra → stored placement equal (dragged x/y), marker drawn there', eqJ(after.hallPlacements, before.hallPlacements) && Math.abs(cx - pl3.x) < 0.01 && Math.abs(cy - pl3.y) < 0.01, `stored ${pl3.x.toFixed(4)},${pl3.y.toFixed(4)} drawn ${cx.toFixed(4)},${cy.toFixed(4)}`)
  await shot(p, '03_dragged_marker_restored'); await p.ctx.close()
  // AC2: toast lifetime, station stays removed
  const q = await newPage(BR); await load(q, seed('S41V ac2')); await q.waitForTimeout(900)
  await startSampler(q); await rm(q, 'Teknik', 1).click(); await q.waitForTimeout(6500); const s = await stopSampler(q)
  const on = s.filter((x) => x.toast.startsWith('Borttagen')); const dur = on.length ? on.at(-1).t - on[0].t : 0
  const d = await draft(q)
  check('AC2', 'Toast closes by itself after about 5 s (±0.5); station stays removed in storage', dur >= 4500 && dur <= 5500 && blk(d, 'techniques').items.length === 3 && d.hallPlacements.length === 3, `visible ${dur} ms`)
  await q.ctx.close()
})

// ═══ B. Autosave race: × → Ångra after gap; Använd mall → Ångra after gap ═══
await section('B', async () => {
  const race = []
  for (const gap of [0, 100, 400, 790, 900, 1500]) {
    const p = await newPage(BR); await load(p, seed(`S41V race ${gap}`)); await p.waitForTimeout(1000)
    const before = await draft(p)
    await startSampler(p)
    await p.evaluate((g) => { const b = [...document.querySelectorAll('.block-card')].find((c) => c.querySelector('h3')?.textContent.trim() === 'Teknik').querySelectorAll('.item-remove')[1]; window.__tx = performance.now() - window.__t0; b.click(); setTimeout(() => { window.__tu = performance.now() - window.__t0; document.querySelector('.toast .toast-action')?.click() }, g) }, gap)
    await p.waitForTimeout(gap + 2500)
    const s = await stopSampler(p); const tx = await p.evaluate(() => window.__tx), tu = await p.evaluate(() => window.__tu)
    const after = await draft(p)
    await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
    const removedStoredAt = s.filter((x) => x.nT === 3).map((x) => x.t)
    const lateStale = s.filter((x) => x.t > tu + 30 && x.nT === 3)
    const row = { gapMs: gap, tx: Math.round(tx), tu: Math.round(tu), removedStateStored: removedStoredAt.length ? `${removedStoredAt[0]}–${removedStoredAt.at(-1)} ms` : 'never', staleAfterUndo: lateStale.length, finalOk: eqJ(strip(after), strip(before)), reloadOk: eqJ(strip(r), strip(before)) }
    race.push(row)
    check(`race-x-${gap}`, `× → Ångra after ${gap} ms: no stale removed-state write after Ångra; final + after reload = before`, row.staleAfterUndo === 0 && row.finalOk && row.reloadOk, JSON.stringify(row))
    await p.ctx.close()
  }
  note('B.race_x', race)
  // edit pending, then × within 800 ms, then Ångra fast → the edit survives
  { const p = await newPage(BR); await load(p, seed('S41V edit+x')); await p.waitForTimeout(1000)
    await card(p, 'Teknik').getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(150)
    await p.locator('.item-duration input:visible').first().fill('11'); await p.waitForTimeout(150)
    await p.keyboard.press('Escape').catch(() => {}); const sheet = p.locator('.sheet-close'); if (await sheet.isVisible().catch(() => false)) await sheet.click()
    await rm(p, 'Teknik', 3).click(); await p.waitForTimeout(100); await undoBtn(p).click(); await p.waitForTimeout(2000)
    await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
    const t = blk(r, 'techniques').items
    check('race-edit-x', 'Minutes edit still pending → × within 800 ms → Ångra at 100 ms → after reload: edit kept (11 min) and all 4 stations', t.length === 4 && t.some((i) => i.durationMinutes === 11), t.map((i) => i.durationMinutes).join(','))
    await p.ctx.close() }
  // mall race (built-in and Mina mallar)
  const mrace = []
  for (const kind of ['builtin', 'saved']) for (const gap of [0, 100, 400, 790, 900]) {
    const pj = seed(`S41V mrace ${kind} ${gap}`); const p = await newPage(BR)
    await load(p, pj, kind === 'saved' ? JSON.stringify([mallEntry('S41V egen mall', seed('S41V egen mall src', 'forening-vit', 2))]) : null); await p.waitForTimeout(1000)
    const before = await draft(p); const n0 = (await mallar(p)).length
    await startSampler(p)
    await applyMall(p, kind, kind === 'saved' ? 'S41V egen mall' : /Nybörjare/)
    await p.evaluate((g) => new Promise((res) => { const iv = setInterval(() => { const b = document.querySelector('.toast .toast-action'); if (b) { clearInterval(iv); window.__ta = performance.now() - window.__t0; setTimeout(() => { window.__tu = performance.now() - window.__t0; document.querySelector('.toast .toast-action')?.click(); res() }, g) } }, 5) }), gap)
    await p.waitForTimeout(2500)
    const s = await stopSampler(p); const tu = await p.evaluate(() => window.__tu)
    const after = await draft(p), m = await mallar(p)
    await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
    const mallIdSeen = [...new Set(s.map((x) => x.id))].filter((x) => x !== before.id)
    const late = s.filter((x) => x.t > tu + 30 && x.id !== before.id)
    const row = { kind, gapMs: gap, storedIds: [before.id.slice(-8), ...mallIdSeen.map((x) => x?.slice(-8))], lateMallWrites: late.length, finalOk: eqJ(strip(after), strip(before)), reloadOk: eqJ(strip(r), strip(before)), mallarBefore: n0, mallarAfter: m.length, mallCopy: m.some((x) => x.title !== before.title && x.auto) }
    mrace.push(row)
    check(`race-mall-${kind}-${gap}`, `${kind} mall → Ångra after ${gap} ms: no mall-pass write after Ångra; stored + reload = previous pass (same id); Mina mallar = before + 1, no mall copy`, row.lateMallWrites === 0 && row.finalOk && row.reloadOk && m.length === n0 + 1 && !row.mallCopy, JSON.stringify(row))
    await p.ctx.close()
  }
  note('B.race_mall', mrace)
})

// ═══ C. Mall paths: built-in (AC9), Mina mallar (AC10), föreningsmall via stand-in (AC11), AC12–AC16 ═══
await section('C', async () => {
  // AC9 + AC12 + AC13 + AC14 + AC15 — built-in over a Blå pass with own (dragged-like) placements
  let p = await newPage(BR); const pj = seed('S41V eget Blå', 'forening-bla'); await load(p, pj); await p.waitForTimeout(1000)
  const orig = await draft(p); const n0 = (await mallar(p)).length
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400)
  const mid = await draft(p); const t = await toastText(p); const foc = await p.evaluate(() => document.activeElement?.textContent)
  await shot(p, '04_mall_toast')
  check('AC9-toast', 'Built-in Använd mall → toast «Mallen är i Passbyggaren. · Ångra», focus on Ångra', t === 'Mallen är i Passbyggaren. · Ångra' && foc === 'Ångra', `${t} / focus ${foc}`)
  note('C.mid', { midHall: mid.hallTemplateId, midPlaced: mid.hallPlacements.length, midTitle: mid.title })
  await undoBtn(p).click(); await p.waitForTimeout(400)
  const d = await draft(p)
  check('AC9', 'Ångra → previous pass back: same id, title, blocks, hall', d.id === orig.id && d.title === orig.title && eqJ(d.blocks, orig.blocks) && d.hallTemplateId === orig.hallTemplateId, `${d.id === orig.id} ${d.title} ${d.hallTemplateId}`)
  check('AC12', 'Mall had Teknik auto-placed → after Ångra placements = old pass only (stored), Hallöversikt shows only those', eqJ(d.hallPlacements, orig.hallPlacements) && mid.hallPlacements.length > 0 && !d.hallPlacements.some((x) => mid.hallPlacements.some((y) => y.sessionItemId === x.sessionItemId)), `old ${orig.hallPlacements.length}, mall ${mid.hallPlacements.length}`)
  await openHall(p); const nm = await p.locator('.hall-canvas .hall-chip--canvas').count(); check('AC12-hall', 'Hallöversikt shows the old pass markers (4) in Blå', nm === 4 && (await p.locator('.hall-canvas--forening-bla').count()) > 0, `${nm}`); await shot(p, '05_mall_undo_hall'); await back(p)
  const m = await mallar(p)
  check('AC14', 'Mina mallar: auto-copy of previous pass still there, no copy of the mall pass, count = before + 1', m.length === n0 + 1 && m.some((x) => x.title === orig.title && x.auto) && !m.some((x) => x.title === mid.title), m.map((x) => `${x.title}${x.auto ? '(auto)' : ''}`).join(' | '))
  await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
  const homeTxt = (await p.locator('.home').innerText()).replace(/\s+/g, ' ')
  await cont(p); const ttl = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
  check('AC13', 'Reload → stored pass = previous (same id); Fortsätt passet opens it', r.id === orig.id && ttl === orig.title, `${ttl}`)
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(500)
  const m2 = await mallar(p)
  check('AC15', 'Använd mall again over the restored pass → no second identical auto-copy', m2.filter((x) => x.title === orig.title).length === 1 && m2.length === m.length, m2.map((x) => x.title).join(' | '))
  await p.ctx.close()
  // AC10 Mina mallar
  p = await newPage(BR); const pj10 = seed('S41V före egen'); await load(p, pj10, JSON.stringify([mallEntry('S41V egen mall', seed('S41V egen src', 'forening-vit', 2))])); await p.waitForTimeout(1000)
  const o10 = await draft(p); const n10 = (await mallar(p)).length
  await applyMall(p, 'saved', 'S41V egen mall'); await p.waitForTimeout(400)
  const t10 = await toastText(p); const mid10 = await draft(p)
  await undoBtn(p).click(); await p.waitForTimeout(400); const d10 = await draft(p); const m10 = await mallar(p)
  check('AC10', 'Mina mallar mall → «Mallen är i Passbyggaren. · Ångra» → Ångra → previous pass (same id, blocks, hall, placements); Mina mallar = before + 1', t10 === 'Mallen är i Passbyggaren. · Ångra' && eqJ(strip(d10), strip(o10)) && mid10.id !== o10.id && m10.length === n10 + 1, `${t10}; mallar ${n10}→${m10.length}`)
  await p.ctx.close()
  // AC11 föreningsmall via my stand-in (bank build ON)
  const vs = JSON.parse(seed('V41 klubbmall src', 'forening-vit', 3))
  const blocks = vs.blocks.map((b) => ({ type: b.type, durationMinutes: b.durationMinutes, items: b.items.map((i) => ({ id: i.id, activityId: i.activityId, durationMinutes: i.durationMinutes, note: '', order: i.order })) }))
  sql(`delete from public.club_templates where title = 'V41 klubbmall'`)
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V41 klubbmall', ${Math.max(1, vs.totalMinutes)}, '${JSON.stringify({ v: 1, title: 'V41 klubbmall', notes: '', blocks, hallTemplateId: 'forening-vit' }).replace(/'/g, "''")}'::jsonb)`)
  p = await newPage(ON); await load(p, seed('S41V före klubb')); await p.waitForTimeout(1000)
  const o11 = await draft(p); const n11 = (await mallar(p)).length
  await startSampler(p)
  await applyMall(p, 'club', 'V41 klubbmall'); await p.waitForTimeout(500)
  const t11 = await toastText(p); const mid11 = await draft(p); await shot(p, '06_club_toast')
  await undoBtn(p).click(); await p.waitForTimeout(3500)
  const s11 = await stopSampler(p); const d11 = await draft(p); const m11 = await mallar(p)
  // distinct toast episodes
  const eps = []; for (const x of s11) { if (x.toast && (!eps.length || eps.at(-1).text !== x.toast)) eps.push({ text: x.toast, t: x.t }); if (!x.toast && eps.length && eps.at(-1).text !== '') eps.push({ text: '', t: x.t }) }
  const toasts = eps.filter((e) => e.text)
  check('AC11', 'Föreningsmall (stand-in) → one toast «Mallen är i Passbyggaren. · Ångra» → Ångra → previous pass; mall text not shown twice or after Ångra', t11 === 'Mallen är i Passbyggaren. · Ångra' && mid11.hallTemplateId === 'forening-vit' && eqJ(strip(d11), strip(o11)) && toasts.filter((e) => e.text.startsWith('Mallen')).length === 1 && toasts.at(-1).text === 'Ångrat.' && m11.length === n11 + 1, JSON.stringify(toasts.map((e) => `${e.t}:${e.text}`)))
  await p.ctx.close(); sql(`delete from public.club_templates where title = 'V41 klubbmall'`)
  // AC16 blank pass
  p = await newPage(BR); await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  console.log('HOMEBTN', JSON.stringify(await p.locator('.home button').allInnerTexts())); await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder(p).waitFor(); await p.waitForTimeout(1000)
  const b0 = await draft(p); const n16 = await p.locator('.item-remove').count(); const ttl16 = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); await undoBtn(p).click(); await p.waitForTimeout(400)
  const b1 = await draft(p)
  check('AC16', 'Mall over a blank pass → Ångra → blank pass back (same id, title, rows), Mina mallar unchanged (0)', (await p.locator('.item-remove').count()) === n16 && (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()) === ttl16 && (await mallar(p)).length === 0 && (!b0 || b1.id === b0.id), `stored before ${b0 ? 'yes' : 'no (blank pass unwritten)'}; after id same ${b0 ? b1?.id === b0.id : '-'}; rows ${n16}`)
  await p.ctx.close()
  // AC17
  p = await newPage(BR); await load(p, seed('S41V ac17')); await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400)
  const mid17 = await draft(p)
  await card(p, 'Teknik').getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(150); await p.locator('.item-duration input:visible').first().fill('13'); await p.waitForTimeout(1300)
  const d17 = await draft(p)
  check('AC17', 'Edit the mall pass before Ångra → toast gone, mall pass stays with the edit', (await undoBtn(p).count()) === 0 && d17.id === mid17.id && blk(d17, 'techniques').items.some((i) => i.durationMinutes === 13))
  await p.ctx.close()
})

// ═══ D. Mina mallar spare-slot interplay (Slice 39 cap 8 + 1 spare for auto-copies) ═══
await section('D', async () => {
  const hand = Array.from({ length: 8 }, (_, i) => mallEntry(`Hand ${i + 1}`, seed(`Hand ${i + 1}`, 'forening-bla', 1 + (i % 3))))
  const cases = { '8 hand-saved': hand, '8 hand + 1 auto (old copy)': [...hand, { ...mallEntry('Gammal auto', seed('Gammal auto', 'forening-bla', 2)), auto: true }] }
  for (const [name, list] of Object.entries(cases)) {
    const p = await newPage(BR); await load(p, seed('S41V spare'), JSON.stringify(list)); await p.waitForTimeout(1000)
    const t0 = (await mallar(p)).map((x) => x.title)
    await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); const t1 = (await mallar(p)).map((x) => x.title)
    await undoBtn(p).click(); await p.waitForTimeout(400); const t2 = (await mallar(p)).map((x) => x.title)
    await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); const t3 = (await mallar(p)).map((x) => x.title)
    note(`D.${name}`, { before: t0.length, afterMall: t1.length, afterUndo: t2.length, afterMallAgain: t3.length, lost: t0.filter((x) => !t2.includes(x)), added: t2.filter((x) => !t0.includes(x)) })
    check(`AC14-spare-${name}`, `${name}: Ångra leaves Mina mallar exactly as after the mall (no removal, no duplicate); mall again → no 2nd copy`, eqJ(t1, t2) && t3.filter((x) => x === 'S41V spare').length === 1 && t2.filter((x) => x === 'S41V spare').length === 1, `${t0.length}→${t1.length}→${t2.length}→${t3.length}; lost ${t0.filter((x) => !t2.includes(x))}`)
    await p.ctx.close()
  }
})

// ═══ E. One level (C1, AC6) + guard (AC7) ═══
await section('E', async () => {
  let p = await newPage(BR); const orig = JSON.parse(seed('S41V ac6')); await load(p, JSON.stringify(orig)); await p.waitForTimeout(900)
  const A = blk(orig, 'techniques').items[0], B = blk(orig, 'techniques').items[1]
  await startSampler(p); await rm(p, 'Teknik', 0).click(); await p.waitForTimeout(3000); await rm(p, 'Teknik', 0).click(); await p.waitForTimeout(3500)
  const still = await undoBtn(p).count(); await undoBtn(p).click(); await p.waitForTimeout(200); const s = await stopSampler(p)
  const d = await draft(p); const ids = blk(d, 'techniques').items.map((i) => i.id)
  check('AC6', '× A, × B within 5 s → one toast, fresh 5 s (still there 6.5 s after A); Ångra → B back, A stays removed', still === 1 && (await toast(p).count()) === 1 && ids.includes(B.id) && !ids.includes(A.id) && ids.length === 3 && ids[0] === B.id, `ids ${ids.length}, B first ${ids[0] === B.id}`)
  await p.ctx.close()
  // × then Använd mall → Ångra = pre-mall pass (with the × applied); mall then × → Ångra = the × only
  p = await newPage(BR); const o2 = JSON.parse(seed('S41V x+mall')); await load(p, JSON.stringify(o2)); await p.waitForTimeout(900)
  await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(150); const afterX = await draft(p)
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); const mallPass = await draft(p)
  await rm(p, 'Teknik', 0).click(); await p.waitForTimeout(150); const t = await toastText(p)
  await undoBtn(p).click(); await p.waitForTimeout(300); const u1 = await draft(p)
  check('C1-mall-then-x', '× (pass) → mall → × (mall pass) → Ångra restores only the last × (mall pass back, not the old pass)', t === 'Borttagen · Ångra' && u1.id === mallPass.id && eqJ(blk(u1, 'techniques').items, blk(mallPass, 'techniques').items), `${u1.id === mallPass.id}`)
  check('C1-no-second', 'After that Ångra no further undo offered (toast «Ångrat.» without button)', (await undoBtn(p).count()) === 0)
  await p.ctx.close()
  p = await newPage(BR); await load(p, JSON.stringify(o2)); await p.waitForTimeout(900)
  await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(1000); const ax = await draft(p)
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); await undoBtn(p).click(); await p.waitForTimeout(400); const u2 = await draft(p)
  check('C1-x-then-mall', '× then Använd mall → Ångra restores the pre-mall pass (with the × still applied), station not back', u2.id === o2.id && blk(u2, 'techniques').items.length === 3 && eqJ(strip(u2), strip(ax)))
  await p.ctx.close()
  // AC7 guard: × then minutes edit on another station → toast closes, no Ångra; also: × then title edit
  p = await newPage(BR); await load(p, seed('S41V ac7')); await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(100)
  await card(p, 'Teknik').getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(150); await p.locator('.item-duration input:visible').first().fill('9'); await p.waitForTimeout(1200)
  const d7 = await draft(p)
  check('AC7', '× → change minutes on another station → toast closes, no Ångra left; edit saved, station still removed', (await undoBtn(p).count()) === 0 && blk(d7, 'techniques').items.length === 3 && blk(d7, 'techniques').items.some((i) => i.durationMinutes === 9))
  await p.ctx.close()
  p = await newPage(BR); await load(p, seed('S41V ac7b')); await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(100)
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Ny titel'); await p.waitForTimeout(200)
  check('AC7-title', '× → title edit → toast closes, no Ångra', (await undoBtn(p).count()) === 0)
  await p.ctx.close()
})

// ═══ F. AC8: leaving Passbyggaren ends the undo (Hallöversikt, Golvklart, Hem, Kör passet, reload) ═══
await section('F', async () => {
  for (const exit of ['Hallöversikt', 'Golvklart', 'Hem', 'Kör passet', 'reload', 'mall-toast→Hem']) {
    const p = await newPage(BR); await load(p, seed(`S41V ac8 ${exit}`)); await p.waitForTimeout(900)
    const before = await draft(p)
    if (exit.startsWith('mall')) { await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(300) } else { await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(1000) }
    const removed = await draft(p)
    if (exit === 'Hallöversikt') { await openHall(p); await back(p) }
    else if (exit === 'Golvklart') { await openHall(p); await p.getByRole('button', { name: 'Golvklart', exact: true }).first().click(); await p.waitForTimeout(300); await p.locator('.hall-floor-actions .btn-secondary').first().click(); await p.waitForTimeout(200); await back(p) }
    else if (exit === 'Hem' || exit.startsWith('mall')) { await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor(); await cont(p) }
    else if (exit === 'Kör passet') { await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).click(); await p.locator('.run-pass').waitFor(); await p.getByRole('button', { name: 'Avsluta' }).click(); await builder(p).waitFor() }
    else { await p.reload(); await p.locator('.home').waitFor(); await cont(p) }
    await p.waitForTimeout(300)
    const d = await draft(p)
    check(`AC8-${exit}`, `${exit} within 5 s and back → no toast / no Ångra, change still in place`, (await undoBtn(p).count()) === 0 && eqJ(blk(d, 'techniques').items, blk(removed, 'techniques').items) && d.id === removed.id, `toast «${await toastText(p)}»; teknik ${blk(d, 'techniques').items.length}`)
    await p.ctx.close()
  }
})

// ═══ G. Keyboard (AC18), a11y + 390 layout (AC19 parts, AC20), other toasts, footer (AC22), E1 ═══
await section('G', async () => {
  for (const desk of [true, false]) {
    const p = await newPage(BR, desk); await load(p, seed('S41V kb')); await p.waitForTimeout(800)
    const tag = desk ? 'desk' : '390'
    await rm(p, 'Teknik', 1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150)
    const f = await p.evaluate(() => document.activeElement?.textContent)
    await p.waitForTimeout(6500); const held = await undoBtn(p).count()
    await p.keyboard.press('Enter'); await p.waitForTimeout(200)
    const n = await card(p, 'Teknik').locator('.item-remove').count(); const af = await p.evaluate(() => `${document.activeElement?.tagName}.${document.activeElement?.className}`)
    check(`AC18-${tag}`, `${tag}: Tab-focus × + Enter → focus on Ångra; still open after 6.5 s while focused; Enter undoes`, f === 'Ångra' && held === 1 && n === 4, `focus=${f} held=${held} n=${n}; focus after undo=${af}`)
    // Tab from × reaches Ångra? (Tab order): after ×, press Shift+Tab / Tab and see where focus goes
    await rm(p, 'Teknik', 1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); await p.keyboard.press('Escape'); await p.waitForTimeout(150)
    check(`AC18-esc-${tag}`, `${tag}: Escape closes without undo`, (await toast(p).count()) === 0 && (await card(p, 'Teknik').locator('.item-remove').count()) === 3)
    const fe = await p.evaluate(() => `${document.activeElement?.tagName}.${document.activeElement?.className}`)
    note(`G.focusAfterEsc.${tag}`, fe)
    await p.ctx.close()
  }
  // tap path: focus stays? timer not held after a tap
  const p = await newPage(BR); await load(p, seed('S41V a11y')); await p.waitForTimeout(800)
  await rm(p, 'Teknik', 1).tap(); await p.waitForTimeout(200)
  const a = await p.evaluate(() => { const t = document.querySelector('.toast'); const b = t?.querySelector('button'); const r = t.getBoundingClientRect(), br = b.getBoundingClientRect(); const sep = [...t.querySelectorAll('span')].find((s) => s.textContent.includes('·'))
    const bar = document.querySelector('.builder-actions'); const barR = bar?.getBoundingClientRect()
    return { role: t.getAttribute('role'), live: t.getAttribute('aria-live'), btnName: b.textContent, btnType: b.type, sepHidden: sep?.getAttribute('aria-hidden'), toast: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], btnH: Math.round(br.height), btnW: Math.round(br.width), inViewport: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, oneLine: r.height < 60, focus: document.activeElement?.className, color: getComputedStyle(b).color, bg: getComputedStyle(t).backgroundColor, bar: barR ? [Math.round(barR.top), Math.round(barR.bottom)] : null } })
  note('G.a11y390', a)
  check('AC20-tap', 'Ångra tap target ≥ 44 px tall; toast inside the 390 viewport; role=status; real button «Ångra»; separator aria-hidden', a.btnH >= 44 && a.inViewport && a.role === 'status' && a.btnName === 'Ångra' && a.btnType === 'button' && a.sepHidden === 'true', JSON.stringify(a))
  await shot(p, '07_toast_390_tap')
  // after close: element under the former toast spot is clickable (not blocked)
  await p.waitForTimeout(5600)
  const under = await p.evaluate(([x, y, w, h]) => { const el = document.elementFromPoint(x + w / 2, y + h / 2); return el ? `${el.tagName}.${el.className}` : null }, a.toast)
  check('AC20-after', 'After the toast closes nothing of it remains over the page (no .toast, point under it hits page content)', (await toast(p).count()) === 0 && !String(under).includes('toast'), under)
  // contrast of #fde68a on toast bg
  const lum = (c) => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
  const cr = (lum(a.color) + 0.05) / (lum(a.bg) + 0.05); note('G.contrast', `Ångra ${a.color} on ${a.bg}: ${cr.toFixed(1)}:1`)
  // Long mall toast at 390
  await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400)
  const mt = await p.evaluate(() => { const t = document.querySelector('.toast').getBoundingClientRect(); return { w: Math.round(t.width), h: Math.round(t.height), left: Math.round(t.left), right: Math.round(t.right) } })
  note('G.mallToast390', mt); await shot(p, '08_mall_toast_390')
  check('AC20-mall390', 'Mall toast «Mallen är i Passbyggaren. · Ångra» fits inside 390 px', mt.left >= 0 && mt.right <= 390, JSON.stringify(mt))
  const lines = await p.evaluate(() => { const sp = document.querySelector('.toast span'); const r = sp.getClientRects(); const lh = parseFloat(getComputedStyle(sp).lineHeight) || 20; return { rects: r.length, h: Math.round(sp.getBoundingClientRect().height), lh, maxW: getComputedStyle(document.querySelector('.toast')).maxWidth, ws: getComputedStyle(document.querySelector('.toast')).whiteSpace } })
  note('G.mallToastLines', lines)
  await undoBtn(p).click(); await p.waitForTimeout(500)
  // E1: no confirm on ×; Använd mall confirm unchanged vs main
  const conf = async (url) => { const q = await newPage(url); await load(q, seed('S41V e1')); await menu(q, 'Använd mall'); await q.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await q.waitForTimeout(200); const txt = (await q.locator('.modal-backdrop[role=dialog]').innerText()).replace(/\s+/g, ' '); await q.ctx.close(); return txt }
  const cb = await conf(BR), cm = await conf(MAIN)
  check('AC20-E1', 'Använd mall confirm text identical to main', cb === cm, cb.slice(0, 160))
  // other toasts: Spara som egen mall — duration, no button
  await startSampler(p); await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300); await p.locator('.modal-actions .btn-primary').last().click(); await p.waitForTimeout(3000)
  const s = await stopSampler(p); const on = s.filter((x) => x.toast && !x.toast.includes('Ångra') && x.toast !== 'Ångrat.'); const dur = on.length ? on.at(-1).t - on[0].t : 0
  check('AC20-plain', 'Other toast (Sparad som egen mall) 2.2 s, no button', on.length > 0 && Math.abs(dur - 2200) <= 300 && !on.some((x) => x.toast.includes('Ångra')), `${on[0]?.toast} ${dur} ms`)
  // «Ångrat.» lifetime
  await rm(p, 'Teknik', 0).click(); await p.waitForTimeout(100); await startSampler(p); await undoBtn(p).click(); await p.waitForTimeout(3000)
  const s2 = await stopSampler(p); const ok2 = s2.filter((x) => x.toast === 'Ångrat.'); const d2 = ok2.length ? ok2.at(-1).t - ok2[0].t : 0
  check('AC3-done-2.2', '«Ångrat.» shows ~2.2 s, no button', Math.abs(d2 - 2200) <= 300, `${d2} ms`)
  const foot = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('AC22-footer', 'Footer «Träningsplaneraren · Slice 41»', foot.includes('Träningsplaneraren · Slice 41'), foot.slice(0, 70))
  await p.ctx.close()
})

// ═══ W. Toast one line at 320 / 390 px, no horizontal scroll, no clipping (ccd3c31 CSS) ═══
await section('W', async () => {
  for (const w of [320, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, hasTouch: true }); const p = await ctx.newPage(); p.base = BR; p.ctx = ctx; p.setDefaultTimeout(10000)
    await load(p, seed(`S41VR w${w}`)); await p.waitForTimeout(800)
    const geo = () => p.evaluate(() => { const t = document.querySelector('.toast'); const sp = t.querySelector('span'); const r = t.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(sp).lineHeight) || 20; const b = t.querySelector('button')?.getBoundingClientRect()
      return { text: t.innerText.replace(/\s+/g, ' ').trim(), spanH: Math.round(sp.getBoundingClientRect().height), lh, oneLine: sp.getBoundingClientRect().height < lh * 1.5 && (!b || b.height <= 46), btnH: b ? Math.round(b.height) : null, left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, scrollW: document.documentElement.scrollWidth, inside: r.left >= 0 && r.right <= innerWidth } })
    await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(200); const gx = await geo(); await shot(p, `02_toast_x_${w}`)
    await undoBtn(p).click(); await p.waitForTimeout(300)
    await applyMall(p, 'builtin', /Nybörjare/); await p.waitForTimeout(400); const gm = await geo(); await shot(p, `03_toast_mall_${w}`)
    note(`W.${w}`, { x: gx, mall: gm })
    for (const [k, g] of [['x', gx], ['mall', gm]]) check(`W-${k}-${w}`, `${w} px: «${g.text}» on one line, toast inside viewport, no horizontal scroll`, g.oneLine && g.inside && g.scrollW <= g.vw, JSON.stringify(g))
    await ctx.close()
  }
})

// ═══ X. × → Ångra → × matrix (AC2 fix) + other edit after Ångra ═══
await section('X', async () => {
  const rows = []
  const teknikCount = (p) => card(p, 'Teknik').locator('.item-remove').count()
  for (const gA of [0, 300, 790, 900, 1500]) for (const [gB, same] of [[0, true], [300, true], [900, true], [1500, true], [900, false]]) {
    const p = await newPage(BR); await load(p, seed(`S41VR rex ${gA} ${gB}`)); await p.waitForTimeout(1000)
    await p.evaluate(([a, b, same]) => new Promise((res) => {
      const rmb = (i) => [...document.querySelectorAll('.block-card')].find((c) => c.querySelector('h3')?.textContent.trim() === 'Teknik').querySelectorAll('.item-remove')[i]
      rmb(1).click()
      setTimeout(() => { document.querySelector('.toast .toast-action')?.click(); setTimeout(() => { rmb(same ? 1 : 2).click(); res() }, b) }, a)
    }), [gA, gB, same])
    await p.waitForTimeout(1800)
    const screen = await teknikCount(p); const stored = blk(await draft(p), 'techniques').items.length
    const status = ((await p.locator('.builder').innerText()).match(/Sparat|Sparar|kunde inte sparas/) ?? [''])[0]
    await p.reload(); await p.locator('.home').waitFor(); await cont(p); const reload = await teknikCount(p)
    const ok = screen === 3 && stored === 3 && reload === 3
    rows.push({ gapBeforeUndo: gA, gapBeforeSecondX: gB, second: same ? 'same station' : 'other station', screen, stored, status, afterReload: reload, ok })
    if (gA === 1500 && gB === 300 && same) await shot(p, '01_rex_1500_after_reload')
    await p.ctx.close()
  }
  note('X.matrix', rows)
  for (const r of rows) check(`AC2-rex-${r.gapBeforeUndo}-${r.gapBeforeSecondX}-${r.second.split(' ')[0]}`, `× → ${r.gapBeforeUndo} ms → Ångra → ${r.gapBeforeSecondX} ms → × (${r.second}): screen = storage = reload (3)`, r.ok, JSON.stringify(r))
  // other edit kind after Ångra (> 800 ms): minutes
  for (const gA of [300, 1500]) {
    const p = await newPage(BR); await load(p, seed(`S41VR min ${gA}`)); await p.waitForTimeout(1000)
    await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(gA); await undoBtn(p).click(); await p.waitForTimeout(900)
    await card(p, 'Teknik').getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(150); await p.locator('.item-duration input:visible').first().fill('12'); await p.waitForTimeout(1500)
    const d = await draft(p); await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
    const t = blk(r, 'techniques').items
    check(`AC2-min-${gA}`, `× → ${gA} ms → Ångra → 900 ms → minutes 12 → reload: 4 stations and 12 min stored`, t.length === 4 && t[0].durationMinutes === 12 && eqJ(strip(d), strip(r)), t.map((i) => i.durationMinutes).join(','))
    await p.ctx.close()
  }
  // undo the same thing twice in a row (× → Ångra → × → Ångra) then reload
  { const p = await newPage(BR); const o = seed('S41VR twice'); await load(p, o); await p.waitForTimeout(1000); const before = await draft(p)
    await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(1500); await undoBtn(p).click(); await p.waitForTimeout(1200); await rm(p, 'Teknik', 1).click(); await p.waitForTimeout(1500); await undoBtn(p).click(); await p.waitForTimeout(1500)
    await p.reload(); await p.locator('.home').waitFor(); const r = await draft(p)
    check('AC2-twice', '× → Ångra → × → Ångra (all gaps > 800 ms) → reload = original', eqJ(strip(r), strip(before)))
    await p.ctx.close() }
})

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass} · page errors ${errors.length} · bank requests ${bankLog.length} (live: ${bankLog.filter((x) => x.startsWith('LIVE')).length})`)
if (!ONLY.length) writeFileSync(`${ROOT}/verifier/slice-41-reverify-b-results.json`, JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes, errors }, null, 2))
await browser.close()

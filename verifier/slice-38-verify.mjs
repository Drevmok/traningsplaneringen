// Slice 38 — Verifier independent checks (e747df9). Kör passet «Kvar: X min». Headless Chromium, Playwright fake clock.
// Usage: BR=http://127.0.0.1:4381/traningsplaneringen/ MAIN=http://127.0.0.1:4382/traningsplaneringen/ node verifier/slice-38-verify.mjs
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:4381/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:4382/traningsplaneringen/'
const ROOT = process.env.S38_ROOT ?? '/workspace/gp-s38v'
const SS = '/workspace/screenshots/s38v_'
const MD = readFileSync(`${ROOT}/slice-38/content/microcopy.sv.md`, 'utf8')
const LBL = MD.match(/^\| `runLeftLabel` \*\*ny\*\* \| ([^|]+?) \|/m)[1].trim()
const K = (n) => LBL.replace('{n}', String(n))
const tok = (spec) => JSON.parse(execFileSync('bun', [`${ROOT}/verifier/slice-38-v-mktoken.ts`, JSON.stringify(spec)], { encoding: 'utf8' })).token
const LONG = 'Mycket lång övningstitel med hjulning, rondat och flickis på tumblingbanan till landningsmattan'
const out = { label: LBL, checks: [], notes: {} }
const check = (id, ok, d = '') => { out.checks.push({ id, ok: !!ok, d: String(d).slice(0, 500) }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${String(d).slice(0, 250)}`) }
async function attempt(id, fn) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(id[0])) return; try { await fn() } catch (e) { check(id + '-error', false, (globalThis.__step ?? '') + ' ' + String(e.message).split('\n')[0]) } }

// AudioContext wrap (as slice-34-verify) + navigator.wakeLock stub that records request/release.
const INIT = () => {
  const L = (window.__s38 = { osc: [], vib: [], wl: { req: 0, rel: 0, active: 0 } })
  const stamp = () => ({ t: Date.now(), h1: document.querySelector('.run-pass h1')?.textContent?.trim() ?? null, left: document.querySelector('.run-left')?.textContent ?? null })
  for (const k of ['AudioContext', 'webkitAudioContext']) {
    const C = window[k]; if (!C) continue
    window[k] = class extends C {
      createOscillator() { const n = super.createOscillator(); const s = n.start.bind(n); n.start = (...a) => { L.osc.push(stamp()); return s(...a) }; return n }
      createBufferSource() { const n = super.createBufferSource(); const s = n.start.bind(n); n.start = (...a) => { L.osc.push({ ...stamp(), buf: 1 }); return s(...a) }; return n }
    }
  }
  if (typeof navigator.vibrate === 'function') Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p) => { L.vib.push(stamp()); return true } })
  Object.defineProperty(Navigator.prototype, 'wakeLock', { configurable: true, get: () => ({ request: async (t) => { L.wl.req++; L.wl.active++; L.wl.type = t; let done = false; return { release: async () => { if (!done) { done = true; L.wl.rel++; L.wl.active-- } } } } }) })
  let vis = 'visible'
  Object.defineProperty(Document.prototype, 'visibilityState', { configurable: true, get: () => vis })
  window.__setVis = (v) => { vis = v; document.dispatchEvent(new Event('visibilitychange')) }
}
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const errs = []
async function open(base, { w = 390, h = 844, hash = '' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.addInitScript(INIT)
  const page = await ctx.newPage(); page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => errs.push(base + ' pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(base + ' console: ' + m.text()) })
  await page.clock.install({ time: new Date('2026-10-13T16:00:00Z') })
  await page.goto(base + hash)
  return { ctx, page }
}
const S = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__s38)))
const run = (p) => p.locator('.run-pass')
const left = async (p) => (await run(p).locator('.run-left').textContent()).trim()
const clk = async (p) => (await run(p).locator('.run-clock').innerText()).trim()
const nextT = async (p) => (await run(p).locator('.run-next').textContent()).trim()
const nextBtn = (p) => run(p).getByRole('button', { name: 'Nästa övning' })
const prevBtn = (p) => run(p).getByRole('button', { name: 'Föregående' })
const runBtn = (p) => p.getByRole('button', { name: 'Kör passet, en övning i taget' })
const both = async (p) => `${await clk(p)} ${await left(p)}`
async function startShare(p) { await p.locator('.share-pass').waitFor(); await p.locator('.share-actions').getByRole('button', { name: 'Kör passet, en övning i taget' }).click(); await run(p).waitFor() }

const T_CHK = tok({ title: 'S38V checklista', plan: { warmup: [['#0', 2]], techniques: [['#0', 1], ['#1', 1]] } }) // 2+1+1 = 4 min, 2 blocks
const T_EDGE = tok({ title: 'S38V kanter', plan: { warmup: [['#0', 3]], techniques: [['#0', 0], ['#1', 1], ['#2', 1]] } }) // 3+0+1+1 = 5 min, one 0-min step
const T_LONG = tok({ title: 'S38V lång', plan: { warmup: [['#0', 90]], techniques: [[LONG, 30], ['#1', 1]] } }) // 121 min, long title as «Nästa»

// ---------- A: checklist pass via shared link, fine-grained clock ----------
await attempt('A', async () => {
  const { ctx, page: p } = await open(BR, { hash: '#dela=' + T_CHK })
  await startShare(p)
  const order = await run(p).evaluate((r) => [...r.children].map((c) => c.className.split(' ')[0] || c.tagName))
  check('AC1', (await left(p)) === K(4) && order.indexOf('run-next') + 1 === order.indexOf('run-left') && order.indexOf('run-clock') < order.indexOf('run-next'), `${await left(p)} · ${order.join(' > ')}`)
  const st = await run(p).locator('.run-left').evaluate((e) => ({ tag: e.tagName, role: e.getAttribute('role'), live: e.getAttribute('aria-live'), al: e.getAttribute('aria-label'), hidden: e.getAttribute('aria-hidden'), color: getComputedStyle(e).color, nextColor: getComputedStyle(document.querySelector('.run-next')).color, fs: getComputedStyle(e).fontSize, liveAncestor: !!e.closest('[aria-live],[role=status],[role=alert],[role=log]') }))
  check('AC12-struct', st.tag === 'P' && !st.role && !st.live && !st.al && !st.hidden && !st.liveAncestor, JSON.stringify(st))
  check('AC1-muted', st.color === 'rgb(168, 162, 158)' && st.color !== st.nextColor, JSON.stringify(st))
  const lbl0 = await run(p).locator('.run-clock').getAttribute('aria-label')
  check('AC12-clocklabel', lbl0 === '02:00. Pausa timern', lbl0)
  await p.screenshot({ path: SS + '01_start_kvar4.png' })
  // AC4: sample every second through step 1, compare to formula ceil((left+120)/60)
  const bad = []; let samples = 0
  for (let t = 1; t <= 125; t++) {
    await p.clock.runFor(1000); samples++
    const c = await clk(p), [m, s] = c.split(':').map(Number), l = m * 60 + s
    const exp = K(Math.ceil((l + 120) / 60)), got = await left(p)
    if (got !== exp) bad.push(`${c}:${got}`)
    if (c === '01:30') check('AC2a', got === K(4), c + ' ' + got)
    if (c === '00:59') check('AC2b', got === K(3), c + ' ' + got)
    if (c === '00:01') check('AC7-pre', got === K(3), c + ' ' + got)
  }
  check('AC4-live-1s-samples', bad.length === 0, `${samples} samples, mismatches: ${bad.join(',')}`)
  check('AC7', (await clk(p)) === '00:00' && (await left(p)) === K(2), await both(p))
  await p.clock.runFor(120_000)
  check('AC7-still', (await left(p)) === K(2) && (await clk(p)) === '00:00', await both(p))
  let s = await S(p); s.osc = s.osc.filter((o) => !o.buf)
  check('AC17-tone-once-step1', s.osc.length === 1 && s.vib.length === 1 && s.osc[0].left === K(2), JSON.stringify(s.osc))
  await p.screenshot({ path: SS + '02_step1_timeup_kvar2.png' })
  // AC5 nav
  await nextBtn(p).click()
  check('AC5-next', (await left(p)) === K(2) && (await clk(p)) === '01:00', await both(p))
  await p.clock.runFor(30_000)
  check('AC5-step2-01:30-left', (await left(p)) === K(2) && (await clk(p)) === '00:30', await both(p))
  await p.keyboard.press('ArrowRight')
  check('AC5-arrowright-skip', (await left(p)) === K(1) && (await clk(p)) === '01:00', 'skipped 30 s of step 2 dropped: ' + await both(p))
  check('AC10', (await nextT(p)) === 'Sista aktiviteten' && (await left(p)) === K(1), await nextT(p))
  await p.keyboard.press('ArrowLeft')
  check('AC5-arrowleft-raises', (await left(p)) === K(2) && (await clk(p)) === '01:00', await both(p))
  await prevBtn(p).click()
  check('AC5-foregaende-raises', (await left(p)) === K(4) && (await clk(p)) === '02:00', await both(p))
  // AC6 pause across a minute boundary
  await p.clock.runFor(55_000) // 01:05 → Kvar 4
  await run(p).locator('.run-clock').click()
  const c0 = await both(p)
  await p.clock.runFor(300_000)
  check('AC6-frozen', (await both(p)) === c0 && c0 === `01:05 ${K(4)}` && (await run(p).getByText('Pausad').count()) === 1, c0 + ' → ' + await both(p))
  const pl = await run(p).locator('.run-clock').getAttribute('aria-label')
  await p.screenshot({ path: SS + '03_paused_frozen.png' })
  await run(p).locator('.run-clock').click()
  check('AC6-resume-same', (await both(p)) === `01:05 ${K(4)}`, await both(p))
  await p.clock.runFor(5_000)
  const r5 = await both(p)
  await p.clock.runFor(1_000)
  check('AC6-resume-continues', r5 === `01:00 ${K(3)}` && (await both(p)) === `00:59 ${K(3)}`, r5 + ' / ' + await both(p) + ' paused label ' + pl)
  // paused while navigating: remains paused? record
  // AC8 last step
  await nextBtn(p).click(); await nextBtn(p).click()
  s = await S(p); const toneBefore = s.osc.filter((o) => !o.buf).length
  await p.clock.runFor(59_000)
  check('AC3-0:01→1', (await both(p)) === `00:01 ${K(1)}`, await both(p))
  const col0 = await run(p).locator('.run-left').evaluate((e) => getComputedStyle(e).color)
  await p.clock.runFor(1_000)
  check('AC3-0:00→0', (await both(p)) === `00:00 ${K(0)}`, await both(p))
  const seen = new Set()
  for (let i = 0; i < 10; i++) { await p.clock.runFor(60_000); seen.add(await left(p)) }
  const after = await run(p).locator('.run-left').evaluate((e) => ({ vis: e.checkVisibility(), color: getComputedStyle(e).color, text: e.textContent }))
  s = await S(p); s.osc = s.osc.filter((o) => !o.buf)
  check('AC8', [...seen].join() === K(0) && after.vis && after.color === col0 && after.text === 'Kvar: 0 min' && (await run(p).locator('[role=alert]').count()) === 0 && s.osc.length - toneBefore === 1, JSON.stringify({ seen: [...seen], after, tones: s.osc.length - toneBefore }))
  check('AC8-no-negative', !/-/.test(await left(p)), await left(p))
  await p.screenshot({ path: SS + '04_last_over_kvar0.png' })
  const btns = await run(p).locator('button').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label') || x.textContent.trim()))
  out.notes.runButtons = btns
  // AC17 wake lock
  s = await S(p)
  check('AC17-wakelock-acquired', s.wl.req === 1 && s.wl.active === 1 && s.wl.type === 'screen', JSON.stringify(s.wl))
  await p.evaluate(() => window.__setVis('hidden')); await p.evaluate(() => window.__setVis('visible')); await p.clock.runFor(100)
  s = await S(p)
  check('AC17-wakelock-reacquire-on-visible', s.wl.req === 2, JSON.stringify(s.wl))
  await run(p).getByRole('button', { name: 'Avsluta' }).click(); await p.clock.runFor(100)
  s = await S(p)
  check('AC17-wakelock-released-on-exit', (await run(p).count()) === 0 && s.wl.rel >= 1, JSON.stringify(s.wl))
  out.notes.wlBranch = s.wl
  await ctx.close()
})

// ---------- B: rounding edges + 0-min step + skip (3+0+1+1) ----------
await attempt('B', async () => {
  const { ctx, page: p } = await open(BR, { hash: '#dela=' + T_EDGE })
  await startShare(p)
  check('B-start-5:00→5', (await both(p)) === `03:00 ${K(5)}`, await both(p))
  await p.clock.runFor(59_000)
  check('AC3-4:01→5', (await both(p)) === `02:01 ${K(5)}`, 'total 4:01 ' + await both(p))
  await p.clock.runFor(1_000)
  check('AC3-4:00→4', (await both(p)) === `02:00 ${K(4)}`, 'total 4:00 ' + await both(p))
  await p.clock.runFor(1_000)
  check('AC3-3:59→4', (await both(p)) === `01:59 ${K(4)}`, await both(p))
  await nextBtn(p).click()
  check('B-0min-step', (await both(p)) === `00:00 ${K(2)}`, '0-min step adds nothing, skipped 1:59 dropped: ' + await both(p))
  await nextBtn(p).click(); await p.clock.runFor(1_000)
  check('B-2:59→3?', (await both(p)) === `00:59 ${K(2)}`, await both(p))
  await nextBtn(p).click(); await p.clock.runFor(59_000)
  check('AC3-last-0:01→1', (await both(p)) === `00:01 ${K(1)}`, await both(p))
  await p.clock.runFor(1_000)
  check('AC3-last-0:00→0', (await both(p)) === `00:00 ${K(0)}`, await both(p))
  await ctx.close()
})

// ---------- C: layout (long «Nästa» title, 3-digit Kvar) at 320/360/390 + nav visibility with long text ----------
for (const w of [320, 360, 390]) await attempt('C' + w, async () => {
  const { ctx, page: p } = await open(BR, { w, hash: '#dela=' + T_LONG })
  await startShare(p)
  const m = async (tag) => run(p).evaluate((r, w) => {
    const q = (s) => r.querySelector(s), rect = (e) => { const b = e.getBoundingClientRect(); return { t: +b.top.toFixed(1), b: +b.bottom.toFixed(1), l: +b.left.toFixed(1), r: +b.right.toFixed(1), h: +b.height.toFixed(1) } }
    const n = q('.run-next'), k = q('.run-left'), c = q('.run-clock'), sc = q('.run-script'), nav = q('.run-nav')
    const lh = parseFloat(getComputedStyle(n).lineHeight) || parseFloat(getComputedStyle(n).fontSize) * 1.5
    const kl = parseFloat(getComputedStyle(k).lineHeight) || parseFloat(getComputedStyle(k).fontSize) * 1.5
    return { next: rect(n), left: rect(k), clock: rect(c), script: rect(sc), nav: rect(nav), nextLines: Math.round(n.getBoundingClientRect().height / lh), leftLines: Math.round(k.getBoundingClientRect().height / kl), nextTrunc: n.scrollWidth > n.clientWidth, leftOverflow: k.scrollWidth > k.clientWidth, sw: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight, overlayScroll: r.scrollHeight - r.clientHeight, scriptScrolls: sc.scrollHeight > sc.clientHeight, text: k.textContent, nextText: n.textContent }
  }, w)
  const g = await m()
  const ok = (g) => g.left.t >= g.next.b - 0.5 && g.left.b <= g.script.t + 0.5 && g.nextLines === 1 && g.leftLines === 1 && !g.leftOverflow && g.left.r <= g.vw && g.sw <= g.vw && g.nav.b <= g.vh && g.nav.t >= g.left.b && g.overlayScroll <= 0
  check(`AC9-${w}-step1`, ok(g) && g.nextTrunc && g.text === K(121) && g.nextText.startsWith('Nästa: Mycket lång'), JSON.stringify(g))
  out.notes['layout' + w] = g
  await p.screenshot({ path: `${SS}05_long_next_${w}.png` })
  await run(p).locator('.run-clock').click() // paused: «Pausad» line also present
  const gp = await m()
  check(`AC9-${w}-paused`, ok(gp), JSON.stringify({ left: gp.left, next: gp.next, nav: gp.nav }))
  await run(p).locator('.run-clock').click()
  await nextBtn(p).click() // long title as current h1, «Sista…»? no: next is step 3
  const g2 = await m()
  check(`AC11-${w}-long-h1`, g2.nav.b <= g2.vh && g2.overlayScroll <= 0 && g2.sw <= g2.vw && g2.left.t >= g2.next.b - 0.5, JSON.stringify({ nav: g2.nav, vh: g2.vh, left: g2.left, script: g2.script, scroll: g2.scriptScrolls }))
  await run(p).locator('.run-script').evaluate((sc) => { const x = document.createElement('p'); x.className = 's38v-injected'; x.textContent = 'Säkerhet: ' + 'Lång säkerhetstext om landning, passning och mattor som fortsätter länge. '.repeat(30); sc.appendChild(x) })
  const g2b = await m()
  check(`AC11-${w}-long-script`, g2b.scriptScrolls && g2b.nav.b <= g2b.vh && g2b.overlayScroll <= 0 && g2b.sw <= g2b.vw && g2b.left.b <= g2b.script.t + 0.5, JSON.stringify({ nav: g2b.nav, script: g2b.script, scrolls: g2b.scriptScrolls, overlay: g2b.overlayScroll }))
  await p.screenshot({ path: `${SS}06_long_h1_${w}.png` })
  await run(p).locator('.s38v-injected').evaluate((e) => e.remove())
  await p.clock.runFor(30 * 60_000 + 1000)
  const g3 = await m()
  check(`AC9-${w}-timeup-status`, ok(g3) && g3.text === K(1), JSON.stringify({ text: g3.text, next: g3.next, left: g3.left, nav: g3.nav }))
  await nextBtn(p).click()
  const g4 = await m()
  check(`AC10-${w}`, g4.nextText === 'Sista aktiviteten' && g4.text === K(1) && ok({ ...g4, nextLines: 1 }), JSON.stringify({ n: g4.nextText, t: g4.text }))
  await ctx.close()
})

// ---------- D: AC14 other screens + Kör passet entry points, branch vs main ----------
async function screens(base, tag) {
  const res = {}
  const { ctx, page: p } = await open(base)
  const snap = async (k, shot) => {
    globalThis.__step = tag + ':' + k
    await p.clock.runFor(400)
    res[k] = await p.evaluate(() => ({ kvar: document.body.innerText.includes('Kvar:'), runLeft: document.querySelectorAll('.run-left').length, buttons: [...document.querySelectorAll('button')].filter((b) => b.checkVisibility()).map((b) => b.getAttribute('aria-label') || b.textContent.trim()).filter((t) => !/^\d+$/.test(t)).join('|'), text: document.body.innerText.replace(/Slice \d+/g, 'Slice N').replace(/\s+/g, ' ').length }))
    if (shot) await p.screenshot({ path: `${SS}${shot}.png`, fullPage: false })
  }
  await snap('home', tag === 'br' && '07_home')
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await p.locator('.builder').waitFor()
  await snap('passbyggaren', tag === 'br' && '08_passbyggaren')
  res.footer = (await p.locator('footer').innerText()).replace(/\s+/g, ' ')
  res.mail = decodeURIComponent((await p.locator('footer a').filter({ hasText: 'Tyck till' }).first().getAttribute('href')) ?? '')
  await p.getByRole('button', { name: '+ Lägg till övning' }).first().click()
  await snap('bibliotek', tag === 'br' && '09_bibliotek')
  await p.locator('.side-panel-slot.is-open .sheet-close').click(); await p.clock.runFor(300)
  globalThis.__step = tag + ":runFromBuilder " + (await p.locator("[role=dialog]:visible").count()) + " dialogs; " + (await p.locator("button:visible").evaluateAll((e) => e.map((x) => x.getAttribute("aria-label") || x.textContent.trim()).slice(-12).join("|")))
  await runBtn(p).click(); await run(p).waitFor()
  res.runFromBuilder = (await run(p).locator('.run-left').count()) ? await left(p) : 'none'
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
  await p.getByRole('button', { name: 'Fler saker med passet' }).click()
  await p.getByRole('button', { name: 'Hallöversikt' }).click(); await p.clock.runFor(500)
  await snap('hall', tag === 'br' && '10_hall')
  const gk = p.getByRole('button', { name: /Golvklart/ }).first()
  if (await gk.count()) { await gk.click(); await snap('golvklart', tag === 'br' && '11_golvklart'); await p.keyboard.press('Escape') }
  // saved pass: Spara utkast + reload → draft continues → Kör passet
  await p.goto(base); await p.clock.runFor(500)
  res.homeAfterSave = await p.getByRole('button').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label') || x.textContent.trim()).join('|'))
  await ctx.close()
  globalThis.__step = tag + ':share'
  const { ctx: c2, page: q } = await open(base, { hash: '#dela=' + T_CHK })
  await q.locator('.share-pass').waitFor()
  res.share = await q.evaluate(() => ({ kvar: document.body.innerText.includes('Kvar:'), runLeft: document.querySelectorAll('.run-left').length }))
  if (tag === 'br') await q.screenshot({ path: `${SS}12_share_page.png` })
  await startShare(q); res.runFromShare = (await run(q).locator('.run-left').count()) ? await left(q) : 'none'
  await run(q).getByRole('button', { name: 'Avsluta' }).click()
  globalThis.__step = tag + ':saveHere'
  await q.locator('.share-actions').getByRole('button', { name: 'Spara på den här enheten' }).click()
  await q.locator('.builder').waitFor()
  res.savedBuilderTitle = await q.evaluate(() => document.body.innerText.includes('S38V checklista') || [...document.querySelectorAll('input')].some((i) => i.value === 'S38V checklista'))
  await q.reload(); await q.clock.runFor(500)
  if (!(await q.locator('.builder').count())) { const c = q.getByRole('button', { name: /Fortsätt|Öppna utkast|utkast/i }).first(); if (await c.count()) await c.click() }
  res.savedAfterReload = await q.evaluate(() => document.body.innerText.includes('S38V checklista') || [...document.querySelectorAll('input')].some((i) => i.value === 'S38V checklista'))
  await runBtn(q).click(); await run(q).waitFor()
  res.runFromSaved = (await run(q).locator('.run-left').count()) ? await left(q) : 'none'
  globalThis.__step = tag + ':paste'
  await c2.close()
  const { ctx: c3, page: r } = await open(base)
  await r.getByRole('button', { name: 'Hämta ett pass' }).click()
  await r.locator('input[type=url], input[type=text], textarea').first().fill(base + '#dela=' + T_CHK)
  await r.getByRole('button', { name: 'Öppna' }).click(); await r.clock.runFor(500)
  res.pasted = (await r.locator('.share-pass').count()) ? 'share' : (await r.locator('.builder').count()) ? 'builder' : 'other'
  await (res.pasted === 'share' ? r.locator('.share-actions') : r).getByRole('button', { name: 'Kör passet, en övning i taget' }).click()
  await run(r).waitFor(); res.runFromPasted = (await run(r).locator('.run-left').count()) ? await left(r) : 'none'
  await c3.close()
  return res
}
await attempt('D', async () => {
  const br = await screens(BR, 'br'), mn = await screens(MAIN, 'main')
  out.notes.screens = { br, main: mn }
  for (const k of ['home', 'passbyggaren', 'bibliotek', 'hall', 'golvklart']) {
    if (!br[k]) { check(`AC14-${k}`, false, 'screen not reached'); continue }
    check(`AC14-${k}`, !br[k].kvar && br[k].runLeft === 0 && br[k].buttons === mn[k].buttons && br[k].text === mn[k].text, `br buttons=${br[k].buttons.split('|').length} main=${mn[k].buttons.split('|').length} textLen ${br[k].text}/${mn[k].text}`)
  }
  check('AC14-share-page', !br.share.kvar && br.share.runLeft === 0, JSON.stringify(br.share))
  check('AC14-entry-builder', /^Kvar: \d+ min$/.test(br.runFromBuilder), br.runFromBuilder)
  check('AC18-footer', br.footer.includes('Träningsplaneraren · Slice 38') && br.mail.includes('Version: Slice 38') && mn.footer.includes('Slice 37'), br.footer)
  check('AC14-entry-share', br.runFromShare === K(4), br.runFromShare)
  check('AC14-entry-saved-pass', br.savedBuilderTitle && br.savedAfterReload && br.runFromSaved === K(4) && mn.runFromSaved === 'none', String(br.runFromSaved) + ' main ' + mn.runFromSaved)
  check('AC14-main-has-no-kvar', mn.runFromBuilder === 'none' && mn.runFromShare === 'none' && mn.runFromPasted === 'none', JSON.stringify([mn.runFromBuilder, mn.runFromShare, mn.runFromPasted]))
  check('AC14-entry-pasted-link', br.runFromPasted === K(4), br.pasted + ' ' + br.runFromPasted)
})

// ---------- E: AC13/AC17 controls & tone parity main vs branch ----------
await attempt('E', async () => {
  const r = {}
  for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
    const { ctx, page: p } = await open(base, { hash: '#dela=' + T_CHK })
    await startShare(p)
    const btns = await run(p).locator('button').evaluateAll((e) => e.map((x) => x.className + ':' + (x.getAttribute('aria-label') || x.textContent.trim()).replace(/\d\d:\d\d/, 'mm:ss')))
    const ps = await run(p).evaluate((x) => [...x.querySelectorAll('[role]')].map((e) => e.getAttribute('role')))
    const O = async () => (await S(p)).osc.filter((o) => !o.buf).length
    await p.clock.runFor(119_000); const before = await O()
    await p.clock.runFor(1_000); const at0 = await O()
    await p.clock.runFor(180_000); const later = await O()
    await nextBtn(p).click(); await nextBtn(p).click(); await p.clock.runFor(60_000)
    const s = await S(p); s.osc = s.osc.filter((o) => !o.buf)
    r[tag] = { btns, ps, before, at0, later, total: s.osc.length, vib: s.vib.length, next: await nextT(p), wl: s.wl }
    await ctx.close()
  }
  out.notes.parity = r
  check('AC13', JSON.stringify(r.br.btns) === JSON.stringify(r.main.btns) && JSON.stringify(r.br.ps) === JSON.stringify(r.main.ps), JSON.stringify(r.br.btns))
  check('AC17-tone-parity', r.br.before === 0 && r.br.at0 === 1 && r.br.later === 1 && r.br.total === 2 && JSON.stringify([r.br.before, r.br.at0, r.br.later, r.br.total, r.br.vib]) === JSON.stringify([r.main.before, r.main.at0, r.main.later, r.main.total, r.main.vib]), JSON.stringify({ br: [r.br.before, r.br.at0, r.br.later, r.br.total, r.br.vib], main: [r.main.before, r.main.at0, r.main.later, r.main.total, r.main.vib] }))
  check('AC17-sista-parity', r.br.next === 'Sista aktiviteten' && r.main.next === r.br.next)
  check('AC17-wakelock-parity', r.br.wl.req === r.main.wl.req && r.br.wl.req === 1, JSON.stringify({ br: r.br.wl, main: r.main.wl }))
})

// ---------- F: strings ----------
await attempt('F', async () => {
  const { ctx, page: p } = await open(BR)
  check('AC18-label', LBL === 'Kvar: {n} min' && readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8').includes(`runLeftLabel: '${LBL}'`) && !/!/.test(LBL), LBL)
  await ctx.close()
})
check('no-page-errors', errs.length === 0, errs.join(' | '))
const pass = out.checks.filter((c) => c.ok).length
console.log(`\nPASS ${pass} / FAIL ${out.checks.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-38-verify-results.json`, JSON.stringify(out, null, 2))
await browser.close()

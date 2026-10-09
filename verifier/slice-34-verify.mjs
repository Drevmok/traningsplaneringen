// Slice 34 — Verifier independent checks (41421ce). 390×844, headless Chromium, Playwright fake clock.
// Real AudioContext wrapped (oscillator + buffer-source .start() counted with timestamps), navigator.vibrate wrapped.
// Usage: BR=http://127.0.0.1:4341/traningsplaneringen/ MAIN=http://127.0.0.1:4342/traningsplaneringen/ node verifier/slice-34-verify.mjs
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const BR = process.env.BR ?? 'http://127.0.0.1:4341/traningsplaneringen/'
const MAIN = process.env.MAIN ?? 'http://127.0.0.1:4342/traningsplaneringen/'
const ROOT = '/workspace/gymnastics-planner'
const SS = '/workspace/screenshots/s34v_'
const { token, titles } = JSON.parse(execFileSync('bun', [`${ROOT}/verifier/slice-34-mktoken.ts`], { encoding: 'utf8' }))
const out = { titles, checks: [], notes: {} }
const check = (id, ok, d = '') => { out.checks.push({ id, ok: !!ok, d: String(d).slice(0, 400) }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${String(d).slice(0, 250)}`) }

const WRAP = () => {
  const L = (window.__s34 = { ctx: 0, osc: [], buf: [], vib: [] })
  const stamp = () => ({ t: Date.now(), h1: document.querySelector('.run-pass h1')?.textContent?.trim() ?? null })
  for (const k of ['AudioContext', 'webkitAudioContext']) {
    const C = window[k]; if (!C) continue
    window[k] = class extends C {
      constructor(...a) { super(...a); L.ctx++ }
      createOscillator() { const n = super.createOscillator(); const s = n.start.bind(n); n.start = (...a) => { L.osc.push(stamp()); return s(...a) }; return n }
      createBufferSource() { const n = super.createBufferSource(); const s = n.start.bind(n); n.start = (...a) => { L.buf.push(stamp()); return s(...a) }; return n }
    }
  }
  if (typeof navigator.vibrate === 'function') {
    const v = navigator.vibrate.bind(navigator)
    Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p) => { L.vib.push({ ...stamp(), p }); try { return v(p) } catch { return true } } })
  }
}
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
async function open(base, { wrap = true, pre = null, clock = true } = {}) {
  const ctx = await browser.newContext(phone)
  if (pre) await ctx.addInitScript(pre)
  if (wrap) await ctx.addInitScript(WRAP)
  const page = await ctx.newPage(); page.setDefaultTimeout(10000)
  const errs = []
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  if (clock) await page.clock.install({ time: new Date('2026-10-09T18:00:00Z') })
  return { ctx, page, errs }
}
const L = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__s34)))
const run = (p) => p.locator('.run-pass')
const h1 = async (p) => (await run(p).locator('h1').innerText()).trim()
const clk = async (p) => (await run(p).locator('.run-clock').innerText()).trim()
const runBtn = (p) => p.getByRole('button', { name: 'Kör passet, en övning i taget' })
const nextBtn = (p) => run(p).getByRole('button', { name: 'Nästa övning' })
const prevBtn = (p) => run(p).getByRole('button', { name: 'Föregående' })
const perStep = (l) => { const m = {}; for (const o of l.osc) m[o.h1] = (m[o.h1] ?? 0) + 1; return m }

// ---------- Run 1: tone counts per step, loop, auto-advance, pause, back-nav ----------
{
  const { ctx, page: p, errs } = await open(BR)
  await p.goto(`${BR}#dela=${token}`)
  await p.getByText('Slice 34 testpass').first().waitFor()
  check('AC16-noctx-on-load', (await L(p)).ctx === 0, 'ctx on share view load = ' + (await L(p)).ctx)
  await runBtn(p).click(); await run(p).waitFor()
  let l = await L(p)
  out.notes.unlock = { ctx: l.ctx, primeBufStarts: l.buf.length }
  const nastaTxt = []
  nastaTxt.push([await h1(p), (await run(p).locator('.run-next').innerText()).trim()])
  await p.screenshot({ path: SS + 'nasta.png' })
  // step 1: reach 0
  await p.clock.runFor(59_000)
  check('S1-no-tone-before-0', (await L(p)).osc.length === 0, await clk(p))
  await p.clock.runFor(2_000)
  l = await L(p); check('S1-one-tone-at-0', l.osc.length === 1 && l.vib.length === 1, JSON.stringify(l.osc) + ' vib ' + JSON.stringify(l.vib))
  await p.screenshot({ path: SS + 'timeup.png' })
  // 2.5 min past 0
  await p.clock.runFor(150_000)
  l = await L(p); check('S1-no-loop-150s', l.osc.length === 1 && l.vib.length === 1, 'osc ' + l.osc.length)
  check('S1-no-auto-advance', (await h1(p)) === titles[0] && (await clk(p)) === '00:00', await h1(p))
  // step 2: pause before 0, advance past remaining, resume, reach 0
  await nextBtn(p).click()
  nastaTxt.push([await h1(p), (await run(p).locator('.run-next').innerText()).trim()])
  check('S2-nav-no-tone', (await L(p)).osc.length === 1)
  await p.clock.runFor(50_000)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(130_000)
  l = await L(p); check('S2-paused-past-remaining-no-tone', l.osc.length === 1 && l.vib.length === 1, 'clock ' + await clk(p))
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(9_000)
  check('S2-resumed-before-0-no-tone', (await L(p)).osc.length === 1, await clk(p))
  await p.clock.runFor(2_000)
  l = await L(p); check('S2-resumed-one-tone-at-0', l.osc.length === 2 && l.vib.length === 2, await clk(p))
  await p.clock.runFor(150_000)
  check('S2-no-loop-150s', (await L(p)).osc.length === 2 && (await h1(p)) === titles[1])
  // back to finished step 1
  await prevBtn(p).click()
  const backClock = await clk(p)
  await p.clock.runFor(1_000)
  l = await L(p)
  out.notes.backNav = { clockOnReturn: backClock, toneImmediately: l.osc.length - 2 }
  check('Back-to-finished-step-no-immediate-tone', l.osc.length === 2, 'clock on return ' + backClock)
  await p.clock.runFor(60_000)
  l = await L(p)
  out.notes.backNav.toneAfterRerunTo0 = l.osc.length - 2
  await p.clock.runFor(120_000)
  out.notes.backNav.after2minMore = (await L(p)).osc.length - 2
  check('Back-rerun-at-most-one', (await L(p)).osc.length === 3, JSON.stringify(out.notes.backNav))
  // forward through to step 3 (0 min) and 4
  await nextBtn(p).click(); await nextBtn(p).click()
  nastaTxt.push([await h1(p), (await run(p).locator('.run-next').innerText()).trim()])
  await p.clock.runFor(130_000)
  check('S3-0min-no-tone', (await L(p)).osc.length === 3)
  await nextBtn(p).click()
  nastaTxt.push([await h1(p), (await run(p).locator('.run-next').innerText()).trim()])
  await p.screenshot({ path: SS + 'sista.png' })
  await p.clock.runFor(61_000)
  l = await L(p); check('S4-one-tone-at-0', l.osc.length === 4)
  await p.clock.runFor(150_000)
  check('S4-no-loop', (await L(p)).osc.length === 4 && (await h1(p)) === titles[3])
  // placement
  out.notes.placement = await run(p).evaluate((r) => [...r.children].map((c) => (c.className || c.tagName).toString().split(' ')[0]))
  out.notes.nextStyle = await run(p).locator('.run-next').evaluate((e) => { const c = getComputedStyle(e); return { color: c.color, size: c.fontSize, ws: c.whiteSpace, to: c.textOverflow, role: e.getAttribute('role'), live: e.getAttribute('aria-live') } })
  out.notes.sw = await p.evaluate(() => document.documentElement.scrollWidth)
  out.notes.nasta = nastaTxt
  out.notes.runDom = await run(p).evaluate((r) => [...r.querySelectorAll('button,input,select,textarea,[role=switch],[role=checkbox]')].map((b) => `${b.tagName}:${b.getAttribute('aria-label') ?? b.textContent.trim()}`.replace(/\d\d:\d\d/, 'MM:SS')))
  // re-enter Kör passet after Avsluta
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
  await p.clock.runFor(70_000)
  const before = (await L(p)).osc.length
  await runBtn(p).click(); await run(p).waitFor()
  await p.clock.runFor(1_000)
  const im = (await L(p)).osc.length - before
  await p.clock.runFor(60_000)
  const at0 = (await L(p)).osc.length - before
  await p.clock.runFor(150_000)
  const later = (await L(p)).osc.length - before
  out.notes.reenter = { immediate: im, at0, after150s: later, ctxTotal: (await L(p)).ctx }
  check('Reenter-run-once', im === 0 && at0 === 1 && later === 1 && (await L(p)).ctx === 1, JSON.stringify(out.notes.reenter))
  out.notes.final = await L(p)
  out.notes.perStep = perStep(out.notes.final)
  check('Run1-no-errors', errs.length === 0, errs.join(' | '))
  await ctx.close()
}

// ---------- Missing APIs ----------
const variants = {
  noAudio: () => { delete window.AudioContext; delete window.webkitAudioContext },
  noVibrate: () => { delete Navigator.prototype.vibrate },
  none: () => { delete window.AudioContext; delete window.webkitAudioContext; delete Navigator.prototype.vibrate },
}
out.notes.missing = {}
for (const [name, pre] of Object.entries(variants)) {
  const { ctx, page: p, errs } = await open(BR, { wrap: name === 'noVibrate', pre })
  await p.goto(`${BR}#dela=${token}`)
  await p.getByText('Slice 34 testpass').first().waitFor()
  const api = await p.evaluate(() => ({ AC: typeof window.AudioContext, wAC: typeof window.webkitAudioContext, vib: typeof navigator.vibrate }))
  await runBtn(p).click(); await run(p).waitFor()
  const c0 = await clk(p); await p.clock.runFor(30_000); const c1 = await clk(p)
  await p.clock.runFor(31_000); const c2 = await clk(p)
  const up = await run(p).getByText('Tiden är ute').count()
  await p.clock.runFor(60_000)
  await nextBtn(p).click(); const c3 = await clk(p); await p.clock.runFor(5_000); const c4 = await clk(p)
  const r = { api, clocks: [c0, c1, c2, c3, c4], timeUp: up, buttons: await run(p).locator('button').count(), errs, sig: name === 'noVibrate' ? await L(p) : null }
  out.notes.missing[name] = r
  check('Missing-' + name, errs.length === 0 && c0 === '01:00' && c1 === '00:30' && c2 === '00:00' && up === 1 && c3 === '01:00' && c4 === '00:55' && r.buttons === 4, JSON.stringify({ ...r, sig: r.sig && { osc: r.sig.osc.length, vib: r.sig.vib.length } }))
  await ctx.close()
}

// ---------- main vs branch: surfaces ----------
async function surfaces(base, tag) {
  const { ctx, page: p, errs } = await open(base, { wrap: true, clock: false })
  const ctrl = (sel = 'body') => p.locator(sel).evaluate((r) => [...r.querySelectorAll('button,input,select,textarea,[role=switch],[role=checkbox],[role=tab]')].filter((e) => e.offsetParent || e.getClientRects().length).map((b) => `${b.tagName}:${(b.getAttribute('aria-label') ?? b.textContent).trim().replace(/\s+/g, ' ').slice(0, 60)}`))
  const res = {}
  await p.goto(base); await p.waitForLoadState('networkidle')
  res.home = await ctrl(); await p.screenshot({ path: `${SS}${tag}_home.png`, fullPage: true })
  res.footer = (await p.locator('footer').first().innerText().catch(() => '')).replace(/\s+/g, ' ')
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await p.waitForTimeout(800)
  res.builder = await ctrl(); await p.screenshot({ path: `${SS}${tag}_planera.png`, fullPage: true })
  res.footerBuilder = (await p.locator('footer.app-footer').innerText().catch(() => '')).replace(/\s+/g, ' ')
  res.ctxBeforeRun = (await L(p)).ctx
  await runBtn(p).click(); await run(p).waitFor()
  res.run = await ctrl('.run-pass')
  res.runText = (await run(p).innerText()).replace(/\d\d:\d\d/g, 'MM:SS').replace(/\s+/g, ' ')
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
  res.ctxOutsideRunBefore = (await L(p)).ctx
  try {
    await p.getByRole('button', { name: /^\+ Lägg till övning/ }).first().click(); await p.waitForTimeout(700)
    res.bibliotek = await ctrl(); await p.screenshot({ path: `${SS}${tag}_bibliotek.png`, fullPage: true })
  } catch (e) { res.bibliotek = 'n/a: ' + e.message.split('\n')[0] }
  try {
    await p.goto(base); await p.waitForTimeout(800)
    res.homeDraft = await ctrl()
    await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.waitForTimeout(800)
    res.menu = await (async () => { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.waitForTimeout(400); return ctrl('.more-menu') })()
    await p.locator('.more-menu').getByText('Hallöversikt', { exact: true }).first().click(); await p.waitForTimeout(800)
    res.hall = await ctrl(); await p.screenshot({ path: `${SS}${tag}_hall.png`, fullPage: true })
    await p.getByRole('button', { name: /Golvklart/ }).first().click(); await p.waitForTimeout(800)
    res.golvklart = await ctrl(); await p.screenshot({ path: `${SS}${tag}_golvklart.png`, fullPage: true })
  } catch (e) { res.hall ??= 'n/a: ' + e.message.split('\n')[0]; res.golvklart ??= 'n/a: ' + e.message.split('\n')[0] }
  res.ctxOutsideRunBefore = (await L(p)).ctx
  res.ctxOutsideRun = res.ctxBeforeRun
  await p.goto(`${base}#dela=${token}`); await p.reload(); await p.getByText('Slice 34 testpass').first().waitFor()
  res.share = await ctrl(); await p.screenshot({ path: `${SS}${tag}_dela.png`, fullPage: true })
  res.ctxShare = (await L(p)).ctx
  res.errs = errs
  await ctx.close(); return res
}
const sm = await surfaces(MAIN, 'main'), sb = await surfaces(BR, 'branch')
out.notes.surfaces = { main: sm, branch: sb }
for (const k of ['home', 'builder', 'homeDraft', 'menu', 'bibliotek', 'hall', 'golvklart', 'share', 'run'])
  check('Same-controls-' + k, !String(sb[k]).startsWith('n/a') && JSON.stringify(sm[k]) === JSON.stringify(sb[k]), JSON.stringify(sm[k]) === JSON.stringify(sb[k]) ? `${Array.isArray(sb[k]) ? sb[k].length : sb[k]} controls` : `main ${JSON.stringify(sm[k])} / branch ${JSON.stringify(sb[k])}`)
check('Footer-branch', sb.footerBuilder.includes('Träningsplaneraren · Slice 34'), sb.footerBuilder + ' || home: ' + sb.footer)
check('No-ctx-outside-run', sb.ctxOutsideRun === 0 && sb.ctxShare === 0, `${sb.ctxOutsideRun}/${sb.ctxShare}`)
check('Surfaces-no-errors', sb.errs.length === 0 && sm.errs.length === 0, 'branch ' + sb.errs.join('|') + ' main ' + sm.errs.join('|'))
out.notes.runTextDiff = { main: sm.runText, branch: sb.runText }
writeFileSync('/tmp/s34v_results.json', JSON.stringify(out, null, 2))
console.log(`\nPASS ${out.checks.filter((c) => c.ok).length} / FAIL ${out.checks.filter((c) => !c.ok).length}`)
await browser.close()

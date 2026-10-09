// Slice 34 — Builder self-smoke: Kör passet tone at 0 + «Nästa: …» line, 390×844.
// Plain build preview on :4197 (S34_URL). AudioContext + navigator.vibrate are replaced by spies
// (init script) and time runs on Playwright's fake clock, so "once, never loops, never advances" is counted.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const URL0 = process.env.S34_URL ?? 'http://127.0.0.1:4197/traningsplaneringen/'
const ROOT = '/workspace/gymnastics-planner'
const { token, titles } = JSON.parse(execFileSync('bun', [`${ROOT}/verifier/slice-34-mktoken.ts`], { encoding: 'utf8' }))
const MD = readFileSync(`${ROOT}/slice-34/content/microcopy.sv.md`, 'utf8')
const md = (k) => MD.match(new RegExp('^\\| `' + k + '`(?: \\*\\*[^*]+\\*\\*)? \\| ([^|]+?) \\|', 'm'))[1].trim()
const S = { next: md('runNextLabel'), last: md('runLastActivity'), footer: md('footerSliceLabel') }

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`)
}
async function attempt(id, fn) {
  try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) }
}

const SPY = () => {
  const sig = (window.__sig = { ctx: 0, prime: 0, resume: 0, osc: 0, start: 0, stops: [], loops: 0, vib: [] })
  class FakeCtx {
    constructor() { sig.ctx++; this.state = 'suspended'; this.destination = {} }
    get currentTime() { return performance.now() / 1000 }
    resume() { sig.resume++; this.state = 'running'; return Promise.resolve() }
    createBuffer() { return {} }
    createBufferSource() { return { connect() {}, start() { sig.prime++ } } }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (d) => d, disconnect() {} } }
    createOscillator() {
      sig.osc++
      const o = { type: '', frequency: { value: 0 }, onended: null, connect: (g) => g, disconnect() {}, start() { sig.start++ }, stop(t) { sig.stops.push(t) } }
      Object.defineProperty(o, 'loop', { set(v) { if (v) sig.loops++ }, get() { return false } })
      return o
    }
  }
  window.AudioContext = FakeCtx
  window.webkitAudioContext = FakeCtx
  Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p) => { sig.vib.push(p); return true } })
}

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const errors = []
async function open(spy = true) {
  const ctx = await browser.newContext(phone)
  if (spy) await ctx.addInitScript(SPY)
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.clock.install({ time: new Date('2026-10-09T18:00:00Z') })
  return { ctx, page }
}
const sig = (p) => p.evaluate(() => ({ ...window.__sig }))
const shot = (p, n) => p.screenshot({ path: `/workspace/screenshots/slice34_${n}.png` })
const run = (p) => p.locator('.run-pass')
const title = async (p) => (await run(p).locator('h1').innerText()).trim()
const nextLine = async (p) => (await run(p).locator('.run-next').innerText()).trim()
const runBtn = (p) => p.getByRole('button', { name: 'Kör passet, en övning i taget' })

let A
await attempt('A', async () => {
  A = await open()
  const p = A.page
  await p.goto(`${URL0}#dela=${token}`)
  await p.getByText('Slice 34 testpass').first().waitFor()
  check('AC16a', 'No AudioContext created on load / share view', (await sig(p)).ctx === 0)
  await runBtn(p).click()
  await run(p).waitFor()
  let s = await sig(p)
  check('AC6-local', 'Kör passet tap creates + resumes the AudioContext and plays the silent prime inside the tap', s.ctx === 1 && s.prime === 1 && s.resume >= 1, JSON.stringify(s))
  check('AC11a', 'Step 1: «Nästa: <step 2 title>»', (await title(p)) === titles[0] && (await nextLine(p)) === S.next.replace('{title}', titles[1]), await nextLine(p))
  check('AC11b', 'Nästa line is plain text (no role / aria-live)', (await run(p).locator('.run-next').evaluate((e) => !e.getAttribute('role') && !e.getAttribute('aria-live'))))
  await shot(p, 'step1_running')
  await p.clock.runFor(58_000)
  check('AC1a', 'No tone before 0', (await sig(p)).osc === 0)
  await p.clock.runFor(3_000)
  s = await sig(p)
  check('AC1b', 'At 00:00: exactly one tone (one oscillator, started once, stop scheduled ~0.3 s later)', s.osc === 1 && s.start === 1 && s.stops.length === 1, JSON.stringify(s))
  check('AC8-sim', 'navigator.vibrate(200) called once with the tone', JSON.stringify(s.vib) === '[200]')
  check('AC3', 'No auto-advance: same step, «Tiden är ute» shown, clock 00:00', (await title(p)) === titles[0] && (await run(p).getByText('Tiden är ute').count()) === 1 && (await run(p).locator('.run-clock').innerText()) === '00:00')
  const order = await run(p).evaluate((r) => [...r.children].map((c) => c.className.split(' ')[0] || c.tagName))
  const iClock = order.indexOf('run-clock'), iUp = order.findIndex((c) => c === 'run-status'), iNext = order.indexOf('run-next'), iScript = order.indexOf('run-script')
  check('C-placement', 'Order: clock → «Tiden är ute» → Nästa line → script', iClock < iUp && iUp < iNext && iNext < iScript, order.join(' > '))
  await shot(p, 'step1_timeup_next')
  await p.clock.runFor(35_000)
  s = await sig(p)
  check('AC2', 'Still one tone after 35 s more at 00:00; no loop ever set; step unchanged', s.osc === 1 && s.loops === 0 && s.vib.length === 1 && (await title(p)) === titles[0])
  // step 2: pause before 0, resume → once; pause after 0 → no second
  await run(p).getByRole('button', { name: 'Nästa övning' }).click()
  check('AC5a', 'Manual Nästa övning: no tone', (await sig(p)).osc === 1)
  check('AC11c', 'Block boundary: last warm-up step shows the first Teknik step', (await title(p)) === titles[1] && (await nextLine(p)) === S.next.replace('{title}', titles[2]), await nextLine(p))
  await p.clock.runFor(55_000)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(30_000)
  check('AC4a', 'Paused at ~00:05: no tone while paused', (await sig(p)).osc === 1 && (await run(p).getByText('Pausad').count()) === 1)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(4_000)
  check('AC4b', 'Resumed: no tone before 0', (await sig(p)).osc === 1)
  await p.clock.runFor(2_000)
  check('AC4c', 'Resumed → exactly one tone at 0', (await sig(p)).osc === 2)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(3_000)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(10_000)
  check('AC4d', 'Pause after 0 + resume → no second tone', (await sig(p)).osc === 2)
  // step 3: 0-minute step
  await run(p).getByRole('button', { name: 'Nästa övning' }).click()
  await p.clock.runFor(5_000)
  check('AC5b', '0-minute step: no tone on open or after', (await sig(p)).osc === 2 && (await title(p)) === titles[2])
  check('AC11d', 'Step 3 → «Nästa: <step 4 title>»', (await nextLine(p)) === S.next.replace('{title}', titles[3]))
  // step 4: last
  await run(p).getByRole('button', { name: 'Nästa övning' }).click()
  check('AC12', 'Last step: «Sista aktiviteten»; nav shows «Sista övningen» (disabled)', (await nextLine(p)) === S.last && (await run(p).getByRole('button', { name: 'Sista övningen' }).isDisabled()))
  await shot(p, 'step4_last')
  await run(p).getByRole('button', { name: 'Föregående' }).click()
  await p.keyboard.press('ArrowRight')
  await p.keyboard.press('ArrowLeft')
  await p.keyboard.press('ArrowRight')
  check('AC5c', 'Föregående + arrow keys: no tone', (await sig(p)).osc === 2)
  // AC 13 / 14
  const btns = await run(p).locator('button').allInnerTexts()
  check('AC14', 'Overlay controls unchanged: Avsluta, clock, Föregående, Nästa/Sista övningen only', btns.length === 4, btns.join(' | '))
  const lay = await run(p).evaluate((r) => {
    const n = r.querySelector('.run-next')
    n.textContent = 'Nästa: ' + 'Mycket lång övningstitel som aldrig tar slut '.repeat(4)
    const cs = getComputedStyle(n)
    const b = n.getBoundingClientRect(), c = r.querySelector('.run-clock').getBoundingClientRect(), nav = r.querySelector('.run-nav').getBoundingClientRect()
    return { ws: cs.whiteSpace, to: cs.textOverflow, oneLine: b.height < parseFloat(cs.lineHeight || '24') * 1.6 || b.height < 30, overflowing: n.scrollWidth > n.clientWidth, sw: document.documentElement.scrollWidth, overlapClock: b.top < c.bottom - 1, overlapNav: b.bottom > nav.top + 1, right: b.right }
  })
  check('AC13', 'Long title: one line, ellipsis, no horizontal scroll, no overlap with clock or nav', lay.ws === 'nowrap' && lay.to === 'ellipsis' && lay.oneLine && lay.overflowing && lay.sw <= 390 && !lay.overlapClock && !lay.overlapNav && lay.right <= 390, JSON.stringify(lay))
  await shot(p, 'long_title_ellipsis')
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
  await p.clock.runFor(70_000)
  check('AC5d', 'Avsluta: no tone (also not later)', (await sig(p)).osc === 2 && (await run(p).count()) === 0)
  // AC 10: background past the deadline (timers frozen, wall clock jumps) → at most one tone
  await runBtn(p).click()
  await run(p).waitFor()
  await p.clock.setSystemTime(new Date(Date.now() + 10 * 60_000))
  await p.clock.runFor(400)
  await p.clock.runFor(5_000)
  const s10 = await sig(p)
  check('AC10-sim', 'Wall clock jumps 10 min past the deadline (backgrounded) → exactly one tone on return', s10.osc === 3 && s10.ctx === 1, JSON.stringify({ osc: s10.osc, ctx: s10.ctx }))
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
})

await attempt('B', async () => {
  const { ctx, page: p } = await open()
  await p.goto(URL0)
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click()
  await wz.getByRole('button', { name: 'Skapa pass' }).click()
  const f = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('AC20a', 'Footer «Träningsplaneraren · Slice 34»', f.startsWith(S.footer), f)
  check('AC16b', 'Home → Planera pass → Passbyggaren: no AudioContext', (await sig(p)).ctx === 0)
  await shot(p, 'builder')
  await runBtn(p).click()
  await run(p).waitFor()
  check('AC6b-local', 'Passbyggaren Kör passet tap creates + resumes the context', (await sig(p)).ctx === 1 && (await sig(p)).resume >= 1)
  check('AC19a', 'Clock starts automatically as before (counts down)', await (async () => { const a = await run(p).locator('.run-clock').innerText(); await p.clock.runFor(3_000); return a !== (await run(p).locator('.run-clock').innerText()) })())
  await ctx.close()
})

await attempt('C', async () => {
  // no AudioContext, no vibrate (iPhone-like / old browser): nothing breaks
  const { ctx, page: p } = await open(false)
  await ctx.addInitScript(() => { delete window.AudioContext; delete window.webkitAudioContext; delete Navigator.prototype.vibrate })
  await p.goto(`${URL0}#dela=${token}`)
  await p.reload()
  await runBtn(p).click()
  await run(p).waitFor()
  await p.clock.runFor(62_000)
  check('AC9-sim', 'No AudioContext / no vibrate: time-up still shows, no error, no extra UI', (await run(p).getByText('Tiden är ute').count()) === 1 && (await run(p).locator('button').count()) === 4)
  await ctx.close()
})

const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
check('AC20b', 'Strings verbatim in blockMeta.ts; no «!»', meta.includes(`runNextLabel: '${S.next}'`) && meta.includes(`runLastActivity: '${S.last}'`) && meta.includes(`footerSliceLabel: '${S.footer}'`) && !/[!]/.test(S.next + S.last + S.footer))
check('E', 'No page or console errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-34-smoke-results.json`, JSON.stringify({ results }, null, 2))
await browser.close()

// Slice 38 — Builder self-smoke: Kör passet «Kvar: X min», 390×844, Playwright fake clock.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const URL0 = process.env.S38_URL ?? 'http://127.0.0.1:4198/traningsplaneringen/'
const ROOT = process.env.S38_ROOT ?? '/workspace/gp-s38'
const { token, titles } = JSON.parse(execFileSync('bun', [`${ROOT}/verifier/slice-38-mktoken.ts`], { encoding: 'utf8' }))
const MD = readFileSync(`${ROOT}/slice-38/content/microcopy.sv.md`, 'utf8')
const md = (k) => MD.match(new RegExp('^\\| `' + k + '`(?: \\*\\*[^*]+\\*\\*)?(?: \\([^)]*\\))? \\| ([^|]+?) \\|', 'm'))[1].trim()
const LBL = md('runLeftLabel'), FOOT = md('footerSliceLabel')
const K = (n) => LBL.replace('{n}', String(n))

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`)
}
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const errors = []
async function open() {
  const ctx = await browser.newContext(phone)
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.clock.install({ time: new Date('2026-10-13T16:00:00Z') })
  return { ctx, page }
}
const shot = (p, n) => p.screenshot({ path: `/workspace/screenshots/slice38_${n}.png` })
const run = (p) => p.locator('.run-pass')
const left = async (p) => (await run(p).locator('.run-left').innerText()).trim()
const clock = async (p) => (await run(p).locator('.run-clock').innerText()).trim()
const next = (p) => run(p).getByRole('button', { name: 'Nästa övning' })
const prev = (p) => run(p).getByRole('button', { name: 'Föregående' })
const runBtn = (p) => p.getByRole('button', { name: 'Kör passet, en övning i taget' })

await attempt('A', async () => {
  const { page: p } = await open()
  await p.goto(`${URL0}#dela=${token}`)
  await p.getByText('Slice 38 testpass').first().waitFor()
  await runBtn(p).click()
  await run(p).waitFor()
  const order = await run(p).evaluate((r) => [...r.children].map((c) => c.className.split(' ')[0] || c.tagName))
  check('AC1', 'Under the timer, below «Nästa: …»: «Kvar: 4 min»', (await left(p)) === K(4) && order.indexOf('run-next') + 1 === order.indexOf('run-left') && order.indexOf('run-clock') < order.indexOf('run-next'), `${await left(p)} · ${order.join(' > ')}`)
  const st = await run(p).locator('.run-left').evaluate((e) => ({ role: e.getAttribute('role'), live: e.getAttribute('aria-live'), al: e.getAttribute('aria-label'), color: getComputedStyle(e).color, fs: getComputedStyle(e).fontSize }))
  check('AC12', 'Plain text: no role / aria-live / aria-label', !st.role && !st.live && !st.al, JSON.stringify(st))
  check('muted', 'Muted colour #a8a29e, 0.9rem', st.color === 'rgb(168, 162, 158)' && st.fs === '14.4px', JSON.stringify(st))
  const lbl0 = await run(p).locator('.run-clock').getAttribute('aria-label')
  await shot(p, '01_start_kvar4')
  await p.clock.runFor(30_000)
  check('AC2a', 'Step 1 at 01:30 → «Kvar: 4 min»', (await clock(p)) === '01:30' && (await left(p)) === K(4), `${await clock(p)} ${await left(p)}`)
  await p.clock.runFor(31_000)
  check('AC2b/AC4', 'Step 1 at 00:59 → «Kvar: 3 min» (live, no tap)', (await clock(p)) === '00:59' && (await left(p)) === K(3), `${await clock(p)} ${await left(p)}`)
  check('AC12b', 'Clock aria-label format unchanged (time first)', /^\d\d:\d\d\. /.test(await run(p).locator('.run-clock').getAttribute('aria-label')) && /^02:00\. /.test(lbl0), lbl0)
  // AC6 pause
  await run(p).locator('.run-clock').click()
  const c0 = await clock(p)
  await p.clock.runFor(70_000)
  check('AC6a', 'Paused: line frozen with the timer', (await left(p)) === K(3) && (await clock(p)) === c0 && (await run(p).getByText('Pausad').count()) === 1)
  await run(p).locator('.run-clock').click()
  await p.clock.runFor(1_000)
  check('AC6b', 'Resume continues from same value', (await left(p)) === K(3) && (await clock(p)) === '00:58', await clock(p))
  // AC7 earlier step at 0
  await p.clock.runFor(60_000)
  check('AC7a', 'Earlier step at 00:00 → later steps only («Kvar: 2 min»)', (await clock(p)) === '00:00' && (await left(p)) === K(2))
  await p.clock.runFor(30_000)
  check('AC7b', '…and stays still', (await left(p)) === K(2))
  await shot(p, '02_step1_timeup_kvar2')
  // AC5 nav
  await next(p).click()
  check('AC5a', 'Nästa övning → recalculates at once («Kvar: 2 min»)', (await left(p)) === K(2))
  await p.keyboard.press('ArrowRight')
  check('AC5b', 'ArrowRight → last step «Kvar: 1 min»', (await left(p)) === K(1))
  check('AC10', 'Last step: «Sista aktiviteten» and «Kvar: 1 min» both show', (await run(p).locator('.run-next').innerText()).trim() === 'Sista aktiviteten' && (await left(p)) === K(1))
  await shot(p, '03_last_step')
  await p.keyboard.press('ArrowLeft')
  check('AC5c', 'ArrowLeft → back to 2', (await left(p)) === K(2))
  await prev(p).click()
  check('AC5d', 'Föregående → raises again to 4 (step clock restarts)', (await left(p)) === K(4) && (await clock(p)) === '02:00')
  // AC3 + AC8 last step
  await next(p).click(); await next(p).click()
  await p.clock.runFor(59_000)
  check('AC3a', '1 s left in total → «Kvar: 1 min»', (await clock(p)) === '00:01' && (await left(p)) === K(1))
  const colorBefore = await run(p).locator('.run-left').evaluate((e) => getComputedStyle(e).color)
  await p.clock.runFor(2_000)
  check('AC3b/AC8', 'Last step 00:00 → «Kvar: 0 min», still visible, same colour', (await clock(p)) === '00:00' && (await left(p)) === K(0) && (await run(p).locator('.run-left').isVisible()) && (await run(p).locator('.run-left').evaluate((e) => getComputedStyle(e).color)) === colorBefore)
  await p.clock.runFor(60_000)
  check('AC8b', 'Stays «Kvar: 0 min» over time; no new banners', (await left(p)) === K(0) && (await run(p).locator('[role="alert"]').count()) === 0)
  await shot(p, '04_last_over_kvar0')
  const btns = await run(p).locator('button').allInnerTexts()
  check('AC13', 'No new controls: 4 buttons as Slice 34', btns.length === 4, btns.join(' | '))
  // AC9 + AC11 layout with long title + long text
  await prev(p).click()
  const lay = await run(p).evaluate((r) => {
    const n = r.querySelector('.run-next'), l = r.querySelector('.run-left'), s = r.querySelector('.run-script'), nav = r.querySelector('.run-nav')
    n.textContent = 'Nästa: ' + 'Mycket lång övningstitel som aldrig tar slut '.repeat(4)
    const extra = document.createElement('p'); extra.className = 'run-safety'
    extra.textContent = 'Säkerhet: ' + 'Lång säkerhetstext om landning, passning och mattor som fortsätter länge. '.repeat(30)
    s.appendChild(extra)
    const bn = n.getBoundingClientRect(), bl = l.getBoundingClientRect(), bv = nav.getBoundingClientRect()
    return { nBottom: bn.bottom, lTop: bl.top, lH: bl.height, lBottom: bl.bottom, sTop: s.getBoundingClientRect().top, navTop: bv.top, navBottom: bv.bottom, vh: innerHeight, scrolls: s.scrollHeight > s.clientHeight, pageH: document.documentElement.scrollHeight, overlayScroll: r.scrollHeight - r.clientHeight, sw: document.documentElement.scrollWidth, ellipsis: getComputedStyle(n).textOverflow }
  })
  check('AC9', 'Long «Nästa» (ellipsis) and «Kvar» are separate single lines, no overlap, no horizontal scroll', lay.lTop >= lay.nBottom - 0.5 && lay.lH < 26 && lay.lBottom <= lay.sTop + 0.5 && lay.sw <= 390 && lay.ellipsis === 'ellipsis', JSON.stringify(lay))
  check('AC11', 'Long text: nav buttons stay on screen; only .run-script scrolls', lay.navBottom <= lay.vh && lay.navTop > lay.lBottom && lay.scrolls && lay.overlayScroll <= 0, JSON.stringify(lay))
  await shot(p, '05_long_text_nav_visible')
  await run(p).getByRole('button', { name: 'Avsluta' }).click()
})

await attempt('B', async () => {
  const { ctx, page: p } = await open()
  await p.goto(URL0)
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click(); await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click(); await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await p.locator('.builder').waitFor()
  const f = (await p.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  const href = await p.locator('footer a.footer-feedback').getAttribute('href')
  check('AC18a', `Footer «${FOOT}»; mail «Version: Slice 38»`, f.includes(FOOT) && decodeURIComponent(href.split('body=')[1]).includes('Version: Slice 38'), f)
  check('AC14', 'Passbyggaren has no «Kvar:» line', (await p.locator('.run-left').count()) === 0 && !(await p.locator('body').innerText()).includes('Kvar: '))
  await shot(p, '06_builder_footer')
  await runBtn(p).click(); await run(p).waitFor()
  check('AC17', 'Builder Kör passet: «Nästa: …» and «Kvar» both present; clock runs', (await run(p).locator('.run-next').innerText()).startsWith('Nästa: ') && /^Kvar: \d+ min$/.test(await left(p)))
  await ctx.close()
})

const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
check('AC18b', 'runLeftLabel verbatim in blockMeta.ts; no «!»', meta.includes(`runLeftLabel: '${LBL}'`) && LBL === 'Kvar: {n} min' && !/!/.test(LBL + FOOT))
check('E', 'No page or console errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-38-builder-smoke-results.json`, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
await browser.close()
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

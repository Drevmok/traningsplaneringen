// Slice 46 re-verify (eecf677): M1 sheet on every step × viewport; double scroll / jumpy chip list; layout vs fe5e51e; m2 landmarks.
const { chromium } = await import(process.env.PW_CORE ?? '/workspace/s46v/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync } from 'node:fs'
const BR = 'http://127.0.0.1:57841/traningsplaneringen/', FE = 'http://127.0.0.1:57844/traningsplaneringen/', MAIN = 'http://127.0.0.1:57842/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = `${ROOT}/verifier/slice-46-screenshots-r/s46r_m1_`, OUT = `${ROOT}/verifier/slice-46-reverify-checks/m1-results.json`
const STORA = 'Gymmix – Stora hallen', GROP = 'Gymmix – Grophallen', DK = 'gymnastics-planner-draft-v1'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const results = [], notes = {}
const check = (id, name, ok, d = '') => { results.push({ id, name, ok: !!ok, detail: String(d).slice(0, 1500) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name} — ${String(d).slice(0, 600)}`) }
const VPS = { land: { width: 844, height: 390 }, '390': { width: 390, height: 844 }, '320x568': { width: 320, height: 568 }, '320x844': { width: 320, height: 844 }, desk: { width: 1280, height: 800 } }
async function pg(base, vp, touch = true, ls = {}) { const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch && vp.width < 900 }); const p = await ctx.newPage(); p.setDefaultTimeout(8000); await p.goto(base); await p.evaluate((ls) => { localStorage.clear(); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v) }, ls); await p.reload(); await p.locator('.home').waitFor(); await p.waitForTimeout(300); return p }
const S = (p) => p.locator('.home-wizard-sheet')
const opt = (p, n) => S(p).getByRole('option', { name: n, exact: true })
async function tap(p, n) { await opt(p, n).click(); await p.waitForTimeout(500) }
async function open(p) { await p.getByRole('button', { name: 'Planera pass', exact: true }).click(); await S(p).waitFor(); await p.waitForTimeout(300) }
const alt = (p, n) => S(p).getByRole('button', { name: n, exact: true })
const STEPS = {
  'Ålder': async () => {}, 'Nivå': async (p) => { await opt(p, 'Nivå').click(); await p.waitForTimeout(450) },
  'Fokus': async (p) => { await tap(p, '7–9 år') }, 'Hall': async (p) => { await tap(p, '7–9 år'); await tap(p, 'Trampett') },
  'Passlängd': async (p) => { await tap(p, '7–9 år'); await tap(p, 'Trampett'); await tap(p, GROP) },
  'Tomt-Hall': async (p) => { await alt(p, 'Tomt pass').click(); await p.waitForTimeout(450) }, 'Tomt-Passlängd': async (p) => { await alt(p, 'Tomt pass').click(); await p.waitForTimeout(450); await tap(p, GROP) },
  'Mall-Hall': async (p) => { await alt(p, 'Starta från mall').click(); await p.waitForTimeout(450) }, 'Mall-lista': async (p) => { await alt(p, 'Starta från mall').click(); await p.waitForTimeout(450); await tap(p, GROP) },
}
// geometry of the sheet + scrollers + action buttons (no scrolling)
const geo = (p) => p.evaluate(() => { const s = document.querySelector('.home-wizard-sheet'); const r = (e) => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] }
  const scrollers = [s, ...s.querySelectorAll('*')].filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1).map((e) => `${(e.className || '').toString().split(' ').slice(0, 2).join('.')}:${e.scrollHeight}/${e.clientHeight}`)
  const btn = (t) => [...s.querySelectorAll('button')].find((x) => x.textContent.trim() === t)
  return { sheet: r(s), sheetScroll: [s.scrollHeight, s.clientHeight, s.scrollTop], scrollers, cancel: r(btn('Avbryt')), back: r(btn('Tillbaka')), chips: [...s.querySelectorAll('[role=option]')].slice(0, 6).map(r), alt: [...s.querySelectorAll('.home-wizard-alt button')].map(r), heading: s.querySelector('h2')?.textContent.trim(), vh: innerHeight, docScroll: document.scrollingElement.scrollTop } })
// hit-test a button after scrolling it into view
const hit = (p, t) => p.evaluate((t) => { const s = document.querySelector('.home-wizard-sheet'); const e = [...s.querySelectorAll('button')].find((x) => x.textContent.trim() === t); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); const x = q.left + q.width / 2, y = q.top + q.height / 2; const at = document.elementFromPoint(x, y); return { y: [Math.round(q.top), Math.round(q.bottom)], inView: q.top >= 0 && q.bottom <= innerHeight, hit: at === e || e.contains(at) } }, t)

// ── M1: every step × viewport on eecf677
const m1 = {}
for (const [vk, vp] of Object.entries(VPS)) for (const [sk, go] of Object.entries(STEPS)) {
  const p = await pg(BR, vp, vk !== 'desk'); await open(p); await go(p)
  const g = await geo(p); if (vk === 'land' && ['Ålder', 'Nivå', 'Mall-lista'].includes(sk)) await p.screenshot({ path: `${SS}${vk}_${sk}_top.png` })
  const hb = g.back ? await hit(p, 'Tillbaka') : null; const hc = await hit(p, 'Avbryt')
  if (vk === 'land' && ['Ålder', 'Nivå', 'Mall-lista'].includes(sk)) await p.screenshot({ path: `${SS}${vk}_${sk}_scrolled.png` })
  const before = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])))
  await S(p).locator('.home-wizard-cancel').click({ timeout: 3000, trial: false }).catch((e) => null); await p.waitForTimeout(350)
  const closed = (await S(p).count()) === 0; const after = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])))
  m1[`${vk}|${sk}`] = { ...g, hitBack: hb, hitCancel: hc, closed, storageSame: before === after }
  await p.context().close()
}
notes.m1 = m1
const bad = Object.entries(m1).filter(([k, v]) => { const [, sk] = k.split('|'); const needBack = sk !== 'Ålder'; return !(v.sheet[1] >= 0 && v.sheet[1] + v.sheet[3] <= v.vh + 1 && v.hitCancel?.inView && v.hitCancel?.hit && v.closed && v.storageSame && (!needBack || (v.hitBack?.inView && v.hitBack?.hit))) })
check('M1-all', 'Every step (9) × 844×390, 390×844, 320×568, 320×844, 1280×800: sheet inside the viewport; Tillbaka (steps 2+) and Avbryt reachable in view and hit-testable; Avbryt closes; storage byte-identical', bad.length === 0, JSON.stringify({ cases: Object.keys(m1).length, bad: bad.map(([k, v]) => ({ k, sheet: v.sheet, vh: v.vh, cancel: v.hitCancel, back: v.hitBack, closed: v.closed, same: v.storageSame })) }))
const landRows = Object.entries(m1).filter(([k]) => k.startsWith('land|')).map(([k, v]) => `${k.split('|')[1]}: sheet ${v.sheet[1]}–${v.sheet[1] + v.sheet[3]} scroll ${v.sheetScroll[0]}/${v.sheetScroll[1]} scrollers [${v.scrollers.join(' ')}] cancel→${JSON.stringify(v.hitCancel?.y)} back→${JSON.stringify(v.hitBack?.y)}`)
notes.landRows = landRows; console.log(landRows.join('\n'))
// double scroll: more than one active scroller at once
const dbl = Object.entries(m1).filter(([, v]) => v.scrollers.length > 1).map(([k, v]) => `${k} ${v.scrollers.join(' ')}`)
check('M1-double-scroll', 'No nested double scroll: at most one scrolling container in the sheet on any step/viewport', dbl.length === 0, JSON.stringify(dbl))

// ── jumpy chip list: tap a chip and watch rects of all chips + sheet scrollTop until the step changes (landscape + 390)
const jump = {}
for (const vk of ['land', '390', '320x568']) {
  const p = await pg(BR, VPS[vk]); await open(p)
  if (vk === 'land') await p.evaluate(() => { const s = document.querySelector('.home-wizard-sheet'); s.scrollTop = 40 })
  await p.evaluate(() => { window.__fr = []; const s = document.querySelector('.home-wizard-sheet'); const t0 = performance.now(); const tick = () => { const cs = [...s.querySelectorAll('[role=option]')].map((e) => Math.round(e.getBoundingClientRect().top)); window.__fr.push({ t: Math.round(performance.now() - t0), h2: s.querySelector('h2')?.textContent.trim(), top: s.scrollTop, opt: s.querySelector('.home-wizard-options')?.scrollTop ?? null, cs: cs.join(','), sh: Math.round(s.getBoundingClientRect().height) }); if (performance.now() - t0 < 900) requestAnimationFrame(tick) }; requestAnimationFrame(tick) })
  await opt(p, '10–12 år').click(); await p.waitForTimeout(1000)
  const fr = await p.evaluate(() => window.__fr)
  const pre = fr.filter((f) => f.h2 === 'Ålder'), post = fr.filter((f) => f.h2 === 'Fokus')
  const preMoves = new Set(pre.map((f) => f.cs + '|' + f.top)).size - 1
  const postStates = [...new Set(post.map((f) => `${f.top}|${f.sh}|${f.cs}`))]
  jump[vk] = { frames: fr.length, preMoves, postDistinct: postStates.length, postFirst: post[0], postLast: post.at(-1), firstFrame: pre[0] }
  await p.context().close()
}
notes.jump = jump
check('M1-no-jump', 'Tap a chip: no chip/sheet movement before the step changes; the next step settles in one layout (scrollTop at top) without bouncing', Object.values(jump).every((j) => j.preMoves === 0 && j.postDistinct <= 2 && (j.postLast?.top ?? 0) === 0), JSON.stringify(jump))

// ── layout vs fe5e51e on non-landscape viewports (same geometry expected) and landscape difference documented
const lay = {}
for (const vk of ['390', '320x568', '320x844', 'desk']) for (const sk of ['Ålder', 'Nivå', 'Hall', 'Passlängd', 'Mall-lista', 'Tomt-Passlängd']) {
  const g = {}
  for (const [who, base] of [['br', BR], ['fe', FE]]) { const p = await pg(base, VPS[vk], vk !== 'desk'); await open(p); await STEPS[sk](p); const x = await geo(p); g[who] = { sheet: x.sheet, cancel: x.cancel, back: x.back, chips: x.chips, alt: x.alt, scroll: x.sheetScroll.slice(0, 2) }; await p.context().close() }
  lay[`${vk}|${sk}`] = { same: JSON.stringify({ ...g.br, scroll: undefined }) === JSON.stringify({ ...g.fe, scroll: undefined }), br: g.br.sheet, fe: g.fe.sheet, brScroll: g.br.scroll, feScroll: g.fe.scroll, diff: JSON.stringify(g.br) === JSON.stringify(g.fe) ? null : { br: g.br, fe: g.fe } }
}
notes.layout = lay
const diffs = Object.entries(lay).filter(([, v]) => !v.same)
check('M1-layout-unchanged', 'Sheet geometry (sheet, chips, links, Tillbaka/Avbryt) identical to fe5e51e at 390×844, 320×568, 320×844, 1280×800 on 6 steps', diffs.length === 0, JSON.stringify({ n: Object.keys(lay).length, diffs: diffs.map(([k, v]) => ({ k, br: v.br, fe: v.fe, brScroll: v.brScroll, feScroll: v.feScroll })) }))

// ── start page layout vs fe5e51e, and m2 landmarks
const home = {}
for (const vk of ['390', '320x568', 'land', 'desk']) {
  const g = {}
  for (const [who, base] of [['br', BR], ['fe', FE], ['main', MAIN]]) { const p = await pg(base, VPS[vk], vk !== 'desk'); g[who] = await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] }; return { hero: r('.home-hero'), pane: r('.home-pane'), foot: r('.home-foot-rows'), plan: r('.home-start-primary'), docH: document.documentElement.scrollHeight, footers: document.querySelectorAll('footer').length, contentinfo: [...document.querySelectorAll('footer, [role=contentinfo]')].filter((e) => !e.closest('article, aside, main, nav, section') && e.offsetParent).length, footTag: document.querySelector('.home-foot-rows')?.tagName } }); if (who === 'br') await p.screenshot({ path: `${SS}home_${vk}.png` }); await p.context().close() }
  home[vk] = g
}
// builder / hall footers
const views = {}
for (const [k, go] of [['builder', async (p) => { await open(p); await tap(p, '7–9 år'); await tap(p, 'Trampett'); await tap(p, STORA); await opt(p, '60 min').click(); await p.locator('.builder').waitFor() }], ['hall', async (p) => { await open(p); await tap(p, '7–9 år'); await tap(p, 'Trampett'); await tap(p, STORA); await opt(p, '60 min').click(); await p.locator('.builder').waitFor(); const bb = p.locator('.builder-actions .builder-hall'); if (await bb.isVisible().catch(() => false)) await bb.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() } await p.locator('.hall-canvas').first().waitFor() }]]) {
  const p = await pg(BR, VPS['390']); await go(p); await p.waitForTimeout(400); views[k] = await p.evaluate(() => ({ footers: document.querySelectorAll('footer').length, visibleFooters: [...document.querySelectorAll('footer')].filter((e) => e.offsetParent).length })); await p.context().close()
}
notes.home = home; notes.views = views
const homeSame = ['390', '320x568', 'land', 'desk'].every((vk) => JSON.stringify([home[vk].br.hero, home[vk].br.pane, home[vk].br.foot, home[vk].br.plan, home[vk].br.docH]) === JSON.stringify([home[vk].fe.hero, home[vk].fe.pane, home[vk].fe.foot, home[vk].fe.plan, home[vk].fe.docH]))
check('m2-landmark', 'Exactly one <footer> (contentinfo) per page: start page (all viewports), Passbyggaren, Hallöversikt; start-page rows are the <footer>', ['390', '320x568', 'land', 'desk'].every((vk) => home[vk].br.footers === 1 && home[vk].br.contentinfo === 1 && home[vk].br.footTag === 'FOOTER') && views.builder.footers === 1 && views.hall.footers === 1, JSON.stringify({ home: Object.fromEntries(Object.entries(home).map(([k, v]) => [k, { br: [v.br.footers, v.br.contentinfo, v.br.footTag], fe: [v.fe.footers, v.fe.footTag], main: [v.main.footers] }])), views }))
check('m2-layout', 'Start page geometry identical to fe5e51e at 390, 320×568, landscape, desktop (desktop hero 800, footer in the right column, docH 800)', homeSame && home.desk.br.hero[3] === 800 && home.desk.br.docH === 800 && home.desk.br.foot[0] >= home.desk.br.pane[0], JSON.stringify(Object.fromEntries(Object.entries(home).map(([k, v]) => [k, { br: [v.br.hero, v.br.foot, v.br.docH], fe: [v.fe.hero, v.fe.foot, v.fe.docH], main: [v.main.hero, v.main.docH] }]))))
writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), branch: 'eecf677', fe: 'fe5e51e', results, notes }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await b.close()

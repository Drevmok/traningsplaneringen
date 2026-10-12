// Slice 35 — Builder self-smoke: footer «Tyck till» mailto + fallback line, 390×844.
// Plain build on :4198 (S35_OFF), bank build on :4199 (S35_ON, VITE_SUPABASE_URL=https://bank-mock.supabase.co)
// with a mocked admin session (Playwright routes; no real project) for the admin footer check.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { readFileSync, writeFileSync } from 'node:fs'

const OFF = process.env.S35_OFF ?? 'http://127.0.0.1:4198/traningsplaneringen/'
const ON = process.env.S35_ON ?? 'http://127.0.0.1:4199/traningsplaneringen/'
const ROOT = '/workspace/gymnastics-planner'
const MD = readFileSync(`${ROOT}/slice-35/content/microcopy.sv.md`, 'utf8')
const md = (k) => MD.match(new RegExp('^\\| `' + k + '`(?: \\*\\*[^*]+\\*\\*)? \\| ([^|]+?) \\|', 'm'))[1].trim()
const BODY = MD.match(/## Mail body \(verbatim\)[\s\S]*?```\n([\s\S]*?)\n```/)[1].split('\n').join('\r\n')
const S = { link: md('feedbackLink'), aria: md('feedbackLinkAria'), subject: md('feedbackMailSubject'), fallback: md('feedbackFallback').replace('{email}', 'drevmok@gmail.com'), copy: md('feedbackCopy'), copied: md('feedbackCopied'), footer: md('footerSliceLabel') }

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 300) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`)
}
async function attempt(id, fn) {
  try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n').slice(0, 8).join(' ⏎ ')) }
}
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const errors = []
async function open(url, opts = {}) {
  const ctx = await browser.newContext({ ...phone, ...(opts.ctx ?? {}) })
  ctx.reqs = []
  if (opts.init) await ctx.addInitScript(opts.init)
  if (opts.route) await opts.route(ctx)
  // a mailto navigation in headless Chrome: block it and record the URL (the OS mail handler can't be driven here)
  ctx.mailto = []
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (r) => { ctx.reqs.push(r.url()); if (r.url().startsWith('mailto:')) ctx.mailto.push(r.url()) })
  if (url) await page.goto(url)
  return { ctx, page }
}
const shot = (p, n) => p.screenshot({ path: `/workspace/screenshots/slice35_${n}.png`, fullPage: true })
const foot = (p) => p.locator('footer.app-footer')
const footerText = async (p) => (await foot(p).innerText()).replace(/\s+/g, ' ').trim()
const link = (p) => foot(p).getByRole('link', { name: S.aria })
const order = (p) => foot(p).evaluate((f) => [...f.children].filter((c) => !c.classList.contains('app-footer-sep')).map((c) => c.textContent.replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ').trim()))
const storageKeys = (p) => p.evaluate(async () => ({ ls: Object.keys(localStorage).sort(), ss: Object.keys(sessionStorage).sort(), cookie: document.cookie, idb: indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name).sort() : [] }))
async function layout(p) {
  return foot(p).evaluate((f) => {
    const items = [...f.children].filter((c) => !c.classList.contains('app-footer-sep') && c.tagName !== 'P')
    const lineH = (el) => parseFloat(getComputedStyle(el).lineHeight) || 20
    return {
      sw: document.documentElement.scrollWidth,
      split: items.filter((el) => [...el.getClientRects()].length > 1 || el.getBoundingClientRect().height > Math.max(48, lineH(el) * 2.2)).map((el) => el.textContent),
      right: Math.max(...items.map((el) => el.getBoundingClientRect().right)),
    }
  })
}
async function startBlank(p) {
  await p.getByRole('button', { name: 'Planera pass' }).click()
  const wz = p.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click()
  await wz.getByRole('button', { name: 'Skapa pass' }).click()
}

// ───────── AC1/2/3/6/7/8/10/11/13 on the plain build ─────────
await attempt('A', async () => {
  const { ctx, page: p } = await open(OFF, { ctx: { permissions: ['clipboard-read', 'clipboard-write'] } })
  check('AC1a', 'Home: «Tyck till» in the footer, before «Uppdatera appen»', JSON.stringify(await order(p)) === JSON.stringify([S.link, 'Uppdatera appen']), JSON.stringify(await order(p)))
  check('AC1b', 'Exactly one a[href^="mailto:"] in the DOM, inside footer', (await p.locator('a[href^="mailto:"]').count()) === 1 && (await p.locator('footer a[href^="mailto:"]').count()) === 1)
  const href = await link(p).getAttribute('href')
  const q = href.slice(href.indexOf('?') + 1).split('&')
  const subj = decodeURIComponent(q[0].replace(/^subject=/, ''))
  const body = decodeURIComponent(q[1].replace(/^body=/, ''))
  check('AC2a', 'href: To drevmok@gmail.com, subject, %0D%0A, no "+", åäö as UTF-8 escapes', href.startsWith('mailto:drevmok@gmail.com?subject=') && href.includes('%0D%0A') && !href.includes('+') && href.includes('%C3%A4') && subj === S.subject, href.slice(0, 90))
  check('AC2b', 'Body decodes to the microcopy body exactly (blank lines, åäö, CRLF)', body === BODY && !/Ã/.test(body), JSON.stringify(body.slice(-40)))
  check('AC3', 'Last body line «Version: Slice 35» = footer label number', body.split('\r\n').at(-1) === 'Version: Slice 35' && S.footer.endsWith('Slice 35'))
  check('AC13a', 'Real <a> element (link role), aria-label «Tyck till om appen via e-post», visible text «Tyck till», no target/rel', (await link(p).evaluate((a) => a.tagName === 'A' && !a.target && !a.rel && a.textContent === 'Tyck till')))
  check('AC11a', 'No feedback popup / banner / prompt on load', (await p.locator('[role=dialog], .toast, .footer-feedback-hint, .app-footer > p').count()) === 0)
  await shot(p, 'home_footer')
  const keysBefore = await storageKeys(p)
  const reqBefore = ctx.reqs.length
  // keyboard: Tab reaches it, focus ring, Enter follows it
  await p.keyboard.press('Tab')
  let tabs = 0
  while (!(await link(p).evaluate((a) => a === document.activeElement)) && tabs++ < 60) await p.keyboard.press('Tab')
  const ring = await link(p).evaluate((a) => { const cs = getComputedStyle(a); return a.matches(':focus-visible') && (cs.outlineStyle !== 'none' || cs.boxShadow !== 'none') })
  check('AC13b', 'Tab reaches «Tyck till» with a visible focus ring', tabs < 60 && ring, `tabs ${tabs}`)
  await shot(p, 'focus_ring')
  await p.keyboard.press('Enter')
  await p.waitForTimeout(400)
  check('AC13c', 'Enter follows the mailto (same href)', ctx.mailto.length === 1 && ctx.mailto[0] === href)
  const hint = foot(p).locator('p')
  check('AC6a', 'After the tap: one grey line «Hittar du ingen e-postapp? Skriv till drevmok@gmail.com» + «Kopiera adressen»', (await hint.count()) === 1 && (await hint.innerText()).replace(/\s+/g, ' ').trim() === `${S.fallback} ${S.copy}`, await hint.innerText())
  const sel = await hint.evaluate((el) => { const cs = getComputedStyle(el); const span = el.querySelector('span'); const r = document.createRange(); r.selectNodeContents(span); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return { us: cs.userSelect, txt: s.toString(), color: cs.color } })
  check('AC6b', 'Address is selectable text (user-select text, selection = the address); grey', sel.us !== 'none' && sel.txt === 'drevmok@gmail.com', JSON.stringify(sel))
  check('AC6c', 'Fallback line is plain text (no live region); sits on its own row under the footer', (await hint.evaluate((el) => !el.getAttribute('role') && !el.getAttribute('aria-live') && getComputedStyle(el).flexBasis === '100%')))
  await shot(p, 'fallback_line')
  // copy
  await hint.getByRole('button', { name: S.copy }).click()
  await hint.getByRole('status').waitFor()
  const clip = await p.evaluate(() => navigator.clipboard.readText())
  check('AC7a', 'Kopiera adressen → clipboard = address, «Kopierad» in role=status', clip === 'drevmok@gmail.com' && (await hint.getByRole('status').innerText()) === S.copied)
  await shot(p, 'copied')
  await p.waitForTimeout(2300)
  check('AC7b', '«Kopierad» reverts to «Kopiera adressen» after ~2 s', (await hint.getByRole('status').count()) === 0 && (await hint.getByRole('button', { name: S.copy }).count()) === 1)
  // tap again with a touch tap
  await link(p).tap()
  await p.waitForTimeout(300)
  check('AC6d', 'A second tap: still exactly one line (not stacked)', (await foot(p).locator('p').count()) === 1 && ctx.mailto.length === 2)
  const keysAfter = await storageKeys(p)
  check('AC10a', 'Tapping made no network request (only the blocked mailto navigation)', ctx.reqs.slice(reqBefore).every((u) => u.startsWith('mailto:')), ctx.reqs.slice(reqBefore).join(', '))
  check('AC10b', 'No new localStorage / sessionStorage / IndexedDB / cookie keys', JSON.stringify(keysBefore) === JSON.stringify(keysAfter), JSON.stringify(keysAfter))
  await p.reload()
  check('AC8', 'Reload → fallback line gone', (await foot(p).locator('p').count()) === 0 && (await link(p).count()) === 1)
  // views: planner, bibliotek, hall, run
  await startBlank(p)
  const o = await order(p)
  check('AC1c', 'Passbyggaren footer order: label · Tyck till · Visa tips igen · Uppdatera appen', JSON.stringify(o) === JSON.stringify([S.footer, S.link, 'Visa tips igen', 'Uppdatera appen']), JSON.stringify(o))
  check('AC16a', 'Footer reads «Träningsplaneraren · Slice 35»', (await footerText(p)).startsWith(S.footer))
  await shot(p, 'builder_footer')
  if (await p.locator('.builder-hall').isVisible()) await p.locator('.builder-hall').click()
  else {
    await p.getByRole('button', { name: 'Fler saker med passet' }).click()
    await p.locator('.more-menu-panel button', { hasText: 'Hallöversikt' }).click()
  }
  await p.waitForTimeout(500)
  check('AC1e', 'Hallöversikt: link in the footer', (await p.locator('footer a[href^="mailto:"]').count()) === 1, await footerText(p))
  await shot(p, 'hall_footer')
  await p.locator('button', { hasText: /Till Passbyggaren|Tillbaka till Passbyggaren/ }).first().click()
  const teknik = p.locator('.block-card').filter({ has: p.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await p.locator('.side-panel-slot.is-open').waitFor()
  check('AC1d', 'Bibliotek open: link still in the footer, still one mailto', (await p.locator('footer a[href^="mailto:"]').count()) === 1 && (await p.locator('a[href^="mailto:"]').count()) === 1)
  await p.keyboard.press('Escape')
  await p.locator('.sheet-close').click({ timeout: 2000 }).catch(() => {})
  await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).click()
  await p.locator('.run-pass').waitFor()
  check('AC1f', 'Kör passet open: footer (with the one mailto) still in the DOM, nothing new in the overlay', (await p.locator('footer a[href^="mailto:"]').count()) === 1 && (await p.locator('.run-pass a[href^="mailto:"]').count()) === 0)
  check('AC16b', 'Kör passet still shows «Nästa: …» (Slice 34)', /^Nästa: /.test(await p.locator('.run-next').innerText()))
  await p.locator('.run-pass').getByRole('button', { name: 'Avsluta' }).click()
  await p.emulateMedia({ media: 'print' })
  check('AC16c', 'Print: footer hidden', !(await foot(p).isVisible()))
  await p.emulateMedia({ media: 'screen' })
  const lay = await layout(p)
  check('AC12a', 'Builder footer at 390: no horizontal scroll, no item split mid-word', lay.sw <= 390 && lay.split.length === 0 && lay.right <= 390, JSON.stringify(lay))
  check('AC11b', 'Still no feedback popup/banner anywhere', (await p.locator('[role=dialog], .toast').count()) === 0)
  await ctx.close()
})

// ───────── AC7 without clipboard ─────────
await attempt('B', async () => {
  const { ctx, page: p } = await open(OFF, { init: () => { Object.defineProperty(Navigator.prototype, 'clipboard', { configurable: true, get: () => undefined }) } })
  await link(p).click()
  await foot(p).locator('p').getByRole('button', { name: S.copy }).click()
  await p.waitForTimeout(300)
  check('AC7c', 'Clipboard API missing: no error, button unchanged, line + address still there', (await foot(p).locator('p').getByRole('status').count()) === 0 && (await foot(p).locator('p').innerText()).includes('drevmok@gmail.com'))
  await ctx.close()
  const d = await open(OFF, { ctx: { permissions: [] } , init: () => { navigator.clipboard.writeText = () => Promise.reject(new DOMException('denied', 'NotAllowedError')) } })
  await link(d.page).click()
  await foot(d.page).locator('p').getByRole('button', { name: S.copy }).click()
  await d.page.waitForTimeout(300)
  check('AC7d', 'Clipboard denied (rejects): nothing visible, no error', (await foot(d.page).locator('p').getByRole('status').count()) === 0)
  await d.ctx.close()
})

// ───────── AC9 offline ─────────
await attempt('C', async () => {
  const { ctx, page: p } = await open(OFF)
  await p.waitForTimeout(1500) // SW / assets
  await ctx.setOffline(true)
  await link(p).click()
  await p.waitForTimeout(300)
  check('AC9-local', 'Offline: tap still follows the mailto + shows the line', ctx.mailto.length === 1 && (await foot(p).locator('p').count()) === 1)
  await ctx.close()
})

// ───────── AC12 admin states on the bank build (mocked session) ─────────
const SESSION = () => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  localStorage.setItem('gymnastics-planner-admin-auth-v1', JSON.stringify({ access_token: 'local.mock.token', refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: { id: 'u1', email: 'admin@test.local', aud: 'authenticated', role: 'authenticated' } }))
}
for (const [label, isAdmin] of [['admin', true], ['notadmin', false]]) {
  await attempt(`D-${label}`, async () => {
    const { ctx, page: p } = await open(null, {
      init: SESSION,
      route: (c) => c.route('https://bank-mock.supabase.co/**', (r) => {
        const u = new URL(r.request().url())
        if (u.pathname === '/rest/v1/admins') return r.fulfill({ status: 200, contentType: 'application/json', body: isAdmin ? '[{"user_id":"u1"}]' : '[]' })
        if (u.pathname.startsWith('/rest/v1/')) return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
        return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }),
    })
    await p.goto(ON)
    await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
    await startBlank(p).catch(() => {})
    await p.waitForTimeout(400)
    const o = await order(p)
    const want = isAdmin ? [S.footer, 'Admin · Logga ut ·', S.link, 'Visa tips igen', 'Uppdatera appen'] : [S.footer, 'Du är inloggad men inte admin. · Logga ut ·', S.link, 'Visa tips igen', 'Uppdatera appen']
    check(`AC12-${label}a`, `${label}: order label · ${isAdmin ? 'Admin · Logga ut' : 'inte admin · Logga ut'} · Tyck till · Visa tips igen · Uppdatera appen`, JSON.stringify(o) === JSON.stringify(want), JSON.stringify(o))
    const lay = await layout(p)
    check(`AC12-${label}b`, `${label} footer at 390: no horizontal scroll, nothing split mid-word`, lay.sw <= 390 && lay.split.length === 0 && lay.right <= 390, JSON.stringify(lay))
    await link(p).click()
    await p.waitForTimeout(200)
    const lay2 = await layout(p)
    check(`AC12-${label}c`, `${label} with the fallback line: still no horizontal scroll`, lay2.sw <= 390, JSON.stringify(lay2))
    await shot(p, `${label}_footer_390`)
    await ctx.close()
  })
}
await attempt('E', async () => {
  const { ctx, page: p } = await open(ON, { route: (c) => c.route('https://bank-mock.supabase.co/**', (r) => r.abort()) })
  await startBlank(p)
  const o = await order(p)
  check('AC1g', 'Bank build logged out: label · Logga in som admin · Tyck till · Visa tips igen · Uppdatera appen', JSON.stringify(o) === JSON.stringify([S.footer, 'Logga in som admin ·', S.link, 'Visa tips igen', 'Uppdatera appen']), JSON.stringify(o))
  const lay = await layout(p)
  check('AC12d', 'Logged out at 390: «Logga in som admin» visible, no horizontal scroll, no split', (await p.locator('footer .footer-admin-login').isVisible()) && lay.sw <= 390 && lay.split.length === 0, JSON.stringify(lay))
  await shot(p, 'loggedout_footer_390')
  await ctx.close()
})

const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
const keys = ['feedbackLink', 'feedbackLinkAria', 'feedbackMailSubject', 'feedbackMailVersion', 'feedbackFallback', 'feedbackCopy', 'feedbackCopied']
check('AC16d', 'Strings verbatim in blockMeta.ts; SLICE_NUMBER drives the footer; no «!» or banned words in the UI strings', keys.every((k) => meta.includes(`${k}: '${md(k)}'`)) && meta.includes("export const SLICE_NUMBER = '35'") && meta.includes('footerSliceLabel: `Träningsplaneraren · Slice ${SLICE_NUMBER}`') && !/[!]|feedback |formulär|betyg|mejlklient/i.test(keys.map(md).join(' ')))
const src = readFileSync(`${ROOT}/app/src/components/FooterFeedback.tsx`, 'utf8') + readFileSync(`${ROOT}/app/src/lib/feedback.ts`, 'utf8')
check('AC10c', 'No fetch / beacon / storage / window.open / location in the feedback code', !/fetch\(|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|window\.open|location\./.test(src))
check('E', 'No page errors', errors.length === 0, errors.join(' | '))
const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-35-smoke-results.json`, JSON.stringify({ results }, null, 2))
await browser.close()

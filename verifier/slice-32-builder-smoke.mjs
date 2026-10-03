// Slice 32 — Builder self-smoke: admin login + editing + bot writes, 390×844.
// Local stand-ins only (never the real project):
//   bash verifier/slice-32-local/setup.sh && bash verifier/slice-32-local/start.sh && bash verifier/slice-32-local/users.sh
//   plain build preview on :4173; bank build (VITE_SUPABASE_URL=https://bank-mock.supabase.co,
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32) preview on :4174.
// Browser requests to https://bank-mock.supabase.co/** are forwarded unchanged (method, headers, body,
// no redirect following) to the local gateway → PostgREST (schema-31 + 32, real RLS) / GoTrue (real
// magic-link + PKCE). Login mails land in /tmp/s32/mail via a local SMTP sink.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'

const OFF = 'http://127.0.0.1:4173/traningsplaneringen/'
const ON = 'http://127.0.0.1:4174/traningsplaneringen/'
const BANK_HOST = 'https://bank-mock.supabase.co'
const GATEWAY = 'http://127.0.0.1:54340'
const ROOT = '/workspace/gymnastics-planner'
const S32 = '/tmp/s32'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const PUB = ENV.publishableKey
const CACHE_KEY = 'gymnastics-planner-bank-cache-v1'
const AUTH_KEY = 'gymnastics-planner-admin-auth-v1'
const STALE = 'Visar sparade övningar. Du kan planera som vanligt.'
const ADMIN = 'admin@test.local'
const NONADMIN = 'nonadmin@test.local'
const SHARE_TOKEN = execFileSync('bun', [`${ROOT}/verifier/slice-32-local/mktoken.ts`], { encoding: 'utf8' }).trim()
const UI = {
  login: 'Logga in som admin',
  logout: 'Logga ut',
  notAdmin: 'Du är inloggad men inte admin.',
  sent: 'Om adressen hör till en admin kommer en länk strax. Öppna den i den här webbläsaren. Den gäller i en timme.',
  wait: 'Vänta en stund innan du ber om en ny länk.',
  failed: 'Länken fungerar inte längre. Be om en ny.',
  offline: 'Du behöver nät för att ändra i banken.',
  conflict: 'Någon annan har ändrat övningen. Stäng och öppna den igen.',
  usedIn: 'Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras.',
  approved: 'Godkänd. Tränarna ser den nästa gång de öppnar appen.',
  saved: 'Sparat i banken.',
}

const results = []
const notes = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 400) })
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`)
}
const note = (s) => {
  notes.push(s)
  console.log('  · ' + s)
}
async function attempt(id, name, fn) {
  try {
    await fn()
  } catch (e) {
    check(id, name, false, 'error: ' + String(e.message).split('\n').slice(0, 3).join(' ⏎ '))
  }
}
const sql = (q) =>
  execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], {
    encoding: 'utf8',
    env: { ...process.env, PGOPTIONS: '-cclient_min_messages=warning' },
  }).trim()
const botKey = () => readFileSync(ENV.botKeysFile, 'utf8').split('\n').filter(Boolean)[0] ?? ''

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const pageErrors = []
const bankLog = [] // every browser request to the bank host
const assetLog = [] // every JS asset requested, per context label

async function newCtx(label, init) {
  const ctx = await browser.newContext(phone)
  ctx.label = label
  if (init) await ctx.addInitScript(init)
  await ctx.route(`${BANK_HOST}/**`, async (route) => {
    const req = route.request()
    const u = new URL(req.url())
    if (ctx.bankDown) return route.abort('internetdisconnected')
    const headers = { ...req.headers() }
    delete headers.host
    try {
      const resp = await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined, maxRedirects: 0 })
      return route.fulfill({ response: resp })
    } catch (e) {
      return route.abort('failed')
    }
  })
  ctx.on('request', (r) => {
    const url = r.url()
    if (url.startsWith(BANK_HOST)) bankLog.push({ ctx: label, method: r.method(), url, headers: r.headers(), body: r.postData() })
    if (/\/assets\/[^/]+\.js$/.test(url)) assetLog.push({ ctx: label, url })
  })
  return ctx
}
async function newPage(ctx, url) {
  const page = await ctx.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (e) => pageErrors.push(`${ctx.label}: ${e.message}`))
  if (url) await page.goto(url)
  return page
}
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/slice32_${n}.png` })
const store = (page, k) => page.evaluate((key) => localStorage.getItem(key), k)
const footerText = async (page) => (await page.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ').trim()

async function openLibrary(page) {
  if (await page.locator('.side-panel-slot.is-open').count()) {
    await page.getByRole('tab', { name: 'Bibliotek' }).click()
    return
  }
  const teknik = page.locator('.block-card').filter({ has: page.locator('h3', { hasText: /^Teknik$/ }) })
  const empty = teknik.getByRole('button', { name: 'Lägg till övning', exact: true })
  if (await empty.count()) await empty.first().click()
  else await teknik.locator('.btn-add-inline').click()
  await page.locator('.side-panel-slot.is-open').waitFor()
}
async function closeLibrary(page) {
  const btn = page.locator('.sheet-close')
  if (await btn.isVisible()) await btn.click()
}
const titleTexts = (page) =>
  page.locator('.library-entry .activity-title').evaluateAll((els) =>
    els.map((el) => Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()),
  )
async function libraryTitles(page) {
  await page.locator('.filter-row select').selectOption('all')
  await page.locator('.search-input').fill('')
  return titleTexts(page)
}
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const card = (page, t) => page.locator('.library-entry').filter({ has: page.locator('.activity-title', { hasText: new RegExp(`^${esc(t)}`) }) })
async function openDetail(page, title) {
  await page.locator('.filter-row select').selectOption('all')
  await page.locator('.search-input').fill(title)
  await card(page, title).first().locator('.activity-card').click()
  const d = page.locator('.activity-detail')
  await d.waitFor()
  return d
}
async function closeDetail(page) {
  const d = page.locator('.activity-detail')
  if (await d.count()) await d.getByRole('button', { name: /Stäng/ }).first().click()
}
const staleCount = (page) => page.getByText(STALE, { exact: true }).evaluateAll((els) => els.filter((e) => e.checkVisibility()).length)

function mails(to) {
  return readdirSync(`${S32}/mail`)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ f, t: statSync(`${S32}/mail/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${S32}/mail/${f}`, 'utf8')) }))
    .filter((x) => JSON.stringify(x.m.to).includes(to))
    .sort((a, b) => a.t - b.t)
}
async function waitMail(to, after) {
  for (let i = 0; i < 40; i++) {
    const m = mails(to).filter((x) => x.t > after)
    if (m.length) return m.at(-1).m
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`no mail for ${to}`)
}
const verifyLink = (m) => m.links.find((l) => l.includes('/auth/v1/verify'))

async function sendLogin(page, email) {
  await page.getByRole('button', { name: UI.login }).click()
  const dlg = page.getByRole('dialog', { name: UI.login })
  await dlg.waitFor()
  await dlg.locator('input[type=email]').fill(email)
  await dlg.getByRole('button', { name: 'Skicka länk' }).click()
  return dlg
}
async function builderAction(page, name) {
  const direct = page.locator('.builder-actions > button, .builder-extra > button').filter({ hasText: name })
  for (const b of await direct.all()) if (await b.isVisible()) return b.click()
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name }).click()
}
async function startBlank(page) {
  await page.getByRole('button', { name: 'Tomt pass' }).click()
}

// ───────────── reset the local DB to the seeded state (local stand-in only) ─────────────
sql(`delete from public.exercises where id like 'tech-test-%';`) // superuser cleanup of earlier local runs
const REVIEW_N = Number(sql(`select count(*) from public.exercises where status = 'published' and needs_coach_review`))
const REVIEW_ID = sql(`select id from public.exercises where status = 'published' and needs_coach_review and id <> 'tech-kullerbytta' order by sort_order limit 1`)
const REVIEW_TITLE = sql(`select title from public.exercises where id = '${REVIEW_ID}'`)
note(`seed rows flagged needs_coach_review: ${REVIEW_N}; AC 33 uses ${REVIEW_ID} «${REVIEW_TITLE}»`)
const seedTemplateIds = JSON.parse(execFileSync('bun', ['-e', `import { seedTemplates } from '${ROOT}/app/src/data/seedTemplates.ts'; console.log(JSON.stringify(seedTemplates[0].blocks.flatMap((b) => b.items.map((i) => i.activityId))))`], { encoding: 'utf8' }))
const MALL_ID = seedTemplateIds.find((id) => id.startsWith('tech-')) ?? seedTemplateIds[0]
const MALL_TITLE = sql(`select title from public.exercises where id = '${MALL_ID}'`)
note(`mall drill used for AC 34: ${MALL_ID} «${MALL_TITLE}»`)

// ───────────────────────── AC 50 / 26: coach visit ─────────────────────────
await attempt('AC26', 'Coach visit', async () => {
  const ctx = await newCtx('coach-off')
  const off = await newPage(ctx, OFF)
  await startBlank(off)
  const f0 = await footerText(off)
  check('AC50a', 'Plain build footer: Träningsplaneraren · Slice 32, no admin link (vars unset)', f0.startsWith('Träningsplaneraren · Slice 32') && !f0.includes(UI.login), f0)
  await ctx.close()

  const c = await newCtx('coach')
  const before = bankLog.length
  const page = await newPage(c, ON)
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  await shot(page, 'coach_home_footer')
  await startBlank(page)
  const f = await footerText(page)
  check('AC50', 'Bank build footer reads «Träningsplaneraren · Slice 32 · Logga in som admin»', f.startsWith('Träningsplaneraren · Slice 32 · Logga in som admin'), f)
  await shot(page, 'coach_builder_footer')
  await openLibrary(page)
  await page.waitForTimeout(500)
  const js = assetLog.filter((a) => a.ctx === 'coach').map((a) => a.url.split('/').pop())
  check('AC26a', 'No supabase-js / admin chunk downloaded on a coach visit', !js.some((n) => /^(dist|session|adminBank|bankWrite|AdminLoginSheet|AdminDetailPanel|AdminBankForm)-/.test(n)), js.join(', '))
  const reqs = bankLog.slice(before)
  check('AC26b', 'Coach requests: only the two Slice 31 GETs, publishable key, no Authorization', reqs.length === 2 && reqs.every((r) => r.method === 'GET' && r.headers.apikey === PUB && !r.headers.authorization), reqs.map((r) => r.method + ' ' + new URL(r.url).pathname).join(', '))
  check('AC26c', 'No admin UI in Biblioteket (no Admin chip, no filter chips, no badges)', (await page.locator('.admin-bar, .admin-filter-chip, .admin-badge').count()) === 0)
  check('AC26d', 'No auth key in storage', (await store(page, AUTH_KEY)) === null)
  await shot(page, 'coach_library')
  await c.close()
})

// ───────────────────────── AC 24: unknown e-mail ─────────────────────────
await attempt('AC24', 'Unknown e-mail', async () => {
  const ctx = await newCtx('unknown')
  const page = await newPage(ctx, ON)
  const usersBefore = sql(`select count(*) from auth.users`)
  const t0 = Date.now()
  const dlg = await sendLogin(page, 'okand@test.local')
  await dlg.getByRole('status').waitFor()
  check('AC24a', 'Same adminLinkSent text for an unknown address', (await dlg.getByRole('status').innerText()) === UI.sent)
  await shot(page, 'login_sent_unknown')
  await page.waitForTimeout(800)
  check('AC24b', 'No user created (sign-ups off)', sql(`select count(*) from auth.users`) === usersBefore && sql(`select count(*) from auth.users where email = 'okand@test.local'`) === '0')
  check('AC24c', 'No mail sent to the unknown address', mails('okand@test.local').filter((x) => x.t > t0).length === 0)
  const otp = bankLog.filter((r) => r.ctx === 'unknown' && r.url.includes('/auth/v1/otp'))
  check('AC24d', 'OTP request asks never to create users and returns to the app', otp.length === 1 && JSON.parse(otp[0].body).create_user === false && decodeURIComponent(otp[0].url).includes(`redirect_to=${ON}`), otp[0]?.body)
  await ctx.close()
})

// ───────────────────────── AC 25: magic link round trip ─────────────────────────
const admin = await newCtx('admin')
let adminPage
let adminLink
let lastAdminSend = 0
await attempt('AC25', 'Magic link round trip', async () => {
  adminPage = await newPage(admin, ON)
  const t0 = Date.now()
  lastAdminSend = t0
  const dlg = await sendLogin(adminPage, ADMIN)
  await dlg.getByRole('status').waitFor()
  await shot(adminPage, 'login_sheet_sent')
  const m = await waitMail(ADMIN, t0)
  adminLink = verifyLink(m)
  check('AC25a', 'Mail arrives with a verify link back to the app (PKCE token)', adminLink && adminLink.includes('token=pkce_') && decodeURIComponent(adminLink).includes(`redirect_to=${ON}`), adminLink?.replace(/token=[^&]+/, 'token=…'))
  check('AC25b', 'Code verifier saved in this browser before the mail', (await store(adminPage, `${AUTH_KEY}-code-verifier`)) !== null)
  await adminPage.goto(`${adminLink}#dela=${SHARE_TOKEN}`)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  const url = new URL(adminPage.url())
  check('AC25c', '?code= removed from the address', !url.search.includes('code='), url.pathname + url.search)
  check('AC25d', 'Existing #dela= hash survives the login return', url.hash === `#dela=${SHARE_TOKEN}`, url.hash.slice(0, 30))
  check('AC25e', 'Shared pass still opens from the kept hash', (await adminPage.getByText('Delat testpass').count()) > 0)
  await shot(adminPage, 'login_return_shared_pass')
  check('AC25f', 'Session stored under gymnastics-planner-admin-auth-v1', (await store(adminPage, AUTH_KEY)) !== null)
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  const f = await footerText(adminPage)
  check('AC25g', 'Reload keeps the session; footer «Admin · Logga ut»', f.includes('Admin · Logga ut'), f)
  await shot(adminPage, 'admin_home_footer')
})

// ───────────────────────── AC 28: used link + rate limit ─────────────────────────
await attempt('AC28', 'Used link, then a second request within 60 s', async () => {
  const ctx = await newCtx('expired')
  const page = await newPage(ctx, ON)
  await page.goto(adminLink)
  const dlg = page.getByRole('dialog', { name: UI.login })
  await dlg.waitFor({ timeout: 15000 })
  check('AC28a', 'Used link → login sheet opens with adminLinkFailed', (await dlg.locator('.admin-link-failed').innerText()) === UI.failed)
  const url = new URL(page.url())
  check('AC28b', 'Error parameters removed from the address', !/error|code=/.test(url.search + url.hash), url.search + url.hash)
  await shot(page, 'login_link_failed')
  await dlg.locator('input[type=email]').fill(ADMIN)
  await dlg.getByRole('button', { name: 'Skicka länk' }).click()
  await dlg.locator('.admin-send-error').waitFor()
  check('AC28c', '2nd request within 60 s → adminWait', (await dlg.locator('.admin-send-error').innerText()) === UI.wait)
  await shot(page, 'login_wait')
  // failed exchange (link opened in another browser: no code verifier there)
  const waitMs = Math.max(0, lastAdminSend + 62000 - Date.now())
  note(`waiting ${Math.round(waitMs / 1000)} s for the 60 s per-address mail limit before the cross-browser test`)
  await new Promise((r) => setTimeout(r, waitMs))
  const t0 = Date.now()
  const other = await newCtx('other-browser')
  const op = await newPage(other, ON)
  const d2 = await sendLogin(op, ADMIN)
  await d2.getByRole('status').waitFor()
  const m = await waitMail(ADMIN, t0)
  const link = verifyLink(m)
  const third = await newCtx('third-browser')
  const tp = await newPage(third)
  await tp.goto(link)
  const d3 = tp.getByRole('dialog', { name: UI.login })
  await d3.waitFor({ timeout: 15000 })
  check('AC28d', 'Link opened in another browser (failed ?code= exchange) → adminLinkFailed', (await d3.locator('.admin-link-failed').innerText()) === UI.failed && !new URL(tp.url()).search.includes('code='))
  check('AC28e', 'No session created in that browser', (await store(tp, AUTH_KEY)) === null)
  await ctx.close()
  await other.close()
  await third.close()
})

// ───────────────────────── AC 27: non-admin ─────────────────────────
await attempt('AC27', 'Logged-in user who is not admin', async () => {
  const ctx = await newCtx('nonadmin')
  const page = await newPage(ctx, ON)
  const t0 = Date.now()
  const dlg = await sendLogin(page, NONADMIN)
  await dlg.getByRole('status').waitFor()
  const link = verifyLink(await waitMail(NONADMIN, t0))
  await page.goto(link)
  await page.locator('footer .footer-admin-not').waitFor({ timeout: 15000 })
  const f = await footerText(page)
  check('AC27a', 'Footer: adminNotAdmin + Logga ut', f.includes(`${UI.notAdmin} · Logga ut`), f)
  await startBlank(page)
  await openLibrary(page)
  check('AC27b', 'No admin UI for a non-admin', (await page.locator('.admin-bar, .admin-filter-chip, .admin-badge, .admin-detail').count()) === 0)
  await shot(page, 'nonadmin_footer_library')
  const session = JSON.parse(await store(page, AUTH_KEY))
  const token = session.access_token
  const before = sql(`select title || '|' || status from public.exercises where id = 'tech-kullerbytta'`)
  const res = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-kullerbytta`, {
    method: 'PATCH',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ title: 'HACK', status: 'hidden' }),
  })
  const body = await res.text()
  check('AC27c', 'Direct API update with the non-admin token changes nothing', sql(`select title || '|' || status from public.exercises where id = 'tech-kullerbytta'`) === before && body === '[]', `${res.status} ${body}`)
  const ins = await fetch(`${GATEWAY}/rest/v1/exercises`, { method: 'POST', headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'tech-hack', title: 'x' }) })
  check('AC27d', 'Direct API insert refused', ins.status >= 400, String(ins.status))
  const adm = await fetch(`${GATEWAY}/rest/v1/admins`, { method: 'POST', headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: session.user.id, email: NONADMIN }) })
  check('AC27e', 'Cannot add self to admins', adm.status >= 400 && sql(`select count(*) from public.admins`) === '1', String(adm.status))
  await closeLibrary(page)
  await page.locator('footer .footer-admin-logout').click()
  await page.locator('footer .footer-admin-login').waitFor()
  check('AC27f', 'Logga ut (non-admin) removes the session key', (await store(page, AUTH_KEY)) === null)
  await ctx.close()
})

// ───────────────────────── AC 41: bot push ─────────────────────────
let botOut = ''
await attempt('AC41', 'Bot push of the 2-exercise fixture', async () => {
  const run = (args, key = botKey()) =>
    spawnSync('bun', [`${ROOT}/tools/bank/push-promote.ts`, `${ROOT}/tools/bank/fixtures/promote-2.json`, ...args], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_PLANNER_BOT_KEY: key, SUPABASE_URL: GATEWAY },
    })
  const dry = run(['--dry-run'])
  check('AC41a', 'Dry-run lists 2 new rows and writes nothing', dry.status === 0 && dry.stdout.includes('2 nya') && sql(`select count(*) from public.exercises where id like 'tech-test-%'`) === '0', dry.stdout.split('\n').at(-2))
  const r = run([])
  botOut = r.stdout
  check('AC41b', 'Push → exit 0, «Väntar på godkännande i appen»', r.status === 0 && r.stdout.includes('Väntar på godkännande i appen'), r.stdout.split('\n').slice(-3).join(' / '))
  const rows = sql(`select id || '|' || status || '|' || needs_coach_review || '|' || updated_by from public.exercises where id like 'tech-test-%' order by id`)
  check('AC41c', 'Rows pending, needs_coach_review true, updated_by bot:planner', rows === 'tech-test-aggrullning-kil|pending|true|bot:planner\ntech-test-formhopp-over-lagt-block|pending|true|bot:planner', rows.replace(/\n/g, ' ; '))
  const anon = await (await fetch(`${GATEWAY}/rest/v1/exercises?select=id&id=like.tech-test-*`, { headers: { apikey: PUB } })).json()
  check('AC41d', 'Invisible to anon', Array.isArray(anon) && anon.length === 0)
  const again = run([])
  check('AC42a', 'Second push: existing ids skipped + reported, not overwritten', again.status === 0 && again.stdout.includes('Hoppades över (fanns redan): tech-test-formhopp-over-lagt-block, tech-test-aggrullning-kil'), again.stdout.split('\n').slice(-3).join(' / '))
  const pubRun = run([], PUB)
  check('AC42b', 'Publishable key in SUPABASE_PLANNER_BOT_KEY → script refuses', pubRun.status === 1 && pubRun.stdout.includes('publika nyckeln'))
  const all = dry.stdout + r.stdout + again.stdout + pubRun.stdout + dry.stderr + r.stderr
  check('AC42c', 'Key never printed', !all.includes(botKey()) && !all.includes(PUB))
  const del = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'DELETE', headers: { apikey: botKey() } })
  const delBody = await del.text()
  check('AC43', 'Bot key DELETE → permission denied, row still there', del.status === 403 && delBody.includes('permission denied') && sql(`select count(*) from public.exercises where id = 'tech-test-aggrullning-kil'`) === '1', `${del.status} ${delBody.slice(0, 80)}`)
  const browserUse = await fetch(`${GATEWAY}/rest/v1/exercises?select=id&limit=1`, { headers: { apikey: botKey(), Origin: ON } })
  check('AC40b', 'Secret-style key refused from a browser origin (gateway emulates Supabase 401)', browserUse.status === 401)
})

// ───────────────────────── AC 29–33: admin UI ─────────────────────────
const TA = 'Test: formhopp över lågt block'
const TB = 'Test: äggrullning nerför kil'
await attempt('AC29', 'Admin mode lists', async () => {
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  await adminPage.locator('.admin-bar').waitFor()
  const chips = await adminPage.locator('.admin-bar').innerText()
  check('AC29a', `Admin chip + «Väntar på godkännande (2)» + «Behöver granskas (${REVIEW_N})»; no Dolda chip at 0`, chips.includes('Admin') && chips.includes('Väntar på godkännande (2)') && chips.includes(`Behöver granskas (${REVIEW_N})`) && !chips.includes('Dolda'), chips.replace(/\s+/g, ' '))
  const plain = await libraryTitles(adminPage)
  check('AC29b', 'Pending rows not in the normal list', !plain.includes(TA) && !plain.includes(TB), `${plain.length} titles`)
  await adminPage.locator('.admin-filter-chip', { hasText: 'Väntar på godkännande' }).click()
  const pend = await titleTexts(adminPage)
  check('AC29c', 'Pending chip shows exactly the two bot rows with «Väntar» badge', pend.length === 2 && pend.includes(TA) && pend.includes(TB) && (await adminPage.locator('.library-entry .admin-badge-pending').count()) === 2, pend.join(', '))
  check('AC29d', 'Väntar chip is pressed (aria-pressed)', (await adminPage.locator('.admin-filter-chip.active').getAttribute('aria-pressed')) === 'true')
  await shot(adminPage, 'admin_pending_list')
  await card(adminPage, TA).first().locator('.activity-card').click()
  const d = adminPage.locator('.activity-detail')
  await d.waitFor()
  await d.locator('.admin-detail').waitFor()
  check('AC29e', 'Pending detail: not addable to a pass', (await d.getByRole('button', { name: 'Lägg till i valt block' }).count()) === 0)
  const btns = await d.locator('.admin-actions button').allInnerTexts()
  check('AC29f', 'Pending detail: Godkänn · Ändra i banken; review hint; last changed by Planner', btns.join('|') === 'Godkänn|Ändra i banken' && (await d.innerText()).includes('Läs igenom texten.') && (await d.locator('.admin-last-changed').innerText()).includes('av Planner'), btns.join('|'))
  await shot(adminPage, 'admin_pending_detail')
  await d.getByRole('button', { name: 'Godkänn' }).click()
  await adminPage.getByText(UI.approved).waitFor()
  check('AC30a', 'Godkänn → toast + status published', sql(`select status from public.exercises where id = 'tech-test-formhopp-over-lagt-block'`) === 'published')
  await shot(adminPage, 'admin_approved_toast')
  const cache = await store(adminPage, CACHE_KEY)
  check('AC38a', 'This device updates at once: approved row in the coach cache, pending row never', cache.includes('tech-test-formhopp-over-lagt-block') && !cache.includes('tech-test-aggrullning-kil'))
})

await attempt('AC30', 'Another (anon) profile sees the approved row', async () => {
  const ctx = await newCtx('coach2')
  const page = await newPage(ctx, ON)
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  await page.reload()
  await startBlank(page)
  await openLibrary(page)
  const titles = await libraryTitles(page)
  check('AC30b', 'Coach sees the approved row, not the pending one', titles.includes(TA) && !titles.includes(TB), `${titles.length}`)
  check('AC33c', 'Coach profile: no review badge on bank rows', (await page.locator('.library-entry .review-badge').count()) === 0)
  const cache = await store(page, CACHE_KEY)
  check('AC38b', 'Coach cache has no pending row', !cache.includes('tech-test-aggrullning-kil'))
  await shot(page, 'coach_sees_approved')
  await ctx.close()
})

await attempt('AC31', 'Ändra i banken', async () => {
  const before = JSON.parse(sql(`select row_to_json(e) from (select tags, difficulty, progression_of, regression_of, visual_key, sort_order, status from public.exercises where id = 'tech-test-aggrullning-kil') e`))
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  await adminPage.locator('.admin-filter-chip', { hasText: 'Väntar på godkännande (1)' }).click()
  await card(adminPage, TB).first().locator('.activity-card').click()
  const d = adminPage.locator('.activity-detail')
  await d.locator('.admin-detail').waitFor()
  await d.getByRole('button', { name: 'Ändra i banken' }).click()
  const form = adminPage.locator('form.admin-bank-form')
  await form.waitFor()
  await shot(adminPage, 'admin_edit_form')
  const field = (label) => form.locator('label.own-field').filter({ hasText: label }).locator('input, textarea, select').first()
  // validation = own form: empty name → issue list, nothing saved
  const writesBefore = bankLog.filter((r) => r.method === 'PATCH').length
  await field('Namn').fill('')
  await form.getByRole('button', { name: 'Spara i banken' }).click()
  await adminPage.waitForTimeout(300)
  const nameInvalid = await field('Namn').evaluate((el) => !el.checkValidity())
  await field('Namn').fill(TB)
  await field('Varför').fill('')
  await form.getByRole('button', { name: 'Spara i banken' }).click()
  await adminPage.waitForTimeout(300)
  const issues = await form.locator('.own-issues').innerText().catch(() => '')
  check('AC31a', 'Validation as own form: empty Namn blocked (required, as own form), empty Varför → issue list; nothing sent', nameInvalid && issues.length > 0 && bankLog.filter((r) => r.method === 'PATCH').length === writesBefore && sql(`select title from public.exercises where id = 'tech-test-aggrullning-kil'`) === TB, issues.replace(/\s+/g, ' '))
  await shot(adminPage, 'admin_edit_validation')
  await field('Namn').fill('Äggrullning (redigerad)')
  await field('Minuter').fill('9')
  await field('Varför').fill('Ny sammanfattning från admin.')
  await field('Så gör du').fill('1. Steg ett.\n2. Steg två.\n3. Steg tre.')
  await field('Se upp för').fill('Nytt se upp för.')
  await field('Säkerhet').fill('Ny säkerhetsrad.')
  await field('Källa — länk').fill('https://example.org/video')
  await field('Källa — kanal').fill('Testkanal')
  await field('Starttid').fill('1:05')
  await form.locator('label.admin-form-check input').check()
  await form.getByRole('button', { name: 'Spara i banken' }).click()
  await adminPage.getByText(UI.saved).waitFor()
  const after = JSON.parse(sql(`select row_to_json(e) from (select title, duration_minutes_default, summary, how_to, watch_for, safety_line, source, experienced_coach_only, needs_coach_review, updated_by, updated_at, tags, difficulty, progression_of, regression_of, visual_key, sort_order, status, default_station_equipment from public.exercises where id = 'tech-test-aggrullning-kil') e`))
  check('AC31b', 'Saved fields in the row', after.title === 'Äggrullning (redigerad)' && after.duration_minutes_default === 9 && after.summary === 'Ny sammanfattning från admin.' && after.how_to === '1. Steg ett.\n2. Steg två.\n3. Steg tre.' && after.watch_for === 'Nytt se upp för.' && after.safety_line === 'Ny säkerhetsrad.' && after.source?.url === 'https://example.org/video' && after.source?.creator === 'Testkanal' && after.source?.startSeconds === 65 && after.experienced_coach_only === true, JSON.stringify(after).slice(0, 300))
  check('AC31c', 'Tags, difficulty, links, visual, sort order, status preserved', JSON.stringify([after.tags, after.difficulty, after.progression_of, after.regression_of, after.visual_key, after.sort_order, after.status]) === JSON.stringify([before.tags, before.difficulty, before.progression_of, before.regression_of, before.visual_key, before.sort_order, before.status]), JSON.stringify(before))
  check('AC32a', 'updated_by = admin e-mail; updated_at set', after.updated_by === ADMIN && Date.now() - Date.parse(after.updated_at) < 60000)
  check('AC33a', 'Saving clears needs_coach_review', after.needs_coach_review === false)
  const lc = await adminPage.locator('.activity-detail .admin-last-changed').innerText()
  check('AC32b', 'Detail shows «Senast ändrad … av admin@test.local»', /^Senast ändrad \d{1,2} [a-zé]{3} av admin@test\.local$/.test(lc), lc)
  await shot(adminPage, 'admin_saved_detail')
  // spoof updated_by with the admin's own token
  const tok = JSON.parse(await store(adminPage, AUTH_KEY)).access_token
  const spoof = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'PATCH', headers: { apikey: PUB, Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ updated_by: 'evil@spoof' }) })
  const sp = await spoof.json()
  check('AC32c', 'Client-sent updated_by is overwritten with the admin e-mail', sp[0]?.updated_by === ADMIN && sql(`select updated_by from public.exercises where id = 'tech-test-aggrullning-kil'`) === ADMIN, JSON.stringify(sp[0]?.updated_by))
  const del = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'DELETE', headers: { apikey: PUB, Authorization: `Bearer ${tok}` } })
  check('AC23a', 'Admin token DELETE refused by the database', del.status >= 400 && sql(`select count(*) from public.exercises where id = 'tech-test-aggrullning-kil'`) === '1', String(del.status))
})

await attempt('AC33', 'Markera som granskad', async () => {
  const REVIEW_N = Number(sql(`select count(*) from public.exercises where status = 'published' and needs_coach_review`))
  note(`review count now ${REVIEW_N} (16 seed rows + the approved bot row)`)
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  await adminPage.locator('.admin-filter-chip', { hasText: `Behöver granskas (${REVIEW_N})` }).click()
  const list = await titleTexts(adminPage)
  check('AC33b0', 'Review chip lists the flagged published rows with the review badge (admin only)', list.length === REVIEW_N && (await adminPage.locator('.library-entry .review-badge').count()) === REVIEW_N, `${list.length}`)
  await shot(adminPage, 'admin_review_chip')
  await card(adminPage, REVIEW_TITLE).first().locator('.activity-card').click()
  const d = adminPage.locator('.activity-detail')
  await d.locator('.admin-detail').waitFor()
  const textBefore = sql(`select md5(title || summary || how_to) from public.exercises where id = '${REVIEW_ID}'`)
  await d.locator('.admin-detail button', { hasText: 'Markera som granskad' }).click()
  await adminPage.locator('.admin-filter-chip', { hasText: `Behöver granskas (${REVIEW_N - 1})` }).waitFor()
  check('AC33b', 'Markera som granskad clears it without edit (text unchanged, count −1)', sql(`select needs_coach_review::text || '|' || updated_by from public.exercises where id = '${REVIEW_ID}'`) === `false|${ADMIN}` && sql(`select md5(title || summary || how_to) from public.exercises where id = '${REVIEW_ID}'`) === textBefore)
  await closeDetail(adminPage)
})

// ───────────────────────── AC 34: hide / unhide a mall drill ─────────────────────────
await attempt('AC34', 'Dölj för alla + Visa igen', async () => {
  // a coach saves a pass from the mall first (old pass that uses the drill)
  const cctx = await newCtx('coach3')
  const cp = await newPage(cctx, ON)
  await cp.getByRole('button', { name: 'Från mall' }).click()
  await cp.getByRole('button', { name: /Nybörjare/ }).first().click()
  const use = cp.getByRole('button', { name: 'Använd mall' })
  if (await use.isVisible().catch(() => false)) await use.click()
  await builderAction(cp, 'Spara utkast')
  await cp.waitForFunction(() => localStorage.getItem('gymnastics-planner-draft-v1') !== null, null, { timeout: 5000 })
  const draft = JSON.parse(await store(cp, 'gymnastics-planner-draft-v1'))
  const hasMall = draft.blocks.some((b) => b.items.some((i) => i.activityId === MALL_ID))
  note(`coach draft from mall contains ${MALL_ID}: ${hasMall}`)

  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  const d = await openDetail(adminPage, MALL_TITLE)
  await d.locator('.admin-detail').waitFor()
  check('AC34a', 'Published detail: Ändra i banken · Dölj för alla', (await d.locator('.admin-actions button').allInnerTexts()).join('|') === 'Ändra i banken|Dölj för alla')
  await d.getByRole('button', { name: 'Dölj för alla' }).click()
  const confirmText = await adminPage.locator('.admin-hide-confirm, [role=alertdialog]').first().innerText()
  check('AC34b', 'Confirm shows the title and adminHideUsedIn for a mall drill', confirmText.includes(`Dölja ”${MALL_TITLE}” för alla tränare?`) && confirmText.includes(UI.usedIn), confirmText.replace(/\s+/g, ' ').slice(0, 200))
  await shot(adminPage, 'admin_hide_confirm')
  await adminPage.getByRole('button', { name: 'Dölj', exact: true }).click()
  await adminPage.getByText('Dold för alla.').waitFor()
  check('AC34c', 'Status hidden in the DB', sql(`select status from public.exercises where id = '${MALL_ID}'`) === 'hidden')
  // coach after reload
  await cp.reload()
  await cp.waitForTimeout(1500)
  await cp.reload()
  await cp.getByRole('button', { name: /Fortsätt/ }).first().click()
  const rowsText = await cp.locator('.session-item').allInnerTexts()
  check('AC34d', 'Saved pass still resolves the hidden drill (title shown)', !hasMall || rowsText.some((t) => t.includes(MALL_TITLE)), rowsText.length + ' rows')
  await openLibrary(cp)
  const coachTitles = await libraryTitles(cp)
  check('AC34e', 'Hidden drill gone from Biblioteket for the coach', !coachTitles.includes(MALL_TITLE))
  await shot(cp, 'coach_hidden_gone_pass_kept')
  await cctx.close()
  // admin: Dolda (1) → Visa igen
  await closeDetail(adminPage)
  await adminPage.locator('.admin-filter-chip', { hasText: 'Dolda (1)' }).click()
  await adminPage.locator('.library-entry .activity-card').first().click()
  const d2 = adminPage.locator('.activity-detail')
  await d2.locator('.admin-detail').waitFor()
  check('AC34f', 'Hidden detail: «Dold» badge, Visa igen · Ändra i banken', (await d2.locator('.admin-badge-hidden').count()) === 1 && (await d2.locator('.admin-actions button').allInnerTexts()).join('|') === 'Visa igen|Ändra i banken')
  await shot(adminPage, 'admin_hidden_detail')
  await d2.getByRole('button', { name: 'Visa igen' }).click()
  await adminPage.getByText('Syns igen för alla.').waitFor()
  check('AC34g', 'Visa igen restores published', sql(`select status from public.exercises where id = '${MALL_ID}'`) === 'published')
  await closeDetail(adminPage)
})

await attempt('AC35', 'No delete control', async () => {
  const d = await openDetail(adminPage, 'Kullerbytta')
  await d.locator('.admin-detail').waitFor()
  const txt = await d.locator('.admin-detail').innerText()
  check('AC35a', 'Admin detail has no delete control', !/Ta bort|Radera|Delete/i.test(txt))
  await closeDetail(adminPage)
})

// ───────────────────────── AC 36: two tabs ─────────────────────────
await attempt('AC36', 'Two tabs edit the same exercise', async () => {
  const t1 = adminPage
  const t2 = await newPage(admin, ON)
  for (const p of [t1, t2]) {
    await p.goto(ON)
    await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
    await startBlank(p)
    await openLibrary(p)
    const d = await openDetail(p, 'Kullerbytta')
    await d.locator('.admin-detail').waitFor()
  }
  await t1.locator('.activity-detail').getByRole('button', { name: 'Ändra i banken' }).click()
  const f1 = t1.locator('form.admin-bank-form')
  await f1.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input').fill('Kullerbytta (flik 1)')
  await f1.getByRole('button', { name: 'Spara i banken' }).click()
  await t1.getByText(UI.saved).waitFor()
  await t2.locator('.activity-detail').getByRole('button', { name: 'Ändra i banken' }).click()
  const f2 = t2.locator('form.admin-bank-form')
  await f2.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input').fill('Kullerbytta (flik 2)')
  await f2.getByRole('button', { name: 'Spara i banken' }).click()
  await f2.locator('.admin-error').waitFor()
  check('AC36a', 'Second save → adminSaveConflict', (await f2.locator('.admin-error').innerText()) === UI.conflict)
  check('AC36b', 'First edit intact in the DB', sql(`select title from public.exercises where id = 'tech-kullerbytta'`) === 'Kullerbytta (flik 1)')
  await shot(t2, 'admin_conflict')
  await f2.getByRole('button', { name: 'Avbryt' }).click()
  await t2.close()
})

// ───────────────────────── AC 37: offline ─────────────────────────
await attempt('AC37', 'Offline admin', async () => {
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  const d = await openDetail(adminPage, 'Kullerbytta (flik 1)')
  await d.locator('.admin-detail').waitFor()
  const before = bankLog.length
  await admin.setOffline(true)
  await adminPage.waitForTimeout(300)
  check('AC37a', 'adminOffline line shown', (await d.locator('.admin-offline').innerText()) === UI.offline)
  const states = await d.locator('.admin-actions button').evaluateAll((els) => els.map((e) => e.disabled))
  check('AC37b', 'All admin actions disabled', states.length > 0 && states.every(Boolean), JSON.stringify(states))
  await shot(adminPage, 'admin_offline')
  await adminPage.waitForTimeout(500)
  await admin.setOffline(false)
  await adminPage.waitForTimeout(1000)
  check('AC37c', 'Nothing queued: no write sent after coming back online', bankLog.slice(before).filter((r) => r.method !== 'GET' && r.url.includes('/rest/v1/')).length === 0)
  check('AC37d', 'Buttons enabled again online', (await d.locator('.admin-actions button').evaluateAll((els) => els.every((e) => !e.disabled))))
  await closeDetail(adminPage)
})

// ───────────────────────── AC 39: coach data stays local ─────────────────────────
await attempt('AC39', 'No coach data leaves the device as admin', async () => {
  const writes = bankLog.filter((r) => r.ctx === 'admin' && r.method !== 'GET' && r.method !== 'OPTIONS')
  const allowed = writes.every((r) => {
    const p = new URL(r.url).pathname
    if (p === '/auth/v1/otp' || p === '/auth/v1/token' || p === '/auth/v1/logout') return true
    if (p === '/rest/v1/exercises' && r.method === 'PATCH') {
      const keys = Object.keys(JSON.parse(r.body ?? '{}'))
      return keys.every((k) => ['title', 'block_type', 'duration_minutes_default', 'summary', 'how_to', 'watch_for', 'safety_line', 'default_station_equipment', 'source', 'experienced_coach_only', 'status', 'needs_coach_review'].includes(k))
    }
    return false
  })
  check('AC39a', 'Admin writes: only auth calls + PATCH of bank columns on exercises', allowed, writes.map((r) => r.method + ' ' + new URL(r.url).pathname).join(', '))
  const leak = bankLog.filter((r) => r.ctx === 'admin' && /Delat testpass|gymnastics-planner-draft|own-/.test((r.body ?? '') + r.url))
  check('AC39b', 'No pass / own exercise / draft data in any request', leak.length === 0)
  check('AC39c', 'No DELETE request ever sent', bankLog.every((r) => r.method !== 'DELETE'))
})

// ───────────────────────── AC 44: revoked bot key ─────────────────────────
await attempt('AC44', 'Revoked bot key', async () => {
  const keysFile = ENV.botKeysFile
  const saved = readFileSync(keysFile, 'utf8')
  const oldKey = botKey()
  writeFileSync(keysFile, '') // "delete planner-bot in the dashboard"
  try {
    const r = spawnSync('bun', [`${ROOT}/tools/bank/push-promote.ts`, `${ROOT}/tools/bank/fixtures/promote-2.json`], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_PLANNER_BOT_KEY: oldKey, SUPABASE_URL: GATEWAY },
    })
    check('AC44a', 'Script fails clearly (Nyckeln fungerar inte längre)', r.status === 1 && r.stdout.includes('Nyckeln fungerar inte längre') && !r.stdout.includes(oldKey), r.stdout.trim().split('\n').at(-1))
    const ctx = await newCtx('coach4')
    const page = await newPage(ctx, ON)
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
    await startBlank(page)
    await openLibrary(page)
    check('AC44b', 'App unaffected (coach bank loads, no stale line)', (await libraryTitles(page)).length >= 51 && (await staleCount(page)) === 0)
    await ctx.close()
  } finally {
    writeFileSync(keysFile, saved)
  }
})

// ───────────────────────── AC 48: Slice 31 regressions ─────────────────────────
await attempt('AC48', 'Slice 31 behaviour', async () => {
  // vars unset = today's app
  const off = await newCtx('regress-off')
  const before = bankLog.length
  const p = await newPage(off, OFF)
  await startBlank(p)
  await openLibrary(p)
  const t = await libraryTitles(p)
  check('AC48a', 'Bank off: bundled 51, no stale line, no request', t.length === 51 && (await staleCount(p)) === 0 && bankLog.length === before)
  await off.close()
  // offline-first: cached copy, then bank down → cached titles + stale only in Biblioteket
  const c = await newCtx('regress-on')
  const page = await newPage(c, ON)
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  c.bankDown = true
  await page.reload()
  await page.waitForTimeout(800)
  check('AC48b', 'Home: no stale line when the bank is down', (await staleCount(page)) === 0)
  await shot(page, 'regress_home_bank_down')
  await startBlank(page)
  await openLibrary(page)
  const ct = await libraryTitles(page)
  check('AC48c', 'Biblioteket: cached bank (incl. approved row + flik-1 title) + stale line', ct.includes(TA) && ct.includes('Kullerbytta (flik 1)') && (await staleCount(page)) === 1)
  await shot(page, 'regress_library_stale')
  await closeLibrary(page)
  check('AC48d', 'Stale line only in Biblioteket (builder, library closed)', (await staleCount(page)) === 0)
  await c.close()
  // wizard + mall
  const w = await newCtx('regress-wizard')
  const wp = await newPage(w, ON)
  await wp.getByRole('button', { name: 'Planera pass' }).click()
  const wz = wp.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click()
  await wz.getByRole('button', { name: 'Skapa pass' }).click()
  const draft = JSON.parse(await store(wp, 'gymnastics-planner-draft-v1'))
  check('AC48e', 'Planera pass wizard still fills five blocks', draft.blocks.filter((b) => b.items.length > 0).length === 5)
  await w.close()
})

// ───────────────────────── AC 25 end: Logga ut ─────────────────────────
await attempt('AC25h', 'Logga ut', async () => {
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await adminPage.locator('footer .footer-admin-logout').click()
  await adminPage.locator('footer .footer-admin-login').waitFor()
  check('AC25h', 'Logga ut removes gymnastics-planner-admin-auth-v1; footer back to «Logga in som admin»', (await store(adminPage, AUTH_KEY)) === null && (await footerText(adminPage)).includes(UI.login))
  const cache = await store(adminPage, CACHE_KEY)
  check('AC38c', 'After logout the cache still holds no pending rows', !cache.includes('tech-test-aggrullning-kil'))
  await shot(adminPage, 'admin_logged_out')
})
await admin.close()

check('E', 'No page errors', pageErrors.length === 0, pageErrors.join(' | '))
check('N', 'Every coach-context bank request was a GET with the publishable key and no Authorization',
  bankLog.filter((r) => /^coach|^regress/.test(r.ctx)).every((r) => r.method === 'GET' && r.headers.apikey === PUB && !r.headers.authorization))

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-32-smoke-results.json`, JSON.stringify({ results, notes, bankRequests: bankLog.length, botOutput: botOut }, null, 2))
await browser.close()

// Slice 33 — Builder self-smoke: admin login with a 6-digit e-mail code, 390×844.
// Local stand-ins only (never the real project):
//   bash verifier/slice-33-local/up.sh      (GoTrue + PostgREST + gateway + SMTP sink in /tmp/s33, 12c mail template)
//   plain build preview on :4195; bank build (VITE_SUPABASE_URL=https://bank-mock.supabase.co,
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32) preview on :4196.
// Browser requests to https://bank-mock.supabase.co/** are forwarded unchanged to the local gateway
// → GoTrue (real signInWithOtp / verifyOtp) and PostgREST (schema-31 + 32, real RLS).
// Login mails land in $S32_DIR/mail via the SMTP sink; the code is read from the mail. Codes never
// go into the results file, the console or a screenshot (code field masked on step-2 shots).
// Run on a FRESH stand-in (the Slice 32 regression part edits seeded rows): down.sh && up.sh first.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'

const OFF = process.env.S33_OFF_URL ?? 'http://127.0.0.1:4195/traningsplaneringen/'
const ON = process.env.S33_ON_URL ?? 'http://127.0.0.1:4196/traningsplaneringen/'
const BANK_HOST = 'https://bank-mock.supabase.co'
const ROOT = '/workspace/gymnastics-planner'
const S32 = process.env.S32_DIR ?? '/tmp/s33'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const PUB = ENV.publishableKey
const CACHE_KEY = 'gymnastics-planner-bank-cache-v1'
const AUTH_KEY = 'gymnastics-planner-admin-auth-v1'
const VERIFIER_KEY = `${AUTH_KEY}-code-verifier`
const PENDING_KEY = 'gymnastics-planner-admin-pending-v1'
const STALE = 'Visar sparade övningar. Du kan planera som vanligt.'
const ADMIN = 'admin@test.local'
const ADMIN2 = 'admin2@test.local'
const ADMIN3 = 'admin3@test.local'
const NONADMIN = 'nonadmin@test.local'
const UNKNOWN = 'okand@test.local'
const UNKNOWN2 = 'okand2@test.local'
const SHARE_TOKEN = execFileSync('bun', [`${ROOT}/verifier/slice-32-local/mktoken.ts`], { encoding: 'utf8' }).trim()

// Slice 33 strings straight from slice-33/content/microcopy.sv.md (AC 26 compares the app to these).
const MD = readFileSync(`${ROOT}/slice-33/content/microcopy.sv.md`, 'utf8')
const md = (key) => {
  const m = MD.match(new RegExp('^\\| `' + key + '`(?: \\*\\*\\w+\\*\\*)? \\| ([^|]+?) \\|', 'm'))
  if (!m) throw new Error('no microcopy key ' + key)
  return m[1].trim()
}
const S = Object.fromEntries(
  ['adminLoginTitle', 'adminLoginHint', 'adminEmailLabel', 'adminSendCode', 'adminWait', 'adminSendFailed', 'adminCodeSent', 'adminCodeLabel', 'adminCodePlaceholder', 'adminVerify', 'adminCodeWrong', 'adminVerifyWait', 'adminVerifyFailed', 'adminResend', 'adminResendSoon', 'adminCodeResent', 'adminChangeEmail', 'adminCloseAria', 'footerSliceLabel'].map((k) => [k, md(k)]),
)
const sentTo = (email) => S.adminCodeSent.replace('{email}', email)
const UI = {
  login: 'Logga in som admin',
  logout: 'Logga ut',
  notAdmin: 'Du är inloggad men inte admin.',
  offline: 'Du behöver nät för att ändra i banken.',
  conflict: 'Någon annan har ändrat övningen. Stäng och öppna den igen.',
  usedIn: 'Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras.',
  approved: 'Godkänd. Tränarna ser den nästa gång de öppnar appen.',
  saved: 'Sparat i banken.',
}

const results = []
const notes = []
const seenTexts = [] // every sheet text seen (AC 26)
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const pageErrors = []
const bankLog = []
const assetLog = []

async function newCtx(label, init) {
  const ctx = await browser.newContext({ ...phone, permissions: ['clipboard-read', 'clipboard-write'] })
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
    } catch {
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
const shot = (page, n, mask = []) => page.screenshot({ path: `/workspace/screenshots/slice33_${n}.png`, mask, maskColor: '#c7c2bd' })
const store = (page, k) => page.evaluate((key) => localStorage.getItem(key), k)
const ADMIN_CHUNK = /^(dist|session|adminBank|bankWrite|AdminLoginSheet|AdminDetailPanel|AdminBankForm|loginCode)-/
const chunksOf = (label) => assetLog.filter((a) => a.ctx === label).map((a) => a.url.split('/').pop())
const authReqs = (label) => bankLog.filter((r) => r.ctx === label && r.url.includes('/auth/v1/'))

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


// ───────────────────────── mail + sheet helpers ─────────────────────────
function mails(to) {
  return readdirSync(`${S32}/mail`)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ f, t: statSync(`${S32}/mail/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${S32}/mail/${f}`, 'utf8')) }))
    .filter((x) => JSON.stringify(x.m.to).includes(to))
    .sort((a, b) => a.t - b.t)
}
async function waitMail(to, after) {
  for (let i = 0; i < 60; i++) {
    const m = mails(to).filter((x) => x.t > after)
    if (m.length) return m.at(-1).m
    await sleep(250)
  }
  throw new Error(`no mail for ${to}`)
}
const codeOf = (m) => (m.subject.match(/\b(\d{6})\b/) ?? [])[1]
const otpReqs = (label) => bankLog.filter((r) => r.ctx === label && r.method === 'POST' && r.url.includes('/auth/v1/otp'))
const verifyReqs = (label) => bankLog.filter((r) => r.ctx === label && r.method === 'POST' && r.url.includes('/auth/v1/verify'))

const dialog = (page) => page.getByRole('dialog', { name: UI.login })
const codeInput = (page) => dialog(page).locator('input.admin-code-input')
const emailInput = (page) => dialog(page).locator('input[type=email]')
const verifyBtn = (page) => dialog(page).getByRole('button', { name: S.adminVerify, exact: true })
const resendBtn = (page) => dialog(page).getByRole('button', { name: S.adminResend, exact: true })
const changeBtn = (page) => dialog(page).getByRole('button', { name: S.adminChangeEmail, exact: true })
const statusText = async (page) => (await dialog(page).locator('#admin-code-status').innerText()).trim()
const errorLine = (page) => dialog(page).locator('#admin-code-error')
const active = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!el) return {}
    const sel = 'selectionStart' in el && el.selectionStart !== null ? { start: el.selectionStart, end: el.selectionEnd, len: el.value.length } : null
    return { cls: el.className, type: el.getAttribute('type'), sel }
  })
async function remember(page) {
  if (await dialog(page).count()) seenTexts.push(await dialog(page).innerText())
}
async function openSheet(page) {
  await page.locator('footer .footer-admin-login').click()
  await dialog(page).waitFor()
  await remember(page)
  return dialog(page)
}
async function sendCode(page, email) {
  await openSheet(page)
  await emailInput(page).fill(email)
  await dialog(page).getByRole('button', { name: S.adminSendCode, exact: true }).click()
  await codeInput(page).waitFor()
  await remember(page)
}
async function typeCode(page, code) {
  await codeInput(page).fill('')
  await codeInput(page).pressSequentially(code)
}
async function loginWith(page, code) {
  await typeCode(page, code)
  await verifyBtn(page).click()
}
async function paste(page, text) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text)
  await codeInput(page).focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.press('ControlOrMeta+V')
  await page.waitForTimeout(50)
  return codeInput(page).inputValue()
}
const scrollW = (page) => page.evaluate(() => document.documentElement.scrollWidth)
const fontPx = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
async function inView(page, loc) {
  const b = await loc.boundingBox()
  const vp = page.viewportSize()
  return !!b && b.y >= 0 && b.y + b.height <= vp.height && b.x >= 0 && b.x + b.width <= vp.width
}
async function reachable(page, loc) {
  await loc.scrollIntoViewIfNeeded()
  return inView(page, loc)
}
const maskCode = (page) => [codeInput(page)]

// ───────────── fixtures: more confirmed users (auth admin API, as users.sh) ─────────────
for (const e of [ADMIN2, ADMIN3]) {
  await fetch(`${GATEWAY}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: botKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: e, email_confirm: true, password: 'local-' + Math.random().toString(36).slice(2) }),
  })
}
sql(`insert into public.admins (user_id, email, note) select id, email, 'smoke' from auth.users where email in ('${ADMIN2}', '${ADMIN3}') on conflict (user_id) do nothing;`)
note(`users: ${sql(`select string_agg(email, ', ' order by email) from auth.users`)} · admins: ${sql(`select string_agg(email, ', ' order by email) from public.admins`)}`)

// ───────────────────────── AC 21: coach visit ─────────────────────────
await attempt('AC21', 'Coach visit', async () => {
  const off = await newCtx('coach-off')
  const op = await newPage(off, OFF)
  await startBlank(op)
  const f0 = await footerText(op)
  check('AC26a', 'Plain build footer: «Träningsplaneraren · Slice 33», no admin link (vars unset)', f0.startsWith(S.footerSliceLabel) && !f0.includes(UI.login), f0)
  await off.close()

  const c = await newCtx('coach')
  const page = await newPage(c, ON)
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  const fh = await footerText(page)
  check('AC21a', 'Home footer: only «Logga in som admin»', fh.includes(UI.login) && !fh.includes(UI.logout), fh)
  await shot(page, 'coach_home')
  await startBlank(page)
  const f = await footerText(page)
  check('AC26b', 'Bank build footer reads «Träningsplaneraren · Slice 33 · Logga in som admin»', f.startsWith(`${S.footerSliceLabel} · ${UI.login}`), f)
  await openLibrary(page)
  await page.waitForTimeout(500)
  const js = chunksOf('coach')
  check('AC21b', 'No supabase-js / admin chunk downloaded on a coach visit', !js.some((n) => ADMIN_CHUNK.test(n)), js.join(', '))
  const reqs = bankLog.filter((r) => r.ctx === 'coach')
  check('AC21c', 'Coach requests: only the two Slice 31 GETs (publishable key, no Authorization), no auth request', reqs.length === 2 && reqs.every((r) => r.method === 'GET' && r.headers.apikey === PUB && !r.headers.authorization && r.url.includes('/rest/v1/')), reqs.map((r) => r.method + ' ' + new URL(r.url).pathname).join(', '))
  check('AC21d', 'No admin UI in Biblioteket (no chip, filter, badge)', (await page.locator('.admin-bar, .admin-filter-chip, .admin-badge, .admin-detail').count()) === 0)
  check('AC21e', 'No auth / verifier / pending key in storage', (await store(page, AUTH_KEY)) === null && (await store(page, VERIFIER_KEY)) === null && (await store(page, PENDING_KEY)) === null)
  await shot(page, 'coach_library')
  await c.close()
})

// ───────────────────────── AC 18 / 20: old link URLs + share link ─────────────────────────
await attempt('AC18', 'Old link URLs in a fresh profile', async () => {
  const cases = [
    ['old-code', '?code=abc'],
    ['old-error', '?error=access_denied&error_code=otp_expired&error_description=x#error=access_denied&error_code=otp_expired&sb='],
  ]
  for (const [label, suffix] of cases) {
    const ctx = await newCtx(label)
    const page = await newPage(ctx, ON + suffix)
    await page.getByRole('button', { name: 'Planera pass' }).waitFor()
    await page.waitForTimeout(800)
    const url = page.url()
    check(`AC18-${label}a`, `${suffix.slice(0, 24)}… → Home, address cleaned to …/traningsplaneringen/`, url === ON, url.replace(ON, '…/'))
    check(`AC18-${label}b`, 'No login sheet, no message, no error', (await dialog(page).count()) === 0 && (await page.locator('[role=alert], .toast').count()) === 0)
    const js = chunksOf(label)
    check(`AC18-${label}c`, 'No supabase-js / admin chunk and no auth request', !js.some((n) => ADMIN_CHUNK.test(n)) && authReqs(label).length === 0, js.join(', '))
    check(`AC18-${label}d`, 'Footer still «Logga in som admin» (logged out)', (await footerText(page)).includes(UI.login))
    await shot(page, `old_url_${label}`)
    await ctx.close()
  }
})
await attempt('AC20', 'Share link with an old ?code=', async () => {
  const ctx = await newCtx('share')
  const page = await newPage(ctx, `${ON}?code=abc#dela=${SHARE_TOKEN}`)
  await page.getByText('Delat testpass').first().waitFor({ timeout: 10000 })
  const u = new URL(page.url())
  check('AC20a', '?code=abc#dela=<token> → shared pass opens, hash kept, code dropped', u.hash === `#dela=${SHARE_TOKEN}` && !u.search.includes('code'), u.pathname + u.search + u.hash.slice(0, 12) + '…')
  check('AC20b', 'No admin chunk / auth request for that visit', !chunksOf('share').some((n) => ADMIN_CHUNK.test(n)) && authReqs('share').length === 0)
  await shot(page, 'share_with_old_code')
  await ctx.close()
})

// ───────────────────────── AC 2/3: unknown e-mail ─────────────────────────
await attempt('AC3', 'Unknown e-mail', async () => {
  const ctx = await newCtx('unknown')
  const page = await newPage(ctx, ON)
  const usersBefore = sql(`select count(*) from auth.users`)
  const t0 = Date.now()
  await sendCode(page, UNKNOWN)
  check('AC3a', 'Unknown address → step 2 with the same adminCodeSent text', (await statusText(page)) === sentTo(UNKNOWN), await statusText(page))
  await page.waitForTimeout(1200)
  check('AC3b', 'No user created (shouldCreateUser false)', sql(`select count(*) from auth.users`) === usersBefore && sql(`select count(*) from auth.users where email = '${UNKNOWN}'`) === '0')
  check('AC3c', 'No mail to the unknown address', mails(UNKNOWN).filter((x) => x.t > t0).length === 0)
  const otp = otpReqs('unknown')
  const body = otp[0] ? JSON.parse(otp[0].body) : {}
  check('AC2a', 'One POST /auth/v1/otp with "create_user": false and no redirect_to (URL or body)', otp.length === 1 && body.create_user === false && !('redirect_to' in body) && !otp[0].url.includes('redirect_to'), JSON.stringify(Object.keys(body)) + ' ' + otp[0]?.url.replace(BANK_HOST, ''))
  await shot(page, 'step2_unknown_email', maskCode(page))
  await ctx.close()
})

// ───────────────────────── admin main flow: send now, resend after 60 s (later) ─────────────────────────
const admin = await newCtx('admin')
let adminPage
let tA = 0
let codeA1 = ''
await attempt('AC8', 'Step 1 and step 2 DOM (admin)', async () => {
  adminPage = await newPage(admin, ON)
  await openSheet(adminPage)
  const d = dialog(adminPage)
  check('AC26c', 'Step 1 texts: heading, hint, label, button', (await d.locator('h2').innerText()) === S.adminLoginTitle && (await d.locator('#admin-login-hint').innerText()) === S.adminLoginHint && (await d.getByLabel(S.adminEmailLabel).count()) === 1 && (await d.getByRole('button', { name: S.adminSendCode, exact: true }).count()) === 1)
  check('AC26d', 'E-mail field: type email, autocomplete email, no placeholder, hint via aria-describedby', (await emailInput(adminPage).getAttribute('autocomplete')) === 'email' && (await emailInput(adminPage).getAttribute('placeholder')) === null && (await emailInput(adminPage).getAttribute('aria-describedby')) === 'admin-login-hint')
  check('AC26e', 'Skicka kod disabled while the field is empty', await d.getByRole('button', { name: S.adminSendCode, exact: true }).isDisabled())
  check('AC23a', 'Step 1 at 390×844: heading, field, button visible; no horizontal scroll; e-mail font ≥ 16px', (await inView(adminPage, d.locator('h2'))) && (await inView(adminPage, emailInput(adminPage))) && (await inView(adminPage, d.getByRole('button', { name: S.adminSendCode }))) && (await scrollW(adminPage)) <= 390 && (await fontPx(emailInput(adminPage))) >= 16, `scrollWidth ${await scrollW(adminPage)}, font ${await fontPx(emailInput(adminPage))}`)
  check('AC26f', 'Close button has adminCloseAria', (await d.getByRole('button', { name: S.adminCloseAria }).count()) === 1)
  await shot(adminPage, 'step1_email')
  await emailInput(adminPage).fill(ADMIN)
  tA = Date.now()
  await d.getByRole('button', { name: S.adminSendCode, exact: true }).click()
  await codeInput(adminPage).waitFor()
  await remember(adminPage)
  const mA = await waitMail(ADMIN, tA - 1)
  codeA1 = codeOf(mA)
  // AC 1: mail
  const body = mA.body ?? ''
  const text = body.replace(/<[^>]+>/g, ' ')
  const digits = text.match(/\b\d{6}\b/g) ?? []
  check('AC1a', 'Mail subject «Din kod till Träningsplaneraren: ######» (12c)', /^Din kod till Träningsplaneraren: \d{6}$/.test(mA.subject), mA.subject.replace(/\d{6}/, '######'))
  check('AC1b', 'Mail body = 12c text with exactly one 6-digit code, same as the subject', body.includes('Här är din kod för att logga in som admin i Träningsplaneraren:') && body.includes('Skriv koden i appen. Den gäller i en timme och fungerar en gång.') && body.includes('Bad du inte om en kod? Då kan du strunta i det här mejlet.') && digits.length === 1 && digits[0] === codeA1)
  check('AC1c', 'Mail has no link (no <a href, no /auth/v1/verify, no URL)', !/<a\s|href=|\/auth\/v1\/verify|https?:\/\//i.test(body) && (mA.links ?? []).length === 0)
  // AC 2
  const otp = otpReqs('admin')
  const ob = JSON.parse(otp[0].body)
  check('AC2b', 'Skicka kod → one POST /auth/v1/otp, create_user false, no redirect_to', otp.length === 1 && ob.create_user === false && !('redirect_to' in ob) && !otp[0].url.includes('redirect_to') && ob.email === ADMIN)
  // step 2 DOM (AC 8) + focus (AC 11)
  const ci = codeInput(adminPage)
  const attrs = await ci.evaluate((el) => ({ type: el.getAttribute('type'), inputmode: el.getAttribute('inputmode'), ac: el.getAttribute('autocomplete'), pattern: el.getAttribute('pattern'), maxlength: el.getAttribute('maxlength'), placeholder: el.getAttribute('placeholder'), describedby: el.getAttribute('aria-describedby'), label: el.closest('label')?.querySelector('span')?.textContent }))
  check('AC8a', 'Code input: type text, inputmode numeric, autocomplete one-time-code, pattern [0-9]{6}, no maxlength', attrs.type === 'text' && attrs.inputmode === 'numeric' && attrs.ac === 'one-time-code' && attrs.pattern === '[0-9]{6}' && attrs.maxlength === null, JSON.stringify(attrs))
  check('AC8b', 'Label adminCodeLabel (accessible name), placeholder adminCodePlaceholder', attrs.label === S.adminCodeLabel && (await dialog(adminPage).getByLabel(S.adminCodeLabel).count()) === 1 && attrs.placeholder === S.adminCodePlaceholder)
  check('AC8c', 'Code input computed font size ≥ 16px', (await fontPx(ci)) >= 16, `${await fontPx(ci)}px`)
  check('AC26g', 'aria-describedby → the adminCodeSent line (role=status)', attrs.describedby === 'admin-code-status' && (await dialog(adminPage).locator('#admin-code-status').getAttribute('role')) === 'status')
  check('AC26h', 'Step 2 opens with adminCodeSent and the typed address', (await statusText(adminPage)) === sentTo(ADMIN))
  const a = await active(adminPage)
  check('AC11a', 'Step 2 opens with focus in the code field', String(a.cls).includes('admin-code-input'), a.cls)
  // AC 16 part 1: cooldown
  check('AC16a', 'Skicka ny kod disabled right after the send, adminResendSoon shown, aria-describedby → it', (await resendBtn(adminPage).isDisabled()) && (await dialog(adminPage).locator('#admin-resend-soon').innerText()) === S.adminResendSoon && (await resendBtn(adminPage).getAttribute('aria-describedby')) === 'admin-resend-soon')
  check('AC26i', 'No countdown numbers next to Skicka ny kod', !/\d/.test(await dialog(adminPage).locator('.admin-resend-row').innerText()))
  // AC 23 step 2
  const dd = dialog(adminPage)
  check('AC23b', 'Step 2 at 390×844: heading, field, Logga in visible; no horizontal scroll', (await inView(adminPage, dd.locator('h2'))) && (await inView(adminPage, ci)) && (await inView(adminPage, verifyBtn(adminPage))) && (await scrollW(adminPage)) <= 390, `scrollWidth ${await scrollW(adminPage)}`)
  await shot(adminPage, 'step2_code_sent', maskCode(adminPage))
  // keyboard open ≈ 390×450 visible area
  await adminPage.setViewportSize({ width: 390, height: 450 })
  await adminPage.waitForTimeout(150)
  const r1 = await reachable(adminPage, ci)
  const r2 = await reachable(adminPage, verifyBtn(adminPage))
  const r3 = await reachable(adminPage, resendBtn(adminPage))
  const r4 = await reachable(adminPage, changeBtn(adminPage))
  check('AC23c', 'Short viewport (390×450, keyboard-sized): field, Logga in, Skicka ny kod, Byt e-post reachable by scrolling; no horizontal scroll', r1 && r2 && r3 && r4 && (await scrollW(adminPage)) <= 390, JSON.stringify([r1, r2, r3, r4]))
  await shot(adminPage, 'step2_short_viewport', maskCode(adminPage))
  await adminPage.setViewportSize({ width: 390, height: 844 })
})

await attempt('AC7', 'Code field typing + paste (admin, code not used yet)', async () => {
  const p = adminPage
  const ci = codeInput(p)
  await ci.fill('')
  await ci.pressSequentially('12345')
  const dis5 = await verifyBtn(p).isDisabled()
  await ci.pressSequentially('6')
  const en6 = await verifyBtn(p).isEnabled()
  await ci.pressSequentially('7')
  const v7 = await ci.inputValue()
  check('AC7a', 'Logga in disabled at 5 digits, enabled at 6; a 7th digit is not added', dis5 && en6 && v7 === '123456', v7)
  await ci.fill('')
  await ci.pressSequentially('a1b-2 c3!x')
  const vl = await ci.inputValue()
  check('AC7b', 'Letters and symbols typed are dropped', vl === '123', vl)
  const zeroDisabled = await (async () => { await ci.fill(''); return verifyBtn(p).isDisabled() })()
  check('AC7c', 'Logga in disabled with 0 digits', zeroDisabled)
  const pastes = {}
  for (const t of ['123456', '123 456', ' 123456 ', '123-456']) pastes[t] = [await paste(p, t), await verifyBtn(p).isEnabled()]
  const pasteOk = Object.values(pastes).every(([v, en]) => v === '123456' && en)
  check('AC9a', 'Paste (clipboard + Ctrl/Cmd+V) of 123456, «123 456», « 123456 », 123-456 → 123456, Logga in enabled', pasteOk, JSON.stringify(pastes))
  const short = await paste(p, '12 34')
  check('AC9b', 'Paste «12 34» → 1234, Logga in disabled', short === '1234' && (await verifyBtn(p).isDisabled()), short)
  await shot(p, 'step2_paste_1234')
  const fw = await paste(p, '１２３４５６')
  check('AC9c', 'Paste full-width digits → 123456 (unit test covers it too)', fw === '123456', fw)
  await ci.fill('')
  await p.keyboard.insertText('987654')
  check('AC10-local', 'Autofill-style insert (one input event with 6 digits) fills the field and enables Logga in', (await ci.inputValue()) === '987654' && (await verifyBtn(p).isEnabled()))
  await ci.fill('')
})

await attempt('AC6', 'Pending login survives a reload (admin)', async () => {
  const p = adminPage
  const pending = JSON.parse((await store(p, PENDING_KEY)) ?? 'null')
  check('AC6a', 'Pending entry {email, sentAt} stored after the send (no code in it)', pending?.email === ADMIN && typeof pending?.sentAt === 'number' && !JSON.stringify(pending).includes(codeA1))
  await p.reload()
  await p.locator('footer .footer-admin-login').waitFor()
  check('AC6b', 'Reload does not start admin or open the sheet by itself', (await dialog(p).count()) === 0 && (await footerText(p)).includes(UI.login))
  await openSheet(p)
  await codeInput(p).waitFor({ timeout: 3000 })
  const a = await active(p)
  check('AC6c', 'Logga in som admin after reload → step 2, same address in adminCodeSent, focus in code field, resend still cooling down', (await statusText(p)) === sentTo(ADMIN) && String(a.cls).includes('admin-code-input') && (await resendBtn(p).isDisabled()))
  await shot(p, 'step2_after_reload', maskCode(p))
})

// ───────────────────────── admin2: wrong code → fix, offline verify, success focus ─────────────────────────
const admin2 = await newCtx('admin2')
await attempt('AC12', 'Wrong code, offline verify, then the right code (admin2)', async () => {
  const p = await newPage(admin2, ON)
  const t0 = Date.now()
  await sendCode(p, ADMIN2)
  const code = codeOf(await waitMail(ADMIN2, t0 - 1))
  const wrong = code.slice(0, 5) + String((Number(code[5]) + 1) % 10)
  await loginWith(p, wrong)
  await errorLine(p).waitFor()
  const ci = codeInput(p)
  const a = await active(p)
  check('AC12a', 'Wrong code (one digit changed) → adminCodeWrong under the field (role=alert), aria-invalid=true, digits kept', (await errorLine(p).innerText()) === S.adminCodeWrong && (await errorLine(p).getAttribute('role')) === 'alert' && (await ci.getAttribute('aria-invalid')) === 'true' && (await ci.inputValue()) === wrong)
  check('AC11b', 'After adminCodeWrong: focus in the field with its text selected', String(a.cls).includes('admin-code-input') && a.sel && a.sel.start === 0 && a.sel.end === 6, JSON.stringify(a.sel))
  check('AC12b', 'Sheet stays open, still logged out, aria-describedby includes the error line', (await dialog(p).count()) === 1 && (await store(p, AUTH_KEY)) === null && (await ci.getAttribute('aria-describedby')) === 'admin-code-status admin-code-error')
  await remember(p)
  await shot(p, 'step2_wrong_code', maskCode(p))
  await p.keyboard.press('Backspace')
  check('AC12c', 'aria-invalid cleared on the next change', (await ci.getAttribute('aria-invalid')) === null)
  await typeCode(p, code)
  await admin2.setOffline(true)
  const vBefore = verifyReqs('admin2').length
  await verifyBtn(p).click()
  await errorLine(p).filter({ hasText: S.adminVerifyFailed }).waitFor()
  check('AC15c', 'Offline on Logga in → adminVerifyFailed, digits kept, no request', (await errorLine(p).innerText()) === S.adminVerifyFailed && (await ci.inputValue()) === code && verifyReqs('admin2').length === vBefore)
  await remember(p)
  await shot(p, 'step2_verify_offline', maskCode(p))
  await admin2.setOffline(false)
  await p.waitForTimeout(200)
  await verifyBtn(p).click()
  await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  const vr = verifyReqs('admin2').at(-1)
  const vb = JSON.parse(vr.body)
  check('AC12d', 'Back online, same button → logged in; sheet closed, error gone', (await dialog(p).count()) === 0 && (await footerText(p)).includes('Admin · Logga ut'))
  check('AC2c', 'Logga in → POST /auth/v1/verify {email, token, type:"email"}', vb.email === ADMIN2 && vb.type === 'email' && typeof vb.token === 'string' && vb.token.length === 6, JSON.stringify(Object.keys(vb)))
  const a2 = await active(p)
  check('AC11c', 'After success, focus is on the footer «Logga ut»', String(a2.cls).includes('footer-admin-logout'), a2.cls)
  check('AC24a', 'After login: session stored; verifier + pending keys removed', (await store(p, AUTH_KEY)) !== null && (await store(p, VERIFIER_KEY)) === null && (await store(p, PENDING_KEY)) === null)
  await admin2.close()
})

// ───────────────────────── admin3: offline send, rate limit, Byt e-post, verify 429, expired code ─────────────────────────
const admin3 = await newCtx('admin3')
await attempt('AC14', 'Offline send, rate limit, Byt e-post, verify-side 429, expired code (admin3)', async () => {
  const p = await newPage(admin3, ON)
  await openSheet(p)
  await emailInput(p).fill(ADMIN3)
  await admin3.setOffline(true)
  await dialog(p).getByRole('button', { name: S.adminSendCode, exact: true }).click()
  await dialog(p).locator('.admin-send-error').waitFor()
  check('AC15a', 'Offline on Skicka kod → adminSendFailed (role=alert), step 1 stays with the address', (await dialog(p).locator('.admin-send-error').innerText()) === S.adminSendFailed && (await emailInput(p).inputValue()) === ADMIN3 && (await codeInput(p).count()) === 0 && otpReqs('admin3').length === 0)
  await remember(p)
  await shot(p, 'step1_send_offline')
  await admin3.setOffline(false)
  await p.waitForTimeout(200)
  const t0 = Date.now()
  await dialog(p).getByRole('button', { name: S.adminSendCode, exact: true }).click()
  await codeInput(p).waitFor()
  check('AC15b', 'Back online, same button → step 2 (sheet never closed)', (await statusText(p)) === sentTo(ADMIN3))
  const code = codeOf(await waitMail(ADMIN3, t0 - 1))
  // Byt e-post (AC 17)
  await typeCode(p, '12')
  await changeBtn(p).click()
  await emailInput(p).waitFor()
  const a = await active(p)
  const kept = await emailInput(p).inputValue()
  // type=email has no selectionStart: prove the selection by typing (a selected text is replaced)
  await p.keyboard.type('z')
  const replaced = await emailInput(p).inputValue()
  await emailInput(p).fill(ADMIN3)
  check('AC17a', 'Byt e-post → step 1, address still in the field, focused + selected (typing replaces it)', kept === ADMIN3 && a.type === 'email' && replaced === 'z', JSON.stringify({ type: a.type, replaced }))
  check('AC6d', 'Byt e-post clears the pending entry', (await store(p, PENDING_KEY)) === null)
  // second send within 60 s → rate limit (AC 14)
  await dialog(p).getByRole('button', { name: S.adminSendCode, exact: true }).click()
  await codeInput(p).waitFor()
  await dialog(p).locator('.admin-code-more .admin-send-error').waitFor()
  const last = otpReqs('admin3').length
  const a2 = await active(p)
  check('AC14a', 'Second Skicka kod within 60 s (429) → step 2 with adminCodeSent + adminWait under Skicka ny kod', (await statusText(p)) === sentTo(ADMIN3) && (await dialog(p).locator('.admin-code-more .admin-send-error').innerText()) === S.adminWait && last === 2)
  check('AC14b', 'Rate-limited step 2: Skicka ny kod disabled (cooldown), focus in the code field, code field empty', (await resendBtn(p).isDisabled()) && String(a2.cls).includes('admin-code-input') && (await codeInput(p).inputValue()) === '')
  check('AC17b', 'Code and error lines cleared by Byt e-post', (await errorLine(p).count()) === 0)
  await remember(p)
  await shot(p, 'step2_rate_limited', maskCode(p))
  // verify-side 429 (mocked: the stand-in's verify limit is per IP / 5 min)
  await p.route('**/auth/v1/verify**', (route) => route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ code: 'over_request_rate_limit', error_code: 'over_request_rate_limit', msg: 'Request rate limit reached' }) }))
  await loginWith(p, '000000')
  await errorLine(p).waitFor()
  check('AC14c', 'Verify-side 429 → adminVerifyWait, not logged in', (await errorLine(p).innerText()) === S.adminVerifyWait && (await store(p, AUTH_KEY)) === null)
  await remember(p)
  await shot(p, 'step2_verify_wait', maskCode(p))
  await p.unroute('**/auth/v1/verify**')
  // expired: the same code, 2 h old (stand-in OTP expiry 3600 s)
  sql(`update auth.users set recovery_sent_at = now() - interval '2 hours' where email = '${ADMIN3}'`)
  await loginWith(p, code)
  await errorLine(p).filter({ hasText: S.adminCodeWrong }).waitFor()
  check('AC13a', 'Code older than the expiry → adminCodeWrong, still logged out', (await errorLine(p).innerText()) === S.adminCodeWrong && (await store(p, AUTH_KEY)) === null)
  // control: the same code with a fresh timestamp is accepted, so only its age refused it
  sql(`update auth.users set recovery_sent_at = now() where email = '${ADMIN3}'`)
  await verifyBtn(p).click()
  await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  check('AC13b', 'Control: the same code with a fresh send time logs in (age was the only reason)', (await footerText(p)).includes('Admin · Logga ut'))
  await p.locator('footer .footer-admin-logout').click()
  await p.locator('footer .footer-admin-login').waitFor()
  // Byt e-post → another address (AC 17)
  await sendCode(p, UNKNOWN2)
  check('AC17c', 'Sending to another address shows that address in adminCodeSent', (await statusText(p)) === sentTo(UNKNOWN2))
  await changeBtn(p).click()
  await dialog(p).getByRole('button', { name: S.adminCloseAria }).click()
  await openSheet(p)
  check('AC6e', 'After Byt e-post the sheet reopens on step 1', (await emailInput(p).count()) === 1 && (await codeInput(p).count()) === 0)
  await dialog(p).getByRole('button', { name: S.adminCloseAria }).click()
  // 60 min: a pending entry older than an hour → step 1
  await p.evaluate(([k, e]) => localStorage.setItem(k, JSON.stringify({ email: e, sentAt: Date.now() - 61 * 60_000 })), [PENDING_KEY, ADMIN3])
  await p.reload()
  await openSheet(p)
  check('AC6f', 'Pending entry older than 60 min → sheet opens on step 1, entry removed', (await emailInput(p).count()) === 1 && (await store(p, PENDING_KEY)) === null)
  await admin3.close()
})

// ───────────────────────── AC 22: non-admin ─────────────────────────
await attempt('AC22', 'Non-admin logs in with a code', async () => {
  const ctx = await newCtx('nonadmin')
  const p = await newPage(ctx, ON)
  const t0 = Date.now()
  await sendCode(p, NONADMIN)
  await loginWith(p, codeOf(await waitMail(NONADMIN, t0 - 1)))
  await p.locator('footer .footer-admin-not').waitFor({ timeout: 15000 })
  const f = await footerText(p)
  check('AC22a', 'Footer adminNotAdmin + Logga ut, focus on Logga ut', f.includes(`${UI.notAdmin} · ${UI.logout}`) && String((await active(p)).cls).includes('footer-admin-logout'), f)
  await startBlank(p)
  await openLibrary(p)
  check('AC22b', 'No admin chrome for a non-admin', (await p.locator('.admin-bar, .admin-filter-chip, .admin-badge, .admin-detail').count()) === 0)
  await shot(p, 'nonadmin_library')
  await closeLibrary(p)
  await p.locator('footer .footer-admin-logout').click()
  await p.locator('footer .footer-admin-login').waitFor()
  check('AC22c', 'Logga ut → back to «Logga in som admin», session key removed', (await store(p, AUTH_KEY)) === null && (await footerText(p)).includes(UI.login))
  await ctx.close()
})

// ───────────────────────── admin main flow, part 2: resend after 60 s, replaced code, login ─────────────────────────
await attempt('AC16', 'Resend after 60 s, replaced code, login (admin)', async () => {
  const p = adminPage
  const waitMs = Math.max(0, tA + 61_500 - Date.now())
  note(`waiting ${Math.round(waitMs / 1000)} s for the 60 s resend cooldown`)
  await sleep(waitMs)
  await resendBtn(p).waitFor()
  await p.waitForFunction(() => !document.querySelector('.admin-resend')?.disabled, null, { timeout: 5000 })
  check('AC16b', 'After 60 s Skicka ny kod is enabled and adminResendSoon is gone', (await resendBtn(p).isEnabled()) && (await dialog(p).locator('#admin-resend-soon').count()) === 0)
  await typeCode(p, '11')
  const t1 = Date.now()
  await resendBtn(p).click()
  await dialog(p).locator('#admin-code-status', { hasText: S.adminCodeResent }).waitFor()
  const r = otpReqs('admin').at(-1)
  const a = await active(p)
  check('AC16c', 'Resend → POST /auth/v1/otp to the same address, adminCodeResent, field cleared + focused, cooldown again', JSON.parse(r.body).email === ADMIN && JSON.parse(r.body).create_user === false && (await statusText(p)) === S.adminCodeResent && (await codeInput(p).inputValue()) === '' && String(a.cls).includes('admin-code-input') && (await resendBtn(p).isDisabled()))
  await remember(p)
  await shot(p, 'step2_resent', maskCode(p))
  const codeA2 = codeOf(await waitMail(ADMIN, t1 - 1))
  if (codeA2 === codeA1) note('the new code happened to equal the first one (1 in 10⁶); AC 13 replaced-code check not meaningful this run')
  await loginWith(p, codeA1)
  await errorLine(p).waitFor()
  check('AC13c', 'Replaced code (the first one, after Skicka ny kod) → adminCodeWrong', codeA2 !== codeA1 && (await errorLine(p).innerText()) === S.adminCodeWrong)
  await loginWith(p, codeA2)
  await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  check('AC16d', 'The new code logs in', (await dialog(p).count()) === 0)
  check('AC11d', 'Focus moves to the footer «Logga ut»', String((await active(p)).cls).includes('footer-admin-logout'))
  check('AC24b', 'Verifier + pending keys removed after login, session stored', (await store(p, VERIFIER_KEY)) === null && (await store(p, PENDING_KEY)) === null && (await store(p, AUTH_KEY)) !== null)
  await startBlank(p)
  const f = await footerText(p)
  check('AC4-local', 'Footer «Träningsplaneraren · Slice 33 · Admin · Logga ut» (desktop Chrome; installed app = real device)', f.startsWith(`${S.footerSliceLabel} · Admin · ${UI.logout}`), f)
  await openLibrary(p)
  await p.locator('.admin-bar').waitFor()
  check('AC4b-local', 'Admin chip in Biblioteket', (await p.locator('.admin-bar').innerText()).includes('Admin'))
  await shot(p, 'admin_library_after_code_login')
  await closeLibrary(p)
  check('AC4c-local', 'No new page/tab opened during the whole login', admin.pages().length === 1)
  await p.reload()
  await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  check('AC5-local', 'Reload keeps the session (Admin · Logga ut)', (await footerText(p)).includes(`Admin · ${UI.logout}`))
})

await attempt('AC20c', 'Share link in a profile logged in as admin', async () => {
  const p = adminPage
  await p.goto(`${ON}#dela=${SHARE_TOKEN}`)
  await p.getByText('Delat testpass').first().waitFor({ timeout: 10000 })
  check('AC20c', '#dela= opens the shared pass while logged in as admin', true)
  await shot(p, 'admin_share_link')
  await p.goto(ON)
})

// ───────────── AC 25: Slice 32 admin regression after the code login (copied from slice-32-builder-smoke.mjs) ─────────────
// ───────────────────────── AC 41: bot push ─────────────────────────
let botOut = ''
await attempt('S32-AC41', 'Bot push of the 2-exercise fixture', async () => {
  const run = (args, key = botKey()) =>
    spawnSync('bun', [`${ROOT}/tools/bank/push-promote.ts`, `${ROOT}/tools/bank/fixtures/promote-2.json`, ...args], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH, HOME: process.env.HOME, SUPABASE_PLANNER_BOT_KEY: key, SUPABASE_URL: GATEWAY },
    })
  const dry = run(['--dry-run'])
  check('S32-AC41a', 'Dry-run lists 2 new rows and writes nothing', dry.status === 0 && dry.stdout.includes('2 nya') && sql(`select count(*) from public.exercises where id like 'tech-test-%'`) === '0', dry.stdout.split('\n').at(-2))
  const r = run([])
  botOut = r.stdout
  check('S32-AC41b', 'Push → exit 0, «Väntar på godkännande i appen»', r.status === 0 && r.stdout.includes('Väntar på godkännande i appen'), r.stdout.split('\n').slice(-3).join(' / '))
  const rows = sql(`select id || '|' || status || '|' || needs_coach_review || '|' || updated_by from public.exercises where id like 'tech-test-%' order by id`)
  check('S32-AC41c', 'Rows pending, needs_coach_review true, updated_by bot:planner', rows === 'tech-test-aggrullning-kil|pending|true|bot:planner\ntech-test-formhopp-over-lagt-block|pending|true|bot:planner', rows.replace(/\n/g, ' ; '))
  const anon = await (await fetch(`${GATEWAY}/rest/v1/exercises?select=id&id=like.tech-test-*`, { headers: { apikey: PUB } })).json()
  check('S32-AC41d', 'Invisible to anon', Array.isArray(anon) && anon.length === 0)
  const again = run([])
  check('S32-AC42a', 'Second push: existing ids skipped + reported, not overwritten', again.status === 0 && again.stdout.includes('Hoppades över (fanns redan): tech-test-formhopp-over-lagt-block, tech-test-aggrullning-kil'), again.stdout.split('\n').slice(-3).join(' / '))
  check('S32-C5', 'All skipped → «Inget nytt …», no «Väntar på godkännande»', again.stdout.trim().split('\n').at(-1).startsWith('Inget nytt:') && !again.stdout.includes('Väntar på godkännande'), again.stdout.trim().split('\n').at(-1))
  const pubRun = run([], PUB)
  check('S32-AC42b', 'Publishable key in SUPABASE_PLANNER_BOT_KEY → script refuses', pubRun.status === 1 && pubRun.stdout.includes('publika nyckeln'))
  const all = dry.stdout + r.stdout + again.stdout + pubRun.stdout + dry.stderr + r.stderr
  check('S32-AC42c', 'Key never printed', !all.includes(botKey()) && !all.includes(PUB))
  const del = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'DELETE', headers: { apikey: botKey() } })
  const delBody = await del.text()
  check('S32-AC43', 'Bot key DELETE → permission denied, row still there', del.status === 403 && delBody.includes('permission denied') && sql(`select count(*) from public.exercises where id = 'tech-test-aggrullning-kil'`) === '1', `${del.status} ${delBody.slice(0, 80)}`)
  const browserUse = await fetch(`${GATEWAY}/rest/v1/exercises?select=id&limit=1`, { headers: { apikey: botKey(), Origin: ON } })
  check('S32-AC40b', 'Secret-style key refused from a browser origin (gateway emulates Supabase 401)', browserUse.status === 401)
})

// ───────────────────────── AC 29–33: admin UI ─────────────────────────
const TA = 'Test: formhopp över lågt block'
const TB = 'Test: äggrullning nerför kil'
await attempt('S32-AC29', 'Admin mode lists', async () => {
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  await adminPage.locator('.admin-bar').waitFor()
  const chips = await adminPage.locator('.admin-bar').innerText()
  check('S32-AC29a', `Admin chip + «Väntar på godkännande (2)» + «Behöver granskas (${REVIEW_N})»; no Dolda chip at 0`, chips.includes('Admin') && chips.includes('Väntar på godkännande (2)') && chips.includes(`Behöver granskas (${REVIEW_N})`) && !chips.includes('Dolda'), chips.replace(/\s+/g, ' '))
  const plain = await libraryTitles(adminPage)
  check('S32-AC29b', 'Pending rows not in the normal list', !plain.includes(TA) && !plain.includes(TB), `${plain.length} titles`)
  await adminPage.locator('.admin-filter-chip', { hasText: 'Väntar på godkännande' }).click()
  const pend = await titleTexts(adminPage)
  check('S32-AC29c', 'Pending chip shows exactly the two bot rows with «Väntar» badge', pend.length === 2 && pend.includes(TA) && pend.includes(TB) && (await adminPage.locator('.library-entry .admin-badge-pending').count()) === 2, pend.join(', '))
  check('S32-AC29d', 'Väntar chip is pressed (aria-pressed)', (await adminPage.locator('.admin-filter-chip.active').getAttribute('aria-pressed')) === 'true')
  await shot(adminPage, 'admin_pending_list')
  await card(adminPage, TA).first().locator('.activity-card').click()
  const d = adminPage.locator('.activity-detail')
  await d.waitFor()
  await d.locator('.admin-detail').waitFor()
  check('S32-AC29e', 'Pending detail: not addable to a pass', (await d.getByRole('button', { name: 'Lägg till i valt block' }).count()) === 0)
  const btns = await d.locator('.admin-actions button').allInnerTexts()
  check('S32-AC29f', 'Pending detail: Godkänn · Ändra i banken; review hint; last changed by Planner', btns.join('|') === 'Godkänn|Ändra i banken' && (await d.innerText()).includes('Läs igenom texten.') && (await d.locator('.admin-last-changed').innerText()).includes('av Planner'), btns.join('|'))
  await shot(adminPage, 'admin_pending_detail')
  await d.getByRole('button', { name: 'Godkänn' }).click()
  await adminPage.getByText(UI.approved).waitFor()
  check('S32-AC30a', 'Godkänn → toast + status published', sql(`select status from public.exercises where id = 'tech-test-formhopp-over-lagt-block'`) === 'published')
  await shot(adminPage, 'admin_approved_toast')
  const cache = await store(adminPage, CACHE_KEY)
  check('S32-AC38a', 'This device updates at once: approved row in the coach cache, pending row never', cache.includes('tech-test-formhopp-over-lagt-block') && !cache.includes('tech-test-aggrullning-kil'))
})

await attempt('S32-AC30', 'Another (anon) profile sees the approved row', async () => {
  const ctx = await newCtx('coach2')
  const page = await newPage(ctx, ON)
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, CACHE_KEY, { timeout: 9000 })
  await page.reload()
  await startBlank(page)
  await openLibrary(page)
  const titles = await libraryTitles(page)
  check('S32-AC30b', 'Coach sees the approved row, not the pending one', titles.includes(TA) && !titles.includes(TB), `${titles.length}`)
  check('S32-AC33c', 'Coach profile: no review badge on bank rows', (await page.locator('.library-entry .review-badge').count()) === 0)
  const cache = await store(page, CACHE_KEY)
  check('S32-AC38b', 'Coach cache has no pending row', !cache.includes('tech-test-aggrullning-kil'))
  await shot(page, 'coach_sees_approved')
  await ctx.close()
})

await attempt('S32-AC31', 'Ändra i banken', async () => {
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
  check('S32-AC31a', 'Validation as own form: empty Namn blocked (required, as own form), empty Varför → issue list; nothing sent', nameInvalid && issues.length > 0 && bankLog.filter((r) => r.method === 'PATCH').length === writesBefore && sql(`select title from public.exercises where id = 'tech-test-aggrullning-kil'`) === TB, issues.replace(/\s+/g, ' '))
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
  check('S32-AC31b', 'Saved fields in the row', after.title === 'Äggrullning (redigerad)' && after.duration_minutes_default === 9 && after.summary === 'Ny sammanfattning från admin.' && after.how_to === '1. Steg ett.\n2. Steg två.\n3. Steg tre.' && after.watch_for === 'Nytt se upp för.' && after.safety_line === 'Ny säkerhetsrad.' && after.source?.url === 'https://example.org/video' && after.source?.creator === 'Testkanal' && after.source?.startSeconds === 65 && after.experienced_coach_only === true, JSON.stringify(after).slice(0, 300))
  check('S32-AC31c', 'Tags, difficulty, links, visual, sort order, status preserved', JSON.stringify([after.tags, after.difficulty, after.progression_of, after.regression_of, after.visual_key, after.sort_order, after.status]) === JSON.stringify([before.tags, before.difficulty, before.progression_of, before.regression_of, before.visual_key, before.sort_order, before.status]), JSON.stringify(before))
  check('S32-AC32a', 'updated_by = admin e-mail; updated_at set', after.updated_by === ADMIN && Date.now() - Date.parse(after.updated_at) < 60000)
  check('S32-AC33a', 'Saving clears needs_coach_review', after.needs_coach_review === false)
  const lc = await adminPage.locator('.activity-detail .admin-last-changed').innerText()
  check('S32-AC32b', 'Detail shows «Senast ändrad … av admin@test.local»', /^Senast ändrad \d{1,2} [a-zé]{3} av admin@test\.local$/.test(lc), lc)
  await shot(adminPage, 'admin_saved_detail')
  // spoof updated_by with the admin's own token
  const tok = JSON.parse(await store(adminPage, AUTH_KEY)).access_token
  const spoof = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'PATCH', headers: { apikey: PUB, Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ updated_by: 'evil@spoof' }) })
  const sp = await spoof.json()
  check('S32-AC32c', 'Client-sent updated_by is overwritten with the admin e-mail', sp[0]?.updated_by === ADMIN && sql(`select updated_by from public.exercises where id = 'tech-test-aggrullning-kil'`) === ADMIN, JSON.stringify(sp[0]?.updated_by))
  const del = await fetch(`${GATEWAY}/rest/v1/exercises?id=eq.tech-test-aggrullning-kil`, { method: 'DELETE', headers: { apikey: PUB, Authorization: `Bearer ${tok}` } })
  check('S32-AC23a', 'Admin token DELETE refused by the database', del.status >= 400 && sql(`select count(*) from public.exercises where id = 'tech-test-aggrullning-kil'`) === '1', String(del.status))
})

await attempt('S32-AC33', 'Markera som granskad', async () => {
  const REVIEW_N = Number(sql(`select count(*) from public.exercises where status = 'published' and needs_coach_review`))
  note(`review count now ${REVIEW_N} (16 seed rows + the approved bot row)`)
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  await adminPage.locator('.admin-filter-chip', { hasText: `Behöver granskas (${REVIEW_N})` }).click()
  const list = await titleTexts(adminPage)
  check('S32-AC33b0', 'Review chip lists the flagged published rows with the review badge (admin only)', list.length === REVIEW_N && (await adminPage.locator('.library-entry .review-badge').count()) === REVIEW_N, `${list.length}`)
  await shot(adminPage, 'admin_review_chip')
  await card(adminPage, REVIEW_TITLE).first().locator('.activity-card').click()
  const d = adminPage.locator('.activity-detail')
  await d.locator('.admin-detail').waitFor()
  const textBefore = sql(`select md5(title || summary || how_to) from public.exercises where id = '${REVIEW_ID}'`)
  await d.locator('.admin-detail button', { hasText: 'Markera som granskad' }).click()
  await adminPage.locator('.admin-filter-chip', { hasText: `Behöver granskas (${REVIEW_N - 1})` }).waitFor()
  check('S32-AC33b', 'Markera som granskad clears it without edit (text unchanged, count −1)', sql(`select needs_coach_review::text || '|' || updated_by from public.exercises where id = '${REVIEW_ID}'`) === `false|${ADMIN}` && sql(`select md5(title || summary || how_to) from public.exercises where id = '${REVIEW_ID}'`) === textBefore)
  await closeDetail(adminPage)
})

// ───────────────────────── AC 34: hide / unhide a mall drill ─────────────────────────
await attempt('S32-AC34', 'Dölj för alla + Visa igen', async () => {
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
  check('S32-AC34a', 'Published detail: Ändra i banken · Dölj för alla', (await d.locator('.admin-actions button').allInnerTexts()).join('|') === 'Ändra i banken|Dölj för alla')
  await d.getByRole('button', { name: 'Dölj för alla' }).click()
  const confirmText = await adminPage.locator('.admin-hide-confirm, [role=alertdialog]').first().innerText()
  check('S32-AC34b', 'Confirm shows the title and adminHideUsedIn for a mall drill', confirmText.includes(`Dölja ”${MALL_TITLE}” för alla tränare?`) && confirmText.includes(UI.usedIn), confirmText.replace(/\s+/g, ' ').slice(0, 200))
  await shot(adminPage, 'admin_hide_confirm')
  await adminPage.getByRole('button', { name: 'Dölj', exact: true }).click()
  await adminPage.getByText('Dold för alla.').waitFor()
  check('S32-AC34c', 'Status hidden in the DB', sql(`select status from public.exercises where id = '${MALL_ID}'`) === 'hidden')
  // coach after reload
  await cp.reload()
  await cp.waitForTimeout(1500)
  await cp.reload()
  await cp.getByRole('button', { name: /Fortsätt/ }).first().click()
  const rowsText = await cp.locator('.session-item').allInnerTexts()
  check('S32-AC34d', 'Saved pass still resolves the hidden drill (title shown)', !hasMall || rowsText.some((t) => t.includes(MALL_TITLE)), rowsText.length + ' rows')
  await openLibrary(cp)
  const coachTitles = await libraryTitles(cp)
  check('S32-AC34e', 'Hidden drill gone from Biblioteket for the coach', !coachTitles.includes(MALL_TITLE))
  await shot(cp, 'coach_hidden_gone_pass_kept')
  await cctx.close()
  // admin: Dolda (1) → Visa igen
  await closeDetail(adminPage)
  await adminPage.locator('.admin-filter-chip', { hasText: 'Dolda (1)' }).click()
  await adminPage.locator('.library-entry .activity-card').first().click()
  const d2 = adminPage.locator('.activity-detail')
  await d2.locator('.admin-detail').waitFor()
  check('S32-AC34f', 'Hidden detail: «Dold» badge, Visa igen · Ändra i banken', (await d2.locator('.admin-badge-hidden').count()) === 1 && (await d2.locator('.admin-actions button').allInnerTexts()).join('|') === 'Visa igen|Ändra i banken')
  await shot(adminPage, 'admin_hidden_detail')
  await d2.getByRole('button', { name: 'Visa igen' }).click()
  await adminPage.getByText('Syns igen för alla.').waitFor()
  check('S32-AC34g', 'Visa igen restores published', sql(`select status from public.exercises where id = '${MALL_ID}'`) === 'published')
  await closeDetail(adminPage)
})

await attempt('S32-AC35', 'No delete control', async () => {
  const d = await openDetail(adminPage, 'Kullerbytta')
  await d.locator('.admin-detail').waitFor()
  const txt = await d.locator('.admin-detail').innerText()
  check('S32-AC35a', 'Admin detail has no delete control', !/Ta bort|Radera|Delete/i.test(txt))
  await closeDetail(adminPage)
})

// ───────────────────────── AC 36: two tabs ─────────────────────────
await attempt('S32-AC36', 'Two tabs edit the same exercise', async () => {
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
  check('S32-AC36a', 'Second save → adminSaveConflict', (await f2.locator('.admin-error').innerText()) === UI.conflict)
  check('S32-AC36b', 'First edit intact in the DB', sql(`select title from public.exercises where id = 'tech-kullerbytta'`) === 'Kullerbytta (flik 1)')
  await shot(t2, 'admin_conflict')
  // C1: follow the on-screen advice «Stäng och öppna den igen» — no page reload
  await t2.evaluate(() => { window.__s32NoReload = true })
  await f2.getByRole('button', { name: 'Avbryt' }).click()
  await closeDetail(t2)
  const d2 = await openDetail(t2, 'Kullerbytta (flik 1)')
  await d2.locator('.admin-detail').waitFor()
  await t2.waitForTimeout(400) // the detail's row refetch
  await d2.getByRole('button', { name: 'Ändra i banken' }).click()
  const f3 = t2.locator('form.admin-bank-form')
  const name3 = f3.locator('label.own-field').filter({ hasText: 'Namn' }).locator('input')
  check('S32-AC36c', 'Reopened form shows the other tab\'s saved title (row refetched)', (await name3.inputValue()) === 'Kullerbytta (flik 1)', await name3.inputValue())
  await name3.fill('Kullerbytta (flik 2)')
  await f3.getByRole('button', { name: 'Spara i banken' }).click()
  await t2.getByText(UI.saved).waitFor()
  check('S32-AC36d', 'Close + reopen + Spara saves (no 2nd conflict, no reload)', sql(`select title from public.exercises where id = 'tech-kullerbytta'`) === 'Kullerbytta (flik 2)' && (await t2.evaluate(() => window.__s32NoReload === true)) && (await t2.locator('.admin-error').count()) === 0)
  await shot(t2, 'admin_conflict_reopen_saved')
  await closeDetail(t2)
  await t2.close()
})

// ───────────────────────── AC 37: offline ─────────────────────────
await attempt('S32-AC37', 'Offline admin', async () => {
  await adminPage.goto(ON)
  await adminPage.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  await startBlank(adminPage)
  await openLibrary(adminPage)
  const d = await openDetail(adminPage, 'Kullerbytta (flik 2)')
  await d.locator('.admin-detail').waitFor()
  const before = bankLog.length
  await admin.setOffline(true)
  await adminPage.waitForTimeout(300)
  check('S32-AC37a', 'adminOffline line shown', (await d.locator('.admin-offline').innerText()) === UI.offline)
  const states = await d.locator('.admin-actions button').evaluateAll((els) => els.map((e) => e.disabled))
  check('S32-AC37b', 'All admin actions disabled', states.length > 0 && states.every(Boolean), JSON.stringify(states))
  await shot(adminPage, 'admin_offline')
  await adminPage.waitForTimeout(500)
  await admin.setOffline(false)
  await adminPage.waitForTimeout(1000)
  check('S32-AC37c', 'Nothing queued: no write sent after coming back online', bankLog.slice(before).filter((r) => r.method !== 'GET' && r.url.includes('/rest/v1/')).length === 0)
  check('S32-AC37d', 'Buttons enabled again online', (await d.locator('.admin-actions button').evaluateAll((els) => els.every((e) => !e.disabled))))
  await closeDetail(adminPage)
})


// ───────────────────────── AC 24: Logga ut ─────────────────────────
await attempt('AC24', 'Logga ut (admin)', async () => {
  const p = adminPage
  await p.goto(ON)
  await p.locator('footer .footer-admin-logout').waitFor({ timeout: 15000 })
  // leftovers that Logga ut must remove too
  await p.evaluate(([v, k]) => {
    localStorage.setItem(v, 'left-over')
    localStorage.setItem(k, JSON.stringify({ email: 'x@y.se', sentAt: Date.now() }))
  }, [VERIFIER_KEY, PENDING_KEY])
  await p.locator('footer .footer-admin-logout').click()
  await p.locator('footer .footer-admin-login').waitFor()
  check('AC24c', 'Logga ut removes auth, code-verifier and pending keys; footer back to «Logga in som admin»', (await store(p, AUTH_KEY)) === null && (await store(p, VERIFIER_KEY)) === null && (await store(p, PENDING_KEY)) === null && (await footerText(p)).includes(UI.login))
  await p.reload()
  await p.locator('footer .footer-admin-login').waitFor()
  check('AC24d', 'Reopening the app shows «Logga in som admin»', (await footerText(p)).includes(UI.login))
  await openSheet(p)
  check('AC6g', 'After Logga ut the sheet opens on step 1', (await emailInput(p).count()) === 1)
  await shot(p, 'logged_out_step1')
  const cache = await store(p, CACHE_KEY)
  check('S32-AC38c', 'After logout the coach cache holds no pending rows', !cache.includes('tech-test-aggrullning-kil'))
})
await admin.close()

// ───────────────────────── AC 19 / 26: copy + grep ─────────────────────────
await attempt('AC26', 'Copy', async () => {
  const g = spawnSync('rg', ['-n', 'exchangeCodeForSession|emailRedirectTo|loginRedirectUrl|linkFailed|adminLinkFailed|adminLinkSent|adminSendLink', `${ROOT}/app/src`], { encoding: 'utf8' })
  check('AC19', 'rg for the retired link names in app/src returns nothing', g.status === 1 && g.stdout === '', g.stdout.slice(0, 200))
  const all = seenTexts.join('\n')
  check('AC26j', 'Login sheet never says «länk», no «!»', !/länk/i.test(all) && !all.includes('!'))
  check('AC26k', 'Login sheet never says Supabase / OTP / token / session / server / databas', !/supabase|\botp\b|token|session|server|databas/i.test(all))
  const meta = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
  const keys = Object.keys(S).filter((k) => k !== 'adminCodeSent')
  const verbatim = keys.every((k) => meta.includes(`'${S[k]}'`)) && meta.includes(`'${S.adminCodeSent}'`)
  check('AC26l', 'Every Slice 33 key in blockMeta.ts matches microcopy.sv.md verbatim', verbatim, keys.filter((k) => !meta.includes(`'${S[k]}'`)).join(', '))
  const adminLines = meta.split('\n').filter((l) => /^\s*admin\w*:/.test(l) || /footerSliceLabel/.test(l))
  check('AC26m', 'No admin UI string says Supabase / OTP / token / session; none has «!»', adminLines.every((l) => !/supabase|\botp\b|token|session|!/i.test(l.split(':').slice(1).join(':'))), adminLines.filter((l) => /supabase|\botp\b|token|session|!/i.test(l)).join(' | '))
  check('AC26n', 'Every Slice 33 status/error line seen in the sheet is a microcopy string', ['adminCodeSent', 'adminCodeWrong', 'adminVerifyWait', 'adminVerifyFailed', 'adminCodeResent', 'adminWait', 'adminSendFailed', 'adminResendSoon'].every((k) => k === 'adminCodeSent' ? all.includes(sentTo(ADMIN)) : all.includes(S[k])))
})

check('E', 'No page errors', pageErrors.length === 0, pageErrors.join(' | '))
check('N', 'Every coach-context bank request was a GET with the publishable key and no Authorization',
  bankLog.filter((r) => /^coach|^regress|^old-|^share/.test(r.ctx)).every((r) => r.method === 'GET' && r.headers.apikey === PUB && !r.headers.authorization))
check('C', 'No login code in any request URL or the results (codes only in POST bodies to /auth/v1/verify)', bankLog.every((r) => !/token=\d{6}/.test(r.url)))

const pass = results.filter((r) => r.ok).length
console.log(`\nPASS ${pass} / FAIL ${results.length - pass}`)
writeFileSync(`${ROOT}/verifier/slice-33-smoke-results.json`, JSON.stringify({ results, notes, bankRequests: bankLog.length }, null, 2))
await browser.close()

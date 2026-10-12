// Slice 36 — Verifier checks (independent of the Builder smoke): E1/F1 end-to-end, overwrite→coach, hide persistence, coach write block, share link, footer. 390×844. Local stand-in only.
// Local stand-in only (never the real project):
//   bash verifier/slice-36-local/up.sh   (/tmp/s36, gateway :54740, 36-01/02/03 applied to the LOCAL PG)
//   bank build (VITE_SUPABASE_URL=https://bank-mock.supabase.co, VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32)
//   preview on :4200; plain build preview on :4201.
// Browser requests to https://bank-mock.supabase.co/** go unchanged to the local gateway (real PostgREST + RLS,
// real GoTrue e-mail code). Login codes are read from the mail sink and never printed or screenshotted.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'

const ON = process.env.S36_ON_URL ?? 'http://127.0.0.1:4290/traningsplaneringen/'
const OFF = process.env.S36_OFF_URL ?? 'http://127.0.0.1:4291/traningsplaneringen/'
const BANK_HOST = 'https://bank-mock.supabase.co'
const ROOT = '/workspace/gymnastics-planner'
const S32 = process.env.S32_DIR ?? '/tmp/s36v'
const ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8'))
const GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const CLUB_KEY = 'gymnastics-planner-club-templates-v1'
const DRAFT_KEY = 'gymnastics-planner-draft-v1'

const MD = readFileSync(`${ROOT}/slice-36/content/microcopy.sv.md`, 'utf8')
const md = (key) => {
  const m = MD.match(new RegExp('^\\| `' + key + '`(?: \\*\\*[\\wäå]+\\*\\*)? \\| ([^|]+?) \\|', 'm'))
  if (!m) throw new Error('no microcopy key ' + key)
  return m[1].trim()
}
const KEYS = ['clubTemplatesTitle', 'clubTemplatesHint', 'clubTemplateBadge', 'clubTemplateCardAria', 'clubTemplatesEmpty', 'clubTemplatesStale', 'clubTemplatePlacementsNote', 'clubTemplateApplied', 'clubPublish', 'clubPublishTitle', 'clubPublishNameLabel', 'clubPublishBody', 'clubPublishConfirm', 'clubOverwriteTitle', 'clubOverwriteBody', 'clubOverwriteConfirm', 'clubPublished', 'clubOverwritten', 'clubHideAria', 'clubHideConfirm', 'clubHiddenTitle', 'clubUnhideAria', 'clubOffline', 'clubWriteFailed', 'footerSliceLabel']
const S = Object.fromEntries(KEYS.map((k) => [k, md(k)]))
const SAVED_HINT = 'Egna mallar stannar i den här webbläsaren. Delningskoden tar med en kopia till telefonen.'
const R = { hide: 'Dölj för alla', hideYes: 'Dölj', hidden: 'Dold för alla.', unhide: 'Visa igen', unhidden: 'Syns igen för alla.', hiddenBadge: 'Dold', cancel: 'Avbryt', tConfirm: 'Använd mall', tTitle: 'Ersätta det här passet?' }

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
async function attempt(id, fn) {
  try {
    await fn()
  } catch (e) {
    check(id, 'phase crashed', false, 'error: ' + String(e.message).split('\n').slice(0, 3).join(' ⏎ '))
  }
}
const sql = (q) =>
  execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], {
    encoding: 'utf8',
    env: { ...process.env, PGOPTIONS: '-cclient_min_messages=warning' },
  }).trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }
const pageErrors = []
const bankLog = []
const assetLog = []

async function newCtx(label) {
  const ctx = await browser.newContext({ ...phone })
  ctx.label = label
  await ctx.route(`${BANK_HOST}/**`, async (route) => {
    const req = route.request()
    const u = new URL(req.url())
    if (ctx.clubDown && u.pathname.endsWith('/club_templates')) return route.abort('internetdisconnected')
    if (ctx.clubSlowMs && u.pathname.endsWith('/club_templates')) await sleep(ctx.clubSlowMs)
    const headers = { ...req.headers() }
    delete headers.host
    try {
      const resp = await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined, maxRedirects: 0 })
      return await route.fulfill({ response: resp })
    } catch {
      return route.abort('failed').catch(() => {})
    }
  })
  ctx.on('request', (r) => {
    const url = r.url()
    if (url.startsWith(BANK_HOST)) bankLog.push({ ctx: label, method: r.method(), url, headers: r.headers() })
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
const shot = (page, n) => page.screenshot({ path: `/workspace/screenshots/s36v_${n}.png` })
const store = (page, k) => page.evaluate((key) => localStorage.getItem(key), k)
const draft = async (page) => JSON.parse((await store(page, DRAFT_KEY)) ?? 'null')
const ADMIN_CHUNK = /^(dist|session|adminBank|bankWrite|AdminLoginSheet|AdminDetailPanel|AdminBankForm|ClubAdminSection|ClubPublishDialog|clubWrite)-/
const chunksOf = (label) => assetLog.filter((a) => a.ctx === label).map((a) => a.url.split('/').pop())
const clubGets = (label) => bankLog.filter((r) => r.ctx === label && r.url.includes('/rest/v1/club_templates'))
const writes = (label) => bankLog.filter((r) => r.ctx === label && r.method !== 'GET' && r.method !== 'OPTIONS' && r.url.includes('/rest/v1/'))
const scrollW = (page) => page.evaluate(() => document.documentElement.scrollWidth)
const toast = (page) => page.locator('.toast[role=status]')
async function toastText(page) {
  await toast(page).waitFor()
  return (await toast(page).innerText()).trim()
}
async function waitToastGone(page) {
  await toast(page).waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
}
const rows = () => JSON.parse(sql(`select coalesce(json_agg(t order by title), '[]') from (select id, title, hidden, updated_at, updated_by, payload, total_minutes from public.club_templates) t`))

function mails(to) {
  return readdirSync(`${S32}/mail`)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ t: statSync(`${S32}/mail/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${S32}/mail/${f}`, 'utf8')) }))
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
async function login(page, email) {
  const before = Date.now() - 1
  await page.locator('footer .footer-admin-login').click()
  const dlg = page.getByRole('dialog', { name: 'Logga in som admin' })
  await dlg.locator('input[type=email]').fill(email)
  await dlg.getByRole('button', { name: 'Skicka kod', exact: true }).click()
  await dlg.locator('input.admin-code-input').waitFor()
  const code = ((await waitMail(email, before)).subject.match(/\b(\d{6})\b/) ?? [])[1]
  await dlg.locator('input.admin-code-input').pressSequentially(code)
  await dlg.getByRole('button', { name: 'Logga in', exact: true }).click()
  await page.locator('footer').getByText('Logga ut').waitFor()
}
async function wizardPass(page) {
  await page.getByRole('button', { name: 'Planera pass' }).click()
  const wz = page.locator('[aria-labelledby="home-wizard-title"]')
  await wz.getByRole('option', { name: /7–9/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /^Trampett/ }).first().click()
  await wz.getByRole('button', { name: 'Nästa' }).click()
  await wz.getByRole('option', { name: /Standard trupp/ }).first().click()
  await wz.getByRole('button', { name: 'Skapa pass' }).click()
  await page.locator('.builder').waitFor()
}
async function menuButtons(page) {
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  const names = await page.locator('.more-menu-panel button').allInnerTexts()
  await page.keyboard.press('Escape')
  await page.locator('.more-backdrop').click().catch(() => {})
  return names.map((s) => s.trim())
}
async function menuAction(page, name) {
  await page.getByRole('button', { name: 'Fler saker med passet' }).click()
  await page.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click()
}
const publishDlg = (page) => page.locator('.modal-backdrop[role=dialog]').filter({ has: page.locator('form') })
async function openMallar(page) {
  await menuAction(page, 'Använd mall')
  await page.locator('.side-panel-slot.is-open').waitFor()
}
async function closeSheet(page) {
  await page.locator('.sheet-close').click()
  await page.locator('.side-panel-slot.is-open').waitFor({ state: 'detached' }).catch(() => {})
}
const slim = (blocks) =>
  blocks
    .filter((b) => b.items.length)
    .map((b) => ({ t: b.type, items: [...b.items].sort((x, y) => x.order - y.order).map((i) => [i.activityId, i.durationMinutes, JSON.stringify(i.stationEquipment ?? null)]) }))

// ─────────── Verifier phases (local stand-in only) ───────────
sql(`delete from public.club_templates;`)
const VT = 'V36 Testmall'
const ariaOf = (title, n) => S.clubTemplateCardAria.replace('{title}', title).replace('{n}', String(n))
const row = () => rows().find((x) => x.title.toLowerCase() === VT.toLowerCase())
async function openStart(p) {
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).first().click()
  await p.locator('.side-panel-slot.is-open').waitFor()
}
async function coachTitles(p) {
  await p.goto(ON); await p.waitForTimeout(900)
  if (await p.locator('.builder').count()) await openMallar(p); else await openStart(p)
  const t = await p.locator('.side-panel-slot.is-open section.club-templates .template-club strong').allInnerTexts().catch(() => [])
  await closeSheet(p).catch(() => {})
  return t
}
let adminCtx, ap, coachCtx, cp
// GoTrue sends at most one mail per address per 60 s: wait out a recent login mail.
{ const last = Math.max(0, ...mails('admin@test.local').map((x) => x.t)); const wait = last + 62000 - Date.now(); if (wait > 0) await sleep(wait) }
await attempt('V-admin-publish', async () => {
  adminCtx = await newCtx('admin'); ap = await newPage(adminCtx, ON)
  await login(ap, 'admin@test.local')
  await wizardPass(ap)
  await ap.getByLabel('Passets titel').fill(VT)
  await ap.waitForTimeout(400)
  const d0 = await draft(ap)
  check('E1-pre', 'Admin pass has placed hall stations before publish (localStorage draft)', (d0.hallPlacements ?? []).length > 0, `hallPlacements ${d0.hallPlacements?.length}`)
  await menuAction(ap, S.clubPublish)
  await publishDlg(ap).waitFor(); await shot(ap, '01_admin_publish_dialog')
  await publishDlg(ap).getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  check('V-pub', 'Publish toast verbatim', (await toastText(ap)) === S.clubPublished)
  const r = row()
  check('E1-db', 'Stored payload: v=1, blocks, NO hallPlacements key (publish drops them)', r && r.payload.v === 1 && Array.isArray(r.payload.blocks) && !('hallPlacements' in r.payload), r ? Object.keys(r.payload).join(',') : 'no row')
  await waitToastGone(ap)
  await openMallar(ap); await ap.waitForTimeout(500); await shot(ap, '02_admin_mallar_cards'); await closeSheet(ap)
})
await attempt('V-coach', async () => {
  coachCtx = await newCtx('coach'); cp = await newPage(coachCtx, ON)
  await cp.waitForTimeout(900)
  const g = clubGets('coach')
  check('V-req', 'Coach: exactly one GET club_templates (apikey only, no Authorization); every coach bank request is a GET without Authorization', g.length === 1 && !('authorization' in g[0].headers) && g[0].headers.apikey === 'sb_publishable_local_s32' && bankLog.filter((b) => b.ctx === 'coach').every((b) => b.method === 'GET' && !('authorization' in b.headers)), bankLog.filter((b) => b.ctx === 'coach').map((x) => x.method + ' ' + x.url.replace(BANK_HOST, '').split('?')[0]).join(' ; '))
  check('V-chunks', 'Coach loads no supabase-js / admin chunk', !chunksOf('coach').some((c) => ADMIN_CHUNK.test(c)), chunksOf('coach').join(','))
  await openStart(cp)
  const sec = cp.locator('.side-panel-slot.is-open section.club-templates')
  await sec.waitFor(); await shot(cp, '03_coach_foreningens_mallar')
  const btnTexts = await sec.locator('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? e.textContent))
  check('F1-noedit', 'Coach: club section has only the card buttons (no edit/rename/Dölj/Ta bort/Publicera)', btnTexts.every((t) => t.startsWith('Föreningens mall ')) && !/Dölj|Ändra|Redigera|Ta bort|Publicera|Byt namn/.test(await sec.innerText()), btnTexts.join(' | '))
  const r = row()
  await sec.getByRole('button', { name: ariaOf(r.title, r.total_minutes) }).click()
  const conf = cp.locator('.modal-backdrop[role=dialog]').filter({ hasText: R.tTitle })
  await conf.waitFor(); await shot(cp, '04_coach_apply_confirm')
  await conf.getByRole('button', { name: R.tConfirm, exact: true }).click()
  await toastText(cp)
  const d = await draft(cp)
  check('E1-apply', 'Coach applied club mall: localStorage draft hallPlacements empty, blocks = payload', (d.hallPlacements ?? []).length === 0 && JSON.stringify(slim(d.blocks)) === JSON.stringify(slim(r.payload.blocks)), `hallPlacements ${JSON.stringify(d.hallPlacements ?? null)}`)
  const foot = (await cp.locator('footer.app-footer').innerText()).replace(/\s+/g, ' ')
  check('AC24-v', 'Footer (builder view; home hides the label by design) reads «Träningsplaneraren · Slice 36»', foot.includes('Träningsplaneraren · Slice 36'), foot.slice(0, 60))
  await waitToastGone(cp)
  await menuAction(cp, 'Hallöversikt'); await cp.waitForTimeout(700); await shot(cp, '05_coach_hall_unplaced')
  await cp.goto(ON); await cp.waitForTimeout(500)
  // F1: a coach-side write is blocked by the DB (publishable key, no Authorization).
  const w = await cp.evaluate(async (u) => {
    const h = { apikey: 'sb_publishable_local_s32', 'Content-Type': 'application/json', Prefer: 'return=representation' }
    const ins = await fetch(u, { method: 'POST', headers: h, body: JSON.stringify({ title: 'coach x', total_minutes: 5, payload: { v: 1, blocks: [] } }) })
    const up = await fetch(u + '?id=not.is.null', { method: 'PATCH', headers: h, body: JSON.stringify({ hidden: true }) })
    const del = await fetch(u + '?id=not.is.null', { method: 'DELETE', headers: h })
    return [ins.status, up.status, del.status]
  }, `${BANK_HOST}/rest/v1/club_templates`)
  check('F1-write', 'Coach-key POST/PATCH/DELETE to club_templates refused by the DB', w.every((s) => s === 401 || s === 403) && rows().length === 1 && !rows()[0].hidden, w.join('/'))
})
await attempt('V-overwrite', async () => {
  // Admin edits the pass (applies a built-in mall = different blocks), keeps the name → overwrite.
  await ap.goto(ON); await ap.waitForTimeout(600)
  const cont = ap.getByRole('button', { name: /Fortsätt/ }).first(); if (await cont.count()) await cont.click()
  await ap.locator('.builder').waitFor()
  await openMallar(ap)
  await ap.locator('.side-panel-slot.is-open .template-list').last().locator('.template-card').first().click()
  await ap.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: R.tConfirm, exact: true }).click()
  await waitToastGone(ap)
  await ap.getByLabel('Passets titel').fill(VT.toUpperCase() + '  ')
  await ap.waitForTimeout(300)
  const before = row()
  await menuAction(ap, S.clubPublish)
  const dlg = publishDlg(ap); await dlg.waitFor()
  await dlg.getByRole('button', { name: S.clubPublishConfirm, exact: true }).click()
  await dlg.getByRole('button', { name: S.clubOverwriteConfirm, exact: true }).waitFor(); await shot(ap, '06_admin_overwrite_confirm')
  await dlg.getByRole('button', { name: S.clubOverwriteConfirm, exact: true }).click()
  check('F1-overwrite', 'Overwrite toast; same id, new payload, one row', (await toastText(ap)) === S.clubOverwritten && rows().length === 1 && row().id === before.id && JSON.stringify(row().payload.blocks) !== JSON.stringify(before.payload.blocks))
  await waitToastGone(ap)
  // Coach reload → applies the new content.
  await cp.goto(ON); await cp.waitForTimeout(900)
  if (await cp.locator('.builder').count()) await openMallar(cp); else await openStart(cp)
  const r = row()
  await cp.locator('.side-panel-slot.is-open section.club-templates').getByRole('button', { name: ariaOf(r.title, r.total_minutes) }).click()
  await cp.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: R.tConfirm, exact: true }).click()
  await toastText(cp)
  check('AC11-overwrite', 'Coach reload after overwrite → applied pass has the NEW blocks', JSON.stringify(slim((await draft(cp)).blocks)) === JSON.stringify(slim(r.payload.blocks)))
})
await attempt('V-hide', async () => {
  await ap.goto(ON); await ap.waitForTimeout(600)
  const cont = ap.getByRole('button', { name: /Fortsätt/ }).first(); if (await cont.count()) await cont.click()
  await ap.locator('.builder').waitFor()
  await openMallar(ap); await ap.waitForTimeout(400)
  const hideBtn = ap.getByRole('button', { name: S.clubHideAria.replace('{title}', row().title) })
  await hideBtn.click()
  const hc = ap.locator('.modal-backdrop[role=dialog]').filter({ hasText: S.clubHideConfirm.replace('{title}', row().title).slice(0, 20) })
  await hc.waitFor(); await shot(ap, '07_admin_hide_confirm')
  await hc.getByRole('button', { name: 'Dölj', exact: true }).click()
  await toastText(ap); await waitToastGone(ap)
  await ap.locator('details.club-hidden summary').click().catch(() => {})
  await ap.waitForTimeout(300); await shot(ap, '08_admin_hidden_group')
  check('F1-hide-db', '«Dölj för alla» = admin-global: row hidden = true, row kept', row().hidden === true && rows().length === 1)
  const t1 = await coachTitles(cp); const t2 = await coachTitles(cp)
  check('F1-hide-coach', 'Coach reload: hidden mall gone, and stays gone on a second reload', !t1.includes(row().title) && !t2.includes(row().title), JSON.stringify([t1, t2]))
  await shot(cp, '09_coach_after_hide')
  await ap.getByRole('button', { name: S.clubUnhideAria.replace('{title}', row().title) }).click()
  check('F1-unhide', '«Visa igen» toast; hidden = false', (await toastText(ap)) === R.unhidden && row().hidden === false)
  const t3 = await coachTitles(cp)
  check('F1-back-coach', 'Coach reload after «Visa igen»: mall back', t3.includes(row().title), t3.join(' | '))
})
await attempt('V-dela', async () => {
  const pay = { ...row().payload, title: 'Delad V36' }
  const tok = 'j.' + Buffer.from(JSON.stringify(pay)).toString('base64url')
  const ctx = await newCtx('dela'); const p = await newPage(ctx, OFF + '#dela=' + tok)
  await p.getByText('Delad V36').first().waitFor({ timeout: 8000 })
  await p.waitForTimeout(400); await shot(p, '10_dela_link')
  check('V-dela', '#dela= share link (plain build) still renders the shared pass', true)
  await ctx.close()
})
check('errors', 'No page errors', pageErrors.length === 0, pageErrors.join(' | '))
await browser.close()
const pass = results.filter((r) => r.ok).length
writeFileSync('/tmp/s36v-verify-results.json', JSON.stringify({ at: new Date().toISOString(), pass, fail: results.length - pass, results, notes }, null, 2))
console.log(`\n${pass}/${results.length} pass`)

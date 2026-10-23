// Slice 49 — Verifier formal run. Local only: plain build (seeds) + bank build whose https://bank-mock.supabase.co
// is routed to the local stand-in (verifier/slice-36-local, S32_DIR). Live project requests are aborted by PW_CORE shim.
const { chromium } = await import(process.env.PW_CORE)
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
const PLAIN = process.env.S49_PLAIN, BANK = process.env.S49_BANK, SHOTS = process.env.S49_SHOTS ?? '/workspace/screenshots'
const S32 = process.env.S32_DIR, ENV = JSON.parse(readFileSync(`${S32}/env.json`, 'utf8')), GATEWAY = `http://127.0.0.1:${ENV.gatewayPort}`
const DRAFT = 'gymnastics-planner-draft-v1'
const TABLE = { 60: [6, 10, 21, 15, 8], 90: [6, 15, 36, 20, 13], 120: [8, 20, 45, 27, 20] }
const ORDER = ['gathering', 'warmup', 'techniques', 'strength', 'fun_and_games']
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
const attempt = async (id, fn) => { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const sql = (q) => execFileSync('psql', ['-h', '127.0.0.1', '-p', String(ENV.pgPort), '-U', 'postgres', '-d', 'bank', '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', q], { encoding: 'utf8' }).trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page(vp = { width: 390, height: 844 }, touch = true, bank = false) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch && vp.width < 900 })
  if (bank) await ctx.route('https://bank-mock.supabase.co/**', async (route) => {
    const req = route.request(), u = new URL(req.url()), headers = { ...req.headers() }; delete headers.host
    try { return await route.fulfill({ response: await route.fetch({ url: GATEWAY + u.pathname + u.search, method: req.method(), headers, postData: req.postDataBuffer() ?? undefined }) }) } catch { return route.abort('failed').catch(() => {}) }
  })
  else await ctx.route(/supabase\.co/, (r) => r.abort())
  const p = await ctx.newPage(); p.setDefaultTimeout(9000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
const sums = (d) => ORDER.map((t) => d.blocks.find((b) => b.type === t).items.reduce((a, i) => a + i.durationMinutes, 0))
const mins = (d, t) => d.blocks.find((b) => b.type === t).items.slice().sort((a, b) => a.order - b.order).map((i) => i.durationMinutes)
const whole = (d) => d.blocks.flatMap((b) => b.items).every((i) => Number.isInteger(i.durationMinutes) && i.durationMinutes >= 1)
const chip = (p, name) => p.locator('.home-wizard-chip').filter({ hasText: new RegExp(`^${name}$`) }).click()
async function home(p, url) { await p.goto(url); await p.locator('.home').waitFor(); await p.waitForTimeout(400) }
async function plan(p, url, answers) {
  await home(p, url); await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor()
  for (const a of answers) { await chip(p, a); await p.waitForTimeout(400) }
  await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
}
const filled = async (p) => (await p.locator('.pass-length').innerText()).replace(/\s+/g, ' ').trim()
const fillTxt = async (p) => (await p.locator('.pass-length-filled').innerText()).replace(/\s+/g, ' ').trim()
const pressed = async (p) => (await p.locator('.pass-length button[aria-pressed="true"]').innerText()).trim()
async function openHall(p) {
  const b = p.locator('.builder-hall')
  if (await b.isVisible()) await b.click()
  else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel button').filter({ hasText: /^Hallöversikt$/ }).first().click() }
  await p.locator('.hall-board').waitFor(); await p.waitForTimeout(500)
}
const applyBtn = (p) => p.locator('.hall-board button').filter({ hasText: /^Använd alla förslag$/ })
const noHScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
const inView = (l) => l.evaluate((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1 })

async function mallStart(p, url) { await home(p, url); await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor(); await p.getByRole('button', { name: 'Starta från mall' }).click(); await p.waitForTimeout(300); await chip(p, 'Gymmix – Grophallen'); await p.waitForTimeout(500); await p.locator('.home-wizard-malls .template-card').first().click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(500) }
async function tomt(p, url) { await home(p, url); await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor(); await p.getByRole('button', { name: 'Tomt pass' }).click(); await p.waitForTimeout(300); await chip(p, 'Gymmix – Stora hallen'); await p.waitForTimeout(300); await chip(p, '90 min'); await p.waitForTimeout(500); if (!(await p.locator('.builder').count())) { const n = p.locator('.home-wizard-sheet').getByRole('button', { name: /Skapa|Starta|Klar|Nästa/ }); if (await n.count()) await n.first().click() } await p.locator('.builder').waitFor(); await p.waitForTimeout(400) }
async function usaMall(p) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.locator('.mall-sheet').waitFor(); await p.waitForTimeout(1200); return p.locator('.mall-sheet').innerText() }
// ── Plain build, 390×844: AC1–8, 16
for (const [id, ans, len, hallLabel] of [['AC1', ['7–9 år', 'Blandat', 'Gymmix – Stora hallen', '60 min'], 60], ['AC2', ['7–9 år', 'Blandat', 'Gymmix – Stora hallen', '90 min'], 90], ['AC3', ['7–9 år', 'Blandat', 'Gymmix – Grophallen', '120 min'], 120], ['AC4', ['4–6 år', 'Satsbräda', 'Gymmix – Stora hallen', '90 min'], 90]]) {
  await attempt(id, async () => {
    const p = await page(); await plan(p, PLAIN, ans); let d = await draft(p)
    check(id, `${ans.join(' → ')}: «${len} / ${len} min», block sums = A1 table, whole minutes ≥1`, (await fillTxt(p)) === `${len} /` && (await pressed(p)) === String(len) && d.totalMinutes === len && sums(d).join() === TABLE[len].join() && whole(d), `${await filled(p)} sums ${sums(d)} tek ${mins(d, 'techniques')} str ${mins(d, 'strength')} gat ${mins(d, 'gathering')}`)
    if (id === 'AC2') {
      check('AC2b', 'Teknik 3 × 12', mins(d, 'techniques').join() === '12,12,12', mins(d, 'techniques'))
      await p.screenshot({ path: `${SHOTS}/s49v_01_builder_90_390.png` })
      await p.getByRole('button', { name: /Kör passet/ }).first().click(); await p.waitForTimeout(600)
      check('AC5', 'Kör passet start «Kvar: 90 min»', /Kvar: 90 min/.test(await p.locator('body').innerText()))
      await p.goto(PLAIN); await p.waitForTimeout(500)
      if (!(await p.locator('.builder').count())) { await p.getByRole('button', { name: /Fortsätt/ }).first().click(); await p.locator('.builder').waitFor() }
      const before = JSON.stringify(d.blocks.map((b) => b.items.map((i) => i.durationMinutes)))
      await p.locator('.pass-length button').filter({ hasText: /^60$/ }).click(); await p.waitForTimeout(1500); d = await draft(p)
      check('AC6', 'Length → 60: times unchanged, «90 / 60 min»', (await fillTxt(p)) === '90 /' && (await pressed(p)) === '60' && d.targetMinutes === 60 && JSON.stringify(d.blocks.map((b) => b.items.map((i) => i.durationMinutes))) === before, `${await filled(p)} pressed=${await pressed(p)} target=${d.targetMinutes} same=${JSON.stringify(d.blocks.map((b) => b.items.map((i) => i.durationMinutes))) === before}`)
    }
    if (id === 'AC1') {
      await openHall(p); const txt = await p.locator('.hall-board').innerText(); d = await draft(p)
      const placedTek = d.blocks.find((b) => b.type === 'techniques').items
      check('AC7', 'Hallöversikt: no saknar row, no «Använd alla förslag», no «Inga förslag att spara»; 3 Teknik have saved redskap', !/saknar redskap/.test(txt) && (await applyBtn(p).count()) === 0 && !/Inga förslag att spara/.test(txt) && placedTek.every((i) => i.stationEquipment?.length) && (d.hallPlacements ?? []).length === 3, `placements ${d.hallPlacements?.length} eq ${placedTek.map((i) => i.stationEquipment?.length)}`)
      await p.locator('.hall-header button').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.locator('.forradslista-sheet').waitFor(); await p.waitForTimeout(300)
      const ft = await p.locator('.forradslista-sheet').innerText()
      check('AC8', 'Förrådslista: list with redskap, no empty text', (await p.locator('.forradslista-empty').count()) === 0 && (await p.locator('.forradslista-sheet li').count()) > 0 && !/osparade förslag/.test(ft), `${await p.locator('.forradslista-sheet li').count()} rows`)
    }
    await p.context().close()
  })
}
// ── Built-in mall: AC9–11, C1 negative, focus after the button goes, AC12 (MallSheet + wizard mall step), AC16
await attempt('mall', async () => {
  const p = await page(); await mallStart(p, PLAIN)
  let d = await draft(p)
  check('C1-neg', 'Built-in mall start does not auto-save redskap', d.blocks.flatMap((b) => b.items).every((i) => !i.stationEquipment?.length))
  await openHall(p)
  const banner = p.locator('.hall-saknar-banner')
  check('AC9', 'Saknar row text only; exactly one «Använd alla förslag»', (await banner.count()) === 1 && (await banner.locator('button').count()) === 0 && (await applyBtn(p).count()) === 1, await banner.innerText().catch(() => ''))
  await p.screenshot({ path: `${SHOTS}/s49v_02_hall_mall_one_button_390.png` })
  await p.locator('.hall-header button').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.locator('.forradslista-sheet').waitFor()
  await p.locator('.forradslista-soft-cta').click(); await p.waitForTimeout(250)
  check('AC11', 'Förrådslista pointer closes the sheet and highlights the toolbar button', (await p.locator('.forradslista-sheet').count()) === 0 && /hall-apply-all--point/.test((await applyBtn(p).getAttribute('class')) ?? ''))
  await p.waitForTimeout(2500)
  await applyBtn(p).click(); await p.waitForTimeout(300)
  const t = await p.locator('body').innerText(); d = await draft(p)
  const focus = await p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}.${a.className}` : 'none' })
  check('AC10', 'Toast «Sparade redskap på {n} stationer»; button gone; saknar row gone', /Sparade redskap på \d+ station/.test(t) && (await applyBtn(p).count()) === 0, (t.match(/Sparade redskap på [^\n]+/) || [''])[0])
  check('focus', 'Focus after the button disappears (info)', true, focus)
  check('AC16', 'Footer «Träningsplaneraren · Slice 49»', /Träningsplaneraren · Slice 49/.test(await p.locator('body').innerText()))
  await p.context().close()
})
await attempt('tomt', async () => {
  const p = await page(); await tomt(p, PLAIN)
  const sheet = await usaMall(p)
  check('AC12', 'Använd mall (plain, no club): no «Föreningens mallar», no «Föreningen har inga mallar än.»', !/Föreningens mallar/.test(sheet) && !/Föreningen har inga mallar än/.test(sheet))
  await p.locator('.mall-sheet .sheet-close').first().click().catch(() => {}); await p.waitForTimeout(300)
  if (await p.locator('.builder').count()) { await openHall(p); const tx = await p.locator('.hall-board').innerText(); check('tomt', 'Tomt pass Hallöversikt: no «Inga förslag att spara», no apply button', !/Inga förslag att spara/.test(tx) && (await applyBtn(p).count()) === 0) }
  else check('tomt', 'Tomt pass reachable', false)
  await p.context().close()
})
// ── Viewports 320×568, 844×390, 1280×800: Planera pass 90 + mall Hallöversikt layout
for (const [tag, vp, touch] of [['320', { width: 320, height: 568 }, true], ['844', { width: 844, height: 390 }, true], ['1280', { width: 1280, height: 800 }, false], ['390', { width: 390, height: 844 }, true]]) {
  await attempt(`vp${tag}`, async () => {
    const p = await page(vp, touch); await plan(p, PLAIN, ['7–9 år', 'Tumbling', 'Gymmix – Grophallen', '120 min']); const d = await draft(p)
    const ok1 = d.totalMinutes === 120 && (await noHScroll(p))
    await mallStart(p, PLAIN)
    await openHall(p); await applyBtn(p).scrollIntoViewIfNeeded()
    const ok2 = (await noHScroll(p)) && (await inView(applyBtn(p))) && (await p.locator('.hall-saknar-banner button').count()) === 0
    if (tag === '320') await p.screenshot({ path: `${SHOTS}/s49v_03_hall_mall_320.png` })
    check(`vp${tag}`, `${tag}: 120 min pass, no h-scroll; mall Hallöversikt one button reachable, no h-scroll`, ok1 && ok2, JSON.stringify({ ok1, ok2 }))
    await p.context().close()
  })
}
// ── Bank build on the stand-in: AC12b, AC13, AC14, AC15
async function clubLoaded(p) { await p.waitForTimeout(1800) }
async function mallSheetText(p) { await tomt(p, BANK); await clubLoaded(p); return usaMall(p) }
async function wizardMallText(p) { await home(p, BANK); await clubLoaded(p); await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor(); await p.getByRole('button', { name: 'Starta från mall' }).click(); await p.waitForTimeout(300); await chip(p, 'Gymmix – Grophallen'); await p.waitForTimeout(1200); return p.locator('.home-wizard-sheet').innerText() }
await attempt('bank', async () => {
  sql('delete from public.club_templates')
  let p = await page(undefined, true, true)
  let a = await mallSheetText(p), b = await wizardMallText(p)
  check('AC12b', 'Bank build, 0 club mallar: Använd mall has no «Föreningens mallar» / empty text', !/Föreningens mallar|Föreningen har inga mallar än/.test(a))
  check('AC13', 'Planera pass → Mall-vägen, 0 club mallar: no «Föreningens mallar» / empty text', !/Föreningens mallar|Föreningen har inga mallar än/.test(b))
  await p.context().close()
  const payload = { v: 1, title: 'V49 klubbmall', notes: '', hallTemplateId: 'forening-vit', blocks: [{ type: 'warmup', durationMinutes: 10, items: [{ id: 'v49a', activityId: 'warm-hall-varv', durationMinutes: 10, note: '', order: 0 }] }] }
  sql(`insert into public.club_templates (title, total_minutes, payload) values ('V49 klubbmall', 10, '${JSON.stringify(payload)}'::jsonb)`)
  p = await page(undefined, true, true)
  a = await mallSheetText(p); const card = await p.locator('section.club-templates .template-card').count()
  await p.screenshot({ path: `${SHOTS}/s49v_04_club_section_bank.png` }).catch(() => {})
  b = await wizardMallText(p)
  check('AC14', 'With 1 club mall: section shown with the card in Använd mall and in the wizard mall step', /Föreningens mallar/.test(a) && /V49 klubbmall/.test(a) && card >= 1 && /Föreningens mallar/.test(b) && /V49 klubbmall/.test(b), `cards ${card}`)
  await p.context().close()
  sql('delete from public.club_templates')
  p = await page(undefined, true, true); await home(p, BANK)
  const before = Date.now() - 1
  await p.locator('footer .footer-admin-login').click(); const dlg = p.getByRole('dialog', { name: 'Logga in som admin' })
  await dlg.locator('input[type=email]').fill('admin@test.local'); await dlg.getByRole('button', { name: 'Skicka kod', exact: true }).click(); await dlg.locator('input.admin-code-input').waitFor()
  let code
  for (let i = 0; i < 60 && !code; i++) { const m = readdirSync(`${S32}/mail`).filter((f) => f.endsWith('.json')).map((f) => ({ t: statSync(`${S32}/mail/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${S32}/mail/${f}`, 'utf8')) })).filter((x) => x.t > before && JSON.stringify(x.m.to).includes('admin@test.local')).sort((x, y) => x.t - y.t); code = (m.at(-1)?.m.subject.match(/\b(\d{6})\b/) ?? [])[1]; if (!code) await sleep(250) }
  await dlg.locator('input.admin-code-input').pressSequentially(code); await dlg.getByRole('button', { name: 'Logga in', exact: true }).click(); await p.locator('footer').getByText('Logga ut').waitFor()
  await p.locator('.footer-admin-open:visible').first().click(); await p.locator('.admin-area').waitFor(); await p.waitForTimeout(2000)
  const at = await p.locator('.admin-area').innerText()
  check('AC15', 'Admin → Föreningens mallar with 0 mallar: empty text «Föreningen har inga mallar än.» stays', /Föreningens mallar/.test(at) && /Föreningen har inga mallar än\./.test(at))
  await p.context().close()
})
check('errors', 'no page errors', errors.length === 0, errors.join(' | '))
await browser.close()
const fail = results.filter((r) => !r.ok).length
console.log(`\n${results.length - fail}/${results.length} pass`)

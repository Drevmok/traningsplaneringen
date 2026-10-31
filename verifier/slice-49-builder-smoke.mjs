// Slice 49 — Builder self-smoke «Planera pass fyller passet» (A1 C1 D1 E1). 390×844, 844×390, 1280×800, DPR 2.
// Branch build (bank off, seeds) on :4849. All supabase.co traffic is blocked in the browser — no real backend.
// AC13–14 (club with ≥1 template / admin text) need a club backend: covered by unit tests only.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
const BR = process.env.S49_BR ?? 'http://127.0.0.1:4849/traningsplaneringen/'
const SHOTS = process.env.S49_SHOTS ?? '/tmp/slice-49-screenshots'
const DRAFT = 'gymnastics-planner-draft-v1'
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), ok: Boolean(ok) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch && vp.width < 900 })
  await ctx.route(/supabase\.co/, (r) => r.abort())
  await ctx.addInitScript(() => { try { if (sessionStorage.getItem('s49')) return; sessionStorage.setItem('s49', '1'); localStorage.clear() } catch {} })
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
const mins = (d, t) => d.blocks.find((b) => b.type === t).items.slice().sort((a, b) => a.order - b.order).map((i) => i.durationMinutes)
const chip = (p, name) => p.locator('.home-wizard-chip').filter({ hasText: new RegExp(`^${name}$`) }).click()
async function plan(p, answers) {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(300)
  await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor()
  for (const a of answers) { await chip(p, a); await p.waitForTimeout(380) }
  await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
}
const filled = async (p) => (await p.locator('.pass-length-filled').innerText()).replace(/\s+/g, ' ').trim()
const pressed = (p) => p.locator('.pass-length button[aria-pressed="true"]').innerText()
async function openHall(p) {
  const b = p.locator('.builder-hall')
  if (await b.isVisible()) await b.click()
  else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel button').filter({ hasText: /^Hallöversikt$/ }).first().click() }
  await p.locator('.hall-board').waitFor(); await p.waitForTimeout(400)
}
const applyBtn = (p) => p.locator('.hall-header button').filter({ hasText: /^Använd alla förslag$/ })

for (const [tag, vp, touch] of [['390', { width: 390, height: 844 }, true], ['844', { width: 844, height: 390 }, true], ['1280', { width: 1280, height: 800 }, false]]) {
  await attempt(`${tag}-q90`, async () => {
    const p = await page(vp, touch)
    await plan(p, ['7–9 år', 'Trampett', 'Gymmix – Grophallen', '90 min'])
    let d = await draft(p)
    check(`${tag}-AC2`, '«90 / 90 min», Teknik 3×12', (await filled(p)) === '90 /' && (await pressed(p)).trim() === '90' && d.totalMinutes === 90 && mins(d, 'techniques').join() === '12,12,12', `${await filled(p)} ${mins(d, 'techniques')}`)
    await p.screenshot({ path: `${SHOTS}/s49_${tag}_builder90.png` }).catch(() => {})
    await p.getByRole('button', { name: /Kör passet/ }).first().click(); await p.waitForTimeout(500)
    const body = await p.locator('body').innerText()
    check(`${tag}-AC5`, 'Kör passet shows «Kvar: 90 min»', /Kvar: 90 min/.test(body))
    await p.keyboard.press('Escape'); await p.waitForTimeout(300)
    if (!(await p.locator('.builder-top').isVisible())) { await p.goto(BR); await p.getByRole('button', { name: 'Fortsätt passet' }).first().click(); await p.locator('.builder').waitFor() }
    const before = JSON.stringify(d.blocks.map((b) => b.items.map((i) => i.durationMinutes)))
    await p.locator('.pass-length button').filter({ hasText: /^60$/ }).click(); await p.waitForTimeout(250)
    d = await draft(p)
    check(`${tag}-AC6`, 'length 60 → «90 / 60 min», times unchanged', (await filled(p)) === '90 /' && (await pressed(p)).trim() === '60' && JSON.stringify(d.blocks.map((b) => b.items.map((i) => i.durationMinutes))) === before)
    await openHall(p)
    const txt = await p.locator('.hall-board').innerText()
    check(`${tag}-AC7`, 'no saknar row, no «Använd alla förslag», no «Inga förslag att spara»', (await p.locator('.hall-saknar-banner').count()) === 0 && (await applyBtn(p).count()) === 0 && !/Inga förslag att spara/.test(txt))
    await p.screenshot({ path: `${SHOTS}/s49_${tag}_hall_questions.png` }).catch(() => {})
    await p.locator('.hall-header button').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.locator('.forradslista-sheet').waitFor()
    check(`${tag}-AC8`, 'Förrådslista is filled (no empty state)', (await p.locator('.forradslista-empty').count()) === 0 && (await p.locator('.forradslista-sheet li').count()) > 0)
    await p.context().close()
  })
  await attempt(`${tag}-mall`, async () => {
    const p = await page(vp, touch)
    await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(300)
    await p.getByRole('button', { name: 'Planera pass' }).first().click(); await p.locator('.home-wizard-sheet').waitFor()
    await p.getByRole('button', { name: 'Starta från mall' }).click(); await p.waitForTimeout(200)
    await chip(p, 'Gymmix – Grophallen'); await p.waitForTimeout(400)
    const mallTxt = await p.locator('.home-wizard-sheet').innerText()
    check(`${tag}-AC12`, '«Föreningens mallar» hidden with no club templates', !/Föreningens mallar/.test(mallTxt))
    await p.locator('.home-wizard-malls .template-card').first().click(); await p.waitForTimeout(400); if (await p.locator('.home-wizard-chip').filter({ hasText: /^60 min$/ }).count()) await chip(p, '60 min') /* Slice 55 */; await p.locator('.builder').waitFor(); await p.waitForTimeout(400)
    await openHall(p)
    const banner = p.locator('.hall-saknar-banner')
    check(`${tag}-AC9`, 'saknar row is text only; one toolbar «Använd alla förslag»', (await banner.count()) === 1 && (await banner.locator('button').count()) === 0 && (await applyBtn(p).count()) === 1, await banner.innerText().catch(() => ''))
    await p.screenshot({ path: `${SHOTS}/s49_${tag}_hall_mall.png` }).catch(() => {})
    await p.locator('.hall-header button').filter({ hasText: /^Förrådslista$/ }).first().click(); await p.locator('.forradslista-sheet').waitFor()
    await p.locator('.forradslista-soft-cta').click(); await p.waitForTimeout(200)
    const hl = await applyBtn(p).getAttribute('class')
    check(`${tag}-AC11`, 'Förrådslista pointer highlights the toolbar button', /hall-apply-all--point/.test(hl ?? ''), hl)
    await p.waitForTimeout(2300)
    await applyBtn(p).click(); await p.waitForTimeout(250)
    const t = await p.locator('.hall-board').innerText()
    check(`${tag}-AC10`, 'toast «Sparade redskap på …», button gone', /Sparade redskap på \d+ station/.test(t) && (await applyBtn(p).count()) === 0)
    check(`${tag}-AC16`, 'footer «Träningsplaneraren · Slice 56»', await p.evaluate(() => document.body.innerText.includes('Träningsplaneraren · Slice 56')) || await (async () => { await p.goto(BR); await p.locator('.home').waitFor(); return /Träningsplaneraren · Slice 56/.test(await p.locator('body').innerText()) })())
    await p.context().close()
  })
}
await attempt('390-lengths', async () => {
  for (const [ans, total, tek] of [[['7–9 år', 'Trampett', 'Gymmix – Grophallen', '60 min'], 60, '7,7,7'], [['7–9 år', 'Trampett', 'Gymmix – Grophallen', '120 min'], 120, '15,15,15'], [['4–6 år', 'Satsbräda', 'Gymmix – Grophallen', '90 min'], 90, '12,12,12']]) {
    const p = await page({ width: 390, height: 844 }, true)
    await plan(p, ans); const d = await draft(p)
    check(`390-${ans[0]}-${total}`, `«${total} / ${total} min» (${ans.join(', ')})`, (await filled(p)) === `${total} /` && d.totalMinutes === total && mins(d, 'techniques').join() === tek, `${await filled(p)} ${mins(d, 'techniques')}`)
    await p.context().close()
  }
})
check('errors', 'no page errors', errors.length === 0, errors.join(' | '))
await browser.close()
const fail = results.filter((r) => !r.ok).length
console.log(`\n${results.length - fail}/${results.length} pass`)
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1
process.exit(process.exitCode)

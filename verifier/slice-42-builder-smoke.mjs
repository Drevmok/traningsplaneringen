// Slice 42 — Builder self-smoke: «Tomt pass?» tip only at 0 coach stations; confirm skipped on a fresh pass. 390×844, branch on :4242.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs' // Slice 51 E1
import { openMallList, startFragor, startTomt } from './tools/smoke-start.mjs'
import { sliceNumber } from './tools/smoke-login.mjs'
import { execFileSync, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const BR = process.env.S42_BR ?? 'http://127.0.0.1:4242/traningsplaneringen/'
const ROOT = process.env.S42_ROOT ?? '/workspace/gp-s42'
const SLICE = sliceNumber(ROOT) // Slice 51: footer follows SLICE_NUMBER
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const seed = (t, n) => execFileSync('bun', [`${ROOT}/verifier/slice-42-seed.ts`, t, String(n)], { encoding: 'utf8' }).trim()
const seedMall = () => spawnSync('bun', [`${ROOT}/verifier/slice-42-seed.ts`, 'S42 egen mall', '2', 'mall'], { encoding: 'utf8' }).stderr.trim()
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 400) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errors = []
const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message))
const shot = (n) => p.screenshot({ path: `/workspace/screenshots/slice42_${n}.png` })
const draft = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const mallar = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const builder = () => p.locator('.builder')
const TIP = 'Tomt pass? Börja från en mall'
const tip = () => p.locator('.builder-coach-tip')
const tipShown = async () => (await tip().count()) > 0 && (await tip().first().innerText()).includes(TIP)
const confirmDlg = () => p.locator('.modal-backdrop[role=dialog]').filter({ hasText: 'Ersätta det här passet?' })
const toastText = async () => ((await p.locator('.toast').count()) ? (await p.locator('.toast').innerText()).replace(/\s+/g, ' ').trim() : '')
const tekCard = () => p.locator('.block-card').filter({ hasText: 'Teknik' }).first()
async function menu(name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function clean() { await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor() }
async function load(json, tmpl) { await p.goto(BR); await p.evaluate(([k, v, t, tv]) => { localStorage.clear(); localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null]); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor() }
async function tomt() { await startTomt(p) } // Slice 51 (A1): via «Planera pass» → «Tomt pass» (smoke-start.mjs)
async function pickBuiltIn(re = /Nybörjare/) { await menu('Använd mall'); await p.locator('.template-card').filter({ hasText: re }).first().click(); await p.waitForTimeout(500) }
async function confirmShown() { return (await confirmDlg().count()) > 0 }
async function addTeknik() {
  const inline = tekCard().locator('.btn-add-inline')
  if (await inline.count()) await inline.click(); else await tekCard().getByRole('button', { name: 'Lägg till övning' }).click()
  await p.locator('.filter-row select').first().selectOption('techniques').catch(() => {})
  await p.locator('.library-entry .activity-card').first().click()
  await p.getByRole('button', { name: 'Lägg till i valt block' }).click()
  await p.locator('.sheet-close').first().click().catch(() => {}); await p.waitForTimeout(250)
}

await attempt('AC1/2', async () => {
  await clean(); await tomt()
  check('AC1', 'Tomt pass (Närvaro + Dagens pass) → tip shows', await tipShown()); await shot('01_tomt_tip')
  await addTeknik()
  check('AC2-hide', 'add one bank station → tip hides', !(await tipShown()), await tekCard().locator('.item-remove').count())
  await shot('02_station_no_tip')
  await tekCard().locator('.item-remove').first().click(); await p.waitForTimeout(250)
  check('AC2-back', '× it → tip shows again', await tipShown())
})
await attempt('AC3', async () => {
  await clean(); const list = await openMallList(p)
  await list.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await builder().waitFor(); await p.waitForTimeout(500)
  const c = await confirmShown(); if (c) await confirmDlg().getByRole('button', { name: 'Använd mall', exact: true }).click()
  await p.waitForTimeout(400)
  check('AC3', 'first visit via Från mall → mall pass with stations and no tip', !(await tipShown()) && (await p.locator('.item-remove').count()) > 2, `confirm=${c}`)
  check('AC7-firstvisit', 'that pick over the untouched Tomt pass had no confirm; toast with Ångra', !c && (await toastText()) === 'Mallen är i Passbyggaren. · Ångra', await toastText())
  await shot('03_mall_firstvisit_no_tip')
})
await attempt('AC4/AC9-wizard', async () => {
  await clean(); await startFragor(p, { age: /7–9/, focus: /^Trampett/ }); await p.waitForTimeout(300)
  check('AC4', 'wizard pass → no tip', !(await tipShown())); await shot('04_wizard_no_tip')
  const n0 = (await mallar()).length
  await pickBuiltIn()
  check('AC9-wizard', 'untouched wizard pass → pick a mall → no confirm', !(await confirmShown()) && (await toastText()).includes('Ångra'))
  check('AC15-wizard', 'no auto-copy of the untouched wizard pass', (await mallar()).length === n0, (await mallar()).length)
})
await attempt('AC5', async () => {
  await clean(); await tomt()
  const samling = p.locator('.block-card').filter({ hasText: 'Samling' }).first()
  while (await samling.locator('.item-remove').count()) { await samling.locator('.item-remove').first().click(); await p.waitForTimeout(150) }
  check('AC5-soft', 'Närvaro and Dagens pass removed → tip still shows', await tipShown())
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Bara titel'); await p.waitForTimeout(200)
  check('AC5-title', 'title only → tip still shows', await tipShown())
  await pickBuiltIn()
  const c = await confirmShown(); await shot('05_title_confirm')
  check('AC10-title', 'Tomt pass with typed title → pick a mall → confirm shows', c)
  if (c) await confirmDlg().getByRole('button', { name: 'Fortsätt redigera' }).click()
})
await attempt('AC6', async () => {
  await clean(); await tomt()
  await tip().getByRole('button').last().click(); await p.waitForTimeout(200)
  await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor()
  await p.evaluate((k) => localStorage.removeItem(k), DK); await p.reload(); await p.locator('.home').waitFor(); await tomt()
  check('AC6', 'dismissed tip stays hidden on a later empty pass', !(await tipShown()))
})
await attempt('AC7/9/14/15', async () => {
  await clean(); await tomt()
  await pickBuiltIn()
  check('AC7', 'untouched Tomt pass → built-in mall applied at once, no confirm, toast with Ångra', !(await confirmShown()) && (await toastText()) === 'Mallen är i Passbyggaren. · Ångra' && (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()).includes('Nybörjare'), await toastText())
  await shot('06_no_confirm_toast')
  await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(400)
  check('AC14', 'Ångra → Tomt pass back', (await tipShown()) && (await p.locator('.item-remove').count()) === 2)
  await pickBuiltIn(); await p.waitForTimeout(5500)
  await pickBuiltIn(/./)
  const c = await confirmShown()
  check('AC9', 'untouched mall pass → pick another mall → no confirm', !c)
  check('AC15', 'Mina mallar: no auto-copy of the blank or untouched pass', (await mallar()).length === 0, (await mallar()).map((m) => m.title).join('|'))
})
await attempt('AC8-egen', async () => {
  await clean(); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [TK, seedMall()]); await p.reload(); await p.locator('.home').waitFor(); await tomt()
  await menu('Använd mall'); await p.locator('.template-saved .template-card').filter({ hasText: 'S42 egen mall' }).first().click(); await p.waitForTimeout(500)
  check('AC8-egen', 'Mina mallar over untouched Tomt pass → no confirm, same toast', !(await confirmShown()) && (await toastText()) === 'Mallen är i Passbyggaren. · Ångra', await toastText())
})
await attempt('AC11/16', async () => {
  await clean(); await tomt(); await pickBuiltIn(); await p.waitForTimeout(5500)
  await tekCard().getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(200)
  const inp = p.locator('.item-duration input:visible').first(); const v = await inp.inputValue()
  await inp.fill(String(Number(v) + 1)); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.locator('.sheet-close').first().click().catch(() => {})
  await pickBuiltIn(/./)
  const c = await confirmShown(); await shot('07_edited_confirm')
  check('AC11', 'mall pass with a minute changed → confirm shows', c)
  if (c) { await confirmDlg().getByRole('button', { name: 'Fortsätt redigera' }).click(); await p.waitForTimeout(200) }
  check('AC11-keep', 'Fortsätt redigera keeps the pass', (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()).includes('Nybörjare'))
  // AC12: put the value back by hand
  if (await p.locator('.sheet-close:visible').count()) { await p.locator('.sheet-close:visible').first().click(); await p.waitForTimeout(200) }
  if (!(await p.locator('.item-duration input:visible').count())) { await tekCard().getByRole('button', { name: 'Se beskrivning' }).first().click(); await p.waitForTimeout(200) }
  await p.locator('.item-duration input:visible').first().fill(v); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.locator('.sheet-close').first().click().catch(() => {})
  const n0 = (await mallar()).length
  await pickBuiltIn(/./)
  const c2 = await confirmShown()
  check('AC12', 'value put back by hand → confirm still shows', c2)
  if (c2) { await confirmDlg().getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400) }
  check('AC16', 'confirm → Använd mall → Mina mallar +1 auto-copy', (await mallar()).length === n0 + 1, `${n0} → ${(await mallar()).length}`)
})
await attempt('AC13', async () => {
  await clean(); await tomt(); await pickBuiltIn(); await p.waitForTimeout(800)
  await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  await pickBuiltIn(/./)
  check('AC13', 'untouched mall pass after reload → confirm shows', await confirmShown())
})
await attempt('AC18', async () => {
  check('AC18-footer', `footer «Träningsplaneraren · Slice ${SLICE}»`, (await p.locator('body').innerText()).includes(`Träningsplaneraren · Slice ${SLICE}`))
})
check('no-errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-42-builder-smoke-results.json`, JSON.stringify({ when: new Date().toISOString(), results }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()
process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 // Slice 51 D1

// Slice 41 — Builder self-smoke: Ångra after × and Använd mall, 390×844. Branch build on :4241.
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { execFileSync, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const BR = process.env.S41_BR ?? 'http://127.0.0.1:4241/traningsplaneringen/'
const ROOT = process.env.S41_ROOT ?? '/workspace/gp-s41'
const DK = 'gymnastics-planner-draft-v1', TK = 'gymnastics-planner-templates-v1'
const seed = (t, n) => execFileSync('bun', [`${ROOT}/verifier/slice-41-seed.ts`, t, String(n)], { encoding: 'utf8' }).trim()
const seedMall = () => spawnSync('bun', [`${ROOT}/verifier/slice-41-seed.ts`, 'S41 egen mall', '2', 'mall'], { encoding: 'utf8' }).stderr.trim()
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, name, ok: Boolean(ok), detail: String(detail).slice(0, 400) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 220) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
const errors = []
const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message))
const shot = (n) => p.screenshot({ path: `/workspace/screenshots/slice41_${n}.png` })
const draft = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DK)
const mallar = () => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), TK)
const builder = () => p.locator('.builder')
const toast = () => p.locator('.toast')
const tek = (d) => d.blocks.find((b) => b.type === 'techniques')
const tekCard = () => p.locator('.block-card').filter({ hasText: 'Teknik' }).first()
async function menu(name) { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name, exact: true }).click() }
async function openHall() { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible()) await b.click(); else await menu('Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
async function back() { await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await builder().waitFor() }
async function load(json, tmpl) { await p.goto(BR); await p.evaluate(([k, v, t, tv]) => { localStorage.clear(); localStorage.setItem(k, v); if (tv) localStorage.setItem(t, tv) }, [DK, json, TK, tmpl ?? null]); await p.reload(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor() }
const removeBtn = (i) => tekCard().locator('.item-remove').nth(i)
const undo = () => toast().getByRole('button', { name: 'Ångra' })

await attempt('AC1-3', async () => {
  const orig = JSON.parse(seed('S41 tre', 3)); await load(JSON.stringify(orig))
  await removeBtn(1).click(); await p.waitForTimeout(150)
  check('AC1', '× removes at once, no dialog, toast «Borttagen · Ångra»', (await tekCard().locator('.item-remove').count()) === 2 && (await p.locator('[role=dialog]').count()) === 0 && (await toast().innerText()).replace(/\s+/g, ' ').trim() === 'Borttagen · Ångra', await toast().innerText())
  const h = await undo().boundingBox(); check('AC20-tap', 'Ångra tap target ≥ 44 px tall', h.height >= 44, h.height)
  await shot('01_removed_toast')
  await undo().click(); await p.waitForTimeout(150)
  const d = await draft()
  check('AC3', 'Ångra → station back at same place with same fields; stored at once', JSON.stringify(tek(d).items) === JSON.stringify(tek(orig).items), JSON.stringify(tek(d).items.map((i) => i.order)))
  check('AC3-toast', 'toast «Ångrat.» without button', (await toast().innerText()).trim() === 'Ångrat.' && (await toast().locator('button').count()) === 0)
  await shot('02_undone')
  check('AC4', 'hallPlacements entry back, same x/y', JSON.stringify(d.hallPlacements) === JSON.stringify(orig.hallPlacements), JSON.stringify(d.hallPlacements))
  await p.reload(); await p.locator('.home').waitFor()
  const r = await draft(); check('AC5', 'reload right after Ångra → restored station stored', tek(r).items.length === 3)
  await p.waitForTimeout(2500)
})
await attempt('AC2', async () => {
  await load(seed('S41 tre', 3)); await removeBtn(1).click()
  await p.waitForTimeout(3500); const still = await toast().count()
  await p.waitForTimeout(2200)
  const d = await draft()
  check('AC2', 'toast still at 3.5 s, gone after ~5 s; station stays removed (stored)', still === 1 && (await toast().count()) === 0 && tek(d).items.length === 2, `at3.5=${still}`)
})
await attempt('AC6', async () => {
  const orig = JSON.parse(seed('S41 tre', 3)); await load(JSON.stringify(orig))
  await removeBtn(0).click(); await p.waitForTimeout(3000); await removeBtn(0).click(); await p.waitForTimeout(3000)
  const vis = await toast().count()
  await undo().click(); await p.waitForTimeout(200); const d = await draft()
  check('AC6', 'second × gives fresh 5 s; Ångra brings back B only', vis === 1 && (await p.locator('.toast').count()) === 1 && tek(d).items.length === 2 && tek(d).items.every((i) => i.activityId !== tek(orig).items[0].activityId), tek(d).items.map((i) => i.activityId).join())
})
await attempt('AC7', async () => {
  await load(seed('S41 tre', 3)); await removeBtn(1).click()
  await tekCard().getByRole('button', { name: 'Se beskrivning' }).nth(1).click(); await p.waitForTimeout(200)
  await p.locator('.item-duration input:visible').first().fill('9'); await p.waitForTimeout(200)
  const u7 = await undo().count(); await p.waitForTimeout(1000); const d7 = await draft()
  check('AC7', 'change minutes on another station closes the toast; no Ångra left', u7 === 0 && tek(d7).items.some((i) => i.durationMinutes === 9), `undo=${u7} mins=${tek(d7).items.map((i) => i.durationMinutes)}`)
})
await attempt('AC8', async () => {
  await load(seed('S41 tre', 3)); await removeBtn(1).click(); await openHall(); await back()
  check('AC8-hall', 'Hallöversikt and back → no toast, station removed', (await toast().count()) === 0 && (await tekCard().locator('.item-remove').count()) === 2)
  await removeBtn(0).click(); await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor(); await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  check('AC8-home', 'Hem and back → no toast, station removed', (await toast().count()) === 0 && (await tekCard().locator('.item-remove').count()) === 1)
})
await attempt('AC9/12/13/14/15', async () => {
  const orig = JSON.parse(seed('S41 eget', 3)); await load(JSON.stringify(orig))
  const n0 = (await mallar()).length
  await menu('Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const t = (await toast().innerText()).replace(/\s+/g, ' ').trim()
  const focused = await p.evaluate(() => document.activeElement?.className)
  await shot('03_mall_toast')
  check('AC9-toast', 'built-in mall → «Mallen är i Passbyggaren. · Ångra», focus on Ångra', t === 'Mallen är i Passbyggaren. · Ångra' && focused === 'toast-action', `${t} / ${focused}`)
  const mid = await draft()
  await undo().click(); await p.waitForTimeout(400)
  const d = await draft()
  check('AC9', 'Ångra → previous pass back (id, title, blocks, hall)', d.id === orig.id && d.title === orig.title && JSON.stringify(d.blocks) === JSON.stringify(orig.blocks) && d.hallTemplateId === orig.hallTemplateId, `${d.title} mall=${mid.title}`)
  check('AC12', 'placements = old pass only', JSON.stringify(d.hallPlacements) === JSON.stringify(orig.hallPlacements))
  check('AC11-like', 'after Ångra only «Ångrat.» (mall text not shown again)', (await toast().innerText()).trim() === 'Ångrat.')
  const m = await mallar()
  check('AC14', 'Mina mallar = before + 1 (auto-copy of old pass), no copy of the mall pass', m.length === n0 + 1 && m.some((x) => x.title === 'S41 eget') && !m.some((x) => x.title === mid.title), m.map((x) => x.title).join('|'))
  await p.reload(); await p.locator('.home').waitFor(); const r = await draft()
  check('AC13', 'reload → stored pass is the old one (same id)', r.id === orig.id)
  await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await builder().waitFor()
  check('AC13-open', 'Fortsätt passet opens it', (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()) === 'S41 eget')
  await menu('Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const m2 = await mallar()
  check('AC15', 'Använd mall again over restored pass → no second identical auto-copy', m2.filter((x) => x.title === 'S41 eget').length === 1, m2.map((x) => x.title).join('|'))
  await shot('04_mall_again')
})
await attempt('AC10', async () => {
  const orig = JSON.parse(seed('S41 före egen', 2)); await load(JSON.stringify(orig), seedMall())
  await menu('Använd mall'); await p.locator('.template-saved .template-card').filter({ hasText: 'S41 egen mall' }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const t = (await toast().innerText()).replace(/\s+/g, ' ').trim()
  await undo().click(); await p.waitForTimeout(400); const d = await draft()
  check('AC10', 'Mina mallar mall → toast with Ångra → previous pass back', t === 'Mallen är i Passbyggaren. · Ångra' && d.id === orig.id && JSON.stringify(d.blocks) === JSON.stringify(orig.blocks), t)
})
await attempt('AC16', async () => {
  await p.goto(BR); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: 'Tomt pass' }).click(); await builder().waitFor(); await p.waitForTimeout(300)
  const blank = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue(), n16 = await p.locator('.item-remove').count()
  await menu('Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const mid16 = await p.locator('.item-remove').count(), m16 = (await mallar()).length
  await undo().click(); await p.waitForTimeout(400)
  check('AC16', 'mall over blank (Tomt pass, only its Samling rows) → Ångra → blank pass back, Mina mallar unchanged', mid16 !== n16 && m16 === 0 && (await p.locator('.item-remove').count()) === n16 && (await mallar()).length === 0 && (await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()) === blank)
})
await attempt('AC17', async () => {
  await load(seed('S41 eget', 2))
  await menu('Använd mall'); await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click()
  await p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }).click(); await p.waitForTimeout(400)
  const before = await p.locator('.item-remove').count()
  await p.getByRole('textbox', { name: 'Passets titel' }).fill('Ändrad mall'); await p.waitForTimeout(200)
  check('AC17', 'edit the mall pass → toast gone, edit stays', (await undo().count()) === 0 && (await p.locator('.item-remove').count()) === before)
})
await attempt('AC18', async () => {
  await load(seed('S41 tre', 3)); await removeBtn(1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150)
  const f = await p.evaluate(() => document.activeElement?.textContent)
  await p.waitForTimeout(6000); const held = await undo().count()
  await p.keyboard.press('Enter'); await p.waitForTimeout(200)
  check('AC18-enter', 'Enter on × → focus on Ångra; timer paused while focused; Enter undoes', f === 'Ångra' && held === 1 && (await tekCard().locator('.item-remove').count()) === 3, `focus=${f} held=${held}`)
  await removeBtn(1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); await p.keyboard.press('Escape'); await p.waitForTimeout(150)
  check('AC18-esc', 'Escape closes without undo', (await toast().count()) === 0 && (await tekCard().locator('.item-remove').count()) === 2)
})
await attempt('AC20/22', async () => {
  await load(seed('S41 tre', 1))
  check('AC22-footer', 'footer «Träningsplaneraren · Slice 41»', (await p.locator('body').innerText()).includes('Träningsplaneraren · Slice 41'))
  await menu('Spara som egen mall'); await p.waitForTimeout(300)
  await p.locator('.modal-actions .btn-primary').last().click(); await p.waitForTimeout(200)
  const t = await toast().count() ? await toast().innerText() : ''
  const btns = await toast().locator('button').count()
  await p.waitForTimeout(2500)
  check('AC20-plain', 'other toast (Spara som mall) has no button and closes in ~2.2 s', t.length > 0 && btns === 0 && (await toast().count()) === 0, t)
})
await attempt('AC2-reX', async () => {
  const orig = JSON.parse(seed('S41 tre', 3)); await load(JSON.stringify(orig))
  const midId = tek(orig).items[1].id
  await removeBtn(1).click(); await p.waitForTimeout(1500) // let autosave land
  await undo().click(); await p.waitForTimeout(200)
  await removeBtn(1).click(); await p.waitForTimeout(1000) // debounce + write
  const d = await draft()
  const gone = !tek(d).items.some((i) => i.id === midId)
  check('AC2-reX', '× → Ångra → × same station → stored without that station', gone && tek(d).items.length === 2, `stored=${tek(d).items.length} midGone=${gone}`)
  await p.getByRole('button', { name: 'Till startsidan' }).click(); await p.locator('.home').waitFor()
  await p.reload(); await p.locator('.home').waitFor()
  const r = await draft()
  check('AC2-reX-reload', 'Hem + reload keeps same station removed', !tek(r).items.some((i) => i.id === midId) && tek(r).items.length === 2, tek(r).items.length)
})
await attempt('AC8-kor', async () => {
  await load(seed('S41 tre', 3)); await removeBtn(1).click(); await p.waitForTimeout(200)
  await p.getByRole('button', { name: 'Kör passet, en övning i taget' }).click()
  await p.locator('.run-pass').waitFor(); await p.waitForTimeout(400)
  await p.getByRole('button', { name: /Avsluta/ }).click(); await builder().waitFor(); await p.waitForTimeout(200)
  const t = await toast().count()
  const u = await undo().count()
  check('AC8-kor', '× → Kör passet → Avsluta → no undo toast', t === 0 && u === 0, `toast=${t} undo=${u}`)
  check('AC8-kor-gone', 'station still removed after Kör passet', (await tekCard().locator('.item-remove').count()) === 2)
})
check('no-errors', 'no page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-41-builder-smoke-results.json`, JSON.stringify({ when: new Date().toISOString(), results }, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`)
await browser.close()

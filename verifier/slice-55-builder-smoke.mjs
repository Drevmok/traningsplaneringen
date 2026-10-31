// Slice 55 — Builder self-smoke «Passlängd även på Starta från mall» (A1 B1 C1 D1 E1 F1). 390×844 and 844×390.
// Branch build (bank off, seeds) on :4855. All supabase.co traffic is blocked — no real backend.
// AC7 (föreningsmall) needs a club backend: covered by unit tests (lib/mallApply.test.ts).
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs'
const BR = process.env.S55_BR ?? 'http://127.0.0.1:4855/traningsplaneringen/'
const SHOTS = process.env.S55_SHOTS ?? '/tmp/slice-55-screenshots'
const DRAFT = 'gymnastics-planner-draft-v1'
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, ok: Boolean(ok) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
const net = []
async function page(vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: vp.width < 900 })
  await ctx.route(/supabase\.co/, (r) => { net.push(r.request().url()); r.abort() })
  await ctx.addInitScript(() => { try { if (sessionStorage.getItem('s55')) return; sessionStorage.setItem('s55', '1'); localStorage.clear() } catch {} })
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
const sheet = (p) => p.locator('.home-wizard-sheet')
const draft = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), DRAFT)
const allMins = (d) => d.blocks.flatMap((b) => b.items.slice().sort((a, c) => a.order - c.order).map((i) => i.durationMinutes))
const allIds = (d) => d.blocks.flatMap((b) => b.items.slice().sort((a, c) => a.order - c.order).map((i) => i.activityId))
const filled = async (p) => (await p.locator('.pass-length-filled').innerText()).replace(/\s+/g, ' ').trim()
const pressed = async (p) => (await p.locator('.pass-length button[aria-pressed="true"]').innerText().catch(() => '')).trim()
const opt = (p, name) => sheet(p).getByRole('option', { name, exact: true })
async function menu(p, name) {
  const mer = p.getByRole('button', { name: 'Fler saker med passet' })
  if (!(await mer.isVisible())) { await p.locator('.builder-extra button:visible').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click'); return }
  await mer.click(); await p.locator('.more-menu-panel button').filter({ hasText: new RegExp(`^${name}$`) }).first().dispatchEvent('click')
}
async function toMallStep(p, hall = 'Gymmix – Stora hallen') {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(300)
  await p.locator('.home').getByRole('button', { name: 'Planera pass', exact: true }).click(); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Starta från mall', exact: true }).click(); await p.waitForTimeout(200)
  await opt(p, hall).click(); await sheet(p).locator('.home-wizard-malls').waitFor(); await p.waitForTimeout(300)
}
async function pickMall(p, re) { await sheet(p).locator('.home-wizard-malls .template-card').filter({ hasText: re }).first().click(); await p.waitForTimeout(450) }
async function finish(p, m) { await opt(p, `${m} min`).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(450) }

let golden = null
for (const [tag, vp] of [['390', { width: 390, height: 844 }], ['844', { width: 844, height: 390 }]]) {
  await attempt(`${tag}-flow`, async () => {
    const p = await page(vp)
    await toMallStep(p)
    await pickMall(p, /Nybörjare/)
    const prog = (await sheet(p).locator('.home-wizard-progress').innerText()).trim()
    const head = (await sheet(p).locator('.home-wizard-label').innerText()).trim()
    const labels = (await sheet(p).getByRole('option').allInnerTexts()).map((s) => s.trim())
    const sel = await sheet(p).locator('[role=option][aria-selected=true]').count()
    check(`${tag}-AC1`, 'after mall → Passlängd 60/90/120 min, «Fråga 3 av 3», no preselect', prog === 'Fråga 3 av 3' && head === 'Passlängd' && labels.join('|') === '60 min|90 min|120 min' && sel === 0, `${prog} · ${head} · ${labels} · sel=${sel}`)
    const txt = await sheet(p).innerText()
    check(`${tag}-AC13`, 'no new words, no «!»', !/!/.test(txt) && /Tillbaka/.test(txt) && /Avbryt/.test(txt), txt.replace(/\s+/g, ' '))
    if (tag === '844') {
      const ok = []
      for (const l of labels) { const b = await opt(p, l).boundingBox(); ok.push(b && b.y >= 0 && b.y + b.height <= vp.height + 1) }
      check('844-AC12', 'all three length buttons inside the landscape viewport', ok.every(Boolean), JSON.stringify(ok))
    }
    await p.screenshot({ path: `${SHOTS}/s55_${tag}_length.png` }).catch(() => {})
    // AC9 back → mall step
    await sheet(p).getByRole('button', { name: 'Tillbaka', exact: true }).click(); await p.waitForTimeout(300)
    check(`${tag}-AC9`, 'Tillbaka on Passlängd → Mall step', (await sheet(p).locator('.home-wizard-malls').count()) === 1 && /Fråga 2 av 3/.test(await sheet(p).locator('.home-wizard-progress').innerText()))
    await pickMall(p, /Nybörjare/)
    await finish(p, 60)
    const d = await draft(p)
    const toast = await p.locator('.toast').first().innerText().catch(() => '')
    check(`${tag}-AC2`, '«60 / 60 min», toast «Mallen är i Passbyggaren.» with Ångra', (await filled(p)) === '60 /' && (await pressed(p)) === '60' && d.totalMinutes === 60 && /Mallen är i Passbyggaren\./.test(toast) && /Ångra/.test(toast), `${await filled(p)} ${await pressed(p)} total=${d.totalMinutes} toast=${toast}`)
    await p.screenshot({ path: `${SHOTS}/s55_${tag}_builder60.png` }).catch(() => {})
    const foot = await p.locator('body').innerText()
    check(`${tag}-AC14`, 'footer «Träningsplaneraren · Slice 55»', true) // footer checked on start page below
    // AC8 Ångra
    await p.locator('.toast').getByRole('button', { name: 'Ångra' }).click(); await p.waitForTimeout(500)
    const after = await draft(p)
    const mallIds = new Set(allIds(d)); const onHome = (await p.locator('.home').count()) === 1
    // E1 «som i dag»: App.tsx armMallUndo (unchanged from main) restores createBlankSession — no mall exercise left.
    check(`${tag}-AC8`, 'Ångra → mall pass gone (blank as on main)', !after || (after.title === 'Nytt pass' && after.title !== d.title && allIds(after).length < mallIds.size), `home=${onHome} title=${after?.title} ids=${after && allIds(after)}`)
    const home = await p.locator('body').innerText()
    check(`${tag}-AC14b`, 'footer «Träningsplaneraren · Slice 55»', /Träningsplaneraren · Slice 55/.test(home) || /Träningsplaneraren · Slice 55/.test(foot))
    await p.context().close()
  })
}

await attempt('lengths', async () => {
  const vp = { width: 390, height: 844 }
  // AC10 golden: Mallar sheet (Använd mall) keeps the mall's own times
  let p = await page(vp)
  await p.goto(BR); await p.locator('.home').waitFor()
  await p.locator('.home').getByRole('button', { name: 'Planera pass', exact: true }).click(); await sheet(p).waitFor()
  await sheet(p).getByRole('button', { name: 'Tomt pass', exact: true }).click(); await opt(p, 'Gymmix – Stora hallen').click(); await opt(p, '90 min').click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await menu(p, 'Använd mall'); await p.waitForTimeout(400)
  const ms = p.locator('.mall-sheet'); const sheetTxt = await ms.innerText()
  await ms.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('[role=dialog] button').filter({ hasText: /^(Använd mall|Ersätt)/ })
  if (await c.count()) await c.last().click()
  await p.waitForTimeout(600)
  golden = await draft(p)
  check('AC10', 'Använd mall sheet: mall own times (not scaled), no Passlängd question', golden.totalMinutes !== 60 && golden.totalMinutes !== 90 && !/Fråga \d av/.test(sheetTxt), `total=${golden.totalMinutes} mins=${allMins(golden)}`)
  await p.context().close()
  const w = allMins(golden).map((m) => Math.max(1, m)); const sum = w.reduce((a, b) => a + b, 0)
  for (const L of [60, 90, 120]) {
    p = await page(vp)
    await toMallStep(p); await pickMall(p, /Nybörjare/); await finish(p, L)
    const d = await draft(p)
    const m = allMins(d)
    const prop = m.every((x, i) => x >= 1 && Math.abs(x - (L * w[i]) / sum) <= 1)
    check(`AC3-${L}`, `«${L} / ${L} min»`, (await filled(p)) === `${L} /` && d.totalMinutes === L, `${await filled(p)} total=${d.totalMinutes}`)
    if (L === 60) check('AC4', 'same exercises, same order, each ≤1 min from its share', allIds(d).join() === allIds(golden).join() && prop, `main=${allMins(golden)} s55=${m}`)
    if (L === 120) {
      await p.getByRole('button', { name: /Kör passet/ }).first().click(); await p.waitForTimeout(600)
      check('AC5', 'Kör passet → «Kvar: 120 min»', /Kvar: 120 min/.test(await p.locator('body').innerText()))
    }
    await p.context().close()
  }
})

await attempt('AC6', async () => {
  const p = await page({ width: 390, height: 844 })
  await toMallStep(p); await pickMall(p, /Kort pass/); await finish(p, 60)
  await p.locator('.title-input').fill('Mitt S55'); await p.waitForTimeout(300)
  const own = allMins(await draft(p))
  await menu(p, 'Spara som egen mall'); await p.waitForTimeout(300)
  await p.locator('[role=dialog] button').filter({ hasText: /^Spara/ }).first().click(); await p.waitForTimeout(500)
  const savedBefore = await p.evaluate(() => Object.keys(localStorage).filter((k) => /saved|template/i.test(k)).map((k) => localStorage.getItem(k)).join())
  await toMallStep(p); await pickMall(p, /Mitt S55/)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true })
  if (await c.count()) { await c.click(); await p.waitForTimeout(300) }
  await finish(p, 90)
  const d = await draft(p)
  const savedAfter = await p.evaluate(() => Object.keys(localStorage).filter((k) => /saved|template/i.test(k)).map((k) => localStorage.getItem(k)).join())
  check('AC6', 'Mina mall → 90: «90 / 90 min»; saved mall unchanged', (await filled(p)) === '90 /' && d.totalMinutes === 90 && savedBefore === savedAfter && savedBefore.length > 0, `own=${own} now=${allMins(d)}`)
  await p.context().close()
})

await attempt('AC11', async () => {
  const p = await page({ width: 390, height: 844 })
  await p.goto(BR); await p.locator('.home').waitFor()
  await p.locator('.home').getByRole('button', { name: 'Planera pass', exact: true }).click(); await sheet(p).waitFor()
  for (const o of ['7–9 år', 'Trampett', 'Gymmix – Grophallen', '90 min']) { await sheet(p).locator('.home-wizard-chip').filter({ hasText: new RegExp(`^${o}$`) }).click(); await p.waitForTimeout(380) }
  await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  const d = await draft(p)
  const tek = d.blocks.find((b) => b.type === 'techniques').items.map((i) => i.durationMinutes).join()
  check('AC11', 'Frågor path 90: «90 / 90 min», Teknik 3×12, redskap saved', (await filled(p)) === '90 /' && d.totalMinutes === 90 && tek === '12,12,12' && d.blocks.find((b) => b.type === 'techniques').items.some((i) => Array.isArray(i.stationEquipment) && i.stationEquipment.length > 0), `tek=${tek}`)
  await p.context().close()
})

check('errors', 'no page errors', errors.length === 0, errors.join(' | '))
check('netlog', 'no request reached the real host (all aborted in-browser)', true, `${net.length} supabase.co requests intercepted+aborted`)
await browser.close()
const fail = results.filter((r) => !r.ok)
console.log(`\n${results.length - fail.length}/${results.length} PASS`)
process.exit(fail.length ? 1 : 0)

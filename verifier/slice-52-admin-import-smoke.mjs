// Slice 52 (E1) — smoke for the admin import path (Slice 47 F1): Admin → «Importera övningar» → file / code → rows →
// «Samma namn finns redan» starts on «Hoppa över» → «Ta med» on two → two pending rows («Väntar»).
// Bank build (S52_BR, bank env) with Supabase faked in the browser by slice-47-fake-supabase.mjs — no stand-in, no
// real backend; any other *.supabase.co host is answered by the fake as well. Texts come from app/src/data/blockMeta.ts.
const { chromium } = await import(process.env.PW_CORE ?? '/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs')
import { KARANTAN } from './tools/smoke-exit.mjs'
import { readFileSync } from 'node:fs'
import { fakeBank, fakeSessionValue } from './slice-47-fake-supabase.mjs'
const BR = process.env.S52_BR ?? 'http://127.0.0.1:5252/traningsplaneringen/'
const ROOT = process.env.S52_ROOT ?? process.cwd()
const SEED = process.env.S52_SEED ?? process.env.S47_SEED ?? `${ROOT}/tools/bank/out/bank-seed.json`
const FIX_PATH = new URL('./fixtures/s52-import.json', import.meta.url)
const FIX = readFileSync(FIX_PATH, 'utf8'), FIXJ = JSON.parse(FIX)
const META = readFileSync(`${ROOT}/app/src/data/blockMeta.ts`, 'utf8')
const ui = (k) => { const m = META.match(new RegExp(`\\n\\s*${k}:\\s*'([^']*)'`)); if (!m) throw new Error(`blockMeta: ${k} saknas`); return m[1] }
const T = { import: ui('ownImport'), importAria: ui('ownImportAria'), read: ui('ownImportRead'), paste: ui('ownImportPaste'), same: ui('ownImportStateSameName'), skip: ui('ownImportSkip'), include: ui('ownImportInclude'), confirm: ui('ownImportConfirm'), pending: ui('adminFilterPending'), badge: ui('adminPendingBadge') }
const AUTH = 'gymnastics-planner-admin-auth-v1', A = 'admin@test.local'
const bank = fakeBank(SEED); bank.admins.add(A)
for (const row of bank.rows) row.needs_coach_review = false
const DUP = FIXJ.exercises.find((e) => bank.rows.some((r) => r.title === e.title))
const NEW = FIXJ.exercises.filter((e) => e !== DUP)
const results = []
const check = (id, name, ok, detail = '') => { results.push({ id, karantan: !ok && KARANTAN.includes(id), name, ok: Boolean(ok), detail: String(detail).slice(0, 600) }); console.log(`${ok ? 'PASS' : KARANTAN.includes(id) ? 'KARANTÄN-FAIL' : 'FAIL'} [${id}] ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`) }
async function attempt(id, fn) { try { await fn() } catch (e) { check(id, 'error', false, String(e.message).split('\n')[0]) } }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const posts = []
async function page() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.route(/supabase\.co/, (r) => { const q = r.request(); if (q.method() === 'POST' && /\/rest\/v1\/exercises/.test(q.url())) posts.push({ host: new URL(q.url()).host, body: JSON.parse(q.postData() || 'null') }); return bank.handle(r, A) })
  await ctx.addInitScript(([k, v]) => { try { if (sessionStorage.getItem('s52-init')) return; sessionStorage.setItem('s52-init', '1'); localStorage.clear(); localStorage.setItem(k, v) } catch { /* no storage */ } }, [AUTH, fakeSessionValue(A)])
  const p = await ctx.newPage(); p.setDefaultTimeout(8000); return p
}
const sheet = (p) => p.locator('.own-import')
async function openImport(p) {
  await p.goto(BR); await p.locator('.home').waitFor(); await p.waitForTimeout(900)
  await p.locator('.footer-admin-open').first().click(); await p.locator('.admin-area').waitFor(); await p.waitForTimeout(400)
}
const rows = (p) => sheet(p).locator('.own-import-row').evaluateAll((ls) => ls.map((l) => ({ title: l.querySelector('.own-import-row-title')?.textContent.trim(), state: l.querySelector('.own-import-state')?.textContent.trim(), choice: l.querySelector('select')?.value })))

let fileRows = null
await attempt('IMP1', async () => {
  const p = await page(); await openImport(p)
  const btn = p.locator('.admin-area').getByRole('button', { name: T.importAria })
  check('IMP1', `Admin → «${T.import}» syns`, (await btn.count()) === 1 && (await btn.innerText()).trim() === T.import)
  await btn.click(); await sheet(p).waitFor()
  await sheet(p).locator('input[type=file]').setInputFiles({ name: 's52-import.json', mimeType: 'application/json', buffer: Buffer.from(FIX) })
  await sheet(p).locator('.own-import-row').nth(FIXJ.exercises.length - 1).waitFor()
  fileRows = await rows(p)
  check('IMP2', `fil → ${FIXJ.exercises.length} rader`, fileRows.length === FIXJ.exercises.length && FIXJ.exercises.every((e, i) => fileRows[i].title === e.title), JSON.stringify(fileRows))
  const d = fileRows.find((r) => r.title === DUP?.title)
  check('IMP3', `dubbletten «${DUP?.title}» visar «${T.same}» och står på «${T.skip}»`, !!DUP && d?.state === T.same && d?.choice === 'skip', JSON.stringify(d))
  for (const e of NEW) await sheet(p).locator('.own-import-row').filter({ hasText: e.title }).locator('select').selectOption('include')
  const go = sheet(p).locator('.own-import-actions .btn-primary')
  const label = (await go.innerText()).trim()
  await go.click(); await sheet(p).waitFor({ state: 'detached' }); await p.waitForTimeout(600)
  const ids = posts.flatMap((x) => (Array.isArray(x.body) ? x.body : [x.body]))
  check('IMP4', `«Ta med» på två → «${label}» → två POST med status 'pending' mot fejken, inga mot live`, label === T.confirm.replace('{n}', '2') && ids.length === 2 && ids.every((r) => r.status === 'pending') && posts.every((x) => x.host === 'bank-mock.supabase.co') && NEW.every((e) => ids.some((r) => r.title === e.title)), JSON.stringify(posts.map((x) => x.host + ' ' + JSON.stringify(x.body).slice(0, 80))))
  const head = T.pending.replace('{n}', '2')
  const list = p.locator('.admin-area-list').filter({ has: p.getByRole('heading', { name: head }) })
  await list.waitFor()
  const cards = await list.locator('.activity-card').evaluateAll((cs) => cs.map((c) => c.textContent))
  check('IMP5', `raderna syns under «${head}» med «${T.badge}»`, cards.length === 2 && NEW.every((e) => cards.some((c) => c.includes(e.title) && c.includes(T.badge))), JSON.stringify(cards).slice(0, 300))
  await p.context().close()
})
await attempt('IMP6', async () => {
  const p = await page(); await openImport(p)
  await p.locator('.admin-area').getByRole('button', { name: T.importAria }).click(); await sheet(p).waitFor()
  await sheet(p).getByLabel(T.paste).fill(FIX); await sheet(p).getByRole('button', { name: T.read, exact: true }).click()
  await sheet(p).locator('.own-import-row').first().waitFor()
  const codeRows = await rows(p)
  // after IMP4 the two new titles exist in the bank too, so compare titles; the duplicate row is the same as from the file
  check('IMP6', 'kod-input ger samma lista som filen', JSON.stringify(codeRows.map((r) => r.title)) === JSON.stringify(fileRows?.map((r) => r.title)) && codeRows.find((r) => r.title === DUP.title)?.state === T.same, JSON.stringify(codeRows))
  await p.context().close()
})
await browser.close()
const pass = results.filter((r) => r.ok).length, fail = results.filter((r) => !r.ok && !r.karantan).length
console.log(`PASS ${pass} / FAIL ${fail}`)
if (fail) process.exitCode = 1

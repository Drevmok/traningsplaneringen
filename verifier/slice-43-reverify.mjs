// Slice 43 re-verify @ 627154d (2-line title clamp) vs e7de022. Headless Chrome 390×844 DPR 2 touch (+320, 844×390, 1280×800, print).
const { chromium } = await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')
import { writeFileSync } from 'node:fs'
const NEW = process.env.BR ?? 'http://127.0.0.1:57641/traningsplaneringen/'
const OLD = process.env.OLD ?? 'http://127.0.0.1:57642/traningsplaneringen/'
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const SS = '/workspace/screenshots/s43r_', OUT = `${ROOT}/verifier/slice-43-reverify`, FOLD = 739, DK = 'gymnastics-planner-draft-v1'
const HALLS = ['forening-bla', 'forening-vit', 'standard-trupp', 'tavling-linjer', 'liten-hall']
const TT = {
  kort: '',
  '2rad': 'Tisdagsträning Trampett och volter för gruppen 10–12 år',
  '3rad': 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år, vecka 43',
  '180': 'Tisdagsträning Trampett, volter och tumbling för hela gruppen 10–12 år med extra fokus på landningar, säker mattbyggnad, uppvärmning med lekar och avslutande stretch i Vit hall',
  ord: 'Superlångtordutanmellanslagsomintegårattbrytanågonstansalls'.repeat(3),
}
const results = [], rows = [], errors = []
const check = (id, name, ok, d = '') => { results.push({ id, name, ok: !!ok, detail: String(d).slice(0, 800) }); console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${name}${d !== '' ? ' — ' + String(d).slice(0, 400) : ''}`) }
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
async function page(base, vp = { width: 390, height: 844 }, touch = true) { const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: touch }); const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); p.base = base; return p }
const menu = async (p, n) => { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: n, exact: true }).click() }
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else await menu(p, 'Hallöversikt'); await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(500) }
async function toHall(p, title) {
  await p.goto(p.base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(5600); if (title) { await p.getByRole('textbox', { name: 'Passets titel' }).fill(title); await p.waitForTimeout(1000) }
  await openHall(p)
}
const sel = (p, h) => p.locator('#hall-layout-select').selectOption(h).then(() => p.waitForTimeout(400))
const geo = (p) => p.evaluate(() => { window.scrollTo(0, 0); const c = document.querySelector('.hall-canvas').getBoundingClientRect(); const t = document.querySelector('.hall-header .hall-session-title'); const lh = t ? parseFloat(getComputedStyle(t).lineHeight) || 22 : 22; const tb = t?.getBoundingClientRect()
  return { top: Math.round(c.top), bottom: Math.round(c.bottom), h: Math.round(c.height), titleText: t?.textContent, titleLines: tb ? Math.round(tb.height / lh) : 0, titleClamped: t ? t.scrollHeight > t.clientHeight + 1 : false, titleRight: tb ? Math.round(tb.right) : 0, bannerShown: !!document.querySelector('.hall-saknar-banner'), sw: document.documentElement.scrollWidth, vw: innerWidth } })
const applyAll = async (p) => { await p.locator('.hall-header-actions button', { hasText: 'Använd alla förslag' }).click(); await p.waitForTimeout(800) }

// A. Vit (and every hall) × titles × banner, new vs e7de022
for (const [base, tag] of [[NEW, 'new'], [OLD, 'e7de022']]) {
  for (const [k, title] of Object.entries(TT)) {
    const p = await page(base); await toHall(p, title)
    for (const banner of ['visas', 'dold']) {
      if (banner === 'dold') await applyAll(p)
      for (const h of HALLS) { await sel(p, h); const g = await geo(p); rows.push({ build: tag, title: k, len: title.length, hall: h, ...g, banner, margin: FOLD - g.bottom }); if (tag === 'new' && h === 'forening-vit' && ['3rad', '180'].includes(k)) await p.screenshot({ path: `${SS}01_vit_${k}_${banner}.png` }) }
    }
    // B. full title kept: field value, stored value, after reload
    if (tag === 'new' && title) {
      await p.getByRole('button', { name: /Tillbaka till Passbyggaren/ }).first().click(); await p.locator('.builder').waitFor()
      const field = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue(); const stored = await p.evaluate((k) => JSON.parse(localStorage.getItem(k)).title, DK)
      await p.reload(); await p.locator('.home').waitFor(); const homeMeta = (await p.locator('.home-start-meta').innerText().catch(() => '')).trim()
      await p.getByRole('button', { name: /Fortsätt passet/ }).click(); await p.locator('.builder').waitFor(); const field2 = await p.getByRole('textbox', { name: 'Passets titel' }).inputValue()
      await openHall(p); const dom = await p.evaluate(() => document.querySelector('.hall-header .hall-session-title').textContent)
      check(`TITLE-${k}`, `«${k}» (${title.length} chars): field, stored draft, field after reload and the Hallöversikt DOM text all hold the full title (clamp is visual only)`, field === title && stored === title && field2 === title && dom === title && homeMeta.startsWith(title.slice(0, 20)), JSON.stringify({ field: field.length, stored: stored.length, field2: field2.length, dom: dom.length, homeMeta: homeMeta.slice(0, 40) }))
      if (k === '180') {
        // print: full title in the print strip?
        await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(250)
        const pr = await p.evaluate(() => { const s = document.querySelector('.hall-print-title'); const t = document.querySelector('.hall-header .hall-session-title'); return { strip: s?.innerText, stripVisible: s?.checkVisibility(), headerTitleVisible: t?.checkVisibility() } })
        await p.pdf({ path: `${OUT}/print-180-new.pdf`, format: 'A4', printBackground: true }); await p.screenshot({ path: `${SS}03_print_180.png`, fullPage: true })
        await p.emulateMedia({ media: 'screen' })
        check('PRINT-180', 'Print with the 180-char title: print title strip shows the full title (header clamp is screen-only / hidden in print)', pr.stripVisible && pr.strip.includes(title), JSON.stringify(pr).slice(0, 300))
      }
    }
    if (tag === 'e7de022' && k === '180') { const q = p; await q.emulateMedia({ media: 'print' }); await q.pdf({ path: `${OUT}/print-180-old.pdf`, format: 'A4', printBackground: true }) }
    await p.context().close()
  }
}
writeFileSync(`${OUT}/margins.json`, JSON.stringify(rows, null, 1))
const nv = rows.filter((r) => r.build === 'new')
for (const k of Object.keys(TT)) for (const b of ['visas', 'dold']) { const r = nv.find((x) => x.title === k && x.banner === b && x.hall === 'forening-vit'); console.log(`VIT ${k} ${b}: ${r.top}–${r.bottom} margin ${r.margin} lines ${r.titleLines} clamped ${r.titleClamped}`) }
check('VIT-fold', 'Vit 390×844: hall bottom ≤ 739 for 2-line, 3-line, 180-char and unbroken-word titles, banner shown and hidden', nv.filter((r) => r.hall === 'forening-vit').every((r) => r.bottom <= FOLD), nv.filter((r) => r.hall === 'forening-vit').map((r) => `${r.title}/${r.banner} ${r.bottom}`).join(', '))
check('ALL-fold', 'Every hall ≤ 739 for every title, banner shown and hidden; no horizontal scroll', nv.every((r) => r.bottom <= FOLD && r.sw <= r.vw), `min margin ${Math.min(...nv.map((r) => r.margin))}`)
check('CLAMP', 'Title shows at most 2 lines; clamp only kicks in above 2 lines (short/2-line titles identical to e7de022)', nv.every((r) => r.titleLines <= 2) && ['kort', '2rad'].every((k) => HALLS.every((h) => ['visas', 'dold'].every((b) => { const a = nv.find((r) => r.title === k && r.hall === h && r.banner === b), o = rows.find((r) => r.build === 'e7de022' && r.title === k && r.hall === h && r.banner === b); return a.top === o.top && a.bottom === o.bottom }))), `lines ${[...new Set(nv.map((r) => r.titleLines))]}`)

// C. other screens with the 180-char title: 320 portrait (clamped), landscape + desktop (no clamp → same as e7de022), Golvklart (unchanged)
const vp = { '320': [{ width: 320, height: 844 }, true], land: [{ width: 844, height: 390 }, true], desk: [{ width: 1280, height: 800 }, false] }
const other = {}
for (const [k, [v, touch]] of Object.entries(vp)) for (const t of ['2rad', '180']) for (const [base, tag] of [[NEW, 'new'], [OLD, 'e7de022']]) {
  const p = await page(base, v, touch); await toHall(p, TT[t]); const r = {}
  for (const h of HALLS) { await sel(p, h); const g = await geo(p); const clip = await p.evaluate(() => [...document.querySelectorAll('.hall-board button, .hall-board select, .hall-board p, .hall-canvas')].filter((e) => e.checkVisibility()).filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.left < -1 || b.right > innerWidth + 1) }).length); r[h] = { ...g, clip } }
  if (tag === 'new' && t === '180') await p.screenshot({ path: `${SS}02_${k}_180.png` })
  other[`${k}-${t}-${tag}`] = r; await p.context().close()
}
// Golvklart
for (const [base, tag] of [[NEW, 'new'], [OLD, 'e7de022']]) { const p = await page(base); await toHall(p, TT['180']); const r = {}
  for (const h of HALLS) { await sel(p, h); await p.locator('.hall-header-actions').getByRole('button', { name: /Golvklart/ }).click(); await p.waitForTimeout(450); const g = await geo(p); r[h] = { top: g.top, bottom: g.bottom, header: await p.evaluate(() => Math.round(document.querySelector('.hall-header').getBoundingClientRect().bottom)) }; if (tag === 'new' && h === 'forening-vit') await p.screenshot({ path: `${SS}04_golvklart_180.png` }); await p.locator('.hall-floor-actions .btn-secondary').first().click().catch(() => {}); await p.waitForTimeout(300) }
  other[`golv-${tag}`] = r; await p.context().close() }
writeFileSync(`${OUT}/other.json`, JSON.stringify(other, null, 1))
const same = (a, b) => HALLS.every((h) => a[h].top === b[h].top && a[h].bottom === b[h].bottom)
check('V-320-2rad', '320 px, 2-line title: identical to e7de022, no h-scroll/clip', same(other['320-2rad-new'], other['320-2rad-e7de022']) && HALLS.every((h) => other['320-2rad-new'][h].sw <= 320 && !other['320-2rad-new'][h].clip))
check('V-320-180', '320 px, 180-char title: title clamped to 2 lines, hall higher than e7de022, ≤ 739, no h-scroll/clip', HALLS.every((h) => { const a = other['320-180-new'][h], b = other['320-180-e7de022'][h]; return a.titleLines <= 2 && a.top < b.top && a.bottom <= FOLD && a.sw <= 320 && !a.clip }), HALLS.map((h) => `${h} ${other['320-180-new'][h].bottom} (was ${other['320-180-e7de022'][h].bottom})`).join('; '))
for (const k of ['land', 'desk']) for (const t of ['2rad', '180']) check(`V-${k}-${t}`, `${k}, ${t} title: identical to e7de022 (clamp is portrait-phone only), no h-scroll/clip`, same(other[`${k}-${t}-new`], other[`${k}-${t}-e7de022`]) && HALLS.every((h) => other[`${k}-${t}-new`][h].sw <= other[`${k}-${t}-new`][h].vw && !other[`${k}-${t}-new`][h].clip), HALLS.map((h) => `${h} ${other[`${k}-${t}-new`][h].top}–${other[`${k}-${t}-new`][h].bottom} / ${other[`${k}-${t}-e7de022`][h].top}–${other[`${k}-${t}-e7de022`][h].bottom}`).join('; '))
check('GOLV', 'Golvklart with the 180-char title: identical to e7de022 (floor header has no clamp rule)', HALLS.every((h) => JSON.stringify(other['golv-new'][h]) === JSON.stringify(other['golv-e7de022'][h])), JSON.stringify(other['golv-new']['forening-vit']) + ' / ' + JSON.stringify(other['golv-e7de022']['forening-vit']))
check('no-errors', 'No page errors', errors.length === 0, errors.join(' | '))
writeFileSync(`${ROOT}/verifier/slice-43-reverify-results.json`, JSON.stringify({ when: new Date().toISOString(), commit: '627154d', against: 'e7de022', results, rows, other }, null, 1))
console.log(`PASS ${results.filter((r) => r.ok).length} / FAIL ${results.filter((r) => !r.ok).length}`)
await browser.close()

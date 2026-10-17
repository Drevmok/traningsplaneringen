// Slice 44 re-verify F2 @ 9fc5fd9 vs main 0d88da5: after «Skriv ut passet» in Golvklart, does a later browser print
// (tap/keydown then print media, or Ctrl+P) print the hall? And does «Skriv ut passet» still print the pass, repeatedly?
const { chromium } = await import('/workspace/s44v/pw/node_modules/playwright-core/index.mjs')
import { execFileSync } from 'node:child_process'
const BR = process.env.BR ?? 'http://127.0.0.1:57751/traningsplaneringen/', MAIN = process.env.MAIN ?? 'http://127.0.0.1:57752/traningsplaneringen/'
const D = new URL('./', import.meta.url).pathname, SS = `${D}screens/s44r_`, PDF = `${D}pdf/`
execFileSync('mkdir', ['-p', PDF])
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
const errors = []
async function page(mode) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.addInitScript((m) => { window.__prints = 0; window.print = () => { window.__prints++; if (m === 'dead') return; window.dispatchEvent(new Event('beforeprint')); if (m === 'chromium') { window.dispatchEvent(new Event('afterprint')); return } setTimeout(() => window.dispatchEvent(new Event('afterprint')), 0) } }, mode)
  const p = await ctx.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', (e) => errors.push(e.message)); return p
}
async function mall(p, base) {
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.locator('.home').waitFor()
  await p.getByRole('button', { name: /^(Starta f|F)rån mall$/ }).click(); await p.locator('.builder').waitFor(); await p.waitForTimeout(300)
  await p.locator('.template-card').filter({ hasText: /Nybörjare/ }).first().click(); await p.waitForTimeout(400)
  const c = p.locator('.modal-backdrop[role=dialog]').getByRole('button', { name: 'Använd mall', exact: true }); if (await c.count()) await c.click()
  await p.waitForTimeout(1500)
}
async function openHall(p) { const b = p.locator('.builder-actions .builder-hall'); if (await b.isVisible().catch(() => false)) await b.click(); else { await p.getByRole('button', { name: 'Fler saker med passet' }).click(); await p.locator('.more-menu-panel').getByRole('button', { name: 'Hallöversikt', exact: true }).click() } await p.locator('.hall-canvas').first().waitFor(); await p.waitForTimeout(400) }
const golv = async (p) => { await p.getByRole('button', { name: 'Golvklart', exact: true }).click(); await p.waitForTimeout(500) }
// print-media snapshot + PDF text; kind = 'pass' when the pass print shows, 'hall' when the app (hall) prints
async function printed(p, tag) {
  await p.evaluate(() => window.dispatchEvent(new Event('beforeprint'))); await p.waitForTimeout(150)
  await p.emulateMedia({ media: 'print' })
  const v = await p.evaluate(() => ({ cls: document.body.className, root: getComputedStyle(document.querySelector('#root')).display, host: [...document.querySelectorAll('.print-host')].some((h) => getComputedStyle(h).display !== 'none'), hosts: document.querySelectorAll('.print-host').length, floor: !!document.querySelector('.hall-header--floor') }))
  const path = `${PDF}${tag}.pdf`; await p.pdf({ path, format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' })
  await p.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  const txt = execFileSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8' }).replace(/\s+/g, ' ')
  v.pages = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [path], { encoding: 'utf8' }))[1])
  v.pdfPass = /Uppvärmning · 10 min/.test(txt) && /Teknik · \d+ min/.test(txt); v.pdfHead = txt.slice(0, 90)
  v.kind = v.host && v.root === 'none' ? 'pass' : (!v.host && v.root !== 'none' ? 'hall' : 'mixed'); return v
}
const passBtn = (p) => p.locator('.hall-floor-actions').getByRole('button', { name: 'Skriv ut passet' })
const tapEmpty = async (p) => { const pt = await p.evaluate(() => { for (let y = 120; y < 800; y += 17) for (let x = 20; x < 370; x += 23) { const e = document.elementFromPoint(x, y); if (e && !e.closest('button,a,input,select,textarea,[role=button],.hall-chip,[tabindex]')) return { x, y, tag: e.tagName + '.' + e.className } } return null }); await p.touchscreen.tap(pt.x, pt.y); await p.waitForTimeout(400); return pt }
const R = { br: {}, main: {} }
for (const [tag, base] of [['br', BR], ['main', MAIN]]) {
  const o = R[tag]
  for (const mode of ['webkit', 'chromium']) {
    const p = await page(mode); await mall(p, base); await openHall(p); await golv(p)
    o[`${mode}_before`] = await printed(p, `${tag}-${mode}-0-before`)
    console.error(tag, mode, 'btns', JSON.stringify(await p.locator('.hall-floor-actions button').allInnerTexts()), await p.locator('.hall-header--floor').count())
    await passBtn(p).click(); await p.waitForTimeout(700)
    o[`${mode}_1_passbtn_noTouch`] = await printed(p, `${tag}-${mode}-1-passbtn`)
    if (tag === 'br' && mode === 'webkit') await p.screenshot({ path: `${SS}f2_a_golvklart_after_pass_print.png` })
    await tapEmpty(p); console.error('afterTap', JSON.stringify(await p.evaluate(() => ({ cls: document.body.className, floor: !!document.querySelector('.hall-header--floor'), hosts: document.querySelectorAll('.print-host').length, dlg: document.querySelectorAll('[role=dialog]').length, txt: document.querySelector('.hall-floor-actions')?.innerText, rootDisp: getComputedStyle(document.querySelector('#root')).display }))))
    o[`${mode}_2_afterTap_ctrlP`] = await printed(p, `${tag}-${mode}-2-after-tap`)
    // repeat: pass print again, then keyboard Ctrl+P path
    await passBtn(p).click(); await p.waitForTimeout(700)
    o[`${mode}_3_passbtn_again`] = await printed(p, `${tag}-${mode}-3-passbtn-again`)
    await p.keyboard.press('Control+p'); await p.waitForTimeout(400)
    o[`${mode}_4_afterCtrlP_key`] = await printed(p, `${tag}-${mode}-4-after-ctrlp`)
    // third pass print, then Avsluta golvklart → Hallöversikt (edit) → browser print
    await passBtn(p).click(); await p.waitForTimeout(700)
    o[`${mode}_5_passbtn_third`] = await printed(p, `${tag}-${mode}-5-passbtn-third`)
    await p.locator('.hall-floor-actions button').first().click(); await p.waitForTimeout(500)
    o[`${mode}_6_hallEdit_print`] = await printed(p, `${tag}-${mode}-6-hall-edit`)
    if (tag === 'br' && mode === 'webkit') { await p.emulateMedia({ media: 'print' }); await p.screenshot({ path: `${SS}f2_b_hall_print_media_after_tap.png`, fullPage: true }); await p.emulateMedia({ media: 'screen' }) }
    o[`${mode}_prints`] = await p.evaluate(() => window.__prints)
    await p.context().close()
  }
  // dead stub (iOS PWA stall): print never happens → the line; what does a later browser print show after a tap?
  const p = await page('dead'); await mall(p, base); await openHall(p); await golv(p)
  await passBtn(p).click(); await p.waitForTimeout(1900)
  o.dead_stall_line = await p.locator('.print-stall, [class*=stall]').count()
  await tapEmpty(p); o.dead_afterTap = await printed(p, `${tag}-dead-after-tap`)
  await p.context().close()
}
R.errors = errors
console.log(JSON.stringify(R, null, 1))
await browser.close()

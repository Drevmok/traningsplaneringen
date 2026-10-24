// Slice 51 (C1): shared admin login for the stand-in smokes — 6-digit e-mail code (Slice 33), not the old magic link.
// The code is read from the mail the local SMTP sink writes to $S32_DIR/mail and is never printed.
//   import { codeLogin, requestCode, sliceNumber } from './tools/smoke-login.mjs'
import { readdirSync, readFileSync, statSync } from 'node:fs'

const LOGIN = 'Logga in som admin'
const SEND = 'Skicka kod'
const VERIFY = 'Logga in'

/** SLICE_NUMBER read as a file from app/src/data/blockMeta.ts (so footer checks follow the app, not a slice). */
export function sliceNumber(root) {
  const m = readFileSync(`${root}/app/src/data/blockMeta.ts`, 'utf8').match(/export const SLICE_NUMBER = '([^']+)'/)
  if (!m) throw new Error('SLICE_NUMBER not found in blockMeta.ts')
  return m[1]
}

export function mails(dir, to) {
  return readdirSync(`${dir}/mail`)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ f, t: statSync(`${dir}/mail/${f}`).mtimeMs, m: JSON.parse(readFileSync(`${dir}/mail/${f}`, 'utf8')) }))
    .filter((x) => JSON.stringify(x.m.to).includes(to))
    .sort((a, b) => a.t - b.t)
}
const codeOf = (m) => (String(m.subject ?? '').match(/\b(\d{6})\b/) ?? (String(m.text ?? m.body ?? '').match(/\b(\d{6})\b/)) ?? [])[1]

async function waitCode(dir, to, after, timeoutMs = 15000) {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    const m = mails(dir, to).filter((x) => x.t > after)
    if (m.length && codeOf(m.at(-1).m)) return codeOf(m.at(-1).m)
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`no code mail for ${to}`)
}

export const loginDialog = (page) => page.getByRole('dialog', { name: LOGIN })

/** Footer «Logga in som admin» → e-mail → «Skicka kod»; returns the dialog once the code step shows. */
export async function requestCode(page, email) {
  await page.locator('footer .footer-admin-login').click()
  const dlg = loginDialog(page)
  await dlg.waitFor()
  await dlg.locator('input[type=email]').fill(email)
  await dlg.getByRole('button', { name: SEND, exact: true }).click()
  await dlg.locator('input.admin-code-input').waitFor()
  return dlg
}

/** Full code login. dir = stand-in dir ($S32_DIR). Resolves when the code has been submitted. */
export async function codeLogin(page, email, dir) {
  const t0 = Date.now() - 50
  const dlg = await requestCode(page, email)
  const code = await waitCode(dir, email, t0)
  await dlg.locator('input.admin-code-input').fill(code)
  await dlg.getByRole('button', { name: VERIFY, exact: true }).click()
  return dlg
}

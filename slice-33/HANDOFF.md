# Slice 33 — handoff + Builder notes

**Status:** DRAFT 2026-10-03, awaiting Planner/Builder. Branch `slice-33-docs` (pack only, no app code), cut from `main` @ `44e2102` (Slice 32 merge). Nothing merges to `main` without Christoffer.

## Execution order

1. **Planner** reads the pack, settles the open items below (first: the template lock), and marks it accepted.
2. **Christoffer**: step 12 in [`content/setup-christoffer.md`](./content/setup-christoffer.md). Builder can start in parallel against a local stand-in.
3. **Builder**: the notes below; `app/SLICE33-SHIPPED.md`; footer 33. PR from a feature branch, not merged.
4. **Planner** pings **Verifier** → [`verification-checklist.md`](./verification-checklist.md) AC 1–26.
5. **After PASS:** merge on Christoffer's word.

## The flow

```
Step 1                                                [×]
Logga in som admin
Skriv din e-post så skickar vi en kod.
E-post  [                               ]
[Skicka kod]
(adminSendFailed)

Step 2                                                [×]
Logga in som admin
Om anna@exempel.se hör till en admin kommer en kod strax.
Skriv den här. Koden gäller i en timme.          (adminCodeSent · role=status)
Kod från mejlet  [ 6 siffror        ]
(adminCodeWrong / adminVerifyWait / adminVerifyFailed · role=alert)
[Logga in]
Skicka ny kod   Du kan be om en ny kod om en minut.   (disabled 60 s)
(adminWait / adminSendFailed after a resend)
Byt e-post
```

1. `Skicka kod` → `signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } })`. No `emailRedirectTo`.
   - No error, or any 4xx except 429 → step 2 with `adminCodeSent`.
   - 429 / `over_email_send_rate_limit` / `over_request_rate_limit` → step 2 with `adminWait` under `Skicka ny kod`.
   - Network error, timeout, 5xx, `navigator.onLine === false` → stay on step 1 with `adminSendFailed`.

   This is today's `classifySendError` unchanged, except that `wait` now moves to step 2.
2. Step 2 opens with focus in the code field. The 60 s resend cooldown starts.
3. `Logga in` (enabled at exactly 6 digits) → `verifyOtp({ email, token, type: 'email' })`.
   - Success → `settleState()` → `admin` or `notAdmin`. The sheet closes and focus goes to the footer `Logga ut`.
   - 429 / `over_request_rate_limit` → `adminVerifyWait`.
   - Network / 5xx / offline → `adminVerifyFailed`.
   - Anything else (403 `otp_expired` covers wrong **and** expired) → `adminCodeWrong`.
4. `Skicka ny kod` → the same send with the stored address. A good result shows `adminCodeResent` and clears the field. `Byt e-post` → step 1 with the address kept.

## `shouldCreateUser: false` fits the Slice 32 code

`app/src/lib/admin/session.ts` already sends `shouldCreateUser: false` (line 121), and sign-ups are off in the project (Slice 32 step 6). Keep it.

For an address that isn't a user, the server answers 422 `otp_disabled` ("Signups not allowed for otp"). `classifySendError` maps it to `sent`, so the admin sees the same `adminCodeSent` and nobody can probe who is admin. No change needed. Only remove `emailRedirectTo`.

## Exact files

| File | Change |
|---|---|
| `app/src/lib/admin/session.ts` | `sendLoginLink` → `sendLoginCode(email)`: drop `emailRedirectTo` and delete `loginRedirectUrl()`. New `verifyLoginCode(email, code): Promise<'ok' \| 'wrong' \| 'wait' \| 'failed'>` + pure `classifyVerifyError()`. On `ok`: `started = true`, `await settleState()`, `watchAuth()`, remove `${ADMIN_AUTH_KEY}-code-verifier`. `startAdmin()` keeps only the stored-session path: delete the `readAuthReturn` / `exchangeCodeForSession` branch and every `linkFailed` |
| `app/src/lib/admin/authReturn.ts` | Shrink to a pure cleaner, e.g. `cleanAuthLeftovers(href): string \| null`. Same params as today (`code`, `error`, `error_code`, `error_description` + an auth-error hash). It returns the cleaned path or null, never a code, and keeps every other param and the `#dela=` hash |
| `app/src/main.tsx` | Before `createRoot`: `const clean = cleanAuthLeftovers(location.href); if (clean) history.replaceState(history.state, '', clean)`. Eager and tiny; it must not import supabase-js. `shouldStartAdmin()` call unchanged |
| `app/src/lib/admin/state.ts` | Remove `linkFailed` from `AdminSnapshot` and delete `acknowledgeLinkFailed`. `shouldStartAdmin()` = `bankEnabled() && hasStoredSession()`: a URL never starts admin any more. Update the header comment |
| `app/src/lib/admin/client.ts` | Keep `flowType: 'pkce'`, `detectSessionInUrl: false`, `persistSession: true`, `storageKey`. `verifyOtp` with email + token is a POST that returns the session in the response body whatever the flow type (supabase/auth `verifyPost`). With PKCE, `signInWithOtp` still writes a `-code-verifier` key; it is harmless and is removed on success and on Logga ut. Update the comment (no more `?code=`) |
| `app/src/components/AdminLoginSheet.tsx` | Two steps per the wireframe. Drop the `linkFailed` prop. Add an `onLoggedIn` callback for the focus move. See "Code field" and "Pending login" below |
| `app/src/App.tsx` | `showLogin = loginOpen`; drop `acknowledgeLinkFailed`; after `onLoggedIn`, close the sheet and focus the footer `Logga ut` |
| `app/src/data/blockMeta.ts` | Keys per `content/microcopy.sv.md`: add `adminSendCode`, `adminCodeSent` (`{email}`), `adminCodeLabel`, `adminCodePlaceholder`, `adminVerify`, `adminCodeWrong`, `adminVerifyWait`, `adminVerifyFailed`, `adminResend`, `adminResendSoon`, `adminCodeResent`, `adminChangeEmail`. Reword `adminLoginHint`, `adminWait`, `adminSendFailed`, `footerSliceLabel`. Delete `adminSendLink`, `adminLinkSent`, `adminLinkFailed` |
| `app/src/export.css` | Code input: font size ≥ 16px (stops iPhone focus zoom), some letter-spacing, width ≤ the sheet. Quiet text buttons for `Skicka ny kod` / `Byt e-post`. No horizontal scroll at 390 px |
| tests | `authReturn.test.ts` → cleaner tests (`#dela=` kept, never a code). `session.test.ts`: `signInWithOtp` options deep-equal `{ shouldCreateUser: false }`; `verifyOtp` args `{ email, token, type: 'email' }`; `classifyVerifyError` (403 → wrong, 429 / `over_request_rate_limit` → wait, retryable / 0 / 5xx → failed); `shouldStartAdmin('…?code=abc')` → false; ok → admin / notAdmin. New `normalizeCode` test (AC 9) |
| `app/SLICE33-SHIPPED.md` **(new)** | Ship notes, deviations, chunk size before/after |

Don't touch: the bank, admin mode, writes, `#dela=` code (`sharePass.ts`), the Slice 31 fetch, the database, RLS.

## Code field

- `<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" autoCapitalize="off" autoCorrect="off" spellCheck={false} name="code">` with a real `<label>`.
- **No `maxLength`.** It would cut a pasted `123 456` to `123 45`. Normalize instead on every change: `normalizeCode(raw) = raw.normalize('NFKC').replace(/\D/g, '').slice(0, 6)`. This covers typing, paste and autofill. Export it pure for the test.
- `CODE_LENGTH = 6`, one constant. The project's Email OTP Length must be 6 (setup 12a).
- `Logga in` is disabled unless `code.length === 6`, and while checking. Don't auto-submit at 6 digits: AC 7 tests the button.
- On `adminCodeWrong`: keep the digits, focus the field, select its text, set `aria-invalid="true"`. Clear `aria-invalid` on the next change.

## Pending login (survives an app reload)

On iPhone, the home-screen app is often reloaded by the OS while the admin is in the mail app. Without help, the admin comes back to Home and has to start over.

- After every send that reaches step 2, write `localStorage['gymnastics-planner-admin-pending-v1'] = { email, sentAt }`.
- When the sheet opens and the entry is younger than 60 minutes, open on step 2 with that address, and keep the resend cooldown from `sentAt`.
- Delete the entry on success, `Byt e-post`, `Logga ut`, or when it is older than 60 minutes. Don't delete it on × (an accidental close shouldn't lose the code step).
- The entry must **not** make `shouldStartAdmin()` true. It's read only by the lazy sheet. Coaches never have it.
- Don't auto-open the sheet on load. The admin taps `Logga in som admin` once (AC 6).

## Old links and `#dela=`

- After Christoffer's step 12, no new mail contains a link. A link from an older mail (valid ≤ 1 h) may still be tapped. It lands on `…/?code=…` or `…/?error_code=…`. The eager cleaner removes those params, the app opens logged out, and nothing loads. No message: `adminLinkFailed` is retired.
- Keep `detectSessionInUrl: false`, so supabase-js never reads the URL. The app never uses implicit flow: tokens never come in `#…`, which is where `#dela=` lives.
- Supabase's Site URL and Redirect URLs (Slice 32 step 7) stay as they are. The app no longer uses them, and they do no harm.

## Local testing

The real project's mail goes only to Supabase team members (built-in sender) and is limited per hour. For the bulk of testing, use the Slice 32 stand-in (GoTrue + mail catcher):

- Set `GOTRUE_MAILER_TEMPLATES_MAGIC_LINK` to a file with the template from setup 12c, or read the code from the mail catcher.
- `GOTRUE_MAILER_OTP_LENGTH=6`.
- `GOTRUE_MAILER_OTP_EXP=60` for the expired-code case.

Test users must be confirmed. An unconfirmed user gets the "Confirm sign up" mail (a link) instead of the code.

## Open items for Planner / Builder

1. **Template lock (blocker for the real project).** Supabase stopped template editing on **free** projects created on or after **3 June 2026** that use the built-in mail sender (changelog 2026-06-03; Studio cutoff `2026-06-03T00:00:00Z`). The default "Magic link or OTP" mail has only a link, no `{{ .Token }}`. Christoffer's project was created for Slice 31 (October 2026), so step 12b will most likely show **Set up custom SMTP to edit templates**. The setup note tells him to stop and say "Mallen är låst". Options for Planner:
   - Custom SMTP: the Slice 31 setup already names Resend and Brevo. It also lifts the team-only and 2-per-hour limits. It is a new setup step with a sender account, so this pack doesn't include it.
   - Pro plan (about 25 USD/month).
   - Send Email hook: developer work, out of scope.

   Builder can finish and self-smoke on the stand-in either way.
2. **OTP length.** Supabase's default is 6 (valid 6–10), but some projects show 8. Setup 12a asks Christoffer to set 6 or report the number. The app hard-codes 6.
3. **Expiry.** "Koden gäller i en timme" in the app and the mail assumes Email OTP Expiration = 3600 s (Supabase default, confirmed in the docs). The same setting also governs other mail links. Setup 12a asks him not to change it.
4. **Template name.** The dashboard calls it **Magic link or OTP** (Authentication → Emails → Templates). Older screenshots say **Magic Link**. The setup note mentions both.
5. **Pending login entry** stores the typed e-mail in localStorage for up to 60 minutes on the admin's device. It's small and admin-only, but Planner may drop AC 6 if they'd rather not.
6. **Code in the subject line.** The subject shows the code, so it can be read from the lock-screen notification. That speeds up the home-screen flow. If Planner prefers, use `Din kod till Träningsplaneraren` and keep the code only in the body.
7. **iPhone keyboard on focus.** iOS may not raise the keyboard on a programmatic focus that follows a network call. AC 11 checks `document.activeElement`. One tap on the field is acceptable if iOS doesn't raise it.

## Not this slice

Custom SMTP setup · passwords · coach accounts · new admin features · changing the session length · auto-submit · showing which addresses are admins.

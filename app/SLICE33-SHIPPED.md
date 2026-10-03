# Slice 33 — Admin login with a 6-digit e-mail code — SHIPPED (local branch, not pushed)

**Date:** 2026-10-03 (Europe/Stockholm)
**Branch:** `slice-33-code`, created from `origin/slice-33-docs` @ `95da2e1` (cut from main `44e2102`, Slice 32 merged as PR #34). Local only, upstream removed: no push, no PR.
**Builder self-smoke:** `verifier/slice-33-builder-smoke.md`: **PASS 146 / FAIL 0** at 390×844, against a local stand-in (real GoTrue with the 12c mail template, PostgREST, PG17). The real Supabase project was not touched.
**Screenshots:** `/workspace/screenshots/slice33_*.png` (35)
**Copy authority:** `slice-33/content/microcopy.sv.md`. Every Slice 33 string is used verbatim (the smoke checks all 19 keys against the md).

## ⚠ Live login depends on Christoffer's step 12

The app code no longer understands links. On the real project, admin login works **only after** the "Magic link or OTP" mail template contains `{{ .Token }}` (setup-christoffer.md step 12c). Until then, the live mail is Supabase's default link mail. The link only opens the app logged out with a clean address, and there is no code to type. **Do not merge or deploy before step 12 is done** (or accept that admin login is down until it is). Coaches are unaffected either way.

What Christoffer needs on the live project:
1. **Email OTP Length = 6** (Authentication → Sign In / Providers → Email). **Email OTP Expiration = 3600** (the app and the mail say «en timme»).
2. **Template "Magic link or OTP"**: the subject and body from 12c, containing `{{ .Token }}` and no `{{ .ConfirmationURL }}`.
3. **Probably custom SMTP first.** Free projects created after 3 June 2026 can't edit templates without custom SMTP (12b "Mallen är låst"). The options are a custom SMTP provider (e.g. Resend or Brevo free tier: domain or sender verification, then SMTP host/user/pass in Authentication → SMTP Settings) or the Pro plan. Supabase's built-in sender also only mails members of the Supabase team and has a low hourly cap; with custom SMTP the cap is set under Authentication → Rate Limits. The 60 s per-address limit still applies, which matches the app's 60 s resend cooldown.
4. Unchanged: sign-ups off, his user and the `admins` row, Site URL / Redirect URLs (now unused by login, harmless), the non-admin test user. Both users must be **confirmed**, or Supabase sends a "Confirm sign up" link mail instead of the code.
5. After step 12, a Verifier pass on the real project and devices: AC 1, 3, 4, 5, 10, 12–14, 16, 22, 23 (iPhone keyboard) and an old real link (AC 18).

## What shipped

1. **Two-step login sheet** (footer link only, as before).
   - Step 1: e-mail → `Skicka kod` = `signInWithOtp({ email, options: { shouldCreateUser: false } })`, with no `emailRedirectTo`.
   - Step 2: `adminCodeSent` with the typed address, the code field, `Logga in` = `verifyOtp({ email, token, type: 'email' })`, then `Skicka ny kod` (60 s cooldown, `adminResendSoon`, no countdown) and `Byt e-post`.
2. **Code field.** `type=text`, `inputmode=numeric`, `autocomplete=one-time-code`, `pattern=[0-9]{6}`, no `maxlength`, 20px. `normalizeCode` (NFKC → digits only → max 6) handles typing, paste (`123 456`, `123-456`, padded, full-width digits) and autofill. `Logga in` is enabled at exactly 6 digits.
3. **Errors.**
   - Send: rate limit → step 2 anyway, with `adminWait` under `Skicka ny kod`. Unreachable → `adminSendFailed`. Any other answer counts as sent (no account guessing).
   - Verify: 403 or other 4xx → `adminCodeWrong` (digits kept, focus, selected, `aria-invalid`). 429 → `adminVerifyWait`. Unreachable / 5xx / offline → `adminVerifyFailed`.
4. **Focus.** Step 2 → code field. Wrong code → field selected. Byt e-post → e-mail field selected. Success → the sheet closes and focus goes to the footer «Logga ut».
5. **Pending login (AC 6).** `gymnastics-planner-admin-pending-v1` = `{ email, sentAt }` (never the code). The sheet reopens on step 2 for up to 60 min after a send, so an iPhone home-screen app reload while reading Mail is harmless. The entry is cleared by success, Byt e-post, Logga ut or age. It never starts admin and never loads anything on boot.
6. **Old link path removed.** `exchangeCodeForSession`, `loginRedirectUrl`, `linkFailed` / `acknowledgeLinkFailed` and the `adminSendLink` / `adminLinkSent` / `adminLinkFailed` strings are gone. `authReturn.ts` is now only `cleanAuthLeftovers(href)`. `main.tsx` runs it eagerly (tiny, no supabase import) before the first render and `replaceState`s away `code`, `error`, `error_code`, `error_description` and an auth-error hash, keeping `#dela=` and other params. Nothing is read from the URL: `detectSessionInUrl: false`.
7. **Admin boot.** `shouldStartAdmin()` = bank configured **and** a stored session. A coach visit, an old `?code=` URL and a share link load no supabase-js or admin chunk and send no auth request.
8. **Logout** removes the session, the `-code-verifier` key (signInWithOtp still writes it under PKCE; it is also removed on successful verify) and the pending entry.
9. **Footer** «Träningsplaneraren · Slice 33».
10. **Slice 32 unchanged:** «inte admin» footer, `adminSendFailed` path, admin mode, Godkänn / Ändra / Dölj / Visa igen / Markera som granskad, conflict refetch, offline lines (48 regression checks after a code login).

## Changed files

| File | Change |
|---|---|
| `app/src/components/AdminLoginSheet.tsx` | rewritten: two steps, cooldown, pending login, focus, aria; props `onClose`, `onLoggedIn` |
| `app/src/lib/admin/session.ts` | `sendLoginCode`, `verifyLoginCode`, `classifySendError`, `classifyVerifyError`; `startAdmin` = stored session only; logout also clears pending |
| `app/src/lib/admin/loginCode.ts` (new) | `normalizeCode`, pending login read/write/clear, constants (6 digits, 60 s, 60 min) |
| `app/src/lib/admin/authReturn.ts` | only `cleanAuthLeftovers(href)` |
| `app/src/lib/admin/state.ts` | `linkFailed` removed; `shouldStartAdmin()` takes no URL |
| `app/src/lib/admin/client.ts` | comments only (PKCE kept; URL never read) |
| `app/src/main.tsx` | eager URL clean before render |
| `app/src/App.tsx` | `showLogin = loginOpen`; `onLoggedIn` → close + focus footer «Logga ut» |
| `app/src/data/blockMeta.ts` | footer → Slice 33; 12 new keys, 3 reworded, 3 retired |
| `app/src/export.css` | code input (20px, letter-spacing, ≤ sheet width), inputs ≥ 16px, quiet resend / Byt e-post buttons (dimmed when disabled), sheet scrolls inside; link-era rules removed |
| `app/src/lib/admin/session.test.ts`, `authReturn.test.ts`, `loginCode.test.ts` (new) | rewritten / new unit tests |
| `verifier/slice-32-local/setup.sh` | optional `S32_MAGIC_LINK_TEMPLATE` (+ subject), `S32_OTP_LENGTH`, `S32_OTP_EXP` |
| `verifier/slice-32-local/gateway.mjs` | serves `GET /__templates/<name>.html` from `<dir>/templates` (GoTrue fetches templates by URL) |
| `verifier/slice-32-local/smtp-catcher.py` | also stores the mail `body` |
| `verifier/slice-32-local/README.md` | the new env vars |
| `verifier/slice-33-local/` (new) | `env.sh` (dir `/tmp/s33`, ports 54640–54645, preview 4196), `up.sh`, `down.sh`, `magic-link.html` (12c body), README |
| `verifier/slice-33-builder-smoke.mjs` / `.md`, `slice-33-smoke-results.json` (new) | smoke + report |
| `app/SLICE33-SHIPPED.md` (new) | this file |

## Tests and build

- `bun test src` (app/): **130 pass, 0 fail** (18 files; was 115 on main). New/rewritten tests:
  - `classifyVerifyError` / `classifySendError`
  - the `signInWithOtp` options deep-equal `{ shouldCreateUser: false }`, and the `verifyOtp` args
  - verify ok → admin / notAdmin with the verifier and pending keys removed; wrong / 429 / 5xx / no session
  - `shouldStartAdmin` false for `?code=`, `?error_code=` and pending-only
  - logout clears all three keys
  - `normalizeCode` set; pending read/expiry
  - `cleanAuthLeftovers` cases
- `bun test tools/bank` (repo root): **21 pass, 5 skip, 0 fail** (the 5 live-stand-in tests are skipped without `S32_GATEWAY`; bank tooling is unchanged in this slice).
- `npm run build`: green. `oxlint` on the changed files: 0 warnings.

## Bundle (gzip, vs main 44e2102)

| Chunk | main | Slice 33 | Δ |
|---|---|---|---|
| initial `index-*.js` (plain / bank build) | 135.36 / 135.46 kB | 135.44 / 135.54 kB | **+0.08** |
| `index-*.css` | 13.96 kB | 14.14 kB | +0.18 |
| lazy `AdminLoginSheet` | 0.74 kB | 1.65 kB | +0.91 |
| lazy `session` | 0.93 kB | 1.12 kB | +0.19 |
| lazy `dist` (supabase-js) | 55.01 kB | 55.01 kB | 0 |

## Deviations

- **PKCE kept** (`flowType: 'pkce'`). `signInWithOtp` therefore still sends a `code_challenge` and writes the `-code-verifier` key. Verified against real GoTrue: `verifyOtp` type `email` returns a session in the body regardless. The key is removed on success and on logout. Switching to implicit wasn't needed and would change the stored-session shape.
- **Expired code (AC 13)** was tested by setting the stand-in user's `recovery_sent_at` 2 h back (with a control showing the same code works at a fresh time), plus the replaced-code path. The stand-in expiry stays at 3600 s.
- **Verify-side 429** is a Playwright route mock. The send-side 429 is real GoTrue.
- **Stand-in tooling** changes live in `verifier/slice-32-local` (opt-in env vars; default behaviour unchanged for Verifier's Slice 32 runs).
- **Muted resend style:** the disabled `Skicka ny kod` is dimmed (Docs only asked for a quiet text button). Without it the disabled button looked enabled.

## Gaps

- Real-device ACs (4, 5, 10, keyboard parts of 23) and every live-mail AC wait for step 12 + Verifier.
- `verifier/slice-32-builder-smoke.mjs` drives the retired link login and no longer runs against this code. Its admin blocks run inside the Slice 33 smoke after a code login.
- No "check spam" line, as the pack says. Add one only if live testing shows the mail lands in spam.

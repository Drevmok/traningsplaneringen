# Slice 33 — Builder self-smoke (admin login with a 6-digit e-mail code)

**Date:** 2026-10-03, last run finished 15:26 (Europe/Stockholm) · **Viewport:** 390×844 (DPR 2, touch) · **Result: PASS 146 / FAIL 0**
**Script:** `verifier/slice-33-builder-smoke.mjs` · raw results `verifier/slice-33-smoke-results.json` · screenshots `/workspace/screenshots/slice33_*.png` (35)
**Branch:** `slice-33-code` (local only). **The real Supabase project was not touched.**

## Stand-ins

The Slice 32 stand-in (`verifier/slice-32-local`) in its own dir and ports, via `verifier/slice-33-local/` (`up.sh` / `down.sh`):

| Piece | What ran |
|---|---|
| Postgres 17 | `127.0.0.1:54641`: roles, `schema-31.sql`, seed, `schema-32.sql` |
| PostgREST | `:54642`, real RLS and grants |
| **GoTrue (real auth server)** | `:54643`. Sign-ups off. **Login mail = setup 12c**: subject `Din kod till Träningsplaneraren: {{ .Token }}`, body `verifier/slice-33-local/magic-link.html` (served to GoTrue by the gateway at `/__templates/magic_link.html`). OTP length 6, expiry 3600 s, 60 s per-address mail limit |
| SMTP sink | `:54645` → `/tmp/s33/mail/*.json` (to, subject, links, body) |
| Gateway | `:54640`, Supabase-like key handling (as in Slice 32) |
| App | plain build on `:4195`; bank build (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32`) on `:4196` |

The browser forwards `https://bank-mock.supabase.co/**` to the gateway unchanged. Auth is **not mocked**: real `signInWithOtp` and real `verifyOtp` against real GoTrue. There are two exceptions. The verify-side 429 (AC 14) is a Playwright route mock, because GoTrue's verify limit is per IP over 5 min. Offline uses `context.setOffline`. The smoke adds two more confirmed admins (`admin2@`, `admin3@test.local`, through the auth admin API) so the flows don't wait on each other's 60 s mail limit.

Codes are read from the caught mail. No code is written to the console, the results file or a screenshot: step-2 screenshots mask the code field, and the only digits shown are test pastes such as `1234`.

Run it again: `bash verifier/slice-33-local/up.sh`, build and start both previews, then `node verifier/slice-33-builder-smoke.mjs`, then `bash verifier/slice-33-local/down.sh`. Use a fresh `up.sh` per run, because the Slice 32 regression part edits seeded rows.

## AC 1–26

Status values:
- **pass**: holds for the shipped code whatever the project.
- **local only**: passed against the stand-in; re-check on the real project or device after step 12.
- **real project only**: can't be tested here.

| AC | Status | Evidence |
|---|---|---|
| 1 | local only (live mail = **real project only**) | AC1a–c: subject `Din kod till Träningsplaneraren: ######`; body = 12c text with exactly one 6-digit code, the same as in the subject; no `<a`, `href`, `/auth/v1/verify` or URL, and the catcher found 0 links. Live mail depends on Christoffer's step 12 (template + SMTP), see SLICE33-SHIPPED.md |
| 2 | pass | AC2a/2b: exactly one `POST /auth/v1/otp`, body `create_user:false`, no `redirect_to` in the body or URL. PKCE `code_challenge` is still sent (flowType pkce; harmless, verifier key removed on success/logout). AC2c: `POST /auth/v1/verify` body `{email, token, type:"email"}`. Unit tests: `signInWithOtp` args deep-equal `{ email, options: { shouldCreateUser: false } }`; `verifyOtp` args `{ email, token, type: 'email' }` |
| 3 | local only | AC3a–c: `okand@test.local` → step 2 with the same `adminCodeSent` (address filled in); no user row created; no mail. Real project: check Authentication → Users |
| 4 | local only (installed app = **real project only**) | Desktop Chrome: AC16d/4-local: the new code logs in → footer `Träningsplaneraren · Slice 33 · Admin · Logga ut`, `Admin` chip in Biblioteket, and no new tab or page opened during the login (AC4c). iPhone/Android home-screen app: real device |
| 5 | local only (app close + > 1 h = **real project only**) | AC5-local: reload keeps `Admin · Logga ut`. Swipe-close and auto-renew after an hour: real device |
| 6 | pass | AC6a: pending `{email, sentAt}` stored (no code). AC6b: a reload doesn't start admin or open the sheet. AC6c: `Logga in som admin` after the reload → step 2, same address, focus in the code field, resend still cooling down. AC6d/e: Byt e-post clears it → step 1. AC6f: entry older than 60 min → step 1 and the entry is removed. AC24a/b: cleared on success. AC6g: step 1 after Logga ut. Unit tests: read/expiry/broken entry |
| 7 | pass | AC7a: Logga in disabled at 5 digits, enabled at 6; a 7th digit is not added. AC7b: `a1b-2 c3!x` → `123`. AC7c: disabled at 0 |
| 8 | pass | AC8a: `type=text`, `inputmode=numeric`, `autocomplete=one-time-code`, `pattern=[0-9]{6}`, no `maxlength`. AC8b: accessible name `Kod från mejlet`, placeholder `6 siffror`. AC8c: font size 20px (e-mail field 16px) |
| 9 | pass | AC9a: real clipboard paste (Ctrl+V) of `123456`, `123 456`, ` 123456 `, `123-456` → `123456`, button enabled. AC9b: `12 34` → `1234`, button disabled. AC9c: full-width `１２３４５６` → `123456`. Unit tests cover the same set plus 7 digits and text around the code |
| 10 | **real project only** (real iPhone) | Proxy only: AC10-local, one input event with 6 digits (as autofill sends) fills the field and enables Logga in. The field has `autocomplete=one-time-code`; whether iOS offers the code is up to the OS |
| 11 | pass | AC11a: step 2 opens with focus in the code field, also after a rate limit (AC14b). AC11b: after `adminCodeWrong`, focus is in the field with all 6 digits selected. AC17a: after Byt e-post, focus is in the e-mail field with the text selected (typing replaces it). AC11c/d: after success, focus is on the footer «Logga ut» |
| 12 | local only | AC12a–d: one changed digit → `adminCodeWrong` (`role=alert`), `aria-invalid="true"`, digits kept, sheet open, still logged out, `aria-describedby` = status + error. The next edit clears `aria-invalid`. Fixed code → logged in, line gone |
| 13 | local only | AC13a: code older than the expiry (`recovery_sent_at` set 2 h back in the stand-in DB) → `adminCodeWrong`. AC13b control: the same code with a fresh send time logs in. AC13c: replaced code (the first code, used after Skicka ny kod) → `adminCodeWrong` |
| 14 | local only | AC14a: Skicka kod → Byt e-post → Skicka kod within 60 s → real GoTrue 429 → step 2 with `adminCodeSent` plus `adminWait` under Skicka ny kod. AC14b: resend disabled, focus in the code field. AC14c: verify 429 (mocked) → `adminVerifyWait`. Unit tests: both classifiers map 429, `over_email_send_rate_limit` and `over_request_rate_limit` to wait |
| 15 | pass | AC15a: offline Skicka kod → `adminSendFailed`, step 1 kept with the address, no request. AC15b: back online, the same button → step 2. AC15c: offline Logga in → `adminVerifyFailed`, digits kept, no request. AC12d: back online → logged in without closing the sheet |
| 16 | local only | AC16a: disabled right after the send, `adminResendSoon` shown, `aria-describedby` points at it, no countdown digits. AC16b: enabled after 60 s and the line is gone. AC16c: resend → `POST /auth/v1/otp` with the same address (`create_user:false`), `adminCodeResent`, field cleared and focused, cooldown again. AC16d: the new code logs in |
| 17 | pass | AC17a: Byt e-post → step 1 with the address kept, focused and selected. AC17b: code and error lines cleared. AC17c: sending to another address shows that address in `adminCodeSent` |
| 18 | pass (a real old magic link = **real project only**) | AC18 old-code a–d / old-error a–d: fresh profile, `?code=abc` and `?error=…&error_code=otp_expired&error_description=x#error=…&sb=` → Home, address `…/traningsplaneringen/`, no sheet, no alert or toast, no page error, no supabase-js or admin chunk, no auth request, footer `Logga in som admin`. Unit tests in `authReturn.test.ts` |
| 19 | pass | AC19: `rg -n "exchangeCodeForSession\|emailRedirectTo\|loginRedirectUrl\|linkFailed\|adminLinkFailed\|adminLinkSent\|adminSendLink" app/src` → nothing |
| 20 | pass | AC20a: `?code=abc#dela=<token>` → shared pass opens, hash kept, `code` dropped; AC20b: no admin chunk or auth request. AC20c: `#dela=` opens while logged in as admin. `sharePass` tests green in `bun test src` |
| 21 | pass (installed app = real device) | AC21a–e: Home footer shows only `Logga in som admin`; builder footer `Träningsplaneraren · Slice 33 · Logga in som admin`; only `index-*.js` and `jsx-runtime-*.js` load; exactly the 2 Slice 31 GETs (publishable key, no Authorization), no auth request; no admin UI; no auth, verifier or pending key. Check N: every coach, old-URL and share request is such a GET |
| 22 | local only | AC22a–c: `nonadmin@test.local` logs in with a code → footer `Du är inloggad men inte admin. · Logga ut`, focus on Logga ut; no admin chrome in Biblioteket; Logga ut → `Logga in som admin`, session removed |
| 23 | pass at 390×844 (iPhone keyboard / zoom = **real project only**) | AC23a/b: both steps: heading, field and primary button in view; `scrollWidth` 390; inputs ≥ 16px (no iOS focus zoom). AC23c: 390×450 (keyboard-sized): field, Logga in, Skicka ny kod and Byt e-post reachable by scrolling inside the sheet, no horizontal scroll (`slice33_step2_short_viewport.png`) |
| 24 | pass | AC24c: Logga ut removes `gymnastics-planner-admin-auth-v1`, `…-code-verifier` and `gymnastics-planner-admin-pending-v1` (planted leftovers too); AC24d: reopen → `Logga in som admin`. Unit test `signOutAdmin` removes all three |
| 25 | local only | After a **code** login, the Slice 32 smoke path (copied blocks, ids `S32-…`), 48 checks, all pass: bot push / skip / refusals (AC41–43, C5, 40b); admin chips, pending list, Godkänn → coach sees it (AC29–30, 38a/b); Ändra i banken validation + save + `updated_by` (AC31–32); Markera som granskad (AC33); Dölj för alla / Visa igen with a mall drill (AC34); no delete (AC35, 23a); two-tab conflict + refetch + reopen-save (AC36); offline lines + nothing queued (AC37); cache has no pending row after logout (AC38c). `npm run build` green, `bun test src` 130 pass. Main chunk +0.08 kB gz (< 1 kB) |
| 26 | pass | AC26a/b: footer `Träningsplaneraren · Slice 33` (plain and bank builds). AC26c–i: step 1 and 2 texts, labels, aria. AC26l: every Slice 33 key in `blockMeta.ts` = `microcopy.sv.md` verbatim (19 keys, read from the md at run time). AC26j/k: no sheet text seen in the run says «länk», «!», Supabase, OTP, token, session, server or databas. AC26m: same for every admin string in `blockMeta.ts`. AC26n: every status and error line was seen in the sheet |

Extra: **E** no page errors · **N** coach-side requests are GETs with the publishable key only · **C** no code in any request URL.

## Bundle (gzip, vs main `44e2102`)

| Chunk | main 44e2102 | slice-33-code | Δ |
|---|---|---|---|
| `index-*.js` (initial), plain build | 135.36 kB | 135.44 kB | **+0.08** |
| `index-*.js` (initial), bank build | 135.46 kB | 135.54 kB | **+0.08** |
| `index-*.css` | 13.96 kB | 14.14 kB | +0.18 |
| `AdminLoginSheet-*.js` (lazy; now also has `loginCode`) | 0.74 kB | 1.65 kB | +0.91 |
| `session-*.js` (lazy) | 0.93 kB | 1.12 kB | +0.19 |
| `dist-*.js` (supabase-js, lazy) | 55.01 kB | 55.01 kB | 0 |

A coach visit, an old `?code=` URL and a share link still load only `index` + `jsx-runtime` (AC 18/20/21).

## Not covered here

- AC 4, 5, 10 and the keyboard parts of 23 need the real iPhone/Android installed apps.
- AC 1 (live mail), 3 (Users list), 12–14, 16 and 22 on the real project need step 12 first (template with `{{ .Token }}`). The template is likely locked on the free plan until custom SMTP is set up.
- A real old magic link (requested before the switch) on the real project (AC 18 last sentence).
- `verifier/slice-32-builder-smoke.mjs` still drives the retired link login, so it no longer runs against this code. Its admin blocks are reused here after a code login.

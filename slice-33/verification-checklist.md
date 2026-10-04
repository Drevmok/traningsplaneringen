# Slice 33 — acceptance criteria + verification checklist (DRAFT)

**Authority:** Slice 33 PASS = every AC 1–26 below, and the Slice 32 admin ACs still true (AC 25).  
**Status:** DRAFT 2026-10-03. Verifier runs only after Planner/Builder accept the pack, Christoffer's step 12 is done, Builder ships, and Planner pings.  
**Strings:** [`content/microcopy.sv.md`](./content/microcopy.sv.md), verbatim.  
**Skill:** `verify-traningsplaneraren/` (features `delad-bank` / admin); rigor per `backlog/PSTACK-OPS.md`.  
**Devices:** iPhone (iOS 17 or later) with the app added to the home screen from Safari, and an Android phone with the app installed from Chrome. Desktop Chrome at 390×844 for the rest.  
**Fixtures:** Christoffer's admin user, and Verifier's non-admin user from Slice 32 step 9a (no 9b). Both must be confirmed users (**Auto Confirm User**), or Supabase sends a "Confirm sign up" mail with a link instead of the code. While the project uses Supabase's built-in mail sender, mail only reaches members of the Supabase team. A local stand-in (GoTrue + mail catcher) is fine for AC 13–15 when the real project can't produce the case.  
**Never in a report:** login codes that are still valid, session tokens, the secret key. A used or expired code may appear.

---

## Mail and send

| AC | Pass if |
|---|---|
| 1 | A requested login mail has the Swedish subject and body from `content/setup-christoffer.md` 12c, shows exactly 6 digits, and contains **no link** (no `<a href`, no `/auth/v1/verify`) |
| 2 | Tapping `Skicka kod` sends one POST to `/auth/v1/otp` with `"create_user": false` and **no** `redirect_to`. Unit test: `signInWithOtp` is called with `options` deep-equal to `{ shouldCreateUser: false }` |
| 3 | An e-mail that is not a user: the app goes to step 2 with the same `adminCodeSent` text as for a real admin; no mail arrives; **Authentication → Users** shows no new user |

## Installed app (the reason for this slice)

| AC | Pass if |
|---|---|
| 4 | On **iPhone** and on **Android**, in the installed home-screen app: `Logga in som admin` → e-mail → `Skicka kod` → switch to the mail app, read the code → back to the app → type it → `Logga in` → footer `Träningsplaneraren · Slice 33 · Admin · Logga ut` and the `Admin` chip in Biblioteket. No browser tab or window opens at any point |
| 5 | Session persists in the installed app: after AC 4, swipe the app closed and reopen it from the icon → still `Admin · Logga ut`. Reopen again after more than one hour → still logged in (the session renews by itself) |
| 6 | If the app reloads while the admin is in the mail app (or Verifier reloads by hand) less than 60 minutes after the send, tapping `Logga in som admin` opens **step 2** with the same address in `adminCodeSent`, and the code from that mail still logs in. After a successful login, `Byt e-post`, `Logga ut`, or 60 minutes, the sheet opens on step 1 |

## Code field

| AC | Pass if |
|---|---|
| 7 | `Logga in` is disabled with 0–5 digits and enabled at exactly 6. A 7th typed digit is not added. Letters and symbols typed into the field are dropped |
| 8 | DOM: the code input has `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="[0-9]{6}"`, a `<label>` with `adminCodeLabel`, placeholder `adminCodePlaceholder`, and **no** `maxlength`. Computed font size ≥ 16px (iPhone doesn't zoom on focus) |
| 9 | Paste works and tolerates spaces: pasting `123456`, `123 456`, ` 123456 ` and `123-456` each gives `123456` in the field with `Logga in` enabled. Pasting `12 34` gives `1234` with `Logga in` disabled. Unit test for the normalizer covers these plus full-width digits (`１２３４５６` → `123456`) |
| 10 | Autofill: on iPhone, when the keyboard offers the code from Mail, one tap fills all six digits and enables `Logga in`. (Pass if the field accepts it when offered; the OS decides whether to offer it) |
| 11 | Focus: when step 2 opens (after sent or rate-limited), `document.activeElement` is the code field. After `adminCodeWrong`, focus stays in the field with its text selected. After `Byt e-post`, focus is in the e-mail field |

## Errors

| AC | Pass if |
|---|---|
| 12 | Wrong code (change one digit) → `adminCodeWrong` under the field, `aria-invalid="true"`, digits kept, sheet stays open, still logged out. Fixing the digit and tapping `Logga in` works and removes the line |
| 13 | Expired or replaced code → `adminCodeWrong`. Test either: request a code, tap `Skicka ny kod` after 60 s, then use the **first** code; or a stand-in with Email OTP Expiration set to 60 s and a code older than that |
| 14 | Rate limit: `Skicka kod` → `Byt e-post` → `Skicka kod` again within 60 s → step 2 opens with `adminCodeSent` and `adminWait` under `Skicka ny kod`. Verify-side 429 (stand-in or mocked client) → `adminVerifyWait`. Unit tests: send and verify classifiers map 429, `over_email_send_rate_limit` and `over_request_rate_limit` to wait |
| 15 | Network: offline on `Skicka kod` → `adminSendFailed`, step 1 stays with the address. Offline on `Logga in` → `adminVerifyFailed`, digits kept. Back online → the same buttons work without closing the sheet |

## Resend and Byt e-post

| AC | Pass if |
|---|---|
| 16 | `Skicka ny kod` is disabled for 60 s after each send, with `adminResendSoon` shown; then it enables and the line goes. Tapping it sends to the **same** address (request body), shows `adminCodeResent`, clears and focuses the code field. The new code logs in |
| 17 | `Byt e-post` → step 1 with the address still in the field; code and error lines cleared. Sending to another address shows that address in `adminCodeSent` |

## Old link path removed

| AC | Pass if |
|---|---|
| 18 | Opening `…/traningsplaneringen/?code=abc` in a fresh profile: app opens on Home, no error, no login sheet, no message, the address becomes `…/traningsplaneringen/`, and no supabase-js chunk or auth request loads. Same for `?error=access_denied&error_code=otp_expired&error_description=x#error=access_denied&error_code=otp_expired&sb=`. A real old magic link (requested before the switch, opened after) opens the app logged out, with a clean address |
| 19 | `rg -n "exchangeCodeForSession\|emailRedirectTo\|loginRedirectUrl\|linkFailed\|adminLinkFailed\|adminLinkSent\|adminSendLink" app/src` returns nothing |

## Sharing, coaches, non-admins

| AC | Pass if |
|---|---|
| 20 | `#dela=` still works: a share link made on a coach profile opens the pass in a fresh profile, and in a profile logged in as admin. `…/?code=abc#dela=<valid token>` opens the shared pass, keeps the hash and drops `code`. `sharePass` tests green |
| 21 | Coach visit (desktop and installed app): footer shows only `Logga in som admin`; no admin chip, filter, badge or button; no supabase-js chunk and no auth request in Network; nothing asks for an account |
| 22 | Non-admin user logs in with a code → footer `adminNotAdmin` + `Logga ut`, no admin chrome anywhere. `Logga ut` → back to `Logga in som admin` |

## Layout

| AC | Pass if |
|---|---|
| 23 | At 390×844, and on the iPhone with the keyboard open: on both steps the heading, field and primary button are visible or reachable by scrolling inside the sheet; `document.documentElement.scrollWidth` ≤ 390 (no horizontal scroll); the page doesn't zoom when a field gets focus; `Skicka ny kod` and `Byt e-post` are reachable without closing the keyboard |

## Logout, regression, copy

| AC | Pass if |
|---|---|
| 24 | `Logga ut` removes `gymnastics-planner-admin-auth-v1` and `gymnastics-planner-admin-auth-v1-code-verifier` from localStorage and the pending-login entry; reopening the app shows `Logga in som admin` |
| 25 | Slice 32 admin work unchanged after a code login: Godkänn, Ändra i banken, Dölj för alla / Visa igen, Markera som granskad, conflict and offline lines (spot-check Slice 31/32 AC 29–39 via the Slice 32 smoke path). `npm run build` green, `bun test src` green, main chunk grows < 1 kB gz vs Slice 32 |
| 26 | Every Slice 33 string matches `content/microcopy.sv.md` verbatim; footer `Träningsplaneraren · Slice 33`; the login sheet contains no "länk"; no UI string says Supabase, OTP, token or session; no exclamation marks |

## Smoke path

1. Christoffer step 12 done (template saved, length 6). Dev server with `.env.local`, or the PR preview.
2. Coach profile: footer link only, no supabase chunk (AC 21). Old-link URLs (AC 18) and a share link (AC 20).
3. Desktop 390×844: send, code field checks, paste set, wrong code, Byt e-post, rate limit, offline (AC 2, 7–9, 11, 12, 14, 15, 17, 23).
4. Real mail: AC 1, 3, 16, 13 (replaced code).
5. iPhone home-screen app: AC 4, 5, 6, 10, 23 with keyboard. Android installed app: AC 4, 5.
6. Non-admin user (AC 22). Logout (AC 24). Admin regression + build/tests/chunk (AC 25). Copy grep (AC 26, 19).

## Fail if

- The login mail contains a link, or the app sends `redirect_to`.
- Any step opens a browser tab from the installed app.
- An unknown address gets a different message than an admin's address, or creates a user.
- A `?code=` or `?error_code=` address crashes the app, opens the sheet, or loads supabase-js for a coach.
- `#dela=` links break.
- A coach sees anything new.
- A valid code or session token appears in a report or screenshot.

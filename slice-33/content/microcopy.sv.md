# Slice 33 — microcopy (Swedish): admin login with a code

**Status:** DRAFT 2026-10-03, awaiting Planner/Builder. The words are Docs final unless Planner changes the flow.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).  
**Base:** Slice 32 keys in [`slice-31/content/microcopy.sv.md`](../../slice-31/content/microcopy.sv.md) § Slice 32. Everything not listed here stays exactly as it is.  
**Tone:** du, short, quiet chrome (Slice 22). No exclamation marks. No tech words in the UI: no Supabase, OTP, token, session, server or databas. "Kod" is fine here: it is what the admin types.  
**Locked terms (unchanged):** gymnaster · pass · redskap · Biblioteket · Godkänn · Dölj för alla · Visa igen · Logga in som admin · Logga ut.

**ny** = new key in Slice 33. **omskriven** = same key, new text (länk → kod).

## What changes for the admin, in one line

Before: e-post → link in the mail → opens in the browser. Now: e-post → six digits in the mail → typed into the same login sheet. It works in the app on the home screen.

## Step 1: e-post (the sheet opens here)

| Key | Svenska | Where / when |
|---|---|---|
| `adminLoginTitle` | Logga in som admin | Sheet heading, both steps. Unchanged |
| `adminLoginHint` **omskriven** | Skriv din e-post så skickar vi en kod. | Under the heading on step 1. Also the e-mail field's hint (`aria-describedby`) |
| `adminEmailLabel` | E-post | Input label. Unchanged: `type="email"`, `autocomplete="email"`, no placeholder |
| `adminSendCode` **ny** | Skicka kod | Primary button on step 1. Replaces `adminSendLink`. Disabled while the field is empty and while sending |
| `adminWait` **omskriven** | Vänta en stund innan du ber om en ny kod. | Rate limit on send (429, `over_email_send_rate_limit`, `over_request_rate_limit`). Shown on **step 2** under `adminResend` (see the note under step 2), never as a toast |
| `adminSendFailed` **omskriven** | Kunde inte skicka koden. Kolla nätet och försök igen. | Under the button, only when the request never reached the login service (offline, network error, timeout, 5xx). Step 1: the form stays. Step 2 (resend): shown under `adminResend`, the code field stays |

Any other answer about the address (unknown e-mail, sign-ups off, not confirmed) counts as sent and goes to step 2 with `adminCodeSent`. Nobody can test who is admin.

## Step 2: the code

| Key | Svenska | Where / when |
|---|---|---|
| `adminCodeSent` **ny** | Om {email} hör till en admin kommer en kod strax. Skriv den här. Koden gäller i en timme. | Top of step 2, every time step 2 opens. `{email}` = the address as typed (trimmed), so a typo is easy to spot. Same text for every address. Text block, `role="status"`. Replaces `adminLinkSent` |
| `adminCodeLabel` **ny** | Kod från mejlet | Code field label |
| `adminCodePlaceholder` **ny** | 6 siffror | Code field placeholder. Disappears as soon as a digit is typed |
| `adminVerify` **ny** | Logga in | Primary button on step 2. Disabled until the field holds exactly 6 digits, and while checking |
| `adminCodeWrong` **ny** | Koden stämmer inte eller har slutat gälla. Försök igen eller be om en ny kod. | Under the code field after `Logga in`, when the code is refused (403 `otp_expired`, or any other 4xx except 429). One text for wrong **and** expired: the login service gives the same answer for both. The field keeps the digits, gets focus, and the text is selected so typing replaces it |
| `adminVerifyWait` **ny** | Vänta en stund innan du försöker igen. | Under the code field when checking is rate-limited (429 / `over_request_rate_limit`) |
| `adminVerifyFailed` **ny** | Kunde inte logga in. Kolla nätet och försök igen. | Under the code field when the check never reached the login service (offline, network error, timeout, 5xx). Digits kept |
| `adminResend` **ny** | Skicka ny kod | Quiet text button under `Logga in`. Sends a new code to the same address. Disabled for 60 seconds after every send |
| `adminResendSoon` **ny** | Du kan be om en ny kod om en minut. | Muted line next to or under `adminResend` while it is disabled (the first 60 seconds after a send). Gone when the button is enabled again. No countdown |
| `adminCodeResent` **ny** | Om adressen hör till en admin kommer en ny kod strax. Använd den senaste. | Replaces `adminCodeSent` (same place, `role="status"`) after a resend that counts as sent. The code field is cleared and focused |
| `adminChangeEmail` **ny** | Byt e-post | Quiet text button on step 2. Back to step 1 with the address still in the field (focused, text selected). Clears the code and any error line |
| `adminCloseAria` | Stäng inloggningen | × button, both steps. Unchanged |

**Rate limit on the first send.** If `Skicka kod` hits the rate limit, go to step 2 anyway: `adminCodeSent` at the top as usual, `adminWait` under `adminResend`, and `adminResend` disabled for 60 seconds. The usual cause is a second tap within a minute, so the code from the first tap is already on its way. The admin can type it, or wait and tap `Skicka ny kod`.

### Success

No text and no toast (same as a good link in Slice 32). The sheet closes. The footer shows `Träningsplaneraren · Slice 33 · Admin · Logga ut`, or `adminNotAdmin` + `adminLogout` when the address is a user but not on the admin list. Focus goes to the footer's `Logga ut` link, so a screen reader hears the new state.

### Accessible names

- The code field's accessible name is `adminCodeLabel`. Its `aria-describedby` points at the `adminCodeSent` / `adminCodeResent` line and, when shown, the error line.
- Error lines under the field (`adminCodeWrong`, `adminVerifyWait`, `adminVerifyFailed`) use `role="alert"`, so they are read once when they appear. Set `aria-invalid="true"` on the field only while `adminCodeWrong` shows.
- `adminResend` is a real `<button>`; while disabled it has `aria-describedby` → the `adminResendSoon` line.
- No new aria-only keys are needed.

## Footer

| Key | Svenska | Where / when |
|---|---|---|
| `footerSliceLabel` **omskriven** | Träningsplaneraren · Slice 33 | Footer, replaces the Slice 32 label |

`adminLoginLink`, `adminBadge`, `adminLogout` and `adminNotAdmin` are unchanged.

## Slice 32 keys: replaced, reworded, retired

| Slice 32 key | Slice 33 | Why |
|---|---|---|
| `adminSendLink` (Skicka länk) | **Retired.** Replaced by `adminSendCode` (Skicka kod) | No link any more |
| `adminLinkSent` | **Retired.** Replaced by `adminCodeSent` | Says "länk" and "öppna den i den här webbläsaren", which is the problem this slice fixes |
| `adminLinkFailed` (Länken fungerar inte längre. Be om en ny.) | **Retired, no replacement.** Wrong or expired codes use `adminCodeWrong` | The `?code=` / `?error_code=` return path is gone. An old link from the mail now just opens the app with a clean address and no message |
| `adminLoginHint` | Same key, **omskriven**: länk → kod | |
| `adminWait` | Same key, **omskriven**: länk → kod. Now shown on step 2 | |
| `adminSendFailed` | Same key, **omskriven**: länken → koden | |
| `footerSliceLabel` | Same key: Slice 32 → Slice 33 | |

Unchanged from Slice 32: `adminLoginLink`, `adminBadge`, `adminLogout`, `adminNotAdmin`, `adminLoginTitle`, `adminEmailLabel`, `adminCloseAria` and every Biblioteket, detail, Dölj, form and error key (`adminFilter*` … `adminSaveFailed`). Slice 22–31 strings are unchanged.

## Deliberately no other text

- No text for coaches. A coach still sees only `adminLoginLink` in the footer, and needs no account.
- No loading text while sending or checking: disable the button instead.
- No "kolla skräpposten" line. Add it only if testing shows the mail lands in spam.
- No countdown numbers ("59 s…"). `adminResendSoon` is enough and stays quiet.
- No mention of Safari, Chrome, browser or home screen. The code works the same everywhere.
- No exclamation marks.

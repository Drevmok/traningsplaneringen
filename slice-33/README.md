# Slice 33 — Admin-inloggning med kod från mejlet

**App:** Träningsplaneraren  
**Approval:** Christoffer approved the direction (6-digit code instead of magic link).  
**Status:** **DRAFT 2026-10-03, awaiting Planner/Builder.** Docs pack only, no app code. Branch `slice-33-docs` from `main` @ `44e2102` (Slice 32 merge).

## Why

Slice 32 logs admins in with a link sent by e-mail. On iPhone and Android, the app added to the home screen can't use that link. The link opens in Safari or Chrome, and the home-screen app keeps its own separate storage, so the login lands in the wrong place.

A 6-digit code fixes this. The admin reads it in the mail app and types it into the app they are already in.

**Admin outcome:** "Jag trycker Logga in som admin, skriver min e-post, skriver koden från mejlet och är inne, även i appen på hemskärmen."  
**Coach outcome:** none. Coaches still need no account and see only the footer link.

## The change

1. Enter e-mail → `Skicka kod`.
2. `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`, without `emailRedirectTo`.
3. A 6-digit code field (`Kod från mejlet`).
4. `verifyOtp({ email, token, type: 'email' })` → logged in. Admin mode or the non-admin line, exactly as in Slice 32.

The `?code=` return path and the `?error_code=` handling go away. Leftover params from an old link are stripped from the address, and nothing else happens. `#dela=` sharing is untouched.

## What Christoffer does

One step (~5 min), [`content/setup-christoffer.md`](./content/setup-christoffer.md) step 12:

- check that the code length is 6;
- put `{{ .Token }}` in the **Magic link or OTP** mail with a short Swedish text and no link.

**Likely blocker:** Supabase locks mail templates on free projects created after 3 June 2026 unless the project uses its own mail sender. See HANDOFF open item 1.

## Pack files

| File | Role |
|---|---|
| [`HANDOFF.md`](./HANDOFF.md) | Order of work, the flow, Builder's exact files, code to remove/keep, open items |
| [`verification-checklist.md`](./verification-checklist.md) | AC 1–26 + smoke path |
| [`content/microcopy.sv.md`](./content/microcopy.sv.md) | Swedish strings with keys; which Slice 32 keys are replaced, reworded or retired |
| [`content/setup-christoffer.md`](./content/setup-christoffer.md) | Step 12: code length + mail template (English, for Christoffer) |

Thin cross-links: `docs/delad-bank.sv.md` (För admins) and `slice-31/content/setup-christoffer.md` (step 11) point here.

## In scope

Login sheet with two steps (e-post, kod) · send without redirect · `verifyOtp` · resend with a 60 s cooldown · Byt e-post · pending login that survives an app reload · removing the link return path, with old URLs cleaned safely · keys + footer 33 · tests.

## Out of scope

Custom SMTP setup · passwords · coach accounts · new admin features · database or RLS changes · service worker.

## Effort

**S–M.** One sheet, two auth calls, removing about 60 lines of return-path code, tests. Most of the risk is outside the code: the mail template (setup 12) and testing on two real phones.

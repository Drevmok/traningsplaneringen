# Bot writes — approved YouTube stations → bank (Slice 32 · E1)

**Supersedes** [`slice-30/content/seed-promotion.md`](../../slice-30/content/seed-promotion.md) once Slice 32 ships with **E1**. (E2 = keep that doc; E3 = Christoffer imports via admin UI, no key.)

## Decision: a dedicated secret key on the box (not a bot "admin account")

| Option considered | Verdict |
|---|---|
| **Dedicated secret key `planner-bot` on the box** | **Chosen.** Server-side only; separately revocable (Supabase allows several secret keys); the DB grants `service_role` select/insert/update but **no delete**; script forces `status = 'pending'` |
| Bot logs in as an admin user | Rejected: magic link needs a mailbox the bot reads; a password admin account is a long-lived credential with the same power as Christoffer's, and RLS can't tell bot from human |
| Secret key in GitHub Actions | Rejected: not needed (writes happen from the box), widens exposure |
| Secret key anywhere in `app/` or the bundle | **Never.** Secret keys bypass RLS. Supabase also returns 401 if a secret key is used from a browser |

## Key handling (box)

- Christoffer creates **Settings → API Keys → Secret keys → New secret key**, name `planner-bot`, and enters it **only via the secure input on the box**.
- Builder stores it at `~/.config/traningsplaneraren/bank-bot.env`, `chmod 600`:
  ```
  BANK_URL=https://<ref>.supabase.co
  BANK_BOT_SECRET_KEY=sb_secret_…
  ```
- Never echoed, logged, committed, pasted into chat, PR text, verifier reports or this repo. `git grep sb_secret_` must stay empty.
- Revoke: delete the `planner-bot` key in the dashboard → script fails with "Nyckeln fungerar inte längre"; the app is unaffected (it uses the publishable key).

## Flow

1. **Planner** drafts stations from a video as today (`import-trials/<videoId>/drafts.json`), Christoffer may comment in chat.
2. **Planner** writes `import-trials/<videoId>/promote.json` (schema v1 + `seedId` per exercise, rules from seed-promotion.md step 3) and runs `python3 slice-30/content/check_import.py promote.json`.
3. **Planner** runs `bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json`:
   - maps each exercise to a row (`id = seedId`, `safety_line`, `source`, tags incl. `new-coach-ok` when `newCoachOk`, redskap from the fixed library, links only to existing bank ids);
   - `POST {BANK_URL}/rest/v1/exercises` with headers `apikey: <secret>`, `Content-Type: application/json`, `Prefer: return=representation`; body forces `status: 'pending'`, `needs_coach_review: true`, `updated_by: 'bot:planner'`, `sort_order` = after the last row of that block;
   - an existing id → **409, skipped and reported** (no overwrite). `--replace <id>` only with Christoffer's explicit OK in chat; replace never changes `status`;
   - refuses to run if the key starts with `sb_publishable_`, the env file is not mode 600, or the file has >100 exercises;
   - prints ids + "Väntar på godkännande i appen", never the key.
4. **Christoffer** opens the app → Logga in som admin → Biblioteket → **Väntar på godkännande (n)** → reads → **Godkänn** / **Ändra i banken** / **Dölj för alla**.
5. Coaches see approved stations on their next app start (D1).

## Snapshot back into the app (backup + offline fallback)

`bun tools/bank/export-db.ts` (secret key, read-only use) pulls published + hidden rows → regenerates the bundled fallback (`app/src/data/bankSnapshot.json`, see builder-notes) → **small Builder PR "Banksnapshot <datum>"** (Christoffer merges). Run after each approved batch, at least monthly. This is the bank's backup on the free plan (no automatic backups).

## Rules (unchanged from Slice 30)

Own words only, never transcript lines · no thumbnails/frames/video in `app/` · `source.url` https only · one video → one promote file → one push.

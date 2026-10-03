# tools/bank — shared exercise bank helpers (Slice 31–32)

| File | What |
|---|---|
| `export-seed.ts` | Bundled bank (`app/src/data/seedActivities.ts` + `equipmentPieces.ts` + seed Säkerhet lines) → idempotent upsert SQL for Supabase. Row mapping is `activityToBankRow` in `app/src/lib/bankRow.ts`, the same code the app uses to read rows back. |
| `out/bank-seed.sql` | Generated, committed: what Christoffer pastes into Supabase → SQL Editor after `slice-31/content/schema-31.sql`. **51 övningar · 15 redskap.** Public exercise texts only — no keys. |
| `out/bank-seed.json` | Same rows as JSON (parity fixture for Verifier, AC 7). |
| `out/parts/` | Slice 32: the same seed as **8 pastes ≤ 16 000 bytes** (`--chunked`). Byte-identical to Planner's verified split; same rows as `bank-seed.sql` on PG 17. Each part has its own `begin/commit`; parts 1–7 insert with links null, part 8 sets the 5 links + shows counts. |
| `out/setup-32/` | Slice 32: paste-ready SQL + ordered list for the real project (schema-32, admin insert, checks). Each file < 16 KB. |
| `push-promote.ts` + `promote-lib.ts` | Slice 32 (E1): bot writes an approved `promote.json` into the bank as **pending** rows. |
| `export-db.ts` | Slice 32: read-only backup of published + hidden rows → `out/bank-snapshot.json` (bot key, never pending). `SUPABASE_URL=… bun tools/bank/export-db.ts`. Not wired into the app bundle yet. |
| `fixtures/promote-2.json` | Two-exercise test fixture (`tech-test-…` ids) for the bot script. |

## Regenerate

```bash
cd /workspace/gymnastics-planner
bun tools/bank/export-seed.ts            > tools/bank/out/bank-seed.sql
bun tools/bank/export-seed.ts --json     > tools/bank/out/bank-seed.json
bun tools/bank/export-seed.ts --new-only > tools/bank/out/bank-new.sql   # Slice 32+: never overwrite DB edits
bun tools/bank/export-seed.ts --chunked                # → out/parts/bank-seed-del-K-av-N.sql (≤ 16 000 bytes each)
bun tools/bank/export-seed.ts --new-only --chunked     # → out/parts-new/bank-new-del-K-av-N.sql
bun tools/bank/export-seed.ts --new-only --existing ids.txt   # also leave out ids listed in ids.txt (one per line)
```

### From Slice 32: `--new-only` is the path (never the full upsert again)

From Slice 32 the **database is the source of truth**: admins edit text in the app. The full `bank-seed.sql` / `out/parts/` does `on conflict (id) do update` — re-running it would **overwrite admin edits**. Use only:

```bash
bun tools/bank/export-seed.ts --new-only --chunked
```

`--new-only` = `on conflict (id) do nothing` for every row (only exercises whose id is not in the bank yet are added; existing rows, including hidden/edited ones, are never touched). The last part fills `progression_of` / `regression_of` **only where still empty**. Paste the parts in order into Supabase → SQL Editor. Optional `--existing ids.txt` (from `select id from public.exercises;`) shrinks the output to the truly new rows. New exercises from videos go through the bot script below instead.

## Bot writes (Slice 32 · E1): `push-promote.ts`

The secret key is read **only** from the box environment variable `SUPABASE_PLANNER_BOT_KEY` (Christoffer enters it via the secure input; setup step 10). It is never written to a file, printed or logged. URL from `--url` or `SUPABASE_URL` (https; `http://127.0.0.1` only for the local stand-in).

```bash
# 1. check the file (works without a key: compares with the app's bundled bank)
python3 slice-30/content/check_import.py import-trials/<videoId>/promote.json
bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json --dry-run

# 2. push (rows land as pending; Christoffer approves in the app)
SUPABASE_URL=https://<ref>.supabase.co bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json

# 3. only with Christoffer's explicit OK in chat: overwrite text of an existing id (status unchanged)
bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json --replace tech-some-id
```

What it does: schema v1 + `seedId` per exercise → `id = seedId` (block prefix checked), same sanitizing as the in-app import, `status = 'pending'`, `needs_coach_review = true`, `updated_by = 'bot:planner'`, `sort_order` after the block's last row, tag `new-coach-ok` + `new_coach_ok` when `newCoachOk`, redskap only from the fixed library (Teknik only), links only to ids in the bank or in the same file (own ids rewritten to their `seedId`). All-or-nothing: any invalid row → nothing is written. Existing id → **skipped and reported** (no overwrite) unless `--replace <id>`; a 409 on insert is also skipped. Refuses: no key, a publishable key, an anon/authenticated JWT, > 100 exercises. **Never deletes** (no DELETE call; the database also refuses it). A deleted/revoked key → «Nyckeln fungerar inte längre …».

Tests: `bun test tools/bank` (pure + mocked). Against the local stand-in (`verifier/slice-32-local/`): `S32_GATEWAY=http://127.0.0.1:54340 bun test tools/bank` — dry-run, insert pending, refuse overwrite, `--replace`, bot DELETE → permission denied, revoked key.

Deviation from `bot-writes.md`: the key lives in the box env var `SUPABASE_PLANNER_BOT_KEY` (per Christoffer/Planner), not in `~/.config/traningsplaneraren/bank-bot.env`; so there is no file-mode check.

## Never

- No secret key (the one that bypasses RLS) or database password in this folder, the repo, the app or GitHub.
- The app only gets the project URL + publishable key, from the build env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

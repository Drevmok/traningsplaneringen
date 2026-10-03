# tools/bank — shared exercise bank helpers (Slice 31)

| File | What |
|---|---|
| `export-seed.ts` | Bundled bank (`app/src/data/seedActivities.ts` + `equipmentPieces.ts` + seed Säkerhet lines) → idempotent upsert SQL for Supabase. Row mapping is `activityToBankRow` in `app/src/lib/bankRow.ts`, the same code the app uses to read rows back. |
| `out/bank-seed.sql` | Generated, committed: what Christoffer pastes into Supabase → SQL Editor after `slice-31/content/schema-31.sql`. **51 övningar · 15 redskap.** Public exercise texts only — no keys. |
| `out/bank-seed.json` | Same rows as JSON (parity fixture for Verifier, AC 7). |

## Regenerate

```bash
cd /workspace/gymnastics-planner
bun tools/bank/export-seed.ts            > tools/bank/out/bank-seed.sql
bun tools/bank/export-seed.ts --json     > tools/bank/out/bank-seed.json
bun tools/bank/export-seed.ts --new-only > tools/bank/out/bank-new.sql   # Slice 32+: never overwrite DB edits
```

Re-running `bank-seed.sql` is safe: `insert … on conflict (id) do update` (text from code wins), `status` is never touched, so an admin's hidden row stays hidden. From Slice 32 the database is the source of truth: use `--new-only` instead (see `slice-31/content/migration-plan.md`).

## Never

- No secret key (the one that bypasses RLS) or database password in this folder, the repo, the app or GitHub.
- The app only gets the project URL + publishable key, from the build env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

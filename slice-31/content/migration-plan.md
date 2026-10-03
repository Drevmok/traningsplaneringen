# Migration plan — seedActivities.ts → Supabase (Slice 31)

**Tested 2026-10-02** on local PostgreSQL 17 with Supabase-style roles (`anon`, `authenticated`, `service_role`, `auth.uid()` stub): `schema-31.sql` → seed SQL (twice, idempotent) → `schema-31.sql` re-run → `schema-32.sql` (twice) → `rls-smoke.sql` all PASS, rolled back cleanly. Result: **51 exercises published, 15 redskap**.

## Steps

| # | Who | What |
|---|---|---|
| 1 | Builder | Move [`export_bank_seed.ts`](./export_bank_seed.ts) to `tools/bank/export-seed.ts` (fix import paths to `../../app/src/...`); add `tools/bank/README.md`. Output dir `tools/bank/out/` is git-ignored |
| 2 | Builder | `bun tools/bank/export-seed.ts > tools/bank/out/bank-seed.sql` and `--json > tools/bank/out/bank-seed.json` |
| 3 | Christoffer | Supabase → SQL Editor → paste [`schema-31.sql`](./schema-31.sql) → Run → paste `bank-seed.sql` → Run (Builder hands him the file — it only contains the public exercise texts, so chat is fine) |
| 4 | Verifier | SQL Editor: `select status, count(*) from public.exercises group by status;` → `published 51`; `select count(*) from public.redskap;` → 15; run [`rls-smoke.sql`](./rls-smoke.sql) Part 1 |
| 5 | Verifier | Parity: fetch rows with the publishable key (curl) → map with `rowToActivity` → deep-equal with bundled `seedActivities` (+ `safetyLine` = `floorTip(a).safety`) for all 51 |

## Field mapping (Activity ↔ row)

| Activity | Column | Note |
|---|---|---|
| `id` | `id` | Prefix `gather-·warm-·tech-·strength-·fun-` (check constraint); never changes |
| `blockType` | `block_type` | enum |
| `title` · `summary` · `howTo` · `watchFor` | `title` · `summary` · `how_to` · `watch_for` | Limits 80 / 240 / 800 / 240 (seeds today max 58 / 125 / 342 / 168) |
| `durationMinutesDefault` | `duration_minutes_default` | 1–180 |
| `watchForRequired` | `watch_for_required` | — |
| `ACTIVITY_SAFETY[id]` / `safetyLine` | `safety_line` | Required unless `gathering` (5 Samling seeds have none) |
| `visualKey` | `visual_key` | App falls back to block icon if unknown to `VISUAL_ICON` |
| `difficulty` | `difficulty` | enum |
| `tags` | `tags text[]` | ≤8 (seeds max 7). Zone tags `trampett`/`vault`/`floor` must survive verbatim |
| `defaultStationEquipment` | `default_station_equipment jsonb` | Teknik only (check); ids validated against `redskap` (trigger); ≤8 slots, count 1–9 |
| `equipment` (legacy) | `legacy_equipment text[]` | Only `fun-rundpingis-medicinboll` |
| `progressionOf` / `regressionOf` | `progression_of` / `regression_of` | FK → `exercises.id`, deferrable (bulk insert in one transaction) |
| `experiencedCoachOnly` · `newCoachOk` · `needsCoachReview` | same, snake_case | — |
| `source` | `source jsonb` | `https://` only, creator 1–80 (check) |
| `stub` | — | Always `false` in seeds; app sets `stub: false` |
| `own` | — | Never in the bank |
| (order in file) | `sort_order` | `(index+1)*10` → Biblioteket order unchanged; gaps for later inserts |
| — | `status` | `published` on seed; re-seed **never** changes status (an admin's Dölj stays) |
| — | `created_at` · `updated_at` · `updated_by` | Triggers; seed sets `updated_by = 'seed-script'` |

## Re-running

- **Slice 31 (before admins edit anything):** new seeds still arrive via the PR route; after merge, re-export and paste `bank-seed.sql` again (upsert = text from code wins, status kept).
- **From Slice 32:** the database is the source of truth. Never run the full upsert again (it would overwrite admin edits); use `--new-only` (`on conflict do nothing`) if a code-side seed must be added. The reverse direction (DB → bundled snapshot) is `tools/bank/export-db.ts` (Slice 32, see `bot-writes.md`).

## Rollback

App: remove the two repo variables + re-run Pages → app is bundled-only again (no code revert needed). Database: `drop table public.exercises, public.redskap cascade;` (owner, SQL Editor) — nothing on coaches' devices depends on it except the cache, which then simply stops refreshing.

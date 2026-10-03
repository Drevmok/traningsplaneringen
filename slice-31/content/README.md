# Slice 31 + 32 — content

Pack **DRAFT 2026-10-02** — recommended A1 / B2 / C1 / D1 / E1 / F1. SQL tested locally (PostgreSQL 17 + Supabase role stubs): schema → seed ×2 → schema re-runs → `rls-smoke.sql` all PASS.

| File | Slice | Role |
|---|---|---|
| [`schema-31.sql`](./schema-31.sql) | 31 | Types, `redskap` + `exercises`, checks, triggers (redskap validation, id lock, `updated_at`), RLS: public read only, `pending` never public |
| [`export_bank_seed.ts`](./export_bank_seed.ts) | 31 | Prototype exporter: `seedActivities.ts` → idempotent upsert SQL (`--json`, `--new-only`). Builder moves it to `tools/bank/` |
| [`migration-plan.md`](./migration-plan.md) | 31 | Steps, Activity ↔ column mapping, re-run + rollback rules |
| [`config-pages.md`](./config-pages.md) | 31 | URL + publishable key via GitHub repo variables; request shape; local `.env.local` |
| [`local-vs-bank.md`](./local-vs-bank.md) | 31/32 | What stays in localStorage, new keys, lookup order |
| [`schema-32.sql`](./schema-32.sql) | 32 | `admins`, `private.is_admin()`, admin insert/update policies, no delete, `updated_by` stamp, "make me admin" snippet |
| [`rls-smoke.sql`](./rls-smoke.sql) | 31/32 | Self-checking RLS test for the SQL Editor; wrapped in `begin … rollback` |
| [`bot-writes.md`](./bot-writes.md) | 32 | E1: `planner-bot` secret key on the box, `push-promote` flow → pending → Godkänn; DB → bundled snapshot. Supersedes `slice-30/content/seed-promotion.md` |
| [`setup-christoffer.md`](./setup-christoffer.md) | 31/32 | Step-by-step guide only Christoffer can do (Slice 31 steps 1–5 and Slice 32 steps 6–11 Docs-polished) |
| [`microcopy.sv.md`](./microcopy.sv.md) | 31/32 | Swedish strings. Slice 31 Docs final 2026-10-02; Slice 32 Docs final 2026-10-03 |
| [`docs/delad-bank.sv.md`](../../docs/delad-bank.sv.md) | 31/32 | Living Docs note (Swedish): where exercises come from, offline behaviour, who looks after the bank, short admin guide, Builder key mirror, Slice 22–31 do-not-touch |

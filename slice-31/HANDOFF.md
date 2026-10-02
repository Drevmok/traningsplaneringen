# Slice 31 + 32 — handoff

**Status:** **LOCKED 2026-10-02 20:25** — A1 / B2 / C1 / D1 / E1 / F1. Backlog: **Slice 31 Approved/Locked → In flight**; **Slice 32 Approved/Locked** (waits for Slice 31 live). Branch `slice-31-pack` (pack only, no app code). Nothing merges to `main` without Christoffer (merge = Pages deploy).

## Execution order

### Slice 31 (A1 + D1 — locked)
1. ~~**Planner** presents A–F; on lock, marks the pack LOCKED~~ — done 2026-10-02 20:25.
2. **Christoffer** setup steps 1–4 (`content/setup-christoffer.md`). Builder can start in parallel — the bank is off until the repo variables exist.
3. **Docs** — finalise Slice 31 keys in `content/microcopy.sv.md` (one string + footer); living note `docs/delad-bank.sv.md` (what coaches see, offline behaviour).
4. **Builder** — `builder-notes.md` §Slice 31; generates `bank-seed.sql` for Christoffer (step 3); self-smoke; `app/SLICE31-SHIPPED.md`; footer 31. PR from a feature branch, **not merged**.
5. **Planner** pings **Verifier** → `verification-checklist.md` AC 1–22 + `content/rls-smoke.sql` Part 1.
6. **After PASS:** Christoffer says merge → Pages deploys.

### Slice 32 (B2 + C1 + E1 + F1 — locked; starts when Slice 31 is live)
1. **Christoffer** setup steps 6–10 (step 10 = `planner-bot` secret key, E1 locked).
2. **Docs** — Slice 32 keys; extend `docs/delad-bank.sv.md` with an admin guide (login, Godkänn, Dölj, granskad); mark `slice-30/content/seed-promotion.md` superseded (E1 locked).
3. **Builder** — `builder-notes.md` §Slice 32; stores the bot key per `content/bot-writes.md` (E1 locked; only from the secure input); `app/SLICE32-SHIPPED.md`; footer 32. PR, **not merged**.
4. **Planner** pings **Verifier** → AC 23–50 + `rls-smoke.sql` full.
5. **After PASS:** merge on Christoffer's word. First real use: Planner pushes the next video's stations as pending → Christoffer approves in the app.

## Paths

| Path | Role |
|---|---|
| `slice-31/` | This pack (both slices) |
| `slice-31/content/schema-31.sql` · `schema-32.sql` | Database (tested locally) |
| `slice-31/content/rls-smoke.sql` | Verifier RLS test (rolls back) |
| `slice-31/content/export_bank_seed.ts` | Seed exporter prototype → `tools/bank/export-seed.ts` |
| `slice-31/content/bot-writes.md` | E1 bot process; supersedes `slice-30/content/seed-promotion.md` |
| `slice-31/content/setup-christoffer.md` | Steps only Christoffer can do |
| `app/src/lib/bank.ts` · `bankRow.ts` · `bankConfig.ts` (new, 31) | Store, sanitizer, config |
| `app/src/data/seedActivities.ts` · `components/LibraryPanel.tsx` · `lib/ownImport.ts` · `main.tsx` | Wiring (31) |
| `.github/workflows/pages.yml` | Two env vars from repo variables (31) |
| `app/src/lib/admin/*` · `components/AdminLoginSheet.tsx` · `AdminBankForm.tsx` (new, 32) | Admin |
| `tools/bank/` (new) | `export-seed.ts` (31) · `push-promote.ts` · `export-db.ts` (32) |
| `~/.config/traningsplaneraren/bank-bot.env` (box, mode 600, never in git) | E1 secret key (Slice 32) |

## Not this pack

Coach accounts / sync · realtime · DB-driven redskap or mallar · hard delete · version history (F1 locked; F2 = later) · service worker · custom SMTP · paid plan · in-app AI / video fetching.

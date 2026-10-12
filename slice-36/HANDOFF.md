# Slice 36 — HANDOFF (Builder)

Words: [`content/microcopy.sv.md`](./content/microcopy.sv.md). All UI strings go in `UI` (`app/src/data/blockMeta.ts`) in a `// Slice 36 — club templates` group after the Slice 32 admin keys; bump `SLICE_NUMBER` to `'36'`. Locks: [`README.md`](./README.md). Follow `backlog/PSTACK-OPS.md` (Builder minimum bar; this is a nontrivial slice: `how`/`architect` first, self-smoke with the verify skill Drive recipe).

## 0. Order of work

1. Christoffer pastes `sql/36-01…03` (setup-christoffer.md step 13). Until then, build against a local/branch project or mock the fetch; don't merge before he says "Föreningsmallar klara".
2. `lib/clubTemplates.ts` (cache + refresh), tests.
3. Coach UI in `LibraryPanel` (templates tab) + apply path.
4. Admin writes (lazy) + dialogs.
5. Footer, bundle numbers, ship notes `app/SLICE36-SHIPPED.md`.

## 1. Data

Table `public.club_templates` (`sql/36-01-table.sql`):

| Column | Use |
|---|---|
| `id` uuid | Stable id; card key, update target |
| `title` text 1–80 | Card title; unique by `lower(btrim(title))` → overwrite key |
| `total_minutes` int | Card meta (`session.totalMinutes` at publish) |
| `payload` jsonb | SharePass v1. DB refuses objects without `v = '1'`, without `blocks` array, or **with** `hallPlacements` |
| `hidden` bool | Dölj för alla / Visa igen |
| `sort_order` int | 0 for now; list order = `sort_order, title` |
| `updated_at`, `updated_by` | Set by triggers (`public.touch_row`, `private.stamp_updated_by`); never sent by the client |

Payload at publish: `const { hallPlacements, ...pass } = sessionToShare(clearHallPlacements(session))`. Keep `own` (admin's own drills used in the pass) so the mall resolves on any device, exactly as share links do. Keep `hallTemplateId`/`hallShowFlow` (hall choice, not geometry).

## 2. Coach data flow (D1) — `app/src/lib/clubTemplates.ts`

Copy the shape of `lib/bank.ts`; do not import admin code here.

- Cache key `gymnastics-planner-club-templates-v1`, value `{ v: 1, fetchedAt, items: ClubTemplate[] }`, items = visible rows only.
- `initClubTemplates()` sync before first render: read cache, validate every item (`pass.v === 1`, `Array.isArray(pass.blocks)`, string id/title, finite minutes); drop bad items, never throw. No cache → empty list, status `'none'`.
- `refreshClubTemplates()` once per load after first render, only if `bankEnabled()`: `GET {url}/rest/v1/club_templates?select=id,title,total_minutes,payload,updated_at&hidden=is.false&order=sort_order,title` with the publishable key on `apikey` only (no `Authorization`, same as bank), 8 s timeout (`BANK_TIMEOUT_MS`).
  - Valid array → replace store + cache, status `'fresh'` (an empty array is valid: it means the club has no mallar, and clears the cache).
  - Anything else (offline, timeout, non-2xx, bad JSON) → keep current list, status `'stale'`.
- Bank off (no env) → no request, no section, no stale line.
- Subscribe hook `useClubTemplates()` like `useBank.ts`.

UI states in the Mallar tab (templates tab, also reached from **Starta från mall**):

| Status | Section |
|---|---|
| fresh, n > 0 / cached, n > 0 | Heading `clubTemplatesTitle` + hint + cards |
| fresh, n = 0 | Heading + `clubTemplatesEmpty` |
| stale | Cards (if any) + `clubTemplatesStale` (class like `.bank-stale`). If stale with n = 0 and never fetched: hide the whole section, no empty text |
| none (first load, no answer yet) | Section hidden |

Order in the tab: Föreningens mallar → Mina mallar → `savedTemplatesHint` → built-in `seedTemplates`. Club cards reuse `.template-card` + `clubTemplateBadge` tag; coaches get no actions on them (no Kopiera delningskod, no Ta bort).

## 3. Apply (E1)

Tap a club card → same path as a saved template: `onPickSaved`-style handler → `TemplateConfirm` (Ersätta det här passet?) with the extra muted `clubTemplatePlacementsNote` → `sessionFromPassJson`/`shareToSession` → **`clearHallPlacements`** (already in `session.ts` apply) → fresh ids as `duplicateSession` does → toast `clubTemplateApplied`. The result is the coach's own local pass; nothing links back to the row. Spara som egen mall works on it unchanged. Also reachable through Home's **Starta från mall** (Slice 20 one-shot flag) — the club group must be in the sheet that opens.

## 4. Admin writes (B1, C1, F1) — lazy

Put writes in `lib/admin/clubWrite.ts` and the dialog in a lazy component, loaded only in admin mode (same rule as Slice 32: a coach visit downloads no admin code, sends no `Authorization`). Use the existing client in `lib/admin/client.ts`.

- **Admin read:** in admin mode, re-read with the admin session (RLS returns hidden rows too) to fill the hidden group and the overwrite lookup. Never write hidden rows into the coach cache.
- **Publish** (`clubPublish` on the open pass, next to Spara som egen mall; only when `useAdmin` says admin): dialog with name field prefilled. On confirm, look up the title (`lower(trim)`) among the admin list:
  - no match → `insert`; toast `clubPublished`.
  - match → show `clubOverwriteTitle/Body`; on `clubOverwriteConfirm` → `update … eq('id', match.id)` with `title, total_minutes, payload, hidden: false`; toast `clubOverwritten`. (PostgREST can't upsert on the expression index, hence lookup + update. A unique-violation `23505` on insert = someone published the same name in between → refetch and show the overwrite confirm.)
- **Dölj för alla** on a club card (admin): `clubHideConfirm` → `update {hidden: true}`; toast `adminHidden`.
- **Visa igen** in the collapsed `clubHiddenTitle` group: `update {hidden: false}`; toast `adminUnhidden`. No confirm (as bank).
- After each write: refresh the store from the response and rewrite the coach cache with visible rows only.
- Offline / network error → `clubOffline`, nothing changed. 401/403/RLS (0 rows updated, 42501) → `clubWriteFailed`. Never retry silently.
- No `.delete(` anywhere (AC grep, same as Slice 32 AC 35).

## 5. RLS expectations (Verifier re-checks with curl, publishable key only)

| Who | select | insert | update | delete |
|---|---|---|---|---|
| anon (`sb_publishable_…`) | rows with `hidden = false` | refused (401/403/42501) | 0 rows / refused | refused |
| signed-in non-admin | same as anon | refused | 0 rows | refused |
| admin (`private.is_admin()`) | all rows | ok | ok | refused (no policy, no grant) |
| service_role (`sb_secret_…`) | no grant → refused | refused | refused | refused |

`hidden = is.true` with the publishable key must return `[]`. Payload with `hallPlacements` must be refused by the check constraint even for an admin.

## 6. Tests (`node --test`, next to `bank.test.ts`)

- cache: valid round-trip; bad/partial cache ignored; tampered item dropped; quota error swallowed.
- refresh: fresh replaces; empty array clears; timeout/offline/500/bad JSON → stale, list kept; bank off → no fetch; request has `apikey` and no `Authorization`; query has `hidden=is.false`.
- publish payload: no `hallPlacements` key; `v === 1`; `own` kept; title trimmed to 80.
- apply: placements cleared; ids fresh; blocks/timings/stationEquipment equal to payload.
- overwrite lookup: case/whitespace-insensitive.
- `UI` keys exist and contain no `!`.

## 7. Bundle (README § Bundle budget)

Measure as Slice 34/35: plain `npm run build`, sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, main @ `6daaa59` = **213 915 B** total, **151 696 B** eager. Cap: total +3 072 B, eager +2 048 B. Put both numbers and the lazy chunk list in `SLICE36-SHIPPED.md` and the PR.

## 8. Open items

1. **Usage check.** Planner's draft asks for a quick Supabase Usage-page check (free plan) before start. Christoffer's call; not blocking docs.
2. **Overwrite key = name.** F1 overwrite is matched by title. Renaming in the dialog therefore publishes a new mall; the old one stays until hidden. Confirm with Planner if an "opened from club mall X" link is wanted instead (not in this pack).
3. **Own drills in payload.** A published mall carries the admin's own drills in `own`. Coaches see them in the pass only (ephemeral, as share links). OK per C1; flag if Planner wants own drills refused on publish.
4. **Hidden + same name.** Publishing a name that matches a hidden mall overwrites it and shows it again (`hidden: false`). Confirm text covers it; verify once.
5. **Max count.** No cap in SQL. Suggest the coach list shows all; if it ever passes ~20, a later slice adds grouping.
6. **String name.** The app's local action is «Spara som egen mall» (`saveAsTemplate`); decisions.md says «Spara som mall». Pack uses the shipped string; no change.
7. **Payload size.** DB caps payload at 64 kB (`pg_column_size`). A normal pass is < 5 kB; show `clubWriteFailed` if refused.

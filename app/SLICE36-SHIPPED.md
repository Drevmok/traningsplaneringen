# Slice 36 — «Föreningens mallar» — SHIPPED (local branch, not pushed, DO NOT MERGE)

**Date:** 2026-10-12 (Europe/Stockholm)
**Branch:** `slice-36-code` from `origin/slice-36-docs` @ `f297028` (main `6daaa59`). No upstream, no push, no merge.
**Self-smoke:** `verifier/slice-36-builder-smoke.mjs` → **PASS 46 / FAIL 0** at 390×844 on the local stand-in. Screenshots: `/workspace/screenshots/slice36_*.png` (15).
**SQL:** `slice-36/sql/*` was applied ONLY to the local stand-in (`verifier/slice-36-local`, PG17 on 127.0.0.1:54741). It was never run against the real project `fhzqwbdlejzohetdoluw`.

## Christoffer: live setup (before the merge)

Do this **before** this PR is merged. It is `slice-36/content/setup-christoffer.md` **Steg 13**:

1. In Supabase, open project **fhzqwbdlejzohetdoluw**, then **SQL Editor** → **New query**.
2. Paste all of **`slice-36/sql/36-01-table.sql`** → **Run**. Expect «Success. No rows returned».
3. **New query**: paste all of **`slice-36/sql/36-02-rls-grants.sql`** → **Run**. Expect «Success. No rows returned».
4. **New query**: paste **`slice-36/sql/36-03-smoke.sql`** → **Run**. Expect **8 rows, ok = true** on every row. The last check expects exactly 2 admins (you + Planner).
5. **Advisors → Security Advisor → Rerun linter**. There must be no new warnings about `club_templates`.
6. Tell Planner **«Föreningsmallar klara»**. After that the PR can be merged. No new GitHub variables or secrets are needed; the app reuses `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.

The files can be run again safely. A local re-run of 36-01 and 36-02 succeeded, and 36-03 still gave 8 × true.

If the app is deployed before the SQL runs, coaches see no club section (the GET fails, there is no cache, so the section stays hidden) and nothing breaks, but admin publishing fails with «Det gick inte att spara. …». That is why the SQL must go in first.

Optional (§8.1): glance at the Supabase **Usage** page (free plan) first. That is your call; nothing in this slice depends on it.

## What shipped
- **`lib/clubStore.ts`** (new, eager): the club-mall store.
  - Types, `toClubTemplate` (validates `pass.v === 1`, the `blocks` array, string id/title and finite minutes), the cache key `gymnastics-planner-club-templates-v1` holding `{v:1, fetchedAt, items}` (visible rows only; an empty list removes the key), and `applyClubTemplates` (drops hidden rows).
  - `useClubTemplates()`, `clubTitleKey` (`trim().toLowerCase()`, the same as the DB index `lower(btrim(title))`) and `cleanClubTitle` (trim, max 80).
- **`lib/clubTemplates.ts`** (new, eager), re-exporting the store:
  - `initClubTemplates()` runs sync before first render in `main.tsx`.
  - `refreshClubTemplates()` runs once after render: GET `…/rest/v1/club_templates?select=id,title,total_minutes,payload,updated_at&hidden=is.false&order=sort_order,title`, with the `apikey` header only and an 8 s timeout (`BANK_TIMEOUT_MS`). The result is `fresh` or `stale`. Bank off means no request and no section.
  - `clubTemplateToSession()` does the E1 apply: `shareToSession` → `duplicateSession` (fresh ids, title kept) → `clearHallPlacements`. Own drills ride in ephemerally, as share links do.
  - `clubPayload()` = `sessionToShare(clearHallPlacements(session))` minus `hallPlacements`, plus the trimmed title.
- **Coach UI:**
  - `components/ClubTemplates.tsx` (new) has `ClubTemplateCard` (`.template-card`, a «Föreningens» tag, aria «Föreningens mall {title}, {n} min», no coach actions) and `ClubTemplatesSection`, which covers the states in HANDOFF §2: none → hidden; stale with 0 items → hidden; fresh with 0 → `clubTemplatesEmpty`; stale with items → cards + `clubTemplatesStale`.
  - `LibraryPanel` renders the section first in the Mallar tab, so the order is Föreningens → Mina mallar → `savedTemplatesHint` → built-in. Home «Starta från mall» opens the same tab.
  - `SessionBuilder`: tapping a club card opens `TemplateConfirm` with a new `note` prop (`clubTemplatePlacementsNote`). On confirm it runs `adoptAsDraft(clubTemplateToSession(t))` and shows the toast `clubTemplateApplied`.
- **Admin (lazy):**
  - `lib/admin/clubWrite.ts` (new): the admin re-read includes hidden rows, and only visible rows go to the coach cache.
  - Publish: lookup by name → `insert`, or `{exists}`, which leads to the overwrite confirm. That confirm does `update … eq('id')` with `{title, total_minutes, payload, hidden:false}`. A `23505` on insert triggers a re-read and the overwrite confirm.
  - Hide and unhide are `update {hidden}`. Offline → `clubOffline`. Any refusal (error, 0 rows) → `clubWriteFailed`. Nothing is retried silently, and there is no `.delete(`.
  - `components/ClubPublishDialog.tsx` (new): «Namn på mallen», prefilled with the pass title. On a name clash the same dialog switches to the overwrite text. Errors show inline.
  - `components/ClubAdminSection.tsx` (new): cards with «Senast ändrad {datum} av {vem}» and «Dölj för alla» (aria `clubHideAria`). Hiding asks for confirmation through `AdminHideConfirm` with `clubHideConfirm`, which gains an optional `text` prop. Hidden mallar sit in a collapsed `<details>` «Dolda föreningsmallar (n)» with the «Dold» tag and «Visa igen» (aria `clubUnhideAria`, no confirm).
  - «Publicera som föreningsmall» sits in the pass actions right after «Spara som egen mall», only when `useAdmin().state === 'admin'`.
- `blockMeta.ts`: 24 new `club*` keys, verbatim, in a `// Slice 36 — club templates` group after the Slice 32 admin keys. `SLICE_NUMBER = '36'` updates the footer and the «Version: Slice 36» mail line.
- `export.css`: `.club-badge` and `.club-hidden summary` (44 px tap height).
- Tests: `lib/clubTemplates.test.ts` (new, 17 tests) covers HANDOFF §6: cache, refresh, payload, the 64 kB / minutes guard, apply, overwrite lookup and the UI keys.
- Local stand-in: `verifier/slice-36-local/` (`up.sh`, `down.sh`, `rls.sh`, `env.sh`, README), with dir `/tmp/s36` and ports 54740–54745, preview 4200.
  - Evidence: `verifier/slice-36-03-smoke-local.txt` (8 × t), `verifier/slice-36-rls-local.txt` (17/17) and `verifier/slice-36-builder-smoke-results.json`.

## §8 open items — resolutions
1. **Usage check:** Christoffer's call. It is listed as optional before Steg 13 and does not block this slice. I have no live access and did not check.
2. **Overwrite key = name:** shipped as locked (F1). The match is case- and outer-space-insensitive, the same as the DB's unique index. Renaming in the dialog publishes a new mall, and the old one stays until it is hidden. No «opened from club mall X» link was built (not in scope). An overwrite stores the name as typed, so casing can change.
3. **Own drills in the payload:** kept in `own` (C1). Coaches get them ephemerally in the applied pass, exactly like share links. Publishing does not refuse them.
4. **Hidden + same name:** publishing a hidden mall's name brings up the overwrite confirm. «Ersätt mallen» updates that row with `hidden:false`, so it shows again. Verified in the smoke (check §8.4).
5. **Max count:** no cap; the coach list shows every visible mall.
6. **String name:** the shipped «Spara som egen mall» is unchanged, and «Publicera som föreningsmall» sits next to it.
7. **Payload size:** before any request, the client refuses a payload over 65 536 bytes (UTF-8 JSON) or minutes outside 1–240, and shows `clubWriteFailed`. The DB checks stay authoritative: a 23514 also becomes `clubWriteFailed`.

## Bundle (AC25): sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, plain `npm run build`

| | main @ 6daaa59 | slice-36-code | Δ | cap |
|---|---:|---:|---:|---:|
| **Total** | 213 915 | **216 944** | **+3 029** | +3 072 ✅ |
| **Eager / coach-facing** (index js + css; jsx-runtime is now inlined into index) | 151 696 | **153 053** | **+1 357** | +2 048 ✅ |
| Lazy admin + supabase-js | 62 219 | 63 891 | +1 672 | — |

Branch chunks:
- Eager: `index.js` 138 933 and `index.css` 14 120.
- Lazy: `AdminDetailPanel` 2 771 (now also carries the club admin UI), `AdminBankForm` 1 992, `AdminLoginSheet` 1 660, `bankWrite` 1 172, `session` 1 145, `adminBank` 881, `dist` (supabase-js) 54 270.

On main, eager was `index.js` 134 462 + `index.css` 14 081 + `jsx-runtime.js` 3 153. No new dependency.

**Why the club admin UI rides in the `AdminDetailPanel` chunk:** with Vite 8 / rolldown, any new lazy entry, or any lazy code that imports `sharePass`, made the bundler pull `blockMeta`, `bank`, `seedActivities` and others out of the main chunk into a shared «preload-helper» chunk. That cost about +2.7 kB eager and +6 kB total. So:
- `clubWrite` imports only `clubStore` (no share or session code), and the open pass hands it a `ClubDraft` `{totalMinutes, payload(title)}`.
- `ClubAdminSection` and `ClubPublishDialog` are re-exported from `AdminDetailPanel.tsx` and lazy-loaded through it.

A coach visit still downloads no admin chunk (AC21, smoke).

## AC coverage
- **Pass (smoke on the local stand-in: real PostgREST + RLS + GoTrue code login):** AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9, AC10, AC11, AC12, AC14 (first load without the list; >8 s → stale after ~8.3 s), AC15, AC16 (Home «Starta från mall» and the Mallar tab), AC20, AC21, AC23, AC24, AC25, AC26.
- **Partly:**
  - AC17: no placements, fresh ids, Hallöversikt shows the stations unplaced. Golvklart and Förrådslista were not driven.
  - AC22: 390 px with no horizontal scroll, cards ≥ 44 px, 80-char title wraps, keyboard focus ring, toasts are `role=status`. Screen reader not tested.
  - AC27: built-in mall, Mina mallar save and the Tyck till line were driven. Slices 31–35 are covered by the existing unit tests; their smokes were not re-run.
- **Local only (needs Christoffer / live):**
  - AC18 and AC19: `rls.sh` 17/17 locally, covering anon, non-admin and admin, delete refused, `hallPlacements` refused (23514), service_role refused, and `updated_by` = admin e-mail.
  - AC28: 36-03 gave 8 × t locally with a second local admin added. The Security Advisor needs the live project.
  - AC2's `updated_by` on live.
- **Needs a device:** AC13 (airplane mode in an installed PWA). Locally it was simulated by failing the list GET: the cards come from the cache with the grey line, and applying works.

## Deviations / notes
- `lib/admin/bankWrite.test.ts` (Slice 32 AC35 grep): `.insert(` is now allowed exactly once, in `clubWrite.ts` (club_templates; publishing needs an insert). Still no `.upsert(`, and no `.delete(` anywhere.
- `lib/feedback.test.ts` was bumped to Slice 36.
- App keys the builder by `session.id`, so it remounts after any mall is applied. The `clubTemplateApplied` toast is carried across that remount by a module-level value in `SessionBuilder`. Toast timing moved into an effect, still 2.2 s.
- Offline «Dölj för alla» / «Visa igen» show `clubOffline` as a toast (Visa igen has no dialog). Publish shows it inline in the dialog.
- In the admin's hidden group, cards can still be tapped to apply locally. That writes nothing.
- The local stand-in adds `admin2@test.local` so the 36-03 «two admins listed» check matches live.
- The box clock reads 2026-10-12, so the «Senast ändrad 12 okt» dates in the screenshots follow it.

## Tests
- `bun test src` (app/): **161 pass, 0 fail**, including 17 new tests.
- `bun test tools/bank`: **21 pass, 5 skip, 0 fail**.
- `npm run build`: ok.
- `npm run lint` (oxlint): 0 errors; the existing warnings are unchanged.

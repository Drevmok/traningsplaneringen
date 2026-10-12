# Slice 36: formal verification report («Föreningens mallar», club templates)

- **Date:** 2026-10-12, ~15:45–16:40 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Code under test:** PR #39, branch `slice-36-code` at **`6624402`** (docs pack `f297028`, on `main` @ `6daaa59`). `git pull --ff-only` was a no-op and the working tree was clean. Not merged.
- **Pack:** `slice-36/` LOCKED 2026-10-12 (README, HANDOFF, decisions, microcopy, setup, `sql/36-01…03`, checklist AC1–28).
- **Stand-in (local only, never the live project; no live requests at all):** Builder's `verifier/slice-36-local` scripts with my own dir/ports: `S32_DIR=/tmp/s36v`, gateway 54840, PG 54841, PostgREST 54842, GoTrue 54843, SMTP 54845, preview 4290 (bank build) / 4291 (plain build) / 4292 (main plain build). Chain: `schema-31.sql` → `bank-seed.sql` → `schema-32.sql` (= setup-32/01) → users (admin, admin2, nonadmin) → `36-01` → `36-02` → `36-03`; afterwards `setup-32/07-fix-advisor.sql` and `08-lock-bot-grants.sql` were also applied (live has them; they are no-ops on top of the current schema-32) and 36-01/02 re-run. Bot key = the stand-in's service_role-equivalent key, as in Slice 32.
- **Driver:** Playwright (playwright-core) + headless Chrome at 390×844, DPR 2, touch. Browser requests to `https://bank-mock.supabase.co/**` are forwarded by Playwright routes to the local gateway (Builder's pattern; the Slice 32 `/tmp/s32v` https-proxy files no longer exist on the box). Admin login = the Slice 33 6-digit e-mail code read from the stand-in mail sink (never printed/screenshotted).
- **Scripts:** `verifier/slice-36-verify.mjs` (Verifier, **17/17 PASS**), Builder's `slice-36-builder-smoke.mjs` re-run on my stand-in (**46/46 PASS**, outputs redirected to /tmp), `verifier/slice-36-checks/http-matrix.sh` (role × table × op), `verifier/slice-36-checks/advisor-checks.sql`, plus the Supabase splinter lint SQL (github.com/supabase/splinter, `splinter.sql` main) run offline.

### Verdict: **PASS (local/headless). Ready to merge once Christoffer has pasted 36-01…03 on the live project and said «Föreningsmallar klara»** (the pack's own gate). AC13, AC22 (screen reader) and AC28 are PENDING-real; their local parts pass.

| AC | Verdict at 6624402 | Short |
| --- | --- | --- |
| 1 | **PASS** | Admin: menu shows «Spara som egen mall \| Publicera som föreningsmall». Coach: button rendered only when `admin.state === 'admin'`; coach menus in the 34/35 smokes have no Publicera |
| 2 | **PASS** | Dialog «Namn på mallen» prefilled, body verbatim; toast verbatim; row `updated_by = admin@test.local` (trigger) |
| 3 | **PASS** | Payload keys `v,notes,title,blocks,hallTemplateId`, **no `hallPlacements`** although the pass had 3 placed stations; blocks/minutes/redskap equal |
| 4 | **PASS** | «v36 testmall  »/other case → overwrite confirm; Avbryt no change; «Ersätt mallen» same id, new `updated_at`/payload, 1 row (F2) |
| 5 | **PASS** | Confirm verbatim → «Dold för alla.»; «Dolda föreningsmallar (1)», tag «Dold»; `hidden = true` |
| 6 | **PASS** | «Syns igen för alla.»; `hidden = false`; row count never dropped |
| 7 | **PASS** | Admin cards «Senast ändrad 12 okt av admin@test.local»; coach section has none of Senast ändrad/Dold/Publicera/hidden group |
| 8 | **PASS** | Offline admin: Publicera and Dölj show «Du behöver nät för att ändra föreningens mallar.», DB unchanged |
| 9 | **PASS** | Order Föreningens mallar (+hint) → Mina mallar → hint → built-in; tag «Föreningens», aria «Föreningens mall {title}, {n} min»; no coach actions on club cards |
| 10 | **PASS** | Exactly one `GET /rest/v1/club_templates?select=…&hidden=is.false&order=sort_order,title`, `apikey` only, **no Authorization**; render from cache first |
| 11 | **PASS** | Admin «Dölj för alla» via UI → coach reload: gone (twice); «Visa igen» → back; admin overwrite → coach applies the **new** blocks |
| 12 | **PASS** | All hidden → «Föreningen har inga mallar än.»; cache key removed |
| 13 | PENDING-real · local PASS | Refresh failing → cards from the device copy + «Visar sparade mallar. …»; apply works. App has **no service worker** (as on main), so an installed-PWA airplane-mode cold start needs a real device |
| 14 | **PASS** | First load, no cache, list unreachable: no section/empty text/error; > 8 s → stale line after ~8.3 s, list kept |
| 15 | **PASS** | Plain build: 0 bank requests, no club section, no stale line |
| 16 | **PASS** | Ersätta-confirm shows «Stationerna placerar du själv i Hallöversikt.»; toast verbatim; blocks/timings = payload (Home «Starta från mall» and Mallar tab) |
| 17 | **PASS** | E1: applied draft in localStorage has `hallPlacements: []`, fresh ids; Hallöversikt opens with stations unplaced, hall template unchanged |
| 18 | **PASS** | anon & non-admin: `hidden=is.true` → `[]`; INSERT 401/403, UPDATE 401 / 200 `[]` (0 rows), DELETE 401/403; admin DELETE 403. Matrix below |
| 19 | **PASS** | Admin insert with `hallPlacements` → 23514 (check constraint) |
| 20 | **PASS** | Coach edit + «Spara som egen mall» local only; DB unchanged; 0 POST/PATCH/DELETE from coach; coach-key writes from the page → 401/401/401 |
| 21 | **PASS** | Coach session downloads only `index-*.js`, no admin/supabase-js chunk; `rg "\.delete\(" app/src` (non-test) = nothing |
| 22 | PENDING-real (screen reader) · local PASS | 390 px: no h-scroll, 80-char title wraps, cards ≥ 44 px, keyboard focus ring on cards, toasts `role="status"`, hide/show buttons found by their aria labels |
| 23 | **PASS** | All 24 `club*` keys verbatim in `blockMeta.ts`, no «!» |
| 24 | **PASS** | Footer «Träningsplaneraren · Slice 36» (builder view; home hides the label by design since earlier slices); mail ends «Version: Slice 36» |
| 25 | **PASS** | Total 213 915 → 216 944 = **+3 029 B** (cap 3 072, margin 43 B); eager 151 696 → 153 053 = **+1 357 B** (cap 2 048, margin 691 B). No `package.json`/lock change |
| 26 | **PASS** | Build green; `bun test src` 161 pass / 0 fail (21 files; `clubTemplates.test.ts` 18 pass); lint exit 0, 0 errors (15 warnings, +1 new, F5) |
| 27 | **PASS** (failures = expected string changes / superseded flow) | Old smokes re-run, see table below. Bank+bankStale, admin code login/Godkänn/Dölj för alla/Visa igen (33 smoke 141 pass), Kör passet, Tyck till, Mina mallar, built-in mallar, `#dela=` all pass |
| 28 | PENDING-real · local PASS | Local 36-03: 8 × `t`. Splinter: **0 SECURITY lints**; only Performance-Advisor items (F3). Live Security Advisor screenshot must come from Christoffer |

## Findings

1. **RLS/grants match the pack exactly** (HANDOFF §5 table, 36-02 comments). `\dp public.club_templates`: `anon=r`, `authenticated=arw`, `service_role` **nothing** (has_table_privilege false for SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN). 36-02 starts with `revoke all … from anon, authenticated, service_role`, which also clears the Supabase default-privilege grants (the stand-in reproduces them with `alter default privileges … grant all`). Four policies; no DELETE/ALL policy.
2. **Bot key:** 403 (42501) on every op on `admins` (unchanged from Slice 32) and on every op on `club_templates`, including SELECT. That matches the AC/README («service_role gets nothing on this table»). Planner's phrase «anon and bot can only read» is not what the pack says: the pack (36-02 header, HANDOFF §5) gives the bot no read; anon reads visible rows only.
3. **The 3 pastes:** `36-01-table.sql` **2 955 B**, `36-02-rls-grants.sql` **2 213 B**, `36-03-smoke.sql` **1 645 B**, all far under 16 384 B. Idempotency: (a) fresh pre-36 DB once; (b) fresh DB with each file run twice (01,01,02,02,03,03); (c) 01,02,01,02; (d) the stand-in DB that already had them, run twice more. 0 errors (only NOTICE «already exists, skipping»); `pg_dump --schema-only -n public -n private` and the `club_templates` grant list are **byte-identical** across (a)–(d). 36-03 = 8 × t on each.
4. **Advisor risk (offline):** the pastes create no functions. No SECURITY DEFINER function in `public`; every function in public/private has a fixed `search_path`; all public tables have RLS; no views; no non-trigger public function executable by anon/authenticated. The triggers reuse `public.touch_row()` (invoker, `search_path=''`) and `private.stamp_updated_by()` (definer, in non-exposed `private`, EXECUTE revoked). Splinter before vs after 36: Security lints 0 → 0. New Performance items: WARN `multiple_permissive_policies` (club_templates, authenticated, SELECT: read_public + admin_read_all; the same pattern already exists on `exercises`) and INFO `unused_index` (`club_templates_visible_idx`, just created).
5. **Slice 32 checks re-run:** `check-advisor.ts` all OK (incl. 05-rls-smoke 23 PASS/0 FAIL). `check-grants.ts`: 05-rls-smoke **23 PASS (10 bot) / 0 FAIL**, all bot HTTP denials OK, service_role grants exactly exercises S/I/U + redskap S. Its 2 FAILs are the hard-coded «exactly 1 admin» assertion; the Slice 36 stand-in adds `admin2@test.local` on purpose so 36-03's «two admins listed» matches live. Not a regression.
6. **E1 verified end to end:** admin draft had 3 hall placements → stored payload has no `hallPlacements` key → coach applies → localStorage draft `hallPlacements: []` → Hallöversikt shows stations unplaced. `hallTemplateId` rides along (hall choice, not geometry, as HANDOFF §1 says).
7. **F1 verified:** coaches have no edit affordance (club section buttons are the cards only) and any coach-key write is refused (401). «Dölj för alla» is **admin-global** (row `hidden = true`, kept), not a coach-local hide; it persists across coach reloads; the only way back is admin «Visa igen» (no coach-side un-hide exists, by design). Overwrite by name works and reaches coaches after reload.
8. **Bundle** reproduced byte-for-byte with Builder (plain `npm run build`, `gzip -9c` over `dist/assets/*.js`+`*.css`; main built in worktree `/tmp/s36v-main`). Eager definition per README = index js + index css + jsx-runtime; on the branch jsx-runtime is inlined into index (main: 134 462 + 14 081 + 3 153; branch: 138 933 + 14 120). Margin on the total is only 43 B.
9. **Secrets:** `git grep` of the tree at 6624402, `.github/`, `app/dist` and both stand-in dists: 0 `sb_secret_…`, 0 JWTs, 0 stand-in bot keys. Screenshots checked: no code/token visible.

## RLS / grants matrix (local stand-in, HTTP status)

| Role | club_templates SELECT (visible / hidden=is.true) | INSERT | UPDATE | DELETE | admins S / I / U / D |
| --- | --- | --- | --- | --- | --- |
| anon (publishable) | 200 visible only / 200 `[]` | 401 42501 | 401 42501 | 401 42501 | 401 / 401 / 401 / 401 |
| non-admin (signed in) | 200 visible only / 200 `[]` | 403 42501 (RLS) | 200 `[]` (0 rows) | 403 42501 | 200 `[]` / 403 / 403 / 403 |
| admin | 200 all / 200 hidden row | 201 | 200 (row) | **403** 42501 | 200 own row / 403 / 403 / 403 |
| bot (service_role) | 403 / 403 | 403 | 403 | 403 | 403 / 403 / 403 / 403 |

Grants (`\dp`): `postgres=arwdDxtm`, `anon=r`, `authenticated=arw`; service_role none (incl. TRUNCATE, MAINTAIN). Builder's `rls.sh` on my stand-in: 17 ok / 0 failed.

## AC27: earlier smokes against the 6624402 build

| Script | Result | Failures explained |
| --- | --- | --- |
| slice-36-builder-smoke.mjs | 46 / 0 | — |
| slice-35-verify.mjs | 37 / 10 | 9 = «Slice 35» footer/version/SLICE_NUMBER strings now 36 (expected); `E` = ERR_FAILED from the script's own offline reload + bank route abort (same as the Slice 35 report; now 3 instead of 2 because the club GET is aborted too) |
| slice-35-builder-smoke.mjs | 33 / 8 | All 8 = «Slice 35» label/version/SLICE_NUMBER (expected) |
| slice-34-verify.mjs | 31 / 1 | Footer «Slice 34» vs 36 (expected) |
| slice-34-builder-smoke.mjs | 29 / 2 | Footer «Slice 34» string + footerSliceLabel verbatim (expected) |
| slice-33-builder-smoke.mjs | 141 / 5 | 3 × footer «Slice 33», 1 × `footerSliceLabel` verbatim (expected); AC21c «only the two Slice 31 GETs» now sees the third GET `club_templates` = Slice 36 D1 by design |
| slice-32-builder-smoke.mjs | 26 / 17 | 2 × footer «Slice 32»; AC26b third GET (by design); 14 = the magic-link flow («Skicka länk») replaced by the 6-digit code in Slice 33, and its admin phases cascade (superseded; the 33 smoke covers admin login/Godkänn/Dölj/Visa igen with 141 PASS) |

No regression found.

## Concerns

- **C1 (gate):** the live SQL is not pasted yet (per Builder notes). Do not merge before «Föreningsmallar klara». If deployed first, coaches see no club section (harmless) but admin publish fails.
- **C2:** bundle total margin is 43 B; any follow-up fix should re-measure.
- **C3:** Performance Advisor will show one new WARN (`multiple_permissive_policies` on club_templates) and one INFO (unused index). Not Security, so AC28 holds, but Christoffer may see them in «Advisors». Same pattern as `exercises` today.
- **C4:** overwrite stores the name as typed (casing can change, e.g. «V36 TESTMALL»); documented by Builder (§8.2).
- **C5:** +1 lint warning (`ClubTemplates.tsx:26` only-export-components). Cosmetic.
- **C6:** no service worker, so AC13's «installed PWA in airplane mode» relies on the browser cache; verify on a real device.
- **C7:** `check-grants.ts` and the Slice 32/33-35 smokes hard-code older slice numbers/admin count; consider refreshing them so AC27 re-runs are green-by-default.

## Screenshots (`verifier/slice-36-screenshots/`)

s36v_01_admin_publish_dialog, 02_admin_mallar_cards, 03_coach_foreningens_mallar, 04_coach_apply_confirm, 05_coach_hall_unplaced, 06_admin_overwrite_confirm, 07_admin_hide_confirm, 08_admin_hidden_group, 09_coach_after_hide, 10_dela_link.

## Ready to merge?

**Yes, after the live SQL gate** (Christoffer pastes 36-01…03, 36-03 = 8 × true, Security Advisor clean, «Föreningsmallar klara»). Code, RLS design, bundle and regressions are clean locally. Not merged by Verifier.

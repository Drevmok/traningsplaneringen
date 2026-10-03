# Slice 32: Verifier evidence (code, stand-in, bot script, UI target)

**PR #34** · branch `slice-32-admin` @ `7db7cd2` · run 2026-10-03, 08:31–08:50 (Europe/Stockholm) · authority: `slice-31/verification-checklist.md` AC 23–50, `decisions.md` (A1 B2 C1 D1 E1 F1), `screen-spec.md`, `content/`.
**What I did not change:** no app code was modified, and nothing was committed, pushed or merged. The temporary worktree for 80b22aa has been removed again.
**Secrets:** none appear in this file. The bot key, user JWTs, DB passwords and login links are **redacted**. The only key shown is the stand-in publishable key `sb_publishable_local_s32`, which is public by design. User access tokens were minted with GoTrue's admin `generate_link` + `verify`, written to files with mode 600, used, and then deleted. Their values were never printed.
**Real project** `fhzqwbdlejzohetdoluw` was not touched. It doesn't have schema-32 yet, so every real-project part below is **PENDING-real**.

Verdict key: **PASS** · **FAIL** · **PENDING-real** (needs the real project) · **NEEDS-UI** (needs the human/browser drive; the code was reviewed).

## Per-AC verdicts

| AC | Verdict | Evidence (short) |
|---|---|---|
| 23 | **PASS** (stand-in) · PENDING-real | `schema-32.sql` ran 2× more after setup.sh's run, exit 0 both times (only "already exists, skipping" NOTICEs). `rls-smoke.sql` **full** passed: 13 × PASS, exit 0, rolled back (`tech-rls-smoke` count afterwards = 0). The HTTP matrix below confirms it over the wire |
| 24 | **PASS** (stand-in) · NEEDS-UI · PENDING-real | `POST /auth/v1/otp` for `unknown@test.local` with `create_user:false` → 422 `otp_disabled`. `classifySendError` (`session.ts:105-111`) maps that to `sent`, so the same `adminLinkSent` shows. `auth.users` stayed at 2 and no mail arrived. `shouldCreateUser:false` is at `session.ts:121` |
| 25 | **PASS** (stand-in, headless) · NEEDS-UI · PENDING-real | The mail link is `https://127.0.0.1:54443/auth/v1/verify?token=pkce_…` (PKCE). After the return, `?code=` is gone and the URL is `/traningsplaneringen/`. With `?code=…#dela=…` the hash is **kept** and the shared pass opens. Logga ut removes `gymnastics-planner-admin-auth-v1` (+ `-code-verifier`). Code: `client.ts:20-28` (`flowType:'pkce'`, `detectSessionInUrl:false`, `storageKey`), `authReturn.ts:8,33-42` (strips only code/error params; hash kept unless it is an auth-error hash), `session.ts:73` (replaceState before the exchange), `:80` (exchangeCodeForSession), `:141-142` (Logga ut). The reload-keeps-session check is for the human drive |
| 26 | **PASS** | Headless coach visit on 4177 (bank on) and on 4173 loaded JS `index` + `jsx-runtime` **only**. The bank calls were `GET exercises` + `GET redskap`, `apikey` yes, `Authorization` no. No admin DOM. Footer: `Träningsplaneraren · Slice 32 · Logga in som admin · …`. Chunk graph: `index.html` preloads only `jsx-runtime`. `dist-DvjAMUvs.js` (214 183 B, supabase-js) is reached only through `import(\`./dist-…\`)` inside the lazy `adminBank` chunk (client.ts was inlined there). That chunk is reached from `main.tsx:24` (`shouldStartAdmin()` = bank on **and** (`?code=` / auth error / stored session), `state.ts:61-65`), the lazy AdminLoginSheet (footer click), Logga ut, and the admin-only panels |
| 27 | **PASS** (stand-in) · PENDING-real | Headless: the non-admin round trip shows the footer `Du är inloggad men inte admin. · Logga ut`, with 0 admin UI elements. HTTP with the non-admin token: PATCH → 200 with **0 rows**, DB unchanged. INSERT → 403. Self-insert into `admins` → 403 |
| 28 | **PASS** (stand-in) · NEEDS-UI · PENDING-real | A 2nd OTP for the same address within 60 s → 429 `over_email_send_rate_limit` → `wait` → `adminWait` (`session.ts:108`). The 60 s limit is enforced by the server only (GoTrue `SMTP_MAX_FREQUENCY=60s`); there is no client timer. Used or expired link: `?error_code=` or a failed exchange → `linkFailed` → the sheet opens with `adminLinkFailed` (`session.ts:74-81`, `App.tsx` `showLogin`). See concern C3 |
| 29 | NEEDS-UI | Code: chips only when count > 0 (`LibraryPanel.tsx:142-165`). Pending/hidden only under their chip (`:81-91`). Not addable (`SessionBuilder.tsx:121-126,190,567`). Expected counts: Väntar på godkännande (2), Behöver granskas (16), no Dolda chip |
| 30 | NEEDS-UI | `approveRow` = status `published` (`bankWrite.ts`) |
| 31 | NEEDS-UI | `BankPatch` (`bankWrite.ts:15-26`) holds only title/block/minutes/summary/how_to/watch_for/safety/redskap/source/experienced. Tags, difficulty, links, visual, sort and status are never sent. Validation is `ownActivityIssues` (same as the own form) |
| 32 | **PASS** (server) · NEEDS-UI (detail line) | HTTP admin PATCH with `updated_by:"spoof@evil.example"` → stored `admin@test.local`. Admin INSERT spoof → `admin@test.local`. `updated_at` is bumped by the schema-31 trigger. Line: `adminFormat.ts:25-33` |
| 33 | NEEDS-UI | `saveRow` adds `needs_coach_review:false` (`bankWrite.ts:61`), `markRowReviewed` (`:59`). Badges only when `isAdmin` (`LibraryPanel.adminBadgesFor`) |
| 34 | NEEDS-UI | Hide = `status:'hidden'`. Hidden rows stay resolvable: the coach store keeps published+hidden in `byId` (`bank.ts:216-224`, `findBankActivity` `:249`). `getActivityById` = own → bank → bundled (`seedActivities.ts:1146`). `adminHideUsedIn` comes from `idsUsedByMallsOrWizard()` (`AdminHideConfirm.tsx:13,26`) |
| 35 | **PASS** | `grep -rn "\.delete(\|DELETE" app/src` → only `mem.delete(key)` in 6 *test* storage mocks. No delete control in AdminDetailPanel. Over HTTP, DELETE was refused for every role (table below) |
| 36 | **PASS** (literal, stand-in) · **DEFECT** · NEEDS-UI | Guarded UPDATE `.eq('updated_at', entry.updatedAt)` → 0 rows → `conflict` (`bankWrite.ts:44,48`). Headless: an outside change, then Spara → `adminSaveConflict`, DB unchanged. **But** the advice in the copy ("Stäng och öppna den igen") does **not** work: close + reopen + Spara → conflict again, because nothing reloads the admin bank after a conflict. Only a page reload fixes it (C1) |
| 37 | NEEDS-UI | `writeRow` returns `offline` before any request (`bankWrite.ts:35`). Buttons are disabled and `adminOffline` shows (`AdminDetailPanel.tsx:26,56`; `AdminBankForm.tsx:216,221`). Nothing is queued (no retry store) |
| 38 | **PASS** (code + coach cache) · NEEDS-UI | `applyBankEntries` filters to published+hidden before `writeCache` (`bank.ts:218-223`). `readCache` re-guards with `rowToEntry` without `allowPending` (`bank.ts:84-110`). Headless coach cache: 51 rows, no `tech-test-*` |
| 39 | **PASS** (code) · NEEDS-UI | Admin requests: `/auth/v1/otp`, `/token`, `GET admins`, `GET/PATCH exercises` with `BankPatch` columns only. No own/pass/mall data is ever passed to the client |
| 40 | **FAIL** (spec deviation; no leak) · PENDING-real | The checklist and `bot-writes.md` want `~/.config/traningsplaneraren/bank-bot.env` with mode 600. The script reads **only** env var `SUPABASE_PLANNER_BOT_KEY` (`promote-lib.ts:9,74-86`). `git grep sb_secret_` is **not empty**, but every hit is docs or SQL comments; there are no key values. The local bot key value is in 0 repo files. `.github` uses `vars.*` only. Needs Christoffer to accept the env-var location (or a fix) |
| 41 | **PASS** (stand-in) · NEEDS-UI · PENDING-real | 2 rows `pending`, `needs_coach_review=t`, `updated_by=bot:planner`, sort 370/380. Anon `[]`, admin sees both |
| 42 | **FAIL** (partial: env-file checks not implemented) | Existing id → `FINNS REDAN — hoppas över` + reported. `--replace` overwrites the text and keeps status `pending`. A publishable key (env var) is refused, also with `--dry-run`. The key was never printed (0 occurrences across 7 outputs). An env file with mode 644 **or** a publishable key **in the env file**: the file is ignored → "Ingen nyckel" (no mode/publishable check exists for a file) |
| 43 | **PASS** (stand-in) · PENDING-real | Bot key DELETE on `exercises` → 403 `permission denied`, row kept. **See C2**: the bot key **can** POST/PATCH/DELETE `public.admins` and PATCH `public.redskap` |
| 44 | **PASS** (stand-in) · PENDING-real | Wrong key → «Nyckeln fungerar inte längre … (HTTP 401)», exit 1. Key removed from the gateway list (= revoked) → same message, exit 1. `export-db.ts` → «Nyckeln fungerar inte längre», exit 1. Anon GET stays 200 (app unaffected) |
| 45 | **FAIL** (partial; Builder deviation) | `export-db.ts` against the stand-in → `/tmp/s32-bot-lx5w/bank-snapshot.json`: 51 published, 0 hidden, 15 redskap, pending excluded. Ids and fields are identical to `tools/bank/out/bank-seed.json` (0 diffs; adds status/updated_*). `seed-promotion.md` has the superseded banner. **But** the snapshot isn't bundled (no `app/src/data/bankSnapshot.json`, no reference in src), so the "app offline-first shows all published rows **from it**" part isn't met. The offline fallback is still the bundled seeds |
| 46 | **PASS with note** | `grep -rn "sb_secret_\|service_role" app/dist app/src` → **1 hit**: `app/dist/assets/dist-DvjAMUvs.js:11`, which is supabase-js's own prefix check `e.startsWith(\`sb_secret_\`)`, not a key. `app/src` → none, eager `index-*.js` → none, `service_role` in dist → 0. `sb_secret_[A-Za-z0-9]{4,}` across app/src, app/dist, tools, .github, verifier, slice-31 → 0. JWT-shaped strings → 0. Only `sb_publishable_*` via build env |
| 47 | PENDING-real | Security Advisor and the `private` schema not exposed |
| 48 | NEEDS-UI (partly evidenced) | Headless: 4173 no bank request. 4177: 2 GETs with `apikey` only, 51 cached. Unit tests are green (114/0). Slice 31 smoke steps 3–5 are for the human drive |
| 49 | **PASS** | Eager gz: plain build `index` 135.35 + `jsx-runtime` 3.12 = **138.47** vs Slice 31 (80b22aa) 134.59 → **+3.88 kB**. With vars: 135.50 + 3.12 = 138.62 vs 134.73 → **+3.89 kB** (< 5). supabase-js is lazy: `dist` 214.18 kB raw / 55.01 kB gz |
| 50 | **PASS** | `blockMeta.ts:475` `footerSliceLabel` + `App.tsx:325-357`. Headless 4177 builder view: `Träningsplaneraren · Slice 32 · Logga in som admin · Visa tips igen · Uppdatera appen`. 4173: `Träningsplaneraren · Slice 32 · Visa tips igen · Uppdatera appen` |

Microcopy: all **46** admin keys in `microcopy.sv.md` (Slice 32) match `blockMeta.ts` byte for byte, including `adminLinkSent`, `adminLinkFailed` and `adminWait`.

## A. HTTP matrix (stand-in gateway :54340, real GoTrue tokens)

| Request | anon (publishable) | non-admin token | admin token | bot (secret) key |
|---|---|---|---|---|
| GET exercises | 200 · 51 | 200 · 51 | 200 · 52 (incl. pending) | 200 · 53 |
| GET status=pending | 200 · 0 | 200 · 0 | 200 · 1 | 200 · 2 |
| PATCH pending row (+ `updated_by` spoof) | 401 denied | 200 · **0 rows**, DB unchanged | 200 · 1 · stored `admin@test.local` | 200 · 1 · stored **spoof value** (by design: the trigger keeps the bot's value) |
| PATCH published `tech-kullerbytta` | 401 | 200 · 0 rows | 200 · 1 | 200 · 1 |
| POST exercise | 401 | 403 RLS | 201 · `updated_by=admin@test.local` | 201 |
| DELETE exercise | 401 | 403 | **403** | **403 permission denied** (AC 43) |
| GET admins | 401 | 200 · 0 | 200 · 1 (self) | 200 · 1 |
| POST / PATCH / DELETE admins | 401 / 401 / 401 | 403 / 403 / 403 | 403 / 403 / 403 | **201 / 200 / 200** (C2) |
| PATCH redskap | 401 | 403 | 403 | **200** (C2) |

Afterwards I restored the stand-in as the owner (admins = admin@test.local owner; test rows removed; `tech-kullerbytta.updated_by` = seed-script).

## B. Bot script `tools/bank/push-promote.ts` (temp HOME `/tmp/s32-bot-lx5w`; fixture `tools/bank/fixtures/promote-2.json`, `check_import.py` → PASS)

| Check | Result |
|---|---|
| `--dry-run`, no key, no URL | exit 0, "2 nya … Inget skrevs.", DB 51→51, **0** gateway requests |
| Publishable key (env var) | refused: «…är den publika nyckeln (sb_publishable_…)…», exit 1 (also with --dry-run) |
| Env file `bank-bot.env` mode 644 (valid key) | **not read**: «Ingen nyckel: miljövariabeln SUPABASE_PLANNER_BOT_KEY är inte satt», exit 1 |
| Env file with publishable key, mode 600 | **not read** (same message) |
| Push | `tech-test-formhopp-over-lagt-block`, `tech-test-aggrullning-kil` → pending / t / bot:planner. Anon `[]` |
| Re-push | both «FINNS REDAN — hoppas över», listed under «Hoppades över», exit 0 |
| `--replace tech-test-aggrullning-kil` | text replaced, status stays `pending`. Original text restored afterwards |
| Wrong key / revoked key | «Nyckeln fungerar inte längre (borttagen eller fel)… (HTTP 401)», exit 1 |
| Key in output | 0 occurrences in all captured outputs |
| Delete code | `grep -in delete` in push-promote.ts, promote-lib.ts, export-db.ts → only the doc comment `push-promote.ts:14` |
| `bun test tools/bank` (offline) | 19 pass / 5 skip / 0 fail |

## C. Concerns

- **C1 (defect, AC 36):** after `adminSaveConflict`, the admin bank isn't reloaded (`bankWrite.ts:48` returns without `loadAdminBank()`). Following the on-screen advice "Stäng och öppna den igen" conflicts again every time; only a page reload recovers. I reproduced this headless (1st save conflict → reopen → conflict → reload → saved). Fix suggestion: call `loadAdminBank()` on conflict.
- **C2 (security, E1 scope):** `schema-32.sql` grants the bot only select/insert/update on `exercises`, but leaves `service_role` with Supabase's default ALL on `public.admins` and `public.redskap`. With the bot key, anyone on the box can add any auth user as admin, delete admins, or edit redskap labels. The stand-in's `roles.sql` mirrors Supabase's default privileges, so expect the same on the real project; this needs a re-check there. Builder flagged it as an "accepted trade-off". Suggestion: `revoke all on public.admins from service_role; revoke insert, update, delete on public.redskap from service_role;`, then Christoffer decides.
- **C3 (low):** account guessing through the throttle. Within 60 s of a send, a 2nd request for a **known** address shows `adminWait` (429), while an unknown one shows `adminLinkSent` (422 → sent).
- **C4 (deviations needing Christoffer):** the key lives in an env var rather than `bank-bot.env` + mode check (AC 40/42), and the snapshot isn't bundled (AC 45).
- **C5 (cosmetic):** a re-push with everything skipped still ends with «Väntar på godkännande i appen…». "All-or-nothing" is pre-validation only, so a network error mid-batch can leave a partial insert.
- **C6 (tooling):** `setup.sh` runs `stop.sh` if a stale `/tmp/s32/pids` exists, and that kills old PID numbers (they could have been reused). Also, `features/delad-bank.md` (named in the checklist) doesn't exist yet in the skill.

## E. UI drive target (running)

| What | URL / value |
|---|---|
| Plain build (vars unset) | http://127.0.0.1:4173/traningsplaneringen/ (`/tmp/s32v/dist-plain`) |
| Stand-in build | http://127.0.0.1:4177/traningsplaneringen/ (`/tmp/s32v/dist-standin`, `VITE_SUPABASE_URL=https://127.0.0.1:54443`, key `sb_publishable_local_s32`) |
| HTTPS | **Yes.** `bankConfig.ts:36` accepts https only, so a self-signed proxy runs at `https://127.0.0.1:54443` → gateway :54340. **Accept the cert first:** open https://127.0.0.1:54443/rest/v1/ → Advanced → Proceed. The JSON "No API key found" is expected. Without this the app shows the stale line and login fails |
| E-mails | admin `admin@test.local` · non-admin `nonadmin@test.local` · unknown `unknown@test.local` (no user; gets no mail) |
| Magic link | terminal: `bash /tmp/s32v/lastlink.sh admin@test.local` prints the latest /verify link. Open it **in the same browser** you sent from. Raw mails: `ls -t /tmp/s32/mail/`. One-time links: never paste them into a report |
| ?code= + #dela= test | after sending a link: `bash /tmp/s32v/codeurl.sh admin@test.local /tmp/s32v/share-A.url` → open the printed URL in the same browser |
| Throttle | 60 s per address (GoTrue) |
| Logs | proxy `/tmp/s32v/https-proxy.log` (method, path, status, apikey/authorization yes/no) · gateway `/tmp/s32/gateway.log.jsonl` |
| Stop | `bash /tmp/s32v/stop.sh` (proxy + previews + Builder's stop.sh) |

Stand-in changes: `/tmp/s32/gotrue.env` now has `API_EXTERNAL_URL=https://127.0.0.1:54443/auth/v1`, with site URL and allow list for 4177 (4174 kept). The original is in `gotrue.env.builder-orig`.

**State now:** 51 published (16 need review) + **2 pending** (`tech-test-formhopp-over-lagt-block` «Test: formhopp över lågt block», `tech-test-aggrullning-kil` «Test: äggrullning nerför kil»), 0 hidden.

**SQL / curl one-liners** (no password; local trust):

```bash
Q() { psql -h 127.0.0.1 -p 54341 -U postgres -d bank -c "$1"; }
Q "select id,status,needs_coach_review,updated_by,updated_at from public.exercises where id in ('tech-test-formhopp-over-lagt-block','tech-test-aggrullning-kil','tech-ljushopp-satsbrada','strength-cirkeltraning')"
Q "select status, count(*), count(*) filter (where needs_coach_review) as review from public.exercises group by 1"
Q "update public.exercises set status='hidden' where id='tech-kullerbytta'"      # hide (owner; bumps updated_at, keeps updated_by)
Q "update public.exercises set status='pending' where id='tech-kullerbytta'"     # make pending
Q "update public.exercises set status='published' where id='tech-kullerbytta'"   # revert
Q "update public.exercises set title=title where id='strength-cirkeltraning'"    # simulate 'someone else changed it' (AC 36)
Q "update public.exercises set needs_coach_review=true where id='strength-cirkeltraning'"  # re-flag for review
curl -sk 'https://127.0.0.1:54443/rest/v1/exercises?select=id,status&status=neq.published' -H 'apikey: sb_publishable_local_s32'   # anon: pending never, hidden yes
```

DevTools console (cache check, AC 38):
`JSON.parse(localStorage['gymnastics-planner-bank-cache-v1']).exercises.filter(e=>e.id.startsWith('tech-test-')).map(e=>e.id)`

**#dela= links** (from the app's `encodeShare`, decoded back to check them):
- A (mall drill `tech-ljushopp-satsbrada` «Ljushopp på satsbräda» + `tech-kullerbytta`), file `/tmp/s32v/share-A.url`:
  http://127.0.0.1:4177/traningsplaneringen/#dela=z.jZHBSsQwFEV_pbyVQgPtFEfozqULwYW4kWF4bZ5NbJp2kpdKHea3_AF_TDodcUaqzq6B3ntyT7bQQ57GwJoNQQ6P2SKSZJCjDr2PbqKLBo0RH--91ba6hBhsy-QhB4hBoTEP1HQGmW4l5OAZrUQnBbvQdYc_7g2W1JBlD_nTKobCtGU9fm-Bh26EVsiKnLYVxCCDQ9atvdM27EHLGDRTMwX0SBmPgoqs3qi3QTTBJ5uhGGlYsu41D_u7TKXCouvRtXPN2TRm2tI6SQ7yZBcfU6RqnL5eqv8oEiuyXjDVVtfnstLdaqQdJLyia0I3l02TbwXHCaZSWb0J5OdSi6PU1yTRZwuR_Nww9gjzErxqu054ZF84lPjLY_ylbN-fzvbXwRhyxcB8dvGpH8-ObMVq1tDVvKHnYNdo5brCZl7SqdrV7hM
- B (bank-only drill `tech-test-formhopp-over-lagt-block`; use **after** Godkänn + Dölj), file `/tmp/s32v/share-B.url`:
  http://127.0.0.1:4177/traningsplaneringen/#dela=z.jZFNasMwEEavEmbVggWxQ0LxsrsuCl2UbkoIk2hiq5ZHijR2CSHX6gV6sWI7pUlxf3YS6Jun780BWsjTBMSIJcjhaZZNNFmUiccYJ7eTqzVypd7fWjZcXEMC7IQi5AAJlGjtI9XeotCdhhyiIGsMWklovD-9eLC4oZpYIuTPywTW1m2q7nwA2fsOWqCUFAwXkIBuAopxfG-46UGLBIxQPQRMR-muaiEvc_YLVnUTp7v9OkICuBHTGtn3fxmGKsbQYnBjk2dDmaGLC5oC5NNjck7RnGX-pmr_omgsiKMSqthU_2Wlx2VHO0l4xVA3fiybTr8UnCeENiWbXUNxLJWdpT4rqXaWqen3Dt0cJRRFbV2oS-e9ci0FZbEQ1W_rh738Zq9HpaOoqrGWwnovgv8dfKkqSiAupByVNR-XtW14haxXBdbjvi4tL48f

## Tester steps (UI drive)

0. Accept the cert at https://127.0.0.1:54443/rest/v1/. Use a fresh Chrome profile or incognito for the coach checks.
1. **AC 26/50/48 (coach):** on 4177, open DevTools → Network (JS + Fetch/XHR) → Tomt pass. Expect only `index-*.js` + `jsx-runtime-*.js`, two GETs (exercises, redskap) with `apikey` and no `Authorization`, and the footer `Träningsplaneraren · Slice 32 · Logga in som admin`. On 4173: no bank request and no link.
2. **AC 24:** Logga in som admin → `unknown@test.local` → `adminLinkSent`. `lastlink.sh unknown@test.local` → "no mail". `Q "select count(*) from auth.users"` → 2.
3. **AC 27:** `nonadmin@test.local` → open the link from `lastlink.sh` → footer `Du är inloggad men inte admin. · Logga ut`, no admin UI → Logga ut.
4. **AC 25:** open share-A in this browser, then Logga in som admin → `admin@test.local` → send. Now either (a) open the `lastlink.sh` link (plain round trip), or (b) run `codeurl.sh admin@test.local /tmp/s32v/share-A.url` and open the printed URL. Expect: logged in (`Admin · Logga ut`), no `?code=` in the address bar, `#dela=` still there (b), and the shared pass offered. Reload → still admin. (Logga ut check at the end.)
5. **AC 28:** within 60 s, send again for admin → `adminWait`. Re-open an already used link → the sheet opens with `adminLinkFailed`.
6. **AC 29/41:** Biblioteket → `Admin` chip, `Väntar på godkännande (2)`, `Behöver granskas (16)`, no Dolda chip. The pending rows show only under their chip, with the `Väntar` badge. Their detail has no "Lägg till i valt block".
7. **AC 30:** Godkänn «Test: formhopp över lågt block» → toast. Then in another (coach) profile on 4177, reload → it's listed. Cache check (AC 38): the approved id is there, `tech-test-aggrullning-kil` is not.
8. **AC 31–33:** Ändra i banken on «Test: äggrullning nerför kil» → change Namn/Minuter/Säkerhet/Källa → Spara i banken. Then run `Q "select title,duration_minutes_default,safety_line,source,tags,difficulty,progression_of,visual_key,sort_order,status,needs_coach_review,updated_by,updated_at from public.exercises where id='tech-test-aggrullning-kil'"`. Expect: tags/difficulty/links/visual/sort unchanged, status still `pending`, `needs_coach_review=f`, `updated_by=admin@test.local`. The detail shows `Senast ändrad 3 okt av admin@test.local`. Also try Markera som granskad on a `Behöver granskas` row (count 16→15). A coach profile shows no review badges on bank rows.
9. **AC 34:** in admin mode, Dölj för alla on «Ljushopp på satsbräda» → the confirm shows the `adminHideUsedIn` line → Dölj. In a coach profile, reload → gone from Biblioteket and search, but share-A still shows its title. Also Dölj the approved «Test: formhopp över lågt block» and open share-B in a **brand-new** profile: the title should still show, not a raw id. Then Dolda chip → Visa igen for both.
10. **AC 36 (two tabs):** as admin, open the same exercise (e.g. «Cirkelträning (par, stationer)») in two tabs. Tab 1: Ändra i banken → change Varför → Spara (toast). Tab 2: Ändra i banken → Spara → `adminSaveConflict`. Check in SQL that tab 1's text is intact. Then in tab 2 close and reopen the exercise and Spara again. **Known defect C1:** expect the conflict again; it only works after a page reload. Alternative trigger without tab 1: `Q "update public.exercises set title=title where id='strength-cirkeltraning'"`.
11. **AC 37 (offline):** admin detail open → DevTools → Network → Offline. Expect `Du behöver nät för att ändra i banken.` and all admin buttons (and Spara i banken in the form) disabled. Back online: nothing was sent (proxy log shows no PATCH), DB unchanged.
12. **AC 39:** while admin, run `grep -E "PATCH|POST" /tmp/s32v/https-proxy.log`. Expect only `/auth/v1/otp`, `/auth/v1/token`, `/rest/v1/exercises`. Create an own exercise/pass while logged in → no request.
13. **AC 25 end:** Logga ut → DevTools → Application → Local Storage: `gymnastics-planner-admin-auth-v1` is gone. The footer is back to `Logga in som admin`.
14. Afterwards, revert as needed: `Q "update public.exercises set status='published' where status='hidden'"`.

## 45ec68f re-check (isolated stand-in /tmp/s32vv)

Date: 2026-10-03, 09:01–09:05 CEST. Repo at `45ec68f` (`git rev-parse --short HEAD`). No tracked file was touched. I needed this because Builder's 08:59–09:00 rerun of `verifier/slice-32-local/*` wiped `/tmp/s32` mid-drive. Builder's stack is currently stopped (54340–54345 free, `/tmp/s32/pids` empty). This copy shares no directory, port or pid file with it.

### Stand-in

| Piece | Isolated copy |
|---|---|
| Scripts | `/tmp/s32vv-tools/` = copies of `verifier/slice-32-local/*`, patched to `D=/tmp/s32vv`, `REPO=/workspace/gymnastics-planner`, `HERE=/tmp/s32vv-tools`, ports 55340 gateway · 55341 PG17 · 55342 PostgREST · 55343 GoTrue · 55345 SMTP (env.json, gotrue.env, postgrest.conf, start.sh health checks, users.sh, check-advisor.ts, smtp-catcher default, mail dir `/tmp/s32vv/mail`). `grep -E '/tmp/s32([^v]\|$)\|5434[0-5]'` on the copies → 0 hits. Added `pending.sh` (push-promote of `fixtures/promote-2.json` with the copied bot key) and `all.sh` (setup → start → users → pending) |
| GoTrue | `API_EXTERNAL_URL=https://127.0.0.1:54443/auth/v1` · `SITE_URL=http://127.0.0.1:4177/traningsplaneringen/` · allow list 4177 `/` + `/**` (4174 kept, mirroring Builder's) · sign-ups off · 60 s per address · link expiry 1 h |
| Schema | `schema-31.sql` → `bank-seed.sql` → `schema-32.sql` (`cmp` identical to `tools/bank/out/setup-32/01-schema-32.sql`) |
| Rows | **51 published (16 `needs_coach_review`) + 2 pending** (`tech-test-formhopp-over-lagt-block`, `tech-test-aggrullning-kil`, both `bot:planner`, review=t) · 15 redskap · users admin@test.local + nonadmin@test.local · admins = admin@test.local (owner) |
| HTTPS proxy | `/tmp/s32v/https-proxy.mjs` (`.bak` = old 54340 version) is restarted with **target 55340**. Same port 54443, same cert, same log. New pid in `/tmp/s32v/pids` |
| Previews | 4173 (dist-plain) and 4177 (dist-standin) were still running (200), so I didn't restart them. **No rebuild:** dist-standin bakes `https://127.0.0.1:54443` + `sb_publishable_local_s32`, which is a fixed string in setup.sh, so it still matches |
| Helpers | `/tmp/s32v/lastlink.sh` and `codeurl.sh` now read `/tmp/s32vv/mail` (`.bak` kept). `/tmp/s32v/stop.sh` (`.bak` kept) kills `/tmp/s32v/pids` and then runs `/tmp/s32vv-tools/stop.sh` (its own pid file + `pg_ctl -D /tmp/s32vv/pg`). It no longer calls Builder's stop.sh |
| Rebuild from scratch | `bash /tmp/s32vv-tools/all.sh` (it wipes only `/tmp/s32vv`) |

SQL helper for the tester steps above (they say 54341; use 55341 now): `Q() { psql -h 127.0.0.1 -p 55341 -U postgres -d bank -c "$1"; }`. Gateway log: `/tmp/s32vv/gateway.log.jsonl`. Raw mails: `ls -t /tmp/s32vv/mail/`.

### Advisor 0028/0029 + RLS (isolated `bank`)

| Check | Result |
|---|---|
| `bun /tmp/s32vv-tools/check-advisor.ts` (port-adapted copy) | **16/16 OK**: function only in `private`; trigger `exercises_stamp` → `private.stamp_updated_by`; SECURITY DEFINER; `has_function_privilege(anon/authenticated/service_role, execute)` = f; proacl `{postgres=X/postgres}`; rpc `stamp_updated_by` / `private.stamp_updated_by` as anon, nonadmin and admin → 404 PGRST202 each; sanity admin GET 200; **admin PATCH with `updated_by:'spoof'` → stored `admin@test.local`**; bot push → both rows `bot:planner` · pending; 05-rls-smoke 13 PASS / 0 FAIL |
| Direct SQL | `private.stamp_updated_by` count 1 · `public.stamp_updated_by` count 0 · no PUBLIC grantee in `aclexplode(proacl)` · execute false for anon, authenticated, service_role and authenticator · triggers on exercises: `exercises_redskap_check→check_exercise_redskap()`, `exercises_stamp→private.stamp_updated_by()`, `exercises_touch→touch_row()` |
| `slice-31/content/rls-smoke.sql` full (`cmp` = `05-rls-smoke-valfri.sql`) | exit 0, **13 PASS, 0 FAIL** (rolls back) |
| anon `POST https://127.0.0.1:54443/rest/v1/rpc/stamp_updated_by` | **404** PGRST202 (also `rpc/is_admin` → 404) |
| Note | `authenticated` has USAGE on `private` and EXECUTE on `private.is_admin()`. That is by design (the RLS policies need it), and `private` isn't in PostgREST `db-schemas` |

The admin PATCH changed `fun-123-forflyttning.updated_by`. I restored it afterwards (`seed-script` and the original `updated_at`).

### 07-fix-advisor.sql on an old-01 database (`bank_old`, same PG, dropped afterwards)

Setup: per-DB part of `roles.sql` (roles are cluster-wide and already existed) → GoTrue `migrate` against bank_old → schema-31 → seed → `git show 7db7cd2:tools/bank/out/setup-32/01-schema-32.sql`.

| Step | Result |
|---|---|
| Before 07 (old 01) | `public.stamp_updated_by`, acl `{=X/postgres,postgres=X/postgres,anon=X/…,authenticated=X/…,service_role=X/…}`, anon/authenticated execute = **t** (what the lint flags). Trigger → `stamp_updated_by()` (public) |
| 07 run #1 | exit 0, check row `private · stamp_updated_by · exercises_stamp`. End state is the same as the fresh DB: only `private`, acl `{postgres=X/postgres}`, no PUBLIC, execute f/f/f, secdef t, trigger → `private.stamp_updated_by()`. Admin UPDATE with `updated_by='spoof'` (JWT claims, rolled back) → `admin@test.local` |
| 07 run #2 | exit 0. Identical end state, spoof still overwritten. **Safe to run twice** |
| Old 01 re-run on the fixed DB (both copies exist), then 07 | exit 0. Back to only `private`, same end state, spoof overwritten |
| 07 on the new-01 `bank` | exit 0, no change (acl `{postgres=X/postgres}`) |
| Cleanup | `drop database bank_old` → databases now: postgres, bank |

### C2 re-check on 45ec68f: still open

45ec68f changes only the stamp function. The grant lines in `schema-32.sql` are the same as in 7db7cd2 (`grant select on public.redskap to service_role` does not revoke the default ALL).

```
public.admins    postgres=arwdDxtm/postgres  service_role=arwdDxtm/postgres  authenticated=r/postgres          policies: admins_read_self (r, authenticated)
public.redskap   postgres=arwdDxtm/postgres  service_role=arwdDxtm/postgres  anon=r/postgres  authenticated=r/postgres   policies: redskap_read_all (r)
public.exercises postgres=arwdDxtm/postgres  service_role=arwDxtm/postgres   anon=r/postgres  authenticated=arw/postgres
```

Tested with the copied bot key against gateway 55340 (no Origin):

| Request | Status |
|---|---|
| POST admins (nonadmin@test.local) | **201**, row added |
| PATCH admins note | **204**, changed |
| DELETE admins (nonadmin) | **204** |
| DELETE admins (the owner admin@test.local) | **204**, admins list **empty** |
| PATCH redskap `eq-bom` label | **204**, label changed |
| POST / DELETE redskap `eq-c2` | **201 / 204** (INSERT and DELETE too, not just UPDATE) |
| Control: DELETE exercises | 403 42501 (as intended) |
| Control: publishable PATCH redskap | 401 (PostgREST 42501 for anon) |

Restored as owner (`copy` from a backup, then `session_replication_role=replica` for `updated_at`): admins and `eq-bom` are byte-identical to the backup, redskap 15, exercises 51+2. **C2 stands:** the bot key can rewrite the admin list (including removing the owner) and fully edit redskap. The suggested fix is unchanged: `revoke all on public.admins from service_role; revoke insert, update, delete, truncate on public.redskap from service_role;`.

### Smoke via https://127.0.0.1:54443

| Check | Result |
|---|---|
| anon GET exercises | **51** rows, all `published` (no pending) |
| anon GET redskap / admins | 15 / 401 permission denied |
| CORS preflight from Origin 4177 | 204 |
| POST /auth/v1/otp admin@test.local (`redirect_to` 4177, Origin 4177) | 200 |
| `bash /tmp/s32v/lastlink.sh admin@test.local` | mail **found** (subject "Your sign-in link"). The /verify link is on host `127.0.0.1:54443`, type magiclink, redirect_to `http://127.0.0.1:4177/traningsplaneringen/`. Link not reproduced here |
| Verify (curl, no PKCE, consumed on purpose) | 303 → `http://127.0.0.1:4177/traningsplaneringen/` (allow list accepted, no error). Afterwards the mail file was deleted (`/tmp/s32vv/mail` empty) |

Throttle note: the smoke OTP went out at 09:03:42. The UI drive's own admin@test.local request works from 09:04:42 on (60 s per address).

---

## cb8e0e6 re-verify (isolated stand-in `/tmp/s32vr`, 2026-10-03 09:46–10:05 CEST)

### Build, tests, bundle, secrets
- `git rev-parse HEAD origin/slice-32-admin` → both `cb8e0e6`; tree clean; `git pull --ff-only` → "Already up to date". `app/package*.json` unchanged since 45ec68f, so `npm ci` was skipped.
- `npm run build` exit 0. Plain build eager gz: `index-b5gEXs-M.js` **135.36** + `jsx-runtime-DLNB9Qsn.js` **3.12** = **138.48 kB** (45ec68f: 138.47; Slice 31 plain: 134.59 → **+3.89**). Stand-in build (vars set): 135.47 + 3.12 = 138.59 (Slice 31 with vars: 134.73 → +3.86). `dist-DvjAMUvs.js` (supabase-js) 55.01 kB gz.
- `bun test src` → **115 pass / 0 fail**, 17 files (was 114; +1 C1 test).
- AC 26: `index.html` loads `index-*.js` + modulepreload `jsx-runtime` only. `index-*.js` static imports: only `./jsx-runtime`. `dist-DvjAMUvs.js` is referenced only by `adminBank-*.js` as `await import('./dist-DvjAMUvs.js')`; `adminBank` itself is reached only via `__vite__mapDeps` (lazy).
- AC 46: `git grep -l sb_secret_` → docs/SQL comments only (14 files; same set + the verifier docs); `git grep -E 'sb_secret_[A-Za-z0-9_-]{8,}'` → 0; JWT-shaped strings in repo → 0; `app/dist`: `sb_secret_|service_role` → only `dist-*.js` (supabase-js prefix guard), `sb_secret_[A-Za-z0-9]{4,}` → 0, JWT → 0; `app/src` → 0; `.github/workflows/pages.yml` uses `vars.VITE_SUPABASE_URL` / `vars.VITE_SUPABASE_PUBLISHABLE_KEY` only. Real bot key value (compared via env, not printed): 0 tracked files, 0 in `app/dist`, 0 in `.github`.
- AC 50: `grep -o 'Slice 3[0-9]' dist/assets/index-*.js` → `Slice 32` ×1; UI footer "Träningsplaneraren · Slice 32 · Logga in som admin · Visa tips igen · Uppdatera appen".

### C6 stand-in (Builder's scripts, own dir + ports)
```
export S32_DIR=/tmp/s32vr S32_GATEWAY_PORT=56440 S32_PG_PORT=56441 S32_POSTGREST_PORT=56442 S32_GOTRUE_PORT=56443 S32_SMTP_PORT=56445 S32_PREVIEW_PORT=4187
setup.sh  → setup ok (/tmp/s32vr, pg :56441, schema-32: slice-31/content/schema-32.sql): 51 published, 15 redskap
start.sh  → started (/tmp/s32vr, gateway :56440)
users.sh  → users: admin@test.local, nonadmin@test.local · admins: admin@test.local
push-promote.ts fixtures/promote-2.json (stand-in bot key) → 2 × NY (pending); DB: pending | t | bot:planner ×2
```
- T1: `setup.sh` with `S32_DIR=/tmp/s32vr3` and gateway port 56440 (held by `/tmp/s32vr`) → "port 56440 is in use by pid … — not from /tmp/s32vr3; pick other S32_*_PORT values", exit 1, `/tmp/s32vr3/marker` still there (nothing deleted).
- T2: second instance `/tmp/s32vr2` (56450–56455) set up and started (4 pids).
- T3: appended `/tmp/s32vr`'s 4 pids to `/tmp/s32vr2/pids`, then `stop.sh` with `S32_DIR=/tmp/s32vr2` → `skip pid … (gone or not from /tmp/s32vr2)` ×4, "stopped (/tmp/s32vr2)". After: all 4 `/tmp/s32vr` pids alive, `/tmp/s32vr` PG answers, `/tmp/s32vr2` PG refused, 0 listeners on 5645x. `/tmp/s32vr2` removed.

### C2 grants (stand-in, PostgreSQL 17.11)
- `slice-31/content/rls-smoke.sql` == `05-rls-smoke-valfri.sql` (whitespace-normalised diff empty); `schema-32.sql` == `01-schema-32.sql` (byte-identical).
- Full `rls-smoke.sql`: exit 0, **23 PASS / 0 FAIL** (13 + 10 `PASS bot …`: reads, INSERT+UPDATE `bot:planner`, DELETE exercises refused, SELECT/INSERT/UPDATE/DELETE admins refused, INSERT/UPDATE/DELETE redskap refused).
- `\dp public.(admins|redskap|exercises)`:
```
admins    | postgres=arwdDxtm/postgres, authenticated=r/postgres
exercises | postgres=arwdDxtm/postgres, anon=r/postgres, authenticated=arw/postgres, service_role=arw/postgres
redskap   | postgres=arwdDxtm/postgres, anon=r/postgres, authenticated=r/postgres, service_role=r/postgres
```
- `has_table_privilege('service_role', …)` MAINTAIN/TRUNCATE/REFERENCES/TRIGGER → `f` on all three. `information_schema.role_table_grants` (service_role) → `exercises:INSERT exercises:SELECT exercises:UPDATE redskap:SELECT`.
- Bot HTTP matrix (`/tmp/s32vr/tools/bot-http.ts`, stand-in bot key via gateway → service_role):
```
OK   bot GET    /rest/v1/admins    → 403 42501 permission denied
OK   bot POST   /rest/v1/admins    → 403
OK   bot PATCH  /rest/v1/admins    → 403
OK   bot DELETE /rest/v1/admins    → 403
OK   bot POST   /rest/v1/redskap   → 403
OK   bot PATCH  /rest/v1/redskap   → 403
OK   bot DELETE /rest/v1/redskap   → 403
OK   bot DELETE /rest/v1/exercises (tech-kullerbytta, tech-test-aggrullning-kil) → 403 ×2
OK   bot GET redskap → 200 · bot GET exercises → 200
OK   admins count + redskap rows unchanged; exercise rows kept
OK   bot POST exercises (tech-verifier-bot-raw) → 201 · PATCH → 200
OK   DB row: Verifier: rå bot-rad (ändrad) | pending | true | bot:planner · anon sees [] (row deleted after)
OK   service_role TRUNCATE exercises → ERROR: permission denied for table exercises
OK   service_role ANALYZE exercises/redskap/admins (MAINTAIN) → WARNING: permission denied to analyze "…", skipping it
RESULT: all OK
```
- Builder's `check-grants.ts` (S32_DIR=/tmp/s32vr): 18 OK, "RESULT: all OK" (incl. `--replace` PATCH keeps `bot:planner · pending`, re-push C5 line, 05 23 PASS / 10 bot).
- Re-runs on `bank`: `schema-32.sql` again → only "skipping" notices, exit 0; `08` after the current 01 → `admins (none) · exercises INSERT, SELECT, UPDATE · redskap SELECT · maintain false ×3`, fingerprint unchanged.

### 08 on an old-01 database (`bank_old`, same PG, dropped afterwards)
- Built: `auth` schema dumped from `bank` (users included) + the Supabase-style default privileges → `schema-31.sql` → `bank-seed.sql` → **`45ec68f:tools/bank/out/setup-32/01-schema-32.sql`** → admin row.
- Before 08 (service_role via `aclexplode`): `admins: DELETE,INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE` · `exercises: INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE` · `redskap: DELETE,INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE` (= C2 reproduced).
- `07` not needed first: the 45ec68f 01 already has `private.stamp_updated_by`.
- `08` run 1 → check `admins|(none)|false`, `exercises|INSERT, SELECT, UPDATE|false`, `redskap|SELECT|false`. Fingerprint (relacl of the 3 tables, service_role privileges incl. MAINTAIN, policies, `is_admin`/`stamp_updated_by` schema + secdef + proacl, triggers, RLS flags) **identical** to the fresh `bank`.
- `08` run 2 → same check, exit 0, fingerprint identical. `07` after → "private|stamp_updated_by|exercises_stamp", fingerprint identical.
- `05` on `bank_old` after 08 → 13 PASS + 10 PASS bot, 0 FAIL, exit 0. `drop database bank_old` → `pg_database` count 0.

### Advisor fix (0028/0029)
- `check-advisor.ts` already reads `S32_DIR` (no adaptation needed): `S32_DIR=/tmp/s32vr bun verifier/slice-32-local/check-advisor.ts` → 16 OK, "RESULT: all OK" (function only in `private`, trigger → `private.stamp_updated_by`, SECURITY DEFINER, no EXECUTE for anon/authenticated/service_role, `proacl={postgres=X/postgres}`, 6× rpc → 404 PGRST202, admin PATCH spoof → `admin@test.local`, bot push `bot:planner`, 05 23/0).

### C5 push-promote (stand-in, gateway 56440)
```
# all rows exist, bot key
tech-test-formhopp-over-lagt-block  FINNS REDAN — hoppas över  «Test: formhopp över lågt block»  techniques · 6 min · sort 390
tech-test-aggrullning-kil  FINNS REDAN — hoppas över  «Test: äggrullning nerför kil»  techniques · 6 min · sort 400
Hoppades över (fanns redan): tech-test-formhopp-over-lagt-block, tech-test-aggrullning-kil
Inget nytt: alla övningar i filen fanns redan i banken. Inget skrevs.          (exit 0)
# dry run, no key
(torrkörning utan SUPABASE_PLANNER_BOT_KEY: jämför mot appens inbyggda bank, inte databasen)
… 2 × NY (pending)
Torrkörning: 2 nya, 0 ersätts, 0 hoppas över. Inget skrevs.                    (exit 0)
# one new row (promote-2 + tech-verifier-c5-ny), bot key
… 2 × FINNS REDAN, tech-verifier-c5-ny  NY (pending)
Nya (pending): tech-verifier-c5-ny
Hoppades över (fanns redan): tech-test-formhopp-over-lagt-block, tech-test-aggrullning-kil
Väntar på godkännande i appen (Logga in som admin → Biblioteket → Väntar på godkännande).   (exit 0)
```
DB: `tech-verifier-c5-ny | pending | t | bot:planner` (deleted afterwards). The key value appears in 0 of the three outputs.

### C1 + regression (Playwright headless Chrome, 390×844, `ignoreHTTPSErrors`)
- Target: `vite preview` 4187 serving `/tmp/s32vr/dist-standin` (cb8e0e6, `VITE_SUPABASE_URL=https://127.0.0.1:56444`); HTTPS proxy 56444 → gateway 56440 (copy of `/tmp/s32v/https-proxy.mjs`, cert `/tmp/s32v/tls-*.pem`). GoTrue site URL / allow list = `http://127.0.0.1:4187/traningsplaneringen/` (from `S32_PREVIEW_PORT`). Scripts: `/tmp/s32vr/tools/{lib,c1,regress,regress2,footshots}.mjs` (box only; print no link/token).
- Mail links name `https://bank-mock.supabase.co/auth/v1/verify` (Builder's `API_EXTERNAL_URL`, unresolvable here); the scripts open the same path + query on `https://127.0.0.1:56444`.
- **C1** (`c1.mjs`): footer after login "Admin · Logga ut · Uppdatera appen"; form open → external `update … set title=title` (updated_at bumped) → Varför + " [V1]" → Spara → form stays, alert "Någon annan har ändrat övningen. Stäng och öppna den igen.", DB has no [V1]. Avbryt → close → reopen: form Varför = original (fresh row) → " [V2]" → Spara → form closed, toast "Sparat i banken.", DB `<orig> [V2] · admin@test.local`, page navigations since opening = 0. Restored `summary` + `updated_by='seed-script'` by SQL (the script's UI restore step hit a still-open detail; not a product issue).
- **Regression** (`regress.mjs`, `regress2.mjs`, `footshots.mjs`):
```
coach JS chunks ["index","jsx"]
coach API requests ["GET /rest/v1/exercises apikey=yes auth=no","GET /rest/v1/redskap apikey=yes auth=no"]
coach footer "Träningsplaneraren · Slice 32 · Logga in som admin · Visa tips igen · Uppdatera appen"
coach admin DOM 0 · coach Biblioteket entries 51 · coach cache {"n":51,"testIds":[]}
unknown: sheet "Om adressen hör till en admin kommer en länk strax. Öppna den i den här webbläsaren. Den gäller i en timme." · mail sent false · auth.users 2
nonadmin url has ?code= false · footer "Träningsplaneraren · Slice 32 · Du är inloggad men inte admin. · Logga ut · Visa tips igen · Uppdatera appen" · admin UI 0
admin (share-A): verify → redirect has ?code= true · return url ?code= false · #dela= kept true · footer "Admin · Logga ut · Uppdatera appen" · pass A offered true
after reload: footer "Admin · Logga ut · Uppdatera appen" · session key true
admin chips "Admin Väntar på godkännande (2) Behöver granskas (16)"
approve toast "Godkänd. Tränarna ser den nästa gång de öppnar appen." · status published
coach after approve: Biblioteket 52 · cache {"n":52,"testIds":["tech-test-formhopp-over-lagt-block"]}
edit (äggrullning Minuter 6→7): toast "Sparat i banken." · DB "7 · admin@test.local · pending · review=false" · "Senast ändrad 3 okt av admin@test.local"
hide confirm "Dölja ”Test: formhopp över lågt block” för alla tränare? Pass som redan har övningen visar den fortfarande. Avbryt Dölj" · toast "Dold för alla." · status hidden
share-B fresh context: pass B offered true · title shown true · raw id shown false
chips with hidden "Admin Väntar på godkännande (1) Behöver granskas (16) Dolda (1)" · Visa igen toast "Syns igen för alla." · status published
offline (setOffline): text visible true · Ändra i banken disabled, Dölj för alla disabled · online → both enabled · writes during offline 0
Logga ut (Home footer): auth keys before = session + 2 PKCE verifier keys; after [] · remaining ["gymnastics-planner-bank-cache-v1"] · footer "Logga in som admin · Uppdatera appen"
coach share-A fresh: pass A offered true · «Ljushopp på satsbräda» shown true
```
- Proxy log (no key values), app non-GET calls over the whole run: `POST /auth/v1/otp` 200 ×10 / 422 ×3 (unknown) / 429 ×2 (throttle on re-runs = `adminWait`), `POST /auth/v1/token` 200 ×9, `POST /auth/v1/logout` 204 ×1, `PATCH /rest/v1/exercises` 200 ×6 (conflict try, reopen save, approve, edit, hide, unhide). Nothing else.
- Note (minor, no action needed): after a successful exchange, supabase-js leaves its own `…-flow-<id>-code-verifier` / `…-flows-code-verifier` keys until Logga ut, which removes them.

# Slice 32: formal verification report (admin login + bank editing, bot writes)

## Re-verify at cb8e0e6

- **Date:** 2026-10-03, 09:46–10:05 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Code under test:** PR #34, branch `slice-32-admin` at **`cb8e0e6`** (on top of `a709489`). The previous FAIL was at `45ec68f` (report commit `30674d0`). The working tree was clean and already at `origin/slice-32-admin` = `cb8e0e6`, so `git pull --ff-only` was a no-op. Not merged.
- **What changed since 30674d0:** `bankWrite.ts` + `adminBank.ts` (`refreshAdminRow`) + `AdminDetailPanel.tsx` (C1); `schema-32.sql` = `01` (`revoke all on public.admins, public.redskap, public.exercises from service_role` + the exact grants) and the new `08-lock-bot-grants.sql` (C2); `rls-smoke.sql` = `05` Part 3 (10 bot checks); `push-promote.ts` `NOTHING_NEW` (C5); `verifier/slice-32-local/*` (`env.sh`, S32_* dir/ports, `S32_OWNER` marker) (C6); checklist notes AC 40/42/45; `backlog/IMPROVEMENTS.md`; `features/README.md`.
- **Stand-in:** Builder's own scripts in `verifier/slice-32-local/` with `S32_DIR=/tmp/s32vr`, gateway 56440, PG 56441, PostgREST 56442, GoTrue 56443, SMTP 56445, preview 4187. Applied: `schema-31.sql` → `bank-seed.sql` → `schema-32.sql` from `cb8e0e6`, users `admin@test.local` (on `public.admins`) + `nonadmin@test.local`, the 2 pending rows via `push-promote.ts` (`tech-test-formhopp-over-lagt-block`, `tech-test-aggrullning-kil`). UI: own stand-in build from `cb8e0e6` (`VITE_SUPABASE_URL=https://127.0.0.1:56444`, key `sb_publishable_local_s32`) served with `vite preview` on 4187, behind a copy of `/tmp/s32v/https-proxy.mjs` on `https://127.0.0.1:56444` → 56440 (same self-signed cert). Builder's default `/tmp/s32` stack wasn't running and was not touched.
- **Driver:** Playwright headless Chrome, 390×844, `ignoreHTTPSErrors`. The mail links name GoTrue's `API_EXTERNAL_URL` (`https://bank-mock.supabase.co`, from Builder's `setup.sh`), which doesn't resolve here, so the scripts open the same `/auth/v1/verify?…` path and query on the stand-in's HTTPS proxy (same GoTrue, same one-time PKCE token).
- **Live:** read-only on `fhzqwbdlejzohetdoluw`: GETs plus bot PATCH/DELETE whose filter matches no row. No POST with the bot key.
- **Secrets:** no secret key, JWT, magic link, code or password appears in this report, the evidence or the screenshots. The staged files were grepped before commit, including an env-based compare against the real bot key value.

### Verdict: **PASS (stand-in + live read-only) — ready to merge; magic-link round trip and a real bot insert pending after merge**

- **C1 resolved** · **C2 resolved** (stand-in, old-01 → 08 patch, and live read-only: bot refused on `admins`, refused on `redskap` writes) · **C5 resolved** · **C6 resolved**.
- **AC 40 / 42 / 45:** PASS-by-decision. The checklist notes and `IMPROVEMENTS.md` match (quoted below).
- **PENDING-real** (after merge, with Christoffer): the live magic-link round trip (AC 25), a real bot insert (AC 41), the Security Advisor re-run (AC 47), and the optional live `05` run in the SQL Editor, whose `08` check output shows `maintain = false`. MAINTAIN and TRUNCATE are not visible over REST, so the live checks can't prove them. The stand-in proves them, and so do the 08 file and its check query.

| AC | Verdict at cb8e0e6 | Short |
| --- | --- | --- |
| 23 | **PASS** (stand-in) · PENDING-real | `schema-32` fresh + re-run clean (only "skipping" notices); `rls-smoke.sql` full **23 PASS / 0 FAIL** (13 + 10 bot); old-01 → `08` = fresh end state, `08` ×2 safe |
| 24 | **PASS** (stand-in) · PENDING-real | unknown → `adminLinkSent`, no mail, `auth.users` 2 |
| 25 | **PASS** (stand-in) · **PENDING-real** | share-A login: no `?code=`, `#dela=` kept, pass A offered, reload → still admin; Logga ut clears key |
| 26 | **PASS** | coach: only `index` + `jsx-runtime`; 2 GETs `apikey=yes auth=no`; supabase-js `dist-*.js` only via `import()` in lazy `adminBank` |
| 27 | **PASS** (stand-in) | "Träningsplaneraren · Slice 32 · Du är inloggad men inte admin. · Logga ut …", 0 admin UI |
| 28 | **PASS** (stand-in) | `adminWait` seen again (2× GoTrue 429 during re-runs); `adminLinkFailed` carried from 45ec68f (session code unchanged) |
| 29 | **PASS** | chips "Väntar på godkännande (2)", "Behöver granskas (16)"; "Dolda (1)" after a hide |
| 30 | **PASS** | Godkänn → toast; fresh coach: Biblioteket 52 |
| 31 | **PASS** | Minuter 6 → 7 and Varför saved ("Sparat i banken.") |
| 32 | **PASS** | `updated_by = admin@test.local`, "Senast ändrad 3 okt av admin@test.local"; REST spoof overwritten |
| 33 | **PASS** | save → `needs_coach_review = false`; Markera som granskad carried |
| 34 | **PASS** | confirm text, "Dold för alla.", share-B (fresh) shows the title (not the id), Visa igen → "Syns igen för alla." |
| 35 | **PASS** | DELETE refused for the bot (stand-in 403, live 403); no delete in the app code (unit test) |
| 36 | **PASS — C1 resolved** | conflict text, then close + reopen (no reload) → "Sparat i banken.", DB updated, 0 page navigations |
| 37 | **PASS** | `setOffline`: offline text, Ändra i banken + Dölj för alla disabled, 0 writes; re-enabled online |
| 38 | **PASS** | coach cache 52 ids, only the approved `tech-test-formhopp-over-lagt-block`, no pending id |
| 39 | **PASS** | app non-GETs on the proxy: only `/auth/v1/otp|token|logout` + 6 `PATCH /rest/v1/exercises` (the admin actions) |
| 40 | **PASS-by-decision** | env var `SUPABASE_PLANNER_BOT_KEY` via secure input, no env file (quoted below); key value in 0 repo/dist/.github files |
| 41 | **PASS** (stand-in) · **PENDING-real** | bot push → `pending`, review `t`, `bot:planner`; anon `[]`; Väntar (2) |
| 42 | **PASS-by-decision** | skip/`--replace`/no print OK; env-file checks n/a by decision (quoted below) |
| 43 | **PASS** (stand-in + live read-only) | bot DELETE `exercises` → 403 on both |
| 44 | **PASS** (stand-in, carried) · PENDING-real | `promote-lib.ts`/`export-db.ts` unchanged since 45ec68f |
| 45 | **PASS-by-decision** (partial accepted) | export + banner; snapshot not bundled; backlog Parked / Later (quoted below) |
| 46 | **PASS with note** | only supabase-js's own `sb_secret_` prefix check in the lazy chunk; 0 key values |
| 47 | **PASS** (stand-in + live parts) · **PENDING-real** | `check-advisor.ts` 16/16; live `rpc/stamp_updated_by` 404; Advisor re-run = Christoffer |
| 48 | **PASS** | re-driven: step 2 (coach 2 GETs, `apikey` only, 51) and step 5's share part (hidden drill's title still resolves in share-B); steps 3/4/5-list carried from 45ec68f (`bank.ts` unchanged since) |
| 49 | **PASS** | eager gz **138.48 kB** (+3.89 vs Slice 31 134.59; +0.01 vs 138.47); build green; `bun test src` **115 / 0** |
| 50 | **PASS** | "Träningsplaneraren · Slice 32 · Logga in som admin" |

### Concern results

| # | Result | Evidence |
| --- | --- | --- |
| **C1** | **Resolved** | Form open → SQL `update public.exercises set title=title where id='strength-cirkeltraning'` → change Varför → Spara: "Någon annan har ändrat övningen. Stäng och öppna den igen." and the DB doesn't get the edit. Avbryt → close → reopen (no reload): the form shows the fresh row; edit Varför → Spara: "Sparat i banken.", the form closes, DB `summary = <orig> [V2]`, `updated_by = admin@test.local`, 0 page navigations (`s32v_F_conflict.png`, `s32v_F_reopen_saved.png`). The original text was restored by SQL afterwards. |
| **C2** | **Resolved** (stand-in + live read-only) | `\dp`: `admins` has no `service_role` entry; `exercises` `service_role=arw`; `redskap` `service_role=r`. MAINTAIN/TRUNCATE/REFERENCES/TRIGGER false on all three (PG 17.11). Bot HTTP on the stand-in: admins GET/POST/PATCH/DELETE → 403; redskap POST/PATCH/DELETE → 403, GET 200; exercises DELETE → 403; exercises POST 201 + PATCH 200 → `pending · true · bot:planner`, anon `[]`; `TRUNCATE` → permission denied; `ANALYZE` (MAINTAIN) → "permission denied … skipping" on all three. `bank_old` (old 01 from 45ec68f → service_role had ALL incl. MAINTAIN on admins/redskap) → `08` → fingerprint **identical** to the fresh DB; `08` twice → identical; `07` after → identical; `05` on it 23/0. `bank_old` dropped. Builder's `check-grants.ts` 18/18. **Live:** bot GET/PATCH/DELETE `admins` → 403, PATCH/DELETE `redskap` → 403, DELETE `exercises` → 403, GET redskap/exercises 200 → live 08 (or the new 01) is applied (10:00:30 CEST). |
| **C5** | **Resolved** | All-existing input with key → "Hoppades över (fanns redan): …" + «Inget nytt: alla övningar i filen fanns redan i banken. Inget skrevs.», no «Väntar på godkännande». Dry run without key → "Torrkörning: 2 nya, 0 ersätts, 0 hoppas över. Inget skrevs." (compares to the built-in bank, as it says). One new row with key → "Nya (pending): tech-verifier-c5-ny" + «Väntar på godkännande i appen …». |
| **C6** | **Resolved** | Ran fully on `S32_DIR=/tmp/s32vr` + 5644x ports. `setup.sh` for another dir on a port held by `/tmp/s32vr` → refused, exit 1, the other dir not deleted. A second instance `/tmp/s32vr2` (5645x) started; `/tmp/s32vr`'s 4 pids were planted into its pid file; `stop.sh` with `S32_DIR=/tmp/s32vr2` → "skip pid … (not from /tmp/s32vr2)" ×4, stopped only its own processes + its PG; all `/tmp/s32vr` processes and PG stayed alive. |
| C3 | Unchanged (low) | Known-address 429 vs unknown "sent" still differs (accepted earlier as low). |

### AC 40 / 42 / 45 decisions (quoted)

- `slice-31/verification-checklist.md` AC 40: «**Accepted deviation (Christoffer 2026-10-03):** there is no env file; the key comes only from the box environment variable `SUPABASE_PLANNER_BOT_KEY`, set through the box's secure input. The file/mode-600 part is not checked; the rest still applies». The rest holds: `git grep` finds no key value (only docs mention the `sb_secret_` prefix); the live key value is in 0 tracked files, 0 in `app/dist`, 0 in `.github` (env compare); `.github` uses `vars.*` only.
- AC 42: «**Accepted deviation (Christoffer 2026-10-03):** no env file, so the env-file checks (publishable key in the file, mode 644) don't apply. A publishable key in `SUPABASE_PLANNER_BOT_KEY` is refused; the rest still applies». The rest holds: skip + report (C5 run), `--replace` (`check-grants.ts`), the key is never printed (0 hits in the outputs), and the publishable-key refusal is unchanged code since 45ec68f.
- AC 45: «**Accepted as partial (Christoffer 2026-10-03):** export + banner stay as they are; the snapshot is not bundled, so the offline fallback stays the bundled seeds. Backlog: «Bundle latest DB snapshot into app offline fallback» (Parked / Later)». `backlog/IMPROVEMENTS.md` has the matching row: «Bundle latest DB snapshot into app offline fallback | **Parked / Later** (Christoffer 2026-10-03). Slice 32 AC 45 accepted as partial …». `app/SLICE32-SHIPPED.md` "Deviations" says the same.

### Live read-only (2026-10-03 10:00:30 CEST)

| Check | Result |
| --- | --- |
| bot GET `admins` | **403** 42501 (refused) |
| bot PATCH `admins?user_id=eq.<zero uuid>` `{"note":"x"}` | **403** (admins has no `id` column, so `?id=eq.verifier-nonexistent-row` gives 400 42703 and doesn't test the grant) |
| bot DELETE `admins?user_id=eq.<zero uuid>` | **403** |
| bot PATCH / DELETE `redskap?id=eq.verifier-nonexistent-row` | **403** / **403** |
| bot GET `redskap` / `exercises` | 200 (15) / 200 (51) |
| bot DELETE `exercises?id=eq.verifier-nonexistent-row` | **403** |
| anon `exercises` published / pending+hidden | 51 / 0 |
| anon `admins` | 401 |
| anon `rpc/stamp_updated_by` | 404 PGRST202 |

No retry was needed: live 08 is applied.

### Screenshots (new, `verifier/slice-32-screenshots/`)

`s32v_F_conflict.png`, `s32v_F_reopen_saved.png` (C1); `s32v_F_coach_footer.png`, `s32v_F_unknown.png`, `s32v_F_nonadmin.png`, `s32v_F_admin_shareA.png`, `s32v_F_admin_chips.png`, `s32v_F_shareB_hidden.png`, `s32v_F_offline.png`, `s32v_F_loggedout.png`, `s32v_F_coach_shareA.png`. None shows a link, token or key.

### Remaining for Christoffer / after merge

1. Live magic-link round trip with your mailbox (AC 25), then the PENDING-real items in AC 23/24/41/44.
2. A real bot insert after merge (AC 41) when Planner has a real `promote.json`.
3. Security Advisor re-run (AC 47). Optional: `05-rls-smoke-valfri.sql` in the SQL Editor (all lines PASS, incl. `PASS bot …`), and the `08` check query (`maintain` = false).

---

# Previous report: FAIL at 45ec68f (commit 30674d0), kept for reference


- **Date:** 2026-10-03, 08:31–09:45 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Authority:** `slice-31/verification-checklist.md` AC 23–50 (each AC graded against its own "Pass if" text), plus the locks A1 B2 C1 D1 E1 F1 in `slice-31/decisions.md`, `slice-31/screen-spec.md` and `slice-31/content/`
- **Code under test:** PR #34, branch `slice-32-admin`. Verified at `7db7cd2`, then re-checked at `45ec68f`. `45ec68f` only fixes the Security Advisor finding (`stamp_updated_by` moved to `private`, no EXECUTE, new `07-fix-advisor.sql`). `git diff 7db7cd2 45ec68f -- app/` touches only `app/SLICE32-SHIPPED.md`, so the app code and the bundle are unchanged. Not merged; nothing pushed to main.
- **Skill:** `verify-traningsplaneraren/` (Launch → Doctor → Drive → Evidence). New feature map entry: `verify-traningsplaneraren/features/delad-bank.md`.
- **Build and tests:** `npm run build` green (7db7cd2; no app change since). `bun test src` re-run on `45ec68f`: **114 pass / 0 fail** across 17 files (unchanged).
- **Viewport:** 390×844 (Chrome DevTools Responsive, and Playwright headless for AC 37).
- **Drive targets** (`vite preview`):

| Port | Build | Bank |
| --- | --- | --- |
| 4173 | vars unset | off |
| 4177 | vars set | **local stand-in**: Postgres 17 + PostgREST + GoTrue (sign-ups off, 60 s per address, PKCE) over the real `schema-31.sql` → `bank-seed.sql` → `schema-32.sql`, behind the self-signed HTTPS proxy `https://127.0.0.1:54443`. From 09:01 an isolated copy (`/tmp/s32vv`, own ports) because Builder's `setup.sh` rerun wiped `/tmp/s32` mid-drive (C6) |

- **Real project** `fhzqwbdlejzohetdoluw`: read-only checks with the publishable key, plus GET-only checks with the bot key (`slice-32-evidence-real.md`). No real writes; the live magic-link round trip waits until after merge (Planner), and real bot writes on production are not allowed.
- **Evidence:** `slice-32-evidence-code.md` (code, HTTP matrix, bot script, stand-in, "45ec68f re-check"), `slice-32-evidence-real.md`, screenshots in `verifier/slice-32-screenshots/` (`s32v_A_*`, `s32v_C_*`, `s32v_D_*`, `s32v_E_*`).
- **Secrets:** no secret key, JWT, DB password or login link appears in this report, the evidence files or the screenshots (staged files grepped before commit). The only keys shown are publishable (`sb_publishable_local_s32`, `sb_publishable_In0_…`).

---

## Verdict: **FAIL — needs fixes / decisions**

1. **C2 (security, blocking):** the bot (`service_role`) key keeps full rights on `public.admins` and full write on `public.redskap`. Fix in `schema-32.sql` **and** on the live project.
2. **AC 40 / 42 / 45:** spec deviations. Christoffer decides: fix, or accept as deviations.
3. **AC 36 / C1:** PASS on the AC text, but the on-screen recovery advice doesn't work (defect C1). Should be fixed.
4. **AC 37:** PASS (headless re-test with real `navigator.onLine=false`).

Everything else PASS, or PENDING-real where marked.

| AC | Verdict | Short |
| --- | --- | --- |
| 23 | **PASS** (stand-in) · PENDING-real | schema-32 ×2 clean; `rls-smoke.sql` full 13/13 |
| 24 | **PASS** (stand-in) · PENDING-real | same `adminLinkSent`, no mail, users stay 2 |
| 25 | **PASS** (stand-in) · PENDING-real | PKCE, no `?code=`, `#dela=` kept, reload keeps, Logga ut clears key |
| 26 | **PASS** | only `index` + `jsx-runtime`, footer link only |
| 27 | **PASS** (stand-in) | `adminNotAdmin`, no admin UI, API writes change 0 rows |
| 28 | **PASS** (stand-in) | `adminLinkFailed`, `adminWait` (C3) |
| 29 | **PASS** | chips + counts, pending under chip only, not addable |
| 30 | **PASS** | Godkänn → coach sees 52 after reload |
| 31 | **PASS** | edited fields saved; tags/difficulty preserved |
| 32 | **PASS** | `updated_by` server-stamped, spoof overwritten, detail line |
| 33 | **PASS** | review cleared on save / Markera; coach sees no badge |
| 34 | **PASS** | confirm with `adminHideUsedIn`, hidden for all, share still resolves, Visa igen |
| 35 | **PASS** | no delete control/call; DELETE refused for all roles |
| 36 | **PASS with defect (C1)** | `adminSaveConflict`, other edit intact; "Stäng och öppna" doesn't recover |
| 37 | **PASS** | `setOffline`: text shown, buttons + Spara disabled, 0 writes |
| 38 | **PASS** | own bank updates at once; coach on next start; no pending in cache |
| 39 | **PASS** | no own data sent while admin |
| 40 | **FAIL** (deviation, no leak) | key read only from env var, not `bank-bot.env` mode 600 |
| 41 | **PASS** (stand-in) · PENDING-real | pending / review=t / `bot:planner`, anon `[]`, Väntar (2) |
| 42 | **FAIL** (partial) | skip/`--replace`/env-var refusal/no print OK; no env-file 644 or publishable check |
| 43 | **PASS** (stand-in) · PENDING-real | bot DELETE → 403 (but see C2) |
| 44 | **PASS** (stand-in) · PENDING-real | revoked key → clear error, app unaffected |
| 45 | **FAIL** (partial) | `export-db.ts` works, banner present; snapshot not bundled |
| 46 | **PASS with note** | only supabase-js's own `sb_secret_` prefix check in the lazy chunk |
| 47 | **PASS** (stand-in + live parts) · PENDING-real | advisor fix 16/16, live RPC 404, `private` not exposed; Advisor re-run needs Christoffer |
| 48 | **PASS** | Slice 31 smoke 2, 3, 5 re-driven; step 4 by unit tests |
| 49 | **PASS** | +3.88 kB gz; build green; 114/0 |
| 50 | **PASS** | `Träningsplaneraren · Slice 32 · Logga in som admin` |

---

## Per-AC detail

### Database + auth

| AC | Verdict | Evidence |
| --- | --- | --- |
| 23 | **PASS** (stand-in) · PENDING-real | Stand-in: `schema-32.sql` ran clean twice more after setup (only "already exists, skipping" notices), also on `45ec68f`. `rls-smoke.sql` **full**: 13 PASS / 0 FAIL, rolled back. The HTTP matrix agrees: non-admin can't write or see pending (PATCH 200 with 0 rows, POST 403), admin can update and sees pending, DELETE is refused for every role, `admins` isn't writable from anon/authenticated. Live: `admins` exists and anon gets 401 on it, anon writes on all three tables → 401. `rls-smoke.sql` in the live SQL Editor is for Christoffer (PENDING-real). |
| 24 | **PASS** (stand-in) · PENDING-real | UI: `unknown@test.local` shows "Om adressen hör till en admin kommer en länk strax. Öppna den i den här webbläsaren. Den gäller i en timme." (`adminLinkSent`, same as for a known address). No mail sent; `auth.users` stays 2. API: `/auth/v1/otp` with `create_user:false` → 422 `otp_disabled`, which the app maps to "sent" (`session.ts:105-111`, `shouldCreateUser:false` at `:121`). The "sign-ups off" setting on the live project is PENDING-real (`s32v_A_unknown.png`). |
| 25 | **PASS** (stand-in) · PENDING-real | Mail link is PKCE (`/auth/v1/verify?token=pkce_…`, not reproduced). Opening share-A, then logging in and returning: `#dela=` kept, no `?code=` in the URL, footer "Admin · Logga ut", shared pass offered. Reload → still admin. Logga ut removes `gymnastics-planner-admin-auth-v1`; the remaining keys are `bank-cache-v1`, `own-activities-v1`, `tips-v1` (`s32v_A_admin_loggedin.png`, `s32v_C_loggedout.png`). The live round trip with Christoffer's mailbox happens after merge (Planner) → PENDING-real. |
| 26 | **PASS** | Coach on 4177: only `index-DEO0doZ7.js` and `jsx-runtime-DLNB9Qsn.js` loaded, no supabase-js chunk. GET `exercises` + GET `redskap` with `apikey`, no `Authorization`. Footer "Träningsplaneraren · Slice 32 · Logga in som admin", no admin DOM. Biblioteket: 51 exercises. 4173 (vars unset): no login link, no bank requests. supabase-js (`dist-*.js`, 55 kB gz) is reached only through the lazy admin chunk (`s32v_A_coach_footer.png`, `s32v_A_coach_network.png`). |
| 27 | **PASS** (stand-in) | Non-admin round trip: footer "Du är inloggad men inte admin. · Logga ut", 0 admin UI elements. Direct API with the non-admin token: PATCH → 200 with 0 rows (DB unchanged), INSERT → 403, self-insert into `admins` → 403 (`s32v_A_nonadmin.png`). |
| 28 | **PASS** (stand-in) | 2nd request within 60 s → "Vänta en stund innan du ber om en ny länk." (`adminWait`; GoTrue 429). Re-opening a used link → sheet with "Länken fungerar inte längre. Be om en ny." (`adminLinkFailed`) (`s32v_A_wait.png`, `s32v_A_linkfailed.png`). See C3. |

### Admin UI

| AC | Verdict | Evidence |
| --- | --- | --- |
| 29 | **PASS** | Chips: `Admin`, "Väntar på godkännande (2)", "Behöver granskas (16)", no Dolda chip while 0 hidden; "Dolda (2)" appeared after two hides (AC 34). Both pending rows carry the Väntar badge and show only under their chip. The pending detail has no "Lägg till i valt block" (`s32v_A_admin_chips.png`, `s32v_A_pending_detail.png`, `s32v_C_dolda.png`). |
| 30 | **PASS** | Godkänn on «Test: formhopp över lågt block» → toast "Godkänd. Tränarna ser den nästa gång de öppnar appen." A separate coach profile (incognito) after reload lists it; count 52 (`s32v_A_approved_coach.png`). |
| 31 | **PASS** | Ändra i banken on «Test: äggrullning nerför kil» → Namn, Minuter (7), Säkerhet, Källa changed → Spara i banken → toast "Sparat i banken." SQL: title, duration 7, safety, source changed; tags `{teknik,rullning,kil,form,nybörjare}` and difficulty `intro` unchanged. Links/visual/sort are never sent (`BankPatch`, `bankWrite.ts:15-26`); validation = own form (`ownActivityIssues`) (`s32v_C_edit_form.png`, `s32v_C_edited_detail.png`). |
| 32 | **PASS** | After the save: `updated_by = admin@test.local`, `updated_at` bumped; the detail shows "Senast ändrad 3 okt av admin@test.local". HTTP admin PATCH with `updated_by:"spoof…"` → stored `admin@test.local` (re-checked on `45ec68f` with `private.stamp_updated_by`). |
| 33 | **PASS** | After the save `needs_coach_review = f` (status stays `pending`). Markera som granskad on a review row → "Markerad som granskad.", count 16 → 15. Coach profile: no review badge on bank rows (`s32v_C_reviewed.png`). |
| 34 | **PASS** | Dölj för alla on «Ljushopp på satsbräda» (a mall drill) → confirm "Dölja “Ljushopp på satsbräda” för alla tränare? Pass som redan har övningen visar fortfarande. Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras." (= `adminHideUsedIn`) → toast "Dold för alla." The approved formhopp row hid the same way. Coach after reload: both gone from Biblioteket and search. Share-A still shows «Ljushopp på satsbräda»; share-B in a brand-new profile shows «Test: formhopp över lågt block» (title, not id). Admin sees "Dolda (2)"; Visa igen → "Syns igen för alla.", chip gone (`s32v_C_hide_confirm.png`, `s32v_C_shareA_hidden.png`, `s32v_C_shareB_fresh.png`, `s32v_C_dolda.png`). |
| 35 | **PASS** | `grep -rn "\.delete(\|DELETE" app/src` → only `mem.delete(key)` in test storage mocks. No delete control in the admin detail. DELETE over HTTP refused for anon, non-admin, admin and bot. |
| 36 | **PASS with defect (C1)** | The AC text: second save → `adminSaveConflict`, first edit intact. Met: "Någon annan har ändrat övningen. Stäng och öppna den igen." and the DB keeps the other edit (`s32v_C_conflict.png`). The AC doesn't promise recovery by reopening, so this is not a FAIL. **But** following the on-screen advice (close + reopen, then Spara) conflicts again (TEST2); only a page reload lets the save through (TEST3). Defect C1. |
| 37 | **PASS** | Re-tested headless (Playwright + Chrome, 390×844, `context.setOffline(true)` → `navigator.onLine=false` + `offline` event), logged in as admin on 4177, detail «Cirkelträning (par, stationer)»: (1) going offline with the detail open, without reopening → "Du behöver nät för att ändra i banken." visible, Ändra i banken + Dölj för alla **disabled**; force-clicks open nothing. (2) close + reopen while offline → same. (3) online → open the form → offline → form shows the offline text, Spara i banken **disabled**; a forced submit does nothing and the form stays open. (4) requests to `:54443` during the offline phases: **0** (0 PATCH/POST). (5) back online → text gone, Spara and both detail buttons enabled; still 0 writes. Earlier Chrome drive: DevTools "Offline" did not flip `navigator.onLine` (environment limitation, `s32v_D_*.png` show the buttons still enabled for that reason); with the network truly down, Spara showed "Kunde inte spara. Kolla nätet och försök igen." and sent no PATCH (`s32v_C_offline.png`). Nothing is queued (`bankWrite.ts:35` returns `offline` before any request; no retry store) (`s32v_E_offline_detail.png`, `s32v_E_offline_form.png`). |
| 38 | **PASS** | After Spara, the admin's detail and list show the new title at once. A coach profile sees the approved row after reload. Coach cache `tech-test-*` ids: only `tech-test-formhopp-over-lagt-block` (the approved one); the pending row is absent. Code: `applyBankEntries` filters to published+hidden before `writeCache`, `readCache` re-guards (`bank.ts:84-110,218-223`) (`s32v_A_cache.png`). |
| 39 | **PASS** | While logged in, saving an own exercise and adding it to a pass sent no request. The only non-GET calls from the app were `/auth/v1/otp`, `/auth/v1/token`, `/auth/v1/logout` and `/rest/v1/exercises`. The `rpc/stamp_updated_by` and `rpc/is_admin` lines at 09:02:53 CEST (07:02:53Z) in the proxy log are Verifier's curl smoke (origin `-`), not the app. |

### Bot writes (E1)

| AC | Verdict | Evidence |
| --- | --- | --- |
| 40 | **FAIL** (spec deviation; no leak) · PENDING-real | The AC wants the key only in `~/.config/traningsplaneraren/bank-bot.env`, mode 600. The script reads **only** the env var `SUPABASE_PLANNER_BOT_KEY` and ignores that file (`promote-lib.ts:9,74-86`). `git grep sb_secret_` hits only docs/SQL comments (no key values); the bot key value is in 0 repo files; `.github` uses `vars.*` only. Christoffer decides: implement the file + mode check, or accept the env var as a deviation. |
| 41 | **PASS** (stand-in) · PENDING-real | `push-promote.ts` on `fixtures/promote-2.json` (checker PASS) → 2 rows `pending`, `needs_coach_review = t`, `updated_by = bot:planner`; anon `[]`; the admin sees "Väntar på godkännande (2)" with Väntar badges. A real bot insert on production isn't allowed → PENDING-real. |
| 42 | **FAIL** (partial) | Pass parts: dry-run works without a key; existing ids skipped and reported (`FINNS REDAN — hoppas över`); `--replace` overwrites (status stays pending); a publishable key in the env var is refused (also with `--dry-run`); the key is never printed. Missing: no file-mode 644 check and no publishable-key check **in the env file**, because the file isn't read at all (AC 40). |
| 43 | **PASS** (stand-in) · PENDING-real | Bot key DELETE on `exercises` → 403 `permission denied`, row kept. See C2: the same key **can** write `admins` and `redskap`. |
| 44 | **PASS** (stand-in) · PENDING-real | Wrong or revoked key → «Nyckeln fungerar inte längre (borttagen eller fel)… (HTTP 401)», exit 1; `export-db.ts` likewise. Anon GET stays 200 (app unaffected). Deleting the real `planner-bot` key in the dashboard is Christoffer's step. |
| 45 | **FAIL** (partial) | `export-db.ts` regenerates a snapshot (51 published, 0 hidden, 15 redskap, pending excluded; 0 diffs vs `bank-seed.json`), and `seed-promotion.md` carries the superseded banner. **But** the snapshot isn't bundled (no `app/src/data/bankSnapshot.json`, no reference in src), so "app offline-first still shows all published rows **from it**" isn't met; the offline fallback is still the bundled seeds. Christoffer decides: fix or accept. |

### Security + preserve

| AC | Verdict | Evidence |
| --- | --- | --- |
| 46 | **PASS with note** | `grep -rn "sb_secret_\|service_role" app/dist app/src` → 1 hit, `app/dist/assets/dist-*.js`: supabase-js's own `startsWith('sb_secret_')` guard, not a key. `app/src` 0, eager `index-*.js` 0, `service_role` in dist 0, `sb_secret_[A-Za-z0-9]{4,}` 0, JWT-shaped strings 0. Only `sb_publishable_*` via build env. |
| 47 | **PASS** (stand-in + live parts) · PENDING-real | `45ec68f` advisor fix (0028/0029): `check-advisor.ts` 16/16 on the stand-in (function only in `private`, no EXECUTE for anon/authenticated/service_role, trigger → `private.stamp_updated_by`, spoof still overwritten); `07-fix-advisor.sql` fixes an old-01 DB and is idempotent. Live: anon `rpc/stamp_updated_by` → 404 PGRST202; the Data API exposes only `public, graphql_public` (`private` not exposed); anon writes refused at grant level. **PENDING-real:** "no RLS-disabled tables" needs Christoffer's Security Advisor re-run on the live project (after 07 if the old 01 was run). |
| 48 | **PASS** | Slice 31 smoke re-driven: step 2 (coach: 2 GETs, `apikey` only, 51 in Biblioteket; vars-unset build: no requests), step 3 (a bank title change shows after save/reload), step 5 (hidden drill gone from Biblioteket/search, saved pass and `#dela=` still show the title). Step 4 (blocked bank → cache + stale line) was not re-driven; `bank.ts` changed in this slice, and its fallback paths are covered by the green unit tests. |
| 49 | **PASS** | Eager gz: plain `index` 135.35 + `jsx-runtime` 3.12 = 138.47 kB vs Slice 31 134.59 → **+3.88 kB** (with vars +3.89) < 5. supabase-js lazy (55.01 kB gz). Build green; `bun test src` 114/0 on `45ec68f`. |
| 50 | **PASS** | Footer "Träningsplaneraren · Slice 32 · Logga in som admin" (4177); 4173 has no login link (`s32v_A_coach_footer.png`). |

---

## Concerns

- **C2 (security, blocking):** the bot (`service_role`) key keeps Supabase's default ALL on `public.admins` and full write on `public.redskap`; `schema-32.sql` only adds grants (and `revoke delete` on `exercises`). On the stand-in (also on `45ec68f`) the bot key could POST/PATCH/DELETE `admins`, including deleting the owner (the admin list was left **empty**; restored afterwards), and INSERT/UPDATE/DELETE `redskap`. Live: a bot count on `admins` returns 206 with 1 row, but schema-32 never grants SELECT there, so the default grants are still in place. **Fix** in `schema-32.sql` and live:
  ```sql
  revoke all on public.admins from service_role;
  revoke insert, update, delete, truncate on public.redskap from service_role;
  ```
  Confirm live in the SQL Editor:
  ```sql
  select grantee, table_name, privilege_type from information_schema.role_table_grants
  where table_schema='public' and grantee='service_role';
  ```
- **C1 (defect, AC 36):** after `adminSaveConflict` nothing reloads the admin bank (`bankWrite.ts:48` returns without `loadAdminBank()`), so "Stäng och öppna den igen" conflicts again; only a page reload recovers. Fix: call `loadAdminBank()` on conflict (or change the copy).
- **C3 (low):** within 60 s of a send, a 2nd request for a **known** address shows `adminWait` (429), while an unknown address shows `adminLinkSent`, which reveals whether an address is known.
- **C5 (minor):** a re-push where every row is skipped still prints «Väntar på godkännande i appen…». There's no transactional insert ("all or nothing" is pre-validation only), so a network error mid-batch can leave a partial insert.
- **C6 (tooling):** Builder's stand-in `setup.sh` runs `stop.sh` on a stale `/tmp/s32/pids` (can kill reused PIDs) and reuses `/tmp/s32`; a rerun wiped Verifier's test state mid-drive. Verifier continued on an isolated copy (`/tmp/s32vv`, own ports). The checklist says the Verifier adds the feature map `features/delad-bank.md` (skill header, not a numbered AC): added as `verify-traningsplaneraren/features/delad-bank.md`. The index in `features/README.md` still needs its row (not touched in this commit).
- **Note:** `push-promote.ts --dry-run` without a key compares against the app's built-in seed, not the DB (it says so). Live dry-run: 1 new, 1 skipped, "Inget skrevs".

## What Christoffer needs to do or decide

1. C2: approve the two `revoke` lines in `schema-32.sql`, then run them live and confirm with the grants query.
2. AC 40/42: fix (read `bank-bot.env`, refuse mode ≠ 600 and a publishable key in the file) or accept the env-var location as a deviation.
3. AC 45: bundle the snapshot or accept the bundled seeds as the offline source.
4. AC 47: re-run Security Advisor on the live project (after `07-fix-advisor.sql` if the old 01 was run).
5. After merge: live magic-link round trip (AC 25), and the PENDING-real items in AC 23/24/41/43/44.

## Screenshots (`verifier/slice-32-screenshots/`)

| Area | Files |
| --- | --- |
| Coach, login, admin chips (A) | `s32v_A_coach_footer.png`, `s32v_A_coach_network.png`, `s32v_A_unknown.png`, `s32v_A_nonadmin.png`, `s32v_A_admin_loggedin.png`, `s32v_A_wait.png`, `s32v_A_linkfailed.png`, `s32v_A_admin_chips.png`, `s32v_A_pending_detail.png`, `s32v_A_approved_coach.png`, `s32v_A_cache.png` |
| Edit, review, hide, conflict, logout (C) | `s32v_C_edit_form.png`, `s32v_C_edited_detail.png`, `s32v_C_reviewed.png`, `s32v_C_hide_confirm.png`, `s32v_C_dolda.png`, `s32v_C_shareA_hidden.png`, `s32v_C_shareB_fresh.png`, `s32v_C_conflict.png`, `s32v_C_offline.png`, `s32v_C_loggedout.png` |
| DevTools "Offline" (D, env limitation: buttons stay enabled) | `s32v_D_offline_detail.png`, `s32v_D_offline_form.png` |
| `setOffline` re-test (E, AC 37) | `s32v_E_offline_detail.png`, `s32v_E_offline_form.png` |

AC 37 script: `/tmp/s32v/offline-ac37.mjs` (box only; prints no link or token).

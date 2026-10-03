# Slice 31 + 32 — Builder notes (DRAFT · build only after lock + Docs)

Min bar per `backlog/PSTACK-OPS.md`: honour locked A–F, `npm run build` green, tests green (`cd app && bun test src` — the suites are `node:test`), one real UI path driven, ship notes `app/SLICE31-SHIPPED.md` / `app/SLICE32-SHIPPED.md`. Work on a feature branch; **never push to or merge into `main`** (it deploys Pages).

---

## Slice 31 — read-only bank

### Exact files

| File | Change |
|---|---|
| `app/src/lib/bankConfig.ts` **(new)** | `bankConfig()` → `{ url, key } \| null` from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (trim; url must be `https://`). `bankEnabled()` |
| `app/src/lib/bankRow.ts` **(new)** | `BankRow` type (snake_case, per `content/schema-31.sql`) · `rowToActivity(row): Activity \| null` — map fields (`content/migration-plan.md`), run the **same sanitizers** as own/import: `sanitizeTags` (keep seed tags verbatim, no `egen`), `sanitizeStationEquipment` (drops ids the code catalog doesn't know), `sanitizeSource`, `parseHowLines` (1–4 steps else reject), length limits, `safetyLine` required unless gathering. Unknown `visual_key` kept (icon falls back). Invalid → `null` + `console.warn(id)` |
| `app/src/lib/bank.ts` **(new)** | Module store. `initBank()` sync: cache (`gymnastics-planner-bank-cache-v1`, `v:1`) → else bundled. `refreshBank()` async: if `bankEnabled()`, two GETs (`content/config-pages.md`), 8 s timeout, map rows; 0 valid exercises → treat as failure. On success: replace store, write cache, `status='fresh'`; on failure: keep store, `status='stale'`. `subscribeBank(fn)`, `getBankSnapshot()` (for `useSyncExternalStore`). `listBankActivities()` = published. `findBankActivity(id)` = published + hidden. `bankStatus()` = `'bundled' \| 'cached' \| 'fresh' \| 'stale'`. `bankRedskapLabel(id)` |
| `app/src/lib/useBank.ts` **(new)** | `useBank()` hook → `{ activities, status }` via `useSyncExternalStore` |
| `app/src/data/seedActivities.ts` | Keep the array as the **bundled fallback** (still exported as `seedActivities` for tests/tools). `getActivityById(id)` → `findOwnActivity` → `findBankActivity` → bundled. `activitiesForBlock` → `listBankActivities()` |
| `app/src/main.tsx` | `initBank()` before render; `refreshBank()` after first render (`queueMicrotask`/`requestIdleCallback`), once per load |
| `app/src/components/LibraryPanel.tsx` | Replace `seedActivities` with `useBank().activities`; show `bankStale` line when `status === 'stale'` |
| `app/src/components/SessionBuilder.tsx` (and any component holding derived activity data) | Re-render on bank change (subscribe once high up, or pass `useBank()` down) so pass rows/detail show refreshed text |
| `app/src/lib/ownImport.ts` | `seeds` default → `listBankActivities()`; `resolvable` ids → bank (published+hidden) + bundled + own |
| `app/src/data/equipmentPieces.ts` | `getEquipmentPiece` may return `labelSv` from `bankRedskapLabel(id)` for **known** ids only; unknown DB ids ignored |
| `app/src/data/blockMeta.ts` | `bankStale`; footer `Slice 31` |
| `app/src/lib/bankRow.test.ts` · `bank.test.ts` **(new)** | See AC 11, 14, 21; fetch mocked (`globalThis.fetch`), `localStorage` shim as in existing tests |
| `.github/workflows/pages.yml` | Two env lines (`content/config-pages.md`) |
| `tools/bank/export-seed.ts` · `tools/bank/README.md` **(new)** | From `content/export_bank_seed.ts`; `tools/bank/out/` git-ignored |
| `app/SLICE31-SHIPPED.md` **(new)** | Ship notes, test counts, deviations |

**Do not touch:** coach localStorage keys, own-exercise logic, share format, `ACTIVITY_SAFETY` (stays for bundled fallback + `validateTipCatalog`), hall/wizard/mall content, `package.json` dependencies (no supabase-js in 31).

### Notes

1. **Sync API stays sync.** 14 modules call `getActivityById` synchronously — do not make it async. The store is always populated (cache/bundled) before first render.
2. **Live refresh is in-place.** When fresh data lands, lists re-render; never reset scroll, close sheets or drop form input. A drill open in detail just shows the new text.
3. **Hidden rows** come down with the fetch (RLS allows them) and are stored, but only `findBankActivity` sees them.
4. **One fetch per load**, no polling, no retries loop (one retry after 2 s is fine). Respect `navigator.onLine === false` → skip fetch, `status='stale'` only if bank configured.
5. **Never send `Authorization: Bearer`** with the publishable key (see config-pages.md).
6. **Cache write** only after a fully valid response; parse-guard every cache read (`try/catch`, `v === 1`, arrays).
7. Old cache from a future shape → ignore, don't delete other keys.

---

## Slice 32 — admin login + editing

### Exact files

| File | Change |
|---|---|
| `app/package.json` | `@supabase/supabase-js` (v2, current) — **dynamic import only** |
| `app/src/lib/admin/client.ts` **(new)** | `getAdminClient()` lazy: `createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, autoRefreshToken: true, storageKey: 'gymnastics-planner-admin-auth-v1' } })` |
| `app/src/lib/admin/session.ts` **(new)** | `sendLoginLink(email)` → `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: location.origin + import.meta.env.BASE_URL } })` (always show `adminLinkSent`, except rate limit → `adminWait`). `handleAuthReturn()` — if `?code=` present: load client, exchange, then `history.replaceState` removing `code` (keep `location.hash`). `isAdmin()` → `from('admins').select('user_id').maybeSingle()`. `signOut()`. `useAdmin()` hook → `{ state: 'none' \| 'checking' \| 'admin' \| 'notAdmin' }` |
| `app/src/main.tsx` | Load the admin module at start **only** if URL has `code` or `localStorage` has `gymnastics-planner-admin-auth-v1` |
| `app/src/lib/admin/bankWrite.ts` **(new)** | `approve(id, updatedAt)` · `hide` · `unhide` · `markReviewed` · `saveExercise(id, patch, updatedAt)`. All = `update(...).eq('id', id).eq('updated_at', updatedAt).select()`; 0 rows → `'conflict'`. After success → `refreshBank()` (admin fetch includes pending via the session) |
| `app/src/lib/bank.ts` | Admin variant of the fetch (through the client, all statuses) when `useAdmin()==='admin'`; coaches' path unchanged. Pending/hidden kept in an admin-only list, **never** written to the coach cache key |
| `app/src/components/AdminLoginSheet.tsx` **(new)** | Screen-spec §3 |
| `app/src/components/AdminBankForm.tsx` **(new)** | Screen-spec §7. Reuse `OwnActivityForm` field components/validation (extract shared `ActivityFields` if cleaner) + Redskap picker (Slice 30) + Källa fields (`sanitizeSource`). Preserve tags/difficulty/links/visual/sort. Save sets `needs_coach_review=false` |
| `app/src/components/LibraryPanel.tsx` | Admin chip + filter chips + badges (screen-spec §4) |
| `app/src/components/ActivityDetail.tsx` | Admin actions + `adminLastChanged` + review hint for bank rows (screen-spec §5); hide confirm with "used in mall/wizard" check over `seedTemplates` + `wizardPaths` ids |
| `app/src/App.tsx` / footer | `adminLoginLink` / `Admin · Logga ut` |
| `app/src/data/blockMeta.ts` | Slice 32 keys; footer `Slice 32` |
| `tools/bank/push-promote.ts` **(new, E1)** | Per `content/bot-writes.md`. Reads `~/.config/traningsplaneraren/bank-bot.env`; refuses wrong perms / publishable key; POST pending rows; 409 → skip+report; `--replace`; never logs the key |
| `tools/bank/export-db.ts` **(new)** | Secret-key read of published+hidden → `app/src/data/bankSnapshot.json` |
| `app/src/data/bankSnapshot.json` **(new)** + `seedActivities.ts` | Recommended: bundled fallback becomes the generated snapshot (with `safetyLine`), `seedActivities.ts` a thin typed loader. Keep `ACTIVITY_SAFETY` for ids still lacking `safetyLine` until the snapshot covers all; keep `seedActivities.test.ts` green |
| `slice-30/content/seed-promotion.md` | Banner: superseded by `slice-31/content/bot-writes.md` (E1) |
| tests | `admin/session.test.ts` (URL cleanup keeps `#dela=`), `bankWrite.test.ts` (conflict path, mocked client), `bank.test.ts` (pending never in coach cache), `push-promote` dry-run test against a fixture with `fetch` mocked |
| `app/SLICE32-SHIPPED.md` **(new)** | Ship notes; bundle-size before/after (main chunk) |

### Notes

1. **Security:** the only key in client code is the publishable one. `git grep -n "sb_secret_\|service_role"` in `app/` must return nothing but comments. The bot key is read from the box file at run time only.
2. **PKCE, not implicit:** implicit flow would put tokens in `#…` and collide with `#dela=` share links.
3. **No delete code path** anywhere (UI or `bankWrite`). The DB also refuses it.
4. **Admin writes need network**; no offline queue (show `adminOffline`).
5. **Conflicts:** always send the `updated_at` you loaded; on conflict, don't merge — ask to reopen.
6. **Coach view unchanged** except the footer link. Admin badges on bank rows only when `useAdmin()==='admin'`.
7. **Pending rows** must never land in `gymnastics-planner-bank-cache-v1`, a pass draft, share link or print.
8. **Lazy chunk:** check `dist/assets` — supabase-js in its own chunk, not loaded on a normal visit (Network tab).

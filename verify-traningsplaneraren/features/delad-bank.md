# Delad övningsbank + admin (Slice 31 + 32)

**What:** Biblioteket reads the shared bank (Supabase, publishable key, read-only for coaches; bundled seeds + `gymnastics-planner-bank-cache-v1` as offline fallback). From Slice 32 a few admins log in by magic link (PKCE) and approve, edit, hide and re-show bank rows; the Planner bot adds rows as `pending`.

**Reach:** Coach: Passbyggaren → block → Lägg till övning → Biblioteket. Admin: footer **Logga in som admin** → e-mail → open link in the same browser → footer `Admin · Logga ut`; admin chips and actions appear in Biblioteket and the exercise detail. Only in builds with both `VITE_SUPABASE_*` vars (unset build = no bank, no login link).

**Drive:**
1. Coach, fresh profile: Network shows one GET `exercises` + one GET `redskap` (`apikey`, no `Authorization`), JS only `index` + `jsx-runtime` (no supabase-js chunk); footer `Träningsplaneraren · Slice 32 · Logga in som admin`.  
2. Bank unreachable or blocked: cached/bundled rows, stale line in Biblioteket only; no error dialog.  
3. Login: unknown e-mail → same `adminLinkSent`, no user created; 2nd request < 60 s → `adminWait`; used link → `adminLinkFailed`; non-admin → `Du är inloggad men inte admin.`; return URL has no `?code=` and keeps `#dela=`; reload keeps session; Logga ut removes `gymnastics-planner-admin-auth-v1`.  
4. Admin: chips `Admin`, `Väntar på godkännande (n)`, `Behöver granskas (n)`, `Dolda (n)` (only when > 0); pending/hidden not addable. Godkänn · Ändra i banken (Spara i banken) · Markera som granskad · Dölj för alla (confirm, `adminHideUsedIn` for mall/wizard ids) · Visa igen. No delete anywhere.  
5. Conflict: external change, then Spara → `adminSaveConflict`, DB keeps the other edit.  
6. Offline (use Playwright `context.setOffline(true)`; Chrome DevTools "Offline" does not flip `navigator.onLine`): `Du behöver nät för att ändra i banken.`, admin buttons and Spara i banken disabled, 0 writes.  
7. Bot: `tools/bank/push-promote.ts --dry-run` (no key) → report, nothing written; real push → rows `pending`, `needs_coach_review`, `bot:planner`.

**Prove:** Coaches never get `pending` rows (DB, cache, pass, share, print); hidden rows leave Biblioteket/search but old passes and `#dela=` links still show the title; admin edits keep tags/difficulty/links/visual/sort and stamp `updated_by` server-side; own exercises/passes/mallar never leave the device; no secret key, JWT or login link in repo, bundle or reports; anon cannot write and nobody can hard-delete. Stand-in recipe: `verifier/slice-32-local/` (isolate `/tmp/…` and ports if another agent's stack runs).

# Config — Supabase URL + publishable key in the Pages build (Slice 31)

## What is public and what is not

| Value | Looks like | Public? | Where it lives |
|---|---|---|---|
| Project URL | `https://<ref>.supabase.co` | **Yes** | GitHub repo variable `VITE_SUPABASE_URL` → baked into the JS bundle |
| Publishable key (new name for "anon key") | `sb_publishable_…` | **Yes, by design** — it can only do what RLS allows (read published/hidden rows) | GitHub repo variable `VITE_SUPABASE_PUBLISHABLE_KEY` → baked into the bundle |
| Secret key (new name for "service_role") | `sb_secret_…` | **NO** — bypasses RLS | Slice 32 / E1 only: `~/.config/traningsplaneraren/bank-bot.env` on the box (mode 600). **Never** in `app/`, the repo, GitHub variables/secrets, the bundle or chat |
| Database password | — | **NO** | Christoffer's password manager only. Nobody else needs it |

If the project still shows only the legacy `anon` key (JWT `eyJ…`), it works the same way for reading; prefer creating the new publishable key (Settings → API Keys → *Create new API keys*). Legacy keys are deprecated by end of 2026.

## Pages build (`.github/workflows/pages.yml`) — Builder change

```yaml
      - name: Build
        run: npm run build
        env:
          VITE_BASE: /traningsplaneringen/
          VITE_APP_BUILD: ${{ github.sha }}
          VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ vars.VITE_SUPABASE_PUBLISHABLE_KEY }}
```

- **Repository variables** (Settings → Secrets and variables → Actions → *Variables* tab), not secrets: the values are public, and variables are readable in logs, which makes debugging easy. Rotation = change the variable + re-run the workflow; no code commit.
- **Missing variables = bank off.** `bankEnabled()` is false when either value is empty → app uses only the bundled seeds, makes no Supabase request, shows no stale line. So the Slice 31 code can merge before Christoffer has created the project.
- Who sets them: Christoffer in GitHub, **or** he pastes URL + publishable key to Planner in chat and Builder sets them (values are public, so chat is fine for these two — never for the secret key).

## Local dev / Verifier

`app/.env.local` (git-ignored by `*.local` in `app/.gitignore` and `.env.*` in the root `.gitignore`):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Do **not** add a committed `.env.example` under the root ignore rule; this file is the example.

## Request shape (Slice 31, no library)

```
GET {URL}/rest/v1/exercises?select=<columns>&status=in.(published,hidden)&order=sort_order.asc
GET {URL}/rest/v1/redskap?select=id,label_sv,visual_key,sort_order&order=sort_order.asc
Headers:  apikey: <publishable key>     Accept: application/json
```

- Send the key on **`apikey` only**. With `sb_publishable_…`, an `Authorization: Bearer <key>` header is parsed as a JWT and rejected (`Invalid JWT`).
- Timeout 8 s (AbortController). Any non-200, JSON error, timeout or 0 valid rows → keep current copy (D1).
- RLS already hides `pending`; the `status=in.(…)` filter is belt and braces.

## Slice 32 (admins)

`@supabase/supabase-js` (lazy-loaded) with the **same** URL + publishable key; the admin's session token rides on top. Auth settings live in the Supabase dashboard (see `setup-christoffer.md`), not in the repo. Redirect URL = `window.location.origin + import.meta.env.BASE_URL` → `https://drevmok.github.io/traningsplaneringen/` (must be in the Supabase Redirect URLs allow-list; add `http://localhost:5173/traningsplaneringen/` for dev).

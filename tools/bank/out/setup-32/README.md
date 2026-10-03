# Slice 32 — paste-ready setup for the real project (Christoffer)

Run in this order **after** Slice 32 is merged (or when Planner says so). Full wording with screenshots-level detail: [`slice-31/content/setup-christoffer.md`](../../../../slice-31/content/setup-christoffer.md) steps 6–11. Every SQL file here is **under 16 KB** (the SQL Editor cut a ~100 KB paste at about 20 KB), so each one is a single paste. Check the paste is whole: the last line in the editor must match the file's last line.

| # | Where | What | File | Bytes |
|---|---|---|---|---|
| 1 | Authentication → Sign In / Providers | **Allow new users to sign up: OFF** · Save. **Email** provider: enabled (leave its other settings) | — | — |
| 2 | Authentication → URL Configuration | **Site URL** `https://drevmok.github.io/traningsplaneringen/` · **Redirect URLs**: add `https://drevmok.github.io/traningsplaneringen/` and `http://localhost:5173/traningsplaneringen/` (keep the trailing slash) · Save | — | — |
| 3 | Authentication → Emails → Templates | **Nothing to change.** The default *Magic Link* template works (the app uses the secure code flow). Swedish text needs own SMTP (optional, later) | — | — |
| 4 | SQL Editor → new query | Paste all, Run (confirm the "destructive" warning — it only replaces its own rules). Expect *Success. No rows returned*. Safe to run twice | `01-schema-32.sql` | 4 430 |
| 5 | SQL Editor → new query | Check: five policy names | `02-check-policies.sql` | 321 |
| 6 | Authentication → Users → Add user → **Create new user** | Your e-mail · long password (password manager; not used) · **Auto Confirm User** ticked · Create | — | — |
| 7 | SQL Editor → new query | Replace `DIN-EPOST@exempel.se` with the e-mail from row 6 (keep the quotes), Run | `03-admin-insert.sql` | 392 |
| 8 | SQL Editor → new query | Check: one row, your e-mail · `owner` | `04-check-admin.sql` | 215 |
| 9 | (recommended for Verifier) Authentication → Users | Repeat row 6 with a **second** e-mail of yours; **skip** row 7 (non-admin test user) | — | — |
| 10 | Project Settings → API Keys → Secret keys → **New secret key** | Name `planner-bot` → Create. Copy it **only** into the secure input box Planner opens on the box (it becomes the box environment variable `SUPABASE_PLANNER_BOT_KEY`). Never chat, e-mail, GitHub, the app or a file. Say "Klart" | — | — |
| 11 | (optional) SQL Editor | Full RLS smoke test — runs inside a transaction and **rolls back** (changes nothing). Every line should say PASS | `05-rls-smoke-valfri.sql` | 4 838 |
| 12 | (optional) SQL Editor | Read-only final check: counts, admins = 1, no table without RLS | `06-check-bank-after-setup.sql` | 526 |
| 13 | Advisors → Security Advisor | No "RLS disabled" errors; `private` must not be listed as an exposed schema (AC 47) | — | — |

No new GitHub variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` stay as they are. The secret key never goes to GitHub.

**Seed from now on:** do **not** re-run the full `bank-seed.sql` / `parts/` after Slice 32 — it would overwrite admin edits. New code exercises go in with `bun tools/bank/export-seed.ts --new-only --chunked` (see [`../../README.md`](../../README.md)).

**Login mail limit:** Supabase's built-in mailer sends about 2 login mails per hour and only to addresses in your Supabase team. The app shows «Vänta en stund innan du ber om en ny länk.» when it hits the limit.

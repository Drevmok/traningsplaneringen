# Setup — what Christoffer does himself

Nobody else can do these steps: they create accounts in your name or handle a key. Each step says how long it takes and what to send back. **Never paste the database password or a `sb_secret_…` key into chat, e-mail or GitHub.**

## Before Slice 31 ships (~15 min)

| # | Where | Do this | Send to Planner |
|---|---|---|---|
| 1 | supabase.com | **Start your project** → *Continue with GitHub* (or e-mail). Free plan. | — |
| 2 | Dashboard → **New project** | Name `traningsplaneraren` · Region **EU North (Stockholm)** if listed, else **EU Central (Frankfurt)** · Database password: generate one, save it in your password manager. Wait ~2 min. | — |
| 3 | **SQL Editor** → New query | Paste all of `slice-31/content/schema-31.sql` → **Run** → "Success". New query → paste `bank-seed.sql` from Builder → **Run**. | "Klart" |
| 4 | **Settings → API Keys** | If you see *Create new API keys*, click it. Copy **Project URL** and **Publishable key** (`sb_publishable_…`). | These two values (public — chat is OK) **or** add them yourself: GitHub → `Drevmok/traningsplaneringen` → Settings → Secrets and variables → Actions → **Variables** → `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| 5 | Planner chat | When Verifier passes Slice 31: say **merge**. Merging to `main` publishes the app. | "merge" |

**Free-plan nap:** after 7 days without any use (e.g. summer), Supabase pauses the project and e-mails you. Click **Restore project** in the dashboard. Coaches keep working on their saved copy meanwhile. Paid plan (~25 USD/month) never pauses — not needed now.

## Before Slice 32 ships (~15 min, + 2 min if E1)

| # | Where | Do this | Send to Planner |
|---|---|---|---|
| 6 | **Authentication → Sign In / Providers** | **Email**: enabled. Under user sign-ups: **Allow new users to sign up = off**. | — |
| 7 | **Authentication → URL Configuration** | Site URL: `https://drevmok.github.io/traningsplaneringen/` · Redirect URLs: add the same, plus `http://localhost:5173/traningsplaneringen/` (for Builder/Verifier testing). | — |
| 8 | **SQL Editor** | Paste all of `slice-31/content/schema-32.sql` → Run. | — |
| 9 | **Authentication → Users → Add user → Create new user** | Your e-mail (tick *Auto confirm*; a password isn't needed for magic link — let it generate one). Then SQL Editor: run the "make Christoffer admin" snippet at the bottom of `schema-32.sql` with your e-mail. | "Admin klar" |
| 10 | *(E1 only)* **Settings → API Keys → Secret keys → New secret key** | Name `planner-bot`. Copy it **once**. | Enter it **only in the secure input box** Planner opens on the box. Not chat. |
| 11 | Planner chat | When Verifier passes Slice 32: say **merge**. | "merge" |

**For Verifier (optional but recommended):** add a second test user in step 9 that is **not** an admin (e.g. your other e-mail) so the "non-admin can't write" test runs.

## Optional: own e-mail sender (custom SMTP)

Only needed if you want a **second admin** who isn't in your Supabase team, **Swedish** text in the login mail, a **6-digit code** in the mail (handy for the iPhone home-screen app), or more than ~2 login mails/hour. Free senders: Resend, Brevo. Supabase → **Authentication → Emails → SMTP Settings**. Planner can walk you through it; not part of either slice.

## Turning things off

| Want to… | Do |
|---|---|
| Stop the robot writing | Settings → API Keys → delete `planner-bot` |
| Remove an admin | SQL Editor: `delete from public.admins where email = '…';` |
| Make the app ignore the database | GitHub → Variables → delete the two `VITE_SUPABASE_…` → re-run *Deploy Pages* (app uses its built-in exercises) |

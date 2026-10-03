# Setup — what Christoffer does himself

These steps create things in your name, so only you can do them. You don't need to know any code: you copy, paste and click.

**Three things never leave your hands:** your Supabase password, the **database password**, and any **secret key** (it starts with `sb_secret_`). Never paste them into chat, e-mail or GitHub.

## Slice 31: set up the shared bank (~15 min)

You need:

- `schema-31.sql` — in this folder (`slice-31/content/schema-31.sql`).
- `bank-seed.sql` — Builder sends it to you. It only holds the public exercise texts.

Menu names below are the ones Supabase uses in English. If a button looks slightly different, look for the closest match.

### 1. Create a free Supabase account

1. Go to **supabase.com** and click **Start your project**.
2. Choose **Continue with GitHub** (easiest) or sign up with e-mail.
3. If Supabase asks you to create an organization first, give it any name (your own name works) and choose the **Free** plan.

### 2. Create the project in an EU region

1. Click **New project**.
2. **Name:** `traningsplaneraren`
3. **Database password:** click generate, then save the password in your password manager. Nobody else needs it, and you won't need it for these steps.
4. **Region:** choose **North EU (Stockholm)** if it is in the list. If not, choose **Central EU (Frankfurt)**.
   Pick the city by name. Don't pick a broad "Europe" option: Supabase may place that project in London or Zurich, which are outside the EU.
5. Leave the security options as they are. **Enable Data API** must stay ticked, because the app reads the exercises through it.
6. Click **Create new project** and wait a couple of minutes until the project is ready.

### 3. Put the exercises into the bank

**3a. Create the tables (`schema-31.sql`)**

1. In the left menu, open **SQL Editor**.
2. Start a new, empty query.
3. Open `schema-31.sql`, copy **all** of it and paste it into the editor.
4. Click **Run**.
5. Supabase may warn that the query contains a destructive operation. That is expected here: the file only replaces its own read rules. Confirm and run.
6. You should see **Success. No rows returned**. If you see a red error, stop and send the error text to Planner (it contains no secrets).

**3b. Add the exercises (`bank-seed.sql`)**

1. Start another new query in **SQL Editor**.
2. Open `bank-seed.sql` from Builder, copy **all** of it, paste it and click **Run**.
3. You should see **Success** again.

Running either file twice is safe. Nothing gets duplicated.

**3c. Check that it worked**

1. In **SQL Editor**, start a new query, paste this line and click **Run**:

   ```sql
   select status, count(*) from public.exercises group by status;
   ```

   You should see one row: **published** · **51**.

2. Run this line too:

   ```sql
   select count(*) from public.redskap;
   ```

   You should see **15**.

3. You can also open **Table Editor** in the left menu and click the `exercises` table to see the exercises with their Swedish titles.

If the numbers differ, send them to Planner.

### 4. Copy the two public values and give them to the app

You need two values. Both are public by design: they only let the app **read** published exercises.

**4a. Copy them**

1. **Project URL** — click **Connect** at the top of the project. The URL starts with `https://` and ends with `.supabase.co`. (It is also shown under **Integrations → Data API**.)
2. **Publishable key** — open **Project Settings** (bottom of the left menu) → **API Keys**. Copy the **Publishable key**. It starts with `sb_publishable_`.
   If you only see older keys and a button to create new API keys, click it first. Don't use the long legacy key that starts with `eyJ`.

**Don't copy the secret key.** On the same page there is a **Secret keys** section (`sb_secret_…`, the old name was `service_role`). Leave it alone. Slice 31 doesn't use it at all. It belongs to Slice 32, and even then it never goes into the app, the repo, GitHub or chat.

**4b. Give them to the app** — choose **one**:

- **Paste them to Planner in chat.** Just the Project URL and the publishable key. Builder adds them to GitHub.
- **Or add them yourself in GitHub:**
  1. Open `Drevmok/traningsplaneringen` → **Settings** → **Secrets and variables** → **Actions**.
  2. Open the **Variables** tab (not Secrets: these values are public).
  3. Click **New repository variable**. Name `VITE_SUPABASE_URL`, value = the Project URL. Click **Add variable**.
  4. Again: name `VITE_SUPABASE_PUBLISHABLE_KEY`, value = the publishable key.
  5. Tell Planner "Klart".

Until these two values exist, the app simply keeps using its built-in exercises.

### 5. Say "merge" when Verifier passes

When Planner tells you Verifier passed Slice 31, say **merge**. Merging to `main` publishes the app.

### Good to know: the free plan naps

After 7 days with no use (for example over the summer), Supabase pauses a free project and e-mails you. Open the dashboard and click **Restore project**. Coaches keep planning with their saved exercises in the meantime. The paid plan (about 25 USD/month) never pauses. You don't need it now.

## Later: before Slice 32 ships (~15 min, + 2 min if E1)

Not now. These steps wait until Slice 31 is live.

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

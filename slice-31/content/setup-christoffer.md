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

## Slice 32: admin login (~15 min)

Do these steps when Planner says Slice 32 is starting. Slice 31 must be live first.

Slice 32 lets you log in to the app with a link sent to your e-mail, then approve, edit and hide exercises. Coaches still need no account and see no difference.

You need:

- `schema-32.sql` — in this folder (`slice-31/content/schema-32.sql`).
- Your e-mail address.
- Your password manager, open.

Menu names below are the ones Supabase uses in English. If a button looks slightly different, look for the closest match.

### 6. Turn on e-mail login (magic link) and turn off new sign-ups

Nobody should be able to create an account by themselves. Only people you add can log in.

1. In the left menu, open **Authentication** → **Sign In / Providers**.
2. Find **Allow new users to sign up** (under **User Signups**). Turn it **off**.
3. Click **Save changes**.
4. On the same page, in the list of providers, check that **Email** is **enabled**. It usually is already. This is what sends the login link (Supabase calls it a magic link). Leave its other settings as they are.

### 7. Tell Supabase where the app lives

The login link in the e-mail must lead back to the app, and only to the app.

1. Open **Authentication** → **URL Configuration**.
2. **Site URL:** replace what is there with

   ```
   https://drevmok.github.io/traningsplaneringen/
   ```

   Click **Save changes**.
3. Under **Redirect URLs**, click **Add URL** and add the same address, `https://drevmok.github.io/traningsplaneringen/`. Keep the slash at the end.
4. Add one more: `http://localhost:5173/traningsplaneringen/`. Builder and Verifier use it to test on their own computer.
5. Save.

### 8. Add the admin rules (`schema-32.sql`)

This file creates the admin list and the rules that say only admins can change exercises. Nobody can delete an exercise, not even you: hiding is the only way to take one away.

**About file size.** Last time the SQL Editor cut off a long file at around 20 KB, so we keep every file under 16 KB. `schema-32.sql` is about 5.3 KB (5,299 bytes), so it goes in one paste. There are no part files.

1. Open **SQL Editor** and start a new, empty query.
2. Open `schema-32.sql`, copy **all** of it and paste it.
3. Check that the paste is whole: scroll to the bottom of the editor. The last line should be

   ```
   -- Remove an admin:  delete from public.admins where email = '…';   (SQL Editor only)
   ```

4. Click **Run**. Supabase may warn about a destructive operation. That is expected: the file only replaces its own rules. Confirm and run.
5. You should see **Success. No rows returned**. A red error: stop and send the error text to Planner (it contains no secrets).

Running the file twice is safe.

**Check that it worked.** Start a new query, paste this and click **Run**:

```sql
select policyname from pg_policies
where schemaname = 'public' and tablename in ('admins', 'exercises')
order by policyname;
```

You should see five names: `admins_read_self`, `exercises_admin_insert`, `exercises_admin_read_all`, `exercises_admin_update`, `exercises_read_public`.

### 9. Add yourself and make yourself admin

**9a. Add yourself as a user**

1. Open **Authentication** → **Users**.
2. Click **Add user** → **Create new user**. (Not **Send invitation**: the app doesn't need that mail.)
3. **Email:** your e-mail.
4. **Password:** make up a long one and save it in your password manager. You won't use it, because you log in with the e-mail link.
5. Tick **Auto Confirm User**.
6. Click **Create user**. You now show up in the list.

**9b. Put yourself on the admin list**

1. Open **SQL Editor** and start a new query.
2. Paste this, and replace `DIN-EPOST@exempel.se` with the e-mail you used in 9a (keep the quote marks):

   ```sql
   insert into public.admins (user_id, email, note)
   select id, email, 'owner' from auth.users where email = 'DIN-EPOST@exempel.se'
   on conflict (user_id) do nothing;
   ```

3. Click **Run**. You should see **Success**.

**Check that it worked:**

```sql
select email, note from public.admins;
```

You should see one row: your e-mail · `owner`. No rows means the e-mail in the snippet doesn't match 9a exactly. Check the spelling, fix it and run the snippet again.

Tell Planner **"Admin klar"**.

**For Verifier (recommended):** repeat 9a with a second e-mail of yours, but **skip 9b**. That user is not an admin, so Verifier can test that a non-admin can't change anything.

### 10. Create the key for Planner's robot

This key lets Planner put new YouTube stations into the bank as **Väntar på godkännande**. Coaches see nothing until you tap **Godkänn** in the app. The robot cannot delete anything.

The key is secret. It goes in exactly one place: the secure input box on the agents' computer.

1. Tell Planner **"Redo för nyckeln"**. Planner opens a secure input box on the box and tells you when it is waiting.
2. In Supabase, open **Project Settings** (bottom of the left menu) → **API Keys**.
3. If there are tabs, choose the one with **publishable and secret** keys (not the legacy one).
4. Under **Secret keys**, click **New secret key**.
5. **Name:** `planner-bot`. Click **Create API key**.
6. Copy the new key (it starts with `sb_secret_`) and paste it **only** into the secure input box. Don't save it anywhere else. If you lose it, delete `planner-bot` and make a new one.
7. Tell Planner **"Klart"**. Just that word, never the key.

**Never** paste the key into chat, e-mail, GitHub (not as a variable, not as a secret), the app, or any file in the repo. Slice 32 needs no new GitHub variable: the two from step 4 stay as they are.

If you think the key has leaked, delete `planner-bot` on the same page (three dots → delete) and tell Planner. The app keeps working; only the robot stops.

### 11. Say "merge" when Verifier passes

When Planner tells you Verifier passed Slice 32, say **merge**. Merging to `main` publishes the app.

Your first real use: Planner pushes the next video's stations. In the app, tap **Logga in som admin** at the bottom, open the link in the e-mail in the same browser, go to Biblioteket → **Väntar på godkännande**, read each one and tap **Godkänn**. On iPhone, do this in Safari, not from the home-screen icon.

> **Slice 33:** login changes to a 6-digit code typed in the app, which also works from the home-screen icon. One more step (step 12) is in [`slice-33/content/setup-christoffer.md`](../../slice-33/content/setup-christoffer.md).

## Optional: own e-mail sender (custom SMTP)

Only needed if you want a **second admin** who isn't in your Supabase team, **Swedish** text in the login mail, a **6-digit code** in the mail (handy for the iPhone home-screen app), or more than ~2 login mails/hour. Free senders: Resend, Brevo. Supabase → **Authentication → Emails → SMTP Settings** (look for the closest match). Planner can walk you through it; not part of either slice.

## Turning things off

| Want to… | Do |
|---|---|
| Stop the robot writing | Project Settings → API Keys → delete `planner-bot` |
| Remove an admin | SQL Editor: `delete from public.admins where email = '…';` |
| Make the app ignore the database | GitHub → Variables → delete the two `VITE_SUPABASE_…` → re-run *Deploy Pages* (app uses its built-in exercises) |

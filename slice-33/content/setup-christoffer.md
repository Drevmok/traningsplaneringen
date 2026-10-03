# Slice 33 setup — what Christoffer does himself (~5 min)

Do this when Planner says Slice 33 is starting. Slice 32 must be live first.

**Why:** the login mail now carries a 6-digit code instead of a link. You type the code into the app, so login also works in the app on your home screen. A link can't do that: it always opens in Safari or Chrome, and the home-screen app keeps its own separate login.

You need only your Supabase login. No files, no keys, nothing to paste into chat.

Menu names below are the ones Supabase uses in English. If a button looks slightly different, look for the closest match.

## Step 12. Put the code in the login mail

**12a. Check the code length and how long it lasts**

1. In the left menu, open **Authentication** → **Sign In / Providers**.
2. Click **Email** in the list of providers.
3. Find **Email OTP Length** ("OTP" is Supabase's word for the code). It should say **6**. If it shows another number, set it to **6** and click **Save**. If you can't change it, tell Planner the number you see.
4. On the same panel, find **Email OTP Expiration**. It should say **3600** (seconds, so one hour). Leave it as it is. If it shows another number, don't change it: tell Planner the number, because the app and the mail both say "en timme".

**12b. Check that you can edit the mail**

1. Open **Authentication** → **Emails**, then the **Templates** tab.
2. Click **Magic link or OTP** (it may be called just **Magic Link**).
3. If you see a box that says **Set up custom SMTP to edit templates**, and the subject and body can't be changed: **stop here**. Don't click **Set up SMTP** or **Upgrade to Pro**. Tell Planner **"Mallen är låst"**. (Supabase locked mail editing on free projects created after 3 June 2026. Planner will come back with the options.)

**12c. Paste the new subject and body**

1. **Subject:** delete what is there and paste:

   ```
   Din kod till Träningsplaneraren: {{ .Token }}
   ```

2. **Body:** delete **everything** in the body box and paste all of this:

   ```html
   <p>Hej,</p>
   <p>Här är din kod för att logga in som admin i Träningsplaneraren:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
   <p>Skriv koden i appen. Den gäller i en timme och fungerar en gång.</p>
   <p>Bad du inte om en kod? Då kan du strunta i det här mejlet.</p>
   ```

3. Check that the body contains `{{ .Token }}` and nothing like `{{ .ConfirmationURL }}`. The mail should have no link at all.
4. Click **Save**.

**Leave the rest as it is.** The Site URL and Redirect URLs from Slice 32 step 7 are fine to keep, and sign-ups stay off. Your user and the admin list from step 9 don't change.

Tell Planner **"Koden klar"**.

## How you log in after Slice 33 is live

1. Tap **Logga in som admin** at the bottom of the app. Safari, Chrome or the home-screen icon all work.
2. Type your e-mail and tap **Skicka kod**.
3. Open the mail, then go back to the app and type the six digits. Your phone may offer the code above the keyboard. Tap it.
4. Tap **Logga in**.

You stay logged in on that device until you tap **Logga ut**. The home-screen app and Safari still have separate logins, so log in once in each place where you want to work.

If the code doesn't arrive within a few minutes, check your spam folder, then tap **Skicka ny kod**.

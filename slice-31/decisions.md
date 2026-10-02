# Slice 31 + 32 — decisions (DRAFT · recommended A1 / B2 / C1 / D1 / E1 / F1)

**Status:** **DRAFT 2026-10-02** — waiting for Christoffer. Nothing is built until A–F are locked.  
**Direction:** Put the shared exercise bank in a database so it can be updated without a code change per exercise (Slice 31, read-only), then let admins log in and edit it in the app (Slice 32).  
**Which slice needs which answer:** Slice 31 needs **A** and **D**. Slice 32 needs **B, C, E, F**. Locking all six now is recommended so the database built in Slice 31 already fits Slice 32.  
**Standing locks:** Swedish UI · coaches never log in · own exercises/passes stay on the device · Teknik-only hall · quiet chrome · fixed redskap library · no in-app AI · no video fetching.

## Recommended A–F

| # | Rec. | In one line |
|---|---|---|
| A | **A1** | Supabase (hosted database with login built in) |
| B | **B2** | A list of admins — on day one only you |
| C | **C1** | Log in with a link sent to your e-mail |
| D | **D1** | App always starts from its saved copy; fetches news in the background |
| E | **E1** | Planner writes new stations straight into the bank as "waiting", you tap Godkänn |
| F | **F1** | Edits overwrite; "Dölj" hides instead of deleting; we record who changed what and when |

---

## A. Where should the shared exercise bank live? *(Slice 31)*

| Option | What it means for you |
|---|---|
| **A1 Rekommenderat** | **Supabase** — a hosted database with login built in. You create a free account and own the project; the app reads the exercises from it. Free plan is far more than we need (we use well under 1 MB of 500 MB). EU servers. | One place for the bank; makes Slice 32 (log in + edit in the app) straightforward. Catch: free projects **nap after 7 days with no use** — you get an e-mail and click Restore; the app keeps working on its saved copy meanwhile. |
| A2 | **Firebase** (Google's equivalent). | Also works and also free. But its data and security rules work differently from what this pack plans, and it ties admin access to Google. No clear benefit for a list of exercises. |
| A3 | **Keep a file in the code repo** (a `bank.json` published with the app). | No new account. But every change is still a code change + publish, and there is nowhere to log in — **Slice 32 (editing in the app) would not be possible**. Basically today's setup in a new shape. |

**Why A1:** It is the smallest step that makes in-app editing possible, and the app stays a simple website on GitHub Pages.

## B. Who can log in and edit the bank? *(Slice 32)*

| Option | What it means for you |
|---|---|
| B1 | **Only you.** Your e-mail is written straight into the database rules. | Simplest. Adding a second person later needs a small database change by Builder. |
| **B2 Rekommenderat** | **A short list of admins — on day one only you.** The database has an "admins" list with one name: yours. | Same as B1 today, but adding a trusted coach later is one line in the database (Planner can give you the line). Note: Supabase's built-in e-mail sender only sends login links to people in your Supabase team, so a 2nd admin means either inviting them to your Supabase team (free) or setting up our own e-mail sender (~15 min). |
| B3 | **Any coach can create an account**; you mark some as admins later. | Opens sign-up to the whole internet (spam, abuse, needs our own e-mail sender), and coaches gain nothing from an account today — their own exercises and passes stay on their phone anyway. |

**Why B2:** You stay the only editor, and we are ready for one more admin without rebuilding anything. Sign-up stays **off** in all of B1/B2 — nobody can create an account by themselves.

## C. How do you log in? *(Slice 32)*

| Option | What it means for you |
|---|---|
| **C1 Rekommenderat** | **Magic link:** type your e-mail → get a mail with a link → tap it → you're logged in, and stay logged in on that device. | No password to remember or leak. Two tips: open the link **in the same browser you asked from** (on iPhone, do admin work in Safari rather than the home-screen icon), and the link works for 1 hour. The built-in sender allows about 2 login mails per hour — plenty for you. |
| C2 | **E-mail + password.** | Works the same everywhere, including the home-screen icon. But you have one more password, and "forgot password" still goes via e-mail. |
| C3 | **"Sign in with Google".** | One tap if you use Google. But you would have to set up a Google Cloud "OAuth app" first (20–30 minutes of console clicking), and admin access depends on your Google account. |

**Why C1:** Fewest things to set up and nothing to remember; you are the only one logging in.

## D. What happens when the app can't reach the database? *(Slice 31)*

(Bad wifi in the hall, phone in flight mode after the page loaded, or the database napping.)

| Option | What it means for you |
|---|---|
| **D1 Rekommenderat** | **Start instantly from the saved copy, update in the background.** The app keeps the last bank it fetched on the device (first time ever: the exercises built into the app). It shows that at once, quietly asks the database for news, and swaps them in when they arrive. If it can't reach the database, coaches just keep using what they have; one small grey line in Biblioteket says it's showing a saved copy. | Planning never waits for the network and never breaks. A new or edited exercise reaches a coach the next time their app gets through. |
| D2 | **Always ask the database first.** Wait for it on every start; if it fails, show an error. | Always the freshest list, but a coach with no signal in the hall can't plan at all — worse than today. |
| D3 | **Built-in only, plus a "Hämta senaste övningarna" button.** | Very predictable, but most coaches would never tap it and never see new exercises. |

**Why D1:** Today's app never needs the network for exercises; D1 keeps that promise while still getting news to everyone.

## E. How do Planner's approved YouTube stations get into the bank? *(Slice 32 — replaces today's PR route)*

| Option | What it means for you |
|---|---|
| **E1 Rekommenderat** | **A dedicated robot key, kept only on the agents' computer (the box).** After you've looked at Planner's drafts, Planner writes them straight into the bank marked **"Väntar på godkännande"** — invisible to coaches. You open the app, read them, and tap **Godkänn** (or Ändra / Dölj). | Fastest: no code PR or publish per video, and nothing reaches coaches until you tap Godkänn. The key has its own name (`planner-bot`), so you can switch it off with one click without touching anything else. It is **never** put in the app, GitHub or chat. Trade-off: any agent on the box could technically use that key — that's why it can only add/edit "waiting" rows (it can't delete) and every robot write is labelled `bot:planner`. |
| E2 | **Keep the PR route as today.** Builder adds stations to the built-in list in a code PR; after merge they are copied into the database. | Proven and reviewed in GitHub, but slow (one PR + publish per video), and there are two "truths" (code and database) that can drift apart. |
| E3 | **Through the admin screen only.** Planner sends you a file, like today's import; you log in and use **Importera till banken**. | No robot key exists at all — the safest option. But you do the import taps every time, and we must build a bigger admin screen (an import tool inside admin mode). |

**Why E1:** It keeps your approval as the gate (Godkänn in the app) while removing the PR/publish wait. If you'd rather no robot key exists anywhere, pick **E3** — it costs you a few taps per video and us a larger Slice 32.

## F. Edits and history *(Slice 32)*

| Option | What it means for you |
|---|---|
| **F1 Rekommenderat** | **Edits overwrite the text; nothing is ever really deleted.** Each exercise shows when and by whom it was last changed ("Senast ändrad 2 okt av …"). **Dölj för alla** removes it from Biblioteket for everyone but keeps it, so passes that already use it still show it; **Visa igen** brings it back. No delete button. | Simple to use and build; mistakes are fixable (unhide, or edit back). Safety net: Builder regularly exports the whole bank back into the app's built-in copy (a small PR), which doubles as a backup — the free plan has no automatic backups. |
| F2 | **F1 + full history.** Every earlier version is saved; an **Återställ** button brings back an older text. | Best protection against a bad edit (yours or a robot's), but more to build and a busier admin screen. Easy to add later on top of F1 if you miss it. |
| F3 | **Allow real delete.** | Gone forever. Passes and mallar that used the exercise would show a bare code like `tech-kullerbytta` instead of the exercise. Not recommended. |

**Why F1:** You get "undo" for the scary case (hiding) without building a version system nobody may need.

---

## Planner notes (not A–F, fixed by this pack)

1. **Ids never change.** Passes, mallar, Planera pass paths and share links point at exercise ids (`tech-kullerbytta`). The database forbids renaming an id.
2. **Hidden ≠ gone.** `hidden` rows are still readable by id (so old passes keep their text) but are not listed in Biblioteket. `pending` rows are readable **only by admins**.
3. **Mallar + Planera pass** use 39 seed ids in code. Hiding one of those keeps it in the mall/guide until a code change; the admin screen says so before hiding.
4. **Redskap:** the `redskap` table mirrors the 15 fixed pieces (labels + validation). A new piece still needs a code slice (icon, sketch, hall zone, Förrådslista). The database refuses exercises with unknown redskap ids.
5. **Säkerhet for seeds** moves from `ACTIVITY_SAFETY` (code) into the `safety_line` column. The database requires it for every block except Samling (same rule as own exercises).
6. **Keys, in plain words:** the **publishable key** (Supabase's new name for the "anon key", `sb_publishable_…`) is meant to be public — it only allows what the security rules allow (reading). The **secret key** (`sb_secret_…`, new name for "service role") can do anything and must **never** be in the app, the repo, GitHub settings or chat. Supabase is retiring the old anon/service_role keys by end of 2026, so we use the new ones from the start.
7. **Coaches:** no login, nothing uploaded. Own exercises, passes, mallar, tips and hall stay in the browser exactly as today (see `content/local-vs-bank.md`).
8. **Size:** Slice 31 adds **no new library** (one plain web request). Slice 32 loads the Supabase login library **only** when someone opens the admin login, so coaches' app does not get heavier.
9. **Login link safety:** the login link must come back as `?code=…` (PKCE), not as `#…` tokens, because the app already uses `#dela=` for shared passes.
10. **Seed promotion:** in Slice 31 the PR route (`slice-30/content/seed-promotion.md`) continues, plus a re-run of the seed SQL. From Slice 32 (if E1) it is replaced by `content/bot-writes.md`.
11. **Footer:** `Träningsplaneraren · Slice 31` / `· Slice 32` when each ships.

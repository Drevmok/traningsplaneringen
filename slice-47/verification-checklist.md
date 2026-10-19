# Slice 47 — Verification checklist

**Status:** LOCKED 2026-10-19 — A1 B1 C1 D2 E1 F1.  
**Viewport:** 390×844 portrait, DPR 2, touch, clean site data unless noted. Admin rows need a build with the bank configured and **two** admin accounts (A and B) in `public.admins`; set up by Christoffer, never by SQL from the Verifier. Baseline: `evidence/measurements-390x844.txt` (main @ 9aa3996).

| # | Check |
|---|---|
| AC1 | Passbyggaren → any block → «+ Lägg till övning»: the sheet shows «Stäng», Sök, Filter and the exercise list. No tabs «Bibliotek · Tips · Mallar», no «Ny egen övning», no «Importera övningar», no «Så ni gör i er hall…», no «Visa bara övningar vi kan köra ikväll» |
| AC2 | First exercise card top ≤ 240 (main: 464). Sök and Filter work as before; the block filter preselects the block you came from; a tap on a card adds it as before |
| AC3 | Coach with saved own exercises (inject into `gymnastics-planner-own-activities-v1`): they show in the list with «Egen», «Ändra» opens the form and saves, «Ta bort» works and stays disabled when the exercise is in a pass or mall |
| AC4 | Passes, Mina mallar and share links with own exercises open and run as before (Golvklart, Kör passet, Skriv ut passet) |
| AC5 | «Använd mall» in Passbyggaren opens a sheet «Använd mall» with Föreningens mallar, Mina mallar (with «Kopiera delningskod» and «Ta bort»), Nybörjare and Kort pass. Picking works as before, with «Ersätta …» when the pass is not fresh and the «Mallen är i Passbyggaren. · Ångra» toast |
| AC6 | The Planera pass Mall step (Slice 46) is unchanged |
| AC7 | Hallöversikt → Förrådslista: no «Vad finns i hallen ikväll?» list; the rest of Förrådslista unchanged. Biblioteket shows every exercise even if the old owned list in `localStorage` had pieces unticked |
| AC8 | Logged out, and logged in as non-admin («Du är inloggad men inte admin.»): no «Admin» button on the start page, none in Passbyggaren «Mer», no admin view reachable |
| AC9 | Logged in as admin: start-page footer row 2 reads «Admin · Logga ut»; «Admin» is a button ≥ 44 px; whole start page still fits 390×844 without scrolling (Slice 46 AC3) |
| AC10 | Admin → «Mer» in Passbyggaren shows «Admin». Both entries open the view «Admin»; «Tillbaka» returns to the start page or Passbyggaren, with the pass unchanged |
| AC11 | Admin view order: lists «Väntar på godkännande (n)», «Behöver granskas (n)», «Dolda (n)» (only those with rows), then «Ny egen övning», «Importera övningar», then «Föreningens mallar» with the Slice 36 admin tools. With no rows in any list: «Inget väntar just nu.» |
| AC12 | Biblioteket for an admin has no admin bar; opening a published exercise there still shows «Ändra i banken» and «Dölj för alla» |
| AC13 | Admin A → «Ny egen övning» (Teknik, with redskap) → «Spara och skicka till granskning»: toast «Sparad. Den väntar på godkännande.»; the row appears under «Väntar på godkännande» with the «Väntar» badge |
| AC14 | Same for Samling (no Säkerhet line needed) and Styrka (Säkerhet required: the form refuses without it) |
| AC15 | (D2) Admin A opens their own pending row: «Godkänn», «Ändra i banken» and «Dölj för alla» are present; no «Väntar på att en annan admin…» line anywhere. Godkänn → published, the row shows up in Biblioteket for a coach after reload |
| AC16 | Admin B opens it: «Godkänn» present → «Godkänd. Tränarna ser den nästa gång de öppnar appen.»; it leaves Väntar. A coach device (logged out) sees it in Biblioteket after reload; before Godkänn it never did |
| AC17 | Admin B «Ändra i banken» on A's pending row and saves → B now sees no Godkänn, A sees Godkänn |
| AC18 | Dölj för alla and Visa igen on rows in «Dolda» work as Slice 32 (confirm dialog, toasts) |
| AC19 | Admin → «Importera övningar»: file and «Klistra in kod» both read; rows show «Ta med» / «Hoppa över» only; no «Plats för {n} till», no «Ersätt». A row whose title is already in the bank shows «Samma namn finns redan», starts on «Hoppa över» and says «Finns redan i banken. Tar du med den får banken två övningar med samma namn.» |
| AC20 | «Importera 3 övningar»: toast «3 övningar väntar på godkännande.»; all 3 under Väntar with new ids (`tech-egen-…` etc.), none in the coach's local own list |
| AC21 | Offline in the Admin view: «Spara och skicka till granskning» and «Importera {n} övningar» show «Du behöver nät för att ändra i banken.»; nothing is queued or saved locally |
| AC22 | Start page «Hämta ett pass» with an exercise file: message «Det här är en fil med övningar. En admin lägger in den under Admin.»; nothing imported |
| AC23 | Logga ut while in the Admin view: you land back where you came from; no admin view stays open |
| AC24 | Landscape 844×390 and desktop 1280×800: Lägg till övning, Använd mall sheet and Admin view usable; desktop side panel shows the library without tabs |
| AC25 | No new strings beyond `content/microcopy.sv.md`; locked terms as on main (Biblioteket, Godkänn, Dölj för alla, Visa igen, Logga in som admin, Logga ut, Förrådslista, Passbyggaren, Starta från mall); no exclamation marks; `rg` finds none of the deleted keys or `SideTab` in `src` |
| AC26 | No SQL run, no Supabase change. Coach chunk does not grow and has no supabase-js; numbers in PR. `npx tsc -b`, `bun test src`, `npm run lint`, `npm run build` green; footer «Träningsplaneraren · Slice 47»; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316` read `'47'` |

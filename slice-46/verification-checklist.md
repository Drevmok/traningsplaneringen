# Slice 46 — Verification checklist

**Status:** PROPOSED — written against ★ A1 B1 C1 D1 E1 F1; re-check after lock. Slice 45 shipped first.  
**Viewport:** 390×844 portrait, DPR 2, touch, clean site data unless noted. Admin rows on a build with the bank configured (as the live site). Baseline: `evidence/measurements-390x844.txt` (main @ 4fe44c0 and live).

| # | Check |
|---|---|
| AC1 | Start page, no draft: one «Planera pass» button; no «Tomt pass» or «Från mall» on the page; «Hämta ett pass» still there and works as before |
| AC2 | Start page, with draft: «Fortsätt passet» (with title · min) first, «Planera pass» under it, then «Rensa passet»; each ≥ 44 px tall |
| AC3 | Start page, no draft and with draft, admin available: document height ≤ 844, no scroll. «Uppdatera appen» and «Logga in som admin» are fully on screen |
| AC4 | Footer rows on the start page: row 1 «Tyck till · Uppdatera appen», row 2 «Logga in som admin», row 3 «Sparas lokalt i webbläsaren — inte i molnet.» in small grey text (≤ 12 px). No «·» at the start or end of a row; items in a row share one centre line; every link ≥ 44 px tall |
| AC5 | Logged in as admin: row 2 reads «Admin · Logga ut»; signed in but not admin: «Du är inloggad men inte admin. · Logga ut». After a code login focus lands on «Logga ut» (Slice 33). Logga ut works |
| AC6 | Tyck till opens the mail and shows the fallback line with the address as its own row; nothing else moves out of the screen |
| AC7 | Planera pass opens the sheet on «Fråga 1 av 4», heading «Ålder», chips 4–6 år · 7–9 år · 10–12 år · 13–18 år · Nivå, and under a thin line the links «Starta från mall» and «Tomt pass». No × in the header. Bottom row shows only «Avbryt» (no Tillbaka) |
| AC8 | Tap «7–9 år»: the chip shows as chosen, then within about 0,3 s «Fråga 2 av 4» «Fokus» opens. No «Nästa» button on any step. A quick double tap advances only one step |
| AC9 | Fokus shows Satsbräda · Trampett · Tumbling · Blandat and no line about stations or zones. Tap «Trampett» → «Fråga 3 av 4» «Hall» with exactly «Gymmix – Stora hallen» and «Gymmix – Grophallen» |
| AC10 | Tap «Gymmix – Grophallen» → «Fråga 4 av 4» «Passlängd» with «60 min», «90 min», «120 min», none preselected. Tap «90 min» → Passbyggaren opens with «Pass — trampett», «53 / 90 min», Teknik placed on Grophallen (Hallöversikt shows «Gymmix – Grophallen») |
| AC11 | Nivå: tap «Nivå» → list Nivå 9 … Nivå 1 and the line «Nivå 9 är den lägsta. Nivå 1 är den högsta.»; Tillbaka returns to the age chips; tap «Nivå 3» → Fokus. Finished pass title «Nivå 3 — …» |
| AC12 | Tillbaka on steps 2–4 goes one step back with the earlier answer marked; tapping it again moves on; choosing another answer replaces it. Progress line updates each time |
| AC13 | Avbryt on each step (1–4, Nivå list, Tomt pass and mall steps) and a tap outside the sheet: sheet closes, start page unchanged, no draft created or changed (`localStorage` draft identical before and after), focus on «Planera pass» |
| AC14 | Tomt pass: tap «Tomt pass» on step 1 → «Fråga 1 av 2» «Hall» → «Gymmix – Grophallen» → «Fråga 2 av 2» «Passlängd» → «120 min» → Passbyggaren with an empty pass as Slice 27 (Närvaro + Dagens pass), «… / 120 min», hall Grophallen. Tillbaka on Hall returns to step 1 |
| AC15 | Starta från mall: tap on step 1 → «Hall» → «Gymmix – Grophallen» → «Fråga 2 av 2» «Mall» lists Föreningens mallar (or its empty/loading text), Mina mallar (if any), Nybörjare and Kort pass. Tap «Nybörjare» → Passbyggaren with the mall, toast «Mallen är i Passbyggaren. · Ångra», hall Grophallen, Teknik markers on the Grophallen grid |
| AC16 | Mina mall saved on Stora hallen with placements, chosen with Hall «Gymmix – Stora hallen»: placements kept; chosen with Grophallen: hall Grophallen, markers re-placed in pass order. Föreningens mall: hall as answered, markers placed (no SQL, no Supabase change) |
| AC17 | Mall step has no admin tools, no «Kopiera delningskod», no «Ta bort». The Mallar tab in Lägg till övning still works as before, including admin tools (until Slice 47) |
| AC18 | With a draft: Planera pass → four answers → the new pass replaces the draft (as today) unless Christoffer picks a confirm in open item 4 |
| AC19 | Keyboard and screen reader: after each advance focus is on the new heading; the progress line is announced; chips are buttons with `aria-selected` |
| AC20 | Passbyggaren and Hallöversikt footer: row 1 «Tyck till · Visa tips igen · Uppdatera appen», row 2 admin state (if available), last line «Träningsplaneraren · Slice 46»; no «·» at a row end; Visa tips igen still restores tips and shows its status line |
| AC21 | Landscape 844×390 and desktop 1280×800: start page, sheet (scrolls inside on landscape, Avbryt reachable) and footer usable; desktop hero layout as main |
| AC22 | Print (Skriv ut passet, Golvklart) shows no footer rows and no note |
| AC23 | No new strings beyond `content/microcopy.sv.md`; locked terms as on main (Starta från mall, Passbyggaren, Hallöversikt, Logga in som admin, Logga ut, …); no exclamation marks; `rg` finds none of the deleted keys in `src` |
| AC24 | Bundle ≤ +1 kB gz JS soft (numbers vs Slice 45 in the PR); `npx tsc -b`, `bun test src`, `npm run lint`, `npm run build` green; footer «Träningsplaneraren · Slice 46»; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316` read `'46'` |

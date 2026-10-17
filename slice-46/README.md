# Slice 46 — Startsidan och Planera pass

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-17 by Christoffer: A1 B1 C1 D1 E1 F1 (the ★ recommendations). Open items: «Header buttons» = the bottom footer row; Planera pass replaces the draft without asking (as today); the note becomes «Passen sparas bara på den här enheten.» (key `draftHonestyBodyShort`).** Docs pack only, no app code. Branch `slice-46-docs` merged with current `origin/main` (Slice 45 live). Builder starts from this tip.  
**Effort:** **M+** (see below).  
**Source:** `feedback/2026-10-17-christoffer.md` row C: «one "Planera pass" (mall or tomt inside), wizard Ålder->Fokus->Hall->Passlängd auto-advance + Tillbaka, discreet local-storage note, fix mobile header buttons (Logga in/ut, Tyck till, Uppdatera).» Row B (Slice 45) lists the focus-explainer text.

## Why

The start page has three ways to begin a pass (Planera pass, Tomt pass, Från mall), and when a draft exists «Planera pass» is not there at all. The questions take a tap on «Nästa» after every answer, ask for a hall layout, and never ask how long the pass is. At the bottom, the footer links wrap onto two rows and push «Uppdatera appen» below the edge of the phone screen.

**Coach outcome:** «Jag trycker Planera pass, svarar med fyra tryck och står i Passbyggaren. Vill jag ha en mall eller ett tomt pass hittar jag det på samma ställe.»

## Measured today (main @ 4fe44c0, 390×844, `evidence/`)

- **Start page, no draft:** «Planera pass» y 590–646; «Tomt pass» and «Från mall» side by side y 658–706; «Sparas lokalt i webbläsaren — inte i molnet.» y 718–736, between the buttons and «Hämta ett pass» (y 736–776).
- **Start page, with draft:** «Fortsätt passet» is the primary button and there is **no «Planera pass»** (`Home.tsx:68–86`). Only «Tomt pass» and «Från mall» start something new.
- **Footer on the live site (admin available):** two rows. Row 1 (y 800–840): «Logga in som admin · Tyck till ·» with the separator left hanging at the line end. Row 2 (y 846–886): «Uppdatera appen», **below the 844 fold**; the start page scrolls 54 px. Cause: `export.css:1586–1602` `.home.home-entry { min-height: calc(100svh - 56px) }` reserves 56 px for the footer, but the footer is 64 px with two links and 110 px with three. The footer is in `App.tsx` (`.app-footer`), shared by every view. In Passbyggaren it also wraps: «Träningsplaneraren · Slice 44 · Tyck till ·» / «Visa tips igen · Uppdatera appen».
- **Questions:** `HomeWizard.tsx`, sheet 475 px tall, «Fråga n av 3», × in the header, «Avbryt/Tillbaka» + «Nästa/Skapa pass» at the bottom. Steps: Ålder (4–6 år, 7–9 år, 10–12 år, 13–18 år, or Nivå 9…1) → Fokus (Satsbräda, Trampett, Tumbling, Blandat) → Hallayout (5 halls). Tillbaka on step 1 already means «close» (the button reads «Avbryt»); inside the Nivå list it goes back to the ages.
- **No pass length in the questions.** The proposal is always 53 min (Samling 6, Uppvärmning 10, Teknik 3 × 6, Styrka 13, Lek och spel 6; `data/wizardPaths.ts`) and `targetMinutes` is not set, so Passbyggaren shows «53 / 60 min». Pass lengths in the app: `PASS_LENGTHS = [60, 90, 120]`, default 60 (`data/blockMeta.ts:101–108`), chosen today in the Passbyggaren title row (`SessionBuilder.tsx:493–515`).
- **Mall today:** «Från mall» opens Passbyggaren with the «Mallar» tab of Lägg till övning (`LibraryPanel.tsx:292–347`: Föreningens mallar, Mina mallar, Nybörjare and Kort pass). Slice 47 (row D) removes that tab.

## Option values (from the app, after Slice 45)

| Step | Chips |
|---|---|
| Ålder | 4–6 år · 7–9 år · 10–12 år · 13–18 år · Nivå (opens Nivå 9 … Nivå 1, with «Nivå 9 är den lägsta. Nivå 1 är den högsta.») |
| Fokus | Satsbräda · Trampett · Tumbling · Blandat |
| Hall | Gymmix – Stora hallen · Gymmix – Grophallen (Slice 45 names, ids `forening-bla` / `forening-vit`) |
| Passlängd | 60 min · 90 min · 120 min |

## Options (★ = Docs recommendation)

### A — Where Tomt pass and Starta från mall go
- **A1 ★** The start page has one «Planera pass» button. It opens the sheet on Ålder. Under the age chips, after a thin line, two quiet links: «Starta från mall» and «Tomt pass». The main path costs no extra tap, and the other two are one tap away.
- **A2** The sheet opens on a choice first: «Svara på fyra frågor», «Starta från mall», «Tomt pass». Clear, but one more tap on the main path.
- **A3** Keep «Tomt pass» and «Från mall» on the start page under «Planera pass» (today). Against the feedback.

With a draft (all options): «Fortsätt passet» stays the primary button, and «Planera pass» sits under it as a secondary button, then «Rensa passet».

### B — What Tomt pass and Starta från mall ask
- **B1 ★** Both ask for the hall, so every pass can be on Grophallen (Slice 45 removes the hall picker from Hallöversikt). **Tomt pass:** Hall → Passlängd → Passbyggaren with an empty pass. **Starta från mall:** Hall → Mall → Passbyggaren. The Mall step lists Föreningens mallar, Mina mallar and the built-in mallar in the sheet (the same list as the Mallar tab today, moved into a shared component). The chosen hall replaces the mall's own hall, and Teknik is placed again on that hall.
- **B2** Tomt pass and Starta från mall skip the questions: both start on Stora hallen (Slice 45 B1) and Starta från mall opens today's Mallar tab. Smaller, but Grophallen is then only reachable through the four questions, and it breaks when Slice 47 removes the tab.
- **B3** As B1, and Starta från mall also asks Passlängd (Hall → Mall → Passlängd).

### C — Moving forward, Tillbaka and Avbryt
- **C1 ★** A tap on a chip is the answer. The chip shows as chosen for about 250 ms, then the next question opens. No «Nästa», no «Skapa pass»: the last tap makes the pass and opens **Passbyggaren**. At the bottom: «Tillbaka» and «Avbryt». The × in the header goes (Avbryt does the same).
  - **Tillbaka** goes one step back with the earlier answer still marked; a tap on it, or on another chip, moves on again. **On step 1 there is no Tillbaka**, only Avbryt. Inside the Nivå list, Tillbaka goes back to the age chips. On the first step of the Tomt pass and mall paths (Hall), Tillbaka goes back to step 1.
  - **Avbryt** (and a tap outside the sheet) closes it on any step. Nothing is made or saved, the draft is untouched, the answers are forgotten, and focus goes back to «Planera pass».
- **C2** As C1, but keep the × and drop the Avbryt button.
- **C3** Keep «Nästa» after each answer. Against the feedback.

### D — Passlängd
- **D1 ★** Last question «Passlängd» with «60 min», «90 min», «120 min». It sets the pass length only; the proposal stays the same 53 min, so Passbyggaren shows «53 / 90 min» and you add what you want. The Tomt pass path sets the same length on the empty pass.
- **D2** A longer pass gets more in it: 90 and 120 min stretch Teknik and Lek och spel. Needs a new path table where Christoffer picks the extra drills. L, a slice of its own.
- **D3** No Passlängd question; the pass starts at 60 min and you change it in Passbyggaren as today. Against the feedback.

### E — Start page: the local note and the footer links at 390×844
- **E1 ★** Everything fits on one screen without scrolling. Top to bottom on the start page: «Planera pass» (or «Fortsätt passet», «Planera pass», «Rensa passet»), «Hämta ett pass», then a quiet foot inside the start pane: row 1 «Tyck till · Uppdatera appen», row 2 «Logga in som admin» (or «Admin · Logga ut», or «Du är inloggad men inte admin. · Logga ut»), row 3 the note «Passen sparas bara på den här enheten.» in small grey text. The picture above gives way. No separator at a line end, every link at least 44 px tall. In Passbyggaren and Hallöversikt the footer uses the same rows, with «Visa tips igen» in row 1 and «Träningsplaneraren · Slice 46» as the last, smallest line.
- **E2** One «⋯» button at the top right of the start page opens a small menu with Tyck till, Uppdatera appen and Logga in som admin. Very quiet, but it hides Tyck till and adds a new menu.
- **E3** Keep the footer as it is; only stop the hanging separator and move the note into the footer. Smallest, but «Uppdatera appen» can still end up below the edge.

### F — Copy, dead code, budget
- **F1 ★** Strings exactly as `content/microcopy.sv.md`; no locked term changes; the dead code in `HANDOFF.md` §7 removed; `SLICE_NUMBER = '46'`. If Slice 45 is locked without D1, F1 also removes the focus explainer (`wizardFocusHonesty`) and `wizardQ3Hint`. Budget +1 kB gz soft; expected **+0.3 to +0.9 kB gz JS**, CSS about even (step logic, Mall step, footer rows in; «Nästa» and «Skapa pass», the start-page links, 13 strings no one reads today plus 4 that stop being read, and the one-shot mall flag out; estimate, not measured).
- **F2** As F1 but leave the unused strings and the one-shot mall flag for a later clean-up.

## Focus explainer

The only coach-facing text that explains focus is `wizardFocusHonesty` «Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok.» (`data/blockMeta.ts:469`, shown on wizard steps 2 and 3 by `HomeWizard.tsx:128–130`, CSS `.home-wizard-honesty` `App.css:3241–3251`). `wizardQ3Hint` (`blockMeta.ts:468`, `HomeWizard.tsx:124–126`) also mentions focus. **Slice 45 D1 removes both**, so Slice 46 does not repeat it unless 45 locks D2 or D3 (then see F1).

## Dependencies on Slice 45

1. **Hall names:** the Hall step shows «Gymmix – Stora hallen» and «Gymmix – Grophallen» from `HALL_PRESETS[id].label` (45 F1). Without 45 it would show five halls.
2. **One hall per pass, chosen at the start:** 45 B1 removes the hall picker from Hallöversikt, so the hall is set only when the pass is made. 46 B1 adds the Hall step to Tomt pass and Starta från mall so every kind of pass can be on Grophallen. If 45 locks B2 (a toggle in Hallöversikt), 46 B2 is enough.
3. **Focus explainer:** removed by 45 D1 (see above).
4. **Same files:** both change `HomeWizard.tsx`, `Home.tsx`, `data/blockMeta.ts`, `App.css` and the `SLICE_NUMBER` asserts. Build 46 on top of 45.

Also ahead: Slice 47 (row D) removes the Mallar tab from Lägg till övning. 46 B1 moves the mall list into Planera pass first, so 47 can drop the tab without losing it. The admin tools for föreningens mallar stay in the Passbyggaren tab until 47's Admin area exists.

## Effort: M+

Not M: three paths through one sheet (four questions, Tomt pass, mall), auto-advance with focus handling, the mall list moved into the sheet and shared with the Mallar tab until 47, start page with and without draft, footer rows on every view, and new tests for the step logic and `targetMinutes`. Not L: no data format change, no new storage, no SQL, `composeWizardSession` only gains `targetMinutes`.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, file:line refs, dead code, tests, bundle
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC24 at 390×844 (against ★)
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — new, changed, kept and removed strings
- [`evidence/`](./evidence/) — main @ 4fe44c0 and live screenshots, `measurements-390x844.txt`
- Living docs: new [`docs/planera-pass.sv.md`](../docs/planera-pass.sv.md); Slice 46 notes in `docs/home-wizard.sv.md`, `docs/ui-chrome.sv.md`, `docs/README.md`

## Out of scope

Hall names and the Hallöversikt picker (Slice 45), Lägg till övning tabs and the Admin area (Slice 47), Hallöversikt edit mode (Slice 48), longer proposals for 90 and 120 min (D2), new age groups, focus types or drills, the update banner «En ny version finns.» at the top, «Hämta ett pass».

## Open items for Christoffer

1. Lock A–F.
2. «Header buttons»: on main, Logga in / Logga ut, Tyck till and Uppdatera appen are at the **bottom** of the start page (the footer), not at the top. Docs read the feedback as that row. If you meant something at the top of the screen (for example the «En ny version finns» banner), say so.
3. Starta från mall and Passlängd: B1 asks Hall → Mall and keeps the mall's own minutes with a 60 min pass length. Should it also ask Passlängd (B3)?
4. Planera pass with a draft: today a finished question round replaces the draft at once, without asking. Keep that, or show «Ersätta utkastet här?» first (a Slice 45 compact confirm)?
5. The note: keep «Sparas lokalt i webbläsaren — inte i molnet.» word for word, or a plainer «Passen sparas bara på den här enheten.»? Docs kept today's text.
6. Order: Slice 45 must ship first.

# Passbyggaren

**What:** Build a pass across Samling → Uppvärmning → Teknik → Styrka → Lek och spel.

**Reach:** Home → new pass or continue draft → Passbyggaren.

**Drive:**
1. Add or open activities in at least one block (prefer Teknik for hall-related slices).  
2. Scroll the full builder on ~390px width.  
3. Edit pass title if exposed (`aria-label` pass title).

**Prove:** Blocks visible in Swedish; scroll works; changes autosave to the draft within ~1 s (Slice 39: no Spara utkast button; muted «Sparat» in the action row; reload keeps the pass); no stuck overlay blocking scroll (`body` overflow not left `hidden`).

**Slice 47 — Lägg till övning (A1):** «+ Lägg till övning» on a block opens one sheet: **Stäng**, Sök, Filter (block preselected from the block you came from), the exercise list. No tabs (Bibliotek · Tips · Mallar gone, `SideTab` deleted), no Ny egen övning / Importera övningar / ownHint / «Visa bara övningar vi kan köra ikväll». Phone sheet height is fixed `min(92svh,100%)`; first card top ≈ 239 px at 390×844 (main 464). Tap card → detail → «Lägg till i valt block». Own exercises (`gymnastics-planner-own-activities-v1`, created before Slice 47 or by import of older versions) still show with «Egen» + Ändra / Ta bort (Ta bort disabled while used in a pass or mall). Desktop: the side panel shows the same library without tabs.
**Mer (Slice 47):** «Använd mall» opens the MallSheet (see starta-fran-mall.md). Admins also get «Admin» in Mer (→ admin.md); never for logged-out / non-admin.
**Drive tip:** `lib(p, blockIdx)` = `.block-card:nth(i)` → «Lägg till övning» → `.side-panel-slot.is-open .side-panel-frame`.
**Slice 48 (A1):** on the phone «Hallöversikt» is reached directly from the action row («Kör passet» · «Hallöversikt» · «Mer»), no longer via «Mer». Empty pass: the button is disabled with an announced hint («Lägg till minst en övning först», `#hall-cta-hint`). The Teknik block's order follows the hall's station order (Ändra stationer, see hall-redigera-redskap.md).

**Slice 49:** after Planera pass the length row reads «X / X min». Changing the length later shows e.g. «90 / 60 min»; item times do not change.

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Passbyggaren | `.builder` | `App.css`, `App.tsx` |
| Block | `.block-card` | `App.css`, `components/BlockCard.tsx` |
| Lägg till övning | `role=button «Lägg till övning»` | `App.css`, `components/LibraryPanel.tsx` |
| Biblioteket (öppen sidopanel) | `.side-panel-slot.is-open .side-panel-frame` | `App.css`, `components/HallBoard.tsx` |
| Hallöversikt i åtgärdsraden | `.builder-actions .builder-hall` | `App.css`, `components/SessionBuilder.tsx` |
| Knapp «Hallöversikt» | `role=button «Hallöversikt»` | `App.css`, `App.tsx` |
| Tom-pass-tips | `#hall-cta-hint` | `components/SessionBuilder.tsx` |
| Mer-menyn | `.more-menu-panel` | `components/SessionBuilder.tsx`, `export.css` |
| Ta bort övning | `.item-remove` | `components/BlockCard.tsx`, `components/SessionBuilder.tsx` |
| Minuter per övning | `.item-duration input` | `App.css`, `components/ActivityTip.tsx` |

**Slice 56:** Lägg till i Teknik (Biblioteket eller «Lägg till station») kör `applyAllSuggestedStationEquipment` på hela passet → ingen saknar-rad för nya stationen; rensad `[]` och egen lista står kvar. Tillägg i andra block ändrar inga redskap. Starta från mall utan tillägg: saknar-raden syns som förut.

**Slice 57 (egen övning):** «Ny egen övning» (Teknik) har «Ställ upp stationen» efter «Välj redskap» → skissbladet; layouten sparas lokalt med övningen, följer med vid «Skicka till banken» och i delning.

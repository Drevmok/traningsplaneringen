# Slice 45 — microcopy (Swedish): hallar och städning

**Status:** PROPOSED 2026-10-17, written against ★ (B1, C1, D1, E1, F1, F3). Warm, du-form, no exclamation marks. Locked terms unchanged: gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, Godkänn, Dölj för alla, Visa igen, Logga in som admin, Logga ut.

## Renamed (ids unchanged)

| Id | Today | New (exact, en dash U+2013 with spaces) |
|---|---|---|
| `forening-bla` | Blå hall | **Gymmix – Stora hallen** |
| `forening-vit` | Vit hall | **Gymmix – Grophallen** |

Single source: `HALL_PRESETS[id].label`. Shown in wizard Q3 chips, the Hallöversikt meta line (new, read-only) and the Golvklart meta line.

## Changed

| Key | Today | New |
|---|---|---|
| `wizardQ3Label` | Hallayout | **Hall** |

## Removed (no longer shown)

| Key | Text today |
|---|---|
| `hallLayout` | Hallayout |
| `hallPresetStandard`, `hallPresetTavling`, `hallPresetLiten` | Standard trupp · Tävling / linjer · Liten hall |
| `hallPresetBla`, `hallPresetVit` | Blå hall · Vit hall (duplicates of the preset labels) |
| `hallPresetMigrateNote` | Placerade övningar flyttas till samma zon i den nya layouten när det går. |
| `hallPresetCoachTip` | Blå hall och Vit hall är föreningens ritningar. Där placerar du fritt. De andra är generella scheman. |
| `hallHintsInfo`, `hallHintsInfoAria`, `hallHintsHide`, `hallHintsHideAria` | Tips om placering · … · Dölj tips · Dölj placeringstipsen |
| `hallDragHint` | Förslagen ligger redan i zonen. Dra bara det som sitter fel, eller välj en station och tryck Placera här. |
| `hallSnapHint` | Släpp på en zon för att fästa stationen där. På öppen yta kan du placera fritt. |
| `tipHallPlace` | Stationerna föreslås i zonen för redskapet. Dra bara det som sitter fel. Tryck en markör för detaljer. |
| `wizardQ3Hint` | Välj den layout som liknar er hall. Teknik fäster i zon efter fokus. |
| `wizardFocusHonesty` | Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok. |

The multi-line hint paragraphs under the hall (`hallStationOrderHint`, `hallStationsOnlyHint`, `hallTileHint`) leave Hallöversikt edit; keep the keys if the no-stations state or a11y labels still use them.

## Unchanged (kept exactly)

| Key | Svenska |
|---|---|
| `hallSchematicNote` | Schematisk hall — inte exakt mått |
| `tipHallFlowGolvklart` | Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. Golvklart är till för att visa gruppen — skriv ut eller håll upp skärmen. |
| `clearPass`, `clearPassTitle`, `clearPassBody`, `clearPassConfirm`, `wizardCancel` | Rensa passet · Rensa passet? · Passet försvinner från den här enheten. Sedan kan du planera ett nytt från början. · Rensa · Avbryt (only the dialog size changes) |
| Zone label | Öppen yta |
| `footerSliceLabel` / `feedbackMailVersion` | Träningsplaneraren · Slice 45 / Version: Slice 45 |

## Dela sheet (F3): size only, strings unchanged

F3 changes how tall the Dela sheet is on phones. Every string stays as Slice 44 locked it: `export` «Dela», `close` «Stäng» (× label), `exportShareLink` / `exportCopy` «Kopiera länk», `exportShareHint`, `exportCopied` «Länken är kopierad.», `exportCopyManual`, `exportPrintPass` «Skriv ut passet», `exportPrintPassHint`, `printStalled`.

## Options that need extra strings

- **C2:** `tipHallPlace` → «Stationerna läggs ut i passets ordning. Dra en markör om den ska stå någon annanstans.»
- **D2:** new `wizardQ3Hint` → «Välj hallen ni tränar i.»

## Not allowed

Abbreviating to «Stora hallen» / «Grophallen» without «Gymmix – » in labels, hyphen instead of en dash, exclamation marks, renaming Hallöversikt, Golvklart, Förrådslista or «Öppen yta».

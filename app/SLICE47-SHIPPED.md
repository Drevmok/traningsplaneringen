# Slice 47 — Lägg till övning + Admin (shipped notes)

**Locked:** A1 B1 C1 **D2** E1 F1 (Christoffer, 2026-10-19). Base `origin/slice-47-docs` @ 3c63fef (main 9aa3996). **No SQL, no Supabase change, live project never touched.** D2 overrides HANDOFF §4: no peer rule, no `adminApproveOther`, no `updated_by` check.

## What changed

- **A1 Lägg till övning = Biblioteket only** (`LibraryPanel`): Stäng, Sök, Filter, list. Tabs, Tips/Mallar bodies, admin bar, own buttons + `ownHint`, «ikväll» checkbox gone. `SideTab` deleted; sheet `aria-label` «Lägg till övning». On phones the sheet keeps one height (`min(92svh,100%)`) so the list starts at the same place for every filter: first card **y 239** (main 464).
- **«Använd mall»** opens the new `MallSheet` «Använd mall» (MallList with Kopiera delningskod / Ta bort; no admin tools); picks use the existing pick / TemplateConfirm / Ångra flow. Scrolls inside, max `100dvh − 32px` (landscape OK).
- **B1**: «Vad finns i hallen ikväll?» removed from Förrådslista, HallBoard wiring removed, `lib/ownedEquipment.ts` deleted (only the redskap library test kept). Old localStorage keys are not read, written or cleared.
- **C1 Admin view** (`AdminArea`, lazy): `View` gains `'admin'`, `adminFrom` remembers start page / Passbyggaren. Entries: start-page footer «Admin» is now a button (`aria-label` «Öppna Admin», 44 px) and Passbyggaren «Mer» → «Admin» (autosave flushed first). Order: Väntar på godkännande (n) · Behöver granskas (n) · Dolda (n) (only lists with rows; all empty → «Inget väntar just nu.»), Ny egen övning + hint, Importera övningar + hint, Föreningens mallar (ClubAdminSection, cards not pickable). Tap → ActivityDetail + AdminDetailPanel + AdminBankForm. Logga ut / not admin any more → back to where you came from (derived, no effect).
- **D2 new rows**: `insertPendingRow` (bankWrite) — id `{gather|warm|tech|strength|fun}-egen-<base36 time><4>`, `status 'pending'`, `visual_key 'own'`, redskap only on Teknik, no `'egen'` tag, `updated_by` never sent; 23505 → retry once → `'exists'`; offline → `'offline'`. `AdminBankForm mode='new'`: title «Ny egen övning», save «Spara och skicka till granskning», toast «Sparad. Den väntar på godkännande.» (edit mode unchanged). Pending rows now show **Godkänn · Ändra i banken · Dölj för alla** for every admin (AC15).
- **E1**: `OwnActivityForm` is edit-only (no «new» path, no `ownFull`); own cards keep Egen / Ändra / Ta bort.
- **F1 import into the bank**: `OwnImportSheet` moved into Admin (lazy); rows resolved against the admin bank titles (all statuses): `new | sameName | invalid`, choices Ta med / Hoppa över only, same title starts on Hoppa över with «Finns redan i banken. …». «Importera {n} övningar» inserts pending rows one by one (`importPendingRows`, stops at the first failure, one reload) → «{n} övningar väntar på godkännande.» / «1 övning …». Offline: «Du behöver nät för att ändra i banken.», button disabled. `isExerciseFile` split into `lib/exerciseFile.ts` so the import parser left the coach chunk. Hämta ett pass text changed.
- **Strings** per `content/microcopy.sv.md` (10 new, 3 changed, 22 removed incl. `TIPS_TAB` and `library`). `SLICE_NUMBER = '47'`; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316`.
- **Dead CSS** removed: `.side-tabs*`, `.tips-body*`, `.tips-kicker`, `.tips-exercise-*`, `.library-own*`, `.library-tonight*`, `.forrad-owned*`, `.admin-bar`, `.admin-chip`, `.admin-filter-chip`. New: `.admin-area*`, `.mall-sheet*`.

## Checks

| Check | Result |
|---|---|
| `bun test src` | 245 pass, 0 fail (30 files) |
| `bun test tools/bank` | 21 pass, 0 fail (5 skipped) |
| `npx tsc -b` | clean |
| `npm run lint` | 0 errors, 6 warnings (same 6 as main 9aa3996) |
| `npm run build` | green |
| Self-smoke `verifier/slice-47-builder-smoke.mjs` (390×844 + 844×390 + 1280×800, Supabase faked in the browser by `verifier/slice-47-fake-supabase.mjs`) | **32/32 PASS** |

## Bundle (gzip -9, main 9aa3996 → branch)

| Chunk | main | branch | Δ |
|---|---:|---:|---:|
| Coach `index` JS | 134 686 | 130 422 | **−4 264** |
| AdminArea (new, lazy) | — | 3 872 | +3 872 |
| bankWrite (lazy) | 1 174 | 1 822 | +648 |
| AdminBankForm / AdminDetailPanel / AdminLoginSheet / adminBank / session (lazy) | 8 457 | 8 551 | +94 |
| supabase-js `dist` (lazy) | 54 270 | 54 270 | 0 |
| **All JS** | 198 587 | 198 937 | **+350** |
| CSS | 14 131 | 13 881 | **−250** |

supabase-js is not in the coach chunk.

## Deviations / notes

- **AC17 conflicts with D2**: the checklist says that after B «Ändra i banken» B sees no Godkänn. Under D2 both admins keep Godkänn; smoke checks the D2 behaviour. HANDOFF §10 `canApprove` test not written (D2).
- `ownHint` removal also drops «Så ni gör i er hall. Övningen stannar i den här webbläsaren.» from the «Ändra egen övning» form (the key is removed by the microcopy).
- New-exercise form hides `adminFormHint` («Ändringen syns för alla tränare.», not true for a pending row); no replacement string.
- Sheet height fixed on phones (≤ 768 px) to meet AC2 for every filter (otherwise a short list let the sheet shrink and pushed the first card to y 269).
- Import with a mid-batch failure: what went in is reported by the toast; the rest stay in the file (no extra string for «n of m»).
- `importOwnActivities` kept in `ownActivities.ts` (tests use it; tree-shaken from the app).
- The footer «Admin» button is shown wherever the admin footer row is (start page, Passbyggaren, Hallöversikt); the shared-link view keeps the plain badge.

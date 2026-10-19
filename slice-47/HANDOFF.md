# Slice 47 — Builder handoff

**Status:** LOCKED 2026-10-19 by Christoffer: A1 B1 C1 **D2** E1 F1. D2 overrides D1 below: **no peer rule** — every admin, also the author, sees «Godkänn» on pending rows; drop `adminApproveOther` and any `updated_by === me` check. Christoffer is the only admin today. Base `origin/main` @ `9aa3996` (Slice 46 live); line refs are from that tip. **No SQL, no Supabase change, no new storage key.** Scope: `components/LibraryPanel.tsx`, `SessionBuilder.tsx`, `ForradslistaSheet.tsx`, `HallBoard.tsx`, `OwnImportSheet.tsx`, `AdminBankForm.tsx`, `AdminDetailPanel.tsx`, `ClubAdminSection.tsx`, `MallList.tsx`, `App.tsx`, new `components/AdminArea.tsx`, new `components/MallSheet.tsx`, `lib/admin/bankWrite.ts`, `lib/admin/adminBank.ts`, `lib/ownImport.ts`, `lib/ownedEquipment.ts`, `types.ts`, `data/blockMeta.ts`, CSS, tests.

## What exists today (main @ 9aa3996)

- **Sheet:** `SessionBuilder.tsx:620–683` (`.side-panel-slot` → `LibraryPanel`), `sideTab` state `:102`, `openPanel(tab)` `:241–244`, «Använd mall» → `openPanel('templates')` `:444–450`, sheet `aria-label` by tab `:628–634`.
- **LibraryPanel:** tabs `:126–145`; library body `:147–259` (admin bar `:149–177`, search, filter, own buttons + `ownHint` `:202–215`, «ikväll» `:218–231`, list with own-card Ändra / Ta bort `:232–257`); Tips `:261–289`; Mallar `:291–303` (`MallList` with `clubAdminSlot`, `onCopySaved`, `onDeleteSaved`).
- **Own exercises:** `lib/ownActivities.ts` (key `gymnastics-planner-own-activities-v1`, `MAX_OWN = 100`, ids `own-…`, `visualKey: 'own'`); form `OwnActivityForm.tsx`; import `OwnImportSheet.tsx` + `lib/ownImport.ts` (`RowState` `new | sameName | exists | invalid | noRoom`, `RowChoice` `include | skip | replace`).
- **Owned equipment:** `lib/ownedEquipment.ts` `loadOwnedEquipment` `:39`, `saveOwnedEquipment` `:59`, `ownsEveryPiece` `:66`, `activityFitsOwned` `:72`, `loadTonightFilter` `:79`, `saveTonightFilter` `:90`; list in `ForradslistaSheet.tsx:86–106`, fed from `HallBoard.tsx:97, 714, 722`. Nothing else reads the owned list.
- **Admin:** state `lib/admin/state.ts` (`none | checking | admin | notAdmin`), `useAdmin`, `useAdminBank` (entries, `counts.pending/review/hidden`, `updatedBy`); writes `lib/admin/bankWrite.ts` (UPDATE only, guarded by `updated_at`; `approveRow`, `hideRow`, `unhideRow`, `markRowReviewed`, `saveRow`); `AdminDetailPanel.tsx` (actions by status), `AdminBankForm.tsx` (edit one row by id), `AdminStatusBadge`, `ClubAdminSection` (`onPick`, `onToast`). Footer admin row `App.tsx:308–325` (badge `:315`). Views `type View = 'home' | 'builder' | 'hall'` `App.tsx:53`.

## 1. A1 — Biblioteket only (`LibraryPanel.tsx`, `SessionBuilder.tsx`, `types.ts`)

- Delete the tab row, the Tips and Mallar bodies, the admin bar, the own buttons + `ownHint`, and the «ikväll» label. Keep search, filter, list, own-card «Ändra» / «Ta bort» (E1), admin badges on cards (`adminBadgesFor`).
- Drop props `tab`, `onTabChange`, `selectedBlockType`, `blockActivities`, `onReadActivity`, `onPickTemplate`, `savedTemplates`, `onPickSaved`, `onCopySaved`, `onDeleteSaved`, `onPickClub`, `clubAdminSlot`, `onCreateOwn`, `onImportOwn`. Delete `SideTab` (`types.ts:119`), `sideTab`, the tab argument of `openPanel`; sheet `aria-label` = `UI.addActivity` «Lägg till övning».
- New `MallSheet.tsx`: bottom sheet titled «Använd mall» (`UI.useTemplate`) with «Stäng», rendering `MallList` with `onCopySaved` / `onDeleteSaved` (Mina mallar tools) and **without** `clubAdminSlot`. «Använd mall» opens it; picks go through the existing `pick` / `handleConfirm*` (TemplateConfirm when the pass is not fresh). Same sheet CSS as the library sheet.
- Target at 390×844: first exercise card top ≤ 240 (main: 464).

## 2. B1 — «ikväll»

- Delete the checkbox, `tonightOnly`, the filter line `:102`, `loadTonightFilter`, `saveTonightFilter`, `TONIGHT_KEY`, `activityFitsOwned`, `ownsEveryPiece` if unused after `rg`.
- Delete the «Vad finns i hallen ikväll?» section `ForradslistaSheet.tsx:86–106` and its props `ownedIds` / `onToggleOwned`; `HallBoard.tsx:97, 714, 722` stop loading/saving the owned list. Keep `loadOwnedEquipment` / `saveOwnedEquipment` only if a test or other reader remains; otherwise delete with the migration in `ownedEquipment.ts:37–58` and its tests (`ownedEquipment.test.ts:41–70`; keep the redskap library test `:24–40`).
- Do not write or clear the old `localStorage` keys.

## 3. C1 — Admin view (`App.tsx`, new `AdminArea.tsx`, lazy)

- `type View = 'home' | 'builder' | 'hall' | 'admin'`; remember `adminFrom: 'home' | 'builder'`. If `admin.state` leaves `'admin'` while the view is open (Logga ut, expiry), return to `adminFrom`.
- Entries (both only when `admin.state === 'admin'`): start-page footer row 2 — the «Admin» badge `App.tsx:315` becomes `<button className="btn-text visa-tips-igen footer-admin-open" aria-label={UI.adminAreaOpenAria}>{UI.adminBadge}</button>`, ≥ 44 px; Passbyggaren `renderPassExtras` gets a `btn-secondary` «Admin» (`UI.adminArea`) after «Publicera som föreningsmall». Autosave `flush()` before leaving Passbyggaren.
- `AdminArea.tsx` (lazy chunk with the other admin code): header «Admin» + «Tillbaka» (`UI.wizardBack`). Sections:
  1. Three lists from `useAdminBank()`: «Väntar på godkännande ({n})», «Behöver granskas ({n})», «Dolda ({n})» (existing strings), same filters as `LibraryPanel.tsx:84–96`; a list with 0 rows is not shown; all three 0 → «Inget väntar just nu.» Rows are `ActivityCard` with `AdminStatusBadge` / review badge; a tap opens `ActivityDetail` read-only for the pass (no «Lägg till») with `AdminDetailPanel` + `AdminBankForm` as in Passbyggaren.
  2. «Ny egen övning» (`UI.ownNew`) and «Importera övningar» (`UI.ownImport`), each with one hint line.
  3. «Föreningens mallar» via `ClubAdminSection` with `onPick` optional (cards not pickable here) and `onToast`.
- Toasts in the view use the existing toast component.

## 4. D2 — new pending rows (peer rule NOT built; see status) (`bankWrite.ts`, `AdminBankForm.tsx`, `AdminDetailPanel.tsx`)

- `insertPendingRow(patch: BankPatch, extra?: { tags?: string[]; difficulty?: Difficulty; needs_coach_review?: boolean }): Promise<WriteResult | 'exists'>`:
  - id `${PREFIX[block_type]}-egen-${Date.now().toString(36)}${random4}` with `PREFIX = { gathering: 'gather', warmup: 'warm', techniques: 'tech', strength: 'strength', fun_and_games: 'fun' }` (matches `^(gather|warm|tech|strength|fun)-[a-z0-9-]{2,60}$`).
  - `status: 'pending'`, `visual_key: 'own'` (the app already renders it), `sort_order` default, tags without `'egen'`, `default_station_equipment` only on Teknik, `safety_line` required except Samling (same as `needsSafetyLine`).
  - `.insert(row).select('id')`, same timeout/offline handling as `writeRow`; on success `loadAdminBank()`. Postgres `23505` → `'exists'` (retry once with a new id).
  - `updated_by` is set by the database (`private.stamp_updated_by`); do not send it.
- `AdminBankForm`: add `mode: 'edit' | 'new'`. `'new'` starts empty with `blockType` = the first block, title «Ny egen övning», save button «Spara och skicka till granskning» → `insertPendingRow`; toast «Sparad. Den väntar på godkännande.» Edit mode unchanged.
- Peer rule in `AdminDetailPanel` (pending rows only): read the signed-in e-mail once from `client.auth.getSession()` (`lib/admin/session.ts:41` pattern; expose `adminEmail()` from the lazy session module, keep it in memory only). If `entry.updatedBy?.toLowerCase() === email.toLowerCase()`, hide «Godkänn» and show `UI.adminApproveOther` instead. «Ändra i banken» and «Dölj för alla» stay. This is app-side only (see README D3).
- Coaches never see pending rows (RLS `exercises_read_public`, and `applyBankEntries` takes published + hidden only). Do not change that.

## 5. E1 — coaches' own exercises

- No migration, no deletion. `loadOwnActivities` / own cards / `OwnActivityForm` edit / `deleteOwnActivity` / `ownInUse` stay. `OwnActivityForm` is reached only from «Ändra» on an own card; delete its «new» path (`initial === null`) and `ownFull` handling once no caller remains.
- Own exercises in share links and mallar keep working (`ShareOwn`, unchanged).

## 6. F1 — import into the bank (`OwnImportSheet.tsx`, `lib/ownImport.ts`)

- Opened only from Admin. Parse as today (`parseExerciseFile`, `stripFence`). Resolve rows against **the admin bank** (`useAdminBank().entries`, all statuses) instead of local own exercises: `sameName` = a bank row with the same title (case-insensitive) → state «Samma namn finns redan», default «Hoppa över», note `adminImportNoteSameName`; drop `exists` / `replace` / `noRoom` and the room line. «Läs in» only reads, as today. «Importera {n} övningar» (`ownImportConfirm`) calls `insertPendingRow` per included row (sequential), then one toast `adminImportDone` «{n} övningar väntar på godkännande.» (or `adminImportDoneOne`); on a failure stop, report how many went in, leave the rest (no partial retry logic beyond that).
- File `id`, `progressionOf`, `regressionOf` are ignored (new ids); `source`, `tags`, `difficulty`, `needsCoachReview`, `experiencedCoachOnly` carried over within the bank limits.
- «Hämta ett pass» (`Home.tsx`): `importIsExercises` text changes (microcopy).

## 7. Strings (`data/blockMeta.ts`)

As `content/microcopy.sv.md`.

## 8. CSS

New: `.admin-area` (page layout like Passbyggaren, max-width as `.builder`), `.admin-area-section`, `.footer-admin-open`, `.mall-sheet` (reuse `.side-panel-frame`). Delete per §9.

## 9. Dead code (F1)

| What | Where | Note |
|---|---|---|
| Tab row, Tips body, Mallar body | `LibraryPanel.tsx:126–145, 261–303` | A1 |
| `SideTab`, `sideTab`, tab-based `aria-label`, `onTabChange` | `types.ts:119`, `SessionBuilder.tsx:102, 241–244, 628–634, 647–652` | A1 |
| `TIPS_TAB` | `data/blockMeta.ts:88–` | only reader is the Tips tab |
| `UI.tips`, `UI.templates`, `UI.selectBlockForTips`, `UI.tipsBlockLead`, `UI.tipsExercisesLead`, `UI.tipsNoExercises` | `blockMeta.ts:175–176, 218–222` | `rg` first: `UI.library` stays only if still read |
| Admin bar + `adminFilter` state | `LibraryPanel.tsx:84–96, 149–177` | moves to `AdminArea` |
| Own buttons, `UI.ownHint`, `onCreateOwn`, `onImportOwn`, `setOwnEdit('new')`, `ownImportOpen` in SessionBuilder | `LibraryPanel.tsx:202–215`, `SessionBuilder.tsx:677–678, 832–838` | import sheet now in `AdminArea` |
| `UI.ownFull`, OwnActivityForm «new» path | `blockMeta.ts`, `OwnActivityForm.tsx` | E1 |
| «ikväll»: `UI.libraryTonight`, `UI.libraryTonightHint`, `tonightOnly`, `loadTonightFilter`, `saveTonightFilter`, `TONIGHT_KEY`, `activityFitsOwned`, `ownsEveryPiece` | `blockMeta.ts:212–214`, `LibraryPanel.tsx:13, 79–83, 102, 218–231`, `lib/ownedEquipment.ts` | B1 |
| Förrådslista owned list: `UI.ownedEquipmentTitle`, `UI.ownedEquipmentHint`, section, props, HallBoard wiring | `blockMeta.ts:215–217`, `ForradslistaSheet.tsx:86–106`, `HallBoard.tsx:39, 97, 714, 722` | B1 |
| Import local-room logic: `noRoom`, `replace`, `exists`, `UI.ownImportRoom`, `UI.ownImportRoomNone`, `UI.ownImportReplace` | `lib/ownImport.ts:25–26, 265–275`, `OwnImportSheet.tsx`, `blockMeta.ts:618–623` | F1 |
| `MallList` comments «Mallar tab only (until Slice 47)»; `clubAdminSlot` prop if no caller | `MallList.tsx` | MallSheet does not pass it |
| CSS `.side-tabs*` | `App.css:853–870, 1241, 1503` | |
| CSS `.tips-body*`, `.tips-kicker`, `.tips-exercise-*` | `App.css:1048–1075, 1128–1135`, `tips.css:100–` | check BlockCard tips do not use them |
| CSS `.library-own*`, `.library-tonight*`, `.forrad-owned*` | `export.css:452, 631–650, 1123–1176` | |
| CSS `.admin-bar` (keep `.admin-filter-chip` only if AdminArea reuses it) | `export.css:2040–2075` | |

Check each with `rg` before deleting; keep anything a test or another view still reads.

## 10. Tests

- `lib/admin/bankWrite.test.ts`: `insertPendingRow` builds a row that passes the schema rules (id regex for all five blocks, `status: 'pending'`, `visual_key`, no `updated_by`, no redskap outside Teknik, safety rule), `23505` → retry once → `'exists'`, offline → `'offline'`.
- Peer rule: pure helper `canApprove(entry, email)` — false when `updatedBy` equals the e-mail (case-insensitive), true otherwise, true when `updatedBy` is null; only for `pending`.
- `lib/ownImport.test.ts`: rows resolved against bank titles (`sameName` → skip + note), no `noRoom` / `replace`; ids from the file ignored.
- `lib/ownedEquipment.test.ts`: drop the tonight/owned tests that go with B1, keep the redskap library test.
- `lib/clubTemplates.test.ts`, `lib/bank.test.ts`: still green (they import `ownImport` / club strings).
- **Slice bump:** `data/blockMeta.ts:111` `SLICE_NUMBER` `'46'` → `'47'`. Asserts: `lib/feedback.test.ts:25` (`'Version: Slice 47'`), `:45` (`SLICE_NUMBER, '47'`), `:46` (`'Träningsplaneraren · Slice 47'`); `lib/clubTemplates.test.ts:316` (`'Träningsplaneraren · Slice 47'`).
- `bun test src`, `npx tsc -b`, `npm run lint`, `npm run build` green.

## 11. Bundle

Estimate, not measured. Coach (main) chunk **−1.5 to −2.5 kB gz**: Tips and Mallar tab JSX, `TIPS_TAB` text, the «ikväll» filter and owned list, the import sheet and `ownImport` parsing leave the coach path (they move into the lazy admin chunk; Hämta ett pass keeps only `isExerciseFile`). Lazy admin chunk **+2 to +3.5 kB gz** (AdminArea, import sheet, insert). CSS about −0.5 kB gz. Report JS (main + admin chunk) and CSS gz vs the Slice 46 build in the PR. Coach budget: no growth; supabase-js stays out of the coach chunk (Slice 32 AC 26 and AC 49).

## 12. Self-smoke

Adapt `evidence/capture-390x844.mjs`: Lägg till övning (no tabs, no own buttons, no checkbox, first card ≤ 240); Använd mall sheet with Mina mallar tools; Förrådslista without the owned list. Admin needs a real admin login on a build with the bank configured: create «Ny egen övning» as admin A → it sits under Väntar with no Godkänn for A → admin B sees Godkänn → after Godkänn a coach device sees it in Biblioteket after reload. Do not run SQL to set this up; ask Planner for a second admin account if none exists.

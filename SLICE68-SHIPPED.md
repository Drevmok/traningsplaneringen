# Slice 68 — Föreningens redskap (SHIPPED, PR)

Locks **A1 B1 C1 D2 E1 F1** (D2, not D1). Christoffer, 25 nov 2026 13:42 (Europe/Stockholm), verbatim: «Ja, lås A1 B1 C1 D2 E1 F1». Pack: `slice-68-docs` @ `b58462d`. Base main `0f3be79`. Merge-base of `slice-68-code` is `0f3be79`.

**SQL not run against live.** `slice-68/sql/68-01-club-equipment.sql` and `68-02-smoke.sql` are in the PR unchanged. They wait for Christoffer's **separate** yes after merge. Agents did not run them against the live project. The app treats a missing table / failed GET as *not filled* (all 15 available, no error UI).

## Changes
- **A1:** new `clubEquipment` store + fetch (not a revived `ownedEquipment`). `sanitizePieceIds`, `missingClubPieces`, cache key `gymnastics-planner-club-equipment-v1`. Three states: not filled (no row / no cache) → all 15 available; filled list (also empty) → compare; unknown ids dropped. Coach GET: `{url}/rest/v1/club_equipment?select=piece_ids,updated_at&id=eq.club`, publishable key on `apikey` only, bank timeout. Stale cache kept on error; no cache → not filled.
- **B1:** Admin section «Föreningens redskap» next to «Föreningens mallar» (`ClubAdminSection`). 15 checkboxes, no counts. Upsert of `id = 'club'` only; no DELETE. Trainers have no editor. Not in Förrådslista. Copy from `slice-68/content/microcopy.sv.md`. Toasts reuse `clubOffline` / `clubWriteFailed`; success is «Sparad.».
- **C1:** `StationComposeSheet` marks missing selected rows and library buttons (class `club-missing`) and shows `UI.clubMissingLine`. Bygg hallen panel and `.pass-sheet-build` show the same line under `equipmentLine` when at least one slot is missing. Library is not filtered; adds are not blocked. Förrådslista, hall map, one marker per station, `hallSetupSteps` order, and «N stationer saknar redskap» are untouched.
- **D2:** no «Förslag:» row, no `swapSessionActivity`, no `variantLinks`.
- **E1:** `SLICE_NUMBER = '68'`. Bundle +491 B gzip vs `0f3be79` (budget +512).

## Trims (E1)
Unused `UI` keys removed (no remaining references in `app/src` or tests): `receiveTitle`, `totalTime`, `swapActivity`, `swapActivityAria`, `swapBanner`, `swapCancel`, `updateHomeHint`, `comingSoon`.
Dead CSS removed (no remaining markup): old Home card/honesty/phone/invite/actions rules; `.total-badge`, `.export-wrap` / `.export-tooltip`, `.block-budget`, `.overflow-tag`, `.visa-tips-hint`, `.hall-station-hint-tray`, `.receive-*`, `.swap-banner`, `.item-foot`, `.visually-hidden`, `.activity-tip-how`, `.own-import-room`.
The admin checkbox list is local (does not import `EQUIPMENT_PIECES`) and the coach store is updated from admin via `tp-club-eq` (no static import from the admin chunk into the store), so Vite does not split React / the library out of the main chunk.

## Evidence
- `bun test src`: **351 pass / 0 fail** (new `clubEquipment` tests + PassPrint missing-line + bankWrite allows the one `club_equipment` upsert).
- `npx tsc --noEmit` exit 0; `npm run lint` exit 0 (same warning family as main).
- Bundle (`verifier/tools/build-dists.sh`, gzip -9, js+css TOTAL, plain build): **221639 → 222130 (+491 B gzip; budget +512)**. Raw 798754 → 797829 (−925 B).
- SQL sha256: `68-01` `7fef8a8c98be07e286f18aa0e3abec2ddf3d4d52653a955d9eb9d894b6f6d9e4`; `68-02` `1e5cf1c26a7b8adae667bba6430627621fabf3d2e28bb35a2bd065e28408d9c3`.
- Coach-GET smokes: `club_equipment` allowed with publishable key, no `Authorization`. `slice-47-fake-supabase.mjs` returns `[]` (not filled). Slice 31/32 still exclude the extra GETs from the bank-contract count; slice 33 AC21c expects the four paths.
- Feature map: one sentence in `verify-traningsplaneraren/features/hall-redigera-redskap.md`.
- `pick-smokes 0f3be79 HEAD`: HELA LOOPEN (`App.css` is shared core; 23 scripts). First run: 22 SAMMA, slice-36 NY FAIL (two checks: admin locator matched two `section.club-templates`, and AC21d flagged `Set.delete`). Fixed: equipment section uses `admin-area-section`; checkbox toggling avoids `.delete(`. Re-ran slice-36: **46/46 SAMMA**. Combined: **23/23 SAMMA**. netlog 4748 + 133 requests, **0 to the live host**.

## Checklist (10)

| # | Result |
|---|---|
| 1 | Footer / `SLICE_NUMBER = '68'` (unit tests). |
| 2 | Admin section «Föreningens redskap», 15 parts in library order, not filled until saved; trainers have no editor; not in Förrådslista (code). |
| 3 | Not filled → no «Föreningen saknar …» in compose, Bygg hallen or print (unit tests + helper). |
| 4 | Filled list missing a slotted piece → row/grid marked, «Föreningen saknar: …»; library not filtered; D2: no suggestions (code, no swap). |
| 5 | Same missing line in Bygg hallen and print; one marker per station; Förrådslista unchanged (code). |
| 6 | Empty filled list → every slotted piece listed as missing; distinct from not filled (unit tests). |
| 7 | Banner «N stationer saknar redskap» untouched. |
| 8 | No «Visa bara övningar vi kan köra ikväll» / no own catalog; Slice 47 keys are not read. |
| 9 | `bun test src` 351/0; bundle +491 / 512; coach GET `club_equipment` in smokes; 23/23 SAMMA, 0 live-host. |
| 10 | SQL files additive (`IF NOT EXISTS`), no `DELETE`. Not run against live. |

## Local stand-in only
`68-01` was applied to the **local** `bank_template` (0 rows) so stand-in smokes get an empty 200 (`[]` = not filled). `68-02` all six checks were true on that local template. Neither file was run against live Supabase.

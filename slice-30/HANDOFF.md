# Slice 30 — handoff

**Status:** **LOCKED 2026-10-02** — A1 / B3 / C1 / D1 / E1 / F1. Backlog: **Approved/Locked → In flight (Slice 30)**; in progress: Docs → Builder → Verifier.

## Execution order

1. **Docs** — `DOCS-START.md`: microcopy + `docs/ovningsimport.sv.md` + redskap name lists.  
2. **Builder** — `builder-notes.md`; self-smoke via `verify-traningsplaneraren/`; `app/SLICE30-SHIPPED.md`; footer Slice 30.  
3. **Planner** pings **Verifier**.  
4. **Verifier** — `verification-checklist.md` (AC 1–44) + fixtures in `content/`.  
5. **After PASS:** first real use of B3 — Planner turns coach-approved trial drills into `import-trials/<id>/promote.json` per `content/seed-promotion.md` (separate small Builder PR).

## Paths

| Path | Role |
|---|---|
| `slice-30/` | This pack |
| `slice-30/content/import-schema.md` | Schema v1 (Planner ↔ app contract) |
| `slice-30/content/example-import.json` | 2 drills from the trial, schema v1 |
| `slice-30/content/example-import-edge.json` | Verifier edge fixture |
| `slice-30/content/check_import.py` | Planner self-check before sending a file |
| `slice-30/content/redskap-library.md` | 5 pieces: ids, labels, sketch, zones, migration |
| `slice-30/content/seed-promotion.md` | Planner → Builder seed process (B3) |
| `slice-30/content/microcopy.sv.md` | Swedish strings for Docs |
| `import-trials/2DJ_oMM81mI/` | Reference input (untracked; not shipped) |
| `app/src/lib/ownActivities.ts` · `lib/ownImport.ts` (new) · `lib/source.ts` (new) | Storage, import, source |
| `app/src/components/OwnImportSheet.tsx` (new) · `OwnActivityForm.tsx` · `LibraryPanel.tsx` · `ActivityDetail.tsx` · `ActivityTip.tsx` · `ActivityCard.tsx` · `SessionBuilder.tsx` · `Home.tsx` | UI |
| `app/src/data/equipmentPieces.ts` · `components/equipmentMark.tsx` · `components/StationSketch.tsx` · `lib/hallSuggest.ts` · `lib/ownedEquipment.ts` | Redskap +5 |
| `app/src/data/blockMeta.ts` | Strings + footer 30 |

## Not this pack

In-app AI · API keys · YouTube/social fetching in the browser · video embed · cloud sync/accounts · `#importera=` link · new hall zones · free-text redskap · raising 4 steps (unless E2) · seeding the trial drills directly · Pages republish unless asked.

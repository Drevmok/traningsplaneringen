# Slice 23 — static/code verification evidence

**Verifier role:** Code/static only (no product edits)  
**Date:** 2026-09-26 ~06:16 CEST  
**App root:** `/workspace/gymnastics-planner/app`  
**Authority:** `slice-23/verification-checklist.md` (recommended locks A1/B1/C1/E1/F1; D1 wire-only not scored here)  
**Ship notes:** `app/SLICE23-SHIPPED.md`  
**Skill:** `verify-traningsplaneraren/` + checklist  
**Overall (code):** **PASS** (locked groups A/B/C/E/F + build)

---

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
```

| Field | Value |
|---|---|
| Exit code | **0** |
| Script | `tsc -b && vite build` |
| Output (brief) | vite v8.3.0; 46 modules; `dist/index.html` 0.98 kB; CSS 37.60 kB; JS 329.63 kB; ✓ built in 167ms |

---

## A1 — Hallöversikt / Golvklart Home secondary — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Hidden without draft | **PASS** | Secondary block gated `{draftExists && (…)}` (`Home.tsx:138-166`). `draftExists = hasDraft()` (`:41`). When false, no Hallöversikt/Golvklart buttons render. |
| Visible with draft under primary | **PASS** | Primary Nytt/Mall/Fortsätt cards remain (`Home.tsx:103-136`); secondary row follows inside `.home-actions` (`:138-166`). |
| Hit targets ≥44×44 | **PASS** | Both buttons use `hall-tap-target` (`Home.tsx:142`, `:152`). CSS `.hall-tap-target` `min-height: 44px; min-width: 44px` (`App.css:2229-2232`). |
| Hallöversikt → `onOpenHall` | **PASS** | Secondary onClick calls `onOpenHall()` (`Home.tsx:144-146`). Props typed `onOpenHall: () => boolean` (`:18`). Wired `App.tsx:211` → `openHallFromHome` (`App.tsx:121-128`): requires draft + `countSessionItems >= 1`, sets `hallStartFloor(false)`, `view='hall'`. |
| Golvklart → `onOpenGolvklart` | **PASS** | Secondary onClick calls `onOpenGolvklart()` (`Home.tsx:154-160`). Props `:19`. Wired `App.tsx:212` → `openGolvklartFromHome` (`:131-140`): same item gate, `hallStartFloor(true)`, `view='hall'`. |
| Soft-fail flash (Home-level) | **PASS** | On false: Hall flashes `UI.komIgangNeedActivity` (`Home.tsx:145`); Golvklart flashes need-activity or need-hall (`:155-160`). Same strings as Kom igång path (`:63-72`). `flashHint` (`:46-48`) → Home-level `<p className="home-step-hint" role="status">` (`:169-172`). CSS `.home-step-hint` (`App.css:114-123`). **Intentional:** `stepHint` **not** passed into `KomIgangCard` (`Home.tsx:93-101` omits prop); Kom still accepts optional `stepHint` (`KomIgangCard.tsx:24`, `:209-211`) but Home uses Home-level only. Keys: `blockMeta.ts:242-243` (`komIgangNeedActivity` / `komIgangNeedHall`). |
| Swedish labels | **PASS** | `UI.homeOpenHall: 'Hallöversikt'` / `UI.homeOpenGolvklart: 'Golvklart'` (`blockMeta.ts:348-351`); rendered `Home.tsx:148`, `:163`. |

---

## B1 — Öppna på telefon — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Always on Home | **PASS** | Phone `<aside className="home-phone no-print">` (`Home.tsx:205-224`) is **outside** `draftExists` gate; always rendered with/without draft. |
| Existing `oppnaPaTelefon*` keys | **PASS** | Title/body/bookmark/honesty/add-home: `Home.tsx:210-223` → `blockMeta.ts:361-369`. Dedicated URL key `oppnaPaTelefonUrl` (`:352`). No sync/account invent in these strings (host-free body; honesty says utkast in that phone’s browser). |
| Live Pages URL | **PASS** | `oppnaPaTelefonUrl: 'https://drevmok.github.io/traningsplaneringen/'` (`blockMeta.ts:352`). Link text + `href` both use that value (`Home.tsx:213-218`); `target="_blank"` + `rel="noopener noreferrer"`. |
| Honesty aside kept | **PASS** | Slice 10 honesty still above phone (`Home.tsx:193-203`): `home-honesty no-print`, `draftHonestyTitle` / `Body` / `OtherDevice` (`blockMeta.ts:353-358`). Comment `:193` “always-on… not dismissible”. |
| no-print | **PASS** | Phone aside `className="home-phone no-print"` (`Home.tsx:207`); honesty also `no-print` (`:195`). |
| No dismiss required | **PASS** | Phone block has no dismiss button/state; only static copy + link (`Home.tsx:205-224`). Home usable without interacting with it. |

---

## C1 — Layout / chrome — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Secondary in `home-actions` | **PASS** | `.home-actions-secondary` nested inside `.home-actions` (`Home.tsx:103`, `:138-139`). Quieter styling: `btn-secondary` + `.home-secondary-cta` (`App.css:96-112`; phone column `:1547-1553`). |
| Phone with honesty cluster | **PASS** | Honesty then phone sequentially (`Home.tsx:193-224`); CSS comment “Öppna på telefon (honesty cluster)” (`App.css:370-401`). |
| Kom igång not force-expanded | **PASS** | `KomIgangCard` still defaults `expanded = !(done > 0 \|\| tips.komIgangCollapsed === true)` (`KomIgangCard.tsx:48-51`). Home does not pass any force-expand flag (`Home.tsx:93-101`). Collapse wiring intact via `onCollapseChange` (`:100` → `App.tsx:216` → `setKomIgangCollapsed`). |
| No new tip strip | **PASS** | `Home.tsx` has no `CoachTipStrip` import/usage. Existing Hall/Builder tip strips unchanged (Hall only). No new Home tip strip for hall entry. |

---

## E1 — Footer — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Exactly `Träningsplaneraren · Slice 23` | **PASS** | `blockMeta.ts:346-347` `footerSliceLabel: 'Träningsplaneraren · Slice 23'`. Rendered `App.tsx:248` `{UI.footerSliceLabel}`. |

---

## F1 — Scope / non-goals — **PASS**

| Check | Result | Evidence |
|---|---|---|
| No Förråd empty CTA (Home) | **PASS** | `rg` Förråd/forrad on `Home.tsx` → **zero**. Existing Slice 15 empty copy remains only inside `ForradslistaSheet.tsx:45-47` (`forradslistaEmpty*`); no new Home empty CTA. |
| No saknar banner | **PASS** | `rg saknar` under `app/src` → **zero** hits. |
| No place-heuristic change | **PASS** | `syncChecklistHeuristics` still data-model §4 (`coachTips.ts:203-243`): `openHallAndPlace` when `placementCount >= 1 \|\| openedHall` (`:224-229`). Compact still only via `markHallHintsCompact` on `placeAt` (`HallBoard.tsx:187-196`; `App.tsx:64-65` comment). |
| No Passbyggaren compose / library / CAD / cloud / sync | **PASS** | `StationComposeSheet` still hall-only (`HallBoard.tsx:52`, `:708-709`). `LibraryPanel` still builder-only (`SessionBuilder.tsx`). No CAD/dxf/cloud-sync/firebase/supabase under `app/src`. Phone/honesty copy still “inte i molnet” honesty only (`blockMeta.ts:355-356`); no sync invent on phone block. |
| Caption unchanged | **PASS** | `hallSchematicNote: 'Schematisk hall — inte exakt mått'` (`blockMeta.ts:169`); rendered `HallCanvas.tsx:237`. |
| Slice 22 quiet intact | **PASS** | `hallHintsCompact` / `komIgangCollapsed` fields (`coachTips.ts:35-38`); `markHallHintsCompact` / `setKomIgangCollapsed` (`:246-259`); Hall multi-line gate + info (`HallBoard.tsx:118-119`); Kom collapse default (`KomIgangCard.tsx:48-51`). |
| No `window.confirm` | **PASS** | `rg window.confirm` under `app/src` → **zero** hits. |

---

## Summary

| Lock | Result |
|---|---|
| **A1** draftExists gates secondary; ≥44; onOpenHall/onOpenGolvklart; Home-level `.home-step-hint` soft-fail with need-activity/need-hall; Swedish labels | **PASS** |
| **B1** Öppna på telefon always; oppnaPaTelefon* + live URL; honesty kept; no-print; no dismiss | **PASS** |
| **C1** home-actions secondary; phone with honesty; Kom not force-expanded; no new tip strip | **PASS** |
| **E1** Footer Slice 23 | **PASS** |
| **F1** No Förråd empty CTA; no saknar; no place-heuristic change; no compose/library/CAD/cloud/sync; caption unchanged; Slice 22 quiet intact; no window.confirm | **PASS** |
| **Build** | **PASS** (exit 0) |

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-23-evidence-code.md`

**Note (static only):** Live phone/Home smoke not re-driven here; gates/handlers/strings verified in source. Home-level-only `stepHint` accepted as intentional (ship deviation none vs locks). D1 Docs wire-only not scored in this code pass.

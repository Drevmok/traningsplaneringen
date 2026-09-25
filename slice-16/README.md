# Slice 16 — Kom igång: discover Redigera redskap

**App:** Träningsplaneraren  
**Approval:** Christoffer approved 2026-09-25; next Docs polish → Builder → Verifier  
**Date approved:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** (Christoffer)

**Backlog:** Idea 2 Approved 2026-09-25 (Christoffer via Planner) → this pack is **APPROVED** with all Planner recommendations A–F locked. Ideas 1 (broader selective redskap-förslag) and 3 (Golvklart short station titles) are also Approved but **not** this pack — leave for later slices.

## Goal

A new coach finishes the Home **Kom igång** checklist knowing they should set **redskap** before Golvklart — not only place markörer. Soft new checklist step points at markör → **Redigera redskap**; checklist auto-progress when any saved `stationEquipment` is non-empty. **Home-only** card. **Do not block Golvklart.** Tip strip keeps `tipStationCompose` as soft chrome. No new placeable blocks.

**Coach outcome:** “Jag går igenom Kom igång och förstår att jag ska ange redskap på Teknik-stationerna innan Golvklart — via markör → Redigera redskap.”

## Direction lock (from Christoffer / product / hard locks)

- Soft **Kom igång** discoverability for **Redigera redskap** (Home checklist card only)
- **New soft checklist step** (5 total) between place and Golvklart (locked A)
- Point at existing compose path: markör → **Redigera redskap** (hall detail only)
- Auto-progress on any non-empty saved `stationEquipment` (locked B) — **never** a hard gate
- **Do not block Golvklart** (locked D)
- Tip strip keeps `tipStationCompose` as-is (locked C)
- Fixed **10-piece** library; no custom CRUD
- **NO** CAD / equipment pins
- **NO** Passbyggaren compose entry
- **NO** canvas equipment-count badge
- Teknik-only placeable intact
- Caption **Schematisk hall — inte exakt mått** unchanged
- Slice 11–15 behaviors intact (compose, Golvklart under-markör, Förrådslista)
- Swedish UI; gymnaster / pass; device-local
- Footer `Träningsplaneraren · Slice 16` when shipped (locked E)
- No Home visual redesign beyond copy/checklist/progress (locked F)
- **Netlify out of pack scope** unless Christoffer asks
- No accounts / cloud
- No new placeable blocks

## Problem

Kom igång still has **four** steps ending at Golvklart (`docs/coach-tips.sv.md`, `coachTips.ts`). Slice 13 added optional `tipStationCompose`, but checklist auto-progress never requires a compose save. Hall hints mention redskap, yet the onboarding path can skip compose entirely after Slice 13–15 PASS — coaches may reach Golvklart / Förrådslista empty without knowing **Redigera redskap** exists.

## Current baseline (do not regress)

- Kom igång Home card: 4 steps (`chooseOrBuildPass` → `addActivities` → `openHallAndPlace` → `useGolvklart`); `CHECKLIST_TOTAL = 4`
- Auto-progress via `syncChecklistHeuristics` (draft / itemCount / placement / openedGolvklart) — **no** `stationEquipment` heuristic
- Slice 09 Docs historically said “Do not … invent a fifth step” — **this slice supersedes** that with locked A (new soft step)
- Compose: hall-detail **Redigera redskap** only; `SessionItem.stationEquipment`; unset / `[]` / non-empty semantics (Slice 13)
- Optional tip `tipStationCompose` (Slice 13) — kept as-is (locked C)
- Golvklart under-markör redskap (Slice 14); Förrådslista aggregate (Slice 15 — Verifier PASS; Netlify may still show Slice 14)
- Caption: **Schematisk hall — inte exakt mått**
- Live historically: https://fancy-blancmange-4d516b.netlify.app/ (verify from ship notes if needed)
- gymnaster / pass / Swedish UI; device-local drafts

## In scope

1. **New soft Kom igång step** — Between place and Golvklart (5 steps total): “Ange redskap på Teknik-stationerna” + hint pointing at markör → **Redigera redskap**.
2. **Path copy** — Short hint naming existing hall detail CTA **Redigera redskap** (no new compose entry surface).
3. **Auto-progress** — Checklist key / heuristic when any saved non-empty `stationEquipment` exists (locked B).
4. **Home-only** — Change lives on the Kom igång card; do not add a mandatory compose gate on Golvklart or Hallöversikt.
5. **Tip strip** — Keep `tipStationCompose` as-is (locked C).
6. **Swedish microcopy seeds** — `content/kom-igang-redskap.sv.md` → Docs polish → merge into `docs/coach-tips.sv.md` (and related keys in `blockMeta`).
7. **Footer** — `Träningsplaneraren · Slice 16` when shipped (locked E).
8. Verification checklist (phone Home + soft compose path; Netlify not required).

## Out of scope

- Broader selective redskap-förslag on Teknik drills (Approved idea 1 — **later slice**)
- Golvklart screen short station titles (Approved idea 3 — **later slice**)
- Custom coach-authored redskap / catalog CRUD
- CAD / per-piece floor pins / exact measures
- Passbyggaren compose entry
- Canvas equipment-count badge
- Changing Teknik-only placeable rules
- **Blocking Golvklart** until compositions exist
- Changing Slice 14 under-markör / Slice 15 Förrådslista behavior
- New placeable blocks / new equipment library pieces
- Accounts / cloud / App Store
- **Netlify** republish in this pack
- Home layout redesign beyond checklist/copy/progress (locked F)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Overview + acceptance + handoff |
| [`decisions.md`](./decisions.md) | Locked decisions and answers A–F |
| [`screen-spec.md`](./screen-spec.md) | Home card, steps, heuristics, tip strip |
| [`content/kom-igang-redskap.sv.md`](./content/kom-igang-redskap.sv.md) | Swedish seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |
| [`HANDOFF.md`](./HANDOFF.md) | Docs → Builder → Verifier order |

## Acceptance (binding — pack APPROVED)

1. New coach on Home sees Kom igång with **5** steps; the new soft step teaches that **Redigera redskap** / station redskap matter before Golvklart — not only placing markörer.
2. Path copy points at existing hall detail: markör → **Redigera redskap**. No Passbyggaren compose; no new placeable.
3. Checklist auto-progress fires on any non-empty saved `stationEquipment` — **never** blocks entering Golvklart when the compose step is unchecked.
4. Home-only card; `tipStationCompose` kept as-is; Slice 11–15 intact; caption unchanged; no Home visual redesign beyond copy/checklist/progress.
5. Phone-first (~390px); footer `Träningsplaneraren · Slice 16` when shipped; Netlify not required by this pack.

## Locked answers A–F

See [`decisions.md`](./decisions.md) for the binding decisions. New soft checklist step (5 total), auto-progress on non-empty `stationEquipment`, keep `tipStationCompose`, soft-only Golvklart, Slice 16 footer, and no Home visual redesign are locked.

## Handoff order (Planner pings — do not self-ping)

1. **Approval complete** — Christoffer locked A–F on 2026-09-25
2. **Docs** — Polish `content/kom-igang-redskap.sv.md` → merge into `docs/coach-tips.sv.md` (supersede Slice 09 “no fifth step”)
3. **Builder** — Implement against APPROVED decisions + screen-spec + polished docs
4. **Verifier** — Planner pings only after Builder ships; use `verification-checklist.md`

## Prior context

- Slice 09: Kom igång + tip strip
- Slice 13: `stationEquipment` compose + **Redigera redskap** + optional `tipStationCompose`
- Slice 14: Golvklart/print under-markör redskap
- Slice 15: Förrådslista aggregate (Verifier PASS 2026-09-25)
- Backlog Scout idea 2 → Approved 2026-09-25 → Slice 16 pack **APPROVED 2026-09-25**

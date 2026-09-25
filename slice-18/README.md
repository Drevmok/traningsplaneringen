# Slice 18 — Broader selective redskap-förslag on Teknik drills

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-25** — recommended A–F locked  
**Date approved:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** — recommended A–F locked. Christoffer approved via Planner lock widget.

**Backlog:** Idea 1 Approved 2026-09-25 (Christoffer via Planner) → this pack is In flight. Slice 17 (Golvklart short titles) shipped separately; Netlify still out of that pack.

## Goal

Extend `defaultStationEquipment` seeds so **more Teknik drills** open with a sensible uppsättning. Coaches tap **Använd förslag** instead of building every Redskap list from an empty sheet. Keep unset vs `[]`, Använd förslag / Klar, and Golvklart / Förrådslista quiet rules. **No** library growth. **No** promoting förslag onto Golvklart / Förrådslista / print until Klar or Använd förslag.

**Coach outcome:** “Fler Teknik-stationer öppnar med ett rimligt förslag — jag trycker Använd förslag och går vidare.”

## Direction lock (from Christoffer / product / hard locks)

- Builder **only** extends `defaultStationEquipment` in `seedActivities.ts` (plus footer label)
- Keep **unset** vs `[]`: unset may show `activity.defaultStationEquipment` as förslag; `[]` = coach cleared
- **Använd förslag** / **Klar** persist composition — unchanged UX
- Golvklart / Förrådslista / print use **SAVED** composition only — never promote unset förslag
- Fixed **10-piece** library — no new pieces, no custom catalog
- Compose = hall detail **Redigera redskap** only — no Passbyggaren compose
- Placeable = **Teknik** only
- Caption **Schematisk hall — inte exakt mått** unchanged
- **NO** canvas equipment-count badge
- **NO** CAD / equipment pins
- Swedish UI; gymnaster / pass; device-local
- Footer `Träningsplaneraren · Slice 18` when shipped (locked E)
- **Netlify out of pack scope** unless Christoffer asks
- No accounts / cloud

## Problem

Today only **four** vault/trampett/mattberg-family drills ship `defaultStationEquipment`. The other Teknik drills stay empty until the coach manually composes — even when the setup is obvious from the drill title / how-text (flickiskudde, plint + madrass, tumbling line, etc.).

## Current baseline (do not regress)

Existing seeds in `app/src/data/seedActivities.ts` (**KEEP — do not change**):

| activityId | title | defaultStationEquipment |
|---|---|---|
| `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | `eq-satsbrada` ×1, `eq-landningsmatta` ×1 |
| `tech-ljushopp-trampett` | Ljushopp på trampett | `eq-trampett` ×1, `eq-landningsmatta` ×1 |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | `eq-satsbrada` ×1, `eq-landningsmatta` ×1 |
| `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | `eq-trampett` ×1, `eq-mattberg` ×1, `eq-landningsmatta` ×1 |

Teknik **without** seeds today (candidates — only five remaining Teknik):

| activityId | title |
|---|---|
| `tech-rondat-flickis` | Rondat–flickis |
| `tech-flickis-kudde` | Flickis med flickiskudde |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg |
| `tech-salto-fran-hojd` | Salto från höjd |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg |

- Unset vs `[]` + Använd förslag / Klar intact (Slice 13)
- Golvklart / print / Förrådslista omit unset förslag (Slice 14–15)
- Caption: **Schematisk hall — inte exakt mått**
- Live: https://fancy-blancmange-4d516b.netlify.app/ (through Slice 16; Slice 17 code shipped, Netlify not yet republished)

## In scope

1. **Seed more Teknik drills** — add `defaultStationEquipment` (pieceId + count slots) for the locked set of remaining Teknik drills with obvious setups (locked A: **all five** — see `decisions.md` A).
2. **Docs** — Thin update to `docs/station-compose.sv.md` (table of which drills ship förslag); optional thin `docs/redskap-forslag.sv.md` if Docs prefers. Seed in `content/redskap-forslag-seeds.sv.md`.
3. **Footer** — `Träningsplaneraren · Slice 18` when shipped.
4. Verification checklist for the approved pack (Netlify not required).

## Out of scope

- Changing Använd förslag / unset vs `[]` / Klar UX
- Promoting förslag onto Golvklart / Förrådslista / print before Klar / Använd förslag
- New library pieces / custom coach catalog
- Passbyggaren compose entry
- Canvas equipment-count badge / CAD pins
- Auto-apply förslag on place
- Caption change
- New required tip for PASS
- Accounts / cloud / App Store / Netlify in this pack
- Touching non-Teknik activities or the four existing seeds’ arrays

## Files in this pack

| File | Purpose |
|---|---|
| `README.md` | Goal, scope, baseline |
| `decisions.md` | Locked answers A–F + decision rationale |
| `screen-spec.md` | Förslag mental model + locked seed table + Builder hooks |
| `verification-checklist.md` | Verifier rules after ship (APPROVED pack) |
| `HANDOFF.md` | Docs → Builder → Verifier; Docs may start |
| `content/redskap-forslag-seeds.sv.md` | Docs seed — locked drill→redskap table |

## Locked answers

Christoffer approved via Planner lock widget on 2026-09-25. Recommended A–F are locked; the authoritative lock section and seed table are in `decisions.md`. Docs may start; Builder follows the handoff sequence.

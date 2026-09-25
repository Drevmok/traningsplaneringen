# Slice 18 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass after Builder has shipped against an **APPROVED** pack.  
**Status:** **APPROVED 2026-09-25** — ready for Docs handoff; rules below follow Christoffer’s locked A–F approval via Planner on 2026-09-25.  
**Netlify:** Not required unless Christoffer asks.  
**Do not run Verifier** until Planner pings after Builder ships the APPROVED pack.

## Locked rules (A–F approved)

| # | Rule | Pass if |
|---|---|---|
| 1 | New seeds present | Each locked new Teknik drill in `seedActivities.ts` has `defaultStationEquipment` matching the locked table (pieceId + count) |
| 2 | Existing four untouched | The four vault/trampett/mattberg seeds keep their current arrays byte-for-byte (or intentional identical content) |
| 3 | Förslag when unset | Place a seeded new drill unset → hall detail shows förslag + **Använd förslag** |
| 4 | Använd förslag persists | Tap Använd förslag → composition becomes saved; Golvklart / Förrådslista then include those pieces |
| 5 | Unset quiet on floor | Before Klar / Använd förslag, Golvklart / print / Förrådslista **omit** förslag |
| 6 | Cleared `[]` | Coach clears to `[]` → no förslag shown; stays quiet on Golvklart / Förrådslista |
| 7 | Library size | Still exactly 10 `eq-*` pieces; no custom library |
| 8 | Compose entry | Redigera redskap from hall detail only — no Passbyggaren compose |
| 9 | Scope | No badge; no CAD; no auto-apply on place; no caption change |
| 10 | Slice 14–17 intact | Quiet redskap; Förrådslista; Kom igång (saved progress); Golvklart short titles |
| 11 | Footer (E) | `Träningsplaneraren · Slice 18` when shipped |
| 12 | Build | `npm run build` green |

## Smoke path

1. Open a pass; place Teknik stations for at least two **new** seeded drills (e.g. Flickis med flickiskudde + Falla bakåt från höjd) and one **old** seeded drill (e.g. Ljushopp på trampett). Leave them unset.  
2. Open hall detail on a new seeded station: förslag visible; **Använd förslag** present.  
3. Confirm Golvklart / Förrådslista still **omit** those pieces while unset.  
4. Tap **Använd förslag** → Klar path: Golvklart shows redskap under markör; Förrådslista aggregates.  
5. On another station, open Redigera redskap, clear all → Klar with `[]`: no förslag; quiet on floor/list.  
6. Confirm existing four seeds still match baseline arrays. Library still 10. Caption unchanged. Footer Slice 18. Build green.

## Fail if

- Existing four seed arrays changed incorrectly.  
- Förslag appears on Golvklart / Förrådslista / print while still unset.  
- New `eq-*` library piece added.  
- Passbyggaren gains compose; badge/CAD appears; caption changes.  
- Auto-apply on place without Använd förslag / Klar.  
- Verifier run before APPROVED pack + Builder ship.

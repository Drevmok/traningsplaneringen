# Slice 08 — polish / cleanup audit

**Date:** 2026-09-24 (Europe/Stockholm)  
**Project path:** `/workspace/gymnastics-planner`  
**App:** `/workspace/gymnastics-planner/app`

This is a read-only audit. No app code was changed.

## Confirmed current footer / slice label

`app/src/App.tsx:61` currently renders:

```tsx
{UI.appName} · Slice 07
```

So the current visible footer is **Träningsplaneraren · Slice 07**. It is stale for a Slice 08 ship; the historical `SLICE01–07-SHIPPED.md` headings and references should remain historical records, not be mass-renamed.

## Audit findings and candidates

| ID | Status | Swedish-facing description | Evidence / current state | Effort | Risk | Thin-slice recommendation |
|---|---|---|---|---|---|---|
| P08-01 | **Include** | Uppdatera sidfoten till **Träningsplaneraren · Slice 08** när Slice 08 faktiskt skeppas. | `App.tsx:61` still says `Slice 07`. | S | Low | Small, deterministic cleanup. Do not rewrite historical ship notes. |
| P08-02 | **Include** | Håll placeringssparningen tyst; ta bort den oanvända halltexten **Placering sparad** i stället för att lägga till en ny toast. | `UI.hallPlacementSaved` exists at `blockMeta.ts:173`, but placement changes call `saveDraft` without using it. The existing **Utkast sparat** toast is a separate, used builder action. | S | Low | Avoids transient noise and removes dead copy. No behavior change to auto-save. |
| P08-03 | **Include** | Gör **Ej placerade**-fältet verkligt synligt längst ned på telefonen medan hallen panoreras, med safe-area och utan att täcka canvasens viktiga innehåll. | CSS has `position: sticky; bottom: 0` (`App.css:1703–1711`), but Slice 07 verifierade endast att trayen är nåbar — inte permanent viewport-pinnad. | M | Medium | Keep the existing horizontal tray, `Placera här`, snap, and remove behavior; polish positioning only. |
| P08-04 | **Exclude** | Fullt tangentbordsstöd för att flytta en hallövning, inklusive motsvarande fokus-/placeringsfeedback. | Hallchips support Enter/Space for detail, but movement remains mouse DnD or phone **Placera här** (`HallChip.tsx`, `HallCanvas.tsx`). | M | Medium/High | Defer: needs an explicit keyboard interaction design and is larger than a thin visual cleanup. |
| P08-05 | **Include** | Rensa kvarvarande teknisk engelska i tillgänglighetskrom: exempelvis byt `aria-label="Zoom"` till svensk **Zooma**/motsvarande. Bekräfta samtidigt att synliga halltexter är svenska. | No visible English hall chrome was found; `HallBoard.tsx:279` still has the English accessibility label `Zoom`. | S | Low | Narrow copy/a11y sweep only; no new controls or terminology. |
| P08-06 | **Exclude** | Ta bort alla **Utkast**-referenser. | Runtime seed library has 28 `stub: false` activities and no current Utkast badges. Remaining `Utkast` keys/styles and Slice 01 docs describe the historical stub contract or valid draft saving. | S | Medium | Do not delete backward-compatible data/UI fields or historical documentation merely to make grep empty. |
| P08-07 | **Exclude** | Ändra halltexten till en ny variant av **Schematisk hall — inte exakt mått**. | `UI.hallSchematicNote` is the exact canonical string; code and Slice 05–07 docs/specs consistently use it in edit/floor/print requirements. | S | Low | No copy change needed. Keep this as a regression assertion, not a rewrite. |
| P08-08 | **Include** | Gör Golvklart-utskriften lugnare: en tydlig titel/meta-rad, ingen dubblerad redigeringskrom, och behåll hall, stationsnummer, flöde (om påslaget), caption och banner. | Print CSS exists, but the floor header and `.print-only` title strip can both contribute title/meta content; this is a small print-preview inspection/polish gap. | M | Medium | Limit to print CSS/layout; no PDF/export/share work. |
| P08-09 | **Exclude** | Lägg till mjuk zonmarkering eller mer magnetisk draganimation. | Prior Slice 07 notes still list soft zone highlight/snap ease as nice-to-have. | M | Medium | Defer: interaction polish, not necessary cleanup; preserve current snap rules. |
| P08-10 | **Exclude** | Bygg nya övningar, coachfilter, onboarding, CAD, delning eller hallomordning. | Explicitly outside the existing Slice 07 scope and unrelated to cleanup. | M/L | High | Hard scope boundary for Slice 08. |

## Recommended Slice 08 in scope

Acceptance language for Christoffer:

- **Footer:** After the Slice 08 changes ship, the app footer reads exactly **Träningsplaneraren · Slice 08**; historical `SLICE01–07-SHIPPED.md` files are not rewritten.
- **Silent placement save:** Remove the unused `Placering sparad` key/dead path. Placement and preset changes still auto-save as today, with no new toast; **Utkast sparat** remains for the explicit builder save action.
- **Phone tray:** At the supported narrow breakpoint (≤768 px), **Ej placerade** stays viewport-pinned/reliably visible at the bottom while the hall canvas pans; safe-area padding works; the tray does not hide the active canvas, **Placera här**, chip detail, or remove control.
- **Swedish chrome/a11y:** Replace the remaining English accessibility label such as `Zoom` with Swedish wording, and confirm visible user-facing chrome remains Swedish. Do not remove valid historical `Utkast`/draft terminology from old docs or compatibility fields.
- **Golvklart print:** Print preview shows one clear session title/meta treatment; edit-only controls and tray are hidden; schematic hall, zones, caption **Schematisk hall — inte exakt mått**, placed chips/station numbers, optional flow, and unplaced banner remain readable on A4 landscape.
- **Copy regression check:** Verify the canonical caption is unchanged in edit mode, Golvklart, and print; verify no new English or wrong Slice labels are introduced in the shipped app surface.

## Explicitly out of scope

- New drills or activity-library content.
- Coach filter or onboarding.
- CAD, exact hall measurements, PDF generation, export, share links, or multi-user work.
- Hall reorder that changes Passbyggaren order.
- Rewriting historical Slice 01–07 ship notes/docs.
- Full keyboard drag/move interaction, pinch-zoom, new snap rules, or soft snap/zone animation.

## Open questions for Planner / Christoffer

1. Is **permanently viewport-pinned** the desired phone behavior, or is Slice 07’s current “reachable while canvas pans” behavior sufficient? Pinning can obscure content, so this should be an explicit product choice.
2. Confirm the recommended silent-save decision: remove the dead `Placering sparad` copy rather than introduce a placement toast.
3. For print, should the output use only the compact print title strip, or retain a reduced **Golvklart** heading as well? The acceptance above recommends one non-duplicated title/meta treatment.

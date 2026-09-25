# Slice 08 — locked decisions

**App:** Träningsplaneraren  
**Status:** **APPROVED by Christoffer 2026-09-24**  
**Source:** `slice-08/AUDIT.md`, with the three Planner product locks applied.

This document resolves the audit's product questions. There are no remaining product questions for this slice. Implementation may choose the smallest safe CSS/markup change, but may not reopen the behavior below.

## 1. Footer — P08-01

- When Slice 08 is shipped, the app footer reads exactly **Träningsplaneraren · Slice 08**.
- Do not mass-rename `SLICE01–07-SHIPPED.md`, prior-slice headings, or historical references.
- This is a visible label update, not a new footer feature.

## 2. Silent placement save — P08-02

- Remove the unused `Placering sparad` / `hallPlacementSaved` dead copy and any dead rendering path.
- Placement and preset changes continue to call the existing draft persistence behavior, with no placement toast.
- Keep **Utkast sparat** for the explicit builder save action. It is separate valid feedback and must not be removed or renamed.
- Do not add a replacement toast, status banner, or new save interaction.

## 3. Phone tray — P08-03

On viewports **≤768px**:

- `Ej placerade` stays reliably reachable at the bottom while the hall canvas pans or its content scrolls.
- The existing horizontal tray, chips, **Placera här**, snap behavior, and remove behavior remain unchanged.
- The tray includes bottom safe-area treatment (`env(safe-area-inset-bottom)` or equivalent).
- The canvas/layout reserves bottom space **at least equal to the rendered tray height, including safe-area padding**. The active drop/placement area must remain reachable and must not be permanently hidden behind the tray.
- Improving the existing sticky implementation is preferred. A fixed implementation is acceptable only when the compensating canvas padding/scroll geometry is reliable.
- “Always cover viewport chrome” is not a requirement; reachability and non-obscured placement are the requirements.

## 4. Swedish accessibility chrome — P08-05

- Replace English technical labels in the shipped surface, beginning with the audited `Zoom`, with Swedish labels: **Zooma** for the zoom control and **Zooma in** / **Zooma ut** for directional controls when present.
- Visible user-facing hall text stays Swedish and uses existing terminology: **Golvklart**, **Ej placerade**, **Placera här**, **Visa flöde**, and **Dölj flöde**.
- Do not broaden this into a translation rewrite or remove valid historical `Utkast`/draft compatibility fields and documentation.
- The canonical caption remains exactly **Schematisk hall — inte exakt mått**.

## 5. Golvklart print — P08-08

- Print contains **one** title/meta treatment. Prefer a compact `.print-only` strip containing the session title and duration/date when available.
- Hide the duplicated/redundant floor heading or other second title/meta treatment in print.
- Hide edit chrome, navigation/footer chrome where it is app chrome, the `Ej placerade` tray, and Golvklart action buttons (`Avsluta golvklart`, `Skriv ut`) in print.
- Keep readable: schematic hall, zones, caption **Schematisk hall — inte exakt mått**, placed station numbers, flow when enabled, and the soft unplaced banner when applicable.
- Keep the existing offline/print-CSS approach; no PDF library, CDN, export, or sharing work.
- The print layout should remain A4 landscape-friendly and should not invent exact hall measurements.

## Rejected alternatives

| Alternative | Decision |
|---|---|
| Add a new `Placering sparad` toast | Rejected: placement save is intentionally silent; the dead copy is removed. |
| Remove **Utkast sparat** too | Rejected: explicit builder save feedback is valid and distinct from placement auto-save. |
| Leave the tray merely reachable after scrolling | Rejected: ≤768px requires reliably bottom-reachable behavior while the canvas pans. |
| Fixed tray with no canvas compensation | Rejected: it can cover the active drop/placement area. |
| Require the tray to cover every piece of viewport/browser chrome | Rejected: sticky reachability plus safe-area handling is sufficient. |
| Keep both Golvklart heading and a print title strip | Rejected: print gets one title/meta treatment only. |
| Rewrite the schematic caption | Rejected: the canonical caption is a regression lock from Slices 05–07. |
| Delete every `Utkast` string or compatibility field | Rejected: this breaks historical/documented draft compatibility and is P08-06. |
| Add keyboard drag, snap animation, or new print/export machinery | Rejected: explicitly outside this cleanup slice. |

## Constraints carried from Slices 05–07

- App name: **Träningsplaneraren**; athletes: **gymnaster**; session: **pass**.
- Swedish UI and established hall terms: **Golvklart**, **Ej placerade**, **Placera här**, **Visa flöde**, **Dölj flöde**.
- Entry remains through **Hallöversikt** from Passbyggaren; back returns to Passbyggaren.
- Pass block order remains Samling → Uppvärmning → Teknik → Styrka → Lek och spel; station order remains Passbyggaren order.
- Existing `Session.hallPlacements`, normalized coordinates, `sessionItemId` mapping, orphan pruning, and draft persistence remain compatible.
- Storage key remains `gymnastics-planner-draft-v1`.
- Six zones, three presets, `generic-trupp` alias, and Slice 06 snap/apparatus/free-open rules remain unchanged.
- Station numbers apply to placed chips only; flow remains optional and follows the existing preference.
- Golvklart is read-only; soft unplaced banner does not block entry; **Erfaren** safety treatment remains.
- Primary phone targets remain at least 44px; offline/no-CDN constraints remain.
- Caption remains exactly **Schematisk hall — inte exakt mått**.
- No new route, hall reorder, exact measurements, CAD, sharing, PDF library, new drills, or coach filter.

## Approval state

- [x] Christoffer approves the six acceptance bullets in `README.md`.
- [ ] Builder implements only the approved scope.
- [ ] Verifier uses `verification-checklist.md` and records PASS/FAIL.

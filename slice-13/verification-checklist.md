# Slice 13 — verification checklist

**Authority:** Overall PASS only if all locked rules pass.  
**Status:** APPROVED 2026-09-24 (Christoffer) — binding when Builder has shipped.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Equipment library | Seed catalog shows all **10** Swedish pieces (Trampett … Kon); Mattberg is one piece; coach can pick pieces in compose UI |
| 2 | Compose → one marker | Composed station still places as a **single** Hallöversikt marker (no per-piece pins) |
| 3 | Tap → detail + redskap | Tap placed marker opens detail; **Redskap** section lists composed pieces (counts/labels) |
| 4 | Drag ≠ detail | Drag-reposition does not open detail on drop (Slice 12) |
| 5 | Compose entry | From hall detail only, **Redigera redskap** opens phone-usable compose sheet; Klar persists on draft. **No** Passbyggaren compose entry required or expected |
| 6 | Teknik-only | Slice 11 filter/prune unchanged; compose not offered for non-Teknik |
| 7 | Erfaren | Experienced Teknik still marked on tile + in detail |
| 8 | Marker size | Canvas stays icon-first compact (~44–56px); **no** equipment-count badge; no text-card / CAD regress |
| 9 | Tray / phone | Unplaced tray still placeable on phone (~390px); compose sheet usable at that width |
| 10 | Golvklart | Markers + ranks readable; flow still Teknik-only |
| 11 | Detail read-only (add) | No add-to-pass from hall detail |
| 12 | Selective defaults | Suggested equipment only on obvious vault/trampett/mattberg-style Teknik drills — not every Teknik drill |
| 13 | Scope | No freeform CAD, exact measures, accounts, cloud, Netlify, Passbyggaren compose, marker badge, or full drill-library expansion |
| 14 | Footer | Träningsplaneraren · Slice 13 |
| 15 | Caption | **Schematisk hall — inte exakt mått** unchanged |

## Smoke path

1. Pass with ≥2 Teknik + other blocks → hall tray Teknik only.  
2. Place one Teknik station → Slice 12 marker (**no** equipment badge).  
3. Tap → detail; **Redigera redskap**; add trampett + landningsmatta (counts OK); Klar.  
4. Re-open detail → Redskap lists those pieces.  
5. Close detail → marker still one unit; drag moves without opening detail.  
6. Optional: vault/trampett/mattberg-style activity with seed defaults shows förslag / can apply; a non-setup Teknik drill stays without suggested equipment.  
7. Golvklart + phone (~390px) compose + tray smoke.  
8. `npm run build` green.  
9. Reload draft → composition still present (device-local).

## Non-blocking (explicitly out / deferred)

- Passbyggaren compose entry (out of Slice 13).  
- Marker equipment-count badge (never this slice).  
- Piece reorder in compose.  
- Netlify republish only if Christoffer asks.

## Fail if

- Individual equipment pieces become separately placeable hall pins.  
- Compose requires exact meters / CAD drawing.  
- Non-Teknik blocks appear in tray or as placeable.  
- Tap/drag regression vs Slice 12.  
- Equipment-count badge appears on canvas markers.  
- Passbyggaren is required for compose to work (hall-detail path missing).  
- Every Teknik drill is force-prefilled with suggested equipment.

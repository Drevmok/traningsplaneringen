# Slice 11 — verification checklist

**Authority after approval.** Overall PASS only if all locked rules pass.

## Locked rules

| # | Rule | Pass if |
|---|---|---|
| 1 | Teknik-only placeable | Tray and canvas never show Samling/Uppvärmning/Styrka/Lek items |
| 2 | Prune non-Teknik placements | Draft with old non-Teknik placement → removed after load/open; no crash |
| 3 | Compact canvas chips | Placed chips clearly smaller than Slice 10; duration not on canvas; rank+title readable |
| 4 | Empty no-Teknik | Pass with only warmup/etc. → Swedish empty state; tray not full of those items |
| 5 | Flow/numbers | Ranks 1…N only among placed Teknik; flow only between those |
| 6 | Golvklart | Shows only Teknik stations; unplaced banner counts Teknik only |
| 7 | Erfaren | Experienced Teknik station still badged |
| 8 | Passbyggaren intact | All five blocks still editable; no library regression |
| 9 | Footer | Träningsplaneraren · Slice 11 |
| 10 | Scope | No new presets/CAD/cirkel-as-stations/sync |

## Smoke path

1. Build a pass with ≥1 item in Uppvärmning + ≥2 Teknik + ≥1 Styrka.
2. Open Hallöversikt → tray shows only Teknik; place both; confirm compact chips + ranks.
3. Golvklart + print preview smoke.
4. Reload draft → placements kept for Teknik; any smuggled non-Teknik placement gone.
5. Phone ~390px: tray usable, chips tappable.

## Non-blocking

- Live Netlify republish may lag until Christoffer asks; local/prod build smoke is enough for checklist unless URL updated.

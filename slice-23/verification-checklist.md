# Slice 23 — verification checklist (DRAFT · recommended locks)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **DRAFT** — Verifier runs only after Christoffer A–F lock → Docs → Builder ship **and** Planner ping.  
**Skill:** `verify-traningsplaneraren/` + this checklist; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended locks (awaiting Christoffer):** **A1 / B1 / C1 / D1 / E1 / F1**.  
Update PASS rows if Christoffer locks a different letter.

## Rules (recommended)

### Hallöversikt / Golvklart Home (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Hidden without draft | With no saved draft: Hallöversikt + Golvklart secondary actions are **not** shown |
| 2 | Visible with draft | With draft: both secondary actions visible under primary Nytt/Mall/Fortsätt; primary cards still present |
| 3 | Hit targets | Both secondary controls ≥44×44px |
| 4 | Hallöversikt open | Tap Hallöversikt calls `onOpenHall` / lands Hallöversikt edit when draft has ≥1 activity |
| 5 | Golvklart open | Tap Golvklart calls `onOpenGolvklart` / lands Golvklart when draft has ≥1 activity |
| 6 | Soft fail flash | When open returns false: same need-activity / need-hall flash behavior as Kom igång today |
| 7 | Swedish labels | Visible titles Hallöversikt / Golvklart (Docs-locked) |

### Öppna på telefon (B1)

| # | Rule | Pass if |
|---|---|---|
| 8 | Always on Home | Block visible with and without draft (`no-print`) |
| 9 | Existing keys | Uses `oppnaPaTelefon*` (title/body/bookmark/honesty/add-home) — no sync/account wording |
| 10 | Live URL | Pages URL `https://drevmok.github.io/traningsplaneringen/` visible as text and openable as a link |
| 11 | Honesty kept | Slice 10 honesty aside still present and meaningful |
| 12 | No dismiss required | Block does not require dismiss to use Home |

### Layout / chrome (C1) + scope (E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 13 | Layering | Hall/Golvklart in home-actions secondary; phone block with/below honesty; Kom igång not force-expanded; no new tip strip for this pack |
| 14 | Footer | `Träningsplaneraren · Slice 23` when shipped |
| 15 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 16 | Scope F1 | No Förråd empty CTA; no saknar banner; no place-heuristic change; no Passbyggaren compose / library / CAD / cloud / sync; Slice 22 quiet Kom igång + Hall hints intact |
| 17 | Build | `npm run build` green in `app/` |
| 18 | No window regressions | No new `window.confirm` for this chrome |

## Phone / Home smoke

1. **No draft:** open Home → no Hallöversikt/Golvklart secondary; honesty + Öppna på telefon visible; URL openable.  
2. **With draft + activities:** secondary Hallöversikt → edit hall; Golvklart → floor; primary cards still work.  
3. **Soft fail:** if open fails (e.g. empty activities edge), flash matches Kom igång.  
4. **Slice 22 intact:** Kom igång still collapses after progress; Hall compact hints unchanged.  
5. Footer Slice 23; caption unchanged; no Förråd empty CTA; build green.

## Fail if

- Hall/Golvklart secondary shown without draft when A1 locked (prefer-hide).  
- Primary Nytt/Mall/Fortsätt removed or replaced.  
- Öppna-på-telefon missing, missing live URL, or invents sync/account copy.  
- Honesty removed.  
- Kom igång force-expanded or new tip strip added for hall entry.  
- Förråd empty CTA / saknar banner / place-heuristic / compose / library / CAD / caption / cloud shipped.  
- Footer not Slice 23; build red.  
- Verifier run before APPROVED + Builder ship + Planner ping.

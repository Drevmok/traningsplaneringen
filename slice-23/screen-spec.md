# Slice 23 — screen spec (DRAFT · recommended locks)

**Status:** **DRAFT 2026-09-26** — behavior follows **recommended** A1/B1/C1/D1/E1/F1 until Christoffer locks.  
**Viewport focus:** Phone ~390px and desktop; Home chrome only.

## 1) Secondary Hallöversikt / Golvklart (recommended A1)

```
Home

When draftExists === false:
  Hide Hallöversikt + Golvklart secondary actions
  Primary Nytt / Mall / Fortsätt unchanged (Fortsätt disabled as today)

When draftExists === true:
  Under primary home-actions cards, show secondary row/cards (≥44px):
    [ Hallöversikt ]  → onOpenHall()
         if false → flash UI.komIgangNeedActivity (same as Kom igång)
    [ Golvklart ]     → onOpenGolvklart()
         if false → flash itemCount < 1 ? komIgangNeedActivity : komIgangNeedHall

  Do not replace Nytt / Mall / Fortsätt
  Do not require expanding Kom igång
```

**Props already available:** `canOpenHall`, `itemCount`, `onOpenHall`, `onOpenGolvklart` — reuse; A1 does not require stricter visibility gates.

**Do not change:** `openHallFromHome` / `openGolvklartFromHome` semantics beyond calling them from new Home controls; Passbyggaren; Hall compose; Slice 22 Kom igång collapse.

## 2) Öppna på telefon (recommended B1)

```
Home, no-print cluster near honesty aside:

  [ Honesty aside — unchanged Slice 10 title/body/other-device ]

  [ Öppna på telefon ]
    Title:   oppnaPaTelefonTitle
    Body:    oppnaPaTelefonBody
    Link:    https://drevmok.github.io/traningsplaneringen/
             (visible text + openable; new tab / same tab OK — Prefer openable <a>)
    Bookmark / honesty / add-home: existing oppnaPaTelefon* keys
    Always visible (not draft-gated)
    No dismiss control required
    No sync / account / cloud wording
```

**Keep** honesty. Phone block does **not** replace honesty.

## 3) Layout / chrome (recommended C1)

```
Home vertical (conceptual):

  Header (Träningsplaneraren invite)
  Kom igång (Slice 22: collapsed after progress — do NOT force expand)
  home-actions:
    Primary: Nytt · Mall · Fortsätt
    Secondary (if draft): Hallöversikt · Golvklart
  Visa tips igen (unchanged)
  Honesty aside
  Öppna på telefon (with/below honesty)
```

- Secondary styling for hall/floor CTAs (quieter than Nytt primary).
- ≥44px hit targets.
- Swedish only.
- No new tip strips.

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Nytt / Mall / Fortsätt | Unchanged |
| Kom igång expand/collapse / Dölj | Slice 22 unchanged |
| Visa tips igen | Unchanged |
| Honesty aside | Still always-on meaning |
| New Hallöversikt / Golvklart | Soft open + flash as Kom igång |
| New Öppna på telefon link | Opens live Pages URL |
| Caption / Hall / compose | Unchanged (not this surface) |

## Surfaces that must not change

| Surface | |
|---|---|
| Förråd empty CTA | Not added (Slice 24) |
| Saknar-redskap banner | Not added (Proposed) |
| Kom igång place heuristic | Unchanged (Proposed) |
| Passbyggaren compose / library / CAD / caption / cloud | Unchanged |
| Slice 22 Hall hints / chrome layering | Unchanged |
| Device-local drafts model | Unchanged |

## Layout sketches

### Home — with draft (~390px)

```
[ Hem · Träningsplaneraren ]
[ Kom igång   2 av 5 klart  [Visa…] ]   ← Slice 22 collapsed OK
[ ➕ Nytt pass          ]
[ 📋 Mall               ]
[ 📝 Fortsätt           ]
[ Hallöversikt ] [ Golvklart ]          ← secondary ≥44px
[ Visa tips igen ]
[ Utkastet stannar i den här webbläsaren … ]
[ Öppna på telefon ]
[ … body … ]
[ https://drevmok.github.io/traningsplaneringen/ ]  ← openable
[ bookmark / honesty / add-home lines ]
```

### Home — no draft

```
[ Primary Nytt / Mall / Fortsätt (Fortsätt disabled) ]
[ (no Hallöversikt / Golvklart) ]
[ Honesty + Öppna på telefon still shown ]
```

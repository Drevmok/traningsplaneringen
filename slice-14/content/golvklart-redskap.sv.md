# Golvklart & utskrift — redskap under station (Slice 14)

**Status:** Docs lock — Christoffer approved Slice 14 (2026-09-25). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Show composed redskap under numbered Teknik stations in **Golvklart** and **print** only. Unset / saved `[]` = quiet. No marker badge. No Passbyggaren compose. No CAD pins.  
**Carry-forward:** Reuse Slice 07 Golvklart chrome ([`golvklart-copy.sv.md`](./golvklart-copy.sv.md)) and Slice 13 labels / count format ([`station-compose.sv.md`](./station-compose.sv.md)).  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Slice 17:** Short station titles on Golvklart **screen** (stack title then redskap). See [`golvklart-short-titles.sv.md`](../../docs/golvklart-short-titles.sv.md). Edit canvas stays title-hidden.
**Out of scope copy:** CAD, badge, “inga redskap” on floor, Förrådslista sheet (Slice 15), Kom igång compose step, Netlify, accounts, “+N till”, side-list chrome.

---

## Locked format (Christoffer 2026-09-25)

| Rule | Lock |
| --- | --- |
| Count === 1 | `{label}` only (omit ×) — match Slice 13 detail |
| Count > 1 | `{n}× {label}` (Unicode ×) |
| Many pieces | Show all lines up to soft cap **8**; **no** “+N till” |
| Layout | Under each numbered Teknik markör |
| Golvklart screen | Short title **shown** (Slice 17); equipment lines if non-empty **under** title |
| Unset / `[]` | Quiet — no lines, no empty chrome |

---

## Visibility matrix (Slice 14 + 17)

| Mode | Kort stationsnamn | Redskap-rader |
| --- | --- | --- |
| Hallöversikt (redigera) | **Dolt** | Dolt |
| Golvklart (skärm) | **Synligt** (Slice 17) | Synligt om ifyllda (**under** namnet) |
| Utskrift | Synligt | Synligt om ifyllda (**under** namnet) |

Slice 14 “short title print-only on Golvklart screen” is **superseded** for screen only — see [`golvklart-short-titles.sv.md`](../../docs/golvklart-short-titles.sv.md). Quiet redskap rules below stay intact.

---

## Reuse (do not reinvent)

| Key | Swedish | Source |
| --- | --- | --- |
| `stationEquipmentCount` | {n}× {label} | Slice 13 |
| `stationEquipmentOne` | {label} | Slice 13 |
| `hallFloorReady` | Golvklart | Slice 07 |
| `hallExitFloor` | Avsluta golvklart | Slice 07 |
| `hallPrint` | Skriv ut | Slice 07 |
| `hallSchematicNote` | Schematisk hall — inte exakt mått | Slice 05+ |
| Equipment `labelSv` | Trampett … Kon (all 10) | Slice 13 |

Floor/print lines use the same count/label vocabulary as hall detail.

---

## Floor / print — equipment under markör

| Key | Swedish | Notes |
| --- | --- | --- |
| `hallFloorEquipmentCount` | {n}× {label} | Alias of `stationEquipmentCount` if Builder wants a floor-specific key |
| `hallFloorEquipmentOne` | {label} | **Locked** for count === 1 (match detail) |
| `hallFloorEquipmentA11y` | Redskap: {list} | Optional; join lines with kommatecken for expanded accessible name |

Example (non-empty, after Slice 17):

```
[3]  (icon)
     Volthop…
     2× Trampett
     Landningsmatta
```

Quiet redskap still shows the short title on Golvklart/print (no “Inga redskap”).

Rules:

- Show only when `stationEquipment` is a non-empty array (saved recipe).
- **Do not ship** `hallFloorEquipmentMore` / “+{n} till”.
- Default quiet: **no** floor empty string. Do **not** ship `hallFloorEquipmentEmpty` = “Inga redskap”.
- Do **not** surface förslag / “Använd förslag” on Golvklart or print.
- Do **not** invent English “equipment under station” as primary chrome.
- Lines are not a tap target / not a compose entry.
- Edit Hallöversikt canvas stays clean (no under-marker list, no badge).

---

## Soft tip (optional — at most one)

| Key | Swedish |
| --- | --- |
| `tipGolvklartEquipment` | Under siffrorna syns redskapen ni angett — bra när du visar gruppen eller skriver ut. |
| `tipGolvklartShortTitles` | Under markörerna syns stationsnamnen — bra när du håller upp skärmen för gruppen. |

- Soft, dismissible tip strip only if Builder adds it; **not** required for PASS.
- At most **one** soft Golvklart tip if any (equipment **or** short titles — Builder pick).
- Do not add a modal.
- Do not imply redskap appear if the coach never composed (quiet stations stay quiet).

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 14 |

Keep footer `no-print`. When Slice 17 ships, footer becomes **Träningsplaneraren · Slice 17** (Builder).

---

## Unchanged locks (copy)

- Golvklart / Avsluta golvklart / Skriv ut / Visa flöde / Dölj flöde
- Stationsordning följer passet (Teknik)
- Detail: **Redskap** · **Redigera redskap** · empty/förslag strings from Slice 13
- No Passbyggaren “Redigera redskap” entry copy
- No canvas “har redskap” badge copy
- Short title: Golvklart **screen** + print (`hall-chip-title--print`); edit canvas stays hidden — Slice 17 ([`golvklart-short-titles.sv.md`](../../docs/golvklart-short-titles.sv.md))

---

## Do not ship

- “Inga redskap” forced under every quiet markör on Golvklart/print
- Implying each mat is a separate floor pin
- “+N till” truncation copy
- Side-list / “redskapslista bredvid hallen” chrome
- Förrådslista packing chrome (Slice 15 — see [`forradslista.sv.md`](../../docs/forradslista.sv.md); not under-markör copy)
- Kom igång hard gate “måste ange redskap” (Slice 16 is soft discover only)
- CAD / exakta mått / Netlify / konton language
- Short titles on **edit** Hallöversikt canvas (Golvklart screen titles = Slice 17)

---

## Notes for Builder

- Prefer reusing Slice 13 count/label helpers over new synonyms.
- Redskap format locks stay final; screen titles locked in Slice 17 A–F.
- Companion: this file + [`golvklart-short-titles.sv.md`](../../docs/golvklart-short-titles.sv.md). Golvklart chrome stays in `golvklart-copy.sv.md`.

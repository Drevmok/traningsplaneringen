# Förrådslista — svensk microcopy (Slice 15)

**Status:** Docs lock — Christoffer approved Slice 15 (2026-09-25). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Read-only **Förrådslista** — pass-wide packing rollup. Merge non-empty `stationEquipment` by `pieceId`, sum counts. Fixed 10-piece library. No custom redskap. No club inventory (“vi har N”).  
**Carry-forward:** Reuse Slice 13 labels / count format ([`station-compose.sv.md`](../../docs/station-compose.sv.md)) and Slice 14 floor quiet rules ([`golvklart-redskap.sv.md`](../../docs/golvklart-redskap.sv.md)). Compose CTA stays **Redigera redskap** (hall detail only).  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren · Förrådslista  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** CAD, badge, Passbyggaren-compose, inventory stock, Kom igång hard gate, Netlify, accounts, custom “eget redskap”.

---

## Locked answers (A–F)

| # | Topic | Lock |
| --- | --- | --- |
| A | Entry | **Both** — Hallöversikt edit chrome **and** Golvklart (same sheet) |
| B | UI | Read-only **bottom sheet** (phone-first) |
| C | Sort | **Library order** (`EQUIPMENT_PIECES`: Trampett → … → Kon) |
| D | Print | Compact list when aggregate **non-empty**; quiet if empty |
| E | Unset / `[]` | **Omit** from sum (quiet); no förslag in totals |
| F | Footer | **Träningsplaneraren · Slice 15** when shipped |

---

## Title & entry CTAs

| Key | Swedish | Notes |
| --- | --- | --- |
| `forradslistaTitle` | Förrådslista | Sheet / print heading |
| `forradslistaOpen` | Förrådslista | Edit + Golvklart CTA (both entries) |
| `forradslistaOpenAria` | Visa förrådslista för passet | a11y |
| `forradslistaClose` | Stäng | |
| `forradslistaCloseAria` | Stäng förrådslista | |
| `forradslistaSub` | Summerat från Teknik-stationernas redskap | Optional one-liner under title |

Do not invent English “packing list” as primary chrome. Prefer **Förrådslista**.  
Same sheet from both entries. Do **not** block Golvklart when the list is empty.

---

## List lines (reuse Slice 13/14)

| Key | Swedish | Source |
| --- | --- | --- |
| `stationEquipmentCount` | {n}× {label} | Slice 13 — prefer this |
| `stationEquipmentOne` | {label} | Slice 13 — prefer this |
| `forradslistaCount` | {n}× {label} | Optional alias |
| `forradslistaOne` | {label} | Optional alias; **count === 1** omit × |
| Equipment `labelSv` | Trampett … Kon (all 10) | Slice 13 — do not rename |

Rules:

- count===1 → `{label}` only  
- count>1 → `{n}× {label}` (Unicode ×)  
- Sort: **library order** (locked C)  
- Aggregate totals may exceed per-station max (9) — show the real sum  
- Only non-empty saved `stationEquipment` contribute; unset / `[]` stay quiet; **no** förslag / seed defaults in the sum

Example sheet (non-empty):

```
Förrådslista                    Stäng
Summerat från Teknik-stationernas redskap
────────────────────────────────────────
2× Trampett
Landningsmatta
3× Madrass
```

---

## Empty state (nudge compose — existing CTA)

| Key | Swedish | Notes |
| --- | --- | --- |
| `forradslistaEmpty` | Inga redskap summerade ännu. | Quiet packing empty — not inventory |
| `forradslistaEmptyHint` | Ange redskap på Teknik-stationerna. Tryck en markör och välj Redigera redskap. | Points at existing detail CTA |
| `forradslistaEmptyHintShort` | Tryck en markör och välj Redigera redskap. | If space is tight |

- Must mention **Redigera redskap** (locked Slice 13 CTA).  
- Align with detail empty spirit (`Inga redskap angivna ännu`) but keep **summerade** so packing ≠ per-station empty.  
- Do **not** ship “vi har 0 trampetter” / stock language.  
- Do **not** force “Inga redskap” under every quiet markör (Slice 14 quiet stays).  
- Empty sheet stays reachable (discoverability). Do **not** auto-open compose from the sheet.

---

## Print (locked D)

| Key | Swedish | Notes |
| --- | --- | --- |
| `forradslistaPrintHeading` | Förrådslista | Same title OK |
| `forradslistaPrintIntro` | Ta med från förrådet: | Optional short lead-in |

- Print the compact block only when aggregate is **non-empty**.  
- Quiet when empty — **no** empty heading on paper.  
- Prefer after schematic + caption so the floor map stays primary (Builder may place under title strip).  
- Per-station under-markör lines (Slice 14) stay as they are.

---

## Soft tip (optional — at most one; non-blocking)

| Key | Swedish |
| --- | --- |
| `tipForradslista` | Förrådslista summerar redskapen från alla Teknik-stationer — bra innan ni plockar i förrådet. |

- Soft dismissible tip only if Builder adds it; **not** required for PASS.  
- Do not add a modal.  
- Do not imply the list fills itself without compose.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 15 |

Keep footer `no-print`.

---

## Unchanged locks (copy)

- Golvklart / Avsluta golvklart / Skriv ut / Visa flöde / Dölj flöde  
- Detail: **Redskap** · **Redigera redskap** · empty/förslag from Slice 13  
- Floor under-markör format from Slice 14  
- Caption: **Schematisk hall — inte exakt mått**  
- No Passbyggaren “Redigera redskap” entry copy  
- No canvas “har redskap” badge copy  
- Kom igång compose step copy = **later slice** (idea 2)

---

## Do not ship

- “Vi har N i förrådet” / stock / inventory counts  
- Custom “eget redskap” field copy  
- Implying Förrådslista edits compositions or opens compose  
- Hard gate “måste fylla Förrådslista innan Golvklart”  
- “Saknas på N stationer” warning banner (keep partial quiet this slice)  
- CAD / exakta mått / Netlify / konton language  
- Renaming library piece labels  
- English “packing list” as primary chrome

---

## Notes for Builder

- Prefer Slice 13 `stationEquipmentCount` / `stationEquipmentOne` over new synonyms.  
- Wire CTAs in **Hallöversikt edit** and **Golvklart** only; same read-only sheet.  
- Aggregate: omit unset / `[]`; never include `defaultStationEquipment` / förslag.  
- Companion: this file under `docs/forradslista.sv.md`. Compose chrome stays in `station-compose.sv.md`; floor lines in `golvklart-redskap.sv.md`.

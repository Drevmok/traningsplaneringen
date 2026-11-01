# Slice 58 — Stationsskiss y + yta (A1 B1 C1 D1 E1 F1)

Beslut: [`slice-58/decisions.md`](https://github.com/Drevmok/traningsplaneringen/blob/bf199f0/slice-58/decisions.md) (Docs `slice-58-docs` @ `bf199f0`).

**Merga inte** — väntar på verifiering. **Ingen SQL behövs** (`schema-58.sql` hoppas över; `default_station_layout` är redan jsonb och triggern ignorerar extra fält).

- A1: valfri `y` per pose (0–1, steg 1/8), fortfarande `v:1`; sanering klämmer/avrundar, ogiltigt utelämnas.
- B1: «Höjd +/−» (max 8 lager, avstängd vid gräns), PageUp/PageDown, «Lager N».
- C1: ritordning y↑, z↓, index; lyft 8·6·y px. y=0 ger identisk transform som main.
- D1: auto-viewBox från `layoutBounds` + `surface {w,h}` 0–2 (steg 80×40): Bredare yta / Högre yta / Standardyta. «Ställ i rad igen» nollställer ytan. surface sparas bara ≠ 0.
- E1: heuristikgrenen orörd (SVG identisk med main, 3063/3063).
- F1: detalj och utskrift använder samma komponent; inget klipps.
- Mikrocopy från Docs. Inte rört: städning, admin-kö, hall-CAD, WebGL/three, Lilla-Paris-Drift.

Resultat: bun test 304/0, tsc ren, lint bara varningar, build 0.
Bundle gzip (assets js+css, gzip -9): main 218195 → gren 219301 = **+1106 B** (över +512 B, godkänt i låset).

## Doctor
`verifier/tools/doctor.sh`: **PASS** (main-cache b610103 byggd, baseline 48 rader).

## Smokes (mot main-baseline b610103)
| Smoke | Resultat |
|---|---|
| slice-48-builder | 80/80 SAMMA |
| slice-49-builder | 34/34 SAMMA (footer 57→58) |
| slice-52-admin-import | 6/0 SAMMA |
| slice-55-builder | 25/25 (footer 57→58) |
| slice-56-builder | 18/18 (footer 57→58) |

Netlog: 227 anrop, 0 till live-projektet.

## AC (390×844; AC18 även 844×390; fake bank, 0 live-anrop)
| AC | Status |
|---|---|
| 1–14, 16–19 | PASS |
| 15 | Unit/doc — trigger kan inte köras mot fake bank; täckt av schema-notes + unit round-trip |

## Kända begränsningar
- En äldre klient (Slice ≤57) som sparar om layouten tappar `y`/`surface` (saneringen där känner inte fälten).
- Gles layout ger nu smalare detalj-viewBox (min 320 bred) i stället för fast 640 — avsiktligt (D1).

# Slice 53 — verifieringslista (FÖRESLAGEN)

Viewport **390×844** och **844×390** där det står. Lokal förhandsvisning port 4173. Rensad lagring före varje AC.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Planera pass → 7–9 år → Blandat → «Gymmix – Stora hallen» → 60 min → Hallöversikt (390×844) | Verktygsraden visar «Sparat» |
| AC2 | Samma som AC1 i 844×390 | «Sparat» syns, hallen syns utan att skrolla (som Slice 43) |
| AC3 | Hallöversikt: dra en markör, vänta 1 s, ladda om, Fortsätt passet → Hallöversikt | Markören står där du släppte den |
| AC4 | Fyll lagringen så att skrivning misslyckas (Verifier-verktyg), flytta en markör i Hallöversikt | «Inte sparat» syns i Hallöversikt |
| AC5 | Tomt pass utan stationer → Hallöversikt | Ingen statustext |
| AC6 | Passbyggaren efter en ändring | «Sparat» som i dag (B1: utan bock) |
| AC7 | «Gymmix – Grophallen», pass med 3 Teknikstationer → Hallöversikt (390×844) | Tre markörer i rad 1, samma positioner som på main |
| AC8 | «Gymmix – Stora hallen», 12 Teknikstationer | Positioner identiska med main (gyllene test + skärmdump) |
| AC9 | «Gymmix – Grophallen», 12 Teknikstationer → Hallöversikt (390×844 och 844×390) | Alla 12 nummer syns; ingen markör ligger exakt på en annan |
| AC10 | Öppna ett pass sparat på main med placerade markörer | Inga markörer har flyttats |
| AC11 | Sidfoten | «Träningsplaneraren · Slice 53» |
| AC12 | `npm run build`, `npm run lint`, `bun test src` | Gröna; bundle gz ≤ +512 B mot main |

Smokes: enligt `verifier/tools/pick-smokes.mjs`. Ändrade filer: `App.tsx`, `HallBoard.tsx`, `lib/hall.ts`, `blockMeta.ts`.

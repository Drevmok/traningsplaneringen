# Slice 49 — verifieringslista (LOCKED)

**Status:** LOCKED A1 B1 C1 D1 E1 F1 (PO 2026-10-23, se README).

Viewport **390×844**, lokal förhandsvisning port 4173 (Verifier: Launch / Doctor / Drive). Rensad lagring före varje AC.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Planera pass → 7–9 år → Blandat → «Gymmix – Stora hallen» → 60 min | Passbyggaren «60 / 60 min» |
| AC2 | Samma med 90 min | «90 / 90 min»; Teknik 3 × 12 |
| AC3 | Samma med 120 min, «Gymmix – Grophallen» | «120 / 120 min»; alla tider hela minuter |
| AC4 | 4–6 år, Satsbräda, 90 min | «90 / 90 min» |
| AC5 | Efter AC2: Kör passet | Start «Kvar: 90 min» |
| AC6 | Efter AC2: byt längd till 60 i Passbyggaren | Tiderna oförändrade (B1), «90 / 60 min» |
| AC7 | Efter AC1: Hallöversikt | Ingen «X stationer saknar redskap» för stationer med förslag; ingen «Använd alla förslag»; ingen «Inga förslag att spara» |
| AC8 | Efter AC1: Förrådslista | Lista med redskap, ingen tomtext |
| AC9 | Starta från mall (inbyggd) → Hallöversikt | Saknar-raden är text utan knapp; **en** «Använd alla förslag» i verktygsraden |
| AC10 | AC9 → tryck «Använd alla förslag» | Toast «Sparade redskap på {n} stationer»; knappen försvinner |
| AC11 | AC9 före tryck → Förrådslista → pekaren | Stänger, markerar knappen i verktygsraden |
| AC12 | Använd mall utan föreningsmallar | Ingen «Föreningens mallar», ingen «Föreningen har inga mallar än.» |
| AC13 | Planera pass → Mall-vägen, utan föreningsmallar | Samma som AC12 |
| AC14 | Med minst en föreningsmall | Sektionen visas som förut |
| AC15 | Admin → Föreningens mallar, noll mallar | Tomtexten finns kvar |
| AC16 | Sidfot | «Träningsplaneraren · Slice 49» |
| AC17 | `bun test src` | Grönt |
| AC18 | Bundle mot c86175a | ≤ +512 B gz (väntat +100–200) |

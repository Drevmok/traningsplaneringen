# Slice 29 — Docs start

**Status:** Docs starting after approval on **2026-09-27**. A1/B1/C1/D1/E1/F1 are locked.

## Docs scope

Docs owns the Swedish copy and the living reference for the Home 3-question wizard:

- **Home CTA:** Swedish wording for the primary **Planera pass** entry, including its short explanation of the three questions and the finished pass.
- **Q1 — Ålder / nivå:** labels and options from B1: **4–6 år**, **7–9 år**, **Nybörjare**, **Träning**.
- **Q2 — Fokus redskap / tema:** labels and options from B1: **Satsbräda**, **Trampett**, **Tumbling**, **Blandat**.
- **Q3 — Hallayout:** label and the existing preset options: **Standard trupp**, **Tävling / linjer**, **Liten hall**.
- **Focus-path honesty:** explain that the chosen focus gets suggested Teknik stations in matching zones; other zones may intentionally remain empty/free. Do not promise that every zone is filled.
- **Escape labels:** retain clear Swedish labels for **Nytt pass** and **Starta från mall** / mallar as the quieter escape paths.
- **Living reference:** create and maintain [`docs/home-wizard.sv.md`](../docs/home-wizard.sv.md) with wizard intent, final copy, Q1–Q3 options, curated focus-path table, and the tag → zone map.

## Ownership boundary

Docs defines the Swedish product copy and reference tables. Builder owns `composeWizardSession` and the hall placements/pre-placement behavior. Builder must consume the locked options and path/zone reference without changing the Soft blank or mall escape behavior.

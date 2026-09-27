# Slice 29 — content

Pack **APPROVED 2026-09-27** — A1/B1/C1/D1/E1/F1. **Docs shipped** (living Swedish lock).

| File | Role |
| --- | --- |
| [`home-wizard.sv.md`](./home-wizard.sv.md) | Living Swedish lock: Home Planera pass CTA; Q1–Q3; curated paths; tag→zone; honesty; escapes |
| Living target | [`docs/home-wizard.sv.md`](../../docs/home-wizard.sv.md) |
| Companions | [`docs/copy-home-polish.sv.md`](../../docs/copy-home-polish.sv.md) · [`docs/ui-chrome.sv.md`](../../docs/ui-chrome.sv.md) · [`docs/soft-samling.sv.md`](../../docs/soft-samling.sv.md) · [`docs/mall-samling-budget.sv.md`](../../docs/mall-samling-budget.sv.md) |

## Locked keys (quick)

### Home CTA (A1)

| Key | Swedish |
| --- | --- |
| `homeWizardPrimary` | Planera pass |
| `homeWizardPrimaryDesc` | Tre frågor — färdigt pass med stationer på hallen. |
| `wizardFinish` | Skapa pass |
| `wizardStepProgress` | Fråga {n} av 3 |

### Q1 / Q2 / Q3 (B1)

| Step | Options |
| --- | --- |
| Ålder / nivå | 4–6 år · 7–9 år · Nybörjare · Träning |
| Fokus | Satsbräda · Trampett · Tumbling · Blandat |
| Hallayout | Standard trupp · Tävling / linjer · Liten hall |

### Honesty

| Key | Swedish |
| --- | --- |
| `wizardFocusHonesty` | Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok. |

### Escapes (E1)

Existing: `Nytt pass` / `Starta från mall` / Soft Samling / two malls — keep labels; optional quieter descs only.

### Chrome

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 29 |

### Builder contract (not Docs inventing)

- New wizard compose + pre-place; do **not** break Soft `createBlankSession`.  
- Do **not** clear Slice 28 mall gathering.  
- Teknik-only placements; tag→zone map per decisions.  
- Curated paths ≤ block budgets (esp. warmup ≤10).  
- No full 4×4 matrix; no Använd-alla-on-finish; no Pages unless asked.

Footer when shipped: `Träningsplaneraren · Slice 29`. No app code in the Docs pass.

# Slice 27 — content

Pack **APPROVED 2026-09-26** — A2/B1/C1/D2/E1/F1 locked; Docs lock finalized (E1 + A2). Builder ships soft inject + budget from pack; strings below.

| File | Role |
| --- | --- |
| [`soft-samling.sv.md`](./soft-samling.sv.md) | Docs lock: Soft Samling intent; blank Nytt pass inject; seed retitle; empty tip; budget contract; Kom igång note; footer Slice 27 |
| Living mirror | [`docs/soft-samling.sv.md`](../../docs/soft-samling.sv.md) |
| Living companions | `docs/slice-03-seed-activities.sv.md` (retitle) · `docs/slice-01-empty-states.sv.md` (empty tip) · `docs/ui-chrome.sv.md` · `docs/coach-tips.sv.md` |

## Locked keys (quick)

### Soft pair (blank Nytt pass only)

| Order | activityId | title | min |
| --- | --- | --- | ---: |
| 0 | `gather-narvaro` | Närvaro | 3 |
| 1 | `gather-dagens-teknik` | Dagens pass — snabb genomgång | 3 |

**Same id** `gather-dagens-teknik` — retitle only; no new seed.

### Seed retitle — `gather-dagens-teknik`

| Field | Swedish |
| --- | --- |
| `title` | Dagens pass — snabb genomgång |
| `summary` | Kort genomgång av vad ni ska göra på passet — så alla vet planen innan ni börjar. |
| `howTo` | 1. Samla gymnasterna så alla syns och hör. 2. Säg i enkla ord vad passet innehåller — block för block eller dagens fokus. 3. Håll det kort; spara djup coaching till respektive block. |
| `watchFor` | För lång genomgång — håll det till ”vad vi gör idag”, inte hela övningarna. |

### Empty tip / chrome

| Key | Swedish |
| --- | --- |
| `EMPTY_TIPS.gathering.tip` | Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter. |
| `EMPTY_TIPS.gathering.addLabel` | Lägg till din första samlingsövning (**unchanged**) |
| `footerSliceLabel` | Träningsplaneraren · Slice 27 |

### Builder contract (not Docs inventing)

- Inject soft pair in `createBlankSession` only (B1).  
- `BLOCK_BUDGETS.gathering` **5 → 6** (D2).  
- Templates / loadDraft unchanged (B1/C1).  
- Kom igång `addActivities` auto-check from soft items = intentional.

Footer when shipped: `Träningsplaneraren · Slice 27`. No hall copy. No hard-lock. No other seeds. No app code in this Docs pass.

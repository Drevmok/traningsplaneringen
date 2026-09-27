# Soft Samling — svensk Docs (Slice 27)

**Status:** Docs lock — Christoffer approved A2/B1/C1/D2/E1/F1 (2026-09-26). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*. Soft defaults = editable, not hard-locked.  
**Product lock:** Every **new blank** “Nytt pass” starts Samling with **Närvaro** (`gather-narvaro`, 3 min) + **Dagens pass — snabb genomgång** (`gather-dagens-teknik`, 3 min, **same id** — retitle only). Fully editable; no hard-lock UI; Samling never on hall.  
**Carry-forward:** Quiet chrome (22). Home polish (23). Förråd soft path (24). Saknar banner (25). Place-step heuristic (26).  
**Locked terms:** gymnaster · pass · övning · Samling · Uppvärmning · Teknik · Styrka · Lek och spel · Passbyggaren · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Starta från mall · Kom igång · Använd alla förslag · Nytt pass  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** hard-lock Samling · hall / Golvklart placeable · other seeds · template Samling rewrite · draft migrate · tip strip invent · library/CAD/cloud/accounts · Netlify/Pages republish · app code in this Docs pass

Pack mirror: [`slice-27/content/soft-samling.sv.md`](../slice-27/content/soft-samling.sv.md).  
Living companions: [`slice-03-seed-activities.sv.md`](./slice-03-seed-activities.sv.md) · [`slice-01-empty-states.sv.md`](./slice-01-empty-states.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md) · [`coach-tips.sv.md`](./coach-tips.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A2 | Soft pair = Närvaro + retitle `gather-dagens-teknik` → pass-rundown; **same id**; no new seed |
| B1 | Inject on blank **Nytt pass** only; templates keep authored gathering |
| C1 | Existing drafts / empty Samling on open — leave alone (no migrate, no re-inject mid-edit) |
| D2 | `BLOCK_BUDGETS.gathering` **5 → 6** so soft 3+3 fits without “Över budget” on default |
| E1 | This living file + empty tip tweak + seed title/summary/howTo/watchFor for A2 |
| F1 | No hard-lock; no hall change; keep other seeds; preserve 22–26; footer Slice 27 |

---

## Soft pair (blank Nytt pass)

| Order | activityId | title (locked) | durationMinutes |
| --- | --- | --- | ---: |
| 0 | `gather-narvaro` | Närvaro | 3 |
| 1 | `gather-dagens-teknik` | Dagens pass — snabb genomgång | 3 |

- **Same id** `gather-dagens-teknik` — Docs retitle only; **no** parallel seed (`gather-dagens-pass` etc.).  
- `gather-valkomstcheck-in` stays in the library; **not** in the soft default pair.  
- `gather-narvaro` Swedish fields **unchanged**.

### Seed retitle — `gather-dagens-teknik` (A2)

Rundown of **what you’ll do on the pass** — not a new drill, not technique-only framing.

| Field | Swedish (locked) |
| --- | --- |
| `id` | `gather-dagens-teknik` (**unchanged**) |
| `title` | Dagens pass — snabb genomgång |
| `summary` | Kort genomgång av vad ni ska göra på passet — så alla vet planen innan ni börjar. |
| `howTo` | 1. Samla gymnasterna så alla syns och hör.\n2. Säg i enkla ord vad passet innehåller — block för block eller dagens fokus.\n3. Håll det kort; spara djup coaching till respektive block. |
| `watchFor` | För lång genomgång — håll det till ”vad vi gör idag”, inte hela övningarna. |
| `durationMinutesDefault` | 3 (**unchanged**) |
| Other flags | Unchanged (`newCoachOk`, `needsCoachReview`, tags, `visualKey`, …) |

**howTo as numbered list (for seed docs):**

1. Samla gymnasterna så alla syns och hör.  
2. Säg i enkla ord vad passet innehåller — block för block eller dagens fokus.  
3. Håll det kort; spara djup coaching till respektive block.

---

## Empty tip — Samling (E1)

When Samling is cleared (`items.length === 0`), show tip + addLabel. Soft invite — **not** mandatory; soft does **not** re-prefill mid-edit.

| Key | Swedish |
| --- | --- |
| `EMPTY_TIPS.gathering.tip` | Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter. |
| `EMPTY_TIPS.gathering.addLabel` | Lägg till din första samlingsövning |

**Unchanged:** Tips-flik `TIPS_TAB.gathering` — *Samla i cirkel, ta ögonkontakt och säg vad dagens pass handlar om — i en mening.* (already pass-framed).

---

## Builder contract (document only — do not implement in Docs)

### Inject (B1)

```
createBlankSession / createEmptyBlocks (gathering only):
  items = [
    createSessionItem('gather-narvaro', 3, 0),
    createSessionItem('gather-dagens-teknik', 3, 1),  // copy per A2 above
  ]
  // other blocks remain []

cloneTemplate / loadDraft:
  unchanged under B1 / C1
```

- Soft inject **only** on blank **Nytt pass**.  
- Templates keep authored gathering (e.g. beginner: Välkomstcheck-in + Dagens pass; short: Välkomstcheck-in).  
- Cleared Samling → empty tip; **no** re-inject mid-edit.  
- Editability unchanged: remove, reorder, duration, add from library (incl. Välkomstcheck-in).

### Budget (D2)

| Symbol | Before | After |
| --- | ---: | ---: |
| `BLOCK_BUDGETS.gathering` | 5 | **6** |

Soft default filled 6 / budget 6 → no `Över budget` on intended blank start. Over-budget remains soft-allowed if coach adds more.

### Kom igång (intentional)

Soft-prefill items count toward `itemCount >= 1` → `addActivities` may auto-check on blank Nytt pass. **Document as intentional** — do not exclude soft Samling items from the heuristic. Step label/hint **unchanged**.

### Hall / Golvklart (F1)

Samling never placeable. Teknik-only set, caption, Förråd, saknar, place-step — **unchanged** (22–26).

---

## Footer (F1 companion)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 27 |

Keep footer `no-print`. Ship when Builder lands Soft Samling.

---

## Do not ship (Docs / Builder)

- Hard-lock remove / hide planning UI for Samling  
- New seed id for pass-rundown (keep `gather-dagens-teknik`)  
- Hall / Golvklart / Förråd / saknar / place-step copy rewrites  
- Removing Välkomstcheck-in or other seeds from the library  
- Rewriting template Samling to match soft pair  
- Migrating existing empty drafts  
- Netlify / Pages republish unless Christoffer asks  
- App code in the Docs pass

---

## Builder checklist (after Docs)

1. Wire seed fields for `gather-dagens-teknik` from the locked table.  
2. Soft-prefill on blank create only (B1); leave cloneTemplate / loadDraft alone (C1).  
3. `BLOCK_BUDGETS.gathering = 6` (D2).  
4. `EMPTY_TIPS.gathering.tip` from E1; addLabel unchanged.  
5. `footerSliceLabel` → Slice 27.  
6. Preserve 22–26; no hall / hard-lock invent. Self-smoke via `verify-traningsplaneraren/`.

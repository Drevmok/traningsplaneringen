# Copy Home polish — svensk microcopy (Slice 23)

**Status:** Docs lock — Christoffer approved Slice 23 A–F (2026-09-26). Builder may ship from these keys.  
**Tone:** Short, coach-facing Swedish. Prefer *du*.  
**Product lock:** Secondary Home **Hallöversikt** + **Golvklart** when `draftExists`; always-on **Öppna på telefon** near honesty with live Pages URL; keep honesty; no sync/cloud.  
**Locked terms:** gymnaster · pass · övning · Hallöversikt · Golvklart · Passbyggaren · Kom igång · Starta från mall · Förrådslista · Redigera redskap · utkast · webbläsare  
**Keep caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope:** Förråd empty CTA (Slice 24); saknar-redskap banner; Kom igång place-heuristic; tip strips; Passbyggaren compose; library/CAD; caption change; accounts/cloud/sync wording; Netlify/Pages republish.

Pack seed: [`slice-23/content/copy-home-polish.sv.md`](../slice-23/content/copy-home-polish.sv.md).  
Living companions: [`distribution-copy.sv.md`](./distribution-copy.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A | Secondary Hallöversikt + Golvklart when draft; hide when none |
| B | Always Öppna på telefon near honesty; live URL text + link |
| C | Secondary in home-actions; phone with honesty; no Kom igång expand; no tips |
| D | Thin strings below + living distribution / ui-chrome |
| E | Träningsplaneraren · Slice 23 |
| F | No Förråd empty / saknar / place-heuristic / sync-cloud invent |

---

## Home — secondary CTAs (A1)

Visible when `draftExists`; **hide** both when `!draftExists`. Secondary under Nytt / Mall / Fortsätt. ≥44px. Soft-fail flashes reuse Kom igång hints (unchanged).

| Key | Swedish |
| --- | --- |
| `homeOpenHall` | Hallöversikt |
| `homeOpenHallAria` | Öppna Hallöversikt från Hem |
| `homeOpenGolvklart` | Golvklart |
| `homeOpenGolvklartAria` | Öppna Golvklart från Hem |

Reuse (do **not** rewrite):

| Key | Swedish | When |
| --- | --- | --- |
| `komIgangNeedActivity` | Lägg till minst en övning först | Hall or Golvklart open returns false with no activities |
| `komIgangNeedHall` | Öppna Hallöversikt när du har övningar i passet | Golvklart open fails with activities present |

Notes:

- Visible labels match locked product terms (`hallOverview` / `hallFloorReady`). Prefer dedicated Home keys above so Home chrome stays explicit in `blockMeta`.
- Use `*Aria` when the control is icon-first or needs “from Hem” context; text-only buttons may use the visible label as name.
- Do **not** invent synonyms (“Öppna hall”, “Visa golv”, “Hall-läge”).

---

## Home — Öppna på telefon (B1)

Always show near honesty (`no-print`). Not draft-gated. No dismiss required. Keep honesty aside unchanged.

### Timeless strings (reuse — no host in body)

| Key | Swedish |
| --- | --- |
| `oppnaPaTelefonTitle` | Öppna på telefon |
| `oppnaPaTelefonBody` | Öppna samma länk i telefonens webbläsare. Du kan lägga till appen på hemskärmen för snabbare start. |
| `oppnaPaTelefonBookmark` | Spara länken som bokmärke så hittar du tillbaka till passet. |
| `oppnaPaTelefonHonesty` | Kom ihåg: utkastet bor i just den telefonens webbläsare. |
| `oppnaPaTelefonAddHome` | På iPhone: Dela → Lägg till på hemskärmen. På Android: menyn → Installera app / Lägg till på startsidan. |

### Host-swappable URL line (Q2)

| Key | Swedish / value |
| --- | --- |
| `oppnaPaTelefonUrl` | https://drevmok.github.io/traningsplaneringen/ |

**Pattern for Builder (host swap without Docs rewrite):**

1. Render a dedicated link line **under** `oppnaPaTelefonBody` (sibling, not inside body).
2. Visible text **and** `href` both come from **`oppnaPaTelefonUrl`** (or one build-time constant that seeds that key).
3. Keep `oppnaPaTelefonBody` / Bookmark / Honesty / AddHome **host-free** — if Pages host or path changes, Builder updates only the URL constant/key; Docs does not rewrite timeless copy.
4. Link must be openable (`<a href="…">`); new tab or same tab OK.
5. Do **not** bake the host into body copy. Do **not** invent sync/account/cloud wording around the link.

Honesty aside (`draftHonesty*`) stays as locked in [`distribution-copy.sv.md`](./distribution-copy.sv.md) — phone block does **not** replace it.

---

## Footer (E1)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 23 |

---

## Out of scope (do not invent)

- Förråd empty → Använd alla förslag CTA (Slice 24)  
- Saknar-redskap banner  
- Kom igång place-step / `openedHall` heuristic copy  
- New tip strip  
- Expanding Kom igång to carry hall entry  
- Synonyms that imply cloud (“synka till telefonen”, “spara i molnet”, “logga in”)  
- Caption / library / CAD / Passbyggaren compose changes  

---

## Notes for Builder

- Prefer these strings over inventing synonyms.  
- Wire Home CTAs + URL key into `blockMeta.ts` (or equivalent); open helpers already exist — Docs does not change navigation semantics.  
- Layout (secondary styling, honesty cluster) is C1 Builder work; Docs only locks labels above.  
- Living companions: [`distribution-copy.sv.md`](./distribution-copy.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md).

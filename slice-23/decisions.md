# Slice 23 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-26** — Christoffer approved via Planner lock widget; A–F locked as recommended  
**Direction:** Home polish — Hallöversikt / Golvklart secondary affordances when draft exists + wire Öppna på telefon with live Pages URL

Docs may start. Builder after Docs (or parallel only if Planner says). Verifier only after Planner ping.

Christoffer (2026-09-26) approved Scout ideas #1 + #2, then locked recommended A–F.

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| A | **A1** | When `draftExists`: secondary **Hallöversikt** + **Golvklart** (≥44px) under primary cards; reuse `onOpenHall` / `onOpenGolvklart` + same flash hints; hide both when `!draftExists` |
| B | **B1** | Always show Öppna-på-telefon near honesty; existing keys + live URL link; keep honesty; no dismiss |
| C | **C1** | Hall/Golvklart in `home-actions` (secondary); phone block with/below honesty; no Kom igång expand; no tip strips; ≥44px; Swedish only |
| D | **D1** | Thin Docs — Home CTA labels (+ aria); URL in phone block; living distribution/Home docs; no new tip |
| E | **E1** | Footer `Träningsplaneraren · Slice 23` |
| F | **F1** | No Förråd empty CTA (Slice 24); no saknar / place-heuristic; no compose/library/CAD/caption/cloud/sync; no republish unless asked; preserve Slice 22 quiet chrome |

---

## A. What Slice 23 touches

| Surface | Slice 23 change? |
|---|---|
| Home — primary Nytt / Mall / Fortsätt | **No** — keep primary; secondary row below |
| Home — Hallöversikt / Golvklart secondary | **Yes** — A1 when `draftExists` |
| Home — Öppna på telefon | **Yes** — B1 wire existing copy + URL |
| Home — honesty aside | **Keep** — do not remove or weaken |
| Home — Kom igång | **No expand** — Slice 22 collapse rules stay (C1) |
| Hallöversikt / Golvklart / Passbyggaren / Förråd | **No** feature change (open paths only from Home) |
| Scout Proposed saknar / place-heuristic | **Out** |
| Scout Approved Förråd empty CTA | **Out** — Slice 24 |

---

## DECISION RATIONALE — recommended A–F

### A. Home hall / Golvklart affordances (when draft)?

**Recommended A1: Two secondary actions when `draftExists`; hide when none**

- **When `draftExists`:** show two secondary Home actions (buttons/cards) ≥44×44px:
  - **Hallöversikt** → call `onOpenHall` (`openHallFromHome`). If returns `false`, flash same need-activity hint as Kom igång (`UI.komIgangNeedActivity`).
  - **Golvklart** → call `onOpenGolvklart` (`openGolvklartFromHome`). If returns `false`, flash need-activity / need-hall as today (`itemCount < 1` → `komIgangNeedActivity`, else `komIgangNeedHall`).
- **Placement:** secondary row or secondary-styled cards **under** primary Nytt / Mall / Fortsätt inside `home-actions` — **not** replacing them.
- **When `!draftExists`:** **hide** both (prefer hide over disabled-with-title to reduce chrome for brand-new coaches).
- Reuse existing App wiring; do **not** invent new navigation.

| Option | Note |
|---|---|
| **A1 (recommended)** | Two secondary CTAs when draft; hide otherwise; reuse open + flash | Matches Scout #1 + Kom igång soft pattern |
| A2 | Single “Öppna hall” → always edit Hallöversikt only | Reject — loses one-tap Golvklart for floor coaches |
| A3 | Only show when `canOpenHall` / placements respectively (stricter) | Reject for v1 — draft-gated is enough; flash still teaches when activities missing; stricter gate hides Golvklart too often before place |

**Rationale:** Slice 22 collapses Kom igång after progress, so hall/floor entry left Home. Props and open helpers already exist (`Home.tsx` / `App.tsx`). Show when an utkast exists; soft-fail with the same hints coaches already know from Kom igång.

**Rejected:** A2/A3 — see table.

---

### B. Öppna på telefon?

**Recommended B1: Always show help block near honesty; live URL; keep honesty**

- Always show on Home (not gated on `draftExists`) — coaches need the link before/without a draft.
- Place near honesty aside (`no-print`); with or immediately below honesty (C1).
- Use existing UI keys: `oppnaPaTelefonTitle` / `Body` / `Bookmark` / `Honesty` / `AddHome`.
- Include live Pages URL as visible text **and** openable link: `https://drevmok.github.io/traningsplaneringen/`
- Keep honesty aside unchanged in meaning (local-only).
- No dismiss required; no sync/account/cloud wording.

| Option | Note |
|---|---|
| **B1 (recommended)** | Always show; existing keys + live URL; keep honesty | Matches Scout #2 + Slice 10 deferred wiring |
| B2 | Only when `draftExists` | Reject — phone open help is useful before first save |
| B3 | Skip wiring | Reject — idea Approved |

**Rationale:** Slice 10 deferred the block until HTTPS existed; Pages is live through Slice 22. Strings already locked in Docs — wire, don’t invent.

---

### C. Layout / chrome layering with Slice 22?

**Recommended C1: Secondary actions in home-actions; phone with honesty; quiet Kom igång stays**

- Hall/Golvklart secondary actions sit in `home-actions` with **secondary** styling (visually quieter than Nytt primary).
- Öppna på telefon sits with/below honesty.
- Do **not** expand Kom igång to “solve” hall entry.
- Do **not** add tip strips for this pack.
- Hit targets ≥44px; Swedish only.

| Option | Note |
|---|---|
| **C1 (recommended)** | home-actions secondary + honesty cluster; no Kom igång expand; no tips | Preserves Slice 22 quiet chrome |
| C2 | Put hall CTAs inside expanded Kom igång | Reject — fights Slice 22 collapse |
| C3 | Tip strip advertising hall entry | Reject — adds chrome; F1 / Slice 22 C1 spirit |

**Rationale:** Same Home surface, two chrome zones — actions vs honesty/distribution — without undoing quieter Kom igång.

---

### D. Docs surface?

**Recommended D1: Thin Docs**

- Finalize Swedish for Home **Hallöversikt** / **Golvklart** CTA labels (+ aria).
- Confirm/adjust `oppnaPaTelefon*` if the live URL must appear in body copy (or as a sibling link line — Docs picks; URL must be visible + openable).
- Update living `docs/distribution-copy.sv.md` (+ `docs/ui-chrome.sv.md` / Home notes as needed).
- **No** new tip strip copy; **no** Förråd empty CTA copy (Slice 24); **no** saknar banner copy.

| Option | Note |
|---|---|
| **D1 (recommended)** | Thin strings + living-doc touch-ups | Enough for A1/B1 |
| D2 | Rewrite all honesty / distribution | Reject — scope |
| D3 | No Docs pass | Reject — new visible Swedish needs Docs |

Pack placeholder: [`content/`](./content/) — Docs fills Swedish after lock.

---

### E. Footer?

**Recommended E1:** `Träningsplaneraren · Slice 23` when Builder ships.

| Option | Note |
|---|---|
| **E1 (recommended)** | Footer Slice 23 | Standard |
| E2 | Keep Slice 22 footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Recommended F1 — all stand:**

- **No** Förråd empty → Använd alla förslag CTA (**Slice 24** — Approved in backlog only)
- **No** saknar-redskap banner (stays Proposed)
- **No** Kom igång place-heuristic change (stays Proposed)
- **No** Passbyggaren compose; no library growth; no CAD / pins / badge
- Caption **Schematisk hall — inte exakt mått** unchanged
- **No** accounts / cloud / sync wording
- **No** Netlify / GitHub Pages republish unless Christoffer asks
- Preserve Slices **11–22** except this Home chrome — especially Slice 22 quiet Kom igång + Hall progressive hints / one chrome layer

| Option | Note |
|---|---|
| **F1 (recommended)** | All non-goals above | Keeps pack Home-polish-only |
| F2 | Bundle Förråd #3 or saknar / place-heuristic | Reject — different surfaces/axes; Förråd = Slice 24 |

---

## Open questions (recommended answers)

| # | Question | Recommended answer |
|---|---|---|
| Q1 | Gate secondary hall CTAs on `canOpenHall` too? | **No for A1** — gate on `draftExists` only; soft-fail flash when open returns false (same as Kom igång). |
| Q2 | Where does the live URL live in copy? | Visible text + `<a href>` (or equivalent) next to / under `oppnaPaTelefonBody`; Docs may add a small `oppnaPaTelefonUrl` key or embed in body — prefer dedicated link line so body stays timeless if host changes. |
| Q3 | Secondary card vs text buttons? | Builder picks; must read as **secondary** under primary three; ≥44px; Swedish titles **Hallöversikt** / **Golvklart**. |
| Q4 | Does Öppna-på-telefon need dismiss? | **No** — always-on help like honesty. |
| Q5 | Interaction with Slice 22 Home tip vs Kom igång? | Unchanged C1 from Slice 22; this pack adds no tip strip. |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 single Öppna hall | Loses Golvklart one-tap |
| A3 stricter canOpenHall/placements-only | Hides too early; flash already teaches |
| B2 draft-only phone block | Phone help useful pre-draft |
| B3 skip wiring | Approved idea |
| C2/C3 expand Kom igång / tip strip | Fights Slice 22 quiet chrome |
| D2/D3 heavy or no Docs | Scope / Swedish gate |
| F2 bundle Slice 24 or Proposed hall items | Different packs |

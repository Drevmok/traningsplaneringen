# Slice 23 — Home polish (Hallöversikt / Golvklart + Öppna på telefon)

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — recommended A–F locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED** — Christoffer approved via Planner lock widget; Docs may start.

**Backlog:** Christoffer (2026-09-26) approved Scout ideas #1 + #2 (both Effort S, same Home surface). Bundled per [`backlog/SCOUT-PLAYBOOK.md`](../backlog/SCOUT-PLAYBOOK.md) “Bundle related S polish”. Live baseline: https://drevmok.github.io/traningsplaneringen/ (Slice 22 quieter chrome).

**Leaves Proposed (out of this pack):** Hall soft “saknar redskap” banner · Kom igång place-step heuristic.

**Queued separately:** Scout #3 Förråd tom → Använd alla förslag → **Approved** for **Slice 24** (do **not** draft `slice-24/` in this pack).

## Goal

After Slice 22 collapses Kom igång, returning coaches still need one-tap Home paths into hall and floor — and a clear way to open the live HTTPS link on the phone — without inventing sync/accounts:

1. **Hallöversikt / Golvklart when draft exists** — secondary Home actions (≥44px) that call existing `onOpenHall` / `onOpenGolvklart` (wired in `App.tsx` as `openHallFromHome` / `openGolvklartFromHome`); flash the same need-activity / need-hall hints as Kom igång when open fails.
2. **Öppna på telefon** — wire existing `oppnaPaTelefon*` strings near the honesty aside; show live Pages URL as text + openable link; keep honesty; no dismiss required; no sync/account copy.

**Coach outcome:** “När jag har ett utkast ser jag Hallöversikt och Golvklart på Hem — och hur jag öppnar samma länk i telefonen — utan att Kom igång måste vara utfälld.”

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| **A** | **A1** | When `draftExists`: two secondary Home actions (≥44px) — **Hallöversikt** (`onOpenHall`; fail → flash `komIgangNeedActivity`) and **Golvklart** (`onOpenGolvklart`; fail → flash need-activity / need-hall as today). Secondary row/cards under primary Nytt/Mall/Fortsätt — not replacing them. When `!draftExists`: **hide** both (prefer hide over disabled). |
| **B** | **B1** | Always show Öppna-på-telefon block on Home near honesty (`no-print`); reuse `oppnaPaTelefon*` keys; include live URL `https://drevmok.github.io/traningsplaneringen/` as text + openable link; keep honesty; no dismiss required. |
| **C** | **C1** | Hall/Golvklart sit in `home-actions` area (secondary styling); Öppna på telefon with/below honesty; do **not** expand Kom igång; do **not** add tip strips; ≥44px hit targets; Swedish only. |
| **D** | **D1** | Thin Docs — Swedish labels for Hallöversikt/Golvklart Home CTAs (+ aria); confirm/adjust `oppnaPaTelefon*` if URL must appear in body; update living distribution + Home docs; no new tip strip copy. |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 23` |
| **F** | **F1** | No Förråd empty CTA (Slice 24); no saknar-redskap banner; no place-heuristic change; no Passbyggaren compose / library / CAD / caption / cloud / sync wording; no Netlify/Pages republish unless asked; preserve Slice 22 quiet Kom igång + Hall hints. |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Swedish UI; **gymnaster** / **pass**
- Placeable = **Teknik** only
- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- Device-local drafts; **no** accounts / cloud / sync wording
- **NO** CAD / equipment pins / canvas badge
- Footer `Träningsplaneraren · Slice 23` when shipped (recommended E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Preserve Slices **11–22** behavior except this Home chrome (Slice 22 quiet Kom igång + Hall hints stay)

## Problem baseline

| Pain | Baseline today |
|---|---|
| Hall / Golvklart from Home | `Home.tsx` primary cards = Nytt / Mall / Fortsätt only. `onOpenHall` / `onOpenGolvklart` exist and are used by Kom igång steps, but Slice 22 collapses Kom igång after progress — hall/floor entry is harder for returning coaches. |
| Öppna på telefon | Slice 10 skipped the help block (no live HTTPS yet) but wired `oppnaPaTelefon*` in `blockMeta.ts` + `docs/distribution-copy.sv.md`. Home renders honesty aside only. Pages is live: `https://drevmok.github.io/traningsplaneringen/`. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `openHallFromHome` / `openGolvklartFromHome` | `App.tsx` | Already wired; return `false` when no draft / no activities |
| `canOpenHall` / `itemCount` | Home props | Already available |
| `draftExists` / `hasDraft()` | `Home.tsx` / `session.ts` | Gate Fortsätt today; gate A1 secondary actions |
| `komIgangNeedActivity` / `komIgangNeedHall` | `blockMeta.ts` | Flash hints when Kom igång hall/floor open fails — **reuse** |
| `oppnaPaTelefon*` | `blockMeta.ts` + `docs/distribution-copy.sv.md` | Strings exist; **not rendered** yet |
| Honesty aside | `Home.tsx` `.home-honesty` | Always-on Slice 10 — **keep** |
| `KomIgangCard` collapse | Slice 22 | Collapsed after progress — **do not expand** for this pack |
| Caption / compose / library / CAD | Standing locks | Unchanged |

## In scope

1. Secondary Home **Hallöversikt** + **Golvklart** when `draftExists` (A1); hide when no draft.
2. Wire **Öppna på telefon** help block near honesty with live Pages URL (B1).
3. Layout layering with Slice 22 quiet chrome (C1).
4. Thin Docs for new Home CTA labels (+ aria) and any URL-in-body tweak (D1).
5. Footer → Slice 23 when shipped (E1).
6. Verification checklist covering recommended A1/B1/C1/E1/F1 + build green.

## Out of scope

- Scout **Approved** Förråd empty → Använd alla förslag (**Slice 24** — backlog only)
- Scout Proposed **saknar-redskap** banner
- Scout Proposed Kom igång **place-step heuristic**
- Expanding Kom igång / new tip strips / Passbyggaren compose / library growth / CAD / caption / cloud / sync
- Netlify / Pages republish unless Christoffer asks
- Changing Slice 22 Hall hint compact / chrome-layering rules

## Pipeline note

After Christoffer **APPROVES** A–F:

1. **Docs** → Swedish Home CTA labels (+ aria); confirm Öppna-på-telefon + URL; living `docs/distribution-copy.sv.md` (+ Home/ui-chrome touch-ups)  
2. **Builder** → implement locked A–F; self-smoke via `verify-traningsplaneraren/`; footer Slice 23  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`

**Do not ping Docs / Builder / Verifier while status is DRAFT.**

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** (bundled) — two related Home polish items, one Docs → Builder → Verifier loop after APPROVED.

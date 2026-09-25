# Slice 04 — Locked decisions (draft for Christoffer)

Drafted 2026-09-24 from audit of `app/src` after Slice 01–03 PASS.  
**Status:** APPROVED by Christoffer 2026-09-24. Once approved, treat as locked for Docs/Builder/Verifier.

---

## 1. Recommended approach — local SVG icon tiles

**Decision:** Implement a **small local SVG icon set** (inline React components preferred; single SVG sprite acceptable) keyed by existing `visualKey` / `BlockType`.

**Why:**
- Works **offline** — no CDN, no runtime font fetch
- Consistent across phone OS / desktop (emoji do not)
- Fits current architecture: `visualKey` already on every Activity; renderer already centralized via `visualEmoji()`
- Easy to style: stroke/fill inherit tile color; tiles use existing `BLOCK_COLORS`
- Keeps accessibility: decorative icon `aria-hidden` + visible Swedish text labels
- Scope stays tight — no new product features

**Implementation sketch (Builder):**
1. Add `app/src/icons/` with ~20 named SVG components (or one `icons.tsx` switch) + `IconId` union.
2. Replace `VISUAL_EMOJI` / `BLOCK_ICONS` emoji maps with `VISUAL_ICON: Record<string, IconId>` and `BLOCK_ICON_IDS: Record<BlockType, IconId>` (see `icon-map.md`).
3. Replace `visualEmoji(key)` with `<VisualIcon visualKey={...} size=... tintBlockType=... />` (or keep a thin helper that returns the icon node).
4. Wrap icon in a **tile** (rounded square) using block bg/border/text tokens.
5. Unknown `visualKey` → `icon-fallback` (generic activity) inside neutral or block-tinted tile.
6. Do **not** invent new `visualKey` strings for the 28 seeds unless a key is wrong; keep Slice 03 keys.
7. Home action-card emoji (➕📋📝) are **out of required scope**; leave as-is unless trivial to swap later.

---

## 2. Alternatives considered and rejected

| Approach | Why not for Slice 04 |
|---|---|
| **Emoji upgrade only** (better emoji / more variety) | Still inconsistent across iOS/Android/desktop; hard to put in equal-sized tiles; looks less polished; some keys already misuse ⚠️/🚨 as identity. |
| **Lucide (or similar) via npm, full set** | Fine offline if bundled, but many gymnastics concepts (trampett, mattberg, flickiskudde, maffia) have no good Lucide match; would still need custom glyphs. Extra dep for little gain vs a 20-icon local set. |
| **Lucide CDN / icon font CDN** | Fails offline / production dependency rule. |
| **Photo / illustration tiles** | Heavy assets; risk coaches treat drawings as **form cues**; harder to keep abstract/safe; out of polish scope. |
| **One unique custom art per activity (28 illustrations)** | Overkill for Slice 04; maintenance cost; same safety concern if detailed. Shared icon vocabulary is enough. |

---

## 3. Icon language rules (locked)

1. **Abstract / friendly** — shapes that suggest theme (wave, flame, bounce, ball, moon). Not stick-figure technique breakdowns.
2. **Color is not the only signal** — icon shape + Swedish title always present. Block color reinforces type.
3. **Experienced-only** stays a **badge + `role="alert"` warning** (Slice 03). Do **not** use warning/siren emoji as the activity’s primary visual.
   - `tech-rondat-flickis` → flip/skill icon (not ⚠️)
   - `tech-salto-fran-hojd` / `tech-salto-height` → height/salto icon (not 🚨)
4. **Swedish UI** labels unchanged; icons are decorative (`aria-hidden`) except where Builder adds an optional `aria-label` that duplicates the title (not required if title is adjacent).
5. **Fallback** required for any unknown `visualKey`.
6. **Reuse** a shared `IconId` vocabulary (~20 icons). Multiple activities may share an icon when themes overlap (e.g. two stretch drills → same stretch icon). Distinct `visualKey` remains for future per-activity art.

---

## 4. Keep / migrate (data)

| Keep | Change |
|---|---|
| `Activity.visualKey: string` field | Keep values from Slice 03 seeds |
| `BLOCK_COLORS` tokens & hex | Keep as visual tile tint source |
| `BLOCK_LABELS`, budgets, order | Untouched |
| Experienced badge + warning copy | Untouched |
| `VISUAL_EMOJI` map | **Replace** with icon-id map |
| `BLOCK_ICONS` emoji | **Replace** with icon-id map |
| `visualEmoji()` | **Replace** with SVG renderer |
| Vite `public/icons.svg` (Bluesky/Discord) | Leave alone — not used for activities |

---

## 5. Scope guards (locked)

- No new drills, no seed copy rewrite beyond visual mapping notes
- No coach-level filter chips
- No onboarding
- No export/distribution work
- No changing block order or budgets
- Phone tap targets from Slice 02 must still pass (≥44px controls); icon tiles must not shrink actionable areas

---

## 6. Open questions for Christoffer

**None required to start.** Prefer deciding:

- Icon style: simple **stroke 1.75–2px**, rounded caps, 24×24 viewBox — friendly, not cute-mascot, not clinical.
- If Christoffer later wants brand-colored mascots or photos, that is a **later slice**.

Optional (may defer): Should Home’s three action cards also get SVG tiles in the same PR? **Default: no** — keep Slice 04 focused on blocks + activities.

---

## Approval

- [x] Christoffer approves Slice 04 approach + icon-map meanings  
- [ ] Docs: no content pack required unless Swedish fallback label needed  
- [ ] Builder: implement against this pack  
- [ ] Verifier: use `verification-checklist.md`

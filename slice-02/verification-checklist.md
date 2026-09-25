# Verification checklist — Slice 02 (phone)

**Sole authority for Slice 02 pass/fail.** Slice 01 checklist still holds; do not regress.

**Devices / widths to test**
- [ ] 390×844 (reference phone)
- [ ] 360×740 (small Android)
- [ ] 768×1024 (narrow tablet / large phone landscape optional smoke)
- [ ] ≥1100px desktop: two-column builder still works (no regression)

## Layout
- [ ] No horizontal page scroll at 390px on Home or Passbyggaren
- [ ] Home CTAs full-width stack; tap height ≥44px
- [ ] Builder top bar keeps title + `n / 60` usable; actions reachable
- [ ] At ≤480px, Library/Tips/Templates use sheet/overlay — not a skinny persistent sidebar
- [ ] Sheet has Stäng; can open library filtered from a block’s Add
- [ ] Block empty tip + Add visible
- [ ] Item row controls (duration, ↑↓, menu) tappable (≥44px hit area)
- [ ] Activity detail usable end-to-end on 390px
- [ ] Mismatch banner + template dialog usable on 390px
- [ ] Title input does not trigger unexpected iOS zoom (≈16px+)

## Behavior (smoke, still works)
- [ ] Add / remove / reorder within block
- [ ] Soft mismatch on override-add and move
- [ ] Template ≤2 taps + confirm/cancel
- [ ] Draft save + Fortsätt senaste pass
- [ ] Session total = item sum only

## Automatic fail
- Horizontal scroll required to use core builder at 390px
- Library unreachable or only available as unusable tiny sidebar
- Primary Add / Save / template actions below ~40px tap height with no padding
- Desktop ≥1100px builder layout broken

## Verifier notes
Record: viewport(s), browser, screenshots of Home + builder + open library sheet, pass/fail per section.

# Screen spec — Onboarding / coach tips (Slice 09)

**Status:** **APPROVED by Christoffer 2026-09-24**
**Surfaces:** Home, Passbyggaren, Hallöversikt (edit + Golvklart entry chrome)  
**Language:** Swedish only (seed in `content/coach-tips.sv.md`)

---

## 1. Kom igång card (Home — primary)

### Placement

- On **Startsida**, below the existing invite (`homeInvite`) and **above or between** the three action cards — Builder may place it as a soft banner/card that does not push primary CTAs off the first phone screen more than ~1 card height. If conflict: keep Nytt pass / mall visible without scroll on ~390px; checklist may sit under the cards.
- Do **not** show as a full-screen modal.
- Hide entirely when `checklistDismissed === true` (until **Visa tips igen**).

### Content

- Title: **Kom igång**
- One-line intro (warm): why these steps help a new coach.
- 3–4 checklist rows with done/undone state (checkbox, checkmark, or muted strike — Builder choice; ≥44px tap on phone).
- Each row is actionable when possible:
  1. Välj eller bygg ett pass → triggers same paths as Nytt pass / Starta från mall / Fortsätt (or scrolls focus to those cards).
  2. Lägg till övningar i blocken → open Passbyggaren (blank or draft).
  3. Öppna Hallöversikt och placera → Hallöversikt if ≥1 övning; else toast/inline hint = existing `hallCtaDisabled` sense.
  4. Använd Golvklart på golvet → Hallöversikt then Golvklart if possible; else short hint to place first / open hall.
- Footer of card: **Jag klarar mig** / **Dölj Kom igång** (dismiss forever) — exact label in content file.

### Empty Passbyggaren alternate

- If Home card was never shown this session **and** Passbyggaren opens with 0 items **and** checklist not dismissed, Builder **may** show the same Kom igång card once at the top of the builder. Prefer Home-only if both would clutter.
- Never block block empty tips (`EMPTY_TIPS`) — they stay inside blocks.

### Progress

- Visual: N of 4 klart.
- Auto-complete from heuristics in `data-model.md`.
- Completing all 4 may auto-collapse to a one-line “Bra jobbat — du kan visa tips igen under…” or simply leave checks visible until dismiss — Builder choice; must remain dismissible.

---

## 2. Contextual tips

### 2.1 Passbyggaren — `tip-builder-empty`

**When:** Pass has 0 items **or** first builder visit flag unset; and tip not dismissed.

**UI:** Thin strip under top bar (near existing `topBarHelp`) **or** “i” popover on the help line. Prefer strip with dismiss (× / **Dölj tips**).

**Must not:** replace `topBarHelp`, Tips tab, or block `EMPTY_TIPS`.

**Message intent:** You can start from a mall or lägg till övning in a block; Tips-fliken has short coach cues per block.

### 2.2 Hallöversikt — `tip-hall-place`

**When:** Hall edit mode; tip not dismissed; preferably when tray has unplaced items or first hall open.

**UI:** Reuse tray help region — elevate/adapt existing `hallCoachTip` + snap language into a dismissible strip. Static `hallDragHint` / `hallSnapHint` may remain as always-on microcopy **or** fold into the dismissible tip — do not leave three redundant paragraphs. Prefer: keep one-line always-on drag/snap hints; make the longer coach tip dismissible.

### 2.3 Hallöversikt — `tip-hall-flow-golvklart`

**When:** Hall has ≥1 placed chip **or** Golvklart controls visible; tip not dismissed.

**UI:** Near **Visa flöde** / **Golvklart** controls, or wire unused `hallFloorCoachTip` as dismissible strip.

**Message intent:** Station numbers follow the pass; Golvklart is for showing the group / print — schematic not to scale.

### 2.4 Optional — `tip-experienced-safety`

**When:** User focuses an Erfaren activity (detail) or hall chip with Erfaren badge; tip not dismissed.

**UI:** Small “i” or one-line strip echoing existing warning — no new progressions, no new drills.

**If time-boxed:** may ship in a follow-up; checklist + tips 2.1–2.3 are the Slice 09 minimum.

---

## 3. Dismiss behavior

| Control | Effect |
|---|---|
| Tip × / **Dölj tips** | Set `dismissed[tipId] = true`; hide that tip |
| Kom igång dismiss | `checklistDismissed = true`; hide card |
| **Visa tips igen** | Clear dismissals + show checklist again (see data-model) |

Dismiss must persist across reload (localStorage).

No confirm dialog required for dismiss (one tap is enough). Optional undo toast is out of scope.

---

## 4. Visa tips igen

**Placement (pick one primary):**

1. Home — text link under action cards or in page footer area, **or**
2. App footer region — e.g. next to / under `Träningsplaneraren · Slice 09` as a quiet link **Visa tips igen**

Visible even when nothing is dismissed (no-op or brief “Tips visas redan”) — or only when something was dismissed. Prefer: always visible, light weight.

Must not open a settings page or new route.

---

## 5. Print / Golvklart

- Tip strips, Kom igång, and **Visa tips igen** are **edit chrome** — hide in print CSS (same class pattern as Slice 07/08 `no-print` / edit-only).
- Golvklart read-only: tips may hide in floor mode to keep the floor view calm; if shown, must not obscure schematic. Prefer hide in Golvklart.

---

## 6. Phone (~390×844)

- Checklist rows and dismiss targets ≥44px height.
- Tip strip must not cover Hallöversikt tray on ≤768px; place above tray or in header stack.
- No horizontal overflow from long Swedish strings — wrap calmly.

---

## 7. Wireframes (text)

### Home

```
Startsida · Träningsplaneraren
Invite…

┌ Kom igång                          [Dölj] ┐
│ Bra start för nya tränare.                │
│ ☑ Välj eller bygg ett pass                │
│ ☐ Lägg till övningar i blocken            │
│ ☐ Öppna Hallöversikt och placera          │
│ ☐ Använd Golvklart på golvet              │
└───────────────────────────────────────────┘

[ Nytt pass ] [ Mall ] [ Fortsätt ]

Visa tips igen
```

### Passbyggaren (empty)

```
Passbyggaren · topBarHelp
┌ Tips: Börja från mall eller lägg till… [×] ┐
Samling (empty tip…) …
```

### Hallöversikt

```
Header · Hallayout · Golvklart · Visa flöde
┌ Stationsordning följer passet. Golvklart… [×] ┐
Canvas…
Tray: drag/snap one-liners + Ej placerade
```

---

## 8. Accessibility

- Dismiss buttons have Swedish accessible names (**Dölj tips**, **Dölj Kom igång**).
- “i” popovers: `aria-expanded` / close on Escape when focusable overlay.
- Checklist steps: not only color — done state has text or icon + `aria-checked` if checkbox pattern.
- Do not auto-focus tip on every navigation (avoid annoyance); show passively.

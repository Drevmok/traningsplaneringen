# Slice 20 — screen spec (APPROVED)

**Status:** **APPROVED 2026-09-26** — behavior follows locked A–F (recommended set; B1 not B2).

## 1) Redigera redskap — dirty Stäng (locked A1)

```
Redigera redskap sheet open
  dirty = recipe ≠ baseline (existing sameRecipe)
  Stäng / backdrop close:
    if !dirty → onClose() immediately
    if dirty → show in-sheet confirm (not window.confirm)
         [Stäng utan att spara] → onClose() without save
         [Fortsätt redigera] → hide confirm, stay in sheet
  Klar → save sanitizeStationEquipment(recipe) (unchanged)
```

**Layout:** Confirm is inside the existing sheet (banner or inline panel above footer actions). Primary visual hierarchy: **Klar** still strongest when confirm is hidden; when confirm visible, discard = secondary/danger-ish, keep editing = secondary/default — Docs may tune.

**Phone:** Both confirm actions ≥44px min-height.

## 2) Hallöversikt edit — canvas remove (locked B1)

```
Edit canvas markör
  remove control hit area ≥ 44×44px (edit only)
  tap markör (not on remove) → detail (unchanged)
  drag markör → move; must not open detail as a tap (unchanged)
Golvklart / floor mode
  no remove control (unchanged)
Tray remove
  already ≥44px — no required change
```

B2 was **not** locked. Ignore: when a markör is selected / detail open, also show **Ta bort från hall** (≥44px) that calls the same `onRemovePlacement`.

## 3) Starta från mall — scroll freeze (locked C1)

```
Home → Starta från mall
  openTemplates=true → SessionBuilder initialTemplatePicker
  narrow: panel open + body overflow hidden

Pick mall → TemplateConfirm (body lock nested)

Confirm Använd mall:
  cloneTemplate → onChange(new session)
  clear openTemplates (parent)  ← CRITICAL
  closePanel()                  ← not openPanel('library')
  clear pendingTemplate
  restore body overflow

Cancel confirm / close sheet without applying:
  clear or keep openTemplates per Builder judgment;
  recommended: clear openTemplates when sheet closes so remounts are safe
  restore body overflow

Passbyggaren after apply:
  blocks list scrollable; no stuck overlay; no forced mall sheet
```

**App.tsx note:** `key={session.id + (openTemplates ? '-tmpl' : '')}` + uncleared `openTemplates` remounts builder into template mode after apply — Builder must clear the flag (callback `onTemplatePickerConsumed` or setState in App when confirm succeeds).

## Surfaces that must not change

| Surface | |
|---|---|
| Golvklart redskap under stations | No behavior change |
| Förrådslista / Använd alla förslag | No behavior change |
| Caption Schematisk hall — inte exakt mått | Unchanged |
| Library size | Unchanged |

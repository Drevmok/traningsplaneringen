# Slice 22 — screen spec (APPROVED)

**Status:** **DRAFT 2026-09-26** — behavior follows **recommended** A1/B1/C1/D1/E1/F1 until Christoffer locks.  
**Viewport focus:** Phone ~390px and desktop; quiet-chrome rules apply on both unless noted.

## 1) Progressive Hall hints (recommended A1)

```
Hallöversikt edit, hallHintsCompact === false (no successful Teknik place yet)
  Show today’s multi-line instructional paragraphs as now:
    Header / above-canvas: hallStationOrderHint, hallStationsOnlyHint, hallTileHint
    Expanded tray: hallDragHint, hallSnapHint
  (Subject to C1 — if tip strip visible, suppress these multi-line blocks; info still available)

After first successful Teknik place (placementCount ≥ 1 ever):
  Set durable hallHintsCompact = true (tips store)
  Hide the multi-line instructional paragraphs listed above
  Keep: chips, Placera här, tray expand/collapse (Slice 21), zoom, Hallayout, CTAs
  Show info control ≥44×44px → reveals full hint set on demand
    (popover / sheet / expandable — Builder picks; non-blocking preferred)

Golvklart / floor:
  Edit tray already hidden — no edit-tray hints
  No new always-on instructional paragraphs
```

**Visa tips igen (recommended Q4):** clears `hallHintsCompact` so full hints can return for coaches who ask.

**Do not change:** pinch, pan, tray collapse defaults, stored x,y, caption, Placera här semantics.

## 2) Quieter Kom igång (recommended B1)

```
Home, checklistDismissed === false

Brand-new (done === 0 AND komIgangCollapsed not set / never collapsed):
  EXPANDED — today’s intro + progress + full step list + hints + Dölj / Jag klarar mig

Once done > 0 OR komIgangCollapsed === true:
  Default next Home visit → COLLAPSED summary:
    - Title: Kom igång
    - Progress: "{done} av {total} klart" (reuse komIgangProgress)
    - Expand control ≥44px
  Expanded (after tap): full card as today
  Collapse control ≥44px when expanded (persist komIgangCollapsed = true)

Dölj Kom igång / Jag klarar mig:
  Still sets checklistDismissed (card gone) — unchanged

Visa tips igen:
  Restores checklist visibility; recommended also clears komIgangCollapsed
  so brand-new teaching can show expanded again if progress reset paths apply
  (at minimum: show card again; if done > 0, B1 may still collapse — prefer
   clear komIgangCollapsed so expand state is fresh; progress still drives default)
```

**Do not change:** step heuristics (Proposed #2 stays out); step count = 5; soft-only Golvklart.

## 3) One chrome layer (recommended C1)

```
Priority:
  1. Blocking / required confirm UI → always show; soft teaching yields
  2. Soft trio — at most ONE of:
       (a) Coach tip strip
       (b) Hall status banner (unplaced on Golvklart today)
       (c) Multi-line instructional hall hints (A1 paragraphs)

Hall edit:
  If tip strip visible → hide multi-line A1 paragraphs
  Info control remains available (hints on demand without dismissing tip)
  If no tip strip → A1 rules (full or compact)

Golvklart:
  If unplaced banner visible → suppress tip strip on Golvklart
  When unplaced → 0 (banner gone) → tip may show again if not dismissed
  No edit-tray hints

Home:
  Brand-new 0/n: prefer expanded Kom igång over stacking a tip strip
  Progress > 0: B1 collapsed summary; tip strip may be the single teaching layer

Never hide:
  Placera här, chips, tray expand/collapse, Golvklart / Förråd / print,
  zoom +/−, Hallayout, Redigera redskap entry
```

## 4) Controls that must still work

| Control | Behavior |
|---|---|
| Placera här | Unchanged when tray expanded |
| Tray expand / collapse (Slice 21) | Unchanged chrome; only hints inside may hide |
| Pinch / pan / +/− | Unchanged (Slice 21) |
| Tip dismiss / Visa tips igen | Paths kept; resets per Q4 recommended |
| Dölj Kom igång | Still fully dismisses card |
| Info (new) | ≥44px; reveals A1 hints when compact or when C1 suppressed multi-line |
| Caption | **Schematisk hall — inte exakt mått** unchanged |

## Surfaces that must not change

| Surface | |
|---|---|
| Passbyggaren compose | Still none |
| Library size / seeds | Unchanged |
| Kom igång place heuristic | Unchanged (Proposed #2 stays out) |
| Saknar-redskap banner | Not added (Proposed #1 stays out) |
| Caption / CAD / cloud | Unchanged |
| Device-local drafts | Unchanged |

## Layout sketches

### Hall edit — compact hints (~390px, tray expanded)

```
[ Header · Hallayout · Golvklart · … ]
[ Zooma  −  +                         ]
[         Hall canvas                 ]
[ Caption: Schematisk hall …          ]
[ Ej placerade (n)                    ]
[ chips · Placera här                 ]
[ (i) Tips om placering   ]  ← info ≥44px; no multi-line paragraphs
```

### Home — Kom igång collapsed

```
[ Kom igång          2 av 5 klart  [Visa…] ]  ← ≥44px expand
```

Expanded: today’s full intro + steps.

# Screen spec — Session builder (Slice 01)

## Purpose
Let a coach build a full training session in one glance: five blocks, visual activities, durations, and light guidance so a new coach never faces a blank page.

## Entry points
1. **New blank session** — five empty blocks, suggested total 60 minutes.
2. **From template** — cloned Session with items prefilled.
3. **Resume draft** — last edited session (home list; home is out of slice detail but assumed).

## Layout (desktop / tablet first; phone later)

### Top bar
- Session title (inline edit)
- Total time (live sum) vs optional target (e.g. 60)
- Actions: Save draft · Use template · Export/share (export can be stub)
- Subtle help: “New to coaching? Start from a template”

### Main: timeline of blocks (vertical)
For each block card:
- Colored icon + block name (Gathering / Warm-up / Techniques / Strength / Fun and games)
- Block duration target + filled minutes
- List of SessionItems (thumbnail, title, minutes, overflow menu: edit note, replace, remove)
- **Add activity** button → opens Activity picker filtered to this block type
- Empty state copy (Docs): short tip + “Add your first …” / “Browse ideas”

### Side panel (or bottom sheet on smaller screens)
- **Library** tab: search + filters (block type, tag, difficulty) + activity cards with visuals
- **Tips** tab: block-level coaching tip for the selected block
- **Templates** tab: start over from a template (confirm replace)

### Activity detail (modal or drawer)
From library or an item:
- Visual, title, default duration
- Summary · How to · Watch for (safety / common mistakes)
- Buttons: Add to current block · Add and edit duration

## Key interactions
1. Add activity → appears in block → duration editable inline
2. Reorder items within a block (drag)
3. Move item to another block (drag or menu) with soft warning if type mismatch
4. Adjust block target duration without deleting items (overflow warning if items exceed target)
5. Open template → confirm → replace current session content

## Visual principles
- Large thumbnails / icons per activity (not text-only lists)
- Color per block type (consistent across app)
- Generous empty states with illustration + one clear CTA
- Coaching tips visible without digging into a settings maze

## Non-goals this screen
- Live class timer / stopwatch mode
- Athlete attendance
- Video playback (thumbnail only for now)

## Wireframe outline (text)
```
[ Title ................ ] [ 45 / 60 min ] [ Template ] [ Save ]
+------------------------+---------------------------+
| GATHERING  5/5 min     | LIBRARY                   |
| [+] empty tip...       | [search]                  |
| WARM-UP   8/10 min     | cards...                  |
| • Jumping jacks  3m    |                           |
| • Animal walks   5m    | TIPS                      |
| [Add activity]         | Gathering: get attention  |
| TECHNIQUES ...         | before skills.            |
| ...                    |                           |
+------------------------+---------------------------+
```

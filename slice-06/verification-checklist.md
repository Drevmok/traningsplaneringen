# Verification checklist — Slice 06 (zones, snap, presets)

**Slice passes when** a coach can use Hallöversikt with the richer six-zone schematic, see chips **snap** into apparatus zones (while **öppen yta stays free**), switch among **three Swedish hall presets** with placements remapped sensibly, and reload the draft — including Slice 05 drafts aliased from `generic-trupp` — without losing experienced-only safety or prior Passbyggaren behavior. Phone **Placera här** must snap the same way as desktop drop.

Use this checklist as sole Slice 06 authority after Christoffer approval.

---

## Locked pass/fail rules

- **Zones:** Active default preset shows labels **Öppen yta**, **Trampett**, **Tumbling**, **Satsbräda**, **Mattberg**, **Mattor** plus caption **Schematisk hall — inte exakt mått**. Fail if Mattberg missing on Standard trupp, or if `mats` id/label removed.
- **Snap apparatus:** Drop (desktop) inside trampett / tumbling / vault / mattberg / mats → chip center ends on that zone’s snap region ( visibly “settled” on the zone, not left on the zone edge where dropped). Fail if free-drop still used inside apparatus zones.
- **Free open:** Drop inside Öppen yta → chip stays at drop point (no snap to open center). Fail if open forces magnetic center every time.
- **Phone snap:** Placera här tap inside an apparatus zone produces the same snap behavior as desktop. Fail if phone writes raw tap coords into apparatus zones without snap.
- **Presets:** Picker offers exactly three Swedish options: **Standard trupp**, **Tävling / linjer**, **Liten hall**. Switching changes zone layout. Fail if picker missing, English-only, or only one layout.
- **Preset migrate placements:** On switch, chips with a known `zoneId` move into that zone in the new layout; chips are **not** wiped to tray. Fail if switch clears all placements or returns everything to Ej placerade.
- **Persist:** `hallTemplateId` is one of `standard-trupp` | `tavling-linjer` | `liten-hall`; placements still keyed by `sessionItemId` with x,y ∈ [0,1]. Reload restores preset + positions. Fail if preset forgotten after Fortsätt senaste pass.
- **Slice 05 draft migrate:** Draft with `hallTemplateId: 'generic-trupp'` loads as **Standard trupp** without crash; existing placements kept (may re-resolve zone). Fail if old drafts break or placements vanish.
- **Tray / remove / back:** Unchanged Slice 05 behavior still works (Ej placerade, Ta bort från hall, back → Passbyggaren).
- **Safety:** Experienced chip → detail still shows warning. Fail if hall path suppresses it.
- **Scope guard:** Flow arrows, station order, print/floor-ready, export, new drills — absence must **not** cause FAIL.
- **Regression:** Slice 01–05 Passbyggaren / hall foundation still PASS (CTA, tray default for new items, orphan prune, VisualIcon, totals, soft mismatch).

---

## Product / UX

- [ ] Hallöversikt still opens from Passbyggaren (≥1 övning)
- [ ] Six zone labels visible on **Standard trupp**
- [ ] Caption schematic / not exact measurements
- [ ] **Hallayout** (or equivalent) picker visible on hall
- [ ] Three preset labels in Swedish as locked
- [ ] Switching preset redraws zone layout
- [ ] Drop on Trampett snaps into trampett area
- [ ] Drop on Öppen yta does **not** jump to a fixed center
- [ ] Move chip from open → tumbling snaps on drop
- [ ] Multiple chips in one zone remain distinguishable (offset OK)
- [ ] Remove to tray still works after snap
- [ ] Experienced badge + detail warning intact
- [ ] Swedish chrome (no leftover English on picker/zones)

## Data / persistence

- [ ] `hallTemplateId` stored as preset id after switch + save/auto-save
- [ ] Storage key remains `gymnastics-planner-draft-v1`
- [ ] `mattberg` accepted as `zoneId` when placed there
- [ ] `mats` still valid (not deleted from type union)
- [ ] Old `generic-trupp` draft aliases to `standard-trupp`
- [ ] Preset switch does not empty `hallPlacements`
- [ ] Reload / Fortsätt restores preset + placements
- [ ] `removeItem` still prunes; template replace still clears placements
- [ ] Coordinates remain in `[0, 1]` after snap

## Phone

- [ ] ~390px: preset picker usable (≥44px)
- [ ] Canvas + tray reachable
- [ ] **Placera här** into apparatus zone → snapped result
- [ ] **Placera här** into öppen yta → free place

## Technical / scope

- [ ] No CDN hall art
- [ ] `npm run build` succeeds
- [ ] No flow arrows / station order / print view required
- [ ] No keyboard full-drag required
- [ ] Optional toast still optional

## Regression (prior slices)

- [ ] Home → Nytt pass / mall / fortsätt
- [ ] Five blocks + totals = item sum + soft mismatch
- [ ] 28 drills + VisualIcon + experienced pair
- [ ] Slice 05: tray default for new items; CTA disable on empty pass
- [ ] Export stub “Kommer snart”

---

## Suggested Verifier smoke path

1. Load or create a pass with ≥4 övningar (include one experienced-only). Open **Hallöversikt**.
2. Confirm **Standard trupp** + six labels including **Mattberg** + schematic caption.
3. Place one chip on Trampett → observe snap; place one on Öppen yta → observe free place.
4. Phone width ~390px: Placera här onto Tumbling → snapped; onto open → free.
5. Switch preset to **Tävling / linjer** → layout changes; trampett chip still on trampett (remapped); nothing dumped to tray unexpectedly.
6. Switch to **Liten hall** → remap again; Spara/auto → Tillbaka → Hallöversikt → same preset + positions.
7. Home → Fortsätt → Hallöversikt → preset + placements restored.
8. Open experienced chip detail → warning visible.
9. Inject/load a Slice 05-shaped draft with `hallTemplateId: "generic-trupp"` → opens as Standard trupp without crash.
10. Remove one pass item → no ghost chip; `npm run build` green.

**Pass** = all locked rules green and smoke path completes without blocker bugs.  
**Fail** = any locked rule red, or smoke path blocked.

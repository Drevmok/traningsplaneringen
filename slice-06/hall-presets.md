# Hall presets — layouts (Slice 06)

Normalized coordinates **0–1** of the drawable canvas (same space as chip centers). Schematic — **not** exact meters. Caption on every preset: **Schematisk hall — inte exakt mått**.

Builder may implement as SVG/CSS. Prefer muted zone fills + dashed outlines; chips use block colors.

**Snap rule reminder:** zones with `snaps: true` pull chip center to `snap`; `open` never snaps.

**Hit priority (all presets):** trampett → tumbling → vault → mattberg → mats → open

---

## 1. `standard-trupp` — Standard trupp

**Default.** Successor to Slice 05 `generic-trupp`. Apparatus column on the right; Mattberg beside Mattor.

| Property | Value |
|---|---|
| Aspect | ~16:10 (or 3:2) |
| Swedish label | Standard trupp |
| Migrates from | `generic-trupp` |

### Zones

| zoneId | Label | bbox `{x,y,w,h}` | snap `{x,y}` | snaps |
|---|---|---|---|---|
| `open` | Öppen yta | `{0.06, 0.10, 0.52, 0.78}` | — | **false** |
| `trampett` | Trampett | `{0.62, 0.10, 0.30, 0.16}` | `{0.77, 0.18}` | true |
| `tumbling` | Tumbling | `{0.62, 0.30, 0.30, 0.20}` | `{0.77, 0.40}` | true |
| `vault` | Satsbräda | `{0.62, 0.54, 0.30, 0.14}` | `{0.77, 0.61}` | true |
| `mattberg` | Mattberg | `{0.62, 0.72, 0.16, 0.16}` | `{0.70, 0.80}` | true |
| `mats` | Mattor | `{0.80, 0.72, 0.12, 0.16}` | `{0.86, 0.80}` | true |

ASCII sketch:

```
+--------------------------------------------------+
|  Standard trupp                                  |
|  +------------------------+  +-----------------+ |
|  |                        |  | Trampett        | |
|  |                        |  +-----------------+ |
|  |      Öppen yta         |  +-----------------+ |
|  |                        |  | Tumbling        | |
|  |                        |  +-----------------+ |
|  |                        |  +-----------------+ |
|  |                        |  | Satsbräda       | |
|  +------------------------+  +--------+ +------+ |
|                              |Mattberg| |Mattor| |
|                              +--------+ +------+ |
|  Schematisk hall — inte exakt mått               |
+--------------------------------------------------+
```

---

## 2. `tavling-linjer` — Tävling / linjer

More **linear** apparatus lanes (competition / line feel). Open floor on the left; long horizontal strips stacked on the right/center-right.

| Property | Value |
|---|---|
| Aspect | ~16:10 |
| Swedish label | Tävling / linjer |

### Zones

| zoneId | Label | bbox `{x,y,w,h}` | snap `{x,y}` | snaps |
|---|---|---|---|---|
| `open` | Öppen yta | `{0.05, 0.12, 0.38, 0.74}` | — | **false** |
| `trampett` | Trampett | `{0.46, 0.10, 0.48, 0.14}` | `{0.70, 0.17}` | true |
| `tumbling` | Tumbling | `{0.46, 0.28, 0.48, 0.16}` | `{0.70, 0.36}` | true |
| `vault` | Satsbräda | `{0.46, 0.48, 0.48, 0.14}` | `{0.70, 0.55}` | true |
| `mattberg` | Mattberg | `{0.46, 0.66, 0.28, 0.20}` | `{0.60, 0.76}` | true |
| `mats` | Mattor | `{0.76, 0.66, 0.18, 0.20}` | `{0.85, 0.76}` | true |

ASCII sketch:

```
+--------------------------------------------------+
|  Tävling / linjer                                |
|  +-----------+  +------------------------------+ |
|  |           |  |======== Trampett ============| |
|  | Öppen     |  +------------------------------+ |
|  | yta       |  |======== Tumbling ============| |
|  |           |  +------------------------------+ |
|  |           |  |======== Satsbräda ===========| |
|  |           |  +------------------+ +---------+ |
|  |           |  | Mattberg         | | Mattor  | |
|  +-----------+  +------------------+ +---------+ |
|  Schematisk hall — inte exakt mått               |
+--------------------------------------------------+
```

Optional visual: faint parallel “line” strokes inside tumbling/trampett strips (decorative only — not real lane meters).

---

## 3. `liten-hall` — Liten hall

**Compact** hall — larger open share, smaller apparatus cluster in a corner. Still all six zones so remap-by-zoneId works.

| Property | Value |
|---|---|
| Aspect | ~16:10 |
| Swedish label | Liten hall |

### Zones

| zoneId | Label | bbox `{x,y,w,h}` | snap `{x,y}` | snaps |
|---|---|---|---|---|
| `open` | Öppen yta | `{0.06, 0.10, 0.62, 0.78}` | — | **false** |
| `trampett` | Trampett | `{0.72, 0.12, 0.22, 0.14}` | `{0.83, 0.19}` | true |
| `tumbling` | Tumbling | `{0.72, 0.30, 0.22, 0.16}` | `{0.83, 0.38}` | true |
| `vault` | Satsbräda | `{0.72, 0.50, 0.22, 0.12}` | `{0.83, 0.56}` | true |
| `mattberg` | Mattberg | `{0.72, 0.66, 0.12, 0.20}` | `{0.78, 0.76}` | true |
| `mats` | Mattor | `{0.86, 0.66, 0.08, 0.20}` | `{0.90, 0.76}` | true |

ASCII sketch:

```
+--------------------------------------------------+
|  Liten hall                                      |
|  +------------------------------+  +-----------+ |
|  |                              |  | Trampett  | |
|  |                              |  +-----------+ |
|  |         Öppen yta            |  | Tumbling  | |
|  |         (större del)         |  +-----------+ |
|  |                              |  | Satsbräda | |
|  |                              |  +-----+-----+ |
|  |                              |  |Mb   | Mat | |
|  +------------------------------+  +-----+-----+ |
|  Schematisk hall — inte exakt mått               |
+--------------------------------------------------+
```

---

## Drawing rules (all presets)

1. Regions, not equipment CAD. No meters, no club names, no scale bar.
2. All six Swedish labels visible when the zone is in the preset (all presets include all six).
3. Soft overlap OK; hit-test uses priority list.
4. Chips float above schematic.
5. Zone fills muted (slate/stone); do not clash with block chip colors.
6. `open.snaps = false` always; apparatus `snaps = true`.
7. Snap points should sit **inside** their bbox (margin ≥ ~0.02 from edges recommended).

## Builder checklist

- [ ] Static `HALL_PRESETS` map with three ids
- [ ] Alias `generic-trupp` → `standard-trupp` on read
- [ ] Canvas reads zones from active preset only
- [ ] `resolveZoneId` / `snapPlacement` take preset argument
- [ ] Labels match table Swedish strings exactly

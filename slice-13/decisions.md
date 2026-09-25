# Slice 13 — locked decisions

**Status:** **APPROVED by Christoffer 2026-09-24**  
**Direction:** compose stations from equipment pieces; one Hallöversikt marker; tap detail shows equipment list (2026-09-24)

## A. What “compose” means

**Lock:** A **station composition** is an ordered list of **equipment pieces** (with simple counts) that describes how the coach sets up a Teknik station.

| Concept | Meaning |
|---|---|
| Equipment piece | One catalog item (trampett, plint, landningsmatta, …) |
| Composition | Ordered slots on a Teknik `SessionItem` |
| Hall marker | Still **one** placed marker per Teknik session item |

**Rejected:** Placing each piece as its own pin on Hallöversikt (CAD / clutter; fights Slice 11–12).  
**Rejected:** Freeform drawing / resizing pieces on the schematic.  
**Rejected:** Exact cm/m measures or scaled floor plans.

## B. Where composition lives (data)

**Lock:** Store on the **SessionItem** (pass instance), device-local with the draft:

```
SessionItem.stationEquipment?: Array<{ pieceId: string; count: number }>
```

- `pieceId` ∈ seed equipment catalog  
- `count` ≥ 1 (default 1); keep UI simple (stepper or +/−)  
- Missing / empty array = “ingen redskapslista ännu” (may still show seed **suggested** defaults in UI until coach saves — see D)

**Rejected:** Storing composition only on `HallPlacement` (setup is about the station, not the XY).  
**Rejected:** Overloading legacy `Activity.equipment: string[]` free-text as the compose model (keep legacy field untouched for non-Teknik / old seeds).

**Builder hooks:** extend `createSessionItem` / migrate / sanitize in `lib/session.ts`; ignore unknown `pieceId`s on load.

## C. Equipment library (seed, small)

**Lock:** Fixed seed catalog — **all ~10 pieces** below. Swedish labels, one icon/`visualKey` each.

| id | Swedish label |
|---|---|
| `eq-trampett` | Trampett |
| `eq-satsbrada` | Satsbräda |
| `eq-plint` | Plint |
| `eq-landningsmatta` | Landningsmatta |
| `eq-tumblingmatta` | Tumblingmatta |
| `eq-madrass` | Madrass |
| `eq-mattberg` | Mattberg |
| `eq-flickiskudde` | Flickiskudde |
| `eq-airtrack` | Airtrack |
| `eq-kon` | Kon |

**Notes:**

- **Mattberg** is **one catalog piece** (club abstraction), not “N × madrass/matta” in this slice.  
- Airtrack and Kon stay in the library (not cut).  
- No custom “add your own redskap” text field this slice.

**Rejected:** Unlimited user-authored equipment catalog.  
**Rejected:** Club inventory counts (“vi har 2 trampetter”).  
**Rejected:** Composing Mattberg as stacked mattor only.

## D. Suggested defaults on Teknik activities

**Lock:** Seed optional `defaultStationEquipment` (same shape as `stationEquipment`) **only** on Teknik activities that obviously need setups — vault / trampett / mattberg-style drills (e.g. trampett + landningsmatta / mattberg). **Not** every Teknik drill.

Display rule:

1. If `SessionItem.stationEquipment` is **set** (including explicit empty after coach clear) → use it.  
2. Else → show seed defaults as **förslag** and persist on first compose save (or on “Använd förslag”).

Exact “explicit empty vs unset” flag: Builder may use `stationEquipment: []` vs `undefined`; document in ship notes. Prefer: unset = show förslag; saved empty = coach cleared.

## E. Compose UI entry

**Lock (v1):** From **hall station detail only** (after tap on placed marker): action **Redigera redskap** opens a phone-friendly compose sheet. Closing compose returns to detail (or hall — Builder picks; prefer detail → hall stack stays clear).

**Out of Slice 13:** Passbyggaren compose entry. Do not wire compose from Passbyggaren in this slice.

Hall detail remains: **no** “Lägg till i passet”. Compose **is** a draft edit (equipment only).

**Rejected:** Requiring coaches to leave Hallöversikt and dig through library only (too hidden for the floor-map mental model).  
**Rejected:** Passbyggaren entry as acceptance path for v1.

## F. Floor marker vs pieces

**Lock:** Marker anatomy stays Slice 12 (activity `visualKey` icon + rank + Erfaren). Composition does **not** change the marker into a multi-piece diagram this slice.

**Lock:** **Never** show an equipment-count badge on the canvas marker in Slice 13 — detail is the sole source of truth for the redskapslista.

**Rejected:** Mini blueprint of trampett+mat on the canvas.  
**Rejected:** Optional count badge (deferred / never this slice).

## G. Detail content

**Lock:** Extend hall `ActivityDetail` (readOnly for add-to-pass) with a **Redskap** section listing composed pieces (label + count). Reuse how-to / watch-for / Erfaren. Compose CTA: **Redigera redskap**.

If no composition and no defaults: short empty line + CTA to compose.

## H. Carry-forwards (unchanged)

- Placeable = Teknik only; silent prune non-Teknik  
- Caption: **Schematisk hall — inte exakt mått**  
- Tap placed → detail; drag ≠ detail  
- gymnaster / pass / Swedish UI  
- Blocks: Samling, Uppvärmning, Teknik, Styrka, Lek och spel  
- Device-local drafts; no accounts / cloud / Netlify in this pack  
- Footer `Träningsplaneraren · Slice 13` when shipped  

## Locked answers (Christoffer APPROVED 2026-09-24)

Former open questions — each **APPROVED**:

| # | Topic | APPROVED answer |
|---|---|---|
| **A** | Library | Keep **all ~10 pieces** (Trampett, Satsbräda, Plint, Landningsmatta, Tumblingmatta, Madrass, Mattberg, Flickiskudde, Airtrack, Kon). |
| **B** | Mattberg | **One** catalog piece (not N×matta). |
| **C** | Compose entry | **Hall station detail only** for v1. Passbyggaren entry **OUT** of Slice 13. |
| **D** | Marker badge | **Never** in this slice — detail only. |
| **E** | Defaults | Only obvious vault/trampett/mattberg-style Teknik drills get suggested equipment (**not** every Teknik drill). |
| **F** | CTA label | **Redigera redskap**. |

Builder may ship against these locks. Docs polish Swedish strings first (`content/station-compose.sv.md` → `docs/station-compose.sv.md`).

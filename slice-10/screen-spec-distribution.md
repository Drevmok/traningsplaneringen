# Slice 10 — screen spec (distribution chrome)

**Status:** **APPROVED by Christoffer 2026-09-24**
**Hosting decision:** **GitHub Pages** is locked; Cloudflare Pages / Netlify / Vercel remain documented fallbacks only.  
**Surfaces touched:** Home (honesty + optional phone help), app footer, optional document head / PWA-lite.  
**Do not change:** Passbyggaren block logic, drill library, Hallöversikt geometry/snap/presets, Golvklart/print behavior, Slice 09 tip ids or dismiss rules (beyond coexisting politely with new copy).

---

## 1. Footer (required)

| Item | Spec |
|---|---|
| Location | Existing `app-footer` (same pattern as Slice 09) |
| Text | Exact: **Träningsplaneraren · Slice 10** |
| Print | Remains `no-print` (do not appear on Golvklart print) |
| Visa tips igen | Keep Slice 09 footer control; distribution copy must not displace it |

---

## 2. localStorage honesty note (required)

### Placement (priority order)

1. **Primary — Home:** A short, quiet note near the bottom of Home content (below primary cards / Kom igång), or a thin info strip under the Home invite. Must be readable on ~390px width without covering primary CTAs.
2. **Secondary (optional):** One-line echo near footer on Home only — not on every view if Home already shows it.
3. **Do not** put the honesty essay inside Golvklart floor view or print output.

### Behavior

- Always visible enough that a new coach sees it at least once on Home (not buried only in a settings page — there is no settings product).
- Dismissible **forever** is allowed (same local tips map or a dedicated flag) **only if** a one-line reminder remains reachable (e.g. footer “Om utkast” / remains in help). Prefer **always-on short note** for MVP simplicity — Builder choice; document in ship notes.
- Must **not** block Home CTAs (Nytt pass / mall / Fortsätt) or Kom igång.

### Content intent (Swedish seeds in `content/distribution-copy.sv.md`)

- Drafts + tips live **in this browser**.
- Clearing site data / another browser / another phone ⇒ empty start.
- No cloud sync in Slice 10.
- Tone: warm, honest, short — same voice as Slice 09.

### Vocabulary

Use: **utkast**, **webbläsare**, **pass**, **övning**. Avoid implying “konto”, “molnet sparar”, or “synkas till telefonen”.

---

## 3. Optional Home help — “Öppna på telefon”

If thin and useful after a live URL exists:

| Element | Spec |
|---|---|
| Where | Home, near honesty note or as a small tip under Kom igång |
| Purpose | Tell Christoffer/coaches they can bookmark the HTTPS URL or Add to Home Screen |
| Must not | Instruct using localhost, tunnels, or agent-computer steps |
| Copy | Seed keys in `distribution-copy.sv.md` (`oppnaPaTelefon*`) |

This block is **optional for PASS** if the honesty note + live URL success criteria are met. Include when PWA-lite or a stable URL is ready so the copy is not aspirational on localhost-only builds.

---

## 4. PWA-lite (optional, thin — in scope)

### Required for “PWA-lite done” (still optional for slice PASS)

| Piece | Spec |
|---|---|
| `manifest.webmanifest` | `name` / `short_name` around **Träningsplaneraren**; `display` = `standalone` or `browser`; `start_url` respects Vite `base`; `lang` = `sv` |
| Icons | At least one 192×192 and one 512×512 (or SVG + documented PNG set); maskable optional |
| HTML meta | `theme-color`; apple-mobile-web-app capable / title as needed for iOS Add to Home Screen |
| Scope | Must honor `base` so install from project Pages path works |

### Explicitly out for PASS

- Service worker
- Offline cache of drills/hall
- Push notifications
- Install prompt nag modal

### Regression

PWA-lite must not break print CSS, Golvklart, or existing asset paths.

---

## 5. Privacy / empty-app framing (copy only)

No login wall. If useful, one soft clause in honesty or phone-help copy:

- Länken öppnar appen tom hos någon annan — deras utkast sparas i **deras** webbläsare.

Do not add password gates or “private mode” features in Slice 10.

---

## 6. What screens look like after ship (smoke map)

| Screen | Distribution expectation |
|---|---|
| **Home** | Honesty note visible; footer Slice 10; Kom igång + cards still work |
| **Passbyggaren** | No mandatory distribution banners; Slice 09 tips unchanged |
| **Hallöversikt** | Unchanged chrome; schematic caption intact |
| **Golvklart / print** | No honesty strip in print; floor view uncluttered |

---

## 7. Implementation bounds

- Prefer adding strings to `UI` / `blockMeta` from Docs seeds; no English user-facing chrome.
- Keep CSS in existing Home / footer patterns; avoid new full-page layouts.
- Do not migrate localStorage keys in this slice unless required for a dismiss flag — draft key `gymnastics-planner-draft-v1` and tips key `gymnastics-planner-tips-v1` stay authoritative.

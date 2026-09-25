---
name: verify-traningsplaneraren
description: >-
  Drive Träningsplaneraren (Swedish gymnastics coach planner) like a coach and
  prove behavior with evidence. Use for Verifier formal slice runs, Builder
  self-smoke before ship, and Planner/Verifier maintain passes. Web UI at Vite
  base /traningsplaneringen/; Swedish labels; device-local drafts.
---

# Verify Träningsplaneraren

Project-local verification skill (pstack create-verification pattern).  
**App root:** `/workspace/gymnastics-planner/app`  
**Repo root:** `/workspace/gymnastics-planner`  
**Live phone (after publish):** https://drevmok.github.io/traningsplaneringen/  
**Authority for a slice:** that slice’s `verification-checklist.md` / locked A–F — this skill is *how* to drive and prove, not a substitute for the checklist.

Swedish product terms (do not “translate” in reports): **pass**, **gymnaster**, **Passbyggaren**, **Hallöversikt**, **Redigera redskap**, **Golvklart**, **Förrådslista**, **Starta från mall**, **Kom igång**.

## Launch

```bash
cd /workspace/gymnastics-planner/app
npm run build          # required green before formal verify
npm run preview -- --host 127.0.0.1 --port 4173
```

Open: `http://127.0.0.1:4173/traningsplaneringen/`

Dev alternative (hot reload, not formal gate):

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open: `http://127.0.0.1:5173/traningsplaneringen/`

**Readiness:** HTTP 200 on the base URL; document title / home shows app name; footer eventually shows `Träningsplaneraren · Slice N`.

**Teardown:** stop only the preview/dev process you started (kill by port). Leave evidence files in place.

**Isolate:** one driver at a time on a given port. Do not attach to Christoffer’s phone session.

## Doctor (read-only)

Before first drive:

1. `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/traningsplaneringen/` → `200` (or 5173 in dev).  
2. Confirm URL path includes `/traningsplaneringen/` (Vite `base`). Wrong base = broken assets.  
3. `npm run build` exit 0 for formal runs.  
4. Optional: footer text matches expected slice label from pack.

If doctor fails, **BLOCKED** — do not PASS.

## Drive

Use the box browser / computer-use agent. Prefer **visible Swedish labels** and roles over brittle CSS.

Stable handles (prefer in this order):

- Button/link **name** from UI copy (`Starta från mall`, `Redigera redskap`, `Golvklart`, `Klar`, `Stäng`, …)  
- `aria-label` where set (e.g. pass title)  
- Landmark structure: home → Passbyggaren → Hallöversikt sheets

**Phone width:** set viewport ~390×844 when checklist mentions phone.

**Proof standard:** real coach path (click/tap), then observe resulting UI state. Do not call internal setters or only read source. Action + resulting state. For side effects (localStorage draft, body overflow), read them after the action.

## Evidence

| Kind | Location |
|---|---|
| Formal report | `verifier/slice-NN-verify-report.md` |
| Code / selector notes | `verifier/slice-NN-evidence-code.md` |
| Screenshots | `/workspace/screenshots/sliceNN_*.png` (or `/workspace/gymnastics-planner/verifier/screenshots/`) |

Evidence must survive teardown. Name files with slice number + short step (`dirty_stang_confirm`, `mall_scroll`, …).

## Cleanup

- Stop preview/dev you started.  
- Do not delete evidence.  
- Do not clear Christoffer’s real device storage; local preview storage is fair game and should be noted if wiped.

## Feature map

See [`features/README.md`](features/README.md). Start with the features touched by the slice, then smoke adjacent blast-radius features listed there.

## Maintain

When coach-facing surfaces change, run pstack **maintain-verification-skill** against this directory only (update feature files; never “fix” product bugs by editing the map to match broken UI — report product gaps to Planner).

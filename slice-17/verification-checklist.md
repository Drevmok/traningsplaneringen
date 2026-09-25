# Slice 17 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass after Builder has shipped against the APPROVED pack.  
**Status:** **APPROVED 2026-09-25** — A–F locked as recommended.  
**Netlify:** Not required unless Christoffer asks.

## Locked rules (after A–F approved)

| # | Rule | Pass if |
|---|---|---|
| 1 | Golvklart titles | On Golvklart screen, each placed Teknik markör shows short activity title under the icon |
| 2 | Edit canvas | Hallöversikt edit still **hides** under-markör titles |
| 3 | Print | Print still shows short title + redskap (no regression) |
| 4 | Stack (B) | When redskap non-empty, title sits above equipment lines (no overlap at same top) |
| 5 | Empty redskap (D) | Title still shows when station has unset / `[]` redskap |
| 6 | Slice 14 quiet | No “Inga redskap” under quiet markörer |
| 7 | Slice 14–16 intact | Redskap format; Förrådslista; Kom igång 5 steps; compose path |
| 8 | Caption | **Schematisk hall — inte exakt mått** unchanged |
| 9 | Scope | No edit-canvas titles; no badge; no CAD; no förslag-seed work (idea 1) |
| 10 | Phone | ~390px Golvklart readable |
| 11 | Footer (E) | `Träningsplaneraren · Slice 17` when shipped |
| 12 | Build | `npm run build` green |

## Smoke path

1. Open a pass with ≥2 placed Teknik stations; one with saved redskap, one without.  
2. **Edit** Hallöversikt: no under-markör titles; no under-markör redskap.  
3. Enter **Golvklart**: both stations show short titles; composed station shows title **then** redskap lines; quiet station shows title only.  
4. **Skriv ut** / print preview: title + redskap still correct; no double title.  
5. Tap markör → detail still works. Förrådslista + Kom igång unchanged.  
6. Caption unchanged. Footer Slice 17. Phone ~390px OK. Build green.

## Fail if

- Titles appear on edit canvas.  
- Golvklart still hides titles (status quo).  
- Title and redskap overlap / fight the same CSS `top`.  
- Quiet stations get empty redskap chrome.  
- Idea 1 (broader förslag) or CAD/badge sneaks in.  
- Caption changed.  
- Verifier run before Builder ships.

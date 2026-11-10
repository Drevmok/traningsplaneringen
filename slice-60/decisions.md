# Slice 60 — beslut

**LÅST 2026-11-10 av Christoffer** via PO-chatten (relä 06:35), ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1 G1 H1»

Alla ★-förslag valda. **Ingen app-ändring** (`git diff 34ec865 -- app/` tom), **ingen SQL** mot riktiga banken, bundle 0 B, footer kvar på «Slice 59». Uppdrag 2026-11-10 06:15: «Kör Slice 60: utred och laga s31–33-felen först».

| Fråga | Val |
|---|---|
| A | **A1 ★** — klassning per AC (`evidence/root-cause.md`): alla 29 beror på att stand-in saknar schema-57. Laga stand-in-mallen, inte appen och inte smokernas förväntan. |
| B | **B1 ★** — bara de 29 FAIL och orsaken: schema-57 i mallen plus Doctor-kontrollen (F1). |
| C | **C1 ★** — ingen SQL mot riktiga banken. `schema-57.sql` körs bara i den lokala mallen via `setup.sh --template`/Doctor. Filen ändras inte. `schema-58.sql` ingår inte. |
| D | **D1 ★** — 0 B: tom diff i `app/`. |
| E | **E1 ★** — orsaksanalysen ligger i packen. Builder bekräftar den med en körning före ändringen (checklistan 1–2) och skriver utfallet i `SLICE60-SHIPPED.md`. |
| F | **F1 ★** — Doctor säger BLOCKED om mallen saknar en kolumn som appen frågar efter (`BANK_EXERCISE_COLUMNS` + `updated_at`, `updated_by`). |
| G | **G1 ★** — ingen app-ändring. Adminvägens saknade reservhämtning blir en backlograd (se svar 1). |
| H | **H1 ★** — `SLICE_NUMBER` stannar `'59'`. |

## Svar på öppna frågor

Christoffer såg frågorna innan han låste. Svaren kom via PO tillsammans med låset.

1. **Tom Admin-vy utan felrad:** egen backlograd, tillsammans med admin-reserven från G1 (reservhämtning i `loadAdminBank`/`refreshAdminRow` och en felrad när admin-banken inte laddas). Uppföljning efter Slice 60, inte en del av den. Docs ändrar inte backlogfilerna vid lås.
2. **B2-processluckorna** (röd baslinje visas som «SAMMA», hela loopen kördes inte i Slice 57/58): egen infra-slice längre fram, inte nu.
3. **Slice 59 schema-notes:** bara en not i `SLICE60-SHIPPED.md` om att reservmeningen gäller ledarvägen, inte adminvägen. `slice-59-docs` rörs inte.
4. **Huvudklonen** `/workspace/gymnastics-planner` lämnas som den är, med sina oincheckade borttagningar. Builder arbetar i egen worktree från `34ec865`.

## Avvisat
- A2 (app-reserv som enda lagning), A3 (lösare förväntningar i smokes), B2 (processluckor nu), D2 (bundle-utrymme för app-ändring), E2 (ingen bekräftande körning), F2 (ny slice-60-smoke), F3 (inget nytt skydd), G2 (admin-reserv nu), H2 (`SLICE_NUMBER` 60).

Bas main @ `34ec865`. Gren `slice-60-docs`. **Ingen merge utan Christoffers OK.** PO skickar bygg- och verifieringskorten; Docs pingar inte Bob.

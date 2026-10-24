# Slice 52 — Kvarvarande smoke-fel

**App:** Träningsplaneraren (appen ändras inte)
**Status:** **FÖRESLAGEN** 2026-10-24. Bas: main @ 84b44e7 (Slice 51 mergad via PR #56). Gren: `slice-52-docs`. Väntar på Christoffers lås av A–F.
**Effort:** **M** (se nedan).
**Källa:** Quality Masters rapport för Slice 51 (`verifier/slice-51-verify-report.md`, AC4/AC7-avvikelsen och M1–M4, Info) och Builders lista i `SLICE51-SHIPPED.md` («Remaining FAIL», «More open findings»).

## Varför

Slice 51 fick loopen att köra igen, men sju kända FAIL i s43–s46 står kvar och `smoke-map.json` kallar ändå de skripten `"baseline": "ok"`. Några lagade kontroller kan inte längre falla. Admin-importen saknar smoke sedan coach-importens AC togs bort. Den här slicen gör loopen ärlig: 0 FAIL betyder att appen fungerar, och en FAIL betyder att något gick sönder.

## De sju kända FAIL (punkt 1)

Alla sju kördes om 2026-10-24 med `run-smokes.sh` mot main-cachens dist (appen på 84b44e7 är samma som på 055af39, Slice 51 ändrade inte `app/`). Resultat: s43 20/21, s44 30/31, s45 37/40, s46 35/37, alltså samma sju FAIL. 0 anrop till live-värden. Loggarna låg i `/tmp` och checkas inte in. Builder kör om dem i §0.

Ingen av de sju är en regression i appen. Varje FAIL beror på att appen ändrats med avsikt i en senare slice, eller på att smoken väntar för kort eller pekar på en väg som inte finns längre.

| FAIL | Vad som händer | Orsak (kod och historik) | Förslag |
|---|---|---|---|
| s43 AC5 | `small=` är tomt: alla knappar är ≥ 44×44. Kontrollen faller på att headern har **5** knappar, inte 4 | `slice-43-builder-smoke.mjs` rad 65 kräver `.hall-header-actions button` = 4. `HallBoard.tsx` rad 580–626 har «Ändra stationer» (Slice 48 B1), «Visa/Dölj flöde», «Förrådslista», «Använd alla förslag» (bara när förslag finns, kvar i verktygsraden enligt Slice 49 D1) och «Golvklart». Mätt: knapparna slutar på y 276, hallen börjar på y 387 | **Anpassa smoken.** Rapportens rubrik «<44px» stämmer inte |
| s44 AC6 | Klicket på menyraden når timeout | Rad 163 öppnar «Exportera / dela», som heter «Dela» sedan Slice 44 (rad 62 kontrollerar själv att det gamla namnet är borta). Rad 166 och 170 byter port med `old.replace('4410', '4444')`, men portarna kommer från miljön sedan Slice 51 B1. «main» är dessutom 84b44e7 nu, alltså ingen gammal länk | **Anpassa smoken** (fryst gammal länk, se B) |
| s45 AC10 | `waitFor` på `#hall-layout-select` når timeout (rad 179) | Väljaren togs bort i Slice 45 B1. Testet förutsätter att main fortfarande har den. Appen läser fortfarande gamla länkar: `sharePass.ts` rad 40/60 (`v: 1`), `decodeShare` rad 189, gamla hall-id i `lib/hall.ts` rad 24 och 91. s45 AC8/AC9 (gamla utkast → Stora hallen) passerar | **Anpassa smoken** (fryst gammal länk, se B) |
| s45 AC1 | Rubriken är fortfarande «Fokus» när smoken läser den | Guiden går vidare efter `ADVANCE_MS = 250` (`HomeWizard.tsx` rad 50, 86–95). Smoken väntar 200 ms (rad 58 och 60). Trampett-klicket väntar automatiskt tills Fokus syns, och sedan läses rubriken innan nästa steg har kommit. Ordningen Ålder → Fokus → Hall → Passlängd stämmer (`lib/wizard.ts` rad 40–44), och s46 AC9 visar Hall-steget med båda Gymmix-hallarna | **Anpassa smoken** (vänta på rubriken «Hall») |
| s45 AC14-tall | `{"h":225,"compact":false}`, kravet är h > 400 | Arket är inte kompakt, så själva AC:n (inte `modal--compact`) håller. Höjden beror på innehållet: `.forradslista-sheet` har bara `max-height` (`App.css` rad 2896–2904, 3017–3022). Slice 47 B1 tog bort listan «Vad finns i hallen ikväll?» ur Förrådslista (`slice-47/README.md` rad 55), så ett pass med en övning ger ett kort ark | **Anpassa smoken** (kontrollera klass och form på arket, inte pixelhöjden) |
| s46 AC10 | `len=90 / 90 min`, smoken väntar sig «53 / 90 min» | Slice 49 A1: längden styr tiderna, summan blir exakt vald längd (`slice-49/README.md` rad 29; `slice-49/verification-checklist.md` AC2 «90 / 90 min»; `WIZARD_BLOCK_MINUTES` i `app/src/data/blockMeta.ts`) | **Anpassa smoken** till «90 / 90 min» med hänvisning till Slice 49 A1 |
| s46 AC17 | `getByRole('tab', { name: 'Mallar' })` når timeout (rad 250) | Slice 47 A1 tog bort flikraden i Lägg till övning. «Kopiera delningskod» och «Ta bort» för Mina mallar finns nu i arket «Använd mall» i Passbyggaren (`slice-47/README.md` rad 50; `MallList.tsx` rad 13; `blockMeta.ts` rad 117 och 141) | **Anpassa smoken** till «Använd mall» |

## Svaga kontroller (punkt 2)

| Kontroll | Problem | Var |
|---|---|---|
| s43 AC3 | `const ratioOk = true \|\| …` kan aldrig bli false | `slice-43-builder-smoke.mjs` rad 57–59 |
| s43 AC7 | `v !== false` godkänner att alla tips saknas | rad 73 |
| s37 AC9a | Godkänner att toasten saknas (`toastAfterApply === 0 \|\| …`) | `slice-37-builder-smoke.mjs` rad 114 |
| s37 AC9b | Godkänner att bekräftelsen saknas och kontrollerar då ingenting | rad 136–141 |
| s37 AC9e | Godkänner att toasten saknas (`toast.count() === 0 \|\| …`) | rad 188 |

Enligt kommentarerna i skripten visar Slice 46 alltid «Mallen är i Passbyggaren. · Ångra» efter Använd mall. AC9c kontrollerar redan texten, och felinjektionen i Slice 51 fick den att falla. AC9a, AC9b och AC9e kan alltså kräva toasten.

## Verktyg (punkt 3, 4, 6)

| Fynd | Var |
|---|---|
| install-once laddar senaste Playwright (1248) | `verifier/tools/install-once.sh` rad 28: `npx -y playwright install chromium` utan version. Boxen har `chromium_headless_shell-1243`, som hör till `playwright-core@1.63.0-alpha-2026-08-31` (dess `browsers.json`). Smokerna kör själva `/usr/bin/google-chrome` via `pw-netlog.mjs` rad 4 och 20 (`playwright-core@1.59.1`) |
| rc = 0 utan `--baseline` fast ett skript ger exit 1 | `run-smokes.sh` rad 96: `exit $NEWFAIL`. `NEWFAIL` sätts bara i `compare()` och för saknade skript |
| Main-cachens `smoke-baseline.txt` för 055af39 slutar med ett syntaxfel | Sista raderna: `/workspace/gp-s51/verifier/tools/run-smokes.sh: line 50: syntax error …`, och netlog-raden saknas. `doctor.sh` rad 79–81 kör `"$HERE/run-smokes.sh"`, alltså skriptet i den checkout som Doctor körs från (här Builders halvfärdiga gren), inte main-cachens egen `wt/` |
| Kartan säger `"ok"` för skript med kända FAIL | `verifier/smoke-map.json`: s43–s46 har `"baseline": "ok"` men ger exit 1 |

## Admin-import (punkt 5)

Slice 47 F1 gjorde import till en admin-funktion. Slice 51 tog bort coach-importens AC i s30 och seed (ca 30 id, `SLICE51-SHIPPED.md` «PO decisions»). s47 kontrollerar bara att Admin-vyn visar raden «Importera övningar» (`slice-47-builder-smoke.mjs` rad 207–208 och 260). Ingen smoke kör själva importen: fil eller kod in, «Ta med» / «Hoppa över», «Samma namn finns redan», raderna blir `pending`. Logiken har enhetstester (`app/src/lib/ownImport.test.ts`), men UI-vägen saknar smoke.

## A–F (★ = förslag)

### A. De sju kända FAIL
- **A1 ★** Anpassa alla sju smokes enligt tabellen ovan. Varje ändrad förväntan får en `// Slice 52:`-kommentar som hänvisar till beslutet (Slice 44, 45 B1, 47 A1, 47 B1, 48 B1, 49 A1/D1). Inget i `app/` ändras.
- A2 Som A1, men s43 AC5 kräver 4 knappar och appen flyttar «Ändra stationer» eller «Använd alla förslag» ur headern. Det är en appändring som inget låst beslut ber om.
- A3 Ta bort de sju AC ur skripten. Gamla delningslänkar (s44 AC6, s45 AC10) blir då utan smoke.

### B. Gamla delningslänkar (s44 AC6, s45 AC10)
- **B1 ★** Frys riktiga gamla länkar en gång: bygg 0d88da5 (s44) och sista main före Slice 45 (s45, hall `standard-trupp`) i en scratch-worktree, skapa länken med «Kopiera länk» och spara bara `#dela=`-token i `verifier/fixtures/old-share-links.json` med commit och datum. Smoken öppnar `$S44_BR` / `$S45_BR` + token. Inga portar i koden.
- B2 Generera token med dagens `encodeShare` och `hallTemplateId: 'standard-trupp'` (som `make-s46fix.ts`). Billigare, men det testar inte en länk som en gammal app faktiskt gjorde.
- B3 Ta bort AC6 och AC10.

### C. Svaga kontroller
- **C1 ★** Gör dem skarpa igen:
  - s43 AC3: ta bort `ratioOk` och id `AC3`. De gamla hallarna finns inte längre, och AC1/AC2 täcker Gymmix-hallarna.
  - s43 AC7: kräv att `.hall-flow-coach-tip` finns och ligger under hallen. Det tipset finns kvar (s45 AC6). Övriga tips får saknas.
  - s37 AC9a, AC9e: kräv toasten med texten `TOAST`.
  - s37 AC9b: kräv toasten och att ingen bekräftelse visar `OLD_NOTE`.
  - Bevisa med felinjektion som i Slice 51: byt toasttexten i en scratch-worktree, så ska AC9a, AC9b och AC9e falla.
- C2 Märk dem som `info` i utskriften så att de inte räknas. Ärligare än i dag, men ingen kontroll.
- C3 Låt dem vara.

### D. Runner och Playwright
- **D1 ★**
  - `run-smokes.sh` utan `--baseline`: exit 1 om något skript ger exit ≠ 0. Med `--baseline` som i dag: exit 1 bara vid `NY FAIL`.
  - `lib.sh` får `PW_VERSION=1.63.0-alpha-2026-08-31` och `PW_REV=1243`. `install-once.sh` rad 28 kör `npx -y playwright@$PW_VERSION install chromium-headless-shell`. `pw_ok` kräver `chromium_headless_shell-$PW_REV`.
- D2 Bara rc-fixen. Playwright lämnas olåst.
- D3 Ingen ändring.

### E. Smoke för admin-import
- **E1 ★** Ny `verifier/slice-52-admin-import-smoke.mjs` på samma fejkade Supabase som s47 (`slice-47-fake-supabase.mjs`), utan stand-in. Vägen: inloggad admin → «Admin» → «Importera övningar» → en fil med tre övningar, varav en har samma namn som en bankövning → kontrollera «Samma namn finns redan» och att den raden startar på «Hoppa över» → «Ta med» på två → två nya rader med `pending` och «Väntar». En AC för kod-input. Läggs i `smoke-map.json` med `features/admin.md` och `AdminArea.tsx`, `lib/ownImport.ts`.
- E2 Samma väg mot lokal stand-in (`"standin": "s32"`, riktig GoTrue/PostgREST). Mer verklighetsnära men ca 1 min längre per körning och beroende av inloggningen. Effort blir L.
- E3 Ingen ny smoke; lita på `ownImport.test.ts`.

### F. Baslinjefilen
- **F1 ★**
  - `doctor.sh` rad 81 kör `"$MC/wt/verifier/tools/run-smokes.sh"`, alltså main-cachens eget skript, inte `$HERE`.
  - Doctor kontrollerar filen efteråt: en rad `<skript> exit=` per skript i kartan, en `netlog:`-rad och ingen `syntax error`. Annars döps filen om till `smoke-baseline.invalid.txt` och Doctor säger BLOCKED.
  - `run-smokes.sh --baseline` vägrar en fil som inte klarar samma kontroll (exit 2).
  - Filen för 055af39 byter namn till `smoke-baseline.invalid.txt` på boxen. Den checkas aldrig in.
  - `smoke-map.json`: s43–s46 sätts till `"baseline"` enligt den nya körningen (`"ok"` först när de ger 0 FAIL).
- F2 Bara Doctor-cachen byggs om för 84b44e7, ingen kontroll av filen.
- F3 Ingen ändring.

Ingen ändring i `app/`, **bundle 0 B**, **ingen höjning av SLICE_NUMBER** (står kvar på '49'). Samma skäl som i Slice 50 och 51.

## Effort

**M.** Sju anpassningar (de flesta en till tre rader), fem skärpta kontroller, två små verktygsfixar, en Doctor-kontroll och en ny smoke. Mest tid går till att köra skripten: s45 och s46 tar ca 2–2,5 min var, och alla ändrade skript ska köras tre gånger i rad. B1 kräver två byggen av gamla commits. E1 är den största enskilda delen. Med E2 blir det L.

## Bundle

0 B. `app/` ändras inte. AC15 kontrollerar det.

## Öppna frågor

1. s43 AC5: ska kravet vara «4 eller 5 knappar» (beror på om förslag finns) eller exakt den uppsättning som `HallBoard.tsx` rad 580–626 ger i det läget? Förslag: exakt uppsättning per läge, med etiketter.
2. B1: vilken commit är «sista main före Slice 45»? Förslag: föräldern till merge-commiten för Slice 45 (`cd19319`); Builder skriver SHA i fixturen.
3. s33–s36, s38–s41 och s47 har egna kända FAIL (s33 12, s35 13 m.fl.) som inte ingår här. Egen slice? Förslag: ja, Slice 53, samma metod.
4. D1: ska `weekly.sh` larma på rc från körningen utan `--baseline`? Förslag: nej, den kör redan med `--baseline`.
5. Coach-importens AC (Slice 51 M4) ersätts av E1. Räcker det som svar på Slice 51:s öppna fråga 1?

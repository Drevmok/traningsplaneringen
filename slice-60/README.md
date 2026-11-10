# Slice 60 — Utred och laga s31–33-felen från veckokörning v45

**App:** Träningsplaneraren (★ = appen ändras inte)
**Status:** **FÖRESLAGEN** 2026-11-10. Väntar på Christoffers lås via PO. Bas: main @ `34ec865` (Slice 59 live, footer «Slice 59»). Gren: `slice-60-docs`. `decisions.md` skrivs först vid lås.
**Uppdrag:** Christoffer 2026-11-10 06:15 (via PO), ordagrant: «Kör Slice 60: utred och laga s31–33-felen först».
**Effort:** **S** med ★ (två skalfiler i stand-in, en Doctor-kontroll, inga appfiler, ingen ny smoke). Med G2 fortfarande S, men då ändras admin-chunken och footern.
**Underlag:** `/home/box/tp-verify/weekly/2026-v45.md` och `2026-v45-out/` (loggar, netlog), `2026-v44.md`, main-cachens `smoke-baseline.txt` per SHA under `/home/box/tp-verify/main/`, skripten `verifier/slice-3{1,2,3}-builder-smoke.mjs`, `verifier/slice-32-local/setup.sh`, `verifier/tools/{doctor,run-smokes,db-new}.sh`. Inga smokes kördes för den här texten. Allt nedan är läst ur loggar och kod.

## Varför

Veckokörningen v44 (main `9564c69`) var grön. v45 (main `34ec865`, 2026-11-08 03:47 CET) har 29 FAIL i tre skript:

| Skript | v44 | v45 | FAIL-id |
|---|---|---|---|
| `slice-31-builder-smoke` | 47/0 | 45/2 | C1a, C2a |
| `slice-32-builder-smoke` | 78/0 | 42/14 | AC26b, AC29, AC29a, AC29c, AC29d, AC30b, AC31, AC33, AC33b0, AC34, AC35, AC36, AC37, AC48c |
| `slice-33-builder-smoke` | 146/0 | 111/13 | AC21c, S32-AC29, -29a, -29c, -29d, -30b, -31, -33, -33b0, -34, -35, -36, -37 |

Övriga 20 skript är gröna. Runnern skrev «SAMMA» mot main-baslinjen, eftersom baslinjen för `34ec865` själv har samma 29 FAIL. Felen syntes bara i diffen mot förra veckan.

## Rotorsak (hypotes, säkerhet: hög)

**Kort:** stand-in-databasen som smokes kör mot har inte kolumnen `default_station_layout`. Live har den sedan Slice 57 (`schema-57.sql` inklistrad före merge av PR #62). Appen frågar efter kolumnen sedan Slice 57. Felen kommer från Slice 57 (`b610103`), inte från 58 eller 59.

1. **Stand-in är efter live.** Mallen `bank_template` byggs av `roles.sql` → GoTrue → `schema-31.sql` → seed → `schema-32.sql` (`verifier/slice-32-local/setup.sh:91–93`). Hashen i `doctor.sh:31` och `setup.sh:101` täcker samma fyra filer. `slice-57/content/schema-57.sql` körs aldrig. `default_station_layout` finns 0 gånger i schema-31/32 och 13 gånger i schema-57.
2. **Ledarvägen: en extra GET (by design).** Slice 57 lade `default_station_layout` i `BANK_EXERCISE_COLUMNS` (`app/src/lib/bankRow.ts:60`). `refreshBank` (`app/src/lib/bank.ts:187–193`) frågar med kolumnen. Svarar PostgREST med fel som nämner kolumnen, frågar appen igen utan den (reservhämtning för en bank utan schema-57). Netloggen för s31 v45 visar just det: en GET med `default_station_layout`, sedan samma GET utan. Smokes som räknar exakt två GET faller: C1a, C2a, AC26b, AC21c.
3. **Adminvägen: ingen reserv, tom Admin-vy.** `ADMIN_COLUMNS = [...BANK_EXERCISE_COLUMNS, 'updated_at', 'updated_by']` (`app/src/lib/admin/adminBank.ts:13`). `loadAdminBank` (`:46–62`) frågar med kolumnen, får fel och returnerar `false` utan reserv. Admin-banken blir aldrig `loaded`, så `AdminArea.tsx:51–65` ritar varken listor eller «Inget väntar just nu.». Alla AC som väntar på «Väntar på godkännande», «Behöver granskas» eller admin-detaljen når timeout eller räknar 0. AC30b och AC48c följer av att godkännandet i AC29 aldrig gjordes.
4. **Tidslinje (main-cachens baslinjer):** `9a452c7` (Slice 56) 47/0, 78/0, 146/0. `b610103` (Slice 57) **NY FAIL** i alla tre. `3f0a729` (Slice 58) och `34ec865` (Slice 59) samma 2/14/13. «Efter Slice 58/59» i rutinens ledtråd stämmer alltså inte. Det började med Slice 57.
5. **Hur det slapp igenom:** `pick-smokes 9a452c7 b610103` säger HELA LOOPEN, men `SLICE57-SHIPPED.md` listar fem smokes (s48, s49, s52, s55, s56), och Slice 58 samma fem. s31–33 kördes inte före merge. Ingen Verifier-rapport för 57–59 ligger i repot, så det är okänt om QM körde dem.

**Varför säkerheten är hög och inte säker:** punkterna 1–4 syns direkt i kod, netlog och baslinjer. PostgREST-svaret (400, «column exercises.default_station_layout does not exist») står inte i loggarna, eftersom netloggen inte sparar status. Builder bekräftar med AC 1 i checklistan innan något ändras.

**Appen gör rätt mot live.** Live har kolumnen, så ledaren gör två GET och admin laddar. Ingen av de 29 är en bugg i produktion. En svaghet finns kvar: på en bank utan schema-57 får admin en tom vy utan felrad (se G och öppen fråga 1). Slice 59 `content/schema-notes.md` säger «Då hamnar alla Teknik med redskap i kön, och ingenting kraschar». Det gäller ledarvägen, inte adminvägen.

Tabell per AC: [`evidence/root-cause.md`](evidence/root-cause.md).

## Scope (★)

- Stand-in-mallen får samma schema som live: `schema-57.sql` efter `schema-32.sql`. Inte `schema-58.sql` (låst «HOPPAS ÖVER» och inte inklistrad live).
- Doctor kontrollerar att mallen har alla kolumner appen frågar efter, så att nästa nya kolumn inte ger samma fel igen.
- Smokes ändras inte. Deras förväntan (exakt två GET, admin-listor laddar) är rätt mot live.
- Ingen app-ändring, ingen SQL mot riktiga banken, footern stannar på «Slice 59».

## A–H (★ = Docs förslag)

### A. Laga test eller app?
- **A1 ★** Klassning per AC enligt `evidence/root-cause.md`: alla 29 beror på att stand-in saknar schema-57. Laga miljön (stand-in-mallen), inte appen och inte smokernas förväntan.
- A2 Laga appen: reservhämtning även i `loadAdminBank`/`refreshAdminRow`. Löser bara adminfelen. C1a, C2a, AC26b och AC21c faller fortfarande (ledaren gör ju reservhämtningen), så A2 räcker inte ensam.
- A3 Laga testerna: tillåt en tredje GET i C1a/C2a/AC26b/AC21c och låt admin-AC hoppa över. Döljer en riktig dubbel-GET om den någon gång händer live. Avråds.

### B. Scope
- **B1 ★** Bara de 29 FAIL och orsaken bakom dem: stand-in-schemat plus Doctor-kontrollen (F1).
- B2 Som B1, och dessutom processluckorna: (a) runnern skriver «BASLINJEN RÖD» när baslinjen själv har FAIL, i stället för bara «SAMMA»; (b) regel i `backlog/PSTACK-OPS.md` att Builder och Verifier kör hela loopen när `pick-smokes` säger HELA LOOPEN. Större diff i `run-smokes.sh` och en regeländring.

### C. SQL
- **C1 ★** Ingen SQL mot riktiga banken. `schema-57.sql` körs bara i den lokala stand-in-mallen, av `setup.sh --template` via Doctor, precis som schema-31/32 i dag. Filen ändras inte.

### D. Bundle
- **D1 ★** 0 B: `git diff 34ec865 -- app/` ska vara tom.
- D2 Gäller bara om G2 väljs: inom +512 B gzip (uppskattning +0,05–0,15 kB i admin-chunken, huvudchunken 0 B).

### E. Orsaksanalys
- **E1 ★** Analysen ligger i packen (`README.md`, `evidence/root-cause.md`). Builder bekräftar den med en körning före ändringen (checklistan AC 1–2) och skriver utfallet i `SLICE60-SHIPPED.md`.
- E2 Bara packens text, ingen bekräftande körning före ändringen.

### F. Regressionsskydd
- **F1 ★** Doctor-kontroll: kolumnerna i `BANK_EXERCISE_COLUMNS` (läst ur `app/src/lib/bankRow.ts`) plus `updated_at`, `updated_by` ska finnas i `bank_template.public.exercises`. Saknas någon: `BLOCKED stand-in saknar kolumn <x> — lägg schemafilen i setup.sh`. Fångar nästa slice som lägger till en kolumn, före smokes.
- F2 Ny `slice-60-standin-smoke.mjs`: admin loggar in, «Väntar på godkännande» och «Saknar skiss (n)» syns, ledaren gör exakt två GET. Dubblerar till stor del s32 AC26b/AC29a, och fångar felet först när smoken körs.
- F3 Inget nytt skydd. s31–33 räcker när de körs, men de kördes inte i Slice 57.

### G. Admin utan kolumnen (latent svaghet, inte orsak till de 29)
- **G1 ★** Ingen app-ändring i Slice 60. Svagheten blir en backlograd (Proposed) som Scout eller PO lägger. Live har kolumnen.
- G2 Reservhämtning i `loadAdminBank` och `refreshAdminRow` som i `bank.ts:190–193`. Då stämmer meningen i Slice 59 schema-notes. Kräver D2 och H2.

### H. Footer och SLICE_NUMBER
- **H1 ★** Ingen ändring. `SLICE_NUMBER` stannar `'59'`, som i infraslicerna 50–52 («SLICE_NUMBER stays 49»).
- H2 `SLICE_NUMBER = '60'`. Krävs om G2 väljs, eftersom appen då ändras.

## Öppna frågor

1. **Admin utan admin-bank:** när `loadAdminBank` misslyckas visar Admin-vyn ingenting, varken listor eller felrad (`AdminArea.tsx:65` kräver `bank.loaded`). Ska det bli en egen backlograd (felrad + «Försök igen»), eller ingå i G2?
2. **B2:** ska processluckorna (röd baslinje visas som «SAMMA», hela loopen kördes inte i Slice 57/58) lagas nu eller som egen infra-slice?
3. **Slice 59 schema-notes:** meningen om reserv gäller bara ledarvägen. Rätta den i `slice-59/content/schema-notes.md` på `slice-59-docs`, eller räcker en not i `SLICE60-SHIPPED.md`?
4. **Huvudklonen** `/workspace/gymnastics-planner` har oincheckade borttagningar av `tools/bank/out/*`, bland annat `bank-seed.sql`. Doctor bygger mallen från `$REPO/tools/bank/out/bank-seed.sql`. Builder kör Doctor från egen worktree. Ska borttagningarna städas av den som gjorde dem?

## Lås

Förslag: «Ja, lås A1 B1 C1 D1 E1 F1 G1 H1»

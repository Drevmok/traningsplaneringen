# Slice 50 — verifieringslista (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses.

Ingen ändring i appen. Allt körs på boxen mot lokal stand-in. Ingen SQL mot det riktiga projektet. Ingen nyckel i repot; bara prefixen `sb_publishable_`/`sb_secret_` får synas i loggar och rapporter.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Kör `verifier/tools/install-once.sh` två gånger | Andra körningen installerar inget och slutar med exit 0 |
| AC2 | Kör `verifier/tools/doctor.sh` på en färdig box | PASS för: Postgres 17, GoTrue, PostgREST, Playwright Chromium, malldatabas med rätt sha256, lediga portar, main-cache för `origin/main`. Tar < 30 s |
| AC3 | Flytta bort GoTrue-binären och kör Doctor | BLOCKED med namnet på det som saknas och kommandot som lagar det. Doctor installerar inget |
| AC4 | Ändra en rad i en kopia av `bank-seed.sql` (pekad via miljövariabel) och kör Doctor | Mallen märks inaktuell och byggs om; ny sha256 i Doctor-utdata |
| AC5 | Två körningar samtidigt med olika run-id | Två databaser `bank_<run>`; data som skrivs i den ena syns inte i den andra; båda tas bort efteråt, mallen finns kvar |
| AC6 | Netlog för en hel verifiering | 0 anrop till det riktiga projektets värd |
| AC7 | Main-cache: kör Doctor två gånger på samma `origin/main` | Andra gången byggs inget; `bundle.txt` och smoke-baslinje läses från `/home/box/tp-verify/main/<sha>/` |
| AC8 | `pick-smokes.mjs` på slice 49:s diff (c86175a..42f0f8d) | Listan innehåller s40 och s49 (Hallöversikt, Planera pass) och s48; inte s32/s33 |
| AC9 | `pick-smokes.mjs` på en diff som rör en fil som inte finns i kartan | Hela loopen |
| AC10 | `smoke-map.json` | Alla smoke-skript i `verifier/*-smoke.mjs` och `*-reverify*.mjs` som körs i loopen finns med; varje post har feature-fil och minst en sökväg |
| AC11 | s33 körs 20 gånger på egen stand-in, varav 10 direkt efter s32 | AC16d/AC11d FAIL högst 0 gånger; annars karantän enligt D2 med logg (GoTrue /otp, /verify, mejltider) bifogad |
| AC12 | Ordinarie verifiering av en verklig slice (nästa app-slice) med nya flödet | Total tid ≤ 25 min från start till rapport; tider per steg i rapporten |
| AC13 | Omverifiering av samma slice efter en liten fix | ≤ 10 min; bara FAIL-AC och smokes som berörs körs |
| AC14 | `git diff --stat origin/main -- app/` på kodgrenen | Tomt. Bundle 0 B. Sidfoten «Träningsplaneraren · Slice 49» oförändrad |
| AC15 | Rapporten från AC12 | Har PASS/FAIL per AC i checklistan, skärmdumpar i 390×844 och 844×390, bundle-rad mot main. Ingen rad borttagen jämfört med slice 49:s rapport |
| AC16 | `/home/box/agent-data/workflows/` | Bara `verify-traningsplaneraren/`; dess SKILL.md har texten i HANDOFF §5; `-2` borta |
| AC17 | `verify-traningsplaneraren/features/*.md` | Varje fil har avsnittet «Stabila väljare»; varje väljare där finns i `app/src` (grep) eller är roll + synlig svensk etikett |
| AC18 | PROJECT.md på kodgrenen | Avsnittet «Verifieringsrecept» har exakt texten i HANDOFF §7; låsta termer orörda |
| AC19 | Veckokörning (efter Christoffers OK att skapa rutinen): en provkörning | Fil i `/home/box/tp-verify/weekly/`; jämförelse mot förra körningen; inget meddelande när inget är nytt FAIL |

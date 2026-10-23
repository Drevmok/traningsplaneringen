# Slice 50 — Snabbare verifiering

**App:** Träningsplaneraren (appen ändras inte)
**Status:** **LÅST** 2026-10-23 av Christoffer (svar via PO-chatten: «Ja, lås enligt rekommendationerna»): A1 B1 C1 D1 E1 F1. Ingen SQL. Bas: main @ 9a087c3. Gren: `slice-50-docs`. Se `decisions.md`.
**Effort:** **M** (se nedan).
**Källa:** PO-uppdrag 2026-10-23 (punkt 1–6). Underlag: `verifier/slice-48-verify-report.md`, `verifier/slice-48-reverify-addendum.md`, `verifier/slice-49-verify-report.md`, `verifier/slice-32-local/`, `verifier/slice-33-local/`, `verifier/slice-33-builder-smoke.mjs`, `/home/box/agent-data/workflows/verify-traningsplaneraren{,-2}/SKILL.md`.

## Varför

En formell verifiering tar i dag över en timme. Slice 49: 19:44–21:05 (81 min). Slice 48: 07:33–08:40 (67 min) plus en omkörning av smoke-loopen. Tiden går mest till sådant som inte är bedömning:

- **Verktyg installeras om varje gång.** GoTrue och PostgREST ligger i `/tmp/gotrue/auth` och `/tmp/postgrest/postgrest` (standard i `verifier/slice-32-local/env.sh`) och finns inte kvar efter omstart. I slice 49 installerades Postgres-paket via apt (`/tmp/s49v-pg.log`) och Playwright via npm (`/tmp/s49v-pw.log`, som föll på `Tracker "idealTree" already exists`).
- **Stand-in byggs från noll.** `setup.sh` kör `initdb` och sedan `schema-31.sql` → `bank-seed.sql` → `schema-32.sql` vid varje körning.
- **Main byggs om för jämförelse.** Bundle och smoke-loop körs mot main varje gång (`/tmp/s49base`, `/workspace/gp-main-9aa3996`).
- **Hela smoke-loopen körs.** 19 smokes (s30–s49 och seed) oavsett vad diffen rör. Flera ger samma FAIL på main och gren (s32 14/18, s33 93/14, s37 kraschar) och kräver ändå klassning för hand.
- **En flake kostar en omkörning.** s33 AC16d/AC11d gav `otp_expired` i slice 48 (`slice-48-reverify-addendum.md`), inte i slice 49.
- **Två skill-kopior** med samma `name:` (`verify-traningsplaneraren` och `verify-traningsplaneraren-2`) pekar på samma repo-skill.

**Mål:** ordinarie verifiering **ca 20–25 min**, omverifiering **ca 10 min**, utan att rigorn sänks.

## Vad som inte ändras (rigor)

- **Isolering:** egen stand-in-databas per körning, egna portar, `stop.sh` stoppar bara den egna katalogen. Ingen trafik till det riktiga projektet (netlog: 0 anrop till live-värden).
- **Bedömning per kriterium:** varje AC i slicens `verification-checklist.md` får eget PASS/FAIL med bevis. Smoke-urvalet ersätter inte checklistan.
- **Viewports:** 390×844 och 844×390 körs alltid.
- **Bundle:** gzip mot main per slice, ≤ +512 B mjukt.
- **Doctor faller → BLOCKED**, aldrig PASS.

## Tidsbudget (mål)

| Steg | I dag | Efter slice 50 (ordinarie) | Omverifiering |
|---|---|---|---|
| Verktyg (Postgres 17, GoTrue, PostgREST, Playwright) | 5–15 min | 0 (Doctor < 30 s) | 0 |
| Stand-in-databas | 2–4 min | < 30 s (kopia från mall) | < 30 s |
| Bygg main för jämförelse | 3–5 min | 0 (cache per SHA) | 0 |
| Bygg gren + test/tsc/lint | 3–5 min | 3–5 min | 3–5 min |
| Checklistans AC + viewports | 20–30 min | 10–15 min | bara FAIL-AC + berörda, 3–5 min |
| Smoke-loop | 20–30 min | 3–5 min (urval från diff) | urval |
| **Summa** | **65–80 min** | **ca 20–25 min** | **ca 10 min** |

Tiderna för «i dag» är uppskattade från rapporternas start/slut och loggarna, inte uppmätta per steg. AC12 mäter dem efter slice 50.

## A–F (★ = förslag)

### A. Stand-in-databas
- **A1 ★** Fast stand-in i `/home/box/tp-verify/standin` (inte `/tmp`). En **malldatabas** `bank_template` byggs en gång med samma kedja som i dag (`roles.sql` → `schema-31.sql` → `tools/bank/out/bank-seed.sql` → `schema-32.sql`). Varje körning skapar en egen databas med `createdb -T bank_template bank_<run>` och tar bort den efteråt. Mallen märks med sha256 av de fyra filerna; ändras någon fil byggs mallen om. Postgres körs lokalt på boxen, inte mot det riktiga projektet.
- A2 `pg_dump` av en färdig databas, `pg_restore` per körning. Fungerar, men långsammare än mallkopia och en fil till att hålla i takt.
- A3 Som i dag (`setup.sh` från noll varje gång).

### B. Verktyg en gång, Doctor och main-cache
- **B1 ★** Nytt `verifier/tools/install-once.sh` (idempotent) lägger Postgres 17 (apt), GoTrue, PostgREST och Playwright Chromium i `/home/box/tp-verify/bin` och `~/.cache/ms-playwright`. Doctor (`verifier/tools/doctor.sh`) kontrollerar att allt finns, versioner, att mallen matchar sha256, att portarna är lediga och att main-cachen finns. Main byggs **en gång per SHA** till `/home/box/tp-verify/main/<sha>/` (`dist/`, bank-build, `bundle.txt`, test/tsc/lint-utfall, smoke-baslinje). Saknas cache bygger Doctor den och fortsätter. Doctor installerar aldrig något själv; saknas verktyg blir det BLOCKED med kommandot att köra.
- B2 Som B1, men Doctor installerar det som saknas automatiskt. Snabbare, men en verifiering kan då ändra boxen mitt i en körning.
- B3 Bara main-cachen; verktyg som i dag.

### C. Smoke-karta och urval från diff
- **C1 ★** `verifier/smoke-map.json`: varje smoke-skript → appområde (feature-fil i `verify-traningsplaneraren/features/`) och sökvägar i `app/src/`. `verifier/tools/pick-smokes.mjs <bas> <head>` läser `git diff --name-only` och skriver listan. Regler: alltid de två senaste slicernas smokes plus s48 (liggande 844×390); en ändrad fil som inte matchar något i kartan → **hela loopen**; ändring i `lib/session.ts`, `data/blockMeta.ts` eller `App.css` → hela loopen. Resultat jämförs mot main-baslinjen i cachen (B1), som i dag men utan att köra main igen.
- C2 Taggar i varje smokes huvudkommentar i stället för en separat fil. Kräver ändring i 19 skript.
- C3 Verifier väljer för hand som i dag.

### D. s33 AC16d/AC11d `otp_expired`
OTP-livslängden är redan 3600 s i stand-in (`S32_OTP_EXP`, `GOTRUE_MAILER_OTP_EXP`) mot 60 s väntan för «Skicka ny kod». Att höja livslängden löser alltså inte felet. GoTrue svarar `otp_expired` också när koden inte matchar den senast utfärdade. Troligare orsaker: smoken väntar från klientens `tA` men GoTrues `GOTRUE_SMTP_MAX_FREQUENCY=60s` räknar från när servern skickade, eller `waitMail` tar fel mejl när s33 körs direkt efter s32 (samma mönster som i `slice-45-verify-report.md`, AC11c/AC12d).
- **D1 ★** Laga i smoken, i två steg. (1) Logga vid FAIL: GoTrue-loggens rader för /otp och /verify, mejlens tidsstämplar och vilken kod som skickades. (2) Vänta från det första mejlets tidsstämpel + 65 s i stället för `tA` + 61,5 s, och välj mejlet med högst tidsstämpel efter klicket. s33 får egen databas (A1), aldrig direkt efter s32 på samma GoTrue. Är felet kvar i 2 av 20 körningar efter det: karantän enligt D2.
- D2 Karantän direkt: AC16d och AC11d räknas som INFO i loopen och kontrolleras för hand en gång per slice som rör inloggning. Snabbt, men flaken blir kvar.
- D3 Höj `S32_OTP_EXP` (PO:s exempel). Ingen effekt, se ovan.

### E. En skill och stabila väljare
- **E1 ★** Slå ihop till **en** pekare: `/home/box/agent-data/workflows/verify-traningsplaneraren/SKILL.md` (text i HANDOFF §5). Katalogen `verify-traningsplaneraren-2/` tas bort. Båda har i dag samma `name:` och nästan samma text, så två skills triggas för samma sak. Repo-skillen (`verify-traningsplaneraren/SKILL.md`) förblir källan och får avsnitten Snabbspår, Doctor och Smoke-urval. Varje `features/*.md` får avsnittet **Stabila väljare**: roll + synlig svensk etikett först, sedan id/klass som smokes redan använder (t.ex. `#hall-cta-hint`, `.block-card`, `.side-panel-slot.is-open .side-panel-frame`, `footer .footer-admin-logout`, `.admin-resend`, `.run-next`). Inga `data-testid` i appen.
- E2 Som E1, plus `data-testid` i appen. Ändrar appen, ger bundle > 0 och hör hemma i en egen slice.
- E3 Behåll båda skills, bara väljare.

### F. PROJECT.md, veckokörning, omfång
- **F1 ★** Avsnittet «Verifieringsrecept» i PROJECT.md byts mot texten i HANDOFF §7 (snabbspår, omverifiering, vad som alltid körs). En **veckokörning av hela smoke-loopen** söndag 03:00 (Europe/Stockholm) mot main HEAD på stand-in, resultat i `/home/box/tp-verify/weekly/<år>-v<vecka>.md` och en rad i Docs-chatten bara om något är nytt FAIL mot förra veckan. Rutinen skapas först efter Christoffers OK. Ingen ändring i `app/`, **bundle 0 B**, **ingen höjning av SLICE_NUMBER** (sidfoten står kvar på «Slice 49»; PROJECT.md kräver inte höjning och en sidfot som byter siffra utan att appen ändras vore missvisande).
- F2 Som F1 men varje natt. Fler körningar på en delad box.
- F3 Ingen schemalagd körning; hela loopen bara på begäran.

## Effort

**M.** Inga appändringar, men: två nya skript (install/Doctor), mallbaserad stand-in (ändring i `setup.sh`/`env.sh`), main-cache, smoke-karta för 19 skript plus väljare, felsökning av en flake som inte går att återskapa på beställning, sammanslagen skill, nya avsnitt i 10 feature-filer, mätning av tider (AC12–AC13). Flaken (D1) är den osäkra delen; den kan ensam ta en halv dag.

## Bundle

0 B. `app/` ändras inte. AC14 kontrollerar det.

## Öppna frågor

1. D: räcker 2 av 20 körningar som gräns för karantän, eller vill du karantän direkt (D2) och felsökning senare?
2. F1: söndag 03:00 för veckokörningen, och rad i Docs-chatten bara vid nytt FAIL — passar det?
3. C1: smokes som redan faller på main (s32, s33 delvis, s37, s30/s31/seed utan fixtures) — ska de lagas i den här slicen eller märkas «trasig baslinje» i kartan? Förslag: märk dem nu, laga i en egen slice.
4. B1: `/home/box/tp-verify/` är delad mellan alla agenter på boxen. Ska Builder också använda cachen, eller bara Verifier? Förslag: båda läser, bara Doctor skriver.

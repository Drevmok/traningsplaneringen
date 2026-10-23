# Slice 50 — HANDOFF (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses. Bas main @ 9a087c3.

Gränser: rör inte `app/`. Ingen SQL mot det riktiga projektet. Inga nycklar i repot eller i loggar som checkas in (bara prefixen `sb_publishable_`/`sb_secret_`). Lokala nycklar skapas som i dag av `setup.sh` och stannar i stand-in-katalogen. Inget push till main, ingen force-push.

## 1. Verktyg en gång (B1)
- Ny `verifier/tools/install-once.sh`, idempotent:
  - Postgres 17 via apt om `/usr/lib/postgresql/17/bin/initdb` saknas (finns på boxen i dag).
  - GoTrue och PostgREST till `/home/box/tp-verify/bin/` (i dag `/tmp/gotrue/auth`, `/tmp/postgrest/postgrest`, försvinner vid omstart). Fasta versioner i skriptet.
  - Playwright Chromium via `npx playwright install chromium` en gång (finns i dag: `chromium_headless_shell-1243`). Ingen `npm ci` parallellt i samma katalog (orsaken till `idealTree` i `/tmp/s49v-pw.log`).
- `verifier/slice-32-local/env.sh`: standard för `GOTRUE`/`POSTGREST` → `/home/box/tp-verify/bin/…`. Miljövariablerna gäller fortfarande.

## 2. Stand-in med malldatabas (A1)
- `env.sh`: ny standard `S32_DIR=/home/box/tp-verify/standin` för det fasta läget; `/tmp/s32` finns kvar som väg för engångskörning.
- `setup.sh`: nytt läge `--template` bygger `bank_template` (samma kedja: `roles.sql` → `slice-31/content/schema-31.sql` → `tools/bank/out/bank-seed.sql` → `S32_SCHEMA32`) och skriver sha256 av de fyra filerna till `<dir>/template.sha256`.
- Nya `verifier/tools/db-new.sh <run>` (`createdb -T bank_template bank_<run>`) och `db-drop.sh <run>`. GoTrue/PostgREST per körning pekas på `bank_<run>` (egna portar som i dag via `S32_*_PORT`).
- `stop.sh` oförändrad princip: stoppar bara egen katalog.

## 3. Doctor och main-cache (B1)
- Ny `verifier/tools/doctor.sh`, bara läsning utom cache-bygget:
  1. Binärer och versioner (Postgres 17, GoTrue, PostgREST, Chromium, node, bun).
  2. Malldatabasen finns och `template.sha256` stämmer med filerna i checkouten.
  3. Portarna för körningen är lediga.
  4. `/home/box/tp-verify/main/<origin/main-sha>/` finns med `dist/`, bank-build, `bundle.txt` (gzip -9 per chunk), `test.txt`, `tsc.txt`, `lint.txt`, `smoke-baseline.txt`. Saknas: bygg i en egen worktree `/home/box/tp-verify/main/<sha>/wt` (aldrig i `/workspace/gymnastics-planner`) och skriv filerna. Lås med `flock` så två agenter inte bygger samma SHA.
  5. Befintliga Doctor-steg (HTTP 200 på `/traningsplaneringen/`, base, build exit 0) som i dag.
- Utdata: en rad per kontroll, `PASS`/`BLOCKED <vad> — kör <kommando>`. Exit ≠ 0 vid BLOCKED.

## 4. Smoke-karta (C1)
- Ny `verifier/smoke-map.json`: `{ "<skript>": { "feature": "features/<fil>.md", "paths": ["app/src/…"], "baseline": "ok" | "trasig" } }`. Utgå från de 19 skripten i `slice-49-checks/loop-wt.txt`. s30/s31/seed (saknar fixtures), s32/s33 (gamla väljare), s37 (kraschar) märks `"trasig"` och jämförs bara mot main-baslinjen.
- Ny `verifier/tools/pick-smokes.mjs <bas> <head>`: regler enligt README C1. Skriver listan och skälet per skript.
- Loop-körningen läser main-resultat från cachen (§3) i stället för att köra main.

## 5. En skill (E1)
Ersätt `/home/box/agent-data/workflows/verify-traningsplaneraren/SKILL.md` med texten nedan och ta bort katalogen `verify-traningsplaneraren-2/` (efter lås; görs inte i docs-grenen):

```markdown
---
name: verify-traningsplaneraren
description: >-
  Use when verifying or self-smoking Träningsplaneraren (Swedish gymnastics
  coach planner): formal Verifier runs, re-verification, Builder pre-ship smoke,
  or maintaining the project feature map.
---
# Verify Träningsplaneraren (pekare)

Källan finns i repot. Läs och följ den:
`/workspace/gymnastics-planner/verify-traningsplaneraren/SKILL.md`

Funktionskarta: `/workspace/gymnastics-planner/verify-traningsplaneraren/features/`
Smoke-karta: `/workspace/gymnastics-planner/verifier/smoke-map.json`
Arbetssätt: `/workspace/gymnastics-planner/backlog/PSTACK-OPS.md`

## Ordning
1. Läs repo-skillen (Launch → Doctor → Drive → Evidence).
2. Slicens `verification-checklist.md` / låsta A–F är auktoritet.
3. `verifier/tools/doctor.sh` måste ge PASS före Drive. BLOCKED är aldrig PASS.
4. Smokes: `verifier/tools/pick-smokes.mjs <bas> <head>`. Omverifiering: bara FAIL-AC + berörda smokes.
5. Bevis i `verifier/`; lämna dem kvar efter teardown.
6. Efter slices som ändrar coach-ytor: maintain-verification-skill mot repo-katalogen.

Kopiera inte recepten hit.
```

Repo-skillen `verify-traningsplaneraren/SKILL.md` får tre nya avsnitt (engelska som resten av filen): **Fast path** (install-once en gång, Doctor, `db-new`, pick-smokes), **Re-verify** (bara FAIL-AC, berörda smokes, återanvänd stand-in och main-cache) och **Always** (isolering, PASS/FAIL per AC, 390×844 och 844×390, bundle mot main).

## 6. Stabila väljare (E1)
I varje fil i `verify-traningsplaneraren/features/` (10 filer + README-index): nytt avsnitt `**Stabila väljare**` med en tabell *Vad | Väljare | Källa*. Ordning: roll + synlig svensk etikett, `aria-label`, id, klass. Ta väljare som redan används av smokes (sök i `verifier/slice-4*-*.mjs`), t.ex.:
- passbyggaren: `.block-card`, `#hall-cta-hint`, `.side-panel-slot.is-open .side-panel-frame`, knapp «Hallöversikt»
- admin/delad-bank: `footer .footer-admin-login`, `footer .footer-admin-logout`, `.admin-resend`, `#admin-code-status`, `.admin-area`
- kor-passet: `.run-next`, `.run-left`, `.run-nav`
- autosave: `.save-status`, `.save-status-failed`, `.toast`
Kontrollera varje väljare med grep i `app/src` (AC17). Låsta termer exakt som i PROJECT.md.

## 7. PROJECT.md — ny text för «Verifieringsrecept» (på kodgrenen, inte main)
Ersätt hela avsnittet med:

```markdown
## Verifieringsrecept

Skill: `verify-traningsplaneraren/SKILL.md` i repot (källan), med pekaren `/home/box/agent-data/workflows/verify-traningsplaneraren/SKILL.md`. Funktionskarta: `verify-traningsplaneraren/features/`. Smoke-karta: `verifier/smoke-map.json`.

En gång per box: `bash verifier/tools/install-once.sh`.

1. **Doctor** — `bash verifier/tools/doctor.sh`: verktyg, malldatabas, lediga portar, main-cache för `origin/main`, HTTP 200 på `/traningsplaneringen/`, rätt base, build exit 0. Faller doctor: BLOCKED, aldrig PASS.
2. **Launch** — `npm run build`, preview på port 4173, egen databas `verifier/tools/db-new.sh <run>`.
3. **Drive** — kör appen som tränare via synliga svenska etiketter i 390×844 och 844×390; varje rad i slicens `verification-checklist.md` / låsta A–F får eget PASS/FAIL. Smokes enligt `verifier/tools/pick-smokes.mjs <bas> <head>`, jämförda mot main-cachen.
4. **Evidence** — bevis i `verifier/` + skärmdumpar, bundle gzip mot main, tid per steg; notera blast radius. Stoppa bara den egna processen och ta bort den egna databasen.

Omverifiering: bara FAIL-AC och smokes som berörs av fixen; samma Doctor och isolering.
Hela smoke-loopen: varje söndag 03:00 mot main, och när pick-smokes säger «hela loopen».
Mål: ordinarie ca 20–25 min, omverifiering ca 10 min. Ingen SQL mot det riktiga projektet.
```

## 8. s33 OTP-flaken (D1)
- `verifier/slice-33-builder-smoke.mjs`, AC16-blocket (ca rad 610–640):
  - Byt `tA + 61_500` mot tidsstämpeln i första mejlet (`waitMail`) + 65 000 ms.
  - `waitMail(ADMIN, t1 - 1)`: välj mejlet med högst tidsstämpel efter klicket och kräv att koden skiljer sig från `codeA1`; annars vänta vidare (timeout 15 s).
  - Vid FAIL på AC16d: skriv `slice-33-otp-debug.txt` med GoTrue-loggens rader för `/otp` och `/verify` (utan token-värden), mejlens tidsstämplar och vilken av koderna som skickades till /verify (bara de två sista siffrorna).
- Kör s33 på egen databas (A1), aldrig direkt efter s32 mot samma GoTrue.
- `S32_OTP_EXP` lämnas på 3600 (redan mycket längre än 60 s).
- AC11: 20 körningar. Kvar i 2 av 20 eller fler → `smoke-map.json` markerar AC16d/AC11d `"karantän"`; pick-smokes rapporterar dem som INFO och checklistan för slices som rör inloggning får en manuell rad.

## 9. Veckokörning (F1)
- Skript `verifier/tools/weekly.sh`: Doctor → hela loopen mot main HEAD → `/home/box/tp-verify/weekly/<år>-v<vecka>.md` → diff mot förra filen.
- Rutinen (söndag 03:00 Europe/Stockholm) skapas först efter Christoffers uttryckliga OK. Meddelande i Docs-chatten bara vid nytt FAIL.

## 10. Levande docs och backlog
- `verifier/README.md` (ny eller utökad): kort om `/home/box/tp-verify/`, install-once, Doctor, pick-smokes.
- `verifier/slice-32-local/README.md`: malldatabas och nya standardvägar.
- `backlog/IMPROVEMENTS.md`: post «Snabbare verifiering» → Slice 50.
- Ingen ändring av `SLICE_NUMBER`.

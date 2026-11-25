# Slice 68 — beslut

**Status:** **FASTSTÄLLD** (LÅST 25 nov 2026 13:42). Bas: main @ `0f3be79`. Gren: `slice-68-docs`. Detaljer i `README.md` och `HANDOFF.md`.

Låst: **A1 B1 C1 D2 E1 F1** (D2, inte D1).

| Fråga | Förslag |
|---|---|
| A Lagring | **A1 ★**: ny tabell `public.club_equipment` (en rad, `piece_ids`). Inte `club_templates`-payload, inte Slice 47-nycklarna. Inte ifylld = alla 15 tillgängliga. SQL-fil, körs inte här. |
| B Vem ställer in | **B1 ★**: bara admin, sektion «Föreningens redskap» i Admin. Inte i Förrådslista. |
| C Var visas saknas | **C1 ★**: Redigera redskap, Bygg hallen och utskriftens «Bygg hallen». Biblioteket filtreras inte. Förrådslista oförändrad. |
| D Alternativ | **D2 ★**: bara «Föreningen saknar …» i den här slicen. D1 (Förslag via Lättare/Svårare) är tillval. |
| E Bundle | **E1 ★**: inom +512 B gzip mot `0f3be79`. `SLICE_NUMBER = '68'`. Inget undantag utan hans ja. |
| F Tester | **F1 ★**: enhetstester för hjälpen; coach-GET-smokes tillåter `club_equipment`. |

Avvisat: A2, A3, B2, B3, C2, C3, D1, D3, E2, E3, F2, F3.

**Lås:** Christoffer, 25 nov 2026 13:42 (Europe/Stockholm), reläat ordagrant via Träningsplaneraren - PO:

> «Ja, lås A1 B1 C1 D2 E1 F1»

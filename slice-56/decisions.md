# Slice 56 — beslut

**Låst 2026-10-31 av Christoffer** i PO-chatten, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1».

Den här slicen **utökar** Slice 49 C1 (redskapsförslag fylls i automatiskt efter Planera pass) till «Lägg till» i Teknik. Planera pass ändras inte, och Starta från mall fyller fortfarande inte redskap själv.

| Fråga | Val |
|---|---|
| A | A1 — båda tilläggsvägarna: Passbyggaren → Biblioteket → Lägg till (`handleAddFromDetail`) och Hallöversikt «Lägg till station» (`handleAddStation`); efter `autoPlace*` körs `applyAllSuggestedStationEquipment` på hela passet |
| B | B1 — bara när tillägget landar i Teknik; andra block rörs inte |
| C | C1 — tyst, ingen toast; saknar-raden och Förrådslista uppdateras som efter Planera pass |
| D | D1 — helperns regler som i dag: sparade listor och rensade `[]` rörs inte; nya stationer utan redskap får förslaget |
| E | E1 — Planera pass oförändrat (Slice 49 C1 kvar); Starta från mall oförändrat (ingen automatisk redskapsifyllning vid mallstart) |
| F | F1 — A1–E1, inga nya UI-texter, sidfot Slice 56 (`SLICE_NUMBER` → 56), feature map och tester |

## Svar på öppna frågor
1. Båda tilläggsvägarna (A1).
2. Tyst (C1), ingen toast.
3. Efter Starta från mall fyller första tillägget **alla** stationer utan redskap (Docs ★): hela passet genom `applyAllSuggestedStationEquipment`, samma som Använd alla förslag. **Ingen** `onlyIds`-variant.
4. Samma automatik vid mallstart blir en **egen senare slice**, inte del av 56.

Mjukt bundle-tak cirka +512 B gzip (uppskattning +20–80 B). Inga anrop mot live-projektet.

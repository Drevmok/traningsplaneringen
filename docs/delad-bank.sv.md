# Delad övningsbank — svensk Docs (Slice 31)

**Status:** Docs lock 2026-10-02. Christoffer låste A1 / B2 / C1 / D1 / E1 / F1. Slice 31 använder A1 + D1. Builder får bygga från nycklarna längst ner.  
**Ton:** Varm, kort, tränare till tränare. *Du*. Lugn chrome.  
**Låsta termer:** gymnaster · pass · övning · egen övning · Bibliotek · Teknik · Redskap · Passbyggaren · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Starta från mall · Kom igång

Pack: [`slice-31/`](../slice-31/README.md) · nycklar: [`slice-31/content/microcopy.sv.md`](../slice-31/content/microcopy.sv.md) · vad som sparas var: [`slice-31/content/local-vs-bank.md`](../slice-31/content/local-vs-bank.md) · Christoffers setup: [`slice-31/content/setup-christoffer.md`](../slice-31/content/setup-christoffer.md).  
Närliggande: [`ovningsimport.sv.md`](./ovningsimport.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md).

---

## Kort om den delade banken

Övningarna i Biblioteket kommer nu från en gemensam bank. Christoffer väljer och granskar övningarna där. Alla tränare ser samma bank.

När Christoffer lägger till eller rättar en övning ser du det nästa gång appen får kontakt med banken. Du behöver inte göra något.

Du loggar inte in, och du kan bara läsa i banken. Ingenting du gör i appen skickas dit.

---

## Vad ändras för dig

Nästan ingenting. Samma kort, samma ordning, samma övningsvy och samma Golvklart. Pass och mallar fungerar som förut.

---

## Var kommer övningarna ifrån?

| Det här | Kommer från | Vem kan ändra |
|---|---|---|
| Övningarna i Biblioteket | Den delade banken | Christoffer |
| Dina egna övningar | Den här webbläsaren | Du |
| Dina pass, utkast, mallar, tips och hallen | Den här webbläsaren | Du |

Dina egna övningar stannar på din enhet. De laddas aldrig upp till banken. Egna övningar som ligger i ett pass följer med när du skickar passet till telefonen, som förut.

---

## När nätet strular

Appen väntar aldrig på banken.

1. När du öppnar appen visar den direkt de övningar den sparade senast.
2. Sedan hämtar den nyheter från banken i bakgrunden. Kommer de fram byts korten ut där de ligger. Det du håller på med ligger kvar.
3. Kommer appen inte fram, till exempel med dåligt wifi i hallen, fortsätter du med de sparade övningarna. Då står det en grå rad i Biblioteket:

   *Visar sparade övningar. Du kan planera som vanligt.*

4. Har appen aldrig fått kontakt med banken på den här enheten använder den övningarna som är inbyggda i appen.

Inget försvinner. Egna övningar, pass och utkast ligger kvar, med eller utan nät.

Sidan behöver nät när du öppnar den. Försvinner nätet efter det kan du planera vidare.

---

## Senare

I en senare slice kan Christoffer rätta och godkänna övningar direkt i appen. För dig som tränare ändras ingenting då heller.

---

## Builder

### Låsta nycklar (spegel av `slice-31/content/microcopy.sv.md`)

**ny (Docs)** = nyckel som Docs lade till. Slice 31 behövde inga nya nycklar.

| Key | Svenska | Visas när |
|---|---|---|
| `bankStale` | Visar sparade övningar. Du kan planera som vanligt. | Bara i Biblioteket, grå och liten, en rad under rubriken. Bara när `bankStatus() === 'stale'` (banken är konfigurerad och hämtningen misslyckades vid den här laddningen). Samma text för sparad kopia och inbyggda övningar |
| `footerSliceLabel` | Träningsplaneraren · Slice 31 | Sidfoten |

### När raden syns

| `bankStatus()` | Text |
|---|---|
| `bundled`, banken avstängd (inga repo-variabler) | Ingen |
| `cached` / `bundled` medan första hämtningen pågår | Ingen. Ingen spinner, inget "laddar" |
| `fresh` | Ingen. Ingen toast. Korten byts på plats |
| `stale` (fel, timeout, `navigator.onLine === false`, 0 giltiga rader) | `bankStale`, tills nästa laddning |

### Vad Builder kopplar

- `bankStale` och footer → Slice 31 i `UI` (`blockMeta.ts`).
- Raden bara i `LibraryPanel`. Inte på Hem, Golvklart, Kör passet, utskrift eller delning.
- Vanlig grå text, inte `role="status"` eller `aria-live`. Det är en lugn notis, ingen varning.
- Ingen laddningstext, inget felmeddelande, ingen knapp för att hämta igen.

### Vad Docs inte äger

- Hämtning, timeout, cache och sanering (`bank.ts`, `bankRow.ts`, `config-pages.md`).
- Databasschemat och seed-filen (`schema-31.sql`, `bank-seed.sql`).
- Slice 32: inloggning, adminläge, Godkänn, Dölj för alla. Docs skriver de texterna när Slice 32 startar.

---

## Rör inte (Slice 22–30)

Ändra inte strängarna eller beteendet i:

- **Slice 22** tystare chrome: Tips om placering · Dölj tips · Visa steg · Dölj steg — [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md)
- **Slice 23** Hem: Hallöversikt / Golvklart som sekundära knappar, Öppna på telefon — [`copy-home-polish.sv.md`](./copy-home-polish.sv.md)
- **Slice 24** Förrådslista tom → Använd alla förslag på hallen — [`forrad-empty-soft-path.sv.md`](./forrad-empty-soft-path.sv.md)
- **Slice 25** {n} stationer saknar redskap — [`saknar-redskap-banner.sv.md`](./saknar-redskap-banner.sv.md)
- **Slice 26** Kom igång, placeringssteget — [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md)
- **Slice 27** Soft Samling i Nytt pass — [`soft-samling.sv.md`](./soft-samling.sv.md)
- **Slice 28** Mall-Samling inom budget — [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md)
- **Slice 29** Planera pass, tre frågor, Nytt pass och Starta från mall som sekundära — [`home-wizard.sv.md`](./home-wizard.sv.md)
- **Slice 30** Övningsimport: Importera övningar, Behöver granskas, Markera som granskad, Källa, de 15 redskapen, 100 egna övningar — [`ovningsimport.sv.md`](./ovningsimport.sv.md)

Också oförändrat: övningarnas titlar och texter (de kommer nu från banken men är desamma), Slice 10-raden **Sparas lokalt i webbläsaren — inte i molnet.** (gäller fortfarande utkasten), Golvklart, stationskort, Kör passet och bildtexten **Schematisk hall — inte exakt mått**.

---

## Skicka inte

- Orden Supabase, databas, server, cache, offline eller synk i appens gränssnitt.
- En laddningsindikator, toast eller felruta för banken.
- Inloggning eller konton för tränare.
- Text om Slice 32 (admin, Godkänn, Dölj för alla) i coachvyn.

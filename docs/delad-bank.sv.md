# Delad övningsbank — svensk Docs (Slice 31 + 32)

**Status:** Slice 31 Docs lock 2026-10-02 · Slice 32 Docs lock 2026-10-03. Christoffer låste A1 / B2 / C1 / D1 / E1 / F1. Slice 31 använder A1 + D1, Slice 32 använder B2 + C1 + E1 + F1. Builder får bygga från nycklarna längst ner.  
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
| Övningarna i Biblioteket | Den delade banken | Några få admins (först Christoffer) |
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

## Vem sköter banken

Några få admins sköter den delade banken. Först ut är Christoffer. En admin loggar in med en länk i mejlen och kan rätta, godkänna och dölja övningar direkt i appen.

För dig som tränare ändras ingenting. Du behöver inget konto och loggar inte in. Biblioteket ser ut som förut.

- **Nya övningar** syns först när en admin har godkänt dem. Innan dess finns de inte i ditt Bibliotek.
- **En rättad övning** ser du nästa gång appen får kontakt med banken.
- **En dold övning** försvinner ur Biblioteket för alla tränare. Har du den redan i ett pass ligger den kvar där med samma text som förut. Samma sak i mallarna och i Planera pass.

Längst ner i appen står det **Logga in som admin**. Den länken är bara för admins. Du kan låta den vara.

---

## För admins

Kort guide för den som står på admin-listan.

1. **Logga in.** Tryck **Logga in som admin** längst ner, skriv din e-post och tryck **Skicka länk**. Öppna länken i mejlet i samma webbläsare. Den gäller i en timme. På iPhone: gör adminjobbet i Safari, inte i appen på hemskärmen.
2. **Godkänn nya stationer.** I Biblioteket finns filtret **Väntar på godkännande**. Öppna övningen, läs igenom den och tryck **Godkänn**. Då ser alla tränare den nästa gång de öppnar appen.
3. **Rätta en text.** Tryck **Ändra i banken**, ändra och tryck **Spara i banken**. Ändringen syns för alla tränare.
4. **Granska.** Filtret **Behöver granskas** visar övningar som ingen har läst igenom än. Tryck **Markera som granskad** när texten stämmer. En sparad ändring räknas också som granskad.
5. **Dölj för alla.** Tar bort övningen ur Biblioteket för alla. Inget raderas. Under filtret **Dolda** hittar du den igen och kan trycka **Visa igen**.
6. **Logga ut** längst ner när du är klar, särskilt på en lånad telefon eller dator.

Längst ner i varje övning står vem som ändrade den senast och när. Ändringar kräver nät.

---

## Builder

### Låsta nycklar (spegel av `slice-31/content/microcopy.sv.md`)

**ny (Docs)** = nyckel som Docs lade till. Slice 31 behövde inga nya nycklar. Alla villkor för Slice 32 står i `microcopy.sv.md` § Slice 32.

| Key | Svenska | Visas när |
|---|---|---|
| `bankStale` | Visar sparade övningar. Du kan planera som vanligt. | Bara i Biblioteket, grå och liten, en rad under rubriken. Bara när `bankStatus() === 'stale'` (banken är konfigurerad och hämtningen misslyckades vid den här laddningen). Samma text för sparad kopia och inbyggda övningar |
| `footerSliceLabel` | Träningsplaneraren · Slice 31 | Sidfoten (Slice 31) |

### När raden syns

| `bankStatus()` | Text |
|---|---|
| `bundled`, banken avstängd (inga repo-variabler) | Ingen |
| `cached` / `bundled` medan första hämtningen pågår | Ingen. Ingen spinner, inget "laddar" |
| `fresh` | Ingen. Ingen toast. Korten byts på plats |
| `stale` (fel, timeout, `navigator.onLine === false`, 0 giltiga rader) | `bankStale`, tills nästa laddning |

### Slice 32 — admins (Docs final 2026-10-03)

Bara admins ser de här texterna. En tränare som inte är inloggad ser bara `adminLoginLink` i sidfoten.

**Sidfot**

| Key | Svenska | Visas när |
|---|---|---|
| `footerSliceLabel` | Träningsplaneraren · Slice 32 | Sidfoten (Slice 32) |
| `adminLoginLink` | Logga in som admin | Sidfoten, grå länk. Ingen är inloggad. Enda vägen till inloggningen |
| `adminBadge` | Admin | Sidfoten när en admin är inloggad (`· Admin · Logga ut`), och som chip vid rubriken Bibliotek |
| `adminLogout` | Logga ut | Sidfoten när någon är inloggad. Loggar ut direkt, ingen fråga, ingen toast |
| `adminNotAdmin` | Du är inloggad men inte admin. | Sidfoten, grå, när e-posten inte står på admin-listan. Följs av `adminLogout`. Inget adminläge |

**Inloggning**

| Key | Svenska | Visas när |
|---|---|---|
| `adminLoginTitle` | Logga in som admin | Rubrik i inloggningen |
| `adminLoginHint` | Skriv din e-post så skickar vi en inloggningslänk. | Under rubriken, också fältets hjälptext |
| `adminEmailLabel` | E-post | Fältets etikett. Ingen platshållartext |
| `adminSendLink` | Skicka länk | Huvudknapp |
| `adminLinkSent` | Om adressen hör till en admin kommer en länk strax. Öppna den i den här webbläsaren. Den gäller i en timme. | Efter skicka. Samma text för alla adresser |
| `adminWait` | Vänta en stund innan du ber om en ny länk. | För många länkar på kort tid |
| `adminSendFailed` **ny (Docs)** | Kunde inte skicka länken. Kolla nätet och försök igen. | Bara när begäran inte kom fram (nätfel, timeout, 5xx) |
| `adminLinkFailed` | Länken fungerar inte längre. Be om en ny. | Tillbaka från mejlet och länken gick inte att använda. Inloggningen öppnas med raden ovanför formuläret |
| `adminCloseAria` | Stäng inloggningen | ×-knappens `aria-label` |

**Adminläge i Biblioteket och i övningen**

| Key | Svenska | Visas när |
|---|---|---|
| `adminFilterPending` | Väntar på godkännande ({n}) | Filterchip, döljs när n = 0 |
| `adminFilterReview` | Behöver granskas ({n}) | Filterchip, döljs när n = 0 |
| `adminFilterHidden` | Dolda ({n}) | Filterchip, döljs när n = 0 |
| `adminPendingBadge` | Väntar | Märke på kort och i övningen (väntande) |
| `adminPendingBadgeAria` **ny (Docs)** | Väntar på godkännande | `aria-label` / `title` på märket Väntar |
| `adminHiddenBadge` | Dold | Märke på kort och i övningen (dolda) |
| `adminApprove` | Godkänn | Bara väntande |
| `adminApproved` | Godkänd. Tränarna ser den nästa gång de öppnar appen. | Toast |
| `adminEdit` | Ändra i banken | Alla tre lägen |
| `adminHide` | Dölj för alla | Bara publicerade |
| `adminUnhide` | Visa igen | Bara dolda |
| `adminUnhidden` | Syns igen för alla. | Toast |
| `adminReviewHint` | Läs igenom texten. Markera som granskad när den stämmer. | Över `markReviewed` på bankövningar som behöver granskas |
| `adminLastChanged` | Senast ändrad {datum} av {vem} | Grå rad längst ner. `{vem}` = adminens e-post, `Planner` för `bot:planner` |
| `adminLastChangedFirst` **ny (Docs)** | Oförändrad sedan {datum} | Samma plats, när `updated_by` = `seed-script` |
| `adminLastChangedNoWho` **ny (Docs)** | Senast ändrad {datum} | Samma plats, när `updated_by` saknas eller är `service` |
| `adminOffline` | Du behöver nät för att ändra i banken. | Över adminknapparna när enheten saknar nät. Knapparna är avstängda |

`{datum}` = `2 okt` (gemener, ingen punkt). Med år när det inte är i år: `2 okt 2025`.

**Dölj, formulär och fel**

| Key | Svenska | Visas när |
|---|---|---|
| `adminHideConfirm` | Dölja ”{title}” för alla tränare? Pass som redan har övningen visar den fortfarande. | Frågan innan döljning |
| `adminHideUsedIn` | Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras. | Extra rad när id:t finns i `seedTemplates` / `wizardPaths` |
| `adminCancel` **ny (Docs)** | Avbryt | Frågan och formuläret |
| `adminHideConfirmYes` | Dölj | Frågans knapp |
| `adminHidden` | Dold för alla. | Toast |
| `adminFormTitle` | Ändra övning i banken | Formulärets rubrik |
| `adminFormSourceUrl` | Källa — länk | Fält |
| `adminFormSourceCreator` | Källa — kanal | Fält, krävs när det finns en länk |
| `adminFormSourceTime` | Starttid (m:ss) | Fält, frivilligt |
| `adminFormExperienced` | Bara för erfarna ledare | Kryssruta |
| `adminFormHint` | Ändringen syns för alla tränare. | Grå, precis ovanför knapparna |
| `adminFormSave` | Spara i banken | Huvudknapp |
| `adminSaved` | Sparat i banken. | Toast |
| `adminSaveConflict` | Någon annan har ändrat övningen. Stäng och öppna den igen. | Ingen rad uppdaterades (gammal `updated_at`) |
| `adminSaveFailed` | Kunde inte spara. Kolla nätet och försök igen. | Nätfel, timeout, 4xx, 5xx |

Felen gäller alla adminändringar (Godkänn, Dölj, Visa igen, Markera som granskad, Spara i banken). De visas under knapparna, inte som toast. Formuläret behåller det du skrev.

### Vad Builder kopplar

- `bankStale` och footer → Slice 31 i `UI` (`blockMeta.ts`).
- Raden bara i `LibraryPanel`. Inte på Hem, Golvklart, Kör passet, utskrift eller delning.
- Vanlig grå text, inte `role="status"` eller `aria-live`. Det är en lugn notis, ingen varning.
- Ingen laddningstext, inget felmeddelande, ingen knapp för att hämta igen.
- Slice 32-nycklarna och footer → Slice 32 i `UI`. Adminchrome bara när `useAdmin()` är `admin` (`adminNotAdmin` och `adminLogout` även vid `notAdmin`).
- Toasts med `role="status"`, som i Slice 30. Fel inline under knapparna.

### Vad Docs inte äger

- Hämtning, timeout, cache och sanering (`bank.ts`, `bankRow.ts`, `config-pages.md`).
- Databasschemat och seed-filen (`schema-31.sql`, `bank-seed.sql`).
- Slice 32: inloggningsflödet, sessionen, behörigheter och botens nyckel (`schema-32.sql`, `bot-writes.md`). Docs äger bara orden.

---

## Rör inte (Slice 22–31)

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
- **Slice 31** Delad bank: `bankStale` (Visar sparade övningar. Du kan planera som vanligt.) — se ovan

Också oförändrat: övningarnas titlar och texter (de kommer nu från banken men är desamma), Slice 10-raden **Sparas lokalt i webbläsaren — inte i molnet.** (gäller fortfarande utkasten), Golvklart, stationskort, Kör passet och bildtexten **Schematisk hall — inte exakt mått**.

---

## Skicka inte

- Orden Supabase, databas, server, cache, offline eller synk i appens gränssnitt.
- En laddningsindikator, toast eller felruta för banken.
- Inloggning eller konton för tränare.
- Adminchrome (chip, filter, märken, Godkänn, Dölj för alla, Senast ändrad) i coachvyn. Tränare ser bara `adminLoginLink`.
- En knapp som raderar övningar ur banken.
- Utropstecken.

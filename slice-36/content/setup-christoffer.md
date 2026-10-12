# Slice 36 setup — vad Christoffer gör själv (~10 min)

**Läs först:** ingen annan kör de här filerna åt dig. Docs och Builder har inte kört dem. Titta igenom dem, säg OK till Planner och klistra sedan in dem själv. Gör det innan Builders PR slås ihop.

**Vad det gör:** skapar en ny lista, `club_templates`, i samma Supabase-projekt som övningsbanken (`fhzqwbdlejzohetdoluw`). Alla kan läsa de mallar som syns. Bara ni två admins kan publicera, ersätta, dölja och visa igen. Ingen kan radera. Inget befintligt ändras.

Du behöver bara din Supabase-inloggning. Inga nycklar, inget att klistra in i chatten.

## Steg 13. Klistra in föreningens mallar

1. Logga in på supabase.com och öppna projektet **fhzqwbdlejzohetdoluw**.
2. Öppna **SQL Editor** i vänstermenyn och klicka **New query**.
3. Öppna [`sql/36-01-table.sql`](../sql/36-01-table.sql), kopiera **allt** och klistra in. Klicka **Run**. Det ska stå **Success. No rows returned**.
4. Klicka **New query** igen. Gör samma sak med [`sql/36-02-rls-grants.sql`](../sql/36-02-rls-grants.sql). Även här: **Success. No rows returned**.
5. Klicka **New query** en sista gång och kör [`sql/36-03-smoke.sql`](../sql/36-03-smoke.sql). Den ändrar ingenting, den bara kontrollerar. Du ska få åtta rader där **ok** är **true** på alla.
6. Öppna **Advisors** → **Security Advisor** och klicka **Rerun linter**. Inga nya röda rader om `club_templates` ska finnas.

Får du ett fel eller en rad med **false**: kör inget mer, ta en skärmbild och skicka den till Planner. Det går bra att köra filerna igen, de är gjorda för det.

Säg till Planner **"Föreningsmallar klara"**.

## Efteråt

- Du publicerar från ett öppet pass: **Logga in som admin** → **Publicera som föreningsmall**.
- Vill du ändra en mall: ändra passet och publicera igen med samma namn. Appen frågar innan den ersätter.
- **Dölj för alla** gömmer en mall. **Visa igen** tar tillbaka den. Inget försvinner på riktigt.
- Ny admin läggs till som i Slice 32 steg 9 (bara i SQL Editor).

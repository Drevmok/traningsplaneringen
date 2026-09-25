# Slice 01 — tomma tillstånd och tips i appen (svenska)

Status: Klar för Builder att koppla in  
Källa: `/workspace/gymnastics-planner/slice-01/` + engelska `slice-01-empty-states.md`  
Målgrupp: helt nya tränare

Fältnamn i UI: **Sammanfattning** · **Så gör du** · **Se upp för**

Blocknamn (använd exakt): Samling · Uppvärmning · Teknik · Styrka · Lek och spel

**Terminologi (låst av Christoffer):** använd **gymnaster** (inte aktiva/elever) och **pass** (inte session) i all Slice 01-svenska. Engelska lånord i gymmet (hollow, jumping jacks m.m.) får vara kvar.

---

## Toppbar (passbyggaren)

**Hjälpläge (diskret):** Ny som tränare? Börja från en mall

**CTA-etiketter:** Spara utkast · Använd mall · Exportera / dela (stub ok)

---

## Tomma block — tips (krävs: ett per blocktyp)

Visa tipset + en tydlig Lägg till-åtgärd på varje tomt block. Primär CTA: **Lägg till övning**. Valfri sekundär: **Bläddra bland idéer** (öppnar biblioteket filtrerat till det blocket).

### Samling
**Tips:** Få allas uppmärksamhet och sätt tonen innan ni börjar med färdigheter.  
**Lägg till-etikett:** Lägg till din första samlingsövning  
**Primär knapp:** Lägg till övning  
**Sekundär (valfri):** Bläddra bland idéer

### Uppvärmning
**Tips:** Väck kroppen mjukt så att gymnasterna är redo.  
**Lägg till-etikett:** Lägg till din första uppvärmning  
**Primär knapp:** Lägg till övning  
**Sekundär (valfri):** Bläddra bland idéer

### Teknik
**Tips:** Välj några färdigheter — kvalitet före kvantitet.  
**Lägg till-etikett:** Lägg till din första teknikövning  
**Primär knapp:** Lägg till övning  
**Sekundär (valfri):** Bläddra bland idéer

### Styrka
**Tips:** Håll det kort och tydligt så att tekniken håller.  
**Lägg till-etikett:** Lägg till din första styrkeövning  
**Primär knapp:** Lägg till övning  
**Sekundär (valfri):** Bläddra bland idéer

### Lek och spel
**Tips:** Avsluta glädjefyllt så att de vill komma tillbaka.  
**Lägg till-etikett:** Lägg till ditt första spel  
**Primär knapp:** Lägg till övning  
**Sekundär (valfri):** Bläddra bland idéer

---

## Tips-fliken (blocknivå — korta tränartips)

Visa när ett block är valt:

| Block | Tips |
| --- | --- |
| Samling | Samla i cirkel, ta ögonkontakt och säg vad dagens pass handlar om — i en mening. |
| Uppvärmning | Börja lugnt, höj sedan energin. Ser någon stel eller kylig ut? Ge en runda till. |
| Teknik | Nämn färdigheten, visa en gång, låt dem sedan prova. Ge en cue i taget. |
| Styrka | Håll koll på knän, rygg och andning. Avbryt setet tidigt om formen faller isär. |
| Lek och spel | Tydliga regler, korta rundor, fira ansträngning. Säkerhet gäller även när det är kul. |

---

## Aktivitetsdetalj — sektionsrubriker

Använd exakt:

- **Sammanfattning**
- **Så gör du**
- **Se upp för**

**Knappar:** Lägg till i valt block · Lägg till och ändra tid

---

## Mjuk varning (fel blocktyp)

**Meddelande:** Den här övningen används vanligtvis i {intendedBlock}. Du kan ändå lägga till den här.

*(Blocknamn i platshållaren: Samling / Uppvärmning / Teknik / Styrka / Lek och spel.)*

---

## Mall — bekräftelsedialog

**Titel:** Ersätta det här passet?  
**Brödtext:** Om du börjar från en mall ersätts blocken och övningarna du har nu. Dina sparade utkast finns kvar.  
**Bekräfta:** Använd mall  
**Avbryt:** Fortsätt redigera

---

## Builder-platshållare (tills copy kopplats)

```
[Docs: empty-state — gathering]
[Docs: empty-state — warmup]
[Docs: empty-state — techniques]
[Docs: empty-state — strength]
[Docs: empty-state — fun_and_games]
[Docs: tips-tab — {blockType}]
[Docs: topbar-help]
```

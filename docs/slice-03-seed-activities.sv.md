# Slice 03 — seed-aktiviteter (svenska, coach-ägda)

**Källa:** Intervju med Christoffer (2026-09-23/24) — `slice-03/drills-from-interview.md`  
**Status:** Riktiga klubbövningar för truppgymnastik. Alla poster har `stub: false`.  
**Terminologi (låst):** **gymnaster** (inte aktiva/elever) och **pass** (inte session). Engelska lånord (hollow, burpee, EMOM m.m.) är ok.  
**Erfaren ledare endast:** `tech-rondat-flickis`, `tech-salto-fran-hojd` (`experiencedCoachOnly: true`, `newCoachOk: false`).  
**Ersätter:** Slice 01 Utkast-stubbar i bibliotekets UI — Builder mappar dessa id:n in i seed.

| Block | Antal |
| --- | ---: |
| Samling (`samling`) | 3 |
| Uppvärmning (`uppvärmning`) | 5 |
| Teknik (`teknik`) | 9 |
| Styrka (`styrka`) | 3 |
| Lek (`lek`) | 8 |
| **Totalt** | **28** |

---

## Samling (3)

### gather-valkomstcheck-in
- **block:** `samling`
- **title:** Välkomstcheck-in
- **durationMinutes:** 5
- **summary:** Välkomna gruppen och kolla hur veckan har varit — kort, inkluderande start på passet.
- **howTo:**
  1. Samla gymnasterna så alla syns och hör.
  2. Hälsa alla; modellera ett kort svar själv.
  3. Kort runda: hur mår ni / hur har veckan varit?
  4. Tacka och gå vidare innan det blir långt.
- **watchFor:** Enskilda monologer som äter tiden; se till att tysta gymnaster också får plats — utan press att prata.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### gather-narvaro
- **block:** `samling`
- **title:** Närvaro
- **durationMinutes:** 3
- **summary:** Bocka av listan så att alla som ska vara där är på plats.
- **howTo:**
  1. Ta fram närvarolistan innan gruppen sprider sig.
  2. Markera närvarande/frånvarande.
  3. Följ upp saknade enligt klubbens rutin.
- **watchFor:** Glöm inte avvikande namn och nya gymnaster; lämna inte gruppen utan uppsikt medan du bara stirrar i listan.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false
- **needsCoachReview:** true

### gather-dagens-teknik
- **block:** `samling`
- **title:** Dagens teknik — snabb genomgång
- **durationMinutes:** 3
- **summary:** Kort genomgång av dagens huvudteknik innan uppvärmning och träning.
- **howTo:**
  1. Säg dagens fokusfärdighet i enkla ord.
  2. Visa kort eller peka ut vad ni ska sikta på.
  3. Spara djup coaching till Teknik-blocket.
- **watchFor:** För lång teori — håll det till ”vad + varför idag”, inte hela övningen.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false
- **needsCoachReview:** true

---

## Uppvärmning (5)

### warm-hall-varv
- **block:** `uppvärmning`
- **title:** Uppvärmningsvarv (hallen runt)
- **durationMinutes:** 10
- **summary:** Rörligt varv i hallen med löpning och grundfärdigheter — väcker kroppen inför tekniken.
- **howTo:**
  1. Led varvet i lagom fart runt hallen.
  2. Växla typiskt: springa, springa baklänges, ljusstakar fram/bak, kullerbytta framåt/bakåt, hjulning vänster och höger, bear walk, handstand, handstand till hopkrupen, crocodile walk, kaninhopp.
  3. Anpassa vilka delar som är med efter nivå och dag.
  4. Håll kö och avstånd så ingen springer in i nästa.
- **watchFor:** Utrymme och krockar; handstand och bakåtkullerbytta kräver madrass/uppsikt — tvinga inte max om tekniken inte sitter. Hjulning: båda sidorna; kolla axlar och handleder.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false
- **needsCoachReview:** true

### warm-uppvarmningsdans
- **block:** `uppvärmning`
- **title:** Uppvärmningsdans
- **durationMinutes:** 6
- **summary:** Dansuppvärmning som rör hela kroppen — rörlighet och glädje, inte maxpuls.
- **howTo:**
  1. Sätt på musik.
  2. Led eller använd en känd uppvärmningsdans.
  3. Sikta på axlar, höfter, rygg, ben och koordination.
  4. Erbjud en enklare, mindre ”scenisk” variant åt den som behöver.
- **watchFor:** För vilda hopp på hårt golv; ge alternativ för den som inte vill dansa sceniskt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### warm-123-voltpositioner
- **block:** `uppvärmning`
- **title:** 1-2-3 (voltpositioner)
- **durationMinutes:** 4
- **summary:** Positionerna 1, 2 och 3 inför framåtvolt / frivolt-arbete — kort formträning utan full volt.
- **howTo:**
  1. Gå igenom de tre positionerna ni använder i klubben för framåtvolt.
  2. Låt gymnasterna öva dem rytmiskt, samma språk varje gång.
  3. Håll det kort — ingen full volt i uppvärmningen om ni bara övar formerna.
- **watchFor:** Tydlighet i språket så alla menar samma position; ingen full volt här om målet bara är formerna.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false
- **needsCoachReview:** true

### warm-tojning-gymnaster
- **block:** `uppvärmning`
- **title:** Töjning — gymnasterna leder
- **durationMinutes:** 5
- **summary:** Töjning där gymnaster leder varandra eller gruppen — ansvar och igenkända stretch.
- **howTo:**
  1. Utse ledare (rotera mellan passen).
  2. De visar töjningar ni redan kan.
  3. Coachen backar upp säkerhet och tid.
- **watchFor:** Ojämn kvalitet — rätta farliga vinklar; ingen ”press” djupare än behagligt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### warm-tojning-coach
- **block:** `uppvärmning`
- **title:** Töjning — coach leder
- **durationMinutes:** 5
- **summary:** Coachledd töjning efter eller mitt i uppvärmningen — lugn, förutsägbar stretch.
- **howTo:**
  1. Led ett kort stretchprogram (ben, höftböjare, axlar, handleder efter behov).
  2. Andas lugnt; håll ca 15–30 s per sida där det passar.
  3. Håll samma ordning så gruppen känner igen flödet.
- **watchFor:** Studsande stretch; smärta ≠ ”bra”; anpassa för hypermobila gymnaster.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

---

## Teknik (9)

### tech-ljushopp-satsbrada
- **block:** `teknik`
- **title:** Ljushopp på satsbräda
- **durationMinutes:** 6
- **summary:** Ljushopp från satsbräda — grundstuds och hoppteknik med fokus på timing, inte höjd först.
- **howTo:**
  1. Visa sats → bräda → ljushopp med kontrollerad landning.
  2. En i taget; tydlig kö.
  3. Cue: timing och rak kropp före höjd.
- **watchFor:** Fel fotisättning på brädan; landning bakom/framför mattan; köhållning så ingen springer in för tidigt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### tech-ljushopp-trampett
- **block:** `teknik`
- **title:** Ljushopp på trampett
- **durationMinutes:** 6
- **summary:** Ljushopp på trampett — tydlig ansats, studs i mitten, sträckt hopp och mjuk landning.
- **howTo:**
  1. Visa tydlig ansats och studs i mitten av trampetten.
  2. Sträckt ljushopp, mjuk landning.
  3. En i taget; vänta tills landningen är klar.
- **watchFor:** Ansats för lång/snabb; studs nära kanten; landning utan madrasskydd där det behövs.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### tech-satsbrada-volt-rygg
- **block:** `teknik`
- **title:** Satsbräda volt till rygg
- **durationMinutes:** 9
- **summary:** Volt från satsbräda till landning på rygg — progressiv volt med madrass.
- **howTo:**
  1. Säkerställ madrass som räcker bakåt innan första försöket.
  2. Satsbräda → rotation → landning på rygg.
  3. Bygg från kortare rotation innan fullare volt; spotta efter nivå.
  4. En i taget.
- **watchFor:** För lite rotation (nacke/huvud); för mycket höjd utan kontroll; madrassen måste räcka bakåt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### tech-trampett-volt-mattberg
- **block:** `teknik`
- **title:** Trampett volt upp på mattberg
- **durationMinutes:** 9
- **summary:** Volt från trampett upp på mattberg — progressiv höjd och rotation.
- **howTo:**
  1. Kolla att mattberget är stabilt och högt nog.
  2. Ansats → trampett → volt → landning högt på mattberg.
  3. Progressera höjd/rotation efter nivå.
  4. En i taget; nästa väntar tills landningen är klar.
- **watchFor:** Mattberg som tippar eller är för lågt; underrotation; att nästa gymnast startar för tidigt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### tech-rondat-flickis
- **block:** `teknik`
- **title:** Rondat–flickis
- **durationMinutes:** 10
- **summary:** Rondat till flickis (bakåtväxel / flic-flac) — endast med erfaren ledare och aktiv spotting.
- **howTo:**
  1. Endast när erfaren ledare leder och spotttar.
  2. Progressera från bekanta delar innan hela kedjan.
  3. Spotting aktivt under hela setet.
  4. Avbryt om tekniken fallerar.
- **watchFor:** Handplacering, axellinje, underrotation, nacke. Avbryt om tekniken fallerar under setet.
- **newCoachOk:** false
- **experiencedCoachOnly:** true
- **watchForRequired:** true
- **stub:** false

### tech-flickis-kudde
- **block:** `teknik`
- **title:** Flickis med flickiskudde
- **durationMinutes:** 9
- **summary:** Flickis med flickiskudde som stöd — känna bakåtrörelsen innan fri flickis.
- **howTo:**
  1. Placera kudden enligt klubbens metod.
  2. Låt gymnasten känna bakåtrörelsen med stöd.
  3. Progressera mot friare flickis när formen sitter.
- **watchFor:** Kudden rätt placerad; inte ”kasta” bakåt utan aktivt handstöd från gymnasten där metoden kräver det.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### tech-falla-bakat-hojd
- **block:** `teknik`
- **title:** Falla bakåt från höjd till rygg
- **durationMinutes:** 6
- **summary:** Kontrollerad fall bakåt från höjd till landning på rygg — trygghet inför bakåtmoment.
- **howTo:**
  1. Använd plint/höjd som klubben brukar; tjock och lång madrass bakom.
  2. Falla bakåt till rygg med teknikfokus.
  3. Bygg trygghet stegvis — ingen ”vem vågar högst”-lek.
- **watchFor:** Huvudet får inte ta emot; madrass tillräckligt tjock/lång; ingen höjdtävling utan teknikfokus.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### tech-salto-fran-hojd
- **block:** `teknik`
- **title:** Salto från höjd
- **durationMinutes:** 9
- **summary:** Salto från höjd (fullare voltmoment) — endast med erfaren ledare, spotting och rätt uppbyggnad.
- **howTo:**
  1. Endast med erfaren ledare och rätt progression bakom.
  2. Spotting och madrassuppställning före första försöket.
  3. En i taget; stoppa tidigt vid osäkra försök.
- **watchFor:** Under-/överrotation; landningszon; trötthet i kön. Stoppa tidigt vid osäkra försök.
- **newCoachOk:** false
- **experiencedCoachOnly:** true
- **watchForRequired:** true
- **stub:** false

### tech-handstaende-falla-rygg
- **block:** `teknik`
- **title:** Handstående falla till rygg
- **durationMinutes:** 6
- **summary:** Från handstående, kontrollerad fall till rygg — öppning och trygg bakåtlandning.
- **howTo:**
  1. Lägg madrass bakom innan någon går upp i handstående.
  2. Handstående (mot vägg eller fri enligt nivå) → tippa/falla till rygg.
  3. Cue öppning och mjuk landning på rygg.
- **watchFor:** Huvud/nacke; axlar som kollapsar; madrass bakom måste finnas innan de går upp.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

---

## Styrka (3)

### strength-cirkeltraning
- **block:** `styrka`
- **title:** Cirkelträning (par, stationer)
- **durationMinutes:** 12
- **summary:** Cirkel med flera stationer; gymnaster går runt i par — teknik före tempo.
- **howTo:**
  1. Sätt 4–8 stationer med lagom avstånd.
  2. Visa varje station kort innan start.
  3. 30 s arbete, 20 s vila/byte; jobba i par.
  4. Håll tiden tydligt (timer eller musiksignal).
- **watchFor:** Stationer för tätt; teknik före tempo; anpassa så nybörjare inte tar skadliga genvägar.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### strength-burpee-emom
- **block:** `styrka`
- **title:** Burpee-challenge (EMOM)
- **durationMinutes:** 8
- **summary:** Burpees EMOM (every minute on the minute) — tydlig nivå och tillåtna regressioner.
- **howTo:**
  1. Visa korrekt burpee först.
  2. Varje minut: bestämt antal (eller max under resten av minuten enligt vald variant).
  3. Vila till nästa minutstart; sätt nivå efter gruppen.
  4. Tillåt step-back / utan hopp när formen faller.
- **watchFor:** Ojämn form när de blir trötta (höfter sjunker, hopp blir slarviga); erbjud regression tidigt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### strength-styrkelatar
- **block:** `styrka`
- **title:** Styrkelåtar (Sally, Thunderstruck, Gimme Gimme, jägarvila)
- **durationMinutes:** 5
- **summary:** Styrka till kända låtar — t.ex. Sally, Thunderstruck, Gimme Gimme Gimme eller jägarvila hela låten.
- **howTo:**
  1. Välj en låt (en eller två räcker ofta i ett pass).
  2. Förklara rörelsen innan musiken startar.
  3. Synka till refränger/verser enligt klubbrutin (Sally = upp/ner till texten; Thunderstruck = burpee/jump-variation; Gimme = vald styrkeövning; jägarvila = holds hela låten).
- **watchFor:** Knän/hållning i squat; axlar i holds; erbjud knästående/kortare hold. Volym — en eller två låtar räcker ofta.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

---

## Lek (8)

### fun-rundpingis-medicinboll
- **block:** `lek`
- **title:** Rundpingis med medicinboll
- **durationMinutes:** 6
- **summary:** Pingis-/rundspel med medicinboll i stället för vanlig boll — lagom vikt för åldern.
- **howTo:**
  1. Ställ upp cirkel eller er vanliga rundpingis-uppställning.
  2. Välj medicinboll med lagom vikt för åldern.
  3. Sätt tydliga gränser för hur hårt de får kasta.
- **watchFor:** Ansikte/händer — för tung boll eller hårda kast; anpassa bollvikt.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### fun-hojdhopp
- **block:** `lek`
- **title:** Höjdhopp (lek)
- **durationMinutes:** 6
- **summary:** Lekfullt höjdhopp över ribba eller mjuk höjd — höj stegvis med trygg landning.
- **howTo:**
  1. Sätt en säker ”ribba” (elastiskt band, moppskaft på koner eller mjuka mattor).
  2. En i taget eller stafettvariant.
  3. Höj stegvis; landning i mjuk zon.
- **watchFor:** Landning på två fötter i mjuk zon; ingen hård ribba i ansiktshöjd; köordning.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### fun-stafett
- **block:** `lek`
- **title:** Stafett
- **durationMinutes:** 8
- **summary:** Klassisk stafett — lag, sträcka och växling med fair start.
- **howTo:**
  1. Dela lag.
  2. Bestäm bana och vad som bärs/görs vid växling.
  3. Demonstrera en gång; fair start.
- **watchFor:** Hala golv i kurvor; krockar i växling; håll banan fri från redskap.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### fun-123-forflyttning
- **block:** `lek`
- **title:** 1-2-3 (förflyttningslek)
- **durationMinutes:** 4
- **summary:** Förflyttningslek: 1 = den framför går bak, 2 = den bak går fram, 3 = spring — skilt från voltpositionernas 1-2-3.
- **howTo:**
  1. Ställ gymnasterna i led/par enligt er uppställning.
  2. Ropa 1, 2 eller 3.
  3. 1: personen längst fram flyttar sig längst bak. 2: personen längst bak flyttar sig längst fram. 3: alla springer (t.ex. till linje och tillbaka).
- **watchFor:** Krockar vid 3; tydliga gränser i hallen.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false

### fun-maffia
- **block:** `lek`
- **title:** Maffia
- **durationMinutes:** 10
- **summary:** Maffia-lek (social/rollek) enligt klubbens variant — håll det kort och åldersanpassat.
- **howTo:**
  1. Använd er vanliga Maffia-uppsättning (roller, ”natt/dag”, ledare som berättar).
  2. Håll det åldersanpassat; byt roller ofta.
  3. Ingen fysisk ”attack”.
- **watchFor:** Uteslutning/önskan — byt roller ofta; ingen fysisk attack.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **stub:** false
- **needsCoachReview:** true

### fun-handstaende-utmaning
- **block:** `lek`
- **title:** Handstående-utmaning
- **durationMinutes:** 5
- **summary:** Lekfull utmaning — håll handstående eller flest kontrollerade försök med bra form.
- **howTo:**
  1. Mot vägg eller med kompisstöd efter nivå; madrass redo.
  2. Mät tid eller antal kontrollerade försök.
  3. Belöna form, inte bara ”vågat”; tillåt knä/björn-alternativ.
- **watchFor:** Fall utan madrass; nacke; tävlingshets som ger slarviga uppsättningar.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### fun-huvudstaende-utmaning
- **block:** `lek`
- **title:** Stå-på-huvud-utmaning
- **durationMinutes:** 5
- **summary:** Huvudstående-utmaning med fokus på trygg upp- och nedgång.
- **howTo:**
  1. Triangelbas, madrass, gärna mot vägg först.
  2. Utmana tid med bra form.
  3. Spotting för dem som är nya.
- **watchFor:** Belastning på nacke/huvud — avbryt vid smärta; aldrig utan madrass; ingen som ”knuffar upp” andra.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

### fun-morkerkurragomma
- **block:** `lek`
- **title:** Mörkerkurragömma
- **durationMinutes:** 10
- **summary:** Kurragömma med dämpad belysning i hallen — tydliga regler innan ljuset skruvas ner.
- **howTo:**
  1. Sätt regler innan mörker: var man får gömma sig, var man inte får (förråd, redskapsskåp, ovanpå plintar som kan tippa), hur man blir tagen, när ljuset tänds.
  2. Behåll nöd-/utgångsljus enligt hallens krav.
  3. Räkna in alla efteråt innan ni lämnar.
- **watchFor:** Fall i mörker; gömställen under tunga redskap; rädsla — erbjud ”ljusvakt”-roll. Räkna in hela gruppen.
- **newCoachOk:** true
- **experiencedCoachOnly:** false
- **watchForRequired:** true
- **stub:** false

---

## Anteckningar för Builder

- Alla 28 poster: `stub: false`. Mappa `block` → appens blocktyp.
- Badge/varning i pickern för `experiencedCoachOnly: true`: `tech-rondat-flickis`, `tech-salto-fran-hojd`.
- Prioritera granskning av `needsCoachReview: true`.
- Skilj tydligt `warm-123-voltpositioner` från `fun-123-forflyttning` i UI (olika titel + id).

## Anteckningar för Verifier

- Räkna: Samling 3 · Uppvärmning 5 · Teknik 9 · Styrka 3 · Lek 8 = 28.
- `experiencedCoachOnly` ska bara finnas på de två teknik-id:na ovan; övriga `false` och typiskt `newCoachOk: true`.
- `watchForRequired: true` förväntas bl.a. på: hall-varv, volt till rygg, trampett-volt mattberg, rondat–flickis, flickis kudde, falla bakåt, salto, handstående falla, handstående-utmaning, huvudstående-utmaning, mörkerkurragömma.
- Terminologi: inga träffar på aktiva/elever/session i coach-copy.

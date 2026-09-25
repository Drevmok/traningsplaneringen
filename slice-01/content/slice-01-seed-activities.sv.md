# Slice 01 — seed-aktiviteter (svenska interim-stubbar)

**Status:** Svenska interim-stubbar; teknikövningar behöver fortfarande Christoffers granskning.  
**Mål:** ~6 aktiviteter per blocktyp (≈30). Struktur enligt `Activity` i `slice-01/data-model.md`.  
**Säkerhet:** Teknikstubbar är konservativa. Christoffer bör granska **Se upp för** innan golvanvändning.

`blockType`-värden (engelska i data): `gathering` | `warmup` | `techniques` | `strength` | `fun_and_games`

### Säkerhetshåll — ersatta id:n (inte i seed-UI)

Dessa tre id:n från den engelska katalogen **hålls kvar från seed-UI** tills Christoffer godkänt/omskrivit dem:

1. `tech-handstand-prep-lunge`
2. `tech-vault-run-punch`
3. `tech-beam-walks`

**I den här svenska katalogen ersätts de** av säkrare, golvbaserade omskrivningar (inga avancerade färdigheter):

| Hållet id | Ersättning (ny id) |
| --- | --- |
| `tech-handstand-prep-lunge` | `tech-lunge-hands-down` |
| `tech-vault-run-punch` | `tech-runway-stick` |
| `tech-beam-walks` | `tech-floor-line-walk` |

Ersättningarna har `needsCoachReview: true`. Håll de tre ursprungliga id:na utanför Builder seed-UI tills godkända.

**Terminologi (låst av Christoffer):** använd **gymnaster** (inte aktiva/elever) och **pass** (inte session) i all Slice 01-svenska. Engelska lånord i gymmet (hollow, jumping jacks m.m.) får vara kvar.

---

## Gathering / Samling (6)

### gather-name-circle
- **title:** Namncirkel  
- **durationMinutesDefault:** 3  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Alla säger sitt namn och ett energirord så att gruppen känner sig sedd.  
- **howTo:** Stå eller sitt i cirkel. Gå laget runt: namn + ett ord (taggad, trött, redo). Tränaren modellerar först.  
- **watchFor:** Skippa ingen som fryser — erbjud ”passa” och kom tillbaka senare. Håll det lätt.  
- **visualKey:** gather-name-circle  
- **stub:** true

### gather-today-goal
- **title:** Dagens enda mål  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Dela ett fokus för passet så att gymnasterna vet vad ”bra” betyder idag.  
- **howTo:** Tränaren säger passets mål i en mening. Be 2–3 gymnaster upprepa med egna ord.  
- **watchFor:** Håll målen görbara för gruppen. Undvik långa tal.  
- **visualKey:** gather-today-goal  
- **stub:** true

### gather-attendance-high-five
- **title:** Närvaro-high five  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Snabb incheckning som bygger energi och bekräftar vem som är här.  
- **howTo:** Ropa namn eller låt gymnaster high-fiva en kompis när de kommer in i cirkeln. Räkna gruppen högt.  
- **watchFor:** Ta med sena ankomster utan att stoppa hela planen.  
- **visualKey:** gather-high-five  
- **stub:** true

### gather-listen-up
- **title:** Lyssna-signal  
- **durationMinutesDefault:** 2  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`  
- **summary:** Lär in en tystnadssignal som ni återanvänder hela passet.  
- **howTo:** Visa signalen (hand upp, klappmönster eller frys). Öva två gånger. Beröm första lugna stunden.  
- **watchFor:** Skrik inte över bruset — vänta, använd sedan signalen.  
- **visualKey:** gather-listen  
- **stub:** true

### gather-partner-find
- **title:** Hitta en partner  
- **durationMinutesDefault:** 2  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`  
- **summary:** Para ihop gymnaster inför nästa block utan kaos.  
- **howTo:** Ropa ”hitta en partner”. Hjälp överblivna att bli tre. Bekräfta paren med en vinkning.  
- **watchFor:** Se till att ingen blir utanför; tilldela snabbt och snällt.  
- **visualKey:** gather-partners  
- **stub:** true

### gather-safety-spot
- **title:** Säkerhetsplatser — påminnelse  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Peka ut gränser, landningsytor och var man väntar.  
- **howTo:** Gå eller peka: mattor, banor, väntkö, vatten. Fråga en gymnast: ”Var väntar vi?”  
- **watchFor:** Håll det under två minuter. Upprepa bara det som gäller dagens uppställning.  
- **visualKey:** gather-safety  
- **stub:** true

---

## Warm-up / Uppvärmning (6)

### warm-jog-lines
- **title:** Lugnt joggande linjer  
- **durationMinutesDefault:** 3  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`, `floor`  
- **summary:** Lätt jogg för att höja pulsen utan att stressa färdigheter.  
- **howTo:** Jogga golvlängden eller en markerad bana. Mjuka landningar. Alternativ: höga knän sista längden.  
- **watchFor:** Ingen tävling. Stoppa den som sprintar in i andra.  
- **visualKey:** warm-jog  
- **stub:** true

### warm-animal-walks
- **title:** Djurgångar  
- **durationMinutesDefault:** 4  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`, `floor`  
- **summary:** Lekfull rörelse som väcker axlar, höfter och bål.  
- **howTo:** Björngång, krabbgång, grodhopp — korta sträckor. Visa varje en gång.  
- **watchFor:** Ömma handleder → korta ner eller byt till stående former. Håll avstånd mellan gymnaster.  
- **visualKey:** warm-animals  
- **stub:** true

### warm-arm-circles
- **title:** Armcirklar och sträckningar  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Mjuk axeluppvärmning innan stöd eller sving.  
- **howTo:** Små cirklar → större cirklar åt båda håll. Sträck uppåt och åt sidan. Andas ut på sträckningen.  
- **watchFor:** Smärta (inte stretch) → stoppa den gymnastens cirklar och anpassa.  
- **visualKey:** warm-arms  
- **stub:** true

### warm-leg-swings
- **title:** Stödda bensvingar  
- **durationMinutesDefault:** 3  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`  
- **summary:** Mjuka upp höfterna med kontrollerade svingar.  
- **howTo:** Håll i vägg eller partners axel. Svinga fram/bak, sedan lätt åt sidan. Byt ben.  
- **watchFor:** Ingen hård spark. Håll överkroppen lugn.  
- **visualKey:** warm-legs  
- **stub:** true

### warm-jumping-jacks
- **title:** Jumping jacks  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Snabb helkroppspuls-höjare.  
- **howTo:** Börja långsamt, hitta sedan en jämn rytm. Erbjud steg-jacks åt den som behöver lägre belastning.  
- **watchFor:** Mjuka knän. Plats så att armbågar inte krockar.  
- **visualKey:** warm-jacks  
- **stub:** true

### warm-mobility-flow
- **title:** Mini-mobilitetsflöde  
- **durationMinutesDefault:** 4  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`, `floor`  
- **summary:** Kort sekvens: knäböjssitt, katt-ko och mjuk sidsträckning (tränaren visar).  
- **howTo:** Tränaren leder 3–4 positioner, 3 andetag vardera. Gymnaster kopierar inom sin rörlighet.  
- **watchFor:** Tvinga inte djup. Anpassa till sittande vid behov.  
- **visualKey:** warm-mobility  
- **stub:** true

---

## Techniques / Teknik (6) — stubbar som väntar på tränargranskning

### tech-hollow-hold
- **title:** Hollow-hållning  
- **durationMinutesDefault:** 3  
- **difficulty:** easy  
- **tags:** `floor`, `equipment-free`  
- **summary:** Formarbete som stöttar många golv- och barrövningar.  
- **howTo:** På rygg, revben ner, ben och armar långa. Korta håll med vila.  
- **watchFor:** Svank som lyfter från golvet — böj knäna eller korta hållningen. Andas.  
- **visualKey:** tech-hollow  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true

### tech-tight-body-rock
- **title:** Strama kroppsgung  
- **durationMinutesDefault:** 3  
- **difficulty:** intro  
- **tags:** `floor`, `equipment-free`  
- **summary:** Lär in spänning och kontroll innan större färdigheter.  
- **howTo:** Ligg på rygg eller mage, kroppen lång och stram, små gung. Cue: ”tår och fingrar långa.”  
- **watchFor:** Slappa nackar eller böjda knän — nollställ och förminska gungningen.  
- **visualKey:** tech-rocks  
- **stub:** true  
- **needsCoachReview:** true

### tech-lunge-hands-down
- **title:** Utfall med händer i mattan (golv)  
- **durationMinutesDefault:** 5  
- **difficulty:** easy  
- **tags:** `floor`, `equipment-free`  
- **summary:** Säker golvövning: utfall, händer ner, bakben lyfts lätt — ingen handståendehållning.  
- **howTo:** Utfall, händer i mattan, bakben lyfts till lätt markering eller tillbaka. Håll höften lugn. Visa först.  
- **watchFor:** Tvinga inte upp till handstående. Fri landningsyta. Stoppa vid handledssmärta.  
- **visualKey:** tech-lunge-hands  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true  
- **replacesHeldId:** tech-handstand-prep-lunge

### tech-cartwheel-progress
- **title:** Hjulningar — progressioner  
- **durationMinutesDefault:** 6  
- **difficulty:** easy  
- **tags:** `floor`  
- **summary:** Sidledes förflyttning med händer i mattan, uppdelad i steg.  
- **howTo:** Stjärnform → handplaceringsövning → långsam hjulning med spot vid behov.  
- **watchFor:** Huvudet tittar fel håll; forcerat tempo. Använd mjuka mattor.  
- **visualKey:** tech-cartwheel  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true

### tech-floor-line-walk
- **title:** Gå på golvlinje  
- **durationMinutesDefault:** 5  
- **difficulty:** intro  
- **tags:** `floor`, `equipment-free`  
- **summary:** Balans och hållning på en tejp-/mattlinje på golvet — ingen bom.  
- **howTo:** Gå framåt på linjen, passé-hållningar, vänd. Armar får hjälpa balansen.  
- **watchFor:** Bara golvnivå. Spotters redo första gångerna om gruppen är osäker.  
- **visualKey:** tech-floor-line  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true  
- **replacesHeldId:** tech-beam-walks

### tech-runway-stick
- **title:** Ansats och landningsstopp (utan språngbräda)  
- **durationMinutesDefault:** 5  
- **difficulty:** easy  
- **tags:** `floor`, `vault`  
- **summary:** Rak ansats och tydligt stopp/landning i markerad zon — ingen punch på bräda ännu.  
- **howTo:** Spring till markerad zon, landa och stanna (stick) eller mjuk studs som tränaren visar. En i taget.  
- **watchFor:** En gymnast i taget på banan. Fri landningsyta. Ingen språngbräda i den här stubben.  
- **visualKey:** tech-runway-stick  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true  
- **replacesHeldId:** tech-vault-run-punch

---

## Strength / Styrka (6)

### str-Superman
- **title:** Superman-lyft  
- **durationMinutesDefault:** 3  
- **difficulty:** intro  
- **tags:** `floor`, `equipment-free`  
- **summary:** Rygg- och axelstyrka på golvet.  
- **howTo:** På mage, lyft armar och ben lätt. Korta håll eller pulser. Vila mellan set.  
- **watchFor:** Lyft inte nacken hårt. Håll lyften små.  
- **visualKey:** str-superman  
- **stub:** true

### str-push-up-knee
- **title:** Armhävningar på knä  
- **durationMinutesDefault:** 3  
- **difficulty:** easy  
- **tags:** `floor`, `equipment-free`  
- **summary:** Överkroppsstyrka med tillgänglig progression.  
- **howTo:** Händer under axlar, kropp i linje från knäna. Sänk och pressa. Erbjud väggarmhävningar som regression.  
- **watchFor:** Höfter som sjunker — korta rörelseomfånget eller byt till vägg.  
- **visualKey:** str-pushup  
- **stub:** true

### str-boat-hold
- **title:** Båt / V-sitt hållning  
- **durationMinutesDefault:** 3  
- **difficulty:** easy  
- **tags:** `floor`, `equipment-free`  
- **summary:** Bålhållning som överförs till många former.  
- **howTo:** Balansera på sittbenen, ben och armar upp efter förmåga. Korta håll.  
- **watchFor:** Rundad belastning i ryggen — böj knäna eller sänk fötterna.  
- **visualKey:** str-boat  
- **stub:** true

### str-squat-hold
- **title:** Knäböjshållning  
- **durationMinutesDefault:** 2  
- **difficulty:** intro  
- **tags:** `equipment-free`  
- **summary:** Benstyrka och hållning i en enkel hold.  
- **howTo:** Fötter i golvet, sitt bakåt som mot en stol. Håll, res dig sedan rak.  
- **watchFor:** Knän som faller inåt — cue ”knän följer tårna.” Hälar ner om möjligt.  
- **visualKey:** str-squat  
- **stub:** true

### str-hollow-rocks-strength
- **title:** Hollow-gung (styrka)  
- **durationMinutesDefault:** 3  
- **difficulty:** medium  
- **tags:** `floor`, `equipment-free`  
- **summary:** Starkare hollow-variant i korta set.  
- **howTo:** Hollow-form, gunga mjukt. Räkna gung eller tid. Vila ordentligt mellan set.  
- **watchFor:** Samma som hollow-hållning — skydda ländryggen; regressa tidigt.  
- **visualKey:** str-hollow-rocks  
- **stub:** true  
- **needsCoachReview:** true  
- **watchForRequired:** true

### str-partner-resist
- **title:** Partnertryck — stå stark  
- **durationMinutesDefault:** 4  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`  
- **summary:** Lätt partnertryck för hållning och styrka utan redskap.  
- **howTo:** Para ihop. En står stark medan partnern ger milt tryck på axlar eller händer enligt cue. Byt.  
- **watchFor:** Inga plötsliga knuffar. Matcha storlek när ni kan. Stoppa när formen tappas.  
- **visualKey:** str-partner  
- **stub:** true

---

## Fun and games / Lek och spel (6)

### fun-freeze-dance
- **title:** Frysdans  
- **durationMinutesDefault:** 4  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Musik eller klapprytm — dansa, frys sedan på signal.  
- **howTo:** Rör er fritt på golvet. På signal: frys i en stark form. Fortsätt.  
- **watchFor:** Tydliga gränser så ingen krockar. Erbjud tysta frysningar åt överstimulerade gymnaster.  
- **visualKey:** fun-freeze  
- **stub:** true

### fun-relay-bear
- **title:** Björngångs-stafett  
- **durationMinutesDefault:** 5  
- **difficulty:** easy  
- **tags:** `group`, `floor`  
- **summary:** Lagstafett med djurgångar för att hålla energin uppe.  
- **howTo:** Två eller fler led. Björngå till kon och tillbaka, tagga nästa. Fira varje lag.  
- **watchFor:** Inga dyk-finishar. Håll banorna fria.  
- **visualKey:** fun-relay  
- **stub:** true

### fun-simon-says-shapes
- **title:** Simon says — gymformer  
- **durationMinutesDefault:** 4  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Lyssnarlek med stretch- och strama former.  
- **howTo:** Ropa former med och utan ”Simon says.” Håll rundorna korta.  
- **watchFor:** Var snäll om någon åker ut — nollställ ofta så ingen sitter länge.  
- **visualKey:** fun-simon  
- **stub:** true

### fun-balloon-keep-up
- **title:** Ballongen uppe  
- **durationMinutesDefault:** 4  
- **difficulty:** intro  
- **tags:** `group`  
- **equipment:** `balloon`  
- **summary:** Samarbetslek: håll ballongen i luften.  
- **howTo:** En eller flera ballonger. Gruppen knuffar mjukt så de inte når golvet.  
- **watchFor:** Ingen hård nick. Se upp för halka; torka spill först.  
- **visualKey:** fun-balloon  
- **stub:** true

### fun-clean-up-race
- **title:** Städstafett  
- **durationMinutesDefault:** 3  
- **difficulty:** intro  
- **tags:** `group`, `equipment-free`  
- **summary:** Gör städning av redskap till en tidsatt lagutmaning.  
- **howTo:** Dela zoner. På ”kör”: lägg tillbaka sakerna. Tidtagning valfri. Tacka gruppen.  
- **watchFor:** Kasta inte redskap. Tunga mattor flyttas av vuxna.  
- **visualKey:** fun-cleanup  
- **stub:** true

### fun-showcase-circle
- **title:** Visningscirkel  
- **durationMinutesDefault:** 5  
- **difficulty:** easy  
- **tags:** `group`, `equipment-free`  
- **summary:** Valfri delning: en färdighet eller form varje gymnast är stolt över idag.  
- **howTo:** Cirkel. Frivilliga visar en sak. Applådera alla. Det går bra att passa.  
- **watchFor:** Tvinga aldrig fram en uppvisning. Håll stämningen stöttande.  
- **visualKey:** fun-showcase  
- **stub:** true

---

## Anteckningar för Builder

- Lagra som seed JSON/TS enligt Activity-fält; behåll `stub: true`.  
- Filtrera biblioteket på `blockType` när ni öppnar från ett blocks Lägg till övning.  
- **Inkludera inte** `tech-handstand-prep-lunge`, `tech-vault-run-punch`, `tech-beam-walks` i seed-UI. Använd ersättningarna ovan.  
- Prioritera granskning av poster med `needsCoachReview: true`.

## Anteckningar för Verifier

- Innehållsberedskap: 6 stubbar × 5 blocktyper = 30 interim-aktiviteter, alla märkta stub.  
- Tomma tillstånd: se `slice-01-empty-states.sv.md`.  
- Teknik **Se upp för** är konservativ; flagga för tränargranskning innan slutgiltig status.  
- `watchForRequired: true` på: `tech-hollow-hold`, `tech-lunge-hands-down`, `tech-cartwheel-progress`, `tech-floor-line-walk`, `tech-runway-stick`, `str-hollow-rocks-strength`.

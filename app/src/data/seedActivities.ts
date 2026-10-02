import type { Activity } from '../types'
import { findOwnActivity } from '../lib/ownActivities'
import { findBankActivity, listBankActivities } from '../lib/bank'

/**
 * Slice 03 — Christoffer’s real Swedish truppgymnastik drills.
 * Source: slice-03/content/slice-03-seed-activities.sv.md
 * Counts: Samling 5 · Uppvärmning 7 · Teknik 24 · Styrka 5 · Lek 10 = 51
 * Teknik includes 11 seeds promoted from Prime Coaching Sport, “Fun gymnastics stations”
 * (import-trials/2DJ_oMM81mI, B3 seed path; source → Källa line).
 * Experienced-only: tech-rondat-flickis, tech-salto-fran-hojd
 */
export const seedActivities: Activity[] = [
  // —— Samling (3) ——
  {
    id: 'gather-valkomstcheck-in',
    title: 'Välkomstcheck-in',
    blockType: 'gathering',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Välkomna gruppen och kolla hur veckan har varit — kort, inkluderande start på passet.',
    howTo:
      '1. Samla gymnasterna så alla syns och hör.\n2. Hälsa alla; modellera ett kort svar själv.\n3. Kort runda: hur mår ni / hur har veckan varit?\n4. Tacka och gå vidare innan det blir långt.',
    watchFor:
      'Enskilda monologer som äter tiden; se till att tysta gymnaster också får plats — utan press att prata.',
    watchForRequired: true,
    visualKey: 'gather-checkin',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'gather-narvaro',
    title: 'Närvaro',
    blockType: 'gathering',
    durationMinutesDefault: 3,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Bocka av listan så att alla som ska vara där är på plats.',
    howTo:
      '1. Ta fram närvarolistan innan gruppen sprider sig.\n2. Markera närvarande/frånvarande.\n3. Följ upp saknade enligt klubbens rutin.',
    watchFor:
      'Glöm inte avvikande namn och nya gymnaster; lämna inte gruppen utan uppsikt medan du bara stirrar i listan.',
    watchForRequired: true,
    visualKey: 'gather-attendance',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'gather-dagens-teknik',
    title: 'Dagens pass — snabb genomgång',
    blockType: 'gathering',
    durationMinutesDefault: 3,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Kort genomgång av vad ni ska göra på passet — så alla vet planen innan ni börjar.',
    howTo:
      '1. Samla gymnasterna så alla syns och hör.\n2. Säg i enkla ord vad passet innehåller — block för block eller dagens fokus.\n3. Håll det kort; spara djup coaching till respektive block.',
    watchFor:
      'För lång genomgång — håll det till ”vad vi gör idag”, inte hela övningarna.',
    watchForRequired: true,
    visualKey: 'gather-today-tech',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },

  {
    id: 'gather-regler',
    title: 'Dagens regler',
    blockType: 'gathering',
    durationMinutesDefault: 3,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Tre regler för hallen, innan gruppen sprider sig.',
    howTo:
      '1. Säg tre regler, inte en lång lista.\n2. Visa ett exempel, till exempel var man får springa.\n3. Låt en gymnast säga en regel tillbaka.\n4. Gå vidare innan det blir en föreläsning.',
    watchFor: 'En lång regelrunda äter samlingen. Håll det till det ni behöver idag.',
    watchForRequired: true,
    visualKey: 'gather-rules',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'gather-hog-fem',
    title: 'Hög fem i cirkel',
    blockType: 'gathering',
    durationMinutesDefault: 3,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Kort start så alla är med, innan ni går till uppvärmningen.',
    howTo:
      '1. Stå i cirkel så alla syns.\n2. Hög fem med grannen, en riktning runt.\n3. En mening om vad ni ska göra sen.\n4. Bryt cirkeln när energin är där.',
    watchFor: 'Ingen tvingas till hög fem. Erbjud en nick eller en vink.',
    watchForRequired: true,
    visualKey: 'gather-high-five',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },

  // —— Uppvärmning (5) ——
  {
    id: 'warm-hall-varv',
    title: 'Uppvärmningsvarv (hallen runt)',
    blockType: 'warmup',
    durationMinutesDefault: 10,
    difficulty: 'easy',
    tags: ['uppvärmning', 'group', 'floor', 'new-coach-ok'],
    summary:
      'Rörligt varv i hallen med löpning och grundfärdigheter — väcker kroppen inför tekniken.',
    howTo:
      '1. Led varvet i lagom fart runt hallen.\n2. Växla typiskt: springa, springa baklänges, ljusstakar fram/bak, kullerbytta framåt/bakåt, hjulning vänster och höger, bear walk, handstand, handstand till hopkrupen, crocodile walk, kaninhopp.\n3. Anpassa vilka delar som är med efter nivå och dag.\n4. Håll kö och avstånd så ingen springer in i nästa.',
    watchFor:
      'Utrymme och krockar; handstand och bakåtkullerbytta kräver madrass/uppsikt — tvinga inte max om tekniken inte sitter. Hjulning: båda sidorna; kolla axlar och handleder.',
    watchForRequired: true,
    visualKey: 'warm-hall-lap',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'warm-uppvarmningsdans',
    title: 'Uppvärmningsdans',
    blockType: 'warmup',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['uppvärmning', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Dansuppvärmning som rör hela kroppen — rörlighet och glädje, inte maxpuls.',
    howTo:
      '1. Sätt på musik.\n2. Led eller använd en känd uppvärmningsdans.\n3. Sikta på axlar, höfter, rygg, ben och koordination.\n4. Erbjud en enklare, mindre ”scenisk” variant åt den som behöver.',
    watchFor:
      'För vilda hopp på hårt golv; ge alternativ för den som inte vill dansa sceniskt.',
    watchForRequired: true,
    visualKey: 'warm-dance',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'warm-123-voltpositioner',
    title: '1-2-3 (voltpositioner)',
    blockType: 'warmup',
    durationMinutesDefault: 4,
    difficulty: 'easy',
    tags: ['uppvärmning', 'group', 'floor', 'new-coach-ok'],
    summary:
      'Positionerna 1, 2 och 3 inför framåtvolt / frivolt-arbete — kort formträning utan full volt.',
    howTo:
      '1. Gå igenom de tre positionerna ni använder i klubben för framåtvolt.\n2. Låt gymnasterna öva dem rytmiskt, samma språk varje gång.\n3. Håll det kort — ingen full volt i uppvärmningen om ni bara övar formerna.',
    watchFor:
      'Tydlighet i språket så alla menar samma position; ingen full volt här om målet bara är formerna.',
    watchForRequired: true,
    visualKey: 'warm-123-volt',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'warm-tojning-gymnaster',
    title: 'Töjning — gymnasterna leder',
    blockType: 'warmup',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['uppvärmning', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Töjning där gymnaster leder varandra eller gruppen — ansvar och igenkända stretch.',
    howTo:
      '1. Utse ledare (rotera mellan passen).\n2. De visar töjningar ni redan kan.\n3. Coachen backar upp säkerhet och tid.',
    watchFor:
      'Ojämn kvalitet — rätta farliga vinklar; ingen ”press” djupare än behagligt.',
    watchForRequired: true,
    visualKey: 'warm-stretch-athletes',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'warm-tojning-coach',
    title: 'Töjning — coach leder',
    blockType: 'warmup',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['uppvärmning', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Coachledd töjning efter eller mitt i uppvärmningen — lugn, förutsägbar stretch.',
    howTo:
      '1. Led ett kort stretchprogram (ben, höftböjare, axlar, handleder efter behov).\n2. Andas lugnt; håll ca 15–30 s per sida där det passar.\n3. Håll samma ordning så gruppen känner igen flödet.',
    watchFor:
      'Studsande stretch; smärta ≠ ”bra”; anpassa för hypermobila gymnaster.',
    watchForRequired: true,
    visualKey: 'warm-stretch-coach',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'warm-djurpromenad',
    title: 'Djurpromenad',
    blockType: 'warmup',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['uppvärmning', 'group', 'floor', 'new-coach-ok'],
    summary: 'Björn, krabba och kanin över golvet — kroppen vaknar utan maxhopp.',
    howTo:
      '1. Visa björn, krabba och kanin.\n2. Gå en led över golvet, ett djur i taget.\n3. Byt djur efter varje vända.\n4. Håll kön så ingen startar förrän ytan är fri.',
    watchFor: 'Handleder och avstånd. Ingen kapplöpning in i nästa.',
    watchForRequired: true,
    visualKey: 'warm-animals',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'warm-fotarbete',
    title: 'Fotarbete på stället',
    blockType: 'warmup',
    durationMinutesDefault: 4,
    difficulty: 'intro',
    tags: ['uppvärmning', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Lätt fötter på egen ruta — jogg, galopp och små hopp, inte en tävling.',
    howTo:
      '1. Varje gymnast har en egen ruta, inte en tät klunga.\n2. Lätt jogg, galopp och små jämfotahopp på stället.\n3. Mjuka landningar. Armarna hjälper balansen.\n4. Avsluta med att stå stilla och andas.',
    watchFor: 'Hårda landningar och hopp som blir tävling.',
    watchForRequired: true,
    visualKey: 'warm-feet',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },

  // —— Teknik (9) ——
  {
    id: 'tech-ljushopp-satsbrada',
    title: 'Ljushopp på satsbräda',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'vault', 'new-coach-ok'],
    summary:
      'Ljushopp från satsbräda — grundstuds och hoppteknik med fokus på timing, inte höjd först.',
    howTo:
      '1. Visa sats → bräda → ljushopp med kontrollerad landning.\n2. En i taget; tydlig kö.\n3. Cue: timing och rak kropp före höjd.',
    watchFor:
      'Fel fotisättning på brädan; landning bakom/framför mattan; köhållning så ingen springer in för tidigt.',
    watchForRequired: true,
    visualKey: 'tech-ljushopp-board',
    defaultStationEquipment: [
      { pieceId: 'eq-satsbrada', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-ljushopp-trampett',
    title: 'Ljushopp på trampett',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'trampett', 'new-coach-ok'],
    summary:
      'Ljushopp på trampett — tydlig ansats, studs i mitten, sträckt hopp och mjuk landning.',
    howTo:
      '1. Visa tydlig ansats och studs i mitten av trampetten.\n2. Sträckt ljushopp, mjuk landning.\n3. En i taget; vänta tills landningen är klar.',
    watchFor:
      'Ansats för lång/snabb; studs nära kanten; landning utan madrasskydd där det behövs.',
    watchForRequired: true,
    visualKey: 'tech-ljushopp-trampett',
    defaultStationEquipment: [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-satsbrada-volt-rygg',
    title: 'Satsbräda volt till rygg',
    blockType: 'techniques',
    durationMinutesDefault: 9,
    difficulty: 'easy',
    tags: ['teknik', 'vault', 'new-coach-ok'],
    summary:
      'Volt från satsbräda till landning på rygg — progressiv volt med madrass.',
    howTo:
      '1. Säkerställ madrass som räcker bakåt innan första försöket.\n2. Satsbräda → rotation → landning på rygg.\n3. Bygg från kortare rotation innan fullare volt; spotta efter nivå.\n4. En i taget.',
    watchFor:
      'För lite rotation (nacke/huvud); för mycket höjd utan kontroll; madrassen måste räcka bakåt.',
    watchForRequired: true,
    visualKey: 'tech-board-volt-back',
    defaultStationEquipment: [
      { pieceId: 'eq-satsbrada', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-trampett-volt-mattberg',
    title: 'Trampett volt upp på mattberg',
    blockType: 'techniques',
    durationMinutesDefault: 9,
    difficulty: 'easy',
    tags: ['teknik', 'trampett', 'new-coach-ok'],
    summary:
      'Volt från trampett upp på mattberg — progressiv höjd och rotation.',
    howTo:
      '1. Kolla att mattberget är stabilt och högt nog.\n2. Ansats → trampett → volt → landning högt på mattberg.\n3. Progressera höjd/rotation efter nivå.\n4. En i taget; nästa väntar tills landningen är klar.',
    watchFor:
      'Mattberg som tippar eller är för lågt; underrotation; att nästa gymnast startar för tidigt.',
    watchForRequired: true,
    visualKey: 'tech-trampett-mattberg',
    defaultStationEquipment: [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-mattberg', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-rondat-flickis',
    title: 'Rondat–flickis',
    blockType: 'techniques',
    durationMinutesDefault: 10,
    difficulty: 'hard',
    tags: ['teknik', 'floor', 'experienced-coach-only'],
    summary:
      'Rondat till flickis (bakåtväxel / flic-flac) — endast med erfaren ledare och aktiv spotting.',
    howTo:
      '1. Endast när erfaren ledare leder och spotttar.\n2. Progressera från bekanta delar innan hela kedjan.\n3. Spotting aktivt under hela setet.\n4. Avbryt om tekniken fallerar.',
    watchFor:
      'Handplacering, axellinje, underrotation, nacke. Avbryt om tekniken fallerar under setet.',
    watchForRequired: true,
    visualKey: 'tech-rondat-flickis',
    defaultStationEquipment: [
      { pieceId: 'eq-tumblingmatta', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: false,
    experiencedCoachOnly: true,
  },
  {
    id: 'tech-flickis-kudde',
    title: 'Flickis med flickiskudde',
    blockType: 'techniques',
    durationMinutesDefault: 9,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary:
      'Flickis med flickiskudde som stöd — känna bakåtrörelsen innan fri flickis.',
    howTo:
      '1. Placera kudden enligt klubbens metod.\n2. Låt gymnasten känna bakåtrörelsen med stöd.\n3. Progressera mot friare flickis när formen sitter.',
    watchFor:
      'Kudden rätt placerad; inte ”kasta” bakåt utan aktivt handstöd från gymnasten där metoden kräver det.',
    watchForRequired: true,
    visualKey: 'tech-flickis-pad',
    defaultStationEquipment: [
      { pieceId: 'eq-flickiskudde', count: 1 },
      { pieceId: 'eq-madrass', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-falla-bakat-hojd',
    title: 'Falla bakåt från höjd till rygg',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary:
      'Kontrollerad fall bakåt från höjd till landning på rygg — trygghet inför bakåtmoment.',
    howTo:
      '1. Använd plint/höjd som klubben brukar; tjock och lång madrass bakom.\n2. Falla bakåt till rygg med teknikfokus.\n3. Bygg trygghet stegvis — ingen ”vem vågar högst”-lek.',
    watchFor:
      'Huvudet får inte ta emot; madrass tillräckligt tjock/lång; ingen höjdtävling utan teknikfokus.',
    watchForRequired: true,
    visualKey: 'tech-fall-back',
    defaultStationEquipment: [
      { pieceId: 'eq-plint', count: 1 },
      { pieceId: 'eq-madrass', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-salto-fran-hojd',
    title: 'Salto från höjd',
    blockType: 'techniques',
    durationMinutesDefault: 9,
    difficulty: 'hard',
    tags: ['teknik', 'floor', 'experienced-coach-only'],
    summary:
      'Salto från höjd (fullare voltmoment) — endast med erfaren ledare, spotting och rätt uppbyggnad.',
    howTo:
      '1. Endast med erfaren ledare och rätt progression bakom.\n2. Spotting och madrassuppställning före första försöket.\n3. En i taget; stoppa tidigt vid osäkra försök.',
    watchFor:
      'Under-/överrotation; landningszon; trötthet i kön. Stoppa tidigt vid osäkra försök.',
    watchForRequired: true,
    visualKey: 'tech-salto-height',
    defaultStationEquipment: [
      { pieceId: 'eq-plint', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    stub: false,
    newCoachOk: false,
    experiencedCoachOnly: true,
  },
  {
    id: 'tech-handstaende-falla-rygg',
    title: 'Handstående falla till rygg',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary:
      'Från handstående, kontrollerad fall till rygg — öppning och trygg bakåtlandning.',
    howTo:
      '1. Lägg madrass bakom innan någon går upp i handstående.\n2. Handstående (mot vägg eller fri enligt nivå) → tippa/falla till rygg.\n3. Cue öppning och mjuk landning på rygg.',
    watchFor:
      'Huvud/nacke; axlar som kollapsar; madrass bakom måste finnas innan de går upp.',
    watchForRequired: true,
    visualKey: 'tech-hs-fall-back',
    defaultStationEquipment: [
      { pieceId: 'eq-madrass', count: 1 },
    ],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-kullerbytta',
    title: 'Kullerbytta framåt',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary: 'En trygg kullerbytta framåt på matta — rund rygg, inte ett kast.',
    howTo:
      '1. Lägg madrassen fram. Visa haka i och rund rygg.\n2. En i taget från huk, händerna i mattan.\n3. Rulla upp till fötterna utan att sätta fart i väggen.\n4. Nästa startar först när mattan är fri.',
    watchFor: 'Platt rygg, hakan upp, eller någon som skjuter på bakifrån.',
    watchForRequired: true,
    visualKey: 'tech-roll',
    defaultStationEquipment: [{ pieceId: 'eq-madrass', count: 1 }],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-hjul',
    title: 'Hjul',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary: 'Hjul åt båda håll på en fri linje — händer och fötter i en bana.',
    howTo:
      '1. Markera en linje på golvet.\n2. Visa hjul med magen in och blicken på händerna.\n3. En i taget, först ett håll och sedan det andra.\n4. Ingen står i landningen.',
    watchFor: 'Böjd bana, någon i vägen, eller bara ett håll.',
    watchForRequired: true,
    visualKey: 'tech-cartwheel',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-bro',
    title: 'Bro',
    blockType: 'techniques',
    durationMinutesDefault: 5,
    difficulty: 'easy',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary: 'Bro med egna händer och fötter. Ingen trycker ner ryggen.',
    howTo:
      '1. Madrass. Ligg på rygg, fötterna nära rumpan, händerna vid öronen.\n2. Lyft höfterna till bro, eller stanna på en lägre båge.\n3. Håll en kort stund och kom ner på ryggen, inte på huvudet.\n4. En i taget om ytan är liten.',
    watchFor: 'Någon som trycker på magen eller ryggen. Handleder som viker sig.',
    watchForRequired: true,
    visualKey: 'tech-bridge',
    defaultStationEquipment: [{ pieceId: 'eq-madrass', count: 1 }],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'tech-balansgang',
    title: 'Balansgång',
    blockType: 'techniques',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['teknik', 'floor', 'new-coach-ok'],
    summary: 'Balans på en linje på golvet. Armarna ut, inte en upphöjd bänk.',
    howTo:
      '1. Markera en linje, eller ställ koner som gång.\n2. Gå framåt med blicken långt fram.\n3. Armarna ut. Vänd kontrollerat.\n4. En i taget om linjen är smal.',
    watchFor: 'De tittar i golvet och tappar linjen. Ingen kliver upp på plint eller bänk.',
    watchForRequired: true,
    visualKey: 'tech-balance',
    defaultStationEquipment: [{ pieceId: 'eq-kon', count: 4 }],
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },

  // —— Teknik · Prime Coaching Sport, Fun gymnastics stations (11) ——
  // Seed promotion 2DJ_oMM81mI (B3). Own-words drafts; needsCoachReview until
  // Christoffer approves the text word-for-word (seed-promotion.md step 3).
  {
    id: 'tech-grenhopp-trampett',
    title: 'Grenhopp från trampett',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'trampett', 'hopp', 'landning', 'grenhopp', 'new-coach-ok'],
    summary:
      'Grenform i luften och en stabil landning. Första steget mot att hoppa former från trampett med kontroll, inte höjd.',
    howTo:
      '1. Kort ansats, studs mitt i trampetten.\n2. Benen ut åt sidorna och fram, armarna sträcks mot tårna.\n3. Samla benen före landning och landa på två fötter på mattan: böjda knän, armarna fram.\n4. En i taget, nästa går när mattan är fri.',
    watchFor:
      'Lång eller snabb ansats, studs nära kanten, benen kvar isär i landningen.',
    watchForRequired: true,
    visualKey: 'tech-straddle-trampett',
    defaultStationEquipment: [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    progressionOf: 'tech-landning-plint',
    regressionOf: 'tech-formhopp-over-block',
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=16',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 16,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-formhopp-over-block',
    title: 'Formhopp över block från trampett',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'trampett', 'hopp', 'former', 'landning', 'new-coach-ok'],
    summary:
      'Ett lågt block mellan trampett och matta ger gymnasten ett mål att hoppa över. Tränar höjd, form i luften och landning.',
    howTo:
      '1. Ställ ett lågt mjukt block mellan trampetten och landningsmattan.\n2. Studsa och hoppa över blocket med en form: ljushopp, krupen eller gren.\n3. Landa på två fötter på mattan med böjda knän.\n4. Bygg på med fler block när landningarna sitter.',
    watchFor:
      'Fötter som tar i blocket, gymnaster som tittar ner, att svårigheten höjs innan landningen är stabil.',
    watchForRequired: true,
    visualKey: 'tech-shape-over-block',
    defaultStationEquipment: [
      { pieceId: 'eq-trampett', count: 1 },
      { pieceId: 'eq-skumblock', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    progressionOf: 'tech-grenhopp-trampett',
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=30',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 30,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-aggrullning-kil',
    title: 'Äggrullning nerför kil',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['teknik', 'rullning', 'kil', 'form', 'nybörjare', 'new-coach-ok'],
    summary:
      'Gymnasten håller en hopkrupen form medan kroppen rullar nerför kilen. Bygger spänning, rund form och trygghet i att rotera.',
    howTo:
      '1. Lägg kilen på en matta. Gymnasten ligger på rygg högst upp.\n2. Dra upp knäna, håll om dem och för hakan mot bröstet.\n3. Rulla nerför kilen och håll formen hela vägen ner.\n4. Nästa startar när ytan nedanför är fri.',
    watchFor:
      'Formen som släpper (ben eller armar åker ut), hakan som åker upp.',
    watchForRequired: true,
    visualKey: 'tech-egg-roll-wedge',
    defaultStationEquipment: [
      { pieceId: 'eq-kilmatta', count: 1 },
      { pieceId: 'eq-madrass', count: 1 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=50',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 50,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-l-hang-racke',
    title: 'L-häng i räcke',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'räcke', 'bål', 'grepp', 'styrka', 'new-coach-ok'],
    summary:
      'Gymnasten hänger med raka armar och lyfter benen framåt. Tränar bål och grepp som behövs i räckesövningar.',
    howTo:
      '1. Gymnasten hänger i räcket med raka armar.\n2. Lyft benen fram så raka som möjligt, tårna pekar framåt.\n3. Håll några sekunder och sänk benen lugnt.\n4. Böj knäna om raka ben inte går än.',
    watchFor:
      'Gungande kropp, böjda armar, ben som faller ner okontrollerat.',
    watchForRequired: true,
    visualKey: 'tech-l-hang-bar',
    defaultStationEquipment: [
      { pieceId: 'eq-racke', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=99',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 99,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-stod-racke-pendel',
    title: 'Stöd på räcke med pendel',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'räcke', 'stöd', 'landning', 'new-coach-ok'],
    summary:
      'Upp i stöd på räcket med raka armar och spänd kropp. Grunden för alla räckesövningar och en trygg nedgång.',
    howTo:
      '1. Gymnasten trycker sig upp i stöd, raka armar, händerna ovanpå stången.\n2. Håll kroppen rak och spänd. Pendla benen fram och bak tre gånger.\n3. Tryck ifrån bakåt och landa på mattan: böjda knän, armarna fram.',
    watchFor:
      'Böjda armar, axlar som sjunker, höfter som viker sig vid stången, landning för nära räcket.',
    watchForRequired: true,
    visualKey: 'tech-support-bar',
    defaultStationEquipment: [
      { pieceId: 'eq-racke', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=115',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 115,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-asnesparkar',
    title: 'Åsnesparkar',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'handstående', 'golv', 'armstöd', 'floor', 'new-coach-ok'],
    summary:
      'Ett litet hopp upp på händerna med benen sparkade bakåt. Tidigt steg mot att våga lägga vikten på händerna inför handstående.',
    howTo:
      '1. Armarna raka och upp framför kroppen, ett ben böjt fram och ett rakt bak.\n2. Sätt händerna i mattan, skjut ifrån med det främre benet och sparka upp bakåt.\n3. Landa mjukt på fötterna. Byt ben varannan gång.',
    watchFor:
      'Armar som viker sig, huvudet långt fram mellan armarna, bara ett ben.',
    watchForRequired: true,
    visualKey: 'tech-donkey-kick',
    defaultStationEquipment: [
      { pieceId: 'eq-tumblingmatta', count: 1 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=146',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 146,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-minihjul',
    title: 'Minihjul (krabbhjul)',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['teknik', 'hjul', 'golv', 'nybörjare', 'floor', 'new-coach-ok'],
    summary:
      'Ett litet hjul nära golvet: hand, hand, fot, fot. Lär rytmen och handisättningen i hjulet utan höjd.',
    howTo:
      '1. Börja på huk vid ena sidan av mattan, armbågarna nära kroppen.\n2. Sätt ner händerna en i taget och hoppa över fötterna till andra sidan: hand, hand, fot, fot.\n3. Gör åt båda håll.\n4. Höj höfterna lite mer när rytmen sitter.',
    watchFor:
      'Fel ordning på händer och fötter, händer som hamnar för långt bort, bara ett håll.',
    watchForRequired: true,
    visualKey: 'tech-mini-cartwheel',
    defaultStationEquipment: [
      { pieceId: 'eq-tumblingmatta', count: 1 },
    ],
    regressionOf: 'tech-hjul',
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=165',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 165,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-soldatsparkar-bom',
    title: 'Soldatsparkar på bom',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'bom', 'balans', 'raka ben', 'new-coach-ok'],
    summary:
      'Gå längs bommen och sparka fram med raka ben. Tränar balans, raka ben och spänd kropp på smal yta.',
    howTo:
      '1. Armarna ut åt sidan för balansen.\n2. Ta ett steg och sparka det andra benet rakt fram, tårna pekar.\n3. Byt ben varje steg hela vägen till slutet.\n4. Hoppa ner i slutet och landa på två fötter med böjda knän.',
    watchFor:
      'Böjda ben, blicken ner i bommen, för snabbt tempo.',
    watchForRequired: true,
    visualKey: 'tech-soldier-kicks-beam',
    defaultStationEquipment: [
      { pieceId: 'eq-bom', count: 1 },
      { pieceId: 'eq-landningsmatta', count: 1 },
    ],
    progressionOf: 'tech-balansgang',
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=184',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 184,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-krabbgang-bom',
    title: 'Krabbgång längs bom',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['teknik', 'bom', 'stöd', 'axlar', 'styrka', 'new-coach-ok'],
    summary:
      'Bakåtstöd med händerna på bommen och förflyttning i sidled. Bygger stark axelposition och raka armar.',
    howTo:
      '1. Sitt bredvid bommen och sätt händerna på den bakom dig.\n2. Lyft till bakåtstöd med raka armar och så raka ben som möjligt.\n3. Flytta händer och fötter i sidled längs hela bommen.',
    watchFor:
      'Böjda armar, höfter som sjunker mot golvet, axlar som åker upp mot öronen.',
    watchForRequired: true,
    visualKey: 'tech-crab-walk-beam',
    defaultStationEquipment: [
      { pieceId: 'eq-bom', count: 1 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=205',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 205,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-ljushopp-rockringar',
    title: 'Ljushopp i rockringar',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['teknik', 'hopp', 'ljushopp', 'golv', 'nybörjare', 'floor', 'new-coach-ok'],
    summary:
      'Raka ljushopp från ring till ring i sicksack. Tränar spänd kropp, samlade ben och rytm i hoppen.',
    howTo:
      '1. Lägg ut rockringar i en sicksack.\n2. Hoppa jämfota från ring till ring.\n3. I varje hopp: armarna raka över huvudet, benen ihop, kroppen rak.\n4. Landa mjukt med böjda knän.',
    watchFor:
      'Armar som åker ner, ben isär, hårda landningar.',
    watchForRequired: true,
    visualKey: 'tech-hoop-jumps',
    defaultStationEquipment: [
      { pieceId: 'eq-rockring', count: 4 },
    ],
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=227',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 227,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'tech-landning-plint',
    title: 'Landningar upp på och ner från plint',
    blockType: 'techniques',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['teknik', 'landning', 'hopp', 'plint', 'nybörjare', 'new-coach-ok'],
    summary:
      'Hopp upp på en låg plint, stabil landning, sedan hopp ner med en form. Grunden för alla trygga landningar.',
    howTo:
      '1. Hoppa jämfota upp på plinten och landa stilla: böjda knän, armarna fram.\n2. Hoppa ner med en form, t.ex. ljushopp eller krupen.\n3. Landa stilla på golvet i samma landning och håll två sekunder.',
    watchFor:
      'Raka ben i landningen, knän som faller inåt, att gymnasten tar steg efter landningen.',
    watchForRequired: true,
    visualKey: 'tech-stick-landing-box',
    defaultStationEquipment: [
      { pieceId: 'eq-plint', count: 1 },
    ],
    regressionOf: 'tech-grenhopp-trampett',
    source: {
      url: 'https://youtu.be/2DJ_oMM81mI?t=245',
      creator: 'Prime Coaching Sport',
      title: 'Fun gymnastics stations',
      startSeconds: 245,
    },
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },

  // —— Styrka (3) ——
  {
    id: 'strength-cirkeltraning',
    title: 'Cirkelträning (par, stationer)',
    blockType: 'strength',
    durationMinutesDefault: 12,
    difficulty: 'easy',
    tags: ['styrka', 'group', 'new-coach-ok'],
    summary:
      'Cirkel med flera stationer; gymnaster går runt i par — teknik före tempo.',
    howTo:
      '1. Sätt 4–8 stationer med lagom avstånd.\n2. Visa varje station kort innan start.\n3. 30 s arbete, 20 s vila/byte; jobba i par.\n4. Håll tiden tydligt (timer eller musiksignal).',
    watchFor:
      'Stationer för tätt; teknik före tempo; anpassa så nybörjare inte tar skadliga genvägar.',
    watchForRequired: true,
    visualKey: 'str-circuit',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'strength-burpee-emom',
    title: 'Burpee-challenge (EMOM)',
    blockType: 'strength',
    durationMinutesDefault: 8,
    difficulty: 'easy',
    tags: ['styrka', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Burpees EMOM (every minute on the minute) — tydlig nivå och tillåtna regressioner.',
    howTo:
      '1. Visa korrekt burpee först.\n2. Varje minut: bestämt antal (eller max under resten av minuten enligt vald variant).\n3. Vila till nästa minutstart; sätt nivå efter gruppen.\n4. Tillåt step-back / utan hopp när formen faller.',
    watchFor:
      'Ojämn form när de blir trötta (höfter sjunker, hopp blir slarviga); erbjud regression tidigt.',
    watchForRequired: true,
    visualKey: 'str-burpee',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'strength-styrkelatar',
    title: 'Styrkelåtar (Sally, Thunderstruck, Gimme Gimme, jägarvila)',
    blockType: 'strength',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['styrka', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Styrka till kända låtar — t.ex. Sally, Thunderstruck, Gimme Gimme Gimme eller jägarvila hela låten.',
    howTo:
      '1. Välj en låt (en eller två räcker ofta i ett pass).\n2. Förklara rörelsen innan musiken startar.\n3. Synka till refränger/verser enligt klubbrutin (Sally = upp/ner till texten; Thunderstruck = burpee/jump-variation; Gimme = vald styrkeövning; jägarvila = holds hela låten).',
    watchFor:
      'Knän/hållning i squat; axlar i holds; erbjud knästående/kortare hold. Volym — en eller två låtar räcker ofta.',
    watchForRequired: true,
    visualKey: 'str-songs',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'strength-planka',
    title: 'Planka i lag',
    blockType: 'strength',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['styrka', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Kort planka där formen vinner över tiden.',
    howTo:
      '1. Visa planka på tå och på knä.\n2. 15–20 sekunder, vila, en omgång till.\n3. Knäversionen är den vanliga, inte ett straff.\n4. Avbryt när höften tappar eller ryggen svankar.',
    watchFor: 'Svank, och tävling om vem som håller längst.',
    watchForRequired: true,
    visualKey: 'str-plank',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'strength-djurkryp',
    title: 'Björngång och krabba',
    blockType: 'strength',
    durationMinutesDefault: 6,
    difficulty: 'easy',
    tags: ['styrka', 'group', 'floor', 'new-coach-ok'],
    summary: 'Björngång och krabbkryp som styrka, inte som race.',
    howTo:
      '1. Visa björn och krabba på en kort bana.\n2. Gå över, vila, byt djur.\n3. Håll handlederna så att det inte gör ont.\n4. Ingen startar mot en kompis i samma bana.',
    watchFor: 'Tävling och handleder som viker sig.',
    watchForRequired: true,
    visualKey: 'str-crawl',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },

  // —— Lek (8) ——
  {
    id: 'fun-rundpingis-medicinboll',
    title: 'Rundpingis med medicinboll',
    blockType: 'fun_and_games',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['lek', 'group', 'new-coach-ok'],
    equipment: ['medicinboll'],
    summary:
      'Pingis-/rundspel med medicinboll i stället för vanlig boll — lagom vikt för åldern.',
    howTo:
      '1. Ställ upp cirkel eller er vanliga rundpingis-uppställning.\n2. Välj medicinboll med lagom vikt för åldern.\n3. Sätt tydliga gränser för hur hårt de får kasta.',
    watchFor:
      'Ansikte/händer — för tung boll eller hårda kast; anpassa bollvikt.',
    watchForRequired: true,
    visualKey: 'fun-medball',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-hojdhopp',
    title: 'Höjdhopp (lek)',
    blockType: 'fun_and_games',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['lek', 'group', 'new-coach-ok'],
    summary:
      'Lekfullt höjdhopp över ribba eller mjuk höjd — höj stegvis med trygg landning.',
    howTo:
      '1. Sätt en säker ”ribba” (elastiskt band, moppskaft på koner eller mjuka mattor).\n2. En i taget eller stafettvariant.\n3. Höj stegvis; landning i mjuk zon.',
    watchFor:
      'Landning på två fötter i mjuk zon; ingen hård ribba i ansiktshöjd; köordning.',
    watchForRequired: true,
    visualKey: 'fun-highjump',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-stafett',
    title: 'Stafett',
    blockType: 'fun_and_games',
    durationMinutesDefault: 8,
    difficulty: 'intro',
    tags: ['lek', 'group', 'new-coach-ok'],
    summary: 'Klassisk stafett — lag, sträcka och växling med fair start.',
    howTo:
      '1. Dela lag.\n2. Bestäm bana och vad som bärs/görs vid växling.\n3. Demonstrera en gång; fair start.',
    watchFor:
      'Hala golv i kurvor; krockar i växling; håll banan fri från redskap.',
    watchForRequired: true,
    visualKey: 'fun-relay',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-123-forflyttning',
    title: '1-2-3 (förflyttningslek)',
    blockType: 'fun_and_games',
    durationMinutesDefault: 4,
    difficulty: 'intro',
    tags: ['lek', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Förflyttningslek: 1 = den framför går bak, 2 = den bak går fram, 3 = spring — skilt från voltpositionernas 1-2-3.',
    howTo:
      '1. Ställ gymnasterna i led/par enligt er uppställning.\n2. Ropa 1, 2 eller 3.\n3. 1: personen längst fram flyttar sig längst bak. 2: personen längst bak flyttar sig längst fram. 3: alla springer (t.ex. till linje och tillbaka).',
    watchFor: 'Krockar vid 3; tydliga gränser i hallen.',
    watchForRequired: true,
    visualKey: 'fun-123-move',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-maffia',
    title: 'Maffia',
    blockType: 'fun_and_games',
    durationMinutesDefault: 10,
    difficulty: 'intro',
    tags: ['lek', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Maffia-lek (social/rollek) enligt klubbens variant — håll det kort och åldersanpassat.',
    howTo:
      '1. Använd er vanliga Maffia-uppsättning (roller, ”natt/dag”, ledare som berättar).\n2. Håll det åldersanpassat; byt roller ofta.\n3. Ingen fysisk ”attack”.',
    watchFor:
      'Uteslutning/önskan — byt roller ofta; ingen fysisk attack.',
    watchForRequired: true,
    visualKey: 'fun-mafia',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
  },
  {
    id: 'fun-handstaende-utmaning',
    title: 'Handstående-utmaning',
    blockType: 'fun_and_games',
    durationMinutesDefault: 5,
    difficulty: 'easy',
    tags: ['lek', 'group', 'floor', 'new-coach-ok'],
    summary:
      'Lekfull utmaning — håll handstående eller flest kontrollerade försök med bra form.',
    howTo:
      '1. Mot vägg eller med kompisstöd efter nivå; madrass redo.\n2. Mät tid eller antal kontrollerade försök.\n3. Belöna form, inte bara ”vågat”; tillåt knä/björn-alternativ.',
    watchFor:
      'Fall utan madrass; nacke; tävlingshets som ger slarviga uppsättningar.',
    watchForRequired: true,
    visualKey: 'fun-hs-challenge',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-huvudstaende-utmaning',
    title: 'Stå-på-huvud-utmaning',
    blockType: 'fun_and_games',
    durationMinutesDefault: 5,
    difficulty: 'easy',
    tags: ['lek', 'group', 'floor', 'new-coach-ok'],
    summary:
      'Huvudstående-utmaning med fokus på trygg upp- och nedgång.',
    howTo:
      '1. Triangelbas, madrass, gärna mot vägg först.\n2. Utmana tid med bra form.\n3. Spotting för dem som är nya.',
    watchFor:
      'Belastning på nacke/huvud — avbryt vid smärta; aldrig utan madrass; ingen som ”knuffar upp” andra.',
    watchForRequired: true,
    visualKey: 'fun-headstand',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-morkerkurragomma',
    title: 'Mörkerkurragömma',
    blockType: 'fun_and_games',
    durationMinutesDefault: 10,
    difficulty: 'easy',
    tags: ['lek', 'group', 'new-coach-ok'],
    summary:
      'Kurragömma med dämpad belysning i hallen — tydliga regler innan ljuset skruvas ner.',
    howTo:
      '1. Sätt regler innan mörker: var man får gömma sig, var man inte får (förråd, redskapsskåp, ovanpå plintar som kan tippa), hur man blir tagen, när ljuset tänds.\n2. Behåll nöd-/utgångsljus enligt hallens krav.\n3. Räkna in alla efteråt innan ni lämnar.',
    watchFor:
      'Fall i mörker; gömställen under tunga redskap; rädsla — erbjud ”ljusvakt”-roll. Räkna in hela gruppen.',
    watchForRequired: true,
    visualKey: 'fun-dark-hide',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-folja-ledaren',
    title: 'Följa ledaren',
    blockType: 'fun_and_games',
    durationMinutesDefault: 6,
    difficulty: 'intro',
    tags: ['lek', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'En ledare visar enkla rörelser. Gruppen härmar. Inga volter.',
    howTo:
      '1. Ledaren visar en enkel förflyttning: jogg, jämfotahopp eller kryp.\n2. Gruppen följer med avstånd.\n3. Byt ledare efter en kort runda.\n4. Stoppa om ledet klumpar ihop sig.',
    watchFor: 'Ledaren hittar på volter eller hopp mot vägg.',
    watchForRequired: true,
    visualKey: 'fun-follow',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
  {
    id: 'fun-frysdans',
    title: 'Frysdans',
    blockType: 'fun_and_games',
    durationMinutesDefault: 5,
    difficulty: 'intro',
    tags: ['lek', 'group', 'equipment-free', 'new-coach-ok'],
    summary: 'Dansa tills musiken stannar. Frys på två fötter.',
    howTo:
      '1. Sätt regeln först: frys på fötter, inte i handstående.\n2. Musik på. Var och en rör sig i sin ruta.\n3. Musik av. Alla står stilla.\n4. En kort runda räcker.',
    watchFor: 'Vilda hopp, och frysar som blir volt.',
    watchForRequired: true,
    visualKey: 'fun-freeze',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
  },
]

/**
 * Slice 31 — lookup order own → shared bank (published + hidden) → bundled seeds.
 * `seedActivities` above stays the bundled fallback snapshot (and the source for
 * tools/bank/export-seed.ts). Sync on purpose: the bank store is filled before first render.
 */
export function getActivityById(id: string): Activity | undefined {
  return findOwnActivity(id) ?? findBankActivity(id) ?? seedActivities.find((a) => a.id === id)
}

/** Published bank exercises for a block (bundled seeds when the bank is off). */
export function activitiesForBlock(
  blockType: Activity['blockType'],
): Activity[] {
  return listBankActivities().filter((a) => a.blockType === blockType)
}

import type { Activity } from '../types'

/**
 * Slice 03 — Christoffer’s real Swedish truppgymnastik drills.
 * Source: slice-03/content/slice-03-seed-activities.sv.md
 * Counts: Samling 3 · Uppvärmning 5 · Teknik 9 · Styrka 3 · Lek 8 = 28
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
    title: 'Dagens teknik — snabb genomgång',
    blockType: 'gathering',
    durationMinutesDefault: 3,
    difficulty: 'intro',
    tags: ['samling', 'group', 'equipment-free', 'new-coach-ok'],
    summary:
      'Kort genomgång av dagens huvudteknik innan uppvärmning och träning.',
    howTo:
      '1. Säg dagens fokusfärdighet i enkla ord.\n2. Visa kort eller peka ut vad ni ska sikta på.\n3. Spara djup coaching till Teknik-blocket.',
    watchFor:
      'För lång teori — håll det till ”vad + varför idag”, inte hela övningen.',
    watchForRequired: true,
    visualKey: 'gather-today-tech',
    stub: false,
    newCoachOk: true,
    experiencedCoachOnly: false,
    needsCoachReview: true,
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
]

export function getActivityById(id: string): Activity | undefined {
  return seedActivities.find((a) => a.id === id)
}

export function activitiesForBlock(
  blockType: Activity['blockType'],
): Activity[] {
  return seedActivities.filter((a) => a.blockType === blockType)
}

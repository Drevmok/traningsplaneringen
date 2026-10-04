import type { BlockType } from '../types'

export const BLOCK_ORDER: BlockType[] = [
  'gathering',
  'warmup',
  'techniques',
  'strength',
  'fun_and_games',
]

export const BLOCK_BUDGETS: Record<BlockType, number> = {
  gathering: 6,
  warmup: 10,
  techniques: 20,
  strength: 15,
  fun_and_games: 10,
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  gathering: 'Samling',
  warmup: 'Uppvärmning',
  techniques: 'Teknik',
  strength: 'Styrka',
  fun_and_games: 'Lek och spel',
}

export const BLOCK_COLORS: Record<
  BlockType,
  { token: string; bg: string; border: string; text: string }
> = {
  gathering: {
    token: 'amber',
    bg: '#fef3c7',
    border: '#f59e0b',
    text: '#92400e',
  },
  warmup: {
    token: 'sky',
    bg: '#e0f2fe',
    border: '#0ea5e9',
    text: '#075985',
  },
  techniques: {
    token: 'violet',
    bg: '#ede9fe',
    border: '#8b5cf6',
    text: '#5b21b6',
  },
  strength: {
    token: 'rose',
    bg: '#ffe4e6',
    border: '#f43f5e',
    text: '#9f1239',
  },
  fun_and_games: {
    token: 'green',
    bg: '#dcfce7',
    border: '#22c55e',
    text: '#166534',
  },
}

/** From slice-01-empty-states.sv.md */
export const EMPTY_TIPS: Record<BlockType, { tip: string; addLabel: string }> = {
  gathering: {
    tip: 'Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter.',
    addLabel: 'Lägg till din första samlingsövning',
  },
  warmup: {
    tip: 'Väck kroppen mjukt så att gymnasterna är redo.',
    addLabel: 'Lägg till din första uppvärmning',
  },
  techniques: {
    tip: 'Välj några färdigheter — kvalitet före kvantitet.',
    addLabel: 'Lägg till din första teknikövning',
  },
  strength: {
    tip: 'Håll det kort och tydligt så att tekniken håller.',
    addLabel: 'Lägg till din första styrkeövning',
  },
  fun_and_games: {
    tip: 'Avsluta glädjefyllt så att de vill komma tillbaka.',
    addLabel: 'Lägg till ditt första spel',
  },
}

/** From slice-01-empty-states.sv.md tips tab */
export const TIPS_TAB: Record<BlockType, string> = {
  gathering:
    'Samla i cirkel, ta ögonkontakt och säg vad dagens pass handlar om — i en mening.',
  warmup:
    'Börja lugnt, höj sedan energin. Ser någon stel eller kylig ut? Ge en runda till.',
  techniques:
    'Nämn färdigheten, visa en gång, låt dem sedan prova. Ge en cue i taget.',
  strength:
    'Håll koll på knän, rygg och andning. Avbryt setet tidigt om formen faller isär.',
  fun_and_games:
    'Tydliga regler, korta rundor, fira ansträngning. Säkerhet gäller även när det är kul.',
}

export const DEFAULT_TARGET_MINUTES = 60

/** A single drill can fill most of a pass. Not a section budget. */
export const ITEM_MINUTES_MAX = 180

export const PASS_LENGTHS = [60, 90, 120] as const

export type PassLength = (typeof PASS_LENGTHS)[number]

/** UI chrome — Docs ui-chrome.sv.md + Christoffer terminology (pass / gymnaster) */
export const UI = {
  appName: 'Träningsplaneraren',
  home: 'Startsida',
  newSession: 'Nytt pass',
  startFromTemplate: 'Starta från mall',
  browseTemplates: 'Bläddra bland mallar',
  continueDraft: 'Fortsätt senaste pass',
  homeInvite:
    'Tre frågor ger dig ett färdigt pass. Du kan fortfarande börja tomt eller från mall.',
  planFirst: 'Planera ditt första pass',
  // Slice 29 — Home 3-question wizard (docs/home-wizard.sv.md)
  homeWizardPrimary: 'Planera pass',
  homePromise: 'Ett pass på några minuter.',
  homeWizardPrimaryDesc: 'Tre frågor — färdigt pass med stationer på hallen.',
  homeWizardPrimaryAria: 'Planera pass med tre frågor',
  continuePass: 'Fortsätt passet',
  clearPass: 'Rensa passet',
  clearPassTitle: 'Rensa passet?',
  clearPassBody:
    'Passet försvinner från den här enheten. Sedan kan du planera ett nytt från början.',
  clearPassConfirm: 'Rensa',
  emptyPass: 'Tomt pass',
  fromTemplate: 'Från mall',
  fetchPass: 'Hämta ett pass',
  newSessionDesc: 'Börja tomt med Samling.',
  startFromTemplateDesc: 'Välj Nybörjare eller Kort.',
  sessionBuilder: 'Passbyggaren',
  saveDraft: 'Spara utkast',
  useTemplate: 'Använd mall',
  more: 'Mer',
  moreAria: 'Fler saker med passet',
  export: 'Exportera / dela',
  exportStations: 'Stationskort',
  exportStationsHint: 'En station per A4, med stor siffra. Sätt upp vid stationen eller håll upp skärmen.',
  exportFullscreen: 'Helskär',
  printStations: 'Skriv ut kort',
  exportShareLink: 'Skicka till telefonen',
  exportShareHint:
    'Skanna QR-koden. På telefonen sparar du passet och kör det i hallen. Koden innehåller passet — inget konto och ingen molnsynk.',
  exportCopy: 'Kopiera länk',
  exportCopied: 'Länken är kopierad.',
  exportQr: 'QR-kod till det delade passet',
  exportQrLong: 'Länken är för lång för en QR. Kopiera den eller ladda ner filen.',
  downloadFile: 'Ladda ner fil',
  importFile: 'Importera fil',
  saveAsTemplate: 'Spara som egen mall',
  savedAsTemplate: 'Sparad som egen mall på den här enheten.',
  importDone: 'Passet är sparat på den här enheten.',
  receiveBad: 'Filen eller koden gick inte att läsa.',
  receiveTitle: 'Ta emot ett pass',
  receiveHint: 'Importera filen, eller klistra in länken, från den andra enheten.',
  pasteCode: 'Länk eller kod',
  openCode: 'Öppna',
  saveHere: 'Spara på den här enheten',
  saveAndRun: 'Spara och kör',
  replaceDraftTitle: 'Ersätta utkastet här?',
  replaceDraftBody:
    'Passet sparas i den här webbläsaren och ersätter utkastet som redan finns här.',
  replaceDraftConfirm: 'Ersätt utkast',
  myTemplates: 'Mina mallar',
  deleteTemplate: 'Ta bort',
  copyTemplateCode: 'Kopiera delningskod',
  templateCodeCopied: 'Delningskoden är kopierad.',
  savedTemplatesHint:
    'Egna mallar stannar i den här webbläsaren. Delningskoden tar med en kopia till telefonen.',
  exportPrintPass: 'Skriv ut passet',
  exportPrintPassHint: 'Tidslinje och hallkarta. Välj Spara som PDF i dialogen.',
  stationCardsEmpty: 'Inga teknikstationer i passet.',
  deckNext: 'Nästa',
  deckPrev: 'Föregående',
  shareBanner:
    'Pass från en annan enhet. Ingenting sparas här förrän du själv sparar.',
  shareBad: 'Länken gick inte att läsa.',
  shareExit: 'Till planeringen',
  comingSoon: 'Kommer snart',
  totalTime: 'Total tid',
  passLength: 'Passlängd',
  passLengthMinutes: 'min',
  addActivity: 'Lägg till övning',
  browseIdeas: 'Bläddra bland idéer',
  library: 'Bibliotek',
  tips: 'Tips',
  templates: 'Mallar',
  search: 'Sök',
  filters: 'Filter',
  stub: 'Utkast',
  topBarHelp: 'Ny som tränare? Börja från en mall',
  summary: 'Sammanfattning',
  why: 'Varför',
  howTo: 'Så gör du',
  watchFor: 'Se upp för',
  safety: 'Säkerhet',
  openExercise: 'Hela övningen',
  seeDescription: 'Se beskrivning',
  hideDescription: 'Dölj beskrivning',
  tipIncomplete: 'Ofullständigt tips.',
  addToBlock: 'Lägg till i valt block',
  addAndEditDuration: 'Lägg till och ändra tid',
  templateTitle: 'Ersätta det här passet?',
  templateBody:
    'Om du börjar från en mall ersätts blocken och övningarna du har nu. Dina sparade utkast finns kvar.',
  templateConfirm: 'Använd mall',
  templateCancel: 'Fortsätt redigera',
  blankTitle: 'Nytt pass',
  savedToast: 'Utkast sparat',
  moveUp: 'Flytta upp',
  moveDown: 'Flytta ner',
  moveTo: 'Flytta till',
  remove: 'Ta bort',
  dismiss: 'Avfärda',
  close: 'Stäng',
  overflow: 'Över budget',
  filterAll: 'Alla typer',
  noResults: 'Inga övningar matchar.',
  libraryTonight: 'Visa bara övningar vi kan köra ikväll',
  libraryTonightHint:
    'Döljer övningar som behöver redskap du kryssat bort i Förrådslistan.',
  ownedEquipmentTitle: 'Vad finns i hallen ikväll?',
  ownedEquipmentHint:
    'Avmarkera det ni inte har. Biblioteket kan då visa bara övningar ni kan köra.',
  selectBlockForTips: 'Välj ett block — då syns tipsen för övningarna där.',
  tipsBlockLead: 'För hela blocket',
  tipsExercisesLead: 'Övningarna',
  tipsNoExercises:
    'Inga övningar i blocket ännu. Lägg till en, så syns tipset här.',
  backHome: 'Till startsidan',
  experiencedCoach: 'Erfaren ledare',
  experiencedCoachWarning:
    'Endast med erfaren ledare — kräver aktiv spotting och rätt progression. Du kan ändå lägga till övningen.',
  needsCoachReview: 'Behöver tränargranskning',
  // Slice 05 — Hallöversikt (locked: hall-oversikt-copy.sv.md)
  hallOverview: 'Hallöversikt',
  hallCtaDisabled: 'Lägg till minst en övning först',
  hallBack: 'Tillbaka till Passbyggaren',
  hallBackShort: 'Till Passbyggaren',
  hallUnplaced: 'Ej placerade',
  hallUnplacedWithCount: 'Ej placerade ({n})',
  hallUnplacedStations: 'Ej placerade stationer',
  hallAllPlaced: 'Alla Teknik-stationer är placerade.',
  hallTrayEmptyStations: 'Alla Teknik-stationer är placerade.',
  hallEmptyPass: 'Inga övningar i passet ännu.',
  hallDragHint:
    'Förslagen ligger redan i zonen. Dra bara det som sitter fel, eller välj en station och tryck Placera här.',
  hallSchematicNote: 'Schematisk hall — inte exakt mått',
  hallStationsOnlyHint:
    'Endast Teknik-stationer placeras på hallen. Samling, Uppvärmning, Styrka och Lek och spel planeras i Passbyggaren.',
  hallNoStationsTitle: 'Inga Teknik-stationer ännu',
  hallNoStationsBody:
    'Lägg till övningar under Teknik i Passbyggaren — sedan kan du placera dem här.',
  hallNoStationsCta: 'Tillbaka till Passbyggaren',
  hallRemove: 'Ta bort från hall',
  hallMissingActivity: 'Övning saknas',
  hallPlaceHere: 'Placera här',
  hallDropHint: 'Dra en Teknik-station hit',
  hallDropHintStations:
    'De här saknar förslag. Välj en station och tryck Placera här.',
  hallCoachTip:
    'Zonen kommer från övningens redskap. Flytta bara det som sitter fel. Schemat är en hjälp, inte en ritning.',
  hallExperiencedShort: 'Erfaren',
  hallStationCount: '{n} stationer',
  hallStationCountOne: '1 station',
  // Slice 06 — Hallayout & snap (locked: hall-presets-copy.sv.md)
  hallLayout: 'Hallayout',
  hallPresetStandard: 'Standard trupp',
  hallPresetTavling: 'Tävling / linjer',
  hallPresetLiten: 'Liten hall',
  hallPresetBla: 'Blå hall',
  hallPresetVit: 'Vit hall',
  hallPresetMigrateNote:
    'Placerade övningar flyttas till samma zon i den nya layouten när det går.',
  hallSnapHint:
    'Släpp på en zon för att fästa stationen där. På öppen yta kan du placera fritt.',
  hallPresetCoachTip:
    'Blå hall och Vit hall är föreningens ritningar. Där placerar du fritt. De andra är generella scheman.',
  // Slice 07 — Golvklart / flöde / telefon (locked: golvklart-copy.sv.md)
  hallFloorReady: 'Golvklart',
  hallFloorReadyShort: 'Visa för golvet',
  hallExitFloor: 'Avsluta golvklart',
  hallPrint: 'Skriv ut',
  hallUnplacedBanner: '{n} stationer ej placerade',
  hallUnplacedBannerOne: '1 station ej placerad',
  hallFloorModeLabel: 'Golvklart',
  hallShowFlow: 'Visa flöde',
  hallHideFlow: 'Dölj flöde',
  hallStationOrderHint: 'Stationsordning följer passet',
  hallZoom: 'Zooma',
  hallZoomIn: 'Zooma in',
  hallZoomOut: 'Zooma ut',
  // Slice 21 — phone tray collapse (locked: docs/hall-phone-chrome.sv.md)
  hallTrayExpand: 'Visa stationsbricka',
  hallTrayCollapse: 'Dölj bricka',
  hallTrayExpandAria: 'Visa brickan med ej placerade stationer',
  hallTrayCollapseAria: 'Dölj brickan med ej placerade stationer',
  hallFloorCoachTip:
    'Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. Golvklart är till för att visa gruppen — skriv ut eller håll upp skärmen.',
  // Slice 09 — onboarding / coach tips (locked: coach-tips.sv.md)
  komIgangTitle: 'Kom igång',
  komIgangIntro:
    'Fem korta steg — från tomt pass till något du kan visa på golvet.',
  komIgangStep1: 'Välj eller bygg ett pass',
  komIgangStep1Hint: 'Börja tomt, från en mall, eller fortsätt ditt utkast.',
  komIgangStep2: 'Lägg till övningar i blocken',
  komIgangStep2Hint:
    'Samling → Uppvärmning → Teknik → Styrka → Lek och spel.',
  komIgangStep3: 'Öppna Hallöversikt och placera stationer',
  komIgangStep3Hint:
    'Teknik-stationerna föreslås i zonen för redskapet. Flytta bara det som sitter fel.',
  // Slice 16 — soft compose discoverability step
  komIgangStepCompose: 'Ange redskap på Teknik-stationerna',
  komIgangStepComposeHint:
    'Tryck en markör och välj Redigera redskap.',
  komIgangStepComposeHintShort: 'Tryck markör, välj Redigera redskap.',
  komIgangStep4: 'Använd Golvklart på golvet',
  komIgangStep4Hint:
    'Visa gruppen — eller skriv ut. Schemat är inte exakta mått.',
  komIgangProgress: '{done} av {total} klart',
  komIgangDismiss: 'Dölj Kom igång',
  komIgangDismissAlt: 'Jag klarar mig',
  komIgangNeedActivity: 'Lägg till minst en övning först',
  komIgangNeedHall: 'Öppna Hallöversikt när du har övningar i passet',
  komIgangNeedComposeHall:
    'Öppna Hallöversikt när du har övningar i passet',
  komIgangAllDone: 'Snyggt — du har gått hela vägen till golvet.',
  komIgangAllDoneHint: 'Du kan visa tips igen under Visa tips igen.',
  visaTipsIgen: 'Visa tips igen',
  visaTipsIgenDone: 'Tips visas igen',
  visaTipsIgenAlready: 'Tips syns redan',
  tipBuilderEmpty:
    'Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Varje övning visar varför, hur och vad du ska se upp för.',
  tipBuilderEmptyShort:
    'Börja från mall eller lägg till en övning. Tipsen sitter på övningen.',
  tipHallPlace:
    'Stationerna föreslås i zonen för redskapet. Dra bara det som sitter fel. Tryck en markör för detaljer.',
  tipStationCompose:
    'Redigera redskapen ni faktiskt använder. Det sparas i utkastet och syns när du trycker på markören.',
  tipHallFlowGolvklart:
    'Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. Golvklart är till för att visa gruppen — skriv ut eller håll upp skärmen.',
  tipExperiencedSafety:
    'Erfaren betyder aktiv spotting och rätt uppbyggnad. Lägg bara in om du (eller en kollega) kan leda säkert — du kan fortfarande välja övningen medvetet.',
  tipDismiss: 'Dölj tips',
  tipDismissAria: 'Dölj det här tipset',
  tipInfoAria: 'Visa tränartips',
  tipClose: 'Stäng',
  // Slice 22 — quieter chrome (locked: docs/copy-quieter-chrome.sv.md)
  hallHintsInfo: 'Tips om placering',
  hallHintsInfoAria: 'Visa tips om hur du placerar Teknik-stationer',
  hallHintsHide: 'Dölj tips',
  hallHintsHideAria: 'Dölj placeringstipsen',
  komIgangExpand: 'Visa steg',
  komIgangCollapse: 'Dölj steg',
  komIgangExpandAria: 'Visa alla Kom igång-steg',
  komIgangCollapseAria: 'Dölj stegen och visa bara sammanfattning',
  // Slice 12 — station markers + tap-to-detail (locked: docs/station-tiles.sv.md)
  hallTileHint:
    'Stationerna visas som markörer. Tryck för detaljer och redskap.',
  hallTileHintShort: 'Tryck på en markör för detaljer och redskap.',
  hallTileA11y: 'Station {rank}: {title}. Tryck för detaljer.',
  hallTileA11yNoRank: '{title}. Tryck för detaljer.',
  hallTileA11yExperienced:
    'Station {rank}: {title}. Erfaren. Tryck för detaljer.',
  hallTileA11yWithEquipment:
    'Station {rank}: {title}. Redskap angivna. Tryck för detaljer.',
  hallTileA11yExperiencedWithEquipment:
    'Station {rank}: {title}. Erfaren. Redskap angivna. Tryck för detaljer.',
  hallDetailClose: 'Stäng',
  hallDetailCloseAria: 'Stäng stationsdetaljer',
  // Slice 13 — station compose / redskap (locked: docs/station-compose.sv.md)
  stationEquipmentHeading: 'Redskap',
  stationEquipmentEmpty: 'Inga redskap angivna ännu.',
  stationEquipmentEmptyHint:
    'Lägg till det ni ställer upp — till exempel Trampett och Landningsmatta.',
  stationEquipmentEdit: 'Redigera redskap',
  stationEquipmentEditAria: 'Redigera redskap för stationen',
  stationEquipmentCount: '{n}× {label}',
  stationEquipmentOne: '{label}',
  // Slice 14 aliases (same strings; floor/print reuse stationEquipmentLabelText)
  hallFloorEquipmentCount: '{n}× {label}',
  hallFloorEquipmentOne: '{label}',
  stationEquipmentSuggested: 'Förslag — du kan ändra',
  stationEquipmentUseSuggested: 'Använd förslag',
  stationSketchCaption: 'Skiss — så kan stationen stå.',
  stationSketchApproach:
    'Ansatskuddarna framför trampett och satsbräda är en skiss, inte en rad i förrådet.',
  composeTitle: 'Redigera redskap',
  composeTitleWithName: 'Redigera redskap: {title}',
  composeDone: 'Klar',
  composeClose: 'Stäng',
  composeCloseAria: 'Stäng redigering av redskap',
  // Slice 20 — dirty Stäng (locked: docs/dirty-stang.sv.md)
  composeDirtyBody: 'Du har osparade ändringar.',
  composeDirtyDiscard: 'Stäng utan att spara',
  composeDirtyKeep: 'Fortsätt redigera',
  composeDirtyDiscardAria: 'Stäng utan att spara ändringarna',
  composeDirtyKeepAria: 'Fortsätt redigera redskap',
  composeRecipeHeading: 'Dina redskap',
  composeLibraryHeading: 'Lägg till',
  composeAddPiece: 'Lägg till {label}',
  composeRemovePiece: 'Ta bort {label}',
  composeIncrease: 'Öka antal',
  composeDecrease: 'Minska antal',
  composeEmptyRecipe: 'Inga redskap i uppsättningen ännu.',
  composeEmptyRecipeHint: 'Tryck på ett redskap nedan för att lägga till det.',
  composeMaxReached:
    'Du har lagt till tillräckligt många redskap för den här vyn.',
  // Slice 15 — Förrådslista (locked: docs/forradslista.sv.md)
  forradslistaTitle: 'Förrådslista',
  forradslistaOpen: 'Förrådslista',
  forradslistaOpenAria: 'Visa förrådslista för passet',
  forradslistaClose: 'Stäng',
  forradslistaCloseAria: 'Stäng förrådslista',
  forradslistaSub: 'Summerat från Teknik-stationernas redskap',
  forradslistaEmpty: 'Inga redskap summerade ännu.',
  forradslistaEmptyHint:
    'Ange redskap på Teknik-stationerna. Tryck en markör och välj Redigera redskap.',
  forradslistaEmptyHintShort: 'Tryck en markör och välj Redigera redskap.',
  // Slice 24 — Förråd empty soft path (docs/forrad-empty-soft-path.sv.md)
  forradslistaEmptySoftHint:
    'Det finns osparade förslag. Stäng och tryck Använd alla förslag — då syns redskapen i Förrådslista.',
  forradslistaPointApplyAll: 'Använd alla förslag på hallen',
  forradslistaPointApplyAllAria:
    'Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt.',
  forradslistaPointApplyAllToast: 'Tryck Använd alla förslag för att spara.',
  forradslistaPrintHeading: 'Förrådslista',
  forradslistaPrintIntro: 'Ta med från förrådet:',
  // Slice 19 — Använd alla förslag (locked: docs/anvand-alla-forslag.sv.md)
  hallApplyAllSuggested: 'Använd alla förslag',
  hallApplyAllSuggestedIdle: 'Inga förslag att spara',
  hallApplyAllSuggestedAria:
    'Spara redskapsförslag på alla stationer som fortfarande saknar sparade redskap',
  hallApplyAllSuggestedDisabled:
    'Redskapen är redan sparade, eller så har stationen inget förslag.',
  hallApplyAllSuggestedResult: 'Sparade redskap på {n} stationer',
  hallApplyAllSuggestedResultOne: 'Sparade redskap på 1 station',
  hallApplyAllSuggestedNone: 'Inga osparade förslag just nu.',
  // Slice 25 — saknar redskap banner (docs/saknar-redskap-banner.sv.md)
  hallSaknarRedskapBanner: '{n} stationer saknar redskap',
  hallSaknarRedskapBannerOne: '1 station saknar redskap',
  hallSaknarPointApplyAll: 'Använd alla förslag',
  hallSaknarPointApplyAllAria:
    'Visa Använd alla förslag. Sparar inte automatiskt.',
  hallSaknarPointApplyAllToast: 'Tryck Använd alla förslag för att spara.',
  // Slice 29 — wizard chrome (docs/home-wizard.sv.md)
  wizardStepProgress: 'Fråga {n} av 3',
  wizardBack: 'Tillbaka',
  wizardNext: 'Nästa',
  wizardCancel: 'Avbryt',
  wizardClose: 'Stäng',
  wizardFinish: 'Skapa pass',
  wizardQ1Label: 'Ålder',
  wizardQ1Age46: '4–6 år',
  wizardQ1Age79: '7–9 år',
  wizardQ1Age1012: '10–12 år',
  wizardQ1Age1318: '13–18 år',
  wizardQ1Level: 'Nivå',
  wizardLevelsHint: 'Nivå 9 är den lägsta. Nivå 1 är den högsta.',
  wizardQ2Label: 'Fokus',
  wizardQ2Vault: 'Satsbräda',
  wizardQ2Trampett: 'Trampett',
  wizardQ2Tumbling: 'Tumbling',
  wizardQ2Mixed: 'Blandat',
  wizardQ3Label: 'Hallayout',
  wizardQ3Hint: 'Välj den layout som liknar er hall. Teknik fäster i zon efter fokus.',
  wizardFocusHonesty: 'Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok.',
  // Slice 10 — distribution; Slice 33 footer (slice-33/content/microcopy.sv.md)
  footerSliceLabel: 'Träningsplaneraren · Slice 33',
  // Slice 31 — shared bank (slice-31/content/microcopy.sv.md, Docs final). Biblioteket only.
  bankStale: 'Visar sparade övningar. Du kan planera som vanligt.',
  // Slice 32 — admins (slice-31/content/microcopy.sv.md § Slice 32, Docs final 2026-10-03). Admin-only except adminLoginLink.
  adminLoginLink: 'Logga in som admin',
  adminBadge: 'Admin',
  adminLogout: 'Logga ut',
  adminNotAdmin: 'Du är inloggad men inte admin.',
  adminLoginTitle: 'Logga in som admin',
  // Slice 33 — login with a code from the mail (slice-33/content/microcopy.sv.md, Docs final 2026-10-03).
  adminLoginHint: 'Skriv din e-post så skickar vi en kod.',
  adminEmailLabel: 'E-post',
  adminSendCode: 'Skicka kod',
  adminWait: 'Vänta en stund innan du ber om en ny kod.',
  adminSendFailed: 'Kunde inte skicka koden. Kolla nätet och försök igen.',
  adminCodeSent: 'Om {email} hör till en admin kommer en kod strax. Skriv den här. Koden gäller i en timme.',
  adminCodeLabel: 'Kod från mejlet',
  adminCodePlaceholder: '6 siffror',
  adminVerify: 'Logga in',
  adminCodeWrong: 'Koden stämmer inte eller har slutat gälla. Försök igen eller be om en ny kod.',
  adminVerifyWait: 'Vänta en stund innan du försöker igen.',
  adminVerifyFailed: 'Kunde inte logga in. Kolla nätet och försök igen.',
  adminResend: 'Skicka ny kod',
  adminResendSoon: 'Du kan be om en ny kod om en minut.',
  adminCodeResent: 'Om adressen hör till en admin kommer en ny kod strax. Använd den senaste.',
  adminChangeEmail: 'Byt e-post',
  adminCloseAria: 'Stäng inloggningen',
  adminFilterPending: 'Väntar på godkännande ({n})',
  adminFilterReview: 'Behöver granskas ({n})',
  adminFilterHidden: 'Dolda ({n})',
  adminPendingBadge: 'Väntar',
  adminPendingBadgeAria: 'Väntar på godkännande',
  adminHiddenBadge: 'Dold',
  adminApprove: 'Godkänn',
  adminApproved: 'Godkänd. Tränarna ser den nästa gång de öppnar appen.',
  adminEdit: 'Ändra i banken',
  adminHide: 'Dölj för alla',
  adminUnhide: 'Visa igen',
  adminUnhidden: 'Syns igen för alla.',
  adminReviewHint: 'Läs igenom texten. Markera som granskad när den stämmer.',
  adminLastChanged: 'Senast ändrad {datum} av {vem}',
  adminLastChangedFirst: 'Oförändrad sedan {datum}',
  adminLastChangedNoWho: 'Senast ändrad {datum}',
  adminOffline: 'Du behöver nät för att ändra i banken.',
  adminHideConfirm: 'Dölja ”{title}” för alla tränare? Pass som redan har övningen visar den fortfarande.',
  adminHideUsedIn: 'Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras.',
  adminCancel: 'Avbryt',
  adminHideConfirmYes: 'Dölj',
  adminHidden: 'Dold för alla.',
  adminFormTitle: 'Ändra övning i banken',
  adminFormSourceUrl: 'Källa — länk',
  adminFormSourceCreator: 'Källa — kanal',
  adminFormSourceTime: 'Starttid (m:ss)',
  adminFormExperienced: 'Bara för erfarna ledare',
  adminFormHint: 'Ändringen syns för alla tränare.',
  adminFormSave: 'Spara i banken',
  adminSaved: 'Sparat i banken.',
  adminSaveConflict: 'Någon annan har ändrat övningen. Stäng och öppna den igen.',
  adminSaveFailed: 'Kunde inte spara. Kolla nätet och försök igen.',
  homeOpenHall: 'Hallöversikt',
  homeOpenHallAria: 'Öppna Hallöversikt från Hem',
  homeOpenGolvklart: 'Golvklart',
  homeOpenGolvklartAria: 'Öppna Golvklart från Hem',
  runPass: 'Kör passet',
  runPassAria: 'Kör passet, en övning i taget',
  runPassDisabled: 'Lägg till minst en övning först.',
  runNext: 'Nästa övning',
  runPrev: 'Föregående',
  runExit: 'Avsluta',
  runLast: 'Sista övningen',
  runTimeUp: 'Tiden är ute',
  runPaused: 'Pausad',
  runPause: 'Pausa timern',
  runResume: 'Fortsätt timern',
  saveOwnTemplate: 'Spara som egen mall',
  saveOwnTemplateTitle: 'Spara som egen mall',
  saveOwnTemplateHint:
    'Nästa måndag öppnar du mallen, eller trycker Ny vecka. Mallen stannar i den här webbläsaren.',
  templateName: 'Mallens namn',
  ownTemplateSaved: 'Sparad som egen mall.',
  newWeek: 'Ny vecka',
  newWeekAria: 'Ny vecka från det här passet',
  newWeekTitle: 'Ny vecka från det här passet?',
  newWeekBody:
    'Förra passet sparas som mall om det inte redan finns. Du jobbar i en kopia och kan byta stationer. Utkastet här ersätts av kopian.',
  newWeekConfirm: 'Skapa kopia',
  swapActivity: 'Byt',
  swapActivityAria: 'Byt övning. Tiden och platsen i hallen är kvar.',
  swapBanner: 'Välj en annan övning. Tiden och platsen i hallen är kvar.',
  swapCancel: 'Avbryt byte',
  swapped: 'Övningen är bytt.',
  ownNew: 'Ny egen övning',
  ownEdit: 'Ändra egen övning',
  ownBadge: 'Egen',
  ownHint: 'Så ni gör i er hall. Övningen stannar i den här webbläsaren.',
  ownTitle: 'Namn',
  ownMinutes: 'Minuter',
  ownSteps: 'Så gör du',
  ownStepsHint: 'Ett steg per rad. Högst fyra.',
  ownSave: 'Spara övning',
  ownDelete: 'Ta bort',
  ownEditAction: 'Ändra',
  ownInUse: 'Övningen sitter i ett pass eller en mall.',
  ownSaved: 'Egen övning sparad.',
  ownDeleted: 'Egen övning borttagen.',
  ownFull: 'Du har 100 egna övningar. Ta bort en först.',
  ownNeedTitle: 'Skriv ett namn.',
  ownNeedWhy: 'Skriv varför ni gör den.',
  ownNeedHow: 'Skriv minst ett steg, högst fyra.',
  ownNeedWatch: 'Skriv vad ni ska se upp för.',
  ownNeedSafety: 'Skriv säkerheten. Den följer med till golvet.',
  // Slice 30 — Övningsimport (slice-30/content/microcopy.sv.md, Docs final)
  ownImport: 'Importera övningar',
  ownImportAria: 'Importera övningar från en fil eller en kod',
  ownImportTitle: 'Importera övningar',
  ownImportHint:
    'Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera.',
  ownImportFile: 'Välj fil',
  ownImportPaste: 'Klistra in kod',
  ownImportRead: 'Läs in',
  ownImportCancel: 'Avbryt',
  ownImportCloseAria: 'Stäng importen utan att spara',
  ownImportBad: 'Filen eller koden gick inte att läsa.',
  ownImportNewer:
    'Filen kommer från en nyare version av appen. Uppdatera appen och försök igen.',
  ownImportEmpty: 'Det finns inga övningar i filen.',
  ownImportIsPass: 'Det här är ett pass. Öppna det under Hämta ett pass på startsidan.',
  importIsExercises:
    'Det här är övningar. Importera dem under Bibliotek → Importera övningar.',
  ownImportRoom: 'Plats för {n} till',
  ownImportRoomNone:
    'Du har redan 100 egna övningar. Ta bort några för att importera fler.',
  ownImportInclude: 'Ta med',
  ownImportSkip: 'Hoppa över',
  ownImportReplace: 'Ersätt',
  ownImportChoiceAria: 'Välj vad som händer med {title}',
  ownImportStateNew: 'Ny',
  ownImportStateSameName: 'Samma namn finns redan',
  ownImportStateExists: 'Finns redan',
  ownImportStateInvalid: 'Kan inte importeras',
  ownImportStateNoRoom: 'Ingen plats',
  ownImportNoteClipped: 'Förkortad.',
  ownImportNoteSteps: 'Högst fyra steg. Resten togs bort.',
  ownImportNoteUnknownPiece: 'Okänt redskap togs bort: {list}',
  ownImportNoteNotTeknik: 'Redskapen togs bort. De används bara i Teknik.',
  ownImportNoteLink: 'Kopplingen till en annan övning togs bort.',
  ownImportNoteSource: 'Källan togs bort. Den behöver en https-länk och ett namn.',
  ownImportNoteDupId: 'Samma övning finns två gånger i filen.',
  ownImportNoteBadFormat: 'Övningen har fel format.',
  ownImportNoteMissing: 'Saknar {fält}.',
  ownImportNoteSameName: 'Tar du med den får du två övningar med samma namn.',
  ownImportNoteExists:
    'Ersätt skriver över din version. Pass som använder övningen får den nya texten.',
  ownImportConfirm: 'Importera {n} övningar',
  ownImportConfirmOne: 'Importera 1 övning',
  ownImportConfirmNone: 'Välj minst en övning först',
  ownImportDone: '{n} övningar importerade. Läs igenom dem före passet.',
  ownImportDoneOne: '1 övning importerad. Läs igenom den före passet.',
  ownNeedsReview: 'Behöver granskas',
  ownNeedsReviewHint:
    'Importerad övning. Läs igenom den och ändra så att den passar er hall.',
  ownMarkReviewed: 'Markera som granskad',
  ownMarkReviewedAria: 'Markera {title} som granskad',
  ownReviewedToast: 'Markerad som granskad.',
  sourceLabel: 'Källa',
  sourceLine: 'Källa: {creator}',
  sourceLineAt: 'Källa: {creator} · {time}',
  sourceAria: 'Öppna videon hos {creator} i en ny flik',
  sourceAriaTitled: 'Öppna ”{title}” hos {creator} i en ny flik',
  progressionOfLabel: 'Bygger på',
  regressionOfLabel: 'Lättare variant av',
  ownEquipment: 'Redskap',
  ownEquipmentHint: 'Förslag till stationen. Bara i Teknik.',
  ownEquipmentPick: 'Välj redskap',
  ownEquipmentNone: 'Inga redskap valda.',
  oppnaPaTelefonUrl: 'https://drevmok.github.io/traningsplaneringen/',
  draftHonestyTitle: 'Utkastet stannar i den här webbläsaren',
  draftHonestyBody:
    'Passet sparas i den här webbläsaren, inte i molnet. Rensar du webbplatsdata försvinner det. Skicka till telefonen, eller ladda ner en fil, om samma pass ska köras på en annan enhet.',
  draftHonestyBodyShort: 'Sparas lokalt i webbläsaren — inte i molnet.',
  draftHonestyOtherDevice:
    'En annan telefon börjar tom. QR, länk eller fil flyttar en kopia dit. Utkastet synkas inte av sig själv.',
  draftHonestyDismiss: 'Jag förstår',
  omUtkast: 'Om utkast',
  oppnaPaTelefonTitle: 'Öppna på telefon',
  oppnaPaTelefonBody:
    'Öppna samma länk i telefonens webbläsare. Du kan lägga till appen på hemskärmen för snabbare start.',
  oppnaPaTelefonBookmark:
    'Spara länken som bokmärke så hittar du tillbaka till passet.',
  oppnaPaTelefonHonesty:
    'Appen på telefonen är tom tills du skickar passet dit. Det sparas bara i den webbläsare där du trycker Spara.',
  oppnaPaTelefonAddHome:
    'På iPhone: Dela → Lägg till på hemskärmen. På Android: menyn → Installera app / Lägg till på startsidan.',
  updateReady: 'En ny version finns. Utkastet ligger kvar på den här enheten.',
  updateNow: 'Uppdatera',
  updateApp: 'Uppdatera appen',
  updateHomeHint:
    'Appen på hemskärmen uppdateras inte själv. Tryck Uppdatera appen längst ner. Passet i den här webbläsaren finns kvar.',
  privacyPublicUrl:
    'Har du en öppen länk kan vem som helst öppna den tomma appen. Dina övningar och placeringar sparas bara i din webbläsare — inte på servern.',
} as const


export function hallUnplacedWithCountText(n: number): string {
  return UI.hallUnplacedWithCount.replace('{n}', String(n))
}

export function hallUnplacedBannerText(n: number): string {
  if (n === 1) return UI.hallUnplacedBannerOne
  return UI.hallUnplacedBanner.replace('{n}', String(n))
}

export function hallSaknarRedskapBannerText(n: number): string {
  if (n === 1) return UI.hallSaknarRedskapBannerOne
  return UI.hallSaknarRedskapBanner.replace('{n}', String(n))
}

export function hallStationCountText(n: number): string {
  if (n === 1) return UI.hallStationCountOne
  return UI.hallStationCount.replace('{n}', String(n))
}

export function hallApplyAllSuggestedResultText(n: number): string {
  if (n === 0) return UI.hallApplyAllSuggestedNone
  if (n === 1) return UI.hallApplyAllSuggestedResultOne
  return UI.hallApplyAllSuggestedResult.replace('{n}', String(n))
}

export function komIgangProgressText(done: number, total: number): string {
  return UI.komIgangProgress
    .replace('{done}', String(done))
    .replace('{total}', String(total))
}


export function wizardStepProgressText(n: number): string {
  return UI.wizardStepProgress.replace('{n}', String(n))
}


export function hallTileA11yText(
  title: string,
  opts?: { rank?: number; experienced?: boolean; hasEquipment?: boolean },
): string {
  const rank = opts?.rank
  const experienced = Boolean(opts?.experienced)
  const hasEquipment = Boolean(opts?.hasEquipment)
  if (typeof rank === 'number' && experienced && hasEquipment) {
    return UI.hallTileA11yExperiencedWithEquipment
      .replace('{rank}', String(rank))
      .replace('{title}', title)
  }
  if (typeof rank === 'number' && hasEquipment) {
    return UI.hallTileA11yWithEquipment
      .replace('{rank}', String(rank))
      .replace('{title}', title)
  }
  if (typeof rank === 'number' && experienced) {
    return UI.hallTileA11yExperienced
      .replace('{rank}', String(rank))
      .replace('{title}', title)
  }
  if (typeof rank === 'number') {
    return UI.hallTileA11y
      .replace('{rank}', String(rank))
      .replace('{title}', title)
  }
  return UI.hallTileA11yNoRank.replace('{title}', title)
}

export function stationEquipmentLabelText(
  label: string,
  count: number,
): string {
  if (count === 1) return UI.stationEquipmentOne.replace('{label}', label)
  return UI.stationEquipmentCount
    .replace('{n}', String(count))
    .replace('{label}', label)
}

export function composeTitleWithName(title: string): string {
  return UI.composeTitleWithName.replace('{title}', title)
}

export function mismatchMessage(intendedBlockLabel: string): string {
  return `Den här övningen används vanligtvis i ${intendedBlockLabel}. Du kan ändå lägga till den här.`
}

// Slice 30 — Övningsimport helpers

export function ownImportRoomText(n: number): string {
  if (n <= 0) return UI.ownImportRoomNone
  return UI.ownImportRoom.replace('{n}', String(n))
}

export function ownImportConfirmText(n: number): string {
  if (n <= 0) return UI.ownImportConfirmNone
  if (n === 1) return UI.ownImportConfirmOne
  return UI.ownImportConfirm.replace('{n}', String(n))
}

export function ownImportDoneText(n: number): string {
  if (n === 1) return UI.ownImportDoneOne
  return UI.ownImportDone.replace('{n}', String(n))
}

/** "Saknar varför och säkerhet." · "Saknar namn, varför och säkerhet." */
export function ownImportMissingText(fields: readonly string[]): string {
  const list =
    fields.length <= 1
      ? (fields[0] ?? '')
      : `${fields.slice(0, -1).join(', ')} och ${fields[fields.length - 1]}`
  return UI.ownImportNoteMissing.replace('{fält}', list)
}

export function sourceLineText(creator: string, time?: string): string {
  if (time) return UI.sourceLineAt.replace('{creator}', creator).replace('{time}', time)
  return UI.sourceLine.replace('{creator}', creator)
}

export function sourceAriaText(creator: string, title?: string): string {
  if (title) return UI.sourceAriaTitled.replace('{title}', title).replace('{creator}', creator)
  return UI.sourceAria.replace('{creator}', creator)
}

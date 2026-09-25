import type { BlockType } from '../types'

export const BLOCK_ORDER: BlockType[] = [
  'gathering',
  'warmup',
  'techniques',
  'strength',
  'fun_and_games',
]

export const BLOCK_BUDGETS: Record<BlockType, number> = {
  gathering: 5,
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
    tip: 'Få allas uppmärksamhet och sätt tonen innan ni börjar med färdigheter.',
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

/** UI chrome — Docs ui-chrome.sv.md + Christoffer terminology (pass / gymnaster) */
export const UI = {
  appName: 'Träningsplaneraren',
  home: 'Startsida',
  newSession: 'Nytt pass',
  startFromTemplate: 'Starta från mall',
  browseTemplates: 'Bläddra bland mallar',
  continueDraft: 'Fortsätt senaste pass',
  homeInvite:
    'Börja med en mall eller skapa ett tomt pass. Du kan alltid ändra senare.',
  planFirst: 'Planera ditt första pass',
  sessionBuilder: 'Passbyggaren',
  saveDraft: 'Spara utkast',
  useTemplate: 'Använd mall',
  export: 'Exportera / dela',
  comingSoon: 'Kommer snart',
  totalTime: 'Total tid',
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
  howTo: 'Så gör du',
  watchFor: 'Se upp för',
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
  selectBlockForTips: 'Välj ett block för att se tips.',
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
  hallUnplacedStations: 'Ej placerade stationer',
  hallAllPlaced: 'Alla Teknik-stationer är placerade.',
  hallTrayEmptyStations: 'Alla Teknik-stationer är placerade.',
  hallEmptyPass: 'Inga övningar i passet ännu.',
  hallDragHint:
    'Dra Teknik-stationer till hallen. Placeringen sparas med utkastet.',
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
    'Dra Teknik-stationer hit, eller välj en och tryck Placera här.',
  hallCoachTip:
    'Placera Teknik-stationerna ungefär där ni brukar köra dem i hallen. Schemat är en hjälp för gruppen — inte en ritning med mått.',
  hallExperiencedShort: 'Erfaren',
  hallStationCount: '{n} stationer',
  hallStationCountOne: '1 station',
  // Slice 06 — Hallayout & snap (locked: hall-presets-copy.sv.md)
  hallLayout: 'Hallayout',
  hallPresetStandard: 'Standard trupp',
  hallPresetTavling: 'Tävling / linjer',
  hallPresetLiten: 'Liten hall',
  hallPresetMigrateNote:
    'Placerade övningar flyttas till samma zon i den nya layouten när det går.',
  hallSnapHint:
    'Släpp på en zon för att fästa stationen där. På öppen yta kan du placera fritt.',
  hallPresetCoachTip:
    'Välj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt.',
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
    'Dra Teknik-stationerna ungefär dit ni brukar vara i hallen.',
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
    'Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Under Tips finns korta råd per block.',
  tipBuilderEmptyShort:
    'Börja från mall eller lägg till en övning. Mer råd under Tips.',
  tipHallPlace:
    'Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt.',
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
  forradslistaPrintHeading: 'Förrådslista',
  forradslistaPrintIntro: 'Ta med från förrådet:',
  // Slice 19 — Använd alla förslag (locked: docs/anvand-alla-forslag.sv.md)
  hallApplyAllSuggested: 'Använd alla förslag',
  hallApplyAllSuggestedAria:
    'Använd alla osparade redskapsförslag på placerade Teknik-stationer',
  hallApplyAllSuggestedDisabled: 'Inga stationer med osparade förslag',
  hallApplyAllSuggestedResult: 'Sparade redskap på {n} stationer',
  hallApplyAllSuggestedResultOne: 'Sparade redskap på 1 station',
  hallApplyAllSuggestedNone: 'Inga osparade förslag just nu.',
  // Slice 10 — distribution (locked: docs/distribution-copy.sv.md)
  footerSliceLabel: 'Träningsplaneraren · Slice 20',
  draftHonestyTitle: 'Utkastet stannar i den här webbläsaren',
  draftHonestyBody:
    'Pass och tips sparas lokalt i den här webbläsaren. Rensar du webbplatsdata försvinner utkastet. Ingen sparning i molnet i den här versionen.',
  draftHonestyBodyShort: 'Sparas lokalt i webbläsaren — inte i molnet.',
  draftHonestyOtherDevice:
    'Öppnar du länken i en annan telefon eller webbläsare börjar du tomt — utkastet följer inte med.',
  draftHonestyDismiss: 'Jag förstår',
  omUtkast: 'Om utkast',
  oppnaPaTelefonTitle: 'Öppna på telefon',
  oppnaPaTelefonBody:
    'Öppna samma länk i telefonens webbläsare. Du kan lägga till appen på hemskärmen för snabbare start.',
  oppnaPaTelefonBookmark:
    'Spara länken som bokmärke så hittar du tillbaka till passet.',
  oppnaPaTelefonHonesty:
    'Kom ihåg: utkastet bor i just den telefonens webbläsare.',
  oppnaPaTelefonAddHome:
    'På iPhone: Dela → Lägg till på hemskärmen. På Android: menyn → Installera app / Lägg till på startsidan.',
  privacyPublicUrl:
    'Har du en öppen länk kan vem som helst öppna den tomma appen. Dina övningar och placeringar sparas bara i din webbläsare — inte på servern.',
} as const

export function hallUnplacedBannerText(n: number): string {
  if (n === 1) return UI.hallUnplacedBannerOne
  return UI.hallUnplacedBanner.replace('{n}', String(n))
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

// Slice 67 step 1 — layout proposals (Slice 57 format). Pieces are placed by their centre in sketch px
// (the sketch maps x 0–1 to 16…624 px; W = EQUIPMENT_ROW_WIDTH), left → right in the run direction.
// yaw stays 0: in StationSketch yaw turns the mark in the picture plane, not on the floor.
export const W = { cushion: 78, trampett: 142, board: 114, plint: 86, track: 164, landing: 164, hill: 128, flick: 96, cone: 40, wedge: 120, block: 64, beam: 168, bar: 110, hoop: 44 }
const KIND = { 'eq-tumblingmatta': 'track', 'eq-madrass': 'cushion', 'eq-kilmatta': 'wedge', 'eq-satsbrada': 'board', 'eq-trampett': 'trampett', 'eq-skumblock': 'block', 'eq-flickiskudde': 'flick', 'eq-plint': 'plint', 'eq-mattberg': 'hill', 'eq-racke': 'bar', 'eq-bom': 'beam', 'eq-landningsmatta': 'landing', 'eq-kon': 'cone', 'eq-rockring': 'hoop' }
const r3 = (n) => Math.round(n * 1000) / 1000
const pose = (pieceId, cx, z = 0.5, y) => ({ pieceId, x: r3((cx - 16) / 608), z, yaw: 0, ...(y ? { y } : {}) })

/** A run of pieces, left edge at `start` px, `gaps[i]` px between piece i and i+1 (default 4). */
function run(ids, { start, gaps = [], z = 0.5 } = {}) {
  const total = ids.reduce((s, id) => s + W[KIND[id]], 0) + ids.slice(1).reduce((s, _, i) => s + (gaps[i] ?? 4), 0)
  let left = start ?? 320 - total / 2
  return ids.map((id, i) => {
    const w = W[KIND[id]]
    const p = pose(id, left + w / 2, z)
    left += w + (gaps[i] ?? 4)
    return p
  })
}

const L = (poses) => ({ v: 1, poses })
export const PROPOSALS = {
  // Ansats from the left (open floor), trampett, landningsmatta right after.
  'tech-ljushopp-trampett': { layout: L(run(['eq-trampett', 'eq-landningsmatta'], { start: 200 })), note: 'Ansats från vänster, trampett, landningsmatta direkt efter.' },
  'tech-satsbrada-volt-rygg': { layout: L(run(['eq-satsbrada', 'eq-landningsmatta'], { start: 200 })), note: 'Satsbräda, landningsmattan (rygglandning) direkt bakom, ansats från vänster.' },
  'tech-trampett-volt-mattberg': { layout: L(run(['eq-trampett', 'eq-mattberg', 'eq-landningsmatta'], { start: 110, gaps: [8, 2] })), note: 'Trampett, mattberget nära, landningsmatta bakom berget som säkring.', unsure: 'how_to säger landning högt på mattberget; om landningsmattan ska ligga ovanpå eller runt berget går inte att utläsa.' },
  'tech-rondat-flickis': { layout: L(run(['eq-tumblingmatta', 'eq-landningsmatta'], { start: 150, gaps: [2] })), note: 'Tumblingmattan som löpbana, landningsmatta i slutet.' },
  'tech-flickis-kudde': { layout: L(run(['eq-flickiskudde', 'eq-madrass'], { gaps: [2] })), note: 'Kudden först, madrassen där händer/fötter landar bakom.', unsure: 'how_to: «enligt klubbens metod» — kuddens läge mot madrassen är inte beskrivet.' },
  'tech-falla-bakat-hojd': { layout: L(run(['eq-plint', 'eq-madrass'], { gaps: [2] })), note: 'Plinten som höjd, madrassen direkt bakom för fallet bakåt.' },
  'tech-salto-fran-hojd': { layout: L(run(['eq-plint', 'eq-landningsmatta'], { gaps: [2] })), note: 'Plint, landningsmatta direkt efter.' },
  'tech-handstaende-falla-rygg': { layout: L([pose('eq-madrass', 320)]), note: 'En madrass mitt i bild.', unsure: 'Ett enda redskap: skissen blir i praktiken samma som den automatiska raden.' },
  'tech-kullerbytta': { layout: L([pose('eq-madrass', 320)]), note: 'En madrass mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-bro': { layout: L([pose('eq-madrass', 320)]), note: 'En madrass mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-balansgang': { layout: L([0, 1, 2, 3].map((i) => pose('eq-kon', 140 + i * 120))), note: 'Fyra koner på en rak linje med gångavstånd.' },
  'tech-grenhopp-trampett': { layout: L(run(['eq-trampett', 'eq-landningsmatta'], { start: 200 })), note: 'Kort ansats från vänster, trampett, landningsmatta direkt efter.' },
  'tech-formhopp-over-block': { layout: L(run(['eq-trampett', 'eq-skumblock', 'eq-landningsmatta'], { start: 120, gaps: [18, 18] })), note: 'Trampett, lågt block i mellanrummet, landningsmatta efter blocket.' },
  'tech-aggrullning-kil': { layout: L(run(['eq-kilmatta', 'eq-madrass'], { gaps: [0] })), note: 'Kilen med madrassen nedanför, där rullningen slutar.', unsure: 'how_to: «kilen på en matta» — kanske ska madrassen ligga under kilen; kilens lutningsriktning i ritningen går inte att vända (yaw vrider bara i bildplanet).' },
  'tech-l-hang-racke': { layout: L([pose('eq-landningsmatta', 320), pose('eq-racke', 320)]), note: 'Räcket med landningsmattan under.' },
  'tech-stod-racke-pendel': { layout: L([pose('eq-landningsmatta', 290), pose('eq-racke', 330)]), note: 'Räcket, landningsmattan under och lite bakom för avhoppet.', unsure: 'Vilket håll som är «bakåt» i sidovyn är ett val.' },
  'tech-asnesparkar': { layout: L([pose('eq-tumblingmatta', 320)]), note: 'Tumblingmattan mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-minihjul': { layout: L([pose('eq-tumblingmatta', 320)]), note: 'Tumblingmattan mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-soldatsparkar-bom': { layout: L(run(['eq-bom', 'eq-landningsmatta'], { gaps: [6] })), note: 'Bommen, landningsmatta vid slutet för nedhoppet.' },
  'tech-krabbgang-bom': { layout: L([pose('eq-bom', 320)]), note: 'Bommen mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-ljushopp-rockringar': { layout: L([0, 1, 2, 3].map((i) => pose('eq-rockring', 170 + i * 100, i % 2 ? 0.9 : 0.1))), note: 'Fyra rockringar i sicksack (fram/bak).' },
  'tech-landning-plint': { layout: L([pose('eq-plint', 320)]), note: 'Plinten mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-igelkottsgunga': { layout: L([pose('eq-madrass', 320)]), note: 'En madrass mitt i bild.', unsure: 'Ett enda redskap: samma som den automatiska raden.' },
  'tech-hjul-mattriangel': { layout: L([pose('eq-madrass', 278, 0.1), pose('eq-madrass', 362, 0.1), pose('eq-madrass', 320, 0.95)]), note: 'Tre madrasser som en triangel: två fram, en bak i mitten.', unsure: 'Sidovyn kan inte visa vinkeln mellan mattorna; triangeln antyds bara med djup.' },
  'tech-stockrullning-kil': { layout: L(run(['eq-kilmatta', 'eq-madrass'], { gaps: [0] })), note: 'Kilen med madrassen nedanför.', unsure: 'Samma fråga som äggrullning: madrassen kanske under kilen; lutningsriktningen går inte att vända.' },
}

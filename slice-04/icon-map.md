# Icon map — Slice 04

Full map: **5 blocks + 28 activities**.  
`visualKey` strings stay as in `seedActivities.ts` (Slice 03).  
`iconId` is the shared SVG component / sprite symbol name Builder implements.

**Icon style reminder:** abstract stroke icons, 24×24 viewBox, rounded line caps — friendly, not biomechanics.

---

## Shared icon vocabulary (`IconId`)

| iconId | Meaning (EN) | Swedish hint for coaches | Suggested glyph |
|---|---|---|---|
| `users-wave` | Greeting / group hello | Vinkning / samling | Simple wave or two-person + arc |
| `clipboard` | Attendance / list | Lista / närvaro | Clipboard with check |
| `target` | Focus / today’s skill | Mål / dagens fokus | Bullseye |
| `flame` | Warm-up energy | Uppvärmning | Small flame |
| `run` | Locomotion / lap | Springa / varv | Running figure abstract |
| `music` | Dance / songs | Musik / dans | Note |
| `numbers-123` | Count game / positions | 1-2-3 | Digits 1·2·3 |
| `stretch` | Stretch / mobility | Töjning | Bent figure or arc stretch |
| `jump-board` | Springboard / satsbräda | Satsbräda | Wedge + arc |
| `bounce` | Trampett / rebound | Trampett | Spring / bounce arcs |
| `rotate` | Volt / rotation | Rotation / volt | Circular arrows |
| `mats-stack` | Mattberg / stacked mats | Mattberg | Layered rectangles |
| `flip` | Flickis / tumbling skill | Volt / flick | Abstract flip arc |
| `pad` | Soft pad / kudde | Kudde / skydd | Rounded cushion |
| `fall-back` | Controlled fall to back | Falla till rygg | Down-chevron + back line |
| `salto-height` | Height → salto theme | Höjd / salto | Up platform + loop (abstract) |
| `handstand` | Handstand / invert | Handstående | Upside-down V / support |
| `circuit` | Stations / circuit | Cirkel / stationer | Three nodes in loop |
| `burst` | Power / burpee challenge | Explosivt | Burst / spark burst |
| `ball` | Med ball / ball games | Boll | Circle ball |
| `arrow-up` | High jump / up | Upp / höjd | Up arrow |
| `flag` | Relay / race | Stafett | Flag |
| `shuffle` | Move / relocate game | Förflyttning | Shuffle arrows |
| `mask` | Mafia / role game | Maffia / hemlig | Simple mask / eye |
| `hands-up` | Challenge / cheer | Utmaning | Raised hands abstract |
| `invert-head` | Headstand challenge | Huvudstående | Head-down support (abstract) |
| `moon` | Dark / hide | Mörker | Crescent moon |
| `spark` | Technique / skill (block) | Teknik | Four-point spark |
| `dumbbell` | Strength (block) | Styrka | Simple dumbbell |
| `smile` | Fun & games (block) | Lek | Smile |
| `fallback` | Unknown key | Övning | Generic activity mark |

~31 ids listed; blocks reuse a subset. Builder may alias closely related ids if stroke count must stay smaller, as long as **visual distinction across the five blocks** and **within a block’s library list** stays clear.

---

## Block map (5)

| BlockType | Swedish label | iconId | Color token | Notes |
|---|---|---|---|---|
| `gathering` | Samling | `users-wave` | amber | Replaces 👋 |
| `warmup` | Uppvärmning | `flame` | sky | Replaces 🔥 |
| `techniques` | Teknik | `spark` | violet | Replaces ✨ |
| `strength` | Styrka | `dumbbell` | rose | Replaces 💪 |
| `fun_and_games` | Lek och spel | `smile` | green | Replaces 😄 |

---

## Activity map (28)

Columns: activity `id` · Swedish title · `visualKey` (unchanged) · `iconId` · meaning

### Samling (3)

| id | title | visualKey | iconId | meaning |
|---|---|---|---|---|
| `gather-valkomstcheck-in` | Välkomstcheck-in | `gather-checkin` | `users-wave` | Welcome / hello |
| `gather-narvaro` | Närvaro | `gather-attendance` | `clipboard` | Roll call |
| `gather-dagens-teknik` | Dagens teknik — snabb genomgång | `gather-today-tech` | `target` | Today’s focus |

### Uppvärmning (5)

| id | title | visualKey | iconId | meaning |
|---|---|---|---|---|
| `warm-hall-varv` | Uppvärmningsvarv (hallen runt) | `warm-hall-lap` | `run` | Lap around hall |
| `warm-uppvarmningsdans` | Uppvärmningsdans | `warm-dance` | `music` | Dance / music |
| `warm-123-voltpositioner` | 1-2-3 (voltpositioner) | `warm-123-volt` | `numbers-123` | Count + shapes |
| `warm-tojning-gymnaster` | Töjning — gymnasterna leder | `warm-stretch-athletes` | `stretch` | Athlete-led stretch |
| `warm-tojning-coach` | Töjning — coach leder | `warm-stretch-coach` | `stretch` | Coach-led stretch (same icon OK) |

### Teknik (9)

| id | title | visualKey | iconId | meaning |
|---|---|---|---|---|
| `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | `tech-ljushopp-board` | `jump-board` | Board jump |
| `tech-ljushopp-trampett` | Ljushopp på trampett | `tech-ljushopp-trampett` | `bounce` | Trampett bounce |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | `tech-board-volt-back` | `rotate` | Board → back rotation |
| `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | `tech-trampett-mattberg` | `mats-stack` | Onto mat mountain |
| `tech-rondat-flickis` | Rondat–flickis | `tech-rondat-flickis` | `flip` | Skill flip — **not** warning |
| `tech-flickis-kudde` | Flickis med flickiskudde | `tech-flickis-pad` | `pad` | Soft pad aid |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | `tech-fall-back` | `fall-back` | Controlled fall |
| `tech-salto-fran-hojd` | Salto från höjd | `tech-salto-height` | `salto-height` | Height salto — **not** siren |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | `tech-hs-fall-back` | `handstand` | HS → back |

### Styrka (3)

| id | title | visualKey | iconId | meaning |
|---|---|---|---|---|
| `strength-cirkeltraning` | Cirkelträning (par, stationer) | `str-circuit` | `circuit` | Circuit stations |
| `strength-burpee-emom` | Burpee-challenge (EMOM) | `str-burpee` | `burst` | Power challenge |
| `strength-styrkelatar` | Styrkelåtar (…) | `str-songs` | `music` | Strength to songs |

### Lek och spel (8)

| id | title | visualKey | iconId | meaning |
|---|---|---|---|---|
| `fun-rundpingis-medicinboll` | Rundpingis med medicinboll | `fun-medball` | `ball` | Med ball game |
| `fun-hojdhopp` | Höjdhopp (lek) | `fun-highjump` | `arrow-up` | Jump up game |
| `fun-stafett` | Stafett | `fun-relay` | `flag` | Relay |
| `fun-123-forflyttning` | 1-2-3 (förflyttningslek) | `fun-123-move` | `shuffle` | Move / relocate |
| `fun-maffia` | Maffia | `fun-mafia` | `mask` | Role / secret game |
| `fun-handstaende-utmaning` | Handstående-utmaning | `fun-hs-challenge` | `hands-up` | HS challenge (fun) |
| `fun-huvudstaende-utmaning` | Stå-på-huvud-utmaning | `fun-headstand` | `invert-head` | Headstand challenge |
| `fun-morkerkurragomma` | Mörkerkurragömma | `fun-dark-hide` | `moon` | Dark hide-and-seek |

---

## Counts

| Group | Mapped |
|---|---|
| Blocks | **5** |
| Activities | **28** |
| **Total rows** | **33** |

Shared `stretch` used twice (athlete-led + coach-led töjning) by design.  
Shared `music` used for dance warm-up and strength songs — acceptable; contexts differ by block color.

---

## Migration note for Builder

Today’s emoji map in `blockMeta.ts` (`VISUAL_EMOJI`, `BLOCK_ICONS`, `visualEmoji`) is the **source of truth to replace**. Seed `visualKey` values already match the middle column above — **no seed id changes required**.

Pseudo:

```ts
export const VISUAL_ICON: Record<string, IconId> = {
  'gather-checkin': 'users-wave',
  // ... full table
}

export const BLOCK_ICON_IDS: Record<BlockType, IconId> = {
  gathering: 'users-wave',
  warmup: 'flame',
  techniques: 'spark',
  strength: 'dumbbell',
  fun_and_games: 'smile',
}
```

Fallback: `VISUAL_ICON[key] ?? 'fallback'`.

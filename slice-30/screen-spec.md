# Slice 30 — screen spec (DRAFT · recommended A1/B3/C1/D1/E1/F1)

**Viewport focus:** Bibliotek (~390 px phone + desktop) · import sheet · exercise detail · info panel · own form · station compose · Förrådslista.

## 1) Bibliotek — entry (A1)

```
BEFORE:  [Ny egen övning]   Så ni gör i er hall. Övningen stannar i den här webbläsaren.
AFTER:   [Ny egen övning] [Importera övningar]
         Så ni gör i er hall. Övningen stannar i den här webbläsaren.
```

## 2) Import sheet

```
Importera övningar                                   [×]
Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera.
[Välj fil]
┌ Klistra in kod ───────────────────────────┐
│                                           │
└───────────────────────────────────────────┘
[Läs in]

— after Läs in —
Två provutkast från Fun gymnastics stations …   (batchNote, muted)
Plats för 98 till
┌───────────────────────────────────────────────┐
│ Formhopp över block från trampett   Teknik · 6 min │
│ Ny                                [Ta med ▾]  │
├───────────────────────────────────────────────┤
│ Äggrullning nerför kil              Teknik · 6 min │
│ Ny                                [Ta med ▾]  │
├───────────────────────────────────────────────┤
│ Saknar säkerhet                     Styrka · 5 min │
│ Kan inte importeras · Saknar säkerhet.        │  (toggle disabled)
└───────────────────────────────────────────────┘
[Avbryt]                     [Importera 2 övningar]
```

Toggle values: Ta med / Hoppa över (+ Ersätt only on Finns redan). Notes: one muted line each. Tap a row title → read-only `ActivityDetail` preview (optional, nice).

## 3) Library card + exercise detail (D1 · F1)

```
Card:   Äggrullning nerför kil   [Egen] [Behöver granskas]

Detail: Äggrullning nerför kil   [Behöver granskas]
        Teknik · 6 min
        (StationSketch: madrass · kilmatta)
        ┌ Importerad övning. Läs igenom och ändra så den passar er hall.
        └ [Markera som granskad]
        Varför / Så gör du / Se upp för / Säkerhet   (unchanged)
        Lättare variant av: Kullerbytta framåt        (muted)
        Källa: Prime Coaching Sport · 0:50 ↗          (muted link)
        [Lägg till i valt block] [Lägg till och ändra tid]
```

## 4) Pass-row info panel (ActivityTip)

Last line, muted: `Källa: Prime Coaching Sport · 0:30 ↗`. No badge here.

## 5) Own form (E1 + redskap)

```
Namn · Block · Minuter · Varför · Så gör du (Ett steg per rad. Högst fyra.)
Redskap   (only when Block = Teknik)
  [Trampett] [1× Skumblock] [Landningsmatta]      [Välj redskap]
  Förslag till stationen. Bara i Teknik.
Se upp för · Säkerhet
[Fortsätt redigera]                 [Spara övning]
```

Välj redskap → same 15-tile grid + count stepper as Redigera redskap. Save clears Behöver granskas.

## 6) Redskap visuals (C1)

Compose grid / detail lists / stationskort / Förrådslista: 15 tiles, new five after Kon with icons. StationSketch row example (trial station 2): `cushion×4 · trampett · skumblock · landningsmatta`.

## 7) Home — Hämta ett pass with an exercise file

`Det här är övningar. Importera dem under Bibliotek → Importera övningar.` — draft untouched.

## Surfaces that must not change

Golvklart · stationskort content (except new icons) · Kör passet · hall placement rules + caption · wizard · Soft blank · malls · quiet chrome.

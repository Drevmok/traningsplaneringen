import json, os
OUT = os.path.dirname(os.path.abspath(__file__))
URL = "https://youtu.be/2DJ_oMM81mI"
CH = "Prime Coaching Sport"
VT = "Fun gymnastics stations"
LEVEL = "Nybörjare, ca 5–9 år (videon riktar sig till skolidrott F–3, 'elementary PE')"

def src(ts, sec, precision, chapter, seen=None):
    s = {"url": f"{URL}?t={sec}", "channel": CH, "videoTitle": VT, "timestamp": ts,
         "timestampSeconds": sec, "timestampPrecision": precision, "chapter": chapter}
    if seen: s["frameSeenAt"] = seen
    return s

def eq(*pairs): return [{"pieceId": p, "count": c} for p, c in pairs]

P = "own-trial-2dj-"
S = [
 dict(n=1, id=P+"01-grenhopp-trampett", title="Grenhopp från trampett",
  summary="Grenform i luften och en stabil landning. Första steget mot att hoppa former från trampett med kontroll, inte höjd.",
  how=["Kort ansats, studs mitt i trampetten.","Benen ut åt sidorna och fram, armarna sträcks mot tårna.","Samla benen före landning och landa på två fötter på mattan: böjda knän, armarna fram.","En i taget, nästa går när mattan är fri."],
  watch="Lång eller snabb ansats, studs nära kanten, benen kvar isär i landningen.",
  safety="Landningsmatta direkt efter trampetten. En i taget. Ingen springer in förrän landningen är klar.",
  equip=eq(("eq-trampett",1),("eq-landningsmatta",1)), unmapped=["Videon visar en liten studsmatta (minitramp); vi mappar den till trampett."],
  diff="easy", tags=["teknik","trampett","hopp","landning","grenhopp"],
  prog=P+"12-landning-plint", reg=P+"02-formhopp-over-block",
  source=src("0:16",16,"kapitelstart","Mini tramp"), conf="medel",
  unc="Ingen bild från just den här stationen; uppställningen antas vara samma som i nästa station (trampett + matta). Rörelsen bygger på ljudspåret."),
 dict(n=2, id=P+"02-formhopp-over-block", title="Formhopp över block från trampett",
  summary="Ett lågt block mellan trampett och matta ger gymnasten ett mål att hoppa över. Tränar höjd, form i luften och landning.",
  how=["Ställ ett lågt mjukt block mellan trampetten och landningsmattan.","Studsa och hoppa över blocket med en form: ljushopp, krupen eller gren.","Landa på två fötter på mattan med böjda knän.","Bygg på med fler block när landningarna sitter."],
  watch="Fötter som tar i blocket, gymnaster som tittar ner, att svårigheten höjs innan landningen är stabil.",
  safety="Bara mjuka block, aldrig hårda kanter. Landningsmattan ska räcka långt bakom blocket. En i taget.",
  equip=eq(("eq-trampett",1),("eq-landningsmatta",1)), unmapped=["Mjukt block (röd skumkloss) mellan trampett och matta – finns inte i redskapslistan. Ersätt t.ex. med en plintdel i skum.","Studsmattan i videon är en liten minitramp, inte en klassisk trampett."],
  diff="easy", tags=["teknik","trampett","hopp","former","landning"],
  prog=P+"01-grenhopp-trampett", reg=None,
  source=src("ca 0:30",30,"uppskattad","Mini tramp","0:41"), conf="hög",
  unc="Uppställningen syns på bild (trampett, rött block, blå matta). Exakt starttid för stationen är uppskattad; blockhöjden är okänd.", frame="station-2.jpg"),
 dict(n=3, id=P+"03-aggrullning-kil", title="Äggrullning nerför kil",
  summary="Gymnasten håller en hopkrupen form medan kroppen rullar nerför kilen. Bygger spänning, rund form och trygghet i att rotera.",
  how=["Lägg kilen på en matta. Gymnasten ligger på rygg högst upp.","Dra upp knäna, håll om dem och för hakan mot bröstet.","Rulla nerför kilen och håll formen hela vägen ner.","Nästa startar när ytan nedanför är fri."],
  watch="Formen som släpper (ben eller armar åker ut), hakan som åker upp.",
  safety="Kilen ligger stadigt på en matta. Bara en i taget i backen.",
  equip=eq(("eq-madrass",1)), unmapped=["Kilmatta (gul/blå kil) – finns inte i redskapslistan.","Underlaget i videon är en tunnare blå matta; vi mappar den till madrass."],
  diff="intro", tags=["teknik","rullning","kil","form","nybörjare"],
  prog=None, reg=None,
  source=src("0:50",50,"kapitelstart","Wedge","0:54"), conf="medel",
  unc="Kil + matta syns på bild. Rullriktningen är osäker: bilden ser ut som att gymnasten ligger tvärs över kilen (rullar åt sidan), men det syns inte säkert.", frame="station-3.jpg"),
 dict(n=4, id=P+"04-spindelmannen-kil", title="Spindelmannen uppför kil",
  summary="Gymnasten går upp med fötterna på kilen och hamnar i ett lutande stöd. Bygger raka, starka armar och vana att bära kroppen på händerna.",
  how=["Ställ kilen stadigt mot en vägg. Gymnasten står med ryggen mot kilen och sätter händerna i golvet.","Gå upp med fötterna mot kilens topp.","Gå närmare med händerna tills kroppen ligger rak mot kilen, armarna raka.","Gå långsamt ner med fötterna igen."],
  watch="Armar som viker sig, svank, att någon går högre än de orkar ta sig ner från.",
  safety="Kilen ska stå stadigt mot väggen. Matta under händerna. Gå ner lugnt, aldrig hoppa ner.",
  equip=eq(("eq-madrass",1)), unmapped=["Kilmatta lutad mot vägg – finns inte i redskapslistan. Madrassen är vårt förslag som underlag; den syns inte i videon."],
  diff="easy", tags=["teknik","styrka","handstående","kil","armstöd"],
  prog=None, reg=None,
  source=src("ca 1:15",75,"uppskattad","Wedge"), conf="låg",
  unc="Ingen bild från stationen. Bygger bara på ljudspåret. Starttid är en gissning mellan 0:54 och 1:39.") ,
 dict(n=5, id=P+"05-l-hang-racke", title="L-häng i räcke",
  summary="Gymnasten hänger med raka armar och lyfter benen framåt. Tränar bål och grepp som behövs i räckesövningar.",
  how=["Gymnasten hänger i räcket med raka armar.","Lyft benen fram så raka som möjligt, tårna pekar framåt.","Håll några sekunder och sänk benen lugnt.","Böj knäna om raka ben inte går än."],
  watch="Gungande kropp, böjda armar, ben som faller ner okontrollerat.",
  safety="Matta under räcket. Räcket så lågt att gymnasten når själv. Ledare nära vid första försöken.",
  equip=eq(("eq-landningsmatta",1)), unmapped=["Räcke (lågt räcke/stång) – finns inte i redskapslistan."],
  diff="easy", tags=["teknik","räcke","bål","grepp","styrka"],
  prog=None, reg=None,
  source=src("1:39",99,"kapitelstart","Bars"), conf="medel",
  unc="Ingen bild från just L-hänget; räcke och matta syns i nästa station. Kan passa lika bra under Styrka.") ,
 dict(n=6, id=P+"06-stod-racke-pendel", title="Stöd på räcke med pendel",
  summary="Upp i stöd på räcket med raka armar och spänd kropp. Grunden för alla räckesövningar och en trygg nedgång.",
  how=["Gymnasten trycker sig upp i stöd, raka armar, händerna ovanpå stången.","Håll kroppen rak och spänd. Pendla benen fram och bak tre gånger.","Tryck ifrån bakåt och landa på mattan: böjda knän, armarna fram."],
  watch="Böjda armar, axlar som sjunker, höfter som viker sig vid stången, landning för nära räcket.",
  safety="Matta under och bakom räcket. Räcket i lagom höjd för gruppen. Ledare står nära vid nedgången.",
  equip=eq(("eq-landningsmatta",1)), unmapped=["Räcke (enkel stång på ställning) – finns inte i redskapslistan."],
  diff="easy", tags=["teknik","räcke","stöd","landning"],
  prog=None, reg=None,
  source=src("ca 1:55",115,"uppskattad","Bars","2:07"), conf="hög",
  unc="Räcke och tjock matta under syns på bild. Greppet beskrivs otydligt i ljudet ('tummarna ovanpå'); vi skriver bara 'händerna ovanpå stången'.", frame="station-6.jpg"),
 dict(n=7, id=P+"07-asnesparkar", title="Åsnesparkar",
  summary="Ett litet hopp upp på händerna med benen sparkade bakåt. Tidigt steg mot att våga lägga vikten på händerna inför handstående.",
  how=["Armarna raka och upp framför kroppen, ett ben böjt fram och ett rakt bak.","Sätt händerna i mattan, skjut ifrån med det främre benet och sparka upp bakåt.","Landa mjukt på fötterna. Byt ben varannan gång."],
  watch="Armar som viker sig, huvudet långt fram mellan armarna, bara ett ben.",
  safety="Matta under. Avstånd mellan gymnasterna så ingen får en spark. Ingen tävling om höjd.",
  equip=eq(("eq-tumblingmatta",1)), unmapped=["Videon visar hopvikbara golvmattor (panelmattor); vi mappar till tumblingmatta."],
  diff="easy", tags=["teknik","handstående","golv","armstöd"],
  prog=None, reg=None,
  source=src("2:26",146,"kapitelstart","Floor mats"), conf="medel",
  unc="Ingen bild från stationen. Rörelsen bygger på ljudspåret; om händerna sätts i mattan sägs inte uttryckligen.") ,
 dict(n=8, id=P+"08-minihjul-krabbhjul", title="Minihjul (krabbhjul)",
  summary="Ett litet hjul nära golvet: hand, hand, fot, fot. Lär rytmen och handisättningen i hjulet utan höjd.",
  how=["Börja på huk vid ena sidan av mattan, armbågarna nära kroppen.","Sätt ner händerna en i taget och hoppa över fötterna till andra sidan: hand, hand, fot, fot.","Gör åt båda håll.","Höj höfterna lite mer när rytmen sitter."],
  watch="Fel ordning på händer och fötter, händer som hamnar för långt bort, bara ett håll.",
  safety="Fri bana. En i taget på mattan. Ingen står där fötterna landar.",
  equip=eq(("eq-tumblingmatta",1)), unmapped=["Videon visar en hopvikbar golvmatta (panelmatta); vi mappar till tumblingmatta."],
  diff="intro", tags=["teknik","hjul","golv","nybörjare"],
  prog=None, reg="tech-hjul",
  source=src("ca 2:45",165,"uppskattad","Floor mats","2:54"), conf="hög",
  unc="Matta och rörelse syns på bild. Exakt starttid uppskattad.", frame="station-8.jpg"),
 dict(n=9, id=P+"09-soldatsparkar-bom", title="Soldatsparkar på bom",
  summary="Gå längs bommen och sparka fram med raka ben. Tränar balans, raka ben och spänd kropp på smal yta.",
  how=["Armarna ut åt sidan för balansen.","Ta ett steg och sparka det andra benet rakt fram, tårna pekar.","Byt ben varje steg hela vägen till slutet.","Hoppa ner i slutet och landa på två fötter med böjda knän."],
  watch="Böjda ben, blicken ner i bommen, för snabbt tempo.",
  safety="Låg bom med matta bredvid och vid nedhoppet. En i taget på bommen.",
  equip=eq(("eq-landningsmatta",1)), unmapped=["Bom (låg bom) – finns inte i redskapslistan. Landningsmattan vid nedhoppet är vårt förslag; den syns inte i videon."],
  diff="easy", tags=["teknik","bom","balans","raka ben"],
  prog="tech-balansgang", reg=None,
  source=src("3:04",184,"kapitelstart","Beam"), conf="medel",
  unc="Ingen bild från stationen; bomhöjden okänd (i nästa station ligger bommen lågt nära golvet).") ,
 dict(n=10, id=P+"10-krabbgang-bom", title="Krabbgång längs bom",
  summary="Bakåtstöd med händerna på bommen och förflyttning i sidled. Bygger stark axelposition och raka armar.",
  how=["Sitt bredvid bommen och sätt händerna på den bakom dig.","Lyft till bakåtstöd med raka armar och så raka ben som möjligt.","Flytta händer och fötter i sidled längs hela bommen."],
  watch="Böjda armar, höfter som sjunker mot golvet, axlar som åker upp mot öronen.",
  safety="Bom som står stadigt på golvet. Avbryt om handlederna eller axlarna gör ont.",
  equip=[], unmapped=["Bom (låg bom direkt på golvet) – finns inte i redskapslistan."],
  diff="easy", tags=["teknik","bom","stöd","axlar","styrka"],
  prog=None, reg=None,
  source=src("ca 3:25",205,"uppskattad","Beam","3:34"), conf="hög",
  unc="Låg bom och bakåtstöd syns på bild. Benen ser lätt böjda ut på bilden; vi skriver 'så raka som möjligt'.", frame="station-10.jpg"),
 dict(n=11, id=P+"11-ljushopp-rockringar", title="Ljushopp i rockringar",
  summary="Raka ljushopp från ring till ring i sicksack. Tränar spänd kropp, samlade ben och rytm i hoppen.",
  how=["Lägg ut rockringar i en sicksack.","Hoppa jämfota från ring till ring.","I varje hopp: armarna raka över huvudet, benen ihop, kroppen rak.","Landa mjukt med böjda knän."],
  watch="Armar som åker ner, ben isär, hårda landningar.",
  safety="Ringarna ligger platt på golvet. Avstånd mellan gymnasterna i banan.",
  equip=[], unmapped=["Rockringar – finns inte i redskapslistan (koner kan markera banan om ringar saknas)."],
  diff="intro", tags=["teknik","hopp","ljushopp","golv","nybörjare"],
  prog=None, reg=None,
  source=src("3:47",227,"kapitelstart","Misc"), conf="medel",
  unc="Ingen bild från stationen. Antal ringar och avstånd okänt.") ,
 dict(n=12, id=P+"12-landning-plint", title="Landningar upp på och ner från plint",
  summary="Hopp upp på en låg plint, stabil landning, sedan hopp ner med en form. Grunden för alla trygga landningar.",
  how=["Hoppa jämfota upp på plinten och landa stilla: böjda knän, armarna fram.","Hoppa ner med en form, t.ex. ljushopp eller krupen.","Landa stilla på golvet i samma landning och håll två sekunder."],
  watch="Raka ben i landningen, knän som faller inåt, att gymnasten tar steg efter landningen.",
  safety="Låg och stadig plint. Mjukt underlag vid nedhoppet. En i taget.",
  equip=eq(("eq-plint",1)), unmapped=["Lådan i videon ser ut som ett orange mjukt skumblock; vi mappar till plint."],
  diff="intro", tags=["teknik","landning","hopp","plint","nybörjare"],
  prog=None, reg=P+"01-grenhopp-trampett",
  source=src("ca 4:05",245,"uppskattad","Misc","4:13"), conf="hög",
  unc="Låda och golv syns på bild. Lådans höjd och material uppskattade. Länken till grenhopp är vår egen bedömning.", frame="station-12.jpg"),
]

acts = []
for s in S:
    how = "\n".join(f"{i+1}. {t}" for i, t in enumerate(s["how"]))
    a = {"id": s["id"], "title": s["title"], "blockType": "techniques", "durationMinutesDefault": 6,
         "summary": s["summary"], "howTo": how, "watchFor": s["watch"], "watchForRequired": True,
         "visualKey": "own", "difficulty": s["diff"], "tags": s["tags"],
         "defaultStationEquipment": s["equip"], "safetyLine": s["safety"],
         "own": True, "needsCoachReview": True, "newCoachOk": True, "experiencedCoachOnly": False, "stub": False}
    if s["prog"]: a["progressionOf"] = s["prog"]
    if s["reg"]: a["regressionOf"] = s["reg"]
    a["station"] = s["n"]
    a["level"] = LEVEL
    a["source"] = s["source"]
    a["confidence"] = {"level": s["conf"], "uncertain": s["unc"]}
    a["unmappedEquipment"] = s["unmapped"]
    a["keyframe"] = s.get("frame")
    # limits
    assert len(a["title"]) <= 80 and len(a["summary"]) <= 240 and len(how) <= 800
    assert len(a["watchFor"]) <= 240 and len(a["safetyLine"]) <= 240, a["id"]
    assert 2 <= len(s["how"]) <= 4 and all(len(t) <= 180 for t in s["how"]), a["id"]
    acts.append(a)

json.dump(acts, open(os.path.join(OUT, "drafts.json"), "w"), ensure_ascii=False, indent=2)

LBL = {"eq-trampett":"Trampett","eq-satsbrada":"Satsbräda","eq-plint":"Plint","eq-landningsmatta":"Landningsmatta","eq-tumblingmatta":"Tumblingmatta","eq-madrass":"Madrass","eq-mattberg":"Mattberg","eq-flickiskudde":"Flickiskudde","eq-airtrack":"Airtrack","eq-kon":"Kon"}
DIFF = {"intro":"intro","easy":"lätt","medium":"medel","hard":"svår"}
title_by_id = {a["id"]: a["title"] for a in acts}
title_by_id.update({"tech-hjul":"Hjul (befintlig övning)","tech-balansgang":"Balansgång (befintlig övning)"})
md = [f"# Provutkast: {VT}",
 "",
 f"**Källa:** [{VT}]({URL}) · {CH} · 4:29 · publicerad 6 aug 2023",
 "",
 "> ⚠️ **Videon visar inte en framåtvolt-progression.** Det är 12 grundstationer för nybörjare (trampett, kil, räcke, golvmatta, bom, rockringar, låda). Ingen station innehåller volt eller salto. Utkasten nedan beskriver det som faktiskt visas. Kolla om det är rätt länk.",
 "",
 "Så togs innehållet fram: YouTube krävde inloggning (botkontroll), så videon kunde inte laddas ner. Underlaget är ljudspåret (via webbsidan), beskrivningen, kapitlen och 6 kapitelbilder från YouTube. Alla texter är skrivna med egna ord. Alla utkast är `needsCoachReview`.",
 "",
 f"**Nivå (alla):** {LEVEL}",
 ""]
for a in acts:
    eqs = ", ".join(f"{LBL[e['pieceId']]} ×{e['count']}" for e in a["defaultStationEquipment"]) or "–"
    md += ["---", "", f"## {a['station']}. {a['title']}", "",
           f"⏱ {a['durationMinutesDefault']} min · Teknik · {DIFF[a['difficulty']]} · tillförlitlighet: **{a['confidence']['level']}**", ""]
    if a.get("keyframe"): md += [f"![Station {a['station']}]({a['keyframe']})", ""]
    md += [f"**Varför:** {a['summary']}", "", "**Så gör du:**", ""]
    md += [f"{l}" for l in a["howTo"].split("\n")]
    md += ["", f"**Se upp för:** {a['watchFor']}", "", f"**Säkerhet:** {a['safetyLine']}", "",
           f"**Redskap:** {eqs}"]
    for u in a["unmappedEquipment"]: md.append(f"- ⚠️ {u}")
    md += ["", f"**Taggar:** {', '.join(a['tags'])}"]
    if a.get("progressionOf"): md.append(f"\n**Bygger vidare på:** {title_by_id[a['progressionOf']]}")
    if a.get("regressionOf"): md.append(f"\n**Lättare variant av:** {title_by_id[a['regressionOf']]}")
    s = a["source"]
    seen = f", syns i bild vid {s['frameSeenAt']}" if s.get("frameSeenAt") else ""
    md += ["", f"**Källa:** [{s['timestamp']}]({s['url']}) ({s['timestampPrecision']}, kapitel ”{s['chapter']}”{seen})", "",
           f"**Osäkert:** {a['confidence']['uncertain']}", ""]
open(os.path.join(OUT, "drafts.sv.md"), "w").write("\n".join(md))
print("ok", len(acts))

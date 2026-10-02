#!/usr/bin/env python3
"""Planner self-check for Övningsimport files (schema v1, Slice 30 DRAFT).

Mirrors the app rules in import-schema.md so Planner can catch problems
before sending a file to the coach. Stdlib only. Does NOT know the coach's
own exercises (device-local), so "Finns redan" cannot be detected here.

Usage: python3 slice-30/content/check_import.py path/to/file.json
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SEED = os.path.join(HERE, "..", "..", "app", "src", "data", "seedActivities.ts")

PIECES = {  # 10 shipped + 5 proposed in Slice 30 (C1)
    "eq-trampett", "eq-satsbrada", "eq-plint", "eq-landningsmatta", "eq-tumblingmatta",
    "eq-madrass", "eq-mattberg", "eq-flickiskudde", "eq-airtrack", "eq-kon",
    "eq-kilmatta", "eq-racke", "eq-bom", "eq-rockring", "eq-skumblock",
}
BLOCKS = {"gathering", "warmup", "techniques", "strength", "fun_and_games"}
DIFF = {"intro", "easy", "medium", "hard"}
ID_RE = re.compile(r"^own-[a-z0-9-]{3,60}$")
MAX_OWN, MAX_STEPS, MAX_STEP_LEN = 100, 4, 180


def seed_index():
    try:
        text = open(SEED, encoding="utf-8").read()
    except OSError:
        return set(), set()
    ids = set(re.findall(r"id: '([a-z0-9-]+)'", text))
    titles = {t.strip().lower() for t in re.findall(r"title: '([^']+)'", text)}
    return ids, titles


def steps(how):
    return [re.sub(r"^\s*\d+\.\s*", "", l).strip() for l in str(how).split("\n") if l.strip()]


def check(doc):
    errs, rows = [], []
    if doc.get("format") != "traningsplaneraren.ovningar":
        errs.append("format must be 'traningsplaneraren.ovningar'")
    if doc.get("schemaVersion") != 1:
        errs.append("schemaVersion must be 1")
    ex = doc.get("exercises")
    if not isinstance(ex, list) or not ex:
        return errs + ["exercises must be a non-empty array"], rows
    if len(ex) > MAX_OWN:
        errs.append(f"more than {MAX_OWN} exercises")
    seed_ids, seed_titles = seed_index()
    file_ids = [e.get("id") for e in ex if isinstance(e, dict)]
    seen = set()
    for e in ex:
        bad, notes = [], []
        i = e.get("id", "?")
        if not isinstance(i, str) or not ID_RE.match(i): bad.append("bad id")
        if i in seen: bad.append("duplicate id in file")
        seen.add(i)
        for f in ("title", "summary", "watchFor"):
            if not str(e.get(f, "")).strip(): bad.append(f"missing {f}")
        if e.get("blockType") not in BLOCKS: bad.append("bad blockType")
        if e.get("blockType") != "gathering" and not str(e.get("safetyLine", "")).strip():
            bad.append("missing safetyLine")
        st = steps(e.get("howTo", ""))
        if not st: bad.append("missing howTo")
        if len(st) > MAX_STEPS: notes.append(f"Förkortad: {len(st)} steps -> {MAX_STEPS}")
        if any(len(s) > MAX_STEP_LEN for s in st): notes.append("Förkortad: step > 180 chars")
        for f, lim in (("title", 80), ("summary", 240), ("watchFor", 240), ("safetyLine", 240)):
            if len(str(e.get(f, ""))) > lim: notes.append(f"Förkortad: {f} > {lim}")
        if e.get("difficulty") not in (None, *DIFF): notes.append("difficulty -> easy")
        tags = e.get("tags") or []
        if len(tags) > 8 or any(len(str(t)) > 24 for t in tags): notes.append("tags clipped")
        eq = e.get("defaultStationEquipment") or []
        if eq and e.get("blockType") != "techniques": notes.append("redskap dropped (not Teknik)")
        unknown = [s.get("pieceId") for s in eq if s.get("pieceId") not in PIECES]
        if unknown: notes.append(f"Okänt redskap togs bort: {', '.join(map(str, unknown))}")
        for f in ("progressionOf", "regressionOf"):
            ref = e.get(f)
            if ref and ref not in seed_ids and ref not in file_ids:
                notes.append(f"{f} '{ref}' unknown here (kept only if coach has it as own)")
        src = e.get("source")
        if src is not None:
            url = str(src.get("url", ""))
            if not url.startswith("https://") or len(url) > 300 or not str(src.get("creator", "")).strip():
                notes.append("Källa togs bort (needs https url + creator)")
        if str(e.get("title", "")).strip().lower() in seed_titles: notes.append("Samma namn finns (seed)")
        if "needsCoachReview" not in e: notes.append("needsCoachReview -> true")
        rows.append((i, "INVALID: " + "; ".join(bad) if bad else "ok", notes))
    return errs, rows


def main():
    if len(sys.argv) != 2:
        print(__doc__); return 2
    doc = json.load(open(sys.argv[1], encoding="utf-8"))
    errs, rows = check(doc)
    for err in errs: print("FILE ERROR:", err)
    for i, state, notes in rows:
        print(f"- {i}: {state}" + ("".join(f"\n    · {n}" for n in notes)))
    ok = not errs and all(s == "ok" for _, s, _ in rows)
    print("RESULT:", "PASS" if ok else "CHECK")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

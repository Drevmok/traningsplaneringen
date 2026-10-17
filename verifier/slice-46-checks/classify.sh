#!/usr/bin/env bash
# Slice 46: FAIL ids of each old smoke (this run) vs the Slice 45 run (patched baseline), plus cause tags.
B=${2:-/workspace/s46v/wt/verifier/slice-45-checks/smokes-patched}; N=${1:-/workspace/s46v/smk/out}
for f in $N/slice-*.txt; do n=$(basename $f); bf=$B/$n; [ -f $bf ] || bf=/workspace/s46v/wt/verifier/slice-45-checks/smokes/$n
  fid() { grep -oE '^FAIL \[[^]]+\]' "$1" 2>/dev/null | sort -u; }
  p=$(grep -cE '^PASS' $f); x=$(grep -cE '^FAIL' $f); bp=$(grep -cE '^PASS' $bf 2>/dev/null); bx=$(grep -cE '^FAIL' $bf 2>/dev/null)
  new=$(comm -13 <(fid $bf) <(fid $f) | sed 's/^FAIL //' | tr '\n' ' ')
  tags=$(grep -E '^FAIL' $f | grep -oE "name: '(Tomt pass|Från mall|Nästa|Skapa pass|Stäng)'|hasText: /\^?\(?(Starta f|F)rån mall|Tomt pass|Nästa|Skapa pass|wizard|Från mall|Planera ditt|Fortsätt senaste|Om utkast|Sparas lokalt" | sort | uniq -c | sort -rn | head -4 | awk '{c=$1; $1=""; printf "%s×%s;", c, $0}')
  echo "$n | now $p/$x | s45 ${bp:-–}/${bx:-–} | new FAIL: ${new:-–} | causes: ${tags:-–}"; done

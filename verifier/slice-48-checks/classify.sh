#!/usr/bin/env bash
# Slice 48: PASS/FAIL of each smoke (this run) vs the Slice 47 run baseline, new FAIL ids, cause tags (Slice 48 hall/row changes).
N=${1:-/workspace/s48v/smk/out}; B=${2:-/workspace/s48v/wt/verifier/slice-47-checks/smokes}
for f in $N/slice-*.txt; do n=$(basename $f); bf=$B/$n
  fid() { grep -oE '^FAIL \[[^]]+\]' "$1" 2>/dev/null | sort -u; }
  p=$(grep -cE '^PASS' $f); x=$(grep -cE '^FAIL' $f); bp=$(grep -cE '^PASS' $bf 2>/dev/null); bx=$(grep -cE '^FAIL' $bf 2>/dev/null)
  new=$(comm -13 <(fid $bf) <(fid $f) | sed 's/^FAIL //' | tr '\n' ' ')
  tags=$(grep -E '^FAIL' $f | grep -oE "Hallöversikt|Mer|Fler saker|dragstart|DataTransfer|draggable|handleTrayDrop|Ändra stationer|hall-chip|Placera här|Slice 48" | sort | uniq -c | sort -rn | head -4 | awk '{c=$1; $1=""; printf "%s×%s;", c, $0}')
  echo "$n | now $p/$x | s47 ${bp:-–}/${bx:-–} | new FAIL: ${new:-–} | causes: ${tags:-–}"; done

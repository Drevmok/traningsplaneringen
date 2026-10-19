#!/usr/bin/env bash
# Slice 47: PASS/FAIL of each smoke (this run) vs the Slice 46 run baseline, new FAIL ids, cause tags (removed Slice 47 UI).
N=${1:-/workspace/s47v/smk/out}; B=${2:-/workspace/s47v/wt/verifier/slice-46-checks/smokes}
for f in $N/slice-*.txt; do n=$(basename $f); bf=$B/$n
  fid() { grep -oE '^FAIL \[[^]]+\]' "$1" 2>/dev/null | sort -u; }
  p=$(grep -cE '^PASS' $f); x=$(grep -cE '^FAIL' $f); bp=$(grep -cE '^PASS' $bf 2>/dev/null); bx=$(grep -cE '^FAIL' $bf 2>/dev/null)
  new=$(comm -13 <(fid $bf) <(fid $f) | sed 's/^FAIL //' | tr '\n' ' ')
  tags=$(grep -E '^FAIL' $f | grep -oE "Bibliotek|Tips|Mallar|Ny egen övning|Importera övningar|ikväll|Vad finns i hallen|Så ni gör|side-tab|role: 'tab'|ownHint|Mina mallar|Slice 4[67]|Logga in som admin" | sort | uniq -c | sort -rn | head -4 | awk '{c=$1; $1=""; printf "%s×%s;", c, $0}')
  echo "$n | now $p/$x | s46 ${bp:-–}/${bx:-–} | new FAIL: ${new:-–} | causes: ${tags:-–}"; done

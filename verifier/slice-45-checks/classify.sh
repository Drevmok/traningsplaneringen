#!/usr/bin/env bash
# Compare FAIL ids of each old smoke (Slice 45 run) with the Slice 44 baseline.
B=/workspace/s45v/wt/verifier/slice-44-checks/smokes; N=${1:-/workspace/s45v/smk/out}
for f in $N/slice-*.txt; do n=$(basename $f); fid() { grep -oE '^FAIL \[[^]]+\]' "$1" 2>/dev/null | sort -u; }
  p=$(grep -cE '^PASS' $f); x=$(grep -cE '^FAIL' $f); bp=$(grep -cE '^PASS' $B/$n 2>/dev/null); bx=$(grep -cE '^FAIL' $B/$n 2>/dev/null)
  new=$(comm -13 <(fid $B/$n) <(fid $f) | sed 's/^FAIL //' | tr '\n' ' '); gone=$(comm -23 <(fid $B/$n) <(fid $f) | sed 's/^FAIL //' | tr '\n' ' ')
  echo "$n | now $p/$x | s44 ${bp:-–}/${bx:-–} | new: ${new:-–} | fixed/gone: ${gone:-–}"; done

#!/usr/bin/env bash
# Slice 50 (F1): weekly full smoke loop against main HEAD on the stand-in.
#   Doctor → run-smokes --all (every script in smoke-map, including inLoop=false) against the main cache →
#   /home/box/tp-verify/weekly/<år>-v<vecka>.md → diff against the previous week's file.
# Exit 0 = no new FAIL, 3 = new FAIL vs last week (the routine posts one line in the Docs chat only then), 1 = Doctor BLOCKED.
# The routine (Sunday 03:00 Europe/Stockholm) is NOT created by this slice; PO creates it after Christoffer's OK.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
TPV_HOME="${TPV_HOME:-/home/box/tp-verify}"; W="$TPV_HOME/weekly"; mkdir -p "$W"
WEEK="$(date +%G)-v$(date +%V)"; MD="$W/$WEEK.md"; OUT="$W/$WEEK-out"
PREV=$(ls "$W"/*-v*.md 2>/dev/null | grep -v "/$WEEK.md$" | sort | tail -1)
bash "$HERE/doctor.sh" > "$W/$WEEK-doctor.txt" 2>&1 || { echo "weekly $WEEK: Doctor BLOCKED — se $W/$WEEK-doctor.txt"; exit 1; }
SHA=$(git -C "$REPO" rev-parse origin/main); MC="$TPV_HOME/main/$SHA"
rm -rf "$OUT"
TPV_ROOT="$MC/wt" TPV_PLAIN="$MC/dist" TPV_BANK="$MC/bank-build" TPV_MAIN="$MC/dist" TPV_OUT="$OUT" TPV_RUN_TAG=weekly \
  bash "$HERE/run-smokes.sh" --baseline "$MC/smoke-baseline.txt" all > "$OUT.summary.txt" 2>&1   # Slice 51 D1: SAMMA/NY FAIL/LAGAD mot main
cnt() { local n; n=$(grep -c "$1" "$2" 2>/dev/null); echo "${n:-0}"; }   # Slice 54 F1: grep -c prints 0 and exits 1, so «|| echo 0» gave «0 0»
{
  echo "# Veckokörning $WEEK — main ${SHA:0:7} ($(date '+%Y-%m-%d %H:%M %Z'))"
  echo; echo '| Skript | Baslinje | Exit | PASS | FAIL | KARANTÄN |'; echo '|---|---|---|---|---|---|'
  for s in $(node -e "console.log(Object.keys(require('$REPO/verifier/smoke-map.json')).filter((k) => k !== 'karantan').join(' '))"); do
    l="$OUT/logs/$s.txt"; e=$(grep -m1 "^$s exit=" "$OUT.summary.txt" | sed 's/.* exit=\([0-9]*\).*/\1/')
    b=$(node -e "console.log(require('$REPO/verifier/smoke-map.json')['$s'].baseline)")
    echo "| $s | $b | ${e:-?} | $(cnt '^PASS \[' "$l") | $(cnt '^FAIL \[' "$l") | $(cnt '^KARANTÄN-FAIL \[' "$l") |"
  done
  echo; echo '## FAIL-id'; echo
  for l in "$OUT"/logs/*.txt; do s=$(basename "$l" .txt); case $s in *.standin|*.gotrue) continue;; esac
    grep -o '^FAIL \[[^]]*\]' "$l" | sed "s/^FAIL \[\(.*\)\]/- $s \1/"; done
  echo; echo '## Mot main-baslinjen'; echo; grep -E '^  [^ ]+: (SAMMA|NY FAIL|LAGAD|UTAN BASLINJE|KARANTÄN)' "$OUT.summary.txt" | sed 's/^  /- /' || echo '- (ingen)'
  echo; echo '## Netlog'; echo; grep -i "netlog" "$OUT.summary.txt" || echo "- (ingen sammanfattning)"
} > "$MD"
fails() { sed -n '/^## FAIL-id/,/^## Netlog/p' "$1" | grep '^- '; }
if [ -n "$PREV" ]; then
  NEW=$(comm -13 <(fails "$PREV" | sort) <(fails "$MD" | sort))
  { echo; echo "## Diff mot $(basename "$PREV")"; echo; [ -n "$NEW" ] && echo "$NEW" | sed 's/^- /- NYTT FAIL: /' || echo "- inga nya FAIL"; } >> "$MD"
  [ -n "$NEW" ] && { echo "weekly $WEEK: NYTT FAIL mot $(basename "$PREV" .md):"; echo "$NEW"; echo "($MD)"; exit 3; }
else echo -e "\n## Diff\n\n- första veckokörningen, inget att jämföra med" >> "$MD"; fi
echo "weekly $WEEK: inga nya FAIL ($MD)"

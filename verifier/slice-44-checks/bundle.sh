# Slice 44 verify: gzip -9 of every dist/assets JS + CSS, and of the eager part (files index.html loads), main vs branch.
for t in main wt; do d=/workspace/s44v/$t/app/dist; js=0; css=0; for f in $d/assets/*.js; do s=$(gzip -9c $f|wc -c); js=$((js+s)); done; for f in $d/assets/*.css; do s=$(gzip -9c $f|wc -c); css=$((css+s)); done
eager=0; for f in $(grep -oE 'assets/[^"]+\.(js|css)' $d/index.html | sort -u); do s=$(gzip -9c $d/$f|wc -c); eager=$((eager+s)); echo "  $t eager $f $s"; done
echo "$t JS=$js CSS=$css TOTAL=$((js+css)) EAGER=$eager"; for f in $d/assets/*.js $d/assets/*.css; do echo "  $(basename $f) raw=$(wc -c <$f) gz=$(gzip -9c $f|wc -c)"; done; done

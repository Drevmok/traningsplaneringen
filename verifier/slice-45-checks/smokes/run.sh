#!/usr/bin/env bash
# Slice 45 verify: ONE sequential loop of the old smokes (flock guard). Branch plain :57841, bank :57840 (https://bank-mock.supabase.co → local stand-in), main plain :57842.
exec 9>/workspace/s45v/smk/loop.lock; flock -n 9 || { echo "another loop is running"; exit 1; }
. /workspace/s45v/env.sh
P=http://127.0.0.1:57841/traningsplaneringen/; O=http://127.0.0.1:57840/traningsplaneringen/; M=http://127.0.0.1:57842/traningsplaneringen/; R=/workspace/s45v/smk
export PW_CORE=/workspace/s45v/pw/node_modules/playwright-core/index.mjs S32_DIR SMOKE_ROOT=$R S36_ON_URL=$O S36_OFF_URL=$P S37_URL=$O S37V_ON=$O S37V_PLAIN=$P S37V_MAIN=$M S37V_OUT=$R/out S32_ON_URL=$O S32_OFF_URL=$P S33_ON_URL=$O S33_OFF_URL=$P S34_URL=$P S35_ON=$O S35_OFF=$P S35V_ON=$O S35V_OFF=$P S38_URL=$P S38_ROOT=$R S39_URL=$P S39_ROOT=$R S40_MAIN=$M S40_BR=$P S40_ROOT=$R S41_BR=$P S41_ROOT=$R S42_BR=$P S42_ROOT=$R S43_BR=$P S43_MAIN=$M S43_ROOT=$R S44_BR=$P S44_MAIN=$M S44_ROOT=$R S45_BR=$P S45_MAIN=$M S45_ROOT=$R BR=$P MAIN=$M ON=$O SS=$R/out/s39_
cd $R/verifier
for f in ${LIST:-slice-45-builder-smoke slice-44-builder-smoke slice-44-verify slice-43-builder-smoke slice-43-verify slice-42-verify slice-42-builder-smoke slice-41-reverify-b slice-41-builder-smoke slice-40-builder-smoke slice-40-reverify slice-39-builder-smoke slice-39-verify slice-38-builder-smoke slice-38-verify slice-37-builder-smoke slice-37-verify slice-36-builder-smoke slice-36-verify slice-35-builder-smoke slice-35-verify slice-34-builder-smoke slice-34-verify slice-33-builder-smoke slice-32-builder-smoke}; do echo "$(date +%H:%M) start $f"; timeout 700 node $f.mjs > $R/out/$f.txt 2>&1; echo "$(date +%H:%M) $f rc=$?"; done
echo ALLDONE

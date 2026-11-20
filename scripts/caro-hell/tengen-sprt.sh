#!/bin/sh
# SPRT between two Tengen builds under the blocked-ends rule, from the balanced openings in
# scripts/caro-hell/openings/ (games from a near-empty board are decided by who moves first).
#
#   sh scripts/caro-hell/tengen-sprt.sh "<new brain command>" ["<base brain command>"] [size] [turn ms]
#
# Brains are Piskvork engines, e.g. "ml-data/engines/tengen/target/release/pbrain-tengen --weights w.txt".
set -eu
cd "$(dirname "$0")/../.."
BIN=ml-data/engines/tengen/target/release
NEW=$1
BASE=${2:-$BIN/pbrain-tengen}
SIZE=${3:-15}
TURN_MS=${4:-100}
"$BIN/tengen-arena" --new "$NEW" --base "$BASE" --openings "scripts/caro-hell/openings/caro-$SIZE.txt" \
  --rule freestyle-caro --size "$SIZE" --turn-ms "$TURN_MS" --games 4000 --sprt 0,10 \
  --concurrency "${CONCURRENCY:-6}"

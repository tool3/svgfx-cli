#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cli="node $here/../dist/cli.js"
src="$here/sources"
out="$here/svgs"

mkdir -p "$out"

$cli "$src/scene.svg"  -p crt                                   -o "$out/crt.svg"        -q
$cli "$src/scene.svg"  -e "glitch:intensity=0.8,slices=10"      -o "$out/glitch.svg"     -q
$cli "$src/tones.svg"  -e "halftone:size=5,angle=15"            -o "$out/halftone.svg"   -q
$cli "$src/tones.svg"  -p riso                                  -o "$out/riso.svg"       -q
$cli "$src/mark.svg"   -p neon                                  -o "$out/neon.svg"       -q
$cli "$src/motion.svg" -p crt                                   -o "$out/motion-crt.svg" -q

cat "$src/scene.svg" | $cli -e "bloom:radius=8" -e "scanlines:gap=3" -e "grain:amount=0.3" > "$out/stacked.svg"

echo "Wrote $(ls -1 "$out" | wc -l | tr -d ' ') examples into examples/svgs"

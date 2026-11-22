#!/bin/sh
# Builds native TensorFlow for the training scripts (CPU only, no GPU needed; 10-1000x faster
# than the pure JavaScript backend). pnpm skips this build on purpose (pnpm-workspace.yaml) so
# Vercel deploys stay small. There is no prebuilt binding for Apple Silicon, so it is compiled
# here; that needs the Xcode command line tools (xcode-select --install) and python3.
set -e
cd "$(dirname "$0")/../.."
DIR=$(node -p "require('path').dirname(require.resolve('@tensorflow/tfjs-node/package.json'))")
GYP=$(mktemp -d)
trap 'rm -rf "$GYP"' EXIT
echo "[setup] installing node-gyp into a temporary folder"
pnpm --dir "$GYP" add node-gyp@11 >/dev/null
echo "[setup] downloading libtensorflow and building the binding (a few minutes)"
cd "$DIR"
PATH="$GYP/node_modules/.bin:$DIR/node_modules/.bin:$PATH" node scripts/install.js
echo "[setup] done; the training scripts will now print 'backend tensorflow'"

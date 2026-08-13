#!/usr/bin/env bash
# Local branch simulation: build every app and serve its dist/ output on the
# same fixed ports each app's vite.config.ts uses for `preview` in dev.
#
# Usage:
#   ./local-sim.sh            # build + serve every app, both containers
#   ./local-sim.sh --react    # build + serve the React stack only (mfe-container)
#   ./local-sim.sh --vue      # build + serve the Vue stack only (mfe-container-vue)
#
# Remotes (auth, dashboard, marketing, settings, shared) are shared by both
# containers, so they're always built/served regardless of which flag is passed.
# Press Ctrl+C to stop every preview server started by this script.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

REMOTES=(shared mfe-auth mfe-dashboard mfe-marketing mfe-settings)
CONTAINER=mfe-container
CONTAINER_VUE=mfe-container-vue

mode="both"
case "${1:-}" in
  --react) mode="react" ;;
  --vue) mode="vue" ;;
  "") mode="both" ;;
  *) echo "Unknown option: $1 (expected --react or --vue)" >&2; exit 1 ;;
esac

apps=("${REMOTES[@]}")
if [ "$mode" = "react" ] || [ "$mode" = "both" ]; then
  apps+=("$CONTAINER")
fi
if [ "$mode" = "vue" ] || [ "$mode" = "both" ]; then
  apps+=("$CONTAINER_VUE")
fi

echo "== Building: ${apps[*]} =="
for app in "${apps[@]}"; do
  echo "-- build: $app --"
  (cd "$app" && npm run build)
done

pids=()
cleanup() {
  echo
  echo "== Stopping preview servers =="
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

echo
echo "== Serving on fixed ports =="
for app in "${apps[@]}"; do
  (cd "$app" && npm run preview) &
  pids+=("$!")
  echo "-- $app started (pid $!) --"
done

echo
echo "All apps built and serving. Press Ctrl+C to stop."
wait

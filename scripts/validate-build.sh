#!/usr/bin/env bash
# Manual Build Validation (SG14 Key Topic 3) — automates the checks that can
# be verified from build artifacts alone. See BUILD-VALIDATION.md for the
# full checklist, including the checks that need a running browser.
#
# Usage:
#   ./scripts/validate-build.sh check              build every app, then validate dist/ output
#   ./scripts/validate-build.sh snapshot            build every app, save asset filenames to .build-snapshot/
#   ./scripts/validate-build.sh diff                build every app again, diff against .build-snapshot/
#   ./scripts/validate-build.sh reachable           curl each app's remoteEntry.js on its fixed port
#
# "snapshot" then "diff" is how you verify cache-busting after a dependency
# bump: snapshot before the bump, bump the dependency, then diff.
#
# "reachable" requires the apps to already be served, e.g. via ./local-sim.sh
# in another terminal.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

APPS=(shared mfe-auth mfe-dashboard mfe-marketing mfe-settings mfe-container mfe-container-vue)
declare -A PORTS=(
  [shared]=5178 [mfe-auth]=5174 [mfe-dashboard]=5175 [mfe-marketing]=5176
  [mfe-settings]=5177 [mfe-container]=5173 [mfe-container-vue]=5179
)
SNAPSHOT_DIR=".build-snapshot"

pass=0
fail=0

ok() { echo "  [PASS] $1"; pass=$((pass + 1)); }
bad() { echo "  [FAIL] $1"; fail=$((fail + 1)); }

build_all() {
  for app in "${APPS[@]}"; do
    echo "-- build: $app --"
    (cd "$app" && npm run build >/dev/null)
  done
}

# dist/assets structure + base path + remoteEntry.js + cache-busting filename pattern
check_app() {
  local app="$1"
  local dist="$app/dist"
  echo "== $app =="

  if [ -d "$dist/assets" ]; then
    local count
    count=$(find "$dist/assets" -type f | wc -l)
    ok "dist/assets/ exists ($count files)"
  else
    bad "dist/assets/ missing"
  fi

  if [ -f "$dist/remoteEntry.js" ]; then
    ok "dist/remoteEntry.js generated"
  else
    bad "dist/remoteEntry.js missing"
  fi

  if [ -f "$dist/index.html" ]; then
    # No app sets a custom `base`, so asset refs should be root-relative.
    if grep -qE 'src="/assets/|href="/assets/' "$dist/index.html"; then
      ok "index.html references /assets/ with root base path"
    else
      bad "index.html does not reference /assets/ as expected (check vite.config base)"
    fi
  fi

  if [ -d "$dist/assets" ]; then
    local unhashed=0
    while IFS= read -r -d '' f; do
      base=$(basename "$f")
      if [[ ! "$base" =~ -[A-Za-z0-9_-]{6,10}\.(js|css)$ ]]; then
        unhashed=$((unhashed + 1))
      fi
    done < <(find "$dist/assets" -type f \( -name "*.js" -o -name "*.css" \) -print0)
    if [ "$unhashed" -eq 0 ]; then
      ok "all JS/CSS assets carry a content hash in their filename (cache-busting)"
    else
      bad "$unhashed asset(s) missing a content hash in their filename"
    fi
  fi
}

cmd="${1:-check}"
case "$cmd" in
  check)
    build_all
    echo
    for app in "${APPS[@]}"; do check_app "$app"; echo; done
    echo "== Summary: $pass passed, $fail failed =="
    [ "$fail" -eq 0 ]
    ;;
  snapshot)
    build_all
    rm -rf "$SNAPSHOT_DIR"
    mkdir -p "$SNAPSHOT_DIR"
    for app in "${APPS[@]}"; do
      find "$app/dist" -type f \( -name "*.js" -o -name "*.css" \) -printf "%f\n" 2>/dev/null | sort >"$SNAPSHOT_DIR/$app.txt"
    done
    echo "Snapshot saved to $SNAPSHOT_DIR/. Bump a dependency/version, then run: $0 diff"
    ;;
  diff)
    if [ ! -d "$SNAPSHOT_DIR" ]; then
      echo "No snapshot found — run '$0 snapshot' first." >&2
      exit 1
    fi
    build_all
    echo
    for app in "${APPS[@]}"; do
      echo "== $app =="
      new_listing=$(mktemp)
      find "$app/dist" -type f \( -name "*.js" -o -name "*.css" \) -printf "%f\n" 2>/dev/null | sort >"$new_listing"
      if diff -q "$SNAPSHOT_DIR/$app.txt" "$new_listing" >/dev/null 2>&1; then
        bad "asset filenames identical to snapshot — hashes did NOT change after the bump"
      else
        ok "asset filenames changed vs. snapshot (cache-busting confirmed)"
        echo "  --- diff (snapshot vs. new) ---"
        diff "$SNAPSHOT_DIR/$app.txt" "$new_listing" | sed 's/^/  /' || true
      fi
      rm -f "$new_listing"
      echo
    done
    echo "== Summary: $pass passed, $fail failed =="
    [ "$fail" -eq 0 ]
    ;;
  reachable)
    for app in "${APPS[@]}"; do
      port="${PORTS[$app]}"
      url="http://localhost:$port/remoteEntry.js"
      code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
      code="${code:-000}"
      if [ "$code" = "200" ]; then
        ok "$app: $url reachable (HTTP $code)"
      else
        bad "$app: $url NOT reachable (HTTP $code) — is it being served? (./local-sim.sh)"
      fi
    done
    echo "== Summary: $pass passed, $fail failed =="
    [ "$fail" -eq 0 ]
    ;;
  *)
    echo "Unknown command: $cmd (expected check|snapshot|diff|reachable)" >&2
    exit 1
    ;;
esac

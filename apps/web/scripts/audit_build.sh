#!/bin/bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

REPORT_DIR="$ROOT_DIR/scripts/report"
mkdir -p "$REPORT_DIR"
BUILD_LOG="$REPORT_DIR/next-build.log"
SUMMARY="$REPORT_DIR/summary.txt"
> "$SUMMARY"

# 1) Run Next.js build (capture output, do not fail the script)
echo "[audit] Running Next.js build..." | tee -a "$SUMMARY"
( NEXT_TELEMETRY_DISABLED=1 npx --yes next build 2>&1 | tee "$BUILD_LOG" ) || true

# 2) Extract TypeScript errors from build log
echo "\n[audit] Extracting TS errors from build log..." | tee -a "$SUMMARY"
grep -E "Type error:|Failed to compile\.|Module not found:|Property '.*' is missing|is not assignable to type" "$BUILD_LOG" | sed 's/^/  /' | tee -a "$SUMMARY" || true

# 3) Pattern scans
scan() {
  local name="$1"; shift
  echo "\n[audit] $name" | tee -a "$SUMMARY"
  rg --hidden --no-ignore-vcs -n "$@" "apps/web" | sed 's/^/  /' | tee -a "$SUMMARY" || true
}

command -v rg >/dev/null 2>&1 || {
  echo "ripgrep (rg) not found. Install for richer reports: brew install ripgrep" | tee -a "$SUMMARY"
}

# Drawer issues
scan "Drawer with size= (should be width=)" "<Drawer[^>]*\\bsize=\"" -t tsx
scan "Self-closing Drawer (needs children)" "<Drawer[^>]*\\/>" -t tsx
scan "Drawer onOpenChange prop usage" "<Drawer[^>]*onOpenChange=" -t tsx
scan "Drawer unsupported flags" "enableComments=|enableActivity=|enableFiles=|onModeChange=" -t tsx

# DataGrid/DataView issues
scan "onRowClick prop usage (remove)" "onRowClick=" -t tsx

# Button variant default (map to primary)
scan "Button variant default" "variant=\{?['\"]default['\"]\}?" -t tsx

# FieldConfig unsupported types
scan "FieldConfig type 'time'" "type:\s*'time'" -t tsx -t ts
scan "FieldConfig type 'datetime'" "type:\s*'datetime'" -t tsx -t ts

# Supabase client usage (flag for review)
scan "@supabase/auth-helpers-nextjs imports" "@supabase/auth-helpers-nextjs"
scan "createClientComponentClient usages" "createClientComponentClient" -t tsx -t ts

# ViewSwitcher props (flag for review)
scan "ViewSwitcher with props" "<ViewSwitcher[^>]" -t tsx

# Summary footer
echo "\n[audit] Report written to: $SUMMARY" | tee -a "$SUMMARY"
echo "[audit] Build log: $BUILD_LOG" | tee -a "$SUMMARY"

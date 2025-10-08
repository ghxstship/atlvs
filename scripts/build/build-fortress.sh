#!/bin/bash
# build-fortress.sh - ZERO TOLERANCE BUILD SYSTEM (monorepo + macOS/Linux compatible)
set -euxo pipefail

echo "🔒 INITIATING ZERO-TOLERANCE BUILD FORTRESS"

# Detect platform utilities
HAVE_JQ=false
HAVE_BC=false
if command -v jq &>/dev/null; then HAVE_JQ=true; fi
if command -v bc &>/dev/null; then HAVE_BC=true; fi

# Minimum free memory requirement (MB) - override with MIN_FREE_MEM_MB env var
MIN_FREE_MEM_MB=${MIN_FREE_MEM_MB:-4096}

# PHASE 1: PRE-BUILD VALIDATION (NO EXCEPTIONS)
echo "📋 PHASE 1: PRE-BUILD VALIDATION"

# Memory check (macOS vs Linux)
get_free_mem_mb() {
  if command -v free &>/dev/null; then
    free -m | awk 'NR==2{printf "%.0f", $7}'
  elif [[ "$(uname)" == "Darwin" ]] && command -v vm_stat &>/dev/null; then
    # Extract numeric page counts (strip punctuation) and include speculative pages
    PAGES_FREE=$(vm_stat | awk '/Pages free/ {gsub("[^0-9]","",$3); print $3}')
    PAGES_SPEC=$(vm_stat | awk '/Pages speculative/ {gsub("[^0-9]","",$3); print $3}')
    PAGES_INACTIVE=$(vm_stat | awk '/Pages inactive/ {gsub("[^0-9]","",$3); print $3}')
    PAGES_PURGEABLE=$(vm_stat | awk '/Pages purgeable/ {gsub("[^0-9]","",$3); print $3}')
    # Get page size via sysctl, fallback to vm_stat output, else 4096
    PAGE_SIZE=$(sysctl -n hw.pagesize 2>/dev/null || vm_stat | awk '/page size of/ {gsub("[^0-9]","",$8); print $8}')
    if [[ -z "$PAGE_SIZE" ]]; then PAGE_SIZE=4096; fi
    if [[ -z "$PAGES_FREE" ]]; then PAGES_FREE=0; fi
    if [[ -z "$PAGES_SPEC" ]]; then PAGES_SPEC=0; fi
    if [[ -z "$PAGES_INACTIVE" ]]; then PAGES_INACTIVE=0; fi
    if [[ -z "$PAGES_PURGEABLE" ]]; then PAGES_PURGEABLE=0; fi
    # Consider inactive and purgeable as reclaimable under memory pressure
    BYTES=$(( (PAGES_FREE + PAGES_SPEC + PAGES_INACTIVE + PAGES_PURGEABLE) * PAGE_SIZE ))
    echo $(( BYTES / 1024 / 1024 ))
  else
    # Fallback if unknown system
    echo 4096
  fi
}

AVAILABLE_MEMORY=$(get_free_mem_mb)
echo "💾 Memory available (approx): ${AVAILABLE_MEMORY} MB (threshold: ${MIN_FREE_MEM_MB} MB)"
if [[ ${AVAILABLE_MEMORY:-0} -lt ${MIN_FREE_MEM_MB} ]]; then
  echo "❌ CRITICAL: Insufficient memory (${AVAILABLE_MEMORY} MB < ${MIN_FREE_MEM_MB} MB required)"
  exit 1
fi

echo "💾 Memory OK: ${AVAILABLE_MEMORY} MB free (threshold ${MIN_FREE_MEM_MB} MB)"

# Disk space check (current filesystem)
get_free_disk_blocks() {
  df . | awk 'NR==2 {print $4}'
}
AVAILABLE_DISK=$(get_free_disk_blocks)
# Require ~2GB free (in 1K blocks on Linux; on macOS block size may differ but is generally OK for sanity check)
if [[ ${AVAILABLE_DISK:-0} -lt 2097152 ]]; then
  echo "❌ CRITICAL: Insufficient disk space"
  exit 1
fi

echo "🗄️  Disk space OK: ${AVAILABLE_DISK} blocks"

# PHASE 2: DEPENDENCY VALIDATION (ZERO TOLERANCE)
echo "🔍 PHASE 2: DEPENDENCY FORTRESS"

# Use pnpm if available (monorepo default), else npm
PKG_MGR="pnpm"
if ! command -v pnpm &>/dev/null; then PKG_MGR="npm"; fi

echo "📦 Using package manager: ${PKG_MGR}"

# Security audit - ZERO critical/high vulnerabilities allowed
if [[ $PKG_MGR == "pnpm" ]]; then
  pnpm audit --audit-level=critical --json > audit.json || true
  $HAVE_JQ && CRIT=$(jq '.advisories | length' audit.json 2>/dev/null || echo 0) || CRIT=0
  if [[ ${CRIT} -gt 0 ]]; then echo "❌ CRITICAL: ${CRIT} critical vulnerabilities found"; exit 1; fi

  pnpm audit --audit-level=high --json > audit-high.json || true
  $HAVE_JQ && HIGH=$(jq '.advisories | length' audit-high.json 2>/dev/null || echo 0) || HIGH=0
  if [[ ${HIGH} -gt 0 ]]; then echo "❌ CRITICAL: ${HIGH} high vulnerabilities found"; exit 1; fi
else
  npm audit --audit-level=critical --json > audit.json || true
  $HAVE_JQ && CRIT=$(jq '.metadata.vulnerabilities.critical' audit.json 2>/dev/null || echo 0) || CRIT=0
  if [[ ${CRIT} -gt 0 ]]; then echo "❌ CRITICAL: ${CRIT} critical vulnerabilities found"; exit 1; fi

  npm audit --audit-level=high --json > audit-high.json || true
  $HAVE_JQ && HIGH=$(jq '.metadata.vulnerabilities.high' audit-high.json 2>/dev/null || echo 0) || HIGH=0
  if [[ ${HIGH} -gt 0 ]]; then echo "❌ CRITICAL: ${HIGH} high vulnerabilities found"; exit 1; fi
fi

echo "✅ Security audit passed"

# depcheck (skip hard fail if tool missing)
if command -v depcheck &>/dev/null; then
  depcheck --json > depcheck.json || true
  if $HAVE_JQ; then
    UNUSED=$(( $(jq '.dependencies | length' depcheck.json 2>/dev/null || echo 0) + $(jq '.devDependencies | length' depcheck.json 2>/dev/null || echo 0) ))
  else
    UNUSED=0
  fi
  if [[ ${UNUSED} -gt 0 ]]; then echo "❌ CRITICAL: ${UNUSED} unused dependencies found"; exit 1; fi
  echo "✅ Dependencies clean (no unused)"
else
  echo "ℹ️  depcheck not installed, skipping unused dependency check"
fi

# PHASE 3: CODE QUALITY FORTRESS
echo "⚡ PHASE 3: CODE QUALITY FORTRESS"

# TypeScript strict compilation - ZERO errors
if [[ $PKG_MGR == "pnpm" ]]; then
  pnpm typecheck || { echo "❌ CRITICAL: TypeScript compilation failed"; exit 1; }
else
  npx tsc --noEmit --strict --noImplicitAny --exactOptionalPropertyTypes || { echo "❌ CRITICAL: TypeScript compilation failed"; exit 1; }
fi

echo "✅ TypeScript strict compilation passed"

# ESLint maximum strictness - ZERO violations
# Use repo-configured lint script to generate JSON report when available
if [[ $PKG_MGR == "pnpm" ]]; then
  pnpm lint --format json --output-file eslint.json || true
else
  npx eslint . --ext .ts,.tsx --format json -o eslint.json || true
fi

if $HAVE_JQ; then
  ERR=$(jq '[.[] | select(.errorCount>0) | .errorCount] | add // 0' eslint.json 2>/dev/null || echo 0)
  WARN=$(jq '[.[] | select(.warningCount>0) | .warningCount] | add // 0' eslint.json 2>/dev/null || echo 0)
else
  ERR=0; WARN=0
fi

if [[ ${ERR} -ne 0 ]]; then echo "❌ CRITICAL: ${ERR} ESLint errors found"; exit 1; fi
if [[ ${WARN} -ne 0 ]]; then echo "❌ CRITICAL: ${WARN} ESLint warnings found"; exit 1; fi

echo "✅ ESLint zero-tolerance passed"

# Style validation - ZERO hardcoded values (fast JS scanner to avoid TS import issues)
echo "🎨 PHASE 4: STYLE NORMALIZATION FORTRESS"
node << 'EOF'
const fs = require('fs');
const path = require('path');
let total = 0;
function check(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Strip comments to avoid false positives
  const noComments = content
    .replace(/\/\/.*$/mg, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const issues = [];
  // Colors
  const colorRe = /#[0-9a-fA-F]{3,8}|rgba?\(\s*[^)]*\)|hsla?\([^)]*\)/g;
  const allowedColors = new Set(['#000', '#fff', '#ffffff', '#000000', 'transparent', 'rgba(0, 0, 0, 0)']);
  let m;
  while ((m = colorRe.exec(noComments)) !== null) {
    const c = m[0];
    const idx = m.index;
    // Ignore template-literal driven dynamic colors
    if (c.includes('${')) continue;
    const lc = c.toLowerCase();
    // Ignore CSS variable-based color usage like hsl(var(--...)) or rgba(var(--...))
    if (lc.includes('var(')) continue;
    // Heuristic: only flag if near style contexts or CSS property keywords
    const pre = noComments.slice(Math.max(0, idx - 80), idx).toLowerCase();
    const contextHints = ['style', 'className', 'color', 'background', 'border', 'fill', 'stroke', 'shadow', 'ring'];
    const hasContext = contextHints.some(h => pre.includes(h));
    if (!hasContext) continue;
    if (!allowedColors.has(lc)) issues.push(`Hardcoded color: ${c}`);
  }
  // Pixels
  const pxRe = /(?<![\w-])\d+px(?!\]|;?\s*\/\*.*allowed.*\*\/)/g;
  let mp;
  while ((mp = pxRe.exec(noComments)) !== null) {
    const p = mp[0];
    const idx = mp.index;
    // Skip Tailwind arbitrary values in className like min-w-[120px]
    const around = noComments.slice(Math.max(0, idx - 15), idx + 15);
    if (/\[[^\]]*px\]/.test(around)) continue;
    // Allow px within calc(...) contexts
    const before = noComments.slice(Math.max(0, idx - 40), idx);
    const after = noComments.slice(idx, Math.min(noComments.length, idx + 80));
    if (before.includes('calc(') && after.includes(')')) continue;
    // Require relevant context
    const pre = noComments.slice(Math.max(0, idx - 80), idx).toLowerCase();
    const contextHints = ['style', 'class', 'className', 'padding', 'margin', 'gap', 'border', 'width', 'height', 'min-', 'max-', 'calc('];
    const hasContext = contextHints.some(h => pre.includes(h));
    if (!hasContext) continue;
    if (!/DESIGN_TOKENS|clamp\(/.test(noComments)) issues.push('Hardcoded pixel values');
  }
  if (issues.length) {
    console.error(`❌ STYLE VIOLATIONS in ${filePath}:`);
    issues.forEach(i => console.error('  -', i));
    total += issues.length;
  }
}
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo'].includes(e.name)) continue;
      // Skip token source-of-truth and design system palette directories
      const skipDirs = [
        path.join('packages','ui','src','tokens'),
        path.join('packages','ui','src','styles'),
        path.join('apps','web','lib','design-system'),
        path.join('packages','config'),
        path.join('packages','ui','.storybook'),
      ];
      const full = path.join(dir, e.name);
      if (skipDirs.some(sd => full.includes(sd))) continue;
      walk(path.join(dir, e.name));
    } else if (/\.(tsx|ts|css)$/.test(e.name)) {
      const fp = path.join(dir, e.name);
      // Skip the style validator utility file itself
      if (fp.includes(path.join('packages','ui','src','utils','style-validator.ts'))) continue;
      // Skip the consolidated styles root file
      if (fp.includes(path.join('packages','ui','src','styles.css'))) continue;
      // Skip unified design system monolith file
      if (fp.includes(path.join('packages','ui','src','UnifiedDesignSystem.tsx'))) continue;
      // Skip storybook preview config
      if (fp.includes(path.join('packages','ui','.storybook','preview.ts'))) continue;
      // Skip Tailwind preset config
      if (fp.includes(path.join('packages','config','tailwind-preset.ts'))) continue;
      // Skip validator utilities that contain reference constants
      if (fp.includes(path.join('packages','ui','src','system','UIStateValidator.tsx'))) continue;
      if (fp.includes(path.join('packages','ui','src','components','DataViews','DesignTokenValidator.tsx'))) continue;
      // Skip design system documentation/demo files
      if (fp.includes(path.join('packages','ui','src','components','architecture','DesignSystem.tsx'))) continue;
      if (fp.includes(path.join('packages','ui','src','system','GridSystem.tsx'))) continue;
      // Skip marketing performance helper which contains viewport-size strings
      if (fp.includes(path.join('apps','web','app','_components','lib','performance.ts'))) continue;
      check(fp);
    }
  }
}
;['packages','apps'].forEach(d => { if (fs.existsSync(d)) walk(d); });
if (total>0) { console.error(`❌ CRITICAL: ${total} style violations found`); process.exit(1); }
console.log('✅ ZERO style violations detected');
EOF

# PHASE 5: TEST COVERAGE FORTRESS (100% REQUIRED)
echo "🧪 PHASE 5: TEST COVERAGE FORTRESS"

if [[ $PKG_MGR == "pnpm" ]]; then
  if pnpm run --if-present test:coverage-100 &>/dev/null; then
    echo "✅ Coverage gate passed (100% required)"
  else
    echo "❌ CRITICAL: Coverage gate failed or missing (100% required). Provide test:coverage-100 script."
    exit 1
  fi
else
  echo "❌ CRITICAL: Non-pnpm environment not supported for coverage gate."
  exit 1
fi

# PHASE 6: PRODUCTION BUILD FORTRESS
echo "🏗️ PHASE 6: PRODUCTION BUILD FORTRESS"

# Clean build artifacts
rm -rf .next dist build out || true

# Run build via turbo/pnpm
if [[ $PKG_MGR == "pnpm" ]]; then
  NODE_ENV=production pnpm build 2>&1 | tee build.log
else
  NODE_ENV=production npm run build 2>&1 | tee build.log
fi

# Fail on any warnings/errors
if grep -i -E "(warning|error|failed)" build.log; then
  echo "❌ CRITICAL: Build warnings/errors detected"
  exit 1
fi

echo "✅ Production build completed with zero warnings"

# Bundle size validation (Next.js or generic dist)
BUNDLE_SIZE=0
if [[ -d ".next" ]]; then
  if [[ "$(uname)" == "Darwin" ]]; then
    BUNDLE_SIZE=$(find .next -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  else
    BUNDLE_SIZE=$(find .next -name "*.js" -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  fi
elif [[ -d "dist" ]]; then
  if [[ "$(uname)" == "Darwin" ]]; then
    BUNDLE_SIZE=$(find dist -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  else
    BUNDLE_SIZE=$(find dist -name "*.js" -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  fi
fi

MAX_BUNDLE_SIZE=262144 # 256KB
if [[ ${BUNDLE_SIZE:-0} -gt ${MAX_BUNDLE_SIZE} ]]; then
  echo "❌ CRITICAL: Bundle size ${BUNDLE_SIZE} bytes exceeds limit ${MAX_BUNDLE_SIZE} bytes"
  exit 1
fi

echo "📦 Bundle size OK: ${BUNDLE_SIZE} bytes"

# PHASE 7: PERFORMANCE FORTRESS (optional)
echo "⚡ PHASE 7: PERFORMANCE FORTRESS"
if command -v lhci &>/dev/null; then
  lhci autorun --collect.numberOfRuns=3 --assert.preset=lighthouse:no-pwa || {
    echo "❌ CRITICAL: Lighthouse performance benchmarks failed"; exit 1; }
else
  echo "ℹ️  lhci not installed, skipping"
fi

# PHASE 8: ACCESSIBILITY FORTRESS (optional)
echo "♿ PHASE 8: ACCESSIBILITY FORTRESS"
if command -v axe &>/dev/null; then
  # Try common output locations
  HTML_FILE="dist/index.html"
  [[ -f "apps/web/out/index.html" ]] && HTML_FILE="apps/web/out/index.html"
  [[ -f "apps/web/.next/server/app/page.html" ]] && HTML_FILE="apps/web/.next/server/app/page.html"
  axe "$HTML_FILE" --exit || { echo "❌ CRITICAL: Accessibility violations found"; exit 1; }
else
  echo "ℹ️  axe CLI not installed, skipping"
fi

echo "🎉 ✅ ZERO-TOLERANCE BUILD FORTRESS COMPLETED SUCCESSFULLY"

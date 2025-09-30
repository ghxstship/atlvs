#!/bin/bash
# BUNDLE SIZE OPTIMIZATION - ZERO TOLERANCE MODE
set -euo pipefail

echo "📦 BUNDLE SIZE OPTIMIZATION - ZERO TOLERANCE MODE"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# =============================================================================
# PHASE 1: ANALYZE CURRENT BUNDLE SIZE
# =============================================================================
echo ""
echo "📊 PHASE 1: BUNDLE SIZE ANALYSIS"
echo "================================"

log_info "Building production bundle for analysis..."
pnpm build > build-analysis.log 2>&1

if [[ -d "apps/web/.next" ]]; then
    # Calculate current bundle sizes
    TOTAL_JS_SIZE=$(find apps/web/.next -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    TOTAL_CSS_SIZE=$(find apps/web/.next -name "*.css" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    
    echo "📈 CURRENT BUNDLE METRICS:"
    echo "   - JavaScript: $(($TOTAL_JS_SIZE / 1024))KB"
    echo "   - CSS: $(($TOTAL_CSS_SIZE / 1024))KB"
    echo "   - Total: $(( ($TOTAL_JS_SIZE + $TOTAL_CSS_SIZE) / 1024 ))KB"
    
    # Set optimization targets
    TARGET_JS_SIZE=1048576  # 1MB target for JS
    TARGET_TOTAL_SIZE=2097152  # 2MB target total
    
    if [[ $TOTAL_JS_SIZE -gt $TARGET_JS_SIZE ]]; then
        log_warning "JavaScript bundle exceeds 1MB target"
        NEEDS_JS_OPTIMIZATION=true
    else
        log_success "JavaScript bundle within target size"
        NEEDS_JS_OPTIMIZATION=false
    fi
    
    if [[ $(($TOTAL_JS_SIZE + $TOTAL_CSS_SIZE)) -gt $TARGET_TOTAL_SIZE ]]; then
        log_warning "Total bundle exceeds 2MB target"
        NEEDS_TOTAL_OPTIMIZATION=true
    else
        log_success "Total bundle within target size"
        NEEDS_TOTAL_OPTIMIZATION=false
    fi
else
    log_warning "No build artifacts found"
    exit 1
fi

# =============================================================================
# PHASE 2: NEXT.JS OPTIMIZATION
# =============================================================================
echo ""
echo "⚡ PHASE 2: NEXT.JS OPTIMIZATION"
echo "==============================="

log_info "Optimizing Next.js configuration..."

# Create optimized next.config.js
cat > apps/web/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle optimization
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@ghxstship/ui',
      '@ghxstship/domain',
      '@ghxstship/application',
      'lucide-react',
      'react-hook-form',
      'zod'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Output optimization
  output: 'standalone',
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            ui: {
              test: /[\\/]packages[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
      
      // Tree shaking optimization
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
      };
    }
    
    return config;
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

log_success "Next.js configuration optimized"

# =============================================================================
# PHASE 3: PACKAGE.JSON OPTIMIZATION
# =============================================================================
echo ""
echo "📦 PHASE 3: PACKAGE.JSON OPTIMIZATION"
echo "====================================="

log_info "Optimizing package.json for tree shaking..."

# Add bundle optimization scripts to root package.json
if [[ -f "package.json" ]]; then
    # Create a temporary script to update package.json
    cat > /tmp/update-package.js << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add bundle optimization scripts
pkg.scripts = {
  ...pkg.scripts,
  'analyze-bundle': 'ANALYZE=true pnpm build',
  'optimize-bundle': './scripts/optimize-bundle-size.sh',
  'validate:bundle-size': 'node scripts/validate-bundle-size.js'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Package.json optimized for bundle analysis');
EOF

    node /tmp/update-package.js
    rm /tmp/update-package.js
fi

# =============================================================================
# PHASE 4: TREE SHAKING OPTIMIZATION
# =============================================================================
echo ""
echo "🌳 PHASE 4: TREE SHAKING OPTIMIZATION"
echo "====================================="

log_info "Optimizing imports for better tree shaking..."

# Create a script to optimize imports
cat > /tmp/optimize-imports.js << 'EOF'
const fs = require('fs');
const path = require('path');

function optimizeImports(content) {
  let optimized = content;
  
  // Optimize lodash imports
  optimized = optimized.replace(
    /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lodash['"];?/g,
    (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      return importList.map(imp => `import ${imp} from 'lodash/${imp}';`).join('\n');
    }
  );
  
  // Optimize date-fns imports
  optimized = optimized.replace(
    /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]date-fns['"];?/g,
    (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      return importList.map(imp => `import ${imp} from 'date-fns/${imp}';`).join('\n');
    }
  );
  
  // Optimize lucide-react imports (already optimized, but ensure consistency)
  optimized = optimized.replace(
    /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"];?/g,
    'import { $1 } from "lucide-react";'
  );
  
  return optimized;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const optimized = optimizeImports(content);
    
    if (content !== optimized) {
      fs.writeFileSync(filePath, optimized);
      console.log(`✅ Optimized imports in: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function walkDirectory(dir) {
  let optimizedFiles = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
        optimizedFiles += walkDirectory(filePath);
      } else if (file.match(/\.(ts|tsx)$/)) {
        optimizedFiles += processFile(filePath);
      }
    });
  } catch (error) {
    // Ignore directory read errors
  }
  
  return optimizedFiles;
}

// Process packages and apps directories
let totalOptimized = 0;
['packages', 'apps'].forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n🔍 Processing ${dir} directory...`);
    totalOptimized += walkDirectory(dir);
  }
});

console.log(`\n📊 Import optimization completed: ${totalOptimized} files optimized`);
EOF

node /tmp/optimize-imports.js
rm /tmp/optimize-imports.js

# =============================================================================
# PHASE 5: REBUILD AND VALIDATE
# =============================================================================
echo ""
echo "🔄 PHASE 5: REBUILD AND VALIDATE"
echo "==============================="

log_info "Rebuilding with optimizations..."

# Clean build
rm -rf apps/web/.next

# Rebuild with optimizations
pnpm build > optimized-build.log 2>&1

if [[ -d "apps/web/.next" ]]; then
    # Calculate new bundle sizes
    NEW_JS_SIZE=$(find apps/web/.next -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    NEW_CSS_SIZE=$(find apps/web/.next -name "*.css" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    
    echo ""
    echo "📊 OPTIMIZATION RESULTS:"
    echo "========================"
    echo "BEFORE:"
    echo "   - JavaScript: $(($TOTAL_JS_SIZE / 1024))KB"
    echo "   - CSS: $(($TOTAL_CSS_SIZE / 1024))KB"
    echo "   - Total: $(( ($TOTAL_JS_SIZE + $TOTAL_CSS_SIZE) / 1024 ))KB"
    echo ""
    echo "AFTER:"
    echo "   - JavaScript: $(($NEW_JS_SIZE / 1024))KB"
    echo "   - CSS: $(($NEW_CSS_SIZE / 1024))KB"
    echo "   - Total: $(( ($NEW_JS_SIZE + $NEW_CSS_SIZE) / 1024 ))KB"
    echo ""
    
    # Calculate savings
    JS_SAVINGS=$(( ($TOTAL_JS_SIZE - $NEW_JS_SIZE) / 1024 ))
    TOTAL_SAVINGS=$(( (($TOTAL_JS_SIZE + $TOTAL_CSS_SIZE) - ($NEW_JS_SIZE + $NEW_CSS_SIZE)) / 1024 ))
    
    echo "SAVINGS:"
    echo "   - JavaScript: ${JS_SAVINGS}KB"
    echo "   - Total: ${TOTAL_SAVINGS}KB"
    
    # Validate against targets
    if [[ $NEW_JS_SIZE -le $TARGET_JS_SIZE ]]; then
        log_success "JavaScript bundle now within 1MB target!"
    else
        log_warning "JavaScript bundle still exceeds 1MB target"
    fi
    
    if [[ $(($NEW_JS_SIZE + $NEW_CSS_SIZE)) -le $TARGET_TOTAL_SIZE ]]; then
        log_success "Total bundle now within 2MB target!"
    else
        log_warning "Total bundle still exceeds 2MB target"
    fi
    
else
    log_warning "Optimized build failed"
    exit 1
fi

# Clean up temporary files
rm -f build-analysis.log optimized-build.log

echo ""
log_success "📦 BUNDLE OPTIMIZATION COMPLETED!"
echo -e "${GREEN}🎉 Bundle size optimization applied successfully!${NC}"

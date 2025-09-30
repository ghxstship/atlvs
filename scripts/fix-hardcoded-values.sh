#!/bin/bash
# AUTOMATED HARDCODED VALUE REPLACEMENT SCRIPT
# Zero-Tolerance Design Token Enforcement
set -euo pipefail

echo "🎨 FIXING HARDCODED VALUES - ZERO TOLERANCE MODE"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOTAL_FILES_FIXED=0
TOTAL_REPLACEMENTS=0

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Create Node.js script for comprehensive hardcoded value replacement
cat > /tmp/fix-hardcoded-values.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Comprehensive color mapping from hardcoded values to design tokens
const COLOR_REPLACEMENTS = {
  // Basic colors
  '#ffffff': 'hsl(var(--color-background))',
  '#fff': 'hsl(var(--color-background))',
  '#000000': 'hsl(var(--color-foreground))',
  '#000': 'hsl(var(--color-foreground))',
  
  // Brand colors
  '#0ea5e9': 'hsl(var(--color-primary))',
  '#00bfff': 'hsl(var(--color-primary))', // OPENDECK Blue
  '#ff00ff': 'hsl(var(--color-accent))', // ATLVS Pink
  '#22c55e': 'hsl(var(--color-success))', // Ghostship Green
  
  // Semantic colors
  '#ef4444': 'hsl(var(--color-destructive))',
  '#dc2626': 'hsl(var(--color-destructive))',
  '#10b981': 'hsl(var(--color-success))',
  '#16a34a': 'hsl(var(--color-success))',
  '#f59e0b': 'hsl(var(--color-warning))',
  '#d97706': 'hsl(var(--color-warning))',
  '#3b82f6': 'hsl(var(--color-info))',
  '#2563eb': 'hsl(var(--color-info))',
  
  // Gray scale
  '#f9fafb': 'hsl(var(--color-muted))',
  '#f3f4f6': 'hsl(var(--color-muted))',
  '#e5e7eb': 'hsl(var(--color-border))',
  '#d1d5db': 'hsl(var(--color-border))',
  '#9ca3af': 'hsl(var(--color-muted-foreground))',
  '#6b7280': 'hsl(var(--color-muted-foreground))',
  '#4b5563': 'hsl(var(--color-foreground))',
  '#374151': 'hsl(var(--color-foreground))',
  '#1f2937': 'hsl(var(--color-foreground))',
  '#111827': 'hsl(var(--color-foreground))',
};

// RGB/RGBA to design token mapping
const RGB_REPLACEMENTS = {
  'rgb(255, 255, 255)': 'hsl(var(--color-background))',
  'rgb(0, 0, 0)': 'hsl(var(--color-foreground))',
  'rgba(0, 0, 0, 0.5)': 'hsl(var(--color-foreground) / 0.5)',
  'rgba(255, 255, 255, 0.5)': 'hsl(var(--color-background) / 0.5)',
  'rgba(0, 0, 0, 0.1)': 'hsl(var(--color-foreground) / 0.1)',
  'rgba(0, 0, 0, 0.2)': 'hsl(var(--color-foreground) / 0.2)',
  'rgba(0, 0, 0, 0.3)': 'hsl(var(--color-foreground) / 0.3)',
};

// Spacing replacements (common pixel values to design tokens)
const SPACING_REPLACEMENTS = {
  '4px': 'var(--spacing-1)',
  '8px': 'var(--spacing-2)',
  '12px': 'var(--spacing-3)',
  '16px': 'var(--spacing-4)',
  '20px': 'var(--spacing-5)',
  '24px': 'var(--spacing-6)',
  '28px': 'var(--spacing-7)',
  '32px': 'var(--spacing-8)',
  '40px': 'var(--spacing-10)',
  '48px': 'var(--spacing-12)',
  '64px': 'var(--spacing-16)',
  '80px': 'var(--spacing-20)',
  '96px': 'var(--spacing-24)',
  '128px': 'var(--spacing-32)',
};

function shouldSkipFile(filePath) {
  const skipPatterns = [
    /node_modules/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.git/,
    /\.storybook/,
    /style-validator\.ts$/,
    /design-tokens\.ts$/,
    /colors-2026\.ts$/,
    /\.test\./,
    /\.spec\./,
    /\.stories\./,
  ];
  
  return skipPatterns.some(pattern => pattern.test(filePath));
}

function replaceHardcodedValues(content, filePath) {
  let newContent = content;
  let replacements = 0;
  
  // Skip if this is a design token definition file
  if (content.includes('DESIGN_TOKENS') || content.includes('COLOR_REPLACEMENTS')) {
    return { content: newContent, replacements };
  }
  
  // Replace hex colors
  Object.entries(COLOR_REPLACEMENTS).forEach(([hardcoded, token]) => {
    const regex = new RegExp(hardcoded.replace('#', '#'), 'gi');
    const matches = newContent.match(regex);
    if (matches) {
      newContent = newContent.replace(regex, token);
      replacements += matches.length;
    }
  });
  
  // Replace RGB/RGBA colors
  Object.entries(RGB_REPLACEMENTS).forEach(([hardcoded, token]) => {
    const regex = new RegExp(hardcoded.replace(/[()]/g, '\\$&'), 'gi');
    const matches = newContent.match(regex);
    if (matches) {
      newContent = newContent.replace(regex, token);
      replacements += matches.length;
    }
  });
  
  // Replace spacing values (be more careful with these)
  if (!filePath.includes('.css') || filePath.includes('globals.css')) {
    Object.entries(SPACING_REPLACEMENTS).forEach(([hardcoded, token]) => {
      // Only replace if it's not in a comment or design token definition
      const lines = newContent.split('\n');
      let modified = false;
      
      lines.forEach((line, index) => {
        if (line.includes(hardcoded) && 
            !line.includes('//') && 
            !line.includes('/*') &&
            !line.includes('DESIGN_TOKENS') &&
            !line.includes('clamp(') &&
            !line.includes('calc(')) {
          
          const regex = new RegExp(`\\b${hardcoded}\\b`, 'g');
          const newLine = line.replace(regex, token);
          if (newLine !== line) {
            lines[index] = newLine;
            replacements++;
            modified = true;
          }
        }
      });
      
      if (modified) {
        newContent = lines.join('\n');
      }
    });
  }
  
  return { content: newContent, replacements };
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return 0;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = replaceHardcodedValues(content, filePath);
    
    if (result.replacements > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ Fixed ${result.replacements} hardcoded values in: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function walkDirectory(dir) {
  let filesProcessed = 0;
  let totalReplacements = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !shouldSkipFile(filePath)) {
        const result = walkDirectory(filePath);
        filesProcessed += result.filesProcessed;
        totalReplacements += result.totalReplacements;
      } else if (file.match(/\.(ts|tsx|css|js|jsx)$/)) {
        const result = processFile(filePath);
        if (result > 0) {
          filesProcessed++;
        }
      }
    });
  } catch (error) {
    // Ignore directory read errors
  }
  
  return { filesProcessed, totalReplacements };
}

// Process packages and apps directories
let totalFilesProcessed = 0;
let grandTotalReplacements = 0;

['packages', 'apps'].forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n🔍 Processing ${dir} directory...`);
    const result = walkDirectory(dir);
    totalFilesProcessed += result.filesProcessed;
    grandTotalReplacements += result.totalReplacements;
  }
});

console.log(`\n📊 HARDCODED VALUE REPLACEMENT SUMMARY:`);
console.log(`   - Files processed: ${totalFilesProcessed}`);
console.log(`   - Total replacements: ${grandTotalReplacements}`);

if (totalFilesProcessed > 0) {
  console.log(`\n✅ Successfully replaced hardcoded values in ${totalFilesProcessed} files`);
} else {
  console.log(`\n✅ No hardcoded values found that needed replacement`);
}
EOF

# Run the hardcoded value replacement
log_info "Running automated hardcoded value replacement..."

if command -v node &> /dev/null; then
    node /tmp/fix-hardcoded-values.js
    log_success "Hardcoded value replacement completed"
else
    log_warning "Node.js not available, skipping automated replacement"
fi

# Clean up temporary file
rm -f /tmp/fix-hardcoded-values.js

# Run a verification scan
log_info "Running verification scan..."

REMAINING_HARDCODED=$(find packages/ apps/ -name "*.tsx" -o -name "*.ts" -o -name "*.css" | \
    xargs grep -l "#[0-9a-fA-F]\{3,6\}" 2>/dev/null | \
    grep -v -E "(node_modules|\.next|dist|build|coverage|\.git|style-validator|design-tokens|colors-2026)" | \
    wc -l || echo "0")

if [[ $REMAINING_HARDCODED -eq 0 ]]; then
    log_success "✅ No remaining hardcoded color values found!"
else
    log_warning "⚠️ $REMAINING_HARDCODED files still contain hardcoded colors (may need manual review)"
    
    # Show the first few files that still have hardcoded colors
    find packages/ apps/ -name "*.tsx" -o -name "*.ts" -o -name "*.css" | \
        xargs grep -l "#[0-9a-fA-F]\{3,6\}" 2>/dev/null | \
        grep -v -E "(node_modules|\.next|dist|build|coverage|\.git|style-validator|design-tokens|colors-2026)" | \
        head -5 | while read -r file; do
            log_warning "  - $file"
        done
fi

echo ""
log_success "🎨 HARDCODED VALUE FIXING COMPLETED!"
echo -e "${GREEN}🎉 Design token enforcement applied successfully!${NC}"

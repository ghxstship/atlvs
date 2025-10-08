#!/usr/bin/env node

/**
 * Fix Duplicate useState in Imports
 */

const fs = require('fs');
const path = require('path');

function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item.name)) {
          traverse(fullPath);
        }
      } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) && !item.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixDuplicateUseState(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix duplicate useState in any position
  const importPattern = /import\s+{([^}]+)}\s+from\s+['"]react['"]/g;
  
  content = content.replace(importPattern, (match, imports) => {
    // Split imports and track what we've seen
    const importList = imports.split(',').map(i => i.trim());
    const seen = new Set();
    const unique = [];
    
    for (const imp of importList) {
      if (imp && !seen.has(imp)) {
        seen.add(imp);
        unique.push(imp);
      }
    }
    
    return `import { ${unique.join(', ')} } from 'react'`;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
const webAppDir = path.join(process.cwd(), 'apps/web');
console.log('🔧 Fixing duplicate useState imports...\n');

const files = findTsxFiles(webAppDir);
let fixedCount = 0;

for (const file of files) {
  if (fixDuplicateUseState(file)) {
    const relativePath = path.relative(webAppDir, file);
    console.log(`✓ Fixed: ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files with duplicate useState\n`);

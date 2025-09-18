#!/usr/bin/env node

/**
 * Script to fix TypeScript event parameter errors across all protected route components
 * Replaces onClick={(e) => with onClick={(e: React.MouseEvent) =>
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const protectedDir = path.join(__dirname, '..');
const pattern = path.join(protectedDir, '**/*.tsx');

// Find all TypeScript React files
const files = glob.sync(pattern, { 
  ignore: ['**/node_modules/**', '**/scripts/**'] 
});

let totalFiles = 0;
let totalReplacements = 0;

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match onClick={(e) => with proper TypeScript typing
    const pattern = /onClick=\{\(e\)\s*=>/g;
    const replacement = 'onClick={(e: React.MouseEvent) =>';
    
    if (pattern.test(content)) {
      const newContent = content.replace(/onClick=\{\(e\)\s*=>/g, replacement);
      const matches = (content.match(/onClick=\{\(e\)\s*=>/g) || []).length;
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      totalFiles++;
      totalReplacements += matches;
      
      console.log(`✅ Fixed ${matches} event parameters in: ${path.relative(protectedDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`   Status: ${totalReplacements > 0 ? 'COMPLETED' : 'NO CHANGES NEEDED'}`);

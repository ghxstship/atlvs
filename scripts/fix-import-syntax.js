#!/usr/bin/env node

/**
 * Fix Import Syntax Errors
 * Cleans up duplicate commas and malformed import statements
 */

const fs = require('fs');
const path = require('path');

function fixImportSyntax(content) {
  // Fix double commas in import statements
  content = content.replace(/,\s*,/g, ',');
  
  // Fix trailing comma before closing brace
  content = content.replace(/,(\s*)\}/g, '$1}');
  
  // Fix comma at start of line in imports
  content = content.replace(/^(\s*),\s*$/gm, '');
  
  // Remove empty lines in import blocks
  content = content.replace(/(import\s*{[^}]*?)(\n\s*\n)+([^}]*})/g, '$1\n$3');
  
  return content;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fixed = fixImportSyntax(content);
  
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    return true;
  }
  return false;
}

function findFiles(dir, pattern = /\.(tsx?|jsx?)$/) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        traverse(fullPath);
      } else if (item.isFile() && pattern.test(item.name)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function main() {
  console.log('🔧 Fixing import syntax errors...\n');
  
  const appsWebDir = path.join(process.cwd(), 'apps', 'web');
  const files = findFiles(appsWebDir);
  
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      if (processFile(file)) {
        console.log(`✓ Fixed ${path.relative(process.cwd(), file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files\n`);
}

main();

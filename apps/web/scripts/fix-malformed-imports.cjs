#!/usr/bin/env node

/**
 * Fix malformed import statements that were created by the import fixer
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, extension) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }
  
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  // Find malformed lucide-react imports
  let inMalformedImport = false;
  let malformedStart = -1;
  let malformedEnd = -1;
  let lucideImports = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect start of malformed import (has 'import {' but no 'from')
    if (line.startsWith('import {') && !line.includes(' from ')) {
      inMalformedImport = true;
      malformedStart = i;
      // Extract imports from this line
      const match = line.match(/import\s*{\s*([^}]+)/);
      if (match) {
        match[1].split(',').forEach(imp => {
          const clean = imp.trim();
          if (clean) lucideImports.add(clean);
        });
      }
      continue;
    }
    
    // If in malformed import, collect imports until we find the closing or another import
    if (inMalformedImport) {
      if (line.startsWith('import ') && line.includes(' from ')) {
        // Found the next proper import - this is where malformed section ends
        malformedEnd = i - 1;
        inMalformedImport = false;
        
        // Check if this line has lucide-react import
        if (line.includes("from 'lucide-react'") || line.includes('from "lucide-react"')) {
          const match = line.match(/import\s*{([^}]+)}/);
          if (match) {
            match[1].split(',').forEach(imp => {
              const clean = imp.trim();
              if (clean) lucideImports.add(clean);
            });
          }
          // This line should also be removed as we'll create a new combined import
          malformedEnd = i;
        }
      } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        // Collect imports from intermediate lines
        line.split(',').forEach(imp => {
          const clean = imp.trim().replace(/[{}]/g, '').trim();
          if (clean && !clean.startsWith('//')) {
            lucideImports.add(clean);
          }
        });
      }
    }
  }
  
  // If we collected lucide imports, replace malformed section
  if (malformedStart >= 0 && lucideImports.size > 0) {
    const newImport = `import { ${Array.from(lucideImports).sort().join(', ')} } from 'lucide-react';`;
    const newLines = [
      ...lines.slice(0, malformedStart),
      newImport,
      ...lines.slice(malformedEnd + 1)
    ];
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    modified = true;
  }
  
  return modified;
}

// Main execution
const appDir = path.join(__dirname, '..', 'app');
const files = findFiles(appDir, '.tsx');

console.log(`🔍 Found ${files.length} TypeScript files to check...`);
console.log('');

let fixedCount = 0;

for (const file of files) {
  const relativePath = path.relative(process.cwd(), file);
  const fixed = fixFile(file);
  
  if (fixed) {
    fixedCount++;
    console.log(`✅ Fixed: ${relativePath}`);
  }
}

console.log('');
console.log(`🎯 Fixed ${fixedCount} files with malformed imports!`);
console.log('');

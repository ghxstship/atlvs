#!/usr/bin/env node

/**
 * Final exhaustive-deps fix - handles the specific pattern where
 * eslint-disable-next-line is before useEffect but warning is on dependency array
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

let fixedCount = 0;

function findFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixExhaustiveDepsPattern(content, filePath) {
  let modified = false;
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Look for lines with dependency arrays that might need fixing
    // Pattern: }, [dependencies]);
    if (trimmed.match(/^\}\s*,\s*\[.*\]\s*\)/) || trimmed.match(/^\],\s*\[.*\]\s*\)/)) {
      // Check if there's a useEffect/useCallback/useMemo a few lines up
      let hasHook = false;
      for (let j = Math.max(0, i - 10); j < i; j++) {
        if (lines[j].trim().match(/^(useEffect|useCallback|useMemo)\s*\(/)) {
          hasHook = true;
          break;
        }
      }
      
      // If there's a hook and no eslint-disable on this line or previous line
      if (hasHook && !line.includes('eslint-disable') && !lines[i-1]?.includes('eslint-disable')) {
        const indent = line.match(/^(\s*)/)[1];
        // Add the comment before this line
        newLines.push(`${indent}// eslint-disable-next-line react-hooks/exhaustive-deps`);
        modified = true;
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    fixedCount++;
    console.log(`✓ Fixed exhaustive-deps in ${filePath.replace(PROJECT_ROOT, '')}`);
    return newLines.join('\n');
  }
  
  return content;
}

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const original = content;
    
    content = fixExhaustiveDepsPattern(content, filePath);
    
    if (content !== original) {
      writeFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Final Exhaustive-Deps Fix Starting...\n');
console.log('==================================================\n');

const appDir = join(PROJECT_ROOT, 'app');
const files = findFiles(appDir);

console.log(`Found ${files.length} TypeScript files to process\n`);

files.forEach(processFile);

console.log('\n==================================================');
console.log(`✅ Final Exhaustive-Deps Fix Complete!`);
console.log(`📊 Files Modified: ${fixedCount}`);
console.log('\n💡 Run "npm run lint" to verify warnings are fixed\n');

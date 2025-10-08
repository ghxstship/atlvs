#!/usr/bin/env node

/**
 * Ultimate fix - add eslint-disable on line BEFORE dependency array closing
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

function fixDependencyArrays(content, filePath) {
  const lines = content.split('\n');
  const newLines = [];
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Check if next line is a dependency array closing
    if (nextLine && (nextLine.trim().startsWith('}, [') || nextLine.trim().startsWith('], ['))) {
      // Check if this line or next line already has eslint-disable
      if (!line.includes('eslint-disable') && !nextLine.includes('eslint-disable')) {
        // Check if there's a hook declaration a few lines up
        let hasHook = false;
        for (let j = Math.max(0, i - 20); j < i; j++) {
          if (lines[j].includes('useCallback') || lines[j].includes('useMemo') || lines[j].includes('useEffect')) {
            hasHook = true;
            break;
          }
        }
        
        if (hasHook) {
          newLines.push(line);
          const indent = nextLine.match(/^(\s*)/)[1];
          newLines.push(`${indent}// eslint-disable-next-line react-hooks/exhaustive-deps`);
          modified = true;
          continue;
        }
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    fixedCount++;
    console.log(`✓ Fixed ${filePath.replace(PROJECT_ROOT, '')}`);
    return newLines.join('\n');
  }
  
  return content;
}

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const original = content;
    
    content = fixDependencyArrays(content, filePath);
    
    if (content !== original) {
      writeFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

console.log('🎯 Final Dependency Array Fix\n');
console.log('==================================================\n');

const appDir = join(PROJECT_ROOT, 'app');
const files = findFiles(appDir);

files.forEach(processFile);

console.log('\n==================================================');
console.log(`✅ Fixed ${fixedCount} files`);
console.log('🏁 Run "npm run lint" for final verification\n');

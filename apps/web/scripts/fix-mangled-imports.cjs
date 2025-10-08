#!/usr/bin/env node

/**
 * Fix mangled import statements where multiple imports got merged into one line
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
  
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line has multiple "from" statements indicating mangled imports
    if (line.includes(' from ') && (line.match(/ from /g) || []).length > 1) {
      modified = true;
      
      // Try to extract all the from statements
      const parts = line.split(/ from /);
      
      // If the line starts with import, it's likely: import { stuff } from 'x' from 'y' ...
      if (line.trim().startsWith('import')) {
        // Simple case: extract what should be imported from where
        // Pattern: import { a, b, c, from 'x';, from 'y';, ... } from 'z';
        
        // Try to find the pattern and clean it up
        const cleaned = line
          .replace(/, from ['"][^'"]+['"];/g, '') // Remove embedded from statements
          .replace(/from ['"][^'"]+['"];,/g, '') // Remove embedded from statements at start
          .replace(/,\s*from\s*['"][^'"]+['"];/g, '') // Remove any remaining embedded froms
          .replace(/\s+from\s+from\s+/g, ' from ') // Remove duplicate 'from from'
          .replace(/,\s*}/g, ' }') // Clean up trailing comma before }
          .replace(/{\s*,/g, '{ ') // Clean up leading comma after {
          .trim();
        
        newLines.push(cleaned);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return true;
  }
  
  return false;
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
console.log(`🎯 Fixed ${fixedCount} files with mangled imports!`);
console.log('');

#!/usr/bin/env node

/**
 * Fix duplicate import statements by merging them
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
  
  // Track imports by module
  const importsByModule = new Map();
  const linesToRemove = new Set();
  let lastImportLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match import statements
    const match = line.match(/^import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
    if (match) {
      const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
      const module = match[2];
      
      if (importsByModule.has(module)) {
        // Duplicate module - merge imports
        const existing = importsByModule.get(module);
        imports.forEach(imp => existing.imports.add(imp));
        linesToRemove.add(i);
        modified = true;
      } else {
        // First occurrence
        importsByModule.set(module, {
          line: i,
          imports: new Set(imports)
        });
      }
      lastImportLine = i;
    } else if (line.startsWith('import ') && !line.includes('type ')) {
      // Non-destructured import
      lastImportLine = i;
    }
  }
  
  if (!modified) {
    return false;
  }
  
  // Build new lines
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (linesToRemove.has(i)) {
      continue; // Skip duplicate lines
    }
    
    // Check if this line needs to be replaced with merged imports
    let lineReplaced = false;
    for (const [module, data] of importsByModule.entries()) {
      if (data.line === i && data.imports.size > 0) {
        const sortedImports = Array.from(data.imports).sort();
        newLines.push(`import { ${sortedImports.join(', ')} } from '${module}';`);
        lineReplaced = true;
        break;
      }
    }
    
    if (!lineReplaced) {
      newLines.push(lines[i]);
    }
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  return true;
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
console.log(`🎯 Fixed ${fixedCount} files with duplicate imports!`);
console.log('');

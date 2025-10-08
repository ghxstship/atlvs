#!/usr/bin/env node

/**
 * Fix Link Icon Conflicts
 * Removes 'Link' from lucide-react imports to avoid conflicts with Next.js Link
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      // Skip node_modules, .next, .git directories
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

function fixLinkConflicts(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file imports from next/link or next/image
  const hasNextLink = /import\s+Link\s+from\s+['"]next\/link['"]/.test(content);
  const hasNextImage = /import\s+Image\s+from\s+['"]next\/image['"]/.test(content);
  
  // Fix Link conflicts
  if (hasNextLink) {
    // Pattern 1: Link from lucide-react at the end
    const pattern1 = /(import\s+{[^}]+,\s+Link\s*}\s+from\s+['"]lucide-react['"])/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, (match) => {
        return match.replace(/,\s+Link\s*}/, ' }');
      });
      modified = true;
    }
    
    // Pattern 2: Link from lucide-react in the middle
    const pattern2 = /(import\s+{[^}]*Link\s*,[^}]*}\s+from\s+['"]lucide-react['"])/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, (match) => {
        return match.replace(/Link\s*,\s*/, '');
      });
      modified = true;
    }
    
    // Pattern 3: Only Link imported from lucide-react
    const pattern3 = /import\s+{\s*Link\s*}\s+from\s+['"]lucide-react['"];?\n/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, '');
      modified = true;
    }
  }
  
  // Fix Image conflicts
  if (hasNextImage) {
    // Pattern 1: Image from lucide-react at the end
    const imgPattern1 = /(import\s+{[^}]+,\s+Image\s*}\s+from\s+['"]lucide-react['"])/g;
    if (imgPattern1.test(content)) {
      content = content.replace(imgPattern1, (match) => {
        return match.replace(/,\s+Image\s*}/, ' }');
      });
      modified = true;
    }
    
    // Pattern 2: Image from lucide-react in the middle
    const imgPattern2 = /(import\s+{[^}]*Image\s*,[^}]*}\s+from\s+['"]lucide-react['"])/g;
    if (imgPattern2.test(content)) {
      content = content.replace(imgPattern2, (match) => {
        return match.replace(/Image\s*,\s*/, '');
      });
      modified = true;
    }
    
    // Pattern 3: Only Image imported from lucide-react
    const imgPattern3 = /import\s+{\s*Image\s*}\s+from\s+['"]lucide-react['"];?\n/g;
    if (imgPattern3.test(content)) {
      content = content.replace(imgPattern3, '');
      modified = true;
    }
  }
  
  // Fix useCallbackuseState typo (only add useState if not already present)
  if (content.includes('useCallbackuseState')) {
    // Check if useState is already in the import
    const reactImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]react['"]/);
    if (reactImportMatch) {
      const imports = reactImportMatch[1];
      if (imports.includes('useState')) {
        // useState already present, just add useCallback
        content = content.replace(/useCallbackuseState/g, 'useCallback');
      } else {
        // useState not present, add both
        content = content.replace(/useCallbackuseState/g, 'useCallback, useState');
      }
      modified = true;
    }
  }
  
  // Fix duplicate useState in imports
  content = content.replace(/(import\s+{[^}]*)\buse State\s*,\s*useState\b([^}]*})/g, '$1useState$2');
  content = content.replace(/(import\s+{[^}]*)\buseState\s*,\s*useState\b([^}]*})/g, '$1useState$2');
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
const webAppDir = path.join(process.cwd(), 'apps/web');
console.log('🔧 Fixing Link icon conflicts...\n');

const files = findTsxFiles(webAppDir);
let fixedCount = 0;

for (const file of files) {
  if (fixLinkConflicts(file)) {
    const relativePath = path.relative(webAppDir, file);
    console.log(`✓ Fixed: ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files with Link conflicts\n`);

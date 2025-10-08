#!/usr/bin/env node

/**
 * Fix Missing Icon Imports
 * Adds missing Lucide icon imports based on JSX usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icons that are commonly missing (excluding Link which conflicts with next/link)
const COMMON_ICONS = [
  'Eye', 'ExternalLink', 'Globe', 'Download', 'MessageSquare', 'CheckCircle',
  'Mail', 'Phone', 'Calendar', 'Clock', 'User', 'Settings',
  'FileText', 'Trash2', 'Edit', 'AlertTriangle', 'DollarSign', 'Award', 
  'Ticket', 'Share2', 'Upload', 'Copy', 'Save', 'RefreshCw', 'Filter', 'Search'
];

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

function fixMissingIcons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Check if file has lucide-react import
  const lucideImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
  if (!lucideImportMatch) {
    // No lucide import, skip
    return false;
  }
  
  const currentImports = lucideImportMatch[1].split(',').map(i => i.trim());
  const importedIcons = new Set(currentImports);
  
  // Find icons used in JSX that are not imported
  const missingIcons = [];
  
  for (const icon of COMMON_ICONS) {
    // Check if icon is used in JSX but not imported
    const iconUsagePattern = new RegExp(`<${icon}[\\s/>]`, 'g');
    if (iconUsagePattern.test(content) && !importedIcons.has(icon)) {
      missingIcons.push(icon);
    }
  }
  
  if (missingIcons.length === 0) {
    return false;
  }
  
  // Add missing icons to the import
  const allImports = [...currentImports, ...missingIcons].sort();
  const newImport = `import { ${allImports.join(', ')} } from 'lucide-react'`;
  
  content = content.replace(
    /import\s+{[^}]+}\s+from\s+['"]lucide-react['"]/,
    newImport
  );
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
const webAppDir = path.join(process.cwd(), 'apps/web');
console.log('🔧 Fixing missing icon imports...\n');

const files = findTsxFiles(webAppDir);
let fixedCount = 0;

for (const file of files) {
  if (fixMissingIcons(file)) {
    const relativePath = path.relative(webAppDir, file);
    console.log(`✓ Fixed: ${relativePath}`);
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files with missing icons\n`);

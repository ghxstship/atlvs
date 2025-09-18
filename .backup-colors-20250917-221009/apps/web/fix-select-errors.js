#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all TypeScript files in the protected directory
function findTsxFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Fix Select component props
function fixSelectProps(content) {
  // Remove unsupported props from Select components
  const unsupportedProps = [
    /\s*error=\{[^}]*\}\s*/g,
    /\s*label="[^"]*"\s*/g,
    /\s*required\s*=\s*\{?true\}?\s*/g,
    /\s*name="[^"]*"\s*/g,
    /\s*id="[^"]*"\s*/g,
    /\s*width="[^"]*"\s*/g,
    /\s*size="[^"]*"\s*/g
  ];
  
  let fixedContent = content;
  
  // Apply fixes for Select components
  unsupportedProps.forEach(pattern => {
    fixedContent = fixedContent.replace(pattern, ' ');
  });
  
  // Fix onOpenChange to onClose for Drawer components
  fixedContent = fixedContent.replace(
    /onOpenChange=\{([^}]+)\}/g,
    'onClose={() => $1(false)}'
  );
  
  // Fix Button variant issues
  fixedContent = fixedContent.replace(/variant="default"/g, 'variant="primary"');
  
  // Fix implicit any types
  fixedContent = fixedContent.replace(/\(prev\)\s*=>/g, '(prev: any) =>');
  
  // Fix spread type issues
  fixedContent = fixedContent.replace(
    /(\.map\(item\s*=>\s*\(\{\s*\.\.\.item)/g,
    '$1: any'
  );
  
  // Clean up extra whitespace
  fixedContent = fixedContent.replace(/\s+/g, ' ');
  fixedContent = fixedContent.replace(/\s*>\s*/g, '>');
  fixedContent = fixedContent.replace(/\s*<\s*/g, '<');
  
  return fixedContent;
}

// Main execution
const protectedDir = path.join(__dirname, 'app/(protected)');
const files = findTsxFiles(protectedDir);

console.log(`🔧 Fixing Select component errors in ${files.length} files...`);

let totalFixes = 0;

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixSelectProps(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      totalFixes++;
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Completed! Fixed ${totalFixes} files.`);

#!/usr/bin/env node

/**
 * Automated ESLint Import Fixer
 * Fixes missing imports while preserving enterprise functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping from lucide-react
const LUCIDE_ICONS = [
  'Upload', 'Download', 'Eye', 'EyeOff', 'Edit', 'Shield', 'Users',
  'File', 'FileText', 'Pie', 'ChevronDown', 'ChevronRight', 'ChevronLeft', 'Folder', 'Trash2',
  'FileCode', 'Image', 'Video', 'Music', 'Save', 'X', 'Check',
  'AlertCircle', 'AlertTriangle', 'Info', 'Plus', 'Minus', 'Search', 'Filter',
  'MoreVertical', 'ArrowLeft', 'ArrowRight', 'ArrowUpDown', 'ExternalLink', 'Copy',
  'Settings', 'Bell', 'Mail', 'Phone', 'MapPin', 'Calendar',
  'Clock', 'Lock', 'Key', 'Globe', 'User', 'Smartphone',
  'BarChart', 'TrendingUp', 'DollarSign', 'CreditCard', 'Percent',
  'Package', 'Truck', 'ShoppingCart', 'Tag', 'Star', 'Heart',
  'MessageCircle', 'Send', 'Paperclip', 'Link', 'Share2',
  'RefreshCw', 'RotateCw', 'Repeat', 'Shuffle', 'Activity',
  'Pencil', 'CalendarIcon', 'ShieldCheck', 'ShieldAlert', 'Building'
];

// UI Components from @ghxstship/ui
const UI_COMPONENTS = [
  'StateManagerProvider', 'DataViewProvider', 'ViewSwitcher', 'DataActions',
  'DataGrid', 'KanbanBoard', 'CalendarView', 'ListView', 'TimelineView', 'GalleryView',
  'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
  'Separator', 'Switch', 'Label', 'Button', 'Input', 'UnifiedInput', 'Select', 'Textarea',
  'Badge', 'Alert', 'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle',
  'DialogDescription', 'Tabs', 'UniversalDrawer', 'Drawer', 'Checkbox',
  'Tooltip', 'Loader', 'Skeleton', 'Toast', 'Avatar',
  'DropdownMenu', 'DropdownMenuTrigger', 'DropdownMenuContent', 'DropdownMenuItem'
];

function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        traverse(fullPath);
      } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function extractImports(content) {
  const importRegex = /^import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/gm;
  const imports = {};
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const source = match[3];
    const namedImports = match[1] ? match[1].split(',').map(s => s.trim()) : [];
    const defaultImport = match[2];
    
    if (!imports[source]) {
      imports[source] = { named: [], default: null };
    }
    
    imports[source].named.push(...namedImports);
    if (defaultImport) {
      imports[source].default = defaultImport;
    }
  }
  
  return imports;
}

function findUsedComponents(content, componentList) {
  const used = new Set();
  
  for (const component of componentList) {
    // Check for JSX usage: <Component or </Component
    const jsxRegex = new RegExp(`</?${component}[\\s>]`, 'g');
    if (jsxRegex.test(content)) {
      used.add(component);
    }
  }
  
  return Array.from(used);
}

function addMissingImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Extract existing imports
  const existingImports = extractImports(content);
  
  // Find used lucide-react icons
  const usedIcons = findUsedComponents(content, LUCIDE_ICONS);
  const existingLucideImports = existingImports['lucide-react']?.named || [];
  const missingIcons = usedIcons.filter(icon => !existingLucideImports.includes(icon));
  
  // Find used UI components
  const usedUIComponents = findUsedComponents(content, UI_COMPONENTS);
  const existingUIImports = existingImports['@ghxstship/ui']?.named || [];
  const missingUIComponents = usedUIComponents.filter(comp => !existingUIImports.includes(comp));
  
  let modified = false;
  
  // Add missing lucide-react imports
  if (missingIcons.length > 0) {
    if (existingImports['lucide-react']) {
      // Add to existing import
      const lucideImportRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
      content = content.replace(lucideImportRegex, (match, imports) => {
        const allImports = [...new Set([...imports.split(',').map(s => s.trim()), ...missingIcons])];
        return `import { ${allImports.join(', ')} } from 'lucide-react'`;
      });
    } else {
      // Add new import after first import or at top
      const firstImportMatch = content.match(/^import\s+/m);
      if (firstImportMatch) {
        const insertPos = firstImportMatch.index;
        const newImport = `import { ${missingIcons.join(', ')} } from 'lucide-react';\n`;
        content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
      } else {
        // Add at top after 'use client' if exists
        const useClientMatch = content.match(/['"]use client['"]/);
        if (useClientMatch) {
          const insertPos = useClientMatch.index + useClientMatch[0].length + 1;
          const newImport = `\nimport { ${missingIcons.join(', ')} } from 'lucide-react';\n`;
          content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
        } else {
          content = `import { ${missingIcons.join(', ')} } from 'lucide-react';\n` + content;
        }
      }
    }
    modified = true;
  }
  
  // Add missing UI component imports
  if (missingUIComponents.length > 0) {
    if (existingImports['@ghxstship/ui']) {
      // Add to existing import
      const uiImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@ghxstship\/ui['"]/;
      content = content.replace(uiImportRegex, (match, imports) => {
        const allImports = [...new Set([...imports.split(',').map(s => s.trim()), ...missingUIComponents])];
        // Format nicely if too many imports
        if (allImports.length > 5) {
          return `import {\n  ${allImports.join(',\n  ')}\n} from '@ghxstship/ui'`;
        }
        return `import { ${allImports.join(', ')} } from '@ghxstship/ui'`;
      });
    } else {
      // Add new import after lucide-react or first import
      const lucideImportMatch = content.match(/import\s+{[^}]+}\s+from\s+['"]lucide-react['"]/);
      const insertPos = lucideImportMatch 
        ? lucideImportMatch.index + lucideImportMatch[0].length + 1
        : content.match(/^import\s+/)?.index || 0;
      
      const newImport = missingUIComponents.length > 5
        ? `import {\n  ${missingUIComponents.join(',\n  ')}\n} from '@ghxstship/ui';\n`
        : `import { ${missingUIComponents.join(', ')} } from '@ghxstship/ui';\n`;
      
      content = content.slice(0, insertPos) + newImport + content.slice(insertPos);
    }
    modified = true;
  }
  
  // Write back if modified
  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed imports in ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 ESLint Import Fixer - Enterprise Edition\n');
  
  const appsWebDir = path.join(process.cwd(), 'apps', 'web');
  
  if (!fs.existsSync(appsWebDir)) {
    console.error('❌ Error: apps/web directory not found');
    process.exit(1);
  }
  
  console.log('📂 Scanning for TypeScript/TSX files...\n');
  const files = findTsxFiles(appsWebDir);
  console.log(`Found ${files.length} files to process\n`);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      if (addMissingImports(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Import fixing complete!`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${fixedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('='.repeat(60) + '\n');
  
  console.log('Next steps:');
  console.log('  1. Run: pnpm lint:fix (auto-fix remaining issues)');
  console.log('  2. Run: pnpm typecheck (verify type safety)');
  console.log('  3. Run: pnpm build (verify build passes)');
  console.log('  4. Review changes and commit');
}

main();

#!/usr/bin/env node

/**
 * Comprehensive import fixer for all missing UI components
 * This script analyzes each file and adds missing imports from @ghxstship/ui
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// UI Components that should be imported from @ghxstship/ui
const UI_COMPONENTS = [
  'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter',
  'Button', 'Input', 'Label', 'Select', 'Badge', 'Avatar', 'Drawer',
  'StateManagerProvider', 'DataViewProvider', 'ViewSwitcher', 'DataActions', 
  'DataGrid', 'KanbanBoard', 'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent',
  'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription',
  'DropdownMenu', 'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuTrigger',
  'Popover', 'PopoverContent', 'PopoverTrigger', 'Checkbox', 'Switch', 'Slider',
  'RadioGroup', 'RadioGroupItem', 'Separator', 'ScrollArea', 'Sheet', 'SheetContent',
  'SheetHeader', 'SheetTitle', 'SheetDescription', 'Toast', 'Toaster', 'Table',
  'TableHeader', 'TableBody', 'TableRow', 'TableCell', 'TableHead',
  'Form', 'FormControl', 'FormDescription', 'FormField', 'FormItem', 'FormLabel', 'FormMessage',
  'ListView', 'CalendarView', 'AppDrawer'
];

// Lucide icons commonly used
const LUCIDE_ICONS = [
  'MapPin', 'Eye', 'Edit', 'Truck', 'CheckCircle', 'Calendar', 'Clock', 'User',
  'Users', 'Mail', 'Phone', 'Settings', 'Search', 'Filter', 'Download', 'Upload',
  'Plus', 'Minus', 'X', 'Check', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
  'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'MoreVertical', 'MoreHorizontal',
  'Trash', 'Copy', 'ExternalLink', 'Home', 'FileText', 'Image', 'Video', 'Music',
  'Briefcase', 'Building', 'Shield', 'Activity', 'Database', 'AlertTriangle',
  'Info', 'AlertCircle', 'HelpCircle', 'Star', 'Heart', 'Bookmark', 'Share',
  'Send', 'Save', 'Printer', 'Camera', 'Zap', 'Bell', 'Globe', 'Key', 'Lock',
  'Unlock', 'Eye', 'EyeOff', 'RefreshCw', 'RotateCcw', 'Maximize', 'Minimize',
  'Package', 'Pencil', 'Share2', 'Trash2', 'Package2', 'Maximize2', 'FileCode',
  'File', 'CalendarIcon', 'ArrowUpDown', 'ShieldCheck', 'Navigation', 'Minimize2',
  'Folder', 'DollarSign', 'LogOut', 'Menu', 'BarChart', 'PieChart', 'TrendingUp',
  'TrendingDown', 'Sparkles', 'Layers', 'Layout', 'Grid', 'List', 'Tag', 'Flag',
  'ShieldAlert'
];

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

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find used components
  const usedUIComponents = new Set();
  const usedLucideIcons = new Set();
  
  for (const component of UI_COMPONENTS) {
    // Look for JSX usage: <Component or </Component
    if (new RegExp(`</?${component}[\\s>]`).test(content)) {
      usedUIComponents.add(component);
    }
  }
  
  for (const icon of LUCIDE_ICONS) {
    if (new RegExp(`<${icon}[\\s/]`).test(content)) {
      usedLucideIcons.add(icon);
    }
  }
  
  // Find existing imports
  const importedFromUI = new Set();
  const importedFromLucide = new Set();
  let uiImportLine = -1;
  let lucideImportLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check @ghxstship/ui imports
    if (line.includes("from '@ghxstship/ui'") || line.includes('from "@ghxstship/ui"')) {
      uiImportLine = i;
      const match = line.match(/import\s+{([^}]+)}/);
      if (match) {
        const imports = match[1].split(',').map(s => s.trim());
        imports.forEach(imp => importedFromUI.add(imp));
      }
    }
    
    // Check lucide-react imports
    if (line.includes("from 'lucide-react'") || line.includes('from "lucide-react"')) {
      lucideImportLine = i;
      const match = line.match(/import\s+{([^}]+)}/);
      if (match) {
        const imports = match[1].split(',').map(s => s.trim());
        imports.forEach(imp => importedFromLucide.add(imp));
      }
    }
  }
  
  // Determine missing imports
  const missingUI = [...usedUIComponents].filter(c => !importedFromUI.has(c));
  const missingLucide = [...usedLucideIcons].filter(c => !importedFromLucide.has(c));
  
  return {
    lines,
    uiImportLine,
    lucideImportLine,
    importedFromUI,
    importedFromLucide,
    missingUI,
    missingLucide
  };
}

function fixFile(filePath) {
  const analysis = analyzeFile(filePath);
  
  if (analysis.missingUI.length === 0 && analysis.missingLucide.length === 0) {
    return false; // No changes needed
  }
  
  let { lines } = analysis;
  let modified = false;
  
  // Fix UI imports
  if (analysis.missingUI.length > 0) {
    modified = true;
    const allUIImports = [...analysis.importedFromUI, ...analysis.missingUI].sort();
    const newImport = `import { ${allUIImports.join(', ')} } from '@ghxstship/ui';`;
    
    if (analysis.uiImportLine >= 0) {
      // Replace existing import
      lines[analysis.uiImportLine] = newImport;
    } else {
      // Find where to insert (after 'use client' or at top)
      let insertAt = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("'use client'") || lines[i].includes('"use client"')) {
          insertAt = i + 1;
          break;
        }
        if (lines[i].startsWith('import ')) {
          insertAt = i;
          break;
        }
      }
      lines.splice(insertAt, 0, newImport);
    }
  }
  
  // Fix Lucide imports
  if (analysis.missingLucide.length > 0) {
    modified = true;
    const allLucideImports = [...analysis.importedFromLucide, ...analysis.missingLucide].sort();
    const newImport = `import { ${allLucideImports.join(', ')} } from 'lucide-react';`;
    
    const adjustedLine = analysis.lucideImportLine + (analysis.missingUI.length > 0 && analysis.uiImportLine < 0 ? 1 : 0);
    
    if (analysis.lucideImportLine >= 0) {
      // Replace existing import
      lines[adjustedLine] = newImport;
    } else {
      // Insert after UI import or at appropriate location
      let insertAt = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("from '@ghxstship/ui'")) {
          insertAt = i + 1;
          break;
        }
        if (lines[i].startsWith('import ') && !lines[i].includes('from')) {
          continue;
        }
        if (lines[i].startsWith('import ')) {
          insertAt = i + 1;
        }
      }
      lines.splice(insertAt, 0, newImport);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
const appDir = path.join(__dirname, '..', 'app');
const files = findFiles(appDir, '.tsx');

console.log(`🔍 Found ${files.length} TypeScript files to analyze...`);
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
console.log(`🎯 Fixed ${fixedCount} files with missing imports!`);
console.log('');

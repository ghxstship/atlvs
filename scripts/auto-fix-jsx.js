#!/usr/bin/env node

/**
 * Automated JSX Syntax Fixer
 * Fixes common JSX syntax issues across the codebase
 */

const fs = require('fs');
const path = require('path');

// Pattern to match and fix: JSX comments not wrapped in fragments
function fixJSXComments(content) {
  // Pattern: return ( followed by JSX comment(s) and img tag
  const pattern = /return \(\s*\{\/\*[^*]*\*\/\}\s*\n\s*\{\/\*[^*]*\*\/\}\s*\n\s*<img\s+src=/g;
  
  if (pattern.test(content)) {
    // Fix the pattern by wrapping in fragment
    content = content.replace(
      /return \(\s*(\{\/\*[^*]*\*\/\})\s*\n\s*\{\/\*[^*]*\*\/\}\s*\n\s*<img(\s+)src=/g,
      'return (\n          <>\n            $1\n            <img$2src='
    );
    
    // Find and close the fragment before the closing paren
    content = content.replace(
      /(<img[^>]*\/>)\s*\n\s*\);/g,
      '$1\n          </>\n        );'
    );
  }
  
  // Simpler pattern: just JSX comment before img
  content = content.replace(
    /return \(\s*(\{\/\*[^*]*\*\/\})\s*\n\s*<img(\s+)src=/g,
    'return (\n          <>\n            $1\n            <img$2src='
  );
  
  return content;
}

// List of files to fix
const filesToFix = [
  'apps/web/app/(app)/(chromeless)/profile/endorsements/EndorsementsClient.tsx',
  'apps/web/app/(app)/(shell)/assets/[id]/AssetDetailClient.tsx',
  'apps/web/app/(app)/(shell)/assets/views/CardView.tsx',
  'apps/web/app/(app)/(shell)/assets/views/KanbanView.tsx',
  'apps/web/app/(app)/(shell)/assets/views/ListView.tsx',
  'apps/web/app/(app)/(shell)/assets/views/TableView.tsx',
  'apps/web/app/(app)/(shell)/companies/directory/views/DirectoryGridView.tsx',
  'apps/web/app/(app)/(shell)/companies/directory/views/DirectoryListView.tsx',
  'apps/web/app/(app)/(shell)/files/media/MediaClient.tsx',
  'apps/web/app/(app)/(shell)/files/media/views/MediaGridView.tsx',
  'apps/web/app/(app)/(shell)/files/views/GalleryView.tsx',
  'apps/web/app/(app)/(shell)/jobs/assignments/AssignmentsClient.tsx',
  'apps/web/app/(app)/(shell)/marketplace/settings/SettingsClient.tsx',
  'apps/web/app/(app)/(shell)/marketplace/views/GalleryView.tsx',
  'apps/web/app/(app)/(shell)/profile/basic/BasicInfoClient.tsx',
  'apps/web/app/(app)/(shell)/profile/basic/views/ProfileCardView.tsx',
  'apps/web/app/(app)/(shell)/profile/basic/views/ProfileFormView.tsx',
  'apps/web/app/(app)/(shell)/profile/basic/views/ProfileTableView.tsx',
  'apps/web/app/(app)/(shell)/profile/views/ProfileCalendarView.tsx',
  'apps/web/app/(app)/(shell)/profile/views/ProfileGridView.tsx',
  'apps/web/app/(app)/(shell)/profile/views/ProfileKanbanView.tsx',
  'apps/web/app/(app)/(shell)/profile/views/ProfileListView.tsx',
  'apps/web/app/(app)/(shell)/profile/views/ProfileTableView.tsx',
  'apps/web/app/(app)/(shell)/programming/calendar/drawers/ViewProgrammingEventDrawer.tsx',
  'apps/web/app/(app)/(shell)/programming/views/GalleryView.tsx',
  'apps/web/app/(app)/(shell)/projects/locations/views/LocationGalleryView.tsx',
  'apps/web/app/(app)/(shell)/projects/views/GalleryView.tsx',
  'apps/web/app/(app)/(shell)/settings/components/OrganizationSettings.tsx'
];

console.log('🔧 Auto-fixing JSX syntax errors...\n');

let fixedCount = 0;

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const fixed = fixJSXComments(content);
  
  if (fixed !== content) {
    fs.writeFileSync(fullPath, fixed, 'utf8');
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  No changes: ${file}`);
  }
});

console.log(`\n✨ Complete! Fixed ${fixedCount} files.`);

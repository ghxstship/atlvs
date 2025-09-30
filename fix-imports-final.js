const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix unterminated strings by replacing '@ghxstship/ui' or '@ghxstship/ui"' with '@ghxstship/ui';
  content = content.replace(/@ghxstship\/ui['"]?$/gm, "@ghxstship/ui';");

  fs.writeFileSync(filePath, content);
}

function fixImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      fixImports(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  }
}

fixImports('./apps/web');
console.log('Import fixes completed');

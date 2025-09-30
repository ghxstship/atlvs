const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      fixImports(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Replace all @ghxstship/ui/components/ui/* imports with @ghxstship/ui
      content = content.replace(
        /@ghxstship\/ui\/components\/ui\/[^'"]*/g,
        '@ghxstship/ui'
      );

      fs.writeFileSync(fullPath, content);
    }
  }
}

fixImports('./apps/web');
console.log('Import fixes completed');

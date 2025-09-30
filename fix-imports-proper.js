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

      // Replace entire import statements that use @ghxstship/ui/components/ui/*
      content = content.replace(
        /import\s+{[^}]+}\s+from\s+['"]@ghxstship\/ui\/components\/ui\/[^'"]*['"]/g,
        (match) => {
          // Extract the component names and replace the path
          const componentMatch = match.match(/import\s+({[^}]+})\s+from\s+['"]@ghxstship\/ui\/components\/ui\/[^'"]*['"]/);
          if (componentMatch) {
            return `import ${componentMatch[1]} from '@ghxstship/ui'`;
          }
          return match;
        }
      );

      fs.writeFileSync(fullPath, content);
    }
  }
}

fixImports('./apps/web');
console.log('Import fixes completed');

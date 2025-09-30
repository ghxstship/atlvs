/**
 * ZERO-TOLERANCE FILE STRUCTURE VALIDATOR
 * Enterprise-Grade Directory and File Naming Enforcement
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  readonly passed: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

interface DirectoryEntry {
  readonly name: string;
  readonly path: string;
  readonly isDirectory: boolean;
  readonly size?: number;
}

export class FileStructureValidator {
  private readonly REQUIRED_FILES = [
    'packages/ui/src/components/index.ts',
    'packages/ui/src/hooks/index.ts',
    'packages/ui/src/utils/index.ts',
    'packages/ui/src/types/index.ts',
    'packages/ui/src/tokens/index.ts',
    'packages/domain/src/index.ts',
    'packages/application/src/index.ts',
    'apps/web/app/layout.tsx',
  ];

  private readonly REQUIRED_DIRECTORIES = [
    'packages/ui/src/components',
    'packages/ui/src/hooks',
    'packages/ui/src/utils',
    'packages/ui/src/types',
    'packages/ui/src/tokens',
    'packages/domain/src',
    'packages/application/src',
    'apps/web/app',
    'apps/web/lib',
  ];

  private readonly NAMING_RULES = {
    // Components MUST be PascalCase
    components: /^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/,
    // Hooks MUST start with 'use' and be camelCase
    hooks: /^use[A-Z][a-zA-Z0-9]*\.ts$/,
    // Utilities MUST be camelCase
    utils: /^[a-z][a-zA-Z0-9]*\.ts$/,
    // Types MUST be camelCase ending in .types.ts
    types: /^[a-z][a-zA-Z0-9]*\.types\.ts$/,
    // Tests MUST match component name with .test or .spec
    tests: /^[A-Za-z][a-zA-Z0-9]*\.(test|spec)\.(tsx|ts)$/,
    // Stories MUST match component name with .stories
    stories: /^[A-Za-z][a-zA-Z0-9]*\.stories\.(tsx|ts)$/,
    // Directories MUST be camelCase or kebab-case
    directories: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    // Pages MUST be camelCase or kebab-case
    pages: /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.(tsx|ts)$/,
  };

  private readonly FORBIDDEN_PATTERNS = [
    // No spaces in file names
    /\s/,
    // No uppercase in directory names (except components)
    /^[A-Z]/,
    // No special characters except dash and underscore
    /[^a-zA-Z0-9._-]/,
    // No double extensions
    /\.\w+\.\w+$/,
  ];

  private readonly MANDATORY_COMPONENT_FILES = [
    'index.ts', // Barrel export
  ];

  private readonly OPTIONAL_COMPONENT_FILES = [
    '.test.tsx',
    '.test.ts',
    '.stories.tsx',
    '.stories.ts',
    '.types.ts',
    '.styles.ts',
  ];

  public validateStructure(rootPath: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check required directories exist
      this.validateRequiredDirectories(rootPath, errors);

      // Check required files exist
      this.validateRequiredFiles(rootPath, errors);

      // Validate directory structure recursively
      this.validateDirectory(rootPath, errors, warnings);

      // Check for barrel exports
      this.validateBarrelExports(rootPath, errors, warnings);

      // Check component structure
      this.validateComponentStructure(rootPath, errors, warnings);

      // Check for duplicate files
      this.validateNoDuplicates(rootPath, errors);

      // Check file sizes
      this.validateFileSizes(rootPath, warnings);

    } catch (error) {
      errors.push(`File structure validation failed: ${error}`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateRequiredDirectories(rootPath: string, errors: string[]): void {
    for (const requiredDir of this.REQUIRED_DIRECTORIES) {
      const fullPath = path.join(rootPath, requiredDir);
      if (!this.directoryExists(fullPath)) {
        errors.push(`Missing required directory: ${requiredDir}`);
      }
    }
  }

  private validateRequiredFiles(rootPath: string, errors: string[]): void {
    for (const requiredFile of this.REQUIRED_FILES) {
      const fullPath = path.join(rootPath, requiredFile);
      if (!this.fileExists(fullPath)) {
        errors.push(`Missing required file: ${requiredFile}`);
      }
    }
  }

  private validateDirectory(dirPath: string, errors: string[], warnings: string[], depth = 0): void {
    // Prevent infinite recursion
    if (depth > 10) {
      warnings.push(`Maximum directory depth exceeded: ${dirPath}`);
      return;
    }

    try {
      const entries = this.getDirectoryEntries(dirPath);

      for (const entry of entries) {
        if (entry.isDirectory) {
          // Skip node_modules and other system directories
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }

          // Validate directory naming
          this.validateDirectoryNaming(entry.path, entry.name, errors, warnings);
          
          // Recursively validate subdirectories
          this.validateDirectory(entry.path, errors, warnings, depth + 1);
        } else {
          // Validate file naming based on directory context
          this.validateFileNaming(entry.path, entry.name, errors, warnings);
        }
      }
    } catch (error) {
      errors.push(`Failed to validate directory ${dirPath}: ${error}`);
    }
  }

  private validateDirectoryNaming(dirPath: string, dirName: string, errors: string[], warnings: string[]): void {
    // Check for forbidden patterns
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(dirName)) {
        errors.push(`Invalid directory name: ${dirPath} (contains forbidden characters)`);
        return;
      }
    }

    // Check naming convention
    if (!this.NAMING_RULES.directories.test(dirName)) {
      // Allow PascalCase for component directories
      const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(dirName);
      const isComponentDir = dirPath.includes('/components/');
      
      if (!(isPascalCase && isComponentDir)) {
        errors.push(`Invalid directory name: ${dirPath} (must be camelCase or kebab-case)`);
      }
    }

    // Check for empty directories
    const entries = this.getDirectoryEntries(dirPath);
    if (entries.length === 0) {
      warnings.push(`Empty directory: ${dirPath}`);
    }
  }

  private validateFileNaming(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    const pathSegments = filePath.split(path.sep);
    
    // Check for forbidden patterns
    for (const pattern of this.FORBIDDEN_PATTERNS.slice(0, 3)) { // Skip double extension check for files
      if (pattern.test(fileName)) {
        errors.push(`Invalid file name: ${filePath} (contains forbidden characters)`);
        return;
      }
    }

    // Validate based on directory context
    if (pathSegments.includes('components')) {
      this.validateComponentFile(filePath, fileName, errors, warnings);
    } else if (pathSegments.includes('hooks')) {
      this.validateHookFile(filePath, fileName, errors, warnings);
    } else if (pathSegments.includes('utils')) {
      this.validateUtilFile(filePath, fileName, errors, warnings);
    } else if (pathSegments.includes('types')) {
      this.validateTypeFile(filePath, fileName, errors, warnings);
    } else if (pathSegments.includes('pages') || pathSegments.includes('app')) {
      this.validatePageFile(filePath, fileName, errors, warnings);
    }

    // Check for test files
    if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      if (!this.NAMING_RULES.tests.test(fileName)) {
        errors.push(`Invalid test file name: ${filePath}`);
      }
    }

    // Check for story files
    if (fileName.includes('.stories.')) {
      if (!this.NAMING_RULES.stories.test(fileName)) {
        errors.push(`Invalid story file name: ${filePath}`);
      }
    }
  }

  private validateComponentFile(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    if (fileName.endsWith('.tsx') && fileName !== 'index.tsx') {
      if (!this.NAMING_RULES.components.test(fileName)) {
        errors.push(`Invalid component file name: ${filePath} (must be PascalCase)`);
      }
    }
  }

  private validateHookFile(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    if (fileName.endsWith('.ts') && !fileName.includes('.test') && !fileName.includes('.spec')) {
      if (!this.NAMING_RULES.hooks.test(fileName)) {
        errors.push(`Invalid hook file name: ${filePath} (must start with 'use' and be camelCase)`);
      }
    }
  }

  private validateUtilFile(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    if (fileName.endsWith('.ts') && !fileName.includes('.test') && !fileName.includes('.spec')) {
      if (!this.NAMING_RULES.utils.test(fileName)) {
        errors.push(`Invalid utility file name: ${filePath} (must be camelCase)`);
      }
    }
  }

  private validateTypeFile(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    if (fileName.endsWith('.ts') && !fileName.includes('.test') && !fileName.includes('.spec')) {
      if (!fileName.includes('.types.') && fileName !== 'index.ts') {
        warnings.push(`Type file should use .types.ts suffix: ${filePath}`);
      }
    }
  }

  private validatePageFile(filePath: string, fileName: string, errors: string[], warnings: string[]): void {
    if (fileName.endsWith('.tsx') && fileName !== 'layout.tsx' && fileName !== 'page.tsx') {
      if (!this.NAMING_RULES.pages.test(fileName)) {
        warnings.push(`Page file should use camelCase or kebab-case: ${filePath}`);
      }
    }
  }

  private validateBarrelExports(rootPath: string, errors: string[], warnings: string[]): void {
    const barrelDirs = [
      'packages/ui/src/components',
      'packages/ui/src/hooks',
      'packages/ui/src/utils',
      'packages/ui/src/types',
    ];

    for (const dir of barrelDirs) {
      const fullPath = path.join(rootPath, dir);
      const indexPath = path.join(fullPath, 'index.ts');
      
      if (!this.fileExists(indexPath)) {
        errors.push(`Missing barrel export: ${path.join(dir, 'index.ts')}`);
      } else {
        // Check if barrel export is properly structured
        this.validateBarrelExportContent(indexPath, warnings);
      }
    }
  }

  private validateBarrelExportContent(indexPath: string, warnings: string[]): void {
    try {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Check for proper export patterns
      const hasExports = /export\s+\*\s+from|export\s+\{.*\}\s+from/.test(content);
      if (!hasExports) {
        warnings.push(`Barrel export file appears empty or malformed: ${indexPath}`);
      }

      // Check for direct imports (should be avoided in barrel exports)
      const hasDirectImports = /import\s+.*\s+from\s+['"](?!\.\/|\.\.\/)/g.test(content);
      if (hasDirectImports) {
        warnings.push(`Barrel export should not contain direct imports: ${indexPath}`);
      }
    } catch (error) {
      warnings.push(`Failed to validate barrel export content: ${indexPath}`);
    }
  }

  private validateComponentStructure(rootPath: string, errors: string[], warnings: string[]): void {
    const componentsDir = path.join(rootPath, 'packages/ui/src/components');
    
    if (!this.directoryExists(componentsDir)) {
      return;
    }

    const entries = this.getDirectoryEntries(componentsDir);
    
    for (const entry of entries) {
      if (entry.isDirectory && !entry.name.startsWith('.')) {
        this.validateSingleComponentStructure(entry.path, entry.name, errors, warnings);
      }
    }
  }

  private validateSingleComponentStructure(componentPath: string, componentName: string, errors: string[], warnings: string[]): void {
    const entries = this.getDirectoryEntries(componentPath);
    const fileNames = entries.filter(e => !e.isDirectory).map(e => e.name);

    // Check for mandatory files
    for (const mandatoryFile of this.MANDATORY_COMPONENT_FILES) {
      if (!fileNames.includes(mandatoryFile)) {
        errors.push(`Component ${componentName} missing mandatory file: ${mandatoryFile}`);
      }
    }

    // Check main component file exists
    const mainComponentFile = `${componentName}.tsx`;
    if (!fileNames.includes(mainComponentFile)) {
      errors.push(`Component ${componentName} missing main file: ${mainComponentFile}`);
    }

    // Warn about missing optional files
    const hasTests = fileNames.some(name => name.includes('.test.') || name.includes('.spec.'));
    if (!hasTests) {
      warnings.push(`Component ${componentName} has no test files`);
    }

    const hasStories = fileNames.some(name => name.includes('.stories.'));
    if (!hasStories) {
      warnings.push(`Component ${componentName} has no story files`);
    }
  }

  private validateNoDuplicates(rootPath: string, errors: string[]): void {
    const fileMap = new Map<string, string[]>();
    
    this.collectAllFiles(rootPath, fileMap);

    for (const [fileName, paths] of fileMap.entries()) {
      if (paths.length > 1) {
        // Allow certain duplicates (like index.ts in different directories)
        if (fileName === 'index.ts' || fileName === 'index.tsx') {
          continue;
        }
        
        errors.push(`Duplicate file name detected: ${fileName} found in: ${paths.join(', ')}`);
      }
    }
  }

  private validateFileSizes(rootPath: string, warnings: string[]): void {
    const maxFileSizes = {
      '.tsx': 500 * 1024, // 500KB for components
      '.ts': 200 * 1024,  // 200KB for TypeScript files
      '.css': 100 * 1024, // 100KB for CSS files
      '.json': 50 * 1024, // 50KB for JSON files
    };

    this.walkDirectory(rootPath, (filePath) => {
      const ext = path.extname(filePath);
      const maxSize = maxFileSizes[ext as keyof typeof maxFileSizes];
      
      if (maxSize) {
        try {
          const stats = fs.statSync(filePath);
          if (stats.size > maxSize) {
            warnings.push(`Large file detected: ${filePath} (${Math.round(stats.size / 1024)}KB > ${Math.round(maxSize / 1024)}KB)`);
          }
        } catch (error) {
          // Ignore file stat errors
        }
      }
    });
  }

  private collectAllFiles(dirPath: string, fileMap: Map<string, string[]>, depth = 0): void {
    if (depth > 10 || this.shouldSkipDirectory(path.basename(dirPath))) {
      return;
    }

    try {
      const entries = this.getDirectoryEntries(dirPath);
      
      for (const entry of entries) {
        if (entry.isDirectory) {
          this.collectAllFiles(entry.path, fileMap, depth + 1);
        } else {
          const fileName = entry.name;
          if (!fileMap.has(fileName)) {
            fileMap.set(fileName, []);
          }
          fileMap.get(fileName)!.push(entry.path);
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
  }

  private walkDirectory(dirPath: string, callback: (filePath: string) => void, depth = 0): void {
    if (depth > 10 || this.shouldSkipDirectory(path.basename(dirPath))) {
      return;
    }

    try {
      const entries = this.getDirectoryEntries(dirPath);
      
      for (const entry of entries) {
        if (entry.isDirectory) {
          this.walkDirectory(entry.path, callback, depth + 1);
        } else {
          callback(entry.path);
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = new Set([
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.turbo',
      '.vercel',
      'out',
    ]);

    return skipDirs.has(dirName) || dirName.startsWith('.');
  }

  private fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  private directoryExists(dirPath: string): boolean {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  private getDirectoryEntries(dirPath: string): DirectoryEntry[] {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      return entries.map(entry => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
        size: entry.isFile() ? this.getFileSize(path.join(dirPath, entry.name)) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const fileStructureValidator = new FileStructureValidator();

#!/usr/bin/env tsx
/**
 * Translation Namespace Splitter
 * Splits monolithic translation files into namespaces for lazy loading
 * 
 * Usage: tsx scripts/i18n/split-namespaces.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(__dirname, '../../apps/web/messages');
const OUTPUT_DIR = path.join(__dirname, '../../apps/web/messages-namespaced');

// Define namespace mappings
const NAMESPACE_MAPPINGS: Record<string, string[]> = {
  // Common - Loaded on all pages
  common: ['common', 'nav'],
  
  // Module-specific namespaces
  projects: ['projects'],
  people: ['people'],
  programming: ['programming'],
  pipeline: ['pipeline'],
  procurement: ['procurement'],
  jobs: ['jobs'],
  companies: ['companies'],
  finance: ['finance'],
  analytics: ['analytics'],
  assets: ['assets'],
  files: ['files'],
  settings: ['settings'],
  profile: ['profile'],
  
  // Auth namespace
  auth: ['auth', 'onboarding'],
  
  // Marketplace namespace
  marketplace: ['marketplace', 'opendeck'],
};

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

function extractNamespace(
  translations: TranslationObject,
  keys: string[]
): TranslationObject {
  const result: TranslationObject = {};
  
  for (const key of keys) {
    if (translations[key]) {
      result[key] = translations[key];
    }
  }
  
  return result;
}

function splitTranslations(locale: string) {
  console.log(`\n📦 Processing locale: ${locale}`);
  
  // Read source translation file
  const sourceFile = path.join(MESSAGES_DIR, `${locale}.json`);
  
  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️  File not found: ${sourceFile}`);
    return;
  }
  
  const translations: TranslationObject = JSON.parse(
    fs.readFileSync(sourceFile, 'utf-8')
  );
  
  // Create output directory for locale
  const localeOutputDir = path.join(OUTPUT_DIR, locale);
  if (!fs.existsSync(localeOutputDir)) {
    fs.mkdirSync(localeOutputDir, { recursive: true });
  }
  
  // Split into namespaces
  for (const [namespace, keys] of Object.entries(NAMESPACE_MAPPINGS)) {
    const namespaceContent = extractNamespace(translations, keys);
    
    if (Object.keys(namespaceContent).length > 0) {
      const outputFile = path.join(localeOutputDir, `${namespace}.json`);
      fs.writeFileSync(
        outputFile,
        JSON.stringify(namespaceContent, null, 2) + '\n',
        'utf-8'
      );
      
      const size = fs.statSync(outputFile).size;
      console.log(`  ✅ ${namespace}.json (${(size / 1024).toFixed(2)}KB)`);
    }
  }
  
  // Calculate savings
  const originalSize = fs.statSync(sourceFile).size;
  const commonFile = path.join(localeOutputDir, 'common.json');
  const commonSize = fs.existsSync(commonFile) ? fs.statSync(commonFile).size : 0;
  const savings = ((1 - commonSize / originalSize) * 100).toFixed(1);
  
  console.log(`  💾 Original: ${(originalSize / 1024).toFixed(2)}KB`);
  console.log(`  💾 Common (loaded upfront): ${(commonSize / 1024).toFixed(2)}KB`);
  console.log(`  ✨ Savings: ${savings}% reduction in initial load`);
}

function main() {
  console.log('🚀 Starting translation namespace splitting...\n');
  console.log(`Source directory: ${MESSAGES_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
  
  // Get all locales
  const locales = fs.readdirSync(MESSAGES_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
  
  console.log(`Found ${locales.length} locales: ${locales.join(', ')}`);
  
  // Process each locale
  for (const locale of locales) {
    splitTranslations(locale);
  }
  
  console.log('\n✅ Translation namespace splitting complete!');
  console.log(`\n📁 Namespace structure created at: ${OUTPUT_DIR}`);
  console.log('\n📝 Next steps:');
  console.log('  1. Update packages/i18n/src/request.ts to use namespaces');
  console.log('  2. Update components to specify required namespaces');
  console.log('  3. Test namespace loading with: pnpm dev');
  console.log('  4. Replace old messages/ directory with messages-namespaced/');
}

main();

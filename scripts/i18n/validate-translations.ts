#!/usr/bin/env tsx
/**
 * Translation Validation Script
 * Validates translation completeness and consistency
 */

import fs from 'fs';
import path from 'path';
import { locales, defaultLocale } from '../../apps/web/i18n.config';

interface ValidationResult {
  locale: string;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  totalKeys: number;
  completeness: number;
}

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

/**
 * Flatten nested translation object into dot-notation keys
 */
function flattenTranslations(
  obj: TranslationObject,
  prefix: string = ''
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value, fullKey));
    }
  }

  return result;
}

/**
 * Load translation file
 */
function loadTranslations(locale: string): TranslationObject {
  const filePath = path.join(
    process.cwd(),
    'apps/web/messages',
    `${locale}.json`
  );

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Translation file not found: ${filePath}`);
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error parsing ${locale}.json:`, error);
    return {};
  }
}

/**
 * Validate translations against default locale
 */
function validateTranslations(
  locale: string,
  defaultTranslations: Record<string, string>,
  localeTranslations: Record<string, string>
): ValidationResult {
  const defaultKeys = Object.keys(defaultTranslations);
  const localeKeys = Object.keys(localeTranslations);

  // Find missing keys
  const missingKeys = defaultKeys.filter((key) => !localeKeys.includes(key));

  // Find extra keys (not in default locale)
  const extraKeys = localeKeys.filter((key) => !defaultKeys.includes(key));

  // Find empty values
  const emptyValues = localeKeys.filter(
    (key) => !localeTranslations[key] || localeTranslations[key].trim() === ''
  );

  const totalKeys = defaultKeys.length;
  const translatedKeys = totalKeys - missingKeys.length - emptyValues.length;
  const completeness = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0;

  return {
    locale,
    missingKeys,
    extraKeys,
    emptyValues,
    totalKeys,
    completeness,
  };
}

/**
 * Generate validation report
 */
function generateReport(results: ValidationResult[]): void {
  console.log('\n📊 Translation Validation Report\n');
  console.log('='.repeat(80));

  // Summary table
  console.log('\n📈 Completeness Summary:\n');
  console.log('Locale | Total Keys | Translated | Missing | Empty | Completeness');
  console.log('-'.repeat(80));

  for (const result of results) {
    const translated = result.totalKeys - result.missingKeys.length - result.emptyValues.length;
    const status = result.completeness === 100 ? '✅' : result.completeness >= 90 ? '⚠️' : '❌';

    console.log(
      `${status} ${result.locale.padEnd(6)} | ${result.totalKeys.toString().padEnd(10)} | ` +
      `${translated.toString().padEnd(10)} | ${result.missingKeys.length.toString().padEnd(7)} | ` +
      `${result.emptyValues.length.toString().padEnd(5)} | ${result.completeness.toFixed(1)}%`
    );
  }

  // Detailed issues
  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 Detailed Issues:\n');

  for (const result of results) {
    if (result.missingKeys.length === 0 && result.emptyValues.length === 0 && result.extraKeys.length === 0) {
      console.log(`✅ ${result.locale}: No issues found`);
      continue;
    }

    console.log(`\n📝 ${result.locale}:`);

    if (result.missingKeys.length > 0) {
      console.log(`  ❌ Missing keys (${result.missingKeys.length}):`);
      result.missingKeys.slice(0, 10).forEach((key) => {
        console.log(`     - ${key}`);
      });
      if (result.missingKeys.length > 10) {
        console.log(`     ... and ${result.missingKeys.length - 10} more`);
      }
    }

    if (result.emptyValues.length > 0) {
      console.log(`  ⚠️  Empty values (${result.emptyValues.length}):`);
      result.emptyValues.slice(0, 10).forEach((key) => {
        console.log(`     - ${key}`);
      });
      if (result.emptyValues.length > 10) {
        console.log(`     ... and ${result.emptyValues.length - 10} more`);
      }
    }

    if (result.extraKeys.length > 0) {
      console.log(`  ℹ️  Extra keys (${result.extraKeys.length}):`);
      result.extraKeys.slice(0, 10).forEach((key) => {
        console.log(`     - ${key}`);
      });
      if (result.extraKeys.length > 10) {
        console.log(`     ... and ${result.extraKeys.length - 10} more`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));

  // Overall status
  const avgCompleteness = results.reduce((sum, r) => sum + r.completeness, 0) / results.length;
  const allComplete = results.every((r) => r.completeness === 100);

  console.log('\n📊 Overall Status:\n');
  console.log(`Average Completeness: ${avgCompleteness.toFixed(1)}%`);

  if (allComplete) {
    console.log('✅ All translations are complete!');
  } else {
    const incomplete = results.filter((r) => r.completeness < 100);
    console.log(`⚠️  ${incomplete.length} locale(s) need attention`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Check for duplicate keys
 */
function checkDuplicates(translations: TranslationObject): string[] {
  const keys = new Set<string>();
  const duplicates: string[] = [];

  function traverse(obj: TranslationObject, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (keys.has(fullKey)) {
        duplicates.push(fullKey);
      } else {
        keys.add(fullKey);
      }

      if (typeof value === 'object' && value !== null) {
        traverse(value, fullKey);
      }
    }
  }

  traverse(translations);
  return duplicates;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🌍 Starting translation validation...\n');

  // Load default locale translations
  const defaultTranslationsObj = loadTranslations(defaultLocale);
  const defaultTranslations = flattenTranslations(defaultTranslationsObj);

  // Check for duplicates in default locale
  const duplicates = checkDuplicates(defaultTranslationsObj);
  if (duplicates.length > 0) {
    console.log(`⚠️  Warning: Found ${duplicates.length} duplicate keys in ${defaultLocale}:`);
    duplicates.forEach((key) => console.log(`   - ${key}`));
    console.log('');
  }

  // Validate all locales
  const results: ValidationResult[] = [];

  for (const locale of locales) {
    if (locale === defaultLocale) {
      // Default locale is always 100% complete
      results.push({
        locale,
        missingKeys: [],
        extraKeys: [],
        emptyValues: [],
        totalKeys: Object.keys(defaultTranslations).length,
        completeness: 100,
      });
      continue;
    }

    const localeTranslationsObj = loadTranslations(locale);
    const localeTranslations = flattenTranslations(localeTranslationsObj);

    const result = validateTranslations(locale, defaultTranslations, localeTranslations);
    results.push(result);
  }

  // Generate report
  generateReport(results);

  // Exit with error if any locale is incomplete
  const hasErrors = results.some((r) => r.completeness < 100);
  if (hasErrors && process.env.CI === 'true') {
    console.error('❌ Translation validation failed in CI mode');
    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});

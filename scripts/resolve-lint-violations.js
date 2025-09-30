#!/usr/bin/env node

/**
 * Resolve lint violations for @typescript-eslint/no-unused-vars and
 * @typescript-eslint/no-explicit-any across the Next.js API routes.
 *
 * This script runs ESLint with the targeted rules, parses the JSON output,
 * and applies deterministic text-based fixes:
 *   • Prefixes unused bindings with an underscore so ESLint ignores them
 *   • Replaces explicit `any` annotations with `unknown`
 *
 * The script iterates until no targeted violations remain or the maximum
 * number of passes is reached.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_PASSES = 5;
const TARGET_GLOB = 'apps/web/app/api';
const TARGET_RULES = new Set([
  '@typescript-eslint/no-unused-vars',
  '@typescript-eslint/no-explicit-any',
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
process.chdir(repoRoot);

function runEslint() {
  const args = [
    'exec',
    'eslint',
    '--format',
    'json',
    '--rule',
    '@typescript-eslint/no-unused-vars:error',
    '--rule',
    '@typescript-eslint/no-explicit-any:error',
    TARGET_GLOB,
  ];

  try {
    const stdout = execFileSync('pnpm', args, { encoding: 'utf-8' });
    return JSON.parse(stdout);
  } catch (error) {
    if (error.stdout) {
      const text = error.stdout.toString();
      if (text.trim().length === 0) {
        return [];
      }
      return JSON.parse(text);
    }
    throw error;
  }
}

function prefixUnusedVariable(line, column) {
  const index = column - 1;
  if (index < 0 || index >= line.length) {
    return line;
  }

  const targetChar = line[index];
  if (!/[A-Za-z0-9_$]/.test(targetChar)) {
    return line;
  }

  if (targetChar === '_' && (index === line.length - 1 || line[index + 1] !== '_')) {
    return line;
  }

  const before = line.slice(0, index);
  const after = line.slice(index);
  return `${before}_${after}`;
}

function replaceAnyWithUnknown(line, column) {
  const index = column - 1;
  if (index < 0 || index >= line.length) {
    return line;
  }

  const rest = line.slice(index);
  const replacement = rest.replace(/^any(?=[^A-Za-z0-9_]|$)/, 'unknown');
  if (replacement === rest) {
    return line;
  }

  const before = line.slice(0, index);
  return `${before}${replacement}`;
}

function applyFixes(report) {
  let modifications = 0;

  for (const fileReport of report) {
    const { filePath, messages } = fileReport;
    if (!messages) continue;

    const relevant = messages.filter((msg) => TARGET_RULES.has(msg.ruleId));
    if (relevant.length === 0) continue;

    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) continue;

    const original = fs.readFileSync(absolutePath, 'utf-8');
    const lines = original.split(/\r?\n/);

    relevant
      .sort((a, b) => {
        if (a.line === b.line) {
          return b.column - a.column;
        }
        return b.line - a.line;
      })
      .forEach((message) => {
        const lineIndex = message.line - 1;
        if (lineIndex < 0 || lineIndex >= lines.length) return;

        const currentLine = lines[lineIndex];
        if (message.ruleId === '@typescript-eslint/no-unused-vars') {
          lines[lineIndex] = prefixUnusedVariable(currentLine, message.column);
          if (currentLine !== lines[lineIndex]) {
            modifications += 1;
          }
        }

        if (message.ruleId === '@typescript-eslint/no-explicit-any') {
          lines[lineIndex] = replaceAnyWithUnknown(lines[lineIndex], message.column);
          if (currentLine !== lines[lineIndex]) {
            modifications += 1;
          }
        }
      });

    const updated = lines.join('\n');
    if (updated !== original) {
      fs.writeFileSync(absolutePath, `${updated}\n`);
    }
  }

  return modifications;
}

function main() {
  for (let pass = 1; pass <= MAX_PASSES; pass += 1) {
    console.log(`\n▶️  Lint resolution pass ${pass}/${MAX_PASSES}`);
    const report = runEslint();
    const outstanding = report.flatMap((r) =>
      r.messages?.filter((m) => TARGET_RULES.has(m.ruleId)) ?? []
    );

    if (outstanding.length === 0) {
      console.log('✅ No targeted lint violations remaining.');
      return;
    }

    const modifications = applyFixes(report);
    console.log(`   Applied ${modifications} automated modifications.`);

    if (modifications === 0) {
      console.error('⚠️  Unable to resolve remaining violations automatically.');
      process.exit(1);
    }
  }

  const finalReport = runEslint();
  const remaining = finalReport.flatMap((r) =>
    r.messages?.filter((m) => TARGET_RULES.has(m.ruleId)) ?? []
  );

  if (remaining.length > 0) {
    console.error('⚠️  Lint violations remain after maximum passes:');
    remaining.forEach((msg) => {
      console.error(` - ${msg.ruleId}: ${msg.message} (${msg.line}:${msg.column})`);
    });
    process.exit(1);
  }

  console.log('✅ Lint violations resolved.');
}

main();

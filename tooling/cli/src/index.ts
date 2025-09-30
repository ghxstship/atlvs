#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { setupCommand } from './commands/setup'
import { generateCommand } from './commands/generate'
import { devCommand } from './commands/dev'
import { buildCommand } from './commands/build'
import { testCommand } from './commands/test'
import { deployCommand } from './commands/deploy'

const program = new Command()

program
  .name('ghxstship')
  .description('GHXSTSHIP CLI - Development automation tool')
  .version('1.0.0')

// Setup command - onboard new developers
program
  .command('setup')
  .description('Set up development environment (< 1 hour)')
  .option('-f, --full', 'Full setup including optional tools')
  .option('-s, --skip-deps', 'Skip dependency installation')
  .action(setupCommand)

// Generate command - code generation
program
  .command('generate <type>')
  .alias('g')
  .description('Generate code (component, page, api, test)')
  .option('-n, --name <name>', 'Name of the generated item')
  .option('-p, --path <path>', 'Custom path for generation')
  .action(generateCommand)

// Dev command - start development
program
  .command('dev [app]')
  .description('Start development server with hot reload')
  .option('-p, --port <port>', 'Port number')
  .option('--turbo', 'Enable turbo mode')
  .action(devCommand)

// Build command - build for production
program
  .command('build [app]')
  .description('Build application for production')
  .option('--analyze', 'Analyze bundle size')
  .action(buildCommand)

// Test command - run tests
program
  .command('test [type]')
  .description('Run tests (unit, integration, e2e, all)')
  .option('-w, --watch', 'Watch mode')
  .option('-c, --coverage', 'Generate coverage report')
  .action(testCommand)

// Deploy command - deploy to environment
program
  .command('deploy <environment>')
  .description('Deploy to environment (dev, staging, prod)')
  .option('--dry-run', 'Simulate deployment')
  .action(deployCommand)

// Parse arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.blue.bold('\n🚀 GHXSTSHIP CLI\n'))
  program.outputHelp()
}

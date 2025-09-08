#!/usr/bin/env tsx
/**
 * Cross-Stack Integration Validator
 * Validates that all database tables are properly integrated across:
 * - Frontend components
 * - API endpoints
 * - Business logic services
 * - Database schema
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const PROJECT_ROOT = path.resolve(__dirname, '..');

interface ValidationResult {
  table: string;
  module: string;
  frontend: {
    hasClient: boolean;
    hasCreateForm: boolean;
    hasEditForm: boolean;
    hasDataView: boolean;
    components: string[];
  };
  api: {
    hasGetEndpoint: boolean;
    hasPostEndpoint: boolean;
    hasPutEndpoint: boolean;
    hasDeleteEndpoint: boolean;
    endpoints: string[];
  };
  businessLogic: {
    hasService: boolean;
    hasDomain: boolean;
    hasRepository: boolean;
    services: string[];
  };
  database: {
    hasTable: boolean;
    hasRLS: boolean;
    hasIndexes: boolean;
    hasTriggers: boolean;
    hasConstraints: boolean;
  };
  issues: string[];
  coverage: number;
}

class CrossStackValidator {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  private results: ValidationResult[] = [];

  async validate(): Promise<void> {
    console.log('🔍 Starting Cross-Stack Integration Validation...\n');

    // Get all database tables
    const tables = await this.getDatabaseTables();
    
    // Validate each table
    for (const table of tables) {
      const result = await this.validateTable(table);
      this.results.push(result);
    }

    // Generate report
    this.generateReport();
  }

  private async getDatabaseTables(): Promise<string[]> {
    const { data, error } = await this.supabase.rpc('get_all_tables', {});
    
    if (error) {
      // Fallback to reading from migrations
      return this.getTablesFromMigrations();
    }
    
    return data || [];
  }

  private async getTablesFromMigrations(): Promise<string[]> {
    const migrationFiles = await glob('supabase/migrations/*.sql', { cwd: PROJECT_ROOT });
    const tables = new Set<string>();

    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
      const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi);
      
      for (const match of tableMatches) {
        const tableName = match[1];
        if (!tableName.includes('_partition') && !tableName.startsWith('mv_')) {
          tables.add(tableName);
        }
      }
    }

    return Array.from(tables);
  }

  private async validateTable(table: string): Promise<ValidationResult> {
    const module = this.getModuleForTable(table);
    
    const result: ValidationResult = {
      table,
      module,
      frontend: await this.validateFrontend(table, module),
      api: await this.validateAPI(table, module),
      businessLogic: await this.validateBusinessLogic(table, module),
      database: await this.validateDatabase(table),
      issues: [],
      coverage: 0
    };

    // Calculate coverage and identify issues
    this.calculateCoverage(result);
    this.identifyIssues(result);

    return result;
  }

  private getModuleForTable(table: string): string {
    const moduleMap: Record<string, string> = {
      // Core
      'organizations': 'core',
      'organization_members': 'core',
      'user_roles': 'core',
      'user_profiles': 'profile',
      'audit_logs': 'core',
      'notifications': 'core',
      
      // Projects
      'projects': 'projects',
      'project_members': 'projects',
      'project_tasks': 'projects',
      'project_milestones': 'projects',
      
      // Finance
      'budgets': 'finance',
      'expenses': 'finance',
      'revenue': 'finance',
      'invoices': 'finance',
      'finance_accounts': 'finance',
      'finance_transactions': 'finance',
      'forecasts': 'finance',
      
      // People
      'people': 'people',
      'people_roles': 'people',
      'people_competencies': 'people',
      'person_competencies': 'people',
      'people_endorsements': 'people',
      'people_shortlists': 'people',
      
      // Companies
      'companies': 'companies',
      'company_contracts': 'companies',
      'company_qualifications': 'companies',
      'company_ratings': 'companies',
      
      // Jobs
      'jobs': 'jobs',
      'job_assignments': 'jobs',
      'job_contracts': 'jobs',
      'opportunities': 'jobs',
      'rfps': 'jobs',
      
      // Programming
      'events': 'programming',
      'spaces': 'programming',
      'lineups': 'programming',
      'riders': 'programming',
      'call_sheets': 'programming',
      
      // Procurement
      'products': 'procurement',
      'services': 'procurement',
      'procurement_orders': 'procurement',
      'procurement_order_items': 'procurement',
      
      // Resources
      'resources': 'resources',
      'resource_categories': 'resources',
      'resource_access': 'resources',
      'training_modules': 'resources',
      'training_progress': 'resources',
      
      // Assets
      'assets': 'assets',
      'asset_categories': 'assets',
      'asset_maintenance': 'assets',
      'asset_assignments': 'assets',
      
      // Analytics
      'dashboards': 'analytics',
      'widgets': 'analytics',
      'reports': 'analytics',
      'export_jobs': 'analytics',
      
      // Pipeline
      'pipeline_stages': 'pipeline',
      'pipeline_opportunities': 'pipeline',
      'pipeline_deals': 'pipeline',
      'pipeline_activities': 'pipeline',
      
      // Settings
      'settings_general': 'settings',
      'settings_security': 'settings',
      'settings_integrations': 'settings',
      
      // Dashboard
      'dashboard_widgets': 'dashboard',
      'dashboard_layouts': 'dashboard',
      'dashboard_metrics': 'dashboard',
      
      // Marketplace
      'marketplace_listings': 'marketplace',
      'marketplace_vendors': 'marketplace',
      'marketplace_catalog_items': 'marketplace'
    };

    return moduleMap[table] || 'unknown';
  }

  private async validateFrontend(table: string, module: string): Promise<ValidationResult['frontend']> {
    const result = {
      hasClient: false,
      hasCreateForm: false,
      hasEditForm: false,
      hasDataView: false,
      components: [] as string[]
    };

    // Check for client components
    const clientPath = path.join(PROJECT_ROOT, 'apps/web/app/(protected)', module);
    
    if (fs.existsSync(clientPath)) {
      const files = await glob('**/*Client.tsx', { cwd: clientPath });
      result.hasClient = files.length > 0;
      result.components = files;

      // Check for specific patterns
      for (const file of files) {
        const content = fs.readFileSync(path.join(clientPath, file), 'utf-8');
        
        if (content.includes('Create') || content.includes('DrawerForm')) {
          result.hasCreateForm = true;
        }
        
        if (content.includes('Edit') || content.includes('Update')) {
          result.hasEditForm = true;
        }
        
        if (content.includes('DataView') || content.includes('GridView')) {
          result.hasDataView = true;
        }
      }
    }

    return result;
  }

  private async validateAPI(table: string, module: string): Promise<ValidationResult['api']> {
    const result = {
      hasGetEndpoint: false,
      hasPostEndpoint: false,
      hasPutEndpoint: false,
      hasDeleteEndpoint: false,
      endpoints: [] as string[]
    };

    // Check for API routes
    const apiPath = path.join(PROJECT_ROOT, 'apps/web/app/api/v1', module);
    
    if (fs.existsSync(apiPath)) {
      const files = await glob('**/route.ts', { cwd: apiPath });
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(apiPath, file), 'utf-8');
        result.endpoints.push(file);
        
        if (content.includes('export async function GET')) {
          result.hasGetEndpoint = true;
        }
        
        if (content.includes('export async function POST')) {
          result.hasPostEndpoint = true;
        }
        
        if (content.includes('export async function PUT')) {
          result.hasPutEndpoint = true;
        }
        
        if (content.includes('export async function DELETE')) {
          result.hasDeleteEndpoint = true;
        }
      }
    }

    return result;
  }

  private async validateBusinessLogic(table: string, module: string): Promise<ValidationResult['businessLogic']> {
    const result = {
      hasService: false,
      hasDomain: false,
      hasRepository: false,
      services: [] as string[]
    };

    // Check for services
    const servicePath = path.join(PROJECT_ROOT, 'packages/application/src/services');
    const domainPath = path.join(PROJECT_ROOT, 'packages/domain/src/modules', module);
    
    if (fs.existsSync(servicePath)) {
      const files = await glob(`**/*${module}*Service.ts`, { cwd: servicePath, nocase: true });
      result.hasService = files.length > 0;
      result.services = files;
    }
    
    if (fs.existsSync(domainPath)) {
      const domainFiles = fs.readdirSync(domainPath);
      result.hasDomain = domainFiles.some(f => f.includes('.ts'));
      result.hasRepository = domainFiles.some(f => f.includes('Repository'));
    }

    return result;
  }

  private async validateDatabase(table: string): Promise<ValidationResult['database']> {
    const result = {
      hasTable: true, // We know it exists if we're validating it
      hasRLS: false,
      hasIndexes: false,
      hasTriggers: false,
      hasConstraints: false
    };

    // Check migrations for RLS, indexes, triggers, constraints
    const migrationFiles = await glob('supabase/migrations/*.sql', { cwd: PROJECT_ROOT });
    
    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
      
      if (content.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)) {
        result.hasRLS = true;
      }
      
      if (content.includes(`CREATE INDEX`) && content.includes(table)) {
        result.hasIndexes = true;
      }
      
      if (content.includes(`CREATE TRIGGER`) && content.includes(table)) {
        result.hasTriggers = true;
      }
      
      if (content.includes(`ADD CONSTRAINT`) && content.includes(table)) {
        result.hasConstraints = true;
      }
    }

    return result;
  }

  private calculateCoverage(result: ValidationResult): void {
    const checks = [
      // Frontend (40% weight)
      result.frontend.hasClient ? 10 : 0,
      result.frontend.hasCreateForm ? 10 : 0,
      result.frontend.hasEditForm ? 10 : 0,
      result.frontend.hasDataView ? 10 : 0,
      
      // API (30% weight)
      result.api.hasGetEndpoint ? 10 : 0,
      result.api.hasPostEndpoint ? 10 : 0,
      (result.api.hasPutEndpoint || result.api.hasDeleteEndpoint) ? 10 : 0,
      
      // Business Logic (20% weight)
      result.businessLogic.hasService ? 10 : 0,
      result.businessLogic.hasDomain ? 5 : 0,
      result.businessLogic.hasRepository ? 5 : 0,
      
      // Database (10% weight)
      result.database.hasRLS ? 3 : 0,
      result.database.hasIndexes ? 3 : 0,
      result.database.hasTriggers ? 2 : 0,
      result.database.hasConstraints ? 2 : 0
    ];

    result.coverage = checks.reduce((sum, val) => sum + val, 0);
  }

  private identifyIssues(result: ValidationResult): void {
    // Frontend issues
    if (!result.frontend.hasClient) {
      result.issues.push('❌ Missing frontend client component');
    }
    if (!result.frontend.hasCreateForm) {
      result.issues.push('⚠️ Missing create form functionality');
    }
    if (!result.frontend.hasEditForm) {
      result.issues.push('⚠️ Missing edit form functionality');
    }
    if (!result.frontend.hasDataView) {
      result.issues.push('⚠️ Missing data view component');
    }

    // API issues
    if (!result.api.hasGetEndpoint) {
      result.issues.push('❌ Missing GET API endpoint');
    }
    if (!result.api.hasPostEndpoint) {
      result.issues.push('❌ Missing POST API endpoint');
    }
    if (!result.api.hasPutEndpoint && !result.api.hasDeleteEndpoint) {
      result.issues.push('⚠️ Missing UPDATE/DELETE endpoints');
    }

    // Business Logic issues
    if (!result.businessLogic.hasService) {
      result.issues.push('❌ Missing business logic service');
    }
    if (!result.businessLogic.hasDomain) {
      result.issues.push('⚠️ Missing domain model');
    }

    // Database issues
    if (!result.database.hasRLS) {
      result.issues.push('🔒 Missing Row Level Security policies');
    }
    if (!result.database.hasIndexes) {
      result.issues.push('⚡ Missing performance indexes');
    }
  }

  private generateReport(): void {
    console.log('=' .repeat(80));
    console.log('CROSS-STACK INTEGRATION VALIDATION REPORT');
    console.log('=' .repeat(80));
    console.log();

    // Group by module
    const moduleGroups = this.results.reduce((acc, result) => {
      if (!acc[result.module]) {
        acc[result.module] = [];
      }
      acc[result.module].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    // Overall statistics
    const totalTables = this.results.length;
    const fullyCovered = this.results.filter(r => r.coverage === 100).length;
    const partiallyCovered = this.results.filter(r => r.coverage > 0 && r.coverage < 100).length;
    const notCovered = this.results.filter(r => r.coverage === 0).length;
    const avgCoverage = this.results.reduce((sum, r) => sum + r.coverage, 0) / totalTables;

    console.log('📊 OVERALL STATISTICS');
    console.log('─'.repeat(40));
    console.log(`Total Tables: ${totalTables}`);
    console.log(`Fully Integrated (100%): ${fullyCovered} tables`);
    console.log(`Partially Integrated: ${partiallyCovered} tables`);
    console.log(`Not Integrated: ${notCovered} tables`);
    console.log(`Average Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log();

    // Module breakdown
    console.log('📦 MODULE BREAKDOWN');
    console.log('─'.repeat(40));
    
    Object.entries(moduleGroups).forEach(([module, tables]) => {
      const moduleCoverage = tables.reduce((sum, t) => sum + t.coverage, 0) / tables.length;
      const status = moduleCoverage === 100 ? '✅' : moduleCoverage >= 80 ? '🟡' : '❌';
      
      console.log(`\n${status} ${module.toUpperCase()} Module (${moduleCoverage.toFixed(1)}% coverage)`);
      
      tables.forEach(table => {
        const icon = table.coverage === 100 ? '✅' : table.coverage >= 80 ? '🟡' : table.coverage >= 50 ? '🟠' : '❌';
        console.log(`  ${icon} ${table.table} (${table.coverage}%)`);
        
        if (table.issues.length > 0 && table.coverage < 100) {
          table.issues.forEach(issue => {
            console.log(`      ${issue}`);
          });
        }
      });
    });

    // Critical issues
    console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION');
    console.log('─'.repeat(40));
    
    const criticalTables = this.results.filter(r => r.coverage < 50);
    if (criticalTables.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      criticalTables.forEach(table => {
        console.log(`\n❌ ${table.table} (${table.module} module) - ${table.coverage}% coverage`);
        table.issues.forEach(issue => {
          console.log(`   ${issue}`);
        });
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('─'.repeat(40));
    
    const recommendations = this.generateRecommendations();
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });

    // Export detailed report
    this.exportDetailedReport();
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check for missing frontend components
    const missingFrontend = this.results.filter(r => !r.frontend.hasClient);
    if (missingFrontend.length > 0) {
      recommendations.push(`Create frontend clients for ${missingFrontend.length} tables: ${missingFrontend.slice(0, 3).map(r => r.table).join(', ')}...`);
    }

    // Check for missing APIs
    const missingAPIs = this.results.filter(r => !r.api.hasGetEndpoint || !r.api.hasPostEndpoint);
    if (missingAPIs.length > 0) {
      recommendations.push(`Implement API endpoints for ${missingAPIs.length} tables`);
    }

    // Check for missing services
    const missingServices = this.results.filter(r => !r.businessLogic.hasService);
    if (missingServices.length > 0) {
      recommendations.push(`Create business logic services for ${missingServices.length} tables`);
    }

    // Check for security issues
    const missingRLS = this.results.filter(r => !r.database.hasRLS);
    if (missingRLS.length > 0) {
      recommendations.push(`Add Row Level Security policies to ${missingRLS.length} tables`);
    }

    // Check for performance issues
    const missingIndexes = this.results.filter(r => !r.database.hasIndexes);
    if (missingIndexes.length > 0) {
      recommendations.push(`Add performance indexes to ${missingIndexes.length} tables`);
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Excellent! All tables are fully integrated across the stack');
    }

    return recommendations;
  }

  private exportDetailedReport(): void {
    const reportPath = path.join(PROJECT_ROOT, 'CROSS_STACK_VALIDATION_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report exported to: ${reportPath}`);
  }
}

// Run validation
const validator = new CrossStackValidator();
validator.validate().catch(console.error);

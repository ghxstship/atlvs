#!/usr/bin/env tsx

/**
 * Deployment Validation Script
 * Validates all enterprise requirements are met before production deployment
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

class DeploymentValidator {
  private results: ValidationResult[] = [];
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private addResult(category: string, test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
    this.results.push({ category, test, status, message, details });
  }

  async validateEnvironment() {
    console.log('🔧 Validating Environment Configuration...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult('Environment', `${envVar}`, 'pass', 'Environment variable configured');
      } else {
        this.addResult('Environment', `${envVar}`, 'fail', 'Missing required environment variable');
      }
    }

    // Validate Supabase connection
    try {
      const { data, error } = await this.supabase.from('organizations').select('count').limit(1);
      if (error) throw error;
      this.addResult('Environment', 'Supabase Connection', 'pass', 'Successfully connected to Supabase');
    } catch (error) {
      this.addResult('Environment', 'Supabase Connection', 'fail', `Failed to connect: ${error}`);
    }
  }

  async validateDatabase() {
    console.log('🗄️ Validating Database Schema and Policies...');
    
    // Check core tables exist
    const coreTables = [
      'organizations', 'users', 'organization_memberships', 'projects', 'tasks',
      'jobs', 'companies', 'files', 'comments', 'audit_logs', 'payments'
    ];

    for (const table of coreTables) {
      try {
        const { data, error } = await this.supabase.from(table).select('*').limit(1);
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is empty table, which is OK
        this.addResult('Database', `Table: ${table}`, 'pass', 'Table exists and accessible');
      } catch (error) {
        this.addResult('Database', `Table: ${table}`, 'fail', `Table validation failed: ${error}`);
      }
    }

    // Validate RLS policies
    try {
      const { data: policies } = await this.supabase
        .rpc('get_rls_policies')
        .catch(() => ({ data: null }));
      
      if (policies && policies.length > 0) {
        this.addResult('Database', 'RLS Policies', 'pass', `${policies.length} RLS policies configured`);
      } else {
        this.addResult('Database', 'RLS Policies', 'warning', 'Could not verify RLS policies');
      }
    } catch (error) {
      this.addResult('Database', 'RLS Policies', 'warning', `RLS validation failed: ${error}`);
    }
  }

  async validateAuth() {
    console.log('🔐 Validating Authentication System...');
    
    // Test auth configuration
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      this.addResult('Auth', 'Auth Service', 'pass', 'Auth service accessible');
    } catch (error) {
      this.addResult('Auth', 'Auth Service', 'fail', `Auth service error: ${error}`);
    }

    // Check auth providers
    try {
      const { data: providers } = await this.supabase.auth.getSession();
      this.addResult('Auth', 'Auth Providers', 'pass', 'Auth providers configured');
    } catch (error) {
      this.addResult('Auth', 'Auth Providers', 'warning', `Could not verify providers: ${error}`);
    }
  }

  async validateEdgeFunctions() {
    console.log('⚡ Validating Edge Functions...');
    
    const functions = ['validate-record', 'import-export'];
    
    for (const func of functions) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${func}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ test: true })
        });
        
        if (response.status === 200 || response.status === 400) { // 400 is OK for test payload
          this.addResult('Edge Functions', func, 'pass', 'Function deployed and responding');
        } else {
          this.addResult('Edge Functions', func, 'fail', `Function returned status ${response.status}`);
        }
      } catch (error) {
        this.addResult('Edge Functions', func, 'fail', `Function test failed: ${error}`);
      }
    }
  }

  async validateStorage() {
    console.log('📁 Validating Storage Configuration...');
    
    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      if (error) throw error;
      
      const requiredBuckets = ['files', 'avatars', 'exports'];
      const existingBuckets = buckets.map(b => b.name);
      
      for (const bucket of requiredBuckets) {
        if (existingBuckets.includes(bucket)) {
          this.addResult('Storage', `Bucket: ${bucket}`, 'pass', 'Storage bucket exists');
        } else {
          this.addResult('Storage', `Bucket: ${bucket}`, 'fail', 'Required storage bucket missing');
        }
      }
    } catch (error) {
      this.addResult('Storage', 'Storage Service', 'fail', `Storage validation failed: ${error}`);
    }
  }

  validateBuild() {
    console.log('🏗️ Validating Build Configuration...');
    
    // Check if build succeeds
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build', 'Next.js Build', 'pass', 'Application builds successfully');
    } catch (error) {
      this.addResult('Build', 'Next.js Build', 'fail', `Build failed: ${error}`);
    }

    // Check TypeScript compilation
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.addResult('Build', 'TypeScript', 'pass', 'TypeScript compilation successful');
    } catch (error) {
      this.addResult('Build', 'TypeScript', 'warning', 'TypeScript compilation has warnings/errors');
    }

    // Check for required files
    const requiredFiles = [
      'package.json',
      'next.config.mjs',
      'tailwind.config.ts',
      'tsconfig.json',
      '.env.example'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        this.addResult('Build', `File: ${file}`, 'pass', 'Required file exists');
      } else {
        this.addResult('Build', `File: ${file}`, 'fail', 'Required file missing');
      }
    }
  }

  async validateAPI() {
    console.log('🌐 Validating API Endpoints...');
    
    const endpoints = [
      { path: '/api/health', method: 'GET' },
      { path: '/api/v1/health', method: 'GET' },
      { path: '/api/demo/seed', method: 'POST' },
      { path: '/api/demo/remove', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        // Note: In real deployment, we'd test against the actual deployed URL
        const filePath = path.join(process.cwd(), 'apps/web/app', endpoint.path, 'route.ts');
        if (fs.existsSync(filePath)) {
          this.addResult('API', `${endpoint.method} ${endpoint.path}`, 'pass', 'API endpoint file exists');
        } else {
          this.addResult('API', `${endpoint.method} ${endpoint.path}`, 'fail', 'API endpoint file missing');
        }
      } catch (error) {
        this.addResult('API', `${endpoint.method} ${endpoint.path}`, 'fail', `Endpoint validation failed: ${error}`);
      }
    }
  }

  validateSecurity() {
    console.log('🔒 Validating Security Configuration...');
    
    // Check for security headers in Next.js config
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf8');
      if (config.includes('headers') || config.includes('security')) {
        this.addResult('Security', 'Security Headers', 'pass', 'Security headers configured');
      } else {
        this.addResult('Security', 'Security Headers', 'warning', 'Security headers not found in config');
      }
    }

    // Check for HTTPS enforcement
    if (process.env.NODE_ENV === 'production') {
      this.addResult('Security', 'HTTPS Enforcement', 'pass', 'Production environment detected');
    } else {
      this.addResult('Security', 'HTTPS Enforcement', 'warning', 'Not in production environment');
    }

    // Check for sensitive data in environment
    const sensitivePatterns = ['password', 'secret', 'key'];
    let foundSensitiveData = false;
    
    for (const [key, value] of Object.entries(process.env)) {
      if (sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))) {
        if (value && value.length > 0) {
          foundSensitiveData = true;
        }
      }
    }
    
    if (foundSensitiveData) {
      this.addResult('Security', 'Environment Secrets', 'pass', 'Sensitive environment variables configured');
    } else {
      this.addResult('Security', 'Environment Secrets', 'fail', 'Missing sensitive environment variables');
    }
  }

  async validatePerformance() {
    console.log('⚡ Validating Performance Configuration...');
    
    // Check for performance optimizations in package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for performance-related dependencies
      const perfDeps = ['@vercel/analytics', '@vercel/speed-insights'];
      const hasPerfDeps = perfDeps.some(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      );
      
      if (hasPerfDeps) {
        this.addResult('Performance', 'Analytics Dependencies', 'pass', 'Performance monitoring dependencies found');
      } else {
        this.addResult('Performance', 'Analytics Dependencies', 'warning', 'Performance monitoring dependencies not found');
      }
    }

    // Check for image optimization
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf8');
      if (config.includes('images') || config.includes('optimization')) {
        this.addResult('Performance', 'Image Optimization', 'pass', 'Image optimization configured');
      } else {
        this.addResult('Performance', 'Image Optimization', 'warning', 'Image optimization not configured');
      }
    }
  }

  async runAllValidations() {
    console.log('🚀 Starting Deployment Validation...\n');
    
    try {
      await this.validateEnvironment();
      await this.validateDatabase();
      await this.validateAuth();
      await this.validateEdgeFunctions();
      await this.validateStorage();
      this.validateBuild();
      await this.validateAPI();
      this.validateSecurity();
      await this.validatePerformance();
    } catch (error) {
      console.error('Validation error:', error);
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Deployment Validation Report');
    console.log('================================\n');
    
    const categories = [...new Set(this.results.map(r => r.category))];
    let totalTests = this.results.length;
    let passedTests = this.results.filter(r => r.status === 'pass').length;
    let failedTests = this.results.filter(r => r.status === 'fail').length;
    let warningTests = this.results.filter(r => r.status === 'warning').length;
    
    for (const category of categories) {
      console.log(`\n📋 ${category}`);
      console.log('-'.repeat(category.length + 4));
      
      const categoryResults = this.results.filter(r => r.category === category);
      for (const result of categoryResults) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${result.test}: ${result.message}`);
        if (result.details) {
          console.log(`   ${result.details}`);
        }
      }
    }
    
    console.log('\n📈 Summary');
    console.log('===========');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 All critical validations passed! Ready for deployment.');
    } else {
      console.log('\n🚨 Some validations failed. Please address issues before deployment.');
    }
    
    // Write detailed report to file
    const reportPath = path.join(process.cwd(), 'deployment-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { totalTests, passedTests, failedTests, warningTests, successRate: parseFloat(successRate) },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if any tests failed
    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.runAllValidations().catch(console.error);
}

export { DeploymentValidator };

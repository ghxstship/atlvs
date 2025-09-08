#!/usr/bin/env tsx
/**
 * ERD Generator for GHXSTSHIP Database Schema
 * Generates a comprehensive Entity Relationship Diagram using Mermaid syntax
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
  indexes: string[];
  module: string;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  default?: string;
}

interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

class ERDGenerator {
  private tables: Map<string, Table> = new Map();
  private projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  async generate(): Promise<void> {
    console.log('🎨 Generating Entity Relationship Diagram...\n');

    // Parse all migration files
    await this.parseMigrations();

    // Generate Mermaid ERD
    const mermaidDiagram = this.generateMermaidERD();
    
    // Generate HTML visualization
    const htmlVisualization = this.generateHTMLVisualization(mermaidDiagram);
    
    // Generate detailed documentation
    const documentation = this.generateDocumentation();

    // Save outputs
    this.saveOutputs(mermaidDiagram, htmlVisualization, documentation);

    console.log('✅ ERD generation complete!');
  }

  private async parseMigrations(): Promise<void> {
    const migrationFiles = await glob('supabase/migrations/*.sql', { 
      cwd: this.projectRoot 
    });

    for (const file of migrationFiles) {
      const content = fs.readFileSync(
        path.join(this.projectRoot, file), 
        'utf-8'
      );
      this.parseSQL(content);
    }
  }

  private parseSQL(sql: string): void {
    // Parse CREATE TABLE statements
    const tableRegex = /CREATE TABLE (?:IF NOT EXISTS )?(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;

    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const tableDefinition = match[2];

      if (tableName.includes('_partition') || tableName.startsWith('mv_')) {
        continue; // Skip partitions and materialized views
      }

      const table: Table = {
        name: tableName,
        columns: this.parseColumns(tableDefinition),
        foreignKeys: this.parseForeignKeys(tableDefinition, tableName, sql),
        indexes: this.parseIndexes(tableName, sql),
        module: this.getModuleForTable(tableName)
      };

      this.tables.set(tableName, table);
    }
  }

  private parseColumns(definition: string): Column[] {
    const columns: Column[] = [];
    const lines = definition.split(',').map(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('CONSTRAINT') || 
          line.startsWith('PRIMARY KEY') ||
          line.startsWith('FOREIGN KEY') ||
          line.startsWith('CHECK') ||
          line.startsWith('UNIQUE')) {
        continue;
      }

      const columnMatch = line.match(/^(\w+)\s+([A-Z][A-Z0-9_()]*(?:\[\])?)/i);
      if (columnMatch) {
        const column: Column = {
          name: columnMatch[1],
          type: this.normalizeType(columnMatch[2]),
          nullable: !line.includes('NOT NULL'),
          primaryKey: line.includes('PRIMARY KEY'),
          unique: line.includes('UNIQUE'),
          default: this.extractDefault(line)
        };
        columns.push(column);
      }
    }

    return columns;
  }

  private normalizeType(type: string): string {
    return type
      .replace(/\(\d+\)/g, '')
      .replace('CHARACTER VARYING', 'VARCHAR')
      .replace('TIMESTAMP WITH TIME ZONE', 'TIMESTAMPTZ')
      .replace('TIMESTAMP WITHOUT TIME ZONE', 'TIMESTAMP')
      .replace('[]', '_ARRAY');
  }

  private extractDefault(line: string): string | undefined {
    const defaultMatch = line.match(/DEFAULT\s+([^,]+)/i);
    return defaultMatch ? defaultMatch[1].trim() : undefined;
  }

  private parseForeignKeys(definition: string, tableName: string, sql: string): ForeignKey[] {
    const foreignKeys: ForeignKey[] = [];
    
    // Parse inline foreign keys
    const inlineRegex = /(\w+)\s+UUID[^,]*REFERENCES\s+(\w+)(?:\((\w+)\))?/gi;
    let match;
    
    while ((match = inlineRegex.exec(definition)) !== null) {
      foreignKeys.push({
        column: match[1],
        referencedTable: match[2],
        referencedColumn: match[3] || 'id'
      });
    }

    // Parse ALTER TABLE foreign keys
    const alterRegex = new RegExp(
      `ALTER TABLE ${tableName}[^;]*ADD (?:CONSTRAINT \\w+ )?FOREIGN KEY \\((\\w+)\\) REFERENCES (\\w+)(?:\\((\\w+)\\))?`,
      'gi'
    );
    
    while ((match = alterRegex.exec(sql)) !== null) {
      foreignKeys.push({
        column: match[1],
        referencedTable: match[2],
        referencedColumn: match[3] || 'id'
      });
    }

    return foreignKeys;
  }

  private parseIndexes(tableName: string, sql: string): string[] {
    const indexes: string[] = [];
    const indexRegex = new RegExp(
      `CREATE (?:UNIQUE )?INDEX[^;]*ON ${tableName}\\s*(?:USING \\w+)?\\s*\\(([^)]+)\\)`,
      'gi'
    );
    let match;

    while ((match = indexRegex.exec(sql)) !== null) {
      indexes.push(match[1].trim());
    }

    return indexes;
  }

  private getModuleForTable(tableName: string): string {
    const moduleMap: Record<string, string[]> = {
      'Core': ['organizations', 'organization_members', 'user_roles', 'audit_logs', 'notifications', 'api_keys', 'webhooks'],
      'Projects': ['projects', 'project_members', 'project_tasks', 'project_milestones', 'project_dependencies'],
      'Finance': ['budgets', 'expenses', 'revenue', 'invoices', 'finance_accounts', 'finance_transactions', 'forecasts'],
      'People': ['people', 'people_roles', 'people_competencies', 'person_competencies', 'people_endorsements'],
      'Companies': ['companies', 'company_contracts', 'company_qualifications', 'company_ratings'],
      'Jobs': ['jobs', 'job_assignments', 'job_contracts', 'opportunities', 'rfps'],
      'Programming': ['events', 'spaces', 'lineups', 'riders', 'call_sheets', 'activations'],
      'Procurement': ['products', 'services', 'procurement_orders', 'procurement_order_items'],
      'Resources': ['resources', 'resource_categories', 'resource_access', 'training_modules', 'training_progress'],
      'Assets': ['assets', 'asset_categories', 'asset_maintenance', 'asset_assignments'],
      'Analytics': ['dashboards', 'widgets', 'reports', 'export_jobs', 'analytics_metrics'],
      'Pipeline': ['pipeline_stages', 'pipeline_opportunities', 'pipeline_deals', 'pipeline_activities'],
      'Settings': ['settings_general', 'settings_security', 'settings_integrations'],
      'Dashboard': ['dashboard_widgets', 'dashboard_layouts', 'dashboard_metrics'],
      'Profile': ['user_profiles', 'user_profile_activity', 'certifications', 'job_history'],
      'Marketplace': ['marketplace_listings', 'marketplace_vendors', 'marketplace_catalog_items']
    };

    for (const [module, tables] of Object.entries(moduleMap)) {
      if (tables.includes(tableName)) {
        return module;
      }
    }

    return 'Other';
  }

  private generateMermaidERD(): string {
    let mermaid = `erDiagram
    %% GHXSTSHIP Database Schema - Entity Relationship Diagram
    %% Generated: ${new Date().toISOString()}
    
`;

    // Group tables by module
    const moduleGroups = new Map<string, Table[]>();
    for (const table of this.tables.values()) {
      if (!moduleGroups.has(table.module)) {
        moduleGroups.set(table.module, []);
      }
      moduleGroups.get(table.module)!.push(table);
    }

    // Generate entities and relationships by module
    for (const [module, tables] of moduleGroups.entries()) {
      mermaid += `    %% ==================== ${module} Module ====================\n`;
      
      // Generate entity definitions
      for (const table of tables) {
        mermaid += `    ${table.name} {\n`;
        
        for (const column of table.columns) {
          const type = column.type.replace(/_ARRAY$/, '[]');
          const key = column.primaryKey ? 'PK' : column.unique ? 'UK' : '';
          const nullable = column.nullable ? '' : '*';
          mermaid += `        ${type} ${column.name}${nullable} ${key}\n`;
        }
        
        mermaid += `    }\n\n`;
      }
    }

    // Generate relationships
    mermaid += `    %% ==================== Relationships ====================\n`;
    
    for (const table of this.tables.values()) {
      for (const fk of table.foreignKeys) {
        const relationship = this.determineRelationship(table.name, fk);
        mermaid += `    ${fk.referencedTable} ${relationship} ${table.name} : "${fk.column}"\n`;
      }
    }

    return mermaid;
  }

  private determineRelationship(tableName: string, fk: ForeignKey): string {
    // Determine cardinality based on naming conventions
    if (tableName.includes('_members') || 
        tableName.includes('_items') || 
        tableName.includes('_assignments')) {
      return '||--o{'; // One to many
    }
    
    if (fk.column.endsWith('_id') && !fk.column.includes('parent')) {
      return '||--o|'; // One to one (optional)
    }
    
    return '||--o{'; // Default to one to many
  }

  private generateHTMLVisualization(mermaidDiagram: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GHXSTSHIP Database ERD</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 700;
        }
        .subtitle {
            margin-top: 10px;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .controls {
            padding: 20px;
            background: #f7f9fc;
            border-bottom: 1px solid #e1e8ed;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        button:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        #diagram {
            padding: 40px;
            overflow: auto;
            background: white;
        }
        .stats {
            padding: 20px 30px;
            background: #f7f9fc;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: 700;
            color: #667eea;
        }
        .stat-label {
            color: #64748b;
            margin-top: 5px;
        }
        .mermaid {
            display: flex;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚢 GHXSTSHIP Database Schema</h1>
            <div class="subtitle">Enterprise-Grade Entity Relationship Diagram</div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${this.tables.size}</div>
                <div class="stat-label">Total Tables</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.countRelationships()}</div>
                <div class="stat-label">Relationships</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.countColumns()}</div>
                <div class="stat-label">Total Columns</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.countModules()}</div>
                <div class="stat-label">Modules</div>
            </div>
        </div>
        
        <div class="controls">
            <button onclick="zoomIn()">🔍 Zoom In</button>
            <button onclick="zoomOut()">🔍 Zoom Out</button>
            <button onclick="resetZoom()">↺ Reset</button>
            <button onclick="downloadSVG()">💾 Download SVG</button>
            <button onclick="toggleTheme()">🌙 Dark Mode</button>
        </div>
        
        <div id="diagram">
            <div class="mermaid">
${mermaidDiagram}
            </div>
        </div>
    </div>

    <script>
        let currentZoom = 1;
        let isDarkMode = false;

        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            er: {
                diagramPadding: 20,
                layoutDirection: 'TB',
                minEntityWidth: 100,
                minEntityHeight: 75,
                entityPadding: 15,
                stroke: '#667eea',
                fill: '#f0f4ff'
            }
        });

        function zoomIn() {
            currentZoom += 0.1;
            applyZoom();
        }

        function zoomOut() {
            currentZoom -= 0.1;
            applyZoom();
        }

        function resetZoom() {
            currentZoom = 1;
            applyZoom();
        }

        function applyZoom() {
            const svg = document.querySelector('#diagram svg');
            if (svg) {
                svg.style.transform = \`scale(\${currentZoom})\`;
                svg.style.transformOrigin = 'center top';
            }
        }

        function downloadSVG() {
            const svg = document.querySelector('#diagram svg');
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ghxstship-database-erd.svg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }

        function toggleTheme() {
            isDarkMode = !isDarkMode;
            document.body.style.background = isDarkMode 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    </script>
</body>
</html>`;
  }

  private countRelationships(): number {
    let count = 0;
    for (const table of this.tables.values()) {
      count += table.foreignKeys.length;
    }
    return count;
  }

  private countColumns(): number {
    let count = 0;
    for (const table of this.tables.values()) {
      count += table.columns.length;
    }
    return count;
  }

  private countModules(): number {
    const modules = new Set<string>();
    for (const table of this.tables.values()) {
      modules.add(table.module);
    }
    return modules.size;
  }

  private generateDocumentation(): string {
    let doc = `# GHXSTSHIP Database Schema Documentation

Generated: ${new Date().toISOString()}

## Overview

The GHXSTSHIP database schema consists of **${this.tables.size} tables** organized across **${this.countModules()} modules** with **${this.countRelationships()} foreign key relationships**.

## Table of Contents

`;

    // Generate TOC
    const moduleGroups = new Map<string, Table[]>();
    for (const table of this.tables.values()) {
      if (!moduleGroups.has(table.module)) {
        moduleGroups.set(table.module, []);
      }
      moduleGroups.get(table.module)!.push(table);
    }

    for (const module of moduleGroups.keys()) {
      doc += `- [${module} Module](#${module.toLowerCase()}-module)\n`;
    }

    doc += `\n## Modules\n\n`;

    // Generate detailed documentation for each module
    for (const [module, tables] of moduleGroups.entries()) {
      doc += `### ${module} Module\n\n`;
      doc += `**Tables:** ${tables.length}\n\n`;

      for (const table of tables) {
        doc += `#### ${table.name}\n\n`;
        doc += `**Description:** ${this.getTableDescription(table.name)}\n\n`;
        
        // Columns table
        doc += `| Column | Type | Nullable | Key | Default | Description |\n`;
        doc += `|--------|------|----------|-----|---------|-------------|\n`;
        
        for (const column of table.columns) {
          const key = column.primaryKey ? 'PK' : column.unique ? 'UK' : '';
          const nullable = column.nullable ? 'Yes' : 'No';
          const defaultVal = column.default || '-';
          const description = this.getColumnDescription(table.name, column.name);
          
          doc += `| ${column.name} | ${column.type} | ${nullable} | ${key} | ${defaultVal} | ${description} |\n`;
        }

        // Foreign Keys
        if (table.foreignKeys.length > 0) {
          doc += `\n**Foreign Keys:**\n\n`;
          for (const fk of table.foreignKeys) {
            doc += `- \`${fk.column}\` → \`${fk.referencedTable}.${fk.referencedColumn}\`\n`;
          }
        }

        // Indexes
        if (table.indexes.length > 0) {
          doc += `\n**Indexes:**\n\n`;
          for (const index of table.indexes) {
            doc += `- \`${index}\`\n`;
          }
        }

        doc += `\n---\n\n`;
      }
    }

    return doc;
  }

  private getTableDescription(tableName: string): string {
    const descriptions: Record<string, string> = {
      'organizations': 'Multi-tenant organizations with subscription and quota management',
      'projects': 'Project management with timeline, budget, and resource tracking',
      'people': 'Human resources and personnel management',
      'companies': 'External company and vendor management',
      'jobs': 'Job opportunities and contractor management',
      'events': 'Event scheduling and programming management',
      'resources': 'Knowledge base and training resources',
      'assets': 'Physical and digital asset tracking',
      'budgets': 'Financial budget allocation and tracking',
      'invoices': 'Invoice generation and payment tracking'
    };

    return descriptions[tableName] || `Manages ${tableName.replace(/_/g, ' ')} data`;
  }

  private getColumnDescription(tableName: string, columnName: string): string {
    const commonDescriptions: Record<string, string> = {
      'id': 'Primary key',
      'organization_id': 'Organization reference',
      'created_at': 'Record creation timestamp',
      'updated_at': 'Last update timestamp',
      'created_by': 'User who created the record',
      'updated_by': 'User who last updated the record',
      'is_active': 'Active status flag',
      'status': 'Current status',
      'name': 'Display name',
      'description': 'Detailed description',
      'email': 'Email address',
      'phone': 'Phone number',
      'amount': 'Monetary amount',
      'currency': 'Currency code',
      'metadata': 'Additional JSON metadata'
    };

    return commonDescriptions[columnName] || columnName.replace(/_/g, ' ');
  }

  private saveOutputs(mermaid: string, html: string, documentation: string): void {
    // Save Mermaid diagram
    const mermaidPath = path.join(this.projectRoot, 'database-erd.mmd');
    fs.writeFileSync(mermaidPath, mermaid);
    console.log(`📊 Mermaid diagram saved to: ${mermaidPath}`);

    // Save HTML visualization
    const htmlPath = path.join(this.projectRoot, 'database-erd.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`🌐 HTML visualization saved to: ${htmlPath}`);

    // Save documentation
    const docPath = path.join(this.projectRoot, 'DATABASE_SCHEMA_DOCUMENTATION.md');
    fs.writeFileSync(docPath, documentation);
    console.log(`📚 Documentation saved to: ${docPath}`);
  }
}

// Run generator
const generator = new ERDGenerator();
generator.generate().catch(console.error);

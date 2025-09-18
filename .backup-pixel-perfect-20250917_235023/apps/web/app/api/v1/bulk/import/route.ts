import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BulkImportSchema = z.object({
  table: z.string(),
  data: z.array(z.record(z.any())),
  options: z.object({
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false),
    batchSize: z.number().min(1).max(1000).default(100)
  }).optional()
});

const CSVImportSchema = z.object({
  table: z.string(),
  csvContent: z.string(),
  options: z.object({
    hasHeaders: z.boolean().default(true),
    delimiter: z.string().default(','),
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateOnly: z.boolean().default(false)
  }).optional()
});

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

// Parse CSV content into array of objects
function parseCSV(csvContent: string, hasHeaders = true, delimiter = ','): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];

  let headers: string[];
  let dataLines: string[];

  if (hasHeaders) {
    headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    dataLines = lines.slice(1);
  } else {
    // Generate generic headers
    const firstLine = lines[0].split(delimiter);
    headers = firstLine.map((_, index) => `column_${index + 1}`);
    dataLines = lines;
  }

  return dataLines.map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      // Try to parse as number
      if (value && !isNaN(Number(value))) {
        row[header] = Number(value);
      }
      // Try to parse as boolean
      else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        row[header] = value.toLowerCase() === 'true';
      }
      // Try to parse as date
      else if (value && !isNaN(Date.parse(value))) {
        row[header] = new Date(value).toISOString();
      }
      // Keep as string
      else {
        row[header] = value;
      }
    });
    
    return row;
  });
}

// Validate record data
function validateRecord(record: any, table: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation rules by table
  const validationRules: Record<string, any> = {
    companies: {
      required: ['name', 'industry'],
      fields: {
        name: { type: 'string', minLength: 1 },
        industry: { type: 'string', minLength: 1 },
        email: { type: 'email', optional: true },
        website: { type: 'url', optional: true }
      }
    },
    projects: {
      required: ['name'],
      fields: {
        name: { type: 'string', minLength: 1 },
        status: { type: 'enum', values: ['planning', 'active', 'completed', 'cancelled'] }
      }
    },
    people: {
      required: ['name', 'email'],
      fields: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'email' }
      }
    }
  };

  const rules = validationRules[table];
  if (!rules) {
    return { valid: true, errors: [] }; // No specific validation rules
  }

  // Check required fields
  rules.required?.forEach((field: string) => {
    if (!record[field] || (typeof record[field] === 'string' && record[field].trim() === '')) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate field types
  Object.entries(rules.fields || {}).forEach(([field, rule]: [string, any]) => {
    const value = record[field];
    
    if (!value && rule.optional) return;
    if (!value && !rule.optional) {
      errors.push(`Field ${field} is required`);
      return;
    }

    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field ${field} must be a string`);
        } else if (rule.minLength && value.length < rule.minLength) {
          errors.push(`Field ${field} must be at least ${rule.minLength} characters`);
        }
        break;
      
      case 'email':
        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`Field ${field} must be a valid email address`);
        }
        break;
      
      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            errors.push(`Field ${field} must be a valid URL`);
          }
        }
        break;
      
      case 'enum':
        if (rule.values && !rule.values.includes(value)) {
          errors.push(`Field ${field} must be one of: ${rule.values.join(', ')}`);
        }
        break;
    }
  });

  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions for import operations' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    let parsedData;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      parsedData = BulkImportSchema.parse(body);
    } else if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
      // Handle CSV upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const table = formData.get('table') as string;
      const optionsStr = formData.get('options') as string;
      
      if (!file || !table) {
        return NextResponse.json({ error: 'File and table parameters required' }, { status: 400 });
      }

      const csvContent = await file.text();
      const options = optionsStr ? JSON.parse(optionsStr) : {};
      
      const csvData = parseCSV(csvContent, options.hasHeaders, options.delimiter);
      
      parsedData = {
        table,
        data: csvData,
        options
      };
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const { table, data, options = {} } = parsedData;
    const { skipDuplicates, updateExisting, validateOnly, batchSize = 100 } = options;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data provided for import' }, { status: 400 });
    }

    // Validate all records
    const validationResults = data.map((record, index) => ({
      index,
      record,
      ...validateRecord(record, table)
    }));

    const validRecords = validationResults.filter(r => r.valid);
    const invalidRecords = validationResults.filter(r => !r.valid);

    // If validation only, return results
    if (validateOnly) {
      return NextResponse.json({
        success: true,
        validationOnly: true,
        totalRecords: data.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        errors: invalidRecords.map(r => ({
          index: r.index,
          errors: r.errors
        }))
      });
    }

    // Stop if there are validation errors and not skipping
    if (invalidRecords.length > 0 && !skipDuplicates) {
      return NextResponse.json({
        error: 'Validation errors found',
        totalRecords: data.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        errors: invalidRecords.map(r => ({
          index: r.index,
          errors: r.errors
        }))
      }, { status: 400 });
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    // Process valid records in batches
    const recordsToProcess = validRecords.map(r => r.record);
    
    for (let i = 0; i < recordsToProcess.length; i += batchSize) {
      const batch = recordsToProcess.slice(i, i + batchSize);
      
      // Add organization context and timestamps
      const batchData = batch.map(record => ({
        ...record,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      try {
        if (updateExisting) {
          // Handle upsert logic
          for (const record of batchData) {
            const { data: existing } = await supabase
              .from(table)
              .select('id')
              .eq('organization_id', orgId)
              .eq('name', record.name) // Assuming name is the unique identifier
              .single();

            if (existing) {
              // Update existing record
              const { error: updateError } = await supabase
                .from(table)
                .update({
                  ...record,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

              if (!updateError) {
                updatedCount++;
              } else {
                errors.push({ record, error: updateError.message });
              }
            } else {
              // Insert new record
              const { error: insertError } = await supabase
                .from(table)
                .insert(record);

              if (!insertError) {
                importedCount++;
              } else {
                errors.push({ record, error: insertError.message });
              }
            }
          }
        } else {
          // Simple insert
          const { data: insertResult, error: insertError } = await supabase
            .from(table)
            .insert(batchData)
            .select();

          if (insertError) {
            if (skipDuplicates && insertError.message.includes('duplicate')) {
              skippedCount += batch.length;
            } else {
              errors.push({ batch, error: insertError.message });
            }
          } else {
            importedCount += insertResult?.length || 0;
          }
        }
      } catch (batchError: any) {
        errors.push({ batch, error: batchError.message });
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'bulk.import',
      resource_type: table,
      details: { 
        totalRecords: data.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        importedCount,
        updatedCount,
        skippedCount,
        errorCount: errors.length
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      totalRecords: data.length,
      validRecords: validRecords.length,
      invalidRecords: invalidRecords.length,
      importedCount,
      updatedCount,
      skippedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10) // Limit error details
    });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint for import templates and validation rules
export async function GET(request: NextRequest) {
  try {
    const { user, orgId } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    const templates = {
      companies: {
        name: 'Companies Import Template',
        description: 'Template for importing company records',
        requiredFields: ['name', 'industry'],
        optionalFields: ['description', 'website', 'email', 'phone', 'address', 'city', 'state', 'country'],
        sampleData: [
          {
            name: 'Acme Corporation',
            industry: 'Technology',
            website: 'https://acme.com',
            email: 'contact@acme.com'
          }
        ]
      },
      projects: {
        name: 'Projects Import Template',
        description: 'Template for importing project records',
        requiredFields: ['name'],
        optionalFields: ['description', 'status', 'starts_at', 'ends_at'],
        sampleData: [
          {
            name: 'Website Redesign',
            description: 'Complete website redesign project',
            status: 'planning'
          }
        ]
      },
      people: {
        name: 'People Import Template',
        description: 'Template for importing people records',
        requiredFields: ['name', 'email'],
        optionalFields: ['phone', 'title', 'department'],
        sampleData: [
          {
            name: 'John Doe',
            email: 'john.doe@company.com',
            title: 'Software Engineer'
          }
        ]
      }
    };

    if (table && templates[table as keyof typeof templates]) {
      return NextResponse.json({
        table,
        template: templates[table as keyof typeof templates],
        supportedFormats: ['csv', 'json'],
        validationRules: {
          maxRecords: 10000,
          maxFileSize: '10MB',
          supportedDelimiters: [',', ';', '\t']
        }
      });
    }

    return NextResponse.json({
      availableTables: Object.keys(templates),
      templates,
      supportedFormats: ['csv', 'json'],
      validationRules: {
        maxRecords: 10000,
        maxFileSize: '10MB',
        supportedDelimiters: [',', ';', '\t']
      }
    });

  } catch (error: any) {
    console.error('Import template error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

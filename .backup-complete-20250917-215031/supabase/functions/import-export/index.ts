/**
 * Edge Function: Import/Export Pipeline
 * Handles bulk data import/export with validation and background processing
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ImportRequest {
  table: string;
  data: any[];
  organizationId: string;
  userId: string;
  validate?: boolean;
  batchSize?: number;
}

interface ExportRequest {
  table: string;
  organizationId: string;
  userId: string;
  format: 'csv' | 'json' | 'xlsx';
  filters?: Record<string, any>;
  columns?: string[];
}

interface ImportResult {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const operation = url.pathname.split('/').pop();

    switch (operation) {
      case 'import':
        return await handleImport(req, supabase);
      case 'export':
        return await handleExport(req, supabase);
      case 'status':
        return await handleStatus(req, supabase);
      default:
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleImport(req: Request, supabase: any) {
  const { table, data, organizationId, userId, validate = true, batchSize = 100 }: ImportRequest = await req.json();

  // Validate user permissions
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (!membership || !['owner', 'admin', 'manager'].includes(membership.role)) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 403,
    });
  }

  // Create import job
  const jobId = crypto.randomUUID();
  const { error: jobError } = await supabase
    .from('import_jobs')
    .insert({
      id: jobId,
      table_name: table,
      organization_id: organizationId,
      created_by: userId,
      status: 'processing',
      total_rows: data.length,
      processed_rows: 0,
      success_count: 0,
      error_count: 0
    });

  if (jobError) {
    throw new Error(`Failed to create import job: ${jobError.message}`);
  }

  // Process import in background
  processImport(supabase, jobId, table, data, organizationId, userId, validate, batchSize);

  return new Response(JSON.stringify({
    jobId,
    status: 'processing',
    totalRows: data.length,
    message: 'Import started. Use the job ID to check status.'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 202,
  });
}

async function processImport(
  supabase: any,
  jobId: string,
  table: string,
  data: any[],
  organizationId: string,
  userId: string,
  validate: boolean,
  batchSize: number
) {
  const errors: Array<{ row: number; error: string; data: any }> = [];
  let successCount = 0;
  let processedRows = 0;

  try {
    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 1;
        const record = batch[j];

        try {
          // Add organization context
          const recordWithContext = {
            ...record,
            organization_id: organizationId,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Validate if requested
          if (validate) {
            const validationResult = await validateRecord(supabase, table, recordWithContext, organizationId);
            if (!validationResult.valid) {
              errors.push({
                row: rowIndex,
                error: validationResult.errors.join(', '),
                data: record
              });
              continue;
            }
          }

          // Insert record
          const { error: insertError } = await supabase
            .from(table)
            .insert(recordWithContext);

          if (insertError) {
            errors.push({
              row: rowIndex,
              error: insertError.message,
              data: record
            });
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push({
            row: rowIndex,
            error: error.message,
            data: record
          });
        }

        processedRows++;

        // Update job progress every 10 records
        if (processedRows % 10 === 0) {
          await supabase
            .from('import_jobs')
            .update({
              processed_rows: processedRows,
              success_count: successCount,
              error_count: errors.length
            })
            .eq('id', jobId);
        }
      }
    }

    // Final job update
    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        processed_rows: processedRows,
        success_count: successCount,
        error_count: errors.length,
        errors: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

  } catch (error) {
    // Mark job as failed
    await supabase
      .from('import_jobs')
      .update({
        status: 'failed',
        processed_rows: processedRows,
        success_count: successCount,
        error_count: errors.length,
        errors: errors,
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function handleExport(req: Request, supabase: any) {
  const { table, organizationId, userId, format, filters, columns }: ExportRequest = await req.json();

  // Validate user permissions
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 403,
    });
  }

  // Build query
  let query = supabase
    .from(table)
    .select(columns ? columns.join(',') : '*')
    .eq('organization_id', organizationId);

  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to export data: ${error.message}`);
  }

  // Format data based on requested format
  let responseData: string;
  let contentType: string;
  let filename: string;

  switch (format) {
    case 'json':
      responseData = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      filename = `${table}-export.json`;
      break;

    case 'csv':
      responseData = convertToCSV(data);
      contentType = 'text/csv';
      filename = `${table}-export.csv`;
      break;

    case 'xlsx':
      // For XLSX, we'd need a library like xlsx
      throw new Error('XLSX export not implemented in this example');

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return new Response(responseData, {
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    },
  });
}

async function handleStatus(req: Request, supabase: any) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const { data: job, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  }

  return new Response(JSON.stringify(job), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function validateRecord(supabase: any, table: string, record: any, organizationId: string) {
  // Call validation function
  const { data, error } = await supabase.functions.invoke('validate-record', {
    body: {
      table,
      operation: 'insert',
      record,
      organizationId
    }
  });

  if (error) {
    return { valid: false, errors: [error.message] };
  }

  return data;
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

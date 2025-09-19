import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BulkExportSchema = z.object({
  table: z.string(),
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
  fields: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  includeHeaders: z.boolean().default(true),
  filename: z.string().optional()
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

// Convert data to CSV format
function convertToCSV(data: any[], fields?: string[], includeHeaders = true): string {
  if (data.length === 0) return '';

  const headers = fields || Object.keys(data[0]);
  let csv = '';

  if (includeHeaders) {
    csv += headers.join(',') + '\n';
  }

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}

// Convert data to JSON format
function convertToJSON(data: any[], fields?: string[]): string {
  if (fields) {
    const filteredData = data.map(row => {
      const filtered = {};
      fields.forEach(field => {
        if (row.hasOwnProperty(field)) {
          filtered[field] = row[field];
        }
      });
      return filtered;
    });
    return JSON.stringify(filteredData, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

// Apply filters to query
function applyFilters(query, filters: Record<string, any>) {
  let filteredQuery = query;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle complex filters
      if (value.$eq) filteredQuery = filteredQuery.eq(key, value.$eq);
      if (value.$neq) filteredQuery = filteredQuery.neq(key, value.$neq);
      if (value.$gt) filteredQuery = filteredQuery.gt(key, value.$gt);
      if (value.$gte) filteredQuery = filteredQuery.gte(key, value.$gte);
      if (value.$lt) filteredQuery = filteredQuery.lt(key, value.$lt);
      if (value.$lte) filteredQuery = filteredQuery.lte(key, value.$lte);
      if (value.$in && Array.isArray(value.$in)) filteredQuery = filteredQuery.in(key, value.$in);
      if (value.$like) filteredQuery = filteredQuery.like(key, value.$like);
      if (value.$ilike) filteredQuery = filteredQuery.ilike(key, value.$ilike);
    } else if (Array.isArray(value)) {
      filteredQuery = filteredQuery.in(key, value);
    } else {
      filteredQuery = filteredQuery.eq(key, value);
    }
  });

  return filteredQuery;
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions
    if (!['owner', 'admin', 'manager', 'contributor'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { table, format, fields, filters, includeHeaders, filename } = BulkExportSchema.parse(body);

    // Build query
    let query = supabase
      .from(table)
      .select(fields ? fields.join(',') : '*')
      .eq('organization_id', orgId);

    // Apply filters if provided
    if (filters) {
      query = applyFilters(query, filters);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data found to export' }, { status: 404 });
    }

    let content: string;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(data, fields, includeHeaders);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;

      case 'json':
        content = convertToJSON(data, fields);
        contentType = 'application/json';
        fileExtension = 'json';
        break;

      case 'excel':
        // For Excel, we'll return CSV with Excel content type
        // In a real implementation, you'd use a library like xlsx
        content = convertToCSV(data, fields, includeHeaders);
        contentType = 'application/vnd.ms-excel';
        fileExtension = 'csv';
        break;

      case 'pdf':
        // For PDF, return JSON for now
        // In a real implementation, you'd use a PDF library
        content = convertToJSON(data, fields);
        contentType = 'application/pdf';
        fileExtension = 'json';
        break;

      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const exportFilename = filename || `${table}_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'bulk.export',
      resource_type: table,
      details: { 
        format, 
        recordCount: data.length,
        filename: exportFilename,
        fields: fields || 'all',
        hasFilters: !!filters
      },
      occurred_at: new Date().toISOString()
    });

    // Return file content
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${exportFilename}"`,
        'Content-Length': Buffer.byteLength(content, 'utf8').toString()
      }
    });

  } catch (error) {
    console.error('Bulk export error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint for export templates and field information
export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

    if (!table) {
      return NextResponse.json({ error: 'Table parameter required' }, { status: 400 });
    }

    // Get table schema information
    const { data: schemaData, error: schemaError } = await supabase
      .from(table)
      .select('*')
      .eq('organization_id', orgId)
      .limit(1);

    if (schemaError) {
      return NextResponse.json({ error: schemaError.message }, { status: 400 });
    }

    const availableFields = schemaData && schemaData.length > 0 
      ? Object.keys(schemaData[0])
      : [];

    // Get record count for the table
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const templates = {
      basic: {
        name: 'Basic Export',
        description: 'Export all records with all fields',
        fields: availableFields,
        filters: {},
        format: 'csv'
      },
      summary: {
        name: 'Summary Export',
        description: 'Export key fields only',
        fields: availableFields.filter(field => 
          ['id', 'name', 'title', 'status', 'created_at', 'updated_at'].includes(field)
        ),
        filters: {},
        format: 'csv'
      },
      recent: {
        name: 'Recent Records',
        description: 'Export records from the last 30 days',
        fields: availableFields,
        filters: {
          created_at: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        format: 'csv'
      }
    };

    return NextResponse.json({
      table,
      availableFields,
      recordCount: count || 0,
      supportedFormats: ['csv', 'json', 'excel', 'pdf'],
      templates
    });

  } catch (error) {
    console.error('Export template error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

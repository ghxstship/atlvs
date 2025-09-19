import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Bulk operation schemas
const BulkOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'export', 'import']),
  table: z.string(),
  data: z.array(z.record(z.any())).optional(),
  ids: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  options: z.record(z.any()).optional()
});

const BulkExportSchema = z.object({
  table: z.string(),
  format: z.enum(['csv', 'excel', 'json', 'pdf']),
  fields: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  includeHeaders: z.boolean().default(true),
  filename: z.string().optional()
});

const BulkImportSchema = z.object({
  table: z.string(),
  data: z.array(z.record(z.any())),
  options: z.object({
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

// Allowed tables for bulk operations
const ALLOWED_TABLES = [
  'companies', 'company_contracts', 'company_qualifications', 'company_ratings',
  'projects', 'tasks', 'files',
  'people', 'people_roles', 'people_competencies',
  'assets', 'asset_maintenance', 'asset_assignments',
  'budgets', 'expenses', 'revenue', 'transactions',
  'jobs', 'opportunities', 'rfps',
  'events', 'lineups', 'riders', 'call_sheets',
  'resources', 'resource_categories'
];

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Check permissions for bulk operations
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions for bulk operations' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, table, data, ids, filters, options } = BulkOperationSchema.parse(body);

    // Validate table access
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Table not allowed for bulk operations' }, { status: 400 });
    }

    let result;
    let affectedCount = 0;

    switch (operation) {
      case 'create':
        if (!data || data.length === 0) {
          return NextResponse.json({ error: 'Data required for bulk create' }, { status: 400 });
        }

        // Add organization context and timestamps
        const createData = data.map(item => ({
          ...item,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: createResult, error: createError } = await supabase
          .from(table)
          .insert(createData)
          .select();

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 400 });
        }

        result = createResult;
        affectedCount = createResult?.length || 0;
        break;

      case 'update':
        if (!data || data.length === 0) {
          return NextResponse.json({ error: 'Data required for bulk update' }, { status: 400 });
        }

        const updateResults = [];
        for (const item of data) {
          if (!item.id) continue;

          const { data: updateResult, error: updateError } = await supabase
            .from(table)
            .update({
              ...item,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('organization_id', orgId)
            .select()
            .single();

          if (!updateError && updateResult) {
            updateResults.push(updateResult);
            affectedCount++;
          }
        }

        result = updateResults;
        break;

      case 'delete':
        if (!ids || ids.length === 0) {
          return NextResponse.json({ error: 'IDs required for bulk delete' }, { status: 400 });
        }

        const { error: deleteError, count } = await supabase
          .from(table)
          .delete()
          .in('id', ids)
          .eq('organization_id', orgId);

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 400 });
        }

        affectedCount = count || 0;
        result = { deleted: affectedCount };
        break;

      case 'export':
        // Handle export in separate endpoint for better performance
        return NextResponse.json({ 
          error: 'Use /api/v1/bulk/export endpoint for export operations' 
        }, { status: 400 });

      case 'import':
        // Handle import in separate endpoint for better validation
        return NextResponse.json({ 
          error: 'Use /api/v1/bulk/import endpoint for import operations' 
        }, { status: 400 });

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: `bulk.${operation}`,
      resource_type: table,
      details: { 
        operation, 
        table, 
        affectedCount,
        recordIds: operation === 'delete' ? ids : Array.isArray(result) ? result.map((r: any) => r.id) : []
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      operation,
      table,
      affectedCount,
      result
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint for bulk operation status and history
export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const table = searchParams.get('table');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Get bulk operation history from audit logs
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', orgId)
      .like('action', 'bulk.%')
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (operation) {
      query = query.eq('action', `bulk.${operation}`);
    }

    if (table) {
      query = query.eq('resource_type', table);
    }

    const { data: history, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      history: history || [],
      allowedTables: ALLOWED_TABLES,
      supportedOperations: ['create', 'update', 'delete', 'export', 'import']
    });

  } catch (error) {
    console.error('Bulk operation history error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

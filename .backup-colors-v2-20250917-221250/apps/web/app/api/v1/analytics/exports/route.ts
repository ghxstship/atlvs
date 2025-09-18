import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ExportJobSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  dataSource: z.enum(['projects', 'people', 'finance', 'jobs', 'companies', 'resources', 'analytics']),
  format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
  filters: z.record(z.any()).optional(),
  fields: z.array(z.string()).optional(),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    time: z.string().optional(),
    timezone: z.string().optional()
  }).optional(),
  recipients: z.array(z.string().email()).optional(),
  compression: z.boolean().default(false)
});

const UpdateExportJobSchema = ExportJobSchema.partial();

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

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dataSource = searchParams.get('dataSource');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('export_jobs')
      .select(`
        id,
        name,
        description,
        data_source,
        format,
        filters,
        fields,
        schedule,
        recipients,
        compression,
        status,
        last_run_at,
        next_run_at,
        created_at,
        updated_at,
        created_by
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (dataSource) query = query.eq('data_source', dataSource);

    const { data: exportJobs, error, count } = await query;

    if (error) {
      console.error('Export jobs fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get recent export history
    const { data: recentExports } = await supabase
      .from('export_history')
      .select(`
        id,
        export_job_id,
        status,
        file_size,
        record_count,
        download_url,
        error_message,
        started_at,
        completed_at,
        export_jobs!inner(name)
      `)
      .eq('export_jobs.organization_id', orgId)
      .order('started_at', { ascending: false })
      .limit(10);

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.exports.list',
      resource_type: 'export_job',
      details: { count: exportJobs?.length || 0, filters: { status, dataSource } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      exportJobs: exportJobs || [],
      recentExports: recentExports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('Analytics exports GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'execute_export') {
      // Execute an export job immediately
      const { exportJobId } = data;

      const { data: exportJob } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', exportJobId)
        .eq('organization_id', orgId)
        .single();

      if (!exportJob) {
        return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
      }

      // Create export history record
      const { data: exportHistory, error: historyError } = await supabase
        .from('export_history')
        .insert({
          export_job_id: exportJobId,
          status: 'running',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (historyError) {
        console.error('Export history creation error:', historyError);
        return NextResponse.json({ error: historyError.message }, { status: 400 });
      }

      // Simulate export processing (in real implementation, this would be a background job)
      setTimeout(async () => {
        const mockResults = {
          recordCount: Math.floor(Math.random() * 10000) + 100,
          fileSize: Math.floor(Math.random() * 50000000) + 1000000, // 1-50MB
          downloadUrl: `https://storage.example.com/exports/${exportHistory.id}.${exportJob.format}`
        };

        await supabase
          .from('export_history')
          .update({
            status: 'completed',
            record_count: mockResults.recordCount,
            file_size: mockResults.fileSize,
            download_url: mockResults.downloadUrl,
            completed_at: new Date().toISOString()
          })
          .eq('id', exportHistory.id);

        // Update job last run time
        await supabase
          .from('export_jobs')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: exportJob.schedule?.frequency === 'daily' 
              ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              : null
          })
          .eq('id', exportJobId);
      }, 2000);

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'analytics.exports.execute',
        resource_type: 'export_job',
        resource_id: exportJobId,
        details: { exportHistoryId: exportHistory.id },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        exportHistoryId: exportHistory.id,
        message: 'Export job started successfully'
      });
    }

    // Create new export job
    const exportData = ExportJobSchema.parse(data);

    const { data: exportJob, error } = await supabase
      .from('export_jobs')
      .insert({
        ...exportData,
        data_source: exportData.dataSource,
        organization_id: orgId,
        created_by: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Export job creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.exports.create',
      resource_type: 'export_job',
      resource_id: exportJob.id,
      details: { name: exportData.name, dataSource: exportData.dataSource, format: exportData.format },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ exportJob }, { status: 201 });

  } catch (error: any) {
    console.error('Analytics exports POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Export job ID is required' }, { status: 400 });
    }

    const exportData = UpdateExportJobSchema.parse(updateData);

    const { data: exportJob, error } = await supabase
      .from('export_jobs')
      .update({
        ...exportData,
        data_source: exportData.dataSource,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Export job update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!exportJob) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.exports.update',
      resource_type: 'export_job',
      resource_id: exportJob.id,
      details: { updated_fields: Object.keys(exportData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ exportJob });

  } catch (error: any) {
    console.error('Analytics exports PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Export job ID is required' }, { status: 400 });
    }

    const { data: exportJob } = await supabase
      .from('export_jobs')
      .select('name, data_source')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!exportJob) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('export_jobs')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Export job deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.exports.delete',
      resource_type: 'export_job',
      resource_id: id,
      details: { name: exportJob.name, dataSource: exportJob.data_source },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Analytics exports DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

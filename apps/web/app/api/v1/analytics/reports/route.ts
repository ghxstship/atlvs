import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ReportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['table', 'chart', 'dashboard', 'summary']),
  dataSource: z.enum(['projects', 'people', 'finance', 'jobs', 'companies', 'resources', 'analytics']),
  query: z.object({
    fields: z.array(z.string()),
    filters: z.record(z.any()).optional(),
    groupBy: z.array(z.string()).optional(),
    orderBy: z.array(z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    })).optional(),
    limit: z.number().positive().optional()
  }),
  visualization: z.object({
    chartType: z.enum(['bar', 'line', 'pie', 'scatter', 'area', 'table']).optional(),
    xAxis: z.string().optional(),
    yAxis: z.string().optional(),
    colorBy: z.string().optional(),
    aggregation: z.enum(['sum', 'count', 'avg', 'min', 'max']).optional()
  }).optional(),
  schedule: z.object({
    frequency: z.enum(['none', 'daily', 'weekly', 'monthly']),
    time: z.string().optional(),
    timezone: z.string().optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional(),
  isPublic: z.boolean().default(false)
});

const UpdateReportSchema = ReportSchema.partial();

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
    const type = searchParams.get('type');
    const dataSource = searchParams.get('dataSource');
    const isPublic = searchParams.get('isPublic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reports')
      .select(`
        id,
        name,
        description,
        type,
        data_source,
        query,
        visualization,
        schedule,
        is_public,
        created_at,
        updated_at,
        created_by,
        last_run_at,
        run_count
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (dataSource) query = query.eq('data_source', dataSource);
    if (isPublic !== null) query = query.eq('is_public', isPublic === 'true');

    const { data: reports, error, count } = await query;

    if (error) {
      console.error('Reports fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get report templates
    const templates = [
      {
        name: 'Project Performance',
        description: 'Track project completion rates and timelines',
        type: 'chart',
        dataSource: 'projects',
        chartType: 'bar'
      },
      {
        name: 'Financial Summary',
        description: 'Revenue, expenses, and budget utilization',
        type: 'dashboard',
        dataSource: 'finance',
        chartType: 'table'
      },
      {
        name: 'Team Utilization',
        description: 'People allocation and capacity planning',
        type: 'chart',
        dataSource: 'people',
        chartType: 'pie'
      },
      {
        name: 'Job Pipeline',
        description: 'Job status distribution and completion rates',
        type: 'chart',
        dataSource: 'jobs',
        chartType: 'line'
      },
      {
        name: 'Company Ratings',
        description: 'Vendor performance and rating trends',
        type: 'summary',
        dataSource: 'companies',
        chartType: 'scatter'
      }
    ];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.reports.list',
      resource_type: 'report',
      details: { count: reports?.length || 0, filters: { type, dataSource, isPublic } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      reports: reports || [],
      templates,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Analytics reports GET error:', error);
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

    if (action === 'run_report') {
      // Execute a report and return results
      const { reportId } = data;

      const { data: report } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('organization_id', orgId)
        .single();

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      // Simulate report execution with mock data
      const mockData = {
        columns: ['Name', 'Value', 'Status', 'Date'],
        rows: Array.from({ length: 20 }, (_, i) => [
          `Item ${i + 1}`,
          Math.floor(Math.random() * 1000),
          ['Active', 'Pending', 'Completed'][Math.floor(Math.random() * 3)],
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ]),
        summary: {
          totalRecords: 20,
          executionTime: Math.floor(Math.random() * 5000) + 100,
          lastUpdated: new Date().toISOString()
        }
      };

      // Update report run statistics
      await supabase
        .from('reports')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: (report.run_count || 0) + 1
        })
        .eq('id', reportId);

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'analytics.reports.run',
        resource_type: 'report',
        resource_id: reportId,
        details: { executionTime: mockData.summary.executionTime, recordCount: mockData.summary.totalRecords },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        data: mockData,
        reportId
      });
    }

    if (action === 'create_from_template') {
      // Create report from template
      const { templateName, customizations } = data;

      const templates: Record<string, any> = {
        'project_performance': {
          name: 'Project Performance Report',
          type: 'chart',
          dataSource: 'projects',
          query: {
            fields: ['name', 'status', 'completion_percentage', 'created_at'],
            filters: { status: { $in: ['active', 'completed'] } },
            orderBy: [{ field: 'created_at', direction: 'desc' }]
          },
          visualization: {
            chartType: 'bar',
            xAxis: 'name',
            yAxis: 'completion_percentage',
            colorBy: 'status'
          }
        },
        'financial_summary': {
          name: 'Financial Summary Report',
          type: 'dashboard',
          dataSource: 'finance',
          query: {
            fields: ['category', 'amount', 'status', 'date'],
            groupBy: ['category', 'status'],
            orderBy: [{ field: 'date', direction: 'desc' }]
          },
          visualization: {
            chartType: 'table',
            aggregation: 'sum'
          }
        }
      };

      const template = templates[templateName];
      if (!template) {
        return NextResponse.json({ error: 'Invalid template name' }, { status: 400 });
      }

      const reportData = {
        ...template,
        ...customizations,
        data_source: template.dataSource,
        is_public: false
      };

      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          organization_id: orgId,
          created_by: user.id,
          run_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Report template creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'analytics.reports.create_from_template',
        resource_type: 'report',
        resource_id: report.id,
        details: { templateName, reportName: report.name },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ report }, { status: 201 });
    }

    // Create new report
    const reportData = ReportSchema.parse(data);

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        data_source: reportData.dataSource,
        is_public: reportData.isPublic,
        organization_id: orgId,
        created_by: user.id,
        run_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Report creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.reports.create',
      resource_type: 'report',
      resource_id: report.id,
      details: { name: reportData.name, type: reportData.type, dataSource: reportData.dataSource },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ report }, { status: 201 });

  } catch (error) {
    console.error('Analytics reports POST error:', error);
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
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const reportData = UpdateReportSchema.parse(updateData);

    const { data: report, error } = await supabase
      .from('reports')
      .update({
        ...reportData,
        data_source: reportData.dataSource,
        is_public: reportData.isPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Report update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.reports.update',
      resource_type: 'report',
      resource_id: report.id,
      details: { updated_fields: Object.keys(reportData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ report });

  } catch (error) {
    console.error('Analytics reports PUT error:', error);
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
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const { data: report } = await supabase
      .from('reports')
      .select('name, type, data_source')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Report deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'analytics.reports.delete',
      resource_type: 'report',
      resource_id: id,
      details: { name: report.name, type: report.type, dataSource: report.data_source },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics reports DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

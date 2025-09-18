import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().optional(),
  type: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']),
  category: z.enum(['technical', 'creative', 'production', 'management', 'support', 'other']),
  status: z.enum(['draft', 'open', 'closed', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateJobSchema = CreateJobSchema.partial();

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
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const remote = searchParams.get('remote');
    const search = searchParams.get('search');

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);
    if (remote !== null) query = query.eq('remote', remote === 'true');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Jobs fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.list',
      resource_type: 'job',
      details: { count: jobs?.length || 0, filters: { status, type, category, priority, remote, search } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ jobs: jobs || [] });

  } catch (error: any) {
    console.error('Jobs GET error:', error);
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
    const jobData = CreateJobSchema.parse(body);

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        organization_id: orgId,
        created_by: user.id,
        application_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Job creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.create',
      resource_type: 'job',
      resource_id: job.id,
      details: { title: job.title, type: job.type, status: job.status },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ job }, { status: 201 });

  } catch (error: any) {
    console.error('Jobs POST error:', error);
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
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const jobData = UpdateJobSchema.parse(updateData);

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        ...jobData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Job update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.update',
      resource_type: 'job',
      resource_id: job.id,
      details: { updated_fields: Object.keys(jobData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ job });

  } catch (error: any) {
    console.error('Jobs PUT error:', error);
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

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const { data: job } = await supabase
      .from('jobs')
      .select('title')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Job deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.delete',
      resource_type: 'job',
      resource_id: id,
      details: { title: job?.title || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Jobs DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

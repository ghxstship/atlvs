import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateOpportunitySchema = z.object({
  title: z.string().min(1, 'Opportunity title is required'),
  description: z.string(),
  type: z.enum(['production', 'creative', 'technical', 'logistics', 'consulting', 'other']),
  category: z.enum(['film', 'tv', 'commercial', 'music_video', 'documentary', 'live_event', 'digital', 'other']),
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
    type: z.enum(['fixed', 'hourly', 'daily', 'negotiable'])
  }),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    duration: z.string().optional(),
    isFlexible: z.boolean().default(false)
  }),
  location: z.object({
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    isRemote: z.boolean().default(false),
    isHybrid: z.boolean().default(false)
  }),
  requirements: z.array(z.string()),
  preferredQualifications: z.array(z.string()).optional(),
  deliverables: z.array(z.string()),
  visibility: z.enum(['public', 'invite_only', 'network', 'premium']).default('public'),
  status: z.enum(['draft', 'published', 'active', 'closed', 'filled']).default('draft'),
  applicationDeadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateOpportunitySchema = CreateOpportunitySchema.partial();

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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const location = searchParams.get('location');
    const remote = searchParams.get('remote');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const search = searchParams.get('search');
    const showMine = searchParams.get('showMine');

    let query = supabase
      .from('job_opportunities')
      .select(`
        *,
        organization:organizations(id, name, slug),
        applications:opportunity_applications(count)
      `)
      .order('created_at', { ascending: false });

    // Show public opportunities or user's own
    if (showMine === 'true') {
      query = query.eq('organization_id', orgId);
    } else {
      query = query.or(`visibility.eq.public,organization_id.eq.${orgId}`);
    }

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (visibility) query = query.eq('visibility', visibility);
    if (location) query = query.ilike('location->city', `%${location}%`);
    if (remote === 'true') query = query.eq('location->isRemote', true);
    if (minBudget) query = query.gte('budget->min', parseFloat(minBudget));
    if (maxBudget) query = query.lte('budget->max', parseFloat(maxBudget));
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Opportunities fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get application stats for user's opportunities
    const userOpportunities = opportunities?.filter(o => o.organization_id === orgId) || [];
    const opportunityIds = userOpportunities.map(o => o.id);
    
    let applicationStats = {};
    if (opportunityIds.length > 0) {
      const { data: applications } = await supabase
        .from('opportunity_applications')
        .select('opportunity_id, status')
        .in('opportunity_id', opportunityIds);

      applicationStats = applications?.reduce((acc, app) => {
        if (!acc[app.opportunity_id]) {
          acc[app.opportunity_id] = { total: 0, pending: 0, reviewed: 0, shortlisted: 0 };
        }
        acc[app.opportunity_id].total++;
        acc[app.opportunity_id][app.status]++;
        return acc;
      }, {});
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.opportunities.list',
      resource_type: 'job_opportunity',
      details: { 
        count: opportunities?.length || 0,
        filters: { type, category, status, visibility, location, remote, minBudget, maxBudget }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      opportunities: opportunities || [],
      applicationStats
    });

  } catch (error) {
    console.error('Opportunities GET error:', error);
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
    const opportunityData = CreateOpportunitySchema.parse(body);

    const { data: opportunity, error } = await supabase
      .from('job_opportunities')
      .insert({
        ...opportunityData,
        organization_id: orgId,
        created_by: user.id,
        view_count: 0,
        application_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Opportunity creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If published, notify relevant contractors
    if (opportunityData.status === 'published' && opportunityData.visibility === 'public') {
      // Get contractors matching the opportunity criteria
      const { data: contractors } = await supabase
        .from('contractors')
        .select('id, email, preferences')
        .eq('status', 'active')
        .contains('preferences->categories', [opportunityData.category])
        .limit(100);

      if (contractors && contractors.length > 0) {
        const notifications = contractors.map(contractor => ({
          user_id: contractor.id,
          organization_id: orgId,
          type: 'new_opportunity',
          title: 'New Opportunity Available',
          message: `New ${opportunityData.type} opportunity: ${opportunityData.title}`,
          data: { opportunity_id: opportunity.id },
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.opportunities.create',
      resource_type: 'job_opportunity',
      resource_id: opportunity.id,
      details: { 
        title: opportunity.title,
        type: opportunity.type,
        category: opportunity.category,
        status: opportunity.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ opportunity }, { status: 201 });

  } catch (error) {
    console.error('Opportunities POST error:', error);
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
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    }

    const opportunityData = UpdateOpportunitySchema.parse(updateData);

    const { data: opportunity, error } = await supabase
      .from('job_opportunities')
      .update({
        ...opportunityData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Opportunity update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.opportunities.update',
      resource_type: 'job_opportunity',
      resource_id: opportunity.id,
      details: { updated_fields: Object.keys(opportunityData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ opportunity });

  } catch (error) {
    console.error('Opportunities PUT error:', error);
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
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    }

    const { data: opportunity } = await supabase
      .from('job_opportunities')
      .select('title')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('job_opportunities')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Opportunity deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.opportunities.delete',
      resource_type: 'job_opportunity',
      resource_id: id,
      details: { title: opportunity?.title || 'Unknown' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Opportunities DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

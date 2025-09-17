import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateRFPSchema = z.object({
  title: z.string().min(1, 'RFP title is required'),
  description: z.string(),
  projectType: z.enum(['production', 'post_production', 'creative', 'technical', 'logistics', 'consulting']),
  scope: z.object({
    overview: z.string(),
    objectives: z.array(z.string()),
    deliverables: z.array(z.string()),
    outOfScope: z.array(z.string()).optional()
  }),
  requirements: z.object({
    technical: z.array(z.string()),
    experience: z.array(z.string()),
    certifications: z.array(z.string()).optional(),
    insurance: z.array(z.string()).optional()
  }),
  budget: z.object({
    range: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }),
    currency: z.string().default('USD'),
    paymentTerms: z.string(),
    budgetJustification: z.string().optional()
  }),
  timeline: z.object({
    rfpDeadline: z.string(),
    projectStartDate: z.string(),
    projectEndDate: z.string(),
    keyMilestones: z.array(z.object({
      name: z.string(),
      date: z.string(),
      description: z.string()
    })).optional()
  }),
  evaluation: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      weight: z.number().min(0).max(100),
      description: z.string()
    })),
    scoringMethod: z.string().optional()
  }),
  submissionRequirements: z.array(z.string()),
  contactInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional()
  }),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).default('draft'),
  visibility: z.enum(['public', 'invite_only', 'network']).default('public'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
});

const UpdateRFPSchema = CreateRFPSchema.partial();

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
    const projectType = searchParams.get('projectType');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const search = searchParams.get('search');
    const showMine = searchParams.get('showMine');

    let query = supabase
      .from('rfps')
      .select(`
        *,
        organization:organizations(id, name, slug),
        proposals:rfp_proposals(count)
      `)
      .order('created_at', { ascending: false });

    // Show public RFPs or user's own
    if (showMine === 'true') {
      query = query.eq('organization_id', orgId);
    } else {
      query = query.or(`visibility.eq.public,organization_id.eq.${orgId}`);
    }

    if (projectType) query = query.eq('project_type', projectType);
    if (status) query = query.eq('status', status);
    if (visibility) query = query.eq('visibility', visibility);
    if (minBudget) query = query.gte('budget->range->min', parseFloat(minBudget));
    if (maxBudget) query = query.lte('budget->range->max', parseFloat(maxBudget));
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: rfps, error } = await query;

    if (error) {
      console.error('RFPs fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get proposal stats for user's RFPs
    const userRFPs = rfps?.filter(r => r.organization_id === orgId) || [];
    const rfpIds = userRFPs.map(r => r.id);
    
    let proposalStats = {};
    if (rfpIds.length > 0) {
      const { data: proposals } = await supabase
        .from('rfp_proposals')
        .select('rfp_id, status')
        .in('rfp_id', rfpIds);

      proposalStats = proposals?.reduce((acc: any, prop) => {
        if (!acc[prop.rfp_id]) {
          acc[prop.rfp_id] = { total: 0, submitted: 0, shortlisted: 0, awarded: 0 };
        }
        acc[prop.rfp_id].total++;
        acc[prop.rfp_id][prop.status]++;
        return acc;
      }, {});
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.rfps.list',
      resource_type: 'rfp',
      details: { 
        count: rfps?.length || 0,
        filters: { projectType, status, visibility, minBudget, maxBudget }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      rfps: rfps || [],
      proposalStats
    });

  } catch (error: any) {
    console.error('RFPs GET error:', error);
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
    const rfpData = CreateRFPSchema.parse(body);

    // Generate RFP number
    const rfpNumber = `RFP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total evaluation weight
    const totalWeight = rfpData.evaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      return NextResponse.json({ 
        error: 'Evaluation criteria weights must sum to 100',
        currentTotal: totalWeight
      }, { status: 400 });
    }

    const { data: rfp, error } = await supabase
      .from('rfps')
      .insert({
        ...rfpData,
        rfp_number: rfpNumber,
        organization_id: orgId,
        created_by: user.id,
        proposal_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('RFP creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.rfps.create',
      resource_type: 'rfp',
      resource_id: rfp.id,
      details: { 
        title: rfp.title,
        rfp_number: rfpNumber,
        project_type: rfp.project_type,
        status: rfp.status
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ rfp }, { status: 201 });

  } catch (error: any) {
    console.error('RFPs POST error:', error);
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
      return NextResponse.json({ error: 'RFP ID is required' }, { status: 400 });
    }

    const rfpData = UpdateRFPSchema.parse(updateData);

    // Check if RFP can be edited
    const { data: existingRFP } = await supabase
      .from('rfps')
      .select('status')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!existingRFP) {
      return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
    }

    if (['awarded', 'cancelled'].includes(existingRFP.status)) {
      return NextResponse.json({ error: 'Cannot edit awarded or cancelled RFPs' }, { status: 400 });
    }

    // Validate evaluation weights if updated
    if (rfpData.evaluation?.criteria) {
      const totalWeight = rfpData.evaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        return NextResponse.json({ 
          error: 'Evaluation criteria weights must sum to 100',
          currentTotal: totalWeight
        }, { status: 400 });
      }
    }

    const { data: rfp, error } = await supabase
      .from('rfps')
      .update({
        ...rfpData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('RFP update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.rfps.update',
      resource_type: 'rfp',
      resource_id: rfp.id,
      details: { updated_fields: Object.keys(rfpData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ rfp });

  } catch (error: any) {
    console.error('RFPs PUT error:', error);
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
      return NextResponse.json({ error: 'RFP ID is required' }, { status: 400 });
    }

    const { data: rfp } = await supabase
      .from('rfps')
      .select('title, rfp_number, status')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (rfp?.status === 'published') {
      return NextResponse.json({ error: 'Cannot delete published RFPs. Please close or cancel first.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('rfps')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('RFP deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.rfps.delete',
      resource_type: 'rfp',
      resource_id: id,
      details: { 
        title: rfp?.title || 'Unknown',
        rfp_number: rfp?.rfp_number
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('RFPs DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

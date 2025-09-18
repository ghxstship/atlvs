import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  type: z.enum(['construction', 'infrastructure', 'development', 'maintenance', 'government', 'private']),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  managerId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  budget: z.object({
    total: z.number().positive(),
    allocated: z.number().min(0).default(0),
    spent: z.number().min(0).default(0),
    currency: z.string().default('USD')
  }),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string(),
    phases: z.array(z.object({
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      budget: z.number().positive().optional(),
      dependencies: z.array(z.string()).optional()
    })).optional()
  }),
  scope: z.object({
    objectives: z.array(z.string()),
    deliverables: z.array(z.string()),
    constraints: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional()
  }),
  stakeholders: z.array(z.object({
    name: z.string(),
    role: z.string(),
    organization: z.string().optional(),
    contactInfo: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional()
    }).optional(),
    influence: z.enum(['low', 'medium', 'high']).default('medium'),
    interest: z.enum(['low', 'medium', 'high']).default('medium')
  })).optional(),
  risks: z.array(z.object({
    description: z.string(),
    category: z.string(),
    probability: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
    mitigation: z.string().optional(),
    owner: z.string().optional()
  })).optional(),
  compliance: z.object({
    regulations: z.array(z.string()).optional(),
    permits: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    audits: z.array(z.object({
      type: z.string(),
      date: z.string(),
      status: z.string(),
      findings: z.string().optional()
    })).optional()
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateProgramSchema = CreateProgramSchema.partial();

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
    const status = searchParams.get('status');
    const managerId = searchParams.get('managerId');
    const clientId = searchParams.get('clientId');
    const search = searchParams.get('search');
    const includeProjects = searchParams.get('includeProjects') === 'true';

    let query = supabase
      .from('programs')
      .select(`
        *,
        manager:users!manager_id(id, name, email),
        client:companies!client_id(id, name, contact_info),
        ${includeProjects ? `
        projects:projects(
          id,
          name,
          status,
          budget,
          start_date,
          end_date
        ),` : ''}
        phases:program_phases(*),
        stakeholders:program_stakeholders(*),
        risks:program_risks(*)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (managerId) query = query.eq('manager_id', managerId);
    if (clientId) query = query.eq('client_id', clientId);
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: programs, error } = await query;

    if (error) {
      console.error('Programs fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate program metrics
    const metrics = programs?.reduce((acc, program) => {
      const totalBudget = (program as any).budget?.total || 0;
      const spentBudget = (program as any).budget?.spent || 0;
      const projectCount = (program as any).projects?.length || 0;
      
      return {
        totalPrograms: acc.totalPrograms + 1,
        activePrograms: acc.activePrograms + ((program as any).status === 'active' ? 1 : 0),
        totalBudget: acc.totalBudget + totalBudget,
        totalSpent: acc.totalSpent + spentBudget,
        totalProjects: acc.totalProjects + projectCount,
        avgBudgetUtilization: 0 // calculated after
      };
    }, {
      totalPrograms: 0,
      activePrograms: 0,
      totalBudget: 0,
      totalSpent: 0,
      totalProjects: 0,
      avgBudgetUtilization: 0
    }) || { totalPrograms: 0, activePrograms: 0, totalBudget: 0, totalSpent: 0, totalProjects: 0, avgBudgetUtilization: 0 };

    if (metrics.totalBudget > 0) {
      metrics.avgBudgetUtilization = (metrics.totalSpent / metrics.totalBudget) * 100;
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'programs.list',
      resource_type: 'program',
      details: { 
        count: programs?.length || 0,
        filters: { type, status, managerId, clientId, search, includeProjects }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      programs: programs || [], 
      metrics
    });

  } catch (error: any) {
    console.error('Programs GET error:', error);
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
    const programData = CreateProgramSchema.parse(body);

    // Verify manager belongs to organization if specified
    if (programData.managerId) {
      const { data: manager } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('user_id', programData.managerId)
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .single();

      if (!manager) {
        return NextResponse.json({ error: 'Manager not found in organization' }, { status: 404 });
      }
    }

    // Verify client belongs to organization if specified
    if (programData.clientId) {
      const { data: client } = await supabase
        .from('companies')
        .select('id')
        .eq('id', programData.clientId)
        .eq('organization_id', orgId)
        .single();

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }

    // Create program
    const { data: program, error } = await supabase
      .from('programs')
      .insert({
        name: programData.name,
        description: programData.description,
        type: programData.type,
        status: programData.status,
        priority: programData.priority,
        manager_id: programData.managerId,
        client_id: programData.clientId,
        budget: programData.budget,
        timeline: programData.timeline,
        scope: programData.scope,
        compliance: programData.compliance,
        metadata: programData.metadata,
        organization_id: orgId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Program creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create program phases if provided
    if (programData.timeline.phases && programData.timeline.phases.length > 0) {
      const phases = programData.timeline.phases.map((phase, index) => ({
        program_id: program.id,
        organization_id: orgId,
        name: phase.name,
        start_date: phase.startDate,
        end_date: phase.endDate,
        budget: phase.budget,
        dependencies: phase.dependencies,
        order: index + 1,
        status: 'planned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('program_phases').insert(phases);
    }

    // Create stakeholders if provided
    if (programData.stakeholders && programData.stakeholders.length > 0) {
      const stakeholders = programData.stakeholders.map(stakeholder => ({
        program_id: program.id,
        organization_id: orgId,
        ...stakeholder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('program_stakeholders').insert(stakeholders);
    }

    // Create risks if provided
    if (programData.risks && programData.risks.length > 0) {
      const risks = programData.risks.map(risk => ({
        program_id: program.id,
        organization_id: orgId,
        ...risk,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase.from('program_risks').insert(risks);
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'programs.create',
      resource_type: 'program',
      resource_id: program.id,
      details: { 
        name: programData.name,
        type: programData.type,
        budget: programData.budget.total
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ program }, { status: 201 });

  } catch (error: any) {
    console.error('Programs POST error:', error);
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
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    const programData = UpdateProgramSchema.parse(updateData);

    const { data: program, error } = await supabase
      .from('programs')
      .update({
        ...programData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Program update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'programs.update',
      resource_type: 'program',
      resource_id: program.id,
      details: { updated_fields: Object.keys(programData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ program });

  } catch (error: any) {
    console.error('Programs PUT error:', error);
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
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Check if program has active projects
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('program_id', id)
      .eq('status', 'active')
      .limit(1);

    if (activeProjects && activeProjects.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete program with active projects. Please complete or reassign projects first.' 
      }, { status: 400 });
    }

    const { data: program } = await supabase
      .from('programs')
      .select('name, type, budget')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Program deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'programs.delete',
      resource_type: 'program',
      resource_id: id,
      details: { 
        name: program.name,
        type: program.type,
        budget: program.budget
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Programs DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

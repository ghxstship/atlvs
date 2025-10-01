import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateOnboardingWorkflowSchema = z.object({
  personId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  startDate: z.string(),
  targetCompletionDate: z.string().optional(),
  notes: z.string().optional()
});

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
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
    const personId = searchParams.get('personId');
    const status = searchParams.get('status');

    let query = supabase
      .from('onboarding_workflows')
      .select(`
        *,
        person:people(first_name, last_name, email, department),
        project:projects(name, status),
        tasks_completed:onboarding_tasks!workflow_id(count),
        tasks_total:onboarding_tasks!workflow_id(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (personId) query = query.eq('person_id', personId);
    if (status) query = query.eq('status', status);

    const { data: workflows, error } = await query;

    if (error) {
      console.error('Onboarding workflows fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ workflows: workflows || [] });

  } catch (error) {
    console.error('Onboarding GET error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const workflowData = CreateOnboardingWorkflowSchema.parse(body);

    const { data: workflow, error } = await supabase
      .from('onboarding_workflows')
      .insert({
        person_id: workflowData.personId,
        project_id: workflowData.projectId,
        start_date: workflowData.startDate,
        target_completion_date: workflowData.targetCompletionDate,
        notes: workflowData.notes,
        organization_id: orgId,
        status: 'pending',
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        person:people(first_name, last_name, email),
        project:projects(name, status)
      `)
      .single();

    if (error) {
      console.error('Onboarding workflow creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit logging
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'people.onboarding.create',
      resource_type: 'onboarding_workflow',
      resource_id: workflow.id,
      details: { 
        person_id: workflowData.personId,
        project_id: workflowData.projectId,
        start_date: workflowData.startDate
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ workflow }, { status: 201 });

  } catch (error) {
    console.error('Onboarding POST error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as unknown).name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as unknown).errors }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}

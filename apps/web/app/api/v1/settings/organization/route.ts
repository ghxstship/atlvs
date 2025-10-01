import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    supportEmail: z.string().email().optional()
  }).optional(),
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional()
  }).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().optional()
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
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      console.error('Organization fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get organization statistics
    const [membersResult, projectsResult, jobsResult] = await Promise.all([
      supabase.from('memberships').select('id').eq('organization_id', orgId).eq('status', 'active'),
      supabase.from('projects').select('id').eq('organization_id', orgId),
      supabase.from('jobs').select('id').eq('organization_id', orgId)
    ]);

    const stats = {
      totalMembers: membersResult.data?.length || 0,
      totalProjects: projectsResult.data?.length || 0,
      totalJobs: jobsResult.data?.length || 0
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.organization.get',
      resource_type: 'organization',
      resource_id: orgId,
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      organization,
      stats
    });

  } catch (error) {
    console.error('Organization GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const orgData = UpdateOrganizationSchema.parse(body);

    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        ...orgData,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Organization update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.organization.update',
      resource_type: 'organization',
      resource_id: orgId,
      details: { updated_fields: Object.keys(orgData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ organization });

  } catch (error) {
    console.error('Organization PUT error:', error);
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

    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can delete the organization' }, { status: 403 });
    }

    const body = await request.json();
    const { confirm, transferTo } = body;

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required to delete organization' }, { status: 400 });
    }

    // Check for active projects/jobs
    const [activeProjects, activeJobs] = await Promise.all([
      supabase.from('projects').select('id').eq('organization_id', orgId).eq('status', 'active').limit(1),
      supabase.from('jobs').select('id').eq('organization_id', orgId).in('status', ['active', 'in_progress']).limit(1)
    ]);

    if (activeProjects.data?.length || activeJobs.data?.length) {
      return NextResponse.json({ 
        error: 'Cannot delete organization with active projects or jobs. Please complete or transfer them first.' 
      }, { status: 400 });
    }

    // If transferTo is specified, transfer ownership first
    if (transferTo) {
      const { data: newOwner } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('user_id', transferTo)
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .single();

      if (!newOwner) {
        return NextResponse.json({ error: 'Transfer recipient not found in organization' }, { status: 404 });
      }

      // Update membership role
      await supabase
        .from('memberships')
        .update({ role: 'owner', updated_at: new Date().toISOString() })
        .eq('user_id', transferTo)
        .eq('organization_id', orgId);

      return NextResponse.json({ 
        success: true,
        message: 'Organization ownership transferred successfully'
      });
    }

    // Mark organization as deleted (soft delete)
    const { error } = await supabase
      .from('organizations')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId);

    if (error) {
      console.error('Organization deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.organization.delete',
      resource_type: 'organization',
      resource_id: orgId,
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Organization has been deactivated'
    });

  } catch (error) {
    console.error('Organization DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

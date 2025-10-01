import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  // Get organization membership
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const companyId = params.id;

    // Get company with related data
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        *,
        company_contacts(*),
        company_contracts(*),
        company_qualifications(*),
        company_ratings(*)
      `)
      .eq('id', companyId)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('Company fetch error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate average ratings
    const ratings = company.company_ratings || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    // Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'companies.view',
      resource_type: 'company',
      resource_id: companyId,
      details: { name: company.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      company: {
        ...company,
        averageRating,
        totalRatings: ratings.length
      }
    });

  } catch (error) {
    console.error('Company GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

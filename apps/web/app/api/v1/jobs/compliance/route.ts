import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateComplianceSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  contractorId: z.string().uuid('Invalid contractor ID'),
  complianceType: z.enum(['insurance', 'license', 'certification', 'permit', 'tax', 'background_check', 'safety', 'other']),
  documentName: z.string().min(1, 'Document name is required'),
  documentNumber: z.string().optional(),
  issuer: z.string().optional(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  status: z.enum(['pending', 'verified', 'expired', 'rejected']).default('pending'),
  documentUrl: z.string().url().optional(),
  verificationNotes: z.string().optional(),
  requirements: z.array(z.object({
    name: z.string(),
    met: z.boolean(),
    notes: z.string().optional()
  })).optional(),
});

const UpdateComplianceSchema = CreateComplianceSchema.partial();

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
    const jobId = searchParams.get('jobId');
    const contractorId = searchParams.get('contractorId');
    const complianceType = searchParams.get('complianceType');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiringSoon');

    let query = supabase
      .from('job_compliance')
      .select(`
        *,
        job:jobs(id, title, type, category),
        contractor:contractors(id, name, email, company)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);
    if (contractorId) query = query.eq('contractor_id', contractorId);
    if (complianceType) query = query.eq('compliance_type', complianceType);
    if (status) query = query.eq('status', status);
    
    // Check for documents expiring in next 30 days
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow.toISOString());
      query = query.gte('expiry_date', new Date().toISOString());
    }

    const { data: compliance, error } = await query;

    if (error) {
      console.error('Compliance fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check for any expired documents
    const expiredDocs = compliance?.filter(doc => 
      doc.expiry_date && new Date(doc.expiry_date) < new Date()
    ) || [];

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.compliance.list',
      resource_type: 'job_compliance',
      details: { 
        count: compliance?.length || 0, 
        expired_count: expiredDocs.length,
        filters: { jobId, contractorId, complianceType, status, expiringSoon } 
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      compliance: compliance || [],
      summary: {
        total: compliance?.length || 0,
        expired: expiredDocs.length,
        pending: compliance?.filter(c => c.status === 'pending').length || 0,
        verified: compliance?.filter(c => c.status === 'verified').length || 0
      }
    });

  } catch (error) {
    console.error('Compliance GET error:', error);
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
    const complianceData = CreateComplianceSchema.parse(body);

    // Verify job exists and belongs to organization
    const { data: job } = await supabase
      .from('jobs')
      .select('id, organization_id')
      .eq('id', complianceData.jobId)
      .eq('organization_id', orgId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: compliance, error } = await supabase
      .from('job_compliance')
      .insert({
        job_id: complianceData.jobId,
        contractor_id: complianceData.contractorId,
        organization_id: orgId,
        compliance_type: complianceData.complianceType,
        document_name: complianceData.documentName,
        document_number: complianceData.documentNumber,
        issuer: complianceData.issuer,
        issue_date: complianceData.issueDate,
        expiry_date: complianceData.expiryDate,
        status: complianceData.status,
        document_url: complianceData.documentUrl,
        verification_notes: complianceData.verificationNotes,
        requirements: complianceData.requirements,
        uploaded_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Compliance creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send notification if document needs verification
    if (complianceData.status === 'pending') {
      await supabase.from('notifications').insert({
        user_id: user.id,
        organization_id: orgId,
        type: 'compliance_verification_needed',
        title: 'Compliance Document Needs Verification',
        message: `New ${complianceData.complianceType} document uploaded for verification`,
        data: { compliance_id: compliance.id, job_id: complianceData.jobId },
        created_at: new Date().toISOString()
      });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.compliance.create',
      resource_type: 'job_compliance',
      resource_id: compliance.id,
      details: { 
        job_id: complianceData.jobId,
        contractor_id: complianceData.contractorId,
        type: complianceData.complianceType,
        document: complianceData.documentName
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ compliance }, { status: 201 });

  } catch (error) {
    console.error('Compliance POST error:', error);
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
      return NextResponse.json({ error: 'Compliance ID is required' }, { status: 400 });
    }

    const complianceData = UpdateComplianceSchema.parse(updateData);

    const { data: compliance, error } = await supabase
      .from('job_compliance')
      .update({
        ...complianceData,
        verified_by: complianceData.status === 'verified' ? user.id : undefined,
        verified_at: complianceData.status === 'verified' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Compliance update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!compliance) {
      return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 });
    }

    // Send notification if status changed
    if (complianceData.status && complianceData.status !== compliance.status) {
      await supabase.from('notifications').insert({
        user_id: compliance.contractor_id,
        organization_id: orgId,
        type: 'compliance_status_changed',
        title: 'Compliance Status Updated',
        message: `Your ${compliance.compliance_type} document status changed to ${complianceData.status}`,
        data: { compliance_id: compliance.id, status: complianceData.status },
        created_at: new Date().toISOString()
      });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.compliance.update',
      resource_type: 'job_compliance',
      resource_id: compliance.id,
      details: { updated_fields: Object.keys(complianceData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ compliance });

  } catch (error) {
    console.error('Compliance PUT error:', error);
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
      return NextResponse.json({ error: 'Compliance ID is required' }, { status: 400 });
    }

    const { data: compliance } = await supabase
      .from('job_compliance')
      .select('document_name, compliance_type')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('job_compliance')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Compliance deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.compliance.delete',
      resource_type: 'job_compliance',
      resource_id: id,
      details: { 
        document: compliance?.document_name || 'Unknown',
        type: compliance?.compliance_type
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Compliance DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

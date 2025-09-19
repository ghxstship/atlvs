import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateBidSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number().positive('Bid amount must be positive'),
  currency: z.string().default('USD'),
  proposedStartDate: z.string(),
  proposedEndDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  proposal: z.string().min(50, 'Proposal must be at least 50 characters'),
  approach: z.string().optional(),
  milestones: z.array(z.object({
    name: z.string(),
    description: z.string(),
    amount: z.number().positive(),
    duration: z.string(),
    deliverables: z.array(z.string()).optional()
  })).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number()
  })).optional(),
  previousWork: z.array(z.string()).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    experience: z.string().optional()
  })).optional(),
});

const UpdateBidSchema = CreateBidSchema.partial();

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
    const jobId = searchParams.get('jobId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    let query = supabase
      .from('job_bids')
      .select(`
        *,
        job:jobs(id, title, type, category, status),
        contractor:contractors(id, name, email, company, rating)
      `)
      .order('created_at', { ascending: false });

    // Show all bids for org admins, only own bids for contractors
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single();

    if (membership?.role && ['owner', 'admin', 'manager'].includes(membership.role)) {
      query = query.eq('organization_id', orgId);
    } else {
      query = query.eq('contractor_id', user.id);
    }

    if (jobId) query = query.eq('job_id', jobId);
    if (contractorId) query = query.eq('contractor_id', contractorId);
    if (status) query = query.eq('status', status);
    if (minAmount) query = query.gte('amount', parseFloat(minAmount));
    if (maxAmount) query = query.lte('amount', parseFloat(maxAmount));

    const { data: bids, error } = await query;

    if (error) {
      console.error('Bids fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.bids.list',
      resource_type: 'job_bid',
      details: { count: bids?.length || 0, filters: { jobId, contractorId, status, minAmount, maxAmount } },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ bids: bids || [] });

  } catch (error) {
    console.error('Bids GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const bidData = CreateBidSchema.parse(body);

    // Verify job exists and is open for bids
    const { data: job } = await supabase
      .from('jobs')
      .select('id, status, organization_id')
      .eq('id', bidData.jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'open') {
      return NextResponse.json({ error: 'Job is not open for bids' }, { status: 400 });
    }

    // Check if contractor already bid on this job
    const { data: existingBid } = await supabase
      .from('job_bids')
      .select('id')
      .eq('job_id', bidData.jobId)
      .eq('contractor_id', user.id)
      .eq('status', 'submitted')
      .single();

    if (existingBid) {
      return NextResponse.json({ error: 'You have already submitted a bid for this job' }, { status: 400 });
    }

    // Calculate total from milestones if provided
    let totalAmount = bidData.amount;
    if (bidData.milestones && bidData.milestones.length > 0) {
      totalAmount = bidData.milestones.reduce((sum, m) => sum + m.amount, 0);
    }

    const { data: bid, error } = await supabase
      .from('job_bids')
      .insert({
        job_id: bidData.jobId,
        contractor_id: user.id,
        organization_id: job.organization_id,
        amount: totalAmount,
        currency: bidData.currency,
        proposed_start_date: bidData.proposedStartDate,
        proposed_end_date: bidData.proposedEndDate,
        delivery_time: bidData.deliveryTime,
        proposal: bidData.proposal,
        approach: bidData.approach,
        milestones: bidData.milestones,
        attachments: bidData.attachments,
        previous_work: bidData.previousWork,
        team_members: bidData.teamMembers,
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Bid creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send notification to job owner
    await supabase.from('notifications').insert({
      user_id: job.organization_id,
      organization_id: job.organization_id,
      type: 'new_bid',
      title: 'New Bid Received',
      message: `A new bid has been submitted for your job`,
      data: { bid_id: bid.id, job_id: bidData.jobId },
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: job.organization_id,
      user_id: user.id,
      action: 'jobs.bids.create',
      resource_type: 'job_bid',
      resource_id: bid.id,
      details: { job_id: bidData.jobId, amount: totalAmount, currency: bidData.currency },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ bid }, { status: 201 });

  } catch (error) {
    console.error('Bids POST error:', error);
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
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bid ID is required' }, { status: 400 });
    }

    const bidData = UpdateBidSchema.parse(updateData);

    // Verify bid belongs to user and is still editable
    const { data: existingBid } = await supabase
      .from('job_bids')
      .select('contractor_id, status')
      .eq('id', id)
      .single();

    if (!existingBid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (existingBid.contractor_id !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own bids' }, { status: 403 });
    }

    if (!['submitted', 'draft'].includes(existingBid.status)) {
      return NextResponse.json({ error: 'Bid cannot be edited in current status' }, { status: 400 });
    }

    const { data: bid, error } = await supabase
      .from('job_bids')
      .update({
        ...bidData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Bid update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.bids.update',
      resource_type: 'job_bid',
      resource_id: bid.id,
      details: { updated_fields: Object.keys(bidData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ bid });

  } catch (error) {
    console.error('Bids PUT error:', error);
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
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bid ID is required' }, { status: 400 });
    }

    // Verify bid belongs to user
    const { data: bid } = await supabase
      .from('job_bids')
      .select('contractor_id, status, job_id')
      .eq('id', id)
      .single();

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (bid.contractor_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own bids' }, { status: 403 });
    }

    if (!['submitted', 'draft'].includes(bid.status)) {
      return NextResponse.json({ error: 'Bid cannot be deleted in current status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('job_bids')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Bid deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.bids.delete',
      resource_type: 'job_bid',
      resource_id: id,
      details: { job_id: bid.job_id },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Bids DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

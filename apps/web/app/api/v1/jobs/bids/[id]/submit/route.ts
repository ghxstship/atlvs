import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SubmitBidSchema = z.object({
  confirmTerms: z.boolean(),
  additionalNotes: z.string().optional(),
  attachFinalDocuments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number()
  })).optional()
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const body = await request.json();
    const submitData = SubmitBidSchema.parse(body);

    if (!submitData.confirmTerms) {
      return NextResponse.json({ error: 'Must confirm terms to submit bid' }, { status: 400 });
    }

    // Get the bid and verify ownership
    const { data: bid, error: fetchError } = await supabase
      .from('job_bids')
      .select(`
        *,
        job:jobs(id, title, type, category, status, organization_id)
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Verify the user owns this bid
    if (bid.contractor_id !== user.id) {
      return NextResponse.json({ error: 'You can only submit your own bids' }, { status: 403 });
    }

    if (bid.status !== 'draft') {
      return NextResponse.json({ error: `Bid cannot be submitted. Current status: ${bid.status}` }, { status: 400 });
    }

    // Verify job is still open
    if (bid.job.status !== 'open') {
      return NextResponse.json({ error: 'Job is no longer accepting bids' }, { status: 400 });
    }

    // Check for duplicate submission
    const { data: existingSubmission } = await supabase
      .from('job_bids')
      .select('id')
      .eq('job_id', bid.job_id)
      .eq('contractor_id', user.id)
      .eq('status', 'submitted')
      .neq('id', params.id)
      .single();

    if (existingSubmission) {
      return NextResponse.json({ error: 'You have already submitted a bid for this job' }, { status: 400 });
    }

    // Update bid status to submitted
    const { data: updatedBid, error: updateError } = await supabase
      .from('job_bids')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submission_notes: submitData.additionalNotes,
        final_documents: submitData.attachFinalDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Bid submission error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Update job bid count
    await supabase.rpc('increment_job_bid_count', { job_id: bid.job_id });

    // Send notification to job owner
    const { data: jobOwner } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', bid.job_id)
      .single();

    if (jobOwner) {
      await supabase.from('notifications').insert({
        user_id: jobOwner.created_by,
        organization_id: bid.job.organization_id,
        type: 'bid_submitted',
        title: 'New Bid Submitted',
        message: `A new bid has been submitted for: ${bid.job.title}`,
        data: { 
          bid_id: params.id, 
          job_id: bid.job_id,
          amount: bid.amount,
          currency: bid.currency
        },
        created_at: new Date().toISOString()
      });
    }

    // Create bid evaluation record for tracking
    await supabase.from('bid_evaluations').insert({
      bid_id: params.id,
      job_id: bid.job_id,
      organization_id: bid.job.organization_id,
      status: 'pending_review',
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: bid.job.organization_id,
      user_id: user.id,
      action: 'jobs.bids.submit',
      resource_type: 'job_bid',
      resource_id: params.id,
      details: { 
        job_id: bid.job_id,
        amount: bid.amount,
        currency: bid.currency
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      bid: updatedBid,
      message: 'Bid submitted successfully' 
    });

  } catch (error) {
    console.error('Bid submit error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

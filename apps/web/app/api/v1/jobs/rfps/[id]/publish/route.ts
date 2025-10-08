import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PublishRFPSchema = z.object({
  publishNotes: z.string().optional(),
  notifyContractors: z.boolean().default(true),
  inviteList: z.array(z.string().uuid()).optional()
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
    const { user, orgId, role, supabase } = await getAuthenticatedUser();
    
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const publishData = PublishRFPSchema.parse(body);

    // Get the RFP and verify it can be published
    const { data: rfp, error: fetchError } = await supabase
      .from('rfps')
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !rfp) {
      return NextResponse.json({ error: 'RFP not found' }, { status: 404 });
    }

    // Validate RFP status
    if (rfp.status !== 'draft') {
      return NextResponse.json({ 
        error: `RFP cannot be published. Current status: ${rfp.status}` 
      }, { status: 400 });
    }

    // Validate required fields are complete
    const requiredFields = ['title', 'description', 'projectType', 'scope', 'requirements', 'budget', 'timeline', 'evaluation'];
    const missingFields = requiredFields.filter(field => !rfp[field] || 
      (typeof rfp[field] === 'object' && Object.keys(rfp[field]).length === 0));

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: 'RFP is incomplete',
        missingFields
      }, { status: 400 });
    }

    // Check if deadline hasn't passed
    const rfpDeadline = new Date(rfp.timeline.rfpDeadline);
    if (rfpDeadline < new Date()) {
      return NextResponse.json({ 
        error: 'RFP deadline has already passed. Please update the timeline before publishing.'
      }, { status: 400 });
    }

    // Update RFP status to published
    const { data: updatedRFP, error: updateError } = await supabase
      .from('rfps')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: user.id,
        publish_notes: publishData.publishNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('RFP publish error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Handle notifications based on visibility
    let contractorIds: string[] = [];
    
    if (publishData.notifyContractors) {
      if (rfp.visibility === 'invite_only' && publishData.inviteList) {
        // Notify only invited contractors
        contractorIds = publishData.inviteList;
      } else if (rfp.visibility === 'public') {
        // Notify contractors matching criteria
        const { data: contractors } = await supabase
          .from('contractors')
          .select('id')
          .eq('status', 'active')
          .contains('capabilities', [rfp.projectType])
          .limit(500);

        contractorIds = contractors?.map(c => c.id) || [];
      } else if (rfp.visibility === 'network') {
        // Notify contractors in organization's network
        const { data: networkContractors } = await supabase
          .from('contractor_relationships')
          .select('contractor_id')
          .eq('organization_id', orgId)
          .eq('status', 'active');

        contractorIds = networkContractors?.map(c => c.contractor_id) || [];
      }

      // Create notifications
      if (contractorIds.length > 0) {
        const notifications = contractorIds.map(contractorId => ({
          user_id: contractorId,
          organization_id: orgId,
          type: 'rfp_published',
          title: 'New RFP Available',
          message: `${rfp.organization.name} has published a new RFP: ${rfp.title}`,
          data: { 
            rfp_id: params.id,
            rfp_number: rfp.rfp_number,
            deadline: rfp.timeline.rfpDeadline,
            project_type: rfp.projectType
          },
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }

      // Create invitations for invite-only RFPs
      if (rfp.visibility === 'invite_only' && publishData.inviteList) {
        const invitations = publishData.inviteList.map(contractorId => ({
          rfp_id: params.id,
          contractor_id: contractorId,
          organization_id: orgId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }));

        await supabase.from('rfp_invitations').insert(invitations);
      }
    }

    // Create RFP publication record
    await supabase.from('rfp_publications').insert({
      rfp_id: params.id,
      organization_id: orgId,
      published_by: user.id,
      visibility: rfp.visibility,
      notification_count: contractorIds.length,
      published_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'jobs.rfps.publish',
      resource_type: 'rfp',
      resource_id: params.id,
      details: { 
        rfp_number: rfp.rfp_number,
        title: rfp.title,
        visibility: rfp.visibility,
        notifications_sent: publishData.notifyContractors
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      rfp: updatedRFP,
      message: 'RFP published successfully',
      notificationsSent: publishData.notifyContractors ? contractorIds.length : 0
    });

  } catch (error) {
    console.error('RFP publish error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

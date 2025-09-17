'use client';

import { useState, useEffect } from 'react';
import { 
  Card, Button, Badge, Input, Textarea, Drawer 
} from '@ghxstship/ui';
import { 
  Send, DollarSign, Calendar, Clock, FileText, 
  CheckCircle, XCircle, Star, TrendingUp, Award
} from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const proposalSchema = z.object({
  cover_letter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  approach: z.string().min(50, 'Approach must be at least 50 characters'),
  bid_amount: z.number().min(1, 'Bid amount is required'),
  currency: z.string().default('USD'),
  fee_type: z.enum(['fixed', 'hourly']),
  hourly_rate: z.number().optional(),
  estimated_hours: z.number().optional(),
  proposed_timeline: z.string().min(10, 'Timeline is required'),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    amount: z.number(),
    duration: z.string()
  })).optional(),
  start_availability: z.string().optional(),
  questions: z.string().optional()
});

type ProposalForm = z.infer<typeof proposalSchema>;

interface ProposalSystemProps {
  projectId: string;
  vendorId?: string;
  userId: string;
  mode: 'vendor' | 'client';
}

export default function ProposalSystem({ projectId, vendorId, userId, mode }: ProposalSystemProps) {
  const supabase = createBrowserClient();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [project, setProject] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      currency: 'USD',
      fee_type: 'fixed'
    }
  });

  useEffect(() => {
    loadProject();
    loadProposals();
  }, [projectId]);

  async function loadProject() {
    const { data } = await supabase
      .from('opendeck_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    setProject(data);
  }

  async function loadProposals() {
    setLoading(true);
    try {
      let query = supabase
        .from('opendeck_proposals')
        .select(`
          *,
          vendor:opendeck_vendor_profiles!vendor_id(
            id,
            display_name,
            avatar_url,
            rating,
            total_reviews,
            hourly_rate
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (mode === 'vendor' && vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setProposals(data || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function submitProposal(data: ProposalForm) {
    if (!vendorId) return;

    try {
      const proposalData = {
        ...data,
        project_id: projectId,
        vendor_id: vendorId,
        status: 'submitted'
      };

      const { error } = await supabase
        .from('opendeck_proposals')
        .insert(proposalData);

      if (error) throw error;

      // Update project proposal count
      await supabase.rpc('increment', {
        table_name: 'opendeck_projects',
        column_name: 'proposals_count',
        row_id: projectId
      });

      setDrawerOpen(false);
      reset();
      loadProposals();
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  }

  async function updateProposalStatus(proposalId: string, status: string) {
    try {
      const { error } = await supabase
        .from('opendeck_proposals')
        .update({ 
          status,
          client_viewed: true,
          client_viewed_at: new Date().toISOString(),
          shortlisted: status === 'shortlisted'
        })
        .eq('id', proposalId);

      if (error) throw error;
      loadProposals();
    } catch (error) {
      console.error('Error updating proposal:', error);
    }
  }

  const ProposalCard = ({ proposal }: { proposal: any }) => (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background text-heading-3">
            {proposal.vendor?.display_name?.charAt(0) || 'V'}
          </div>
          <div>
            <h4 className="text-heading-4">{proposal.vendor?.display_name || 'Vendor'}</h4>
            <div className="flex items-center space-x-3 text-body-sm color-muted">
              <div className="flex items-center">
                <Star className="h-4 w-4 color-warning fill-warning mr-1" />
                <span>{proposal.vendor?.rating || 0}</span>
              </div>
              <span>•</span>
              <span>{proposal.vendor?.total_reviews || 0} reviews</span>
              {proposal.vendor?.hourly_rate && (
                <>
                  <span>•</span>
                  <span>${proposal.vendor.hourly_rate}/hr</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant={
          proposal.status === 'accepted' ? 'success' :
          proposal.status === 'shortlisted' ? 'warning' :
          proposal.status === 'rejected' ? 'destructive' :
          'secondary'
        }>
          {proposal.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-body-sm form-label mb-1">Proposed Budget</p>
          <p className="text-heading-3 text-heading-3">
            ${proposal.bid_amount.toLocaleString()}
            {proposal.fee_type === 'hourly' && <span className="text-body-sm text-body">/hr</span>}
          </p>
        </div>

        <div>
          <p className="text-body-sm form-label mb-1">Timeline</p>
          <p className="text-body-sm">{proposal.proposed_timeline}</p>
        </div>

        <div>
          <p className="text-body-sm form-label mb-1">Cover Letter</p>
          <p className="text-body-sm line-clamp-3">{proposal.cover_letter}</p>
        </div>

        {proposal.milestones && proposal.milestones.length > 0 && (
          <div>
            <p className="text-body-sm form-label mb-1">Milestones</p>
            <div className="space-y-1">
              {proposal.milestones.slice(0, 2).map((milestone: any, i: number) => (
                <div key={i} className="flex justify-between text-body-sm">
                  <span>{milestone.title}</span>
                  <span className="form-label">${milestone.amount.toLocaleString()}</span>
                </div>
              ))}
              {proposal.milestones.length > 2 && (
                <p className="text-body-sm color-muted">
                  +{proposal.milestones.length - 2} more milestones
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mt-4">
        {mode === 'client' ? (
          <>
            <Button 
              
              variant="primary" 
              className="flex-1"
              onClick={() => updateProposalStatus(proposal.id, 'accepted')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              
              variant="outline" 
              className="flex-1"
              onClick={() => updateProposalStatus(proposal.id, 'shortlisted')}
            >
              <Star className="h-4 w-4 mr-1" />
              Shortlist
            </Button>
            <Button 
              
              variant="ghost"
              onClick={() => updateProposalStatus(proposal.id, 'rejected')}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="flex-1">
              View Details
            </Button>
            {proposal.status === 'submitted' && (
              <Button variant="ghost">
                Withdraw
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      {project && (
        <Card className="p-6 bg-accent/10">
          <h3 className="text-body text-heading-4 mb-2">{project.title}</h3>
          <p className="text-body-sm color-muted mb-4">{project.description}</p>
          <div className="flex items-center space-x-6 text-body-sm">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 color-muted" />
              <span>
                {project.budget_type === 'fixed' ? 
                  `$${project.budget_min?.toLocaleString()} - $${project.budget_max?.toLocaleString()}` :
                  project.budget_type === 'hourly' ?
                  `$${project.budget_min}/hr` :
                  'Budget not specified'
                }
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 color-muted" />
              <span>{project.duration || 'Timeline flexible'}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1 color-muted" />
              <span>{proposals.length} proposals</span>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      {mode === 'vendor' && (
        <div className="flex justify-between items-center">
          <h3 className="text-body text-heading-4">Your Proposals</h3>
          {proposals.length === 0 && (
            <Button onClick={() => setDrawerOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Proposal
            </Button>
          )}
        </div>
      )}

      {mode === 'client' && (
        <div className="flex justify-between items-center">
          <h3 className="text-body text-heading-4">Received Proposals</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {proposals.filter(p => p.status === 'shortlisted').length} shortlisted
            </Badge>
            <Badge variant="success">
              {proposals.filter(p => p.status === 'accepted').length} accepted
            </Badge>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 color-muted" />
          <h3 className="text-body text-heading-4 mb-2">
            {mode === 'vendor' ? 'No proposals submitted yet' : 'No proposals received yet'}
          </h3>
          <p className="color-muted mb-4">
            {mode === 'vendor' ? 
              'Submit a proposal to bid on this project' : 
              'Proposals from vendors will appear here'
            }
          </p>
          {mode === 'vendor' && (
            <Button onClick={() => setDrawerOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Proposal
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {/* Proposal Form Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          reset();
        }}
        title="Submit Proposal"
       
      >
        <form onSubmit={handleSubmit(submitProposal)} className="p-6 space-y-4">
          <div>
            <label className="text-body-sm form-label">Cover Letter</label>
            <Textarea 
              {...register('cover_letter')} 
              placeholder="Introduce yourself and explain why you're the best fit for this project..."
              rows={4}
            />
            {errors.cover_letter && (
              <p className="text-body-sm color-destructive mt-1">{errors.cover_letter.message}</p>
            )}
          </div>

          <div>
            <label className="text-body-sm form-label">Your Approach</label>
            <Textarea 
              {...register('approach')} 
              placeholder="Describe how you would approach this project..."
              rows={3}
            />
            {errors.approach && (
              <p className="text-body-sm color-destructive mt-1">{errors.approach.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm form-label">Fee Type</label>
              <select 
                {...register('fee_type')}
                className="w-full rounded border px-3 py-2"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="text-body-sm form-label">
                {watch('fee_type') === 'hourly' ? 'Hourly Rate' : 'Total Amount'}
              </label>
              <Input 
                {...register('bid_amount', { valueAsNumber: true })} 
                type="number" 
                placeholder="0"
              />
              {errors.bid_amount && (
                <p className="text-body-sm color-destructive mt-1">{errors.bid_amount.message}</p>
              )}
            </div>
          </div>

          {watch('fee_type') === 'hourly' && (
            <div>
              <label className="text-body-sm form-label">Estimated Hours</label>
              <Input 
                {...register('estimated_hours', { valueAsNumber: true })} 
                type="number" 
                placeholder="0"
              />
            </div>
          )}

          <div>
            <label className="text-body-sm form-label">Proposed Timeline</label>
            <Input 
              {...register('proposed_timeline')} 
              placeholder="e.g., 2 weeks, 1 month"
            />
            {errors.proposed_timeline && (
              <p className="text-body-sm color-destructive mt-1">{errors.proposed_timeline.message}</p>
            )}
          </div>

          <div>
            <label className="text-body-sm form-label">Start Availability</label>
            <Input 
              {...register('start_availability')} 
              type="date"
            />
          </div>

          <div>
            <label className="text-body-sm form-label">Questions for Client (Optional)</label>
            <Textarea 
              {...register('questions')} 
              placeholder="Any questions or clarifications needed?"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

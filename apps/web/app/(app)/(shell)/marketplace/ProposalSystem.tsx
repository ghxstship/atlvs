'use client';



import { Send, DollarSign, Calendar, CheckCircle, XCircle, Star, Award, AlertCircle, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
 Card,
 Button,
 Badge,
 UnifiedInput,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { AppDrawer } from '@ghxstship/ui';

type ProposalStatus = 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | string;
type ProposalFeeType = 'fixed' | 'hourly';

interface ProposalFormData {
 coverLetter: string;
 approach: string;
 bidAmount: string;
 currency: string;
 feeType: ProposalFeeType;
 estimatedHours: string;
 proposedTimeline: string;
 startAvailability: string;
 questions: string;
}

interface VendorProfile {
 id: string;
 display_name?: string | null;
 avatar_url?: string | null;
 rating?: number | null;
 total_reviews?: number | null;
 hourly_rate?: number | null;
}

interface ProposalMilestone {
 title: string;
 description: string;
 amount: number;
 duration: string;
}

interface OpenDeckProposal {
 id: string;
 project_id: string;
 vendor_id: string;
 status: ProposalStatus;
 vendor?: VendorProfile;
 milestones?: ProposalMilestone[];
 client_viewed?: boolean;
 created_at: string;
 cover_letter: string;
 approach: string;
 bid_amount: number;
 currency: string;
 fee_type: ProposalFeeType;
 estimated_hours?: number | null;
 proposed_timeline: string;
 start_availability?: string | null;
 questions?: string | null;
}

interface OpenDeckProject extends Partial<{
 budget_type: 'fixed' | 'hourly' | 'not_specified';
 budget_min: number;
 budget_max: number;
 duration: string;
 description: string;
 start_date: string;
 end_date: string;
 status: string;
}> {
 id: string;
 title: string;
}

interface ProposalSystemProps {
 projectId: string;
 vendorId?: string;
 userId: string;
 mode: 'vendor' | 'client';
}

const FEE_TYPE_OPTIONS: ReadonlyArray<{ value: ProposalFeeType; label: string }> = [
 { value: 'fixed', label: 'Fixed Price' },
 { value: 'hourly', label: 'Hourly Rate' },
];

const createInitialFormData = (): ProposalFormData => ({
 coverLetter: '',
 approach: '',
 bidAmount: '',
 currency: 'USD',
 feeType: 'fixed',
 estimatedHours: '',
 proposedTimeline: '',
 startAvailability: '',
 questions: '',
});

export default function ProposalSystem({ projectId, vendorId, userId, mode }: ProposalSystemProps) {
 const supabase = createBrowserClient();
 const [proposals, setProposals] = useState<OpenDeckProposal[]>([]);
 const [loading, setLoading] = useState(true);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [selectedProposal, setSelectedProposal] = useState<OpenDeckProposal | null>(null);
 const [project, setProject] = useState<OpenDeckProject | null>(null);
 const [formData, setFormData] = useState<ProposalFormData>(() => createInitialFormData());
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

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
 
 setProject(data as OpenDeckProject | null);
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

 setProposals((data || []) as OpenDeckProposal[]);
 } catch (error) {
 console.error('Error loading proposals:', error);
 } finally {
 setLoading(false);
 }
 }

 async function updateProposalStatus(proposalId: string, status: ProposalStatus) {
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

 const updateForm = useCallback(<Key extends keyof ProposalFormData>(field: Key, value: ProposalFormData[Key]) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 }, []);

 const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
 const { name, value } = event.target;
 updateForm(name as keyof ProposalFormData, value as ProposalFormData[keyof ProposalFormData]);
 }, [updateForm]);

 const handleTextareaChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
 const { name, value } = event.target;
 updateForm(name as keyof ProposalFormData, value as ProposalFormData[keyof ProposalFormData]);
 }, [updateForm]);

 const handleFeeTypeChange = useCallback((value: string) => {
 updateForm('feeType', value as ProposalFeeType);
 }, [updateForm]);

 const handleOpenDrawer = useCallback((proposal?: OpenDeckProposal | null) => {
 if (proposal) {
 setSelectedProposal(proposal);
 setFormData({
 coverLetter: proposal.cover_letter,
 approach: proposal.approach,
 bidAmount: String(proposal.bid_amount ?? ''),
 currency: proposal.currency ?? 'USD',
 feeType: (proposal.fee_type as ProposalFeeType) || 'fixed',
 estimatedHours: proposal.estimated_hours != null ? String(proposal.estimated_hours) : '',
 proposedTimeline: proposal.proposed_timeline,
 startAvailability: proposal.start_availability ?? '',
 questions: proposal.questions ?? '',
 });
 } else {
 setSelectedProposal(null);
 setFormData(createInitialFormData());
 }

 setError(null);
 setDrawerOpen(true);
 }, []);

 const handleCloseDrawer = useCallback(() => {
 if (isSubmitting) {
 return;
 }

 setDrawerOpen(false);
 setSelectedProposal(null);
 setFormData(createInitialFormData());
 setError(null);
 }, [isSubmitting]);

 const feeTypeItems = useMemo(() => FEE_TYPE_OPTIONS.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 )), []);

 const handleSubmitProposal = useCallback(async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 if (!vendorId) {
 return;
 }

 const trimmedCoverLetter = formData.coverLetter.trim();
 const trimmedApproach = formData.approach.trim();
 const trimmedTimeline = formData.proposedTimeline.trim();
 const trimmedQuestions = formData.questions.trim();

 if (trimmedCoverLetter.length < 100) {
 setError('Cover letter must be at least 100 characters.');
 return;
 }

 if (trimmedApproach.length < 50) {
 setError('Approach must be at least 50 characters.');
 return;
 }

 if (trimmedTimeline.length < 10) {
 setError('Timeline must be at least 10 characters.');
 return;
 }

 const bidAmountValue = parseFloat(formData.bidAmount.trim());
 if (Number.isNaN(bidAmountValue) || bidAmountValue <= 0) {
 setError('Bid amount is required and must be greater than zero.');
 return;
 }

 const estimatedHoursValue = parseFloat(formData.estimatedHours.trim());
 if (formData.feeType === 'hourly' && (Number.isNaN(estimatedHoursValue) || estimatedHoursValue <= 0)) {
 setError('Estimated hours must be greater than zero for hourly proposals.');
 return;
 }

 setError(null);
 setIsSubmitting(true);

 const payload: Partial<OpenDeckProposal> = {
 cover_letter: trimmedCoverLetter,
 approach: trimmedApproach,
 bid_amount: bidAmountValue,
 currency: formData.currency,
 fee_type: formData.feeType,
 estimated_hours: formData.feeType === 'hourly' ? estimatedHoursValue : null,
 proposed_timeline: trimmedTimeline,
 start_availability: formData.startAvailability || null,
 questions: trimmedQuestions || null,
 project_id: projectId,
 vendor_id: vendorId,
 status: 'submitted',
 };

 try {
 const { error: insertError } = await supabase
 .from('opendeck_proposals')
 .insert(payload);

 if (insertError) {
 throw insertError;
 }

 await supabase.rpc('increment', {
 table_name: 'opendeck_projects',
 column_name: 'proposals_count',
 row_id: projectId,
 });

 setDrawerOpen(false);
 setFormData(createInitialFormData());
 loadProposals();
 } catch (submitError) {
 console.error('Error submitting proposal:', submitError);
 setError(submitError instanceof Error ? submitError.message : 'An unexpected error occurred while submitting the proposal.');
 } finally {
 setIsSubmitting(false);
 }
 }, [formData, loadProposals, projectId, supabase, vendorId]);

 const isSubmitDisabled = useMemo(() => {
 if (isSubmitting || !vendorId) {
 return true;
 }

 const trimmedCoverLetter = formData.coverLetter.trim();
 const trimmedApproach = formData.approach.trim();
 const trimmedTimeline = formData.proposedTimeline.trim();
 const bidAmountValue = parseFloat(formData.bidAmount.trim());
 const estimatedHoursValue = parseFloat(formData.estimatedHours.trim());

 return (
 trimmedCoverLetter.length < 100 ||
 trimmedApproach.length < 50 ||
 trimmedTimeline.length < 10 ||
 Number.isNaN(bidAmountValue) ||
 bidAmountValue <= 0 ||
 (formData.feeType === 'hourly' && (Number.isNaN(estimatedHoursValue) || estimatedHoursValue <= 0))
 );
 }, [formData, isSubmitting, vendorId]);

 const ProposalCard = ({ proposal }: { proposal: OpenDeckProposal }) => (
 <Card className="p-lg">
 <div className="brand-marketplace flex justify-between items-start mb-md">
 <div className="brand-marketplace flex items-start cluster">
 <div className="brand-marketplace w-icon-2xl h-icon-2xl rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background text-heading-3">
 {proposal.vendor?.display_name?.charAt(0) || 'V'}
 </div>
 <div>
 <h4 className="text-body text-heading-4">{proposal.vendor?.display_name || 'Vendor'}</h4>
 <div className="brand-marketplace flex items-center cluster-sm text-body-sm color-muted">
 <div className="brand-marketplace flex items-center">
 <Star className="h-icon-xs w-icon-xs color-warning fill-warning mr-xs" />
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

 <div className="brand-marketplace stack-sm">
 <div>
 <p className="text-body-sm form-label mb-xs">Proposed Budget</p>
 <p className="text-heading-3">
 ${proposal.bid_amount?.toLocaleString()}
 {proposal.fee_type === 'hourly' && <span className="text-body-sm text-body">/hr</span>}
 </p>
 </div>

 <div>
 <p className="text-body-sm form-label mb-xs">Timeline</p>
 <p className="text-body-sm">{proposal.proposed_timeline}</p>
 </div>

 <div>
 <p className="text-body-sm form-label mb-xs">Cover Letter</p>
 <p className="text-body-sm line-clamp-sm">{proposal.cover_letter}</p>
 </div>

 {proposal.milestones && proposal.milestones.length > 0 && (
 <div>
 <p className="text-body-sm form-label mb-xs">Milestones</p>
 <div className="brand-marketplace stack-md">
 {proposal.milestones.slice(0, 2).map((milestone: ProposalMilestone, i: number) => (
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

 <div className="brand-marketplace flex cluster-sm mt-md">
 {mode === 'client' ? (
 <>
 <Button 
 variant="primary" 
 className="flex-1"
 onClick={() => updateProposalStatus(proposal.id, 'accepted')}
 >
 <CheckCircle className="h-icon-xs w-icon-xs mr-xs" />
 Accept
 </Button>
 <Button 
 
 variant="outline" 
 className="flex-1"
 onClick={() => updateProposalStatus(proposal.id, 'shortlisted')}
 >
 <Star className="h-icon-xs w-icon-xs mr-xs" />
 Shortlist
 </Button>
 <Button 
 
 variant="ghost"
 onClick={() => updateProposalStatus(proposal.id, 'rejected')}
 >
 <XCircle className="h-icon-xs w-icon-xs" />
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
 <div className="brand-marketplace flex items-center justify-center h-container-sm">
 <div className="brand-marketplace animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 </div>
 );
 }

 return (
 <div className="brand-marketplace stack-lg">
 {/* Project Summary */}
 {project && (
 <Card className="p-lg bg-accent/10">
 <h3 className="text-body text-heading-4 mb-sm">{project.title}</h3>
 <p className="text-body-sm color-muted mb-md">{project.description}</p>
 <div className="brand-marketplace flex items-center cluster-lg text-body-sm">
 <div className="brand-marketplace flex items-center">
 <DollarSign className="h-icon-xs w-icon-xs mr-xs color-muted" />
 <span>
 {project.budget_type === 'fixed' ? 
 `$${project.budget_min?.toLocaleString()} - $${project.budget_max?.toLocaleString()}` :
 project.budget_type === 'hourly' ?
 `$${project.budget_min}/hr` :
 'Budget not specified'
 }
 </span>
 </div>
 <div className="brand-marketplace flex items-center">
 <Calendar className="h-icon-xs w-icon-xs mr-xs color-muted" />
 <span>{project.duration || 'Timeline flexible'}</span>
 </div>
 <div className="brand-marketplace flex items-center">
 <FileText className="h-icon-xs w-icon-xs mr-xs color-muted" />
 <span>{proposals.length} proposals</span>
 </div>
 </div>
 </Card>
 )}

 {/* Actions */}
 {mode === 'vendor' && (
 <div className="brand-marketplace flex justify-between items-center">
 <h3 className="text-body text-heading-4">Your Proposals</h3>
 {proposals.length === 0 && (
 <Button onClick={() => handleOpenDrawer()}>
 <Send className="h-icon-xs w-icon-xs mr-sm" />
 Submit Proposal
 </Button>
 )}
 </div>
 )}

 {mode === 'client' && (
 <div className="brand-marketplace flex justify-between items-center">
 <h3 className="text-body text-heading-4">Received Proposals</h3>
 <div className="brand-marketplace flex items-center cluster-sm">
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
 <Card className="p-xsxl text-center">
 <Award className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">
 {mode === 'vendor' ? 'No proposals submitted yet' : 'No proposals received yet'}
 </h3>
 <p className="color-muted mb-md">
 {mode === 'vendor' ? 
 'Submit a proposal to bid on this project' : 
 'Proposals from vendors will appear here'
 }
 </p>
 {mode === 'vendor' && (
 <Button onClick={() => handleOpenDrawer()}
 disabled={isSubmitting}
 >
 <Send className="h-icon-xs w-icon-xs mr-sm" />
 Submit Proposal
 </Button>
 )}
 </Card>
 ) : (
 <div className="brand-marketplace grid grid-cols-1 md:grid-cols-2 gap-md">
 {proposals.map(proposal => (
 <ProposalCard key={proposal.id} proposal={proposal} />
 ))}
 </div>
 )}

 {/* Proposal Form Drawer */}
 <AppDrawer
 open={drawerOpen}
 onClose={handleCloseDrawer}
 title="Submit Proposal"
 record={selectedProposal}
 mode={mode === 'vendor' ? 'create' : 'view'}
 fields={[]}
 loading={isSubmitting}
 tabs={[{
 key: 'proposal-details',
 label: 'Proposal',
 content: mode === 'vendor' ? (
 <form onSubmit={handleSubmitProposal} className="p-lg stack-md">
 <div>
 <label htmlFor="coverLetter" className="text-body-sm form-label">
 Cover Letter
 </label>
 <Textarea
 
 
 value={formData.coverLetter}
 onChange={handleTextareaChange}
 placeholder="Introduce yourself and explain why you're the best fit for this project..."
 rows={4}
 required
 />
 </div>

 <div>
 <label htmlFor="approach" className="text-body-sm form-label">
 Your Approach
 </label>
 <Textarea
 
 
 value={formData.approach}
 onChange={handleTextareaChange}
 placeholder="Describe how you would approach this project..."
 rows={3}
 required
 />
 </div>

 <div className="brand-marketplace grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label className="text-body-sm form-label">Fee Type</label>
 <Select value={formData.feeType} onValueChange={handleFeeTypeChange}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>{feeTypeItems}</SelectContent>
 </Select>
 </div>

 <div>
 <label htmlFor="bidAmount" className="text-body-sm form-label">
 {formData.feeType === 'hourly' ? 'Hourly Rate' : 'Total Amount'}
 </label>
 <UnifiedInput
 
 
 type="number"
 value={formData.bidAmount}
 onChange={handleInputChange}
 placeholder="0"
 min="0"
 step="0.01"
 required
 />
 </div>
 </div>

 {formData.feeType === 'hourly' && (
 <div>
 <label htmlFor="estimatedHours" className="text-body-sm form-label">
 Estimated Hours
 </label>
 <UnifiedInput
 
 
 type="number"
 value={formData.estimatedHours}
 onChange={handleInputChange}
 placeholder="0"
 min="0"
 step="0.1"
 />
 </div>
 )}

 <div>
 <label htmlFor="proposedTimeline" className="text-body-sm form-label">
 Proposed Timeline
 </label>
 <UnifiedInput
 
 
 value={formData.proposedTimeline}
 onChange={handleInputChange}
 placeholder="e.g., 2 weeks, 1 month"
 required
 />
 </div>

 <div>
 <label htmlFor="startAvailability" className="text-body-sm form-label">
 Start Availability
 </label>
 <UnifiedInput
 
 
 type="date"
 value={formData.startAvailability}
 onChange={handleInputChange}
 />
 </div>

 <div>
 <label htmlFor="questions" className="text-body-sm form-label">
 Questions for Client (Optional)
 </label>
 <Textarea
 
 
 value={formData.questions}
 onChange={handleTextareaChange}
 placeholder="Any questions or clarifications needed?"
 rows={2}
 />
 </div>

 <div className="brand-marketplace flex justify-between items-center gap-sm pt-md border-t">
 <div className="flex items-center gap-sm text-body-sm color-muted">
 {error && (
 <>
 <AlertCircle className="h-icon-xs w-icon-xs color-destructive" />
 <span className="color-destructive">{error}</span>
 </>
 )}
 </div>
 <div className="brand-marketplace flex items-center gap-sm">
 <Button type="button" variant="outline" onClick={handleCloseDrawer}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitDisabled}>
 {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
 </Button>
 </div>
 </div>
 </form>
 ) : (
 <div className="p-lg">
 <p className="text-body-sm color-muted">Proposal details are available in the cards above.</p>
 </div>
 ),
 }]}
 />
 </div>
 );
}

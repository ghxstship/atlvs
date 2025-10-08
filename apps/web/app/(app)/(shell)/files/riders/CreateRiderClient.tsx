'use client';


import { Plus, FileText } from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Drawer } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
// import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createRiderSchema = z.object({
 title: z.string().min(2, 'Title is required'),
 type: z.enum(['technical', 'hospitality', 'stage_plot']),
 status: z.enum(['draft', 'pending_approval', 'approved', 'rejected']),
 priority: z.enum(['low', 'medium', 'high', 'critical']),
 requirements: z.string().optional(),
 notes: z.string().optional(),
 event_id: z.string().min(1, 'Event is required')
});

export default function CreateRiderClient({ orgId }: { orgId: string }) {
 const t = useTranslations('programming');
 const router = useRouter();
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [events, setEvents] = useState<Array<{ id: string; name: string }>([]);
 const sb = createBrowserClient();

 const form = useForm<z.infer<typeof createRiderSchema>({
 resolver: zodResolver(createRiderSchema),
 defaultValues: {
 title: '',
 type: 'technical',
 status: 'draft',
 priority: 'medium',
 requirements: '',
 notes: '',
 event_id: ''
 }
 });

 // Load events when drawer opens
 const handleOpen = async () => {
 setOpen(true);
 try {
 const { data } = await sb
 .from('programming_events')
 .select('id, name')
 .eq('organization_id', orgId)
 .in('status', ['planning', 'confirmed', 'in_progress'])
 .order('name');
 setEvents(data || []);
 } catch (error) {
 console.error('Error loading events:', error);
 }
 };

 const onSubmit = async (data: z.infer<typeof createRiderSchema>) => {
 setLoading(true);
 setError(null);
 
 try {
 const riderData = {
 ...data,
 organization_id: orgId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 };

 const { error: insertError } = await sb
 .from('programming_riders')
 .insert(riderData);

 if (insertError) throw insertError;

 if (typeof window !== 'undefined' && (window as unknown).posthog) {
 (window as unknown).posthog.capture('programming.rider.created', { 
 organization_id: orgId,
 type: data.type,
 priority: data.priority
 });
 }

 form.reset();
 setOpen(false);
 router.refresh();
 } catch (e) {
 setError(e?.message || 'Failed to create rider');
 } finally {
 setLoading(false);
 }
 };

 return (
 <>
 <Button onClick={handleOpen} className="inline-flex items-center gap-sm">
 <Plus className="w-icon-xs h-icon-xs" />
 Add Rider
 </Button>

 <Drawer
 open={open}
 onClose={() => {
 setOpen(false);
 form.reset();
 setError(null);
 }}
 title="Create New Rider"
 description="Add a new technical or hospitality rider"
 
 >
 <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
 {error && (
 <div className="p-sm text-body-sm color-destructive bg-destructive/10 border border-destructive/20 rounded">
 {error}
 </div>
 )}

 <div className="grid gap-sm">
 <label htmlFor="event_id" className="text-body-sm form-label">
 Event *
 </label>
 <select
 
 className="rounded border px-md py-sm"
 {...form.register('event_id')}
 >
 <option value="">Select an event</option>
 {events.map((event: unknown) => (
 <option key={event.id} value={event.id}>
 {event.name}
 </option>
 ))}
 </select>
 {form.formState.errors.event_id && (
 <div className="text-body-sm color-destructive">
 {form.formState.errors.event_id.message}
 </div>
 )}
 </div>

 <div className="grid gap-sm">
 <label htmlFor="title" className="text-body-sm form-label">
 Rider Title *
 </label>
 <input
 
 type="text"
 className="rounded border px-md py-sm"
 placeholder="Enter rider title..."
 {...form.register('title')}
 />
 {form.formState.errors.title && (
 <div className="text-body-sm color-destructive">
 {form.formState.errors.title.message}
 </div>
 )}
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div className="grid gap-sm">
 <label htmlFor="type" className="text-body-sm form-label">
 Rider Type *
 </label>
 <select
 
 className="rounded border px-md py-sm"
 {...form.register('type')}
 >
 <option value="technical">Technical</option>
 <option value="hospitality">Hospitality</option>
 <option value="stage_plot">Stage Plot</option>
 </select>
 </div>

 <div className="grid gap-sm">
 <label htmlFor="priority" className="text-body-sm form-label">
 Priority *
 </label>
 <select
 
 className="rounded border px-md py-sm"
 {...form.register('priority')}
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="critical">Critical</option>
 </select>
 </div>
 </div>

 <div className="grid gap-sm">
 <label htmlFor="status" className="text-body-sm form-label">
 Status *
 </label>
 <select
 
 className="rounded border px-md py-sm"
 {...form.register('status')}
 >
 <option value="draft">Draft</option>
 <option value="pending_approval">Pending Approval</option>
 <option value="approved">Approved</option>
 <option value="rejected">Rejected</option>
 </select>
 </div>

 <div className="grid gap-sm">
 <label htmlFor="requirements" className="text-body-sm form-label">
 Requirements
 </label>
 <textarea
 
 rows={4}
 className="rounded border px-md py-sm"
 placeholder="List specific requirements..."
 {...form.register('requirements')}
 />
 </div>

 <div className="grid gap-sm">
 <label htmlFor="notes" className="text-body-sm form-label">
 Additional Notes
 </label>
 <textarea
 
 rows={3}
 className="rounded border px-md py-sm"
 placeholder="Any additional notes or special instructions..."
 {...form.register('notes')}
 />
 </div>

 <div className="flex items-center justify-end gap-sm pt-md border-t">
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 setOpen(false);
 form.reset();
 setError(null);
 }}
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={loading}
 className="inline-flex items-center gap-sm"
 >
 <FileText className="w-icon-xs h-icon-xs" />
 {loading ? 'Creating...' : 'Create Rider'}
 </Button>
 </div>
 </form>
 </Drawer>
 </>
 );
}

'use client';

import {
  AppDrawer
} from "@ghxstship/ui";

import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import AppDrawer, { type DrawerFieldConfig } from '@ghxstship/ui';

import type { ProgrammingRider, RiderEvent, RiderProject, RiderKind, RiderPriority, RiderStatus } from '../types';

interface EditProgrammingRiderDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 rider: ProgrammingRider;
 orgId: string;
 currentUserId: string;
 projects: RiderProject[];
 events: RiderEvent[];
 onSuccess: () => void;
}

export default function EditProgrammingRiderDrawer({
 open,
 onOpenChange,
 rider,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess
}: EditProgrammingRiderDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: 'event_id',
 label: 'Event',
 type: 'select',
 required: true,
 options: events.map(event => ({
 label: `${event.title} - ${new Date(event.start_at).toLocaleDateString()}`,
 value: event.id
 }))
 },
 {
 key: 'project_id',
 label: 'Project (Optional)',
 type: 'select',
 options: [
 { label: 'No Project', value: '' },
 ...projects.map(project => ({
 label: project.name,
 value: project.id
 })),
 ]
 },
 {
 key: 'kind',
 label: 'Rider Type',
 type: 'select',
 required: true,
 options: [
 { label: '🔧 Technical', value: 'technical' },
 { label: '🍽️ Hospitality', value: 'hospitality' },
 { label: '📋 Stage Plot', value: 'stage_plot' },
 { label: '🛡️ Security', value: 'security' },
 { label: '🍴 Catering', value: 'catering' },
 { label: '🚐 Transportation', value: 'transportation' },
 { label: '🏨 Accommodation', value: 'accommodation' },
 { label: '🎬 Production', value: 'production' },
 { label: '🎤 Artist', value: 'artist' },
 { label: '👥 Crew', value: 'crew' },
 ]
 },
 {
 key: 'title',
 label: 'Rider Title',
 type: 'text',
 required: true,
 placeholder: 'Enter rider title'
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 placeholder: 'Brief description of the rider'
 },
 {
 key: 'requirements',
 label: 'Requirements',
 type: 'textarea',
 required: true,
 placeholder: 'Detailed requirements and specifications'
 },
 {
 key: 'priority',
 label: 'Priority',
 type: 'select',
 options: [
 { label: 'Low', value: 'low' },
 { label: 'Medium', value: 'medium' },
 { label: 'High', value: 'high' },
 { label: 'Critical', value: 'critical' },
 { label: 'Urgent', value: 'urgent' },
 ]
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { label: 'Draft', value: 'draft' },
 { label: 'Pending Review', value: 'pending_review' },
 { label: 'Under Review', value: 'under_review' },
 { label: 'Approved', value: 'approved' },
 { label: 'Rejected', value: 'rejected' },
 { label: 'Fulfilled', value: 'fulfilled' },
 { label: 'Cancelled', value: 'cancelled' },
 ]
 },
 {
 key: 'notes',
 label: 'Notes',
 type: 'textarea',
 placeholder: 'Additional notes or comments'
 },
 {
 key: 'tags',
 label: 'Tags',
 type: 'text',
 placeholder: 'Enter tags separated by commas'
 },
 // Fulfillment fields (only show for certain statuses)
 ...(rider.status === 'approved' || rider.status === 'fulfilled' ? [
 {
 key: 'fulfillment_notes',
 label: 'Fulfillment Notes',
 type: 'textarea' as const,
 placeholder: 'Notes about fulfillment'
 },
 ] : []),
 // Review fields (only show for certain statuses)
 ...(rider.status === 'under_review' || rider.status === 'approved' || rider.status === 'rejected' ? [
 {
 key: 'review_notes',
 label: 'Review Notes',
 type: 'textarea' as const,
 placeholder: 'Notes from review process'
 },
 ] : []),
 ];

 // Pre-populate form with existing data
 const initialData = {
 id: rider.id,
 event_id: rider.event_id,
 project_id: rider.project_id || '',
 kind: rider.kind,
 title: rider.title,
 description: rider.description || '',
 requirements: rider.requirements,
 priority: rider.priority,
 status: rider.status,
 notes: rider.notes || '',
 tags: rider.tags?.join(', ') || '',
 fulfillment_notes: rider.fulfillment_notes || '',
 review_notes: rider.review_notes || ''
 };

 const handleSubmit = async (data: Record<string, unknown>) => {
 try {
 setLoading(true);
 
 // Process tags
 const tags = data.tags 
 ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
 : [];

 const payload: unknown = {
 event_id: data.event_id,
 project_id: data.project_id || null,
 kind: data.kind as RiderKind,
 title: data.title,
 description: data.description || null,
 requirements: data.requirements,
 priority: data.priority as RiderPriority,
 status: data.status as RiderStatus,
 notes: data.notes || null,
 tags
 };

 // Add fulfillment data if status is fulfilled
 if (data.status === 'fulfilled' && !rider.fulfilled_at) {
 payload.fulfilled_at = new Date().toISOString();
 payload.fulfilled_by = currentUserId;
 payload.fulfillment_notes = data.fulfillment_notes || null;
 } else if (data.fulfillment_notes) {
 payload.fulfillment_notes = data.fulfillment_notes;
 }

 // Add review data if status is approved or rejected
 if ((data.status === 'approved' || data.status === 'rejected') && 
 (rider.status !== 'approved' && rider.status !== 'rejected')) {
 payload.reviewed_at = new Date().toISOString();
 payload.reviewed_by = currentUserId;
 payload.review_notes = data.review_notes || null;
 
 if (data.status === 'approved') {
 payload.approved_at = new Date().toISOString();
 payload.approved_by = currentUserId;
 }
 } else if (data.review_notes) {
 payload.review_notes = data.review_notes;
 }

 const response = await fetch(`/api/v1/programming/riders/${rider.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to update rider');
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error('Error updating rider:', error);
 // TODO: Show error toast
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Rider"
 mode="edit"
 fields={fields}
 record={initialData}
 loading={loading}
 onSave={handleSubmit}
 />
 );
}

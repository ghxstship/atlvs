'use client';

import {
  AppDrawer
} from "@ghxstship/ui";

import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import AppDrawer, { type DrawerFieldConfig } from '@ghxstship/ui';

import type { RiderEvent, RiderProject, RiderKind, RiderPriority, RiderStatus } from '../types';

interface CreateProgrammingRiderDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 currentUserId: string;
 projects: RiderProject[];
 events: RiderEvent[];
 onSuccess: () => void;
}

export default function CreateProgrammingRiderDrawer({
 open,
 onOpenChange,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess
}: CreateProgrammingRiderDrawerProps) {
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
 ];

 const handleSubmit = async (data: Record<string, unknown>) => {
 try {
 setLoading(true);
 
 // Process tags
 const tags = data.tags 
 ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
 : [];

 const payload = {
 event_id: data.event_id,
 project_id: data.project_id || null,
 kind: data.kind as RiderKind,
 title: data.title,
 description: data.description || null,
 requirements: data.requirements,
 priority: (data.priority as RiderPriority) || 'medium',
 status: (data.status as RiderStatus) || 'draft',
 notes: data.notes || null,
 tags,
 technical_requirements: {},
 hospitality_requirements: {},
 stage_plot: {},
 security_requirements: {},
 transportation: {},
 accommodation: {},
 attachments: [],
 metadata: {}
 };

 const response = await fetch('/api/v1/programming/riders', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to create rider');
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error('Error creating rider:', error);
 // TODO: Show error toast
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Rider"
 mode="create"
 fields={fields}
 loading={loading}
 onSave={handleSubmit}
 />
 );
}

'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import AppDrawer, { type DrawerFieldConfig } from '@ghxstship/ui';
import type {
 WorkshopProject,
 WorkshopEvent,
 WorkshopCategory,
 WorkshopType,
 WorkshopStatus,
 WorkshopSkillLevel,
 WorkshopFormat,
} from '../types';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface CreateProgrammingWorkshopDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 currentUserId: string;
 projects: WorkshopProject[];
 events: WorkshopEvent[];
 users: User[];
 onSuccess: () => void;
}

const CATEGORY_OPTIONS: Array<{ label: string; value: WorkshopCategory }> = [
 { label: 'Technical', value: 'technical' },
 { label: 'Creative', value: 'creative' },
 { label: 'Business', value: 'business' },
 { label: 'Leadership', value: 'leadership' },
 { label: 'Production', value: 'production' },
 { label: 'Design', value: 'design' },
 { label: 'Marketing', value: 'marketing' },
 { label: 'Finance', value: 'finance' },
 { label: 'Legal', value: 'legal' },
 { label: 'Other', value: 'other' },
];

const TYPE_OPTIONS: Array<{ label: string; value: WorkshopType }> = [
 { label: 'Workshop', value: 'workshop' },
 { label: 'Masterclass', value: 'masterclass' },
 { label: 'Seminar', value: 'seminar' },
 { label: 'Bootcamp', value: 'bootcamp' },
 { label: 'Training', value: 'training' },
 { label: 'Certification', value: 'certification' },
 { label: 'Conference', value: 'conference' },
 { label: 'Panel', value: 'panel' },
];

const STATUS_OPTIONS: Array<{ label: string; value: WorkshopStatus }> = [
 { label: 'Planning', value: 'planning' },
 { label: 'Open Registration', value: 'open_registration' },
 { label: 'Registration Closed', value: 'registration_closed' },
 { label: 'Full', value: 'full' },
 { label: 'In Progress', value: 'in_progress' },
 { label: 'Completed', value: 'completed' },
 { label: 'Cancelled', value: 'cancelled' },
 { label: 'Postponed', value: 'postponed' },
];

const SKILL_LEVEL_OPTIONS: Array<{ label: string; value: WorkshopSkillLevel }> = [
 { label: 'Beginner', value: 'beginner' },
 { label: 'Intermediate', value: 'intermediate' },
 { label: 'Advanced', value: 'advanced' },
 { label: 'Expert', value: 'expert' },
 { label: 'All Levels', value: 'all_levels' },
];

const FORMAT_OPTIONS: Array<{ label: string; value: WorkshopFormat }> = [
 { label: 'In Person', value: 'in_person' },
 { label: 'Virtual', value: 'virtual' },
 { label: 'Hybrid', value: 'hybrid' },
];

const numberOrUndefined = (value: unknown) => {
 if (value === undefined || value === null || value === '') {
 return undefined;
 }
 const parsed = Number(value);
 return Number.isNaN(parsed) ? undefined : parsed;
};

export default function CreateProgrammingWorkshopDrawer({
 open,
 onOpenChange,
 orgId,
 currentUserId,
 projects,
 events,
 users,
 onSuccess,
}: CreateProgrammingWorkshopDrawerProps) {
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: 'project_id',
 label: 'Project',
 type: 'select',
 options: [
 { label: 'No Project', value: '' },
 ...projects.map((project) => ({ label: project.name, value: project.id })),
 ],
 },
 {
 key: 'event_id',
 label: 'Event',
 type: 'select',
 options: [
 { label: 'No Event', value: '' },
 ...events.map((event) => ({ 
 label: `${event.title} - ${new Date(event.start_at).toLocaleDateString()}`, 
 value: event.id 
 })),
 ],
 },
 {
 key: 'title',
 label: 'Workshop Title',
 type: 'text',
 required: true,
 placeholder: 'Enter workshop title',
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 placeholder: 'Describe the workshop content and goals',
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 required: true,
 options: CATEGORY_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'type',
 label: 'Type',
 type: 'select',
 options: TYPE_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'skill_level',
 label: 'Skill Level',
 type: 'select',
 options: SKILL_LEVEL_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'format',
 label: 'Format',
 type: 'select',
 options: FORMAT_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'start_date',
 label: 'Start Date & Time',
 type: 'date',
 required: true,
 },
 {
 key: 'end_date',
 label: 'End Date & Time',
 type: 'date',
 },
 {
 key: 'duration_minutes',
 label: 'Duration (minutes)',
 type: 'number',
 },
 {
 key: 'location',
 label: 'Location',
 type: 'text',
 placeholder: 'Physical location or address',
 },
 {
 key: 'venue',
 label: 'Venue',
 type: 'text',
 placeholder: 'Venue name',
 },
 {
 key: 'virtual_link',
 label: 'Virtual Link',
 type: 'text',
 placeholder: 'Zoom, Teams, or other virtual meeting link',
 },
 {
 key: 'max_participants',
 label: 'Max Participants',
 type: 'number',
 },
 {
 key: 'min_participants',
 label: 'Min Participants',
 type: 'number',
 },
 {
 key: 'registration_opens_at',
 label: 'Registration Opens',
 type: 'date',
 },
 {
 key: 'registration_deadline',
 label: 'Registration Deadline',
 type: 'date',
 },
 {
 key: 'price',
 label: 'Price',
 type: 'number',
 },
 {
 key: 'currency',
 label: 'Currency',
 type: 'text',
 placeholder: 'USD, EUR, GBP, etc.',
 },
 {
 key: 'early_bird_price',
 label: 'Early Bird Price',
 type: 'number',
 },
 {
 key: 'early_bird_deadline',
 label: 'Early Bird Deadline',
 type: 'date',
 },
 {
 key: 'member_discount',
 label: 'Member Discount (%)',
 type: 'number',
 },
 {
 key: 'primary_instructor_id',
 label: 'Primary Instructor',
 type: 'select',
 options: [
 { label: 'No Instructor', value: '' },
 ...users.map((user) => ({ 
 label: user.full_name || user.email, 
 value: user.id 
 })),
 ],
 },
 {
 key: 'objectives',
 label: 'Learning Objectives',
 type: 'textarea',
 placeholder: 'List learning objectives, one per line',
 },
 {
 key: 'prerequisites',
 label: 'Prerequisites',
 type: 'textarea',
 placeholder: 'List prerequisites, one per line',
 },
 {
 key: 'materials_provided',
 label: 'Materials Provided',
 type: 'textarea',
 placeholder: 'List materials provided, one per line',
 },
 {
 key: 'materials_required',
 label: 'Materials Required',
 type: 'textarea',
 placeholder: 'List materials participants need to bring, one per line',
 },
 {
 key: 'agenda',
 label: 'Agenda',
 type: 'textarea',
 placeholder: 'Workshop agenda and schedule',
 },
 {
 key: 'has_assessment',
 label: 'Has Assessment',
 type: 'checkbox',
 },
 {
 key: 'assessment_type',
 label: 'Assessment Type',
 type: 'select',
 options: [
 { label: 'None', value: '' },
 { label: 'Quiz', value: 'quiz' },
 { label: 'Project', value: 'project' },
 { label: 'Presentation', value: 'presentation' },
 { label: 'Practical', value: 'practical' },
 ],
 },
 {
 key: 'certification_available',
 label: 'Certification Available',
 type: 'checkbox',
 },
 {
 key: 'certification_criteria',
 label: 'Certification Criteria',
 type: 'textarea',
 placeholder: 'Requirements for certification',
 },
 {
 key: 'internal_notes',
 label: 'Internal Notes',
 type: 'textarea',
 placeholder: 'Internal notes for staff',
 },
 {
 key: 'public_notes',
 label: 'Public Notes',
 type: 'textarea',
 placeholder: 'Public notes visible to participants',
 },
 {
 key: 'cancellation_policy',
 label: 'Cancellation Policy',
 type: 'textarea',
 placeholder: 'Cancellation and refund policy',
 },
 {
 key: 'tags',
 label: 'Tags',
 type: 'text',
 placeholder: 'Enter tags separated by commas',
 },
 ];

 const handleSubmit = async (data: Record<string, unknown>) => {
 try {
 setLoading(true);

 const tags = data.tags
 ? (data.tags as string)
 .split(',')
 .map((tag) => tag.trim())
 .filter(Boolean)
 : [];

 const objectives = data.objectives
 ? (data.objectives as string)
 .split('\n')
 .map((obj) => obj.trim())
 .filter(Boolean)
 : [];

 const prerequisites = data.prerequisites
 ? (data.prerequisites as string)
 .split('\n')
 .map((req) => req.trim())
 .filter(Boolean)
 : [];

 const materialsProvided = data.materials_provided
 ? (data.materials_provided as string)
 .split('\n')
 .map((mat) => mat.trim())
 .filter(Boolean)
 : [];

 const materialsRequired = data.materials_required
 ? (data.materials_required as string)
 .split('\n')
 .map((mat) => mat.trim())
 .filter(Boolean)
 : [];

 const payload = {
 project_id: data.project_id || null,
 event_id: data.event_id || null,
 title: data.title,
 description: data.description || null,
 category: data.category as WorkshopCategory,
 type: (data.type as WorkshopType) || 'workshop',
 status: (data.status as WorkshopStatus) || 'planning',
 skill_level: (data.skill_level as WorkshopSkillLevel) || 'all_levels',
 format: (data.format as WorkshopFormat) || 'in_person',
 start_date: data.start_date,
 end_date: data.end_date || null,
 duration_minutes: numberOrUndefined(data.duration_minutes),
 location: data.location || null,
 venue: data.venue || null,
 virtual_link: data.virtual_link || null,
 max_participants: numberOrUndefined(data.max_participants),
 min_participants: numberOrUndefined(data.min_participants),
 registration_opens_at: data.registration_opens_at || null,
 registration_deadline: data.registration_deadline || null,
 price: numberOrUndefined(data.price),
 currency: data.currency || null,
 early_bird_price: numberOrUndefined(data.early_bird_price),
 early_bird_deadline: data.early_bird_deadline || null,
 member_discount: numberOrUndefined(data.member_discount),
 primary_instructor_id: data.primary_instructor_id || null,
 objectives,
 prerequisites,
 materials_provided: materialsProvided,
 materials_required: materialsRequired,
 agenda: data.agenda || null,
 has_assessment: data.has_assessment || false,
 assessment_type: data.assessment_type || null,
 certification_available: data.certification_available || false,
 certification_criteria: data.certification_criteria || null,
 internal_notes: data.internal_notes || null,
 public_notes: data.public_notes || null,
 cancellation_policy: data.cancellation_policy || null,
 tags,
 metadata: {},
 };

 const response = await fetch('/api/v1/programming/workshops', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to create workshop');
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error('Error creating workshop:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Workshop"
 mode="create"
 fields={fields}
 loading={loading}
 onSave={handleSubmit}
 />
 );
}

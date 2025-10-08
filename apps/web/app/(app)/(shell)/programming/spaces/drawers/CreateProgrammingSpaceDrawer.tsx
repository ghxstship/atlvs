'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import AppDrawer, { type DrawerFieldConfig } from '@ghxstship/ui';
import type { SpaceProject, SpaceKind, SpaceStatus, SpaceAccessLevel } from '../types';

interface CreateProgrammingSpaceDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 currentUserId: string;
 projects: SpaceProject[];
 onSuccess: () => void;
}

const KIND_OPTIONS: Array<{ label: string; value: SpaceKind }> = [
 { label: 'Room', value: 'room' },
 { label: 'Green Room', value: 'green_room' },
 { label: 'Dressing Room', value: 'dressing_room' },
 { label: 'Meeting Room', value: 'meeting_room' },
 { label: 'Classroom', value: 'classroom' },
 { label: 'Studio', value: 'studio' },
 { label: 'Rehearsal Room', value: 'rehearsal_room' },
 { label: 'Storage', value: 'storage' },
 { label: 'Office', value: 'office' },
 { label: 'Lounge', value: 'lounge' },
 { label: 'Kitchen', value: 'kitchen' },
 { label: 'Bathroom', value: 'bathroom' },
 { label: 'Corridor', value: 'corridor' },
 { label: 'Lobby', value: 'lobby' },
 { label: 'Stage', value: 'stage' },
 { label: 'Backstage', value: 'backstage' },
 { label: 'Loading Dock', value: 'loading_dock' },
 { label: 'Parking', value: 'parking' },
 { label: 'Outdoor', value: 'outdoor' },
 { label: 'Other', value: 'other' },
];

const STATUS_OPTIONS: Array<{ label: string; value: SpaceStatus }> = [
 { label: 'Available', value: 'available' },
 { label: 'Occupied', value: 'occupied' },
 { label: 'Reserved', value: 'reserved' },
 { label: 'Maintenance', value: 'maintenance' },
 { label: 'Cleaning', value: 'cleaning' },
 { label: 'Setup', value: 'setup' },
 { label: 'Breakdown', value: 'breakdown' },
 { label: 'Out of Service', value: 'out_of_service' },
];

const ACCESS_LEVEL_OPTIONS: Array<{ label: string; value: SpaceAccessLevel }> = [
 { label: 'Public', value: 'public' },
 { label: 'Restricted', value: 'restricted' },
 { label: 'Staff Only', value: 'staff_only' },
 { label: 'Talent Only', value: 'talent_only' },
 { label: 'VIP', value: 'vip' },
 { label: 'Crew Only', value: 'crew_only' },
 { label: 'Private', value: 'private' },
];

const AMENITY_FIELDS: Array<{ key: string; label: string }> = [
 { key: 'amenity_wifi', label: 'WiFi' },
 { key: 'amenity_air_conditioning', label: 'Air Conditioning' },
 { key: 'amenity_heating', label: 'Heating' },
 { key: 'amenity_sound_system', label: 'Sound System' },
 { key: 'amenity_projection', label: 'Projection' },
 { key: 'amenity_whiteboard', label: 'Whiteboard' },
 { key: 'amenity_tables', label: 'Tables' },
 { key: 'amenity_chairs', label: 'Chairs' },
 { key: 'amenity_power_outlets', label: 'Power Outlets' },
 { key: 'amenity_windows', label: 'Windows' },
 { key: 'amenity_private_bathroom', label: 'Private Bathroom' },
 { key: 'amenity_kitchenette', label: 'Kitchenette' },
 { key: 'amenity_storage', label: 'Storage' },
 { key: 'amenity_security_camera', label: 'Security Camera' },
 { key: 'amenity_access_control', label: 'Access Control' },
];

const numberOrUndefined = (value: unknown) => {
 if (value === undefined || value === null || value === '') {
 return undefined;
 }
 const parsed = Number(value);
 return Number.isNaN(parsed) ? undefined : parsed;
};

export default function CreateProgrammingSpaceDrawer({
 open,
 onOpenChange,
 orgId,
 currentUserId,
 projects,
 onSuccess
}: CreateProgrammingSpaceDrawerProps) {
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: 'project_id',
 label: 'Project',
 type: 'select',
 options: [
 { label: 'No Project', value: '' },
 ...projects.map((project) => ({ label: project.name, value: project.id })),
 ]
 },
 {
 key: 'name',
 label: 'Space Name',
 type: 'text',
 required: true,
 placeholder: 'Enter space name'
 },
 {
 key: 'kind',
 label: 'Space Type',
 type: 'select',
 required: true,
 options: KIND_OPTIONS.map((option) => ({ label: option.label, value: option.value }))
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value }))
 },
 {
 key: 'access_level',
 label: 'Access Level',
 type: 'select',
 options: ACCESS_LEVEL_OPTIONS.map((option) => ({ label: option.label, value: option.value }))
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 placeholder: 'Describe this space and its primary use'
 },
 {
 key: 'location',
 label: 'Location',
 type: 'text',
 placeholder: 'Enter venue or location details'
 },
 {
 key: 'building',
 label: 'Building',
 type: 'text'
 },
 {
 key: 'floor',
 label: 'Floor',
 type: 'text'
 },
 {
 key: 'room_number',
 label: 'Room Number',
 type: 'text'
 },
 {
 key: 'capacity',
 label: 'Capacity',
 type: 'number'
 },
 {
 key: 'max_capacity',
 label: 'Max Capacity',
 type: 'number'
 },
 {
 key: 'area_sqft',
 label: 'Area (sq ft)',
 type: 'number'
 },
 {
 key: 'is_bookable',
 label: 'Available for Booking',
 type: 'checkbox'
 },
 {
 key: 'hourly_rate',
 label: 'Hourly Rate ($)',
 type: 'number'
 },
 {
 key: 'daily_rate',
 label: 'Daily Rate ($)',
 type: 'number'
 },
 {
 key: 'setup_time',
 label: 'Setup Time (minutes)',
 type: 'number'
 },
 {
 key: 'breakdown_time',
 label: 'Breakdown Time (minutes)',
 type: 'number'
 },
 {
 key: 'cleaning_time',
 label: 'Cleaning Time (minutes)',
 type: 'number'
 },
 {
 key: 'contact_person',
 label: 'Contact Person',
 type: 'text'
 },
 {
 key: 'contact_phone',
 label: 'Contact Phone',
 type: 'text'
 },
 {
 key: 'contact_email',
 label: 'Contact Email',
 type: 'email'
 },
 ...AMENITY_FIELDS.map(({ key, label }) => ({
 key,
 label,
 type: 'checkbox' as const
 })),
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

 const tags = data.tags
 ? (data.tags as string)
 .split(',')
 .map((tag) => tag.trim())
 .filter(Boolean)
 : [];

 const amenities = AMENITY_FIELDS.reduce<Record<string, boolean>((acc, amenity) => {
 acc[amenity.key.replace('amenity_', '')] = Boolean(data[amenity.key]);
 return acc;
 }, {});

 const payload = {
 project_id: data.project_id || null,
 name: data.name,
 kind: data.kind as SpaceKind,
 status: (data.status as SpaceStatus) ?? 'available',
 access_level: (data.access_level as SpaceAccessLevel) ?? 'public',
 description: data.description || null,
 location: data.location || null,
 building: data.building || null,
 floor: data.floor || null,
 room_number: data.room_number || null,
 capacity: numberOrUndefined(data.capacity),
 max_capacity: numberOrUndefined(data.max_capacity),
 area_sqft: numberOrUndefined(data.area_sqft),
 is_bookable: data.is_bookable ?? true,
 hourly_rate: numberOrUndefined(data.hourly_rate),
 daily_rate: numberOrUndefined(data.daily_rate),
 setup_time: numberOrUndefined(data.setup_time),
 breakdown_time: numberOrUndefined(data.breakdown_time),
 cleaning_time: numberOrUndefined(data.cleaning_time),
 contact_person: data.contact_person || null,
 contact_phone: data.contact_phone || null,
 contact_email: data.contact_email || null,
 amenities,
 technical_specs: {},
 equipment_provided: [],
 equipment_allowed: [],
 equipment_prohibited: [],
 images: [],
 documents: [],
 tags,
 metadata: {}
 };

 const response = await fetch('/api/v1/programming/spaces', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to create space');
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error('Error creating space:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Space"
 mode="create"
 fields={fields}
 loading={loading}
 onSave={handleSubmit}
 />
 );
}

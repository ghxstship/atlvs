'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useMemo, useState } from 'react';
import AppDrawer, { type DrawerFieldConfig } from '@ghxstship/ui';
import type {
 ProgrammingSpace,
 SpaceProject,
 SpaceKind,
 SpaceStatus,
 SpaceAccessLevel,
} from '../types';

interface EditProgrammingSpaceDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 space: ProgrammingSpace;
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
 { key: 'amenity_lighting_control', label: 'Lighting Control' },
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

export default function EditProgrammingSpaceDrawer({
 open,
 onOpenChange,
 space,
 orgId,
 currentUserId,
 projects,
 onSuccess,
}: EditProgrammingSpaceDrawerProps) {
 const [loading, setLoading] = useState(false);

 const initialAmenities = useMemo(() => {
 const amenities = space.amenities || {};
 return AMENITY_FIELDS.reduce<Record<string, boolean>((acc, field) => {
 const key = field.key.replace('amenity_', '');
 acc[field.key] = Boolean(amenities[key as keyof typeof amenities]);
 return acc;
 }, {});
 }, [space.amenities]);

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
 key: 'name',
 label: 'Space Name',
 type: 'text',
 required: true,
 },
 {
 key: 'kind',
 label: 'Space Type',
 type: 'select',
 required: true,
 options: KIND_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'access_level',
 label: 'Access Level',
 type: 'select',
 options: ACCESS_LEVEL_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 },
 {
 key: 'location',
 label: 'Location',
 type: 'text',
 },
 {
 key: 'building',
 label: 'Building',
 type: 'text',
 },
 {
 key: 'floor',
 label: 'Floor',
 type: 'text',
 },
 {
 key: 'room_number',
 label: 'Room Number',
 type: 'text',
 },
 {
 key: 'capacity',
 label: 'Capacity',
 type: 'number',
 },
 {
 key: 'max_capacity',
 label: 'Max Capacity',
 type: 'number',
 },
 {
 key: 'area_sqft',
 label: 'Area (sq ft)',
 type: 'number',
 },
 {
 key: 'is_bookable',
 label: 'Available for Booking',
 type: 'checkbox',
 },
 {
 key: 'hourly_rate',
 label: 'Hourly Rate ($)',
 type: 'number',
 },
 {
 key: 'daily_rate',
 label: 'Daily Rate ($)',
 type: 'number',
 },
 {
 key: 'setup_time',
 label: 'Setup Time (minutes)',
 type: 'number',
 },
 {
 key: 'breakdown_time',
 label: 'Breakdown Time (minutes)',
 type: 'number',
 },
 {
 key: 'cleaning_time',
 label: 'Cleaning Time (minutes)',
 type: 'number',
 },
 {
 key: 'contact_person',
 label: 'Contact Person',
 type: 'text',
 },
 {
 key: 'contact_phone',
 label: 'Contact Phone',
 type: 'text',
 },
 {
 key: 'contact_email',
 label: 'Contact Email',
 type: 'email',
 },
 ...AMENITY_FIELDS.map(({ key, label }) => ({
 key,
 label,
 type: 'checkbox' as const,
 })),
 {
 key: 'tags',
 label: 'Tags',
 type: 'text',
 },
 {
 key: 'equipment_provided',
 label: 'Equipment Provided',
 type: 'textarea',
 placeholder: 'List equipment provided, one per line',
 },
 {
 key: 'equipment_allowed',
 label: 'Equipment Allowed',
 type: 'textarea',
 placeholder: 'List equipment allowed, one per line',
 },
 {
 key: 'equipment_prohibited',
 label: 'Equipment Prohibited',
 type: 'textarea',
 placeholder: 'List equipment prohibited, one per line',
 },
 ];

 const initialData = {
 id: space.id,
 project_id: space.project_id || '',
 name: space.name,
 kind: space.kind,
 status: space.status,
 access_level: space.access_level,
 description: space.description || '',
 location: space.location || '',
 building: space.building || '',
 floor: space.floor || '',
 room_number: space.room_number || '',
 capacity: space.capacity ?? '',
 max_capacity: space.max_capacity ?? '',
 area_sqft: space.area_sqft ?? '',
 is_bookable: space.is_bookable,
 hourly_rate: space.hourly_rate ?? '',
 daily_rate: space.daily_rate ?? '',
 setup_time: space.setup_time ?? '',
 breakdown_time: space.breakdown_time ?? '',
 cleaning_time: space.cleaning_time ?? '',
 contact_person: space.contact_person || '',
 contact_phone: space.contact_phone || '',
 contact_email: space.contact_email || '',
 tags: space.tags?.join(', ') || '',
 equipment_provided: space.equipment_provided?.join('\n') || '',
 equipment_allowed: space.equipment_allowed?.join('\n') || '',
 equipment_prohibited: space.equipment_prohibited?.join('\n') || '',
 ...initialAmenities,
 };

 const handleSubmit = async (data: Record<string, unknown>) => {
 try {
 setLoading(true);

 const tags = data.tags
 ? (data.tags as string)
 .split(',')
 .map((tag) => tag.trim())
 .filter(Boolean)
 : undefined;

 const amenities = AMENITY_FIELDS.reduce<Record<string, boolean>((acc, amenity) => {
 acc[amenity.key.replace('amenity_', '')] = Boolean(data[amenity.key]);
 return acc;
 }, {});

 const payload: Record<string, unknown> = {
 project_id: data.project_id || null,
 name: data.name,
 kind: data.kind as SpaceKind,
 status: data.status as SpaceStatus,
 access_level: data.access_level as SpaceAccessLevel,
 description: data.description || null,
 location: data.location || null,
 building: data.building || null,
 floor: data.floor || null,
 room_number: data.room_number || null,
 capacity: numberOrUndefined(data.capacity),
 max_capacity: numberOrUndefined(data.max_capacity),
 area_sqft: numberOrUndefined(data.area_sqft),
 is_bookable: data.is_bookable ?? false,
 hourly_rate: numberOrUndefined(data.hourly_rate),
 daily_rate: numberOrUndefined(data.daily_rate),
 setup_time: numberOrUndefined(data.setup_time),
 breakdown_time: numberOrUndefined(data.breakdown_time),
 cleaning_time: numberOrUndefined(data.cleaning_time),
 contact_person: data.contact_person || null,
 contact_phone: data.contact_phone || null,
 contact_email: data.contact_email || null,
 amenities,
 equipment_provided: data.equipment_provided
 ? (data.equipment_provided as string)
 .split('\n')
 .map((item) => item.trim())
 .filter(Boolean)
 : undefined,
 equipment_allowed: data.equipment_allowed
 ? (data.equipment_allowed as string)
 .split('\n')
 .map((item) => item.trim())
 .filter(Boolean)
 : undefined,
 equipment_prohibited: data.equipment_prohibited
 ? (data.equipment_prohibited as string)
 .split('\n')
 .map((item) => item.trim())
 .filter(Boolean)
 : undefined,
 tags,
 };

 const response = await fetch(`/api/v1/programming/spaces/${space.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to update space');
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error('Error updating space:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Space"
 mode="edit"
 fields={fields}
 record={initialData}
 loading={loading}
 onSave={handleSubmit}
 />
 );
}

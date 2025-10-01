'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Checkbox,
 Input,
 Label,
 Modal,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Skeleton,
 Textarea,
 Toggle,
 useToastContext,
} from '@ghxstship/ui';
import {
 createRole,
 deleteRole,
 fetchRoles,
 RoleRecord,
 updateRole,
} from '@/lib/services/settingsRolesClient';
import {
 fetchOrganizationMembers,
 OrganizationMember,
} from '@/lib/services/settingsOrganizationClient';

interface PermissionState {
 [resource: string]: Set<string>;
}

const ROLE_SCOPE_OPTIONS = [
 { value: 'owner', label: 'Owners' },
 { value: 'admin', label: 'Admins' },
 { value: 'manager', label: 'Managers' },
 { value: 'contributor', label: 'Contributors' },
 { value: 'viewer', label: 'Viewers' },
];

function buildPermissionState(permissions: Record<string, string[]>): PermissionState {
 const state: PermissionState = {};
 Object.entries(permissions || {}).forEach(([resource, actions]) => {
 state[resource] = new Set(actions);
 });
 return state;
}

function exportPermissionState(state: PermissionState): Record<string, string[]> {
 return Object.entries(state).reduce<Record<string, string[]>((acc, [resource, actions]) => {
 if (actions.size > 0) {
 acc[resource] = Array.from(actions).sort();
 }
 return acc;
 }, {});
}

function mergeResourceMatrix(roles: RoleRecord[]): Record<string, Set<string> {
 const matrix: Record<string, Set<string> = {};
 roles.forEach((role) => {
 Object.entries(role.permissions || {}).forEach(([resource, actions]) => {
 if (!matrix[resource]) {
 matrix[resource] = new Set();
 }
 actions.forEach((action) => matrix[resource].add(action));
 });
 });
 return matrix;
}

const DEFAULT_ROLE_NAME = 'Untitled Role';

export default function PermissionsSettingsClient() {
 const { toast } = useToastContext();
 const [roles, setRoles] = useState<RoleRecord[]>([]);
 const [members, setMembers] = useState<OrganizationMember[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [saving, setSaving] = useState<boolean>(false);
 const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
 const [deleteRoleId, setDeleteRoleId] = useState<RoleRecord | null>(null);
 const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
 const [selectedMember, setSelectedMember] = useState<string>('');

 const [roleName, setRoleName] = useState<string>('');
 const [roleDescription, setRoleDescription] = useState<string>('');
 const [permissionState, setPermissionState] = useState<PermissionState>({});

 const matrix = useMemo(() => mergeResourceMatrix(roles), [roles]);
 const resources = useMemo(() => Object.keys(matrix).sort(), [matrix]);

 const load = async () => {
 try {
 setLoading(true);
 const [rolesResponse, membersResponse] = await Promise.all([
 fetchRoles({ includeSystem: true }),
 fetchOrganizationMembers(),
 ]);
 setRoles(rolesResponse.roles);
 setMembers(membersResponse.members);
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to load permissions data';
 toast.error('Failed to load permissions', undefined, { description: message });
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, []);

 const resetForm = () => {
 setRoleName('');
 setRoleDescription('');
 setPermissionState({});
 setSelectedMember('');
 setEditingRole(null);
 };

 const openCreateModal = () => {
 resetForm();
 setCreateModalOpen(true);
 };

 const openEditModal = (role: RoleRecord) => {
 setEditingRole(role);
 setRoleName(role.name || DEFAULT_ROLE_NAME);
 setRoleDescription(role.description ?? '');
 setPermissionState(buildPermissionState(role.permissions || {}));
 setSelectedMember('');
 setCreateModalOpen(true);
 };

 const togglePermission = (resource: string, action: string, checked: boolean) => {
 setPermissionState((prev: unknown) => {
 const next = { ...prev };
 if (!next[resource]) {
 next[resource] = new Set();
 }
 if (checked) {
 next[resource].add(action);
 } else {
 next[resource].delete(action);
 }
 return next;
 });
 };

 const handleSubmitRole = async () => {
 try {
 setSaving(true);
 const payload = {
 name: roleName || DEFAULT_ROLE_NAME,
 description: roleDescription || undefined,
 permissions: exportPermissionState(permissionState),
 };

 if (editingRole) {
 await updateRole({ id: editingRole.id, ...payload });
 toast.success('Role updated');
 } else {
 await createRole(payload);
 toast.success('Role created');
 }

 setCreateModalOpen(false);
 resetForm();
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to save role';
 toast.error('Save failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const handleDeleteRole = async () => {
 if (!deleteRoleId) return;
 try {
 setSaving(true);
 await deleteRole(deleteRoleId.id);
 toast.success('Role deleted');
 setDeleteRoleId(null);
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to delete role';
 toast.error('Delete failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const selectedMemberName = useMemo(() => {
 if (!selectedMember) return null;
 const member = members.find((m) => m.userId === selectedMember);
 return member?.fullName || member?.email || selectedMember;
 }, [members, selectedMember]);

 const renderRoleCard = (role: RoleRecord) => {
 const isSystem = role.isSystem;
 return (
 <Card key={role.id} className="border">
 <CardHeader className="flex flex-col gap-sm md:flex-row md:items-start md:justify-between">
 <div className="space-y-xs">
 <div className="flex items-center gap-sm">
 <CardTitle>{role.name}</CardTitle>
 {isSystem ? (
 <Badge variant="secondary">System</Badge>
 ) : (
 <Badge variant="outline">Custom</Badge>
 )}
 </div>
 {role.description ? (
 <p className="text-body-sm text-muted-foreground">{role.description}</p>
 ) : null}
 <p className="text-body-xs text-muted-foreground">
 Assigned Users: {role.assignedUsers ?? 0}
 </p>
 </div>
 <div className="flex gap-sm">
 <Button
 variant="outline"
 onClick={() => openEditModal(role)}
 disabled={isSystem}
 >
 Edit Role
 </Button>
 <Button
 variant="outline"
 onClick={() => setDeleteRoleId(role)}
 disabled={isSystem || (role.assignedUsers ?? 0) > 0}
 >
 Delete
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="min-w-full border-collapse text-left text-body-sm">
 <thead>
 <tr>
 <th className="border-b border-border px-sm py-xs">Resource</th>
 <th className="border-b border-border px-sm py-xs">Actions</th>
 </tr>
 </thead>
 <tbody>
 {Object.entries(role.permissions || {}).map(([resource, actions]) => (
 <tr key={resource}>
 <td className="border-b border-border px-sm py-xs align-top font-medium">{resource}</td>
 <td className="border-b border-border px-sm py-xs align-top">
 <div className="flex flex-wrap gap-xs">
 {actions.map((action) => (
 <Badge key={`${resource}-${action}`} variant="outline">
 {action}
 </Badge>
 ))}
 </div>
 </td>
 </tr>
 ))}
 {Object.keys(role.permissions || {}).length === 0 ? (
 <tr>
 <td colSpan={2} className="px-sm py-sm text-muted-foreground">
 No explicit permissions. Role inherits default organization policy.
 </td>
 </tr>
 ) : null}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 );
 };

 if (loading) {
 return (
 <div className="space-y-md">
 <Skeleton className="h-icon-2xl w-container-xs" />
 <div className="space-y-sm">
 <Skeleton className="h-component-lg w-full" />
 <Skeleton className="h-component-lg w-full" />
 <Skeleton className="h-component-lg w-full" />
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <Card>
 <CardHeader className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div>
 <CardTitle>Role-Based Access Control</CardTitle>
 <p className="text-body-sm text-muted-foreground">
 Manage system and custom roles across GHXSTSHIP. Custom roles let you tailor fine-grained permissions per resource.
 </p>
 </div>
 <Button onClick={openCreateModal}>Create Custom Role</Button>
 </CardHeader>
 </Card>

 <div className="space-y-md">
 {roles.map(renderRoleCard)}
 {roles.length === 0 ? (
 <Card>
 <CardContent className="py-lg text-center text-body-sm text-muted-foreground">
 No roles found. Create a custom role to get started.
 </CardContent>
 </Card>
 ) : null}
 </div>

 <Modal
 open={createModalOpen}
 onClose={() => {
 setCreateModalOpen(false);
 resetForm();
 }}
 title={editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
 description="Select the permissions this role should grant across GHXSTSHIP modules."
 >
 <div className="space-y-lg">
 <div className="space-y-sm">
 <Label htmlFor="role-name">Role Name</Label>
 <Input
 
 value={roleName}
 onChange={(event) => setRoleName(event.target.value)}
 placeholder="e.g. Production Supervisor"
 />
 </div>
 <div className="space-y-sm">
 <Label htmlFor="role-description">Description</Label>
 <Textarea
 
 rows={3}
 value={roleDescription}
 onChange={(event) => setRoleDescription(event.target.value)}
 placeholder="Describe when to assign this role."
 />
 </div>

 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <Label>Permissions</Label>
 <p className="text-body-xs text-muted-foreground">
 Toggle actions per resource. Only checked actions will be granted.
 </p>
 </div>
 <div className="space-y-md">
 {resources.length === 0 ? (
 <div className="rounded-md border border-dashed border-border px-md py-lg text-center text-body-sm text-muted-foreground">
 No resource matrix detected yet. Create the role with a description first to define permissions.
 </div>
 ) : null}
 {resources.map((resource) => {
 const actions = Array.from(matrix[resource] ?? []).sort();
 return (
 <div key={resource} className="rounded-lg border p-md space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <h3 className="font-medium capitalize">{resource.replace(/_/g, ' ')}</h3>
 <Badge variant="outline">{actions.length} actions</Badge>
 </div>
 <Toggle
 checked={(permissionState[resource]?.size || 0) === actions.length}
 onChange={(event) => {
 const checked = event.target.checked;
 setPermissionState((prev: unknown) => {
 const next = { ...prev };
 if (!next[resource]) {
 next[resource] = new Set();
 }
 if (checked) {
 actions.forEach((action) => next[resource].add(action));
 } else {
 next[resource].clear();
 }
 return next;
 });
 }}
 />
 </div>
 <div className="grid grid-cols-2 gap-sm md:grid-cols-3">
 {actions.map((action) => {
 const checked = permissionState[resource]?.has(action) ?? false;
 return (
 <label key={`${resource}-${action}`} className="flex items-center gap-xs text-body-sm">
 <Checkbox
 checked={checked}
 onChange={(event) => togglePermission(resource, action, event.target.checked)}
 />
 <span className="capitalize">{action.replace(/_/g, ' ')}</span>
 </label>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="member-preview">Preview Assignment</Label>
 <Select value={selectedMember} onValueChange={setSelectedMember}>
 <SelectTrigger >
 <SelectValue placeholder="Select member to preview" />
 </SelectTrigger>
 <SelectContent>
 {members.map((member) => (
 <SelectItem key={member.userId} value={member.userId}>
 {member.fullName || member.email || member.userId}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {selectedMemberName ? (
 <p className="text-body-xs text-muted-foreground">
 Assigning <strong>{selectedMemberName}</strong> will immediately grant the checked actions.
 </p>
 ) : (
 <p className="text-body-xs text-muted-foreground">
 Select a member to preview how this role would apply to them.
 </p>
 )}
 </div>

 <div className="flex justify-end gap-sm">
 <Button
 variant="outline"
 onClick={() => {
 setCreateModalOpen(false);
 resetForm();
 }}
 disabled={saving}
 >
 Cancel
 </Button>
 <Button onClick={handleSubmitRole} disabled={saving}>
 {saving ? 'Saving…' : editingRole ? 'Update Role' : 'Create Role'}
 </Button>
 </div>
 </div>
 </Modal>

 <Modal
 open={Boolean(deleteRoleId)}
 onClose={() => setDeleteRoleId(null)}
 title="Delete custom role?"
 description="Deleting this role removes its permission grants. This cannot be undone."
 >
 <div className="space-y-md">
 <p className="text-body-sm text-muted-foreground">
 Role: <strong>{deleteRoleId?.name}</strong>
 </p>
 {deleteRoleId?.assignedUsers ? (
 <p className="text-body-xs text-muted-foreground">
 This role is assigned to {deleteRoleId.assignedUsers} users. Reassign them before deletion.
 </p>
 ) : null}
 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => setDeleteRoleId(null)} disabled={saving}>
 Cancel
 </Button>
 <Button variant="destructive" onClick={handleDeleteRole} disabled={saving}>
 {saving ? 'Deleting…' : 'Delete Role'}
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

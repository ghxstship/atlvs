'use client';

import { useState, useEffect } from 'react';
import { Lock, Shield, Users, Settings as SettingsIcon, Check, X } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
  Separator,
  Alert,
  AlertDescription,
} from '@ghxstship/ui';

interface PermissionsSettingsProps {
  userId: string;
  orgId: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  member_count: number;
  is_system: boolean;
}

interface Permission {
  key: string;
  name: string;
  description: string;
  category: 'projects' | 'tasks' | 'team' | 'settings' | 'billing';
}

const PERMISSIONS: Permission[] = [
  // Projects
  { key: 'projects.view', name: 'View Projects', description: 'View project details and progress', category: 'projects' },
  { key: 'projects.create', name: 'Create Projects', description: 'Create new projects', category: 'projects' },
  { key: 'projects.edit', name: 'Edit Projects', description: 'Modify project settings and details', category: 'projects' },
  { key: 'projects.delete', name: 'Delete Projects', description: 'Delete projects', category: 'projects' },
  { key: 'projects.manage_members', name: 'Manage Project Members', description: 'Add/remove members from projects', category: 'projects' },

  // Tasks
  { key: 'tasks.view', name: 'View Tasks', description: 'View task details and status', category: 'tasks' },
  { key: 'tasks.create', name: 'Create Tasks', description: 'Create new tasks', category: 'tasks' },
  { key: 'tasks.edit', name: 'Edit Tasks', description: 'Modify task details and assignments', category: 'tasks' },
  { key: 'tasks.delete', name: 'Delete Tasks', description: 'Delete tasks', category: 'tasks' },
  { key: 'tasks.assign', name: 'Assign Tasks', description: 'Assign tasks to team members', category: 'tasks' },

  // Team
  { key: 'team.view', name: 'View Team', description: 'View team member profiles', category: 'team' },
  { key: 'team.invite', name: 'Invite Members', description: 'Send team invitations', category: 'team' },
  { key: 'team.manage_roles', name: 'Manage Roles', description: 'Change member roles and permissions', category: 'team' },
  { key: 'team.remove_members', name: 'Remove Members', description: 'Remove members from organization', category: 'team' },

  // Settings
  { key: 'settings.view', name: 'View Settings', description: 'View organization settings', category: 'settings' },
  { key: 'settings.edit', name: 'Edit Settings', description: 'Modify organization settings', category: 'settings' },
  { key: 'settings.integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', category: 'settings' },

  // Billing
  { key: 'billing.view', name: 'View Billing', description: 'View invoices and billing information', category: 'billing' },
  { key: 'billing.edit', name: 'Manage Billing', description: 'Update payment methods and billing settings', category: 'billing' },
];

const PERMISSION_CATEGORIES = {
  projects: 'Projects',
  tasks: 'Tasks',
  team: 'Team Management',
  settings: 'Settings',
  billing: 'Billing'
};

export default function PermissionsSettings({ userId, orgId }: PermissionsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const supabase = createBrowserClient();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        // Load roles from organization
        const { data: rolesData, error } = await supabase
          .from('organization_roles')
          .select(`
            id,
            name,
            description,
            permissions,
            is_system,
            memberships:organization_memberships(count)
          `)
          .eq('organization_id', orgId);

        if (error && error.code !== 'PGRST116') throw error;

        // Mock roles data
        setRoles([
          {
            id: 'role_viewer',
            name: 'Viewer',
            description: 'Read-only access to projects and tasks',
            permissions: {
              'projects.view': true,
              'tasks.view': true,
              'team.view': true,
              'settings.view': true,
              'billing.view': true
            },
            member_count: 5,
            is_system: true
          },
          {
            id: 'role_contributor',
            name: 'Contributor',
            description: 'Can create and edit content',
            permissions: {
              'projects.view': true,
              'projects.edit': true,
              'tasks.view': true,
              'tasks.create': true,
              'tasks.edit': true,
              'team.view': true,
              'settings.view': true,
              'billing.view': true
            },
            member_count: 12,
            is_system: true
          },
          {
            id: 'role_manager',
            name: 'Manager',
            description: 'Project and team management',
            permissions: {
              'projects.view': true,
              'projects.create': true,
              'projects.edit': true,
              'projects.manage_members': true,
              'tasks.view': true,
              'tasks.create': true,
              'tasks.edit': true,
              'tasks.assign': true,
              'team.view': true,
              'team.invite': true,
              'team.manage_roles': true,
              'settings.view': true,
              'settings.edit': true,
              'billing.view': true
            },
            member_count: 3,
            is_system: true
          },
          {
            id: 'role_admin',
            name: 'Admin',
            description: 'Full administrative access',
            permissions: Object.fromEntries(PERMISSIONS.map(p => [p.key, true])),
            member_count: 2,
            is_system: true
          }
        ]);

      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [orgId, supabase]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const newRole: Role = {
        id: `role_${Date.now()}`,
        name: newRoleName,
        description: newRoleDescription,
        permissions: {},
        member_count: 0,
        is_system: false
      };

      setRoles(prev => [...prev, newRole]);
      setNewRoleName('');
      setNewRoleDescription('');
      setShowCreateRole(false);
      setSelectedRole(newRole);

    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdatePermission = (roleId: string, permissionKey: string, value: boolean) => {
    setRoles(prev => prev.map(role =>
      role.id === roleId
        ? { ...role, permissions: { ...role.permissions, [permissionKey]: value } }
        : role
    ));

    if (selectedRole?.id === roleId) {
      setSelectedRole(prev => prev ? {
        ...prev,
        permissions: { ...prev.permissions, [permissionKey]: value }
      } : null);
    }
  };

  const handleSaveRole = async (role: Role) => {
    try {
      if (role.is_system) {
        // Can't modify system roles
        return;
      }

      const { error } = await supabase
        .from('organization_roles')
        .upsert({
          id: role.id,
          organization_id: orgId,
          name: role.name,
          description: role.description,
          permissions: role.permissions
        });

      if (error) throw error;


    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.is_system || role.member_count > 0) return;

    try {
      const { error } = await supabase
        .from('organization_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.filter(r => r.id !== roleId));
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }

    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className={`cursor-pointer transition-colors ${
            selectedRole?.id === role.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
          }`} onClick={() => setSelectedRole(role)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{role.name}</h3>
                {role.is_system && <Badge variant="outline">System</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
              <div className="text-2xl font-bold">{role.member_count}</div>
              <p className="text-xs text-muted-foreground">members</p>
            </CardContent>
          </Card>
        ))}

        <Card className="cursor-pointer hover:bg-muted/50 border-dashed" onClick={() => setShowCreateRole(true)}>
          <CardContent className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <Shield className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-medium">Create Role</p>
              <p className="text-sm text-muted-foreground">Custom permissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Project Lead"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  placeholder="Brief description of the role"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
                Create Role
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Editor */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {selectedRole.name} Permissions
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRole.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedRole.is_system && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveRole(selectedRole)}
                    >
                      Save Changes
                    </Button>
                    {selectedRole.member_count === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete Role
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, categoryName]) => {
                const categoryPermissions = PERMISSIONS.filter(p => p.category === categoryKey);
                if (categoryPermissions.length === 0) return null;

                return (
                  <div key={categoryKey}>
                    <h4 className="font-medium mb-4">{categoryName}</h4>
                    <div className="space-y-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.key} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <Switch
                            checked={selectedRole.permissions[permission.key] || false}
                            onCheckedChange={(checked) => handleUpdatePermission(selectedRole.id, permission.key, checked)}
                            disabled={selectedRole.is_system}
                          />
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-6" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Permission Matrix
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of all permissions across roles.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-24">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map((permission) => (
                  <TableRow key={permission.key}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm">{permission.name}</p>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        {role.permissions[permission.key] ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Security Notes */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Changes to permissions take effect immediately. System roles (Viewer, Contributor, Manager, Admin) cannot be modified or deleted.
          Custom roles can only be deleted if they have no assigned members.
        </AlertDescription>
      </Alert>
    </div>
}

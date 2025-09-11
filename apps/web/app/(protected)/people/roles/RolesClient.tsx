'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  created_at: string;
}

interface RolesClientProps {
  orgId: string;
}

export default function RolesClient({ orgId }: RolesClientProps) {
  const t = useTranslations('people.roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    department: '',
    level: '' as '' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
    permissions: [] as string[]
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    loadRoles();
  }, [orgId, selectedDepartment, selectedLevel]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('people_roles')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true });

      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment);
      }

      if (selectedLevel) {
        query = query.eq('level', selectedLevel);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    try {
      const { data, error } = await supabase
        .from('people_roles')
        .insert([{
          organization_id: orgId,
          name: newRole.name,
          description: newRole.description || null,
          department: newRole.department || null,
          level: newRole.level || null,
          permissions: newRole.permissions.length > 0 ? newRole.permissions : null
        }])
        .select()
        .single();

      if (error) throw error;

      setRoles([...roles, data]);
      setShowCreateForm(false);
      setNewRole({
        name: '',
        description: '',
        department: '',
        level: '',
        permissions: []
      });
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const filteredRoles = roles.filter(role => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query) ||
      role.department?.toLowerCase().includes(query)
    );
  });

  const departments = [...new Set(roles.map(r => r.department).filter(Boolean))];

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'entry': return 'bg-success/10 text-success';
      case 'mid': return 'bg-primary/10 text-primary';
      case 'senior': return 'bg-accent/10 text-accent';
      case 'lead': return 'bg-warning/10 text-warning';
      case 'executive': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'entry': return '●';
      case 'mid': return '●●';
      case 'senior': return '●●●';
      case 'lead': return '●●●●';
      case 'executive': return '●●●●●';
      default: return '○';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card title={t('title')}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={t('title')}>
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="text-muted-foreground">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="text-muted-foreground">All Levels</option>
                <option value="entry">{t('entry')}</option>
                <option value="mid">{t('mid')}</option>
                <option value="senior">{t('senior')}</option>
                <option value="lead">{t('lead')}</option>
                <option value="executive">{t('executive')}</option>
              </select>
            </div>

            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addRole')}
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="border border-border rounded-lg p-4 bg-muted/50">
              <h3 className="text-lg font-medium text-foreground mb-2">No roles found</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder={t('roleName')}
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                />
                <Input
                  placeholder={t('department')}
                  value={newRole.department}
                  onChange={(e) => setNewRole({...newRole, department: e.target.value})}
                />
                <select
                  value={newRole.level}
                  onChange={(e) => setNewRole({...newRole, level: e.target.value as any})}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('selectLevel')}</option>
                  <option value="entry">{t('entry')}</option>
                  <option value="mid">{t('mid')}</option>
                  <option value="senior">{t('senior')}</option>
                  <option value="lead">{t('lead')}</option>
                  <option value="executive">{t('executive')}</option>
                </select>
                <div></div>
                <div className="md:col-span-2">
                  <textarea
                    placeholder={t('description')}
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={createRole} disabled={!newRole.name}>
                  {t('create')}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            {t('resultsCount', { count: filteredRoles.length, total: roles.length })}
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {role.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">{role.level}</span>
                      <Badge className={getLevelColor(role.level)}>
                        {getLevelIcon(role.level)} {role.level}
                      </Badge>
                    </div>
                  )}

                  {role.department && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      <Badge className="bg-primary/10 text-primary">
                        {role.department}
                      </Badge>
                    </div>
                  )}
                </div>

                {role.description && (
                  <p className="text-xs text-muted-foreground mt-2">Create your first role to get started.</p>
                )}

                {role.permissions && role.permissions.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {t('permissions')} ({role.permissions.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} className="bg-muted text-muted-foreground text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge className="bg-muted text-muted-foreground text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noRolesFound')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

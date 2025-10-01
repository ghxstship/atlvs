'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, UnifiedInput, Badge } from '@ghxstship/ui';
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
      case 'entry': return 'bg-success/10 color-success';
      case 'mid': return 'bg-accent/10 color-accent';
      case 'senior': return 'bg-accent/10 color-accent';
      case 'lead': return 'bg-warning/10 color-warning';
      case 'executive': return 'bg-destructive/10 color-destructive';
      default: return 'bg-secondary color-muted';
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
      <div className="stack-md">
        <Card title={t('title')}>
          <div className="flex items-center justify-center py-xl">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Card title={t('title')}>
        <div className="stack-md">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-md justify-between">
            <div className="flex flex-col sm:flex-row gap-md flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 color-muted h-icon-xs w-icon-xs" />
                <UnifiedInput                   placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDepartment(e.target.value)}
                className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="color-muted">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedLevel(e.target.value)}
                className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="color-muted">All Levels</option>
                <option value="entry">{t('entry')}</option>
                <option value="mid">{t('mid')}</option>
                <option value="senior">{t('senior')}</option>
                <option value="lead">{t('lead')}</option>
                <option value="executive">{t('executive')}</option>
              </select>
            </div>

            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              {t('addRole')}
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="border border-border rounded-lg p-md bg-secondary/50">
              <h3 className="text-body form-label color-foreground mb-sm">No roles found</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <UnifiedInput                   placeholder={t('roleName')}
                  value={newRole.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRole({...newRole, name: e.target.value})}
                />
                <UnifiedInput                   placeholder={t('department')}
                  value={newRole.department}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRole({...newRole, department: e.target.value})}
                />
                <select
                  value={newRole.level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRole({...newRole, level: e.target.value as any})}
                  className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full pl-2xl pr-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex gap-sm mt-md">
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
          <div className="text-body-sm color-muted">
            {t('resultsCount', { count: filteredRoles.length, total: roles.length })}
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredRoles.map((role: any) => (
              <div
                key={role.id}
                className="border border-border rounded-lg p-md hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center cluster-sm">
                    <Shield className="h-icon-sm w-icon-sm color-accent" />
                    <h3 className="text-heading-4 color-foreground">{role.name}</h3>
                  </div>
                  
                  <div className="flex cluster-xs">
                    <button className="p-xs color-muted hover:color-foreground">
                      <Edit className="h-icon-xs w-icon-xs" />
                    </button>
                    <button className="p-xs color-muted hover:color-destructive">
                      <Trash2 className="h-icon-xs w-icon-xs" />
                    </button>
                  </div>
                </div>

                <div className="stack-sm mb-sm">
                  {role.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm  px-md py-xs bg-secondary color-muted rounded">{role.level}</span>
                      <Badge className={getLevelColor(role.level)}>
                        {getLevelIcon(role.level)} {role.level}
                      </Badge>
                    </div>
                  )}

                  {role.department && (
                    <div className="flex items-center justify-between">
                      <p className="text-body-sm color-muted mt-xs">{role.description}</p>
                      <Badge className="bg-accent/10 color-accent">
                        {role.department}
                      </Badge>
                    </div>
                  )}
                </div>

                {role.description && (
                  <p className="text-body-sm color-muted mt-sm">Create your first role to get started.</p>
                )}

                {role.permissions && role.permissions.length > 0 && (
                  <div className="stack-md">
                    <h4 className="text-body-sm form-label color-foreground flex items-center">
                      <Users className="h-3 w-3 mr-xs" />
                      {t('permissions')} ({role.permissions.length})
                    </h4>
                    <div className="flex flex-wrap gap-xs">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} className="bg-secondary color-muted text-body-sm">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge className="bg-secondary color-muted text-body-sm">
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
            <div className="text-center py-xsxl">
              <Users className="h-icon-2xl w-icon-2xl color-muted mx-auto mb-md" />
              <p className="color-muted">{t('noRolesFound')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

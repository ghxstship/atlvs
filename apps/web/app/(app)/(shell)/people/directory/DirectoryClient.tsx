'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, UnifiedInput, Badge, Avatar } from '@ghxstship/ui';
import { createClient } from '@ghxstship/auth';
import { Search, Filter, UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  location?: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar_url?: string;
}

interface DirectoryClientProps {
  orgId: string;
}

export default function DirectoryClient({ orgId }: DirectoryClientProps) {
  const t = useTranslations('people.directory');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  const supabase = createClient();

  useEffect(() => {
    loadPeople();
  }, [orgId, selectedDepartment, selectedStatus]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('people')
        .select('*')
        .eq('organization_id', orgId)
        .order('first_name', { ascending: true });

      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment);
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter(person => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.first_name.toLowerCase().includes(query) ||
      person.last_name.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query) ||
      person.role?.toLowerCase().includes(query) ||
      person.department?.toLowerCase().includes(query)
    );
  });

  const departments = [...new Set(people.map(p => p.department).filter(Boolean))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 color-success';
      case 'inactive': return 'bg-warning/10 color-warning';
      case 'terminated': return 'bg-destructive/10 color-destructive';
      default: return 'bg-secondary color-muted';
    }
  };

  if (loading) {
    return (
      <div className="stack-md">
        <Card title={t('title')}>
          <div className="flex items-center justify-center py-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Card title={t('title')}>
        <div className="stack-md">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted h-4 w-4" />
              <UnifiedInput                 placeholder={t('searchPlaceholder')}
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
              <option value="">{t('allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedStatus(e.target.value)}
              className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
              <option value="terminated">{t('terminated')}</option>
            </select>

            <Button>
              <UserPlus className="h-4 w-4 mr-sm" />
              {t('addPerson')}
            </Button>
          </div>

          {/* Results Summary */}
          <div className="text-body-sm color-muted">
            {t('resultsCount', { count: filteredPeople.length, total: people.length })}
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredPeople.map((person: any) => (
              <div
                key={person.id}
                className="border border-border rounded-lg p-md hover:shadow-elevated transition-shadow cursor-pointer"
              >
                <div className="flex items-start cluster-sm">
                  <Avatar
                    src={person.avatar_url}
                    alt={`${person.first_name} ${person.last_name}`}
                    fallback={`${person.first_name[0]}${person.last_name[0]}`}
                    className="h-12 w-12"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-body-sm form-label color-foreground truncate">
                        {person.first_name} {person.last_name}
                      </h3>
                      <Badge className={getStatusColor(person.status)}>
                        {person.status}
                      </Badge>
                    </div>
                    
                    {person.role && (
                      <p className="text-body-sm color-muted truncate">{person.role}</p>
                    )}
                    
                    {person.department && (
                      <p className="text-body-sm color-muted truncate">{person.department}</p>
                    )}

                    <div className="mt-sm stack-xs">
                      {person.email && (
                        <div className="flex items-center text-body-sm color-muted">
                          <Mail className="h-3 w-3 mr-xs" />
                          <span className="truncate">{person.email}</span>
                        </div>
                      )}
                      
                      {person.phone && (
                        <div className="flex items-center text-body-sm color-muted">
                          <Phone className="h-3 w-3 mr-xs" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      
                      {person.location && (
                        <div className="flex items-center text-body-sm color-muted">
                          <MapPin className="h-3 w-3 mr-xs" />
                          <span className="truncate">{person.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPeople.length === 0 && (
            <div className="text-center py-xl">
              <p className="color-muted">{t('noPeopleFound')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Input, Badge, ViewSwitcher, DataGrid, Avatar } from '@ghxstship/ui';
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
              <option value="terminated">{t('terminated')}</option>
            </select>

            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('addPerson')}
            </Button>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            {t('resultsCount', { count: filteredPeople.length, total: people.length })}
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={person.avatar_url}
                    alt={`${person.first_name} ${person.last_name}`}
                    fallback={`${person.first_name[0]}${person.last_name[0]}`}
                    className="h-12 w-12"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {person.first_name} {person.last_name}
                      </h3>
                      <Badge className={getStatusColor(person.status)}>
                        {person.status}
                      </Badge>
                    </div>
                    
                    {person.role && (
                      <p className="text-sm text-gray-600 truncate">{person.role}</p>
                    )}
                    
                    {person.department && (
                      <p className="text-xs text-gray-500 truncate">{person.department}</p>
                    )}

                    <div className="mt-2 space-y-1">
                      {person.email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{person.email}</span>
                        </div>
                      )}
                      
                      {person.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      
                      {person.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
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
            <div className="text-center py-8">
              <p className="text-gray-500">{t('noPeopleFound')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

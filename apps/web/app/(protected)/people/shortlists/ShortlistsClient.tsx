'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Search, Edit, Trash2, List, Users, Calendar } from 'lucide-react';

interface Shortlist {
  id: string;
  name: string;
  description?: string;
  purpose: 'hiring' | 'project' | 'event' | 'general';
  status: 'active' | 'archived';
  created_at: string;
  created_by: string;
  member_count?: number;
}

interface ShortlistMember {
  id: string;
  shortlist_id: string;
  person_id: string;
  added_at: string;
  added_by: string;
  notes?: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
  };
}

interface ShortlistsClientProps {
  orgId: string;
}

export default function ShortlistsClient({ orgId }: ShortlistsClientProps) {
  const t = useTranslations('people.shortlists');
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShortlist, setNewShortlist] = useState({
    name: '',
    description: '',
    purpose: '' as '' | 'hiring' | 'project' | 'event' | 'general'
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    loadShortlists();
  }, [orgId, selectedPurpose]);

  const loadShortlists = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('people_shortlists')
        .select(`
          *,
          shortlist_members:shortlist_members(count)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (selectedPurpose) {
        query = query.eq('purpose', selectedPurpose);
      }

      const { data, error } = await query;
      if (error) throw error;

      const shortlistsWithCounts = data?.map(shortlist => ({
        ...shortlist,
        member_count: shortlist.shortlist_members?.[0]?.count || 0
      })) || [];

      setShortlists(shortlistsWithCounts);
    } catch (error) {
      console.error('Error loading shortlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShortlist = async () => {
    try {
      const { data, error } = await supabase
        .from('people_shortlists')
        .insert({
          organization_id: orgId,
          name: newShortlist.name,
          description: newShortlist.description,
          purpose: newShortlist.purpose,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setShortlists(prev => [{ ...data, member_count: 0 }, ...prev]);
      setNewShortlist({ name: '', description: '', purpose: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating shortlist:', error);
    }
  };

  const filteredShortlists = shortlists.filter(shortlist =>
    shortlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const purposes = [
    { value: 'hiring', label: t('hiring'), color: 'bg-primary/10 color-primary' },
    { value: 'project', label: t('project'), color: 'bg-success/10 color-success' },
    { value: 'event', label: t('event'), color: 'bg-secondary/10 color-secondary' },
    { value: 'general', label: t('general'), color: 'bg-secondary color-muted' }
  ];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{t('title')}</h1>
          <p className="color-muted">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t('createShortlist')}</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-muted" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allPurposes')}</option>
              {purposes.map(purpose => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card title={t('createShortlist')}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('name')}
              </label>
              <Input
                value={newShortlist.name}
                onChange={(e) => setNewShortlist(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('description')}
              </label>
              <textarea
                value={newShortlist.description}
                onChange={(e) => setNewShortlist(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('purpose')}
              </label>
              <select
                value={newShortlist.purpose}
                onChange={(e) => setNewShortlist(prev => ({ ...prev, purpose: e.target.value as any }))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('selectPurpose')}</option>
                {purposes.map(purpose => (
                  <option key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateShortlist} disabled={!newShortlist.name || !newShortlist.purpose}>
                {t('create')}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Shortlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShortlists.map((shortlist) => {
          const purpose = purposes.find(p => p.value === shortlist.purpose);
          return (
            <Card key={shortlist.id}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-heading-4 color-foreground mb-1">{shortlist.name}</h3>
                    {shortlist.description && (
                      <p className="text-body-sm color-muted mb-2">{shortlist.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  {purpose && (
                    <Badge className={purpose.color}>
                      {purpose.label}
                    </Badge>
                  )}
                  <div className="flex items-center text-body-sm color-muted">
                    <Users className="h-4 w-4 mr-1" />
                    {shortlist.member_count || 0} {t('members')}
                  </div>
                </div>

                <div className="flex items-center justify-between text-body-sm color-muted">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(shortlist.created_at).toLocaleDateString()}
                  </div>
                  <Badge className={shortlist.status === 'active' ? 'bg-success/10 color-success' : 'bg-secondary color-muted'}>
                    {shortlist.status}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredShortlists.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <List className="h-12 w-12 color-muted mx-auto mb-4" />
            <p className="color-muted">{t('noShortlists')}</p>
            <p className="text-body-sm color-muted mt-2">{t('createFirstShortlist')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

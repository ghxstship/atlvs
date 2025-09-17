'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Search, Star, MessageSquare, Calendar, User, ThumbsUp } from 'lucide-react';

interface Endorsement {
  id: string;
  endorsed_person_id: string;
  endorser_person_id: string;
  rating: number;
  message?: string;
  skills?: string[];
  context?: string;
  created_at: string;
  endorsed_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  endorser_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

interface EndorsementStats {
  totalEndorsements: number;
  averageRating: number;
  topSkills: { skill: string; count: number }[];
  recentEndorsements: number;
}

interface EndorsementsClientProps {
  orgId: string;
}

export default function EndorsementsClient({ orgId }: EndorsementsClientProps) {
  const t = useTranslations('people.endorsements');
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [stats, setStats] = useState<EndorsementStats>({
    totalEndorsements: 0,
    averageRating: 0,
    topSkills: [],
    recentEndorsements: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEndorsement, setNewEndorsement] = useState({
    endorsedPersonId: '',
    rating: 5,
    message: '',
    skills: [] as string[],
    context: ''
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    loadEndorsements();
  }, [orgId, selectedRating]);

  const loadEndorsements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('people_endorsements')
        .select(`
          *,
          endorsed_person:people!people_endorsements_endorsed_person_id_fkey(first_name, last_name, email, role, department),
          endorser_person:people!people_endorsements_endorser_person_id_fkey(first_name, last_name, email, role, department)
        `)
        .order('created_at', { ascending: false });

      if (selectedRating) {
        query = query.eq('rating', parseInt(selectedRating));
      }

      const { data, error } = await query;
      if (error) throw error;

      setEndorsements(data || []);

      // Calculate stats
      const totalEndorsements = data?.length || 0;
      const averageRating = totalEndorsements > 0 
        ? data!.reduce((sum, e) => sum + e.rating, 0) / totalEndorsements 
        : 0;

      // Count skills
      const skillCounts: { [key: string]: number } = {};
      data?.forEach(endorsement => {
        endorsement.skills?.forEach((skill: string) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent endorsements (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentEndorsements = data?.filter(e => 
        new Date(e.created_at) > thirtyDaysAgo
      ).length || 0;

      setStats({
        totalEndorsements,
        averageRating,
        topSkills,
        recentEndorsements
      });
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEndorsement = async () => {
    try {
      const { data, error } = await supabase
        .from('people_endorsements')
        .insert({
          endorsed_person_id: newEndorsement.endorsedPersonId,
          rating: newEndorsement.rating,
          message: newEndorsement.message,
          skills: newEndorsement.skills,
          context: newEndorsement.context
        })
        .select()
        .single();

      if (error) throw error;

      loadEndorsements();
      setNewEndorsement({
        endorsedPersonId: '',
        rating: 5,
        message: '',
        skills: [],
        context: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating endorsement:', error);
    }
  };

  const filteredEndorsements = endorsements.filter(endorsement => {
    const searchLower = searchQuery.toLowerCase();
    return (
      endorsement.endorsed_person?.first_name?.toLowerCase().includes(searchLower) ||
      endorsement.endorsed_person?.last_name?.toLowerCase().includes(searchLower) ||
      endorsement.endorser_person?.first_name?.toLowerCase().includes(searchLower) ||
      endorsement.endorser_person?.last_name?.toLowerCase().includes(searchLower) ||
      endorsement.message?.toLowerCase().includes(searchLower) ||
      endorsement.skills?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'color-warning fill-current' : 'color-muted'}`}
      />
    ));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{t('title')}</h1>
          <p className="color-muted">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t('giveEndorsement')}</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalEndorsements')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalEndorsements}</p>
            </div>
            <ThumbsUp className="h-8 w-8 color-primary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-body-sm form-label color-muted">{t('averageRating')}</p>
              <div className="flex items-center space-x-1">
                <p className="text-heading-3 text-heading-3 color-foreground">{stats.averageRating.toFixed(1)}</p>
                <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
              </div>
            </div>
            <Star className="h-8 w-8 color-warning" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-body-sm form-label color-muted">{t('recentEndorsements')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.recentEndorsements}</p>
              <p className="text-body-sm color-muted">{t('last30Days')}</p>
            </div>
            <Calendar className="h-8 w-8 color-success" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-body-sm form-label color-muted">{t('topSkills')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.topSkills.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 color-secondary" />
          </div>
        </Card>
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
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allRatings')}</option>
              <option value="5">5 {t('stars')}</option>
              <option value="4">4 {t('stars')}</option>
              <option value="3">3 {t('stars')}</option>
              <option value="2">2 {t('stars')}</option>
              <option value="1">1 {t('star')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card title={t('giveEndorsement')}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('endorsedPerson')}
              </label>
              <Input
                value={newEndorsement.endorsedPersonId}
                onChange={(e) => setNewEndorsement(prev => ({ ...prev, endorsedPersonId: e.target.value }))}
                placeholder={t('selectPerson')}
              />
            </div>
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('rating')}
              </label>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${
                      i < newEndorsement.rating ? 'color-warning fill-current' : 'color-muted'
                    }`}
                    onClick={() => setNewEndorsement(prev => ({ ...prev, rating: i + 1 }))}
                  />
                ))}
                <span className="ml-2 text-body-sm color-muted">{newEndorsement.rating}/5</span>
              </div>
            </div>
            <div>
              <label className="block text-body-sm form-label color-foreground mb-1">
                {t('message')}
              </label>
              <textarea
                value={newEndorsement.message}
                onChange={(e) => setNewEndorsement(prev => ({ ...prev, message: e.target.value }))}
                placeholder={t('messagePlaceholder')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateEndorsement} disabled={!newEndorsement.endorsedPersonId}>
                {t('submit')}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Endorsements List */}
      <div className="space-y-4">
        {filteredEndorsements.map((endorsement) => (
          <Card key={endorsement.id}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 color-muted" />
                  <div>
                    <div className="form-label color-foreground">
                      {endorsement.endorsed_person?.first_name} {endorsement.endorsed_person?.last_name}
                    </div>
                    {endorsement.endorsed_person?.role && (
                      <div className="text-body-sm color-muted">{endorsement.endorsed_person.role}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(endorsement.rating)}
                </div>
              </div>

              {endorsement.message && (
                <div className="mb-3 color-foreground italic">
                  "{endorsement.message}"
                </div>
              )}

              {endorsement.skills && endorsement.skills.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {endorsement.skills.map((skill, index) => (
                      <Badge key={index} className="bg-primary/10 color-primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-body-sm color-muted">
                <div className="flex items-center space-x-2">
                  <span>{t('endorsedBy')}</span>
                  <span className="form-label">
                    {endorsement.endorser_person?.first_name} {endorsement.endorser_person?.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(endorsement.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredEndorsements.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="color-muted">{t('noEndorsements')}</p>
            <p className="text-body-sm color-muted mt-2">{t('startEndorsing')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

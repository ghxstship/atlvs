'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Search, Edit, Trash2, Award } from 'lucide-react';

interface Competency {
  id: string;
  name: string;
  description?: string;
  category?: string;
  level_definitions?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    expert?: string;
  };
  created_at: string;
}

interface CompetenciesClientProps {
  orgId: string;
}

export default function CompetenciesClient({ orgId }: CompetenciesClientProps) {
  const t = useTranslations('people.competencies');
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompetency, setNewCompetency] = useState({
    name: '',
    description: '',
    category: '',
    levelDefinitions: {
      beginner: '',
      intermediate: '',
      advanced: '',
      expert: ''
    }
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    loadCompetencies();
  }, [orgId, selectedCategory]);

  const loadCompetencies = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('people_competencies')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompetencies(data || []);
    } catch (error) {
      console.error('Error loading competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompetency = async () => {
    try {
      const { data, error } = await supabase
        .from('people_competencies')
        .insert([{
          organization_id: orgId,
          name: newCompetency.name,
          description: newCompetency.description || null,
          category: newCompetency.category || null,
          level_definitions: newCompetency.levelDefinitions
        }])
        .select()
        .single();

      if (error) throw error;

      setCompetencies([...competencies, data]);
      setShowCreateForm(false);
      setNewCompetency({
        name: '',
        description: '',
        category: '',
        levelDefinitions: {
          beginner: '',
          intermediate: '',
          advanced: '',
          expert: ''
        }
      });
    } catch (error) {
      console.error('Error creating competency:', error);
    }
  };

  const filteredCompetencies = competencies.filter(competency => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      competency.name.toLowerCase().includes(query) ||
      competency.description?.toLowerCase().includes(query) ||
      competency.category?.toLowerCase().includes(query)
    );
  });

  const categories = [...new Set(competencies.map(c => c.category).filter(Boolean))];

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-secondary color-muted';
    const colors = [
      'bg-primary/10 color-primary',
      'bg-success/10 color-success',
      'bg-accent/10 color-accent',
      'bg-warning/10 color-warning',
      'bg-secondary/10 color-secondary'
    ];
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
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
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-md justify-between">
            <div className="flex flex-col sm:flex-row gap-md flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted h-4 w-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="color-muted">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-sm" />
              {t('addCompetency')}
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="border border-border rounded-lg p-md bg-secondary/50">
              <h3 className="text-body form-label mb-md">{t('createCompetency')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <Input
                  placeholder={t('competencyName')}
                  value={newCompetency.name}
                  onChange={(e) => setNewCompetency({...newCompetency, name: e.target.value})}
                />
                <Input
                  placeholder={t('category')}
                  value={newCompetency.category}
                  onChange={(e) => setNewCompetency({...newCompetency, category: e.target.value})}
                />
                <div className="md:col-span-2">
                  <textarea
                    placeholder={t('description')}
                    value={newCompetency.description}
                    onChange={(e) => setNewCompetency({...newCompetency, description: e.target.value})}
                    className="w-full pl-2xl pr-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-body-sm color-muted mt-sm">{t('levelDefinitions')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                    <Input
                      placeholder={t('beginnerLevel')}
                      value={newCompetency.levelDefinitions.beginner}
                      onChange={(e) => setNewCompetency({
                        ...newCompetency,
                        levelDefinitions: {...newCompetency.levelDefinitions, beginner: e.target.value}
                      })}
                    />
                    <Input
                      placeholder={t('intermediateLevel')}
                      value={newCompetency.levelDefinitions.intermediate}
                      onChange={(e) => setNewCompetency({
                        ...newCompetency,
                        levelDefinitions: {...newCompetency.levelDefinitions, intermediate: e.target.value}
                      })}
                    />
                    <Input
                      placeholder={t('advancedLevel')}
                      value={newCompetency.levelDefinitions.advanced}
                      onChange={(e) => setNewCompetency({
                        ...newCompetency,
                        levelDefinitions: {...newCompetency.levelDefinitions, advanced: e.target.value}
                      })}
                    />
                    <Input
                      placeholder={t('expertLevel')}
                      value={newCompetency.levelDefinitions.expert}
                      onChange={(e) => setNewCompetency({
                        ...newCompetency,
                        levelDefinitions: {...newCompetency.levelDefinitions, expert: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-sm mt-md">
                <Button onClick={createCompetency} disabled={!newCompetency.name}>
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
            {t('resultsCount', { count: filteredCompetencies.length, total: competencies.length })}
          </div>

          {/* Competencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredCompetencies.map((competency) => (
              <div
                key={competency.id}
                className="border border-border rounded-lg p-md hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center cluster-sm">
                    <Award className="h-5 w-5 color-primary" />
                    <h3 className="text-heading-4 color-foreground">{competency.name}</h3>
                  </div>
                  
                  <div className="flex cluster-xs">
                    <button className="p-xs color-muted hover:color-foreground">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-xs color-muted hover:color-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {competency.category && (
                  <Badge className={`mb-sm ${getCategoryColor(competency.category)}`}>
                    {competency.category}
                  </Badge>
                )}

                {competency.description && (
                  <p className="text-body-sm color-muted mt-xs">{competency.description}</p>
                )}

                {competency.level_definitions && (
                  <div className="stack-xs">
                    <h4 className="text-body-sm form-label color-foreground">{t('levels')}:</h4>
                    <div className="grid grid-cols-2 gap-xs text-body-sm">
                      {competency.level_definitions.beginner && (
                        <div className="color-success">● {t('beginner')}</div>
                      )}
                      {competency.level_definitions.intermediate && (
                        <span className="color-muted">Level: {t('intermediate')}</span>
                      )}
                      {competency.level_definitions.advanced && (
                        <div className="color-secondary">● {t('advanced')}</div>
                      )}
                      {competency.level_definitions.expert && (
                        <div className="color-destructive">● {t('expert')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCompetencies.length === 0 && (
            <div className="text-center py-xl">
              <Award className="h-12 w-12 color-muted mx-auto mb-md" />
              <span className="color-muted">Category: Manage skills and competency frameworks.</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

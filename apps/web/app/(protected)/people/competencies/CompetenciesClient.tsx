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
    if (!category) return 'bg-gray-100 text-gray-800';
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    const index = category.charCodeAt(0) % colors.length;
    return colors[index];
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addCompetency')}
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">{t('createCompetency')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-2">{t('levelDefinitions')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              
              <div className="flex gap-2 mt-4">
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
          <div className="text-sm text-gray-600">
            {t('resultsCount', { count: filteredCompetencies.length, total: competencies.length })}
          </div>

          {/* Competencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompetencies.map((competency) => (
              <div
                key={competency.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium text-gray-900">{competency.name}</h3>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {competency.category && (
                  <Badge className={`mb-2 ${getCategoryColor(competency.category)}`}>
                    {competency.category}
                  </Badge>
                )}

                {competency.description && (
                  <p className="text-sm text-gray-600 mb-3">{competency.description}</p>
                )}

                {competency.level_definitions && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700">{t('levels')}:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {competency.level_definitions.beginner && (
                        <div className="text-green-600">● {t('beginner')}</div>
                      )}
                      {competency.level_definitions.intermediate && (
                        <div className="text-yellow-600">● {t('intermediate')}</div>
                      )}
                      {competency.level_definitions.advanced && (
                        <div className="text-orange-600">● {t('advanced')}</div>
                      )}
                      {competency.level_definitions.expert && (
                        <div className="text-red-600">● {t('expert')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCompetencies.length === 0 && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noCompetenciesFound')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Users, Shield, Award, Star, Network, List, TrendingUp, Calendar } from 'lucide-react';

interface OverviewStats {
  totalPeople: number;
  activePeople: number;
  totalRoles: number;
  totalCompetencies: number;
  totalEndorsements: number;
  totalShortlists: number;
  recentActivity: any[];
}

interface OverviewClientProps {
  orgId: string;
}

export default function OverviewClient({ orgId }: OverviewClientProps) {
  const t = useTranslations('people.overview');
  const [stats, setStats] = useState<OverviewStats>({
    totalPeople: 0,
    activePeople: 0,
    totalRoles: 0,
    totalCompetencies: 0,
    totalEndorsements: 0,
    totalShortlists: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadStats();
  }, [orgId]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load people stats
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('status')
        .eq('organization_id', orgId);

      if (peopleError) throw peopleError;

      // Load roles count
      const { count: rolesCount, error: rolesError } = await supabase
        .from('people_roles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (rolesError) throw rolesError;

      // Load competencies count
      const { count: competenciesCount, error: competenciesError } = await supabase
        .from('people_competencies')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (competenciesError) throw competenciesError;

      // Load endorsements count
      const { count: endorsementsCount, error: endorsementsError } = await supabase
        .from('people_endorsements')
        .select('*', { count: 'exact', head: true });

      if (endorsementsError) throw endorsementsError;

      // Load shortlists count
      const { count: shortlistsCount, error: shortlistsError } = await supabase
        .from('people_shortlists')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (shortlistsError) throw shortlistsError;

      const totalPeople = people?.length || 0;
      const activePeople = people?.filter((p: any) => p.status === 'active').length || 0;

      setStats({
        totalPeople,
        activePeople,
        totalRoles: rolesCount || 0,
        totalCompetencies: competenciesCount || 0,
        totalEndorsements: endorsementsCount || 0,
        totalShortlists: shortlistsCount || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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

  const quickActions = [
    { icon: Users, label: t('viewDirectory'), href: '/people/directory', color: 'bg-blue-500' },
    { icon: Shield, label: t('manageRoles'), href: '/people/roles', color: 'bg-purple-500' },
    { icon: Award, label: t('viewCompetencies'), href: '/people/competencies', color: 'bg-green-500' },
    { icon: List, label: t('viewShortlists'), href: '/people/shortlists', color: 'bg-orange-500' },
    { icon: Star, label: t('viewEndorsements'), href: '/people/endorsements', color: 'bg-pink-500' },
    { icon: Network, label: t('viewNetwork'), href: '/people/network', color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalPeople')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPeople}</p>
              <p className="text-xs text-green-600">
                {stats.activePeople} {t('active')}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalRoles')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalCompetencies')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompetencies}</p>
            </div>
            <Award className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalEndorsements')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEndorsements}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t('quickActions')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* People Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('peopleByStatus')}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('active')}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalPeople > 0 ? (stats.activePeople / stats.totalPeople) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.activePeople}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('inactive')}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalPeople > 0 ? ((stats.totalPeople - stats.activePeople) / stats.totalPeople) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.totalPeople - stats.activePeople}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('moduleStatus')}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('directory')}</span>
              <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('roles')}</span>
              <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('competencies')}</span>
              <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('endorsements')}</span>
              <Badge className="bg-yellow-100 text-yellow-800">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('shortlists')}</span>
              <Badge className="bg-yellow-100 text-yellow-800">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('network')}</span>
              <Badge className="bg-yellow-100 text-yellow-800">{t('beta')}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title={t('recentActivity')}>
        <div className="p-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noRecentActivity')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('activityWillAppearHere')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Badge, Button } from '@ghxstship/ui';
import { CompletionBar } from '../../components/ui/DynamicProgressBar';
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
    { icon: Users, label: t('viewDirectory'), href: '/people/directory', color: 'bg-primary' },
    { icon: Shield, label: t('manageRoles'), href: '/people/roles', color: 'bg-secondary' },
    { icon: Award, label: t('viewCompetencies'), href: '/people/competencies', color: 'bg-success' },
    { icon: List, label: t('viewShortlists'), href: '/people/shortlists', color: 'bg-warning' },
    { icon: Star, label: t('viewEndorsements'), href: '/people/endorsements', color: 'bg-accent' },
    { icon: Network, label: t('viewNetwork'), href: '/people/network', color: 'bg-secondary' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('totalPeople')}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPeople}</p>
              <p className="text-xs text-success">
                {stats.activePeople} {t('active')}
              </p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('totalRoles')}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 text-secondary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('totalCompetencies')}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalCompetencies}</p>
            </div>
            <Award className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('totalEndorsements')}</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalEndorsements}</p>
            </div>
            <Star className="h-8 w-8 text-warning" />
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
              className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* People Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('peopleByStatus')}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('active')}</span>
              <div className="flex items-center space-x-2">
                <CompletionBar
                  completed={stats.activePeople}
                  total={stats.totalPeople}
                  className="w-24"
                />
                <span className="text-sm font-medium">{stats.activePeople}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('inactive')}</span>
              <div className="flex items-center space-x-2">
                <CompletionBar
                  completed={stats.totalPeople - stats.activePeople}
                  total={stats.totalPeople}
                  className="w-24"
                />
                <span className="text-sm font-medium">{stats.totalPeople - stats.activePeople}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('moduleStatus')}>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('directory')}</span>
              <Badge className="bg-success/10 text-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('roles')}</span>
              <Badge className="bg-success/10 text-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('competencies')}</span>
              <Badge className="bg-success/10 text-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('endorsements')}</span>
              <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('shortlists')}</span>
              <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('network')}</span>
              <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title={t('recentActivity')}>
        <div className="p-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('noRecentActivity')}</p>
            <p className="text-sm text-muted-foreground/70 mt-2">{t('activityWillAppearHere')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

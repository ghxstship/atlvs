'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Badge, Button } from '@ghxstship/ui';
import { CompletionBar } from "../../../../_components/ui"
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
      <div className="stack-md">
        <Card title={t('title')}>
          <div className="flex items-center justify-center py-xl">
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
    <div className="stack-lg">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalPeople')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalPeople}</p>
              <p className="text-body-sm color-success">
                {stats.activePeople} {t('active')}
              </p>
            </div>
            <Users className="h-8 w-8 color-primary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalRoles')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 color-secondary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalCompetencies')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalCompetencies}</p>
            </div>
            <Award className="h-8 w-8 color-success" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalEndorsements')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalEndorsements}</p>
            </div>
            <Star className="h-8 w-8 color-warning" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t('quickActions')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md p-md">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex items-center cluster-sm p-md border rounded-lg hover:shadow-elevated transition-shadow cursor-pointer"
            >
              <div className={`p-sm rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-background" />
              </div>
              <span className="text-body-sm form-label color-foreground">{action.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* People Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card title={t('peopleByStatus')}>
          <div className="p-md stack-sm">
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('active')}</span>
              <div className="flex items-center cluster-sm">
                <CompletionBar
                  completed={stats.activePeople}
                  total={stats.totalPeople}
                  className="w-24"
                />
                <span className="text-body-sm form-label">{stats.activePeople}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('inactive')}</span>
              <div className="flex items-center cluster-sm">
                <CompletionBar
                  completed={stats.totalPeople - stats.activePeople}
                  total={stats.totalPeople}
                  className="w-24"
                />
                <span className="text-body-sm form-label">{stats.totalPeople - stats.activePeople}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('moduleStatus')}>
          <div className="p-md stack-sm">
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('directory')}</span>
              <Badge className="bg-success/10 color-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('roles')}</span>
              <Badge className="bg-success/10 color-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('competencies')}</span>
              <Badge className="bg-success/10 color-success">{t('active')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('endorsements')}</span>
              <Badge className="bg-warning/10 color-warning">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('shortlists')}</span>
              <Badge className="bg-warning/10 color-warning">{t('beta')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm color-muted">{t('network')}</span>
              <Badge className="bg-warning/10 color-warning">{t('beta')}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title={t('recentActivity')}>
        <div className="p-md">
          <div className="text-center py-xl">
            <Calendar className="h-12 w-12 color-muted/50 mx-auto mb-md" />
            <p className="color-muted">{t('noRecentActivity')}</p>
            <p className="text-body-sm color-muted/70 mt-sm">{t('activityWillAppearHere')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

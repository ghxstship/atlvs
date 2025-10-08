'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Package,
  Shield,
  Star,
  Target,
  Users,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import { Badge, Button, Card, Tabs, TabsList, TabsTrigger } from '@ghxstship/ui';
import { reportError, type AppError } from '@ghxstship/ui/utils/error-handling';
import { useTranslations } from 'next-intl';

import type { MarketplaceDashboardStats } from './types';

interface MarketplaceDashboardProps {
  orgId: string;
  userId: string;
  userRole: 'vendor' | 'client' | 'both';
}

const INITIAL_STATS: MarketplaceDashboardStats = {
  vendor: {
    totalEarnings: 0,
    activeProjects: 0,
    completedProjects: 0,
    avgRating: 0,
    totalReviews: 0,
    responseRate: 0,
    profileViews: 0,
    proposalsSent: 0,
    successRate: 0
  },
  client: {
    totalSpent: 0,
    activeProjects: 0,
    completedProjects: 0,
    vendorsHired: 0,
    avgProjectValue: 0,
    totalSaved: 0,
    proposalsReceived: 0,
    avgCompletionTime: 0
  }
};

export default function MarketplaceDashboard({ orgId, userId, userRole }: MarketplaceDashboardProps) {
  const t = useTranslations('opendeck');
  const supabase = useMemo(() => createBrowserClient(), []);

  const [activeView, setActiveView] = useState<'vendor' | 'client'>(
    userRole === 'vendor' ? 'vendor' : 'client',
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<MarketplaceDashboardStats>(INITIAL_STATS);
  const [notifications, setNotifications] = useState<number>(0);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const vendorDataPromise = activeView === 'vendor'
        ? supabase
            .from('opendeck_vendor_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
        : null;

      const clientDataPromise = activeView === 'client'
        ? supabase
            .from('opendeck_projects')
            .select('*')
            .eq('client_id', userId)
        : null;

      const notificationsPromise = supabase
        .from('opendeck_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      const [vendorProfileResult, clientProjectsResult, notificationsResult] = await Promise.all([
        vendorDataPromise,
        clientDataPromise,
        notificationsPromise,
      ]);

      setNotifications(notificationsResult?.count ?? 0);

      if (activeView === 'vendor' && vendorProfileResult && 'data' in vendorProfileResult) {
        const vendorProfile = vendorProfileResult.data;

        if (vendorProfile) {
          const [{ data: contracts }, { data: proposals }, { data: reviews }] = await Promise.all([
            supabase
              .from('opendeck_contracts')
              .select('*')
              .eq('vendor_id', vendorProfile.id),
            supabase
              .from('opendeck_proposals')
              .select('*')
              .eq('vendor_id', vendorProfile.id),
            supabase
              .from('opendeck_reviews')
              .select('*')
              .eq('reviewee_id', userId)
              .eq('status', 'published'),
          ]);

          const activeContracts = contracts?.filter((contract) => contract.status === 'active') ?? [];
          const completedContracts = contracts?.filter((contract) => contract.status === 'completed') ?? [];
          const totalEarnings = completedContracts.reduce(
            (sum, contract) => sum + Number(contract.total_amount ?? 0),
            0,
          );
          const avgRating = reviews?.length
            ? Number(
                (
                  reviews.reduce((sum, review) => sum + Number(review.overall_rating ?? 0), 0) /
                  reviews.length
                ).toFixed(1),
              )
            : 0;

          setStats((previous: MarketplaceDashboardStats) => ({
            ...previous,
            vendor: {
              totalEarnings,
              activeProjects: activeContracts.length,
              completedProjects: completedContracts.length,
              avgRating,
              totalReviews: reviews?.length ?? 0,
              responseRate: 98,
              profileViews: vendorProfile.views ?? 0,
              proposalsSent: proposals?.length ?? 0,
              successRate:
                proposals && proposals.length > 0
                  ? Number(
                      ((
                        proposals.filter((proposal) => proposal.status === 'accepted').length /
                          proposals.length) *
                        100
                      ).toFixed(0),
                    )
                  : 0
            }
          }));
        }
      }

      if (activeView === 'client' && clientProjectsResult && 'data' in clientProjectsResult) {
        const projects = clientProjectsResult.data ?? [];
        const [{ data: contracts }] = await Promise.all([
          supabase
            .from('opendeck_contracts')
            .select('*')
            .eq('client_id', userId),
        ]);

        const activeProjects = projects.filter((project) => project.status === 'in_progress');
        const completedProjects = projects.filter((project) => project.status === 'completed');
        const totalSpent = contracts?.reduce(
          (sum, contract) => sum + Number(contract.total_amount ?? 0),
          0,
        ) ?? 0;

        setStats((previous: MarketplaceDashboardStats) => ({
          ...previous,
          client: {
            ...previous.client,
            totalSpent,
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            vendorsHired: contracts ? new Set(contracts.map((contract) => contract.vendor_id)).size : 0,
            avgProjectValue: contracts && contracts.length > 0 ? totalSpent / contracts.length : 0,
            totalSaved: Number((totalSpent * 0.15).toFixed(2)),
            avgCompletionTime: 14
          }
        }));
      }
    } catch (error: unknown) {
      const appError: AppError =
        error && typeof error === 'object' && 'code' in error && 'timestamp' in error
          ? (error as AppError)
          : {
              code: 'MARKETPLACE_DASHBOARD_ERROR',
              message: error instanceof Error ? error.message : 'Unknown marketplace dashboard error',
              timestamp: new Date()
            };
      reportError(appError);
    } finally {
      setLoading(false);
    }
  }, [activeView, supabase, userId]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData, orgId]);

  const vendorDashboard = useMemo(
    () => (
      <div className="brand-marketplace stack-lg">
        <div className="brand-marketplace grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('vendor.metrics.totalEarned')}</p>
                <p className="text-heading-3">${stats.vendor.totalEarnings.toLocaleString()}</p>
                <p className="text-body-sm color-success flex items-center mt-xs">
                  <ArrowUpRight className="h-icon-xs w-icon-xs mr-xs" />
                  +12% {t('common.period.lastMonth')}
                </p>
              </div>
              <DollarSign className="h-icon-lg w-icon-lg color-success" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('vendor.metrics.activeProjects')}</p>
                <p className="text-heading-3">{stats.vendor.activeProjects}</p>
                <p className="text-body-sm color-muted mt-xs">
                  {stats.vendor.completedProjects} {t('vendor.metrics.completed')}
                </p>
              </div>
              <Briefcase className="h-icon-lg w-icon-lg color-accent" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('vendor.metrics.averageRating')}</p>
                <div className="brand-marketplace flex items-center">
                  <p className="text-heading-3 mr-sm">{stats.vendor.avgRating}</p>
                  <Star className="h-icon-md w-icon-md color-warning fill-warning" />
                </div>
                <p className="text-body-sm color-muted mt-xs">
                  {stats.vendor.totalReviews} {t('vendor.metrics.reviews')}
                </p>
              </div>
              <Award className="h-icon-lg w-icon-lg color-warning" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('vendor.metrics.successRate')}</p>
                <p className="text-heading-3">{stats.vendor.successRate}%</p>
                <p className="text-body-sm color-muted mt-xs">
                  {stats.vendor.proposalsSent} {t('vendor.metrics.proposalsSent')}
                </p>
              </div>
              <Target className="h-icon-lg w-icon-lg text-info" />
            </div>
          </Card>
        </div>

        <div className="brand-marketplace grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <Card className="lg:col-span-2 p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('vendor.earnings.title')}</h3>
            <div className="brand-marketplace h-chart-lg flex items-center justify-center border border-dashed border-border rounded-radius-lg">
              <BarChart3 className="h-icon-xl w-icon-xl color-muted" />
              <span className="ml-sm color-muted">{t('vendor.earnings.placeholder')}</span>
            </div>
          </Card>

          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('common.actions.quick')}</h3>
            <div className="brand-marketplace stack-sm">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-icon-sm w-icon-sm mr-sm" />
                {t('vendor.actions.createService')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-icon-sm w-icon-sm mr-sm" />
                {t('vendor.actions.browseProjects')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-icon-sm w-icon-sm mr-sm" />
                {t('vendor.actions.viewMessages')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-icon-sm w-icon-sm mr-sm" />
                {t('vendor.actions.updatePortfolio')}
              </Button>
            </div>
          </Card>
        </div>

        <div className="brand-marketplace grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('vendor.projects.title')}</h3>
            <div className="brand-marketplace stack-sm">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-sm border rounded-radius-lg">
                  <div>
                    <p className="form-label">Event Production Setup</p>
                    <p className="text-body-sm color-muted">{t('vendor.projects.dueSoon')}</p>
                  </div>
                  <Badge variant="secondary">{t('common.status.inProgress')}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('vendor.reviews.title')}</h3>
            <div className="brand-marketplace stack-sm">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-sm border rounded-radius-lg">
                  <div className="brand-marketplace flex items-center mb-sm">
                    <div className="brand-marketplace flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-icon-sm w-icon-sm color-warning fill-warning" />
                      ))}
                    </div>
                    <span className="ml-sm text-body-sm color-muted">{t('vendor.reviews.recent')}</span>
                  </div>
                  <p className="text-body-sm">"Excellent work on the lighting setup. Professional and timely."</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    ),
    [stats.vendor, t],
  );

  const clientDashboard = useMemo(
    () => (
      <div className="brand-marketplace stack-lg">
        <div className="brand-marketplace grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('client.metrics.totalSpend')}</p>
                <p className="text-heading-3">${stats.client.totalSpent.toLocaleString()}</p>
                <p className="text-body-sm color-success flex items-center mt-xs">
                  <ArrowDownRight className="h-icon-xs w-icon-xs mr-xs" />
                  -8% {t('common.period.vsBudget')}
                </p>
              </div>
              <DollarSign className="h-icon-lg w-icon-lg color-accent" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('client.metrics.activeProjects')}</p>
                <p className="text-heading-3">{stats.client.activeProjects}</p>
                <p className="text-body-sm color-muted mt-xs">
                  {stats.client.completedProjects} {t('client.metrics.completed')}
                </p>
              </div>
              <Briefcase className="h-icon-lg w-icon-lg color-accent" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('client.metrics.vendorsHired')}</p>
                <p className="text-heading-3">{stats.client.vendorsHired}</p>
                <p className="text-body-sm color-muted mt-xs">
                  {t('client.metrics.avgCompletionTime', { days: stats.client.avgCompletionTime })}
                </p>
              </div>
              <Users className="h-icon-lg w-icon-lg color-accent" />
            </div>
          </Card>

          <Card className="p-md">
            <div className="brand-marketplace flex items-center justify-between">
              <div>
                <p className="text-body-sm color-muted">{t('client.metrics.avgProjectValue')}</p>
                <p className="text-heading-3">${Math.round(stats.client.avgProjectValue).toLocaleString()}</p>
                <p className="text-body-sm color-muted mt-xs">
                  {t('client.metrics.totalSaved', { amount: stats.client.totalSaved.toLocaleString() })}
                </p>
              </div>
              <Shield className="h-icon-lg w-icon-lg text-info" />
            </div>
          </Card>
        </div>

        <div className="brand-marketplace grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <Card className="lg:col-span-2 p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('client.timeline.title')}</h3>
            <div className="h-chart-lg flex items-center justify-center border border-dashed border-border rounded-radius-lg">
              <Calendar className="h-icon-xl w-icon-xl color-muted" />
              <span className="ml-sm color-muted">{t('client.timeline.placeholder')}</span>
            </div>
          </Card>

          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('common.actions.quick')}</h3>
            <div className="stack-sm">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-icon-sm w-icon-sm mr-sm" />
                {t('client.actions.postProject')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-icon-sm w-icon-sm mr-sm" />
                {t('client.actions.browseVendors')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-icon-sm w-icon-sm mr-sm" />
                {t('client.actions.reviewProposals')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-icon-sm w-icon-sm mr-sm" />
                {t('client.actions.optimizeBudget')}
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('client.projects.title')}</h3>
            <div className="stack-sm">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-sm border rounded-radius-lg">
                  <div>
                    <p className="form-label">Music Festival Setup</p>
                    <p className="text-body-sm color-muted">{t('client.projects.vendorCount', { count: 3 })}</p>
                  </div>
                  <Badge variant="secondary">{t('common.status.inProgress')}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">{t('client.proposals.title')}</h3>
            <div className="stack-sm">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-sm border rounded-radius-lg">
                  <div className="flex items-center justify-between mb-sm">
                    <p className="form-label">Stage Design Services</p>
                    <Badge variant="outline">{t('client.proposals.new')}</Badge>
                  </div>
                  <p className="text-body-sm color-muted">$5,000 · 7 {t('common.time.days')}</p>
                  <div className="flex items-center mt-sm">
                    <Star className="h-icon-xs w-icon-xs color-warning fill-warning mr-xs" />
                    <span className="text-body-sm">4.8 {t('client.proposals.rating')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    ),
    [stats.client, t],
  );

  return (
    <div className="brand-marketplace stack-lg">
      {userRole === 'both' && (
        <div className="brand-marketplace flex items-center justify-between">
          <h2 className="text-heading-3">OPENDECK Dashboard</h2>
          <Tabs value={activeView} onValueChange={(value: string) => setActiveView(value as 'vendor' | 'client')}>
            <TabsList>
              <TabsTrigger value="vendor">
                <Building className="h-icon-xs w-icon-xs mr-sm" />
                {t('vendor.title')}
              </TabsTrigger>
              <TabsTrigger value="client">
                <Briefcase className="h-icon-xs w-icon-xs mr-sm" />
                {t('client.title')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {notifications > 0 && (
        <Card className="p-md bg-info/5 border-info/20">
          <div className="brand-marketplace flex items-center justify-between">
            <div className="brand-marketplace flex items-center">
              <Shield className="h-icon-sm w-icon-sm text-info mr-sm" />
              <span className="text-body-sm">
                {t('common.notifications.unread', { count: notifications })}
              </span>
            </div>
            <Button>{t('common.actions.viewAll')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="brand-marketplace flex items-center justify-center h-container-sm">
          <div className="brand-marketplace animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary" />
        </div>
      ) : activeView === 'vendor' ? (
        vendorDashboard
      ) : (
        clientDashboard
      )}
    </div>
  );
}

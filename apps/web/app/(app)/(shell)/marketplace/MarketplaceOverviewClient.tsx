'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import {
  TrendingUp,
  Users,
  Briefcase,
  MessageSquare,
  DollarSign,
  Star,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Kanban,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Award
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MarketplaceStats, MarketplaceDashboardStats } from './types';
import { marketplaceService } from './lib/api';

interface MarketplaceOverviewClientProps {
  orgId: string;
  userId: string;
  userRole: 'vendor' | 'client' | 'both';
}

export default function MarketplaceOverviewClient({
  orgId,
  userId,
  userRole
}: MarketplaceOverviewClientProps) {
  const t = useTranslations('marketplace');
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'projects' | 'vendors' | 'messages' | 'payments' | 'reviews' | 'contracts' | 'settings'>('overview');

  // Fetch marketplace statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['marketplace-stats', orgId],
    queryFn: () => marketplaceService.getStats(orgId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch dashboard stats based on user role
  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery({
    queryKey: ['marketplace-dashboard', orgId, userId, userRole],
    queryFn: () => marketplaceService.getDashboardStats(orgId, userId, userRole),
    enabled: !!orgId && !!userId
  });

  const tabs = [
    { id: 'overview', label: t('overview.title'), icon: BarChart3 },
    { id: 'listings', label: t('listings.title'), icon: FileText },
    { id: 'projects', label: t('projects.title'), icon: Briefcase },
    { id: 'vendors', label: t('vendors.title'), icon: Users },
    { id: 'messages', label: t('messages.title'), icon: MessageSquare },
    { id: 'payments', label: t('payments.title'), icon: DollarSign },
    { id: 'reviews', label: t('reviews.title'), icon: Star },
    { id: 'contracts', label: t('contracts.title'), icon: Award },
    { id: 'settings', label: t('settings.title'), icon: Settings },
  ];

  const renderOverviewContent = () => (
    <div className="space-y-lg">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card className="brand-marketplace">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">{t('overview.totalListings')}</CardTitle>
            <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalListings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.featuredListings || 0} featured
            </p>
          </CardContent>
        </Card>

        <Card className="brand-marketplace">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">{t('overview.activeVendors')}</CardTitle>
            <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVendors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Verified vendors
            </p>
          </CardContent>
        </Card>

        <Card className="brand-marketplace">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">{t('overview.activeProjects')}</CardTitle>
            <Briefcase className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="brand-marketplace">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">{t('overview.totalResponses')}</CardTitle>
            <MessageSquare className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.averageResponseRate ? `${stats.averageResponseRate.toFixed(1)}%` : '0%'} avg rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Dashboard */}
      {userRole === 'vendor' && dashboardStats?.vendor && (
        <Card className="brand-marketplace">
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <TrendingUp className="h-icon-sm w-icon-sm" />
              {t('overview.vendorPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardStats.vendor.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{t('overview.totalEarnings')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.vendor.activeProjects}</div>
                <p className="text-xs text-muted-foreground">{t('overview.activeProjects')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.vendor.avgRating?.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">{t('overview.averageRating')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.vendor.successRate?.toFixed(1) || '0.0'}%</div>
                <p className="text-xs text-muted-foreground">{t('overview.successRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'client' && dashboardStats?.client && (
        <Card className="brand-marketplace">
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Briefcase className="h-icon-sm w-icon-sm" />
              {t('overview.clientActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardStats.client.totalSpent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{t('overview.totalSpent')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.client.activeProjects}</div>
                <p className="text-xs text-muted-foreground">{t('overview.activeProjects')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{dashboardStats.client.vendorsHired}</div>
                <p className="text-xs text-muted-foreground">{t('overview.vendorsHired')}</p>
              </div>
              <div>
                <div className="text-2xl font-bold">${dashboardStats.client.avgProjectValue?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">{t('overview.avgProjectValue')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="brand-marketplace">
        <CardHeader>
          <CardTitle>{t('overview.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Button
              className="justify-start h-auto p-md"
              variant="outline"
              onClick={() => setActiveTab('listings')}
            >
              <Plus className="mr-sm h-icon-xs w-icon-xs" />
              <div className="text-left">
                <div className="font-medium">{t('overview.createListing')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.createListingDesc')}</div>
              </div>
            </Button>

            <Button
              className="justify-start h-auto p-md"
              variant="outline"
              onClick={() => setActiveTab('projects')}
            >
              <Briefcase className="mr-sm h-icon-xs w-icon-xs" />
              <div className="text-left">
                <div className="font-medium">{t('overview.postProject')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.postProjectDesc')}</div>
              </div>
            </Button>

            <Button
              className="justify-start h-auto p-md"
              variant="outline"
              onClick={() => setActiveTab('vendors')}
            >
              <Users className="mr-sm h-icon-xs w-icon-xs" />
              <div className="text-left">
                <div className="font-medium">{t('overview.findVendors')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.findVendorsDesc')}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      default:
        return (
          <div className="text-center py-xsxl">
            <p className="text-muted-foreground">
              {t('comingSoon', { tab: activeTab })}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Badge variant="secondary" className="brand-marketplace">
          {userRole === 'vendor' ? t('role.vendor') : userRole === 'client' ? t('role.client') : t('role.both')}
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-xs" aria-label="Marketplace navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-sm px-md py-sm text-sm font-medium rounded-t-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon className="h-icon-xs w-icon-xs" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-content-xl">
        {renderTabContent()}
      </div>
    </div>
  );
}

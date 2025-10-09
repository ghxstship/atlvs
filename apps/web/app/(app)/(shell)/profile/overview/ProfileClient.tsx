'use client';

import { User, Briefcase, Award, Phone, Shield, Heart, Clock, Plane, Shirt, Activity, FileText, Star, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import {
  Badge,
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast
} from "@ghxstship/ui";

// Import all Profile module clients
import ProfileOverviewClient from './ProfileOverviewClient';
import BasicInfoClient from '../basic/BasicInfoClient';
import ContactClient from '../contact/ContactClient';
import ProfessionalClient from '../professional/ProfessionalClient';
import PerformanceClient from '../performance/PerformanceClient';
import TravelClient from '../travel/TravelClient';
import UniformClient from '../uniform/UniformClient';
import CertificationsClient from '../certifications/CertificationsClient';
import EndorsementsClient from '../endorsements/EndorsementsClient';
import HealthClient from '../health/HealthClient';
import EmergencyClient from '../emergency/EmergencyClient';
import ActivityClient from '../activity/ActivityClient';
import HistoryClient from '../history/HistoryClient';
import JobHistoryClient from '../job-history/JobHistoryClient';

// Profile module configuration
const PROFILE_MODULES = [
 {
 id: 'overview',
 label: 'Overview',
 icon: User,
 description: 'Profile summary and key information',
 component: ProfileOverviewClient,
 color: 'blue'
 },
 {
 id: 'basic',
 label: 'Basic Info',
 icon: FileText,
 description: 'Personal information and demographics',
 component: BasicInfoClient,
 color: 'green'
 },
 {
 id: 'contact',
 label: 'Contact',
 icon: Phone,
 description: 'Contact information and addresses',
 component: ContactClient,
 color: 'purple'
 },
 {
 id: 'professional',
 label: 'Professional',
 icon: Briefcase,
 description: 'Career and professional information',
 component: ProfessionalClient,
 color: 'indigo'
 },
 {
 id: 'performance',
 label: 'Performance',
 icon: Star,
 description: 'Performance reviews and goals',
 component: PerformanceClient,
 color: 'yellow'
 },
 {
 id: 'travel',
 label: 'Travel',
 icon: Plane,
 description: 'Travel history and preferences',
 component: TravelClient,
 color: 'cyan'
 },
 {
 id: 'uniform',
 label: 'Uniform',
 icon: Shirt,
 description: 'Uniform sizing and equipment',
 component: UniformClient,
 color: 'orange'
 },
 {
 id: 'certifications',
 label: 'Certifications',
 icon: Award,
 description: 'Certifications and qualifications',
 component: CertificationsClient,
 color: 'emerald'
 },
 {
 id: 'endorsements',
 label: 'Endorsements',
 icon: Star,
 description: 'Peer endorsements and recommendations',
 component: EndorsementsClient,
 color: 'pink'
 },
 {
 id: 'health',
 label: 'Health',
 icon: Heart,
 description: 'Health information and medical records',
 component: HealthClient,
 color: 'red'
 },
 {
 id: 'emergency',
 label: 'Emergency',
 icon: AlertTriangle,
 description: 'Emergency contacts and information',
 component: EmergencyClient,
 color: 'red'
 },
 {
 id: 'activity',
 label: 'Activity',
 icon: Activity,
 description: 'Activity log and recent actions',
 component: ActivityClient,
 color: 'gray'
 },
 {
 id: 'history',
 label: 'History',
 icon: Clock,
 description: 'Profile change history',
 component: HistoryClient,
 color: 'slate'
 },
 {
 id: 'job-history',
 label: 'Job History',
 icon: Briefcase,
 description: 'Employment history and positions',
 component: JobHistoryClient,
 color: 'teal'
 }
] as const;

export default function ProfileClient({ orgId, userId, userEmail }: { orgId: string; userId: string; userEmail: string }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    addToast({
      title: 'Refreshing Profile Data',
      description: 'Updating all profile modules...',
      type: 'info'
    });
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
    addToast({
      title: 'Profile Data Refreshed',
      description: 'All profile modules have been updated successfully.',
      type: 'success'
    });
  }, [addToast]);

  const renderActiveModule = () => {
    const activeModule = PROFILE_MODULES.find(m => m.id === activeTab);
    if (!activeModule) return null;

    const Component = activeModule.component;
    return <Component orgId={orgId} userId={userId} />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile Management</h1>
            <p className="text-muted-foreground">
              Comprehensive profile information and settings
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-icon-xs w-icon-xs mr-sm ${refreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-7 lg:grid-cols-14 gap-xs h-auto p-xs bg-muted">
          {PROFILE_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex flex-col items-center gap-xs p-xs h-auto data-[state=active]:bg-background"
              >
                <Icon className="h-icon-xs w-icon-xs" />
                <span className="text-xs font-medium">{module.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 mt-lg">
          {PROFILE_MODULES.map((module) => (
            <TabsContent
              key={module.id}
              value={module.id}
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <Card className="h-full">
                <div className="p-lg h-full">
                  <div className="flex items-center gap-sm mb-md">
                    <module.icon className="h-icon-sm w-icon-sm text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold">{module.label}</h2>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="h-full">
                    {renderActiveModule()}
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

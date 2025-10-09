'use client';




import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@ghxstship/ui";

import { useState } from 'react';
import { Briefcase, DollarSign, FileText, LayoutDashboard, MessageSquare, Search, Settings, Star, User } from 'lucide-react';
import OpenDeckDashboard from './OpenDeckDashboard';
import VendorProfileClient from './VendorProfileClient';
import ProjectPostingClient from './ProjectPostingClient';
import OpenDeckClient from './OpenDeckClient';

interface OpenDeckMarketplaceProps {
  orgId: string;
  userId: string;
  userRole: 'vendor' | 'client' | 'both';
}

export default function OpenDeckMarketplace({ orgId, userId, userRole }: OpenDeckMarketplaceProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="brand-opendeck stack-lg">
      <div className="brand-opendeck flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-heading-3">OPENDECK MARKETPLACE</h1>
          <p className="color-muted">
            Digital marketplace for live and experiential entertainment
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Dashboard</span>
          </TabsTrigger>
          
          {(userRole === 'vendor' || userRole === 'both') && (
            <TabsTrigger value="profile">
              <User className="h-icon-xs w-icon-xs mr-sm" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="projects">
            <Briefcase className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Projects</span>
          </TabsTrigger>
          
          <TabsTrigger value="browse">
            <Search className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Browse</span>
          </TabsTrigger>
          
          <TabsTrigger value="messages">
            <MessageSquare className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Messages</span>
          </TabsTrigger>
          
          <TabsTrigger value="payments">
            <DollarSign className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Payments</span>
          </TabsTrigger>
          
          <TabsTrigger value="reviews">
            <Star className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Reviews</span>
          </TabsTrigger>
          
          <TabsTrigger value="contracts">
            <FileText className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Contracts</span>
          </TabsTrigger>
          
          <TabsTrigger value="settings">
            <Settings className="h-icon-xs w-icon-xs mr-sm" />
            <span className="hidden lg:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <OpenDeckDashboard orgId={orgId} userId={userId} userRole={userRole} />
        </TabsContent>

        {(userRole === 'vendor' || userRole === 'both') && (
          <TabsContent value="profile">
            <VendorProfileClient userId={userId} orgId={orgId} />
          </TabsContent>
        )}

        <TabsContent value="projects">
          <ProjectPostingClient userId={userId} orgId={orgId} />
        </TabsContent>

        <TabsContent value="browse">
          <OpenDeckClient orgId={orgId} />
        </TabsContent>

        <TabsContent value="messages">
          <div className="brand-opendeck text-center py-xsxl">
            <MessageSquare className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
            <h3 className="text-body text-heading-4 mb-sm">Messages</h3>
            <p className="color-muted">Communication hub coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="brand-opendeck text-center py-xsxl">
            <DollarSign className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
            <h3 className="text-body text-heading-4 mb-sm">Payments & Escrow</h3>
            <p className="color-muted">Payment processing coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="brand-opendeck text-center py-xsxl">
            <Star className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
            <h3 className="text-body text-heading-4 mb-sm">Reviews & Ratings</h3>
            <p className="color-muted">Reputation system coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="brand-opendeck text-center py-xsxl">
            <FileText className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
            <h3 className="text-body text-heading-4 mb-sm">Contracts</h3>
            <p className="color-muted">Contract management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="brand-opendeck text-center py-xsxl">
            <Settings className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
            <h3 className="text-body text-heading-4 mb-sm">Marketplace Settings</h3>
            <p className="color-muted">Settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

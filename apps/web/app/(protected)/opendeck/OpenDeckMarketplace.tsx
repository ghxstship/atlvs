'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import { 
  LayoutDashboard, Briefcase, User, Search, MessageSquare, 
  DollarSign, Star, FileText, Settings
} from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OPENDECK MARKETPLACE</h1>
          <p className="text-muted-foreground">
            Digital marketplace for live and experiential entertainment
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Dashboard</span>
          </TabsTrigger>
          
          {(userRole === 'vendor' || userRole === 'both') && (
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="projects">
            <Briefcase className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Projects</span>
          </TabsTrigger>
          
          <TabsTrigger value="browse">
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Browse</span>
          </TabsTrigger>
          
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Messages</span>
          </TabsTrigger>
          
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Payments</span>
          </TabsTrigger>
          
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Reviews</span>
          </TabsTrigger>
          
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Contracts</span>
          </TabsTrigger>
          
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
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
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Messages</h3>
            <p className="text-muted-foreground">Communication hub coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Payments & Escrow</h3>
            <p className="text-muted-foreground">Payment processing coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Reviews & Ratings</h3>
            <p className="text-muted-foreground">Reputation system coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Contracts</h3>
            <p className="text-muted-foreground">Contract management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Marketplace Settings</h3>
            <p className="text-muted-foreground">Settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

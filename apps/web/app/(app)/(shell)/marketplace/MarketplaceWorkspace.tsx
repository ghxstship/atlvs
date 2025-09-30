'use client';



import { LayoutDashboard, Briefcase, User, Search, MessageSquare, DollarSign, Star, FileText, Settings } from "lucide-react";
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import MarketplaceDashboard from './MarketplaceDashboard';
import MarketplaceVendorProfileClient from './MarketplaceVendorProfileClient';
import ProjectPostingClient from './ProjectPostingClient';
import MarketplaceClient from './MarketplaceClient';

interface MarketplaceWorkspaceProps {
 orgId: string;
 userId: string;
 userRole: 'vendor' | 'client' | 'both';
}

export default function MarketplaceWorkspace({ orgId, userId, userRole }: MarketplaceWorkspaceProps) {
 const [activeTab, setActiveTab] = useState('dashboard');

 return (
 <div className="brand-marketplace stack-lg">
 <div className="brand-marketplace flex items-center justify-between">
 <div>
 <h1 className="text-heading-2 text-heading-3">MARKETPLACE</h1>
 <p className="color-muted">
 Digital marketplace for live and experiential entertainment
 </p>
 </div>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
 <TabsTrigger value="dashboard">
 <LayoutDashboard className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Dashboard</span>
 </TabsTrigger>
 
 {(userRole === 'vendor' || userRole === 'both') && (
 <TabsTrigger value="profile">
 <User className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Profile</span>
 </TabsTrigger>
 )}
 
 <TabsTrigger value="projects">
 <Briefcase className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Projects</span>
 </TabsTrigger>
 
 <TabsTrigger value="browse">
 <Search className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Browse</span>
 </TabsTrigger>
 
 <TabsTrigger value="messages">
 <MessageSquare className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Messages</span>
 </TabsTrigger>
 
 <TabsTrigger value="payments">
 <DollarSign className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Payments</span>
 </TabsTrigger>
 
 <TabsTrigger value="reviews">
 <Star className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Reviews</span>
 </TabsTrigger>
 
 <TabsTrigger value="contracts">
 <FileText className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Contracts</span>
 </TabsTrigger>
 
 <TabsTrigger value="settings">
 <Settings className="h-4 w-4 mr-sm" />
 <span className="hidden lg:inline">Settings</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="dashboard">
 <MarketplaceDashboard orgId={orgId} userId={userId} userRole={userRole} />
 </TabsContent>

 {(userRole === 'vendor' || userRole === 'both') && (
 <TabsContent value="profile">
 <MarketplaceVendorProfileClient userId={userId} orgId={orgId} />
 </TabsContent>
 )}

 <TabsContent value="projects">
 <ProjectPostingClient userId={userId} orgId={orgId} />
 </TabsContent>

 <TabsContent value="browse">
 <MarketplaceClient orgId={orgId} />
 </TabsContent>

 <TabsContent value="messages">
 <div className="brand-marketplace text-center py-2xl">
 <MessageSquare className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">Messages</h3>
 <p className="color-muted">Communication hub coming soon...</p>
 </div>
 </TabsContent>

 <TabsContent value="payments">
 <div className="brand-marketplace text-center py-2xl">
 <DollarSign className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">Payments & Escrow</h3>
 <p className="color-muted">Payment processing coming soon...</p>
 </div>
 </TabsContent>

 <TabsContent value="reviews">
 <div className="brand-marketplace text-center py-2xl">
 <Star className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">Reviews & Ratings</h3>
 <p className="color-muted">Reputation system coming soon...</p>
 </div>
 </TabsContent>

 <TabsContent value="contracts">
 <div className="brand-marketplace text-center py-2xl">
 <FileText className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">Contracts</h3>
 <p className="color-muted">Contract management coming soon...</p>
 </div>
 </TabsContent>

 <TabsContent value="settings">
 <div className="brand-marketplace text-center py-2xl">
 <Settings className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">Marketplace Settings</h3>
 <p className="color-muted">Settings coming soon...</p>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
}

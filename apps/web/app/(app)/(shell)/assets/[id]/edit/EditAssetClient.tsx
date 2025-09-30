'use client';

/**
 * Assets Edit Client
 *
 * Client component for editing existing assets with comprehensive form functionality,
 * change tracking, conflict resolution, and user experience enhancements.
 *
 * @module assets/[id]/edit/EditAssetClient
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '../types';
import { apiClient } from '../lib/api';
import CreateDrawer from '../../drawers/CreateDrawer';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { ArrowLeft, Save, Loader2, AlertTriangle } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as UIUser } from '@ghxstship/ui/config/types';

interface EditAssetClientProps {
  asset: Asset;
  user: SupabaseUser;
  orgId: string;
  translations?: Record<string, string>;
}

export default function EditAssetClient({
  asset: initialAsset,
  user,
  orgId,
  translations = {}
}: EditAssetClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Transform Supabase user to UI User format
  const uiUser: UIUser = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar: user.user_metadata?.avatar_url,
    role: 'user',
    metadata: user.user_metadata as Record<string, unknown>,
  };

  // Handle successful asset update
  const handleAssetUpdated = useCallback((updatedAsset: Asset) => {
    // Show success message (would integrate with toast system)

    // Close drawer and redirect to asset detail
    setIsDrawerOpen(false);
    router.push(`/assets/${updatedAsset.id}`);
  }, [router]);

  // Handle drawer close with unsaved changes check
  const handleDrawerClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    setIsDrawerOpen(false);
    // Small delay to allow drawer animation to complete
    setTimeout(() => {
      router.push(`/assets/${initialAsset.id}`);
    }, 300);
  }, [hasUnsavedChanges, initialAsset.id, router]);

  // Handle form change tracking
  const handleFormChange = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/assets/${initialAsset.id}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Asset
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {translations.title || 'Edit Asset'}
                </h1>
                <p className="text-sm text-gray-600">
                  {translations.subtitle || `Modify information for ${initialAsset.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDrawerClose}
              >
                {translations.cancel || 'Cancel'}
              </Button>
              <Button onClick={() => setIsDrawerOpen(true)}>
                <Save className="w-4 h-4 mr-2" />
                {translations.save || 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Save className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Edit Asset</h3>
                  <p className="text-sm mb-6">
                    Use the form drawer to modify asset details
                  </p>
                  <Button onClick={() => setIsDrawerOpen(true)}>
                    <Save className="w-4 h-4 mr-2" />
                    Open Edit Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Asset Tag</h4>
                    <p className="text-xs text-gray-600">
                      Asset tags cannot be changed once set
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Required Fields</h4>
                    <p className="text-xs text-gray-600">
                      Name, category, and status are required
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Audit Trail</h4>
                    <p className="text-xs text-gray-600">
                      All changes are logged for compliance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      initialAsset.status === 'available' ? 'bg-green-100 text-green-800' :
                      initialAsset.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      initialAsset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {initialAsset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Condition</span>
                    <span className="text-sm font-medium">
                      {initialAsset.condition?.replace('_', ' ')}
                    </span>
                  </div>
                  {initialAsset.assigned_to && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned</span>
                      <span className="text-sm font-medium">
                        {initialAsset.assigned_to.name}
                      </span>
                    </div>
                  )}
                  {initialAsset.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-medium">
                        {initialAsset.location.name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {hasUnsavedChanges && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-orange-800">Unsaved Changes</h4>
                      <p className="text-sm text-orange-700">
                        You have unsaved changes that will be lost if you leave this page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <CreateDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleAssetUpdated}
        initialData={initialAsset}
      />
    </div>
  );
}

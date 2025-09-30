'use client';

/**
 * Assets Create Client
 *
 * Client component for asset creation with full form functionality,
 * validation, auto-save, and user experience enhancements.
 *
 * @module assets/create/CreateAssetClient
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '../types';
import { apiClient } from '../lib/api';
import CreateDrawer from '../drawers/CreateDrawer';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { ArrowLeft, Plus, Save, Loader2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as UIUser } from '@ghxstship/ui/config/types';

interface CreateAssetClientProps {
  user: SupabaseUser;
  orgId: string;
  translations?: Record<string, string>;
}

export default function CreateAssetClient({
  user,
  orgId,
  translations = {}
}: CreateAssetClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Transform Supabase user to UI User format
  const uiUser: UIUser = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar: user.user_metadata?.avatar_url,
    role: 'user',
    metadata: user.user_metadata as Record<string, unknown>,
  };

  // Handle successful asset creation
  const handleAssetCreated = useCallback((asset: Asset) => {
    // Show success message (would integrate with toast system)

    // Close drawer and redirect to asset detail
    setIsDrawerOpen(false);
    router.push(`/assets/${asset.id}`);
  }, [router]);

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    // Small delay to allow drawer animation to complete
    setTimeout(() => {
      router.push('/assets');
    }, 300);
  }, [router]);

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
                onClick={() => router.push('/assets')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Assets
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {translations.title || 'Create New Asset'}
                </h1>
                <p className="text-sm text-gray-600">
                  {translations.subtitle || 'Add a new asset to your inventory'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/assets')}
              >
                {translations.cancel || 'Cancel'}
              </Button>
              <Button onClick={() => setIsDrawerOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {translations.create || 'Create Asset'}
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
                  <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Create New Asset</h3>
                  <p className="text-sm mb-6">
                    Use the form drawer to add comprehensive asset details
                  </p>
                  <Button onClick={() => setIsDrawerOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Open Creation Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Asset Tag</h4>
                    <p className="text-xs text-gray-600">
                      Choose a unique identifier for easy tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Categories</h4>
                    <p className="text-xs text-gray-600">
                      Select the most appropriate category for organization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Images</h4>
                    <p className="text-xs text-gray-600">
                      Upload clear photos for better asset documentation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent assets to display
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Drawer */}
      <CreateDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleAssetCreated}
      />
    </div>
  );
}

'use client';

/**
 * Assets Detail Client
 *
 * Client component for displaying comprehensive asset details
 * with navigation, actions, and related information.
 *
 * @module assets/[id]/AssetDetailClient
 */

import React, { useState, useCallback } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Asset } from '../types';
import { apiClient } from '../lib/api';
import DetailDrawer from '../drawers/DetailDrawer';
import CreateDrawer from '../drawers/CreateDrawer';
import { Badge, Button, Card, CardBody, CardContent, CardHeader, CardTitle, Separator } from '@ghxstship/ui';
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle, Clock, Copy, DollarSign, Download, Edit, History, MapPin, Package, Settings, Trash2, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AssetDetailClientProps {
  asset: Asset;
  user: SupabaseUser;
  orgId: string;
  userRole: string;
  translations?: Record<string, string>;
}

export default function AssetDetailClient({
  asset: initialAsset,
  user,
  orgId,
  userRole,
  translations = {}
}: AssetDetailClientProps) {
  const router = useRouter();
  const [asset, setAsset] = useState(initialAsset);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Permission checks
  const canEdit = ['owner', 'admin', 'manager'].includes(userRole);
  const canDelete = ['owner', 'admin'].includes(userRole);
  const canAssign = ['owner', 'admin', 'manager'].includes(userRole);
  const canMaintain = ['owner', 'admin', 'manager'].includes(userRole);

  // Handle asset update
  const handleAssetUpdate = useCallback((updatedAsset: Asset) => {
    setAsset(updatedAsset);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle asset deletion
  const handleAssetDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteAsset(asset.id);
      router.push('/assets');
    } catch (error) {
      console.error('Failed to delete asset:', error);
      // Show error toast
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id, router]);

  // Handle asset duplication
  const handleAssetDuplicate = useCallback(() => {
    const duplicateData = {
      ...asset,
      name: `${asset.name} (Copy)`,
      asset_tag: '', // Will be generated
      status: 'available' as const,
      assigned_to: undefined
    };
    delete duplicateData.id;
    delete duplicateData.created_at;
    delete duplicateData.updated_at;

    // Open create drawer with duplicate data
    setIsEditDrawerOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      available: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      in_use: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: User },
      maintenance: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
      retired: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package },
      lost: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      damaged: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const statusDisplay = getStatusDisplay(asset.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
          <div className="flex items-center justify-between h-component-md">
            <div className="flex items-center gap-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/assets')}
                className="flex items-center gap-xs"
              >
                <ArrowLeft className="w-icon-xs h-icon-xs" />
                {translations.back || 'Back to Assets'}
              </Button>
              <div className="h-icon-md w-px bg-gray-300" />
              <div className="flex items-center gap-sm">
                {asset.image_urls?.[0] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.image_urls[0]}
                      alt={asset.name}
                      className="w-icon-xl h-icon-xl rounded-lg object-cover"
                    />
                  </>
                ) : (
                  <div className="w-icon-xl h-icon-xl rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-icon-sm h-icon-sm text-gray-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {asset.name}
                  </h1>
                  <div className="flex items-center gap-xs">
                    <Badge variant="secondary" className="font-mono">
                      {asset.asset_tag}
                    </Badge>
                    <Badge className={statusDisplay.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailDrawerOpen(true)}
              >
                <History className="w-icon-xs h-icon-xs mr-2" />
                {translations.history || 'History'}
              </Button>

              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditDrawerOpen(true)}
                >
                  <Edit className="w-icon-xs h-icon-xs mr-2" />
                  {translations.edit || 'Edit'}
                </Button>
              )}

              <Button variant="secondary" size="sm">
                <Download className="w-icon-xs h-icon-xs mr-2" />
                {translations.export || 'Export'}
              </Button>

              {canDelete && (
                <Button
                  variant="error"
                  size="sm"
                  onClick={handleAssetDelete}
                >
                  <Trash2 className="w-icon-xs h-icon-xs mr-2" />
                  {translations.delete || 'Delete'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900 capitalize mt-1">
                      {asset.category?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Condition</label>
                    <p className="text-sm text-gray-900 capitalize mt-1">
                      {asset.condition?.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {asset.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{asset.description}</p>
                  </div>
                )}

                <Separator />

                {/* Assignment & Location */}
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned To</label>
                    {asset.assigned_to ? (
                      <div className="flex items-center gap-xs">
                        {asset.assigned_to.avatar && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.assigned_to.avatar}
                              alt={asset.assigned_to.name}
                              className="w-icon-lg h-icon-lg rounded-full"
                            />
                          </>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {asset.assigned_to.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {asset.assigned_to.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not assigned</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                    {asset.location ? (
                      <div className="flex items-center gap-xs">
                        <MapPin className="w-icon-xs h-icon-xs text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {asset.location.name}
                          </p>
                          {asset.location.address && (
                            <p className="text-xs text-gray-500">
                              {asset.location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No location set</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {asset.image_urls && asset.image_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Asset Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                    {asset.image_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img                           src={url}
                          alt={`${asset.name} - Image ${index + 1}`}
                          className="w-full h-component-xl object-cover rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {/* Open image viewer */}}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                {canAssign && asset.status === 'available' && (
                  <Button
                    className="w-full justify-start"
                    variant="secondary"
                    onClick={() => {/* Handle assign */}}
                  >
                    <User className="w-icon-xs h-icon-xs mr-2" />
                    {translations.assign || 'Assign Asset'}
                  </Button>
                )}

                {canMaintain && (
                  <Button
                    className="w-full justify-start"
                    variant="secondary"
                    onClick={() => {/* Handle maintenance */}}
                  >
                    <Settings className="w-icon-xs h-icon-xs mr-2" />
                    {translations.maintenance || 'Schedule Maintenance'}
                  </Button>
                )}

                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={handleAssetDuplicate}
                >
                  <Copy className="w-icon-xs h-icon-xs mr-2" />
                  {translations.duplicate || 'Duplicate Asset'}
                </Button>
              </CardContent>
            </Card>

            {/* Financial Info */}
            {(asset.purchase_price || asset.current_value) && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-sm">
                  {asset.purchase_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Purchase Price</span>
                      <span className="text-sm font-medium">${asset.purchase_price.toLocaleString()}</span>
                    </div>
                  )}
                  {asset.current_value && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Value</span>
                      <span className="text-sm font-medium">${asset.current_value.toLocaleString()}</span>
                    </div>
                  )}
                  {asset.warranty_expiry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Warranty</span>
                      <span className={`text-sm font-medium ${
                        new Date(asset.warranty_expiry) > new Date() ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {new Date(asset.warranty_expiry) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">
                    {new Date(asset.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {asset.serial_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Serial</span>
                    <span className="text-sm font-mono">{asset.serial_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        asset={asset}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onEdit={() => {
          setIsDetailDrawerOpen(false);
          setIsEditDrawerOpen(true);
        }}
        onDelete={handleAssetDelete}
        onDuplicate={handleAssetDuplicate}
      />

      {/* Edit Drawer */}
      <CreateDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSuccess={handleAssetUpdate}
        initialData={asset}
      />
    </div>
  );
}

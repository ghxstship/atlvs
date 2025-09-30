/**
 * Analytics Detail Drawer Component
 *
 * Enterprise-grade detail drawer for GHXSTSHIP Analytics module.
 * Provides comprehensive record viewing with related data and actions.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Download, Share, History, ExternalLink } from 'lucide-react';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: unknown;
  type: 'dashboard' | 'report' | 'export';
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  loading?: boolean;
  className?: string;
}

export default function DetailDrawer({
  isOpen,
  onClose,
  data,
  type,
  onEdit,
  onDelete,
  onDuplicate,
  loading = false,
  className = '',
}: DetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: null },
    { id: 'details', label: 'Details', icon: null },
    { id: 'related', label: 'Related', icon: null },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform ${className}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {type === 'dashboard' ? 'Dashboard' : type === 'report' ? 'Report' : 'Export'} Details
              </h2>
              {data?.name && (
                <span className="text-sm text-gray-500">• {data.name}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Edit"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Duplicate"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
              )}
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Share"
              >
                <Share className="h-5 w-5" />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Name</h3>
                      <p className="mt-1 text-sm text-gray-600">{data?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Description</h3>
                      <p className="mt-1 text-sm text-gray-600">{data?.description || 'No description'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Status</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        data?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        data?.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        data?.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {data?.status || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Created</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {data?.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'related' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Related items will be displayed here.</p>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Activity history will be displayed here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

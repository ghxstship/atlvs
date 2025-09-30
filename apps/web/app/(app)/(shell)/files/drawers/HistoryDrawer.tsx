"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  User,
  FileText,
  Edit,
  Trash2,
  Download,
  Share,
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Button, Badge, Separator, ScrollArea } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface HistoryDrawerProps {
  file: DigitalAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'delete' | 'create' | 'restore';
  details?: string;
  ip_address?: string;
  user_agent?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export default function HistoryDrawer({
  file,
  isOpen,
  onClose,
}: HistoryDrawerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      loadAuditLogs();
    }
  }, [isOpen, file]);

  const loadAuditLogs = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll simulate audit logs
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          user_id: file.created_by,
          user_name: 'John Doe',
          action: 'edit',
          details: 'Updated file description and tags',
          ip_address: '192.168.1.100',
          changes: {
            description: { old: '', new: file.description },
            tags: { old: [], new: file.tags },
          },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          user_id: file.created_by,
          user_name: 'John Doe',
          action: 'download',
          details: 'Downloaded file',
          ip_address: '192.168.1.100',
        },
        {
          id: '3',
          timestamp: new Date(file.created_at).toISOString(),
          user_id: file.created_by,
          user_name: 'John Doe',
          action: 'create',
          details: 'File uploaded',
        },
      ];

      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'edit':
        return <Edit className="w-4 h-4 text-orange-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-green-500" />;
      case 'share':
        return <Share className="w-4 h-4 text-purple-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'create':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'restore':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'text-blue-600 bg-blue-50';
      case 'edit':
        return 'text-orange-600 bg-orange-50';
      case 'download':
        return 'text-green-600 bg-green-50';
      case 'share':
        return 'text-purple-600 bg-purple-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'restore':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderChanges = (changes?: Record<string, { old: unknown; new: unknown }>) => {
    if (!changes || Object.keys(changes).length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Changes Made</h5>
        <div className="space-y-2">
          {Object.entries(changes).map(([field, change]) => (
            <div key={field} className="text-sm">
              <span className="font-medium capitalize">{field}:</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Before:</span>
                  <div className="text-xs bg-red-50 text-red-700 p-1 rounded mt-1">
                    {Array.isArray(change.old) ? change.old.join(', ') : String(change.old || 'Empty')}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">After:</span>
                  <div className="text-xs bg-green-50 text-green-700 p-1 rounded mt-1">
                    {Array.isArray(change.new) ? change.new.join(', ') : String(change.new || 'Empty')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-xl transform transition-transform overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">File History</h2>
            <p className="text-sm text-gray-500">
              Audit trail for {file.title}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Audit Log List */}
            <div className="border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Activity Timeline</h3>
                <p className="text-sm text-gray-500">{auditLogs.length} events</p>
              </div>

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading history...</p>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No activity recorded</p>
                    </div>
                  ) : (
                    auditLogs.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedEntry?.id === entry.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded ${getActionColor(entry.action)}`}>
                            {getActionIcon(entry.action)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {entry.action}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {entry.user_name}
                              </Badge>
                            </div>

                            {entry.details && (
                              <p className="text-sm text-gray-600 truncate">
                                {entry.details}
                              </p>
                            )}

                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Entry Details */}
            <div className="col-span-2 p-6">
              {selectedEntry ? (
                <div className="space-y-6">
                  {/* Entry Header */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getActionColor(selectedEntry.action)}`}>
                      {getActionIcon(selectedEntry.action)}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {selectedEntry.action} Event
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTimestamp(selectedEntry.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Entry Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">User Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{selectedEntry.user_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <span className="ml-2 font-mono text-xs">{selectedEntry.user_id}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Technical Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">IP Address:</span>
                          <span className="ml-2 font-mono text-xs">{selectedEntry.ip_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Event ID:</span>
                          <span className="ml-2 font-mono text-xs">{selectedEntry.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  {selectedEntry.details && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedEntry.details}
                      </p>
                    </div>
                  )}

                  {/* Changes */}
                  {renderChanges(selectedEntry.changes)}

                  {/* User Agent */}
                  {selectedEntry.user_agent && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Browser Information</h4>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                        {selectedEntry.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
                  <p className="text-gray-500">
                    Choose an event from the timeline to view detailed information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

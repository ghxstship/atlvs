/**
 * Enhanced Universal Drawer with Full Supabase Integration
 * Enterprise-ready drawer with real-time CRUD, comments, activity, files, and optimistic UI
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ghxstship/ui/components/Dialog';
import { Button } from '@ghxstship/ui/components/Button';
import { Input } from '@ghxstship/ui/components/Input';
import { Textarea } from '@ghxstship/ui/components/Textarea';
import { Select } from '@ghxstship/ui/components/Select';
import { Badge } from '@ghxstship/ui/components/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui/components/Tabs';
import { Loader } from '@ghxstship/ui/components/Loader';
import { Alert } from '@ghxstship/ui/components/Alert';
import { useSupabaseData } from '../providers/SupabaseDataProvider';
import type { DataRecord, FieldConfig } from '../types';
import { 
  Edit3, 
  Save, 
  X, 
  MessageSquare, 
  Activity, 
  FileText, 
  Upload,
  Download,
  Trash2,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';

interface EnhancedUniversalDrawerProps {
  open: boolean;
  onClose: () => void;
  record: DataRecord | null;
  fields: FieldConfig[];
  mode: 'view' | 'edit' | 'create';
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
  title?: string;
  enableComments?: boolean;
  enableActivity?: boolean;
  enableFiles?: boolean;
  enableVersioning?: boolean;
}

export function EnhancedUniversalDrawer({
  open,
  onClose,
  record,
  fields,
  mode,
  onModeChange,
  title,
  enableComments = true,
  enableActivity = true,
  enableFiles = true,
  enableVersioning = false
}: EnhancedUniversalDrawerProps) {
  const supabaseData = useSupabaseData();
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [originalData, setOriginalData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Activity state
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  
  // Files state
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  
  // Form validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      setFormData(record);
      setOriginalData(record);
    } else if (mode === 'create') {
      // Initialize with default values
      const defaultData: Record<string, any> = {};
      fields.forEach(field => {
        if (field.type === 'boolean') {
          defaultData[field.key] = false;
        } else if (field.type === 'number') {
          defaultData[field.key] = 0;
        } else {
          defaultData[field.key] = '';
        }
      });
      setFormData(defaultData);
      setOriginalData({});
    }
    
    setFieldErrors({});
    setHasUnsavedChanges(false);
    setError(null);
  }, [record, mode, fields]);

  // Load additional data when drawer opens
  useEffect(() => {
    if (open && record?.id) {
      loadComments();
      loadActivity();
      loadFiles();
    }
  }, [open, record?.id]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!record?.id || !enableComments) return;
    
    try {
      setCommentsLoading(true);
      const commentsData = await supabaseData.getRecordComments(record.id);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [record?.id, enableComments, supabaseData]);

  // Load activity
  const loadActivity = useCallback(async () => {
    if (!record?.id || !enableActivity) return;
    
    try {
      setActivityLoading(true);
      const activityData = await supabaseData.getRecordActivity(record.id);
      setActivity(activityData);
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, [record?.id, enableActivity, supabaseData]);

  // Load files
  const loadFiles = useCallback(async () => {
    if (!record?.id || !enableFiles) return;
    
    try {
      setFilesLoading(true);
      const filesData = await supabaseData.getRecordFiles(record.id);
      setFiles(filesData);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setFilesLoading(false);
    }
  }, [record?.id, enableFiles, supabaseData]);

  // Add comment
  const addComment = useCallback(async () => {
    if (!record?.id || !newComment.trim()) return;
    
    try {
      const comment = await supabaseData.addComment(record.id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  }, [record?.id, newComment, supabaseData]);

  // Validate field
  const validateField = useCallback((field: FieldConfig, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }
    
    if (field.validation) {
      const result = field.validation(value, formData);
      if (typeof result === 'string') {
        return result;
      } else if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }
    }
    
    return null;
  }, [formData]);

  // Handle field change
  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldKey]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  }, [fieldErrors]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        errors[field.key] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fields, formData, validateField]);

  // Save record
  const handleSave = useCallback(async () => {
    if (!validateAllFields()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      if (mode === 'create') {
        const newRecord = await supabaseData.createRecord(formData);
        setOriginalData(newRecord);
        onModeChange?.('view');
      } else if (record?.id) {
        // Apply optimistic update
        supabaseData.optimisticUpdate(record.id, formData);
        
        const updatedRecord = await supabaseData.updateRecord(record.id, formData);
        setOriginalData(updatedRecord);
        onModeChange?.('view');
      }
      
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record');
      
      // Revert optimistic update on error
      if (record?.id) {
        supabaseData.revertOptimisticUpdate(record.id);
      }
    } finally {
      setSaving(false);
    }
  }, [validateAllFields, mode, formData, record?.id, supabaseData, onModeChange]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setFormData(originalData);
        setFieldErrors({});
        setHasUnsavedChanges(false);
        onModeChange?.('view');
      }
    } else {
      onModeChange?.('view');
    }
  }, [hasUnsavedChanges, originalData, onModeChange]);

  // Delete record
  const handleDelete = useCallback(async () => {
    if (!record?.id) return;
    
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        setLoading(true);
        await supabaseData.deleteRecord(record.id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete record');
      } finally {
        setLoading(false);
      }
    }
  }, [record?.id, supabaseData, onClose]);

  // Render field based on type
  const renderField = useCallback((field: FieldConfig) => {
    const value = formData[field.key];
    const isEditing = mode === 'edit' || mode === 'create';
    const error = fieldErrors[field.key];

    if (!isEditing) {
      // View mode
      return (
        <div key={field.key} className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </label>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {field.type === 'boolean' ? (
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'Yes' : 'No'}
              </Badge>
            ) : field.type === 'select' && field.options ? (
              field.options.find(opt => opt.value === value)?.label || value
            ) : field.type === 'date' ? (
              value ? new Date(value).toLocaleDateString() : '-'
            ) : field.type === 'datetime' ? (
              value ? new Date(value).toLocaleString() : '-'
            ) : (
              value || '-'
            )}
          </div>
        </div>
      );
    }

    // Edit mode
    const commonProps = {
      value: value || '',
      onChange: (e: any) => handleFieldChange(field.key, e.target.value),
      error: error,
      required: field.required
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              {...commonProps}
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              {...commonProps}
              type="number"
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              {...commonProps}
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Select
              {...commonProps}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              {...commonProps}
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
            />
          </div>
        );

      case 'datetime':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              {...commonProps}
              type="datetime-local"
              value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            />
          </div>
        );

      default:
        return null;
    }
  }, [formData, mode, fieldErrors, handleFieldChange]);

  const drawerTitle = title || (mode === 'create' ? 'Create Record' : record?.name || record?.title || 'Record Details');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{drawerTitle}</DialogTitle>
            <div className="flex items-center gap-2">
              {mode === 'view' && record && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModeChange?.('edit')}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
              
              {(mode === 'edit' || mode === 'create') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                  >
                    {saving ? (
                      <Loader className="h-4 w-4 mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </div>
          )}
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="flex-shrink-0">
            {error}
          </Alert>
        )}

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-1" />
                Details
              </TabsTrigger>
              
              {enableComments && record && (
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comments ({comments.length})
                </TabsTrigger>
              )}
              
              {enableActivity && record && (
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-1" />
                  Activity
                </TabsTrigger>
              )}
              
              {enableFiles && record && (
                <TabsTrigger value="files">
                  <Upload className="h-4 w-4 mr-1" />
                  Files ({files.length})
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="details" className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map(renderField)}
                </div>
              </TabsContent>

              {enableComments && (
                <TabsContent value="comments" className="p-4">
                  <div className="space-y-4">
                    {/* Add comment */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Comments list */}
                    {commentsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader />
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3">
                        {comments.map(comment => (
                          <div key={comment.id} className="border-l-2 border-gray-200 pl-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">
                                {comment.profiles?.full_name || 'Unknown User'}
                              </span>
                              <span>•</span>
                              <span>{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <div className="mt-1 text-sm">{comment.body}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No comments yet. Be the first to add one!
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {enableActivity && (
                <TabsContent value="activity" className="p-4">
                  {activityLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader />
                    </div>
                  ) : activity.length > 0 ? (
                    <div className="space-y-3">
                      {activity.map(log => (
                        <div key={log.id} className="border-l-2 border-blue-200 pl-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">
                              {log.profiles?.full_name || 'System'}
                            </span>
                            <span>•</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="capitalize">{log.action}</span> {log.table_name}
                            {log.changes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(log.changes)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No activity recorded yet.
                    </div>
                  )}
                </TabsContent>
              )}

              {enableFiles && (
                <TabsContent value="files" className="p-4">
                  {filesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader />
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-3">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {file.size && `${(file.size / 1024).toFixed(1)} KB`} • 
                              {new Date(file.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No files attached yet.
                    </div>
                  )}
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedUniversalDrawer;

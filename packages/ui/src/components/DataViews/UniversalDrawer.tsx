'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Drawer } from '../Drawer';
import { Button } from '../Button';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Select } from '../Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import { Badge } from '../Badge';
import { Alert } from '../Alert';
import { Loader } from '../Loader';
import { 
  Edit3, 
  FileText, 
  MessageSquare, 
  Activity, 
  BarChart3,
  Save,
  X,
  Send,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { DataRecord, FieldConfig } from './types';

interface UniversalDrawerProps {
  open: boolean;
  onClose: () => void;
  record: DataRecord | null;
  fields: FieldConfig[];
  mode: 'view' | 'edit' | 'create';
  title?: string;
  loading?: boolean;
  error?: string;
  success?: string;
  
  // CRUD operations
  onSave?: (data: Record<string, any>) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onDuplicate?: (record: DataRecord) => Promise<void> | void;
  
  // Comments and activity
  comments?: Array<{
    id: string;
    content: string;
    author: string;
    createdAt: Date;
    avatar?: string;
  }>;
  activity?: Array<{
    id: string;
    action: string;
    description: string;
    author: string;
    createdAt: Date;
  }>;
  onAddComment?: (content: string) => Promise<void> | void;
  
  // Analytics data
  analytics?: {
    views: number;
    edits: number;
    comments: number;
    lastModified: Date;
    createdAt: Date;
    [key: string]: any;
  };
  
  // Customization
  tabs?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
  }>;
  
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    onClick: (record: DataRecord) => void;
  }>;
}

export function UniversalDrawer({
  open,
  onClose,
  record,
  fields,
  mode,
  title,
  loading = false,
  error,
  success,
  onSave,
  onDelete,
  onDuplicate,
  comments = [],
  activity = [],
  onAddComment,
  analytics,
  tabs = [],
  actions = []
}: UniversalDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>('details');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.key] = record[field.key] || '';
      });
      setFormData(initialData);
    } else {
      // Reset for create mode
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.key] = field.type === 'boolean' ? false : '';
      });
      setFormData(initialData);
    }
  }, [record, fields]);

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, onSave]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !onAddComment) return;
    
    setAddingComment(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setAddingComment(false);
    }
  }, [newComment, onAddComment]);

  const renderField = useCallback((field: FieldConfig) => {
    const value = formData[field.key] || '';
    const isReadonly = mode === 'view' || field.readonly;
    
    const commonProps = {
      label: field.label,
      value,
      disabled: isReadonly,
      required: field.required,
      onChange: (e: any) => handleFieldChange(field.key, e.target.value)
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.key}
            {...commonProps}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select
            key={field.key}
            {...commonProps}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'boolean':
        return (
          <div key={field.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              disabled={isReadonly}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="rounded"
            />
            <label className="text-sm font-medium">{field.label}</label>
          </div>
        );
      
      case 'date':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="number"
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
          />
        );
      
      case 'currency':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="number"
            step="0.01"
            prefix="$"
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
          />
        );
      
      default:
        return (
          <Input
            key={field.key}
            {...commonProps}
          />
        );
    }
  }, [formData, mode, handleFieldChange]);

  const formatValue = useCallback((value: any, field: FieldConfig) => {
    if (!value) return '-';
    
    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'select':
        const option = field.options?.find(opt => opt.value === value);
        return option?.label || value;
      default:
        return String(value);
    }
  }, []);

  const drawerTitle = title || (
    mode === 'create' ? 'Create New Record' :
    mode === 'edit' ? `Edit ${record?.name || 'Record'}` :
    record?.name || 'Record Details'
  );

  const defaultTabs = [
    {
      key: 'details',
      label: 'Details',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {mode === 'view' ? (
            <div className="space-y-3">
              {fields.filter(f => f.visible !== false).map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </label>
                  <div className="mt-1 text-sm text-foreground">
                    {formatValue(record?.[field.key], field)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {fields.filter(f => f.visible !== false).map(renderField)}
            </div>
          )}
        </div>
      )
    }
  ];

  if (mode !== 'create') {
    defaultTabs.push(
      {
        key: 'comments',
        label: 'Comments',
        icon: <MessageSquare className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            {onAddComment && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addingComment}
                  size="sm"
                >
                  {addingComment ? <Loader size="xs" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {comment.avatar ? (
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-muted-foreground">
                        {comment.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No comments yet</div>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        key: 'activity',
        label: 'Activity',
        icon: <Activity className="h-4 w-4" />,
        content: (
          <div className="space-y-3">
            {activity.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{item.author}</span>
                    <span className="text-muted-foreground"> {item.action}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.createdAt.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            {activity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No activity yet</div>
              </div>
            )}
          </div>
        )
      }
    );

    if (analytics) {
      defaultTabs.push({
        key: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Views</div>
                <div className="text-2xl font-semibold">{analytics.views || 0}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Comments</div>
                <div className="text-2xl font-semibold">{analytics.comments || 0}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{analytics.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Modified</span>
                <span>{analytics.lastModified.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
      });
    }
  }

  const allTabs = [...defaultTabs, ...tabs];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={drawerTitle}
      width="xl"
    >
      <div className="flex flex-col h-full">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader text="Loading..." />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                {allTabs.map(tab => (
                  <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {allTabs.map(tab => (
                <TabsContent key={tab.key} value={tab.key} className="flex-1 overflow-auto">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-border mt-4">
              <div className="flex items-center gap-2">
                {actions.map(action => (
                  <Button
                    key={action.key}
                    variant={action.variant === 'secondary' ? 'outline' : (action.variant || 'ghost')}
                    size="sm"
                    onClick={() => record && action.onClick(record)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
                
                {record && onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(record)}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {record && onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                {(mode === 'edit' || mode === 'create') && onSave && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader size="xs" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

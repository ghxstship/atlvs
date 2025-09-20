'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Drawer } from '../Drawer';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Textarea } from '../atomic/Textarea';
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
  Tag,
  Workflow,
  Paperclip,
  Users,
  Upload,
  Download,
  Play,
  Pause,
  Settings,
  Eye,
  Clock
} from 'lucide-react';
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
  
  // Workflow automation
  workflows?: Array<{
    id: string;
    name: string;
    description: string;
    trigger: 'manual' | 'status_change' | 'field_change' | 'time_based';
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
    actions: Array<{
      type: 'update_field' | 'send_notification' | 'create_task' | 'assign_user' | 'send_email';
      config: any;
    }>;
    enabled: boolean;
  }>;
  
  // Advanced attachments
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    thumbnail?: string;
  }>;
  onUploadAttachment?: (file: File) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  
  // Real-time collaboration
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'away' | 'offline';
    lastSeen?: Date;
  }>;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
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
  workflows = [],
  attachments = [],
  onUploadAttachment,
  onDeleteAttachment,
  collaborators = [],
  currentUser,
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
          <div key={field.key} className="flex items-center gap-sm">
            <input
              type="checkbox"
              checked={Boolean(value)}
              disabled={isReadonly}
              onChange={(e: any) => handleFieldChange(field.key, e.target.checked)}
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
            onChange={(e: any) => handleFieldChange(field.key, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <Input
            key={field.key}
            {...commonProps}
            type="number"
            onChange={(e: any) => handleFieldChange(field.key, Number(e.target.value))}
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
            onChange={(e: any) => handleFieldChange(field.key, Number(e.target.value))}
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
        <div className="space-y-md">
          {mode === 'view' ? (
            <div className="space-y-sm">
              {fields.filter(f => f.visible !== false).map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </label>
                  <div className="mt-xs text-sm text-foreground">
                    {formatValue(record?.[field.key], field)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-md">
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
          <div className="space-y-md">
            {onAddComment && (
              <div className="flex gap-sm">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e: any) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addingComment}
                  
                >
                  {addingComment ? <Loader  /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            <div className="space-y-sm">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-sm">
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
                    <div className="flex items-center gap-sm text-sm">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-muted-foreground">
                        {comment.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-xs text-sm text-foreground">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-xl text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-sm opacity-50" />
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
          <div className="space-y-sm">
            {activity.map(item => (
              <div key={item.id} className="flex gap-sm">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-sm" />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{item.author}</span>
                    <span className="text-muted-foreground"> {item.action}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-xs">
                    {item.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-xs">
                    {item.createdAt.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            {activity.length === 0 && (
              <div className="text-center py-xl text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-sm opacity-50" />
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
          <div className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div className="p-sm bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Views</div>
                <div className="text-2xl font-semibold">{analytics.views || 0}</div>
              </div>
              <div className="p-sm bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Comments</div>
                <div className="text-2xl font-semibold">{analytics.comments || 0}</div>
              </div>
            </div>
            
            <div className="space-y-xs">
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

    // Workflows Tab
    if (workflows && workflows.length > 0) {
      defaultTabs.push({
        key: 'workflows',
        label: 'Workflows',
        icon: <Workflow className="h-4 w-4" />,
        content: (
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Automated Workflows</h4>
              <Button variant="ghost" >
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>
            
            <div className="space-y-sm">
              {workflows.map(workflow => (
                <div key={workflow.id} className="p-sm border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-sm">
                    <div className="flex items-center gap-sm">
                      <div className={`w-2 h-2 rounded-full ${workflow.enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
                      <span className="font-medium text-sm">{workflow.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      
                      onClick={() => {
                        // Toggle workflow
                        console.log('Toggle workflow:', workflow.id);
                      }}
                    >
                      {workflow.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-sm">{workflow.description}</p>
                  <div className="flex items-center gap-sm text-xs">
                    <Badge variant="outline" >
                      {workflow.trigger.replace('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">
                      {workflow.actions.length} actions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      });
    }

    // Attachments Tab
    if (attachments && attachments.length > 0 || onUploadAttachment) {
      defaultTabs.push({
        key: 'attachments',
        label: 'Attachments',
        icon: <Paperclip className="h-4 w-4" />,
        content: (
          <div className="space-y-md">
            {onUploadAttachment && (
              <div className="border-2 border-dashed border-border rounded-lg p-lg text-center">
                <Upload className="h-8 w-8 mx-auto mb-sm text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-sm">
                  Drag files here or click to upload
                </p>
                <Button
                  variant="outline"
                  
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e: any) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        Array.from(files).forEach(file => {
                          onUploadAttachment(file);
                        });
                      }
                    };
                    input.click();
                  }}
                >
                  Choose Files
                </Button>
              </div>
            )}
            
            <div className="space-y-xs">
              {attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-sm p-sm hover:bg-muted rounded-lg">
                  {attachment.thumbnail ? (
                    <img
                      src={attachment.thumbnail}
                      alt={attachment.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <div className="flex items-center gap-sm text-xs text-muted-foreground">
                      <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{attachment.uploadedBy}</span>
                      <span>•</span>
                      <span>{attachment.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-xs">
                    <Button
                      variant="ghost"
                      
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {onDeleteAttachment && (
                      <Button
                        variant="ghost"
                        
                        onClick={() => onDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {attachments.length === 0 && (
                <div className="text-center py-xl text-muted-foreground">
                  <Paperclip className="h-8 w-8 mx-auto mb-sm opacity-50" />
                  <div className="text-sm">No attachments yet</div>
                </div>
              )}
            </div>
          </div>
        )
      });
    }

    // Collaboration Tab
    if (collaborators && collaborators.length > 0) {
      defaultTabs.push({
        key: 'collaboration',
        label: 'Team',
        icon: <Users className="h-4 w-4" />,
        content: (
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Collaborators</h4>
              <Button variant="ghost" >
                <User className="h-4 w-4" />
                Invite
              </Button>
            </div>
            
            <div className="space-y-sm">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="flex items-center gap-sm">
                  <div className="relative">
                    {collaborator.avatar ? (
                      <img
                        src={collaborator.avatar}
                        alt={collaborator.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {collaborator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      collaborator.status === 'online' ? 'bg-success' :
                      collaborator.status === 'away' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-sm">
                      <span className="text-sm font-medium">{collaborator.name}</span>
                      {currentUser?.id === collaborator.id && (
                        <Badge variant="outline" >You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-xs text-xs text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        collaborator.status === 'online' ? 'bg-success' :
                        collaborator.status === 'away' ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                      <span className="capitalize">{collaborator.status}</span>
                      {collaborator.lastSeen && collaborator.status !== 'online' && (
                        <>
                          <span>•</span>
                          <span>Last seen {collaborator.lastSeen.toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            {currentUser && (
              <div className="pt-md border-t border-border">
                <div className="flex items-center gap-sm text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>You're currently viewing this record</span>
                </div>
              </div>
            )}
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
          <Alert variant="destructive" className="mb-md">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-md">
            {success}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-xl">
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
                  <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-sm">
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
            <div className="flex items-center justify-between gap-sm pt-md border-t border-border mt-md">
              <div className="flex items-center gap-sm">
                {actions.map(action => (
                  <Button
                    key={action.key}
                    variant={action.variant === 'secondary' ? 'outline' : (action.variant || 'ghost')}
                    
                    onClick={() => record && action.onClick(record)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
                
                {record && onDuplicate && (
                  <Button
                    variant="ghost"
                    
                    onClick={() => onDuplicate(record)}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-sm">
                {record && onDelete && (
                  <Button
                    variant="destructive"
                    
                    onClick={() => onDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                {(mode === 'edit' || mode === 'create') && onSave && (
                  <Button
                    variant="default"
                    
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader  /> : <Save className="h-4 w-4" />}
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

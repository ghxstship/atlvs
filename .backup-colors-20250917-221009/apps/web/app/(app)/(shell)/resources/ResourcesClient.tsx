'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { Plus, FileText, BookOpen, GraduationCap, File, Clipboard, Star, Search, Download, Eye, Edit } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import ResourceForm from './components/ResourceForm';

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
  category: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  tags: string[];
  download_count: number;
  view_count: number;
  is_featured: boolean;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  thumbnail_url?: string;
  version?: string;
  language?: string;
  visibility?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}


const resourceTypeIcons = {
  policy: FileText,
  guide: BookOpen,
  training: GraduationCap,
  template: File,
  procedure: Clipboard,
  featured: Star
};

const resourceTypeLabels = {
  policy: 'Policy',
  guide: 'Guide',
  training: 'Training',
  template: 'Template',
  procedure: 'Procedure',
  featured: 'Featured'
};

const statusColors = {
  draft: 'bg-secondary/50 color-muted',
  published: 'bg-success/10 color-success',
  archived: 'bg-warning/10 color-warning',
  under_review: 'bg-primary/10 color-primary'
};

export default function ResourcesClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    fetchResources();
  }, [searchTerm, filterType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching resources:', error);
        setError('Failed to load resources');
        return;
      }

      setResources(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (!resource.file_url) return;
    
    try {
      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r
      ));

      // Open file in new tab
      window.open(resource.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchResources();
    setShowForm(false);
    setEditingResource(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || resource.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const stats = {
    totalResources: resources.length,
    publishedResources: resources.filter(r => r.status === 'published').length,
    featuredResources: resources.filter(r => r.is_featured).length,
    totalViews: resources.reduce((sum, r) => sum + r.view_count, 0),
    totalDownloads: resources.reduce((sum, r) => sum + r.download_count, 0)
  };

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Resources</h1>
          <p className="color-muted">Manage organizational resources and knowledge base</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-sm" />
          Add Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-md">
        <Card>
          <div className="text-heading-3 text-heading-3 color-primary">{stats.totalResources}</div>
          <div className="text-body-sm color-muted">Total Resources</div>
        </Card>
        <Card>
          <div className="text-heading-3 text-heading-3 color-success">{stats.publishedResources}</div>
          <div className="text-body-sm color-muted">Published</div>
        </Card>
        <Card>
          <div className="text-heading-3 text-heading-3 color-warning">{stats.featuredResources}</div>
          <div className="text-body-sm color-muted">Featured</div>
        </Card>
        <Card>
          <div className="text-heading-3 text-heading-3 color-secondary">{stats.totalViews}</div>
          <div className="text-body-sm color-muted">Total Views</div>
        </Card>
        <Card>
          <div className="text-heading-3 text-heading-3 color-primary">{stats.totalDownloads}</div>
          <div className="text-body-sm color-muted">Downloads</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-2xl pr-md py-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-sm">
            <select
              className="px-sm py-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="policy">Policies</option>
              <option value="guide">Guides</option>
              <option value="training">Training</option>
              <option value="template">Templates</option>
              <option value="procedure">Procedures</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
          <p className="color-muted">Loading resources...</p>
        </div>
      ) : error ? (
        <Card>
          <div className="text-center py-xl">
            <FileText className="w-12 h-12 color-destructive mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">Error loading resources</h3>
            <p className="color-muted mb-md">{error}</p>
            <Button onClick={fetchResources}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredResources.length === 0 ? (
        <Card>
          <div className="text-center py-xl">
            <FileText className="w-12 h-12 color-muted mx-auto mb-md" />
            <h3 className="text-body form-label color-foreground mb-sm">No resources found</h3>
            <p className="color-muted mb-md">
              {searchTerm || filterType !== 'all' 
                ? 'No resources match your current filters.' 
                : 'Get started by creating your first resource.'}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-sm" />
              Add Resource
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredResources.map((resource) => {
            const IconComponent = resourceTypeIcons[resource.type];
            
            return (
              <Card 
                key={resource.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center cluster-sm">
                    <IconComponent className="w-5 h-5 color-primary" />
                    <Badge variant="secondary" className={statusColors[resource.status]}>
                      {resource.status.replace('_', ' ')}
                    </Badge>
                    {resource.is_featured && (
                      <Badge variant="secondary" className="bg-warning/10 color-warning">
                        <Star className="w-3 h-3 mr-xs" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center cluster-xs text-body-sm color-muted">
                    <Eye className="w-4 h-4" />
                    <span>{resource.view_count}</span>
                    <Download className="w-4 h-4 ml-sm" />
                    <span>{resource.download_count}</span>
                  </div>
                </div>
                
                <h3 className="text-heading-4 text-body mb-sm line-clamp-2">{resource.title}</h3>
                
                {resource.description && (
                  <p className="text-body-sm color-muted mb-sm line-clamp-3">{resource.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-xs">
                    <Badge variant="outline">{resourceTypeLabels[resource.type]}</Badge>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  
                  <div className="flex items-center cluster-sm">
                    <Button
                     
                      variant="outline"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEdit(resource);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {resource.file_url && (
                      <Button
                       
                        variant="outline"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDownload(resource);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mt-sm flex flex-wrap gap-xs">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-body-sm">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-body-sm">
                        +{resource.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Resource Form Modal */}
      <ResourceForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        resource={editingResource}
      />
    </div>
  );
}

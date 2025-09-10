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
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-gray-600">Manage organizational resources and knowledge base</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-2xl font-bold text-blue-600">{stats.totalResources}</div>
          <div className="text-sm text-gray-600">Total Resources</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-green-600">{stats.publishedResources}</div>
          <div className="text-sm text-gray-600">Published</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-yellow-600">{stats.featuredResources}</div>
          <div className="text-sm text-gray-600">Featured</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-indigo-600">{stats.totalDownloads}</div>
          <div className="text-sm text-gray-600">Downloads</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading resources</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchResources}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredResources.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No resources match your current filters.' 
                : 'Get started by creating your first resource.'}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const IconComponent = resourceTypeIcons[resource.type];
            
            return (
              <Card 
                key={resource.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <Badge variant="secondary" className={statusColors[resource.status]}>
                      {resource.status.replace('_', ' ')}
                    </Badge>
                    {resource.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{resource.view_count}</span>
                    <Download className="w-4 h-4 ml-2" />
                    <span>{resource.download_count}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.title}</h3>
                
                {resource.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{resource.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{resourceTypeLabels[resource.type]}</Badge>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                     
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(resource);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {resource.file_url && (
                      <Button
                       
                        variant="outline"
                        onClick={(e) => {
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
                  <div className="mt-3 flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
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

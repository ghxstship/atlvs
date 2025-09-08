'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  UniversalDrawer,
  DataGrid,
  ViewSwitcher,
  StateManagerProvider,
  type FieldConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  Star,
  Plus,
  Edit,
  Trash2,
  Building2,
  User as UserIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  TrendingUp,
  Award
} from 'lucide-react';

interface RatingsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface CompanyRating {
  id: string;
  companyId: string;
  companyName?: string;
  organizationId: string;
  category: 'overall' | 'quality' | 'timeliness' | 'communication' | 'value' | 'safety' | 'other';
  rating: number; // 1-5 scale
  reviewText?: string;
  reviewerName?: string;
  reviewerTitle?: string;
  projectId?: string;
  projectName?: string;
  isRecommended: boolean;
  isPublic: boolean;
  strengths?: string[];
  improvements?: string[];
  wouldHireAgain: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export default function RatingsClient({ user, orgId, translations }: RatingsClientProps) {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<CompanyRating[]>([]);
  const [selectedRating, setSelectedRating] = useState<CompanyRating | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadRatings();
    loadCompanies();
    loadProjects();
  }, [orgId, categoryFilter, ratingFilter]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('company_ratings')
        .select(`
          *,
          companies!inner(name),
          projects(name)
        `)
        .eq('organization_id', orgId);

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (ratingFilter !== 'all') {
        const ratingValue = parseInt(ratingFilter);
        query = query.eq('rating', ratingValue);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const ratingsWithNames = (data || []).map(rating => ({
        ...rating,
        companyName: rating.companies?.name,
        projectName: rating.projects?.name
      }));
      
      setRatings(ratingsWithNames);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', orgId)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleCreateRating = () => {
    setSelectedRating(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditRating = (rating: CompanyRating) => {
    setSelectedRating(rating);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewRating = (rating: CompanyRating) => {
    setSelectedRating(rating);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) return;

    try {
      const { error } = await supabase
        .from('company_ratings')
        .delete()
        .eq('id', ratingId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
    }
  };

  const handleSaveRating = async (ratingData: Partial<CompanyRating>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('company_ratings')
          .insert({
            ...ratingData,
            organization_id: orgId,
            created_by: user.id
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedRating) {
        const { error } = await supabase
          .from('company_ratings')
          .update(ratingData)
          .eq('id', selectedRating.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadRatings();
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'overall':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'quality':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'timeliness':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'value':
        return <Award className="h-5 w-5 text-orange-500" />;
      case 'safety':
        return <Award className="h-5 w-5 text-red-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'companyId',
      label: 'Company',
      type: 'select',
      required: true,
      options: companies.map(company => ({
        label: company.name,
        value: company.id
      }))
    },
    {
      key: 'category',
      label: 'Rating Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Overall', value: 'overall' },
        { label: 'Quality', value: 'quality' },
        { label: 'Timeliness', value: 'timeliness' },
        { label: 'Communication', value: 'communication' },
        { label: 'Value', value: 'value' },
        { label: 'Safety', value: 'safety' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'rating',
      label: 'Rating (1-5)',
      type: 'number',
      required: true,
      min: 1,
      max: 5
    },
    {
      key: 'reviewText',
      label: 'Review Text',
      type: 'textarea'
    },
    {
      key: 'reviewerName',
      label: 'Reviewer Name',
      type: 'text'
    },
    {
      key: 'reviewerTitle',
      label: 'Reviewer Title',
      type: 'text'
    },
    {
      key: 'projectId',
      label: 'Related Project',
      type: 'select',
      options: projects.map(project => ({
        label: project.name,
        value: project.id
      }))
    },
    {
      key: 'isRecommended',
      label: 'Recommended',
      type: 'boolean'
    },
    {
      key: 'isPublic',
      label: 'Public Rating',
      type: 'boolean'
    },
    {
      key: 'wouldHireAgain',
      label: 'Would Hire Again',
      type: 'boolean'
    }
  ];

  const ratingRecords: DataRecord[] = ratings.map(rating => ({
    id: rating.id,
    companyName: rating.companyName,
    category: rating.category,
    rating: rating.rating,
    reviewText: rating.reviewText,
    reviewerName: rating.reviewerName,
    projectName: rating.projectName,
    isRecommended: rating.isRecommended,
    isPublic: rating.isPublic,
    wouldHireAgain: rating.wouldHireAgain,
    createdAt: rating.createdAt
  }));

  const categoryCounts = {
    all: ratings.length,
    overall: ratings.filter(r => r.category === 'overall').length,
    quality: ratings.filter(r => r.category === 'quality').length,
    timeliness: ratings.filter(r => r.category === 'timeliness').length,
    communication: ratings.filter(r => r.category === 'communication').length,
    value: ratings.filter(r => r.category === 'value').length,
    safety: ratings.filter(r => r.category === 'safety').length,
    other: ratings.filter(r => r.category === 'other').length
  };

  const ratingCounts = {
    all: ratings.length,
    5: ratings.filter(r => r.rating === 5).length,
    4: ratings.filter(r => r.rating === 4).length,
    3: ratings.filter(r => r.rating === 3).length,
    2: ratings.filter(r => r.rating === 2).length,
    1: ratings.filter(r => r.rating === 1).length
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
            <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              views={['grid', 'list']}
            />
            <Button onClick={handleCreateRating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rating
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
                <p className="text-sm text-foreground/70">Average Rating</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{ratings.length}</p>
                <p className="text-sm text-foreground/70">Total Reviews</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <ThumbsUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {ratings.filter(r => r.isRecommended).length}
                </p>
                <p className="text-sm text-foreground/70">Recommended</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(ratings.map(r => r.companyId)).size}
                </p>
                <p className="text-sm text-foreground/70">Companies Rated</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="capitalize"
              >
                {category} ({count})
              </Button>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {Object.entries(ratingCounts).map(([rating, count]) => (
              <Button
                key={rating}
                variant={ratingFilter === rating ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRatingFilter(rating)}
                className="flex items-center space-x-1"
              >
                {rating !== 'all' && <Star className="h-3 w-3" />}
                <span>{rating === 'all' ? 'All' : rating} ({count})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Rating Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratings.map((rating) => (
              <Card key={rating.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewRating(rating)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(rating.category)}
                    <div>
                      <h3 className="font-semibold text-foreground">{rating.companyName}</h3>
                      <p className="text-sm text-foreground/70 capitalize">{rating.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {rating.isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    {getRatingStars(rating.rating)}
                  </div>
                  <span className={`font-bold ${getRatingColor(rating.rating)}`}>
                    {rating.rating}.0
                  </span>
                </div>
                
                {rating.reviewText && (
                  <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                    "{rating.reviewText}"
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  {rating.reviewerName && (
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="h-4 w-4 text-foreground/50" />
                      <span className="text-foreground/70">
                        {rating.reviewerName}
                        {rating.reviewerTitle && ` • ${rating.reviewerTitle}`}
                      </span>
                    </div>
                  )}
                  
                  {rating.projectName && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Building2 className="h-4 w-4 text-foreground/50" />
                      <span className="text-foreground/70">{rating.projectName}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    {rating.isRecommended && (
                      <Badge variant="default" className="text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    {rating.wouldHireAgain && (
                      <Badge variant="outline" className="text-xs">
                        Would Hire Again
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRating(rating);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRating(rating.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <DataGrid
              records={ratingRecords}
              fields={fieldConfigs}
              onEdit={handleEditRating}
              onDelete={handleDeleteRating}
              onView={handleViewRating}
            />
          </Card>
        )}

        {/* Empty State */}
        {ratings.length === 0 && (
          <Card className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No ratings found</h3>
            <p className="text-foreground/70 mb-4">Add performance ratings and reviews for companies</p>
            <Button onClick={handleCreateRating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rating
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Add Rating' :
            drawerMode === 'edit' ? 'Edit Rating' : 'Rating Details'
          }
          mode={drawerMode}
          record={selectedRating}
          fields={fieldConfigs}
          onSave={handleSaveRating}
        />
      </div>
    </StateManagerProvider>
  );
}

'use client';


import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Skeleton, Drawer } from '@ghxstship/ui';
import { 
  Star,
  Plus,
  Edit,
  Trash2,
  Building,
  Grid,
  List
} from 'lucide-react';

interface RatingsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Rating {
  id: string;
  company_name: string;
  rating: number;
  review: string;
  reviewer_name: string;
  created_at: string;
}

export default function RatingsClient({ user, orgId, translations }: RatingsClientProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRating = () => {
    setIsCreateDrawerOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-warning color-warning' : 'color-muted'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-sm" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <Skeleton className="h-6 w-32 mb-md" />
              <Skeleton className="h-4 w-24 mb-sm" />
              <Skeleton className="h-16 w-full mb-md" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
          <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
        </div>
        <div className="flex items-center cluster-sm">
          <div className="flex items-center cluster-xs bg-secondary rounded-lg p-xs">
            <Button
              variant={currentView === 'grid' ? 'primary' : 'ghost'}
             
              onClick={() => setCurrentView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === 'list' ? 'primary' : 'ghost'}
             
              onClick={() => setCurrentView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleCreateRating}>
            <Plus className="h-4 w-4 mr-sm" />
            Add Rating
          </Button>
        </div>
      </div>

      {/* Ratings Grid/List */}
      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {ratings.map((rating: any) => (
            <Card key={rating.id} className="p-lg hover:shadow-floating transition-shadow">
              <div className="flex items-start justify-between mb-md">
                <div>
                  <h3 className="text-heading-4 text-body">{rating.company_name}</h3>
                  <div className="flex items-center cluster-xs mt-xs">
                    {renderStars(rating.rating)}
                    <span className="text-body-sm color-muted ml-sm">
                      {rating.rating}/5
                    </span>
                  </div>
                </div>
                <div className="flex cluster-xs">
                  <Button variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-body-sm color-muted mb-md line-clamp-3">
                {rating.review}
              </p>
              <div className="flex items-center justify-between text-body-sm color-muted">
                <span>By {rating.reviewer_name}</span>
                <span>{new Date(rating.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="stack-md">
          {ratings.map((rating: any) => (
            <Card key={rating.id} className="p-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center cluster mb-sm">
                    <h3 className="text-heading-4 text-body">{rating.company_name}</h3>
                    <div className="flex items-center cluster-xs">
                      {renderStars(rating.rating)}
                      <span className="text-body-sm color-muted ml-sm">
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-body-sm color-muted mb-sm">
                    {rating.review}
                  </p>
                  <div className="flex items-center cluster text-body-sm color-muted">
                    <span>By {rating.reviewer_name}</span>
                    <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex cluster-xs">
                  <Button variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {ratings.length === 0 && (
        <div className="text-center py-2xl">
          <Building className="h-12 w-12 color-muted mx-auto mb-md" />
          <h3 className="text-body text-heading-4 mb-sm">No ratings yet</h3>
          <p className="color-muted mb-md">
            Start by adding your first company rating.
          </p>
          <Button onClick={handleCreateRating}>
            <Plus className="h-4 w-4 mr-sm" />
            Add Rating
          </Button>
        </div>
      )}

      {/* Create Rating Drawer */}
      <Drawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Add New Rating"
        width="md"
      >
        <div className="p-lg">
          <p className="color-muted">
            Rating creation form will be implemented here.
          </p>
        </div>
      </Drawer>
    </div>
  );
}

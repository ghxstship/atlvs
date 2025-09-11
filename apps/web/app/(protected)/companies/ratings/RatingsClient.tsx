'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  Drawer
} from '@ghxstship/ui';
import { 
  Star,
  Plus,
  Edit,
  Trash2,
  Building2,
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
          i < rating ? 'fill-warning text-warning' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
          <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
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
            <Plus className="h-4 w-4 mr-2" />
            Add Rating
          </Button>
        </div>
      </div>

      {/* Ratings Grid/List */}
      {currentView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{rating.company_name}</h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(rating.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {rating.rating}/5
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {rating.review}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {rating.reviewer_name}</span>
                <span>{new Date(rating.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold text-lg">{rating.company_name}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-muted-foreground ml-2">
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rating.review}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>By {rating.reviewer_name}</span>
                    <span>{new Date(rating.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
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
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No ratings yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first company rating.
          </p>
          <Button onClick={handleCreateRating}>
            <Plus className="h-4 w-4 mr-2" />
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
        <div className="p-6">
          <p className="text-muted-foreground">
            Rating creation form will be implemented here.
          </p>
        </div>
      </Drawer>
    </div>
  );
}

'use client';


import React, { useState, useCallback, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
import { Building, MessageSquare, Save, Star, X } from 'lucide-react';

interface CreateRatingClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (rating: any) => void;
}

interface RatingFormData {
  companyId: string;
  category: string;
  rating: number;
  title: string;
  review: string;
  projectId: string;
  isPublic: boolean;
}

const RATING_CATEGORIES = [
  { value: 'overall', label: 'Overall Performance' },
  { value: 'quality', label: 'Quality of Work' },
  { value: 'timeliness', label: 'Timeliness' },
  { value: 'communication', label: 'Communication' },
  { value: 'professionalism', label: 'Professionalism' },
  { value: 'value', label: 'Value for Money' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'innovation', label: 'Innovation' }
];

export default function CreateRatingClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateRatingClientProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<RatingFormData>({
    companyId: '',
    category: 'overall',
    rating: 5,
    title: '',
    review: '',
    projectId: '',
    isPublic: false
  });

  const supabase = createBrowserClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      loadProjects();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orgId]);

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

  const handleInputChange = (field: keyof RatingFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.title.trim()) return;

    setLoading(true);
    try {
      const ratingId = crypto.randomUUID();
      
      // Insert rating record
      const { data: rating, error } = await supabase
        .from('company_ratings')
        .insert({
          id: ratingId,
          organization_id: orgId,
          company_id: formData.companyId,
          project_id: formData.projectId || null,
          category: formData.category,
          rating: formData.rating,
          title: formData.title.trim(),
          review: formData.review.trim() || null,
          is_public: formData.isPublic,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          id: crypto.randomUUID(),
          organization_id: orgId,
          user_id: user.id,
          action: 'create',
          entity_type: 'company_rating',
          entity_id: ratingId,
          metadata: {
            rating_title: formData.title,
            rating_value: formData.rating,
            category: formData.category,
            company_id: formData.companyId
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        companyId: '',
        category: 'overall',
        rating: 5,
        title: '',
        review: '',
        projectId: '',
        isPublic: false
      });

      onSuccess?.(rating);
      onClose();
    } catch (error) {
      console.error('Error creating rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-xs">
        {[1, 2, 3, 4, 5].map((star: any) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className={`p-xs rounded transition-colors ${
              star <= formData.rating
                ? 'color-warning hover:color-warning/80'
                : 'color-muted hover:color-muted/80'
            }`}
          >
            <Star className="h-icon-md w-icon-md fill-current" />
          </button>
        ))}
        <span className="ml-sm text-body-sm form-label">
          {formData.rating} out of 5 stars
        </span>
      </div>
    );
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Rate Company Performance"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Rating Details */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Star className="h-icon-sm w-icon-sm color-warning" />
            <h3 className="text-body text-heading-4">Rating Details</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Company *
              </label>
              <Select
                value={formData.companyId}
                onChange={(value: any) => handleInputChange('companyId', value)}
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Project (Optional)
              </label>
              <Select
                value={formData.projectId}
                onChange={(value: any) => handleInputChange('projectId', value)}
              >
                <option value="">No project association</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Rating Category *
              </label>
              <Select
                value={formData.category}
                onChange={(value: any) => handleInputChange('category', value)}
              >
                {RATING_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">
                Rating *
              </label>
              {renderStarRating()}
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Review Title *
              </label>
              <Input                 value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your review"
                required
              />
            </div>
          </div>
        </Card>

        {/* Review Content */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <MessageSquare className="h-icon-sm w-icon-sm color-accent" />
            <h3 className="text-body text-heading-4">Review Content</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Detailed Review
              </label>
              <Textarea
                value={formData.review}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('review', e.target.value)}
                placeholder="Share your experience working with this company..."
                rows={5}
              />
            </div>

            <div className="flex items-center gap-sm">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isPublic', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="isPublic" className="text-body-sm form-label">
                Make this review public (visible to other organizations)
              </label>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-sm pt-md border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-icon-xs w-icon-xs mr-sm" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.companyId || !formData.title.trim()}
          >
            <Save className="h-icon-xs w-icon-xs mr-sm" />
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

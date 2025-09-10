'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Textarea,
  Select,
  Card
} from '@ghxstship/ui';
import { 
  Star,
  Building2,
  MessageSquare,
  Save,
  X
} from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      loadProjects();
    }
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
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className={`p-1 rounded transition-colors ${
              star <= formData.rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium">
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Rating Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company *
              </label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleInputChange('companyId', value)}
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
              <label className="block text-sm font-medium mb-1">
                Project (Optional)
              </label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange('projectId', value)}
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
              <label className="block text-sm font-medium mb-1">
                Rating Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                {RATING_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rating *
              </label>
              {renderStarRating()}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Review Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your review"
                required
              />
            </div>
          </div>
        </Card>

        {/* Review Content */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Review Content</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Detailed Review
              </label>
              <Textarea
                value={formData.review}
                onChange={(e) => handleInputChange('review', e.target.value)}
                placeholder="Share your experience working with this company..."
                rows={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make this review public (visible to other organizations)
              </label>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.companyId || !formData.title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

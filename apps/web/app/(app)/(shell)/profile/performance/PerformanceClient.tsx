'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  TrendingUp, 
  Edit, 
  Save, 
  Plus,
  Target,
  Award,
  Calendar,
  Trash2,
  BarChart3,
  Star
} from 'lucide-react';

const performanceReviewSchema = z.object({
  review_period: z.string().min(1, 'Review period is required'),
  reviewer_name: z.string().min(1, 'Reviewer name is required'),
  reviewer_title: z.string().optional(),
  overall_rating: z.number().min(1).max(5),
  performance_areas: z.array(z.object({
    area: z.string(),
    rating: z.number().min(1).max(5),
    comments: z.string().optional()
  })).default([]),
  strengths: z.array(z.string()).default([]),
  areas_for_improvement: z.array(z.string()).default([]),
  goals_achieved: z.array(z.string()).default([]),
  goals_for_next_period: z.array(z.string()).default([]),
  additional_comments: z.string().optional(),
  review_date: z.string(),
  next_review_date: z.string().optional()
});

type PerformanceReviewForm = z.infer<typeof performanceReviewSchema>;

interface PerformanceReview {
  id: string;
  review_period: string;
  reviewer_name: string;
  reviewer_title?: string;
  overall_rating: number;
  performance_areas: Array<{
    area: string;
    rating: number;
    comments?: string;
  }>;
  strengths: string[];
  areas_for_improvement: string[];
  goals_achieved: string[];
  goals_for_next_period: string[];
  additional_comments?: string;
  review_date: string;
  next_review_date?: string;
  created_at: string;
}

export default function PerformanceClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [saving, setSaving] = useState(false);
  const [strengthInput, setStrengthInput] = useState('');
  const [improvementInput, setImprovementInput] = useState('');
  const [goalAchievedInput, setGoalAchievedInput] = useState('');
  const [nextGoalInput, setNextGoalInput] = useState('');

  const form = useForm<PerformanceReviewForm>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      review_period: '',
      reviewer_name: '',
      reviewer_title: '',
      overall_rating: 5,
      performance_areas: [],
      strengths: [],
      areas_for_improvement: [],
      goals_achieved: [],
      goals_for_next_period: [],
      additional_comments: '',
      review_date: new Date().toISOString().split('T')[0],
      next_review_date: ''
    }
  });

  useEffect(() => {
    loadPerformanceReviews();
  }, [orgId, userId]);

  const loadPerformanceReviews = async () => {
    try {
      setLoading(true);
      
      // Mock performance review data
      const mockReviews: PerformanceReview[] = [
        {
          id: '1',
          review_period: 'Q4 2023 Annual Review',
          reviewer_name: 'Captain Jack Sparrow',
          reviewer_title: 'Fleet Commander',
          overall_rating: 4,
          performance_areas: [
            { area: 'Leadership', rating: 5, comments: 'Exceptional leadership during critical missions' },
            { area: 'Technical Skills', rating: 4, comments: 'Strong technical competency with room for growth' },
            { area: 'Communication', rating: 4, comments: 'Clear and effective communication with crew' },
            { area: 'Problem Solving', rating: 5, comments: 'Outstanding ability to resolve complex issues' }
          ],
          strengths: ['Natural leadership abilities', 'Quick decision making', 'Team collaboration'],
          areas_for_improvement: ['Advanced navigation techniques', 'Conflict resolution'],
          goals_achieved: ['Completed advanced maritime certification', 'Led successful treasure expedition'],
          goals_for_next_period: ['Obtain Master Mariner certification', 'Mentor junior crew members'],
          additional_comments: 'Excellent performance throughout the year. Ready for increased responsibilities.',
          review_date: '2023-12-15',
          next_review_date: '2024-12-15',
          created_at: '2023-12-15T10:00:00Z'
        },
        {
          id: '2',
          review_period: 'Q2 2023 Mid-Year Review',
          reviewer_name: 'Anne Bonny',
          reviewer_title: 'First Mate',
          overall_rating: 4,
          performance_areas: [
            { area: 'Teamwork', rating: 5, comments: 'Excellent collaboration with all crew members' },
            { area: 'Initiative', rating: 4, comments: 'Shows good initiative in challenging situations' },
            { area: 'Reliability', rating: 5, comments: 'Consistently reliable and dependable' }
          ],
          strengths: ['Strong work ethic', 'Positive attitude', 'Adaptability'],
          areas_for_improvement: ['Time management', 'Delegation skills'],
          goals_achieved: ['Improved crew morale', 'Reduced operational incidents'],
          goals_for_next_period: ['Complete leadership training', 'Develop mentoring skills'],
          review_date: '2023-06-30',
          created_at: '2023-06-30T14:30:00Z'
        }
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PerformanceReviewForm) => {
    setSaving(true);
    try {
      if (editingReview) {
        // Update existing review
        const updatedReviews = reviews.map(review =>
          review.id === editingReview.id
            ? { ...review, ...data }
            : review
        );
        setReviews(updatedReviews);
      } else {
        // Create new review
        const newReview: PerformanceReview = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setReviews([newReview, ...reviews]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingReview ? 'performance_review_updated' : 'performance_review_added',
          activity_description: editingReview 
            ? `Updated performance review: ${data.review_period}`
            : `Added new performance review: ${data.review_period}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingReview(null);
      form.reset();
    } catch (error) {
      console.error('Error saving performance review:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: PerformanceReview) => {
    setEditingReview(review);
    form.reset({
      review_period: review.review_period,
      reviewer_name: review.reviewer_name,
      reviewer_title: review.reviewer_title || '',
      overall_rating: review.overall_rating,
      performance_areas: review.performance_areas,
      strengths: review.strengths,
      areas_for_improvement: review.areas_for_improvement,
      goals_achieved: review.goals_achieved,
      goals_for_next_period: review.goals_for_next_period,
      additional_comments: review.additional_comments || '',
      review_date: review.review_date,
      next_review_date: review.next_review_date || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this performance review?')) {
      const review = reviews.find(r => r.id === reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      
      // Log activity
      if (review) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'performance_review_deleted',
            activity_description: `Deleted performance review: ${review.review_period}`,
            performed_by: userId
          });
      }
    }
  };

  const addStrength = () => {
    if (strengthInput.trim()) {
      const currentStrengths = form.getValues('strengths');
      if (!currentStrengths.includes(strengthInput.trim())) {
        form.setValue('strengths', [...currentStrengths, strengthInput.trim()]);
        setStrengthInput('');
      }
    }
  };

  const removeStrength = (strengthToRemove: string) => {
    const currentStrengths = form.getValues('strengths');
    form.setValue('strengths', currentStrengths.filter(strength => strength !== strengthToRemove));
  };

  const addImprovement = () => {
    if (improvementInput.trim()) {
      const currentImprovements = form.getValues('areas_for_improvement');
      if (!currentImprovements.includes(improvementInput.trim())) {
        form.setValue('areas_for_improvement', [...currentImprovements, improvementInput.trim()]);
        setImprovementInput('');
      }
    }
  };

  const removeImprovement = (improvementToRemove: string) => {
    const currentImprovements = form.getValues('areas_for_improvement');
    form.setValue('areas_for_improvement', currentImprovements.filter(improvement => improvement !== improvementToRemove));
  };

  const addGoalAchieved = () => {
    if (goalAchievedInput.trim()) {
      const currentGoals = form.getValues('goals_achieved');
      if (!currentGoals.includes(goalAchievedInput.trim())) {
        form.setValue('goals_achieved', [...currentGoals, goalAchievedInput.trim()]);
        setGoalAchievedInput('');
      }
    }
  };

  const removeGoalAchieved = (goalToRemove: string) => {
    const currentGoals = form.getValues('goals_achieved');
    form.setValue('goals_achieved', currentGoals.filter(goal => goal !== goalToRemove));
  };

  const addNextGoal = () => {
    if (nextGoalInput.trim()) {
      const currentGoals = form.getValues('goals_for_next_period');
      if (!currentGoals.includes(nextGoalInput.trim())) {
        form.setValue('goals_for_next_period', [...currentGoals, nextGoalInput.trim()]);
        setNextGoalInput('');
      }
    }
  };

  const removeNextGoal = (goalToRemove: string) => {
    const currentGoals = form.getValues('goals_for_next_period');
    form.setValue('goals_for_next_period', currentGoals.filter(goal => goal !== goalToRemove));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'color-warning fill-current' : 'color-muted'}`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'primary';
    if (rating >= 2.5) return 'warning';
    return 'destructive';
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0";
    const sum = reviews.reduce((acc, review) => acc + review.overall_rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded mb-md"></div>
          <div className="stack-md">
            <div className="h-32 bg-secondary rounded"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Performance Reviews</h2>
        <Button 
          onClick={() => {
            setEditingReview(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-sm"
        >
          <Plus className="h-4 w-4" />
          Add Performance Review
        </Button>
      </div>

      {/* Performance Summary */}
      {reviews.length > 0 && (
        <Card>
          <div className="p-lg">
            <div className="flex items-center gap-sm mb-md">
              <BarChart3 className="h-5 w-5 color-primary" />
              <h3 className="text-body text-heading-4">Performance Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-primary">{calculateAverageRating()}</div>
                <div className="text-body-sm color-muted">Average Rating</div>
                <div className="flex justify-center mt-xs">
                  {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-success">{reviews.length}</div>
                <div className="text-body-sm color-muted">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-secondary">
                  {reviews.filter(r => r.overall_rating >= 4).length}
                </div>
                <div className="text-body-sm color-muted">Excellent Reviews</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card>
          <div className="p-xl text-center">
            <TrendingUp className="h-12 w-12 color-muted mx-auto mb-md" />
            <h3 className="text-body text-heading-4 mb-sm">No Performance Reviews</h3>
            <p className="color-muted mb-md">
              Track your professional growth and achievements with performance reviews.
            </p>
            <Button 
              onClick={() => {
                setEditingReview(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Review
            </Button>
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <div className="p-lg">
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center gap-sm">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 color-primary" />
                    </div>
                    <div>
                      <h3 className="text-body text-heading-4">{review.review_period}</h3>
                      <p className="text-body-sm color-muted">
                        Reviewed by {review.reviewer_name}
                        {review.reviewer_title && ` (${review.reviewer_title})`}
                      </p>
                      <div className="flex items-center gap-sm mt-xs">
                        <Badge 
                          variant={getRatingColor(review.overall_rating) as any}>
                          {review.overall_rating}/5 Overall
                        </Badge>
                        <div className="flex items-center gap-xs">
                          {renderStars(review.overall_rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <Button
                      variant="outline"
                     
                      onClick={() => handleEdit(review)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                     
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Performance Areas */}
                {review.performance_areas.length > 0 && (
                  <div className="mb-md">
                    <h4 className="text-body-sm form-label mb-sm">Performance Areas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                      {review.performance_areas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-sm bg-secondary rounded">
                          <span className="text-body-sm form-label">{area.area}</span>
                          <div className="flex items-center gap-sm">
                            <div className="flex items-center gap-xs">
                              {renderStars(area.rating)}
                            </div>
                            <span className="text-body-sm color-muted">{area.rating}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {review.strengths.length > 0 && (
                  <div className="mb-md">
                    <h4 className="text-body-sm form-label mb-sm">Strengths</h4>
                    <div className="flex flex-wrap gap-sm">
                      {review.strengths.map((strength, index) => (
                        <Badge key={index} variant="success">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement */}
                {review.areas_for_improvement.length > 0 && (
                  <div className="mb-md">
                    <h4 className="text-body-sm form-label mb-sm">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-sm">
                      {review.areas_for_improvement.map((area, index) => (
                        <Badge key={index} variant="warning">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                  {review.goals_achieved.length > 0 && (
                    <div>
                      <h4 className="text-body-sm form-label mb-sm">Goals Achieved</h4>
                      <ul className="list-disc list-inside stack-xs">
                        {review.goals_achieved.map((goal, index) => (
                          <li key={index} className="text-body-sm color-muted">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {review.goals_for_next_period.length > 0 && (
                    <div>
                      <h4 className="text-body-sm form-label mb-sm">Goals for Next Period</h4>
                      <ul className="list-disc list-inside stack-xs">
                        {review.goals_for_next_period.map((goal, index) => (
                          <li key={index} className="text-body-sm color-muted">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {review.additional_comments && (
                  <div className="mb-md p-sm bg-secondary rounded-lg">
                    <h4 className="text-body-sm form-label mb-xs">Additional Comments</h4>
                    <p className="text-body-sm color-muted">{review.additional_comments}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-body-sm color-muted">
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-4 w-4" />
                    Review Date: {new Date(review.review_date).toLocaleDateString()}
                  </div>
                  {review.next_review_date && (
                    <div className="flex items-center gap-xs">
                      <Target className="h-4 w-4" />
                      Next Review: {new Date(review.next_review_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingReview ? 'Edit Performance Review' : 'Add New Performance Review'}
        description={editingReview ? 'Update performance review details' : 'Add a new performance review'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          <UnifiedInput             label="Review Period"
            placeholder="e.g., Q4 2023 Annual Review"
            {...form.register('review_period')}
           
          />

          <div className="grid grid-cols-2 gap-md">
            <UnifiedInput               label="Reviewer Name"
              placeholder="Name of reviewer"
              {...form.register('reviewer_name')}
             
            />

            <UnifiedInput               label="Reviewer Title"
              placeholder="Reviewer's job title"
              {...form.register('reviewer_title')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Select
              {...form.register('overall_rating', { valueAsNumber: true })}
            >
              <option value={5}>5 - Exceptional</option>
              <option value={4}>4 - Exceeds Expectations</option>
              <option value={3}>3 - Meets Expectations</option>
              <option value={2}>2 - Below Expectations</option>
              <option value={1}>1 - Unsatisfactory</option>
            </Select>

            <UnifiedInput               label="Review Date"
              type="date"
              {...form.register('review_date')}
             
            />
          </div>

          <UnifiedInput             label="Next Review Date (Optional)"
            type="date"
            {...form.register('next_review_date')}
           
          />

          {/* Strengths */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Strengths</label>
            <div className="flex gap-sm mb-sm">
              <UnifiedInput                 placeholder="Add a strength"
                value={strengthInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStrengthInput(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
              />
              <Button type="button" onClick={addStrength}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {form.watch('strengths').map((strength, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-xs"
                >
                  {strength}
                  <button
                    type="button"
                    onClick={() => removeStrength(strength)}
                    className="ml-xs color-destructive hover:color-destructive/80"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Areas for Improvement</label>
            <div className="flex gap-sm mb-sm">
              <UnifiedInput                 placeholder="Add an area for improvement"
                value={improvementInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImprovementInput(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
              />
              <Button type="button" onClick={addImprovement}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {form.watch('areas_for_improvement').map((improvement, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-xs"
                >
                  {improvement}
                  <button
                    type="button"
                    onClick={() => removeImprovement(improvement)}
                    className="ml-xs color-destructive hover:color-destructive/80"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Goals Achieved */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Goals Achieved</label>
            <div className="flex gap-sm mb-sm">
              <UnifiedInput                 placeholder="Add a goal that was achieved"
                value={goalAchievedInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalAchievedInput(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), addGoalAchieved())}
              />
              <Button type="button" onClick={addGoalAchieved}>Add</Button>
            </div>
            <div className="stack-sm">
              {form.watch('goals_achieved').map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-sm bg-secondary rounded">
                  <span className="text-body-sm">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoalAchieved(goal)}
                    className="color-destructive hover:color-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Goals for Next Period */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Goals for Next Period</label>
            <div className="flex gap-sm mb-sm">
              <UnifiedInput                 placeholder="Add a goal for the next period"
                value={nextGoalInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNextGoalInput(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), addNextGoal())}
              />
              <Button type="button" onClick={addNextGoal}>Add</Button>
            </div>
            <div className="stack-sm">
              {form.watch('goals_for_next_period').map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-sm bg-secondary rounded">
                  <span className="text-body-sm">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeNextGoal(goal)}
                    className="color-destructive hover:color-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Additional Comments"
            placeholder="Any additional feedback or comments"
            {...form.register('additional_comments')}
           
            rows={3}
          />

          <div className="flex justify-end gap-sm pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-sm" />
              {editingReview ? 'Update' : 'Save'} Review
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

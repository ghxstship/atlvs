'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardHeader, CardContent, Badge } from '@ghxstship/ui';
import { Star, TrendingUp, Award, Calendar, ChevronRight, BarChart3 } from 'lucide-react';
import { useToast } from '@ghxstship/ui';

interface PerformanceReview {
  id: string;
  review_period: string;
  overall_rating: number;
  reviewer_name: string;
  reviewer_role: string;
  review_date: string;
  strengths: string[];
  improvements: string[];
  goals: Goal[];
  achievements: Achievement[];
  feedback: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'acknowledged';
}

interface Goal {
  title: string;
  description: string;
  target_date: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

interface Achievement {
  title: string;
  description: string;
  date: string;
  impact: 'low' | 'medium' | 'high';
}

export default function PerformanceReviewsClient() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('performance_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('review_date', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load performance reviews',
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeReview = async (reviewId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('performance_reviews')
        .update({ status: 'acknowledged' })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Review acknowledged successfully',
      });
      fetchReviews();
    } catch (error) {
      console.error('Error acknowledging review:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to acknowledge review',
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-warning color-warning'
                : 'color-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (selectedReview) {
    return (
      <div className="stack-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-heading-3 text-heading-3">Performance Review</h2>
            <p className="color-muted">{selectedReview.review_period}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedReview(null)}>
            Back to Reviews
          </Button>
        </div>

        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4">Overall Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-sm mb-sm">
                  {renderStars(selectedReview.overall_rating)}
                  <span className="text-heading-3 text-heading-3">{selectedReview.overall_rating}/5</span>
                </div>
                <p className="text-body-sm color-muted">
                  Reviewed by {selectedReview.reviewer_name} ({selectedReview.reviewer_role})
                </p>
                <p className="text-body-sm color-muted">
                  {new Date(selectedReview.review_date).toLocaleDateString()}
                </p>
              </div>
              {selectedReview.status === 'reviewed' && (
                <Button onClick={() => acknowledgeReview(selectedReview.id)}>
                  Acknowledge Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-sm color-success" />
              Strengths
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="stack-sm">
              {selectedReview.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="color-success mr-sm">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4">Areas for Improvement</h3>
          </CardHeader>
          <CardContent>
            <ul className="stack-sm">
              {selectedReview.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="color-warning mr-sm">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4">Goals</h3>
          </CardHeader>
          <CardContent>
            <div className="stack-md">
              {selectedReview.goals.map((goal, index) => (
                <div key={index} className="border-l-4 border-primary pl-md">
                  <div className="flex justify-between items-start mb-sm">
                    <div>
                      <h4 className="text-heading-4">{goal.title}</h4>
                      <p className="text-body-sm color-muted">{goal.description}</p>
                    </div>
                    <Badge variant={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-sm">
                    <div className="flex justify-between text-body-sm mb-xs">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-body-sm color-muted mt-xs">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4 flex items-center">
              <Award className="w-5 h-5 mr-sm color-warning" />
              Key Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <div className="stack-sm">
              {selectedReview.achievements.map((achievement, index) => (
                <div key={index} className="flex justify-between items-start p-sm bg-secondary rounded-lg">
                  <div>
                    <h4 className="text-heading-4">{achievement.title}</h4>
                    <p className="text-body-sm color-muted">{achievement.description}</p>
                    <p className="text-body-sm color-muted mt-xs">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getImpactColor(achievement.impact)}>
                    {achievement.impact} impact
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <h3 className="text-heading-4">Additional Feedback</h3>
          </CardHeader>
          <CardContent>
            <p className="color-muted">{selectedReview.feedback}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div>
        <h2 className="text-heading-3 text-heading-3">Performance Reviews</h2>
        <p className="color-muted">View your performance evaluations and feedback</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-2xl">
            <BarChart3 className="w-12 h-12 mx-auto mb-md color-muted" />
            <p className="color-muted">No performance reviews available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="stack-md">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="cursor-pointer hover:shadow-floating transition-shadow"
              onClick={() => setSelectedReview(review)}
            >
              <CardContent className="p-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <h3 className="text-heading-4 text-body">{review.review_period}</h3>
                      <Badge variant={review.status === 'acknowledged' ? 'success' : 'warning'}>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-md mb-sm">
                      {renderStars(review.overall_rating)}
                      <span className="text-heading-4">{review.overall_rating}/5</span>
                    </div>
                    <p className="text-body-sm color-muted">
                      Reviewed by {review.reviewer_name} • {new Date(review.review_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-md mt-sm">
                      <div className="flex items-center gap-xs">
                        <Calendar className="w-4 h-4 color-muted" />
                        <span className="text-body-sm">{review.goals.length} Goals</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <Award className="w-4 h-4 color-muted" />
                        <span className="text-body-sm">{review.achievements.length} Achievements</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 color-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

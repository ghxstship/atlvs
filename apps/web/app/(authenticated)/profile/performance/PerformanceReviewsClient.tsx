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
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted-foreground'
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
      <div className="space-y-4">
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Performance Review</h2>
            <p className="text-muted-foreground">{selectedReview.review_period}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedReview(null)}>
            Back to Reviews
          </Button>
        </div>

        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Overall Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {renderStars(selectedReview.overall_rating)}
                  <span className="text-2xl font-bold">{selectedReview.overall_rating}/5</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reviewed by {selectedReview.reviewer_name} ({selectedReview.reviewer_role})
                </p>
                <p className="text-sm text-muted-foreground">
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
            <h3 className="font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-success" />
              Strengths
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {selectedReview.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-success mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Areas for Improvement</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {selectedReview.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-warning mr-2">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Goals</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedReview.goals.map((goal, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
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
            <h3 className="font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2 text-warning" />
              Key Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedReview.achievements.map((achievement, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
            <h3 className="font-semibold">Additional Feedback</h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{selectedReview.feedback}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Reviews</h2>
        <p className="text-muted-foreground">View your performance evaluations and feedback</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No performance reviews available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReview(review)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{review.review_period}</h3>
                      <Badge variant={review.status === 'acknowledged' ? 'success' : 'warning'}>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      {renderStars(review.overall_rating)}
                      <span className="font-semibold">{review.overall_rating}/5</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reviewed by {review.reviewer_name} • {new Date(review.review_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{review.goals.length} Goals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{review.achievements.length} Achievements</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { X, Save, Plus, Trash2, Star } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Button,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Checkbox,
 Badge,
 Card,
} from '@ghxstship/ui';
import type { PerformanceReview, PerformanceFormData, PerformanceGoal } from '../types';
import {
 REVIEW_TYPE_LABELS,
 REVIEW_STATUS_LABELS,
 VISIBILITY_LABELS,
 createEmptyGoal,
 validatePerformanceForm,
} from '../types';

const formSchema = z.object({
 reviewer_name: z.string().min(1, 'Reviewer name is required'),
 review_period_start: z.string().min(1, 'Start date is required'),
 review_period_end: z.string().min(1, 'End date is required'),
 review_type: z.enum(['annual', 'quarterly', 'project-based', 'probationary']),
 status: z.enum(['draft', 'submitted', 'approved', 'archived']),
 overall_rating: z.number().min(1).max(5),
 technical_skills_rating: z.number().min(1).max(5),
 communication_rating: z.number().min(1).max(5),
 teamwork_rating: z.number().min(1).max(5),
 leadership_rating: z.number().min(1).max(5),
 strengths: z.string(),
 areas_for_improvement: z.string(),
 reviewer_comments: z.string(),
 employee_comments: z.string(),
 promotion_recommended: z.boolean(),
 visibility: z.enum(['private', 'manager', 'hr', 'organization']),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePerformanceReviewDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (data: PerformanceFormData) => Promise<void>;
 review?: PerformanceReview | null;
 loading?: boolean;
}

export default function CreatePerformanceReviewDrawer({
 isOpen,
 onClose,
 onSave,
 review,
 loading = false,
}: CreatePerformanceReviewDrawerProps) {
 const [goals, setGoals] = useState<PerformanceGoal[]>([]);
 const [achievements, setAchievements] = useState<string[]>([]);
 const [tags, setTags] = useState<string[]>([]);
 const [newTag, setNewTag] = useState('');

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 watch,
 setValue,
 } = useForm<FormData>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 reviewer_name: '',
 review_period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
 review_period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
 review_type: 'annual',
 status: 'draft',
 overall_rating: 3,
 technical_skills_rating: 3,
 communication_rating: 3,
 teamwork_rating: 3,
 leadership_rating: 3,
 strengths: '',
 areas_for_improvement: '',
 reviewer_comments: '',
 employee_comments: '',
 promotion_recommended: false,
 visibility: 'manager',
 },
 });

 // Load review data when editing
 useEffect(() => {
 if (review) {
 reset({
 reviewer_name: review.reviewer_name || '',
 review_period_start: review.review_period_start,
 review_period_end: review.review_period_end,
 review_type: review.review_type,
 status: review.status,
 overall_rating: review.overall_rating || 3,
 technical_skills_rating: review.technical_skills_rating || 3,
 communication_rating: review.communication_rating || 3,
 teamwork_rating: review.teamwork_rating || 3,
 leadership_rating: review.leadership_rating || 3,
 strengths: review.strengths || '',
 areas_for_improvement: review.areas_for_improvement || '',
 reviewer_comments: review.reviewer_comments || '',
 employee_comments: review.employee_comments || '',
 promotion_recommended: review.promotion_recommended,
 visibility: review.visibility,
 });
 setGoals(review.goals || []);
 setAchievements(review.achievements || []);
 setTags(review.tags || []);
 }
 }, [review, reset]);

 const onSubmit = async (data: FormData) => {
 const formData: PerformanceFormData = {
 ...data,
 goals,
 achievements,
 development_plan: [], // Not used in current schema
 manager_comments: '',
 hr_comments: '',
 next_review_date: '',
 salary_adjustment: '',
 tags,
 };

 await onSave(formData);
 };

 const addGoal = () => {
 setGoals([...goals, createEmptyGoal()]);
 };

 const updateGoal = (index: number, goal: PerformanceGoal) => {
 const newGoals = [...goals];
 newGoals[index] = goal;
 setGoals(newGoals);
 };

 const removeGoal = (index: number) => {
 setGoals(goals.filter((_, i) => i !== index));
 };

 const addAchievement = () => {
 setAchievements([...achievements, '']);
 };

 const updateAchievement = (index: number, value: string) => {
 const newAchievements = [...achievements];
 newAchievements[index] = value;
 setAchievements(newAchievements);
 };

 const removeAchievement = (index: number) => {
 setAchievements(achievements.filter((_, i) => i !== index));
 };

 const addTag = () => {
 if (newTag.trim() && !tags.includes(newTag.trim())) {
 setTags([...tags, newTag.trim()]);
 setNewTag('');
 }
 };

 const removeTag = (tag: string) => {
 setTags(tags.filter(t => t !== tag));
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-black/50" onClick={onClose} />
 <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl">
 <div className="flex h-full flex-col">
 {/* Header */}
 <div className="flex items-center justify-between border-b p-6">
 <div>
 <h2 className="text-xl font-semibold">
 {review ? 'Edit Performance Review' : 'Create Performance Review'}
 </h2>
 <p className="text-sm text-muted-foreground">
 {review ? 'Update the performance review details' : 'Add a new performance review'}
 </p>
 </div>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="h-4 w-4" />
 </Button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 {/* Basic Information */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">Basic Information</h3>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="reviewer_name">Reviewer Name</Label>
 <Input
 
 {...register('reviewer_name')}
 />
 </div>
 <div>
 <Label htmlFor="review_type">Review Type</Label>
 <Select
 value={watch('review_type')}
 onValueChange={(value) => setValue('review_type', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(REVIEW_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="review_period_start">Start Date</Label>
 <Input
 
 type="date"
 {...register('review_period_start')}
 />
 </div>
 <div>
 <Label htmlFor="review_period_end">End Date</Label>
 <Input
 
 type="date"
 {...register('review_period_end')}
 />
 </div>
 <div>
 <Label htmlFor="status">Status</Label>
 <Select
 value={watch('status')}
 onValueChange={(value) => setValue('status', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="visibility">Visibility</Label>
 <Select
 value={watch('visibility')}
 onValueChange={(value) => setValue('visibility', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>

 {/* Ratings */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">Ratings (1-5 Scale)</h3>
 <div className="grid grid-cols-2 gap-4">
 {[
 { key: 'overall_rating', label: 'Overall Rating' },
 { key: 'technical_skills_rating', label: 'Technical Skills' },
 { key: 'communication_rating', label: 'Communication' },
 { key: 'teamwork_rating', label: 'Teamwork' },
 { key: 'leadership_rating', label: 'Leadership' },
 ].map(({ key, label }) => (
 <div key={key}>
 <Label htmlFor={key}>{label}</Label>
 <div className="flex items-center gap-2">
 <Input
 id={key}
 type="number"
 min="1"
 max="5"
 {...register(key as unknown, { valueAsNumber: true })}
 className="w-20"
 />
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`h-4 w-4 cursor-pointer ${
 i < (watch(key as unknown) || 0)
 ? 'text-yellow-500 fill-yellow-500'
 : 'text-gray-300'
 }`}
 onClick={() => setValue(key as unknown, i + 1)}
 />
 ))}
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Feedback */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">Feedback</h3>
 <div className="space-y-4">
 <div>
 <Label htmlFor="strengths">Strengths</Label>
 <Textarea
 
 {...register('strengths')}
 placeholder="Describe key strengths and accomplishments..."
 rows={3}
 />
 </div>
 <div>
 <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
 <Textarea
 
 {...register('areas_for_improvement')}
 placeholder="Identify areas for growth and development..."
 rows={3}
 />
 </div>
 <div>
 <Label htmlFor="reviewer_comments">Reviewer Comments</Label>
 <Textarea
 
 {...register('reviewer_comments')}
 placeholder="Additional comments from the reviewer..."
 rows={3}
 />
 </div>
 <div>
 <Label htmlFor="employee_comments">Employee Comments</Label>
 <Textarea
 
 {...register('employee_comments')}
 placeholder="Employee self-assessment and comments..."
 rows={3}
 />
 </div>
 </div>
 </Card>

 {/* Goals */}
 <Card className="p-4">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-medium">Goals</h3>
 <Button type="button" variant="outline" size="sm" onClick={addGoal}>
 <Plus className="h-4 w-4 mr-2" />
 Add Goal
 </Button>
 </div>
 <div className="space-y-4">
 {goals.map((goal, index) => (
 <div key={goal.id} className="border rounded-lg p-4">
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-medium">Goal {index + 1}</h4>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeGoal(index)}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <Label>Title</Label>
 <Input
 value={goal.title}
 onChange={(e) => updateGoal(index, { ...goal, title: e.target.value })}
 placeholder="Goal title"
 />
 </div>
 <div className="col-span-2">
 <Label>Description</Label>
 <Textarea
 value={goal.description}
 onChange={(e) => updateGoal(index, { ...goal, description: e.target.value })}
 placeholder="Goal description"
 rows={2}
 />
 </div>
 <div>
 <Label>Target Date</Label>
 <Input
 type="date"
 value={goal.target_date}
 onChange={(e) => updateGoal(index, { ...goal, target_date: e.target.value })}
 />
 </div>
 <div>
 <Label>Progress (%)</Label>
 <Input
 type="number"
 min="0"
 max="100"
 value={goal.progress_percentage}
 onChange={(e) => updateGoal(index, { ...goal, progress_percentage: parseInt(e.target.value) || 0 })}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Achievements */}
 <Card className="p-4">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-medium">Achievements</h3>
 <Button type="button" variant="outline" size="sm" onClick={addAchievement}>
 <Plus className="h-4 w-4 mr-2" />
 Add Achievement
 </Button>
 </div>
 <div className="space-y-3">
 {achievements.map((achievement, index) => (
 <div key={index} className="flex items-center gap-3">
 <Input
 value={achievement}
 onChange={(e) => updateAchievement(index, e.target.value)}
 placeholder="Describe an achievement"
 />
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeAchievement(index)}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 </Card>

 {/* Tags */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">Tags</h3>
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Add a tag"
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
 />
 <Button type="button" variant="outline" size="sm" onClick={addTag}>
 Add
 </Button>
 </div>
 <div className="flex flex-wrap gap-2">
 {tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
 {tag} <X className="h-3 w-3 ml-1" />
 </Badge>
 ))}
 </div>
 </div>
 </Card>

 {/* Promotion Recommendation */}
 <Card className="p-4">
 <div className="flex items-center space-x-2">
 <Checkbox
 
 checked={watch('promotion_recommended')}
 onCheckedChange={(checked) => setValue('promotion_recommended', !!checked)}
 />
 <Label htmlFor="promotion_recommended" className="font-medium">
 Recommend for promotion
 </Label>
 </div>
 </Card>
 </form>
 </div>

 {/* Footer */}
 <div className="border-t p-6">
 <div className="flex items-center justify-end gap-3">
 <Button variant="outline" onClick={onClose} disabled={loading}>
 Cancel
 </Button>
 <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
 <Save className="h-4 w-4 mr-2" />
 {loading ? 'Saving...' : review ? 'Update Review' : 'Create Review'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

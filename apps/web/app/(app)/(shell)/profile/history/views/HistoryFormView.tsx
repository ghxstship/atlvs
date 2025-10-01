'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import {
 Button,
 Card,
 Input,
 Label,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Textarea,
 Badge,
 Switch,
} from '@ghxstship/ui';
import type { HistoryEntry, HistoryEntryFormData } from '../types';
import {
 ENTRY_TYPE_LABELS,
 EMPLOYMENT_TYPE_LABELS,
 EDUCATION_LEVEL_LABELS,
 PROJECT_STATUS_LABELS,
 VISIBILITY_LABELS,
 COMMON_SKILLS,
 formatDate,
 formatDateRange,
 calculateDuration,
 getEntryTypeIcon,
} from '../types';

interface HistoryFormViewProps {
 entry: HistoryEntry | null;
 formData: HistoryEntryFormData;
 formErrors: Record<string, string>;
 loading: boolean;
 saving: boolean;
 onFieldChange: (field: keyof HistoryEntryFormData, value: unknown) => void;
 onSave: () => void;
}

export default function HistoryFormView({
 entry,
 formData,
 formErrors,
 loading,
 saving,
 onFieldChange,
 onSave,
}: HistoryFormViewProps) {
 const [skillInput, setSkillInput] = useState('');
 const [achievementInput, setAchievementInput] = useState('');
 const [tagInput, setTagInput] = useState('');

 const handleAddSkill = () => {
 if (skillInput.trim() && !formData.skills_gained.includes(skillInput.trim())) {
 onFieldChange('skills_gained', [...formData.skills_gained, skillInput.trim()]);
 setSkillInput('');
 }
 };

 const handleRemoveSkill = (skill: string) => {
 onFieldChange('skills_gained', formData.skills_gained.filter(s => s !== skill));
 };

 const handleAddAchievement = () => {
 if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
 onFieldChange('achievements', [...formData.achievements, achievementInput.trim()]);
 setAchievementInput('');
 }
 };

 const handleRemoveAchievement = (achievement: string) => {
 onFieldChange('achievements', formData.achievements.filter(a => a !== achievement));
 };

 const handleAddTag = () => {
 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
 onFieldChange('tags', [...formData.tags, tagInput.trim()]);
 setTagInput('');
 }
 };

 const handleRemoveTag = (tag: string) => {
 onFieldChange('tags', formData.tags.filter(t => t !== tag));
 };

 const handleCommonSkillClick = (skill: string) => {
 if (!formData.skills_gained.includes(skill)) {
 onFieldChange('skills_gained', [...formData.skills_gained, skill]);
 }
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 {[...Array(10)].map((_, i) => (
 <div key={i} className="space-y-xs">
 <div className="h-icon-xs w-component-lg bg-muted animate-pulse rounded" />
 <div className="h-icon-xl bg-muted animate-pulse rounded" />
 </div>
 ))}
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 <Card className="p-lg">
 <div className="space-y-lg">
 <div>
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
 <Building className="h-icon-sm w-icon-sm" />
 Basic Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="entry_type">
 Entry Type <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.entry_type}
 onValueChange={(value) => onFieldChange('entry_type', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 <span className="flex items-center gap-xs">
 <span>{getEntryTypeIcon(value as unknown)}</span>
 {label}
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="title">
 Title/Position <span className="text-destructive">*</span>
 </Label>
 <Input
 
 value={formData.title}
 onChange={(e) => onFieldChange('title', e.target.value)}
 placeholder="Software Engineer, Bachelor's Degree, etc."
 className={formErrors.title ? 'border-destructive' : ''}
 />
 {formErrors.title && (
 <p className="text-sm text-destructive">{formErrors.title}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="organization">Organization/Company</Label>
 <Input
 
 value={formData.organization}
 onChange={(e) => onFieldChange('organization', e.target.value)}
 placeholder="Company name, university, etc."
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="location">Location</Label>
 <Input
 
 value={formData.location}
 onChange={(e) => onFieldChange('location', e.target.value)}
 placeholder="City, State/Country"
 />
 </div>

 <div className="space-y-xs md:col-span-2">
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 value={formData.description}
 onChange={(e) => onFieldChange('description', e.target.value)}
 placeholder="Describe your role, responsibilities, coursework, project details..."
 rows={4}
 />
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Timeline
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="start_date">
 Start Date <span className="text-destructive">*</span>
 </Label>
 <Input
 
 type="date"
 value={formData.start_date}
 onChange={(e) => onFieldChange('start_date', e.target.value)}
 className={formErrors.start_date ? 'border-destructive' : ''}
 />
 {formErrors.start_date && (
 <p className="text-sm text-destructive">{formErrors.start_date}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="end_date">End Date</Label>
 <Input
 
 type="date"
 value={formData.end_date}
 onChange={(e) => onFieldChange('end_date', e.target.value)}
 disabled={formData.is_current}
 className={formErrors.end_date ? 'border-destructive' : ''}
 />
 {formErrors.end_date && (
 <p className="text-sm text-destructive">{formErrors.end_date}</p>
 )}
 </div>

 <div className="flex items-center justify-center">
 <div className="space-y-xs">
 <Label htmlFor="is_current">Current Position</Label>
 <div className="flex items-center space-x-xs">
 <Switch
 
 checked={formData.is_current}
 onCheckedChange={(checked) => {
 onFieldChange('is_current', checked);
 if (checked) {
 onFieldChange('end_date', '');
 }
 }}
 />
 <Label htmlFor="is_current" className="text-sm">
 I currently work/study here
 </Label>
 </div>
 </div>
 </div>
 </div>

 {formData.start_date && (
 <div className="mt-4 p-sm bg-muted/50 rounded-lg">
 <p className="text-sm text-muted-foreground">
 Duration: {calculateDuration(formData.start_date, formData.end_date, formData.is_current)}
 {' • '}
 {formatDateRange(formData.start_date, formData.end_date, formData.is_current)}
 </p>
 </div>
 )}
 </div>

 {/* Type-specific fields */}
 {formData.entry_type === 'employment' && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="employment_type">Employment Type</Label>
 <Select
 value={formData.employment_type}
 onValueChange={(value) => onFieldChange('employment_type', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="salary_range">Salary Range (Optional)</Label>
 <Input
 
 value={formData.salary_range}
 onChange={(e) => onFieldChange('salary_range', e.target.value)}
 placeholder="$50,000 - $70,000"
 />
 </div>
 </div>
 </div>
 )}

 {formData.entry_type === 'education' && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Education Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="education_level">Education Level</Label>
 <Select
 value={formData.education_level}
 onValueChange={(value) => onFieldChange('education_level', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="grade_gpa">Grade/GPA (Optional)</Label>
 <Input
 
 value={formData.grade_gpa}
 onChange={(e) => onFieldChange('grade_gpa', e.target.value)}
 placeholder="3.8 GPA, First Class Honours, etc."
 />
 </div>
 </div>
 </div>
 )}

 {formData.entry_type === 'project' && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Project Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="project_status">Project Status</Label>
 <Select
 value={formData.project_status}
 onValueChange={(value) => onFieldChange('project_status', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="website_url">Project URL (Optional)</Label>
 <Input
 
 type="url"
 value={formData.website_url}
 onChange={(e) => onFieldChange('website_url', e.target.value)}
 placeholder="https://github.com/user/project"
 className={formErrors.website_url ? 'border-destructive' : ''}
 />
 {formErrors.website_url && (
 <p className="text-sm text-destructive">{formErrors.website_url}</p>
 )}
 </div>
 </div>
 </div>
 )}

 <div>
 <h3 className="text-lg font-semibold mb-4">Skills & Achievements</h3>
 <div className="space-y-md">
 <div className="space-y-xs">
 <Label>Skills Gained</Label>
 <div className="flex gap-xs">
 <Input
 value={skillInput}
 onChange={(e) => setSkillInput(e.target.value)}
 placeholder="Add a skill..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
 />
 <Button type="button" onClick={handleAddSkill} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {formData.skills_gained.length > 0 && (
 <div className="flex flex-wrap gap-xs mt-2">
 {formData.skills_gained.map((skill) => (
 <Badge key={skill} variant="secondary" className="gap-xs">
 {skill}
 <button
 type="button"
 onClick={() => handleRemoveSkill(skill)}
 className="ml-1 hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 ))}
 </div>
 )}

 <div className="mt-2">
 <p className="text-sm text-muted-foreground mb-2">Common skills:</p>
 <div className="flex flex-wrap gap-xs">
 {COMMON_SKILLS.slice(0, 10).map((skill) => (
 <Badge
 key={skill}
 variant="outline"
 className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
 onClick={() => handleCommonSkillClick(skill)}
 >
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-xs">
 <Label>Achievements & Accomplishments</Label>
 <div className="flex gap-xs">
 <Input
 value={achievementInput}
 onChange={(e) => setAchievementInput(e.target.value)}
 placeholder="Add an achievement..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
 />
 <Button type="button" onClick={handleAddAchievement} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {formData.achievements.length > 0 && (
 <div className="space-y-xs mt-2">
 {formData.achievements.map((achievement, index) => (
 <div key={index} className="flex items-start gap-xs p-xs border rounded">
 <span className="text-sm flex-1">{achievement}</span>
 <button
 type="button"
 onClick={() => handleRemoveAchievement(achievement)}
 className="text-muted-foreground hover:text-destructive"
 >
 <X className="h-icon-xs w-icon-xs" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
 <div className="space-y-md">
 <div className="space-y-xs">
 <Label htmlFor="references">References (Optional)</Label>
 <Textarea
 
 value={formData.references}
 onChange={(e) => onFieldChange('references', e.target.value)}
 placeholder="Contact information for references..."
 rows={3}
 />
 </div>

 <div className="space-y-xs">
 <Label>Tags</Label>
 <div className="flex gap-xs">
 <Input
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 placeholder="Add a tag..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
 />
 <Button type="button" onClick={handleAddTag} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {formData.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mt-2">
 {formData.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="gap-xs">
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="ml-1 hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="visibility">
 Visibility <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.visibility}
 onValueChange={(value) => onFieldChange('visibility', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 <span className="flex items-center gap-xs">
 <Eye className="h-icon-xs w-icon-xs" />
 {label}
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t">
 <Button onClick={onSave} disabled={saving}>
 <Save className="mr-2 h-icon-xs w-icon-xs" />
 {saving ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
 </Button>
 </div>
 </div>
 </Card>

 {entry && (
 <Card className="p-md bg-muted/50">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 Created: {formatDate(entry.created_at)}
 </span>
 {entry.updated_at !== entry.created_at && (
 <span className="text-muted-foreground">
 Updated: {formatDate(entry.updated_at)}
 </span>
 )}
 </div>
 </Card>
 )}
 </div>
 );
}

'use client';

import { Star, Plus, X, Save, User, Building, Mail, Linkedin } from "lucide-react";
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
import type { Endorsement, EndorsementFormData } from '../types';
import {
 RELATIONSHIP_LABELS,
 COMMON_SKILLS,
 formatDate,
 formatRating,
} from '../types';

interface EndorsementFormViewProps {
 endorsement: Endorsement | null;
 formData: EndorsementFormData;
 formErrors: Record<string, string>;
 loading: boolean;
 saving: boolean;
 onFieldChange: (field: keyof EndorsementFormData, value: unknown) => void;
 onSave: () => void;
 onVerify?: () => void;
}

export default function EndorsementFormView({
 endorsement,
 formData,
 formErrors,
 loading,
 saving,
 onFieldChange,
 onSave,
 onVerify,
}: EndorsementFormViewProps) {
 const [skillInput, setSkillInput] = useState('');

 const handleAddSkill = () => {
 if (skillInput.trim() && !formData.skills_endorsed.includes(skillInput.trim())) {
 onFieldChange('skills_endorsed', [...formData.skills_endorsed, skillInput.trim()]);
 setSkillInput('');
 }
 };

 const handleRemoveSkill = (skill: string) => {
 onFieldChange('skills_endorsed', formData.skills_endorsed.filter(s => s !== skill));
 };

 const handleCommonSkillClick = (skill: string) => {
 if (!formData.skills_endorsed.includes(skill)) {
 onFieldChange('skills_endorsed', [...formData.skills_endorsed, skill]);
 }
 };

 if (loading) {
 return (
 <Card className="p-6">
 <div className="space-y-4">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="space-y-2">
 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
 <div className="h-10 bg-muted animate-pulse rounded" />
 </div>
 ))}
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <Card className="p-6">
 <div className="space-y-6">
 <div>
 <h3 className="text-lg font-semibold mb-4">Endorser Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="endorser_name">
 Name <span className="text-destructive">*</span>
 </Label>
 <Input
 
 value={formData.endorser_name}
 onChange={(e) => onFieldChange('endorser_name', e.target.value)}
 placeholder="John Doe"
 className={formErrors.endorser_name ? 'border-destructive' : ''}
 />
 {formErrors.endorser_name && (
 <p className="text-sm text-destructive">{formErrors.endorser_name}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="relationship">
 Relationship <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.relationship}
 onValueChange={(value) => onFieldChange('relationship', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="endorser_title">Title</Label>
 <div className="relative">
 <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input
 
 value={formData.endorser_title}
 onChange={(e) => onFieldChange('endorser_title', e.target.value)}
 placeholder="Senior Developer"
 className="pl-10"
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="endorser_company">Company</Label>
 <div className="relative">
 <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input
 
 value={formData.endorser_company}
 onChange={(e) => onFieldChange('endorser_company', e.target.value)}
 placeholder="Tech Corp"
 className="pl-10"
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="endorser_email">Email</Label>
 <div className="relative">
 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input
 
 type="email"
 value={formData.endorser_email}
 onChange={(e) => onFieldChange('endorser_email', e.target.value)}
 placeholder="john@example.com"
 className={`pl-10 ${formErrors.endorser_email ? 'border-destructive' : ''}`}
 />
 </div>
 {formErrors.endorser_email && (
 <p className="text-sm text-destructive">{formErrors.endorser_email}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="endorser_linkedin">LinkedIn Profile</Label>
 <div className="relative">
 <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input
 
 value={formData.endorser_linkedin}
 onChange={(e) => onFieldChange('endorser_linkedin', e.target.value)}
 placeholder="https://linkedin.com/in/johndoe"
 className={`pl-10 ${formErrors.endorser_linkedin ? 'border-destructive' : ''}`}
 />
 </div>
 {formErrors.endorser_linkedin && (
 <p className="text-sm text-destructive">{formErrors.endorser_linkedin}</p>
 )}
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4">Endorsement Details</h3>
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="endorsement_text">
 Endorsement Text <span className="text-destructive">*</span>
 </Label>
 <Textarea
 
 value={formData.endorsement_text}
 onChange={(e) => onFieldChange('endorsement_text', e.target.value)}
 placeholder="Describe your experience working with this person..."
 rows={6}
 className={formErrors.endorsement_text ? 'border-destructive' : ''}
 />
 {formErrors.endorsement_text && (
 <p className="text-sm text-destructive">{formErrors.endorsement_text}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label>
 Skills Endorsed <span className="text-destructive">*</span>
 </Label>
 <div className="flex gap-2">
 <Input
 value={skillInput}
 onChange={(e) => setSkillInput(e.target.value)}
 placeholder="Add a skill..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
 />
 <Button type="button" onClick={handleAddSkill} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 {formErrors.skills_endorsed && (
 <p className="text-sm text-destructive">{formErrors.skills_endorsed}</p>
 )}
 
 {formData.skills_endorsed.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {formData.skills_endorsed.map((skill) => (
 <Badge key={skill} variant="secondary" className="gap-1">
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
 <div className="flex flex-wrap gap-1">
 {COMMON_SKILLS.slice(0, 8).map((skill) => (
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

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="rating">
 Rating <span className="text-destructive">*</span>
 </Label>
 <Select
 value={String(formData.rating)}
 onValueChange={(value) => onFieldChange('rating', parseInt(value))}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {[5, 4, 3, 2, 1].map((rating) => (
 <SelectItem key={rating} value={String(rating)}>
 <span className="flex items-center gap-2">
 <span className="text-yellow-500">{formatRating(rating)}</span>
 <span>{rating} Star{rating !== 1 ? 's' : ''}</span>
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="date_received">
 Date Received <span className="text-destructive">*</span>
 </Label>
 <Input
 
 type="date"
 value={formData.date_received}
 onChange={(e) => onFieldChange('date_received', e.target.value)}
 className={formErrors.date_received ? 'border-destructive' : ''}
 />
 {formErrors.date_received && (
 <p className="text-sm text-destructive">{formErrors.date_received}</p>
 )}
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t">
 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <Label htmlFor="is_public">Public Endorsement</Label>
 <p className="text-sm text-muted-foreground">
 Make this endorsement visible to others
 </p>
 </div>
 <Switch
 
 checked={formData.is_public}
 onCheckedChange={(checked) => onFieldChange('is_public', checked)}
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <Label htmlFor="is_featured">Featured Endorsement</Label>
 <p className="text-sm text-muted-foreground">
 Highlight this endorsement on your profile
 </p>
 </div>
 <Switch
 
 checked={formData.is_featured}
 onCheckedChange={(checked) => onFieldChange('is_featured', checked)}
 />
 </div>
 </div>
 </div>
 </div>

 <div className="flex justify-between pt-4 border-t">
 <div>
 {endorsement && onVerify && endorsement.verification_status === 'pending' && (
 <Button type="button" variant="outline" onClick={onVerify}>
 Verify Endorsement
 </Button>
 )}
 </div>
 <Button onClick={onSave} disabled={saving}>
 <Save className="mr-2 h-4 w-4" />
 {saving ? 'Saving...' : endorsement ? 'Update Endorsement' : 'Add Endorsement'}
 </Button>
 </div>
 </div>
 </Card>

 {endorsement && (
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 Created: {formatDate(endorsement.created_at)}
 </span>
 {endorsement.updated_at !== endorsement.created_at && (
 <span className="text-muted-foreground">
 Updated: {formatDate(endorsement.updated_at)}
 </span>
 )}
 </div>
 </Card>
 )}
 </div>
 );
}

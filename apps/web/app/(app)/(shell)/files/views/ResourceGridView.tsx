'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Card, Badge, Button } from '@ghxstship/ui';
import type { Resource } from '../types';

const resourceTypeIcons = {
 policy: FileText,
 guide: BookOpen,
 training: GraduationCap,
 template: File,
 procedure: Clipboard,
 featured: Star,
};

const statusColors = {
 draft: 'bg-secondary/50 color-muted',
 under_review: 'bg-accent/10 color-accent',
 published: 'bg-success/10 color-success',
 archived: 'bg-warning/10 color-warning',
};

interface ResourceGridViewProps {
 resources: Resource[];
 onResourceClick: (resource: Resource) => void;
 onResourceEdit: (resource: Resource) => void;
 onResourceDownload: (resource: Resource) => void;
 selectedResources: string[];
 onSelectionChange: (resourceIds: string[]) => void;
}

export default function ResourceGridView({
 resources,
 onResourceClick,
 onResourceEdit,
 onResourceDownload,
 selectedResources,
 onSelectionChange
}: ResourceGridViewProps) {
 const handleResourceSelect = (resourceId: string, selected: boolean) => {
 if (selected) {
 onSelectionChange([...selectedResources, resourceId]);
 } else {
 onSelectionChange(selectedResources.filter(id => id !== resourceId));
 }
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {resources.map(resource => {
 const IconComponent = resourceTypeIcons[resource.type];
 const isSelected = selectedResources.includes(resource.id);
 
 return (
 <Card 
 key={resource.id}
 className={`cursor-pointer hover:shadow-elevated transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => onResourceClick(resource)}
 >
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => {
 e.stopPropagation();
 handleResourceSelect(resource.id, e.target.checked);
 }}
 className="rounded border-border"
 />
 <IconComponent className="w-5 h-5 color-accent" />
 <Badge variant="outline" className={statusColors[resource.status]}>
 {resource.status.replace('_', ' ')}
 </Badge>
 {resource.is_featured && (
 <Badge variant="secondary" className="bg-warning/10 color-warning">
 <Star className="w-3 h-3 mr-xs" />
 Featured
 </Badge>
 )}
 </div>
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Eye className="w-4 h-4" />
 <span>{resource.view_count}</span>
 <Download className="w-4 h-4 ml-sm" />
 <span>{resource.download_count}</span>
 </div>
 </div>
 
 <h3 className="text-heading-4 mb-sm line-clamp-2">{resource.title}</h3>
 
 {resource.description && (
 <p className="text-body-sm color-muted mb-sm line-clamp-3">{resource.description}</p>
 )}
 
 <div className="flex items-center justify-between">
 <div className="flex flex-wrap gap-xs">
 <Badge variant="outline">{resource.type}</Badge>
 <Badge variant="outline">{resource.category}</Badge>
 </div>
 
 <div className="flex items-center gap-sm">
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onResourceEdit(resource);
 }}
 >
 <Edit className="w-4 h-4" />
 </Button>
 {resource.file_url && (
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onResourceDownload(resource);
 }}
 >
 <Download className="w-4 h-4" />
 </Button>
 )}
 </div>
 </div>
 
 {resource.tags && resource.tags.length > 0 && (
 <div className="mt-sm flex flex-wrap gap-xs">
 {resource.tags.slice(0, 3).map((tag, index) => (
 <Badge key={index} variant="secondary" size="sm">
 {tag}
 </Badge>
 ))}
 {resource.tags.length > 3 && (
 <Badge variant="secondary" size="sm">
 +{resource.tags.length - 3} more
 </Badge>
 )}
 </div>
 )}
 </Card>
 );
 })}
 </div>
 );
}

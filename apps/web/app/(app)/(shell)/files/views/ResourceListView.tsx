'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2, Download, Edit, Star } from 'lucide-react';
import { Badge, Button } from '@ghxstship/ui';
import type { Resource } from '../types';

const resourceTypeIcons = {
 policy: FileText,
 guide: BookOpen,
 training: GraduationCap,
 template: File,
 procedure: Clipboard,
 featured: Star
};

const statusColors = {
 draft: 'bg-secondary/50 color-muted',
 under_review: 'bg-accent/10 color-accent',
 published: 'bg-success/10 color-success',
 archived: 'bg-warning/10 color-warning'
};

interface ResourceListViewProps {
 resources: Resource[];
 onResourceClick: (resource: Resource) => void;
 onResourceEdit: (resource: Resource) => void;
 onResourceDownload: (resource: Resource) => void;
 selectedResources: string[];
 onSelectionChange: (resourceIds: string[]) => void;
}

export default function ResourceListView({
 resources,
 onResourceClick,
 onResourceEdit,
 onResourceDownload,
 selectedResources,
 onSelectionChange
}: ResourceListViewProps) {
 const handleResourceSelect = (resourceId: string, selected: boolean) => {
 if (selected) {
 onSelectionChange([...selectedResources, resourceId]);
 } else {
 onSelectionChange(selectedResources.filter(id => id !== resourceId));
 }
 };

 const handleSelectAll = (selected: boolean) => {
 if (selected) {
 onSelectionChange(resources.map(r => r.id));
 } else {
 onSelectionChange([]);
 }
 };

 const allSelected = resources.length > 0 && selectedResources.length === resources.length;
 const someSelected = selectedResources.length > 0 && selectedResources.length < resources.length;

 return (
 <div className="bg-background border border-border rounded-lg overflow-hidden">
 {/* Table Header */}
 <div className="bg-muted/50 border-b border-border p-sm">
 <div className="grid grid-cols-12 gap-md items-center text-body-sm form-label">
 <div className="col-span-1">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(el) => {
 if (el) el.indeterminate = someSelected;
 }}
 onChange={(e) => handleSelectAll(e.target.checked)}
 className="rounded border-border"
 />
 </div>
 <div className="col-span-4">Resource</div>
 <div className="col-span-2">Type</div>
 <div className="col-span-2">Status</div>
 <div className="col-span-1">Views</div>
 <div className="col-span-1">Downloads</div>
 <div className="col-span-1">Actions</div>
 </div>
 </div>

 {/* Table Body */}
 <div className="divide-y divide-border">
 {resources.map(resource => {
 const IconComponent = resourceTypeIcons[resource.type];
 const isSelected = selectedResources.includes(resource.id);
 
 return (
 <div 
 key={resource.id}
 className={`grid grid-cols-12 gap-md items-center p-sm hover:bg-muted/50 cursor-pointer transition-colors ${
 isSelected ? 'bg-primary/5' : ''
 }`}
 onClick={() => onResourceClick(resource)}
 >
 <div className="col-span-1">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => {
 e.stopPropagation();
 handleResourceSelect(resource.id, e.target.checked);
 }}
 className="rounded border-border"
 />
 </div>
 
 <div className="col-span-4">
 <div className="flex items-center gap-sm">
 <IconComponent className="w-icon-xs h-icon-xs color-accent flex-shrink-0" />
 <div className="min-w-0">
 <div className="font-medium text-body-sm truncate">{resource.title}</div>
 {resource.description && (
 <div className="text-body-sm color-muted truncate">{resource.description}</div>
 )}
 </div>
 {resource.is_featured && (
 <Star className="w-3 h-3 color-warning flex-shrink-0" />
 )}
 </div>
 </div>
 
 <div className="col-span-2">
 <Badge variant="outline">{resource.type}</Badge>
 </div>
 
 <div className="col-span-2">
 <Badge variant="outline" className={statusColors[resource.status]}>
 {resource.status.replace('_', ' ')}
 </Badge>
 </div>
 
 <div className="col-span-1 text-body-sm color-muted">
 {resource.view_count}
 </div>
 
 <div className="col-span-1 text-body-sm color-muted">
 {resource.download_count}
 </div>
 
 <div className="col-span-1">
 <div className="flex items-center gap-xs">
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onResourceEdit(resource);
 }}
 >
 <Edit className="w-3 h-3" />
 </Button>
 {resource.file_url && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onResourceDownload(resource);
 }}
 >
 <Download className="w-3 h-3" />
 </Button>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

'use client';

import { Search, Filter, Download, Star, Calendar, User, Building, Shield, Eye, EyeOff, MoreVertical, Award } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 Button,
 Badge,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox,
} from '@ghxstship/ui';
import type { Endorsement, EndorsementFilters, EndorsementSort } from '../types';
import {
 RELATIONSHIP_LABELS,
 VERIFICATION_STATUS_LABELS,
 formatDate,
 formatRating,
 truncateText,
 getVerificationBadgeVariant,
 filterEndorsements,
 sortEndorsements,
} from '../types';

interface EndorsementGridViewProps {
 endorsements: Endorsement[];
 loading: boolean;
 selectedIds: string[];
 filters: EndorsementFilters;
 sort: EndorsementSort;
 onToggleSelect: (id: string, selected: boolean) => void;
 onToggleAll: (selected: boolean) => void;
 onFiltersChange: (filters: Partial<EndorsementFilters>) => void;
 onSortChange: (sort: EndorsementSort) => void;
 onExport: (endorsements: Endorsement[]) => void;
 onEdit: (endorsement: Endorsement) => void;
 onDelete: (endorsement: Endorsement) => void;
 onVerify: (endorsement: Endorsement) => void;
 onToggleFeatured: (endorsement: Endorsement) => void;
 onTogglePublic: (endorsement: Endorsement) => void;
}

export default function EndorsementGridView({
 endorsements,
 loading,
 selectedIds,
 filters,
 sort,
 onToggleSelect,
 onToggleAll,
 onFiltersChange,
 onSortChange,
 onExport,
 onEdit,
 onDelete,
 onVerify,
 onToggleFeatured,
 onTogglePublic,
}: EndorsementGridViewProps) {
 const [showFilters, setShowFilters] = useState(false);
 const [activeMenu, setActiveMenu] = useState<string | null>(null);

 const filteredEndorsements = filterEndorsements(endorsements, filters);
 const sortedEndorsements = sortEndorsements(filteredEndorsements, sort);

 const allSelected = sortedEndorsements.length > 0 && 
 sortedEndorsements.every(e => selectedIds.includes(e.id));
 const someSelected = sortedEndorsements.some(e => selectedIds.includes(e.id));

 const handleSort = (field: EndorsementSort['field']) => {
 onSortChange({
 field,
 direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
 });
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="space-y-sm">
 <div className="h-icon-md w-3/4 bg-muted rounded" />
 <div className="h-icon-xs w-full bg-muted rounded" />
 <div className="h-icon-xs w-full bg-muted rounded" />
 <div className="h-icon-xs w-2/3 bg-muted rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-md">
 <div className="flex flex-col gap-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onCheckedChange={onToggleAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 && `${selectedIds.length} selected`}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowFilters(!showFilters)}
 >
 <Filter className="mr-2 h-icon-xs w-icon-xs" />
 Filters
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onExport(sortedEndorsements.filter(e => selectedIds.includes(e.id)))}
 disabled={selectedIds.length === 0}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>
 </div>
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-sm h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search endorsements..."
 value={filters.search}
 onChange={(e) => onFiltersChange({ search: e.target.value })}
 className="pl-10"
 />
 </div>

 {/* Filters */}
 {showFilters && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md pt-4 border-t">
 <Select
 value={filters.relationship || 'all'}
 onValueChange={(value) => onFiltersChange({ relationship: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Relationships" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Relationships</SelectItem>
 {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={String(filters.rating || 'all')}
 onValueChange={(value) => onFiltersChange({ 
 rating: value === 'all' ? 'all' : parseInt(value) 
 })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Ratings" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Ratings</SelectItem>
 {[5, 4, 3, 2, 1].map((rating) => (
 <SelectItem key={rating} value={String(rating)}>
 {formatRating(rating)} ({rating} Star{rating !== 1 ? 's' : ''})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={filters.verification_status || 'all'}
 onValueChange={(value) => onFiltersChange({ verification_status: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Statuses" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Statuses</SelectItem>
 {Object.entries(VERIFICATION_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}

 {/* Sort */}
 <div className="flex items-center gap-xs text-sm">
 <span className="text-muted-foreground">Sort by:</span>
 <Button
 variant={sort.field === 'date_received' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('date_received')}
 >
 Date
 </Button>
 <Button
 variant={sort.field === 'rating' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('rating')}
 >
 Rating
 </Button>
 <Button
 variant={sort.field === 'endorser_name' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('endorser_name')}
 >
 Name
 </Button>
 </div>
 </div>
 </Card>

 {/* Grid */}
 {sortedEndorsements.length === 0 ? (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <Award className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Endorsements Found</h3>
 <p className="text-muted-foreground mt-2">
 {filters.search || filters.relationship !== 'all' || filters.rating !== 'all'
 ? 'Try adjusting your filters'
 : 'Add your first endorsement to get started'}
 </p>
 </div>
 </div>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {sortedEndorsements.map((endorsement) => {
 const isSelected = selectedIds.includes(endorsement.id);
 
 return (
 <Card
 key={endorsement.id}
 className={`p-md transition-all hover:shadow-lg ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 >
 <div className="space-y-sm">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-xs">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onToggleSelect(endorsement.id, !!checked)}
 />
 <div className="flex-1">
 <h3 className="font-semibold line-clamp-xs">
 {endorsement.endorser_name}
 </h3>
 <div className="flex items-center gap-xs mt-1">
 <span className="text-yellow-500 text-sm">
 {formatRating(endorsement.rating)}
 </span>
 <Badge 
 variant={getVerificationBadgeVariant(endorsement.verification_status)}
 className="text-xs"
 >
 {VERIFICATION_STATUS_LABELS[endorsement.verification_status]}
 </Badge>
 </div>
 </div>
 </div>
 
 <div className="relative">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setActiveMenu(activeMenu === endorsement.id ? null : endorsement.id)}
 >
 <MoreVertical className="h-icon-xs w-icon-xs" />
 </Button>
 
 {activeMenu === endorsement.id && (
 <div className="absolute right-0 top-xl z-10 w-container-xs bg-background border rounded-md shadow-lg">
 <div className="py-xs">
 <button
 className="w-full px-sm py-xs text-sm text-left hover:bg-muted"
 onClick={() => {
 onEdit(endorsement);
 setActiveMenu(null);
 }}
 >
 Edit
 </button>
 {endorsement.verification_status === 'pending' && (
 <button
 className="w-full px-sm py-xs text-sm text-left hover:bg-muted"
 onClick={() => {
 onVerify(endorsement);
 setActiveMenu(null);
 }}
 >
 Verify
 </button>
 )}
 <button
 className="w-full px-sm py-xs text-sm text-left hover:bg-muted"
 onClick={() => {
 onToggleFeatured(endorsement);
 setActiveMenu(null);
 }}
 >
 {endorsement.is_featured ? 'Unfeature' : 'Feature'}
 </button>
 <button
 className="w-full px-sm py-xs text-sm text-left hover:bg-muted"
 onClick={() => {
 onTogglePublic(endorsement);
 setActiveMenu(null);
 }}
 >
 Make {endorsement.is_public ? 'Private' : 'Public'}
 </button>
 <button
 className="w-full px-sm py-xs text-sm text-left hover:bg-muted text-destructive"
 onClick={() => {
 onDelete(endorsement);
 setActiveMenu(null);
 }}
 >
 Delete
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Info */}
 <div className="space-y-xs text-sm text-muted-foreground">
 {endorsement.endorser_title && (
 <div className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 <span className="line-clamp-xs">{endorsement.endorser_title}</span>
 </div>
 )}
 {endorsement.endorser_company && (
 <div className="flex items-center gap-xs">
 <Building className="h-3 w-3" />
 <span className="line-clamp-xs">{endorsement.endorser_company}</span>
 </div>
 )}
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span>{formatDate(endorsement.date_received)}</span>
 </div>
 </div>

 {/* Endorsement Text */}
 <p className="text-sm text-muted-foreground line-clamp-sm">
 {endorsement.endorsement_text}
 </p>

 {/* Skills */}
 {endorsement.skills_endorsed.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {endorsement.skills_endorsed.slice(0, 3).map((skill) => (
 <Badge key={skill} variant="secondary" className="text-xs">
 {skill}
 </Badge>
 ))}
 {endorsement.skills_endorsed.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{endorsement.skills_endorsed.length - 3}
 </Badge>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-3 border-t">
 <Badge variant="outline" className="text-xs">
 {RELATIONSHIP_LABELS[endorsement.relationship]}
 </Badge>
 <div className="flex items-center gap-xs">
 {endorsement.is_featured && (
 <Star className="h-3 w-3 fill-current text-yellow-500" />
 )}
 {endorsement.is_public ? (
 <Eye className="h-3 w-3 text-muted-foreground" />
 ) : (
 <EyeOff className="h-3 w-3 text-muted-foreground" />
 )}
 </div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}

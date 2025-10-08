'use client';

import { Search, Filter, Download, Star, Calendar, User, Building, ChevronRight, Shield, Eye, EyeOff, Edit, Trash2, Award } from "lucide-react";
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
 Checkbox
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
 sortEndorsements
} from '../types';

interface EndorsementListViewProps {
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

export default function EndorsementListView({
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
 onTogglePublic
}: EndorsementListViewProps) {
 const [showFilters, setShowFilters] = useState(false);

 const filteredEndorsements = filterEndorsements(endorsements, filters);
 const sortedEndorsements = sortEndorsements(filteredEndorsements, sort);

 const allSelected = sortedEndorsements.length > 0 && 
 sortedEndorsements.every(e => selectedIds.includes(e.id));
 const someSelected = sortedEndorsements.some(e => selectedIds.includes(e.id));

 const handleSort = (field: EndorsementSort['field']) => {
 onSortChange({
 field,
 direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
 });
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="p-md border rounded-lg animate-pulse">
 <div className="h-icon-md w-container-xs bg-muted rounded mb-2" />
 <div className="h-icon-xs w-full bg-muted rounded mb-2" />
 <div className="h-icon-xs w-3/4 bg-muted rounded" />
 </div>
 ))}
 </div>
 </Card>
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

 {/* List */}
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
 <div className="space-y-xs">
 {sortedEndorsements.map((endorsement) => {
 const isSelected = selectedIds.includes(endorsement.id);
 
 return (
 <Card
 key={endorsement.id}
 className={`p-md transition-colors ${
 isSelected ? 'bg-muted/50 border-primary' : 'hover:bg-muted/30'
 }`}
 >
 <div className="flex items-start gap-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onToggleSelect(endorsement.id, !!checked)}
 />
 
 <div className="flex-1 space-y-sm">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-xs mb-1">
 <h3 className="font-semibold">{endorsement.endorser_name}</h3>
 <Badge variant={getVerificationBadgeVariant(endorsement.verification_status)}>
 <Shield className="mr-1 h-3 w-3" />
 {VERIFICATION_STATUS_LABELS[endorsement.verification_status]}
 </Badge>
 {endorsement.is_featured && (
 <Badge variant="primary">
 <Star className="mr-1 h-3 w-3" />
 Featured
 </Badge>
 )}
 </div>
 
 <div className="flex flex-wrap items-center gap-sm text-sm text-muted-foreground">
 {endorsement.endorser_title && (
 <div className="flex items-center gap-xs">
 <User className="h-3 w-3" />
 {endorsement.endorser_title}
 </div>
 )}
 {endorsement.endorser_company && (
 <div className="flex items-center gap-xs">
 <Building className="h-3 w-3" />
 {endorsement.endorser_company}
 </div>
 )}
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {formatDate(endorsement.date_received)}
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
 <span className="text-yellow-500">{formatRating(endorsement.rating)}</span>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(endorsement)}
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 
 <p className="text-sm text-muted-foreground">
 {truncateText(endorsement.endorsement_text, 200)}
 </p>
 
 {endorsement.skills_endorsed.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {endorsement.skills_endorsed.slice(0, 5).map((skill) => (
 <Badge key={skill} variant="secondary" className="text-xs">
 {skill}
 </Badge>
 ))}
 {endorsement.skills_endorsed.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{endorsement.skills_endorsed.length - 5} more
 </Badge>
 )}
 </div>
 )}
 
 <div className="flex items-center justify-between pt-2 border-t">
 <div className="flex items-center gap-xs">
 <Badge variant="outline">
 {RELATIONSHIP_LABELS[endorsement.relationship]}
 </Badge>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onTogglePublic(endorsement)}
 >
 {endorsement.is_public ? (
 <Eye className="h-icon-xs w-icon-xs" />
 ) : (
 <EyeOff className="h-icon-xs w-icon-xs" />
 )}
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onToggleFeatured(endorsement)}
 >
 <Star className={`h-icon-xs w-icon-xs ${endorsement.is_featured ? 'fill-current' : ''}`} />
 </Button>
 </div>
 
 <div className="flex items-center gap-xs">
 {endorsement.verification_status === 'pending' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onVerify(endorsement)}
 >
 <Shield className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(endorsement)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(endorsement)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
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

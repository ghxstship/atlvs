'use client';

import { Building, Globe, Mail, Phone, MapPin, Users, Edit, Eye, Trash2, Calendar } from "lucide-react";
import { Card, Button, Badge } from '@ghxstship/ui';
import type { Company } from '../types';

interface DirectoryListViewProps {
 companies: Company[];
 onEdit: (company: Company) => void;
 onView: (company: Company) => void;
 onDelete: (company: Company) => void;
 loading?: boolean;
}

export default function DirectoryListView({
 companies,
 onEdit,
 onView,
 onDelete,
 loading = false
}: DirectoryListViewProps) {
 if (loading) {
 return (
 <div className="space-y-4">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-6 animate-pulse">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4 flex-1">
 <div className="w-12 h-12 bg-muted rounded-lg"></div>
 <div className="flex-1">
 <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/6 mb-1"></div>
 <div className="h-3 bg-muted rounded w-1/3"></div>
 </div>
 </div>
 <div className="flex space-x-2">
 <div className="w-8 h-8 bg-muted rounded"></div>
 <div className="w-8 h-8 bg-muted rounded"></div>
 <div className="w-8 h-8 bg-muted rounded"></div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (companies.length === 0) {
 return (
 <Card className="p-12 text-center">
 <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No companies found</h3>
 <p className="text-muted-foreground">
 Try adjusting your search criteria or add a new company.
 </p>
 </Card>
 );
 }

 const getStatusVariant = (status: Company['status']) => {
 switch (status) {
 case 'active':
 return 'success';
 case 'pending':
 return 'warning';
 case 'inactive':
 return 'secondary';
 case 'blacklisted':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 const getSizeLabel = (size?: Company['size']) => {
 switch (size) {
 case 'startup':
 return '1-10';
 case 'small':
 return '11-50';
 case 'medium':
 return '51-200';
 case 'large':
 return '201-1K';
 case 'enterprise':
 return '1K+';
 default:
 return 'Unknown';
 }
 };

 const formatDate = (dateString?: string) => {
 if (!dateString) return '';
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 });
 };

 return (
 <div className="space-y-4">
 {companies.map((company) => (
 <Card key={company.id} className="p-6 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4 flex-1 min-w-0">
 {/* Logo/Icon */}
 <div className="flex-shrink-0">
 {company.logo_url ? (
 <img
 src={company.logo_url}
 alt={`${company.name} logo`}
 className="w-12 h-12 rounded-lg object-cover"
 />
 ) : (
 <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
 <Building className="h-6 w-6 text-muted-foreground" />
 </div>
 )}
 </div>

 {/* Company Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-3 mb-1">
 <h3 className="font-semibold text-lg truncate" title={company.name}>
 {company.name}
 </h3>
 <Badge variant={getStatusVariant(company.status)}>
 {company.status}
 </Badge>
 {company.industry && (
 <span className="text-sm text-muted-foreground">
 {company.industry}
 </span>
 )}
 </div>

 <div className="flex items-center space-x-6 text-sm text-muted-foreground">
 {company.website && (
 <div className="flex items-center space-x-1">
 <Globe className="h-4 w-4" />
 <a
 href={company.website as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="hover:text-primary truncate max-w-32"
 >
 {company.website.replace(/^https?:\/\//, '')}
 </a>
 </div>
 )}
 
 {company.email && (
 <div className="flex items-center space-x-1">
 <Mail className="h-4 w-4" />
 <a
 href={`mailto:${company.email as any as any}`}
 className="hover:text-primary truncate max-w-40"
 >
 {company.email}
 </a>
 </div>
 )}
 
 {company.phone && (
 <div className="flex items-center space-x-1">
 <Phone className="h-4 w-4" />
 <a
 href={`tel:${company.phone as any as any}`}
 className="hover:text-primary"
 >
 {company.phone}
 </a>
 </div>
 )}
 
 {(company.city || company.country) && (
 <div className="flex items-center space-x-1">
 <MapPin className="h-4 w-4" />
 <span className="truncate max-w-32">
 {[company.city, company.country].filter(Boolean).join(', ')}
 </span>
 </div>
 )}
 
 {company.size && (
 <div className="flex items-center space-x-1">
 <Users className="h-4 w-4" />
 <span>{getSizeLabel(company.size)} employees</span>
 </div>
 )}

 {company.founded_year && (
 <div className="flex items-center space-x-1">
 <Calendar className="h-4 w-4" />
 <span>Founded {company.founded_year}</span>
 </div>
 )}
 </div>

 {company.description && (
 <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
 {company.description}
 </p>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
 <div className="text-xs text-muted-foreground text-right">
 {company.created_at && (
 <div>Added {formatDate(company.created_at)}</div>
 )}
 {company.updated_at && company.updated_at !== company.created_at && (
 <div>Updated {formatDate(company.updated_at)}</div>
 )}
 </div>
 <div className="flex items-center space-x-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(company)}
 title="View company details"
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(company)}
 title="Edit company"
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(company)}
 title="Delete company"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
}

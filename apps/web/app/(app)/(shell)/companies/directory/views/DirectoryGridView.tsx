'use client';

import { Building, Globe, Mail, Phone, MapPin, Users, Edit, Eye, Trash2 } from "lucide-react";
import { Card, Button, Badge } from '@ghxstship/ui';
import type { Company } from '../types';

interface DirectoryGridViewProps {
 companies: Company[];
 onEdit: (company: Company) => void;
 onView: (company: Company) => void;
 onDelete: (company: Company) => void;
 loading?: boolean;
}

export default function DirectoryGridView({
 companies,
 onEdit,
 onView,
 onDelete,
 loading = false
}: DirectoryGridViewProps) {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {[...Array(8)].map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
 <div className="space-y-xs">
 <div className="h-3 bg-muted rounded w-full"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (companies.length === 0) {
 return (
 <div className="text-center py-xsxl">
 <Building className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No companies found</h3>
 <p className="text-muted-foreground">
 Try adjusting your search criteria or add a new company.
 </p>
 </div>
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
 return '1-10 employees';
 case 'small':
 return '11-50 employees';
 case 'medium':
 return '51-200 employees';
 case 'large':
 return '201-1000 employees';
 case 'enterprise':
 return '1000+ employees';
 default:
 return 'Unknown size';
 }
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {companies.map((company) => (
 <Card key={company.id} className="p-lg hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h3 className="font-semibold text-lg mb-1 truncate" title={company.name}>
 {company.name}
 </h3>
 {company.industry && (
 <p className="text-sm text-muted-foreground mb-2">{company.industry}</p>
 )}
 <Badge variant={getStatusVariant(company.status)}>
 {company.status}
 </Badge>
 </div>
 {company.logo_url && (
 <img
 src={company.logo_url}
 alt={`${company.name} logo`}
 className="w-icon-2xl h-icon-2xl rounded-lg object-cover"
 />
 )}
 </div>

 {company.description && (
 <p className="text-sm text-muted-foreground mb-4 line-clamp-xs">
 {company.description}
 </p>
 )}

 <div className="space-y-xs mb-4">
 {company.website && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Globe className="h-icon-xs w-icon-xs mr-2 flex-shrink-0" />
 <a
 href={company.website as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="hover:text-primary truncate"
 >
 {company.website.replace(/^https?:\/\//, '')}
 </a>
 </div>
 )}
 
 {company.email && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Mail className="h-icon-xs w-icon-xs mr-2 flex-shrink-0" />
 <a
 href={`mailto:${company.email as any as any}`}
 className="hover:text-primary truncate"
 >
 {company.email}
 </a>
 </div>
 )}
 
 {company.phone && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Phone className="h-icon-xs w-icon-xs mr-2 flex-shrink-0" />
 <a
 href={`tel:${company.phone as any as any}`}
 className="hover:text-primary"
 >
 {company.phone}
 </a>
 </div>
 )}
 
 {(company.city || company.country) && (
 <div className="flex items-center text-sm text-muted-foreground">
 <MapPin className="h-icon-xs w-icon-xs mr-2 flex-shrink-0" />
 <span className="truncate">
 {[company.city, company.country].filter(Boolean).join(', ')}
 </span>
 </div>
 )}
 
 {company.size && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Users className="h-icon-xs w-icon-xs mr-2 flex-shrink-0" />
 <span>{getSizeLabel(company.size)}</span>
 </div>
 )}
 </div>

 <div className="flex items-center justify-between pt-4 border-t">
 <div className="text-xs text-muted-foreground">
 {company.founded_year && `Founded ${company.founded_year}`}
 </div>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(company)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(company)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(company)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
}

'use client';

import Image from 'next/image';
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
 <div className="space-y-md">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md flex-1">
 <div className="w-icon-2xl h-icon-2xl bg-muted rounded-lg"></div>
 <div className="flex-1">
 <div className="h-icon-xs bg-muted rounded w-1/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/6 mb-1"></div>
 <div className="h-3 bg-muted rounded w-1/3"></div>
 </div>
 </div>
 <div className="flex space-x-xs">
 <div className="w-icon-lg h-icon-lg bg-muted rounded"></div>
 <div className="w-icon-lg h-icon-lg bg-muted rounded"></div>
 <div className="w-icon-lg h-icon-lg bg-muted rounded"></div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (companies.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <Building className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
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
 return 'error';
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
 day: 'numeric'
 });
 };

 return (
    <div className="space-y-md">
      {companies.map((company) => (
        <Card key={company.id} className="p-lg">
          <div className="flex items-center space-x-md flex-1 min-w-0">
            {/* Logo/Icon */}
            <div className="flex-shrink-0">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  width={64}
                  height={64}
                  className="w-icon-2xl h-icon-2xl rounded-lg object-cover"
                />
              ) : (
                <div className="w-icon-2xl h-icon-2xl rounded-lg bg-muted flex items-center justify-center">
                  <Building className="h-icon-md w-icon-md text-muted-foreground" />
                </div>
              )}
            </div>
            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-sm mb-1">
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

              <div className="flex items-center space-x-lg text-sm text-muted-foreground">
                {company.website && (
                  <div className="flex items-center space-x-xs">
                    <Globe className="h-icon-xs w-icon-xs" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate max-w-component-xl"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center space-x-xs">
                    <Mail className="h-icon-xs w-icon-xs" />
                    <a
                      href={`mailto:${company.email}`}
                      className="hover:text-primary truncate max-w-40"
                    >
                      {company.email}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center space-x-xs">
                    <Phone className="h-icon-xs w-icon-xs" />
                    <a
                      href={`tel:${company.phone}`}
                      className="hover:text-primary"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}

                {(company.city || company.country) && (
                  <div className="flex items-center space-x-xs">
                    <MapPin className="h-icon-xs w-icon-xs" />
                    <span className="truncate max-w-component-xl">
                      {[company.city, company.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {company.size && (
                  <div className="flex items-center space-x-xs">
                    <Users className="h-icon-xs w-icon-xs" />
                    <span>{getSizeLabel(company.size)} employees</span>
                  </div>
                )}

                {company.founded_year && (
                  <div className="flex items-center space-x-xs">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    <span>Founded {company.founded_year}</span>
                  </div>
                )}
              </div>

              {company.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-xs">
                  {company.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-xs flex-shrink-0 ml-4">
              <div className="text-xs text-muted-foreground text-right">
                {company.created_at && (
                  <div>Added {formatDate(company.created_at)}</div>
                )}
                {company.updated_at && company.updated_at !== company.created_at && (
                  <div>Updated {formatDate(company.updated_at)}</div>
                )}
              </div>
              <div className="flex items-center space-x-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(company)}
                  title="View company details"
                >
                  <Eye className="h-icon-xs w-icon-xs" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(company)}
                  title="Edit company"
                >
                  <Edit className="h-icon-xs w-icon-xs" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(company)}
                  title="Delete company"
                >
                  <Trash2 className="h-icon-xs w-icon-xs" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

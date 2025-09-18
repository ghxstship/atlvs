'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Badge } from '@ghxstship/ui';
import { Building, Search, Filter, Star, Phone, Mail, Globe, Edit } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  tax_id?: string;
  payment_terms?: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function VendorsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Vendor['status']>('all');

  useEffect(() => {
    loadVendors();
  }, [orgId]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery, statusFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/procurement/vendors', {
        headers: {
          'x-organization-id': orgId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setVendors(result.data || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.contact_person?.toLowerCase().includes(query) ||
        vendor.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    setFilteredVendors(filtered);
  };

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'active': return 'bg-success/10 color-success-foreground';
      case 'inactive': return 'bg-secondary/50 color-muted';
      case 'pending': return 'bg-warning/10 color-warning-foreground';
      default: return 'bg-secondary/50 color-muted';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-xs">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'color-warning fill-current' : 'color-muted'
            }`}
          />
        ))}
        <span className="text-body-sm color-foreground/70 ml-xs">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
          <p className="color-foreground/70">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-2xl"
            />
          </div>
        </div>
        
        <div className="flex gap-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-sm py-sm border border-input rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-2xl">
          <Building className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
          <h3 className="text-body form-label mb-sm">No vendors found</h3>
          <p className="color-foreground/70 mb-md">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first vendor'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border border-border rounded-lg p-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 color-primary" />
                  </div>
                  <div>
                    <h3 className="form-label">{vendor.name}</h3>
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
                <Button>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {vendor.description && (
                <p className="text-body-sm color-foreground/70 mb-md line-clamp-2">
                  {vendor.description}
                </p>
              )}

              <div className="stack-sm mb-md">
                {vendor.contact_person && (
                  <div className="flex items-center gap-sm text-body-sm">
                    <span className="form-label">Contact:</span>
                    <span className="color-foreground/70">{vendor.contact_person}</span>
                  </div>
                )}
                
                {vendor.email && (
                  <div className="flex items-center gap-sm text-body-sm">
                    <Mail className="h-4 w-4 color-foreground/50" />
                    <a 
                      href={`mailto:${vendor.email}`}
                      className="color-primary hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                )}
                
                {vendor.phone && (
                  <div className="flex items-center gap-sm text-body-sm">
                    <Phone className="h-4 w-4 color-foreground/50" />
                    <a 
                      href={`tel:${vendor.phone}`}
                      className="color-primary hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  </div>
                )}
                
                {vendor.website && (
                  <div className="flex items-center gap-sm text-body-sm">
                    <Globe className="h-4 w-4 color-foreground/50" />
                    <a 
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="color-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {vendor.rating && (
                <div className="mb-md">
                  {renderStars(vendor.rating)}
                </div>
              )}

              {vendor.payment_terms && (
                <div className="text-body-sm">
                  <span className="form-label">Payment Terms:</span>
                  <span className="color-foreground/70 ml-sm">{vendor.payment_terms}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Badge } from '@ghxstship/ui';
import { Building2, Search, Filter, Star, Phone, Mail, Globe, Edit } from 'lucide-react';

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-foreground/70 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background"
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
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No vendors found</h3>
          <p className="text-foreground/70 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first vendor'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{vendor.name}</h3>
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
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                  {vendor.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {vendor.contact_person && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Contact:</span>
                    <span className="text-foreground/70">{vendor.contact_person}</span>
                  </div>
                )}
                
                {vendor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-foreground/50" />
                    <a 
                      href={`mailto:${vendor.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                )}
                
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-foreground/50" />
                    <a 
                      href={`tel:${vendor.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  </div>
                )}
                
                {vendor.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-foreground/50" />
                    <a 
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {vendor.rating && (
                <div className="mb-4">
                  {renderStars(vendor.rating)}
                </div>
              )}

              {vendor.payment_terms && (
                <div className="text-sm">
                  <span className="font-medium">Payment Terms:</span>
                  <span className="text-foreground/70 ml-2">{vendor.payment_terms}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

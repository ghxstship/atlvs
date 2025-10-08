'use client';


import { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Badge, Button, Card, Drawer, Input, Skeleton, StateManagerProvider, type DataRecord } from '@ghxstship/ui';
import { Building, Edit, Eye, Filter, Globe, Mail, MapPin, Phone, Plus, Search, Star, Trash2, Users } from 'lucide-react';

interface DirectoryClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Company {
  id: string;
  name: string;
  description?: string;
  industry: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: 'active' | 'inactive' | 'pending' | 'blacklisted';
  size?: string;
  foundedYear?: number;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId: string;
}

export default function DirectoryClient({ user, orgId, translations }: DirectoryClientProps) {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  const supabase = createBrowserClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, searchQuery, industryFilter, statusFilter, sizeFilter]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.city?.toLowerCase().includes(query) ||
        company.country?.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    // Size filter
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(company => company.size === sizeFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleSaveCompany = async (companyData: Partial<Company>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            organization_id: orgId,
            created_by: user.id,
            status: 'active'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', selectedCompany.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      blacklisted: { variant: 'destructive' as const, label: 'Blacklisted' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.active;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getSizeIcon = (size?: string) => {
    switch (size) {
      case 'startup':
        return <Users className="h-icon-xs w-icon-xs color-success" />;
      case 'small':
        return <Users className="h-icon-xs w-icon-xs color-accent" />;
      case 'medium':
        return <Users className="h-icon-xs w-icon-xs color-warning" />;
      case 'large':
        return <Users className="h-icon-xs w-icon-xs color-secondary" />;
      case 'enterprise':
        return <Users className="h-icon-xs w-icon-xs color-destructive" />;
      default:
        return <Building className="h-icon-xs w-icon-xs color-muted" />;
    }
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'name',
      label: 'Company Name',
      type: 'text',
      required: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'industry',
      label: 'Industry',
      type: 'select',
      required: true,
      options: [
        { label: 'Construction', value: 'construction' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Technology', value: 'technology' },
        { label: 'Logistics', value: 'logistics' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'size',
      label: 'Company Size',
      type: 'select',
      options: [
        { label: 'Startup (1-10)', value: 'startup' },
        { label: 'Small (11-50)', value: 'small' },
        { label: 'Medium (51-200)', value: 'medium' },
        { label: 'Large (201-1000)', value: 'large' },
        { label: 'Enterprise (1000+)', value: 'enterprise' }
      ]
    },
    {
      key: 'website',
      label: 'Website',
      type: 'url'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email'
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text'
    },
    {
      key: 'address',
      label: 'Address',
      type: 'text'
    },
    {
      key: 'city',
      label: 'City',
      type: 'text'
    },
    {
      key: 'state',
      label: 'State',
      type: 'text'
    },
    {
      key: 'country',
      label: 'Country',
      type: 'text'
    },
    {
      key: 'foundedYear',
      label: 'Founded Year',
      type: 'number'
    }
  ];

  const companyRecords: DataRecord[] = filteredCompanies.map(company => ({
    id: company.id,
    name: company.name,
    description: company.description,
    industry: company.industry,
    size: company.size,
    website: company.website,
    email: company.email,
    phone: company.phone,
    address: company.address,
    city: company.city,
    state: company.state,
    country: company.country,
    status: company.status,
    foundedYear: company.foundedYear,
    createdAt: company.createdAt
  }));

  // Get unique values for filters
  const industries = [...new Set(companies.map(c => c.industry))];
  const statuses = [...new Set(companies.map(c => c.status))];
  const sizes = [...new Set(companies.map(c => c.size).filter(Boolean))];

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <Skeleton className="h-icon-lg w-container-xs" />
          <Skeleton className="h-icon-xl w-component-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <Skeleton className="h-icon-xs w-component-xl mb-sm" />
              <Skeleton className="h-icon-md w-component-lg mb-md" />
              <Skeleton className="h-icon-xs w-component-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
          </div>
          <div className="flex items-center cluster-sm">
            <div className="flex border rounded-md">
              <Button
                variant={currentView === 'grid' ? 'primary' : 'ghost'}
               
                onClick={() => setCurrentView('grid')}
              >
                Grid
              </Button>
              <Button
                variant={currentView === 'list' ? 'primary' : 'ghost'}
               
                onClick={() => setCurrentView('list')}
              >
                List
              </Button>
            </div>
            <Button onClick={handleCreateCompany}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-md">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-container-sm">
              <div className="relative">
                <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
            </div>
            
            <div className="flex items-center cluster-sm">
              <Filter className="h-icon-xs w-icon-xs color-foreground/70" />
              <select
                value={industryFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndustryFilter(e.target.value)}
                className=" px-md py-sm border border-border rounded-md bg-background color-foreground"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry} className="capitalize">
                    {industry}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
                className=" px-md py-sm border border-border rounded-md bg-background color-foreground"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status} className="capitalize">
                    {status}
                  </option>
                ))}
              </select>
              
              <select
                value={sizeFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSizeFilter(e.target.value)}
                className=" px-md py-sm border border-border rounded-md bg-background color-foreground"
              >
                <option value="all">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size} className="capitalize">
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-md flex items-center justify-between text-body-sm color-foreground/70">
            <span>Showing {filteredCompanies.length} of {companies.length} companies</span>
            {(searchQuery || industryFilter !== 'all' || statusFilter !== 'all' || sizeFilter !== 'all') && (
              <Button
                variant="ghost"
               
                onClick={() => {
                  setSearchQuery('');
                  setIndustryFilter('all');
                  setStatusFilter('all');
                  setSizeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Company Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredCompanies.map((company: any) => (
              <Card key={company.id} className="p-lg hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => handleViewCompany(company)}>
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center cluster-sm">
                    <Building className="h-icon-lg w-icon-lg color-accent" />
                    <div>
                      <h3 className="text-heading-4 color-foreground">{company.name}</h3>
                      <p className="text-body-sm color-foreground/70 capitalize">{company.industry}</p>
                    </div>
                  </div>
                  {getStatusBadge(company.status)}
                </div>
                
                {company.description && (
                  <p className="text-body-sm color-foreground/70 mb-md line-clamp-xs">
                    {company.description}
                  </p>
                )}
                
                <div className="stack-sm mb-md">
                  {company.website && (
                    <div className="flex items-center cluster-sm text-body-sm">
                      <Globe className="h-icon-xs w-icon-xs color-foreground/50" />
                      <span className="color-accent hover:underline">{company.website}</span>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center cluster-sm text-body-sm">
                      <Mail className="h-icon-xs w-icon-xs color-foreground/50" />
                      <span className="color-foreground/70">{company.email}</span>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center cluster-sm text-body-sm">
                      <Phone className="h-icon-xs w-icon-xs color-foreground/50" />
                      <span className="color-foreground/70">{company.phone}</span>
                    </div>
                  )}
                  
                  {(company.city || company.country) && (
                    <div className="flex items-center cluster-sm text-body-sm">
                      <MapPin className="h-icon-xs w-icon-xs color-foreground/50" />
                      <span className="color-foreground/70">
                        {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {company.size && (
                    <div className="flex items-center cluster-sm text-body-sm">
                      {getSizeIcon(company.size)}
                      <span className="color-foreground/70 capitalize">{company.size}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-md border-t border-border">
                  <div className="text-body-sm color-foreground/50">
                    Added {new Date(company.createdAt || '').toLocaleDateString()}
                  </div>
                  
                  <div className="flex cluster-sm">
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditCompany(company);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteCompany(company.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-lg">
            <div className="stack-md">
              {companies.map((company: any) => (
                <div key={company.id} className="border rounded-lg p-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-body text-heading-4">{company.name}</h3>
                      <p className="text-body-sm color-muted">{company.industry}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Badge variant={company.status === 'active' ? 'success' : 'outline'}>
                        {company.status}
                      </Badge>
                      <Button onClick={() => handleEditCompany(company)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <Card className="p-xsxl text-center">
            <Building className="h-icon-2xl w-icon-2xl mx-auto mb-md color-foreground/30" />
            <h3 className="text-body text-heading-4 color-foreground mb-sm">
              {searchQuery || industryFilter !== 'all' || statusFilter !== 'all' || sizeFilter !== 'all' 
                ? 'No companies match your filters' 
                : 'No companies found'
              }
            </h3>
            <p className="color-foreground/70 mb-md">
              {searchQuery || industryFilter !== 'all' || statusFilter !== 'all' || sizeFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Add your first company to get started'
              }
            </p>
            <Button onClick={handleCreateCompany}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              Add Company
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'New Company' :
            drawerMode === 'edit' ? 'Edit Company' : 'Company Details'
          }
        >
          <div className="p-lg">
            <p className="color-muted">Company details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </StateManagerProvider>
  );
}

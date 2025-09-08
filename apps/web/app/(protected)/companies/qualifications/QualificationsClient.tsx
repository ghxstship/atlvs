'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  UniversalDrawer,
  DataGrid,
  ViewSwitcher,
  StateManagerProvider,
  type FieldConfig,
  type DataRecord
} from '@ghxstship/ui';
import { 
  Award,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Upload,
  Download
} from 'lucide-react';

interface QualificationsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface CompanyQualification {
  id: string;
  companyId: string;
  companyName?: string;
  organizationId: string;
  type: 'certification' | 'license' | 'insurance' | 'bond' | 'safety' | 'other';
  name: string;
  description?: string;
  issuingAuthority?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  documentUrl?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function QualificationsClient({ user, orgId, translations }: QualificationsClientProps) {
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState<CompanyQualification[]>([]);
  const [selectedQualification, setSelectedQualification] = useState<CompanyQualification | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadQualifications();
    loadCompanies();
  }, [orgId, typeFilter, statusFilter]);

  const loadQualifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('company_qualifications')
        .select(`
          *,
          companies!inner(name)
        `)
        .eq('organization_id', orgId);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const qualificationsWithCompanyNames = (data || []).map(qualification => ({
        ...qualification,
        companyName: qualification.companies?.name
      }));
      
      setQualifications(qualificationsWithCompanyNames);
    } catch (error) {
      console.error('Error loading qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleCreateQualification = () => {
    setSelectedQualification(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditQualification = (qualification: CompanyQualification) => {
    setSelectedQualification(qualification);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewQualification = (qualification: CompanyQualification) => {
    setSelectedQualification(qualification);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteQualification = async (qualificationId: string) => {
    if (!confirm('Are you sure you want to delete this qualification?')) return;

    try {
      const { error } = await supabase
        .from('company_qualifications')
        .delete()
        .eq('id', qualificationId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadQualifications();
    } catch (error) {
      console.error('Error deleting qualification:', error);
    }
  };

  const handleVerifyQualification = async (qualificationId: string) => {
    try {
      const { error } = await supabase
        .from('company_qualifications')
        .update({
          status: 'active',
          verified_date: new Date().toISOString().split('T')[0],
          verified_by: user.id
        })
        .eq('id', qualificationId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadQualifications();
    } catch (error) {
      console.error('Error verifying qualification:', error);
    }
  };

  const handleSaveQualification = async (qualificationData: Partial<CompanyQualification>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('company_qualifications')
          .insert({
            ...qualificationData,
            organization_id: orgId,
            status: 'pending'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedQualification) {
        const { error } = await supabase
          .from('company_qualifications')
          .update(qualificationData)
          .eq('id', selectedQualification.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadQualifications();
    } catch (error) {
      console.error('Error saving qualification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active' },
      expired: { variant: 'destructive' as const, label: 'Expired' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      revoked: { variant: 'destructive' as const, label: 'Revoked' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'license':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'insurance':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'bond':
        return <Shield className="h-5 w-5 text-orange-500" />;
      case 'safety':
        return <Shield className="h-5 w-5 text-red-500" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'companyId',
      label: 'Company',
      type: 'select',
      required: true,
      options: companies.map(company => ({
        label: company.name,
        value: company.id
      }))
    },
    {
      key: 'name',
      label: 'Qualification Name',
      type: 'text',
      required: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'type',
      label: 'Qualification Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Certification', value: 'certification' },
        { label: 'License', value: 'license' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'Bond', value: 'bond' },
        { label: 'Safety', value: 'safety' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'issuingAuthority',
      label: 'Issuing Authority',
      type: 'text'
    },
    {
      key: 'certificateNumber',
      label: 'Certificate Number',
      type: 'text'
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      type: 'date'
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      type: 'date'
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'textarea'
    }
  ];

  const qualificationRecords: DataRecord[] = qualifications.map(qualification => ({
    id: qualification.id,
    name: qualification.name,
    companyName: qualification.companyName,
    type: qualification.type,
    status: qualification.status,
    issuingAuthority: qualification.issuingAuthority,
    certificateNumber: qualification.certificateNumber,
    issueDate: qualification.issueDate,
    expiryDate: qualification.expiryDate,
    verifiedDate: qualification.verifiedDate,
    createdAt: qualification.createdAt
  }));

  const typeCounts = {
    all: qualifications.length,
    certification: qualifications.filter(q => q.type === 'certification').length,
    license: qualifications.filter(q => q.type === 'license').length,
    insurance: qualifications.filter(q => q.type === 'insurance').length,
    bond: qualifications.filter(q => q.type === 'bond').length,
    safety: qualifications.filter(q => q.type === 'safety').length,
    other: qualifications.filter(q => q.type === 'other').length
  };

  const statusCounts = {
    all: qualifications.length,
    active: qualifications.filter(q => q.status === 'active').length,
    pending: qualifications.filter(q => q.status === 'pending').length,
    expired: qualifications.filter(q => q.status === 'expired').length,
    revoked: qualifications.filter(q => q.status === 'revoked').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
            <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              views={['grid', 'list']}
            />
            <Button onClick={handleCreateQualification}>
              <Plus className="h-4 w-4 mr-2" />
              Add Qualification
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {Object.entries(typeCounts).map(([type, count]) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className="capitalize"
              >
                {type} ({count})
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Qualification Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualifications.map((qualification) => (
              <Card key={qualification.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewQualification(qualification)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(qualification.type)}
                    <div>
                      <h3 className="font-semibold text-foreground">{qualification.name}</h3>
                      <p className="text-sm text-foreground/70">{qualification.companyName}</p>
                    </div>
                  </div>
                  {getStatusBadge(qualification.status)}
                </div>
                
                {qualification.description && (
                  <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                    {qualification.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Type</span>
                    <span className="font-medium capitalize">{qualification.type}</span>
                  </div>
                  
                  {qualification.issuingAuthority && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Authority</span>
                      <span className="font-medium">{qualification.issuingAuthority}</span>
                    </div>
                  )}
                  
                  {qualification.certificateNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Certificate #</span>
                      <span className="font-medium">{qualification.certificateNumber}</span>
                    </div>
                  )}
                  
                  {qualification.issueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Issue Date</span>
                      <span className="font-medium">{formatDate(qualification.issueDate)}</span>
                    </div>
                  )}
                  
                  {qualification.expiryDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Expiry Date</span>
                      <span className={`font-medium ${
                        isExpired(qualification.expiryDate) ? 'text-red-600' :
                        isExpiringSoon(qualification.expiryDate) ? 'text-orange-600' : 'text-foreground'
                      }`}>
                        {formatDate(qualification.expiryDate)}
                        {(isExpired(qualification.expiryDate) || isExpiringSoon(qualification.expiryDate)) && (
                          <AlertTriangle className="inline h-3 w-3 ml-1" />
                        )}
                      </span>
                    </div>
                  )}
                  
                  {qualification.verifiedDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground/70">Verified {formatDate(qualification.verifiedDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    {qualification.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerifyQualification(qualification.id);
                        }}
                      >
                        Verify
                      </Button>
                    )}
                    {qualification.documentUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(qualification.documentUrl, '_blank');
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQualification(qualification);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQualification(qualification.id);
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
          <Card className="p-6">
            <DataGrid
              records={qualificationRecords}
              fields={fieldConfigs}
              onEdit={handleEditQualification}
              onDelete={handleDeleteQualification}
              onView={handleViewQualification}
            />
          </Card>
        )}

        {/* Empty State */}
        {qualifications.length === 0 && (
          <Card className="p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No qualifications found</h3>
            <p className="text-foreground/70 mb-4">Add company qualifications, certifications, and licenses</p>
            <Button onClick={handleCreateQualification}>
              <Plus className="h-4 w-4 mr-2" />
              Add Qualification
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'Add Qualification' :
            drawerMode === 'edit' ? 'Edit Qualification' : 'Qualification Details'
          }
          mode={drawerMode}
          record={selectedQualification}
          fields={fieldConfigs}
          onSave={handleSaveQualification}
        />
      </div>
    </StateManagerProvider>
  );
}

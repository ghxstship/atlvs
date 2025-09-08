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
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload
} from 'lucide-react';

interface ContractsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface CompanyContract {
  id: string;
  companyId: string;
  companyName?: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  type: 'msa' | 'sow' | 'nda' | 'service' | 'supply' | 'other';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';
  value?: number;
  currency: string;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  terms?: string;
  documentUrl?: string;
  signedDate?: string;
  signedBy?: string;
  autoRenewal: boolean;
  renewalNoticeDays?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export default function ContractsClient({ user, orgId, translations }: ContractsClientProps) {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<CompanyContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<CompanyContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadContracts();
    loadCompanies();
  }, [orgId, typeFilter, statusFilter]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('company_contracts')
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
      
      const contractsWithCompanyNames = (data || []).map(contract => ({
        ...contract,
        companyName: contract.companies?.name
      }));
      
      setContracts(contractsWithCompanyNames);
    } catch (error) {
      console.error('Error loading contracts:', error);
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

  const handleCreateContract = () => {
    setSelectedContract(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditContract = (contract: CompanyContract) => {
    setSelectedContract(contract);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewContract = (contract: CompanyContract) => {
    setSelectedContract(contract);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      const { error } = await supabase
        .from('company_contracts')
        .delete()
        .eq('id', contractId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handleRenewContract = async (contractId: string) => {
    try {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) return;

      const newEndDate = new Date(contract.endDate || contract.startDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const { error } = await supabase
        .from('company_contracts')
        .update({
          status: 'active',
          end_date: newEndDate.toISOString().split('T')[0],
          renewal_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', contractId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadContracts();
    } catch (error) {
      console.error('Error renewing contract:', error);
    }
  };

  const handleSaveContract = async (contractData: Partial<CompanyContract>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('company_contracts')
          .insert({
            ...contractData,
            organization_id: orgId,
            created_by: user.id,
            status: 'draft',
            currency: contractData.currency || 'USD',
            auto_renewal: contractData.autoRenewal || false
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedContract) {
        const { error } = await supabase
          .from('company_contracts')
          .update(contractData)
          .eq('id', selectedContract.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      active: { variant: 'default' as const, label: 'Active' },
      expired: { variant: 'destructive' as const, label: 'Expired' },
      terminated: { variant: 'destructive' as const, label: 'Terminated' },
      renewed: { variant: 'default' as const, label: 'Renewed' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'msa':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'sow':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'nda':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'service':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'supply':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const isExpiringSoon = (endDate?: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return end <= thirtyDaysFromNow && end >= new Date();
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
      label: 'Contract Name',
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
      label: 'Contract Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Master Service Agreement', value: 'msa' },
        { label: 'Statement of Work', value: 'sow' },
        { label: 'Non-Disclosure Agreement', value: 'nda' },
        { label: 'Service Contract', value: 'service' },
        { label: 'Supply Contract', value: 'supply' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      key: 'value',
      label: 'Contract Value',
      type: 'number'
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }
      ]
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: true
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: 'date'
    },
    {
      key: 'autoRenewal',
      label: 'Auto Renewal',
      type: 'select',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' }
      ]
    },
    {
      key: 'renewalNoticeDays',
      label: 'Renewal Notice Days',
      type: 'number'
    },
    {
      key: 'terms',
      label: 'Terms & Conditions',
      type: 'textarea'
    }
  ];

  const contractRecords: DataRecord[] = contracts.map(contract => ({
    id: contract.id,
    name: contract.name,
    companyName: contract.companyName,
    type: contract.type,
    status: contract.status,
    value: contract.value,
    currency: contract.currency,
    startDate: contract.startDate,
    endDate: contract.endDate,
    autoRenewal: contract.autoRenewal,
    createdAt: contract.createdAt
  }));

  const typeCounts = {
    all: contracts.length,
    msa: contracts.filter(c => c.type === 'msa').length,
    sow: contracts.filter(c => c.type === 'sow').length,
    nda: contracts.filter(c => c.type === 'nda').length,
    service: contracts.filter(c => c.type === 'service').length,
    supply: contracts.filter(c => c.type === 'supply').length,
    other: contracts.filter(c => c.type === 'other').length
  };

  const statusCounts = {
    all: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    active: contracts.filter(c => c.status === 'active').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    terminated: contracts.filter(c => c.status === 'terminated').length
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
            <Button onClick={handleCreateContract}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
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
                {type === 'msa' ? 'MSA' : type === 'sow' ? 'SOW' : type === 'nda' ? 'NDA' : type} ({count})
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

        {/* Contract Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewContract(contract)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(contract.type)}
                    <div>
                      <h3 className="font-semibold text-foreground">{contract.name}</h3>
                      <p className="text-sm text-foreground/70">{contract.companyName}</p>
                    </div>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
                
                {contract.description && (
                  <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                    {contract.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Type</span>
                    <span className="font-medium capitalize">
                      {contract.type === 'msa' ? 'MSA' : contract.type === 'sow' ? 'SOW' : contract.type === 'nda' ? 'NDA' : contract.type}
                    </span>
                  </div>
                  
                  {contract.value && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Value</span>
                      <span className="font-medium text-green-600">{formatCurrency(contract.value, contract.currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Start Date</span>
                    <span className="font-medium">{formatDate(contract.startDate)}</span>
                  </div>
                  
                  {contract.endDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">End Date</span>
                      <span className={`font-medium ${isExpiringSoon(contract.endDate) ? 'text-orange-600' : 'text-foreground'}`}>
                        {formatDate(contract.endDate)}
                        {isExpiringSoon(contract.endDate) && (
                          <AlertTriangle className="inline h-3 w-3 ml-1" />
                        )}
                      </span>
                    </div>
                  )}
                  
                  {contract.autoRenewal && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground/70">Auto-renewal enabled</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    {contract.status === 'expired' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenewContract(contract.id);
                        }}
                      >
                        Renew
                      </Button>
                    )}
                    {contract.documentUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(contract.documentUrl, '_blank');
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
                        handleEditContract(contract);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContract(contract.id);
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
              records={contractRecords}
              fields={fieldConfigs}
              onEdit={handleEditContract}
              onDelete={handleDeleteContract}
              onView={handleViewContract}
            />
          </Card>
        )}

        {/* Empty State */}
        {contracts.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No contracts found</h3>
            <p className="text-foreground/70 mb-4">Create your first company contract to get started</p>
            <Button onClick={handleCreateContract}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <UniversalDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'New Contract' :
            drawerMode === 'edit' ? 'Edit Contract' : 'Contract Details'
          }
          mode={drawerMode}
          record={selectedContract}
          fields={fieldConfigs}
          onSave={handleSaveContract}
        />
      </div>
    </StateManagerProvider>
  );
}

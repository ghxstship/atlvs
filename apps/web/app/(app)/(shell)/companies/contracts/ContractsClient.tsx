'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Badge, Button, Card, Drawer, H2, Icon, IconWithText, Skeleton, StateManagerProvider, StatusIcon, type DataRecord } from '@ghxstship/ui';
import { AlertTriangle, Building, Calendar, CheckCircle, Clock, DollarSign, Download, Edit, FileText, Plus, Trash2, Upload } from 'lucide-react';

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

  const loadContracts = useCallback(async () => {
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
  }, [orgId, typeFilter, statusFilter, supabase]);

  const loadCompanies = useCallback(async () => {
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
  }, [orgId, supabase]);

  useEffect(() => {
    loadContracts();
    loadCompanies();
  }, [loadContracts, loadCompanies]);

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
      currency: currency
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
        return <FileText className="h-icon-sm w-icon-sm color-accent" />;
      case 'sow':
        return <FileText className="h-icon-sm w-icon-sm color-success" />;
      case 'nda':
  // eslint-disable-next-line react-hooks/exhaustive-deps
        return <FileText className="h-icon-sm w-icon-sm color-secondary" />;
      case 'service':
        return <FileText className="h-icon-sm w-icon-sm color-warning" />;
      case 'supply':
        return <FileText className="h-icon-sm w-icon-sm text-info" />;
      default:
        return <FileText className="h-icon-sm w-icon-sm color-muted" />;
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
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="text-heading-2">Company Contracts</h2>
            <p className="text-sm text-muted-foreground mt-xs">Manage contracts and agreements with companies</p>
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
            <Button onClick={handleCreateContract}>
              <IconWithText icon={Plus} text="New Contract" size="sm" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-md">
          {/* Type Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(typeCounts).map(([type, count]) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'primary' : 'ghost'}
               
                onClick={() => setTypeFilter(type)}
                className="capitalize"
              >
                {type === 'msa' ? 'MSA' : type === 'sow' ? 'SOW' : type === 'nda' ? 'NDA' : type} ({count})
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
               
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {contracts.map((contract: any) => (
              <Card key={contract.id} className="p-lg hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => handleViewContract(contract)}>
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center cluster-sm">
                    {getTypeIcon(contract.type)}
                    <div>
                      <h3 className="text-heading-4 color-foreground">{contract.name}</h3>
                      <p className="text-body-sm color-foreground/70">{contract.companyName}</p>
                    </div>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
                
                {contract.description && (
                  <p className="text-body-sm color-foreground/70 mb-md line-clamp-xs">
                    {contract.description}
                  </p>
                )}
                
                <div className="stack-sm mb-md">
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Type</span>
                    <span className="form-label capitalize">
                      {contract.type === 'msa' ? 'MSA' : contract.type === 'sow' ? 'SOW' : contract.type === 'nda' ? 'NDA' : contract.type}
                    </span>
                  </div>
                  
                  {contract.value && (
                    <div className="flex justify-between text-body-sm">
                      <span className="color-foreground/70">Value</span>
                      <span className="form-label color-success">{formatCurrency(contract.value, contract.currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Start Date</span>
                    <span className="form-label">{formatDate(contract.startDate)}</span>
                  </div>
                  
                  {contract.endDate && (
                    <div className="flex justify-between text-body-sm">
                      <span className="color-foreground/70">End Date</span>
                      <span className={`form-label ${isExpiringSoon(contract.endDate) ? 'color-warning' : 'color-foreground'}`}>
                        {formatDate(contract.endDate)}
                        {isExpiringSoon(contract.endDate) && (
                          <AlertTriangle className="inline h-3 w-3 ml-xs" />
                        )}
                      </span>
                    </div>
                  )}
                  
                  {contract.autoRenewal && (
                    <div className="flex items-center gap-sm">
                      <Icon icon={FileText} size="sm" color="muted" />
                      <span className="text-sm text-muted-foreground">Total Contracts</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-md border-t border-border">
                  <div className="flex cluster-sm">
                    {contract.status === 'expired' && (
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
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
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          window.open(contract.documentUrl, '_blank');
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex cluster-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(contract);
                        setDrawerMode('edit');
                        setDrawerOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-lg">
            <div className="stack-md">
              {contracts.map((contract: any) => (
                <div key={contract.id} className="border rounded-lg p-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-body text-heading-4">{contract.name}</h3>
                      <p className="text-body-sm color-muted">{contract.type}</p>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Badge variant={contract.status === 'active' ? 'success' : 'outline'}>
                        {contract.status}
                      </Badge>
                      <Button onClick={() => handleEditContract(contract)}>
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
        {contracts.length === 0 && (
          <Card className="p-xsxl text-center">
            <FileText className="h-icon-2xl w-icon-2xl mx-auto mb-md color-foreground/30" />
            <h3 className="text-body text-heading-4 color-foreground mb-sm">No contracts found</h3>
            <p className="color-foreground/70 mb-md">Create your first company contract to get started</p>
            <Button onClick={handleCreateContract}>
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              New Contract
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={
            drawerMode === 'create' ? 'New Contract' :
            drawerMode === 'edit' ? 'Edit Contract' : 'Contract Details'
          }
        >
          <div className="p-lg">
            <p className="color-muted">Contract details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </StateManagerProvider>
  );
}

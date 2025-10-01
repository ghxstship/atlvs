'use client';


import { useState, useEffect } from 'react';
import { Card, Button, UnifiedInput, Badge } from '@ghxstship/ui';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface Contract {
  id: string;
  personId: string;
  personName: string;
  projectId: string;
  projectName: string;
  type: 'employment' | 'freelance' | 'nda' | 'vendor' | 'service';
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated';
  startDate: string;
  endDate?: string;
  value?: number;
  currency: string;
  signedDate?: string;
  documentUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ContractingClientProps {
  orgId: string;
}

const CONTRACT_TYPES = [
  { id: 'employment', name: 'Employment Contract', color: 'bg-accent' },
  { id: 'freelance', name: 'Freelance Agreement', color: 'bg-success' },
  { id: 'nda', name: 'Non-Disclosure Agreement', color: 'bg-secondary' },
  { id: 'vendor', name: 'Vendor Agreement', color: 'bg-warning' },
  { id: 'service', name: 'Service Contract', color: 'bg-destructive' }
] as const;

export default function ContractingClient({ orgId }: ContractingClientProps) {
  const t = useTranslations('pipeline.contracting');
  const supabase = createBrowserClient();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    personId: '',
    projectId: '',
    type: 'employment' as Contract['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    value: '',
    currency: 'USD',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load people
      const { data: peopleData } = await supabase
        .from('people')
        .select('id, first_name, last_name, email')
        .eq('organization_id', orgId);

      setPeople(peopleData || []);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId);

      setProjects(projectsData || []);

      // Mock contracts for demonstration
      const mockContracts: Contract[] = [
        {
          id: '1',
          personId: peopleData?.[0]?.id || 'mock-1',
          personName: peopleData?.[0] ? `${peopleData[0].first_name} ${peopleData[0].last_name}` : 'Jack Sparrow',
          projectId: projectsData?.[0]?.id || 'mock-project-1',
          projectName: projectsData?.[0]?.name || 'Blackwater Reverb',
          type: 'employment',
          status: 'signed',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          value: 75000,
          currency: 'USD',
          signedDate: '2023-12-15',
          createdAt: '2023-12-10T10:00:00Z'
        },
        {
          id: '2',
          personId: peopleData?.[1]?.id || 'mock-2',
          personName: peopleData?.[1] ? `${peopleData[1].first_name} ${peopleData[1].last_name}` : 'Elizabeth Swann',
          projectId: projectsData?.[0]?.id || 'mock-project-1',
          projectName: projectsData?.[0]?.name || 'Blackwater Reverb',
          type: 'freelance',
          status: 'sent',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          value: 25000,
          currency: 'USD',
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          personId: peopleData?.[2]?.id || 'mock-3',
          personName: peopleData?.[2] ? `${peopleData[2].first_name} ${peopleData[2].last_name}` : 'Will Turner',
          projectId: projectsData?.[0]?.id || 'mock-project-1',
          projectName: projectsData?.[0]?.name || 'Blackwater Reverb',
          type: 'nda',
          status: 'signed',
          startDate: '2024-01-01',
          currency: 'USD',
          signedDate: '2024-01-05',
          createdAt: '2024-01-01T09:00:00Z'
        }
      ];

      setContracts(mockContracts);
    } catch (error) {
      console.error('Error loading contracting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId || !formData.projectId) return;

    const selectedPerson = people.find(p => p.id === formData.personId);
    const selectedProject = projects.find(p => p.id === formData.projectId);

    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      personId: formData.personId,
      personName: selectedPerson ? `${selectedPerson.first_name} ${selectedPerson.last_name}` : 'Unknown',
      projectId: formData.projectId,
      projectName: selectedProject?.name || 'Unknown Project',
      type: formData.type,
      status: 'draft',
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      value: formData.value ? parseFloat(formData.value) : undefined,
      currency: formData.currency,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString()
    };

    setContracts(prev => [newContract, ...prev]);
    setFormData({
      personId: '',
      projectId: '',
      type: 'employment',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      value: '',
      currency: 'USD',
      notes: ''
    });
    setShowForm(false);
  };

  const updateContractStatus = (contractId: string, newStatus: Contract['status']) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { 
            ...contract, 
            status: newStatus,
            signedDate: newStatus === 'signed' ? new Date().toISOString() : contract.signedDate
          }
        : contract
    ));
  };

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'signed':
        return <Badge variant="success" className="flex items-center gap-xs"><CheckCircle className="w-3 h-3" />Signed</Badge>;
      case 'sent':
        return <Badge variant="warning" className="flex items-center gap-xs"><Clock className="w-3 h-3" />Sent</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="flex items-center gap-xs"><FileText className="w-3 h-3" />Draft</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-xs"><AlertTriangle className="w-3 h-3" />Expired</Badge>;
      case 'terminated':
        return <Badge variant="destructive" className="flex items-center gap-xs"><AlertTriangle className="w-3 h-3" />Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeColor = (type: Contract['type']) => {
    const typeInfo = CONTRACT_TYPES.find(t => t.id === type);
    return typeInfo?.color || 'bg-secondary-foreground';
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 font-anton uppercase">Contracting Pipeline</h1>
          <p className="text-body-sm color-muted">Manage crew contracts and agreements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-sm">
          <Plus className="w-icon-xs h-icon-xs" />
          New Contract
        </Button>
      </div>

      {/* Create Contract Form */}
      {showForm && (
        <Card>
          <div className="p-md">
            <h3 className="text-body text-heading-4 mb-md">Create New Contract</h3>
            <form onSubmit={handleCreateContract} className="stack-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Person</label>
                  <select
                    value={formData.personId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                    className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    required
                  >
                    <option value="">Select person...</option>
                    {people.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    required
                  >
                    <option value="">Select project...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Contract Type</label>
                  <select
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, type: e.target.value as Contract['type'] }))}
                    className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    {CONTRACT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Value</label>
                  <UnifiedInput                     type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Contract value"
                  />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Start Date</label>
                  <UnifiedInput                     type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">End Date</label>
                  <UnifiedInput                     type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm form-label mb-xs">Notes</label>
                <UnifiedInput                   value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or terms"
                />
              </div>
              <div className="flex gap-sm">
                <Button type="submit">Create Contract</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Contracts List */}
      {loading ? (
        <Card>
          <div className="p-xl text-center color-muted">Loading contracts...</div>
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <div className="p-xl text-center color-muted">
            No contracts found. Create one to get started.
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {contracts.map(contract => (
            <Card key={contract.id}>
              <div className="p-md">
                <div className="flex items-start justify-between mb-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(contract.type)}`} />
                      <h3 className="text-body text-heading-4">{contract.personName}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <p className="text-body-sm color-muted mb-sm">{contract.projectName}</p>
                    <div className="text-body-sm color-muted">
                      {CONTRACT_TYPES.find(t => t.id === contract.type)?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    {contract.value && (
                      <div className="text-body text-heading-4 color-success flex items-center gap-xs">
                        <DollarSign className="w-icon-xs h-icon-xs" />
                        {formatCurrency(contract.value, contract.currency)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md text-body-sm mb-md">
                  <div>
                    <span className="form-label">Start Date:</span> {new Date(contract.startDate).toLocaleDateString()}
                  </div>
                  {contract.endDate && (
                    <div>
                      <span className="form-label">End Date:</span> {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  )}
                  {contract.signedDate && (
                    <div>
                      <span className="form-label">Signed:</span> {new Date(contract.signedDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="form-label">Created:</span> {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {contract.notes && (
                  <div className="text-body-sm color-muted mb-md p-sm bg-secondary rounded-md">
                    <span className="form-label">Notes:</span> {contract.notes}
                  </div>
                )}

                <div className="flex gap-sm">
                  {contract.status === 'draft' && (
                    <Button 
                      
                      onClick={() => updateContractStatus(contract.id, 'sent')}
                    >
                      Send for Signature
                    </Button>
                  )}
                  {contract.status === 'sent' && (
                    <Button 
                      
                      variant="outline"
                      onClick={() => updateContractStatus(contract.id, 'signed')}
                    >
                      Mark as Signed
                    </Button>
                  )}
                  {contract.status === 'signed' && (
                    <Button 
                      
                      variant="destructive"
                      onClick={() => updateContractStatus(contract.id, 'terminated')}
                    >
                      Terminate
                    </Button>
                  )}
                  <Button variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

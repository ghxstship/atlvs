'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
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
  { id: 'employment', name: 'Employment Contract', color: 'bg-blue-500' },
  { id: 'freelance', name: 'Freelance Agreement', color: 'bg-green-500' },
  { id: 'nda', name: 'Non-Disclosure Agreement', color: 'bg-purple-500' },
  { id: 'vendor', name: 'Vendor Agreement', color: 'bg-orange-500' },
  { id: 'service', name: 'Service Contract', color: 'bg-red-500' }
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
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Signed</Badge>;
      case 'sent':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" />Sent</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="flex items-center gap-1"><FileText className="w-3 h-3" />Draft</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Expired</Badge>;
      case 'terminated':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeColor = (type: Contract['type']) => {
    const typeInfo = CONTRACT_TYPES.find(t => t.id === type);
    return typeInfo?.color || 'bg-gray-500';
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Contracting Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage crew contracts and agreements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      </div>

      {/* Create Contract Form */}
      {showForm && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Create New Contract</h3>
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Person</label>
                  <select
                    value={formData.personId}
                    onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contract Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Contract['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CONTRACT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Contract value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or terms"
                />
              </div>
              <div className="flex gap-2">
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
          <div className="p-8 text-center text-muted-foreground">Loading contracts...</div>
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            No contracts found. Create one to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map(contract => (
            <Card key={contract.id}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(contract.type)}`} />
                      <h3 className="text-lg font-semibold">{contract.personName}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{contract.projectName}</p>
                    <div className="text-sm text-muted-foreground">
                      {CONTRACT_TYPES.find(t => t.id === contract.type)?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    {contract.value && (
                      <div className="text-lg font-semibold text-green-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(contract.value, contract.currency)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Start Date:</span> {new Date(contract.startDate).toLocaleDateString()}
                  </div>
                  {contract.endDate && (
                    <div>
                      <span className="font-medium">End Date:</span> {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  )}
                  {contract.signedDate && (
                    <div>
                      <span className="font-medium">Signed:</span> {new Date(contract.signedDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {contract.notes && (
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-md">
                    <span className="font-medium">Notes:</span> {contract.notes}
                  </div>
                )}

                <div className="flex gap-2">
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

'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Select,
  Textarea,
  Card
} from '@ghxstship/ui';
import { 
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Save,
  X
} from 'lucide-react';

interface CreateContractClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contract: any) => void;
}

interface ContractFormData {
  companyId: string;
  projectId: string;
  title: string;
  description: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  value: string;
  currency: string;
  documentUrl: string;
  renewalTerms: string;
  autoRenewal: boolean;
}

const CONTRACT_TYPES = [
  { value: 'service', label: 'Service Agreement' },
  { value: 'supply', label: 'Supply Contract' },
  { value: 'maintenance', label: 'Maintenance Contract' },
  { value: 'consulting', label: 'Consulting Agreement' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'partnership', label: 'Partnership Agreement' },
  { value: 'other', label: 'Other' }
];

const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'expired', label: 'Expired' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' }
];

export default function CreateContractClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateContractClientProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<ContractFormData>({
    companyId: '',
    projectId: '',
    title: '',
    description: '',
    contractType: 'service',
    status: 'draft',
    startDate: '',
    endDate: '',
    value: '',
    currency: 'USD',
    documentUrl: '',
    renewalTerms: '',
    autoRenewal: false
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      loadProjects();
    }
  }, [isOpen, orgId]);

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

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', orgId)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleInputChange = (field: keyof ContractFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.title.trim()) return;

    setLoading(true);
    try {
      const contractId = crypto.randomUUID();
      
      // Insert contract record
      const { data: contract, error } = await supabase
        .from('company_contracts')
        .insert({
          id: contractId,
          organization_id: orgId,
          company_id: formData.companyId,
          project_id: formData.projectId || null,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          contract_type: formData.contractType,
          status: formData.status,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          value: formData.value ? parseFloat(formData.value) : null,
          currency: formData.currency,
          document_url: formData.documentUrl.trim() || null,
          renewal_terms: formData.renewalTerms.trim() || null,
          auto_renewal: formData.autoRenewal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          id: crypto.randomUUID(),
          organization_id: orgId,
          user_id: user.id,
          action: 'create',
          entity_type: 'company_contract',
          entity_id: contractId,
          metadata: {
            contract_title: formData.title,
            contract_type: formData.contractType,
            company_id: formData.companyId,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        companyId: '',
        projectId: '',
        title: '',
        description: '',
        contractType: 'service',
        status: 'draft',
        startDate: '',
        endDate: '',
        value: '',
        currency: 'USD',
        documentUrl: '',
        renewalTerms: '',
        autoRenewal: false
      });

      onSuccess?.(contract);
      onClose();
    } catch (error) {
      console.error('Error creating contract:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create New Contract"
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contract Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Contract Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter contract title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the contract"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contract Type *
                </label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => handleInputChange('contractType', value)}
                >
                  {CONTRACT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {CONTRACT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Company & Project */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Company & Project</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company *
              </label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleInputChange('companyId', value)}
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project (Optional)
              </label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange('projectId', value)}
              >
                <option value="">No project association</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Contract Terms */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Contract Terms</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Contract Value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Document URL
              </label>
              <Input
                type="url"
                value={formData.documentUrl}
                onChange={(e) => handleInputChange('documentUrl', e.target.value)}
                placeholder="https://documents.example.com/contract.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Renewal Terms
              </label>
              <Textarea
                value={formData.renewalTerms}
                onChange={(e) => handleInputChange('renewalTerms', e.target.value)}
                placeholder="Terms and conditions for contract renewal"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoRenewal}
                onChange={(e) => handleInputChange('autoRenewal', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium">
                Enable Auto-Renewal
              </label>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.companyId || !formData.title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

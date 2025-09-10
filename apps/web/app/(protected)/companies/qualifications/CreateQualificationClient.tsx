'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Drawer,
  Button,
  Input,
  Textarea,
  Select,
  Card
} from '@ghxstship/ui';
import { 
  Award,
  Building2,
  Calendar,
  FileCheck,
  Save,
  X
} from 'lucide-react';

interface CreateQualificationClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (qualification: any) => void;
}

interface QualificationFormData {
  companyId: string;
  title: string;
  description: string;
  qualificationType: string;
  status: string;
  issuedDate: string;
  expiryDate: string;
  issuingAuthority: string;
  certificateNumber: string;
  documentUrl: string;
  verificationNotes: string;
}

const QUALIFICATION_TYPES = [
  { value: 'certification', label: 'Professional Certification' },
  { value: 'license', label: 'Business License' },
  { value: 'insurance', label: 'Insurance Coverage' },
  { value: 'safety', label: 'Safety Qualification' },
  { value: 'quality', label: 'Quality Assurance' },
  { value: 'environmental', label: 'Environmental Compliance' },
  { value: 'security', label: 'Security Clearance' },
  { value: 'other', label: 'Other' }
];

const QUALIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending Verification' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'revoked', label: 'Revoked' }
];

export default function CreateQualificationClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateQualificationClientProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState<QualificationFormData>({
    companyId: '',
    title: '',
    description: '',
    qualificationType: 'certification',
    status: 'pending',
    issuedDate: '',
    expiryDate: '',
    issuingAuthority: '',
    certificateNumber: '',
    documentUrl: '',
    verificationNotes: ''
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
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

  const handleInputChange = (field: keyof QualificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId || !formData.title.trim()) return;

    setLoading(true);
    try {
      const qualificationId = crypto.randomUUID();
      
      // Insert qualification record
      const { data: qualification, error } = await supabase
        .from('company_qualifications')
        .insert({
          id: qualificationId,
          organization_id: orgId,
          company_id: formData.companyId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          qualification_type: formData.qualificationType,
          status: formData.status,
          issued_date: formData.issuedDate || null,
          expiry_date: formData.expiryDate || null,
          issuing_authority: formData.issuingAuthority.trim() || null,
          certificate_number: formData.certificateNumber.trim() || null,
          document_url: formData.documentUrl.trim() || null,
          verification_notes: formData.verificationNotes.trim() || null,
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
          entity_type: 'company_qualification',
          entity_id: qualificationId,
          metadata: {
            qualification_title: formData.title,
            qualification_type: formData.qualificationType,
            company_id: formData.companyId,
            status: formData.status
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        companyId: '',
        title: '',
        description: '',
        qualificationType: 'certification',
        status: 'pending',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        certificateNumber: '',
        documentUrl: '',
        verificationNotes: ''
      });

      onSuccess?.(qualification);
      onClose();
    } catch (error) {
      console.error('Error creating qualification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Company Qualification"
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Qualification Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Qualification Details</h3>
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
                Qualification Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter qualification title"
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
                placeholder="Brief description of the qualification"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Qualification Type *
                </label>
                <Select
                  value={formData.qualificationType}
                  onValueChange={(value) => handleInputChange('qualificationType', value)}
                >
                  {QUALIFICATION_TYPES.map(type => (
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
                  {QUALIFICATION_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Certification Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Certification Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Issuing Authority
              </label>
              <Input
                value={formData.issuingAuthority}
                onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                placeholder="Organization that issued this qualification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Certificate Number
              </label>
              <Input
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                placeholder="Certificate or license number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Issued Date
                </label>
                <Input
                  type="date"
                  value={formData.issuedDate}
                  onChange={(e) => handleInputChange('issuedDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
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
                placeholder="https://documents.example.com/certificate.pdf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Verification Notes
              </label>
              <Textarea
                value={formData.verificationNotes}
                onChange={(e) => handleInputChange('verificationNotes', e.target.value)}
                placeholder="Internal notes about verification process"
                rows={2}
              />
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
            {loading ? 'Creating...' : 'Add Qualification'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

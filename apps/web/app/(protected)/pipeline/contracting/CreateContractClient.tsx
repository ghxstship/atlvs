'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Textarea, Drawer } from '@ghxstship/ui';
import { FileText, Plus, Save, X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const contractSchema = z.object({
  title: z.string().min(1, 'Contract title is required'),
  contractorName: z.string().min(1, 'Contractor name is required'),
  contractorEmail: z.string().email('Valid email is required'),
  contractorPhone: z.string().optional(),
  contractorCompany: z.string().optional(),
  type: z.enum(['independent', 'subcontractor', 'consultant', 'vendor', 'other']).default('independent'),
  scope: z.string().min(1, 'Scope of work is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  rate: z.number().min(0, 'Rate cannot be negative'),
  rateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'fixed']).default('hourly'),
  currency: z.string().default('USD'),
  maxHours: z.number().optional(),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  paymentTerms: z.string().optional(),
  deliverables: z.string().optional(),
  requirements: z.string().optional(),
  confidentiality: z.boolean().default(true),
  exclusivity: z.boolean().default(false),
  terminationNotice: z.number().default(14),
  autoRenewal: z.boolean().default(false),
  renewalPeriod: z.number().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface CreateContractClientProps {
  orgId: string;
  onContractCreated?: () => void;
}

export default function CreateContractClient({ orgId, onContractCreated }: CreateContractClientProps) {
  const t = useTranslations('pipeline');
  const posthog = usePostHog();
  const sb = createBrowserClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'independent',
      rateType: 'hourly',
      currency: 'USD',
      remote: false,
      confidentiality: true,
      exclusivity: false,
      terminationNotice: 14,
      autoRenewal: false,
    }
  });

  const autoRenewal = watch('autoRenewal');

  const onSubmit = async (data: ContractFormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('/api/v1/pipeline/contracting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contract');
      }

      const result = await response.json();

      // Track contract creation
      posthog?.capture('pipeline_contract_created', {
        contract_id: result.contract.id,
        title: data.title,
        type: data.type,
        rate_type: data.rateType,
        remote: data.remote,
        confidentiality: data.confidentiality,
        organization_id: orgId,
      });

      // Log activity
      await sb.from('activities').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'create',
        resource_type: 'contract',
        resource_id: result.contract.id,
        details: {
          title: data.title,
          contractor_name: data.contractorName,
          type: data.type,
          rate_type: data.rateType,
          remote: data.remote,
        },
      });

      // Reset form and close drawer
      reset();
      setIsOpen(false);
      onContractCreated?.();

    } catch (error) {
      console.error('Error creating contract:', error);
      posthog?.capture('pipeline_contract_creation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organization_id: orgId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
       
      >
        <Plus className="h-4 w-4" />
        Add Contract
      </Button>

      <Drawer
        open={isOpen}
        onClose={handleClose}
        title="Add Contract"
        width="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="contract-form"
              disabled={!isValid || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Contract'}
            </Button>
          </div>
        }
      >
        <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-medium">Contract Information</h3>
              <p className="text-sm text-foreground/70">
                Create a new contractor agreement
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contract Title *
              </label>
              <Input
                {...register('title')}
                placeholder="e.g., Production Assistant Contract, Technical Consultant Agreement"
                error={errors.title?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contractor Name *
                </label>
                <Input
                  {...register('contractorName')}
                  placeholder="Full legal name"
                  error={errors.contractorName?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  {...register('contractorEmail')}
                  type="email"
                  placeholder="contractor@example.com"
                  error={errors.contractorEmail?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  {...register('contractorPhone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company (if applicable)
                </label>
                <Input
                  {...register('contractorCompany')}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contract Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="independent">Independent Contractor</option>
                <option value="subcontractor">Subcontractor</option>
                <option value="consultant">Consultant</option>
                <option value="vendor">Vendor</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date *
                </label>
                <Input
                  {...register('startDate')}
                  type="date"
                  error={errors.startDate?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <Input
                  {...register('endDate')}
                  type="date"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate *
                </label>
                <Input
                  {...register('rate', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.rate?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate Type
                </label>
                <select
                  {...register('rateType')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Hours (if applicable)
                </label>
                <Input
                  {...register('maxHours', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <Input
                {...register('location')}
                placeholder="Work location or address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Scope of Work *
              </label>
              <Textarea
                {...register('scope')}
                placeholder="Detailed description of work to be performed"
                rows={4}
                error={errors.scope?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Deliverables
              </label>
              <Textarea
                {...register('deliverables')}
                placeholder="Expected deliverables and milestones"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Requirements
              </label>
              <Textarea
                {...register('requirements')}
                placeholder="Skills, certifications, or equipment requirements"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Terms
              </label>
              <Textarea
                {...register('paymentTerms')}
                placeholder="Payment schedule, invoicing requirements, etc."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Termination Notice (days)
                </label>
                <Input
                  {...register('terminationNotice', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="14"
                />
              </div>

              <div>
                {autoRenewal && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Renewal Period (months)
                    </label>
                    <Input
                      {...register('renewalPeriod', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      placeholder="12"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('remote')}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Remote work allowed
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('confidentiality')}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Confidentiality agreement required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('exclusivity')}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Exclusive contractor (no competing work)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('autoRenewal')}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">
                  Auto-renewal clause
                </label>
              </div>
            </div>
          </div>

          <div className="bg-warning/5 p-4 rounded-lg">
            <h4 className="font-medium text-warning mb-2">Contract Guidelines</h4>
            <ul className="text-sm text-warning/80 space-y-1">
              <li>• Clearly define scope of work and deliverables to avoid disputes</li>
              <li>• Include payment terms, invoicing requirements, and termination clauses</li>
              <li>• Specify confidentiality and exclusivity requirements as needed</li>
              <li>• Consider local labor laws and contractor classification requirements</li>
              <li>• Review all contracts with legal counsel before execution</li>
            </ul>
          </div>
        </form>
      </Drawer>
    </>
  );
}

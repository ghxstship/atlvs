'use client';


import React, { useState, useCallback, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Select, Textarea, Card } from '@ghxstship/ui';
import { Building, Calendar, Save, Target, Users, X } from 'lucide-react';

interface CreateOverviewClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: any) => void;
}

interface OverviewFormData {
  type: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  companyId: string;
  status: string;
}

const OVERVIEW_TYPES = [
  { value: 'task', label: 'Company Task' },
  { value: 'milestone', label: 'Company Milestone' },
  { value: 'review', label: 'Performance Review' },
  { value: 'audit', label: 'Compliance Audit' },
  { value: 'meeting', label: 'Company Meeting' },
  { value: 'renewal', label: 'Contract Renewal' },
  { value: 'other', label: 'Other' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' }
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function CreateOverviewClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateOverviewClientProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState<OverviewFormData>({
    type: 'task',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    companyId: '',
    status: 'pending'
  });

  const supabase = createBrowserClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      loadTeamMembers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          user_id,
          user_profiles!inner(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', orgId)
        .eq('status', 'active');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleInputChange = (field: keyof OverviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const itemId = crypto.randomUUID();
      
      // Insert overview item record
      const { data: item, error } = await supabase
        .from('company_overview_items')
        .insert({
          id: itemId,
          organization_id: orgId,
          company_id: formData.companyId || null,
          type: formData.type,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.dueDate || null,
          assigned_to: formData.assignedTo || null,
          created_by: user.id,
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
          entity_type: 'company_overview_item',
          entity_id: itemId,
          metadata: {
            item_title: formData.title,
            item_type: formData.type,
            priority: formData.priority,
            company_id: formData.companyId
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: '',
        companyId: '',
        status: 'pending'
      });

      onSuccess?.(item);
      onClose();
    } catch (error) {
      console.error('Error creating overview item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Overview Item"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Item Details */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Target className="h-icon-sm w-icon-sm color-accent" />
            <h3 className="text-body text-heading-4">Item Details</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Item Type *
              </label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => handleInputChange('type', value)}
              >
                {OVERVIEW_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Title *
              </label>
              <Input                 value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                placeholder="Enter item title"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the item"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => handleInputChange('priority', value)}
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-xs">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  {STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignment & Timeline */}
        <Card className="p-md">
          <div className="flex items-center gap-sm mb-md">
            <Users className="h-icon-sm w-icon-sm color-success" />
            <h3 className="text-body text-heading-4">Assignment & Timeline</h3>
          </div>
          
          <div className="stack-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">
                Related Company (Optional)
              </label>
              <Select
                value={formData.companyId}
                onValueChange={(value: any) => handleInputChange('companyId', value)}
              >
                <option value="">No company association</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                Assigned To (Optional)
              </label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value: any) => handleInputChange('assignedTo', value)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_profiles.first_name} {member.user_profiles.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-xs">
                <Calendar className="h-icon-xs w-icon-xs inline mr-xs" />
                Due Date (Optional)
              </label>
              <Input                 type="date"
                value={formData.dueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-sm pt-md border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-icon-xs w-icon-xs mr-sm" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim()}
          >
            <Save className="h-icon-xs w-icon-xs mr-sm" />
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

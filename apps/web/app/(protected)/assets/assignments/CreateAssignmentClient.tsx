'use client';

import React, { useState } from 'react';
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
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  Save,
  X
} from 'lucide-react';

interface CreateAssignmentClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (assignment: any) => void;
}

interface AssignmentFormData {
  assetId: string;
  assignedTo: string;
  assignedBy: string;
  projectId: string;
  assignmentDate: string;
  returnDate: string;
  location: string;
  purpose: string;
  status: string;
  priority: string;
  notes: string;
}

const ASSIGNMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export default function CreateAssignmentClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAssignmentClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    assetId: '',
    assignedTo: '',
    assignedBy: user.id,
    projectId: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    location: '',
    purpose: '',
    status: 'pending',
    priority: 'medium',
    notes: ''
  });

  const supabase = createBrowserClient();

  const handleInputChange = (field: keyof AssignmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.assignedTo || !formData.purpose) return;

    setLoading(true);
    try {
      const assignmentId = crypto.randomUUID();
      
      // Insert assignment record
      const { data: assignment, error } = await supabase
        .from('asset_assignments')
        .insert({
          id: assignmentId,
          organization_id: orgId,
          asset_id: formData.assetId,
          assigned_to: formData.assignedTo,
          assigned_by: formData.assignedBy,
          project_id: formData.projectId || null,
          assignment_date: formData.assignmentDate,
          return_date: formData.returnDate || null,
          location: formData.location.trim() || null,
          purpose: formData.purpose.trim(),
          status: formData.status,
          priority: formData.priority,
          notes: formData.notes.trim() || null,
          created_by: user.id,
          updated_by: user.id,
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
          entity_type: 'asset_assignment',
          entity_id: assignmentId,
          metadata: {
            asset_id: formData.assetId,
            assigned_to: formData.assignedTo,
            purpose: formData.purpose,
            status: formData.status,
            priority: formData.priority
          },
          occurred_at: new Date().toISOString()
        });

      // Reset form
      setFormData({
        assetId: '',
        assignedTo: '',
        assignedBy: user.id,
        projectId: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        location: '',
        purpose: '',
        status: 'pending',
        priority: 'medium',
        notes: ''
      });

      onSuccess?.(assignment);
      onClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Create Asset Assignment"
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset & Personnel */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 color-primary" />
            <h3 className="text-heading-4">Asset & Personnel</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Asset ID *
              </label>
              <Input
                value={formData.assetId}
                onChange={(e) => handleInputChange('assetId', e.target.value)}
                placeholder="Enter asset ID"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Assigned To *
                </label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  placeholder="Person receiving assignment"
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Assigned By
                </label>
                <Input
                  value={formData.assignedBy}
                  onChange={(e) => handleInputChange('assignedBy', e.target.value)}
                  placeholder="Person making assignment"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                Project ID
              </label>
              <Input
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                placeholder="Associated project (optional)"
              />
            </div>
          </div>
        </Card>

        {/* Timeline & Location */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 color-success" />
            <h3 className="text-heading-4">Timeline & Location</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Assignment Date *
                </label>
                <Input
                  type="date"
                  value={formData.assignmentDate}
                  onChange={(e) => handleInputChange('assignmentDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Expected Return Date
                </label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Assignment location"
              />
            </div>
          </div>
        </Card>

        {/* Assignment Details */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 color-secondary" />
            <h3 className="text-heading-4">Assignment Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-body-sm form-label mb-1">
                Purpose *
              </label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Describe the purpose of this assignment"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm form-label mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  {ASSIGNMENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-body-sm form-label mb-1">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this assignment"
                rows={3}
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
            disabled={loading || !formData.assetId || !formData.assignedTo || !formData.purpose}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

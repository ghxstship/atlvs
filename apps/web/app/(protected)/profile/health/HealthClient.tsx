'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select, Drawer } from '@ghxstship/ui';
import { 
  Heart, 
  Edit, 
  Save, 
  Plus,
  AlertTriangle,
  Shield,
  Calendar,
  Trash2,
  Activity
} from 'lucide-react';

const healthRecordSchema = z.object({
  record_type: z.enum(['medical', 'vaccination', 'allergy', 'medication', 'condition', 'emergency']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date_recorded: z.string(),
  expiry_date: z.string().optional(),
  provider: z.string().optional(),
  document_url: z.string().optional(),
  is_active: z.boolean().default(true),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional()
});

type HealthRecordForm = z.infer<typeof healthRecordSchema>;

interface HealthRecord {
  id: string;
  record_type: string;
  title: string;
  description?: string;
  date_recorded: string;
  expiry_date?: string;
  provider?: string;
  document_url?: string;
  is_active: boolean;
  severity?: string;
  notes?: string;
  created_at: string;
}

export default function HealthClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const form = useForm<HealthRecordForm>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      record_type: 'medical',
      title: '',
      description: '',
      date_recorded: new Date().toISOString().split('T')[0],
      expiry_date: '',
      provider: '',
      document_url: '',
      is_active: true,
      severity: 'low',
      notes: ''
    }
  });

  useEffect(() => {
    loadHealthRecords();
  }, [orgId, userId]);

  const loadHealthRecords = async () => {
    try {
      setLoading(true);
      
      // Mock health records data
      const mockRecords: HealthRecord[] = [
        {
          id: '1',
          record_type: 'vaccination',
          title: 'COVID-19 Vaccination',
          description: 'Pfizer-BioNTech COVID-19 Vaccine',
          date_recorded: '2024-01-15',
          expiry_date: '2025-01-15',
          provider: 'Maritime Health Services',
          is_active: true,
          severity: 'low',
          notes: 'Booster shot completed',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          record_type: 'allergy',
          title: 'Shellfish Allergy',
          description: 'Severe allergic reaction to shellfish',
          date_recorded: '2023-06-10',
          provider: 'Dr. Maritime',
          is_active: true,
          severity: 'high',
          notes: 'Carry EpiPen at all times',
          created_at: '2023-06-10T14:30:00Z'
        },
        {
          id: '3',
          record_type: 'condition',
          title: 'Hypertension',
          description: 'High blood pressure - controlled',
          date_recorded: '2023-03-20',
          provider: 'Blackwater Medical Center',
          is_active: true,
          severity: 'medium',
          notes: 'Regular monitoring required',
          created_at: '2023-03-20T09:15:00Z'
        }
      ];
      
      setHealthRecords(mockRecords);
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HealthRecordForm) => {
    setSaving(true);
    try {
      if (editingRecord) {
        // Update existing record
        const updatedRecords = healthRecords.map(record =>
          record.id === editingRecord.id
            ? { ...record, ...data }
            : record
        );
        setHealthRecords(updatedRecords);
      } else {
        // Create new record
        const newRecord: HealthRecord = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setHealthRecords([newRecord, ...healthRecords]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingRecord ? 'health_record_updated' : 'health_record_added',
          activity_description: editingRecord 
            ? `Updated health record: ${data.title}`
            : `Added new health record: ${data.title}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingRecord(null);
      form.reset();
    } catch (error) {
      console.error('Error saving health record:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    form.reset({
      record_type: record.record_type as any,
      title: record.title,
      description: record.description || '',
      date_recorded: record.date_recorded,
      expiry_date: record.expiry_date || '',
      provider: record.provider || '',
      document_url: record.document_url || '',
      is_active: record.is_active,
      severity: record.severity as any || 'low',
      notes: record.notes || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this health record?')) {
      const record = healthRecords.find(r => r.id === recordId);
      setHealthRecords(healthRecords.filter(r => r.id !== recordId));
      
      // Log activity
      if (record) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'health_record_deleted',
            activity_description: `Deleted health record: ${record.title}`,
            performed_by: userId
          });
      }
    }
  };

  const getRecordTypeIcon = (type: string) => {
    const icons = {
      medical: Heart,
      vaccination: Shield,
      allergy: AlertTriangle,
      medication: Activity,
      condition: Heart,
      emergency: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Heart;
  };

  const getRecordTypeColor = (type: string) => {
    const colors = {
      medical: 'blue',
      vaccination: 'green',
      allergy: 'red',
      medication: 'purple',
      condition: 'orange',
      emergency: 'red'
    };
    return colors[type as keyof typeof colors] || 'blue';
  };

  const getSeverityColor = (severity?: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'destructive',
      critical: 'destructive'
    };
    return colors[severity as keyof typeof colors] || 'secondary';
  };

  const formatRecordType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const filteredRecords = filterType === 'all' 
    ? healthRecords 
    : healthRecords.filter(record => record.record_type === filterType);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Health Records</h2>
        <Button 
          onClick={() => {
            setEditingRecord(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Health Record
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'medical', 'vaccination', 'allergy', 'medication', 'condition', 'emergency'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Records' : formatRecordType(type)}
          </Button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Health Records</h3>
            <p className="text-muted-foreground mb-4">
              Keep track of your medical history, vaccinations, allergies, and health conditions.
            </p>
            <Button 
              onClick={() => {
                setEditingRecord(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Health Record
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const IconComponent = getRecordTypeIcon(record.record_type);
            const isExpiring = record.expiry_date && 
              new Date(record.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            return (
              <Card key={record.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 bg-${getRecordTypeColor(record.record_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${getRecordTypeColor(record.record_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.title}</h3>
                        {record.description && (
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {formatRecordType(record.record_type)}
                          </Badge>
                          {record.severity && (
                            <Badge variant={getSeverityColor(record.severity) as any} size="sm">
                              {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                            </Badge>
                          )}
                          {!record.is_active && (
                            <Badge variant="secondary" size="sm">Inactive</Badge>
                          )}
                          {isExpiring && (
                            <Badge variant="destructive" size="sm">Expiring Soon</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {record.provider && (
                        <span>Provider: {record.provider}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.date_recorded).toLocaleDateString()}
                      </div>
                    </div>
                    {record.expiry_date && (
                      <div className="flex items-center gap-1">
                        <span>Expires: {new Date(record.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingRecord ? 'Edit Health Record' : 'Add New Health Record'}
        description={editingRecord ? 'Update health record details' : 'Add a new health record'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Record Type"
              {...form.register('record_type')}
              error={form.formState.errors.record_type?.message}
            >
              <option value="medical">Medical</option>
              <option value="vaccination">Vaccination</option>
              <option value="allergy">Allergy</option>
              <option value="medication">Medication</option>
              <option value="condition">Condition</option>
              <option value="emergency">Emergency</option>
            </Select>

            <Select
              label="Severity"
              {...form.register('severity')}
              error={form.formState.errors.severity?.message}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>

          <Input
            label="Title"
            placeholder="Enter record title"
            {...form.register('title')}
            error={form.formState.errors.title?.message}
          />

          <Textarea
            label="Description"
            placeholder="Enter detailed description"
            {...form.register('description')}
            error={form.formState.errors.description?.message}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Recorded"
              type="date"
              {...form.register('date_recorded')}
              error={form.formState.errors.date_recorded?.message}
            />

            <Input
              label="Expiry Date (Optional)"
              type="date"
              {...form.register('expiry_date')}
              error={form.formState.errors.expiry_date?.message}
            />
          </div>

          <Input
            label="Healthcare Provider"
            placeholder="Doctor, clinic, or hospital name"
            {...form.register('provider')}
            error={form.formState.errors.provider?.message}
          />

          <Input
            label="Document URL (Optional)"
            placeholder="Link to medical document or report"
            {...form.register('document_url')}
            error={form.formState.errors.document_url?.message}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes or instructions"
            {...form.register('notes')}
            error={form.formState.errors.notes?.message}
            rows={3}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              {...form.register('is_active')}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              This record is currently active
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              {editingRecord ? 'Update' : 'Save'} Record
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
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
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded mb-md"></div>
          <div className="stack-md">
            <div className="h-32 bg-secondary rounded"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Health Records</h2>
        <Button 
          onClick={() => {
            setEditingRecord(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-sm"
        >
          <Plus className="h-4 w-4" />
          Add Health Record
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm flex-wrap">
        {['all', 'medical', 'vaccination', 'allergy', 'medication', 'condition', 'emergency'].map((type: any) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
           
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Records' : formatRecordType(type)}
          </Button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <div className="p-xl text-center">
            <Heart className="h-12 w-12 color-muted mx-auto mb-md" />
            <h3 className="text-body text-heading-4 mb-sm">No Health Records</h3>
            <p className="color-muted mb-md">
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
        <div className="stack-md">
          {filteredRecords.map((record: any) => {
            const IconComponent = getRecordTypeIcon(record.record_type);
            const isExpiring = record.expiry_date && 
              new Date(record.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            return (
              <Card key={record.id}>
                <div className="p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <div className={`h-10 w-10 bg-${getRecordTypeColor(record.record_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${getRecordTypeColor(record.record_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="text-body text-heading-4">{record.title}</h3>
                        {record.description && (
                          <p className="text-body-sm color-muted">{record.description}</p>
                        )}
                        <div className="flex items-center gap-sm mt-xs">
                          <Badge variant="outline">
                            {formatRecordType(record.record_type)}
                          </Badge>
                          {record.severity && (
                            <Badge variant={getSeverityColor(record.severity) as any}>
                              {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                            </Badge>
                          )}
                          {!record.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {isExpiring && (
                            <Badge variant="destructive">Expiring Soon</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Button
                        variant="outline"
                       
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                       
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mb-md p-sm bg-secondary rounded-lg">
                      <p className="text-body-sm">{record.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-body-sm color-muted">
                    <div className="flex items-center gap-md">
                      {record.provider && (
                        <span>Provider: {record.provider}</span>
                      )}
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.date_recorded).toLocaleDateString()}
                      </div>
                    </div>
                    {record.expiry_date && (
                      <div className="flex items-center gap-xs">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          <div className="grid grid-cols-2 gap-md">
            <Select
              {...form.register('record_type')}
            >
              <option value="medical">Medical</option>
              <option value="vaccination">Vaccination</option>
              <option value="allergy">Allergy</option>
              <option value="medication">Medication</option>
              <option value="condition">Condition</option>
              <option value="emergency">Emergency</option>
            </Select>

            <Select
              {...form.register('severity')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>

          <UnifiedInput             label="Title"
            placeholder="Enter record title"
            {...form.register('title')}
           
          />

          <Textarea
            label="Description"
            placeholder="Enter detailed description"
            {...form.register('description')}
           
            rows={3}
          />

          <div className="grid grid-cols-2 gap-md">
            <UnifiedInput               label="Date Recorded"
              type="date"
              {...form.register('date_recorded')}
             
            />

            <UnifiedInput               label="Expiry Date (Optional)"
              type="date"
              {...form.register('expiry_date')}
             
            />
          </div>

          <UnifiedInput             label="Healthcare Provider"
            placeholder="Doctor, clinic, or hospital name"
            {...form.register('provider')}
           
          />

          <UnifiedInput             label="Document URL (Optional)"
            placeholder="Link to medical document or report"
            {...form.register('document_url')}
           
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes or instructions"
            {...form.register('notes')}
           
            rows={3}
          />

          <div className="flex items-center cluster-sm">
            <input
              type="checkbox"
              id="is_active"
              {...form.register('is_active')}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-body-sm form-label">
              This record is currently active
            </label>
          </div>

          <div className="flex justify-end gap-sm pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-sm" />
              {editingRecord ? 'Update' : 'Save'} Record
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

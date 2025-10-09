'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Calendar, Clock, CreditCard, Edit, Globe, History, MapPin, Plane, Plus, Save, Trash2 } from "lucide-react";import {
  Badge,
  Button,
  Card,
  Drawer,
  Input,
  Select,
  Textarea,
  UnifiedInput
} from "@ghxstship/ui";
import {
  Card,
  Button,
  Select,
  Textarea,
  Badge,
  Drawer
} from '@ghxstship/ui';


const travelRecordSchema = z.object({
  travel_type: z.enum(['business', 'personal', 'relocation', 'training', 'conference', 'other']),
  destination: z.string().min(1, 'Destination is required'),
  country: z.string().min(1, 'Country is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  start_date: z.string(),
  end_date: z.string(),
  duration_days: z.number().min(1),
  accommodation: z.string().optional(),
  transportation: z.string().optional(),
  visa_required: z.boolean().default(false),
  visa_status: z.enum(['not-required', 'pending', 'approved', 'denied']).optional(),
  passport_used: z.string().optional(),
  notes: z.string().optional(),
  expenses: z.number().optional()
});

type TravelRecordForm = z.infer<typeof travelRecordSchema>;

interface TravelRecord {
  id: string;
  travel_type: string;
  destination: string;
  country: string;
  purpose: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  accommodation?: string;
  transportation?: string;
  visa_required: boolean;
  visa_status?: string;
  passport_used?: string;
  notes?: string;
  expenses?: number;
  created_at: string;
}

export default function TravelClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const form = useForm<TravelRecordForm>({
    resolver: zodResolver(travelRecordSchema),
    defaultValues: {
      travel_type: 'business',
      destination: '',
      country: '',
      purpose: '',
      start_date: '',
      end_date: '',
      duration_days: 1,
      accommodation: '',
      transportation: '',
      visa_required: false,
      visa_status: 'not-required',
      passport_used: '',
      notes: '',
      expenses: 0
    }
  });

  useEffect(() => {
    loadTravelRecords();
  }, [orgId, userId]);

  useEffect(() => {
    // Calculate duration when dates change
    const startDate = form.watch('start_date');
    const endDate = form.watch('end_date');
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      form.setValue('duration_days', diffDays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('start_date'), form.watch('end_date')]);

  const loadTravelRecords = async () => {
    try {
      setLoading(true);
      
      // Mock travel records data
      const mockRecords: TravelRecord[] = [
        {
          id: '1',
          travel_type: 'business',
          destination: 'Port Royal, Jamaica',
          country: 'Jamaica',
          purpose: 'Maritime Operations Conference',
          start_date: '2024-01-15',
          end_date: '2024-01-20',
          duration_days: 6,
          accommodation: 'Royal Caribbean Resort',
          transportation: 'Company Vessel',
          visa_required: false,
          visa_status: 'not-required',
          passport_used: 'Maritime Passport #12345',
          notes: 'Attended advanced navigation workshops and fleet coordination meetings.',
          expenses: 2500,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          travel_type: 'training',
          destination: 'Portsmouth, England',
          country: 'United Kingdom',
          purpose: 'Advanced Maritime Certification',
          start_date: '2023-09-01',
          end_date: '2023-09-30',
          duration_days: 30,
          accommodation: 'Naval Academy Quarters',
          transportation: 'Commercial Flight',
          visa_required: true,
          visa_status: 'approved',
          passport_used: 'Standard Passport #67890',
          notes: 'Completed advanced navigation and maritime law certification program.',
          expenses: 5000,
          created_at: '2023-09-01T08:00:00Z'
        },
        {
          id: '3',
          travel_type: 'personal',
          destination: 'Tortuga Island',
          country: 'Caribbean Territory',
          purpose: 'Family Vacation',
          start_date: '2023-12-20',
          end_date: '2023-12-27',
          duration_days: 8,
          accommodation: 'Beachfront Villa',
          transportation: 'Private Yacht',
          visa_required: false,
          visa_status: 'not-required',
          notes: 'Holiday break with family. Explored local maritime history.',
          expenses: 3000,
          created_at: '2023-12-20T12:00:00Z'
        }
      ];
      
      setTravelRecords(mockRecords);
    } catch (error) {
      console.error('Error loading travel records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TravelRecordForm) => {
    setSaving(true);
    try {
      if (editingRecord) {
        // Update existing record
        const updatedRecords = travelRecords.map(record =>
          record.id === editingRecord.id
            ? { ...record, ...data }
            : record
        );
        setTravelRecords(updatedRecords);
      } else {
        // Create new record
        const newRecord: TravelRecord = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setTravelRecords([newRecord, ...travelRecords]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingRecord ? 'travel_record_updated' : 'travel_record_added',
          activity_description: editingRecord 
            ? `Updated travel record: ${data.destination}`
            : `Added new travel record: ${data.destination}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingRecord(null);
      form.reset();
    } catch (error) {
      console.error('Error saving travel record:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: TravelRecord) => {
    setEditingRecord(record);
    form.reset({
      travel_type: record.travel_type as any,
      destination: record.destination,
      country: record.country,
      purpose: record.purpose,
      start_date: record.start_date,
      end_date: record.end_date,
      duration_days: record.duration_days,
      accommodation: record.accommodation || '',
      transportation: record.transportation || '',
      visa_required: record.visa_required,
      visa_status: record.visa_status as any || 'not-required',
      passport_used: record.passport_used || '',
      notes: record.notes || '',
      expenses: record.expenses || 0
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this travel record?')) {
      const record = travelRecords.find(r => r.id === recordId);
      setTravelRecords(travelRecords.filter(r => r.id !== recordId));
      
      // Log activity
      if (record) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'travel_record_deleted',
            activity_description: `Deleted travel record: ${record.destination}`,
            performed_by: userId
          });
      }
    }
  };

  const getTravelTypeIcon = (type: string) => {
    const icons = {
      business: Plane,
      personal: Globe,
      relocation: MapPin,
      training: Calendar,
      conference: Clock,
      other: Plane
    };
    return icons[type as keyof typeof icons] || Plane;
  };

  const getTravelTypeColor = (type: string) => {
    const colors = {
      business: 'blue',
      personal: 'green',
      relocation: 'purple',
      training: 'orange',
      conference: 'red',
      other: 'gray'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getVisaStatusColor = (status?: string) => {
    const colors = {
      'not-required': 'secondary',
      'pending': 'warning',
      'approved': 'success',
      'denied': 'destructive'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const formatTravelType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatVisaStatus = (status?: string) => {
    if (!status) return 'Not Required';
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateTotalExpenses = () => {
    return travelRecords.reduce((total, record) => total + (record.expenses || 0), 0);
  };

  const calculateTotalDays = () => {
    return travelRecords.reduce((total, record) => total + record.duration_days, 0);
  };

  const filteredRecords = filterType === 'all' 
    ? travelRecords 
    : travelRecords.filter(record => record.travel_type === filterType);

  // Sort records by start date (most recent first)
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-icon-lg bg-secondary rounded mb-md"></div>
          <div className="stack-md">
            <div className="h-component-xl bg-secondary rounded"></div>
            <div className="h-component-xl bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Travel History</h2>
        <Button 
          onClick={() => {
            setEditingRecord(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-sm"
        >
          <Plus className="h-icon-xs w-icon-xs" />
          Add Travel Record
        </Button>
      </div>

      {/* Travel Summary */}
      {travelRecords.length > 0 && (
        <Card>
          <div className="p-lg">
            <div className="flex items-center gap-sm mb-md">
              <Globe className="h-icon-sm w-icon-sm color-accent" />
              <h3 className="text-body text-heading-4">Travel Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-accent">{travelRecords.length}</div>
                <div className="text-body-sm color-muted">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-success">{calculateTotalDays()}</div>
                <div className="text-body-sm color-muted">Days Traveled</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-secondary">
                  ${calculateTotalExpenses().toLocaleString()}
                </div>
                <div className="text-body-sm color-muted">Total Expenses</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-sm flex-wrap">
        {['all', 'business', 'personal', 'training', 'conference', 'relocation', 'other'].map((type: any) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
           
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Trips' : formatTravelType(type)}
          </Button>
        ))}
      </div>

      {sortedRecords.length === 0 ? (
        <Card>
          <div className="p-xl text-center">
            <Plane className="h-icon-2xl w-icon-2xl color-muted mx-auto mb-md" />
            <h3 className="text-body text-heading-4 mb-sm">No Travel Records</h3>
            <p className="color-muted mb-md">
              Keep track of your business trips, training, and personal travel history.
            </p>
            <Button 
              onClick={() => {
                setEditingRecord(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Trip
            </Button>
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {sortedRecords.map((record: any) => {
            const IconComponent = getTravelTypeIcon(record.travel_type);
            
            return (
              <Card key={record.id}>
                <div className="p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <div className={`h-icon-xl w-icon-xl bg-${getTravelTypeColor(record.travel_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-icon-sm w-icon-sm text-${getTravelTypeColor(record.travel_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="text-body text-heading-4">{record.destination}</h3>
                        <p className="text-body-sm color-muted">{record.country}</p>
                        <div className="flex items-center gap-sm mt-xs">
                          <Badge variant="outline">
                            {formatTravelType(record.travel_type)}
                          </Badge>
                          {record.visa_required && (
                            <Badge variant={getVisaStatusColor(record.visa_status) as any}>
                              Visa: {formatVisaStatus(record.visa_status)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Button
                        variant="outline"
                       
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-icon-xs w-icon-xs" />
                      </Button>
                      <Button
                        variant="outline"
                       
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-icon-xs w-icon-xs" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-md">
                    <h4 className="text-body-sm form-label mb-xs">Purpose</h4>
                    <p className="text-body-sm color-muted">{record.purpose}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                    <div>
                      <h4 className="text-body-sm form-label mb-xs">Travel Dates</h4>
                      <div className="flex items-center gap-xs text-body-sm color-muted">
                        <Calendar className="h-icon-xs w-icon-xs" />
                        {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-xs text-body-sm color-muted mt-xs">
                        <Clock className="h-icon-xs w-icon-xs" />
                        {record.duration_days} day{record.duration_days !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {record.expenses && (
                      <div>
                        <h4 className="text-body-sm form-label mb-xs">Expenses</h4>
                        <p className="text-body-sm color-muted">
                          ${record.expenses.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {(record.accommodation || record.transportation) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                      {record.accommodation && (
                        <div>
                          <h4 className="text-body-sm form-label mb-xs">Accommodation</h4>
                          <p className="text-body-sm color-muted">{record.accommodation}</p>
                        </div>
                      )}
                      
                      {record.transportation && (
                        <div>
                          <h4 className="text-body-sm form-label mb-xs">Transportation</h4>
                          <p className="text-body-sm color-muted">{record.transportation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {record.passport_used && (
                    <div className="mb-md">
                      <h4 className="text-body-sm form-label mb-xs">Passport Used</h4>
                      <div className="flex items-center gap-xs text-body-sm color-muted">
                        <CreditCard className="h-icon-xs w-icon-xs" />
                        {record.passport_used}
                      </div>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mb-md p-sm bg-secondary rounded-lg">
                      <h4 className="text-body-sm form-label mb-xs">Notes</h4>
                      <p className="text-body-sm color-muted">{record.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingRecord ? 'Edit Travel Record' : 'Add New Travel Record'}
        description={editingRecord ? 'Update travel record details' : 'Add a new travel record'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-md">
          <Select
            {...form.register('travel_type')}
          >
            <option value="business">Business</option>
            <option value="personal">Personal</option>
            <option value="training">Training</option>
            <option value="conference">Conference</option>
            <option value="relocation">Relocation</option>
            <option value="other">Other</option>
          </Select>

          <div className="grid grid-cols-2 gap-md">
            <Input               label="Destination"
              placeholder="City, location"
              {...form.register('destination')}
             
            />

            <Input               label="Country"
              placeholder="Country name"
              {...form.register('country')}
             
            />
          </div>

          <Input             label="Purpose"
            placeholder="Purpose of travel"
            {...form.register('purpose')}
           
          />

          <div className="grid grid-cols-3 gap-md">
            <Input               label="Start Date"
              type="date"
              {...form.register('start_date')}
             
            />

            <Input               label="End Date"
              type="date"
              {...form.register('end_date')}
             
            />

            <Input               label="Duration (Days)"
              type="number"
              {...form.register('duration_days', { valueAsNumber: true })}
             
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Input               label="Accommodation"
              placeholder="Hotel, residence, etc."
              {...form.register('accommodation')}
             
            />

            <Input               label="Transportation"
              placeholder="Flight, car, ship, etc."
              {...form.register('transportation')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex items-center cluster-sm">
              <input
                type="checkbox"
                id="visa_required"
                {...form.register('visa_required')}
                className="rounded border-border"
              />
              <label htmlFor="visa_required" className="text-body-sm form-label">
                Visa required for this trip
              </label>
            </div>

            {form.watch('visa_required') && (
              <Select
                {...form.register('visa_status')}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-md">
            <Input               label="Passport Used"
              placeholder="Passport number or type"
              {...form.register('passport_used')}
             
            />

            <Input               label="Expenses ($)"
              type="number"
              placeholder="0"
              {...form.register('expenses', { valueAsNumber: true })}
             
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="Additional notes about the trip"
            {...form.register('notes')}
           
            rows={3}
          />

          <div className="flex justify-end gap-sm pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-icon-xs w-icon-xs mr-sm" />
              {editingRecord ? 'Update' : 'Save'} Record
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

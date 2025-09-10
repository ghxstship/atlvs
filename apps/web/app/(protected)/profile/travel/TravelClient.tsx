'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select, Drawer } from '@ghxstship/ui';
import { 
  Plane, 
  Edit, 
  Save, 
  Plus,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  CreditCard,
  Globe
} from 'lucide-react';

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
        <h2 className="text-xl font-semibold">Travel History</h2>
        <Button 
          onClick={() => {
            setEditingRecord(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Travel Record
        </Button>
      </div>

      {/* Travel Summary */}
      {travelRecords.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Travel Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{travelRecords.length}</div>
                <div className="text-sm text-muted-foreground">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calculateTotalDays()}</div>
                <div className="text-sm text-muted-foreground">Days Traveled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${calculateTotalExpenses().toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'business', 'personal', 'training', 'conference', 'relocation', 'other'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Trips' : formatTravelType(type)}
          </Button>
        ))}
      </div>

      {sortedRecords.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Travel Records</h3>
            <p className="text-muted-foreground mb-4">
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
        <div className="space-y-4">
          {sortedRecords.map((record) => {
            const IconComponent = getTravelTypeIcon(record.travel_type);
            
            return (
              <Card key={record.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 bg-${getTravelTypeColor(record.travel_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${getTravelTypeColor(record.travel_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{record.destination}</h3>
                        <p className="text-sm text-muted-foreground">{record.country}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {formatTravelType(record.travel_type)}
                          </Badge>
                          {record.visa_required && (
                            <Badge variant={getVisaStatusColor(record.visa_status) as any} size="sm">
                              Visa: {formatVisaStatus(record.visa_status)}
                            </Badge>
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

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Purpose</h4>
                    <p className="text-sm text-muted-foreground">{record.purpose}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Travel Dates</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        {record.duration_days} day{record.duration_days !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {record.expenses && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Expenses</h4>
                        <p className="text-sm text-muted-foreground">
                          ${record.expenses.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {(record.accommodation || record.transportation) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {record.accommodation && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Accommodation</h4>
                          <p className="text-sm text-muted-foreground">{record.accommodation}</p>
                        </div>
                      )}
                      
                      {record.transportation && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Transportation</h4>
                          <p className="text-sm text-muted-foreground">{record.transportation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {record.passport_used && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Passport Used</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        {record.passport_used}
                      </div>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Destination"
              placeholder="City, location"
              {...form.register('destination')}
             
            />

            <Input
              label="Country"
              placeholder="Country name"
              {...form.register('country')}
             
            />
          </div>

          <Input
            label="Purpose"
            placeholder="Purpose of travel"
            {...form.register('purpose')}
           
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...form.register('start_date')}
             
            />

            <Input
              label="End Date"
              type="date"
              {...form.register('end_date')}
             
            />

            <Input
              label="Duration (Days)"
              type="number"
              {...form.register('duration_days', { valueAsNumber: true })}
             
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Accommodation"
              placeholder="Hotel, residence, etc."
              {...form.register('accommodation')}
             
            />

            <Input
              label="Transportation"
              placeholder="Flight, car, ship, etc."
              {...form.register('transportation')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visa_required"
                {...form.register('visa_required')}
                className="rounded border-gray-300"
              />
              <label htmlFor="visa_required" className="text-sm font-medium">
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Passport Used"
              placeholder="Passport number or type"
              {...form.register('passport_used')}
             
            />

            <Input
              label="Expenses ($)"
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

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Button, Calendar, Card, CardContent, CardHeader, CardTitle, DollarSign, Drawer, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea, User } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Drawer, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select } from '@ghxstship/ui';

const createRevenueSchema = z.object({
  source: z.string().min(1, 'Revenue source is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['sales', 'services', 'subscriptions', 'licensing', 'other']),
  recognition_date: z.string().min(1, 'Recognition date is required'),
  status: z.enum(['projected', 'invoiced', 'received']),
  client_id: z.string().optional(),
  project_id: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional()
});

type CreateRevenueForm = z.infer<typeof createRevenueSchema>;

interface CreateRevenueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRevenueForm) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateRevenueDrawer({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CreateRevenueDrawerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateRevenueForm>({
    resolver: zodResolver(createRevenueSchema),
    defaultValues: {
      status: 'projected',
      category: 'sales',
      recognition_date: new Date().toISOString().split('T')[0]
    }
  });

  const handleFormSubmit = async (data: CreateRevenueForm) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create revenue:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Add Revenue">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <DollarSign className="h-icon-sm w-icon-sm" />
                Revenue Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <FormField>
                <FormItem>
                  <FormLabel>Source *</FormLabel>
                  <FormControl>
                    <Input
                      {...register('source')}
                      placeholder="e.g., Product Sale, Service Contract"
                    />
                  </FormControl>
                  <FormMessage>{errors.source?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage>{errors.amount?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Select {...register('category')}>
                      <option value="sales">Sales</option>
                      <option value="services">Services</option>
                      <option value="subscriptions">Subscriptions</option>
                      <option value="licensing">Licensing</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.category?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <Select {...register('status')}>
                      <option value="projected">Projected</option>
                      <option value="invoiced">Invoiced</option>
                      <option value="received">Received</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.status?.message}</FormMessage>
                </FormItem>
              </FormField>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-icon-sm w-icon-sm" />
                Recognition & Associations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <FormField>
                <FormItem>
                  <FormLabel>Recognition Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...register('recognition_date')}
                      type="date"
                    />
                  </FormControl>
                  <FormMessage>{errors.recognition_date?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input
                      {...register('invoice_number')}
                      placeholder="e.g., INV-2024-001"
                    />
                  </FormControl>
                  <FormMessage>{errors.invoice_number?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel className="flex items-center gap-xs">
                    <User className="h-icon-xs w-icon-xs" />
                    Client ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...register('client_id')}
                      placeholder="Client identifier"
                    />
                  </FormControl>
                  <FormMessage>{errors.client_id?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel className="flex items-center gap-xs">
                    <Building className="h-icon-xs w-icon-xs" />
                    Project ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...register('project_id')}
                      placeholder="Project identifier"
                    />
                  </FormControl>
                  <FormMessage>{errors.project_id?.message}</FormMessage>
                </FormItem>
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField>
              <FormItem>
                <FormControl>
                  <textarea
                    {...register('notes')}
                    placeholder="Any additional notes or details..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage>{errors.notes?.message}</FormMessage>
              </FormItem>
            </FormField>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-md pt-lg border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Revenue'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

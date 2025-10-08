'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Button, Calendar, Card, CardContent, CardHeader, CardTitle, DollarSign, Drawer, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, Textarea, User } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Drawer, Input, Select } from '@ghxstship/ui';

const editRevenueSchema = z.object({
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

type EditRevenueForm = z.infer<typeof editRevenueSchema>;

interface EditRevenueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditRevenueForm) => Promise<void>;
  revenue?: DataRecord | null;
  isLoading?: boolean;
}

export default function EditRevenueDrawer({
  isOpen,
  onClose,
  onSubmit,
  revenue,
  isLoading = false
}: EditRevenueDrawerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<EditRevenueForm>({
    resolver: zodResolver(editRevenueSchema)
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (revenue && isOpen) {
      reset({
        source: revenue.source || '',
        amount: revenue.amount || 0,
        category: revenue.category || 'sales',
        recognition_date: revenue.recognition_date ?
          new Date(revenue.recognition_date).toISOString().split('T')[0] : '',
        status: revenue.status || 'projected',
        client_id: revenue.client_id || '',
        project_id: revenue.project_id || '',
        invoice_number: revenue.invoice_number || '',
        notes: revenue.notes || ''
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenue, isOpen, reset]);

  const handleFormSubmit = async (data: EditRevenueForm) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to update revenue:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Edit Revenue">
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
                <FormMessage />
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
            {isLoading ? 'Updating...' : 'Update Revenue'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

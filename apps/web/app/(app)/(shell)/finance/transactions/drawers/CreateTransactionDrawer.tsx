'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  Button,
  Input,
  Select,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@ghxstship/ui';
import { ArrowUpDown, Calendar, CreditCard, Building } from 'lucide-react';

const createTransactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.number().positive('Amount must be positive').max(10000000),
  currency: z.string().default('USD'),
  type: z.enum(['credit', 'debit']),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  account_id: z.string().uuid('Valid account is required'),
  category: z.string().min(1, 'Category is required'),
  project_id: z.string().uuid().optional(),
  reference_number: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

type CreateTransactionForm = z.infer<typeof createTransactionSchema>;

interface CreateTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionForm) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateTransactionDrawer({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CreateTransactionDrawerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateTransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'debit',
      transaction_date: new Date().toISOString().split('T')[0],
      currency: 'USD'
    }
  });

  const transactionType = watch('type');

  const handleFormSubmit = async (data: CreateTransactionForm) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Add Transaction">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <ArrowUpDown className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <FormField>
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input
                      {...register('description')}
                      placeholder="e.g., Office supplies, Client payment"
                    />
                  </FormControl>
                  <FormMessage>{errors.description?.message}</FormMessage>
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
                  <FormLabel>Type *</FormLabel>
                  <FormControl>
                    <Select {...register('type')}>
                      <option value="debit">Debit (Money Out)</option>
                      <option value="credit">Credit (Money In)</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.type?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Select {...register('category')}>
                      <option value="salary">Salary</option>
                      <option value="services">Services</option>
                      <option value="supplies">Supplies</option>
                      <option value="equipment">Equipment</option>
                      <option value="utilities">Utilities</option>
                      <option value="marketing">Marketing</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.category?.message}</FormMessage>
                </FormItem>
              </FormField>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-5 w-5" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <FormField>
                <FormItem>
                  <FormLabel>Transaction Date *</FormLabel>
                  <FormControl>
                    <Input
                      {...register('transaction_date')}
                      type="date"
                    />
                  </FormControl>
                  <FormMessage>{errors.transaction_date?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel className="flex items-center gap-xs">
                    <CreditCard className="h-4 w-4" />
                    Account *
                  </FormLabel>
                  <FormControl>
                    <Select {...register('account_id')}>
                      <option value="">Select an account</option>
                      {/* This would be populated with actual accounts */}
                      <option value="account-1">Checking Account ****1234</option>
                      <option value="account-2">Savings Account ****5678</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.account_id?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel className="flex items-center gap-xs">
                    <Building className="h-4 w-4" />
                    Project
                  </FormLabel>
                  <FormControl>
                    <Select {...register('project_id')}>
                      <option value="">Select a project (optional)</option>
                      {/* This would be populated with actual projects */}
                      <option value="project-1">Website Redesign</option>
                      <option value="project-2">Mobile App Development</option>
                    </Select>
                  </FormControl>
                  <FormMessage>{errors.project_id?.message}</FormMessage>
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      {...register('reference_number')}
                      placeholder="e.g., INV-2024-001, CHK-123"
                    />
                  </FormControl>
                  <FormMessage>{errors.reference_number?.message}</FormMessage>
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
                  <Textarea
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

        {/* Summary */}
        <Card>
          <CardContent className="pt-lg">
            <div className="flex items-center justify-between p-md bg-gray-50 rounded">
              <span className="font-medium">Transaction Summary:</span>
              <div className="text-right">
                <div className={`font-semibold text-lg ${
                  transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transactionType === 'credit' ? '+' : '-'}${watch('amount')?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">{transactionType === 'credit' ? 'Money In' : 'Money Out'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-md pt-lg border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

'use client';

import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ArrowUpDown, Button, Calendar, Card, CardContent, CardHeader, CardTitle, Checkbox, Drawer, Input as Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Drawer, Input, Label, Select } from '@ghxstship/ui';
import type { Transaction, UpdateTransactionData } from '../types';

interface EditTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  isLoading?: boolean;
  onSubmit: (data: UpdateTransactionData) => Promise<void>;
}

type ReferenceType = 'expense' | 'revenue' | 'invoice' | 'budget' | 'other';

type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
type TransactionType = 'debit' | 'credit';

interface EditTransactionForm {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  account_id?: string;
  reference_id?: string;
  reference_type?: ReferenceType;
  transaction_date: string;
  processed_date?: string;
  payment_method?: string;
  external_reference?: string;
  reconciled: boolean;
  reconciled_date?: string;
  tags?: string;
  notes?: string;
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};

const serializeTags = (tags?: string[]) => (tags?.length ? tags.join(', ') : '');

const parseTags = (value?: string) => {
  if (!value) return undefined;
  const parsed = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return parsed.length ? parsed : undefined;
};

export default function EditTransactionDrawer({
  isOpen,
  onClose,
  transaction,
  isLoading = false,
  onSubmit
}: EditTransactionDrawerProps) {
  const defaultValues = useMemo<EditTransactionForm>(() => ({
    title: transaction.title ?? '',
    description: transaction.description ?? '',
    amount: transaction.amount ?? 0,
    currency: transaction.currency ?? 'USD',
    type: transaction.type,
    category: transaction.category ?? 'general',
    status: transaction.status,
    account_id: transaction.account_id ?? undefined,
    reference_id: transaction.reference_id ?? undefined,
    reference_type: transaction.reference_type ?? 'other',
    transaction_date: toDateInputValue(transaction.transaction_date) || new Date().toISOString().slice(0, 10),
    processed_date: toDateInputValue(transaction.processed_date) || undefined,
    payment_method: transaction.payment_method ?? undefined,
    external_reference: transaction.external_reference ?? undefined,
    reconciled: Boolean(transaction.reconciled),
    reconciled_date: toDateInputValue(transaction.reconciled_date) || undefined,
    tags: serializeTags(transaction.tags),
    notes: transaction.notes ?? ''
  }), [transaction]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<EditTransactionForm>({
    defaultValues
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, isOpen, reset]);

  const reconciled = watch('reconciled');

  const onFormSubmit = async (values: EditTransactionForm) => {
    const payload: UpdateTransactionData = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      amount: Number.isFinite(values.amount) ? values.amount : 0,
      currency: values.currency,
      type: values.type,
      category: values.category,
      status: values.status,
      account_id: values.account_id?.trim() || undefined,
      reference_id: values.reference_id?.trim() || undefined,
      reference_type: values.reference_type || undefined,
      transaction_date: values.transaction_date,
      processed_date: values.processed_date || undefined,
      payment_method: values.payment_method || undefined,
      external_reference: values.external_reference || undefined,
      reconciled: values.reconciled,
      reconciled_date: values.reconciled ? values.reconciled_date || undefined : undefined,
      tags: parseTags(values.tags),
      notes: values.notes?.trim() || undefined
    };

    await onSubmit(payload);
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      title="Edit Transaction"
      description="Adjust the ledger entry and keep account, status, and references aligned with your finance records."
      width="xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-lg">
        <div className="flex items-start gap-sm rounded-md border border-border bg-muted/40 p-md">
          <ArrowUpDown className="mt-1 h-icon-sm w-icon-sm text-primary" />
          <div>
            <h2 className="text-base font-semibold">Edit Transaction</h2>
            <p className="text-sm text-muted-foreground">
              Adjust the ledger entry and keep account, status, and references aligned with your finance records.
            </p>
          </div>
        </div>

        <div className="space-y-md">
          <Card className="border border-border bg-background shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm text-base">
                <ArrowUpDown className="h-icon-sm w-icon-sm text-primary" />
                <span>Transaction Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid gap-sm">
                <Label htmlFor="transaction-title">Title</Label>
                <Input
                  id="transaction-title"
                  placeholder="Enter transaction title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="grid gap-sm">
                <Label htmlFor="transaction-description">Description</Label>
                <textarea
                  id="transaction-description"
                  rows={3}
                  placeholder="Add context or notes"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="transaction-amount">Amount</Label>
                  <Input
                    id="transaction-amount"
                    type="number"
                    step="0.01"
                    {...register('amount', {
                      valueAsNumber: true,
                      required: 'Amount is required'
                    })}
                  />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="grid gap-sm">
                  <Label htmlFor="transaction-currency">Currency</Label>
                  <Input
                    id="transaction-currency"
                    placeholder="USD"
                    {...register('currency', { required: 'Currency is required' })}
                  />
                  {errors.currency && <p className="text-xs text-destructive">{errors.currency.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="transaction-type">Type</Label>
                  <Controller
                    control={control}
                    name="type"
                    rules={{ required: 'Type is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => field.onChange(value as TransactionType)}>
                        <SelectTrigger id="transaction-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                </div>
                <div className="grid gap-sm">
                  <Label htmlFor="transaction-status">Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => field.onChange(value as TransactionStatus)}>
                        <SelectTrigger id="transaction-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
                </div>
              </div>

              <div className="grid gap-sm">
                <Label htmlFor="transaction-category">Category</Label>
                <Input
                  id="transaction-category"
                  placeholder="finance, payroll, vendor"
                  {...register('category', { required: 'Category is required' })}
                />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="transaction-date">Transaction Date</Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    {...register('transaction_date', { required: 'Transaction date is required' })}
                  />
                  {errors.transaction_date && (
                    <p className="text-xs text-destructive">{errors.transaction_date.message}</p>
                  )}
                </div>
                <div className="grid gap-sm">
                  <Label htmlFor="processed-date">Processed Date</Label>
                  <Input id="processed-date" type="date" {...register('processed_date')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-background shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm text-base">
                <Calendar className="h-icon-sm w-icon-sm text-primary" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Input id="payment-method" placeholder="Wire, ACH, check" {...register('payment_method')} />
                </div>
                <div className="grid gap-sm">
                  <Label htmlFor="account-id">Account ID</Label>
                  <Input id="account-id" placeholder="Optional account reference" {...register('account_id')} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="reference-id">Reference ID</Label>
                  <Input id="reference-id" placeholder="Linked record identifier" {...register('reference_id')} />
                </div>
                <div className="grid gap-sm">
                  <Label htmlFor="reference-type">Reference Type</Label>
                  <Controller
                    control={control}
                    name="reference_type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => field.onChange(value as ReferenceType)}>
                        <SelectTrigger id="reference-type">
                          <SelectValue placeholder="Select reference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-sm">
                <Label htmlFor="external-reference">External Reference</Label>
                <Input id="external-reference" placeholder="Optional external ID" {...register('external_reference')} />
              </div>

              <div className="grid gap-sm">
                <Label htmlFor="transaction-tags">Tags (comma separated)</Label>
                <Input id="transaction-tags" placeholder="finance, operations" {...register('tags')} />
              </div>

              <div className="grid gap-sm">
                <Label htmlFor="transaction-notes">Internal Notes</Label>
                <textarea
                  id="transaction-notes"
                  rows={3}
                  placeholder="Internal context for accounting teams"
                  {...register('notes')}
                />
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="grid gap-sm">
                  <Label htmlFor="reconciled-date">Reconciled Date</Label>
                  <Input
                    id="reconciled-date"
                    type="date"
                    disabled={!reconciled}
                    {...register('reconciled_date')}
                  />
                </div>
                <div className="flex items-center gap-sm md:justify-end md:mt-auto">
                  <Controller
                    control={control}
                    name="reconciled"
                    render={({ field }) => (
                      <Checkbox
                        id="transaction-reconciled"
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      />
                    )}
                  />
                  <Label htmlFor="transaction-reconciled">Reconciled</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-md">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  );
}

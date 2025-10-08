'use client';
import { Button, Card, Drawer, Input, Select } from '@ghxstship/ui';


import { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, ArrowUpDown, Calendar, DollarSign, Building } from 'lucide-react';

interface CreateTransactionClientProps {
  user: User;
  orgId: string;
  accountId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: any) => void;
}

interface TransactionFormData {
  description: string;
  amount: number;
  currency: string;
  kind: 'revenue' | 'expense';
  accountId: string;
  projectId?: string;
  invoiceId?: string;
  referenceNumber: string;
  occurredAt: string;
}

export default function CreateTransactionClient({ 
  user, 
  orgId, 
  accountId,
  isOpen, 
  onClose, 
  onSuccess 
}: CreateTransactionClientProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    currency: 'USD',
    kind: 'expense',
    accountId: accountId || '',
    projectId: '',
    invoiceId: '',
    referenceNumber: '',
    occurredAt: new Date().toISOString().slice(0, 16)
  });

  const supabase = createBrowserClient();

  // Load accounts on open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      const { data } = await supabase
        .from('finance_accounts')
        .select('id, name, kind, currency')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('name');
      
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount === 0 || !formData.accountId) return;

    try {
      setLoading(true);

      const transactionData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        account_id: formData.accountId,
        project_id: formData.projectId || null,
        invoice_id: formData.invoiceId || null,
        description: formData.description.trim(),
        amount: formData.kind === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount),
        currency: formData.currency,
        kind: formData.kind,
        reference_number: formData.referenceNumber || null,
        status: 'completed',
        occurred_at: formData.occurredAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('finance_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      const balanceChange = formData.kind === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
      await supabase.rpc('update_account_balance', {
        account_id: formData.accountId,
        amount_change: balanceChange
      });

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'transaction.created',
        entity_type: 'transaction',
        entity_id: data.id,
        metadata: { description: formData.description, amount: formData.amount, kind: formData.kind }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        description: '',
        amount: 0,
        currency: 'USD',
        kind: 'expense',
        accountId: accountId || '',
        projectId: '',
        invoiceId: '',
        referenceNumber: '',
        occurredAt: new Date().toISOString().slice(0, 16)
      });

    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Transaction"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Transaction Overview */}
        <Card className="p-md bg-accent/10 border-primary/20">
          <div className="flex items-center cluster-sm">
            <ArrowUpDown className="h-icon-lg w-icon-lg color-accent" />
            <div>
              <h3 className="text-heading-4 color-accent-foreground">Transaction Entry</h3>
              <p className="text-body-sm color-accent/80">
                Record financial transactions and update account balances
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Transaction Description *
            </label>
            <Input               value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Payment received from Client ABC, Office rent payment"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Type *
              </label>
              <Select
                value={formData.kind}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, kind: value as 'revenue' | 'expense' }))}
              >
                <option value="revenue">Revenue (Money In)</option>
                <option value="expense">Expense (Money Out)</option>
              </Select>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="number"
                  value={formData.amount || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-2xl"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Account *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
              <Select
                value={formData.accountId}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, accountId: value }))}
              >
                <option value="">Select an account...</option>
                {accounts.map((account: any) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.kind}) - {account.currency}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Reference Number
              </label>
              <Input                 value={formData.referenceNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                placeholder="e.g., Check #1234, Wire #ABC123"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Transaction Date & Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
                <Input                   type="datetime-local"
                  value={formData.occurredAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, occurredAt: e.target.value }))}
                  className="pl-2xl"
                  max={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Project ID
              </label>
              <Input                 value={formData.projectId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="Optional: Link to project"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Invoice ID
              </label>
              <Input                 value={formData.invoiceId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, invoiceId: e.target.value }))}
                placeholder="Optional: Link to invoice"
              />
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        {formData.amount !== 0 && formData.accountId && (
          <Card className="p-md bg-secondary border-border">
            <h4 className="form-label color-foreground mb-sm">Transaction Summary</h4>
            <div className="stack-xs text-body-sm">
              <div className="flex justify-between">
                <span className="color-foreground/70">Type:</span>
                <span className={`form-label capitalize ${formData.kind === 'revenue' ? 'color-success' : 'color-destructive'}`}>
                  {formData.kind} ({formData.kind === 'revenue' ? 'Money In' : 'Money Out'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Amount:</span>
                <span className={`form-label ${formData.kind === 'revenue' ? 'color-success' : 'color-destructive'}`}>
                  {formData.kind === 'revenue' ? '+' : '-'}{formatCurrency(Math.abs(formData.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Account:</span>
                <span className="form-label">
                  {accounts.find(a => a.id === formData.accountId)?.name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="color-foreground/70">Date:</span>
                <span className="form-label">
                  {new Date(formData.occurredAt).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end cluster-sm pt-lg border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.description.trim() || formData.amount === 0 || !formData.accountId}
            className="min-w-component-xl"
          >
            {loading ? (
              <div className="flex items-center cluster-sm">
                <div className="w-icon-xs h-icon-xs border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center cluster-sm">
                <Plus className="h-icon-xs w-icon-xs" />
                <span>Add Transaction</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

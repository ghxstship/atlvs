'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer, Button, Input, Textarea, Select, Card } from '@ghxstship/ui';
import { Plus, Building2, CreditCard, Banknote, Wallet } from 'lucide-react';

interface CreateAccountClientProps {
  user: User;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: any) => void;
}

interface AccountFormData {
  name: string;
  description: string;
  kind: string;
  currency: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

export default function CreateAccountClient({ 
  user, 
  orgId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAccountClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    description: '',
    kind: 'bank',
    currency: 'USD',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);

      const accountData = {
        id: crypto.randomUUID(),
        organization_id: orgId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        kind: formData.kind,
        currency: formData.currency,
        balance: 0,
        status: 'active',
        bank_name: formData.bankName.trim() || null,
        account_number: formData.accountNumber.trim() || null,
        routing_number: formData.routingNumber.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('finance_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert([{
        id: crypto.randomUUID(),
        organization_id: orgId,
        user_id: user.id,
        action: 'account.created',
        entity_type: 'account',
        entity_id: data.id,
        metadata: { accountName: formData.name, kind: formData.kind }
      }]);

      onSuccess?.(data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        kind: 'bank',
        currency: 'USD',
        bankName: '',
        accountNumber: '',
        routingNumber: ''
      });

    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (kind: string) => {
    switch (kind) {
      case 'bank': return <Building2 className="h-6 w-6" />;
      case 'card': return <CreditCard className="h-6 w-6" />;
      case 'cash': return <Banknote className="h-6 w-6" />;
      default: return <Wallet className="h-6 w-6" />;
    }
  };

  const shouldShowBankFields = formData.kind === 'bank';

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Account"
     
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Overview */}
        <Card className="p-4 bg-indigo-50 border-indigo-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-indigo-900">Account Management</h3>
              <p className="text-sm text-indigo-700">
                Add financial accounts to track balances and transactions
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Business Checking, Petty Cash, Corporate Credit Card"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and use of this account..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Type *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50">
                  {getAccountIcon(formData.kind)}
                </div>
                <Select
                  value={formData.kind}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value }))}
                >
                  <option value="bank">Bank Account</option>
                  <option value="card">Credit Card</option>
                  <option value="cash">Cash Account</option>
                  <option value="general">General Account</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Currency
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </Select>
            </div>
          </div>

          {/* Bank-specific fields */}
          {shouldShowBankFields && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-foreground flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Bank Details</span>
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bank Name
                </label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., Chase Bank, Bank of America"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Account Number
                  </label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="****1234"
                    type="password"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Last 4 digits for identification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Routing Number
                  </label>
                  <Input
                    value={formData.routingNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Preview */}
        {formData.name && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h4 className="font-medium text-foreground mb-2">Account Preview</h4>
            <div className="flex items-center space-x-3">
              <div className="text-foreground/70">
                {getAccountIcon(formData.kind)}
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.name}</p>
                <p className="text-sm text-foreground/70 capitalize">
                  {formData.kind.replace('_', ' ')} • {formData.currency}
                </p>
                {formData.bankName && (
                  <p className="text-xs text-foreground/60">{formData.bankName}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
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
            disabled={loading || !formData.name.trim()}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Account</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

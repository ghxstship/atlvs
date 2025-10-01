'use client';


import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Building, CreditCard, Banknote, Wallet } from 'lucide-react';

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
      case 'bank': return <Building className="h-icon-md w-icon-md" />;
      case 'card': return <CreditCard className="h-icon-md w-icon-md" />;
      case 'cash': return <Banknote className="h-icon-md w-icon-md" />;
      default: return <Wallet className="h-icon-md w-icon-md" />;
    }
  };

  const shouldShowBankFields = formData.kind === 'bank';

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Add Account"
     
    >
      <form onSubmit={handleSubmit} className="stack-lg">
        {/* Account Overview */}
        <Card className="p-md bg-accent/5 border-primary/20">
          <div className="flex items-center cluster-sm">
            <Building className="h-icon-lg w-icon-lg color-accent" />
            <div>
              <h3 className="text-heading-4 color-accent">Account Management</h3>
              <p className="text-body-sm color-accent/80">
                Add financial accounts to track balances and transactions
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="stack-md">
          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Account Name *
            </label>
            <UnifiedInput               value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Business Checking, Petty Cash, Corporate Credit Card"
              required
            />
          </div>

          <div>
            <label className="block text-body-sm form-label color-foreground mb-sm">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and use of this account..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-sm">
                Account Type *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-xs/2 transform -translate-y-1/2 color-foreground/50">
                  {getAccountIcon(formData.kind)}
                </div>
                <Select
                  value={formData.kind}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, kind: value }))}
                >
                  <option value="bank">Bank Account</option>
                  <option value="card">Credit Card</option>
                  <option value="cash">Cash Account</option>
                  <option value="general">General Account</option>
                </Select>
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
            <div className="stack-md p-md bg-secondary/50 rounded-lg border">
              <h4 className="form-label color-foreground flex items-center cluster-sm">
                <Building className="h-icon-xs w-icon-xs" />
                <span>Bank Details</span>
              </h4>
              
              <div>
                <label className="block text-body-sm form-label color-foreground mb-sm">
                  Bank Name
                </label>
                <UnifiedInput                   value={formData.bankName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., Chase Bank, Bank of America"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Account Number
                  </label>
                  <UnifiedInput                     value={formData.accountNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="****1234"
                    type="password"
                  />
                  <p className="text-body-sm color-foreground/60 mt-xs">
                    Last 4 digits for identification
                  </p>
                </div>

                <div>
                  <label className="block text-body-sm form-label color-foreground mb-sm">
                    Routing Number
                  </label>
                  <UnifiedInput                     value={formData.routingNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Preview */}
        {formData.name && (
          <Card className="p-md bg-secondary/50">
            <h4 className="form-label color-foreground mb-sm">Account Preview</h4>
            <div className="flex items-center cluster-sm">
              <div className="color-foreground/70">
                {getAccountIcon(formData.kind)}
              </div>
              <div>
                <p className="form-label color-foreground">{formData.name}</p>
                <p className="text-body-sm color-foreground/70 capitalize">
                  {formData.kind.replace('_', ' ')} • {formData.currency}
                </p>
                {formData.bankName && (
                  <p className="text-body-sm color-foreground/60">{formData.bankName}</p>
                )}
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
            disabled={loading || !formData.name.trim()}
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
                <span>Add Account</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

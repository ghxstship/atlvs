'use client';

import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Receipt, Calendar, AlertCircle, CheckCircle, Crown } from "lucide-react";
import { createBrowserClient } from '@ghxstship/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Progress,
  useToast,
  Label
} from '@ghxstship/ui';

interface BillingSettingsProps {
  userId: string;
  orgId: string;
}

interface SubscriptionInfo {
  plan: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  seats: number;
  usedSeats: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'draft';
  date: string;
  dueDate?: string;
  description: string;
}

export default function BillingSettings({ userId, orgId }: BillingSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingStats, setBillingStats] = useState({
    totalSpent: 0,
    nextBillingDate: '',
    paymentStatus: 'current' as 'current' | 'past_due' | 'failed'
  });

  const toast = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        // Load subscription info from organization settings
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('stripe_customer_id, subscription_status, plan_name')
          .eq('id', orgId)
          .single();

        if (orgError) throw orgError;

        // Mock subscription data for now
        setSubscription({
          plan: orgData.plan_name || 'Pro',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 99,
          currency: 'USD',
          interval: 'month',
          seats: 10,
          usedSeats: 7
        });

        // Mock payment methods
        setPaymentMethods([
          {
            id: 'pm_1',
            type: 'card',
            brand: 'visa',
            last4: '4242',
            isDefault: true,
            expiryMonth: 12,
            expiryYear: 2025
          }
        ]);

        // Mock invoices
        setInvoices([
          {
            id: 'inv_1',
            number: 'INV-001',
            amount: 99,
            currency: 'USD',
            status: 'paid',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Monthly subscription - Pro Plan'
          },
          {
            id: 'inv_2',
            number: 'INV-002',
            amount: 99,
            currency: 'USD',
            status: 'paid',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Monthly subscription - Pro Plan'
          }
        ]);

        setBillingStats({
          totalSpent: 198,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentStatus: 'current'
        });

      } catch (error) {
        console.error('Error loading billing data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load billing information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [orgId, supabase, toast]);

  const handleManageBilling = () => {
    // This would integrate with Stripe Customer Portal
    toast({
      title: 'Redirecting...',
      description: 'Opening billing portal'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading billing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.plan || 'Free'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription ? `$${subscription.amount}/${subscription.interval}` : 'No active subscription'}
            </p>
            {subscription && (
              <Badge className={`mt-2 ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingStats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingStats.nextBillingDate ? new Date(billingStats.nextBillingDate).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatic renewal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Details */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <CreditCard className="h-icon-sm w-icon-sm" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-md">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="text-sm text-muted-foreground">{subscription.plan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Billing Cycle</Label>
                  <p className="text-sm text-muted-foreground capitalize">{subscription.interval}ly</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm text-muted-foreground">
                    ${subscription.amount} {subscription.currency.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-md">
                <div>
                  <Label className="text-sm font-medium">Current Period</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Seats Used</Label>
                  <div className="space-y-xs">
                    <p className="text-sm text-muted-foreground">
                      {subscription.usedSeats} of {subscription.seats} seats
                    </p>
                    <Progress value={(subscription.usedSeats / subscription.seats) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-sm">
              <Button onClick={handleManageBilling}>
                <CreditCard className="h-icon-xs w-icon-xs mr-2" />
                Manage Billing
              </Button>
              <Button variant="outline">
                Change Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <CreditCard className="h-icon-sm w-icon-sm" />
              Payment Methods
            </div>
            <Button size="sm">
              Add Payment Method
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-xl">
              <CreditCard className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No payment methods added</p>
              <Button className="mt-4" size="sm">
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-md">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-md border rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className="p-xs bg-muted rounded">
                      <CreditCard className="h-icon-xs w-icon-xs" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.brand ? method.brand.toUpperCase() : 'Bank'} •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-xs">
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Receipt className="h-icon-sm w-icon-sm" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-xl">
              <Receipt className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No billing history available</p>
            </div>
          ) : (
            <div className="space-y-md">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-md border rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className={`p-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-icon-xs w-icon-xs text-green-600 dark:text-green-400" />
                      ) : (
                        <Receipt className="h-icon-xs w-icon-xs text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Alerts */}
      {billingStats.paymentStatus === 'past_due' && (
        <Alert>
          <AlertCircle className="h-icon-xs w-icon-xs" />
          <AlertDescription>
            Your payment is past due. Please update your payment method to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Button variant="outline" className="justify-start">
              <Receipt className="h-icon-xs w-icon-xs mr-2" />
              Download Invoices
            </Button>
            <Button variant="outline" className="justify-start">
              <CreditCard className="h-icon-xs w-icon-xs mr-2" />
              Update Payment Method
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-icon-xs w-icon-xs mr-2" />
              View Billing Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

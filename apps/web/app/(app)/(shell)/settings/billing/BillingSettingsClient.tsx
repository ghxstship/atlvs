'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
 Card,
 Badge,
 Button,
 Input,
 Textarea,
 Loader,
 Label,
 useToastContext,
} from '@ghxstship/ui';
import {
 fetchBillingSettings,
 updateBillingSettings,
 type BillingSettingsResponse,
} from '@/lib/services/settingsBillingClient';
import BillingPortalClient from './BillingPortalClient';
import Plans from './Plans';

interface FormState {
 billingEmail: string;
 billingAddress: string;
 paymentMethod: string;
 invoiceSettings: string;
}

const emptyForm: FormState = {
 billingEmail: '',
 billingAddress: '{\n "line1": "",\n "city": "",\n "state": "",\n "postal_code": "",\n "country": ""\n}',
 paymentMethod: '{\n "type": "",\n "details": {}\n}',
 invoiceSettings: '{\n "collection_method": "charge_automatically"\n}',
};

function safeStringify(value: unknown) {
 try {
 return JSON.stringify(value ?? {}, null, 2);
 } catch {
 return JSON.stringify({}, null, 2);
 }
}

export default function BillingSettingsClient() {
 const { toast } = useToastContext();
 const [data, setData] = useState<BillingSettingsResponse | null>(null);
 const [form, setForm] = useState<FormState>(emptyForm);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 const load = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetchBillingSettings();
 setData(response);
 const billing = response.billingSettings;
 setForm({
 billingEmail: billing?.billingEmail ?? '',
 billingAddress: safeStringify(billing?.billingAddress ?? {}),
 paymentMethod: safeStringify(billing?.paymentMethod ?? {}),
 invoiceSettings: safeStringify(billing?.invoiceSettings ?? {}),
 });
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to load billing settings';
 toast.error('Failed to load billing settings', undefined, { description: message });
 } finally {
 setLoading(false);
 }
 }, [toast]);

 useEffect(() => {
 void load();
 }, [load]);

 const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
 setForm((prev: unknown) => ({ ...prev, [key]: value }));
 };

 const handleSubmit = async () => {
 try {
 setSaving(true);
 const updates = {
 billingEmail: form.billingEmail.trim() || undefined,
 billingAddress: form.billingAddress.trim() ? JSON.parse(form.billingAddress) : undefined,
 paymentMethod: form.paymentMethod.trim() ? JSON.parse(form.paymentMethod) : undefined,
 invoiceSettings: form.invoiceSettings.trim() ? JSON.parse(form.invoiceSettings) : undefined,
 };

 const response = await updateBillingSettings(updates);
 setData(response);
 toast.success('Billing settings updated');
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to update billing settings';
 toast.error('Update failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const subscriptionBadgeVariant = useMemo(() => {
 const status = data?.subscription?.status;
 if (!status) return 'secondary' as const;
 if (status === 'active') return 'success' as const;
 if (status === 'trialing') return 'info' as const;
 if (status === 'past_due' || status === 'unpaid') return 'warning' as const;
 if (status === 'canceled' || status === 'incomplete_expired') return 'destructive' as const;
 return 'secondary' as const;
 }, [data?.subscription?.status]);

 if (loading) {
 return (
 <div className="flex h-container-sm items-center justify-center">
 <Loader className="h-icon-lg w-icon-lg animate-spin" />
 </div>
 );
 }

 if (!data) {
 return (
 <div className="stack-md">
 <Card>
 <div className="p-md text-body-sm color-foreground/70">
 Unable to load billing settings. Please try again later.
 </div>
 </Card>
 </div>
 );
 }

 const { billingSettings, subscription, seatUsage, stripe, organization } = data;

 return (
 <div className="stack-lg">
 <Card title="Subscription">
 <div className="p-md space-y-lg">
 <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div className="space-y-xs">
 <div className="flex items-center gap-sm">
 <h2 className="text-heading-4">Current Plan</h2>
 <Badge variant={subscriptionBadgeVariant}>
 {subscription?.status ? subscription.status.replaceAll('_', ' ') : 'Not Subscribed'}
 </Badge>
 </div>
 <p className="text-body-sm color-foreground/70">
 {billingSettings?.planName ?? 'No plan assigned.'}
 </p>
 {subscription?.currentPeriodEnd && (
 <p className="text-body-xs color-foreground/60">
 Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
 </p>
 )}
 </div>
 <div className="flex flex-col gap-xs text-right text-body-sm color-foreground/70">
 <span>Seats configured: {seatUsage.configuredSeats ?? '—'}</span>
 <span>Seats in use: {seatUsage.usedSeats}</span>
 </div>
 </div>

 <BillingPortalClient
 defaultOrganizationId={organization?.id ?? null}
 defaultPriceId={subscription?.priceId ?? billingSettings?.planId ?? null}
 />

 <div className="stack-sm">
 <Plans organizationId={organization?.id ?? null} defaultPriceId={subscription?.priceId ?? null} />
 </div>
 </div>
 </Card>

 <Card title="Billing Profile">
 <div className="p-md space-y-md">
 <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
 <div className="stack-sm">
 <Label htmlFor="billing-email">Billing Email</Label>
 <Input
 
 value={form.billingEmail}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 handleChange('billingEmail', event.target.value)
 }
 placeholder="billing@company.com"
 />
 </div>
 <div className="stack-sm">
 <Label>Seat Usage</Label>
 <div className="rounded-lg border p-md text-body-sm color-foreground/70">
 <div>Configured seats: {seatUsage.configuredSeats ?? 'Unlimited'}</div>
 <div>Active members: {seatUsage.usedSeats}</div>
 <div className="color-foreground/60">
 Adjust seats in your Stripe subscription if limits need to change.
 </div>
 </div>
 </div>
 </div>

 <div className="stack-sm">
 <Label htmlFor="billing-address">Billing Address (JSON)</Label>
 <Textarea
 
 rows={6}
 value={form.billingAddress}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
 handleChange('billingAddress', event.target.value)
 }
 />
 </div>

 <div className="stack-sm">
 <Label htmlFor="payment-method">Payment Method Metadata (JSON)</Label>
 <Textarea
 
 rows={4}
 value={form.paymentMethod}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
 handleChange('paymentMethod', event.target.value)
 }
 />
 </div>

 <div className="stack-sm">
 <Label htmlFor="invoice-settings">Invoice Settings (JSON)</Label>
 <Textarea
 
 rows={4}
 value={form.invoiceSettings}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
 handleChange('invoiceSettings', event.target.value)
 }
 />
 </div>

 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => void load()} disabled={saving}>
 Refresh
 </Button>
 <Button onClick={handleSubmit} disabled={saving}>
 {saving ? 'Saving…' : 'Save Changes'}
 </Button>
 </div>
 </div>
 </Card>

 <Card title="Stripe Status">
 <div className="p-md space-y-sm text-body-sm color-foreground/70">
 <div className="flex items-center gap-sm">
 <Badge variant={stripe.configured ? 'success' : 'secondary'}>
 {stripe.configured ? 'Connected' : 'Not Connected'}
 </Badge>
 <span>
 {stripe.configured
 ? 'Stripe integration is active for this organization.'
 : 'Stripe integration is not configured for this organization.'}
 </span>
 </div>
 {organization && (
 <div className="space-y-xs">
 <div>Organization: {organization.name ?? organization.id}</div>
 <div>Stripe Customer ID: {organization.stripeCustomerId ?? '—'}</div>
 </div>
 )}
 </div>
 </Card>
 </div>
 );
}

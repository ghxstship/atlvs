'use client';

import { DollarSign, CreditCard, Shield, Clock, CheckCircle, AlertCircle, Download, Filter, Search, Plus, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card,
 Button,
 Badge,
 Input,
 Select
} from '@ghxstship/ui';

interface PaymentsClientProps {
 orgId: string;
 userId: string;
}

interface Payment {
 id: string;
 type: 'incoming' | 'outgoing' | 'escrow' | 'refund';
 amount: number;
 currency: string;
 status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
 description: string;
 counterparty: string;
 project_title?: string;
 created_at: string;
 completed_at?: string;
 fee_amount?: number;
 net_amount?: number;
}

interface PaymentMethod {
 id: string;
 type: 'card' | 'bank' | 'paypal' | 'crypto';
 last_four?: string;
 brand?: string;
 bank_name?: string;
 is_default: boolean;
 status: 'active' | 'expired' | 'pending';
}

export default function PaymentsClient({ orgId, userId }: PaymentsClientProps) {
 const [payments, setPayments] = useState<Payment[]>([]);
 const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'escrow'>('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [stats, setStats] = useState({
 totalEarnings: 0,
 totalSpent: 0,
 escrowBalance: 0,
 pendingPayments: 0
 });

 useEffect(() => {
 loadPayments();
 loadPaymentMethods();
 }, [orgId]);

 const loadPayments = async () => {
 try {
 setLoading(true);
 
 // Mock payment data - would integrate with Stripe/payment processor
 const mockPayments: Payment[] = [
 {
 id: '1',
 type: 'incoming',
 amount: 2500.00,
 currency: 'USD',
 status: 'completed',
 description: 'Payment for LED Wall System rental',
 counterparty: 'TechCorp Solutions',
 project_title: 'Music Festival 2024',
 created_at: '2024-01-15T10:00:00Z',
 completed_at: '2024-01-15T10:05:00Z',
 fee_amount: 75.00,
 net_amount: 2425.00
 },
 {
 id: '2',
 type: 'outgoing',
 amount: 1200.00,
 currency: 'USD',
 status: 'processing',
 description: 'Payment to AudioPro Services',
 counterparty: 'AudioPro Services',
 project_title: 'Corporate Event Sound',
 created_at: '2024-01-14T15:30:00Z',
 fee_amount: 36.00,
 net_amount: 1164.00
 },
 {
 id: '3',
 type: 'escrow',
 amount: 5000.00,
 currency: 'USD',
 status: 'pending',
 description: 'Escrow for Lighting Design Contract',
 counterparty: 'LightMaster Inc',
 project_title: 'Concert Series Lighting',
 created_at: '2024-01-13T09:15:00Z',
 fee_amount: 150.00,
 net_amount: 4850.00
 }
 ];

 setPayments(mockPayments);

 // Calculate stats
 const earnings = mockPayments
 .filter(p => p.type === 'incoming' && p.status === 'completed')
 .reduce((sum, p) => sum + (p.net_amount || p.amount), 0);
 
 const spent = mockPayments
 .filter(p => p.type === 'outgoing' && p.status === 'completed')
 .reduce((sum, p) => sum + p.amount, 0);
 
 const escrow = mockPayments
 .filter(p => p.type === 'escrow' && p.status === 'pending')
 .reduce((sum, p) => sum + p.amount, 0);
 
 const pending = mockPayments
 .filter(p => p.status === 'pending' || p.status === 'processing')
 .length;

 setStats({
 totalEarnings: earnings,
 totalSpent: spent,
 escrowBalance: escrow,
 pendingPayments: pending
 });
 } catch (error) {
 console.error('Error loading payments:', error);
 } finally {
 setLoading(false);
 }
 };

 const loadPaymentMethods = async () => {
 try {
 // Mock payment methods
 const mockMethods: PaymentMethod[] = [
 {
 id: '1',
 type: 'card',
 last_four: '4242',
 brand: 'Visa',
 is_default: true,
 status: 'active'
 },
 {
 id: '2',
 type: 'bank',
 bank_name: 'Chase Bank',
 last_four: '1234',
 is_default: false,
 status: 'active'
 }
 ];

 setPaymentMethods(mockMethods);
 } catch (error) {
 console.error('Error loading payment methods:', error);
 }
 };

 const filteredPayments = payments.filter(payment => {
 const matchesFilter = filter === 'all' || payment.type === filter;
 const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 payment.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesFilter && matchesSearch;
 });

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'completed': return CheckCircle;
 case 'processing': return Clock;
 case 'pending': return Clock;
 case 'failed': return AlertCircle;
 case 'cancelled': return AlertCircle;
 default: return Clock;
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'completed': return 'success';
 case 'processing': return 'warning';
 case 'pending': return 'secondary';
 case 'failed': return 'destructive';
 case 'cancelled': return 'destructive';
 default: return 'secondary';
 }
 };

 const getTypeIcon = (type: string) => {
 switch (type) {
 case 'incoming': return ArrowDownLeft;
 case 'outgoing': return ArrowUpRight;
 case 'escrow': return Shield;
 case 'refund': return ArrowDownLeft;
 default: return DollarSign;
 }
 };

 const formatAmount = (amount: number, currency: string) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(amount);
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Payments & Escrow</h1>
 <p className="color-muted">Manage payments and escrow transactions</p>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline">
 <CreditCard className="h-icon-xs w-icon-xs mr-sm" />
 Payment Methods
 </Button>
 <Button>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Request Payment
 </Button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Earnings</p>
 <p className="text-heading-3 font-bold color-success">
 {formatAmount(stats.totalEarnings, 'USD')}
 </p>
 </div>
 <ArrowDownLeft className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Spent</p>
 <p className="text-heading-3 font-bold color-destructive">
 {formatAmount(stats.totalSpent, 'USD')}
 </p>
 </div>
 <ArrowUpRight className="h-icon-lg w-icon-lg color-destructive" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Escrow Balance</p>
 <p className="text-heading-3 font-bold color-warning">
 {formatAmount(stats.escrowBalance, 'USD')}
 </p>
 </div>
 <Shield className="h-icon-lg w-icon-lg color-warning" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Pending</p>
 <p className="text-heading-3 font-bold">{stats.pendingPayments}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg color-secondary" />
 </div>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 {/* Payment History */}
 <div className="lg:col-span-2">
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">Payment History</h3>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm">
 <Download className="h-icon-xs w-icon-xs mr-xs" />
 Export
 </Button>
 <Button variant="outline" size="sm">
 <Filter className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 <div className="flex items-center gap-sm mb-md">
 <Input
 placeholder="Search payments..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="flex-1"
 />
 <Select value={filter} onValueChange={(value: unknown) => setFilter(value)}>
 <option value="all">All Types</option>
 <option value="incoming">Incoming</option>
 <option value="outgoing">Outgoing</option>
 <option value="escrow">Escrow</option>
 </Select>
 </div>

 <div className="stack-xs">
 {filteredPayments.map((payment) => {
 const StatusIcon = getStatusIcon(payment.status);
 const TypeIcon = getTypeIcon(payment.type);
 const statusColor = getStatusColor(payment.status);

 return (
 <div key={payment.id} className="flex items-center justify-between p-sm border rounded hover:bg-muted transition-colors">
 <div className="flex items-center gap-sm">
 <div className="flex items-center justify-center h-icon-xl w-icon-xl bg-primary/10 rounded">
 <TypeIcon className="h-icon-sm w-icon-sm color-primary" />
 </div>
 <div>
 <div className="flex items-center gap-sm mb-xs">
 <h4 className="text-body font-medium">{payment.description}</h4>
 <Badge variant={statusColor as unknown} size="sm">
 {payment.status}
 </Badge>
 </div>
 <p className="text-body-sm color-muted">{payment.counterparty}</p>
 {payment.project_title && (
 <p className="text-body-sm color-muted">Project: {payment.project_title}</p>
 )}
 </div>
 </div>
 <div className="text-right">
 <div className={`text-body font-medium ${
 payment.type === 'incoming' ? 'color-success' : 
 payment.type === 'outgoing' ? 'color-destructive' : 
 'color-warning'
 }`}>
 {payment.type === 'incoming' ? '+' : payment.type === 'outgoing' ? '-' : ''}
 {formatAmount(payment.amount, payment.currency)}
 </div>
 {payment.fee_amount && (
 <p className="text-body-sm color-muted">
 Fee: {formatAmount(payment.fee_amount, payment.currency)}
 </p>
 )}
 <p className="text-body-sm color-muted">
 {new Date(payment.created_at).toLocaleDateString()}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Payment Methods & Quick Actions */}
 <div className="stack-md">
 {/* Payment Methods */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">Payment Methods</h3>
 <Button variant="outline" size="sm">
 <Plus className="h-icon-xs w-icon-xs mr-xs" />
 Add
 </Button>
 </div>

 <div className="stack-xs">
 {paymentMethods.map((method) => (
 <div key={method.id} className="flex items-center justify-between p-sm border rounded">
 <div className="flex items-center gap-sm">
 <div className="flex items-center justify-center h-icon-lg w-icon-lg bg-primary/10 rounded">
 {method.type === 'card' ? (
 <CreditCard className="h-icon-xs w-icon-xs color-primary" />
 ) : (
 <Wallet className="h-icon-xs w-icon-xs color-primary" />
 )}
 </div>
 <div>
 <p className="text-body-sm font-medium">
 {method.type === 'card' ? method.brand : method.bank_name}
 </p>
 <p className="text-body-sm color-muted">
 ****{method.last_four}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-xs">
 {method.is_default && (
 <Badge variant="secondary" size="sm">Default</Badge>
 )}
 <Badge 
 variant={method.status === 'active' ? 'success' : 'secondary'} 
 size="sm"
 >
 {method.status}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Quick Actions */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Quick Actions</h3>
 <div className="stack-xs">
 <Button variant="outline" className="w-full justify-start">
 <DollarSign className="h-icon-xs w-icon-xs mr-sm" />
 Request Payment
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <Shield className="h-icon-xs w-icon-xs mr-sm" />
 Create Escrow
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <Download className="h-icon-xs w-icon-xs mr-sm" />
 Download Statement
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <CreditCard className="h-icon-xs w-icon-xs mr-sm" />
 Manage Methods
 </Button>
 </div>
 </Card>

 {/* Security Notice */}
 <Card className="p-md bg-muted/50">
 <div className="flex items-start gap-sm">
 <Shield className="h-icon-sm w-icon-sm color-success mt-xs" />
 <div>
 <h4 className="text-body font-medium mb-xs">Secure Payments</h4>
 <p className="text-body-sm color-muted">
 All payments are processed securely through our encrypted payment system. 
 Escrow protection ensures safe transactions for both parties.
 </p>
 </div>
 </div>
 </Card>
 </div>
 </div>
 </div>
 );
}

import { Building, CreditCard, DollarSign, Minus, TrendingUp } from 'lucide-react';
/**
 * Accounts Grid View Component
 * Specialized grid view for GL Accounts with accounting-specific features
 */

'use client';

import React from 'react';
import { Badge, DataGrid } from '@ghxstship/ui';
import type { GLAccount, AccountType } from '../types';

interface AccountsGridViewProps {
 accounts: GLAccount[];
 onRowAction: (action: string, account: GLAccount) => void;
 loading?: boolean;
}

export default function AccountsGridView({ 
 accounts, 
 onRowAction, 
 loading = false 
}: AccountsGridViewProps) {
 
 const getAccountTypeIcon = (type: AccountType) => {
 const icons = {
 asset: <Building className="h-icon-xs w-icon-xs text-blue-600" />,
 liability: <CreditCard className="h-icon-xs w-icon-xs text-red-600" />,
 equity: <TrendingUp className="h-icon-xs w-icon-xs text-green-600" />,
 revenue: <DollarSign className="h-icon-xs w-icon-xs text-emerald-600" />,
 expense: <Minus className="h-icon-xs w-icon-xs text-orange-600" />
 };
 return icons[type];
 };

 const getAccountTypeColor = (type: AccountType) => {
 const colors = {
 asset: 'bg-blue-100 text-blue-800',
 liability: 'bg-red-100 text-red-800',
 equity: 'bg-green-100 text-green-800',
 revenue: 'bg-emerald-100 text-emerald-800',
 expense: 'bg-orange-100 text-orange-800'
 };
 return colors[type];
 };

 const formatCurrency = (amount: number, currency = 'USD') => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(amount);
 };

 const columns = [
 {
 key: 'account_number',
 header: 'Account #',
 sortable: true,
 width: '120px',
 render: (account: GLAccount) => (
 <div className="font-mono text-sm font-medium">
 {account.account_number}
 </div>
 )
 },
 {
 key: 'name',
 header: 'Account Name',
 sortable: true,
 render: (account: GLAccount) => (
 <div>
 <div className="font-medium">{account.name}</div>
 {account.description && (
 <div className="text-sm text-gray-500 truncate">
 {account.description}
 </div>
 )}
 </div>
 )
 },
 {
 key: 'type',
 header: 'Type',
 sortable: true,
 width: '140px',
 render: (account: GLAccount) => (
 <div className="flex items-center gap-xs">
 {getAccountTypeIcon(account.type)}
 <Badge className={getAccountTypeColor(account.type)}>
 {account.type}
 </Badge>
 </div>
 )
 },
 {
 key: 'subtype',
 header: 'Subtype',
 sortable: true,
 width: '160px',
 render: (account: GLAccount) => (
 <div className="text-sm">
 {account.subtype ? (
 <span className="px-xs py-xs bg-gray-100 rounded text-gray-700">
 {account.subtype.replace(/_/g, ' ')}
 </span>
 ) : (
 <span className="text-gray-400">—</span>
 )}
 </div>
 )
 },
 {
 key: 'normal_balance',
 header: 'Normal Balance',
 sortable: true,
 width: '120px',
 render: (account: GLAccount) => (
 <Badge className={
 account.normal_balance === 'debit' 
 ? 'bg-blue-100 text-blue-800' 
 : 'bg-green-100 text-green-800'
 }>
 {account.normal_balance}
 </Badge>
 )
 },
 {
 key: 'balance',
 header: 'Balance',
 sortable: true,
 width: '140px',
 align: 'right' as const,
 render: (account: GLAccount) => (
 <div className={`font-mono text-sm font-medium ${
 account.balance >= 0 ? 'text-green-600' : 'text-red-600'
 }`}>
 {formatCurrency(account.balance, account.currency)}
 </div>
 )
 },
 {
 key: 'currency',
 header: 'Currency',
 sortable: true,
 width: '80px',
 render: (account: GLAccount) => (
 <span className="font-mono text-sm">{account.currency}</span>
 )
 },
 {
 key: 'is_active',
 header: 'Status',
 sortable: true,
 width: '100px',
 render: (account: GLAccount) => (
 <Badge className={
 account.is_active 
 ? 'bg-green-100 text-green-800' 
 : 'bg-gray-100 text-gray-800'
 }>
 {account.is_active ? 'Active' : 'Inactive'}
 </Badge>
 )
 }
 ];

 const actions = [
 {
 key: 'view',
 label: 'View Details',
 icon: 'Eye'
 },
 {
 key: 'edit',
 label: 'Edit Account',
 icon: 'Edit'
 },
 {
 key: 'transactions',
 label: 'View Transactions',
 icon: 'List'
 },
 {
 key: 'balance',
 label: 'Update Balance',
 icon: 'Calculator'
 },
 {
 key: 'delete',
 label: 'Delete Account',
 icon: 'Trash2',
 variant: 'destructive' as const
 }
 ];

 return (
 <div className="w-full">
 <DataGrid
 data={accounts}
 columns={columns}
 actions={actions}
 onRowAction={onRowAction}
 loading={loading}
 emptyState={{
 title: 'No accounts found',
 description: 'Get started by creating your first GL account.',
 action: {
 label: 'Create Account',
 onClick: () => onRowAction('create', {} as GLAccount)
 }
 }}
 pagination={{
 pageSize: 25,
 showSizeSelector: true
 }}
 selection={{
 enabled: true,
 onSelectionChange: (selected) => {
 }
 }}
 search={{
 enabled: true,
 placeholder: 'Search accounts...',
 fields: ['name', 'account_number', 'description']
 }}
 filters={[
 {
 key: 'type',
 label: 'Account Type',
 type: 'select',
 options: [
 { value: 'asset', label: 'Asset' },
 { value: 'liability', label: 'Liability' },
 { value: 'equity', label: 'Equity' },
 { value: 'revenue', label: 'Revenue' },
 { value: 'expense', label: 'Expense' }
 ]
 },
 {
 key: 'is_active',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'true', label: 'Active' },
 { value: 'false', label: 'Inactive' }
 ]
 }
 ]}
 groupBy={{
 enabled: true,
 field: 'type',
 label: 'Group by Account Type'
 }}
 export={{
 enabled: true,
 filename: 'chart-of-accounts',
 formats: ['csv', 'json', 'xlsx']
 }}
 />
 </div>
 );
}

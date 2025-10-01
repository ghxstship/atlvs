import { Building, CreditCard, TrendingUp, DollarSign, Minus, Save, X } from "lucide-react";
/**
 * Create Account Drawer Component
 * Specialized drawer for creating/editing GL Accounts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerDescription,
 DrawerFooter,
 Button,
 UnifiedInput,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Textarea,
 Switch,
 Badge,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger
} from '@ghxstship/ui';
import type { GLAccount, AccountType, AccountFormData } from '../types';
import { accountsService } from '../lib/accountsService';

interface CreateAccountDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
 editAccount?: GLAccount | null;
 orgId: string;
}

export default function CreateAccountDrawer({
 isOpen,
 onClose,
 onSuccess,
 editAccount,
 orgId
}: CreateAccountDrawerProps) {
 const [loading, setLoading] = useState(false);
 const [parentAccounts, setParentAccounts] = useState<GLAccount[]>([]);
 const [formData, setFormData] = useState<AccountFormData>({
 account_number: '',
 name: '',
 description: '',
 type: 'asset',
 subtype: '',
 parent_account_id: '',
 is_active: true,
 currency: 'USD',
 opening_balance: 0,
 notes: ''
 });

 const [errors, setErrors] = useState<Record<string, string>({});

 useEffect(() => {
 if (editAccount) {
 setFormData({
 account_number: editAccount.account_number,
 name: editAccount.name,
 description: editAccount.description || '',
 type: editAccount.type,
 subtype: editAccount.subtype || '',
 parent_account_id: editAccount.parent_account_id || '',
 is_active: editAccount.is_active,
 currency: editAccount.currency,
 opening_balance: editAccount.balance,
 notes: ''
 });
 } else {
 // Reset form for new account
 setFormData({
 account_number: '',
 name: '',
 description: '',
 type: 'asset',
 subtype: '',
 parent_account_id: '',
 is_active: true,
 currency: 'USD',
 opening_balance: 0,
 notes: ''
 });
 }
 setErrors({});
 }, [editAccount, isOpen]);

 useEffect(() => {
 if (formData.type && isOpen) {
 loadParentAccounts();
 }
 }, [formData.type, isOpen]);

 const loadParentAccounts = async () => {
 try {
 const accounts = await accountsService.getParentAccounts(orgId, formData.type);
 setParentAccounts(accounts);
 } catch (error) {
 console.error('Error loading parent accounts:', error);
 }
 };

 const getAccountTypeIcon = (type: AccountType) => {
 const icons = {
 asset: <Building className="h-icon-xs w-icon-xs" />,
 liability: <CreditCard className="h-icon-xs w-icon-xs" />,
 equity: <TrendingUp className="h-icon-xs w-icon-xs" />,
 revenue: <DollarSign className="h-icon-xs w-icon-xs" />,
 expense: <Minus className="h-icon-xs w-icon-xs" />
 };
 return icons[type];
 };

 const getSubtypeOptions = (type: AccountType) => {
 const subtypes = {
 asset: [
 { value: 'current_assets', label: 'Current Assets' },
 { value: 'fixed_assets', label: 'Fixed Assets' },
 { value: 'intangible_assets', label: 'Intangible Assets' },
 { value: 'investments', label: 'Investments' },
 { value: 'other_assets', label: 'Other Assets' }
 ],
 liability: [
 { value: 'current_liabilities', label: 'Current Liabilities' },
 { value: 'long_term_liabilities', label: 'Long-term Liabilities' },
 { value: 'other_liabilities', label: 'Other Liabilities' }
 ],
 equity: [
 { value: 'owners_equity', label: 'Owner\'s Equity' },
 { value: 'retained_earnings', label: 'Retained Earnings' },
 { value: 'capital_stock', label: 'Capital Stock' },
 { value: 'other_equity', label: 'Other Equity' }
 ],
 revenue: [
 { value: 'operating_revenue', label: 'Operating Revenue' },
 { value: 'non_operating_revenue', label: 'Non-operating Revenue' },
 { value: 'other_income', label: 'Other Income' }
 ],
 expense: [
 { value: 'operating_expenses', label: 'Operating Expenses' },
 { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold' },
 { value: 'administrative_expenses', label: 'Administrative Expenses' },
 { value: 'other_expenses', label: 'Other Expenses' }
 ]
 };
 return subtypes[type] || [];
 };

 const validateForm = (): boolean => {
 const newErrors: Record<string, string> = {};

 if (!formData.account_number.trim()) {
 newErrors.account_number = 'Account number is required';
 }

 if (!formData.name.trim()) {
 newErrors.name = 'Account name is required';
 }

 if (!formData.type) {
 newErrors.type = 'Account type is required';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 const accountData = {
 accountNumber: formData.account_number,
 name: formData.name,
 description: formData.description,
 type: formData.type,
 subtype: formData.subtype,
 parentAccountId: formData.parent_account_id || undefined,
 isActive: formData.is_active,
 currency: formData.currency,
 openingBalance: formData.opening_balance || 0
 };

 if (editAccount) {
 await accountsService.updateAccount({
 id: editAccount.id,
 ...accountData
 });
 } else {
 await accountsService.createAccount(accountData);
 }

 onSuccess();
 onClose();
 } catch (error) {
 console.error('Error saving account:', error);
 setErrors({ submit: 'Failed to save account. Please try again.' });
 } finally {
 setLoading(false);
 }
 };

 const handleInputChange = (field: keyof AccountFormData, value: unknown) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) {
 setErrors(prev => ({ ...prev, [field]: '' }));
 }
 };

 const normalBalance = formData.type === 'asset' || formData.type === 'expense' ? 'debit' : 'credit';

 return (
 <Drawer open={isOpen} onClose={() => onClose(false)}>
 <DrawerContent className="max-w-2xl mx-auto">
 <DrawerHeader>
 <DrawerTitle className="flex items-center gap-xs">
 {getAccountTypeIcon(formData.type)}
 {editAccount ? 'Edit Account' : 'Create New Account'}
 </DrawerTitle>
 <DrawerDescription>
 {editAccount 
 ? 'Update the account information below.'
 : 'Create a new GL account for your chart of accounts.'
 }
 </DrawerDescription>
 </DrawerHeader>

 <div className="px-lg py-md">
 <Tabs defaultValue="basic" className="w-full">
 <TabsList className="grid w-full grid-cols-2">
 <TabsTrigger value="basic">Basic Information</TabsTrigger>
 <TabsTrigger value="details">Account Details</TabsTrigger>
 </TabsList>

 <TabsContent value="basic" className="space-y-md mt-6">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Account Number *
 </label>
 <UnifiedInput
 value={formData.account_number}
 onChange={(e) => handleInputChange('account_number', e.target.value)}
 placeholder="e.g., 1000"
 error={errors.account_number}
 />
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Account Type *
 </label>
 <Select 
 value={formData.type} 
 onValueChange={(value) => handleInputChange('type', value as AccountType)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="asset">
 <div className="flex items-center gap-xs">
 <Building className="h-icon-xs w-icon-xs" />
 Asset
 </div>
 </SelectItem>
 <SelectItem value="liability">
 <div className="flex items-center gap-xs">
 <CreditCard className="h-icon-xs w-icon-xs" />
 Liability
 </div>
 </SelectItem>
 <SelectItem value="equity">
 <div className="flex items-center gap-xs">
 <TrendingUp className="h-icon-xs w-icon-xs" />
 Equity
 </div>
 </SelectItem>
 <SelectItem value="revenue">
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Revenue
 </div>
 </SelectItem>
 <SelectItem value="expense">
 <div className="flex items-center gap-xs">
 <Minus className="h-icon-xs w-icon-xs" />
 Expense
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Account Name *
 </label>
 <UnifiedInput
 value={formData.name}
 onChange={(e) => handleInputChange('name', e.target.value)}
 placeholder="e.g., Cash and Cash Equivalents"
 error={errors.name}
 />
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Description
 </label>
 <Textarea
 value={formData.description}
 onChange={(e) => handleInputChange('description', e.target.value)}
 placeholder="Optional description of the account..."
 rows={3}
 />
 </div>

 <div className="flex items-center justify-between p-md bg-gray-50 rounded-lg">
 <div>
 <div className="font-medium text-gray-900">Normal Balance</div>
 <div className="text-sm text-gray-600">
 This account type has a normal {normalBalance} balance
 </div>
 </div>
 <Badge className={
 normalBalance === 'debit' 
 ? 'bg-blue-100 text-blue-800' 
 : 'bg-green-100 text-green-800'
 }>
 {normalBalance}
 </Badge>
 </div>
 </TabsContent>

 <TabsContent value="details" className="space-y-md mt-6">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Subtype
 </label>
 <Select 
 value={formData.subtype} 
 onValueChange={(value) => handleInputChange('subtype', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select subtype..." />
 </SelectTrigger>
 <SelectContent>
 {getSubtypeOptions(formData.type).map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Parent Account
 </label>
 <Select 
 value={formData.parent_account_id} 
 onValueChange={(value) => handleInputChange('parent_account_id', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select parent account..." />
 </SelectTrigger>
 <SelectContent>
 {parentAccounts.map((account) => (
 <SelectItem key={account.id} value={account.id}>
 {account.account_number} - {account.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Currency
 </label>
 <Select 
 value={formData.currency} 
 onValueChange={(value) => handleInputChange('currency', value)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="USD">USD - US Dollar</SelectItem>
 <SelectItem value="EUR">EUR - Euro</SelectItem>
 <SelectItem value="GBP">GBP - British Pound</SelectItem>
 <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Opening Balance
 </label>
 <UnifiedInput
 type="number"
 step="0.01"
 value={formData.opening_balance?.toString() || '0'}
 onChange={(e) => handleInputChange('opening_balance', parseFloat(e.target.value) || 0)}
 placeholder="0.00"
 />
 </div>
 </div>

 <div className="flex items-center justify-between p-md bg-gray-50 rounded-lg">
 <div>
 <div className="font-medium text-gray-900">Account Status</div>
 <div className="text-sm text-gray-600">
 {formData.is_active ? 'Account is active and available for transactions' : 'Account is inactive'}
 </div>
 </div>
 <Switch
 checked={formData.is_active}
 onCheckedChange={(checked) => handleInputChange('is_active', checked)}
 />
 </div>

 <div>
 <label className="text-sm font-medium text-gray-700 mb-2 block">
 Notes
 </label>
 <Textarea
 value={formData.notes}
 onChange={(e) => handleInputChange('notes', e.target.value)}
 placeholder="Additional notes about this account..."
 rows={3}
 />
 </div>
 </TabsContent>
 </Tabs>

 {errors.submit && (
 <div className="mt-4 p-sm bg-red-50 border border-red-200 rounded-md">
 <p className="text-sm text-red-600">{errors.submit}</p>
 </div>
 )}
 </div>

 <DrawerFooter>
 <div className="flex gap-xs">
 <Button
 onClick={handleSubmit}
 disabled={loading}
 className="flex items-center gap-xs"
 >
 <Save className="h-icon-xs w-icon-xs" />
 {loading ? 'Saving...' : editAccount ? 'Update Account' : 'Create Account'}
 </Button>
 <Button
 variant="outline"
 onClick={onClose}
 disabled={loading}
 className="flex items-center gap-xs"
 >
 <X className="h-icon-xs w-icon-xs" />
 Cancel
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}

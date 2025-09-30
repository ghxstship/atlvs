'use client';

import { Edit, Eye, Search, Settings as SettingsIcon, Lock, Globe } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 CardContent,
 CardHeader,
 Badge,
 Button,
 Input,
 Skeleton,
} from '@ghxstship/ui';
import type { SettingsListViewProps, SettingRecord, SettingCategory, SettingType } from '../types';

export default function SettingsListView({
 settings,
 loading,
 onEdit,
 onView,
}: SettingsListViewProps) {
 const [searchQuery, setSearchQuery] = useState('');

 const filteredSettings = settings.filter(setting =>
 setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 setting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 setting.category.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getCategoryIcon = (category: SettingCategory) => {
 const icons = {
 organization: SettingsIcon,
 security: Lock,
 notifications: SettingsIcon,
 integrations: SettingsIcon,
 billing: SettingsIcon,
 permissions: Lock,
 automations: SettingsIcon,
 compliance: Lock,
 backup: SettingsIcon,
 };
 
 return icons[category] || SettingsIcon;
 };

 const getCategoryColor = (category: SettingCategory) => {
 const colors = {
 organization: 'text-blue-600 bg-blue-100',
 security: 'text-red-600 bg-red-100',
 notifications: 'text-green-600 bg-green-100',
 integrations: 'text-purple-600 bg-purple-100',
 billing: 'text-yellow-600 bg-yellow-100',
 permissions: 'text-red-600 bg-red-100',
 automations: 'text-indigo-600 bg-indigo-100',
 compliance: 'text-gray-600 bg-gray-100',
 backup: 'text-teal-600 bg-teal-100',
 };
 
 return colors[category] || 'text-gray-600 bg-gray-100';
 };

 const formatValue = (value: string, type: SettingType) => {
 if (type === 'boolean') {
 return value === 'true' ? 'Enabled' : 'Disabled';
 }
 
 if (type === 'json' || type === 'array') {
 try {
 const parsed = JSON.parse(value);
 return `${type.toUpperCase()} (${Object.keys(parsed).length} items)`;
 } catch {
 return value.length > 50 ? value.substring(0, 50) + '...' : value;
 }
 }

 return value.length > 100 ? value.substring(0, 100) + '...' : value;
 };

 if (loading) {
 return (
 <div className="space-y-4">
 <Skeleton className="h-10 w-64" />
 <div className="space-y-4">
 {[...Array(6)].map((_, i) => (
 <Skeleton key={i} className="h-32 w-full" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
 <Input
 placeholder="Search settings..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>

 {/* Settings List */}
 <div className="space-y-4">
 {filteredSettings.length === 0 ? (
 <Card>
 <CardContent className="py-12 text-center text-muted-foreground">
 {searchQuery ? 'No settings match your search' : 'No settings found'}
 </CardContent>
 </Card>
 ) : (
 filteredSettings.map((setting) => {
 const CategoryIcon = getCategoryIcon(setting.category);
 const categoryColor = getCategoryColor(setting.category);
 
 return (
 <Card key={setting.id} className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3">
 <div className={`p-2 rounded-lg ${categoryColor}`}>
 <CategoryIcon className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="font-semibold text-lg">{setting.name}</h3>
 <Badge variant="outline" className="text-xs">
 {setting.type}
 </Badge>
 </div>
 {setting.description && (
 <p className="text-muted-foreground text-sm">
 {setting.description}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onView(setting)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(setting)}
 disabled={setting.is_editable === 'false'}
 >
 <Edit className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="space-y-3">
 {/* Category and Status */}
 <div className="flex items-center gap-2 flex-wrap">
 <Badge variant="secondary">
 {setting.category}
 </Badge>
 <div className="flex items-center gap-1">
 {setting.is_public === 'true' ? (
 <Globe className="h-3 w-3 text-green-600" />
 ) : (
 <Lock className="h-3 w-3 text-gray-600" />
 )}
 <span className="text-xs text-muted-foreground">
 {setting.is_public === 'true' ? 'Public' : 'Private'}
 </span>
 </div>
 <Badge 
 variant={setting.is_editable === 'true' ? 'default' : 'outline'}
 className="text-xs"
 >
 {setting.is_editable === 'true' ? 'Editable' : 'Read-only'}
 </Badge>
 </div>

 {/* Value */}
 <div className="space-y-1">
 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
 Current Value
 </label>
 <div className="bg-muted p-3 rounded-md">
 {setting.type === 'json' || setting.type === 'array' ? (
 <pre className="text-sm font-mono whitespace-pre-wrap break-all">
 {formatValue(setting.value, setting.type)}
 </pre>
 ) : (
 <code className="text-sm">
 {formatValue(setting.value, setting.type)}
 </code>
 )}
 </div>
 </div>

 {/* Metadata */}
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
 <span>
 Updated {new Date(setting.updated_at).toLocaleDateString()}
 </span>
 <span>
 ID: {setting.id.substring(0, 8)}...
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 );
 })
 )}
 </div>

 {/* Results Summary */}
 {filteredSettings.length > 0 && (
 <div className="text-sm text-muted-foreground text-center">
 Showing {filteredSettings.length} of {settings.length} settings
 </div>
 )}
 </div>
 );
}

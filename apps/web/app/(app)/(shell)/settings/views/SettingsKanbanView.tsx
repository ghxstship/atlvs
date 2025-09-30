'use client';

import { Edit, Eye, Settings as SettingsIcon, Lock, Globe, Plus } from "lucide-react";
import { useState, useMemo } from 'react';
import {
 Card,
 CardContent,
 CardHeader,
 Badge,
 Button,
 Skeleton,
} from '@ghxstship/ui';
import type { SettingsKanbanViewProps, SettingRecord, SettingCategory } from '../types';

const CATEGORY_CONFIG = {
 organization: {
 title: 'Organization',
 color: 'bg-blue-50 border-blue-200',
 headerColor: 'bg-blue-100 text-blue-800',
 icon: SettingsIcon,
 },
 security: {
 title: 'Security',
 color: 'bg-red-50 border-red-200',
 headerColor: 'bg-red-100 text-red-800',
 icon: Lock,
 },
 notifications: {
 title: 'Notifications',
 color: 'bg-green-50 border-green-200',
 headerColor: 'bg-green-100 text-green-800',
 icon: SettingsIcon,
 },
 integrations: {
 title: 'Integrations',
 color: 'bg-purple-50 border-purple-200',
 headerColor: 'bg-purple-100 text-purple-800',
 icon: SettingsIcon,
 },
 billing: {
 title: 'Billing',
 color: 'bg-yellow-50 border-yellow-200',
 headerColor: 'bg-yellow-100 text-yellow-800',
 icon: SettingsIcon,
 },
 permissions: {
 title: 'Permissions',
 color: 'bg-red-50 border-red-200',
 headerColor: 'bg-red-100 text-red-800',
 icon: Lock,
 },
 automations: {
 title: 'Automations',
 color: 'bg-indigo-50 border-indigo-200',
 headerColor: 'bg-indigo-100 text-indigo-800',
 icon: SettingsIcon,
 },
 compliance: {
 title: 'Compliance',
 color: 'bg-gray-50 border-gray-200',
 headerColor: 'bg-gray-100 text-gray-800',
 icon: Lock,
 },
 backup: {
 title: 'Backup',
 color: 'bg-teal-50 border-teal-200',
 headerColor: 'bg-teal-100 text-teal-800',
 icon: SettingsIcon,
 },
};

export default function SettingsKanbanView({
 settings,
 loading,
 onEdit,
 onMove,
}: SettingsKanbanViewProps) {
 const [draggedSetting, setDraggedSetting] = useState<SettingRecord | null>(null);

 // Group settings by category
 const settingsByCategory = useMemo(() => {
 const grouped: Record<SettingCategory, SettingRecord[]> = {
 organization: [],
 security: [],
 notifications: [],
 integrations: [],
 billing: [],
 permissions: [],
 automations: [],
 compliance: [],
 backup: [],
 };

 settings.forEach(setting => {
 if (grouped[setting.category]) {
 grouped[setting.category].push(setting);
 }
 });

 return grouped;
 }, [settings]);

 const handleDragStart = (setting: SettingRecord) => {
 setDraggedSetting(setting);
 };

 const handleDragEnd = () => {
 setDraggedSetting(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 };

 const handleDrop = (e: React.DragEvent, category: SettingCategory) => {
 e.preventDefault();
 if (draggedSetting && draggedSetting.category !== category) {
 onMove(draggedSetting.id, category);
 }
 setDraggedSetting(null);
 };

 const formatValue = (value: string, type: string) => {
 if (type === 'boolean') {
 return value === 'true' ? '✓ Enabled' : '✗ Disabled';
 }
 
 if (type === 'json' || type === 'array') {
 return `${type.toUpperCase()} data`;
 }

 return value.length > 30 ? value.substring(0, 30) + '...' : value;
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {[...Array(8)].map((_, i) => (
 <div key={i} className="space-y-4">
 <Skeleton className="h-12 w-full" />
 <div className="space-y-3">
 {[...Array(3)].map((_, j) => (
 <Skeleton key={j} className="h-24 w-full" />
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
 const categorySettings = settingsByCategory[category as SettingCategory] || [];
 const Icon = config.icon;

 return (
 <div
 key={category}
 className={`rounded-lg border-2 border-dashed ${config.color} min-h-96`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, category as SettingCategory)}
 >
 {/* Column Header */}
 <div className={`p-4 rounded-t-lg ${config.headerColor} border-b`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Icon className="h-5 w-5" />
 <h3 className="font-semibold">{config.title}</h3>
 </div>
 <Badge variant="secondary" className="text-xs">
 {categorySettings.length}
 </Badge>
 </div>
 </div>

 {/* Settings Cards */}
 <div className="p-4 space-y-3">
 {categorySettings.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
 <p className="text-sm">No {config.title.toLowerCase()} settings</p>
 <Button size="sm" variant="ghost" className="mt-2">
 <Plus className="h-4 w-4 mr-1" />
 Add Setting
 </Button>
 </div>
 ) : (
 categorySettings.map((setting) => (
 <Card
 key={setting.id}
 className={`cursor-move hover:shadow-md transition-all ${
 draggedSetting?.id === setting.id ? 'opacity-50 transform rotate-2' : ''
 }`}
 draggable
 onDragStart={() => handleDragStart(setting)}
 onDragEnd={handleDragEnd}
 >
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h4 className="font-medium text-sm leading-tight">
 {setting.name}
 </h4>
 {setting.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
 {setting.description}
 </p>
 )}
 </div>
 <div className="flex items-center gap-1 ml-2">
 <Button
 size="sm"
 variant="ghost"
 className="h-6 w-6 p-0"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(setting);
 }}
 disabled={setting.is_editable === 'false'}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="space-y-2">
 {/* Type Badge */}
 <Badge variant="outline" className="text-xs">
 {setting.type}
 </Badge>

 {/* Value Preview */}
 <div className="bg-muted p-2 rounded text-xs">
 <code className="break-all">
 {formatValue(setting.value, setting.type)}
 </code>
 </div>

 {/* Status Indicators */}
 <div className="flex items-center justify-between">
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
 {setting.is_editable === 'true' ? 'Edit' : 'Read'}
 </Badge>
 </div>

 {/* Last Updated */}
 <div className="text-xs text-muted-foreground">
 Updated {new Date(setting.updated_at).toLocaleDateString()}
 </div>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}

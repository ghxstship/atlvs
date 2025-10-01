'use client';

import { Calendar, User, FileText, Shield, Bell, Edit, ExternalLink, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react";
import { Card, Button, Badge } from '@ghxstship/ui';
import type { HealthRecord } from '../types';
import {
 RECORD_TYPE_LABELS,
 SEVERITY_LABELS,
 CATEGORY_LABELS,
 PRIVACY_LABELS,
 formatDate,
 getDaysUntilExpiry,
 getExpiryUrgency,
 getSeverityColor,
 getRecordTypeIcon,
 getPrivacyBadgeVariant,
} from '../types';

interface HealthCardViewProps {
 record: HealthRecord | null;
 loading: boolean;
 onEdit: () => void;
}

export default function HealthCardView({
 record,
 loading,
 onEdit,
}: HealthCardViewProps) {
 if (loading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 <div className="h-icon-lg w-container-xs bg-muted animate-pulse rounded" />
 <div className="h-icon-xs w-full bg-muted animate-pulse rounded" />
 <div className="h-icon-xs w-3/4 bg-muted animate-pulse rounded" />
 <div className="h-component-lg w-full bg-muted animate-pulse rounded" />
 </div>
 </Card>
 );
 }

 if (!record) {
 return (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <Activity className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Health Record Selected</h3>
 <p className="text-muted-foreground mt-2">
 Select a health record from the timeline or create a new one to get started.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 const daysUntilExpiry = record.expiry_date ? getDaysUntilExpiry(record.expiry_date) : null;
 const expiryUrgency = daysUntilExpiry !== null ? getExpiryUrgency(daysUntilExpiry) : null;

 return (
 <div className="space-y-lg">
 <Card className="p-lg">
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-2">
 <span className="text-2xl">{getRecordTypeIcon(record.record_type)}</span>
 <h2 className="text-2xl font-bold">{record.title}</h2>
 {!record.is_active && (
 <Badge variant="outline" className="text-muted-foreground">
 Inactive
 </Badge>
 )}
 </div>
 
 <div className="flex flex-wrap items-center gap-xs mb-3">
 <Badge variant="outline">
 {RECORD_TYPE_LABELS[record.record_type]}
 </Badge>
 {record.severity && (
 <Badge 
 variant="outline" 
 className={`border-${getSeverityColor(record.severity)}-500`}
 >
 {SEVERITY_LABELS[record.severity]}
 </Badge>
 )}
 {record.category && (
 <Badge variant="secondary">
 {CATEGORY_LABELS[record.category]}
 </Badge>
 )}
 <Badge variant={getPrivacyBadgeVariant(record.privacy_level)}>
 <Shield className="mr-1 h-3 w-3" />
 {PRIVACY_LABELS[record.privacy_level]}
 </Badge>
 </div>
 </div>

 <Button onClick={onEdit} size="sm">
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 {/* Expiry Alert */}
 {record.expiry_date && daysUntilExpiry !== null && (
 <div className={`p-md rounded-lg border ${
 expiryUrgency === 'critical' ? 'bg-destructive/10 border-destructive' :
 expiryUrgency === 'high' ? 'bg-orange-50 border-orange-200' :
 expiryUrgency === 'medium' ? 'bg-yellow-50 border-yellow-200' :
 'bg-green-50 border-green-200'
 }`}>
 <div className="flex items-center gap-xs">
 {daysUntilExpiry < 0 ? (
 <AlertTriangle className="h-icon-xs w-icon-xs text-destructive" />
 ) : daysUntilExpiry <= 30 ? (
 <Clock className="h-icon-xs w-icon-xs text-orange-600" />
 ) : (
 <CheckCircle className="h-icon-xs w-icon-xs text-green-600" />
 )}
 <span className="font-medium">
 {daysUntilExpiry < 0 
 ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
 : daysUntilExpiry === 0
 ? 'Expires today'
 : daysUntilExpiry === 1
 ? 'Expires tomorrow'
 : `Expires in ${daysUntilExpiry} days`
 }
 </span>
 {record.reminder_enabled && (
 <Badge variant="outline" className="ml-auto">
 <Bell className="mr-1 h-3 w-3" />
 Reminders On
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Description */}
 {record.description && (
 <div className="space-y-xs">
 <h3 className="font-semibold flex items-center gap-xs">
 <FileText className="h-icon-xs w-icon-xs" />
 Description
 </h3>
 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {record.description}
 </p>
 </div>
 )}

 {/* Dates */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md py-md border-y">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm font-medium">
 <Calendar className="h-icon-xs w-icon-xs" />
 Date Recorded
 </div>
 <p className="text-muted-foreground">{formatDate(record.date_recorded)}</p>
 </div>
 {record.expiry_date && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm font-medium">
 <Clock className="h-icon-xs w-icon-xs" />
 Expiry Date
 </div>
 <p className="text-muted-foreground">{formatDate(record.expiry_date)}</p>
 </div>
 )}
 </div>

 {/* Provider Information */}
 {(record.provider || record.provider_contact) && (
 <div className="space-y-xs">
 <h3 className="font-semibold flex items-center gap-xs">
 <User className="h-icon-xs w-icon-xs" />
 Healthcare Provider
 </h3>
 <div className="space-y-xs">
 {record.provider && (
 <p className="font-medium">{record.provider}</p>
 )}
 {record.provider_contact && (
 <p className="text-sm text-muted-foreground">{record.provider_contact}</p>
 )}
 </div>
 </div>
 )}

 {/* Tags */}
 {record.tags.length > 0 && (
 <div className="space-y-xs">
 <h3 className="font-semibold">Tags</h3>
 <div className="flex flex-wrap gap-xs">
 {record.tags.map((tag) => (
 <Badge key={tag} variant="secondary">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Notes */}
 {record.notes && (
 <div className="space-y-xs">
 <h3 className="font-semibold">Notes</h3>
 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {record.notes}
 </p>
 </div>
 )}

 {/* Document Link */}
 {record.document_url && (
 <div className="pt-4 border-t">
 <a
 href={record.document_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-xs text-primary hover:underline"
 >
 <ExternalLink className="h-icon-xs w-icon-xs" />
 View Document
 </a>
 </div>
 )}
 </div>
 </Card>

 {/* Metadata */}
 <Card className="p-md bg-muted/50">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 ID: <code className="font-mono">{record.id.slice(0, 8)}</code>
 </span>
 <div className="flex items-center gap-md">
 <span className="text-muted-foreground">
 Created: {formatDate(record.created_at)}
 </span>
 {record.updated_at !== record.created_at && (
 <span className="text-muted-foreground">
 Updated: {formatDate(record.updated_at)}
 </span>
 )}
 </div>
 </div>
 </Card>
 </div>
 );
}

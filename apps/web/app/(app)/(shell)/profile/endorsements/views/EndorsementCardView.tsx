'use client';

import { Star, User, Building, Calendar, Mail, Linkedin, Edit, Shield, Eye, EyeOff, Award } from "lucide-react";
import { Card, Button, Badge } from '@ghxstship/ui';
import type { Endorsement } from '../types';
import {
 RELATIONSHIP_LABELS,
 VERIFICATION_STATUS_LABELS,
 formatDate,
 formatRating,
 truncateText,
 getRelationshipColor,
 getVerificationBadgeVariant,
} from '../types';

interface EndorsementCardViewProps {
 endorsement: Endorsement | null;
 loading: boolean;
 onEdit: () => void;
 onVerify?: () => void;
}

export default function EndorsementCardView({
 endorsement,
 loading,
 onEdit,
 onVerify,
}: EndorsementCardViewProps) {
 if (loading) {
 return (
 <Card className="p-6">
 <div className="space-y-4">
 <div className="h-8 w-48 bg-muted animate-pulse rounded" />
 <div className="h-4 w-full bg-muted animate-pulse rounded" />
 <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
 <div className="h-20 w-full bg-muted animate-pulse rounded" />
 </div>
 </Card>
 );
 }

 if (!endorsement) {
 return (
 <Card className="p-12 text-center">
 <div className="flex flex-col items-center gap-4">
 <Award className="h-12 w-12 text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Endorsement Selected</h3>
 <p className="text-muted-foreground mt-2">
 Select an endorsement from the list or create a new one to get started.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <Card className="p-6">
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <h2 className="text-2xl font-bold">{endorsement.endorser_name}</h2>
 <Badge variant={getVerificationBadgeVariant(endorsement.verification_status)}>
 <Shield className="mr-1 h-3 w-3" />
 {VERIFICATION_STATUS_LABELS[endorsement.verification_status]}
 </Badge>
 </div>
 
 <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
 {endorsement.endorser_title && (
 <div className="flex items-center gap-1">
 <User className="h-4 w-4" />
 {endorsement.endorser_title}
 </div>
 )}
 {endorsement.endorser_company && (
 <div className="flex items-center gap-1">
 <Building className="h-4 w-4" />
 {endorsement.endorser_company}
 </div>
 )}
 <div className="flex items-center gap-1">
 <Calendar className="h-4 w-4" />
 {formatDate(endorsement.date_received)}
 </div>
 </div>
 </div>

 <Button onClick={onEdit} size="sm">
 <Edit className="h-4 w-4" />
 </Button>
 </div>

 {/* Relationship and Rating */}
 <div className="flex items-center justify-between py-4 border-y">
 <div className="flex items-center gap-3">
 <Badge variant="outline" className={`border-${getRelationshipColor(endorsement.relationship)}-500`}>
 {RELATIONSHIP_LABELS[endorsement.relationship]}
 </Badge>
 <div className="flex items-center gap-2">
 {endorsement.is_public ? (
 <Badge variant="secondary">
 <Eye className="mr-1 h-3 w-3" />
 Public
 </Badge>
 ) : (
 <Badge variant="outline">
 <EyeOff className="mr-1 h-3 w-3" />
 Private
 </Badge>
 )}
 {endorsement.is_featured && (
 <Badge variant="primary">
 <Star className="mr-1 h-3 w-3" />
 Featured
 </Badge>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-2xl text-yellow-500">{formatRating(endorsement.rating)}</span>
 <span className="text-sm text-muted-foreground">({endorsement.rating}/5)</span>
 </div>
 </div>

 {/* Endorsement Text */}
 <div className="space-y-2">
 <h3 className="font-semibold">Endorsement</h3>
 <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
 {endorsement.endorsement_text}
 </p>
 </div>

 {/* Skills */}
 {endorsement.skills_endorsed.length > 0 && (
 <div className="space-y-2">
 <h3 className="font-semibold">Skills Endorsed</h3>
 <div className="flex flex-wrap gap-2">
 {endorsement.skills_endorsed.map((skill) => (
 <Badge key={skill} variant="secondary">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Contact Information */}
 {(endorsement.endorser_email || endorsement.endorser_linkedin) && (
 <div className="space-y-2 pt-4 border-t">
 <h3 className="font-semibold">Contact Information</h3>
 <div className="flex flex-wrap gap-4">
 {endorsement.endorser_email && (
 <a
 href={`mailto:${endorsement.endorser_email as any as any}`}
 className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
 >
 <Mail className="h-4 w-4" />
 {endorsement.endorser_email}
 </a>
 )}
 {endorsement.endorser_linkedin && (
 <a
 href={endorsement.endorser_linkedin as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
 >
 <Linkedin className="h-4 w-4" />
 LinkedIn Profile
 </a>
 )}
 </div>
 </div>
 )}

 {/* Actions */}
 {onVerify && endorsement.verification_status === 'pending' && (
 <div className="pt-4 border-t">
 <Button onClick={onVerify} variant="outline" className="w-full">
 <Shield className="mr-2 h-4 w-4" />
 Verify Endorsement
 </Button>
 </div>
 )}
 </div>
 </Card>

 {/* Metadata */}
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 ID: <code className="font-mono">{endorsement.id.slice(0, 8)}</code>
 </span>
 <div className="flex items-center gap-4">
 {endorsement.verified_at && (
 <span className="text-muted-foreground">
 Verified: {formatDate(endorsement.verified_at)}
 </span>
 )}
 <span className="text-muted-foreground">
 Updated: {formatDate(endorsement.updated_at)}
 </span>
 </div>
 </div>
 </Card>
 </div>
 );
}

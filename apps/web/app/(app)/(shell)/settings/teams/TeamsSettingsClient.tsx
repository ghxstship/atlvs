'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from 'react';
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Input,
 Label,
 Modal,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Skeleton,
 Textarea,
 useToastContext,
} from '@ghxstship/ui';
import {
 addExistingMember,
 bulkInviteMembers,
 fetchTeamsSettings,
 InviteInput,
 InviteRecord,
 inviteMember,
 resendInvite,
 revokeInvite,
 SeatUsage,
 TeamsSettingsResponse,
} from '@/lib/services/settingsTeamsClient';

const ROLE_OPTIONS = [
 { value: 'viewer', label: 'Viewer' },
 { value: 'contributor', label: 'Contributor' },
 { value: 'manager', label: 'Manager' },
 { value: 'admin', label: 'Admin' },
 ] as const;

const EMAIL_REGEX = /.+@.+\..+/i;

type RoleValue = (typeof ROLE_OPTIONS)[number]['value'];

function parseEmailList(text: string): string[] {
 return Array.from(
 new Set(
 text
 .split(/[\s,;]+/)
 .map((s) => s.trim())
 .filter((s) => EMAIL_REGEX.test(s))
 )
 );
}

function extractDomain(email: string): string | null {
 const match = email.toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/i);
 return match ? match[1] : null;
}

export default function TeamsSettingsClient() {
 const { toast } = useToastContext();
 const [data, setData] = useState<TeamsSettingsResponse | null>(null);
 const [loading, setLoading] = useState<boolean>(true);
 const [saving, setSaving] = useState<boolean>(false);
 const [email, setEmail] = useState<string>('');
 const [role, setRole] = useState<RoleValue>('contributor');
 const [bulkText, setBulkText] = useState<string>('');
 const [bulkRole, setBulkRole] = useState<RoleValue>('contributor');
 const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false);

 const load = async () => {
 try {
 setLoading(true);
 const response = await fetchTeamsSettings();
 setData(response);
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to load teams settings';
 toast.error('Failed to load teams', undefined, { description: message });
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, []);

 const emailDomain = useMemo(() => extractDomain(email), [email]);
 const domainRecord = useMemo(() => {
 if (!emailDomain || !data?.domains) return null;
 return data.domains.find((d) => d.domain === emailDomain);
 }, [emailDomain, data?.domains]);

 const bulkEmails = useMemo(() => parseEmailList(bulkText), [bulkText]);

 const handleInvite = async () => {
 if (!email || !EMAIL_REGEX.test(email)) return;
 try {
 setSaving(true);
 await inviteMember({ email, role });
 toast.success('Invite sent');
 setEmail('');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to send invite';
 toast.error('Invite failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const handleAddExisting = async () => {
 if (!email || !EMAIL_REGEX.test(email)) return;
 try {
 setSaving(true);
 await addExistingMember({ email, role });
 toast.success('Member added');
 setEmail('');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to add member';
 toast.error('Add failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const handleBulkInvite = async () => {
 if (bulkEmails.length === 0) return;
 try {
 setSaving(true);
 const result = await bulkInviteMembers({ emails: bulkEmails, role: bulkRole });
 toast.success(`Bulk invite complete: ${result.results.successes} sent, ${result.results.failures} failed`);
 setBulkText('');
 setBulkModalOpen(false);
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to send bulk invites';
 toast.error('Bulk invite failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const handleResend = async (inviteId: string) => {
 try {
 setSaving(true);
 await resendInvite(inviteId);
 toast.success('Invite resent');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to resend invite';
 toast.error('Resend failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const handleRevoke = async (inviteId: string) => {
 try {
 setSaving(true);
 await revokeInvite(inviteId);
 toast.success('Invite revoked');
 await load();
 } catch (error) {
 const message = error instanceof Error ? error.message : 'Unable to revoke invite';
 toast.error('Revoke failed', undefined, { description: message });
 } finally {
 setSaving(false);
 }
 };

 const renderSeatUsage = (usage: SeatUsage) => {
 if (usage.seatPolicy === 'domain-unlimited') {
 return (
 <div className="flex items-center justify-between">
 <div className="space-y-xs">
 <p className="text-body-sm font-medium">Domain Unlimited</p>
 <p className="text-body-xs text-muted-foreground">
 Members with verified organization domains don&rsquo;t count toward seat limits.
 </p>
 </div>
 <Badge variant="outline">{usage.activeCount} active</Badge>
 </div>
 );
 }

 return (
 <div className="flex items-center justify-between">
 <div className="space-y-xs">
 <p className="text-body-sm font-medium">Per-User Seats</p>
 <p className="text-body-xs text-muted-foreground">
 Each member counts toward your organization&rsquo;s seat limit.
 </p>
 </div>
 <div className="text-right">
 <p className="text-body-sm font-medium">
 {usage.activeCount}
 {usage.seatsLimit != null ? ` / ${usage.seatsLimit}` : ''}
 </p>
 {usage.remainingSeats != null ? (
 <p className="text-body-xs text-muted-foreground">
 {usage.remainingSeats} remaining
 </p>
 ) : null}
 </div>
 </div>
 );
 };

 const renderInviteRow = (invite: InviteRecord) => {
 const statusVariant = 
 invite.status === 'pending' ? 'secondary' :
 invite.status === 'accepted' ? 'default' :
 invite.status === 'revoked' ? 'outline' : 'outline';

 return (
 <tr key={invite.id} className="border-t">
 <td className="px-md py-sm">{invite.email}</td>
 <td className="px-md py-sm capitalize">{invite.role}</td>
 <td className="px-md py-sm">
 <Badge variant={statusVariant}>{invite.status}</Badge>
 </td>
 <td className="px-md py-sm text-right">
 <div className="flex justify-end gap-xs">
 {invite.status === 'pending' && data?.canManage ? (
 <>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleResend(invite.id)}
 disabled={saving}
 >
 Resend
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleRevoke(invite.id)}
 disabled={saving}
 >
 Revoke
 </Button>
 </>
 ) : null}
 </div>
 </td>
 </tr>
 );
 };

 if (loading) {
 return (
 <div className="space-y-md">
 <Skeleton className="h-12 w-48" />
 <div className="space-y-sm">
 <Skeleton className="h-32 w-full" />
 <Skeleton className="h-40 w-full" />
 </div>
 </div>
 );
 }

 if (!data) {
 return (
 <Card>
 <CardContent className="py-lg text-center text-body-sm text-muted-foreground">
 Unable to load teams data. Please try refreshing the page.
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 <Card>
 <CardHeader className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
 <div>
 <CardTitle>Team Management</CardTitle>
 <p className="text-body-sm text-muted-foreground">
 Invite teammates, manage roles, and monitor seat usage across your organization.
 </p>
 </div>
 <div className="flex gap-sm">
 <Button variant="outline" onClick={() => setBulkModalOpen(true)} disabled={!data.canManage}>
 Bulk Invite
 </Button>
 <Button variant="outline" onClick={() => void load()}>
 Refresh
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 {renderSeatUsage(data.seatUsage)}
 </CardContent>
 </Card>

 {data.canManage ? (
 <Card>
 <CardHeader>
 <CardTitle>Invite New Member</CardTitle>
 </CardHeader>
 <CardContent className="space-y-md">
 <div className="grid gap-md md:grid-cols-3">
 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="invite-email">Email Address</Label>
 <Input
 
 type="email"
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 placeholder="teammate@company.com"
 />
 {emailDomain && domainRecord ? (
 <p className="text-body-xs text-muted-foreground">
 {domainRecord.status === 'active' ? (
 <span className="text-green-600">✓ Domain matches active organization domain</span>
 ) : (
 <span className="text-yellow-600">⚠ Domain is pending verification</span>
 )}
 </p>
 ) : emailDomain ? (
 <p className="text-body-xs text-muted-foreground">
 External domain — will count against seat limit if enforced.
 </p>
 ) : null}
 </div>
 <div className="space-y-sm">
 <Label htmlFor="invite-role">Role</Label>
 <Select value={role} onValueChange={(value) => setRole(value as RoleValue)}>
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {ROLE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="flex gap-sm">
 <Button
 onClick={handleInvite}
 disabled={saving || !EMAIL_REGEX.test(email)}
 >
 Send Invite
 </Button>
 <Button
 variant="outline"
 onClick={handleAddExisting}
 disabled={saving || !EMAIL_REGEX.test(email)}
 >
 Add Existing User
 </Button>
 </div>
 </CardContent>
 </Card>
 ) : (
 <Card>
 <CardContent className="py-lg text-center text-body-sm text-muted-foreground">
 Only organization owners and admins can invite new members.
 </CardContent>
 </Card>
 )}

 <Card>
 <CardHeader>
 <CardTitle>Pending Invitations</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="min-w-full text-left text-body-sm">
 <thead>
 <tr className="border-b">
 <th className="px-md py-sm font-medium">Email</th>
 <th className="px-md py-sm font-medium">Role</th>
 <th className="px-md py-sm font-medium">Status</th>
 <th className="px-md py-sm font-medium text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {data.invites.map(renderInviteRow)}
 {data.invites.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-md py-lg text-center text-muted-foreground">
 No pending invitations.
 </td>
 </tr>
 ) : null}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <Modal
 open={bulkModalOpen}
 onClose={() => setBulkModalOpen(false)}
 title="Bulk Invite Members"
 description="Paste a list of email addresses to invite multiple members at once."
 >
 <div className="space-y-md">
 <div className="space-y-sm">
 <Label htmlFor="bulk-emails">Email Addresses</Label>
 <Textarea
 
 rows={6}
 value={bulkText}
 onChange={(event) => setBulkText(event.target.value)}
 placeholder="user1@company.com, user2@company.com&#10;user3@other.com&#10;user4@example.org"
 />
 <p className="text-body-xs text-muted-foreground">
 Detected: {bulkEmails.length} valid email{bulkEmails.length !== 1 ? 's' : ''}
 </p>
 </div>
 <div className="space-y-sm">
 <Label htmlFor="bulk-role">Role for All</Label>
 <Select value={bulkRole} onValueChange={(value) => setBulkRole(value as RoleValue)}>
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {ROLE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="flex justify-end gap-sm">
 <Button variant="outline" onClick={() => setBulkModalOpen(false)} disabled={saving}>
 Cancel
 </Button>
 <Button onClick={handleBulkInvite} disabled={saving || bulkEmails.length === 0}>
 {saving ? 'Sending…' : `Invite ${bulkEmails.length} Member${bulkEmails.length !== 1 ? 's' : ''}`}
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}

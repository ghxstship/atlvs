'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import {
 Button,
 Badge,
 Card,
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
 Separator,
} from '@ghxstship/ui';
import { format } from 'date-fns';
import type { CallSheet } from '../lib/callSheetsService';

interface ViewCallSheetDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 callSheet: CallSheet;
 onEdit?: () => void;
 onDelete?: () => void;
 onDistribute?: () => void;
}

const STATUS_VARIANTS: Record<CallSheet['status'], 'secondary' | 'info' | 'warning' | 'success' | 'destructive'> = {
 draft: 'secondary',
 published: 'info',
 distributed: 'warning',
 completed: 'success',
 cancelled: 'destructive',
};

export default function ViewCallSheetDrawer({
 open,
 onOpenChange,
 callSheet,
 onEdit,
 onDelete,
 onDistribute,
}: ViewCallSheetDrawerProps) {
 const [activeTab, setActiveTab] = useState<'overview' | 'crew' | 'talent' | 'contacts'>('overview');

 const tabs = [
 { id: 'overview', label: 'Overview' },
 { id: 'crew', label: `Crew (${callSheet.crew_calls?.length || 0})` },
 { id: 'talent', label: `Talent (${callSheet.talent_calls?.length || 0})` },
 { id: 'contacts', label: `Emergency (${callSheet.emergency_contacts?.length || 0})` },
 ];

 const handlePrint = () => {
 window.print();
 };

 const handleExport = () => {
 // This would typically generate a PDF or other format
 };

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-4xl mx-auto">
 <DrawerHeader>
 <div className="flex items-start justify-between">
 <div>
 <DrawerTitle className="text-xl">{callSheet.title}</DrawerTitle>
 <div className="flex items-center space-x-xs mt-2">
 <Badge variant={STATUS_VARIANTS[callSheet.status]}>
 {callSheet.status.replace('_', ' ')}
 </Badge>
 <span className="text-sm text-muted-foreground">
 Created {format(new Date(callSheet.created_at!), 'MMM dd, yyyy')}
 </span>
 </div>
 </div>
 
 <div className="flex items-center space-x-xs">
 <Button variant="outline" size="sm" onClick={handlePrint}>
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Print
 </Button>
 
 <Button variant="outline" size="sm" onClick={handleExport}>
 <Share2 className="h-icon-xs w-icon-xs mr-2" />
 Export
 </Button>
 
 {callSheet.status === 'published' && onDistribute && (
 <Button variant="outline" size="sm" onClick={onDistribute}>
 <Share2 className="h-icon-xs w-icon-xs mr-2" />
 Distribute
 </Button>
 )}
 
 {onEdit && (
 <Button variant="outline" size="sm" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-2" />
 Edit
 </Button>
 )}
 
 {onDelete && (
 <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 Delete
 </Button>
 )}
 </div>
 </div>
 </DrawerHeader>

 <div className="flex-1 px-lg">
 {/* Tab Navigation */}
 <div className="flex space-x-xs mb-6 border-b">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveTab(tab.id as unknown)}
 className={`px-md py-xs text-sm font-medium border-b-2 transition-colors ${
 activeTab === tab.id
 ? 'border-primary text-primary'
 : 'border-transparent text-muted-foreground hover:text-foreground'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 {activeTab === 'overview' && (
 <div className="space-y-lg">
 {/* Basic Information */}
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-4">Call Sheet Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-6">
 <div className="flex items-center space-x-sm">
 <Calendar className="h-icon-sm w-icon-sm text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Call Date</p>
 <p className="font-medium">{format(new Date(callSheet.call_date), 'EEEE, MMMM dd, yyyy')}</p>
 </div>
 </div>
 
 {callSheet.call_time && (
 <div className="flex items-center space-x-sm">
 <Clock className="h-icon-sm w-icon-sm text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Call Time</p>
 <p className="font-medium">{callSheet.call_time}</p>
 </div>
 </div>
 )}
 
 {callSheet.location && (
 <div className="flex items-center space-x-sm">
 <MapPin className="h-icon-sm w-icon-sm text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Location</p>
 <p className="font-medium">{callSheet.location}</p>
 </div>
 </div>
 )}
 
 <div className="flex items-center space-x-sm">
 <Users className="h-icon-sm w-icon-sm text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Total People</p>
 <p className="font-medium">
 {(callSheet.crew_calls?.length || 0) + (callSheet.talent_calls?.length || 0)} people
 </p>
 </div>
 </div>
 
 {callSheet.weather && (
 <div className="flex items-center space-x-sm">
 <Eye className="h-icon-sm w-icon-sm text-muted-foreground" />
 <div>
 <p className="text-sm text-muted-foreground">Weather</p>
 <p className="font-medium">{callSheet.weather}</p>
 </div>
 </div>
 )}
 </div>
 
 {callSheet.description && (
 <div className="mb-4">
 <h4 className="font-medium mb-2">Description</h4>
 <p className="text-muted-foreground">{callSheet.description}</p>
 </div>
 )}
 
 {callSheet.special_instructions && (
 <div className="p-md bg-muted rounded-lg">
 <h4 className="font-medium mb-2 text-warning">Special Instructions</h4>
 <p className="text-sm">{callSheet.special_instructions}</p>
 </div>
 )}
 </Card>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Crew Members</p>
 <p className="text-2xl font-bold">{callSheet.crew_calls?.length || 0}</p>
 </div>
 <Users className="h-icon-lg w-icon-lg text-primary" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Talent</p>
 <p className="text-2xl font-bold">{callSheet.talent_calls?.length || 0}</p>
 </div>
 <Users className="h-icon-lg w-icon-lg text-success" />
 </div>
 </Card>
 
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Emergency Contacts</p>
 <p className="text-2xl font-bold">{callSheet.emergency_contacts?.length || 0}</p>
 </div>
 <Phone className="h-icon-lg w-icon-lg text-warning" />
 </div>
 </Card>
 </div>
 </div>
 )}

 {activeTab === 'crew' && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Crew Calls</h3>
 
 {callSheet.crew_calls && callSheet.crew_calls.length > 0 ? (
 <div className="space-y-sm">
 {callSheet.crew_calls.map((crew, index) => (
 <Card key={crew.id} className="p-md">
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center space-x-xs">
 <Badge variant="outline">#{index + 1}</Badge>
 <h4 className="font-medium">{crew.role}</h4>
 {crew.department && (
 <Badge variant="secondary" className="text-xs">
 {crew.department}
 </Badge>
 )}
 </div>
 
 {crew.call_time && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Clock className="h-icon-xs w-icon-xs mr-1" />
 {crew.call_time}
 </div>
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-sm">
 {crew.person_name && (
 <div>
 <p className="text-muted-foreground">Person</p>
 <p className="font-medium">{crew.person_name}</p>
 </div>
 )}
 
 {crew.location && (
 <div>
 <p className="text-muted-foreground">Location</p>
 <p className="font-medium">{crew.location}</p>
 </div>
 )}
 
 {crew.notes && (
 <div>
 <p className="text-muted-foreground">Notes</p>
 <p className="font-medium">{crew.notes}</p>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <div className="text-center py-xl text-muted-foreground">
 <Users className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No crew calls scheduled</p>
 </div>
 )}
 </div>
 )}

 {activeTab === 'talent' && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Talent Calls</h3>
 
 {callSheet.talent_calls && callSheet.talent_calls.length > 0 ? (
 <div className="space-y-sm">
 {callSheet.talent_calls.map((talent, index) => (
 <Card key={talent.id} className="p-md">
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center space-x-xs">
 <Badge variant="outline">#{index + 1}</Badge>
 <h4 className="font-medium">{talent.talent_name}</h4>
 {talent.role && (
 <Badge variant="secondary" className="text-xs">
 {talent.role}
 </Badge>
 )}
 </div>
 
 {talent.call_time && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Clock className="h-icon-xs w-icon-xs mr-1" />
 {talent.call_time}
 </div>
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md text-sm">
 {talent.makeup_time && (
 <div>
 <p className="text-muted-foreground">Makeup</p>
 <p className="font-medium">{talent.makeup_time}</p>
 </div>
 )}
 
 {talent.wardrobe_time && (
 <div>
 <p className="text-muted-foreground">Wardrobe</p>
 <p className="font-medium">{talent.wardrobe_time}</p>
 </div>
 )}
 
 {talent.location && (
 <div>
 <p className="text-muted-foreground">Location</p>
 <p className="font-medium">{talent.location}</p>
 </div>
 )}
 
 {talent.notes && (
 <div>
 <p className="text-muted-foreground">Notes</p>
 <p className="font-medium">{talent.notes}</p>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <div className="text-center py-xl text-muted-foreground">
 <Users className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No talent calls scheduled</p>
 </div>
 )}
 </div>
 )}

 {activeTab === 'contacts' && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Emergency Contacts</h3>
 
 {callSheet.emergency_contacts && callSheet.emergency_contacts.length > 0 ? (
 <div className="space-y-sm">
 {callSheet.emergency_contacts.map((contact, index) => (
 <Card key={contact.id} className="p-md">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-xs mb-2">
 <Badge variant="outline">#{index + 1}</Badge>
 <h4 className="font-medium">{contact.name}</h4>
 <Badge variant="secondary" className="text-xs">
 {contact.role}
 </Badge>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div className="flex items-center space-x-xs">
 <Phone className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">{contact.phone}</span>
 </div>
 
 {contact.email && (
 <div className="flex items-center space-x-xs">
 <Mail className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">{contact.email}</span>
 </div>
 )}
 </div>
 </div>
 
 <div className="flex items-center space-x-xs ml-4">
 <Button variant="outline" size="sm" asChild>
 <a href={`tel:${contact.phone as any as any}`}>
 <Phone className="h-icon-xs w-icon-xs" />
 </a>
 </Button>
 
 {contact.email && (
 <Button variant="outline" size="sm" asChild>
 <a href={`mailto:${contact.email as any as any}`}>
 <Mail className="h-icon-xs w-icon-xs" />
 </a>
 </Button>
 )}
 </div>
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <div className="text-center py-xl text-muted-foreground">
 <Phone className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No emergency contacts added</p>
 </div>
 )}
 </div>
 )}
 </div>

 <DrawerFooter>
 <div className="flex justify-end">
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Close
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}

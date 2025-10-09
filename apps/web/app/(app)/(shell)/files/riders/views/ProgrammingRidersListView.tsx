'use client';

import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';

import type { ProgrammingRider, RiderSort } from '../types';

interface ProgrammingRidersListViewProps {
  riders: ProgrammingRider[];
  loading: boolean;
  selectedRiders: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (rider: ProgrammingRider) => void;
  onView: (rider: ProgrammingRider) => void;
  onDelete: (riderId: string) => void;
  sort: RiderSort;
  onSortChange: (sort: RiderSort) => void;
}

const STATUS_BADGE_CONFIG: Record<ProgrammingRider['status'], { label: string; variant: Parameters<typeof Badge>[0]['variant'] }> = {
  draft: { label: 'Draft', variant: 'default' },
  pending_review: { label: 'Pending Review', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  fulfilled: { label: 'Fulfilled', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

const PRIORITY_BADGE_CONFIG: Record<ProgrammingRider['priority'], { label: string; variant: Parameters<typeof Badge>[0]['variant'] }> = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'destructive' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

const RIDER_KIND_CONFIG: Record<ProgrammingRider['kind'], { label: string; icon: string }> = {
  technical: { label: 'Technical', icon: '🔧' },
  hospitality: { label: 'Hospitality', icon: '🍽️' },
  stage_plot: { label: 'Stage Plot', icon: '📋' },
  security: { label: 'Security', icon: '🛡️' },
  catering: { label: 'Catering', icon: '🍴' },
  transportation: { label: 'Transportation', icon: '🚐' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  production: { label: 'Production', icon: '🎬' },
  artist: { label: 'Artist', icon: '🎤' },
  crew: { label: 'Crew', icon: '👥' },
};

export default function ProgrammingRidersListView({
  riders,
  loading,
  selectedRiders,
  onSelectionChange,
  onEdit,
  onView,
  onDelete,
  sort,
  onSortChange,
}: ProgrammingRidersListViewProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const allIds = useMemo(() => riders.map((rider) => rider.id), [riders]);

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? allIds : []);
  };

  const handleSelectRider = (riderId: string, checked: boolean) => {
    if (checked) {
      if (!selectedRiders.includes(riderId)) {
        onSelectionChange([...selectedRiders, riderId]);
      }
      return;
    }

    onSelectionChange(selectedRiders.filter((id) => id !== riderId));
  };

  const toggleRowExpansion = (riderId: string) => {
    setExpandedRows((prev) =>
      prev.includes(riderId)
        ? prev.filter((id) => id !== riderId)
        : [...prev, riderId],
    );
  };

  const handleSort = (field: keyof ProgrammingRider) => {
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };

  const getSortIcon = (field: keyof ProgrammingRider) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <Card className="p-xl">
        <div className="flex items-center justify-center gap-sm">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary" />
          <span>Loading riders...</span>
        </div>
      </Card>
    );
  }

  if (riders.length === 0) {
    return (
      <Card className="p-xl">
        <div className="text-center space-y-xs">
          <h3 className="text-lg font-semibold">No riders found</h3>
          <p className="text-muted-foreground">
            No riders match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-icon-2xl">
              <Checkbox
                checked={selectedRiders.length > 0 && selectedRiders.length === riders.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all riders"
              />
            </TableHead>
            <TableHead className="w-icon-2xl" />
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('title')}
            >
              Title {getSortIcon('title')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('kind')}
            >
              Kind {getSortIcon('kind')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status {getSortIcon('status')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('priority')}
            >
              Priority {getSortIcon('priority')}
            </TableHead>
            <TableHead>Event</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('created_at')}
            >
              Created {getSortIcon('created_at')}
            </TableHead>
            <TableHead className="w-icon-2xl" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {riders.map((rider) => {
            const isExpanded = expandedRows.includes(rider.id);
            const isSelected = selectedRiders.includes(rider.id);

            return (
              <Fragment key={rider.id}>
                <TableRow className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRider(rider.id, checked)}
                      aria-label={`Select rider ${rider.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(rider.id)}
                      className="h-icon-md w-icon-md p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-icon-xs w-icon-xs" />
                      ) : (
                        <ChevronRight className="h-icon-xs w-icon-xs" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{rider.title}</div>
                    {rider.description && (
                      <div className="text-sm text-muted-foreground line-clamp-xs">
                        {rider.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-xs">
                      <span className="text-lg">{RIDER_KIND_CONFIG[rider.kind]?.icon}</span>
                      <span className="text-sm">{RIDER_KIND_CONFIG[rider.kind]?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_CONFIG[rider.status]?.variant}>
                      {STATUS_BADGE_CONFIG[rider.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_BADGE_CONFIG[rider.priority]?.variant}>
                      {PRIORITY_BADGE_CONFIG[rider.priority]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rider.event && (
                      <div className="space-y-xxs">
                        <div className="font-medium">{rider.event.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(rider.event.start_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(rider.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
                          <MoreHorizontal className="h-icon-xs w-icon-xs" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(rider)}>
                          <Eye className="mr-2 h-icon-xs w-icon-xs" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(rider)}>
                          <Edit className="mr-2 h-icon-xs w-icon-xs" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(rider.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/25">
                      <div className="p-md space-y-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-md">
                          <div>
                            <h4 className="font-semibold mb-2">Requirements</h4>
                            <p className="text-sm text-muted-foreground">{rider.requirements}</p>
                          </div>

                          {rider.project && (
                            <div className="space-y-xxs">
                              <h4 className="font-semibold mb-2">Project</h4>
                              <div className="flex items-center gap-xs">
                                <Badge variant="outline">{rider.project.name}</Badge>
                                <Badge variant="secondary">{rider.project.status}</Badge>
                              </div>
                            </div>
                          )}

                          <div className="space-y-xxs">
                            <h4 className="font-semibold mb-2">Fulfillment</h4>
                            <div className="flex items-center gap-xs">
                              {rider.fulfilled_at ? (
                                <>
                                  <CheckCircle className="h-icon-xs w-icon-xs text-green-600" />
                                  <span className="text-sm">
                                    Fulfilled {new Date(rider.fulfilled_at).toLocaleDateString()}
                                  </span>
                                </>
                              ) : rider.approved_at ? (
                                <>
                                  <AlertCircle className="h-icon-xs w-icon-xs text-yellow-600" />
                                  <span className="text-sm">Approved, pending fulfillment</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-icon-xs w-icon-xs text-gray-400" />
                                  <span className="text-sm">Not fulfilled</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {rider.notes && (
                          <div>
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{rider.notes}</p>
                          </div>
                        )}

                        {rider.tags && rider.tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-xs">
                              {rider.tags.map((tag) => (
                                <Badge key={`${rider.id}-${tag}`} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {rider.kind === 'technical' && rider.technical_requirements && (
                          <div>
                            <h4 className="font-semibold mb-2">Technical Requirements</h4>
                            <div className="grid grid-cols-2 gap-xs text-sm">
                              {rider.technical_requirements.sound_system && (
                                <div>Sound System: {rider.technical_requirements.sound_system}</div>
                              )}
                              {rider.technical_requirements.lighting && (
                                <div>Lighting: {rider.technical_requirements.lighting}</div>
                              )}
                              {rider.technical_requirements.power_requirements && (
                                <div>Power: {rider.technical_requirements.power_requirements}</div>
                              )}
                              {rider.technical_requirements.crew_requirements && (
                                <div>Crew: {rider.technical_requirements.crew_requirements}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {rider.kind === 'hospitality' && rider.hospitality_requirements && (
                          <div>
                            <h4 className="font-semibold mb-2">Hospitality Requirements</h4>
                            <div className="grid grid-cols-2 gap-xs text-sm">
                              {rider.hospitality_requirements.catering && (
                                <div>Catering: {rider.hospitality_requirements.catering}</div>
                              )}
                              {rider.hospitality_requirements.beverages && (
                                <div>Beverages: {rider.hospitality_requirements.beverages}</div>
                              )}
                              {rider.hospitality_requirements.green_room_setup && (
                                <div>Green Room: {rider.hospitality_requirements.green_room_setup}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

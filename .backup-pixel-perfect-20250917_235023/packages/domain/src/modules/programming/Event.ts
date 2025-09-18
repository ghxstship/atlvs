import type { UUID } from '../../core/Identifier';

export type EventKind = 'performance' | 'activation' | 'workshop';

export interface Event {
  id: UUID;
  projectId: UUID;
  name: string;
  kind: EventKind;
  startsAt?: string; // ISO datetime
  endsAt?: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

export interface EventWithRelations extends Event {
  lineups?: Lineup[];
  riders?: Rider[];
  callSheets?: CallSheet[];
}

export interface Lineup {
  id: UUID;
  eventId: UUID;
  performer: string;
  stage?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface Rider {
  id: UUID;
  eventId: UUID;
  kind: 'technical' | 'hospitality' | 'stage_plot';
  details?: Record<string, any>;
}

export interface CallSheet {
  id: UUID;
  eventId: UUID;
  callDate: string; // ISO date
  details?: Record<string, any>;
}

export interface Space {
  id: UUID;
  organizationId: UUID;
  name: string;
  kind: 'room' | 'green_room' | 'dressing_room' | 'meeting_room' | 'classroom' | 'other';
  capacity?: number;
}

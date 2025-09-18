import type { Event, EventWithRelations, Lineup, Rider, CallSheet, Space } from './Event';
import type { QueryOptions } from '../../repositories/BaseRepository';

export interface EventRepository {
  findById(id: string, tenant: { organizationId: string }): Promise<EventWithRelations | null>;
  findMany(options: QueryOptions, tenant: { organizationId: string }): Promise<Event[]>;
  findByProjectId(projectId: string, tenant: { organizationId: string }): Promise<Event[]>;
  create(entity: Event, tenant: { organizationId: string }): Promise<Event>;
  update(id: string, partial: Partial<Event>, tenant: { organizationId: string }): Promise<Event>;
  delete(id: string, tenant: { organizationId: string }): Promise<void>;
}

export interface LineupRepository {
  findById(id: string, tenant: { organizationId: string }): Promise<Lineup | null>;
  findByEventId(eventId: string, tenant: { organizationId: string }): Promise<Lineup[]>;
  create(entity: Lineup, tenant: { organizationId: string }): Promise<Lineup>;
  update(id: string, partial: Partial<Lineup>, tenant: { organizationId: string }): Promise<Lineup>;
  delete(id: string, tenant: { organizationId: string }): Promise<void>;
}

export interface RiderRepository {
  findById(id: string, tenant: { organizationId: string }): Promise<Rider | null>;
  findByEventId(eventId: string, tenant: { organizationId: string }): Promise<Rider[]>;
  create(entity: Rider, tenant: { organizationId: string }): Promise<Rider>;
  update(id: string, partial: Partial<Rider>, tenant: { organizationId: string }): Promise<Rider>;
  delete(id: string, tenant: { organizationId: string }): Promise<void>;
}

export interface CallSheetRepository {
  findById(id: string, tenant: { organizationId: string }): Promise<CallSheet | null>;
  findByEventId(eventId: string, tenant: { organizationId: string }): Promise<CallSheet[]>;
  create(entity: CallSheet, tenant: { organizationId: string }): Promise<CallSheet>;
  update(id: string, partial: Partial<CallSheet>, tenant: { organizationId: string }): Promise<CallSheet>;
  delete(id: string, tenant: { organizationId: string }): Promise<void>;
}

export interface SpaceRepository {
  findById(id: string, tenant: { organizationId: string }): Promise<Space | null>;
  findMany(options: QueryOptions, tenant: { organizationId: string }): Promise<Space[]>;
  create(entity: Space, tenant: { organizationId: string }): Promise<Space>;
  update(id: string, partial: Partial<Space>, tenant: { organizationId: string }): Promise<Space>;
  delete(id: string, tenant: { organizationId: string }): Promise<void>;
}

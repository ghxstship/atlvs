// Minimal implementation
export {};

// Programming entities
export interface Lineup {
  id: string;
  eventId: string;
  performer: string;
  stage: string;
}

export interface Rider {
  id: string;
  eventId: string;
  type: string;
  requirements: string;
}

export interface CallSheet {
  id: string;
  eventId: string;
  callTime: string;
  details: string;
}

export interface Space {
  id: string;
  organizationId: string;
  name: string;
  capacity: number;
}

export interface Itinerary {
  id: string;
  organizationId: string;
  title: string;
  date: string;
}

// People entities
export interface Person {
  id: string;
  organizationId: string;
  name: string;
  email: string;
}

export interface Endorsement {
  id: string;
  personId: string;
  endorserId: string;
  competencyId: string;
  rating: number;
}

// Programming entities
export interface Lineup {
  id: string;
  eventId: string;
  performer: string;
  stage: string;
}

export interface Rider {
  id: string;
  eventId: string;
  type: string;
  requirements: string;
}

export interface CallSheet {
  id: string;
  eventId: string;
  callTime: string;
  details: string;
}

export interface Space {
  id: string;
  organizationId: string;
  name: string;
  capacity: number;
}

export interface Itinerary {
  id: string;
  organizationId: string;
  title: string;
  date: string;
}

// People entities
export interface Person {
  id: string;
  organizationId: string;
  name: string;
  email: string;
}

export interface Endorsement {
  id: string;
  personId: string;
  endorserId: string;
  competencyId: string;
  rating: number;
}

// Programming entities
export interface Lineup {
  id: string;
  eventId: string;
  performer: string;
  stage: string;
}

export interface Rider {
  id: string;
  eventId: string;
  type: string;
  requirements: string;
}

export interface CallSheet {
  id: string;
  eventId: string;
  callTime: string;
  details: string;
}

export interface Space {
  id: string;
  organizationId: string;
  name: string;
  capacity: number;
}

export interface Itinerary {
  id: string;
  organizationId: string;
  title: string;
  date: string;
}

// People entities
export interface Person {
  id: string;
  organizationId: string;
  name: string;
  email: string;
}

export interface Endorsement {
  id: string;
  personId: string;
  endorserId: string;
  competencyId: string;
  rating: number;
}

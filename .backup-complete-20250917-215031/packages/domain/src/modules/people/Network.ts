export interface PeopleNetwork {
  id: string;
  personId: string;
  connectedPersonId: string;
  relationshipType?: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength?: number; // 1-5 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeopleNetworkRequest {
  personId: string;
  connectedPersonId: string;
  relationshipType?: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength?: number;
  notes?: string;
}

export interface UpdatePeopleNetworkRequest {
  relationshipType?: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength?: number;
  notes?: string;
}

export interface NetworkFilters {
  personId?: string;
  connectedPersonId?: string;
  relationshipType?: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  strength?: number;
}

export interface PeopleNetworkRepository {
  findById(id: string): Promise<PeopleNetwork | null>;
  findByPerson(personId: string, filters?: NetworkFilters): Promise<PeopleNetwork[]>;
  findByConnection(personId: string, connectedPersonId: string): Promise<PeopleNetwork | null>;
  findByRelationshipType(relationshipType: string): Promise<PeopleNetwork[]>;
  create(network: CreatePeopleNetworkRequest): Promise<PeopleNetwork>;
  update(id: string, updates: UpdatePeopleNetworkRequest): Promise<PeopleNetwork>;
  delete(id: string): Promise<void>;
  bulkCreate(networks: CreatePeopleNetworkRequest[]): Promise<PeopleNetwork[]>;
  bulkUpdate(updates: Array<{ id: string; updates: UpdatePeopleNetworkRequest }>): Promise<PeopleNetwork[]>;
  bulkDelete(ids: string[]): Promise<void>;
  getNetworkSize(personId: string): Promise<number>;
  getStrongestConnections(personId: string, limit?: number): Promise<PeopleNetwork[]>;
  findMutualConnections(personId1: string, personId2: string): Promise<PeopleNetwork[]>;
}

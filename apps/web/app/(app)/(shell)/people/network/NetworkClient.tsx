'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button, UnifiedInput, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Search, Users, Network, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

interface NetworkConnection {
  id: string;
  person_id: string;
  connected_person_id: string;
  relationship_type: 'colleague' | 'mentor' | 'mentee' | 'collaborator' | 'friend' | 'professional';
  strength: 'weak' | 'moderate' | 'strong';
  notes?: string;
  created_at: string;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
  connected_person?: {
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    department?: string;
  };
}

interface NetworkStats {
  totalConnections: number;
  strongConnections: number;
  departmentConnections: { [key: string]: number };
  relationshipTypes: { [key: string]: number };
}

interface NetworkClientProps {
  orgId: string;
}

export default function NetworkClient({ orgId }: NetworkClientProps) {
  const t = useTranslations('people.network');
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalConnections: 0,
    strongConnections: 0,
    departmentConnections: {},
    relationshipTypes: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<string>('');
  const [selectedStrength, setSelectedStrength] = useState<string>('');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadNetworkData();
  }, [orgId, selectedRelationshipType, selectedStrength]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('people_network')
        .select(`
          *,
          person:people!people_network_person_id_fkey(first_name, last_name, email, role, department),
          connected_person:people!people_network_connected_person_id_fkey(first_name, last_name, email, role, department)
        `)
        .order('created_at', { ascending: false });

      if (selectedRelationshipType) {
        query = query.eq('relationship_type', selectedRelationshipType);
      }

      if (selectedStrength) {
        query = query.eq('strength', selectedStrength);
      }

      const { data, error } = await query;
      if (error) throw error;

      setConnections(data || []);

      // Calculate stats
      const totalConnections = data?.length || 0;
      const strongConnections = data?.filter(c => c.strength === 'strong').length || 0;
      
      const departmentConnections: { [key: string]: number } = {};
      const relationshipTypes: { [key: string]: number } = {};

      data?.forEach(connection => {
        const dept = connection.person?.department || 'Unknown';
        departmentConnections[dept] = (departmentConnections[dept] || 0) + 1;
        
        const type = connection.relationship_type;
        relationshipTypes[type] = (relationshipTypes[type] || 0) + 1;
      });

      setStats({
        totalConnections,
        strongConnections,
        departmentConnections,
        relationshipTypes
      });
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(connection => {
    const searchLower = searchQuery.toLowerCase();
    return (
      connection.person?.first_name?.toLowerCase().includes(searchLower) ||
      connection.person?.last_name?.toLowerCase().includes(searchLower) ||
      connection.connected_person?.first_name?.toLowerCase().includes(searchLower) ||
      connection.connected_person?.last_name?.toLowerCase().includes(searchLower) ||
      connection.notes?.toLowerCase().includes(searchLower)
    );
  });

  const relationshipTypes = [
    { value: 'colleague', label: t('colleague'), color: 'bg-accent/10 color-accent' },
    { value: 'mentor', label: t('mentor'), color: 'bg-secondary/10 color-secondary' },
    { value: 'mentee', label: t('mentee'), color: 'bg-success/10 color-success' },
    { value: 'collaborator', label: t('collaborator'), color: 'bg-warning/10 color-warning' },
    { value: 'friend', label: t('friend'), color: 'bg-accent/10 color-accent' },
    { value: 'professional', label: t('professional'), color: 'bg-secondary/50 color-muted' }
  ];

  const strengthLevels = [
    { value: 'weak', label: t('weak'), color: 'bg-destructive/10 color-destructive' },
    { value: 'moderate', label: t('moderate'), color: 'bg-warning/10 color-warning' },
    { value: 'strong', label: t('strong'), color: 'bg-success/10 color-success' }
  ];

  if (loading) {
    return (
      <div className="stack-md">
        <Card title={t('title')}>
          <div className="flex items-center justify-center py-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">{t('title')}</h1>
          <p className="color-muted">{t('subtitle')}</p>
        </div>
        <Button className="flex items-center cluster-sm">
          <Plus className="h-4 w-4" />
          <span>{t('addConnection')}</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('totalConnections')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalConnections}</p>
            </div>
            <Network className="h-8 w-8 color-accent" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('strongConnections')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.strongConnections}</p>
            </div>
            <Users className="h-8 w-8 color-success" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('departments')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{Object.keys(stats.departmentConnections).length}</p>
            </div>
            <MessageCircle className="h-8 w-8 color-secondary" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-md">
            <div>
              <p className="text-body-sm form-label color-muted">{t('relationshipTypes')}</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{Object.keys(stats.relationshipTypes).length}</p>
            </div>
            <Calendar className="h-8 w-8 color-warning" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-md stack-md">
          <div className="flex flex-col sm:flex-row gap-md">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-muted" />
                <UnifiedInput                   placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
            </div>
            <select
              value={selectedRelationshipType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedRelationshipType(e.target.value)}
              className=" px-md py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allRelationships')}</option>
              {relationshipTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={selectedStrength}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedStrength(e.target.value)}
              className=" px-md py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allStrengths')}</option>
              {strengthLevels.map(strength => (
                <option key={strength.value} value={strength.value}>
                  {strength.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Network Connections */}
      <div className="stack-md">
        {filteredConnections.map((connection: any) => {
          const relationshipType = relationshipTypes.find(t => t.value === connection.relationship_type);
          const strength = strengthLevels.find(s => s.value === connection.strength);
          
          return (
            <Card key={connection.id}>
              <div className="p-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center cluster">
                    <div className="flex items-center cluster-sm">
                      <div className="text-body-sm">
                        <span className="form-label">
                          {connection.person?.first_name} {connection.person?.last_name}
                        </span>
                        {connection.person?.role && (
                          <span className="color-muted ml-xs">({connection.person.role})</span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 color-muted" />
                      <div className="text-body-sm">
                        <span className="form-label">
                          {connection.connected_person?.first_name} {connection.connected_person?.last_name}
                        </span>
                        {connection.connected_person?.role && (
                          <span className="color-muted ml-xs">({connection.connected_person.role})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center cluster-sm">
                    {relationshipType && (
                      <Badge className={relationshipType.color}>
                        {relationshipType.label}
                      </Badge>
                    )}
                    {strength && (
                      <Badge className={strength.color}>
                        {strength.label}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {connection.notes && (
                  <div className="mt-sm text-body-sm color-muted">
                    {connection.notes}
                  </div>
                )}
                
                <div className="mt-sm text-body-sm color-muted/70">
                  {t('connected')} {new Date(connection.created_at).toLocaleDateString()}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredConnections.length === 0 && (
        <Card>
          <div className="text-center py-xl">
            <Network className="h-12 w-12 color-muted/50 mx-auto mb-md" />
            <p className="color-muted">{t('noConnections')}</p>
            <p className="text-body-sm color-muted/70 mt-sm">{t('startBuilding')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

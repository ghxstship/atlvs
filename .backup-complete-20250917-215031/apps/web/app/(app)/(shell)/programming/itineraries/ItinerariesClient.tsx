'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Drawer } from '@ghxstship/ui';
import { EmptyState } from '@ghxstship/ui';
import { createServerClient } from '@ghxstship/auth';

// Types
interface Itinerary {
  id: string;
  name: string;
  description?: string;
  type: 'business' | 'personal' | 'crew' | 'training' | 'event';
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  org_id: string;
}

interface ItinerariesClientProps {
  user: any;
  orgId: string;
}

// Constants
const ITINERARY_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'default' as const },
  { value: 'confirmed', label: 'Confirmed', color: 'info' as const },
  { value: 'in_progress', label: 'In Progress', color: 'warning' as const },
  { value: 'completed', label: 'Completed', color: 'success' as const },
  { value: 'cancelled', label: 'Cancelled', color: 'destructive' as const }
];

export default function ItinerariesClient({ user, orgId }: ItinerariesClientProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const supabase = createServerClient({
    get: () => ({ name: '', value: '' }),
    set: () => {},
    remove: () => {}
  });

  useEffect(() => {
    fetchItineraries();
  }, [orgId]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      console.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const getStatusColor = (status: string): import('@ghxstship/ui').BadgeProps['variant'] => {
    const statusConfig = ITINERARY_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'default';
  };

  // Filter itineraries
  const filteredItineraries = itineraries.filter(itinerary => {
    const matchesSearch = itinerary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itinerary.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Itineraries</h1>
          <p className="color-muted">
            Manage travel schedules and itineraries
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-sm">
          <Plus className="h-4 w-4" />
          New Itinerary
        </Button>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted h-4 w-4" />
          <Input
            placeholder="Search itineraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Views */}
      {filteredItineraries.length === 0 ? (
        <EmptyState
          icon={<Plus />}
          title="No itineraries found"
          description="Create your first itinerary to get started with travel and schedule management."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mt-4">
          {filteredItineraries.map((itinerary) => (
            <div key={itinerary.id} className="p-md border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="form-label">{itinerary.name}</h3>
                <Badge variant={getStatusColor(itinerary.status)}>
                  {itinerary.status}
                </Badge>
              </div>
              {itinerary.description && (
                <p className="text-body-sm color-muted mb-3">{itinerary.description}</p>
              )}
              <div className="flex items-center gap-sm text-body-sm color-muted">
                <Calendar className="h-3 w-3" />
                {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Drawer */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Itinerary"
      >
        <div>Create form placeholder</div>
      </Drawer>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import { Drawer } from '@ghxstship/ui';

// Type definitions
type DataRecord = Record<string, unknown>;

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

// Profile field configuration for future ATLVS integration
// Reserved for future ATLVS integration
const _fieldConfig: FieldConfig[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'text',
    width: 100,
    sortable: true,
    filterable: false
  },
  {
    key: 'full_name',
    label: 'Full Name',
    type: 'text',
    width: 200,
    sortable: true,
    filterable: true,
    required: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    width: 250,
    sortable: true,
  // eslint-disable-next-line react-hooks/exhaustive-deps
    filterable: true,
    required: true
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    width: 180,
    sortable: true,
    filterable: true
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    width: 180,
    sortable: true,
    filterable: true
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    width: 200,
    sortable: true,
    filterable: true
  },
  {
    key: 'bio',
    label: 'Bio',
    type: 'textarea',
    width: 300,
    sortable: false,
    filterable: true
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'text',
    width: 250,
    sortable: false,
    filterable: true
  },
  {
    key: 'achievements',
    label: 'Achievements',
    type: 'text',
    width: 250,
    sortable: false,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    width: 120,
    sortable: true,
    filterable: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date',
    width: 150,
    sortable: true,
    filterable: true
  }
];

export default function ProfileClient({ orgId, userId: _userId, userEmail: _userEmail }: { orgId: string; userId: string; userEmail: string }) {
  const [profiles, setProfiles] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  // Load profiles from Supabase
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, supabase]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return (
    <div className="h-full">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Profiles</h1>
          <button
            onClick={() => loadProfiles()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No profiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const profileId = typeof profile.id === 'string' ? profile.id : String(profile.id);
              const fullName = typeof profile.full_name === 'string' ? profile.full_name : 'Unknown';
              const email = typeof profile.email === 'string' ? profile.email : '';
              const title = typeof profile.title === 'string' ? profile.title : '';
              const department = typeof profile.department === 'string' ? profile.department : '';
              
              return (
                <div key={profileId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{fullName}</h3>
                  {email && <p className="text-sm text-gray-600">{email}</p>}
                  {title && <p className="text-sm text-gray-700 mt-1">{title}</p>}
                  {department && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {department}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer title="Profile Details" open={false} onClose={() => {}}>
          <div className="p-4">
            <p className="text-gray-600">Profile details will be displayed here.</p>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

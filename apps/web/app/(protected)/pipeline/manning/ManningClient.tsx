'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { Plus, Users, UserCheck, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface ManningSlot {
  id: string;
  projectId: string;
  role: string;
  requiredCount: number;
  filledCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ManningClientProps {
  orgId: string;
}

export default function ManningClient({ orgId }: ManningClientProps) {
  const t = useTranslations('pipeline.manning');
  const supabase = createBrowserClient();
  const [slots, setSlots] = useState<ManningSlot[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [formData, setFormData] = useState({
    projectId: '',
    role: '',
    requiredCount: 1
  });

  useEffect(() => {
    loadProjects();
  }, [orgId]);

  useEffect(() => {
    if (selectedProject) {
      loadManningSlots(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadManningSlots = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manning_slots')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading manning slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.role) return;

    try {
      const { data, error } = await supabase
        .from('manning_slots')
        .insert({
          project_id: formData.projectId,
          role: formData.role,
          required_count: formData.requiredCount,
          filled_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setSlots(prev => [data, ...prev]);
      setFormData({ projectId: '', role: '', requiredCount: 1 });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating manning slot:', error);
    }
  };

  const getStatusBadge = (slot: ManningSlot) => {
    const percentage = (slot.filledCount / slot.requiredCount) * 100;
    if (percentage === 100) {
      return <Badge variant="success" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Fully Staffed</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="warning" className="flex items-center gap-1"><Users className="w-3 h-3" />Partially Staffed</Badge>;
    } else {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Understaffed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Manning Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage project staffing requirements and assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Manning Slot
        </Button>
      </div>

      {/* Project Selection */}
      <Card>
        <div className="p-4">
          <label className="block text-sm font-medium mb-2">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a project...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.status})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Add Manning Slot Form */}
      {showForm && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Add Manning Slot</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Camera Operator, Sound Engineer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required Count</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.requiredCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredCount: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Slot</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Manning Slots List */}
      {selectedProject && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Manning Slots</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading manning slots...</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No manning slots found for this project.
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{slot.role}</h4>
                      <p className="text-sm text-muted-foreground">
                        {slot.filledCount} of {slot.requiredCount} positions filled
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round((slot.filledCount / slot.requiredCount) * 100)}%
                        </div>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(slot.filledCount / slot.requiredCount) * 100}%` }}
                          />
                        </div>
                      </div>
                      {getStatusBadge(slot)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

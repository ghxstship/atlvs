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
      return <Badge variant="success" className="flex items-center gap-xs"><UserCheck className="w-3 h-3" />Fully Staffed</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="warning" className="flex items-center gap-xs"><Users className="w-3 h-3" />Partially Staffed</Badge>;
    } else {
      return <Badge variant="destructive" className="flex items-center gap-xs"><AlertCircle className="w-3 h-3" />Understaffed</Badge>;
    }
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Manning Pipeline</h1>
          <p className="text-body-sm color-muted">Manage project staffing requirements and assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-sm">
          <Plus className="w-4 h-4" />
          Add Manning Slot
        </Button>
      </div>

      {/* Project Selection */}
      <Card>
        <div className="p-md">
          <label className="block text-body-sm form-label mb-sm">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-sm py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="p-md">
            <h3 className="text-body text-heading-4 mb-md">Add Manning Slot</h3>
            <form onSubmit={handleSubmit} className="stack-md">
              <div>
                <label className="block text-body-sm form-label mb-xs">Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-sm py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                <label className="block text-body-sm form-label mb-xs">Role</label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Camera Operator, Sound Engineer"
                  required
                />
              </div>
              <div>
                <label className="block text-body-sm form-label mb-xs">Required Count</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.requiredCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredCount: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="flex gap-sm">
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
          <div className="p-md">
            <h3 className="text-body text-heading-4 mb-md">Manning Slots</h3>
            {loading ? (
              <div className="text-center py-xl color-muted">Loading manning slots...</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-xl color-muted">
                No manning slots found for this project.
              </div>
            ) : (
              <div className="stack-sm">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-md border rounded-lg">
                    <div className="flex-1">
                      <h4 className="form-label">{slot.role}</h4>
                      <p className="text-body-sm color-muted">
                        {slot.filledCount} of {slot.requiredCount} positions filled
                      </p>
                    </div>
                    <div className="flex items-center gap-md">
                      <div className="text-right">
                        <div className="text-body-sm form-label">
                          {Math.round((slot.filledCount / slot.requiredCount) * 100)}%
                        </div>
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
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

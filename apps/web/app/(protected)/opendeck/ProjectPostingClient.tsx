'use client';

import { useState, useEffect } from 'react';
import { 
  Card, Button, Badge, Input, Textarea, Select, SelectContent, 
  SelectItem, SelectTrigger, SelectValue, Drawer 
} from '@ghxstship/ui';
import { 
  Plus, Edit, Trash2, Eye, Send, Calendar, DollarSign, 
  MapPin, Users, Clock, Paperclip, Tag, Filter, Search,
  ChevronRight, Star, TrendingUp, AlertCircle
} from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  scope: z.string().min(20, 'Scope must be at least 20 characters'),
  skills_required: z.array(z.string()).min(1, 'At least one skill is required'),
  experience_level: z.enum(['entry', 'intermediate', 'expert']),
  budget_type: z.enum(['fixed', 'hourly', 'not_specified']),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration: z.string().optional(),
  is_urgent: z.boolean().default(false),
  location_type: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  visibility: z.enum(['public', 'private', 'invite_only']).default('public')
});

type ProjectForm = z.infer<typeof projectSchema>;

interface ProjectPostingClientProps {
  userId: string;
  orgId: string;
}

export default function ProjectPostingClient({ userId, orgId }: ProjectPostingClientProps) {
  const supabase = createBrowserClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      currency: 'USD',
      visibility: 'public',
      is_urgent: false
    }
  });

  const categories = [
    'Audio & Sound',
    'Lighting Design',
    'Stage Production',
    'Video & Projection',
    'Event Management',
    'Artist Services',
    'Logistics & Transport',
    'Catering & Hospitality',
    'Security & Safety',
    'Marketing & Promotion'
  ];

  const skillsList = [
    'Live Sound Engineering',
    'Stage Design',
    'Lighting Programming',
    'Video Production',
    'Event Planning',
    'Artist Management',
    'Technical Direction',
    'Project Management',
    'Budget Management',
    'Team Leadership'
  ];

  useEffect(() => {
    loadProjects();
  }, [userId, orgId]);

  async function loadProjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opendeck_projects')
        .select(`
          *,
          proposals:opendeck_proposals(count)
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: ProjectForm) {
    try {
      const projectData = {
        ...data,
        client_id: userId,
        organization_id: orgId,
        status: 'open'
      };

      if (selectedProject) {
        const { error } = await supabase
          .from('opendeck_projects')
          .update(projectData)
          .eq('id', selectedProject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('opendeck_projects')
          .insert(projectData);

        if (error) throw error;
      }

      setDrawerOpen(false);
      reset();
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }

  function openProjectDrawer(project?: any) {
    if (project) {
      setSelectedProject(project);
      reset(project);
    } else {
      setSelectedProject(null);
      reset();
    }
    setDrawerOpen(true);
  }

  async function deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('opendeck_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-muted-foreground">{project.category}</p>
        </div>
        <Badge variant={
          project.status === 'open' ? 'success' : 
          project.status === 'in_progress' ? 'warning' : 
          'secondary'
        }>
          {project.status}
        </Badge>
      </div>

      <p className="text-sm line-clamp-3 mb-4">{project.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
          {project.budget_type === 'fixed' ? 
            `$${project.budget_min?.toLocaleString()} - $${project.budget_max?.toLocaleString()}` :
            project.budget_type === 'hourly' ?
            `$${project.budget_min}/hr` :
            'Budget not specified'
          }
        </div>
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {project.duration || 'Timeline flexible'}
        </div>
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          {project.location_type || 'Remote'}
        </div>
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          {project.proposals?.[0]?.count || 0} proposals
        </div>
      </div>

      {project.is_urgent && (
        <Badge variant="destructive" className="mb-4">
          <AlertCircle className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      )}

      <div className="flex space-x-2">
        <Button variant="outline" className="flex-1" onClick={() => openProjectDrawer(project)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="ghost" onClick={() => deleteProject(project.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project Postings</h2>
          <p className="text-muted-foreground">Manage your project briefs and proposals</p>
        </div>
        <Button onClick={() => openProjectDrawer()}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
             
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
             
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
      </Card>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Paperclip className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Post your first project to start receiving proposals from vendors
            </p>
            <Button onClick={() => openProjectDrawer()}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredProjects.map(project => (
              <div key={project.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant={
                        project.status === 'open' ? 'success' : 
                        project.status === 'in_progress' ? 'warning' : 
                        'secondary'
                      }>
                        {project.status}
                      </Badge>
                      {project.is_urgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{project.category}</span>
                      <span>•</span>
                      <span>{project.proposals?.[0]?.count || 0} proposals</span>
                      <span>•</span>
                      <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => openProjectDrawer(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Project Form Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProject(null);
          reset();
        }}
        title={selectedProject ? 'Edit Project' : 'Post New Project'}
       
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Project Title</label>
            <Input 
              {...register('title')} 
              placeholder="e.g., Stage Design for Music Festival"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <Select 
              value={watch('category')} 
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              {...register('description')} 
              placeholder="Describe your project requirements in detail..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Scope of Work</label>
            <Textarea 
              {...register('scope')} 
              placeholder="Define the scope and deliverables..."
              rows={3}
            />
            {errors.scope && (
              <p className="text-sm text-destructive mt-1">{errors.scope.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Budget Type</label>
              <Select 
                value={watch('budget_type')} 
                onValueChange={(value) => setValue('budget_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="not_specified">Not Specified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Experience Level</label>
              <Select 
                value={watch('experience_level')} 
                onValueChange={(value) => setValue('experience_level', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {watch('budget_type') !== 'not_specified' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {watch('budget_type') === 'hourly' ? 'Min Rate' : 'Min Budget'}
                </label>
                <Input 
                  {...register('budget_min', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {watch('budget_type') === 'hourly' ? 'Max Rate' : 'Max Budget'}
                </label>
                <Input 
                  {...register('budget_max', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('is_urgent')}
              className="rounded border-border"
            />
            <label className="text-sm">Mark as urgent project</label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : selectedProject ? 'Update Project' : 'Post Project'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

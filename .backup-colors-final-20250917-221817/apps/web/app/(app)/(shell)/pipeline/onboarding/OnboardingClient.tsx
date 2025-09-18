'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Textarea } from '@ghxstship/ui';
import { Plus, CheckCircle, Clock, AlertCircle, User, FileText, Shield, Briefcase } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface OnboardingTask {
  id: string;
  name: string;
  description?: string;
  category: 'documentation' | 'training' | 'equipment' | 'access' | 'compliance';
  required: boolean;
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OnboardingWorkflow {
  id: string;
  personId: string;
  personName: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  expectedCompletionDate?: string;
  completedDate?: string;
  progress: number;
  tasks: OnboardingTask[];
  createdAt?: string;
  updatedAt?: string;
}

interface OnboardingClientProps {
  orgId: string;
}

const TASK_CATEGORIES = [
  { id: 'documentation', name: 'Documentation', icon: FileText, color: 'bg-info' },
  { id: 'training', name: 'Training', icon: User, color: 'bg-success' },
  { id: 'equipment', name: 'Equipment', icon: Briefcase, color: 'bg-secondary' },
  { id: 'access', name: 'Access & Credentials', icon: Shield, color: 'bg-warning' },
  { id: 'compliance', name: 'Compliance', icon: AlertCircle, color: 'bg-destructive' }
] as const;

const DEFAULT_TASKS: Omit<OnboardingTask, 'id'>[] = [
  {
    name: 'Complete W-4 Tax Form',
    description: 'Fill out and submit federal tax withholding form',
    category: 'documentation',
    required: true,
    completed: false
  },
  {
    name: 'Emergency Contact Information',
    description: 'Provide emergency contact details',
    category: 'documentation',
    required: true,
    completed: false
  },
  {
    name: 'Safety Training Orientation',
    description: 'Complete mandatory safety training session',
    category: 'training',
    required: true,
    completed: false
  },
  {
    name: 'Equipment Assignment',
    description: 'Receive and sign for assigned equipment',
    category: 'equipment',
    required: true,
    completed: false
  },
  {
    name: 'Site Access Badge',
    description: 'Obtain site access credentials and badge',
    category: 'access',
    required: true,
    completed: false
  },
  {
    name: 'Background Check Verification',
    description: 'Complete background check process',
    category: 'compliance',
    required: true,
    completed: false
  },
  {
    name: 'Department Introduction',
    description: 'Meet with department head and team members',
    category: 'training',
    required: false,
    completed: false
  },
  {
    name: 'Company Handbook Review',
    description: 'Read and acknowledge company policies',
    category: 'documentation',
    required: true,
    completed: false
  }
];

export default function OnboardingClient({ orgId }: OnboardingClientProps) {
  const t = useTranslations('pipeline.onboarding');
  const supabase = createBrowserClient();
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<OnboardingWorkflow | null>(null);
  const [formData, setFormData] = useState({
    personId: '',
    projectId: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: ''
  });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load people
      const { data: peopleData } = await supabase
        .from('people')
        .select('id, first_name, last_name, email')
        .eq('organization_id', orgId)
        .order('first_name');

      setPeople(peopleData || []);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('organization_id', orgId)
        .order('name');

      setProjects(projectsData || []);

      // Create mock workflows for demonstration
      const mockWorkflows: OnboardingWorkflow[] = [
        {
          id: '1',
          personId: peopleData?.[0]?.id || 'mock-person-1',
          personName: peopleData?.[0] ? `${peopleData[0].first_name} ${peopleData[0].last_name}` : 'Jack Sparrow',
          projectId: projectsData?.[0]?.id || 'mock-project-1',
          projectName: projectsData?.[0]?.name || 'Blackwater Reverb',
          status: 'in_progress',
          startDate: '2024-01-15',
          expectedCompletionDate: '2024-01-22',
          progress: 62,
          tasks: DEFAULT_TASKS.map((task, index) => ({
            ...task,
            id: `task-${index + 1}`,
            completed: index < 5,
            assignedTo: 'HR Department',
            dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })),
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          personId: peopleData?.[1]?.id || 'mock-person-2',
          personName: peopleData?.[1] ? `${peopleData[1].first_name} ${peopleData[1].last_name}` : 'Elizabeth Swann',
          projectId: projectsData?.[0]?.id || 'mock-project-1',
          projectName: projectsData?.[0]?.name || 'Blackwater Reverb',
          status: 'pending',
          startDate: '2024-01-20',
          expectedCompletionDate: '2024-01-27',
          progress: 0,
          tasks: DEFAULT_TASKS.map((task, index) => ({
            ...task,
            id: `task-2-${index + 1}`,
            completed: false,
            assignedTo: 'HR Department',
            dueDate: new Date(Date.now() + (index + 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })),
          createdAt: '2024-01-18T14:30:00Z'
        }
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personId || !formData.projectId) return;

    const selectedPerson = people.find(p => p.id === formData.personId);
    const selectedProject = projects.find(p => p.id === formData.projectId);

    const newWorkflow: OnboardingWorkflow = {
      id: `workflow-${Date.now()}`,
      personId: formData.personId,
      personName: selectedPerson ? `${selectedPerson.first_name} ${selectedPerson.last_name}` : 'Unknown',
      projectId: formData.projectId,
      projectName: selectedProject?.name || 'Unknown Project',
      status: 'pending',
      startDate: formData.startDate,
      expectedCompletionDate: formData.expectedCompletionDate,
      progress: 0,
      tasks: DEFAULT_TASKS.map((task, index) => ({
        ...task,
        id: `task-new-${index + 1}`,
        completed: false,
        assignedTo: 'HR Department',
        dueDate: new Date(new Date(formData.startDate).getTime() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      createdAt: new Date().toISOString()
    };

    setWorkflows(prev => [newWorkflow, ...prev]);
    setFormData({ personId: '', projectId: '', startDate: new Date().toISOString().split('T')[0], expectedCompletionDate: '' });
    setShowForm(false);
  };

  const toggleTaskCompletion = (workflowId: string, taskId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === workflowId) {
        const updatedTasks = workflow.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const progress = Math.round((completedTasks / updatedTasks.length) * 100);
        
        return {
          ...workflow,
          tasks: updatedTasks,
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'
        };
      }
      return workflow;
    }));
  };

  const getStatusBadge = (status: OnboardingWorkflow['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-xs"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="warning" className="flex items-center gap-xs"><Clock className="w-3 h-3" />In Progress</Badge>;
      case 'on_hold':
        return <Badge variant="secondary" className="flex items-center gap-xs"><AlertCircle className="w-3 h-3" />On Hold</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-xs"><Clock className="w-3 h-3" />Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: OnboardingTask['category']) => {
    const categoryInfo = TASK_CATEGORIES.find(cat => cat.id === category);
    if (!categoryInfo) return FileText;
    return categoryInfo.icon;
  };

  const getCategoryColor = (category: OnboardingTask['category']) => {
    const categoryInfo = TASK_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-secondary-foreground';
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Onboarding Pipeline</h1>
          <p className="text-body-sm color-muted">Manage crew onboarding workflows and task completion</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-sm">
          <Plus className="w-4 h-4" />
          New Onboarding
        </Button>
      </div>

      {/* Create Workflow Form */}
      {showForm && (
        <Card>
          <div className="p-md">
            <h3 className="text-body text-heading-4 mb-md">Create Onboarding Workflow</h3>
            <form onSubmit={handleCreateWorkflow} className="stack-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Person</label>
                  <select
                    value={formData.personId}
                    onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                    className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    required
                  >
                    <option value="">Select person...</option>
                    {people.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
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
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-body-sm form-label mb-xs">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-body-sm form-label mb-xs">Expected Completion</label>
                  <Input
                    type="date"
                    value={formData.expectedCompletionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedCompletionDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-sm">
                <Button type="submit">Create Workflow</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Workflows List */}
      {loading ? (
        <Card>
          <div className="p-xl text-center color-muted">Loading onboarding workflows...</div>
        </Card>
      ) : workflows.length === 0 ? (
        <Card>
          <div className="p-xl text-center color-muted">
            No onboarding workflows found. Create one to get started.
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {workflows.map(workflow => (
            <Card key={workflow.id}>
              <div className="p-md">
                <div className="flex items-center justify-between mb-md">
                  <div className="flex-1">
                    <h3 className="text-body text-heading-4">{workflow.personName}</h3>
                    <p className="text-body-sm color-muted">{workflow.projectName}</p>
                    <div className="flex items-center gap-md mt-sm">
                      <span className="text-body-sm color-muted">
                        Started: {new Date(workflow.startDate).toLocaleDateString()}
                      </span>
                      {workflow.expectedCompletionDate && (
                        <span className="text-body-sm color-muted">
                          Expected: {new Date(workflow.expectedCompletionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="text-right">
                      <div className="text-body-sm form-label">{workflow.progress}%</div>
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${workflow.progress}%` }}
                        />
                      </div>
                    </div>
                    {getStatusBadge(workflow.status)}
                  </div>
                </div>

                {/* Tasks */}
                <div className="stack-sm">
                  <h4 className="text-body-sm form-label color-muted mb-sm">Tasks ({workflow.tasks.filter(t => t.completed).length}/{workflow.tasks.length})</h4>
                  {workflow.tasks.map(task => {
                    const IconComponent = getCategoryIcon(task.category);
                    return (
                      <div key={task.id} className="flex items-center gap-sm p-sm border rounded-lg">
                        <button
                          onClick={() => toggleTaskCompletion(workflow.id, task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.completed 
                              ? 'bg-success border-success color-success-foreground' 
                              : 'border-border hover:border-success'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(task.category)}`}>
                          <IconComponent className="w-4 h-4 color-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className={`form-label ${task.completed ? 'line-through color-muted' : ''}`}>
                            {task.name}
                            {task.required && <span className="color-destructive ml-xs">*</span>}
                          </div>
                          {task.description && (
                            <div className="text-body-sm color-muted">{task.description}</div>
                          )}
                          <div className="flex items-center gap-md mt-xs text-body-sm color-muted">
                            <span>Category: {TASK_CATEGORIES.find(cat => cat.id === task.category)?.name}</span>
                            {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                            {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                          </div>
                        </div>
                        <Badge variant={task.required ? 'destructive' : 'secondary'} className="text-body-sm">
                          {task.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

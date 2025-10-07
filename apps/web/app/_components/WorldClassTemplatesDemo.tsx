'use client';

import React, { useState, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Settings,
  FileText,
  Calendar,
  CheckSquare,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  Share,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight,
  Home,
  Briefcase,
  Shield,
  Palette
} from 'lucide-react';
import { Button } from '@ghxstship/ui/atoms';
import { Badge } from '@ghxstship/ui/atoms';
import { Avatar } from '@ghxstship/ui/atoms';
import { TaskCard, type Task } from '@ghxstship/ui/organisms';
import { BoardView, type BoardColumn } from '@ghxstship/ui/organisms';
import { DashboardWidget, type WidgetConfig } from '@ghxstship/ui/organisms';
import { DashboardLayout } from '@ghxstship/ui/templates';
import { ListLayout } from '@ghxstship/ui/templates';
import { DetailLayout } from '@ghxstship/ui/templates';
import { SettingsLayout } from '@ghxstship/ui/templates';
import { OnboardingLayout } from '@ghxstship/ui/templates';

// Complete world-class interface demonstration using all templates
export default function WorldClassTemplatesDemo() {
  // Active view state
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'project-detail' | 'settings' | 'onboarding'>('dashboard');
  const [activeSettingsSection, setActiveSettingsSection] = useState('general');
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  // Sample data
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create a modern, responsive landing page for Q1 campaign',
      status: 'in_progress',
      priority: 'high',
      assignee: { id: '1', name: 'Alice Johnson', avatar: undefined },
      dueDate: new Date('2024-01-15'),
      tags: ['design', 'frontend'],
      project: { id: 'p1', name: 'Q1 Campaign', color: '#3b82f6' },
      subtasks: { total: 5, completed: 3 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      title: 'Implement user authentication',
      status: 'review',
      priority: 'urgent',
      assignee: { id: '2', name: 'Bob Smith', avatar: undefined },
      dueDate: new Date('2024-01-12'),
      tags: ['backend', 'security'],
      subtasks: { total: 8, completed: 8 },
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-11'),
    },
  ];

  const boardColumns: BoardColumn[] = [
    { id: 'todo', title: 'To Do', status: 'todo', color: '#6b7280', tasks: sampleTasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: '#3b82f6', tasks: sampleTasks.filter(t => t.status === 'in_progress') },
    { id: 'review', title: 'Review', status: 'review', color: '#f59e0b', tasks: sampleTasks.filter(t => t.status === 'review') },
    { id: 'done', title: 'Done', status: 'done', color: '#10b981', tasks: sampleTasks.filter(t => t.status === 'done') },
  ];

  const dashboardWidgets: WidgetConfig[] = [
    {
      id: 'tasks-overview',
      type: 'metric',
      title: 'Total Tasks',
      size: { width: 1, height: 1 },
      position: { x: 0, y: 0 },
      data: {
        value: sampleTasks.length,
        trend: 'up',
        change: 12,
        changeType: 'percentage',
      },
    },
    {
      id: 'completion-rate',
      type: 'chart',
      title: 'Task Completion',
      size: { width: 2, height: 2 },
      position: { x: 1, y: 0 },
      data: {
        type: 'bar',
        data: [
          { label: 'To Do', value: 5 },
          { label: 'In Progress', value: 8 },
          { label: 'Review', value: 3 },
          { label: 'Done', value: 15 },
        ],
      },
    },
    {
      id: 'recent-activity',
      type: 'activity',
      title: 'Recent Activity',
      size: { width: 1, height: 2 },
      position: { x: 0, y: 1 },
      data: {
        activities: [
          { id: '1', user: 'Alice', action: 'completed', item: 'Design review', time: '2 hours ago' },
          { id: '2', user: 'Bob', action: 'started', item: 'API integration', time: '4 hours ago' },
          { id: '3', user: 'Carol', action: 'commented on', item: 'User authentication', time: '6 hours ago' },
        ],
      },
    },
  ];

  // Handlers
  const handleTaskClick = useCallback((task: Task) => {
    console.log('Task clicked:', task.title);
    setActiveView('project-detail');
  }, []);

  const handleTaskEdit = useCallback((task: Task) => {
    console.log('Edit task:', task.title);
  }, []);

  const handleTaskDelete = useCallback((task: Task) => {
    console.log('Delete task:', task.title);
  }, []);

  const handleTaskMove = useCallback((taskId: string, fromColumnId: string, toColumnId: string) => {
    console.log('Task moved:', taskId, 'from', fromColumnId, 'to', toColumnId);
  }, []);

  const handleTaskCreate = useCallback((columnId: string) => {
    console.log('Create task in column:', columnId);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    console.log('Saving settings...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Settings saved!');
  }, []);

  const handleCompleteOnboarding = useCallback(() => {
    console.log('Onboarding completed!');
    setActiveView('dashboard');
  }, []);

  // Settings sections
  const settingsSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to ATLVS',
      description: 'Let\'s get you set up with a world-class project management experience.',
      icon: Home,
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us a bit about yourself to personalize your experience.',
      icon: User,
      required: true,
    },
    {
      id: 'workspace',
      title: 'Set Up Your Workspace',
      description: 'Create your first project and invite your team.',
      icon: Briefcase,
    },
    {
      id: 'preferences',
      title: 'Customize Your Experience',
      description: 'Configure notifications and preferences to match your workflow.',
      icon: Settings,
    },
  ];

  // Render different views
  const renderDashboard = () => (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your projects."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
      sidebar={
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button className="w-full justify-start" variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite Team
              </Button>
              <Button
                className="w-full justify-start"
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('projects')}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                View Projects
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recent Projects</h3>
            <div className="space-y-2">
              <div className="p-2 rounded hover:bg-muted cursor-pointer">
                <div className="font-medium text-sm">Q1 Campaign</div>
                <div className="text-xs text-muted-foreground">5 tasks • 2 overdue</div>
              </div>
              <div className="p-2 rounded hover:bg-muted cursor-pointer">
                <div className="font-medium text-sm">Website Redesign</div>
                <div className="text-xs text-muted-foreground">12 tasks • On track</div>
              </div>
            </div>
          </div>
        </div>
      }
      rightPanel={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Team Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar size="sm" fallback="A" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">Alice</span> completed the landing page design
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Avatar size="sm" fallback="B" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">Bob</span> started working on API integration
                  </p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">User Authentication</div>
                <div className="text-xs text-muted-foreground">Due tomorrow</div>
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-4 gap-4 auto-rows-min">
        {dashboardWidgets.map(widget => (
          <DashboardWidget
            key={widget.id}
            config={widget}
            editable={true}
            draggable={true}
            resizable={true}
          />
        ))}
      </div>
    </DashboardLayout>
  );

  const renderProjects = () => (
    <ListLayout
      title="Projects"
      subtitle="Manage and track all your projects in one place"
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      }
      search={{
        value: '',
        onChange: (value) => console.log('Search:', value),
        placeholder: 'Search projects...',
      }}
      filters={{
        activeCount: 2,
        onClear: () => console.log('Clear filters'),
      }}
      sort={{
        options: [
          { value: 'name', label: 'Name' },
          { value: 'created', label: 'Created Date' },
          { value: 'updated', label: 'Last Updated' },
        ],
        value: 'updated',
        onChange: (value) => console.log('Sort by:', value),
        direction: 'desc',
      }}
      bulkActions={
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">2 projects selected</span>
          <Button variant="outline" size="sm">Archive</Button>
          <Button variant="outline" size="sm">Move</Button>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Status</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                On Hold
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Completed
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Priority</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                High
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Medium
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Low
              </label>
            </div>
          </div>
        </div>
      }
    >
      <BoardView
        columns={boardColumns}
        onTaskMove={handleTaskMove}
        onTaskClick={handleTaskClick}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskCreate={handleTaskCreate}
        taskVariant="default"
      />
    </ListLayout>
  );

  const renderProjectDetail = () => (
    <DetailLayout
      title="Q1 Campaign Landing Page"
      subtitle="Design and implement a modern landing page for our Q1 marketing campaign"
      breadcrumbs={
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button onClick={() => setActiveView('dashboard')} className="hover:text-foreground">Dashboard</button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => setActiveView('projects')} className="hover:text-foreground">Projects</button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Q1 Campaign</span>
        </nav>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorite
          </Button>
        </div>
      }
      avatar={
        <Avatar size="lg" fallback="Q1" className="bg-primary text-primary-foreground" />
      }
      status={
        <div className="flex items-center gap-2">
          <Badge>In Progress</Badge>
          <Badge variant="secondary">High Priority</Badge>
        </div>
      }
      tabs={{
        items: [
          { id: 'overview', label: 'Overview', badge: '12' },
          { id: 'tasks', label: 'Tasks', badge: '8' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'files', label: 'Files', badge: '24' },
          { id: 'activity', label: 'Activity' },
        ],
        activeTab: 'overview',
        onTabChange: (tabId) => console.log('Switch to tab:', tabId),
      }}
      metaSidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Owner:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar size="sm" fallback="A" />
                  <span>Alice Johnson</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date:</span>
                <div className="mt-1">January 15, 2024</div>
              </div>
              <div>
                <span className="text-muted-foreground">Progress:</span>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>60% complete</span>
                    <span>8/12 tasks</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Team Members</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar size="sm" fallback="A" />
                <div>
                  <div className="text-sm font-medium">Alice Johnson</div>
                  <div className="text-xs text-muted-foreground">Designer</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar size="sm" fallback="B" />
                <div>
                  <div className="text-sm font-medium">Bob Smith</div>
                  <div className="text-xs text-muted-foreground">Developer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tasks Completed</span>
            </div>
            <div className="text-2xl font-bold">8/12</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <div className="text-2xl font-bold">2</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Days Remaining</span>
            </div>
            <div className="text-2xl font-bold">5</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {sampleTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                onClick={handleTaskClick}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </DetailLayout>
  );

  const renderSettings = () => (
    <SettingsLayout
      title="Settings"
      subtitle="Manage your account and application preferences"
      sections={settingsSections}
      activeSection={activeSettingsSection}
      onSectionChange={setActiveSettingsSection}
      save={{
        hasChanges: true,
        onSave: handleSaveSettings,
        onDiscard: () => console.log('Discard changes'),
        saving: false,
      }}
    >
      {activeSettingsSection === 'general' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    defaultValue="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    defaultValue="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full px-3 py-2 border border-input rounded-md">
                  <option>UTC-8 (Pacific)</option>
                  <option>UTC-5 (Eastern)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSettingsSection === 'account' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSettingsSection === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Task Assignments</div>
                  <div className="text-sm text-muted-foreground">Get notified when assigned to tasks</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Project Updates</div>
                  <div className="text-sm text-muted-foreground">Receive updates about project changes</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );

  const renderOnboarding = () => (
    <OnboardingLayout
      steps={onboardingSteps}
      currentStep={currentOnboardingStep}
      onStepChange={setCurrentOnboardingStep}
      onComplete={handleCompleteOnboarding}
      onSkip={() => setActiveView('dashboard')}
      progress={{
        showSteps: true,
        showProgressBar: true,
        showStepNumbers: true,
      }}
      navigation={{
        showPrevious: true,
        showNext: true,
        showSkip: true,
        nextLabel: currentOnboardingStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue',
      }}
      showHelp={true}
      helpContent={
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Here are some tips to get you started with ATLVS.
            </p>
            <ul className="text-sm space-y-2">
              <li>• Create your first project to organize tasks</li>
              <li>• Invite team members to collaborate</li>
              <li>• Use the dashboard to track progress</li>
              <li>• Set up notifications for important updates</li>
            </ul>
          </div>
        </div>
      }
    >
      {currentOnboardingStep === 0 && (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <Home className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to ATLVS</h2>
            <p className="text-muted-foreground">
              The world's most advanced project management platform, designed to exceed the capabilities of ClickUp, Airtable, and SmartSuite.
            </p>
          </div>
        </div>
      )}

      {currentOnboardingStep === 1 && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Tell us about yourself</h2>
            <p className="text-muted-foreground">This helps us personalize your experience.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="e.g. Product Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Your company name"
              />
            </div>
          </div>
        </div>
      )}

      {currentOnboardingStep === 2 && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Create your first project</h2>
            <p className="text-muted-foreground">Projects help you organize and track your work.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="e.g. Q1 Marketing Campaign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md h-24 resize-none"
                placeholder="Brief description of your project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <select className="w-full px-3 py-2 border border-input rounded-md">
                <option>Marketing</option>
                <option>Product Development</option>
                <option>Design</option>
                <option>Engineering</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {currentOnboardingStep === 3 && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Customize your experience</h2>
            <p className="text-muted-foreground">Set up notifications and preferences.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive updates via email</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Reports</div>
                <div className="text-sm text-muted-foreground">Get weekly progress summaries</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Task Reminders</div>
                <div className="text-sm text-muted-foreground">Remind me about upcoming deadlines</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="font-bold text-xl">ATLVS</div>
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'dashboard'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('projects')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'projects'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveView('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'settings'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('onboarding')}
              >
                Start Onboarding
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'projects' && renderProjects()}
      {activeView === 'project-detail' && renderProjectDetail()}
      {activeView === 'settings' && renderSettings()}
      {activeView === 'onboarding' && renderOnboarding()}
    </div>
  );
}

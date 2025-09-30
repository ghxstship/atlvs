import { rest } from 'msw';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
};

const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
};

const mockProjects = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    description: 'A test project',
    status: 'active',
    organization_id: 'test-org-id',
  },
];

// Authentication handlers
export const authHandlers = [
  rest.post('*/auth/v1/token', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    if (email === 'test@example.com' && password === 'testpassword123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: mockUser,
          expires_in: 3600,
        })
      );
    }
    
    return res(
      ctx.status(400),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),
  
  rest.get('*/auth/v1/user', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser));
  }),
];

// Database handlers
export const dbHandlers = [
  // Organizations
  rest.get('*/rest/v1/organizations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockOrganization]));
  }),
  
  rest.get('*/rest/v1/organizations/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id === 'test-org-id') {
      return res(ctx.status(200), ctx.json(mockOrganization));
    }
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  }),
  
  // Projects
  rest.get('*/rest/v1/projects', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockProjects));
  }),
  
  rest.post('*/rest/v1/projects', async (req, res, ctx) => {
    const body = await req.json();
    const newProject = {
      id: `project-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return res(ctx.status(201), ctx.json(newProject));
  }),
  
  // Users
  rest.get('*/rest/v1/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockUser]));
  }),
];

// API handlers for custom endpoints
export const apiHandlers = [
  rest.get('/api/v1/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalProjects: 15,
        activeUsers: 42,
        revenue: 125000,
        growth: 12.5,
      })
    );
  }),
  
  rest.get('/api/v1/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    const project = mockProjects.find(p => p.id === id);
    if (project) {
      return res(ctx.status(200), ctx.json(project));
    }
    return res(ctx.status(404), ctx.json({ error: 'Project not found' }));
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...dbHandlers,
  ...apiHandlers,
];

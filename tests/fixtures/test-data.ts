export const testUsers = {
  admin: {
    id: '1',
    email: 'admin@ghxstship.com',
    password: 'Admin123!',
    role: 'admin',
    name: 'Admin User',
  },
  user: {
    id: '2',
    email: 'user@ghxstship.com',
    password: 'User123!',
    role: 'user',
    name: 'Regular User',
  },
  guest: {
    id: '3',
    email: 'guest@ghxstship.com',
    password: 'Guest123!',
    role: 'guest',
    name: 'Guest User',
  },
}

export const testProjects = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'First test project',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'Second test project',
    status: 'archived',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
]

export const testOrganizations = [
  {
    id: '1',
    name: 'Test Organization',
    slug: 'test-org',
    plan: 'enterprise',
    members: 10,
  },
]

export const mockApiResponses = {
  health: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: 12345,
  },
  projects: {
    data: testProjects,
    total: testProjects.length,
    page: 1,
    pageSize: 10,
  },
}

export function generateMockUser(overrides = {}) {
  return {
    id: Math.random().toString(36).substring(7),
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function generateMockProject(overrides = {}) {
  return {
    id: Math.random().toString(36).substring(7),
    name: `Test Project ${Date.now()}`,
    description: 'Test project description',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

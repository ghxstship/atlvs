import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { app } from '../../../app'; // Next.js app instance for testing

// Mock environment variables
const TEST_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const TEST_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

// Test data setup
let testUserId: string;
let testOrgId: string;
let testDashboardId: string;
let authToken: string;

describe('Dashboard API Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    // Initialize Supabase client for test data setup
    supabase = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY);

    // Create test organization
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization API',
        slug: 'test-org-api',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    testOrgId = org.id;

    // Create test user
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test-api@example.com',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        name: 'Test API User',
      },
    });

    testUserId = user.user.id;

    // Create membership
    await supabase.from('memberships').insert({
      user_id: testUserId,
      organization_id: testOrgId,
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Get auth token for API calls
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'test-api@example.com',
      password: 'testpassword123',
    });

    authToken = session.session?.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('organizations').delete().eq('id', testOrgId);
    await supabase.auth.admin.deleteUser(testUserId);
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests without organization header', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Organization ID required');
    });

    it('should reject requests from non-members', async () => {
      // Create a different organization
      const { data: otherOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'Other Organization',
          slug: 'other-org',
        })
        .select()
        .single();

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', otherOrg.id);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');

      // Clean up
      await supabase.from('organizations').delete().eq('id', otherOrg.id);
    });

    it('should allow requests from organization members', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return paginated results with default parameters', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should support search functionality', async () => {
      // Create a test dashboard first
      const createResponse = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send({
          name: 'Searchable Dashboard',
          description: 'Dashboard for search testing',
          type: 'custom',
        });

      expect(createResponse.status).toBe(201);
      testDashboardId = createResponse.body.data.id;

      // Search for the dashboard
      const searchResponse = await request(app)
        .get('/api/v1/dashboard?search=Searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data.length).toBeGreaterThan(0);
      expect(searchResponse.body.data[0].name).toContain('Searchable');
    });

    it('should support filtering by type', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard?type=custom')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      response.body.data.forEach((dashboard: Record<string, unknown>) => {
        expect(dashboard.type).toBe('custom');
      });
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard?sort_by=name&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      // Check that results are sorted by name ascending
      const names = response.body.data.map((d: Record<string, unknown>) => d.name as string);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should return enriched data with relationships', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const dashboard = response.body.data[0];
        expect(dashboard).toHaveProperty('created_by_user');
        expect(dashboard).toHaveProperty('widget_count');
        expect(dashboard).toHaveProperty('share_count');
      }
    });
  });

  describe('POST /api/v1/dashboard', () => {
    it('should create a new dashboard with valid data', async () => {
      const dashboardData = {
        name: 'Test Dashboard',
        description: 'Dashboard created for testing',
        type: 'custom',
        layout: [{ widgetId: 'test-widget', position: { x: 0, y: 0 } }],
        settings: { theme: 'light' },
        is_default: false,
        is_public: false,
      };

      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(dashboardData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(dashboardData.name);
      expect(response.body.data.description).toBe(dashboardData.description);
      expect(response.body.data.type).toBe(dashboardData.type);
      expect(response.body.data.organization_id).toBe(testOrgId);
      expect(response.body.data.created_by).toBe(testUserId);

      testDashboardId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send({}); // Empty body

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should prevent duplicate dashboard names', async () => {
      const dashboardData = {
        name: 'Duplicate Dashboard',
        type: 'custom',
      };

      // Create first dashboard
      await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(dashboardData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(dashboardData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Dashboard name already exists');
      expect(response.body.field).toBe('name');
    });

    it('should create dashboard with default values', async () => {
      const dashboardData = {
        name: 'Minimal Dashboard',
      };

      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(dashboardData);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('custom'); // default value
      expect(response.body.data.is_default).toBe(false); // default value
      expect(response.body.data.is_public).toBe(false); // default value
    });

    it('should log dashboard creation activity', async () => {
      const dashboardData = {
        name: 'Activity Logged Dashboard',
        type: 'custom',
      };

      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(dashboardData);

      expect(response.status).toBe(201);

      // Check if activity was logged
      const { data: activity } = await supabase
        .from('dashboard_activity')
        .select('*')
        .eq('dashboard_id', response.body.data.id)
        .eq('action', 'create')
        .single();

      expect(activity).toBeTruthy();
      expect(activity.user_id).toBe(testUserId);
      expect(activity.organization_id).toBe(testOrgId);
      expect(activity.details.dashboard_name).toBe(dashboardData.name);
    });
  });

  describe('PUT /api/v1/dashboard/[id]', () => {
    it('should update dashboard with valid data', async () => {
      const updateData = {
        name: 'Updated Dashboard Name',
        description: 'Updated description',
        settings: { theme: 'dark' },
      };

      const response = await request(app)
        .put(`/api/v1/dashboard/${testDashboardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.settings.theme).toBe('dark');
    });

    it('should return 404 for non-existent dashboard', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/dashboard/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Dashboard not found');
    });
  });

  describe('DELETE /api/v1/dashboard/[id]', () => {
    it('should delete dashboard successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/dashboard/${testDashboardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Dashboard deleted successfully');
    });

    it('should return 404 when deleting non-existent dashboard', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/dashboard/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Dashboard not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard?page=invalid&limit=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalQuery = supabase.from;
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-organization-id', testOrgId);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch dashboards');

      // Restore original function
      supabase.from = originalQuery;
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      // This test would need actual rate limiting middleware
      // For now, just verify the endpoint handles normal load
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/v1/dashboard')
          .set('Authorization', `Bearer ${authToken}`)
          .set('x-organization-id', testOrgId)
      );

      const responses = await Promise.all(promises);
      responses.forEach((response: Record<string, unknown>) => {
        expect([200, 429]).toContain(response.status as number);
      });
    });
  });
});

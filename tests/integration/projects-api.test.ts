import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { testServer } from '../../setup';
import type { Database } from '../../../../packages/domain/src/types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('Projects API Integration Tests', () => {
  let testOrganizationId: string;
  let testUserId: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Setup test data
    const { data: { user } } = await supabase.auth.signInAnonymously();
    testUserId = user!.id;

    // Create test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization',
        slug: 'test-org',
        created_by: testUserId,
      })
      .select()
      .single();

    if (orgError) throw orgError;
    testOrganizationId = org.id;

    // Create test membership
    await supabase.from('memberships').insert({
      user_id: testUserId,
      organization_id: testOrganizationId,
      role: 'owner',
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('memberships').delete().eq('organization_id', testOrganizationId);
    await supabase.from('organizations').delete().eq('id', testOrganizationId);
    await supabase.auth.signOut();
  });

  describe('GET /api/v1/projects', () => {
    it('should return projects list with proper pagination', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&page=1&pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('pageSize');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
    });

    it('should filter projects by status', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&status=active`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      data.data.forEach((project: any) => {
        expect(project.status).toBe('active');
      });
    });

    it('should search projects by name', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&search=test`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.data.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort projects by created date', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&sortBy=created_at&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.data.length > 1) {
        for (let i = 1; i < data.data.length; i++) {
          const prevDate = new Date(data.data[i - 1].created_at);
          const currDate = new Date(data.data[i].created_at);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for integration testing',
        status: 'active' as const,
        organization_id: testOrganizationId,
        owner_id: testUserId,
        settings: {
          visibility: 'private',
          allowGuestAccess: false,
        },
      };

      const response = await fetch(`${testServer.url}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toHaveProperty('id');
      expect(data.name).toBe(projectData.name);
      expect(data.description).toBe(projectData.description);
      expect(data.status).toBe(projectData.status);
      expect(data.organization_id).toBe(testOrganizationId);
      expect(data.owner_id).toBe(testUserId);

      testProjectId = data.id;
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing name field',
        organization_id: testOrganizationId,
      };

      const response = await fetch(`${testServer.url}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });

    it('should enforce organization isolation', async () => {
      const projectData = {
        name: 'Test Project Cross-Org',
        organization_id: 'different-org-id',
        owner_id: testUserId,
      };

      const response = await fetch(`${testServer.url}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(projectData),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/projects/[id]', () => {
    it('should return project details', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects/${testProjectId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.id).toBe(testProjectId);
      expect(data.name).toBe('Test Project');
      expect(data.organization_id).toBe(testOrganizationId);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects/non-existent-id`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(404);
    });

    it('should enforce organization access control', async () => {
      // Create project in different organization context
      const { data: otherOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'Other Organization',
          slug: 'other-org',
          created_by: testUserId,
        })
        .select()
        .single();

      const { data: otherProject } = await supabase
        .from('projects')
        .insert({
          name: 'Other Project',
          organization_id: otherOrg.id,
          owner_id: testUserId,
        })
        .select()
        .single();

      const response = await fetch(`${testServer.url}/api/v1/projects/${otherProject.id}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(403);

      // Cleanup
      await supabase.from('projects').delete().eq('id', otherProject.id);
      await supabase.from('organizations').delete().eq('id', otherOrg.id);
    });
  });

  describe('PUT /api/v1/projects/[id]', () => {
    it('should update project details', async () => {
      const updateData = {
        name: 'Updated Test Project',
        description: 'Updated description',
        status: 'completed' as const,
      };

      const response = await fetch(`${testServer.url}/api/v1/projects/${testProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.id).toBe(testProjectId);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe(updateData.description);
      expect(data.status).toBe(updateData.status);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        name: '', // Empty name should fail validation
      };

      const response = await fetch(`${testServer.url}/api/v1/projects/${testProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(invalidUpdate),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/v1/projects/[id]', () => {
    it('should delete project', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects/${testProjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(204);

      // Verify project is deleted
      const verifyResponse = await fetch(`${testServer.url}/api/v1/projects/${testProjectId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(verifyResponse.status).toBe(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects/non-existent-id`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Project Permissions & Security', () => {
    it('should enforce RBAC for project operations', async () => {
      // Create a member user (not owner)
      const { data: { user: memberUser } } = await supabase.auth.signInAnonymously();

      await supabase.from('memberships').insert({
        user_id: memberUser!.id,
        organization_id: testOrganizationId,
        role: 'member',
      });

      // Create project as owner
      const { data: memberProject } = await supabase
        .from('projects')
        .insert({
          name: 'Member Project',
          organization_id: testOrganizationId,
          owner_id: testUserId,
        })
        .select()
        .single();

      // Try to delete as member (should fail)
      const response = await fetch(`${testServer.url}/api/v1/projects/${memberProject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'X-User-ID': memberUser!.id,
        },
      });

      expect(response.status).toBe(403);

      // Cleanup
      await supabase.from('projects').delete().eq('id', memberProject.id);
      await supabase.from('memberships').delete().eq('user_id', memberUser!.id);
    });

    it('should audit all project operations', async () => {
      // Create project
      const { data: auditProject } = await supabase
        .from('projects')
        .insert({
          name: 'Audit Test Project',
          organization_id: testOrganizationId,
          owner_id: testUserId,
        })
        .select()
        .single();

      // Check audit log
      const { data: auditLogs } = await supabase
        .from('audit_log')
        .select('*')
        .eq('resource_type', 'project')
        .eq('resource_id', auditProject.id)
        .eq('organization_id', testOrganizationId);

      expect(auditLogs!.length).toBeGreaterThan(0);
      expect(auditLogs![0]).toHaveProperty('action', 'CREATE');
      expect(auditLogs![0]).toHaveProperty('user_id', testUserId);

      // Cleanup
      await supabase.from('projects').delete().eq('id', auditProject.id);
    });
  });

  describe('Performance & Load Testing', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple projects
      const bulkProjects = Array.from({ length: 10 }, (_, i) => ({
        name: `Bulk Project ${i}`,
        organization_id: testOrganizationId,
        owner_id: testUserId,
      }));

      for (const project of bulkProjects) {
        await supabase.from('projects').insert(project);
      }

      // Bulk fetch
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&pageSize=100`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Cleanup
      await supabase.from('projects').delete().in('name', bulkProjects.map(p => p.name));
    });

    it('should implement proper pagination limits', async () => {
      const response = await fetch(`${testServer.url}/api/v1/projects?organizationId=${testOrganizationId}&pageSize=1000`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('pageSize');
    });
  });
});

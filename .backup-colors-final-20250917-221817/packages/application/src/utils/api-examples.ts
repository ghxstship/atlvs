import { NextRequest, NextResponse } from 'next/server';
import { 
  createGetHandler, 
  createPostHandler, 
  createPutHandler, 
  createDeleteHandler,
  createApiResponse,
  getPaginationInfo,
  buildSupabaseQuery,
  ApiContext 
} from './api-middleware';
import { 
  UserSchemas, 
  ProjectSchemas, 
  FileSchemas, 
  NotificationSchemas,
  CommonSchemas 
} from './validation-middleware';
import { ServiceFactory } from '../services';

// Example 1: Users API with full CRUD operations
export const getUsersHandler = createGetHandler(
  {
    validation: {
      query: UserSchemas.filters
    },
    requiredPermissions: ['users:read']
  },
  async (context: ApiContext, { query }) => {
    const userService = ServiceFactory.createUserService(context);
    
    // Get total count for pagination
    const totalCount = await userService.count(query);
    const pagination = getPaginationInfo(query, totalCount);
    
    // Get users with filters
    const result = await userService.list({
      ...query,
      offset: pagination.offset
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'Users retrieved successfully', {
      pagination
    });
  }
);

export const createUserHandler = createPostHandler(
  {
    validation: {
      body: UserSchemas.create
    },
    requiredPermissions: ['users:create']
  },
  async (context: ApiContext, { body }) => {
    const userService = ServiceFactory.createUserService(context);
    
    const result = await userService.create(body);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'User created successfully');
  }
);

export const updateUserHandler = createPutHandler(
  {
    validation: {
      params: CommonSchemas.organizationContext.extend({
        userId: CommonSchemas.uuid
      }),
      body: UserSchemas.update
    },
    requiredPermissions: ['users:update']
  },
  async (context: ApiContext, { params, body }) => {
    const userService = ServiceFactory.createUserService(context);
    
    const result = await userService.update(params.userId, body);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'User updated successfully');
  }
);

export const deleteUserHandler = createDeleteHandler(
  {
    validation: {
      params: CommonSchemas.organizationContext.extend({
        userId: CommonSchemas.uuid
      })
    },
    requiredPermissions: ['users:delete']
  },
  async (context: ApiContext, { params }) => {
    const userService = ServiceFactory.createUserService(context);
    
    const result = await userService.delete(params.userId);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(null, 'User deleted successfully');
  }
);

// Example 2: Projects API with complex filtering
export const getProjectsHandler = createGetHandler(
  {
    validation: {
      query: ProjectSchemas.filters
    },
    requiredPermissions: ['projects:read']
  },
  async (context: ApiContext, { query }) => {
    const projectService = ServiceFactory.createProjectService(context);
    
    // Build complex filters
    const filters = {
      status: query.status,
      priority: query.priority,
      managerId: query.managerId,
      clientId: query.clientId,
      search: query.search,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'desc',
      limit: query.limit,
      offset: (query.page - 1) * query.limit
    };

    // Apply date range filters
    if (query.startDateFrom || query.startDateTo) {
      filters.startDateRange = {
        from: query.startDateFrom,
        to: query.startDateTo
      };
    }

    const totalCount = await projectService.count(filters);
    const pagination = getPaginationInfo(query, totalCount);
    
    const result = await projectService.list(filters);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'Projects retrieved successfully', {
      pagination,
      filters: {
        applied: Object.keys(filters).filter(key => filters[key] !== undefined),
        total: totalCount
      }
    });
  }
);

export const createProjectHandler = createPostHandler(
  {
    validation: {
      body: ProjectSchemas.create
    },
    requiredPermissions: ['projects:create'],
    rateLimit: {
      requests: 10,
      windowMs: 60 * 1000 // 10 requests per minute
    }
  },
  async (context: ApiContext, { body }) => {
    const projectService = ServiceFactory.createProjectService(context);
    
    // Validate business rules
    if (body.managerId) {
      const userService = ServiceFactory.createUserService(context);
      const managerResult = await userService.getById(body.managerId);
      
      if (!managerResult.success) {
        throw new Error('Invalid manager ID');
      }
      
      if (!['admin', 'manager'].includes(managerResult.data.role)) {
        throw new Error('Assigned manager must have manager or admin role');
      }
    }

    const result = await projectService.create(body);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Log audit event
    const auditService = ServiceFactory.createAuditService(context);
    await auditService.logActivity({
      action: 'project_created',
      resourceType: 'project',
      resourceId: result.data.id,
      details: {
        projectName: result.data.name,
        status: result.data.status
      }
    });

    return createApiResponse(result.data, 'Project created successfully');
  }
);

// Example 3: File upload with validation
export const uploadFileHandler = createPostHandler(
  {
    validation: {
      body: FileSchemas.create
    },
    requiredPermissions: ['files:create'],
    rateLimit: {
      requests: 20,
      windowMs: 60 * 1000 // 20 uploads per minute
    }
  },
  async (context: ApiContext, { body }) => {
    const fileService = ServiceFactory.createFileService(context);
    
    // Validate file size and type
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (body.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/json',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(body.mimeType)) {
      throw new Error(`File type ${body.mimeType} is not allowed`);
    }

    // Check project access if projectId is provided
    if (body.projectId) {
      const projectService = ServiceFactory.createProjectService(context);
      const projectResult = await projectService.getById(body.projectId);
      
      if (!projectResult.success) {
        throw new Error('Invalid project ID or access denied');
      }
    }

    const result = await fileService.create(body);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'File uploaded successfully');
  }
);

// Example 4: Notifications with broadcasting
export const createNotificationHandler = createPostHandler(
  {
    validation: {
      body: NotificationSchemas.create
    },
    requiredPermissions: ['notifications:create']
  },
  async (context: ApiContext, { body }) => {
    const notificationService = ServiceFactory.createNotificationService(context);
    
    const result = await notificationService.create(body);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(result.data, 'Notification created successfully');
  }
);

export const broadcastNotificationHandler = createPostHandler(
  {
    validation: {
      body: NotificationSchemas.broadcast
    },
    requiredPermissions: ['notifications:create'],
    rateLimit: {
      requests: 5,
      windowMs: 60 * 1000 // 5 broadcasts per minute
    }
  },
  async (context: ApiContext, { body }) => {
    const notificationService = ServiceFactory.createNotificationService(context);
    
    // Validate user IDs exist and are in the same organization
    const userService = ServiceFactory.createUserService(context);
    const validUsers = [];
    
    for (const userId of body.userIds) {
      const userResult = await userService.getById(userId);
      if (userResult.success) {
        validUsers.push(userId);
      }
    }

    if (validUsers.length === 0) {
      throw new Error('No valid users found for broadcasting');
    }

    const result = await notificationService.broadcast({
      ...body,
      userIds: validUsers
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return createApiResponse(
      { 
        sent: validUsers.length, 
        failed: body.userIds.length - validUsers.length 
      }, 
      `Notification broadcast to ${validUsers.length} users`
    );
  }
);

// Example 5: Complex query with Supabase integration
export const getProjectAnalyticsHandler = createGetHandler(
  {
    validation: {
      query: CommonSchemas.dateRange.merge(
        CommonSchemas.pagination
      ).extend({
        projectId: CommonSchemas.uuid.optional(),
        status: CommonSchemas.projectStatus.optional(),
        groupBy: z.enum(['day', 'week', 'month']).default('day')
      })
    },
    requiredPermissions: ['projects:read', 'analytics:read']
  },
  async (context: ApiContext, { query }) => {
    // Build complex analytics query
    let analyticsQuery = context.supabase
      .from('projects')
      .select(`
        id,
        name,
        status,
        created_at,
        updated_at,
        budget,
        project_members!inner(count),
        project_files(count),
        project_tasks(count, status)
      `)
      .eq('organization_id', context.organization.id);

    // Apply filters using the helper function
    analyticsQuery = buildSupabaseQuery(
      analyticsQuery,
      {
        id: query.projectId,
        status: query.status,
        limit: query.limit,
        offset: (query.page - 1) * query.limit
      }
    );

    // Apply date range filter
    if (query.startDate) {
      analyticsQuery = analyticsQuery.gte('created_at', query.startDate);
    }
    if (query.endDate) {
      analyticsQuery = analyticsQuery.lte('created_at', query.endDate);
    }

    const { data: projects, error, count } = await analyticsQuery;

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    // Process data for analytics
    const analytics = {
      totalProjects: count || 0,
      projectsByStatus: {},
      totalBudget: 0,
      averageBudget: 0,
      projectsOverTime: []
    };

    if (projects) {
      // Group by status
      projects.forEach(project => {
        analytics.projectsByStatus[project.status] = 
          (analytics.projectsByStatus[project.status] || 0) + 1;
        
        if (project.budget) {
          analytics.totalBudget += project.budget;
        }
      });

      analytics.averageBudget = projects.length > 0 ? 
        analytics.totalBudget / projects.length : 0;

      // Group by time period (simplified example)
      const timeGroups = {};
      projects.forEach(project => {
        const date = new Date(project.created_at);
        const key = query.groupBy === 'day' ? 
          date.toISOString().split('T')[0] :
          query.groupBy === 'week' ?
            `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}` :
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        timeGroups[key] = (timeGroups[key] || 0) + 1;
      });

      analytics.projectsOverTime = Object.entries(timeGroups).map(([period, count]) => ({
        period,
        count
      }));
    }

    const pagination = getPaginationInfo(query, count || 0);

    return createApiResponse(analytics, 'Analytics retrieved successfully', {
      pagination,
      query: {
        dateRange: {
          start: query.startDate,
          end: query.endDate
        },
        groupBy: query.groupBy
      }
    });
  }
);

// Example usage in actual API route files:
/*
// /api/organizations/[orgId]/users/route.ts
export const GET = getUsersHandler;
export const POST = createUserHandler;

// /api/organizations/[orgId]/users/[userId]/route.ts  
export const PUT = updateUserHandler;
export const DELETE = deleteUserHandler;

// /api/organizations/[orgId]/projects/route.ts
export const GET = getProjectsHandler;
export const POST = createProjectHandler;

// /api/organizations/[orgId]/files/route.ts
export const POST = uploadFileHandler;

// /api/organizations/[orgId]/notifications/route.ts
export const POST = createNotificationHandler;

// /api/organizations/[orgId]/notifications/broadcast/route.ts
export const POST = broadcastNotificationHandler;

// /api/organizations/[orgId]/analytics/projects/route.ts
export const GET = getProjectAnalyticsHandler;
*/

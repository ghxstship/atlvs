import { createYoga, createSchema } from 'graphql-yoga';
import type { NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../lib/services';
import { getCiBypassContext } from '../../../../lib/ci-bypass';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';

function getTenantContextFromRequest(req: NextRequest, userId?: string): TenantContext {
  const organizationId = req.headers.get('x-org-id') || '';
  const projectId = req.headers.get('x-project-id') || undefined;
  const rolesHeader = req.headers.get('x-roles');
  const roles = rolesHeader ? (rolesHeader.split(',').map((r) => r.trim()) as any) : [];
  if (!organizationId) throw new Error('Missing x-org-id header');
  if (!userId) throw new Error('Unauthenticated');
  return {
    organizationId,
    projectId,
    userId,
    roles
  };
}

const typeDefs = /* GraphQL */ `
  scalar JSON

  type Health {
    name: String!
    version: String!
    time: String!
    status: String!
  }

  type Company {
    id: ID!
    organizationId: ID!
    name: String!
    website: String
    createdAt: String
    updatedAt: String
  }

  type Listing {
    id: ID!
    organizationId: ID!
    title: String!
    description: String
    price: Float!
    currency: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type Vendor {
    id: ID!
    organizationId: ID!
    name: String!
    website: String
    contactEmail: String
    status: String!
    createdAt: String
    updatedAt: String
  }

  type CatalogItem {
    id: ID!
    organizationId: ID!
    vendorId: ID!
    sku: String
    title: String!
    description: String
    unitPrice: Float!
    currency: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type PurchaseOrder {
    id: ID!
    organizationId: ID!
    vendor: String!
    total: Float!
    currency: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type Invoice {
    id: ID!
    organizationId: ID!
    amount: Float!
    currency: String!
    status: String!
    purchaseOrderId: ID
    dueDate: String
    createdAt: String
    updatedAt: String
  }

  type Job {
    id: ID!
    organizationId: ID!
    title: String!
    status: String!
    rfpId: String
    createdAt: String
    updatedAt: String
  }

  type Report {
    id: ID!
    organizationId: ID!
    name: String!
    definition: JSON!
    createdAt: String
    updatedAt: String
  }

  type Project {
    id: ID!
    organizationId: ID!
    name: String!
    status: String!
    startDate: String
    endDate: String
    budgetCurrency: String
    createdAt: String!
    updatedAt: String!
  }

  type ApiKey {
    id: ID!
    organizationId: ID!
    name: String!
    prefix: String!
    scopes: [String!]!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
    lastUsedAt: String
    expiresAt: String
  }

  type IssuedApiKey {
    key: String!
    apiKey: ApiKey!
  }

  type WebhookSubscription {
    id: ID!
    organizationId: ID!
    url: String!
    eventNames: [String!]!
    active: Boolean!
    createdAt: String!
  }

  type Program {
    id: ID!
    organizationId: ID!
    name: String!
    startDate: String
    endDate: String
    createdAt: String
    updatedAt: String
  }

  type PipelineStage {
    id: ID!
    organizationId: ID!
    name: String!
    order: Int!
    createdAt: String
    updatedAt: String
  }

  type Query {
    health: Health!
    projects(limit: Int = 20, offset: Int = 0): [Project!]!
    apiKeys: [ApiKey!]!
    webhooks: [WebhookSubscription!]!
    programs(limit: Int = 20, offset: Int = 0): [Program!]!
    pipelineStages: [PipelineStage!]!
    purchaseOrders(limit: Int = 20, offset: Int = 0): [PurchaseOrder!]!
    invoices(limit: Int = 20, offset: Int = 0): [Invoice!]!
    jobs(limit: Int = 20, offset: Int = 0): [Job!]!
    reports(limit: Int = 20, offset: Int = 0): [Report!]!
    companies(limit: Int = 20, offset: Int = 0): [Company!]!
    listings(limit: Int = 20, offset: Int = 0): [Listing!]!
    vendors(limit: Int = 20, offset: Int = 0): [Vendor!]!
    catalogItems(vendorId: ID, limit: Int = 20, offset: Int = 0): [CatalogItem!]!
  }

  input CreateProjectInput {
    id: ID!
    organizationId: ID!
    name: String!
    status: String
    startDate: String
    endDate: String
    budgetCurrency: String
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    issueApiKey(name: String!, scopes: [String!]!, mode: String): IssuedApiKey!
    deactivateApiKey(id: ID!): Boolean!
    subscribeWebhook(url: String!, eventNames: [String!]!, secret: String): WebhookSubscription!
    createProgram(id: ID!, name: String!, startDate: String, endDate: String): Program!
    createPipelineStage(id: ID!, name: String!, order: Int!): PipelineStage!
    createPurchaseOrder(id: ID!, vendor: String!, total: Float!, currency: String!, status: String!): PurchaseOrder!
    createInvoice(id: ID!, amount: Float!, currency: String!, status: String!, dueDate: String, purchaseOrderId: ID): Invoice!
    createJob(id: ID!, title: String!, status: String!, rfpId: String): Job!
    createReport(id: ID!, name: String!, definition: JSON!): Report!
    createCompany(id: ID!, name: String!, website: String): Company!
    createListing(id: ID!, title: String!, description: String, price: Float!, currency: String!, status: String!): Listing!
    createVendor(id: ID!, name: String!, website: String, contactEmail: String, status: String!): Vendor!
    createCatalogItem(id: ID!, vendorId: ID!, sku: String, title: String!, description: String, unitPrice: Float!, currency: String!, status: String!): CatalogItem!
  }
`;

const resolvers = {
  Query: {
    health: async () => ({
      name: 'ghxstship-api',
      version: 'v1',
      time: new Date().toISOString(),
      status: 'ok'
    }),
    projects: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.projects.list(ctx, { limit: args.limit, offset: args.offset });
    },
    apiKeys: async (_: any, _args: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      // Enforce settings permission
      if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
        throw new Error('Forbidden');
      }
      return services.apiKeys.listByOrg(ctx.organizationId);
    },
    webhooks: async (_: any, _args: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
        throw new Error('Forbidden');
      }
      return services.webhooks.listActive(ctx.organizationId);
    },
    programs: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.programs.list(ctx, { limit: args.limit, offset: args.offset });
    },
    pipelineStages: async (_: any, _args: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.pipeline.listStages(ctx);
    },
    purchaseOrders: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.procurement.listPurchaseOrders(ctx.organizationId);
    },
    invoices: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.finance.list(ctx, { limit: args.limit, offset: args.offset });
    },
    jobs: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.jobs.list(ctx, { limit: args.limit, offset: args.offset });
    },
    reports: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.analytics.list(ctx, { limit: args.limit, offset: args.offset });
    },
    companies: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.companies.list(ctx, { limit: args.limit, offset: args.offset });
    },
    listings: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.listings.list(ctx, { limit: args.limit, offset: args.offset });
    },
    vendors: async (_: any, args: { limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.vendors.list(ctx, { limit: args.limit, offset: args.offset });
    },
    catalogItems: async (_: any, args: { vendorId?: string; limit?: number; offset?: number }, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.catalogItems.list(ctx, { vendorId: args.vendorId, limit: args.limit, offset: args.offset });
    }
  },
  Mutation: {
    createProject: async (_: any, { input }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      return services.projects.create(ctx, input);
    },
    issueApiKey: async (_: any, { name, scopes, mode }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
        throw new Error('Forbidden');
      }
      return services.apiKeys.issue(ctx.organizationId, name, scopes ?? [], mode ?? 'test');
    },
    deactivateApiKey: async (_: any, { id }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
        throw new Error('Forbidden');
      }
      await services.apiKeys.deactivate(String(id));
      return true;
    },
    subscribeWebhook: async (_: any, { url, eventNames, secret }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
        throw new Error('Forbidden');
      }
      const sub = {
        id: crypto.randomUUID(),
        organizationId: ctx.organizationId,
        url,
        secret: secret ?? crypto.randomUUID(),
        eventNames: eventNames ?? [],
        active: true,
        createdAt: new Date().toISOString()
      };
      return services.webhooks.createSubscription(sub);
    },
    createProgram: async (_: any, { id, name, startDate, endDate }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, name, startDate, endDate };
      return services.programs.create(ctx, input as any);
    },
    createPipelineStage: async (_: any, { id, name, order }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const stage = { id, organizationId: ctx.organizationId, name, order };
      return services.pipeline.createStage(ctx, stage as any);
    },
    createPurchaseOrder: async (_: any, { id, vendor, total, currency, status }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, vendor, total, currency, status };
      return services.procurement.createPurchaseOrder(ctx.organizationId, ctx.userId, input as any);
    },
    createInvoice: async (_: any, { id, amount, currency, status, dueDate, purchaseOrderId }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, amount, currency, status, dueDate, purchaseOrderId };
      return services.finance.create(ctx, input as any);
    },
    createJob: async (_: any, { id, title, status, rfpId }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, title, status, rfpId };
      return services.jobs.create(ctx, input as any);
    },
    createReport: async (_: any, { id, name, definition }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, name, definition };
      return services.analytics.create(ctx, input as any);
    },
    createCompany: async (_: any, { id, name, website }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, name, website };
      return services.companies.create(ctx, input as any);
    },
    createListing: async (_: any, { id, title, description, price, currency, status }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, title, description, price, currency, status };
      return services.listings.create(ctx, input as any);
    },
    createVendor: async (_: any, { id, name, website, contactEmail, status }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, name, website, contactEmail, status };
      return services.vendors.create(ctx, input as any);
    },
    createCatalogItem: async (_: any, { id, vendorId, sku, title, description, unitPrice, currency, status }: any, { ctx }: any) => {
      const { services } = getSupabaseAndServices();
      const input = { id, organizationId: ctx.organizationId, vendorId, sku, title, description, unitPrice, currency, status };
      return services.catalogItems.create(ctx, input as any);
    }
  }
};

const schema = createSchema({ typeDefs, resolvers });

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/v1/graphql',
  context: async ({ request }) => {
    const { sb } = getSupabaseAndServices();
    // CI bypass for smoke tests
    const req = request as unknown as NextRequest;
    const ci = getCiBypassContext(req);
    let ctx;
    if (ci) {
      ctx = ci;
    } else {
      const { data } = await sb.auth.getUser();
      const userId = data.user?.id;
      ctx = getTenantContextFromRequest(req, userId);
    }
    return { ctx };
  }
});

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };

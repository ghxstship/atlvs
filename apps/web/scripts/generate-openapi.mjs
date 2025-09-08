import { writeFile } from 'node:fs/promises';
import { OpenAPIRegistry, OpenAPIGenerator } from 'zod-to-openapi';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registry = new OpenAPIRegistry();

const ListingCreate = registry.register('ListingCreate', z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  currency: z.string().length(3),
  status: z.string(),
}));

const Listing = registry.register('Listing', z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  currency: z.string().length(3),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  display: z
    .object({
      priceFormatted: z.string().optional(),
      createdAtFormatted: z.string().nullable().optional(),
      updatedAtFormatted: z.string().nullable().optional(),
    })
    .optional(),
}));

const VendorCreate = registry.register('VendorCreate', z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  status: z.string(),
}));

const Vendor = registry.register('Vendor', z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  website: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}));

const CatalogItemCreate = registry.register('CatalogItemCreate', z.object({
  id: z.string().uuid().optional(),
  vendorId: z.string().uuid(),
  sku: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  unitPrice: z.number(),
  currency: z.string().length(3),
  status: z.string(),
}));

const CatalogItem = registry.register('CatalogItem', z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  vendorId: z.string().uuid(),
  sku: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  unitPrice: z.number(),
  currency: z.string().length(3),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  display: z
    .object({
      unitPriceFormatted: z.string().optional(),
      createdAtFormatted: z.string().nullable().optional(),
      updatedAtFormatted: z.string().nullable().optional(),
    })
    .optional(),
}));

const InvoiceCreate = registry.register('InvoiceCreate', z.object({
  id: z.string().uuid().optional(),
  amount: z.number(),
  currency: z.string().length(3),
  status: z.string(),
  dueDate: z.string().optional(),
  purchaseOrderId: z.string().uuid().optional(),
}));

const Invoice = registry.register('Invoice', z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().length(3),
  status: z.string(),
  purchaseOrderId: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  display: z
    .object({
      amountFormatted: z.string().optional(),
      createdAtFormatted: z.string().nullable().optional(),
      updatedAtFormatted: z.string().nullable().optional(),
      dueDateFormatted: z.string().nullable().optional(),
    })
    .optional(),
}));

const Company = registry.register('Company', z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  website: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  display: z
    .object({
      createdAtFormatted: z.string().nullable().optional(),
      updatedAtFormatted: z.string().nullable().optional(),
    })
    .optional(),
}));

const ErrorResponse = registry.register(
  'ErrorResponse',
  z.object({ error: z.string() })
);

const generator = new OpenAPIGenerator(registry.definitions, '3.0.3');

const doc = {
  openapi: '3.0.3',
  info: {
    title: 'GHXSTSHIP API',
    version: '1.0.0',
    description: 'Enterprise API for GHXSTSHIP / ATLVS / OPENDECK. Versioned v1.'
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/marketplace/listings': {
      get: {
        summary: 'List listings',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: z
                  .object({ items: z.array(Listing) })
                  .openapi({ title: 'ListingsResponse' }),
              },
            },
          },
        },
      },
      post: {
        summary: 'Create listing',
        requestBody: { required: true, content: { 'application/json': { schema: generator.generateSchema(ListingCreate) } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request', content: { 'application/json': { schema: generator.generateSchema(ErrorResponse) } } } },
      },
    },
    '/api/v1/marketplace/vendors': {
      get: {
        summary: 'List vendors',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: z.object({ items: z.array(Vendor) }).openapi({ title: 'VendorsResponse' }) } },
          },
        },
      },
      post: {
        summary: 'Create vendor',
        requestBody: { required: true, content: { 'application/json': { schema: generator.generateSchema(VendorCreate) } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request', content: { 'application/json': { schema: generator.generateSchema(ErrorResponse) } } } },
      },
    },
    '/api/v1/marketplace/catalog-items': {
      get: {
        summary: 'List catalog items',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: z.object({ items: z.array(CatalogItem) }).openapi({ title: 'CatalogItemsResponse' }) } } } },
      },
      post: {
        summary: 'Create catalog item',
        requestBody: { required: true, content: { 'application/json': { schema: generator.generateSchema(CatalogItemCreate) } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request', content: { 'application/json': { schema: generator.generateSchema(ErrorResponse) } } } },
      },
    },
    '/api/v1/finance/invoices': {
      get: {
        summary: 'List invoices',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: z.object({ items: z.array(Invoice) }).openapi({ title: 'InvoicesResponse' }) } } } },
      },
      post: {
        summary: 'Create invoice',
        requestBody: { required: true, content: { 'application/json': { schema: generator.generateSchema(InvoiceCreate) } } },
        responses: { '201': { description: 'Created' }, '4XX': { description: 'Validation error' } },
      },
    },
    '/api/v1/companies': {
      get: {
        summary: 'List companies',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: z.object({ items: z.array(Company) }).openapi({ title: 'CompaniesResponse' }) } } } },
      },
      post: {
        summary: 'Create company',
        requestBody: { required: true, content: { 'application/json': { schema: z.object({ id: z.string().uuid().optional(), name: z.string(), website: z.string().url().optional() }) } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request', content: { 'application/json': { schema: generator.generateSchema(ErrorResponse) } } } },
      },
    },
    '/api/v1/graphql': {
      post: { summary: 'GraphQL endpoint', responses: { '200': { description: 'GraphQL response' } } },
    },
  },
  components: { schemas: generator.definitions },
};

const outPath = path.join(__dirname, '..', 'public', 'api', 'v1', 'openapi.json');
await writeFile(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log('OpenAPI generated at', outPath);

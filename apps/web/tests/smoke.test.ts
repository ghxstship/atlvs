import { describe, it, expect } from 'vitest';

const baseUrl = 'http://localhost:3000';
const CI_BYPASS_TOKEN = process.env.CI_BYPASS_TOKEN || 'dev_bypass_token';
const ORG_ID = process.env.CI_ORG_ID || 'ci-org';

function headers(extra: Record<string, string> = {}) {
  return {
    'x-ci-bypass': CI_BYPASS_TOKEN,
    'x-org-id': ORG_ID,
    ...extra
  } as Record<string, string>;
}

describe('Smoke: REST', () => {
  it('GET /api/v1/health', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('GET /api/v1/marketplace/vendors returns 200 with items', async () => {
    const res = await fetch(`${baseUrl}/api/v1/marketplace/vendors`, { headers: headers() });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(Array.isArray(json.items)).toBe(true);
  });

  it('GET /api/v1/marketplace/catalog-items returns 200 with items', async () => {
    const res = await fetch(`${baseUrl}/api/v1/marketplace/catalog-items`, { headers: headers() });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(Array.isArray(json.items)).toBe(true);
  });
});

describe('Negative: Finance Invoice validations vs Purchase Order', () => {
  const poId = crypto.randomUUID();

  async function gql(query: string, variables?: any) {
    const res = await fetch(`${baseUrl}/api/v1/graphql`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ query, variables })
    });
    return res;
  }

  it('setup: create a purchase order via GraphQL', async () => {
    const res = await gql(
      'mutation($id: ID!, $vendor: String!, $total: Float!, $currency: String!, $status: String!) { createPurchaseOrder(id: $id, vendor: $vendor, total: $total, currency: $currency, status: $status) { id currency total status } }',
      { id: poId, vendor: 'Acme CI', total: 100, currency: 'USD', status: 'draft' }
    );
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.data.createPurchaseOrder.id).toBe(poId);
  });

  it('rejects invoice when currency mismatches PO currency', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/invoices`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: crypto.randomUUID(),
        amount: 50,
        currency: 'EUR',
        status: 'issued',
        purchaseOrderId: poId
      })
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    const text = await res.text();
    expect(text.toLowerCase()).toContain('currency');
  });

  it('rejects invoice when amount exceeds PO total', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/invoices`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: crypto.randomUUID(),
        amount: 1000,
        currency: 'USD',
        status: 'issued',
        purchaseOrderId: poId
      })
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    const text = await res.text();
    expect(text.toLowerCase()).toContain('exceed');
  });
});

describe('Smoke: GraphQL', () => {
  async function gql(query: string, variables?: any) {
    const res = await fetch(`${baseUrl}/api/v1/graphql`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ query, variables })
    });
    return res;
  }

  it('health query returns ok', async () => {
    const res = await gql('{ health { status } }');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.data.health.status).toBe('ok');
  });

  it('vendors query returns array', async () => {
    const res = await gql('{ vendors { id name status } }');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(Array.isArray(json.data.vendors)).toBe(true);
  });

  it('catalogItems query returns array', async () => {
    const res = await gql('{ catalogItems { id title status } }');
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(Array.isArray(json.data.catalogItems)).toBe(true);
  });
});

describe('Negative: Finance Invoice with unknown PO', () => {
  it('rejects invoice linked to non-existent purchase order', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/invoices`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: crypto.randomUUID(),
        amount: 100,
        currency: 'USD',
        status: 'issued',
        purchaseOrderId: '00000000-0000-0000-0000-000000000001'
      })
    });
    // Expect client error
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    const json = await res.json().catch(() => ({}));
    if (json?.error) {
      expect(String(json.error)).toMatch(/purchase order/i);
    }
  });
});

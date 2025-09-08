# Webhooks: Outbound Event Catalog and Partner Receiver

This document describes our outbound webhook events and how partners can receive them.

## Outbound Event Catalog (v1)

- event: `company.created`
  - payload:
    ```json
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "Acme Co",
      "website": "https://acme.example",
      "createdAt": "2025-09-06T10:00:00.000Z"
    }
    ```

- event: `invoice.created`
  - payload:
    ```json
    {
      "id": "uuid",
      "organizationId": "uuid",
      "amount": 1200.5,
      "currency": "USD",
      "status": "issued",
      "purchaseOrderId": "uuid|null",
      "createdAt": "2025-09-06T10:00:00.000Z"
    }
    ```

- event: `marketplace.vendor.created`
  - payload:
    ```json
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "Vendor Name",
      "website": "https://vendor.example",
      "contactEmail": "ops@vendor.example",
      "status": "active",
      "createdAt": "2025-09-06T10:00:00.000Z"
    }
    ```

- event: `marketplace.catalogItem.created`
  - payload:
    ```json
    {
      "id": "uuid",
      "organizationId": "uuid",
      "vendorId": "uuid",
      "title": "Item Title",
      "unitPrice": 99.0,
      "currency": "USD",
      "status": "active",
      "createdAt": "2025-09-06T10:00:00.000Z"
    }
    ```

> Events are delivered with an HMAC signature header `x-webhook-signature` (HMAC-SHA256) computed using the subscription secret.

## Sample Receiver

We provide a sample Next.js route in the repo at `apps/web/app/api/v1/integrations/webhooks/partner/route.ts`.

- Verifies the `x-webhook-signature` against a shared secret.
- Logs the event and returns 200.

## Retry & Delivery

- Exponential backoff retries up to 6 times for 5XX responses.
- Idempotency key provided in header `x-webhook-id` and payload `id` to dedupe.

## Security Recommendations

- Validate signature using the shared secret.
- Enforce HTTPS.
- Treat payload as untrusted; sanitize/validate before use.

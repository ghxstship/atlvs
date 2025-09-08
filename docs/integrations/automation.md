# Automation Guides: Zapier, Make, Pipedream, n8n

This guide shows how to connect GHXSTSHIP webhooks to common automation platforms.

## Prerequisites

- A webhook subscription in GHXSTSHIP with a secret (see Webhooks docs).
- Receiver URL from the automation platform.

## Zapier (Catch Hook)

1. Create a Zap with the "Webhooks by Zapier" trigger → "Catch Hook".
2. Copy the Custom Webhook URL.
3. In GHXSTSHIP, subscribe a webhook pointing to that URL.
4. In Zapier, test trigger to receive a sample payload.
5. Add actions (e.g. Google Sheets row, Slack message).

Signature verification: add a Zap step to compute HMAC-SHA256 with your webhook secret against the raw request body and compare to header `x-webhook-signature`.

## Make (HTTP Webhook)

1. Create a Scenario → add "Webhooks" module → "Custom webhook" → Add.
2. Copy the Webhook URL.
3. Subscribe GHXSTSHIP webhook to that URL.
4. Run once to register sample payload, then add subsequent modules.

## Pipedream

1. Create a new Workflow → Trigger: HTTP / Webhook.
2. Copy the endpoint URL.
3. Subscribe GHXSTSHIP webhook to that URL.
4. Add steps (Node, Slack, Sheets, etc.).

In a code step, verify HMAC using the secret and the raw body; compare to `x-webhook-signature` header.

## n8n

1. Create a workflow → add "Webhook" node → set to POST.
2. Copy the test/production webhook URLs.
3. Subscribe GHXSTSHIP webhook to that URL.
4. Execute workflow and add nodes downstream.

## Events & Retries

- See `docs/integrations/webhooks.md` for event catalog and retry policy.
- Use `x-webhook-id` to deduplicate.

## Tips

- Keep secrets in platform key vaults.
- Validate `organizationId` and `event` type before processing.
- Consider exponential backoff and dead-letter queues for long-running flows.

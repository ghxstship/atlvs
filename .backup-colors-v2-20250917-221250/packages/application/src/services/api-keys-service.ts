import { randomBytes, createHmac } from 'node:crypto';
import type { ApiKey, ApiKeyScope } from '@ghxstship/domain';
import type { ApiKeyRepository } from '@ghxstship/domain';

export class ApiKeysService {
  constructor(private readonly repo: ApiKeyRepository, private readonly signingSecret: string) {}

  // Generates a new API key: returns the plaintext for the caller to store once
  async issue(organizationId: string, name: string, scopes: ApiKeyScope[], mode: 'live' | 'test' = 'test') {
    const prefix = mode === 'live' ? 'sk_live' : 'sk_test';
    const rawSecret = `${prefix}_${randomBytes(24).toString('base64url')}`;
    const hash = this.hash(rawSecret);
    const now = new Date().toISOString();

    const created = await this.repo.create({
      id: crypto.randomUUID(),
      organizationId,
      name,
      hash,
      prefix: prefix as 'sk_live' | 'sk_test',
      scopes,
      createdAt: now,
      updatedAt: now,
      active: true
    });

    return { key: rawSecret, record: created };
  }

  async verifyAndGetOrg(apiKey: string): Promise<{ ok: true; organizationId: string; scopes: ApiKeyScope[] } | { ok: false }> {
    const hash = this.hash(apiKey);
    const found = await this.repo.findByHash(hash);
    if (!found || !found.active) return { ok: false };
    return { ok: true, organizationId: found.organizationId, scopes: found.scopes };
  }

  async listByOrg(organizationId: string) {
    return this.repo.listByOrg(organizationId);
  }

  async deactivate(id: string) {
    await this.repo.deactivate(id);
  }

  private hash(value: string): string {
    return createHmac('sha256', this.signingSecret).update(value).digest('base64url');
  }
}

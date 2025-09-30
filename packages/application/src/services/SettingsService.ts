import { Result } from '@ghxstship/domain';
import {
  // Entities
  OrganizationSetting,
  OrganizationSettingCreate,
  OrganizationSettingUpdate,
  OrganizationSettingFilter,
  UserSetting,
  UserSettingCreate,
  UserSettingUpdate,
  UserSettingFilter,
  NotificationPreference,
  NotificationPreferenceCreate,
  NotificationPreferenceUpdate,
  NotificationPreferenceFilter,
  SecuritySetting,
  SecuritySettingCreate,
  SecuritySettingUpdate,
  ApiKey,
  ApiKeyCreate,
  ApiKeyUpdate,
  ApiKeyFilter,
  ApiKeyWithSecret,
  Integration,
  IntegrationCreate,
  IntegrationUpdate,
  IntegrationFilter,
  Webhook,
  WebhookCreate,
  WebhookUpdate,
  WebhookFilter,
  WebhookDelivery,
  AutomationRule,
  AutomationRuleCreate,
  AutomationRuleUpdate,
  AutomationRuleFilter,
  AutomationRuleExecution,
  CustomRole,
  CustomRoleCreate,
  CustomRoleUpdate,
  CustomRoleFilter,
  PermissionMatrix,
  PermissionCheck,
  PermissionCheckResult,
  UserSession,
  UserSessionCreate,
  UserSessionUpdate,
  UserSessionFilter,
  // Repositories
  OrganizationSettingRepository,
  UserSettingRepository,
  NotificationPreferenceRepository,
  SecuritySettingRepository,
  ApiKeyRepository,
  IntegrationRepository,
  WebhookRepository,
  AutomationRuleRepository,
  CustomRoleRepository,
  UserSessionRepository
} from '@ghxstship/domain/settings';

import { AuditService } from './AuditService';
import { EventPublisher } from '../events/EventPublisher';
import { TenantContext } from '../auth/TenantContext';

export class SettingsService {
  constructor(
    private organizationSettingRepo: OrganizationSettingRepository,
    private userSettingRepo: UserSettingRepository,
    private notificationPreferenceRepo: NotificationPreferenceRepository,
    private securitySettingRepo: SecuritySettingRepository,
    private apiKeyRepo: ApiKeyRepository,
    private integrationRepo: IntegrationRepository,
    private webhookRepo: WebhookRepository,
    private automationRuleRepo: AutomationRuleRepository,
    private customRoleRepo: CustomRoleRepository,
    private userSessionRepo: UserSessionRepository,
    private auditService: AuditService,
    private eventPublisher: EventPublisher,
    private tenantContext: TenantContext
  ) {}

  // =====================================================
  // ORGANIZATION SETTINGS
  // =====================================================

  async getOrganizationSettings(filter?: OrganizationSettingFilter): Promise<Result<OrganizationSetting[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const result = await this.organizationSettingRepo.findAll({ ...filter, organizationId: orgId });
    
    if (result.isSuccess) {
      await this.auditService.log('settings.organization.viewed', {
        organizationId: orgId,
        count: result.getValue().length
      });
    }

    return result;
  }

  async getOrganizationSetting(key: string): Promise<Result<OrganizationSetting>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.organizationSettingRepo.findByKey(orgId, key);
  }

  async updateOrganizationSetting(key: string, value: any): Promise<Result<OrganizationSetting>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('settings:manage');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const existing = await this.organizationSettingRepo.findByKey(orgId, key);
    
    let result: Result<OrganizationSetting>;
    if (existing.isSuccess) {
      result = await this.organizationSettingRepo.update(existing.getValue().id, { value });
    } else {
      result = await this.organizationSettingRepo.create({
        organizationId: orgId,
        key,
        value,
        category: 'general',
        createdBy: await this.tenantContext.getUserId()
      });
    }

    if (result.isSuccess) {
      await this.auditService.log('settings.organization.updated', {
        organizationId: orgId,
        key,
        value
      });

      await this.eventPublisher.publish('organization.settings.updated', {
        organizationId: orgId,
        key,
        value,
        updatedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  async bulkUpdateOrganizationSettings(settings: Array<{ key: string; value: any }>): Promise<Result<OrganizationSetting[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('settings:manage');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.organizationSettingRepo.bulkUpsert(orgId, settings);

    if (result.isSuccess) {
      await this.auditService.log('settings.organization.bulk_updated', {
        organizationId: orgId,
        count: settings.length,
        keys: settings.map(s => s.key)
      });

      await this.eventPublisher.publish('organization.settings.bulk_updated', {
        organizationId: orgId,
        settings,
        updatedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  // =====================================================
  // USER SETTINGS
  // =====================================================

  async getUserSettings(userId?: string, filter?: UserSettingFilter): Promise<Result<UserSetting[]>> {
    const targetUserId = userId || await this.tenantContext.getUserId();
    if (!targetUserId) return Result.fail('User context required');

    // Users can only view their own settings unless they have admin permissions
    if (userId && userId !== await this.tenantContext.getUserId()) {
      const hasPermission = await this.tenantContext.hasPermission('users:manage');
      if (!hasPermission) return Result.fail('Insufficient permissions');
    }

    return this.userSettingRepo.findAll({ ...filter, userId: targetUserId });
  }

  async updateUserSetting(key: string, value: any, userId?: string): Promise<Result<UserSetting>> {
    const targetUserId = userId || await this.tenantContext.getUserId();
    if (!targetUserId) return Result.fail('User context required');

    // Users can only update their own settings unless they have admin permissions
    if (userId && userId !== await this.tenantContext.getUserId()) {
      const hasPermission = await this.tenantContext.hasPermission('users:manage');
      if (!hasPermission) return Result.fail('Insufficient permissions');
    }

    const existing = await this.userSettingRepo.findByKey(targetUserId, key);
    
    let result: Result<UserSetting>;
    if (existing.isSuccess) {
      result = await this.userSettingRepo.update(existing.getValue().id, { value });
    } else {
      result = await this.userSettingRepo.create({
        userId: targetUserId,
        key,
        value,
        category: 'preferences'
      });
    }

    if (result.isSuccess) {
      await this.auditService.log('settings.user.updated', {
        userId: targetUserId,
        key,
        value
      });
    }

    return result;
  }

  // =====================================================
  // NOTIFICATION PREFERENCES
  // =====================================================

  async getNotificationPreferences(userId?: string): Promise<Result<NotificationPreference[]>> {
    const targetUserId = userId || await this.tenantContext.getUserId();
    if (!targetUserId) return Result.fail('User context required');

    const orgId = await this.tenantContext.getOrganizationId();

    return this.notificationPreferenceRepo.getUserPreferences(targetUserId, orgId);
  }

  async updateNotificationPreference(
    channel: NotificationPreference['channel'],
    category: string,
    enabled: boolean,
    frequency?: NotificationPreference['frequency']
  ): Promise<Result<NotificationPreference>> {
    const userId = await this.tenantContext.getUserId();
    if (!userId) return Result.fail('User context required');

    const orgId = await this.tenantContext.getOrganizationId();

    const existing = await this.notificationPreferenceRepo.findByUserAndChannel(
      userId,
      orgId,
      channel,
      category
    );

    let result: Result<NotificationPreference>;
    if (existing.isSuccess) {
      result = await this.notificationPreferenceRepo.update(existing.getValue().id, {
        enabled,
        frequency
      });
    } else {
      result = await this.notificationPreferenceRepo.create({
        userId,
        organizationId: orgId,
        channel,
        category,
        enabled,
        frequency
      });
    }

    if (result.isSuccess) {
      await this.auditService.log('settings.notifications.updated', {
        userId,
        channel,
        category,
        enabled,
        frequency
      });
    }

    return result;
  }

  async bulkUpdateNotificationPreferences(
    preferences: Array<{ channel: string; category: string; enabled: boolean }>
  ): Promise<Result<NotificationPreference[]>> {
    const userId = await this.tenantContext.getUserId();
    if (!userId) return Result.fail('User context required');

    const result = await this.notificationPreferenceRepo.bulkUpdate(userId, preferences);

    if (result.isSuccess) {
      await this.auditService.log('settings.notifications.bulk_updated', {
        userId,
        count: preferences.length
      });
    }

    return result;
  }

  // =====================================================
  // SECURITY SETTINGS
  // =====================================================

  async getSecuritySettings(): Promise<Result<SecuritySetting>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.securitySettingRepo.findByOrganization(orgId);
  }

  async updateSecuritySettings(data: SecuritySettingUpdate): Promise<Result<SecuritySetting>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('security:manage');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const existing = await this.securitySettingRepo.findByOrganization(orgId);
    
    let result: Result<SecuritySetting>;
    if (existing.isSuccess) {
      result = await this.securitySettingRepo.update(existing.getValue().id, data);
    } else {
      result = await this.securitySettingRepo.create({
        organizationId: orgId,
        ...data
      });
    }

    if (result.isSuccess) {
      await this.auditService.log('settings.security.updated', {
        organizationId: orgId,
        changes: data
      });

      await this.eventPublisher.publish('organization.security.updated', {
        organizationId: orgId,
        settings: result.getValue(),
        updatedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  async validatePassword(password: string): Promise<Result<{ valid: boolean; errors: string[] }>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.securitySettingRepo.validatePassword(orgId, password);
  }

  // =====================================================
  // API KEYS
  // =====================================================

  async getApiKeys(filter?: ApiKeyFilter): Promise<Result<ApiKey[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('api_keys:read');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    return this.apiKeyRepo.findAll({ ...filter, organizationId: orgId });
  }

  async createApiKey(data: Omit<ApiKeyCreate, 'organizationId' | 'createdBy'>): Promise<Result<ApiKeyWithSecret>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('api_keys:create');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const userId = await this.tenantContext.getUserId();

    const result = await this.apiKeyRepo.create({
      ...data,
      organizationId: orgId,
      userId,
      createdBy: userId
    });

    if (result.isSuccess) {
      await this.auditService.log('settings.api_key.created', {
        organizationId: orgId,
        apiKeyId: result.getValue().id,
        name: data.name
      });

      await this.eventPublisher.publish('api_key.created', {
        organizationId: orgId,
        apiKeyId: result.getValue().id,
        createdBy: userId
      });
    }

    return result;
  }

  async revokeApiKey(id: string): Promise<Result<void>> {
    const hasPermission = await this.tenantContext.hasPermission('api_keys:delete');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.apiKeyRepo.revoke(id);

    if (result.isSuccess) {
      await this.auditService.log('settings.api_key.revoked', {
        apiKeyId: id,
        revokedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  async rotateApiKey(id: string): Promise<Result<ApiKeyWithSecret>> {
    const hasPermission = await this.tenantContext.hasPermission('api_keys:update');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.apiKeyRepo.rotate(id);

    if (result.isSuccess) {
      await this.auditService.log('settings.api_key.rotated', {
        apiKeyId: id,
        rotatedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  // =====================================================
  // INTEGRATIONS
  // =====================================================

  async getIntegrations(filter?: IntegrationFilter): Promise<Result<Integration[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.integrationRepo.findAll({ ...filter, organizationId: orgId });
  }

  async createIntegration(data: Omit<IntegrationCreate, 'organizationId' | 'createdBy'>): Promise<Result<Integration>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('integrations:create');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const userId = await this.tenantContext.getUserId();

    const result = await this.integrationRepo.create({
      ...data,
      organizationId: orgId,
      createdBy: userId
    });

    if (result.isSuccess) {
      await this.auditService.log('settings.integration.created', {
        organizationId: orgId,
        integrationId: result.getValue().id,
        provider: data.provider
      });

      await this.eventPublisher.publish('integration.created', {
        organizationId: orgId,
        integration: result.getValue(),
        createdBy: userId
      });
    }

    return result;
  }

  async updateIntegration(id: string, data: IntegrationUpdate): Promise<Result<Integration>> {
    const hasPermission = await this.tenantContext.hasPermission('integrations:update');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.integrationRepo.update(id, data);

    if (result.isSuccess) {
      await this.auditService.log('settings.integration.updated', {
        integrationId: id,
        changes: data
      });
    }

    return result;
  }

  async testIntegration(id: string): Promise<Result<{ success: boolean; message?: string }>> {
    const hasPermission = await this.tenantContext.hasPermission('integrations:test');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.integrationRepo.testConnection(id);

    await this.auditService.log('settings.integration.tested', {
      integrationId: id,
      success: result.isSuccess
    });

    return result;
  }

  async syncIntegration(id: string): Promise<Result<{ recordsSynced: number; errors: string[] }>> {
    const hasPermission = await this.tenantContext.hasPermission('integrations:sync');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.integrationRepo.sync(id);

    if (result.isSuccess) {
      await this.integrationRepo.updateLastSync(id, new Date());
      
      await this.auditService.log('settings.integration.synced', {
        integrationId: id,
        recordsSynced: result.getValue().recordsSynced
      });
    }

    return result;
  }

  // =====================================================
  // WEBHOOKS
  // =====================================================

  async getWebhooks(filter?: WebhookFilter): Promise<Result<Webhook[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.webhookRepo.findAll({ ...filter, organizationId: orgId });
  }

  async createWebhook(data: Omit<WebhookCreate, 'organizationId' | 'createdBy'>): Promise<Result<Webhook>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('webhooks:create');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const userId = await this.tenantContext.getUserId();

    const result = await this.webhookRepo.create({
      ...data,
      organizationId: orgId,
      createdBy: userId
    });

    if (result.isSuccess) {
      await this.auditService.log('settings.webhook.created', {
        organizationId: orgId,
        webhookId: result.getValue().id,
        url: data.url
      });
    }

    return result;
  }

  async updateWebhook(id: string, data: WebhookUpdate): Promise<Result<Webhook>> {
    const hasPermission = await this.tenantContext.hasPermission('webhooks:update');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.webhookRepo.update(id, data);

    if (result.isSuccess) {
      await this.auditService.log('settings.webhook.updated', {
        webhookId: id,
        changes: data
      });
    }

    return result;
  }

  async testWebhook(id: string, payload?: any): Promise<Result<{ success: boolean; response?: any; error?: string }>> {
    const hasPermission = await this.tenantContext.hasPermission('webhooks:test');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.webhookRepo.testWebhook(id, payload);

    await this.auditService.log('settings.webhook.tested', {
      webhookId: id,
      success: result.isSuccess
    });

    return result;
  }

  async getWebhookDeliveries(webhookId: string, limit?: number): Promise<Result<WebhookDelivery[]>> {
    const hasPermission = await this.tenantContext.hasPermission('webhooks:read');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    return this.webhookRepo.getDeliveries(webhookId, limit);
  }

  // =====================================================
  // AUTOMATION RULES
  // =====================================================

  async getAutomationRules(filter?: AutomationRuleFilter): Promise<Result<AutomationRule[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.automationRuleRepo.findAll({ ...filter, organizationId: orgId });
  }

  async createAutomationRule(data: Omit<AutomationRuleCreate, 'organizationId' | 'createdBy'>): Promise<Result<AutomationRule>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('automations:create');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const userId = await this.tenantContext.getUserId();

    const result = await this.automationRuleRepo.create({
      ...data,
      organizationId: orgId,
      createdBy: userId
    });

    if (result.isSuccess) {
      await this.auditService.log('settings.automation.created', {
        organizationId: orgId,
        ruleId: result.getValue().id,
        name: data.name
      });

      await this.eventPublisher.publish('automation.created', {
        organizationId: orgId,
        rule: result.getValue(),
        createdBy: userId
      });
    }

    return result;
  }

  async updateAutomationRule(id: string, data: AutomationRuleUpdate): Promise<Result<AutomationRule>> {
    const hasPermission = await this.tenantContext.hasPermission('automations:update');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.automationRuleRepo.update(id, data);

    if (result.isSuccess) {
      await this.auditService.log('settings.automation.updated', {
        ruleId: id,
        changes: data
      });
    }

    return result;
  }

  async testAutomationRule(id: string, testData?: any): Promise<Result<{ success: boolean; result?: any; error?: string }>> {
    const hasPermission = await this.tenantContext.hasPermission('automations:test');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.automationRuleRepo.testRule(id, testData);

    await this.auditService.log('settings.automation.tested', {
      ruleId: id,
      success: result.isSuccess
    });

    return result;
  }

  async getAutomationExecutions(ruleId: string, limit?: number): Promise<Result<AutomationRuleExecution[]>> {
    const hasPermission = await this.tenantContext.hasPermission('automations:read');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    return this.automationRuleRepo.getExecutions(ruleId, limit);
  }

  // =====================================================
  // CUSTOM ROLES & PERMISSIONS
  // =====================================================

  async getCustomRoles(filter?: CustomRoleFilter): Promise<Result<CustomRole[]>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    return this.customRoleRepo.findAll({ ...filter, organizationId: orgId });
  }

  async createCustomRole(data: Omit<CustomRoleCreate, 'organizationId' | 'createdBy'>): Promise<Result<CustomRole>> {
    const orgId = await this.tenantContext.getOrganizationId();
    if (!orgId) return Result.fail('Organization context required');

    const hasPermission = await this.tenantContext.hasPermission('roles:create');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const userId = await this.tenantContext.getUserId();

    const result = await this.customRoleRepo.create({
      ...data,
      organizationId: orgId,
      createdBy: userId
    });

    if (result.isSuccess) {
      await this.auditService.log('settings.role.created', {
        organizationId: orgId,
        roleId: result.getValue().id,
        name: data.name
      });
    }

    return result;
  }

  async updateCustomRole(id: string, data: CustomRoleUpdate): Promise<Result<CustomRole>> {
    const hasPermission = await this.tenantContext.hasPermission('roles:update');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.customRoleRepo.update(id, data);

    if (result.isSuccess) {
      await this.auditService.log('settings.role.updated', {
        roleId: id,
        changes: data
      });
    }

    return result;
  }

  async assignRoleToUser(roleId: string, userId: string): Promise<Result<void>> {
    const hasPermission = await this.tenantContext.hasPermission('roles:assign');
    if (!hasPermission) return Result.fail('Insufficient permissions');

    const result = await this.customRoleRepo.assignToUser(roleId, userId);

    if (result.isSuccess) {
      await this.auditService.log('settings.role.assigned', {
        roleId,
        userId,
        assignedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  async checkPermission(check: PermissionCheck): Promise<Result<PermissionCheckResult>> {
    return this.customRoleRepo.checkPermission(check);
  }

  // =====================================================
  // USER SESSIONS
  // =====================================================

  async getUserSessions(userId?: string): Promise<Result<UserSession[]>> {
    const targetUserId = userId || await this.tenantContext.getUserId();
    if (!targetUserId) return Result.fail('User context required');

    // Users can only view their own sessions unless they have admin permissions
    if (userId && userId !== await this.tenantContext.getUserId()) {
      const hasPermission = await this.tenantContext.hasPermission('users:manage');
      if (!hasPermission) return Result.fail('Insufficient permissions');
    }

    return this.userSessionRepo.getActiveSessions(targetUserId);
  }

  async revokeSession(sessionId: string): Promise<Result<void>> {
    const session = await this.userSessionRepo.findById(sessionId);
    if (!session.isSuccess) return Result.fail('Session not found');

    const currentUserId = await this.tenantContext.getUserId();
    
    // Users can only revoke their own sessions unless they have admin permissions
    if (session.getValue().userId !== currentUserId) {
      const hasPermission = await this.tenantContext.hasPermission('users:manage');
      if (!hasPermission) return Result.fail('Insufficient permissions');
    }

    const result = await this.userSessionRepo.revokeSession(sessionId);

    if (result.isSuccess) {
      await this.auditService.log('settings.session.revoked', {
        sessionId,
        userId: session.getValue().userId,
        revokedBy: currentUserId
      });
    }

    return result;
  }

  async revokeAllSessions(userId?: string, exceptCurrentSession?: boolean): Promise<Result<number>> {
    const targetUserId = userId || await this.tenantContext.getUserId();
    if (!targetUserId) return Result.fail('User context required');

    // Users can only revoke their own sessions unless they have admin permissions
    if (userId && userId !== await this.tenantContext.getUserId()) {
      const hasPermission = await this.tenantContext.hasPermission('users:manage');
      if (!hasPermission) return Result.fail('Insufficient permissions');
    }

    const currentSessionId = exceptCurrentSession ? await this.tenantContext.getSessionId() : undefined;
    const result = await this.userSessionRepo.revokeAllSessions(targetUserId, currentSessionId);

    if (result.isSuccess) {
      await this.auditService.log('settings.sessions.revoked_all', {
        userId: targetUserId,
        count: result.getValue(),
        revokedBy: await this.tenantContext.getUserId()
      });
    }

    return result;
  }

  async cleanupExpiredSessions(): Promise<Result<number>> {
    const result = await this.userSessionRepo.deleteExpired();

    if (result.isSuccess && result.getValue() > 0) {
      await this.auditService.log('settings.sessions.cleanup', {
        count: result.getValue()
      });
    }

    return result;
  }
}

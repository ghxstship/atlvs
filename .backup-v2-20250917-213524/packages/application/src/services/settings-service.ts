import type {
  Setting,
  SettingFilters,
  SettingRepository,
  OrganizationSetting,
  OrganizationSettingRepository,
  SecuritySetting,
  SecuritySettingRepository,
  NotificationSetting,
  NotificationSettingRepository,
  IntegrationSetting,
  IntegrationSettingRepository,
  BillingSetting,
  BillingSettingRepository
} from '@ghxstship/domain';

export class SettingsService {
  constructor(
    private settingRepo: SettingRepository,
    private orgSettingRepo: OrganizationSettingRepository,
    private securitySettingRepo: SecuritySettingRepository,
    private notificationSettingRepo: NotificationSettingRepository,
    private integrationSettingRepo: IntegrationSettingRepository,
    private billingSettingRepo: BillingSettingRepository,
    private auditLogger: any, // TODO: Replace with proper AuditLogger interface
    private eventBus: any // TODO: Replace with proper EventBus interface
  ) {}

  // General Settings CRUD
  async getSettings(orgId: string, filters?: SettingFilters, pagination?: { limit?: number; offset?: number }): Promise<Setting[]> {
    return this.settingRepo.list(orgId, filters, pagination);
  }

  async getSettingById(id: string, orgId: string): Promise<Setting | null> {
    return this.settingRepo.findById(id, orgId);
  }

  async getSettingByName(name: string, orgId: string): Promise<Setting | null> {
    return this.settingRepo.findByName(name, orgId);
  }

  async getSettingsByCategory(orgId: string, category: string): Promise<Setting[]> {
    return this.settingRepo.listByCategory(orgId, category);
  }

  async createSetting(setting: Setting, userId: string): Promise<Setting> {
    const created = await this.settingRepo.create(setting);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: setting.organizationId },
      action: 'create',
      entity: { type: 'setting', id: created.id },
      meta: { name: created.name, category: created.category, value: created.value }
    });

    await this.eventBus.publish({
      type: 'setting.created',
      organizationId: setting.organizationId,
      data: created
    });

    return created;
  }

  async updateSetting(id: string, patch: Partial<Setting>, userId: string, orgId: string): Promise<Setting> {
    const updated = await this.settingRepo.update(id, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'setting', id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'setting.updated',
      organizationId: orgId,
      data: { id, changes: patch }
    });

    return updated;
  }

  async deleteSetting(id: string, orgId: string, userId: string): Promise<void> {
    const setting = await this.settingRepo.findById(id, orgId);
    if (!setting) throw new Error('Setting not found');
    if (setting.isRequired) throw new Error('Cannot delete required setting');

    await this.settingRepo.delete(id, orgId);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'delete',
      entity: { type: 'setting', id },
      meta: { name: setting.name }
    });

    await this.eventBus.publish({
      type: 'setting.deleted',
      organizationId: orgId,
      data: { id, name: setting.name }
    });
  }

  async bulkUpdateSettings(orgId: string, updates: Array<{ id: string; value: string }>, userId: string): Promise<Setting[]> {
    const updated = await this.settingRepo.bulkUpdate(orgId, updates);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'bulk_update',
      entity: { type: 'settings', id: 'bulk' },
      meta: { count: updates.length, updates }
    });

    await this.eventBus.publish({
      type: 'settings.bulk_updated',
      organizationId: orgId,
      data: { updates: updated }
    });

    return updated;
  }

  // Organization Settings
  async getOrganizationSettings(orgId: string): Promise<OrganizationSetting | null> {
    return this.orgSettingRepo.findByOrganizationId(orgId);
  }

  async createOrganizationSettings(orgSettings: OrganizationSetting, userId: string): Promise<OrganizationSetting> {
    const created = await this.orgSettingRepo.create(orgSettings);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgSettings.organizationId },
      action: 'create',
      entity: { type: 'organization_settings', id: created.id },
      meta: { name: created.name, displayName: created.displayName }
    });

    await this.eventBus.publish({
      type: 'organization_settings.created',
      organizationId: orgSettings.organizationId,
      data: created
    });

    return created;
  }

  async updateOrganizationSettings(orgId: string, patch: Partial<OrganizationSetting>, userId: string): Promise<OrganizationSetting> {
    const updated = await this.orgSettingRepo.update(orgId, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'organization_settings', id: updated.id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'organization_settings.updated',
      organizationId: orgId,
      data: { changes: patch }
    });

    return updated;
  }

  // Security Settings
  async getSecuritySettings(orgId: string): Promise<SecuritySetting | null> {
    return this.securitySettingRepo.findByOrganizationId(orgId);
  }

  async createSecuritySettings(securitySettings: SecuritySetting, userId: string): Promise<SecuritySetting> {
    const created = await this.securitySettingRepo.create(securitySettings);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: securitySettings.organizationId },
      action: 'create',
      entity: { type: 'security_settings', id: created.id },
      meta: { twoFactorRequired: created.twoFactorRequired, ssoEnabled: created.ssoEnabled }
    });

    await this.eventBus.publish({
      type: 'security_settings.created',
      organizationId: securitySettings.organizationId,
      data: created
    });

    return created;
  }

  async updateSecuritySettings(orgId: string, patch: Partial<SecuritySetting>, userId: string): Promise<SecuritySetting> {
    const updated = await this.securitySettingRepo.update(orgId, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'security_settings', id: updated.id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'security_settings.updated',
      organizationId: orgId,
      data: { changes: patch }
    });

    return updated;
  }

  // Notification Settings
  async getNotificationSettings(orgId: string): Promise<NotificationSetting[]> {
    return this.notificationSettingRepo.list(orgId);
  }

  async getUserNotificationSettings(userId: string, orgId: string): Promise<NotificationSetting | null> {
    return this.notificationSettingRepo.findByUserId(userId, orgId);
  }

  async getOrganizationNotificationSettings(orgId: string): Promise<NotificationSetting | null> {
    return this.notificationSettingRepo.findByOrganizationId(orgId);
  }

  async createNotificationSettings(notificationSettings: NotificationSetting, userId: string): Promise<NotificationSetting> {
    const created = await this.notificationSettingRepo.create(notificationSettings);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: notificationSettings.organizationId },
      action: 'create',
      entity: { type: 'notification_settings', id: created.id },
      meta: { userId: created.userId, emailEnabled: created.emailEnabled }
    });

    await this.eventBus.publish({
      type: 'notification_settings.created',
      organizationId: notificationSettings.organizationId,
      data: created
    });

    return created;
  }

  async updateNotificationSettings(id: string, patch: Partial<NotificationSetting>, userId: string, orgId: string): Promise<NotificationSetting> {
    const updated = await this.notificationSettingRepo.update(id, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'notification_settings', id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'notification_settings.updated',
      organizationId: orgId,
      data: { id, changes: patch }
    });

    return updated;
  }

  async deleteNotificationSettings(id: string, orgId: string, userId: string): Promise<void> {
    await this.notificationSettingRepo.delete(id, orgId);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'delete',
      entity: { type: 'notification_settings', id },
      meta: {}
    });

    await this.eventBus.publish({
      type: 'notification_settings.deleted',
      organizationId: orgId,
      data: { id }
    });
  }

  // Integration Settings
  async getIntegrationSettings(orgId: string, category?: string): Promise<IntegrationSetting[]> {
    return this.integrationSettingRepo.list(orgId, category);
  }

  async getIntegrationSettingById(id: string, orgId: string): Promise<IntegrationSetting | null> {
    return this.integrationSettingRepo.findById(id, orgId);
  }

  async getIntegrationSettingByProvider(orgId: string, provider: string): Promise<IntegrationSetting | null> {
    return this.integrationSettingRepo.findByProvider(orgId, provider);
  }

  async createIntegrationSettings(integrationSettings: IntegrationSetting, userId: string): Promise<IntegrationSetting> {
    const created = await this.integrationSettingRepo.create(integrationSettings);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: integrationSettings.organizationId },
      action: 'create',
      entity: { type: 'integration_settings', id: created.id },
      meta: { name: created.name, provider: created.provider, category: created.category }
    });

    await this.eventBus.publish({
      type: 'integration_settings.created',
      organizationId: integrationSettings.organizationId,
      data: created
    });

    return created;
  }

  async updateIntegrationSettings(id: string, patch: Partial<IntegrationSetting>, userId: string, orgId: string): Promise<IntegrationSetting> {
    const updated = await this.integrationSettingRepo.update(id, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'integration_settings', id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'integration_settings.updated',
      organizationId: orgId,
      data: { id, changes: patch }
    });

    return updated;
  }

  async deleteIntegrationSettings(id: string, orgId: string, userId: string): Promise<void> {
    const integration = await this.integrationSettingRepo.findById(id, orgId);
    if (!integration) throw new Error('Integration setting not found');

    await this.integrationSettingRepo.delete(id, orgId);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'delete',
      entity: { type: 'integration_settings', id },
      meta: { name: integration.name, provider: integration.provider }
    });

    await this.eventBus.publish({
      type: 'integration_settings.deleted',
      organizationId: orgId,
      data: { id, name: integration.name, provider: integration.provider }
    });
  }

  async updateIntegrationSyncStatus(id: string, status: string, errorMessage?: string, orgId?: string): Promise<void> {
    await this.integrationSettingRepo.updateSyncStatus(id, status, errorMessage);

    if (orgId) {
      await this.eventBus.publish({
        type: 'integration_settings.sync_status_updated',
        organizationId: orgId,
        data: { id, status, errorMessage }
      });
    }
  }

  // Billing Settings
  async getBillingSettings(orgId: string): Promise<BillingSetting | null> {
    return this.billingSettingRepo.findByOrganizationId(orgId);
  }

  async createBillingSettings(billingSettings: BillingSetting, userId: string): Promise<BillingSetting> {
    const created = await this.billingSettingRepo.create(billingSettings);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: billingSettings.organizationId },
      action: 'create',
      entity: { type: 'billing_settings', id: created.id },
      meta: { planId: created.planId, planName: created.planName, billingCycle: created.billingCycle }
    });

    await this.eventBus.publish({
      type: 'billing_settings.created',
      organizationId: billingSettings.organizationId,
      data: created
    });

    return created;
  }

  async updateBillingSettings(orgId: string, patch: Partial<BillingSetting>, userId: string): Promise<BillingSetting> {
    const updated = await this.billingSettingRepo.update(orgId, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'billing_settings', id: updated.id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'billing_settings.updated',
      organizationId: orgId,
      data: { changes: patch }
    });

    return updated;
  }

  // Utility methods
  async initializeDefaultSettings(orgId: string, userId: string): Promise<void> {
    // Create default organization settings
    const defaultOrgSettings: OrganizationSetting = {
      id: '', // Will be generated
      organizationId: orgId,
      name: 'New Organization',
      displayName: 'New Organization',
      timezone: 'UTC',
      locale: 'en-US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStartsOn: 'sunday'
    };

    // Create default security settings
    const defaultSecuritySettings: SecuritySetting = {
      id: '', // Will be generated
      organizationId: orgId,
      twoFactorRequired: false,
      passwordMinLength: 12,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      sessionTimeoutMinutes: 480,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      ssoEnabled: false,
      auditLogRetentionDays: 365,
      dataRetentionDays: 2555,
      encryptionEnabled: true,
      backupEnabled: true,
      backupFrequency: 'daily'
    };

    // Create default notification settings
    const defaultNotificationSettings: NotificationSetting = {
      id: '', // Will be generated
      organizationId: orgId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      slackEnabled: false,
      teamsEnabled: false,
      webhookEnabled: false,
      emailFrequency: 'immediate',
      weekendNotifications: true,
      notificationTypes: {
        projectUpdates: true,
        taskAssignments: true,
        deadlineReminders: true,
        budgetAlerts: true,
        securityAlerts: true,
        systemMaintenance: true,
        invoiceReminders: true,
        paymentConfirmations: true
      }
    };

    try {
      await this.createOrganizationSettings(defaultOrgSettings, userId);
      await this.createSecuritySettings(defaultSecuritySettings, userId);
      await this.createNotificationSettings(defaultNotificationSettings, userId);

      await this.auditLogger.record({
        occurredAt: new Date().toISOString(),
        actor: { userId },
        tenant: { organizationId: orgId },
        action: 'initialize',
        entity: { type: 'settings', id: 'defaults' },
        meta: { message: 'Default settings initialized' }
      });
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw error;
    }
  }
}

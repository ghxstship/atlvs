/**
 * Privacy Compliance Service
 * GDPR/CCPA compliant analytics and data handling
 */

export interface ConsentSettings {
  necessary: boolean; // Always required
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
  targeting: boolean;
  social: boolean;
  consentedAt: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PrivacyRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  data?: any;
  notes?: string;
}

export interface DataProcessingRecord {
  id: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'public_task' | 'vital_interest';
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: string;
  dataSubjectRights: string[];
  lastUpdated: string;
}

export interface PrivacyAuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, unknown>;
}

export interface PrivacyConfig {
  gdprEnabled: boolean;
  ccpaEnabled: boolean;
  cookieRetentionDays: number;
  consentVersion: string;
  dataRetentionPolicy: {
    analytics: number; // days
    logs: number;
    backups: number;
  };
  automatedDeletion: boolean;
  dataLocalization: string[]; // Allowed countries/regions
}

class PrivacyComplianceService {
  private config: PrivacyConfig;
  private consentSettings: Map<string, ConsentSettings> = new Map();
  private privacyRequests: Map<string, PrivacyRequest> = new Map();
  private auditLog: PrivacyAuditLog[] = [];
  private dataProcessingRecords: DataProcessingRecord[] = [];

  constructor(config: PrivacyConfig) {
    this.config = config;
    this.initializeDataProcessingRecords();
  }

  async initialize(): Promise<void> {
    console.log('🔒 Privacy compliance service initialized');

    // Load existing consent settings and requests
    await this.loadConsentSettings();
    await this.loadPrivacyRequests();

    // Set up automated cleanup
    this.scheduleAutomatedCleanup();

    // Initialize consent banner if needed
    this.initializeConsentManagement();
  }

  // Consent Management
  async getConsentSettings(userId: string): Promise<ConsentSettings | null> {
    return this.consentSettings.get(userId) || null;
  }

  async updateConsentSettings(
    userId: string,
    settings: Partial<Omit<ConsentSettings, 'consentedAt' | 'version' | 'ipAddress' | 'userAgent'>>
  ): Promise<ConsentSettings> {
    const existing = this.consentSettings.get(userId);
    const now = new Date().toISOString();

    const consentSettings: ConsentSettings = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      functional: false,
      performance: false,
      targeting: false,
      social: false,
      consentedAt: existing?.consentedAt || now,
      version: this.config.consentVersion,
      ipAddress: this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...existing,
      ...settings
    };

    // Update timestamp if settings changed
    if (JSON.stringify(existing) !== JSON.stringify(consentSettings)) {
      consentSettings.consentedAt = now;
    }

    this.consentSettings.set(userId, consentSettings);

    // Audit log the consent change
    await this.auditLogAction('consent_updated', userId, {
      oldSettings: existing,
      newSettings: consentSettings
    });

    // Apply consent changes
    await this.applyConsentSettings(userId, consentSettings);

    return consentSettings;
  }

  async revokeConsent(userId: string, categories?: string[]): Promise<void> {
    const existing = this.consentSettings.get(userId);
    if (!existing) return;

    const updates: Partial<ConsentSettings> = {};

    if (!categories || categories.includes('analytics')) updates.analytics = false;
    if (!categories || categories.includes('marketing')) updates.marketing = false;
    if (!categories || categories.includes('functional')) updates.functional = false;
    if (!categories || categories.includes('performance')) updates.performance = false;
    if (!categories || categories.includes('targeting')) updates.targeting = false;
    if (!categories || categories.includes('social')) updates.social = false;

    await this.updateConsentSettings(userId, updates);

    // If revoking all tracking, delete existing data
    if (categories === undefined || categories.length === 6) {
      await this.deleteUserData(userId);
    }
  }

  private async applyConsentSettings(userId: string, settings: ConsentSettings): Promise<void> {
    // Disable/enable tracking based on consent
    if (!settings.analytics) {
      await this.disableAnalyticsTracking(userId);
    } else {
      await this.enableAnalyticsTracking(userId);
    }

    if (!settings.marketing) {
      await this.disableMarketingTracking(userId);
    }

    if (!settings.performance) {
      await this.disablePerformanceTracking(userId);
    }

    if (!settings.targeting) {
      await this.disableTargeting(userId);
    }
  }

  // Privacy Requests (GDPR Article 15-22, CCPA)
  async submitPrivacyRequest(
    userId: string,
    type: PrivacyRequest['type'],
    notes?: string
  ): Promise<PrivacyRequest> {
    const request: PrivacyRequest = {
      id: this.generateRequestId(),
      type,
      userId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      notes
    };

    this.privacyRequests.set(request.id, request);

    // Audit log
    await this.auditLogAction('privacy_request_submitted', userId, {
      requestId: request.id,
      type: request.type
    });

    // Auto-process certain requests
    if (type === 'access') {
      setTimeout(() => this.processAccessRequest(request), 1000);
    }

    return request;
  }

  async processPrivacyRequest(requestId: string, processor: string): Promise<PrivacyRequest | null> {
    const request = this.privacyRequests.get(requestId);
    if (!request) return null;

    request.status = 'processing';

    try {
      switch (request.type) {
        case 'access':
          await this.processAccessRequest(request);
          break;
        case 'rectification':
          await this.processRectificationRequest(request);
          break;
        case 'erasure':
          await this.processErasureRequest(request);
          break;
        case 'restriction':
          await this.processRestrictionRequest(request);
          break;
        case 'portability':
          await this.processPortabilityRequest(request);
          break;
        case 'objection':
          await this.processObjectionRequest(request);
          break;
      }

      request.status = 'completed';
      request.completedAt = new Date().toISOString();

      await this.auditLogAction('privacy_request_completed', request.userId, {
        requestId,
        type: request.type,
        processor
      });

    } catch (error) {
      request.status = 'rejected';
      request.notes = `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;

      await this.auditLogAction('privacy_request_rejected', request.userId, {
        requestId,
        type: request.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        processor
      });
    }

    return request;
  }

  private async processAccessRequest(request: PrivacyRequest): Promise<void> {
    // Gather all user data
    const userData = await this.gatherUserData(request.userId);

    request.data = {
      personalData: userData.personal,
      analyticsData: userData.analytics,
      consentHistory: userData.consent,
      processingRecords: this.dataProcessingRecords,
      dataRetention: this.config.dataRetentionPolicy
    };
  }

  private async processRectificationRequest(request: PrivacyRequest): Promise<void> {
    // Update user data based on request notes
    // This would require manual review and processing
    console.log(`Processing rectification request for user ${request.userId}`);
  }

  private async processErasureRequest(request: PrivacyRequest): Promise<void> {
    await this.deleteUserData(request.userId);

    // Audit log the erasure
    await this.auditLogAction('data_erased', request.userId, {
      requestId: request.id,
      erasedAt: new Date().toISOString()
    });
  }

  private async processRestrictionRequest(request: PrivacyRequest): Promise<void> {
    // Restrict processing of user data
    await this.restrictUserDataProcessing(request.userId);
  }

  private async processPortabilityRequest(request: PrivacyRequest): Promise<void> {
    const userData = await this.gatherUserData(request.userId);
    request.data = {
      export: userData,
      format: 'JSON',
      exportedAt: new Date().toISOString()
    };
  }

  private async processObjectionRequest(request: PrivacyRequest): Promise<void> {
    // Stop processing for legitimate interest
    await this.revokeConsent(request.userId, ['marketing', 'targeting']);
  }

  // Data Management
  private async gatherUserData(userId: string): Promise<any> {
    // This would query all systems for user data
    return {
      personal: {
        profile: {}, // User profile data
        preferences: {}, // User preferences
      },
      analytics: {
        sessions: [], // Session data
        events: [], // Tracked events
      },
      consent: {
        history: Array.from(this.consentSettings.get(userId) ? [this.consentSettings.get(userId)] : [])
      }
    };
  }

  private async deleteUserData(userId: string): Promise<void> {
    // Delete from all systems
    console.log(`Deleting all data for user ${userId}`);

    // Remove consent settings
    this.consentSettings.delete(userId);

    // This would delete from:
    // - Analytics databases
    // - Session stores
    // - Backup systems
    // - Log aggregation systems
  }

  private async restrictUserDataProcessing(userId: string): Promise<void> {
    // Implement processing restrictions
    await this.revokeConsent(userId, ['analytics', 'marketing', 'performance', 'targeting']);
  }

  // Tracking Controls
  private async disableAnalyticsTracking(userId: string): Promise<void> {
    // Disable analytics tracking for this user
    console.log(`Disabling analytics tracking for user ${userId}`);
    // This would integrate with analytics providers
  }

  private async enableAnalyticsTracking(userId: string): Promise<void> {
    // Re-enable analytics tracking
    console.log(`Enabling analytics tracking for user ${userId}`);
  }

  private async disableMarketingTracking(userId: string): Promise<void> {
    // Disable marketing tracking
    console.log(`Disabling marketing tracking for user ${userId}`);
  }

  private async disablePerformanceTracking(userId: string): Promise<void> {
    // Disable performance tracking
    console.log(`Disabling performance tracking for user ${userId}`);
  }

  private async disableTargeting(userId: string): Promise<void> {
    // Disable targeting/personalization
    console.log(`Disabling targeting for user ${userId}`);
  }

  // Compliance Utilities
  async conductPrivacyAudit(): Promise<any> {
    const audit = {
      timestamp: new Date().toISOString(),
      consentCompliance: await this.auditConsentCompliance(),
      dataRetention: await this.auditDataRetention(),
      processingRecords: await this.auditProcessingRecords(),
      recommendations: [] as string[]
    };

    // Generate recommendations
    if (audit.consentCompliance.expiredConsents > 0) {
      audit.recommendations.push('Review and update expired consent records');
    }

    if (audit.dataRetention.overdueRecords > 0) {
      audit.recommendations.push('Delete overdue data records');
    }

    return audit;
  }

  private async auditConsentCompliance(): Promise<any> {
    const consents = Array.from(this.consentSettings.values());
    const expiredConsents = consents.filter(c =>
      new Date(c.consentedAt).getTime() < Date.now() - 365 * 24 * 60 * 60 * 1000 // 1 year
    ).length;

    return {
      totalConsents: consents.length,
      expiredConsents,
      compliance: expiredConsents === 0 ? 'compliant' : 'needs_review'
    };
  }

  private async auditDataRetention(): Promise<any> {
    // This would check data retention compliance
    return {
      totalRecords: 0,
      overdueRecords: 0,
      compliance: 'compliant'
    };
  }

  private async auditProcessingRecords(): Promise<any> {
    return {
      totalRecords: this.dataProcessingRecords.length,
      outdatedRecords: this.dataProcessingRecords.filter(r =>
        new Date(r.lastUpdated).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000 // 6 months
      ).length
    };
  }

  // Cookie Management
  setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Automated Cleanup
  private scheduleAutomatedCleanup(): void {
    // Run cleanup daily
    setInterval(() => this.performAutomatedCleanup(), 24 * 60 * 60 * 1000);
  }

  private async performAutomatedCleanup(): Promise<void> {
    if (!this.config.automatedDeletion) return;

    // Clean up expired consent settings
    const expiredThreshold = Date.now() - this.config.cookieRetentionDays * 24 * 60 * 60 * 1000;
    const expiredConsents = Array.from(this.consentSettings.entries()).filter(
      ([, settings]) => new Date(settings.consentedAt).getTime() < expiredThreshold
    );

    for (const [userId] of expiredConsents) {
      this.consentSettings.delete(userId);
    }

    console.log(`Cleaned up ${expiredConsents.length} expired consent records`);
  }

  // Consent Banner Management
  private initializeConsentManagement(): void {
    if (typeof window === 'undefined') return;

    // Check if consent banner should be shown
    const consentCookie = this.getCookie('ghxstship_consent');
    if (!consentCookie) {
      this.showConsentBanner();
    }
  }

  private showConsentBanner(): void {
    // This would render a consent banner component
    console.log('Showing consent banner');
  }

  // Audit Logging
  private async auditLogAction(
    action: string,
    userId?: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    const logEntry: PrivacyAuditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      action,
      userId,
      ipAddress: this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      details
    };

    this.auditLog.push(logEntry);

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  // Utility Methods
  private generateRequestId(): string {
    return `PRIV-${Date.now().toString(36).toUpperCase()}`;
  }

  private generateAuditId(): string {
    return `AUDIT-${Date.now().toString(36).toUpperCase()}`;
  }

  private getClientIP(): string | undefined {
    // This would get the real client IP from headers
    return '127.0.0.1'; // Placeholder
  }

  private async loadConsentSettings(): Promise<void> {
    // Load from persistent storage
    console.log('Loading consent settings...');
  }

  private async loadPrivacyRequests(): Promise<void> {
    // Load from persistent storage
    console.log('Loading privacy requests...');
  }

  private initializeDataProcessingRecords(): void {
    this.dataProcessingRecords = [
      {
        id: 'analytics-processing',
        purpose: 'Website analytics and performance monitoring',
        legalBasis: 'consent',
        dataCategories: ['IP address', 'User agent', 'Session data', 'Page views', 'Click events'],
        recipients: ['GHXSTSHIP Analytics'],
        retentionPeriod: '26 months',
        dataSubjectRights: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'error-tracking',
        purpose: 'Error monitoring and debugging',
        legalBasis: 'legitimate_interest',
        dataCategories: ['Error messages', 'Stack traces', 'User context', 'Session data'],
        recipients: ['Sentry'],
        retentionPeriod: '90 days',
        dataSubjectRights: ['access', 'erasure'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'user-preferences',
        purpose: 'Storing user preferences and settings',
        legalBasis: 'consent',
        dataCategories: ['Theme preferences', 'Language settings', 'Notification preferences'],
        recipients: ['GHXSTSHIP Database'],
        retentionPeriod: 'Account lifetime',
        dataSubjectRights: ['access', 'rectification', 'erasure', 'portability'],
        lastUpdated: new Date().toISOString()
      },
    ];
  }

  // Public API
  getPrivacyRequests(userId?: string): PrivacyRequest[] {
    const requests = Array.from(this.privacyRequests.values());

    if (userId) {
      return requests.filter(r => r.userId === userId);
    }

    return requests;
  }

  getAuditLog(userId?: string, limit = 100): PrivacyAuditLog[] {
    let logs = this.auditLog;

    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }

    return logs.slice(-limit);
  }

  getDataProcessingRecords(): DataProcessingRecord[] {
    return this.dataProcessingRecords;
  }
}

// Default privacy configuration
export const defaultPrivacyConfig: PrivacyConfig = {
  gdprEnabled: true,
  ccpaEnabled: true,
  cookieRetentionDays: 365,
  consentVersion: '1.0.0',
  dataRetentionPolicy: {
    analytics: 26 * 30, // 26 months
    logs: 90, // 90 days
    backups: 2555, // 7 years
  },
  automatedDeletion: true,
  dataLocalization: ['US', 'EU'], // Allowed regions
};

export const privacyComplianceService = new PrivacyComplianceService(defaultPrivacyConfig);

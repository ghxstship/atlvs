/**
 * Feature Flags Module
 *
 * Centralized feature flag management for GHXSTSHIP application.
 * Controls rollout of new features and A/B testing.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 */

export interface FeatureFlagContext {
  userId: string;
  orgId: string;
  role?: string;
  environment?: string;
}

/**
 * Check if a feature is enabled for the given context
 */
export function isFeatureEnabled(
  featureName: string,
  context: FeatureFlagContext
): boolean {
  // For now, enable all features by default
  // In production, this would check against a feature flag service
  // or database table with proper RBAC and rollout strategies

  const enabledFeatures = [
    'unified-analytics',
    'advanced-dashboards',
    'real-time-updates',
    'bulk-operations',
    'advanced-filtering',
    'company-directory',
    'contract-management',
    'qualification-tracking',
    'rating-system',
  ];

  return enabledFeatures.includes(featureName);
}

/**
 * Get feature flag value with fallback
 */
export function getFeatureFlag(
  featureName: string,
  context: FeatureFlagContext,
  defaultValue: boolean = false
): boolean {
  try {
    return isFeatureEnabled(featureName, context);
  } catch (error) {
    console.warn(`Feature flag check failed for ${featureName}:`, error);
    return defaultValue;
  }
}

/**
 * Check if user has access to admin features
 */
export function hasAdminAccess(role?: string): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user has access to manager features
 */
export function hasManagerAccess(role?: string): boolean {
  return hasAdminAccess(role) || role === 'manager';
}

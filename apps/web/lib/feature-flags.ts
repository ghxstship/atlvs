/**
 * Feature Flag System for Gradual Rollout of Unified Architecture
 * 
 * This system allows us to gradually migrate modules from legacy to unified
 * architecture with the ability to rollback if issues are found.
 */

import * as React from 'react';

export type FeatureFlag = 
  | 'unified-finance'
  | 'unified-projects'
  | 'unified-people'
  | 'unified-companies'
  | 'unified-jobs'
  | 'unified-assets'
  | 'unified-procurement'
  | 'unified-programming'
  | 'unified-marketplace'
  | 'unified-settings'
  | 'unified-profile'
  | 'unified-dashboard'
  | 'unified-analytics'
  | 'unified-files';

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number; // 0-100, for gradual rollout
  enabledForUsers?: string[]; // Specific user IDs
  enabledForOrgs?: string[]; // Specific organization IDs
  enabledForRoles?: string[]; // Specific roles
  startDate?: Date; // Enable after this date
  endDate?: Date; // Disable after this date (for temporary features)
}

// Feature flag configuration
// In production, this would come from a database or feature flag service
const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  'unified-finance': {
    enabled: true,
    rolloutPercentage: 100, // Start with 100% for pilot
    enabledForRoles: ['owner', 'admin'], // Initially only for admins
  },
  'unified-projects': {
    enabled: true,
    rolloutPercentage: 50, // 50% rollout
  },
  'unified-people': {
    enabled: true,
    rolloutPercentage: 25, // 25% rollout
  },
  'unified-companies': {
    enabled: false, // Not yet migrated
  },
  'unified-jobs': {
    enabled: false
  },
  'unified-assets': {
    enabled: true,
    rolloutPercentage: 100
  },
  'unified-procurement': {
    enabled: false
  },
  'unified-programming': {
    enabled: false
  },
  'unified-marketplace': {
    enabled: false
  },
  'unified-settings': {
    enabled: false
  },
  'unified-profile': {
    enabled: false
  },
  'unified-dashboard': {
    enabled: false
  },
  'unified-analytics': {
    enabled: false
  },
  'unified-files': {
    enabled: false
  }
};

/**
 * Check if a feature flag is enabled for the current user/context
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  context?: {
    userId?: string;
    orgId?: string;
    role?: string;
  }
): boolean {
  const config = FEATURE_FLAGS[flag];
  
  // Check if feature is globally disabled
  if (!config.enabled) {
    return false;
  }
  
  // Check date constraints
  const now = new Date();
  if (config.startDate && now < config.startDate) {
    return false;
  }
  if (config.endDate && now > config.endDate) {
    return false;
  }
  
  // Check specific user allowlist
  if (config.enabledForUsers?.length && context?.userId) {
    if (config.enabledForUsers.includes(context.userId)) {
      return true;
    }
  }
  
  // Check specific org allowlist
  if (config.enabledForOrgs?.length && context?.orgId) {
    if (config.enabledForOrgs.includes(context.orgId)) {
      return true;
    }
  }
  
  // Check role-based access
  if (config.enabledForRoles?.length && context?.role) {
    if (config.enabledForRoles.includes(context.role)) {
      return true;
    }
  }
  
  // Check rollout percentage (use hash of userId for consistent assignment)
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    if (!context?.userId) {
      // No user context, use random for anonymous users
      return Math.random() * 100 < config.rolloutPercentage;
    }
    
    // Use consistent hash for logged-in users
    const hash = hashString(context.userId + flag);
    const userPercentage = hash % 100;
    return userPercentage < config.rolloutPercentage;
  }
  
  // Feature is enabled without restrictions
  return true;
}

/**
 * Get all enabled features for a context
 */
export function getEnabledFeatures(context?: {
  userId?: string;
  orgId?: string;
  role?: string;
}): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(flag =>
    isFeatureEnabled(flag, context)
  );
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(
  flag: FeatureFlag,
  context?: {
    userId?: string;
    orgId?: string;
    role?: string;
  }
): boolean {
  // In a real implementation, this would be a proper React hook
  // that could re-render when feature flags change
  return isFeatureEnabled(flag, context);
}

/**
 * HOC for feature-flagged components
 * Note: This would need React import to work with JSX
 * For now, returning a simple function that checks the flag
 */
interface FeatureFlagContext {
  userId?: string;
  orgId?: string;
  role?: string;
}

export function withFeatureFlag<P extends object>(
  flag: FeatureFlag,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
): React.ComponentType<P & { featureFlagContext?: FeatureFlagContext }> {
  return function FeatureFlaggedComponent(props: P & { featureFlagContext?: FeatureFlagContext }) {
    const isEnabled = isFeatureEnabled(flag, props.featureFlagContext);
    
    if (isEnabled) {
      return React.createElement(Component, props as P);
    }
    
    if (FallbackComponent) {
      return React.createElement(FallbackComponent, props as P);
    }
    
    return null;
  };
}

/**
 * Simple string hash function for consistent user assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Override feature flags for testing
 * Only works in development environment
 */
export function overrideFeatureFlag(flag: FeatureFlag, config: Partial<FeatureFlagConfig>) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Feature flag overrides only work in development');
    return;
  }
  
  FEATURE_FLAGS[flag] = {
    ...FEATURE_FLAGS[flag],
    ...config
  };
}

/**
 * Get feature flag configuration (for debugging/admin UI)
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig {
  return FEATURE_FLAGS[flag];
}

/**
 * Update feature flag configuration
 * In production, this would update the database/service
 */
export async function updateFeatureFlag(
  flag: FeatureFlag,
  config: Partial<FeatureFlagConfig>
): Promise<void> {
  // In production, make API call to update feature flag service
  FEATURE_FLAGS[flag] = {
    ...FEATURE_FLAGS[flag],
    ...config
  };
  
  // Trigger re-render of components using this flag
  // This would be implemented with a state management solution
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('feature-flag-updated', { detail: flag }));
  }
}
